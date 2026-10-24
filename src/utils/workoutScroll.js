/**
 * Scroll the training page to its top on Safari and standalone iOS PWAs.
 * Uses immediate native scrolling to avoid conflicting smooth animations on
 * document/html/body, and does not depend on a particular scrolling element.
 */
export function scrollWorkoutToTop(win = window, doc = document) {
  const workout = doc.getElementById?.('forty-workout-root');
  const view = doc.getElementById?.('view-container');
  if (!workout && !view) return false;

  const ancestors = new Set([
    view,
    doc.getElementById?.('app'),
    doc.scrollingElement,
    doc.documentElement,
    doc.body
  ]);
  for (let node = workout || view; node; node = node.parentElement) {
    ancestors.add(node);
  }

  // A numerical scrollTo() works on old WebKit even if scrollTo(options)
  // silently does nothing. Direct scrollTop also covers overflow containers.
  const forceTop = () => {
    try { (workout || view)?.scrollIntoView?.({ block: 'start', behavior: 'instant' }); }
    catch (_) { /* scrollTop below is the universal fallback */ }

    for (const element of ancestors) {
      if (!element) continue;
      try { element.scrollTop = 0; } catch (_) { /* read-only */ }
      try { element.scrollLeft = 0; } catch (_) { /* read-only */ }
      try { element.scrollTo?.(0, 0); } catch (_) { /* unsupported */ }
    }
    try { win.scrollTo(0, 0); } catch (_) { /* unsupported */ }
    try { win.scroll?.(0, 0); } catch (_) { /* unsupported */ }
  };

  forceTop();
  // iOS may apply the previous momentum position in the next frame.
  // Run a second synchronous-to-paint correction, without a background task.
  if (typeof win.requestAnimationFrame === 'function') {
    win.requestAnimationFrame(forceTop);
  }
  return true;
}
