import crypto from 'node:crypto';
import { calculateFoodMacros, matchFood } from '../entities.js';

export async function executeToolsNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};

  const clientState = JSON.parse(JSON.stringify(state.clientState || {}));
  const currentDate = clientState.currentDate || new Date().toISOString().split('T')[0];
  const now = new Date();
  const timestamp = now.toISOString();
  const timeStr = now.toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' });

  const toolResults = [];
  const changedResources = new Set(state.changedResources || []);
  const undoHistory = clientState._undoHistory || [];

  clientState.today ||= {
    date: currentDate,
    consumedCalories: 0,
    targetCalories: 2200,
    consumedProtein: 0,
    targetProtein: 160,
    consumedCarbs: 0,
    consumedFats: 0,
    consumedWaterLiters: 0,
    targetWaterLiters: 3.0,
    consumedGlasses: 0,
    isWorkoutCompleted: false,
    actionOrder: ['workout', 'nutrition', 'water', 'supplements']
  };

  for (const action of state.plannedActions || []) {
    const { tool, args = {} } = action;

    switch (tool) {
      case 'logMeal': {
        const mealId = crypto.randomUUID();
        const mealType = args.mealType || 'lunch';
        const items = args.items || [];

        const totalCalories = Math.round(items.reduce((s, it) => s + (Number(it.calories) || 0), 0));
        const totalProtein = Math.round(items.reduce((s, it) => s + (Number(it.protein) || 0), 0) * 10) / 10;
        const totalCarbs = Math.round(items.reduce((s, it) => s + (Number(it.carbs) || 0), 0) * 10) / 10;
        const totalFats = Math.round(items.reduce((s, it) => s + (Number(it.fats) || 0), 0) * 10) / 10;

        const mealRecord = {
          id: mealId,
          date: currentDate,
          timestamp,
          time: timeStr,
          mealType,
          titleAr: items.map(it => it.nameAr).join(' + '),
          items,
          calories: totalCalories,
          protein: totalProtein,
          carbs: totalCarbs,
          fats: totalFats,
          isEstimated: items.some(it => it.isEstimated)
        };

        clientState.loggedMeals ||= [];
        const prevMeals = [...clientState.loggedMeals];
        clientState.loggedMeals.push(mealRecord);

        // Recalculate today totals
        const dayMeals = clientState.loggedMeals.filter(m => (m.date || currentDate) === currentDate);
        clientState.today.consumedCalories = Math.round(dayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0));
        clientState.today.consumedProtein = Math.round(dayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0) * 10) / 10;
        clientState.today.consumedCarbs = Math.round(dayMeals.reduce((s, m) => s + (Number(m.carbs) || 0), 0) * 10) / 10;
        clientState.today.consumedFats = Math.round(dayMeals.reduce((s, m) => s + (Number(m.fats) || 0), 0) * 10) / 10;

        changedResources.add('meals');
        changedResources.add('nutrition');
        changedResources.add('today');

        undoHistory.push({
          tool,
          revert: { loggedMeals: prevMeals, today: { ...clientState.today } }
        });

        toolResults.push({
          tool,
          success: true,
          recordId: mealId,
          record: mealRecord,
          summaryText: `سجلت الوجبة: ${mealRecord.titleAr} (${totalCalories} سعرة، ${totalProtein} غ بروتين)`
        });
        break;
      }

      case 'updateMeal': {
        clientState.loggedMeals ||= [];
        const foodTarget = (args.foodName || '').toLowerCase().trim();
        const newGrams = Number(args.newGrams);

        // Find today's meal containing this food
        let found = false;
        const dayMeals = clientState.loggedMeals.filter(m => (m.date || currentDate) === currentDate);
        for (const meal of dayMeals) {
          const itemIndex = meal.items.findIndex(it => (it.nameAr || it.foodName || '').toLowerCase().includes(foodTarget));
          if (itemIndex !== -1) {
            const item = meal.items[itemIndex];
            const food = matchFood(item.foodId || item.nameAr, item.state);
            const macros = food ? calculateFoodMacros(food, newGrams) : {
              calories: Math.round(1.5 * newGrams),
              protein: Math.round(0.15 * newGrams * 10) / 10,
              carbs: Math.round(0.15 * newGrams * 10) / 10,
              fats: Math.round(0.04 * newGrams * 10) / 10
            };

            item.grams = newGrams;
            item.calories = macros.calories;
            item.protein = macros.protein;
            item.carbs = macros.carbs;
            item.fats = macros.fats;

            meal.calories = Math.round(meal.items.reduce((s, it) => s + (Number(it.calories) || 0), 0));
            meal.protein = Math.round(meal.items.reduce((s, it) => s + (Number(it.protein) || 0), 0) * 10) / 10;
            meal.carbs = Math.round(meal.items.reduce((s, it) => s + (Number(it.carbs) || 0), 0) * 10) / 10;
            meal.fats = Math.round(meal.items.reduce((s, it) => s + (Number(it.fats) || 0), 0) * 10) / 10;

            found = true;
            break;
          }
        }

        if (found) {
          clientState.today.consumedCalories = Math.round(dayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0));
          clientState.today.consumedProtein = Math.round(dayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0) * 10) / 10;
          clientState.today.consumedCarbs = Math.round(dayMeals.reduce((s, m) => s + (Number(m.carbs) || 0), 0) * 10) / 10;
          clientState.today.consumedFats = Math.round(dayMeals.reduce((s, m) => s + (Number(m.fats) || 0), 0) * 10) / 10;

          changedResources.add('meals');
          changedResources.add('nutrition');
          changedResources.add('today');

          toolResults.push({
            tool,
            success: true,
            summaryText: `تم تعديل كمية ${args.foodName} إلى ${newGrams} غرام وتحديث الإجمالي.`
          });
        } else {
          toolResults.push({
            tool,
            success: false,
            summaryText: `لم يتم العثور على ${args.foodName} في وجبات اليوم لتعديله.`
          });
        }
        break;
      }

      case 'deleteMeal': {
        clientState.loggedMeals ||= [];
        const initialCount = clientState.loggedMeals.length;
        if (args.mealId) {
          clientState.loggedMeals = clientState.loggedMeals.filter(m => m.id !== args.mealId);
        } else if (args.mealType) {
          clientState.loggedMeals = clientState.loggedMeals.filter(m => !(m.date === currentDate && m.mealType === args.mealType));
        }

        const dayMeals = clientState.loggedMeals.filter(m => (m.date || currentDate) === currentDate);
        clientState.today.consumedCalories = Math.round(dayMeals.reduce((s, m) => s + (Number(m.calories) || 0), 0));
        clientState.today.consumedProtein = Math.round(dayMeals.reduce((s, m) => s + (Number(m.protein) || 0), 0) * 10) / 10;
        clientState.today.consumedCarbs = Math.round(dayMeals.reduce((s, m) => s + (Number(m.carbs) || 0), 0) * 10) / 10;
        clientState.today.consumedFats = Math.round(dayMeals.reduce((s, m) => s + (Number(m.fats) || 0), 0) * 10) / 10;

        changedResources.add('meals');
        changedResources.add('nutrition');
        changedResources.add('today');

        toolResults.push({
          tool,
          success: clientState.loggedMeals.length < initialCount,
          summaryText: 'تم حذف الوجبة بنجاح وتحديث الإجماليات.'
        });
        break;
      }

      case 'logWater': {
        const ml = Number(args.milliliters);
        const recordId = crypto.randomUUID();
        const prevLiters = clientState.today.consumedWaterLiters || 0;
        const newLiters = Math.round((prevLiters + ml / 1000) * 100) / 100;
        const newGlasses = (clientState.today.consumedGlasses || 0) + Math.round(ml / 250);

        clientState.today.consumedWaterLiters = newLiters;
        clientState.today.consumedGlasses = newGlasses;

        clientState.waterLogs ||= [];
        const record = { id: recordId, date: currentDate, timestamp, amountMl: ml };
        clientState.waterLogs.push(record);

        changedResources.add('water');
        changedResources.add('today');

        toolResults.push({
          tool,
          success: true,
          recordId,
          amountMl: ml,
          todayTotalMl: Math.round(newLiters * 1000),
          targetWaterMl: Math.round((clientState.today.targetWaterLiters || 3.0) * 1000),
          summaryText: `أضفت ${ml} مل ماء. إجمالي اليوم ${Math.round(newLiters * 1000)} مل.`
        });
        break;
      }

      case 'updateWater': {
        const ml = Number(args.milliliters);
        const newLiters = Math.round((ml / 1000) * 100) / 100;
        clientState.today.consumedWaterLiters = newLiters;
        clientState.today.consumedGlasses = Math.round(ml / 250);

        changedResources.add('water');
        changedResources.add('today');

        toolResults.push({
          tool,
          success: true,
          amountMl: ml,
          todayTotalMl: ml,
          targetWaterMl: Math.round((clientState.today.targetWaterLiters || 3.0) * 1000),
          summaryText: `تم تعديل إجمالي الماء اليوم إلى ${ml} مل.`
        });
        break;
      }

      case 'logWeight': {
        const weight = Number(args.weightKg);
        const recordId = crypto.randomUUID();
        const prevWeight = clientState.userProfile?.currentWeight || weight;
        const changeKg = Math.round((weight - prevWeight) * 10) / 10;

        clientState.userProfile ||= {};
        clientState.userProfile.currentWeight = weight;
        clientState.userProfile.weight = weight;

        clientState.weightLogs ||= [];
        clientState.weightLogs = clientState.weightLogs.filter(w => w.date !== currentDate);
        const record = { id: recordId, date: currentDate, timestamp, weight };
        clientState.weightLogs.push(record);

        clientState.weightHistory ||= [];
        clientState.weightHistory = clientState.weightHistory.filter(w => w.date !== currentDate);
        clientState.weightHistory.push({ id: recordId, date: currentDate, weightKg: weight, weight });

        changedResources.add('weight');
        changedResources.add('profile');

        toolResults.push({
          tool,
          success: true,
          recordId,
          weightKg: weight,
          date: currentDate,
          changeKg,
          summaryText: `سجلت وزن اليوم ${weight} كغ.`
        });
        break;
      }

      case 'updateWeight': {
        const weight = Number(args.weightKg);
        clientState.userProfile ||= {};
        clientState.userProfile.currentWeight = weight;
        clientState.userProfile.weight = weight;

        clientState.weightLogs ||= [];
        clientState.weightLogs = clientState.weightLogs.filter(w => w.date !== currentDate);
        clientState.weightLogs.push({ id: crypto.randomUUID(), date: currentDate, timestamp, weight });

        clientState.weightHistory ||= [];
        clientState.weightHistory = clientState.weightHistory.filter(w => w.date !== currentDate);
        clientState.weightHistory.push({ id: crypto.randomUUID(), date: currentDate, weightKg: weight, weight });

        changedResources.add('weight');
        changedResources.add('profile');

        toolResults.push({
          tool,
          success: true,
          weightKg: weight,
          date: currentDate,
          summaryText: `تم تعديل وزن اليوم إلى ${weight} كغ.`
        });
        break;
      }

      case 'logWorkoutSets': {
        const recordId = crypto.randomUUID();
        const { exercise, exerciseId = 'exercise', weightKg, sets = 1, reps = 10 } = args;

        clientState.exerciseSetLogs ||= [];
        const record = { id: recordId, date: currentDate, timestamp, exerciseId, nameAr: exercise, weight: weightKg, sets, reps };
        clientState.exerciseSetLogs.push(record);

        clientState.workoutHistory ||= [];
        clientState.workoutHistory.push({
          id: recordId,
          date: currentDate,
          exercise,
          weightKg,
          sets,
          reps,
          timestamp
        });

        changedResources.add('workout');
        changedResources.add('today');

        toolResults.push({
          tool,
          success: true,
          recordId,
          exercise,
          weightKg,
          sets,
          reps,
          summaryText: `سجلت تمرين ${exercise}: ${weightKg} كغ × ${sets} جولات × ${reps} عدات.`
        });
        break;
      }

      case 'completeWorkout': {
        const title = args.title || 'تمرين اليوم';
        const recordId = crypto.randomUUID();

        clientState.today.isWorkoutCompleted = true;
        clientState.today.workoutStatus = 'completed';
        clientState.today.todayWorkoutTitleAr = title;

        clientState.workoutHistory ||= [];
        const record = {
          id: recordId,
          title,
          date: currentDate,
          timestamp,
          dateLabel: now.toLocaleDateString('ar-JO')
        };
        clientState.workoutHistory.unshift(record);

        changedResources.add('workout');
        changedResources.add('today');

        toolResults.push({
          tool,
          success: true,
          recordId,
          title,
          summaryText: `سجلت إكمال تمرين ${title} بنجاح ✓`
        });
        break;
      }

      case 'markSupplementTaken': {
        const suppName = (args.supplement || '').trim();
        clientState.supplementsSchedule ||= [];
        let item = clientState.supplementsSchedule.find(s => (s.nameAr || '').includes(suppName) || suppName.includes(s.nameAr || ''));

        if (!item) {
          item = { id: crypto.randomUUID(), nameAr: suppName, taken: true };
          clientState.supplementsSchedule.push(item);
        } else {
          item.taken = true;
          if (item.schedule) {
            for (const slot of Object.values(item.schedule)) slot.taken = true;
          }
        }

        changedResources.add('supplements');
        changedResources.add('today');

        toolResults.push({
          tool,
          success: true,
          supplement: suppName,
          summaryText: `سجلت تناول ${suppName} اليوم ✓`
        });
        break;
      }

      case 'addShoppingItems': {
        const names = args.names || [];
        clientState.shoppingItems ||= [];
        for (const name of names) {
          clientState.shoppingItems.push({
            id: crypto.randomUUID(),
            name,
            checked: false,
            category: 'مخصص'
          });
        }
        changedResources.add('shopping');

        toolResults.push({
          tool,
          success: true,
          names,
          summaryText: `أضفت ${names.join('، ')} إلى قائمة المشتريات.`
        });
        break;
      }

      case 'removeShoppingItem': {
        const rawName = (args.name || '').trim();
        clientState.shoppingItems ||= [];
        const initLen = clientState.shoppingItems.length;
        clientState.shoppingItems = clientState.shoppingItems.filter(it => !it.name.includes(rawName) && !rawName.includes(it.name));

        changedResources.add('shopping');

        toolResults.push({
          tool,
          success: clientState.shoppingItems.length < initLen,
          name: rawName,
          summaryText: `حذفت ${rawName} من قائمة المشتريات.`
        });
        break;
      }

      case 'prioritize_today': {
        const kind = args.priority || args.kind || 'workout';
        const ALL_KINDS = ['workout', 'nutrition', 'water', 'supplements'];
        const newOrder = [kind, ...ALL_KINDS.filter(k => k !== kind)];

        clientState.today.actionOrder = newOrder;
        clientState.today.priorityFocus = kind;
        changedResources.add('today');

        const labelsAr = { workout: 'التمرين', nutrition: 'التغذية', water: 'الماء', supplements: 'المكملات' };
        toolResults.push({
          tool,
          success: true,
          priority: kind,
          summaryText: `تم تقديم ${labelsAr[kind] || kind} كأولوية أولى لليوم `
        });
        break;
      }

      case 'undoLastAction': {
        if (undoHistory.length === 0) {
          toolResults.push({
            tool,
            success: false,
            summaryText: 'لا يوجد إجراء سابق للتراجع عنه.'
          });
        } else {
          const last = undoHistory.pop();
          if (last.revert.loggedMeals) clientState.loggedMeals = last.revert.loggedMeals;
          if (last.revert.today) clientState.today = last.revert.today;
          changedResources.add('meals');
          changedResources.add('nutrition');
          changedResources.add('today');
          toolResults.push({
            tool,
            success: true,
            summaryText: 'تم التراجع عن آخر إجراء واستعادة الحالة السابقة.'
          });
        }
        break;
      }

      case 'stopVoiceSession': {
        toolResults.push({
          tool,
          success: true,
          summaryText: 'أوقفت الاستماع.'
        });
        break;
      }

      case 'getTodayNutrition': {
        const targetP = clientState.today.targetProtein || 160;
        const consumedP = clientState.today.consumedProtein || 0;
        const remainingP = Math.max(0, Math.round((targetP - consumedP) * 10) / 10);
        toolResults.push({
          tool,
          success: true,
          isQuery: true,
          targetProtein: targetP,
          consumedProtein: consumedP,
          remainingProtein: remainingP,
          summaryText: `باقيلك ${remainingP} غ بروتين اليوم. (المسجل ${consumedP} غ من هدف ${targetP} غ)`
        });
        break;
      }

      case 'queryFoodNutrition': {
        const food = matchFood(args.foodName);
        const grams = Number(args.grams) || 100;
        if (food) {
          const m = calculateFoodMacros(food, grams);
          toolResults.push({
            tool,
            success: true,
            isQuery: true,
            food: food.nameAr,
            grams,
            calories: m.calories,
            protein: m.protein,
            carbs: m.carbs,
            fats: m.fats,
            summaryText: `${grams} غ من ${food.nameAr} يحتوي على حوالي ${m.calories} سعرة، ${m.protein} غ بروتين، ${m.carbs} غ كربوهيدرات، و${m.fats} غ دهون.`
          });
        } else {
          const estCals = Math.round(1.5 * grams);
          const estP = Math.round(0.15 * grams * 10) / 10;
          toolResults.push({
            tool,
            success: true,
            isQuery: true,
            food: args.foodName,
            grams,
            calories: estCals,
            protein: estP,
            summaryText: `${grams} غ من ${args.foodName} يحتوي تقريباً على ${estCals} سعرة و${estP} غ بروتين (قيمة تقديرية).`
          });
        }
        break;
      }

      case 'getTodaySummary': {
        const t = clientState.today;
        const summaryText = `تمرين اليوم: ${t.isWorkoutCompleted ? 'مكتمل ✓' : 'بانتظارك'}. السعرات: ${t.consumedCalories || 0} من ${t.targetCalories || 2200}. الماء: ${t.consumedWaterLiters || 0} من ${t.targetWaterLiters || 3.0} لتر. البروتين: ${t.consumedProtein || 0} من ${t.targetProtein || 160} غ.`;
        toolResults.push({
          tool,
          success: true,
          isQuery: true,
          summaryText
        });
        break;
      }
    }
  }

  clientState._undoHistory = undoHistory;

  return {
    clientState,
    toolResults,
    changedResources: Array.from(changedResources)
  };
}
