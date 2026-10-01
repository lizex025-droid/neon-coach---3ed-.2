/**
 * NEON COACH - منظومة حماية الصور والوسائط الرقمية (Digital Media Protection Shield)
 * طبقات حماية متقدمة: تشفير الروابط، حظر القوائم السياقية، منع السحب، دروع الحماية الشفافة، والعلامات المائية
 */

// تخزين اسم النطاق بشكل مجزأ ومشفّر بترميز Base64 لمنع البحث النصي المباشر في الكود
const _ENC_HOST_SEG = 'aHR0cHM6Ly9wdWItMTdjNTRlMjFmZTM2NGU1ZTliMWIxOTIzY2Y2ODk2ZWMucjIuZGV2';

/**
 * فك تشفير نطاق تخزين الصور بشكل ديناميكي أثناء التشغيل فقط
 * @returns {string}
 */
export function getStorageHost() {
  try {
    if (typeof atob === 'function') {
      return atob(_ENC_HOST_SEG);
    }
  } catch {
    // Fallback
  }
  return 'https://' + ['pub-17c54e21fe364e5e9b1b1923cf6896ec', 'r2', 'dev'].join('.');
}

/**
 * توليد رابط الصورة المحمي بدلاً من كشف الرابط المباشر في ملفات البيانات
 * @param {string} key - اسم الملف أو الهاش أو الرابط
 * @returns {string}
 */
export function resolveProtectedUrl(key) {
  if (!key) return '';
  if (key.startsWith('http://') || key.startsWith('https://')) {
    return key;
  }
  const host = getStorageHost();
  const cleanKey = key.replace(/^\/+/, '');
  return `${host}/${cleanKey}`;
}

/**
 * تفعيل حراس الأمان لمنع نسخ وحفظ الصور واختصارات لوحة المفاتيح
 * @param {HTMLElement|Document} [rootElement]
 */
export function initImageProtectionGuard(rootElement = document) {
  if (!rootElement) return;

  // 1. منع القائمة السياقية (Right Click / Long Press) على حاويات الصور
  const handleContextMenu = (e) => {
    if (
      e.target.closest('.recipe-dish-preview') ||
      e.target.closest('.recipe-modal-poster-wrap') ||
      e.target.closest('.img-protection-shield') ||
      e.target.tagName === 'IMG'
    ) {
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
  };

  // 2. منع سحب وإفلات الصور (Drag & Drop)
  const handleDragStart = (e) => {
    if (
      e.target.tagName === 'IMG' ||
      e.target.closest('.recipe-dish-preview') ||
      e.target.closest('.recipe-modal-poster-wrap')
    ) {
      e.preventDefault();
      return false;
    }
  };

  // 3. منع اختصارات لوحة المفاتيح لحفظ أو طباعة الصفحة (Ctrl+S, Ctrl+P, Cmd+S, Cmd+P)
  const handleKeyDown = (e) => {
    const isCtrlOrMeta = e.ctrlKey || e.metaKey;
    if (isCtrlOrMeta && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
      const modalOpen = document.getElementById('recipe-detail-modal')?.classList.contains('open');
      const isRecipesView = document.querySelector('.recipes-view-container');
      if (modalOpen || isRecipesView) {
        e.preventDefault();
        return false;
      }
    }
  };

  rootElement.addEventListener('contextmenu', handleContextMenu, true);
  rootElement.addEventListener('dragstart', handleDragStart, true);
  window.addEventListener('keydown', handleKeyDown, true);
}
