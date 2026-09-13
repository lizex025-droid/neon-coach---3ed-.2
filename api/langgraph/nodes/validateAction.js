export async function validateActionNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};
  if (!Array.isArray(state.plannedActions) || state.plannedActions.length === 0) return {};

  const errors = [];
  const validatedActions = [];

  for (const action of state.plannedActions) {
    const { tool, args = {} } = action;

    try {
      switch (tool) {
        case 'logMeal': {
          if (!Array.isArray(args.items) || args.items.length === 0) {
            throw new Error('أصناف الوجبة غير محددة.');
          }
          for (const item of args.items) {
            const grams = Number(item.grams);
            if (isNaN(grams) || grams <= 0 || grams > 3000) {
              throw new Error(`وزن الصنف ${item.nameAr || ''} غير صالح (بين 1 و 3000 غرام).`);
            }
          }
          validatedActions.push(action);
          break;
        }

        case 'updateMeal': {
          const grams = Number(args.newGrams);
          if (isNaN(grams) || grams <= 0 || grams > 3000) {
            throw new Error('الكمية الجديدة غير صالحة.');
          }
          validatedActions.push(action);
          break;
        }

        case 'deleteMeal': {
          validatedActions.push(action);
          break;
        }

        case 'logWater':
        case 'updateWater': {
          const ml = Number(args.milliliters);
          if (isNaN(ml) || ml <= 0 || ml > 8000) {
            throw new Error('كمية الماء غير صالحة (يجب أن تكون بين 1 و 8000 مل).');
          }
          validatedActions.push(action);
          break;
        }

        case 'logWeight':
        case 'updateWeight': {
          const w = Number(args.weightKg);
          if (isNaN(w) || w < 20 || w > 500) {
            throw new Error('وزن الجسم غير صالح (بين 20 و 500 كغ).');
          }
          validatedActions.push(action);
          break;
        }

        case 'logWorkoutSets': {
          const weight = Number(args.weightKg);
          const sets = Number(args.sets);
          const reps = Number(args.reps);
          if (isNaN(weight) || weight < 0 || weight > 600) {
            throw new Error('وزن التمرين غير صالح.');
          }
          if (isNaN(sets) || sets < 1 || sets > 30) {
            throw new Error('عدد الجولات غير صالح.');
          }
          if (isNaN(reps) || reps < 1 || reps > 200) {
            throw new Error('عدد التكرارات غير صالح.');
          }
          validatedActions.push(action);
          break;
        }

        case 'completeWorkout': {
          if (!args.title || typeof args.title !== 'string') {
            args.title = 'تمرين اليوم';
          }
          validatedActions.push(action);
          break;
        }

        case 'markSupplementTaken': {
          if (!args.supplement || typeof args.supplement !== 'string') {
            throw new Error('اسم المكمل غير محدد.');
          }
          validatedActions.push(action);
          break;
        }

        case 'addShoppingItems': {
          if (!Array.isArray(args.names) || args.names.length === 0) {
            throw new Error('عناصر المشتريات غير محددة.');
          }
          validatedActions.push(action);
          break;
        }

        case 'removeShoppingItem': {
          if (!args.name || typeof args.name !== 'string') {
            throw new Error('اسم العنصر المراد حذفه غير محدد.');
          }
          validatedActions.push(action);
          break;
        }

        case 'prioritize_today':
        case 'undoLastAction':
        case 'stopVoiceSession':
        case 'getTodayNutrition':
        case 'queryFoodNutrition':
        case 'getTodaySummary': {
          validatedActions.push(action);
          break;
        }

        default: {
          throw new Error(`أداة غير مدعومة: ${tool}`);
        }
      }
    } catch (err) {
      errors.push(err.message);
    }
  }

  return {
    plannedActions: validatedActions,
    errors: errors.length > 0 ? errors : []
  };
}
