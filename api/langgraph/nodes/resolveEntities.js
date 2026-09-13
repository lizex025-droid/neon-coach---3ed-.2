import { matchFood, calculateFoodMacros, matchExercise } from '../entities.js';

export async function resolveEntitiesNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};
  if (!Array.isArray(state.plannedActions) || state.plannedActions.length === 0) return {};

  const resolvedActions = [];

  for (const action of state.plannedActions) {
    if (action.tool === 'logMeal') {
      const items = (action.args?.items || []).map(item => {
        const food = matchFood(item.foodId || item.foodName, item.state);
        const grams = Number(item.grams) || 100;

        if (food) {
          const macros = calculateFoodMacros(food, grams);
          return {
            foodId: food.id,
            nameAr: food.nameAr,
            nameEn: food.nameEn || '',
            grams,
            state: food.state || item.state || 'cooked',
            calories: macros.calories,
            protein: macros.protein,
            carbs: macros.carbs,
            fats: macros.fats,
            fiber: macros.fiber,
            isEstimated: false
          };
        } else {
          // Custom / non-catalog food item
          return {
            foodId: item.foodId || 'custom-' + (item.foodName || 'item').replace(/\s+/g, '-'),
            nameAr: item.foodName || 'وجبة مخصصة',
            grams,
            state: item.state || 'cooked',
            calories: Math.round(1.5 * grams),
            protein: Math.round(0.15 * grams * 10) / 10,
            carbs: Math.round(0.15 * grams * 10) / 10,
            fats: Math.round(0.04 * grams * 10) / 10,
            fiber: 0,
            isEstimated: true
          };
        }
      });

      resolvedActions.push({
        tool: 'logMeal',
        args: {
          ...action.args,
          items
        }
      });
    } else if (action.tool === 'updateMeal') {
      resolvedActions.push(action);
    } else if (action.tool === 'logWorkoutSets') {
      const exercise = matchExercise(action.args.exercise);
      resolvedActions.push({
        tool: 'logWorkoutSets',
        args: {
          ...action.args,
          exercise: exercise.nameAr || action.args.exercise,
          exerciseId: exercise.id
        }
      });
    } else {
      resolvedActions.push(action);
    }
  }

  return {
    plannedActions: resolvedActions
  };
}
