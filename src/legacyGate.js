import { authService } from './services/authService.js';
import { accountStorage } from './services/accountStorage.js';
import { setupSyncStatus } from './services/syncStatus.js';
import { installSafeHTML } from './utils/safeHtml.js';
import { renderBottomNav } from './components/navBar.js';
import { installNeonIcons } from './utils/neonIcons.js';
import './styles/responsive.css';

async function initializeLegacy() {
await authService.ready;
if (!authService.isAuthenticated()) {
  location.replace('/#auth');
} else {
  // The Supabase SDK captured the real session storage when it was constructed.
  // Legacy tools now see only the current account's auxiliary data.
  Object.defineProperty(window, 'localStorage', { configurable: true, value: accountStorage });
  Object.defineProperty(window, 'sessionStorage', { configurable: true, value: accountStorage });
  installSafeHTML();
  setupSyncStatus();
  authService.onAuthStateChange(() => { if (!authService.isAuthenticated()) location.replace('/#auth'); });
  const scripts = [...document.querySelectorAll('script[type="text/neon-blocked"]')];
  for (const original of scripts) {
    const script = document.createElement('script');
    for (const { name, value } of original.attributes) if (!['type', 'data-original-type'].includes(name)) script.setAttribute(name, value);
    if (original.dataset.originalType) script.type = original.dataset.originalType;
    script.textContent = original.textContent;
    if (script.src) {
      script.async = false;
      await new Promise(resolve => { script.onload = resolve; script.onerror = resolve; original.replaceWith(script); });
    } else original.replaceWith(script);
  }
  document.getElementById('account-gate-style')?.remove();
  // Older standalone tools register startup listeners while their scripts run.
  document.dispatchEvent(new Event('DOMContentLoaded'));
  window.dispatchEvent(new Event('load'));
  installNeonIcons();
  if (document.querySelector('.app-bottom-nav')) {
    document.querySelectorAll('.app-bottom-nav').forEach(nav => nav.remove());
    document.body.insertAdjacentHTML('beforeend', renderBottomNav('workout', true));
  }
}

}
initializeLegacy().catch(() => location.replace('/#auth'));
