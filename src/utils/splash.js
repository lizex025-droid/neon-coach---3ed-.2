/**
 * NEON COACH - شاشة التحميل الذكية الفورية (Unified Cyber Splash Loader)
 * تظهر فور الضغط على زر التدريب أو عند تحميل صفحات التمرين
 */

export function showNeonSplash(customTitle = 'جاري تجهيز تمرين الـ 40 يوماً...') {
  if (typeof document === 'undefined') return null;

  let splash = document.getElementById('neon-app-splash');

  if (splash) {
    splash.classList.remove('splash-hide');
    const catBox = document.getElementById('splash-cat-box');
    if (catBox) catBox.classList.remove('is-loaded');
    const titleEl = document.getElementById('splash-status-text');
    if (titleEl) titleEl.textContent = customTitle;
    return splash;
  }

  // إنشاء العنصر ديناميكياً إذا تم حذفه مسبقاً
  splash = document.createElement('div');
  splash.id = 'neon-app-splash';
  splash.setAttribute('role', 'status');
  splash.setAttribute('aria-live', 'polite');
  splash.innerHTML = `
    <div class="wb-atmosphere" aria-hidden="true"></div>
    <div class="wb-mist" aria-hidden="true"></div>
    <div class="wb-mountains" aria-hidden="true">
      <svg viewBox="0 0 1440 360" preserveAspectRatio="none">
        <path d="M0 250 L110 280 L260 210 L420 250 L560 190 L720 235 L900 175 L1080 220 L1240 195 L1440 230 L1440 360 Z" fill="rgba(5, 22, 16, 0.78)" />
        <path d="M0 292 L130 305 L300 260 L520 300 L760 258 L950 292 L1140 258 L1320 300 L1440 276 L1440 360 L0 360 Z" fill="rgba(2, 14, 10, 0.92)" />
      </svg>
    </div>
    <div class="wb-particles" aria-hidden="true">
      <span style="left:8%;top:18%;--dx:16px;--dy:-86vh;animation-duration:20s"></span>
      <span style="left:22%;top:64%;--dx:-14px;--dy:-92vh;animation-duration:25s"></span>
      <span style="left:35%;top:36%;--dx:20px;--dy:-80vh;animation-duration:22s"></span>
      <span style="left:48%;top:74%;--dx:-18px;--dy:-95vh;animation-duration:28s"></span>
      <span style="left:62%;top:25%;--dx:15px;--dy:-84vh;animation-duration:24s"></span>
      <span style="left:76%;top:52%;--dx:-15px;--dy:-88vh;animation-duration:23s"></span>
      <span style="left:88%;top:30%;--dx:18px;--dy:-94vh;animation-duration:26s"></span>
    </div>
    <div class="wb-grain" aria-hidden="true"></div>

    <div class="splash-content">
      <div class="splash-cat-wrap">
        <div class="splash-logo-pulse-ring ring-1"></div>
        <div class="splash-logo-pulse-ring ring-2"></div>
        <div class="splash-logo-orbit-ring"></div>
        <div class="splash-cat-halo"></div>
        <div id="splash-cat-box" class="splash-cat-box">
          <div class="splash-cat-scanner"></div>
          <div class="splash-cat-shimmer"></div>
          <img src="./icons/neon-cat-coach.svg" id="splash-cat-img" class="splash-cat-img" alt="NEON COACH CAT" onerror="this.src='./icons/icon-192.svg'" />
        </div>
      </div>
      <div class="splash-brand-title">NEON COACH</div>
      <div id="splash-status-text" style="margin-top: 10px; font-size: 0.95rem; color: #55F7A5; font-weight: 700; letter-spacing: 0.5px;">${customTitle}</div>
    </div>
  `;

  document.body.appendChild(splash);
  return splash;
}

export function hideNeonSplash() {
  if (typeof document === 'undefined') return;
  const splash = document.getElementById('neon-app-splash');
  if (!splash) return;

  const catBox = document.getElementById('splash-cat-box');
  if (catBox) catBox.classList.add('is-loaded');

  splash.classList.add('splash-hide');
  setTimeout(() => {
    if (splash && splash.parentNode) splash.parentNode.removeChild(splash);
  }, 160);
}

/**
 * رصد وتفعيل شاشة التحميل فور الضغط على أزرار التدريب
 */
export function setupTrainingLoadingInterceptors() {
  if (typeof window === 'undefined') return;

  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href*="40-days-workout"], a[href*="fortyDay"], #start-workout-btn, [data-nav="workout"]');
    if (target) {
      showNeonSplash('جاري تجهيز تمرين الـ 40 يوماً...');
    }
  }, { capture: true });

  // صمام أمان عند الرجوع بالمتصفح
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) {
      const splash = document.getElementById('neon-app-splash');
      if (splash) splash.remove();
    }
  });

  if (!window.dismissNeonSplash) {
    window.dismissNeonSplash = hideNeonSplash;
  }
  if (!window.showNeonSplash) {
    window.showNeonSplash = showNeonSplash;
  }
}
