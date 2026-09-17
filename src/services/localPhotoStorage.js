/**
 * NEON COACH - خدمة تخزين صور التقدم محلياً على الجهاز (Local Photo Storage)
 * تستخدم IndexedDB لتخزين الصور بالكامل على جهاز المستخدم دون الاعتماد على السحابة
 * مع ضغط الصور تلقائياً عبر الكانفاس لتسريع الأداء وتوفير المساحة
 */

const DB_NAME = 'neon_coach_photos_db';
const DB_VERSION = 1;
const STORE_NAME = 'photos';
const LS_FALLBACK_KEY = 'po_coach_photos';

let dbPromise = null;

function getDb() {
  if (typeof window === 'undefined' || !window.indexedDB) {
    return Promise.resolve(null);
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve) => {
      try {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
          const db = e.target.result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('dateKey', 'dateKey', { unique: false });
            store.createIndex('createdAt', 'createdAt', { unique: false });
          }
        };
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => {
          console.warn('تعذر فتح IndexedDB، سيتم استخدام التخزين البديل');
          resolve(null);
        };
      } catch (err) {
        console.warn('خطأ في تهيئة IndexedDB:', err);
        resolve(null);
      }
    });
  }
  return dbPromise;
}

/**
 * ضغط صورة Base64 إلى أبعاد وجودة مناسبة للتخزين السريع على الهاتف
 */
export function compressPhotoDataUrl(dataUrl, maxDim = 1080, quality = 0.75) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.resolve(dataUrl);
  }
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.onload = () => {
        let w = img.naturalWidth || img.width;
        let h = img.naturalHeight || img.height;
        if (w > maxDim || h > maxDim) {
          if (w >= h) {
            h = Math.round(h * (maxDim / w));
            w = maxDim;
          } else {
            w = Math.round(w * (maxDim / h));
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(dataUrl);
        }
        ctx.drawImage(img, 0, 0, w, h);
        try {
          resolve(canvas.toDataURL('image/jpeg', quality));
        } catch {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    } catch {
      resolve(dataUrl);
    }
  });
}

let inMemoryPhotos = [];

/**
 * قراءة الصور الاحتياطية من localStorage مع الترحيل التلقائي
 */
function getLocalStoragePhotos() {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(LS_FALLBACK_KEY);
      if (raw) {
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr : [];
      }
    }
  } catch {}
  return [...inMemoryPhotos];
}

function saveLocalStoragePhotos(arr) {
  inMemoryPhotos = Array.isArray(arr) ? [...arr] : [];
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LS_FALLBACK_KEY, JSON.stringify(arr));
    }
  } catch {}
}

export const localPhotoStorage = {
  /**
   * استرجاع جميع الصور المخزنة محلياً مرتبة من الأحدث إلى الأقدم
   */
  async getAllPhotos() {
    const db = await getDb();
    if (!db) {
      const photos = getLocalStoragePhotos();
      return photos.sort((a, b) => (b.dateKey || '').localeCompare(a.dateKey || ''));
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = async () => {
          let list = req.result || [];

          // ترحيل أي صور سابقة من localStorage إذا كانت قاعدة بيانات IndexedDB فارغة
          if (list.length === 0) {
            const lsPhotos = getLocalStoragePhotos();
            if (lsPhotos.length > 0) {
              for (const p of lsPhotos) {
                await this.savePhoto(p);
              }
              list = lsPhotos;
            }
          }

          list.sort((a, b) => {
            const dateCmp = (b.dateKey || '').localeCompare(a.dateKey || '');
            if (dateCmp !== 0) return dateCmp;
            return (b.createdAt || 0) - (a.createdAt || 0);
          });
          resolve(list);
        };

        req.onerror = () => {
          resolve(getLocalStoragePhotos());
        };
      } catch {
        resolve(getLocalStoragePhotos());
      }
    });
  },

  /**
   * حفظ صورة جديدة محلياً على الجهاز
   */
  async savePhoto({ id, dataUrl, dateKey, weight }) {
    const photoId = id || ('p' + Date.now() + '_' + Math.random().toString(36).slice(2, 7));
    const compressedUrl = await compressPhotoDataUrl(dataUrl, 1080, 0.75);

    const entry = {
      id: photoId,
      dataUrl: compressedUrl,
      dateKey: dateKey || new Date().toISOString().slice(0, 10),
      weight: weight || '-',
      createdAt: Date.now()
    };

    const db = await getDb();
    if (db) {
      await new Promise((resolve, reject) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.put(entry);
          req.onsuccess = () => resolve(entry);
          req.onerror = (e) => reject(e);
        } catch (err) {
          reject(err);
        }
      }).catch(async () => {
        // ضغط إضافي عند الحاجة
        entry.dataUrl = await compressPhotoDataUrl(dataUrl, 800, 0.6);
        const tx = db.transaction(STORE_NAME, 'readwrite');
        tx.objectStore(STORE_NAME).put(entry);
      });
    }

    // مزامنة احتياطية مع localStorage (مع تقليل الحجم لتفادي حد الـ 5MB)
    try {
      const current = getLocalStoragePhotos();
      const existingIdx = current.findIndex(p => p.id === photoId);
      if (existingIdx !== -1) {
        current[existingIdx] = entry;
      } else {
        current.unshift(entry);
      }
      saveLocalStoragePhotos(current.slice(0, 30));
    } catch {}

    return entry;
  },

  /**
   * حذف صورة بواسطة المعرف
   */
  async deletePhoto(id) {
    if (!id) return;
    const db = await getDb();
    if (db) {
      await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          const req = store.delete(id);
          req.onsuccess = () => resolve();
          req.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    }

    const current = getLocalStoragePhotos().filter(p => p.id !== id);
    saveLocalStoragePhotos(current);
  },

  /**
   * مسح جميع الصور المخزنة
   */
  async clearAllPhotos() {
    const db = await getDb();
    if (db) {
      await new Promise((resolve) => {
        try {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          const store = tx.objectStore(STORE_NAME);
          store.clear();
          resolve();
        } catch {
          resolve();
        }
      });
    }
    saveLocalStoragePhotos([]);
  }
};
