import { FOOD_ITEMS } from '../../src/data/foods.js';
import { normalizeFoodSearchText, scalePer100 } from '../../src/domain/nutritionCalculations.js';
import { AgentError } from './contracts.js';

// Only this server code assigns IDs and nutrients. The model supplies descriptions.
export function searchFoods(query, basis) {
  const words = normalizeFoodSearchText(query).split(' ').filter(Boolean);
  const scored = FOOD_ITEMS.filter(f => !basis || f.state === basis).map(f => {
    const text = normalizeFoodSearchText(`${f.nameAr} ${f.nameEn}`);
    return { food: f, score: words.filter(w => text.includes(w)).length / words.length };
  }).filter(f => f.score > 0.49).sort((a, b) => b.score - a.score);
  return scored.slice(0, 8).map(({ food }) => food);
}
export function resolveFood(item) {
  if (!item.grams || !item.basis) throw new AgentError('FOOD_DETAILS', 'كم غراماً؟ وهل الوزن نيء أم مطبوخ؟', 'resolveEntities');
  const exact = FOOD_ITEMS.filter(f => f.state === item.basis && [f.nameAr, f.nameEn].some(n => normalizeFoodSearchText(n) === normalizeFoodSearchText(item.foodName)));
  const candidates = exact.length ? exact : searchFoods(item.foodName, item.basis);
  if (!candidates.length) throw new AgentError('FOOD_UNAVAILABLE', 'لم أجد هذا الطعام بهذه طريقة التحضير في قاعدة الأطعمة. حدد صنفاً آخر.', 'resolveEntities');
  // Equivalent duplicate entries are harmless; materially different matches need a choice.
  const first = candidates[0];
  if (!exact.length && candidates.slice(1).some(f => Math.abs(f.caloriesPer100g - first.caloriesPer100g) > 15 || Math.abs(f.proteinPer100g - first.proteinPer100g) > 5))
    throw new AgentError('FOOD_AMBIGUOUS', `حدد الطعام بدقة: ${candidates.slice(0, 4).map(f => f.nameEn || f.nameAr).join(' / ')}`, 'resolveEntities');
  return calculateItem(first, item.grams);
}
export function calculateItem(food, grams) {
  const m = scalePer100({ kcal: food.caloriesPer100g, p: food.proteinPer100g, c: food.carbsPer100g, f: food.fatsPer100g, fiber: food.fiberPer100g }, grams);
  // Existing FOOD_ITEMS uses total carbohydrates; honor an explicit net basis if introduced.
  const net = food.carbohydrateBasis === 'net' ? m.c : Math.max(0, m.c - m.fiber);
  return { foodId: food.id, nameAr: food.nameAr, nameEn: food.nameEn, grams, state: food.state,
    calories: m.kcal, protein: m.p, carbs: m.c, fats: m.f, fiber: m.fiber, netCarbs: +net.toFixed(1),
    carbohydrateBasis: food.carbohydrateBasis || 'total', source: 'NEON FOOD_ITEMS', estimated: false };
}
export function recalculateItem(item, grams) {
  const food = FOOD_ITEMS.find(f => f.id === item.foodId && f.state === item.state);
  if (!food) throw new AgentError('FOOD_UNAVAILABLE', 'مرجع الطعام غير متاح. اختر الطعام مجدداً.');
  return calculateItem(food, grams);
}
export function mealTotals(items) {
  return Object.fromEntries(['calories', 'protein', 'carbs', 'fats', 'fiber', 'netCarbs'].map(k => [k, +items.reduce((sum, i) => sum + Number(i[k] || 0), 0).toFixed(1)]));
}
