export async function composeResponseNode(state) {
  // If already compiled by early return (e.g. idempotent replay or direct error)
  if (state.finalResponse) {
    return { finalResponse: state.finalResponse };
  }

  const requestId = state.requestId;
  const threadId = state.threadId;

  // 1. Error state
  if (state.errors?.length > 0) {
    const errorMsg = state.errors.join(' · ');
    const res = {
      requestId,
      threadId,
      status: 'error',
      error: errorMsg,
      reply: errorMsg,
      actions: [],
      results: [],
      cards: [],
      changedResources: []
    };
    return { finalResponse: res };
  }

  // 2. Pending clarification state
  if (state.pendingClarification) {
    const q = state.pendingClarification.question || 'يرجى توضيح التفاصيل الناقصة لإكمال طلبك.';
    const res = {
      requestId,
      threadId,
      status: 'clarification',
      reply: q,
      pendingClarification: state.pendingClarification,
      actions: [],
      results: [],
      cards: [{
        type: 'clarification',
        question: q,
        options: state.pendingClarification.options || []
      }],
      changedResources: []
    };
    return { finalResponse: res };
  }

  const toolResults = state.toolResults || [];
  const cards = [];
  const replies = [];

  // 3. Compose cards and replies from actual tool results
  for (const tr of toolResults) {
    if (tr.summaryText) replies.push(tr.summaryText);

    switch (tr.tool) {
      case 'logMeal': {
        if (tr.record) {
          cards.push({
            type: 'meal',
            title: `وجبة ${tr.record.mealType === 'breakfast' ? 'الفطور' : tr.record.mealType === 'lunch' ? 'الغداء' : tr.record.mealType === 'dinner' ? 'العشاء' : 'سناك'}`,
            mealType: tr.record.mealType,
            items: tr.record.items,
            totalCalories: tr.record.calories,
            totalProtein: tr.record.protein,
            totalCarbs: tr.record.carbs,
            totalFats: tr.record.fats,
            time: tr.record.time,
            recordId: tr.recordId
          });
        }
        break;
      }

      case 'logWater':
      case 'updateWater': {
        cards.push({
          type: 'water',
          amountMl: tr.amountMl,
          todayTotalMl: tr.todayTotalMl,
          targetWaterMl: tr.targetWaterMl,
          recordId: tr.recordId
        });
        break;
      }

      case 'logWeight':
      case 'updateWeight': {
        cards.push({
          type: 'weight',
          weightKg: tr.weightKg,
          date: tr.date,
          changeKg: tr.changeKg,
          recordId: tr.recordId
        });
        break;
      }

      case 'logWorkoutSets': {
        cards.push({
          type: 'workout_set',
          exercise: tr.exercise,
          weightKg: tr.weightKg,
          sets: tr.sets,
          reps: tr.reps,
          recordId: tr.recordId
        });
        break;
      }

      case 'completeWorkout': {
        cards.push({
          type: 'workout_completed',
          title: tr.title,
          recordId: tr.recordId
        });
        break;
      }

      case 'getTodayNutrition':
      case 'queryFoodNutrition': {
        cards.push({
          type: 'nutrition_info',
          text: tr.summaryText
        });
        break;
      }

      case 'getTodaySummary': {
        const snap = state.clientState?._snapshot || {};
        cards.push({
          type: 'today_summary',
          consumedCalories: snap.consumedCalories,
          targetCalories: snap.targetCalories,
          consumedProtein: snap.consumedProtein,
          targetProtein: snap.targetProtein,
          remainingProtein: snap.remainingProtein,
          waterMl: snap.waterMl,
          targetWaterMl: snap.targetWaterMl,
          isWorkoutCompleted: snap.isWorkoutCompleted
        });
        break;
      }
    }
  }

  // Fallback reply if empty
  let replyText = replies.join('\n');
  if (!replyText) {
    if (state.intent === 'search') {
      replyText = 'لم أتمكن من العثور على نتيجة دقيقة لهذا السؤال.';
    } else {
      replyText = 'تم تنفيذ طلبك بنجاح ✓';
    }
  }

  // Clean clientState before sending (remove temp fields)
  const updatedState = { ...(state.clientState || {}) };
  delete updatedState._snapshot;
  delete updatedState._undoHistory;

  const finalResponse = {
    requestId,
    threadId,
    status: 'success',
    reply: replyText,
    actions: (state.plannedActions || []).map(a => ({ ...a, arguments: a.arguments || a.args || {}, args: a.args || a.arguments || {} })),
    results: toolResults,
    cards,
    changedResources: state.changedResources || [],
    updatedState
  };

  return { finalResponse };
}
