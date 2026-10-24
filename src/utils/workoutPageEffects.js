/**
 * Clear training-only UI effects whenever the router leaves/replaces a view.
 * Modal and drag gestures can lock body scrolling on iOS; those locks must
 * never survive into Nutrition, Profile or any other tab.
 */
export function clearWorkoutPageEffects(doc = document) {
  doc.querySelectorAll?.('body > #workout-top-pill, body > #personalized-plan-creator-modal')
    ?.forEach(node => node.remove?.());
  const style = doc.body?.style;
  if (!style) return;
  if (style.overflow === 'hidden') style.overflow = '';
  if (style.touchAction === 'none') style.touchAction = '';
  if (style.userSelect === 'none') style.userSelect = '';
}
