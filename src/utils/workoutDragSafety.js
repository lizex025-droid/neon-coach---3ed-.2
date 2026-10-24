// Only the dedicated exercise-number grip can initiate reordering.
// A long press on the card content is a normal mobile reading/scroll gesture.
export function getExerciseReorderCard(target) {
  return target?.closest?.('.forty-drag-handle')?.closest?.('.forty-exercise-card') || null;
}
