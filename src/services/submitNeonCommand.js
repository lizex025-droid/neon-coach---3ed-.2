import { supabase } from './supabaseClient.js';
import { store } from '../state/store.js';
import { mergeDailyHistory } from '../domain/dailyCycle.js';
const inflight = new Map();
export function commandTrace(request, stage) {
  if (import.meta.env?.DEV && import.meta.env?.VITE_NEON_TRACE === '1') console.info({ requestId: request.requestId, inputSource: request.inputSource, stage });
}
export async function currentThread() {
  const { data } = await supabase.auth.getSession(); const session = data.session;
  if (!session) throw new Error('يرجى تسجيل الدخول قبل إرسال الطلب.');
  const key = `neon_ai_thread:${session.user.id}`;
  let id = localStorage.getItem(key);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(key, id); }
  return { id, session };
}
export function applyPersistedState(response) {
  if (!response.updatedState || response.status === 'error') return;
  const current = store.getState(); const next = response.updatedState;
  const update = {};
  for (const key of ['loggedMeals', 'weightHistory', 'workoutHistory', 'shoppingList']) if (Array.isArray(next[key])) update[key] = next[key];
  if (Array.isArray(next.dailyHistory)) update.dailyHistory = mergeDailyHistory(current.dailyHistory, next.dailyHistory);
  if (Array.isArray(next.shoppingList)) update.shoppingItems = next.shoppingList.map(i => ({ ...i, nameAr: i.name }));
  if (next.today) update.today = { ...current.today, ...next.today };
  if (next.userProfile) update.userProfile = { ...current.userProfile, ...next.userProfile };
  store.setState(update, { notify: !response.restore });
  window.dispatchEvent(new CustomEvent('neon:state-updated', { detail: { changedResources: response.changedResources || [] } }));
  commandTrace(response, 'resourcesUpdated');
}
export function submitNeonCommand(request) {
  const command = { inputSource: 'text', requestId: crypto.randomUUID(), ...request };
  if (inflight.has(command.requestId)) return inflight.get(command.requestId);
  const promise = (async () => {
    commandTrace(command, 'dispatcherCalled');
    const { id, session } = await currentThread();
    command.threadId ||= id;
    // Retain the exact operation ID for a user-initiated retry after a lost response.
    const pendingKey = `neon_ai_retry:${session.user.id}`;
    if (!command.restore) sessionStorage.setItem(pendingKey, JSON.stringify(command));
    let response;
    try {
      response = await fetch('/api/action-agent', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` }, body: JSON.stringify(command), signal: AbortSignal.timeout(55000) });
    } catch { throw new Error('تعذر الوصول إلى الخادم. لم يتم تأكيد الحفظ. استخدم إعادة المحاولة لنفس الطلب.'); }
    let result; try { result = await response.json(); } catch { throw new Error('استجابة الخادم غير صالحة. لم يتم تأكيد الحفظ.'); }
    if (!['success', 'clarification', 'partial', 'error', 'pending_sync'].includes(result.status)) throw new Error('لم يؤكد الخادم نتيجة العملية.');
    if (result.status === 'success' && result.actions?.length && (!result.results?.length || result.results.some(r => r.changedResources?.length && r.persisted !== true))) throw new Error('لم يؤكد الخادم حفظ العملية.');
    if (result.status === 'success' || result.status === 'clarification') sessionStorage.removeItem(pendingKey);
    applyPersistedState(result); return result;
  })().finally(() => inflight.delete(command.requestId));
  inflight.set(command.requestId, promise); return promise;
}
export async function retryNeonCommand() {
  const { session } = await currentThread(); const raw = sessionStorage.getItem(`neon_ai_retry:${session.user.id}`);
  if (!raw) throw new Error('لا يوجد طلب لإعادة المحاولة.');
  return submitNeonCommand(JSON.parse(raw));
}
export const restoreNeonConversation = () => submitNeonCommand({ restore: true });
