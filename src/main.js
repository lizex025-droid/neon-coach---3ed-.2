/**
 * NEON COACH - نقطة انطلاق التطبيق الرئيسية
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/components.css';

import { Router } from './router/router.js';
import { setupTrainingLoadingInterceptors } from './utils/splash.js';
import { initNeonParticles } from './utils/particles.js';
import { initGlobalVoiceTrigger } from './components/voice/voiceTriggerBtn.js';

// تشغيل خلفية الجسيمات والنقاط الخضراء النيونية الطائرة
initNeonParticles();

// تفعيل رصد أزرار التدريب لعرض شاشة التحميل فوراً
setupTrainingLoadingInterceptors();

// تهيئة وتشغيل موجه الصفحات
function initApp() {
  const appElement = document.getElementById('app');
  if (appElement) {
    const router = new Router(appElement);
    router.init().finally(() => {
      // إخفاء شاشة التحميل الأولية الذكية بسلاسة فور جاهزية الواجهة الأولى
      if (typeof window.dismissNeonSplash === 'function') {
        window.dismissNeonSplash();
      }
      // تفعيل زر الاستماع الصوتي العام لـ NEON ACTION AGENT
      initGlobalVoiceTrigger();
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

  // تسجيل Service Worker للعمل كـ PWA Offline-First
  if ('serviceWorker' in navigator && !window.location.hostname.includes('localhost123')) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('NEON COACH PWA ServiceWorker مسجل بنجاح:', reg.scope);
      })
      .catch(err => {
        console.warn('تعذر تسجيل ServiceWorker:', err);
      });
  }

  // التقاط حدث تثبيت PWA على الجهاز
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('التطبيق جاهز للتثبيت كـ PWA.');
  });

