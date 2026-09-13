import { Annotation, StateGraph, START, END } from '@langchain/langgraph';
import { createHash, randomUUID } from 'node:crypto';
import { commandSchema, AgentError, limits, normalizeInput, publicError, trace } from './contracts.js';
import { toolRegistry, validateAction, resultSchema } from './toolRegistry.js';
import { resolveFood, mealTotals } from './foodResolver.js';
import { planSchema, understandWithGemini } from './provider.js';
import { composeResult } from './response.js';

const fields = ['requestId', 'threadId', 'authenticatedUserId', 'inputSource', 'originalText', 'normalizedText', 'context', 'messages', 'summary', 'pending', 'plan', 'actions', 'results', 'snapshot', 'response', 'pendingResponse', 'hash', 'confirmation', 'clarificationId', 'restore', 'replay'];
export const RuntimeState = Annotation.Root(Object.fromEntries(fields.map(k => [k, Annotation({ reducer: (_a, b) => b })])));

// Dependencies and credentials stay outside checkpoint state.
export function buildExecutionGraph({ repo, authenticate, model = understandWithGemini, checkpointer, compose = composeResult, signal }) {
  const guard = fn => async state => { signal?.throwIfAborted(); return fn(state); };
  const graph = new StateGraph(RuntimeState)
    .addNode('authenticate', guard(async s => {
      const id = await authenticate(); if (id !== repo.userId) throw new AgentError('AUTH_REQUIRED', 'يرجى تسجيل الدخول.', 'authenticate', 401);
      return { authenticatedUserId: id };
    }))
    .addNode('normalizeInput', guard(s => ({ normalizedText: normalizeInput(s.originalText) })))
    .addNode('loadContext', guard(async s => repo.transaction(async () => {
      const thread = await repo.thread(s.threadId); const context = await repo.loadContext();
      const previous = await repo.request(s.requestId);
      if (previous && (previous.input_hash !== s.hash || previous.thread_id !== s.threadId)) throw new AgentError('IDEMPOTENCY_CONFLICT', 'معرّف الطلب مستخدم لطلب مختلف.', 'loadContext', 409);
      if (previous?.response) return { response: { ...previous.response, updatedState: context }, replay: true, context };
      if (previous?.execution) return { ...previous.execution, context, snapshot: context, replay: true };
      const pending = thread.pending && Date.now() - thread.pending.createdAt < 86400000 ? thread.pending : null;
      return { context, messages: thread.messages, summary: thread.summary, pending };
    })))
    .addNode('understandRequest', guard(async s => {
      if (s.restore) return { response: { requestId: s.requestId, threadId: s.threadId, restore: true, status: 'success', intent: 'question', reply: '', actions: [], results: [], cards: s.pending ? [{ type: s.pending.kind === 'meal' ? 'meal_draft' : 'clarification', ...s.pending }] : [], changedResources: [], clarification: s.pending, error: null, messages: s.messages, updatedState: s.context } };
      if (s.confirmation) {
        if (!s.pending || s.pending.kind !== 'meal' || s.pending.id !== s.confirmation.pendingId) throw new AgentError('STALE_CONFIRMATION', 'انتهت صلاحية هذه البطاقة. افتح الطلب الحالي.', 'validateActions', 409);
        if (!s.confirmation.accept) return { pending: null, plan: { intent: 'cancel', reply: 'تم إلغاء المسودة دون حفظ وجبة.' }, actions: [] };
        return { plan: { intent: 'write' }, actions: s.pending.actions.map(a => a.tool === 'addMeal' ? { ...a, args: { ...a.args, mealType: s.confirmation.mealType || a.args.mealType || 'other' } } : a), pending: null };
      }
      const plan = planSchema.parse(await model(s, { signal })); trace(s, 'intentDetected');
      if (s.clarificationId && s.clarificationId !== s.pending?.id) throw new AgentError('STALE_CLARIFICATION', 'هذا الرد مرتبط بطلب قديم.', 'understandRequest', 409);
      if (plan.pendingDisposition === 'complete' && (!s.pending || plan.pendingId !== s.pending.id)) throw new AgentError('STALE_CLARIFICATION', 'حدد الطلب الذي تقصده.', 'understandRequest');
      if (plan.intent === 'cancel') return { plan, pending: null, actions: [] };
      if (['question', 'translation', 'clarification'].includes(plan.intent) && plan.actions.length) throw new AgentError('UNSAFE_PLAN', 'الطلب غير واضح؛ لم يتم تنفيذ أي إجراء.');
      if (['write', 'read'].includes(plan.intent) && !plan.actions.length) throw new AgentError('EMPTY_ACTIONS', 'لم يتم اختيار وظيفة لتنفيذ الطلب.');
      if (plan.intent === 'clarification') return { plan, actions: [], pendingResponse: true, pending: { id: randomUUID(), kind: 'details', originalText: plan.pendingDisposition === 'complete' ? s.pending.originalText : s.originalText, question: plan.question || 'حدد التفاصيل المطلوبة.', createdAt: Date.now(), options: [] } };
      return { plan, actions: plan.actions, pending: ['replace', 'complete', 'cancel'].includes(plan.pendingDisposition) ? null : s.pending };
    }))
    .addNode('resolveEntities', guard(async s => {
      const actions = s.actions.map(validateAction); trace(s, 'toolSelected');
      try {
        for (const a of actions) if (a.tool === 'addMeal' || a.tool === 'getFoodNutrition') a.args.items.forEach(resolveFood);
      } catch (err) {
        if (!(err instanceof AgentError)) throw err;
        return { actions: [], pendingResponse: true, pending: { id: randomUUID(), kind: 'details', originalText: s.originalText, actions, question: err.message, options: [], createdAt: Date.now() } };
      }
      // Confirmation always uses the immutable, server-persisted complete action batch.
      if (actions.some(a => a.tool === 'addMeal') && !s.confirmation) {
        const meals = actions.filter(a => a.tool === 'addMeal').map(a => { const items = a.args.items.map(resolveFood); return { mealType: a.args.mealType, items, ...mealTotals(items) }; });
        trace(s, 'confirmationRequired');
        return { actions: [], pendingResponse: true, pending: { id: randomUUID(), kind: 'meal', originalText: s.originalText, actions, meals, question: 'هل تريد إضافة هذه الوجبة؟', createdAt: Date.now() } };
      }
      return { actions };
    }))
    .addNode('validateActions', guard(async s => {
      if (s.actions.length > limits.actions) throw new AgentError('TOO_MANY_ACTIONS', 'قسّم طلبك إلى طلبات أصغر.');
      const actions = s.actions.map((a, i) => ({ ...validateAction(a), actionId: `${s.requestId}:${i}` }));
      if (s.plan.intent !== 'write' && actions.some(a => toolRegistry[a.tool].writes)) throw new AgentError('UNSAFE_WRITE', 'السؤال لا يسمح بتعديل السجلات.');
      await repo.transaction(async () => {
        for (const a of actions) {
          const tables = { updateMeal: 'meal_logs', deleteMeal: 'meal_logs', updateWeight: 'inbody_records', completeWorkout: 'workout_logs', deleteShoppingItem: 'shopping_items' };
          if (tables[a.tool]) await repo.get(tables[a.tool], a.args.recordId);
        }
      });
      trace(s, 'validationPassed'); return { actions };
    }))
    .addNode('executeTools', guard(async s => {
      const execution = await repo.transaction(async () => {
        const results = [];
        for (const a of s.actions) {
          signal?.throwIfAborted(); const def = toolRegistry[a.tool];
          const data = await def.handler(repo, a.args);
          results.push(resultSchema.parse({ actionId: a.actionId, tool: a.tool, status: 'success', recordId: data?.id || null, data, changedResources: def.resources, persisted: def.writes }));
          trace(s, 'toolExecuted');
        }
        const execution = { actions: s.actions, results, plan: s.plan, pending: s.pending, messages: s.messages, summary: s.summary, originalText: s.originalText };
        signal?.throwIfAborted();
        await repo.saveRequest(s, s.hash, null, execution);
        // A crash after COMMIT cannot leave an already-executed meal draft confirmable again.
        await repo.saveThread(s.threadId, s.messages, s.pending, s.summary);
        return execution;
      });
      trace(s, 'persistenceConfirmed'); return execution;
    }))
    .addNode('readResults', async s => ({ snapshot: await repo.transaction(() => repo.snapshot()) }))
    .addNode('composeResponse', async s => {
      if (s.response) return {};
      try { return { response: await compose(s) }; } catch { return { response: composeResult(s) }; }
    })
    .addNode('persistConversation', async s => {
      if (s.restore || (s.replay && s.response && !s.results.length)) return {};
      const all = [...(s.messages || []), { role: 'user', content: s.originalText }, { role: 'assistant', content: s.response.reply }];
      // Bounded extractive summary, separate from actual records and pending actions.
      const summary = all.length > 20 ? `${s.summary || ''}\n${all.slice(0, -20).map(m => `${m.role}: ${m.content}`).join('\n')}`.slice(-3000) : s.summary || '';
      await repo.transaction(async () => { await repo.saveThread(s.threadId, all.slice(-20), s.pending, summary); await repo.saveRequest(s, s.hash, s.response); });
      return {};
    })
    .addEdge(START, 'authenticate').addEdge('authenticate', 'normalizeInput').addEdge('normalizeInput', 'loadContext')
    .addConditionalEdges('loadContext', s => s.response ? END : s.replay ? 'readResults' : 'understandRequest')
    .addConditionalEdges('understandRequest', s => s.actions.length ? 'resolveEntities' : 'composeResponse')
    .addConditionalEdges('resolveEntities', s => s.pendingResponse ? 'composeResponse' : 'validateActions')
    .addEdge('validateActions', 'executeTools').addEdge('executeTools', 'readResults').addEdge('readResults', 'composeResponse')
    .addEdge('composeResponse', 'persistConversation').addEdge('persistConversation', END);
  return graph.compile({ checkpointer });
}

export async function runCommand(command, deps) {
  const req = commandSchema.parse(command);
  const hash = createHash('sha256').update(JSON.stringify({ text: req.text, confirmation: req.confirmation, clarificationId: req.clarificationId })).digest('hex');
  const graph = buildExecutionGraph(deps);
  const state = { ...req, originalText: req.text, hash, actions: [], results: [], messages: [], summary: '', pending: null, pendingResponse: false, response: null, replay: false, plan: null, context: null, snapshot: null };
  try {
    const result = await graph.invoke(state, { configurable: { thread_id: `${deps.repo.userId}:${req.threadId}:${req.requestId}` }, recursionLimit: limits.iterations });
    return result.response;
  } catch (err) {
    // Recover a committed result even if readback, graph checkpointing or conversation persistence failed.
    try {
      const committed = await deps.repo.transaction(() => deps.repo.request(req.requestId));
      if (committed?.input_hash === hash && committed.thread_id === req.threadId && committed.execution) {
        const context = await deps.repo.transaction(() => deps.repo.loadContext());
        return { ...composeResult({ ...state, ...committed.execution, context, snapshot: context }), warning: 'تعذر إكمال حفظ المحادثة؛ العملية محفوظة. إعادة الطلب بنفس المعرّف آمنة.' };
      }
    } catch { /* Return a retryable error, never imply an unverified save. */ }
    const error = publicError(err);
    return { requestId: req.requestId, threadId: req.threadId, status: 'error', intent: 'unknown', reply: error.message, actions: [], results: [], cards: [], changedResources: [], clarification: null, error };
  }
}
