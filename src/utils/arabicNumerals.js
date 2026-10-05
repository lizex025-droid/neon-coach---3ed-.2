/**
 * NEON COACH - معالج ومحول الأرقام العربية والفارسية التلقائي
 * Arabic & Eastern Numerals Auto-Recognition & Conversion Utility
 *
 * يتيح للمستخدمين إدخال الأرقام باللوحة العربية (٠-٩) أو الفارسية (۰-۹) والفواصل العشرية (٫)
 * في أي حقل أو شاشة داخل التطبيق، ويقوم بتحويلها فورياً والتعرف عليها دون إجبار على التبديل للإنجليزية.
 */

const STORAGE_KEY = 'neon_arabic_numerals';
const ARABIC_DIGITS_REGEX = /[٠-٩۰-۹٫]/;
let memoryFallback = null;

/**
 * فحص ما إذا كان خيار التعرف على الأرقام العربية مفعلاً (مفعل افتراضياً)
 */
export function isArabicNumeralsEnabled() {
  try {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY);
      return val !== 'false';
    }
  } catch (_) {}
  return memoryFallback !== false;
}

/**
 * تعديل تفضيل التعرف على الأرقام العربية
 */
export function setArabicNumeralsEnabled(enabled) {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    }
  } catch (_) {}
  memoryFallback = Boolean(enabled);
}

/**
 * تحويل الأرقام العربية والفارسية والفواصل العشرية إلى أرقام غربية قياسية
 * @param {string|number} text
 * @param {boolean} isNumericOnly إذا كان الحقل مخصصاً للأرقام فقط، يتم تحويل الفواصل (،) إلى (.) أيضاً
 * @returns {string}
 */
export function normalizeArabicNumerals(text, isNumericOnly = false) {
  if (typeof text !== 'string') {
    if (text === null || text === undefined) return '';
    text = String(text);
  }
  if (!text) return '';

  let res = text
    .normalize('NFKC')
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/٫/g, '.');

  if (isNumericOnly) {
    res = res.replace(/،/g, '.');
  } else {
    // إذا كانت الفاصلة محاطة بأرقام مثل ٧٥،٥ أو 75،5 تحول إلى نقطة عشرية
    res = res.replace(/(\d)[،,](?=\d)/g, '$1.').replace(/^[،,](\d)/g, '.$1');
  }

  return res;
}

/**
 * تحويل نص يحتوي على أرقام عربية إلى رقم عشري float بأمان
 */
export function parseArabicFloat(val, fallback = NaN) {
  if (val === '' || val == null) return fallback;
  const normalized = normalizeArabicNumerals(val, true);
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * تحويل نص يحتوي على أرقام عربية إلى رقم صحيح int بأمان
 */
export function parseArabicInt(val, radix = 10, fallback = NaN) {
  if (val === '' || val == null) return fallback;
  const normalized = normalizeArabicNumerals(val, true);
  const n = parseInt(normalized, radix);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * التحقق مما إذا كان حقل الإدخال مخصصاً للأرقام
 */
function isNumericInput(target) {
  if (!target) return false;
  if (target.type === 'number') return true;
  if (target.inputMode === 'decimal' || target.inputMode === 'numeric') return true;
  if (target.hasAttribute('step') || target.hasAttribute('min') || target.hasAttribute('max')) return true;
  const cls = target.className || '';
  if (typeof cls === 'string' && (cls.includes('input-weight') || cls.includes('input-reps') || cls.includes('wt-input') || cls.includes('set-input') || cls.includes('grams') || cls.includes('cals') || cls.includes('calories'))) {
    return true;
  }
  return false;
}

/**
 * تفعيل الرصد والتحويل التلقائي الشامل لجميع مدخلات التطبيق
 */
export function initArabicNumeralsAutoConvert() {
  if (typeof document === 'undefined') return;

  // منع التكرار
  if (window._neonArabicNumeralsInitialized) return;
  window._neonArabicNumeralsInitialized = true;

  // 1. اعتراض الكتابة اللحظية عبر beforeinput (يدعم لوحة المفاتيح العربية على الهواتف والمتصفحات)
  document.addEventListener('beforeinput', (e) => {
    if (!isArabicNumeralsEnabled()) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'password' || target.type === 'email') return;

    const data = e.data;
    if (!data || !ARABIC_DIGITS_REGEX.test(data)) return;

    const numericContext = isNumericInput(target);
    const normalized = normalizeArabicNumerals(data, numericContext);
    if (normalized === data) return;

    // منع الحرف العربي الأصلي واستبداله بالرقم القياسي
    e.preventDefault();

    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, normalized);
    } catch (_) {
      inserted = false;
    }

    if (!inserted) {
      const val = target.value || '';
      let start = val.length;
      let end = val.length;
      try {
        if (target.selectionStart !== null && target.selectionEnd !== null) {
          start = target.selectionStart;
          end = target.selectionEnd;
        }
      } catch (_) {}

      const nextVal = val.slice(0, start) + normalized + val.slice(end);
      target.value = nextVal;
      try {
        target.setSelectionRange(start + normalized.length, start + normalized.length);
      } catch (_) {}

      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, { capture: true });

  // 2. اعتراض اللصق (Paste) وتحويل الأرقام المنسوخة باللغة العربية
  document.addEventListener('paste', (e) => {
    if (!isArabicNumeralsEnabled()) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'password' || target.type === 'email') return;

    const pasted = (e.clipboardData || window.clipboardData)?.getData('text');
    if (!pasted || !ARABIC_DIGITS_REGEX.test(pasted)) return;

    const numericContext = isNumericInput(target);
    const normalized = normalizeArabicNumerals(pasted, numericContext);
    if (normalized === pasted) return;

    e.preventDefault();
    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, normalized);
    } catch (_) {
      inserted = false;
    }

    if (!inserted) {
      const val = target.value || '';
      let start = val.length;
      let end = val.length;
      try {
        if (target.selectionStart !== null && target.selectionEnd !== null) {
          start = target.selectionStart;
          end = target.selectionEnd;
        }
      } catch (_) {}

      const nextVal = val.slice(0, start) + normalized + val.slice(end);
      target.value = nextVal;
      try {
        target.setSelectionRange(start + normalized.length, start + normalized.length);
      } catch (_) {}

      target.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, { capture: true });

  // 3. صمام أمان عبر حدث input (يلتقط الإكمال التلقائي، الإملاء الصوتي، والمدخلات السريعة)
  document.addEventListener('input', (e) => {
    if (!isArabicNumeralsEnabled()) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'password' || target.type === 'email') return;

    const val = target.value;
    if (typeof val === 'string' && ARABIC_DIGITS_REGEX.test(val)) {
      const numericContext = isNumericInput(target);
      const normalized = normalizeArabicNumerals(val, numericContext);
      if (normalized !== val) {
        let start = null;
        let end = null;
        try {
          start = target.selectionStart;
          end = target.selectionEnd;
        } catch (_) {}

        target.value = normalized;
        try {
          if (start !== null && end !== null) {
            target.setSelectionRange(start, end);
          }
        } catch (_) {}
      }
    }
  }, { capture: true });
}
