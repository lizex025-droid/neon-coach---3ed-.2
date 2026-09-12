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
    try {
      const router = new Router(appElement);
      router.init()
        .then(() => {
          // إخفاء شاشة التحميل الأولية الذكية بسلاسة فور جاهزية الواجهة الأولى
          if (typeof window.dismissNeonSplash === 'function') {
            window.dismissNeonSplash();
          }
          // تفعيل زر الاستماع الصوتي العام لـ NEON ACTION AGENT
          initGlobalVoiceTrigger();
        })
        .catch(err => {
          console.error('فشل تحميل الصفحة الأولى:', err);
          if (typeof window.dismissNeonSplash === 'function') {
            window.dismissNeonSplash();
          }
        });
    } catch (err) {
      console.error('خطأ أثناء تهيئة التطبيق:', err);
      if (typeof window.dismissNeonSplash === 'function') {
        window.dismissNeonSplash();
      }
    }
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// إدارة Service Worker لتجنب تعليق الكاش والشاشات البيضاء في بيئة التطوير المحلي
if ('serviceWorker' in navigator) {
  const isDevOrLocal = import.meta.env.DEV || 
                       window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' || 
                       window.location.hostname.startsWith('192.168.');
  if (isDevOrLocal) {
    // إلغاء تسجيل أي Service Worker قديم لتفادي كاش الملفات أثناء التطوير المحلي
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then(names => {
        for (const name of names) caches.delete(name);
      });
    }
  } else {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => {
        console.log('NEON COACH PWA ServiceWorker مسجل بنجاح:', reg.scope);
      })
      .catch(err => {
        console.warn('تعذر تسجيل ServiceWorker:', err);
      });
  }
}

// التقاط حدث تثبيت PWA على الجهاز
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  console.log('التطبيق جاهز للتثبيت كـ PWA.');
});

