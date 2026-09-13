export async function readResultsNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};

  const clientState = state.clientState || {};
  const today = clientState.today || {};
  const currentDate = clientState.currentDate || new Date().toISOString().split('T')[0];
  const userProfile = clientState.userProfile || {};

  const consumedCalories = Number(today.consumedCalories) || 0;
  const targetCalories = Number(today.targetCalories) || 2200;
  const consumedProtein = Number(today.consumedProtein) || 0;
  const targetProtein = Number(today.targetProtein) || 160;
  const remainingProtein = Math.max(0, Math.round((targetProtein - consumedProtein) * 10) / 10);

  const waterMl = Math.round((Number(today.consumedWaterLiters) || 0) * 1000);
  const targetWaterMl = Math.round((Number(today.targetWaterLiters) || 3.0) * 1000);

  const currentWeight = Number(userProfile.currentWeight) || 80;

  const snapshot = {
    date: currentDate,
    consumedCalories,
    targetCalories,
    consumedProtein,
    targetProtein,
    remainingProtein,
    waterMl,
    targetWaterMl,
    currentWeight,
    isWorkoutCompleted: !!today.isWorkoutCompleted,
    workoutTitle: today.todayWorkoutTitleAr || ''
  };

  return {
    clientState: {
      ...clientState,
      _snapshot: snapshot
    }
  };
}
