/**
 * Load R2 body-fat photos only when near the viewport, max three in flight.
 * Each source image is ~1.8 MB; requesting all nine immediately severely
 * competes with first paint on a cellular connection. We do not change the
 * original R2 URLs or any user's saved onboarding selection.
 */
export function startBodyFatImageLoader(root, options = {}) {
  const photos = Array.from(root?.querySelectorAll?.('.body-fat-photo[data-src]') || []);
  if (!photos.length) return () => {};

  const windowRef = options.windowRef || (typeof window === 'undefined' ? {} : window);
  const Observer = options.IntersectionObserver || windowRef.IntersectionObserver;
  const maxConcurrent = Math.max(1, Math.min(3, Number(options.maxConcurrent) || 3));
  const waiting = [];
  const seen = new Set();
  let active = 0;
  let disposed = false;
  let observer;

  function finish(photo, success) {
    const tile = photo.closest('.body-fat-option');
    photo.parentElement?.classList.remove('is-loading');
    if (success) {
      photo.classList.add('is-ready');
    } else {
      photo.hidden = true;
      tile?.classList.add('is-fallback');
      const fallback = photo.nextElementSibling;
      if (fallback?.classList.contains('body-fat-image-fallback')) fallback.hidden = false;
      const label = tile?.querySelector('.body-fat-fallback-label');
      if (label) label.hidden = false;
    }
    active = Math.max(0, active - 1);
    pump();
  }

  function pump() {
    if (disposed) return;
    while (active < maxConcurrent && waiting.length) {
      const photo = waiting.shift();
      if (!photo?.isConnected || !photo.dataset?.src) continue;
      active += 1;
      photo.addEventListener('load', () => finish(photo, true), { once: true });
      photo.addEventListener('error', () => finish(photo, false), { once: true });
      photo.loading = 'eager'; // We explicitly control when this request starts.
      photo.fetchPriority = photo.dataset.priority || 'auto';
      photo.src = photo.dataset.src;
      delete photo.dataset.src;
      if (photo.complete && photo.naturalWidth > 0) {
        // A cached image may be immediately available; load will normally
        // fire on the next turn and the listener handles the regular path.
      }
    }
  }

  function enqueue(photo) {
    if (disposed || seen.has(photo)) return;
    seen.add(photo);
    observer?.unobserve(photo);
    waiting.push(photo);
    pump();
  }

  if (typeof Observer === 'function') {
    observer = new Observer(entries => {
      for (const entry of entries) if (entry.isIntersecting) enqueue(entry.target);
    }, { rootMargin: '120px 0px', threshold: 0.01 });
    photos.forEach(photo => observer.observe(photo));
  } else {
    // Older browsers: preserve image availability, still with limited
    // simultaneous downloads.
    photos.forEach(enqueue);
  }

  return () => {
    disposed = true;
    observer?.disconnect();
    waiting.length = 0;
  };
}
