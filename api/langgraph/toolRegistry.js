import { z } from 'zod';
import { AgentError } from './contracts.js';
import { searchFoods, resolveFood, recalculateItem, mealTotals } from './foodResolver.js';
const date = z.iso.date().optional();
const recordId = z.uuid();
const text = z.string().trim().min(1).max(200);
const grams = z.number().positive().max(5000);
const item = z.object({ foodName: text, grams: grams.optional(), basis: z.enum(['raw', 'cooked']).optional() }).strict();
const input = shape => z.object(shape).strict();
export const resultSchema = z.object({ actionId: z.string(), tool: z.string(), status: z.literal('success'), recordId: z.string().nullable(), data: z.any(), changedResources: z.array(z.string()), persisted: z.boolean() }).strict();
const tools = {};
function register(name, description, schema, writes, resources, handler) {
  tools[name] = { name, description, schema, resultSchema, writes, permissions: ['authenticated', 'owner'], resources,
    idempotency: writes ? 'atomic request and action ledger' : 'read only', errors: ['VALIDATION', 'NOT_FOUND', 'PERSISTENCE_FAILED'], handler };
}
register('searchFoods', 'Search the app food database without logging food.', input({ query: text, basis: z.enum(['raw', 'cooked']).optional() }), false, [], async (_r, a) => searchFoods(a.query, a.basis));
register('getFoodNutrition', 'Calculate nutrition from a food description and grams, without logging.', input({ items: z.array(item).min(1).max(20) }), false, [], async (_r, a) => ({ items: a.items.map(resolveFood), ...mealTotals(a.items.map(resolveFood)) }));
register('addMeal', 'Prepare a meal for confirmation; save only after the user confirms the draft. Never invent nutrition or IDs.', input({ mealType: z.enum(['breakfast', 'lunch', 'dinner', 'snack', 'other']).optional(), date, items: z.array(item).min(1).max(20) }), true, ['nutrition', 'daily-summary'], async (r, a) => {
  const items = a.items.map(resolveFood); const totals = mealTotals(items);
  return r.insert('meal_logs', { date: a.date || r.today, name: items.map(i => i.nameAr).join(' + '), meal_type: a.mealType === 'other' || !a.mealType ? 'meal' : a.mealType, items, calories: Math.round(totals.calories), protein: totals.protein, carbs: totals.carbs, fats: totals.fats });
});
register('updateMeal', 'Edit only one item in an owned meal, preserving every other item. Ask if the record or item is ambiguous.', input({ recordId, itemIndex: z.number().int().min(0).max(19), grams }), true, ['nutrition', 'daily-summary'], async (r, a) => {
  const meal = await r.get('meal_logs', a.recordId); const items = [...meal.items];
  if (!items[a.itemIndex]) throw new AgentError('NOT_FOUND', 'لم أجد صنف الطعام المحدد.');
  items[a.itemIndex] = recalculateItem(items[a.itemIndex], a.grams); const t = mealTotals(items);
  return r.update('meal_logs', a.recordId, { items, calories: Math.round(t.calories), protein: t.protein, carbs: t.carbs, fats: t.fats });
});
register('deleteMeal', 'Delete a specific owned meal. Never guess a record for an ambiguous deletion.', input({ recordId }), true, ['nutrition', 'daily-summary'], (r, a) => r.remove('meal_logs', a.recordId));
register('getDailyNutritionSummary', 'Read current persisted nutrition totals and remaining protein/calories.', input({ date }), false, [], (r, a) => r.summary(a.date));
for (const name of ['logWater', 'updateWater']) register(name, name === 'logWater' ? 'Add consumed water in milliliters. Half a liter is 500 ml. Ask about unknown bottle/cup size.' : 'Set the total consumed water for a date in milliliters.', input({ amountMl: z.number().int().min(name === 'logWater' ? 1 : 0).max(15000), date }), true, ['water', 'daily-summary'], (r, a) => r.water(a, name === 'logWater'));
register('getWaterSummary', 'Read current water total, goal and remaining.', input({ date }), false, [], (r, a) => r.summary(a.date));
register('logWeight', 'Record body weight in kg. A statement of current weight is a logging request; instructions and quoted examples are not.', input({ weightKg: z.number().min(20).max(400), date }), true, ['weight', 'profile'], (r, a) => r.insert('inbody_records', { weight: a.weightKg, date: a.date || r.today }));
register('updateWeight', 'Correct a specific owned body weight record.', input({ recordId, weightKg: z.number().min(20).max(400) }), true, ['weight', 'profile'], (r, a) => r.update('inbody_records', a.recordId, { weight: a.weightKg }));
register('getWeightProgress', 'Read persisted body weight measurements.', input({}), false, [], r => r.list('inbody_records'));
const exercise = input({ name: text, sets: z.number().int().min(1).max(30), reps: z.number().int().min(1).max(200), weightKg: z.number().min(0).max(1000) });
register('logWorkoutSet', 'Record exercise sets with repetitions and load.', input({ exercise, date }), true, ['workout', 'daily-summary'], (r, a) => r.insert('workout_logs', { workout_title: a.exercise.name, date: a.date || r.today, completed: false, exercises: [a.exercise] }));
register('logWorkout', 'Record a workout and its exercises.', input({ title: text, exercises: z.array(exercise).min(1).max(30), date }), true, ['workout', 'daily-summary'], (r, a) => r.insert('workout_logs', { workout_title: a.title, exercises: a.exercises, date: a.date || r.today, completed: false }));
register('completeWorkout', 'Mark a specific owned workout completed.', input({ recordId }), true, ['workout', 'daily-summary'], (r, a) => r.update('workout_logs', a.recordId, { completed: true }));
register('getWorkoutSummary', 'Read actual workout sessions.', input({ date }), false, [], (r, a) => r.list('workout_logs', a.date));
register('addShoppingItem', 'Add one item to the shopping list.', input({ name: text }), true, ['shopping'], (r, a) => r.insert('shopping_items', { item_name: a.name }));
register('deleteShoppingItem', 'Delete a specific owned shopping item.', input({ recordId }), true, ['shopping'], (r, a) => r.remove('shopping_items', a.recordId));
register('getDailySummary', 'Read nutrition, water and workouts from current database records.', input({ date }), false, [], (r, a) => r.summary(a.date));
register('undoLastAction', 'Undo the most recent write request only when its records have not since been edited.', input({}), true, ['nutrition', 'water', 'weight', 'workout', 'shopping', 'daily-summary'], r => r.undo());
export const unsupportedTools = ['logBodyMeasurement', 'logSleep', 'logSteps', 'logSupplement', 'reportIssue'];
// Explicit compatibility names; there is only one active backend executor.
export const aliases = { logMeal: 'addMeal', queryFoodNutrition: 'getFoodNutrition', getTodayNutrition: 'getDailyNutritionSummary', getTodaySummary: 'getDailySummary', logWorkoutSets: 'logWorkoutSet', removeShoppingItem: 'deleteShoppingItem' };
export const toolRegistry = Object.freeze(tools);
export function validateAction(action) {
  const name = aliases[action.tool] || action.tool; const def = tools[name];
  if (!def) throw new AgentError('UNSUPPORTED_TOOL', `هذه الوظيفة غير مدعومة: ${String(name).slice(0, 60)}`);
  const parsed = def.schema.safeParse(action.args);
  if (!parsed.success) throw new AgentError('INVALID_TOOL_INPUT', 'بيانات الوظيفة غير مكتملة أو غير صالحة. حدد التفاصيل المطلوبة.');
  return { tool: name, args: parsed.data };
}
export function modelTools() { return Object.values(tools).map(t => ({ name: t.name, description: t.description, parametersJsonSchema: z.toJSONSchema(t.schema) })); }
