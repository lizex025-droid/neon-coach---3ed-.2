// =============================================================
// Persistent dashboard top bar + bottom tab bar.
// Drop this on any page with:
//     <script src="topbar.js" defer></script>
// It self-injects HTML + CSS, reads progress from localStorage,
// and renders the water +1 button in the top bar plus the
// Main/Health/Fitness bottom tabs. Skips chrome on finance.html
// and inside iframes so the water tracker can embed cleanly.
// =============================================================
(function () {
  'use strict';

  const TOPBAR_SUPABASE_URL = 'https://ysxdagyjzchgwkkbrvku.supabase.co';
  const TOPBAR_SUPABASE_KEY = 'sb_publishable_Pf1QtjOUM_fb9to02CMZ2w_Ib-RCypm';

  function injectVitalityBackdrop() {
    if (!document.getElementById('vt-backdrop')) {
      const backdrop = document.createElement('div');
      backdrop.id = 'vt-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');
      backdrop.innerHTML = `
  <div class="wb-atmosphere"></div>
  <div class="wb-mountains"><svg viewBox="0 0 1600 420" preserveAspectRatio="none"><defs><linearGradient id="vt-mt-far" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#0d1a17" stop-opacity="0"/><stop offset="55%" stop-color="#0d1a17" stop-opacity=".55"/><stop offset="100%" stop-color="#0d1a17" stop-opacity=".95"/></linearGradient><linearGradient id="vt-mt-near" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#050a09" stop-opacity=".4"/><stop offset="60%" stop-color="#050a09" stop-opacity=".95"/><stop offset="100%" stop-color="#050a09" stop-opacity="1"/></linearGradient></defs><path d="M0,300 L120,230 L210,260 L320,180 L430,220 L560,150 L680,210 L820,170 L960,220 L1100,180 L1240,240 L1380,200 L1500,250 L1600,220 L1600,420 L0,420 Z" fill="url(#vt-mt-far)"/><path d="M0,360 L100,320 L220,340 L340,290 L460,330 L590,300 L720,340 L860,310 L1000,350 L1140,310 L1280,355 L1420,320 L1540,360 L1600,340 L1600,420 L0,420 Z" fill="url(#vt-mt-near)"/></svg></div>
  <div class="wb-mist"></div>
  <div class="wb-particles"></div>`;
      document.body.insertBefore(backdrop, document.body.firstChild);
      spawnVitalityParticles(backdrop.querySelector('.wb-particles'));
    }
    if (!document.getElementById('vt-grain')) {
      const grain = document.createElement('div');
      grain.id = 'vt-grain';
      grain.setAttribute('aria-hidden', 'true');
      document.body.appendChild(grain);
    }
  }

  function spawnVitalityParticles(root) {
    if (!root) return;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const count = window.innerWidth < 640 ? 10 : 18;
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      const duration = 18 + Math.random() * 22;
      const size = 1 + Math.random() * 1.2;
      particle.style.left = (Math.random() * 100) + '%';
      particle.style.top = (60 + Math.random() * 40) + 'vh';
      particle.style.width = size + 'px';
      particle.style.height = size + 'px';
      particle.style.animationDuration = duration + 's';
      particle.style.animationDelay = (-Math.random() * duration) + 's';
      particle.style.setProperty('--dx', (Math.random() * 30 - 15) + 'px');
      particle.style.setProperty('--dy', (-(60 + Math.random() * 50)) + 'vh');
      root.appendChild(particle);
    }
  }

  const css = `
.topbar {
  position: sticky; top: 0; z-index: 40;
  display: flex; justify-content: space-between; align-items: center;
  gap: 8px;
  padding: max(12px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) 8px max(14px, env(safe-area-inset-left));
  background: rgba(0, 0, 0, 0.88);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(1.2);
  -webkit-backdrop-filter: blur(20px) saturate(1.2);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
.topbar-menu-wrap { position: relative; }
.topbar-menu-btn {
  width: 44px; height: 42px;
  display: inline-flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 5px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(255, 255, 255, 0.04);
  border-radius: 12px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.topbar-menu-btn span {
  width: 18px; height: 2px;
  border-radius: 999px;
  background: #FAFAFA;
  transition: transform 0.18s, opacity 0.18s;
}
.topbar-menu-wrap.open .topbar-menu-btn span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.topbar-menu-wrap.open .topbar-menu-btn span:nth-child(2) { opacity: 0; }
.topbar-menu-wrap.open .topbar-menu-btn span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }
.topbar-menu-panel {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: min(280px, calc(100vw - 28px));
  padding: 8px;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 16px;
  background: rgba(5, 5, 6, 0.96);
  box-shadow: 0 18px 50px rgba(0,0,0,0.45);
  backdrop-filter: blur(22px) saturate(1.2);
  -webkit-backdrop-filter: blur(22px) saturate(1.2);
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  transition: opacity 0.16s, transform 0.16s;
}
.topbar-menu-wrap.open .topbar-menu-panel {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}
.topbar-menu-link {
  display: grid;
  grid-template-columns: 28px 1fr;
  align-items: center;
  gap: 10px;
  padding: 12px 11px;
  border-radius: 10px;
  color: rgba(255,255,255,0.72);
  text-decoration: none;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.topbar-menu-link:hover,
.topbar-menu-link.active {
  color: #FAFAFA;
  background: rgba(255,255,255,0.075);
}
.topbar-menu-icon {
  width: 28px;
  text-align: center;
  font-size: 17px;
  filter: grayscale(100%) brightness(1.35);
}
.topbar-actions { display: inline-flex; align-items: stretch; gap: 8px; }
.topbar-water-wrap { display: flex; align-items: stretch; }
.topbar-water-pill {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 9px 14px;
  background: rgba(110, 231, 183, 0.04);
  border: 1px solid rgba(110, 231, 183, 0.25);
  border-right: none;
  border-radius: 12px 0 0 12px;
  text-decoration: none; color: #FAFAFA;
  -webkit-tap-highlight-color: transparent;
}
.topbar-water-pill .topbar-pill-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: #6EE7B7; flex-shrink: 0;
}
.topbar-water-pill.warn .topbar-pill-dot { background: #fbbf24; }
.topbar-water-pill.miss .topbar-pill-dot {
  background: #ff8a8a;
  animation: topbar-miss-pulse 1.6s ease-in-out infinite;
}
@keyframes topbar-miss-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.5); }
  50%      { box-shadow: 0 0 0 5px rgba(239, 68, 68, 0); }
}
.topbar-pill-count {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 13px; font-weight: 700; color: #FAFAFA;
  font-variant-numeric: tabular-nums; white-space: nowrap;
}
.topbar-water-add {
  width: 44px;
  border: 1px solid rgba(110, 231, 183, 0.28);
  background: linear-gradient(180deg, rgba(110, 231, 183, 0.28), rgba(167, 243, 208, 0.18));
  color: #FFFFFF; font-family: inherit;
  font-size: 20px; font-weight: 700; line-height: 1;
  cursor: pointer; border-radius: 0 12px 12px 0;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s, transform 0.10s;
}
.topbar-water-add:active { transform: scale(0.94); }
.topbar-water-add.flash {
  background: linear-gradient(180deg, rgba(110, 231, 183, 0.76), rgba(167, 243, 208, 0.58));
}
.topbar-finance-btn {
  display: inline-flex; align-items: center; justify-content: center;
  width: 44px; height: 42px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  background: rgba(110, 231, 183, 0.035);
  border-radius: 12px; text-decoration: none;
  -webkit-tap-highlight-color: transparent;
  transition: background 0.15s;
}
.topbar-finance-btn:hover { background: rgba(255, 255, 255, 0.08); }
.topbar-finance-icon {
  font-size: 20px; line-height: 1;
  filter: grayscale(100%) brightness(1.4); opacity: 0.85;
}
@media (max-width: 480px) {
  .topbar { padding-left: max(10px, env(safe-area-inset-left)); padding-right: max(10px, env(safe-area-inset-right)); gap: 6px; }
  .topbar-menu-panel { left: 0; }
  .topbar-water-pill { padding: 8px 11px; gap: 6px; }
  .topbar-pill-count { font-size: 12px; }
  .topbar-water-add { width: 40px; font-size: 18px; }
  .topbar-finance-btn { width: 40px; height: 38px; }
  .topbar-finance-icon { font-size: 18px; }
}
html, body { -webkit-text-size-adjust: 100%; }
@media (max-width: 768px) {
  html { touch-action: pan-y; }
  ::-webkit-scrollbar { width: 0; height: 0; display: none; }
  html, body { scrollbar-width: none; -ms-overflow-style: none; }
}
.modal-bg, .modal, .po-modal-bg, .po-modal, .wt-overlay, .wt-viewer {
  overscroll-behavior: contain;
}
body.topbar-modal-open { overflow: hidden; touch-action: none; }
@media (max-width: 480px) {
  .modal-bg, .po-modal-bg {
    padding: 0 !important;
    align-items: stretch !important;
    justify-content: stretch !important;
  }
  .modal, .po-modal {
    width: 100% !important; max-width: 100% !important;
    max-height: 100vh !important; height: 100vh !important;
    border-radius: 0 !important;
    padding-top: max(20px, env(safe-area-inset-top)) !important;
    padding-bottom: max(28px, env(safe-area-inset-bottom)) !important;
    overflow-y: auto !important; overscroll-behavior: contain;
  }
}
`;

  const topbarHtml = `
<header class="topbar" id="topbar" role="navigation" aria-label="Quick actions">
  <div class="topbar-menu-wrap" id="topbarMenuWrap">
    <button class="topbar-menu-btn" id="topbarMenuBtn" aria-label="Open navigation" aria-expanded="false" type="button">
      <span></span><span></span><span></span>
    </button>
    <nav class="topbar-menu-panel" id="topbarMenuPanel" aria-label="Main tabs">
      <a href="index.html" class="topbar-menu-link" data-page="main">
        <span class="topbar-menu-icon">&#127968;</span><span>Main</span>
      </a>
      <a href="health.html" class="topbar-menu-link" data-page="health">
        <span class="topbar-menu-icon">&#128138;</span><span>Health</span>
      </a>
      <a href="po-water.html" class="topbar-menu-link" data-page="water">
        <span class="topbar-menu-icon">&#128167;</span><span>Water</span>
      </a>
      <a href="finance.html" class="topbar-menu-link" data-page="finance">
        <span class="topbar-menu-icon">&#128202;</span><span>Finance</span>
      </a>
      <a href="gym.html" class="topbar-menu-link" data-page="fitness">
        <span class="topbar-menu-icon">&#128170;</span><span>Fitness</span>
      </a>
    </nav>
  </div>
  <div class="topbar-actions">
    <div class="topbar-water-wrap">
      <a href="health.html#water" class="topbar-water-pill" id="topbarWater" aria-label="Water progress">
        <span class="topbar-pill-dot"></span>
        <span class="topbar-pill-count" id="topbarWaterCount">0/0</span>
      </a>
      <button class="topbar-water-add" id="topbarWaterAdd" aria-label="Log one drink" type="button">+</button>
    </div>
    <a href="finance.html" class="topbar-finance-btn" id="topbarFinance" aria-label="Finance">
      <span class="topbar-finance-icon">&#128202;</span>
    </a>
  </div>
</header>`;

  function isFinancePage() {
    const p = (window.location.pathname || '').toLowerCase();
    return p.endsWith('/finance.html') || p.endsWith('finance.html');
  }
  function isEmbedded() {
    try { return window.self !== window.top; } catch (e) { return true; }
  }
  function shouldShowChrome() { return !isEmbedded(); }
  function currentPageKey() {
    const p = (window.location.pathname || '').toLowerCase();
    if (p.endsWith('finance.html')) return 'finance';
    if (p.endsWith('po-water.html')) return 'water';
    if (p.endsWith('health.html')) return 'health';
    if (p.endsWith('gym.html')) return 'fitness';
    return 'main';
  }

  function injectStyleAndHTML() {
    if (document.getElementById('topbar')) return;
    if (!shouldShowChrome()) return;
    const style = document.createElement('style');
    style.id = 'topbar-style';
    style.textContent = css;
    document.head.appendChild(style);
    const topWrap = document.createElement('div');
    topWrap.innerHTML = topbarHtml.trim();
    document.body.insertBefore(topWrap.firstChild, document.body.firstChild);
    const active = currentPageKey();
    document.querySelectorAll('.topbar-menu-link').forEach((t) => {
      t.classList.toggle('active', t.getAttribute('data-page') === active);
    });
  }

  function calendarDateKey() {
    const d = new Date();
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }
  function getWaterProgress() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state) return { done: 0, total: 0 };
    const todayKey = calendarDateKey();
    const done = (state.logs || {})[todayKey] || 0;
    const p = state.profile || { weightKg: 75 };
    const wKg = state.weightUnit === 'lb' ? (p.weightKg || 0) / 2.20462 : (p.weightKg || 0);
    const base = wKg * 35;
    const exercise = (p.activityHrsPerWeek || 0) / 7 * 500;
    const caffeine = Math.max(0, (state.caffeineMgPerDay || 0) - 200) * 1.5;
    const subs = (state.substances || []).reduce((s, x) => {
      const dose = (x && x.dose != null ? x.dose : (x && x.defaultDose)) || 0;
      return s + Math.max(0, dose * ((x && x.mlPerUnit) || 0));
    }, 0);
    let adjust = 0;
    if (p.sex === 'm') adjust += 200;
    if ((p.age || 0) >= 50) adjust += 100;
    const totalMl = base + exercise + caffeine + subs + adjust;
    let unitVol;
    if (state.unit === 'glass') unitVol = state.glassMl || 250;
    else if (state.unit === 'oz') unitVol = 30;
    else if (state.unit === 'ml') unitVol = 1;
    else unitVol = state.bottleMl || 500;
    const total = Math.max(1, Math.ceil(totalMl / unitVol));
    return { done, total };
  }
  function classifyStatus(done, total) {
    if (total === 0) return 'idle';
    if (done >= total) return 'good';
    if (done >= total * 0.5) return 'warn';
    const h = new Date().getHours();
    if (h >= 18 && done < total * 0.5) return 'miss';
    return 'warn';
  }
  function setPillStatus(pillEl, status) {
    pillEl.classList.remove('good', 'warn', 'miss');
    if (status === 'warn' || status === 'miss') pillEl.classList.add(status);
  }
  function render() {
    const waterEl = document.getElementById('topbarWater');
    if (!waterEl) return;
    const w = getWaterProgress();
    const countEl = document.getElementById('topbarWaterCount');
    if (countEl) countEl.textContent = w.total ? w.done + '/' + w.total : '0/0';
    setPillStatus(waterEl, classifyStatus(w.done, w.total));
  }

  function defaultWaterState() {
    return {
      unit: 'bottle', bottleMl: 500, glassMl: 250, weightUnit: 'kg',
      profile: { weightKg: 75, age: 25, sex: 'm', activityHrsPerWeek: 5 },
      caffeineMgPerDay: 200, substances: [], logs: {}
    };
  }
  async function pushWaterMergedToSupabase(localWater) {
    if (window.location.pathname.endsWith('/health.html') ||
        window.location.pathname.endsWith('health.html')) return;
    if (!window.supabase || !TOPBAR_SUPABASE_URL || !TOPBAR_SUPABASE_KEY) return;
    if (TOPBAR_SUPABASE_URL.indexOf('PASTE-') === 0) return;
    try {
      const supa = window.supabase.createClient(TOPBAR_SUPABASE_URL, TOPBAR_SUPABASE_KEY);
      const { data } = await supa
        .from('app_state').select('data').eq('key', 'health').maybeSingle();
      const current = (data && data.data) || {};
      const merged = Object.assign({}, current, { po_water_v1: localWater });
      await supa.from('app_state').upsert(
        { key: 'health', data: merged, updated_at: new Date().toISOString() },
        { onConflict: 'key' }
      );
    } catch (e) {}
  }
  function addWater() {
    let state = null;
    try { state = JSON.parse(localStorage.getItem('po_water_v1')); } catch (e) {}
    if (!state || typeof state !== 'object') state = defaultWaterState();
    state.logs = state.logs || {};
    const k = calendarDateKey();
    state.logs[k] = (state.logs[k] || 0) + 1;
    try { localStorage.setItem('po_water_v1', JSON.stringify(state)); } catch (e) {}
    render();
    const btn = document.getElementById('topbarWaterAdd');
    if (btn) { btn.classList.add('flash'); setTimeout(() => btn.classList.remove('flash'), 220); }
    pushWaterMergedToSupabase(state);
  }

  function wireBurgerMenu() {
    const wrap = document.getElementById('topbarMenuWrap');
    const btn = document.getElementById('topbarMenuBtn');
    if (!wrap || !btn) return;

    function setOpen(open) {
      wrap.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!wrap.classList.contains('open'));
    });
    wrap.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => setOpen(false));
    });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') setOpen(false);
    });
  }

  function blockGesture(e) { e.preventDefault(); }
  function lockGestures() {
    document.addEventListener('gesturestart', blockGesture, { passive: false });
    document.addEventListener('gesturechange', blockGesture, { passive: false });
    document.addEventListener('gestureend', blockGesture, { passive: false });
    let lastTouch = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouch <= 300) e.preventDefault();
      lastTouch = now;
    }, { passive: false });
  }
  function startModalLock() {
    const MODAL_SELECTORS = ['.modal-bg', '.po-modal-bg', '.wt-overlay', '.wt-viewer', '.wt-cam'];
    function anyOpen() {
      for (const sel of MODAL_SELECTORS) {
        const els = document.querySelectorAll(sel);
        for (const el of els) {
          if (el.classList.contains('show') || el.classList.contains('is-open')) return true;
        }
      }
      return false;
    }
    function sync() { document.body.classList.toggle('topbar-modal-open', anyOpen()); }
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'], subtree: true });
    sync();
  }

  function boot() {
    injectVitalityBackdrop();
    injectStyleAndHTML();
    wireBurgerMenu();
    const btn = document.getElementById('topbarWaterAdd');
    if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); addWater(); });
    render();
    lockGestures();
    startModalLock();
    window.addEventListener('storage', render);
    window.addEventListener('focus', render);
    document.addEventListener('visibilitychange', () => { if (!document.hidden) render(); });
    setInterval(render, 30 * 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();
