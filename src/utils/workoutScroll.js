/**
 * Return from any exercise to the beginning of the training screen.
 * Both Safari/PWA document scroll and nested scroll containers are supported.
 * Keeping this DOM-only helper independent makes it easy to regression test.
 */
export function scrollWorkoutToTop(win = window, doc = document) {
  const workout = doc.getElementById?.('forty-workout-root');
  if (!workout) return false;

  const options = { top: 0, left: 0, behavior: 'smooth' };
  const scroll = (target) => {
    if (!target) return;
    try {
      if (typeof target.scrollTo === 'function') {
        target.scrollTo(options);
      } else if ('scrollTop' in target) {
        target.scrollTop = 0;
      }
    } catch (_) {
      // Some older WebKit elements do not accept options objects.
      try { target.scrollTop = 0; } catch (_) { /* unsupported scroller */ }
    }
  };

  // scrollIntoView selects the actual scrollable parent on iOS even when it
  // is not window/document. Everything then scrolls to absolute page top.
  try {
    workout.scrollIntoView?.({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  } catch (_) {
    try { workout.scrollIntoView?.(); } catch (_) { /* unsupported browser */ }
  }

  // Some iOS standalone PWAs scroll an inner view rather than window.
  // Include every ancestor, as well as explicit app-shell scrollers.
  const candidates = new Set([
    doc.getElementById?.('view-container'),
    doc.getElementById?.('app'),
    doc.scrollingElement,
    doc.documentElement,
    doc.body
  ]);
  for (let parent = workout.parentElement; parent; parent = parent.parentElement) {
    candidates.add(parent);
  }
  for (const node of candidates) scroll(node);
  scroll(win);
  return true;
}
