/**
 * NEON COACH - الهيدر العلوي وشريط الحالة
 */

import { store } from '../state/store.js';

export function renderHeader() {
  const state = store.getState();
  const isCoach = state.currentRole === 'coach';

  return `
    <header class="app-header">
      <div class="header-brand">
        <img src="./icons/neon-cat-coach.svg" alt="NEON COACH" style="width: 34px; height: 34px;">
        <span class="header-logo-text">NEON COACH</span>
        ${state.isDemoMode ? '<span class="badge badge-demo">وضع تجريبي</span>' : ''}
      </div>

      <div class="header-actions">
        <button id="header-calendar-btn" class="btn-icon" aria-label="التقويم">
          📅
        </button>
        
        <button id="header-notif-btn" class="btn-icon" aria-label="الإشعارات">
          🔔
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

  const calendarBtn = document.getElementById('header-calendar-btn');
  if (calendarBtn) {
    calendarBtn.addEventListener('click', () => {
      window.location.hash = '#workout';
    });
  }

  const notifBtn = document.getElementById('header-notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      alert('مركز الإشعارات:\n- تذكير: موعد شرب كوب الماء القادم\n- تذكير: استمر على أدائك الممتاز اليوم!');
    });
  }
}
