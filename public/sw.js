// NEON COACH - Service Worker (Offline-First Cache for App Shell)
const CACHE_NAME = 'neon-coach-v1.0.2';

const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/workout-neon-180.png',
  './icons/workout-neon-192.png',
  './icons/workout-neon-512.png',
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

// استراتيجية الاستجابة: Stale-While-Revalidate للأصول الثابتة والخطوط والأيقونات
// تنبيه أمان وخصوصية: لا يتم تخزين استجابات تحوي بيانات صحية أو صور تقدم مستخدم أو اتصالات Supabase
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // استبعاد طلبات Supabase والـ API والذكاء الاصطناعي من الكاش لحماية الخصوصية وحداثة البيانات
  if (
    url.pathname.includes('/api/') ||
    url.hostname.includes('supabase.co') ||
    url.origin.includes('generativelanguage') ||
    url.origin.includes('openai')
  ) {
    return; // تمرير مباشر للشبكة دون تخزين
  }

  // للأصول الثابتة والخطوط والأيقونات وصفحات التطبيق
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // إطلاق طلب شبكي في الخلفية لتحديث الكاش للزيارات القادمة
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (
          networkResponse &&
          (networkResponse.status === 200 || networkResponse.type === 'opaque') &&
          (networkResponse.type === 'basic' || networkResponse.type === 'cors' || networkResponse.type === 'opaque')
        ) {
          // لا نخزن الصور المرفوعة من قبل المستخدم blob: أو بيانات التقدم الحساسة
          if (!event.request.url.startsWith('blob:') && !event.request.url.startsWith('data:')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      // استجابة فورية من الكاش إن وجدت (0ms)، وإلا استخدام استجابة الشبكة
      return cachedResponse || fetchPromise;
    }).catch(() => {
      // إذا كان الجهاز offline وطلب صفحة html، أعد index.html من الكاش
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});
