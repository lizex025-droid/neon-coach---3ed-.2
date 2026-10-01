// NEON COACH - Service Worker (Offline-First Cache for App Shell & Lightning Fast Images)
const CACHE_NAME = 'neon-coach-v1.2.0';
const IMAGES_CACHE_NAME = 'neon-coach-images-v1';
const NAVIGATION_FALLBACK = './index.html';

const STATIC_ASSETS = [
  NAVIGATION_FALLBACK,
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
          if (key !== CACHE_NAME && key !== IMAGES_CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية الاستجابة: Stale-While-Revalidate للأصول الثابتة والخطوط والأيقونات
// تنبيه أمان وخصوصية: لا يتم تخزين استجابات تحوي بيانات صحية أو صور تقدم مستخدم أو اتصالات Supabase
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

const getNavigationResponse = async (request) => {
  try {
    // A stale app shell can load old JavaScript and leave the URL and tab out of sync.
    const response = await fetch(request, { cache: 'no-store' });

    if (response?.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(NAVIGATION_FALLBACK, response.clone());
    }

    return response;
  } catch (error) {
    const cachedResponse = await caches.match(NAVIGATION_FALLBACK);
    return cachedResponse || Response.error();
  }
};

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== 'GET') {
    return;
  }

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
  // Fetch documents from the network first so a deployment cannot be hidden
  // by an older cached index.html. The cached copy remains available offline.
  if (event.request.mode === 'navigate') {
    event.respondWith(getNavigationResponse(event.request));
    return;
  }

  // 1. استراتيجية Cache-First فائقة السرعة للصور الثابتة وصور الوجبات والتمارين
  const isImage = event.request.destination === 'image' ||
                  /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname) ||
                  url.hostname.includes('r2.dev');

  if (isImage) {
    // لا نخزن بيانات المستخدم الحساسة blob: أو data:
    if (event.request.url.startsWith('blob:') || event.request.url.startsWith('data:')) {
      return;
    }

    event.respondWith(
      caches.open(IMAGES_CACHE_NAME).then(async (imgCache) => {
        const cached = await imgCache.match(event.request);
        if (cached) {
          return cached; // كاش فوري فائق السرعة 0ms بدون استهلاك الشبكة أو البطارية
        }

        try {
          const networkResponse = await fetch(event.request);
          if (
            networkResponse &&
            (networkResponse.status === 200 || networkResponse.type === 'opaque')
          ) {
            imgCache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        } catch (err) {
          return cached || Response.error();
        }
      })
    );
    return;
  }

  // 2. باقي الأصول الثابتة: Stale-While-Revalidate
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
