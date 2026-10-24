/**
 * NEON COACH - الهيدر العلوي وشريط الحالة
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';

export function renderHeader() {
  const state = store.getState();
  const isCoach = state.currentRole === 'coach';
  const isWorkout = window.location.hash.replace(/^#\/?/, '').split(/[/?]/)[0] === 'workout';

  return `
    <header class="app-header">
      ${isWorkout ? `<button type="button" id="workout-top-pill" class="header-workout-top" aria-label="العودة إلى أعلى صفحة التدريب" title="العودة لأعلى">
        <span dir="ltr">Top ↑</span>
      </button>` : ''}
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
  // The header is sticky on every workout screen. Unlike a floating button
  // inside the training view, this is always mounted and visible on mobile.
  const workoutTop = document.getElementById('workout-top-pill');
  if (workoutTop) {
    workoutTop.addEventListener('click', () => {
      const scrollOptions = { top: 0, behavior: 'smooth' };
      window.scrollTo(scrollOptions);
      document.getElementById('view-container')?.scrollTo?.(scrollOptions);
      document.scrollingElement?.scrollTo?.(scrollOptions);
    });
  }
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
      notificationService.showToast(' تذكير: استمر على أدائك الممتاز اليوم واشرب كفايتك من الماء!', 'info');
    });
  }
}
