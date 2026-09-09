/**
 * NEON COACH - موجه الصفحات (Single Page Application Hash Router)
 * يتعامل بسلاسة مع التبديل بين الشاشات مع حفظ الحالة وتحديث شريط التنقل
 */

import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderBottomNav } from '../components/navBar.js';
import { renderAiDrawer, bindAiDrawerEvents } from '../components/aiDrawer.js';

import { renderAuthView, bindAuthViewEvents, renderResetPasswordView, bindResetPasswordEvents } from '../views/authView.js';
import { renderQuestionnaireView, bindQuestionnaireEvents } from '../views/questionnaireView.js';
import { renderTodayView, bindTodayViewEvents } from '../views/todayView.js';
import { renderWorkoutListView, bindWorkoutListEvents } from '../views/workoutListView.js';
import { renderWorkoutSessionView, bindWorkoutSessionEvents } from '../views/workoutSessionView.js';
import { renderNutritionView, bindNutritionEvents } from '../views/nutritionView.js';
import { renderMealLogView, bindMealLogEvents } from '../views/mealLogView.js';
import { renderWaterSuppsView, bindWaterSuppsEvents } from '../views/waterSuppsView.js';
import { renderWeeklyCheckinView, bindWeeklyCheckinEvents } from '../views/weeklyCheckinView.js';
import { renderProgressReportView, bindProgressReportEvents } from '../views/progressReportView.js';
import { renderCoachDashboardView, bindCoachDashboardEvents } from '../views/coachDashboardView.js';
import { renderShoppingListView, bindShoppingListEvents } from '../views/shoppingListView.js';
import { renderProfileView, bindProfileEvents } from '../views/profileView.js';
import { renderNeonAiView, bindNeonAiViewEvents } from '../views/neonAiView.js';

import { store } from '../state/store.js';
import { authService } from '../services/authService.js';
import { timerService } from '../services/timerService.js';

export const ROUTES = {
  'reset-password': { render: renderResetPasswordView, bind: bindResetPasswordEvents, showNav: false, showHeader: false },
  auth: { render: renderAuthView, bind: bindAuthViewEvents, showNav: false, showHeader: false },
  questionnaire: { render: renderQuestionnaireView, bind: bindQuestionnaireEvents, showNav: false, showHeader: false },
  today: { render: renderTodayView, bind: bindTodayViewEvents, showNav: true, showHeader: true },
  workout: { render: renderWorkoutListView, bind: bindWorkoutListEvents, showNav: true, showHeader: true },
  'workout-session': { render: renderWorkoutSessionView, bind: bindWorkoutSessionEvents, showNav: false, showHeader: false },
  nutrition: { render: renderNutritionView, bind: bindNutritionEvents, showNav: true, showHeader: true },
  'neon-ai': { render: renderNeonAiView, bind: bindNeonAiViewEvents, showNav: true, showHeader: true },
  'meal-log': { render: renderMealLogView, bind: bindMealLogEvents, showNav: false, showHeader: true },
  'water-supps': { render: renderWaterSuppsView, bind: bindWaterSuppsEvents, showNav: true, showHeader: true },
  checkin: { render: renderWeeklyCheckinView, bind: bindWeeklyCheckinEvents, showNav: true, showHeader: true },
  progress: { render: renderProgressReportView, bind: bindProgressReportEvents, showNav: true, showHeader: true },
  coach: { render: renderCoachDashboardView, bind: bindCoachDashboardEvents, showNav: true, showHeader: true },
  'shopping-list': { render: renderShoppingListView, bind: bindShoppingListEvents, showNav: true, showHeader: true },
  profile: { render: renderProfileView, bind: bindProfileEvents, showNav: true, showHeader: true }
};

export class Router {
  constructor(appElement) {
    this.appElement = appElement;
    this.currentRoute = '';
    this.ready = false;
    window.addEventListener('hashchange', () => { if (this.ready) this.handleRoute(); });
    
    // إعادة رسم الشاشة تلقائياً عند تغير الحالة المركزية
    store.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  async init() {
    await authService.ready;
    this.ready = true;
    authService.onAuthStateChange(() => this.handleRoute());
    this.handleRoute();
  }

  handleRoute() {
    let routeKey = location.hash.replace(/^#\/?/, '').split('?')[0];
    if (routeKey === 'forty-day') routeKey = 'workout';
    const isAuth = authService.isAuthenticated();
    const completed = !!store.getState().userProfile?.onboardingCompleted;
    if (!isAuth) routeKey = 'auth';
    else if (authService.recovery) routeKey = 'reset-password';
    else if (!completed && routeKey !== 'reset-password') routeKey = 'questionnaire';
    else if (!ROUTES[routeKey] || routeKey === 'auth') routeKey = 'today';
    if (routeKey === 'coach' && authService.getCurrentUser()?.role !== 'coach') routeKey = 'today';
    const owner = authService.getCurrentUser()?.id || null;
    if (this.currentRoute === routeKey && this.owner === owner) return;
    this.owner = owner;
    if (routeKey !== 'workout-session') {
      timerService.stopSessionTimer();
      timerService.stopRestTimer();
    }
    if (location.hash !== '#' + routeKey) history.replaceState(null, '', '#' + routeKey);
    this.currentRoute = routeKey;
    this.renderRoute(ROUTES[routeKey], routeKey);
  }

  scrollToTop() {
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const container = document.getElementById('view-container');
    if (container) container.scrollTop = 0;
    if (this.appElement) this.appElement.scrollTop = 0;
  }

  renderRoute(route, routeKey) {
    document.querySelectorAll('[data-route-modal]').forEach(modal => modal.remove());
    let html = '';

    if (route.showHeader) {
      html += renderHeader();
    }

    html += `<main id="view-container" class="view-fade-slide" style="flex: 1;">${route.render()}</main>`;

    if (route.showNav) {
      html += renderBottomNav(routeKey);
    }

    this.appElement.innerHTML = html;

    // ربط الأحداث
    if (route.showHeader) bindHeaderEvents();
    if (route.bind) route.bind();

    this.scrollToTop();
  }

  refreshCurrentView() {
    if (!this.currentRoute) return;
    if (!authService.isAuthenticated() && this.currentRoute !== 'auth') { this.handleRoute(); return; }
    if (this.currentRoute === 'auth' || this.currentRoute === 'questionnaire') return;
    if (document.querySelector('.ai-modal-overlay.open, [role="dialog"][open]')) return;
    if (document.activeElement?.matches('input,textarea,select,[role="slider"]')) return;
    const route = ROUTES[this.currentRoute];
    const container = document.getElementById('view-container');
    if (container && route) {
      container.innerHTML = route.render();
      route.bind?.();
    }
  }
}
