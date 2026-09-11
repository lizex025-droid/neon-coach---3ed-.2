/**
 * NEON COACH - موجه الصفحات (Single Page Application Hash Router)
 * يتعامل بسلاسة مع التبديل بين الشاشات مع حفظ الحالة وتحديث شريط التنقل
 */

import { renderHeader, bindHeaderEvents } from '../components/header.js';
import { renderBottomNav } from '../components/navBar.js';
import { renderAiDrawer, bindAiDrawerEvents } from '../components/aiDrawer.js';

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

export const ROUTES = {
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

// تعطيل استعادة المتصفح التلقائية لموضع التمرير لضمان بدء كل تابة دائماً من أعلى الصفحة
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export class Router {
  constructor(appElement) {
    this.appElement = appElement;
    this.currentRoute = '';
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // ضمان بدء كل تابة وشاشة من أعلى الصفحة (من فوق لتحت) عند النقر على أي تابة أو زر تنقل
    document.addEventListener('click', (e) => {
      const navTarget = e.target.closest('a[href^="#"], .nav-item, .btn-icon, .client-tab-btn, .ws-view-tab, .auth-tab-btn');
      if (navTarget) {
        this.scrollToTop();
      }
    });

    // إعادة رسم الشاشة تلقائياً عند تغير الحالة المركزية
    store.subscribe(() => {
      this.refreshCurrentView();
    });
  }

  async init() {
    this.checkInitialAccess();
  }

  checkInitialAccess() {
    const hash = window.location.hash || '';
    const profile = store.getState()?.userProfile;
    const hasCompletedOnboarding = profile?.onboardingCompleted || profile?.onboarding_completed;
    const rawHash = hash.replace(/^#\/?/, '').split('?')[0];

    // توجيه تلقائي: البدء بشاشة الأسئلة (الاستبيان) بدون طلب تسجيل الدخول إطلاقاً
    if (!hasCompletedOnboarding) {
      if (rawHash !== 'questionnaire') {
        window.location.hash = '#questionnaire';
        return;
      }
    } else {
      // إذا كان قد أكمل الاستبيان ودخل بدون مسار محدد أو حاول طلب صفحة المصادقة
      if (!rawHash || rawHash === 'auth') {
        window.location.hash = '#today';
        return;
      }
    }

    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash || '';
    const rawHash = hash.replace(/^#\/?/, '') || '';
    const routeKey = rawHash.split('?')[0];

    const profile = store.getState()?.userProfile;
    const hasCompletedOnboarding = profile?.onboardingCompleted || profile?.onboarding_completed;

    // توجيه المستخدم الجديد إلى شاشة الأسئلة
    if (!hasCompletedOnboarding && routeKey !== 'questionnaire') {
      window.location.hash = '#questionnaire';
      return;
    }

    // إبعاد المستخدم عن مسار المصادقة أو مسار الـ 40 يوم المحذوف
    if (routeKey === 'auth' || routeKey === 'forty-day') {
      window.location.hash = hasCompletedOnboarding ? '#today' : '#questionnaire';
      return;
    }

    const defaultRoute = hasCompletedOnboarding ? 'today' : 'questionnaire';
    const effectiveKey = ROUTES[routeKey] ? routeKey : defaultRoute;
    const route = ROUTES[effectiveKey];
    this.currentRoute = effectiveKey;

    this.renderRoute(route, effectiveKey);
  }

  scrollToTop() {
    const performScroll = () => {
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
      const appRoot = document.getElementById('app');
      if (appRoot) appRoot.scrollTop = 0;
    };

    performScroll();
    requestAnimationFrame(performScroll);
    setTimeout(performScroll, 10);
    setTimeout(performScroll, 60);
  }

  renderRoute(route, routeKey) {
    // تنظيف أي نوافذ منبثقة ملحقة بـ body مباشرة قبل التبديل
    document.querySelectorAll('body > .ai-modal-overlay').forEach(el => el.remove());

    let html = '';

    if (route.showHeader) {
      html += renderHeader();
    }

    html += `<main id="view-container" class="view-fade-slide" style="flex: 1;">${route.render()}</main>`;

    if (route.showNav) {
      html += renderBottomNav(routeKey);
    }

    this.appElement.innerHTML = html;

    // بدء الشاشة فوراً من أعلى الصفحة قبل وبعد ربط الأحداث
    this.scrollToTop();

    // ربط الأحداث
    if (route.showHeader) bindHeaderEvents();
    if (route.bind) route.bind();

    this.scrollToTop();
  }

  refreshCurrentView() {
    // تنظيف أي نوافذ منبثقة ملحقة بـ body مباشرة قبل إعادة الرسم
    document.querySelectorAll('body > .ai-modal-overlay').forEach(el => el.remove());

    const route = ROUTES[this.currentRoute] || ROUTES['today'];
    const container = document.getElementById('view-container');
    if (container) {
      container.innerHTML = route.render();
      if (route.bind) route.bind();
    }
  }
}
