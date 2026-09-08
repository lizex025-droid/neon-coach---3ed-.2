// NEON COACH - Service Worker (Offline-First Cache for App Shell)
const CACHE_NAME = 'neon-coach-v1.0.0';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
  './icons/neon-cat-coach.svg',
  './icons/neon-cat-scale.svg'
];

// تثبيت Service Worker وتخزين أصول التطبيق الثابتة فقط
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// تفعيل وتنظيف الـ caches القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية الاستجابة: Network First مع العودة للـ Cache للأصول الثابتة
// تنبيه أمان وخصوصية: لا يتم تخزين أي استجابات تحوي بيانات صحية أو صور تقدم مستخدم
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // استبعاد طلبات API أو استجابات الذكاء الاصطناعي أو البيانات الحساسة من الكاش
  if (url.pathname.includes('/api/') || url.origin.includes('generativelanguage') || url.origin.includes('openai')) {
    return; // تمرير مباشر للشبكة دون تخزين
  }

  // للأصول الثابتة
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // تحديث بالخلفية
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        // لا نخزن الصور المرفوعة من قبل المستخدم blob: أو بيانات التقدم
        if (!event.request.url.startsWith('blob:') && !event.request.url.startsWith('data:')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // إذا كان الجهاز offline وطلب صفحة html، أعد index.html من الكاش
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
