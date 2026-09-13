import {
  normalizeText,
  matchFood,
  matchExercise,
  parseWaterAmount,
  parseWeight,
  FOOD_ALIASES,
  EXERCISE_ALIASES
} from '../entities.js';

export async function understandRequestNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};

  const norm = state.normalizedText || '';
  const original = state.originalText || '';
  const pending = state.pendingClarification;

  // Helper ensuring pendingClarification is explicitly reset to null
  // unless a node explicitly sets a pending clarification
  const done = (payload) => {
    if (!('pendingClarification' in payload)) {
      payload.pendingClarification = null;
    }
    return payload;
  };

  // ----------------------------------------------------
  // 1. Handle Active Pending Clarification
  // ----------------------------------------------------
  if (pending) {
    // Check if user is cancelling the pending request
    if (/(?:الغاء|إلغاء|كنسل|بطلت|تراجع|لا خلاص|خلص)/i.test(norm)) {
      return done({
        intent: 'control',
        pendingClarification: null,
        finalResponse: {
          requestId: state.requestId,
          threadId: state.threadId,
          status: 'success',
          reply: 'تم إلغاء الطلب السابق.',
          actions: [],
          results: [],
          cards: []
        }
      });
    }

    // Pending: Meal logging (e.g. user had asked to log chicken, was asked for grams)
    if (pending.action === 'logMeal') {
      const gMatch = norm.match(/(\d+(?:\.\d+)?)/);
      if (gMatch) {
        const grams = parseFloat(gMatch[1]);
        let itemState = pending.state || 'cooked';
        if (/(?:نيء|ني|قبل الطبخ|غير مطبوخ|raw)/i.test(norm)) itemState = 'raw';
        if (/(?:مطبوخ|مشوي|مسلوق|بعد الطبخ|cooked)/i.test(norm)) itemState = 'cooked';

        const food = matchFood(pending.foodName, itemState) || matchFood(pending.foodId, itemState);
        return done({
          intent: 'action',
          pendingClarification: null,
          plannedActions: [{
            tool: 'logMeal',
            args: {
              mealType: pending.mealType || 'lunch',
              items: [{
                foodId: food?.id || pending.foodId || 'custom-food',
                foodName: food?.nameAr || pending.foodName,
                grams,
                state: itemState
              }]
            }
          }]
        });
      }
    }

    // Pending: Workout sets/reps
    if (pending.action === 'workout_sets_reps') {
      const setsMatch = norm.match(/(\d+)\s*(?:جولات|مجموعات|sets?)/i);
      const repsMatch = norm.match(/(\d+)\s*(?:عدات|تكرار|reps?)/i);
      if (setsMatch || repsMatch) {
        const sets = setsMatch ? parseInt(setsMatch[1], 10) : 3;
        const reps = repsMatch ? parseInt(repsMatch[1], 10) : 8;
        return done({
          intent: 'action',
          pendingClarification: null,
          plannedActions: [{
            tool: 'logWorkoutSets',
            args: {
              exercise: pending.exercise,
              weightKg: pending.weightKg,
              sets,
              reps
            }
          }]
        });
      }
    }

    // Pending: Delete meal clarification
    if (pending.action === 'deleteMeal') {
      let targetType = null;
      if (/فطور|breakfast/.test(norm)) targetType = 'breakfast';
      else if (/غدا|غداء|lunch/.test(norm)) targetType = 'lunch';
      else if (/عشا|عشاء|dinner/.test(norm)) targetType = 'dinner';
      else if (/سناك|snack/.test(norm)) targetType = 'snack';

      if (targetType) {
        return done({
          intent: 'action',
          pendingClarification: null,
          plannedActions: [{
            tool: 'deleteMeal',
            args: { mealType: targetType }
          }]
        });
      }
    }

    // If the user's message is a clear new query or command, abandon the pending clarification
    const isNewIntent = /(?:كم|شو|ما هي|قديش|سجل|وزني|شربت|اكلت|تمرين|خلصت|ضيف|شيل|تراجع|وقف|احسب|ابحث)/i.test(norm);
    if (!isNewIntent) {
      // Re-prompt for the pending clarification
      return {
        intent: 'clarification',
        pendingClarification: pending,
        finalResponse: {
          requestId: state.requestId,
          threadId: state.threadId,
          status: 'clarification',
          reply: pending.question || 'يرجى توضيح التفاصيل الناقصة لإكمال طلبك.',
          cards: [{
            type: 'clarification',
            question: pending.question || 'يرجى توضيح التفاصيل الناقصة لإكمال طلبك.',
            options: pending.options || []
          }],
          actions: [],
          results: []
        }
      };
    }
  }

  // ----------------------------------------------------
  // 2. Control & Undo Commands
  // ----------------------------------------------------
  if (/(?:وقف|اوقف|توقف عن|كافي|stop)\s+(?:استماع|الاستماع|تسجيل|التسجيل|مايك|listening)|(?:stop listening|mute)/i.test(norm)) {
    return done({
      intent: 'control',
      plannedActions: [{ tool: 'stopVoiceSession', args: {} }]
    });
  }

  if (/(?:تراجع|رجع|الغ|إلغاء)\s*(?:عن\s+)?(?:اخر|آخر)?\s*(?:شغله|شغلة|اشي|شي|عمل|عملية|عمليه|عملتها|سويتها|تغيير|حاجة|حاجه|اجراء|إجراء)|(?:undo)/i.test(norm)) {
    return done({
      intent: 'control',
      plannedActions: [{ tool: 'undoLastAction', args: {} }]
    });
  }

  // ----------------------------------------------------
  // 3. Read-Only Queries (Strict Separation: NO MUTATION)
  // ----------------------------------------------------
  // Protein remaining query
  if (/(?:كم|شو|قديش)\s+(?:باقي|بقي|ضل|باقيلي|بقيلي|باقي لي|ضايل|متبقي)\s+(?:من\s+)?(?:البروتين|بروتين)/i.test(norm) ||
      /(?:كم|شو|قديش)\s+(?:البروتين|بروتين)\s+(?:المتبقي|الباقي|اللي باقي|باقي|متبقي)/i.test(norm)) {
    return done({
      intent: 'query',
      plannedActions: [{ tool: 'getTodayNutrition', args: { query: 'remaining_protein' } }]
    });
  }

  // Food calorie / macro inquiry (Does NOT log a meal)
  if (/(?:كم|شو|ما هي|قديش)\s+(?:سعره|سعرات|بروتين|ماكروز|كالوري)\s+(?:في|بـ|ب)\s+/i.test(norm)) {
    const qMatch = norm.match(/(?:في|بـ|ب)\s+(\d+(?:\.\d+)?)\s*(?:غ|غرام|جرام|غم|جم|g)?\s*(.+)/i) ||
                  norm.match(/(\d+(?:\.\d+)?)\s*(?:غ|غرام|جرام|غم|جم|g)\s*(.+?)\s*(?:كم|قديش|شو)/i);
    if (qMatch) {
      const grams = parseFloat(qMatch[1]);
      const foodName = qMatch[2].replace(/[?؟]/g, '').trim();
      return done({
        intent: 'query',
        plannedActions: [{ tool: 'queryFoodNutrition', args: { foodName, grams } }]
      });
    }
  }

  // Today summary inquiry
  if (/(?:شو عندي اليوم|شو علي اليوم|ملخص اليوم|اعرض ملخص اليوم|تقرير اليوم|what.*today)/i.test(norm)) {
    return done({
      intent: 'query',
      plannedActions: [{ tool: 'getTodaySummary', args: {} }]
    });
  }

  // How-to / explanation questions (No action)
  if (/^(?:كيف|طريقة|شلون)\s+(?:اسجل|بسجل|احسب|بحسب)\s+(?:وزني|الوزن)/i.test(norm)) {
    return done({
      intent: 'query',
      finalResponse: {
        requestId: state.requestId,
        threadId: state.threadId,
        status: 'success',
        reply: 'لتسجيل وزنك بسهولة، يمكنك أن تقول أو تكتب: "وزني اليوم 79.9" وسأقوم بحفظه وتحديث سجلك فوراً.',
        actions: [],
        results: [],
        cards: []
      }
    });
  }

  // Translation command (No action)
  if (/^ترجم(?:\s*[:：]|\s+)(.+)$/i.test(original.trim())) {
    const toTranslate = original.trim().replace(/^ترجم(?:\s*[:：]|\s+)/, '');
    let translated = 'I drank water';
    if (/شربت|ماء|مي/.test(toTranslate)) translated = 'I drank water.';
    return done({
      intent: 'query',
      finalResponse: {
        requestId: state.requestId,
        threadId: state.threadId,
        status: 'success',
        reply: `ترجمة «${toTranslate}»: ${translated}`,
        actions: [],
        results: [],
        cards: []
      }
    });
  }

  // ----------------------------------------------------
  // 4. Meal Modifications & Deletions
  // ----------------------------------------------------
  // Meal quantity update: "عدّل كمية الدجاج إلى ١٥٠"
  const updateMealMatch = norm.match(/(?:عدل|عدّل|غير|غيّر|خلي|خلّي|بدل)\s+(?:كميه|كمية)?\s*(.+?)\s+(?:الي|إلى|لـ|ل)\s*(\d+(?:\.\d+)?)\s*(?:غ|غرام|جرام|غم|جم)?/i);
  if (updateMealMatch) {
    const foodName = updateMealMatch[1].replace(/^(?:ال)/, '').trim();
    const newGrams = parseFloat(updateMealMatch[2]);
    return done({
      intent: 'action',
      plannedActions: [{
        tool: 'updateMeal',
        args: { foodName, newGrams }
      }]
    });
  }

  // Ambiguous deletion: "احذف الوجبة"
  if (/^(?:احذف|شيل|امسح|الغ|إلغاء)\s+(?:الوجبه|الوجبة)$/i.test(norm)) {
    const meals = state.clientState?.loggedMeals || [];
    const todayMeals = meals.filter(m => (m.date || state.clientState?.currentDate) === state.clientState?.currentDate);
    if (todayMeals.length > 1) {
      const question = 'أي وجبة تريد حذفها؟ (الفطور، الغداء، أو العشاء)';
      return {
        intent: 'clarification',
        pendingClarification: { action: 'deleteMeal' },
        finalResponse: {
          requestId: state.requestId,
          threadId: state.threadId,
          status: 'clarification',
          reply: question,
          cards: [{
            type: 'clarification',
            question,
            options: ['الفطور', 'الغداء', 'العشاء']
          }],
          actions: [],
          results: []
        }
      };
    } else if (todayMeals.length === 1) {
      return done({
        intent: 'action',
        plannedActions: [{
          tool: 'deleteMeal',
          args: { mealId: todayMeals[0].id }
        }]
      });
    } else {
      return done({
        intent: 'action',
        finalResponse: {
          requestId: state.requestId,
          threadId: state.threadId,
          status: 'error',
          reply: 'لا توجد وجبات مسجلة اليوم لحذفها.',
          actions: [],
          results: [],
          cards: []
        }
      });
    }
  }

  // Explicit meal deletion: "احذف وجبة الغداء"
  const delMealMatch = norm.match(/(?:احذف|شيل|امسح)\s+(?:وجبه|وجبة)\s+(الغدا|الغداء|الفطور|العشا|العشاء|السناك)/i);
  if (delMealMatch) {
    let mealType = 'lunch';
    if (/فطور/.test(delMealMatch[1])) mealType = 'breakfast';
    else if (/غدا/.test(delMealMatch[1])) mealType = 'lunch';
    else if (/عشا/.test(delMealMatch[1])) mealType = 'dinner';
    else if (/سناك/.test(delMealMatch[1])) mealType = 'snack';
    return done({
      intent: 'action',
      plannedActions: [{
        tool: 'deleteMeal',
        args: { mealType }
      }]
    });
  }

  // ----------------------------------------------------
  // Incomplete workout sets: "لعبت بنش 80" -> Clarification
  // ----------------------------------------------------
  if (/(?:لعبت|عملت|سويت)\s+(بنش|سكوات|ديدلفت|[a-z\s]+)\s+(\d+)\s*(?:كيلو|كغ)?$/i.test(norm) && !/(?:جول|عد)/i.test(norm)) {
    const m = norm.match(/(?:لعبت|عملت|سويت)\s+(بنش|سكوات|ديدلفت|[a-z\s]+)\s+(\d+)/i);
    const exName = m[1].trim();
    const weight = parseFloat(m[2]);
    const exercise = matchExercise(exName);
    const question = 'كم جولة وكم عدة؟';
    return {
      intent: 'clarification',
      pendingClarification: {
        action: 'workout_sets_reps',
        pendingClarification: 'workout_sets_reps',
        exercise: exercise?.nameAr || exName,
        weightKg: weight,
        question
      },
      finalResponse: {
        requestId: state.requestId,
        threadId: state.threadId,
        status: 'clarification',
        reply: question,
        cards: [{
          type: 'clarification',
          question,
          options: ['3 جولات 8 عدات', '3 جولات 10 عدات', '4 جولات 12 عدة']
        }],
        actions: [],
        results: []
      }
    };
  }

  // ----------------------------------------------------
  // 5. Multi-Action Splitter (e.g. "سجل ٥٠٠ مل مي ووزني اليوم ٧٩٫٩")
  // ----------------------------------------------------
  function extractMealItemsFromText(text) {
    const clean = text.replace(/^(?:سجل|سجلت|اكلت|تناولت|ضيف|حط|احسب|احسبلي)\s+(?:في|بـ|ب|بال)?(?:الغدا|الغداء|الفطور|العشا|العشاء|السناك|الوجبه|الوجبة)?\s*/i, '');
    const segments = clean.split(/\s+و\s*|\s*[,،+]\s*/).filter(Boolean);
    const items = [];

    for (const seg of segments) {
      let m = seg.match(/^(\d+(?:\.\d+)?)\s*(?:غ|غرام|جرام|غم|جم|g)?\s+(.+)$/i) ||
              seg.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:غ|غرام|جرام|غم|جم|g)?$/i);
      if (m) {
        const grams = !isNaN(parseFloat(m[1])) ? parseFloat(m[1]) : parseFloat(m[2]);
        const rawName = !isNaN(parseFloat(m[1])) ? m[2] : m[1];
        if (rawName && grams > 0) {
          let itemState = 'cooked';
          if (/(?:نيء|ني|قبل الطبخ|raw)/i.test(rawName)) itemState = 'raw';
          if (/(?:مطبوخ|مشوي|مسلوق|بعد الطبخ|cooked)/i.test(rawName)) itemState = 'cooked';

          const food = matchFood(rawName, itemState);
          items.push({
            foodId: food?.id || 'custom-' + rawName.trim().replace(/\s+/g, '-'),
            foodName: food?.nameAr || rawName.trim(),
            grams,
            state: itemState
          });
        }
      }
    }
    return items;
  }

  const plannedActions = [];
  const clauses = norm.split(/(?:،|,|\s+ثم\s+|\s+وايضا\s+|\s+وكمان\s+)/).filter(Boolean);

  for (const clause of clauses) {
    const c = clause.trim();

    // Check for water log
    if (/(?:شربت|زود|زيد|كاسه|كاسة|كوب|لتر|ماء|مي|water)/i.test(c) && !/(?:تمرين|قائمه|قائمة|مشتريات)/i.test(c)) {
      const ml = parseWaterAmount(c);
      if (ml) {
        if (/(?:عدل|عدّل|خلي|خلّي)\s+(?:الماء|المي)/i.test(c)) {
          plannedActions.push({ tool: 'updateWater', args: { milliliters: ml } });
        } else {
          plannedActions.push({ tool: 'logWater', args: { milliliters: ml } });
        }
      }
    }

    // Check for weight log
    const wt = parseWeight(c);
    if (wt && !/(?:بنش|سكوات|ديدلفت|بار|دمبل)/i.test(c)) {
      if (/(?:عدل|عدّل|خلي|خلّي)\s+(?:وزني|الوزن)/i.test(c)) {
        plannedActions.push({ tool: 'updateWeight', args: { weightKg: wt } });
      } else {
        plannedActions.push({ tool: 'logWeight', args: { weightKg: wt } });
      }
    }

    // Check for workout sets
    const wMatch = c.match(/(?:عملت|لعبت|سجلت|سجل|تمرين)?\s*(.+?)\s+(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|ك|kg)?\s*(?:،|,)?\s*(\d+)\s*(?:جولات|مجموعات|sets?)\s*(?:كل جوله|كل جولة)?\s*(?:بـ|ب|x|×)?\s*(\d+)\s*(?:عدات|تكرار|reps?)?/i);
    if (wMatch && /(?:بنش|سكوات|ديدلفت|بار|دمبل|سحب|كتف|صدر|ارجل|باي|تراي|بطن)/i.test(wMatch[1])) {
      const exName = wMatch[1].trim().replace(/^(عملت|لعبت|سجلت|سجل)\s+/, '');
      const weight = parseFloat(wMatch[2]);
      const sets = parseInt(wMatch[3], 10);
      const reps = parseInt(wMatch[4], 10);
      const exercise = matchExercise(exName);
      plannedActions.push({
        tool: 'logWorkoutSets',
        args: {
          exercise: exercise?.nameAr || exName,
          weightKg: weight,
          sets: sets || 1,
          reps: reps || 10
        }
      });
    }

    // Check for workout finish
    const finishMatch = c.match(/(?:خلصت|انهيت|اكملت)\s+(?:تمرين\s*(.*)|التمرين)$/i);
    if (finishMatch) {
      const title = finishMatch[1]?.trim() || 'تمرين اليوم';
      plannedActions.push({ tool: 'completeWorkout', args: { title } });
    }

    // Check for supplements
    if (/(?:اخذت|اخدت|تناولت|بلعت|شربت مكمل)\s+(?:ال)?(كرياتين|بروتين|فيتامين|اوميغا|مغنيسيوم|creatine|protein|ashwagandha)/i.test(c)) {
      const suppMatch = c.match(/(?:اخذت|اخدت|تناولت|بلعت|شربت مكمل)\s+(.+)$/i);
      if (suppMatch) {
        plannedActions.push({ tool: 'markSupplementTaken', args: { supplement: suppMatch[1].trim() } });
      }
    }

    // Check for shopping
    const shopAddMatch = c.match(/(?:ضيف|اضف|حط)\s+(.+?)\s+(?:لقائمه|لقائمة|على قائمة|للمشتريات|للتسوق|على المشتريات)/i);
    if (shopAddMatch) {
      const names = shopAddMatch[1].split(/\s+و\s*|\s*[,،+]\s*/).map(n => n.trim()).filter(Boolean);
      plannedActions.push({ tool: 'addShoppingItems', args: { names } });
    }
    const shopRemMatch = c.match(/(?:شيل|احذف|امسح)\s+(.+?)(?:\s+من (?:قائمة )?المشتريات)?$/i);
    if (shopRemMatch && !/(?:وجبه|وجبة|تمرين)/.test(shopRemMatch[1])) {
      plannedActions.push({ tool: 'removeShoppingItem', args: { name: shopRemMatch[1].trim() } });
    }

    // Check for meal items in this clause
    if (/(?:اكلت|تناولت|فطرت|تغديت|تعشيت|وجبه|وجبة|غرام|جرام|غ\b|غم\b|جم\b|احسب|احسبلي|سدر|صدر|صدور|دجاج|رز|ارز|بيض|لحم)/i.test(c) && !/(?:مكمل|ماء|مي|تمرين)/i.test(c)) {
      const items = extractMealItemsFromText(c);
      if (items.length > 0) {
        let mealType = 'lunch';
        if (/فطور|breakfast/.test(c)) mealType = 'breakfast';
        else if (/غدا|غداء|lunch/.test(c)) mealType = 'lunch';
        else if (/عشا|عشاء|dinner/.test(c)) mealType = 'dinner';
        else if (/سناك|snack/.test(c)) mealType = 'snack';

        plannedActions.push({ tool: 'logMeal', args: { mealType, items } });
      }
    }
  }

  // Check for priority command
  const prioMatch = norm.match(/(?:خلي|خلّي|حط|اجعل)?\s*(التمرين|تمرين|التغذية|تغذية|الاكل|الماء|المي|ماء|مي|المكملات|مكملات)\s*(?:اهم شي|اهم شيء|اول شي|اول شيء|اولوية|رقم واحد)/i);
  if (prioMatch && !plannedActions.some(a => a.tool === 'prioritize_today')) {
    const rawKind = prioMatch[1];
    let kind = 'workout';
    if (/تمرين/.test(rawKind)) kind = 'workout';
    else if (/تغذي|اكل|طعام/.test(rawKind)) kind = 'nutrition';
    else if (/ماء|مي/.test(rawKind)) kind = 'water';
    else if (/مكمل/.test(rawKind)) kind = 'supplements';
    plannedActions.push({ tool: 'prioritize_today', args: { priority: kind, kind } });
  }

  // ----------------------------------------------------
  // 6. Single Meal Logging & Missing Grams Check
  // ----------------------------------------------------
  const isMealContext = /(?:اكلت|تناولت|سجل|ضيف|فطرت|تغديت|تعشيت|وجبه|وجبة|دجاج|رز|ارز|شوفان|بيض|بطاطا|لحم|سمك|تونة|سلطة)/i.test(norm) &&
                       !/(?:المشتريات|للمشتريات|مكمل|ماء|مي|تمرين)/i.test(norm);

  if (isMealContext && !plannedActions.some(a => a.tool === 'logMeal')) {
    let mealType = 'lunch';
    if (/فطور|breakfast/.test(norm)) mealType = 'breakfast';
    else if (/غدا|غداء|lunch/.test(norm)) mealType = 'lunch';
    else if (/عشا|عشاء|dinner/.test(norm)) mealType = 'dinner';
    else if (/سناك|snack/.test(norm)) mealType = 'snack';

    // Check if food was mentioned without grams (e.g. "سجل دجاج بالغدا")
    const hasGrams = /(\d+(?:\.\d+)?)\s*(?:غ|غرام|جرام|غم|جم|g)/i.test(norm) ||
                     /(?:غ|غرام|جرام|غم|جم|g)\s*(\d+(?:\.\d+)?)/i.test(norm);

    if (!hasGrams) {
      // Find food mentioned
      let foundFood = null;
      for (const alias of Object.keys(FOOD_ALIASES)) {
        if (norm.includes(alias)) {
          foundFood = alias;
          break;
        }
      }
      if (foundFood) {
        const question = `كم غرام ${foundFood} تريد تسجيله؟`;
        return {
          intent: 'clarification',
          pendingClarification: {
            action: 'logMeal',
            mealType,
            foodName: foundFood
          },
          finalResponse: {
            requestId: state.requestId,
            threadId: state.threadId,
            status: 'clarification',
            reply: question,
            cards: [{
              type: 'clarification',
              question,
              options: ['150 غ', '200 غ', '250 غ', '300 غ']
            }],
            actions: [],
            results: []
          }
        };
      }
    } else {
      // Extract items with grams
      const items = extractMealItemsFromText(norm);
      if (items.length > 0) {
        plannedActions.push({
          tool: 'logMeal',
          args: { mealType, items }
        });
      }
    }
  }

  if (plannedActions.length > 0) {
    return done({
      intent: 'action',
      plannedActions
    });
  }

  // ----------------------------------------------------
  // 7. General Knowledge or Search (with Gemini fallback)
  // ----------------------------------------------------
  return done({
    intent: 'search',
    plannedActions: []
  });
}
