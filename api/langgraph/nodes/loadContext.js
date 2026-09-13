export async function loadContextNode(state) {
  if (state.isIdempotentReplay || state.errors?.length > 0) return {};

  const clientState = state.clientState || {};
  const currentDate = clientState.currentDate || new Date().toISOString().split('T')[0];

  // Initialize or ensure state collections exist
  const today = clientState.today || {
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

  const loggedMeals = Array.isArray(clientState.loggedMeals) ? [...clientState.loggedMeals] : [];
  const waterLogs = Array.isArray(clientState.waterLogs) ? [...clientState.waterLogs] : [];
  const weightLogs = Array.isArray(clientState.weightLogs) ? [...clientState.weightLogs] : [];
  const supplementsSchedule = Array.isArray(clientState.supplementsSchedule) ? [...clientState.supplementsSchedule] : [];
  const workoutHistory = Array.isArray(clientState.workoutHistory) ? [...clientState.workoutHistory] : [];
  const userProfile = clientState.userProfile || { currentWeight: 80, targetWeight: 75 };
  const shoppingItems = Array.isArray(clientState.shoppingItems) ? [...clientState.shoppingItems] : [];

  return {
    clientState: {
      ...clientState,
      currentDate,
      today,
      loggedMeals,
      waterLogs,
      weightLogs,
      supplementsSchedule,
      workoutHistory,
      userProfile,
      shoppingItems
    }
  };
}
