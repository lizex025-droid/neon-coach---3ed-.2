/**
 * NEON COACH - موجه الصفحات (Single Page Application Hash Router)
 * يتعامل بسلاسة مع التبديل بين الشاشات مع حفظ الحالة وتحديث شريط التنقل
 */

import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderBottomNav } from '../components/navBar.js';
import { renderAiDrawer, bindAiDrawerEvents } from '../components/aiDrawer.js';

import { renderAuthView, bindAuthViewEvents } from '../views/authView.js';
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
import { renderFortyDayView, bindFortyDayEvents } from '../views/fortyDayView.js';
import { renderProfileView, bindProfileEvents } from '../views/profileView.js';
import { renderNeonAiView, bindNeonAiViewEvents } from '../views/neonAiView.js';

import { store } from '../state/store.js';

export const ROUTES = {
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
  'forty-day': { render: renderFortyDayView, bind: bindFortyDayEvents, showNav: true, showHeader: true },
  profile: { render: renderProfileView, bind: bindProfileEvents, showNav: true, showHeader: true }
};

export class Router {
  constructor(appElement) {
    this.appElement = appElement;
    this.currentRoute = '';
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // إعادة رسم الشاشة تلقائياً عند تغير الحالة المركزية
    store.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  init() {
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#/') {
      window.location.hash = '#today';
    } else {
      this.handleRoute();
    }
  }

  handleRoute() {
    const rawHash = window.location.hash.replace(/^#\/?/, '') || 'today';
    const routeKey = rawHash.split('?')[0];

    const route = ROUTES[routeKey] || ROUTES['today'];
    this.currentRoute = routeKey;

    this.renderRoute(route, routeKey);
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
    const route = ROUTES[this.currentRoute] || ROUTES['today'];
    const container = document.getElementById('view-container');
    if (container) {
      container.innerHTML = route.render();
      if (route.bind) route.bind();
    }
  }
}
