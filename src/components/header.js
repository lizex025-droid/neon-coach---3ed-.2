/**
 * NEON COACH - الهيدر العلوي وشريط الحالة
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';

export function renderHeader() {
  const state = store.getState();
  const isCoach = state.currentRole === 'coach';

  return `
    <header class="app-header">
      <div class="header-brand">
        <img src="./icons/neon-cat-coach.svg" alt="NEON COACH" style="width: 34px; height: 34px;">
        <span class="header-logo-text">NEON COACH</span>
      </div>

      <div class="header-actions">
        <button id="header-notif-btn" class="btn-icon" aria-label="الإشعارات" title="الإشعارات والتنبيهات">
          ${neonIcon('bell', 22)}
        </button>
      </div>
    </header>
  `;
}

export function bindHeaderEvents() {
  const roleBtn = document.getElementById('role-toggle-btn');
  if (roleBtn) {
    roleBtn.addEventListener('click', () => {
      const currentRole = store.getState().currentRole;
      const newRole = currentRole === 'client' ? 'coach' : 'client';
      store.setRole(newRole);
      window.location.hash = newRole === 'coach' ? '#coach' : '#today';
    });
  }

  const notifBtn = document.getElementById('header-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      notificationService.showToast('🔔 تذكير: استمر على أدائك الممتاز اليوم واشرب كفايتك من الماء!', 'info');
    });
  }
}
