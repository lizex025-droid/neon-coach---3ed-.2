import { installSafeHTML } from './utils/safeHtml.js';
import { setupSyncStatus } from './services/syncStatus.js';
installSafeHTML();
/**
 * NEON COACH - نقطة انطلاق التطبيق الرئيسية
 */

import './styles/variables.css';
import './styles/reset.css';
import './styles/base.css';
import './styles/components.css';
import './styles/responsive.css';

import { Router } from './router/router.js';
import { setupTrainingLoadingInterceptors } from './utils/splash.js';
import { initNeonParticles } from './utils/particles.js';
import { installNeonIcons } from './utils/neonIcons.js';

// تشغيل خلفية الجسيمات والنقاط الخضراء النيونية الطائرة
initNeonParticles();

// تفعيل رصد أزرار التدريب لعرض شاشة التحميل فوراً
setupTrainingLoadingInterceptors();

// تهيئة وتشغيل موجه الصفحات
document.addEventListener('DOMContentLoaded', async () => {
  installNeonIcons();
  setupSyncStatus();
  const appElement = document.getElementById('app');
  if (appElement) {
    const router = new Router(appElement);
    await router.init();

    // إخفاء شاشة التحميل الأولية الذكية بسلاسة فور تحميل الواجهة
    if (typeof window.dismissNeonSplash === 'function') {
      window.dismissNeonSplash();
    }
  }

  // تسجيل Service Worker للعمل كـ PWA Offline-First
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
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
});
