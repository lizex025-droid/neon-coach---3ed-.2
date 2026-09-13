import { mealTotals } from './foodResolver.js';
export function composeResult(state) {
  const base = { requestId: state.requestId, threadId: state.threadId, status: 'success', intent: state.plan?.intent || 'question', reply: '', actions: [], results: [], cards: [], changedResources: [], clarification: null, error: null };
  if (state.pendingResponse) return { ...base, status: 'clarification', intent: 'clarification', reply: state.pending.question, clarification: state.pending,
    cards: [{ type: state.pending.kind === 'meal' ? 'meal_draft' : 'clarification', ...state.pending }] };
  const results = state.results || [];
  const cards = results.map(r => {
    const d = r.data;
    if (r.tool === 'addMeal' || r.tool === 'updateMeal') return { type: 'meal', recordId: d.id, mealType: d.meal_type, items: d.items, ...mealTotals(d.items) };
    if (r.tool === 'logWater' || r.tool === 'updateWater') return { type: 'water', recordId: d.id, amountMl: state.actions.find(a => a.actionId === r.actionId)?.args.amountMl, todayTotalMl: d.consumed_ml, targetWaterMl: state.context.today.targetWaterLiters * 1000, remainingMl: Math.max(0, state.context.today.targetWaterLiters * 1000 - d.consumed_ml), date: d.date };
    if (r.tool === 'logWeight' || r.tool === 'updateWeight') {
      const previous = state.context.weightHistory.filter(w => w.id !== d.id && String(w.date).slice(0, 10) <= String(d.date).slice(0, 10)).sort((a, b) => String(b.date).localeCompare(String(a.date)) || String(b.timestamp).localeCompare(String(a.timestamp)))[0];
      return { type: 'weight', recordId: d.id, weightKg: Number(d.weight), date: d.date, timestamp: d.created_at, changeKg: previous ? +(Number(d.weight) - previous.weightKg).toFixed(2) : null };
    }
    if (['logWorkoutSet', 'logWorkout', 'completeWorkout'].includes(r.tool)) return { type: 'workout', recordId: d.id, title: d.workout_title, exercises: d.exercises, completed: d.completed };
    if (['getDailySummary', 'getDailyNutritionSummary', 'getWaterSummary'].includes(r.tool)) return { type: 'daily_summary', ...d };
    if (r.tool === 'getFoodNutrition') return { type: 'food_nutrition', ...d };
    return { type: 'record', tool: r.tool, data: d };
  });
  const replies = results.map(r => {
    if (r.tool === 'logWater' || r.tool === 'updateWater') return `تم حفظ الماء. إجمالي ${r.data.date}: ${r.data.consumed_ml} مل.`;
    if (r.tool === 'logWeight' || r.tool === 'updateWeight') return `تم حفظ الوزن: ${r.data.weight} كغ.`;
    if (r.tool === 'addMeal' || r.tool === 'updateMeal') return `تم حفظ الوجبة: ${r.data.calories} سعرة، ${r.data.protein} غ بروتين.`;
    if (r.tool === 'getDailyNutritionSummary' || r.tool === 'getDailySummary') return `المتبقي: ${r.data.remainingProtein} غ بروتين و${r.data.remainingCalories} سعرة. الماء: ${r.data.waterMl} مل.`;
    return r.persisted ? 'تم تأكيد التغيير في سجلات حسابك.' : 'هذه النتيجة من بيانات التطبيق الحالية.';
  });
  return { ...base, actions: state.actions || [], results, cards, reply: replies.join('\n') || state.plan?.reply || 'لم يتم إجراء أي تغيير.',
    changedResources: [...new Set(results.flatMap(r => r.changedResources))], updatedState: state.snapshot };
}
