/**
 * NEON COACH - معالج ومحول الأرقام العربية والفارسية التلقائي
 * Arabic & Eastern Numerals Auto-Recognition & Conversion Utility
 *
 * يتيح للمستخدمين إدخال الأرقام باللوحة العربية (٠-٩) أو الفارسية (۰-۹) والفواصل العشرية (٫)
 * والكلمات الشائعة مثل "مية" (100) في أي حقل أو شاشة داخل التطبيق، ويقوم بتحويلها فورياً دون إجبار على التبديل للإنجليزية.
 */

const STORAGE_KEY = 'neon_arabic_numerals';
const ARABIC_DIGITS_REGEX = /[٠-٩۰-۹٫]/;
let memoryFallback = null;

// قاموس الكلمات الرقمية الشائعة في الإملاء الصوتي والكتابة العربية
const ARABIC_WORDS_MAP = {
  'مية': 100,
  'ميه': 100,
  'مائة': 100,
  'مئة': 100,
  'مائه': 100,
  'متين': 200,
  'مئتان': 200,
  'مئتين': 200,
  'ثلاثمائة': 300,
  'ثلاثمية': 300,
  'ثلثمية': 300,
  'أربعمائة': 400,
  'أربعمية': 400,
  'اربعمية': 400,
  'خمسمائة': 500,
  'خمسمية': 500,
  'كيلو': 1000,
  'نص': 0.5,
  'نصف': 0.5,
  'نص كيلو': 500,
  'نصف كيلو': 500,
  'ربع': 0.25,
  'ربع كيلو': 250,
  'واحد': 1,
  'اثنين': 2,
  'إثنين': 2,
  'ثلاثة': 3,
  'أربعة': 4,
  'اربعة': 4,
  'خمسة': 5,
  'ستة': 6,
  'سبعة': 7,
  'ثمانية': 8,
  'تسعة': 9,
  'عشرة': 10,
  'عشر': 10,
  'عشرين': 20,
  'عشرون': 20,
  'ثلاثين': 30,
  'ثلاثون': 30,
  'أربعين': 40,
  'اربعين': 40,
  'خمسين': 50,
  'خمسون': 50,
  'ستين': 60,
  'ستون': 60,
  'سبعين': 70,
  'سبعون': 70,
  'ثمانين': 80,
  'ثمانون': 80,
  'تسعين': 90,
  'تسعون': 90
};

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

  const trimmed = text.trim();
  if (isNumericOnly && ARABIC_WORDS_MAP[trimmed] !== undefined) {
    return String(ARABIC_WORDS_MAP[trimmed]);
  }

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
 * تحويل نص يحتوي على أرقام عربية أو كلمات رقمية إلى رقم عشري float بأمان
 */
export function parseArabicFloat(val, fallback = NaN) {
  if (val === '' || val == null) return fallback;
  const str = String(val).trim();
  if (ARABIC_WORDS_MAP[str] !== undefined) {
    return ARABIC_WORDS_MAP[str];
  }
  const normalized = normalizeArabicNumerals(str, true);
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : fallback;
}

/**
 * تحويل نص يحتوي على أرقام عربية أو كلمات رقمية إلى رقم صحيح int بأمان
 */
export function parseArabicInt(val, radix = 10, fallback = NaN) {
  if (val === '' || val == null) return fallback;
  const str = String(val).trim();
  if (ARABIC_WORDS_MAP[str] !== undefined) {
    return Math.round(ARABIC_WORDS_MAP[str]);
  }
  const normalized = normalizeArabicNumerals(str, true);
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
  if (typeof cls === 'string' && (cls.includes('input-weight') || cls.includes('input-reps') || cls.includes('wt-input') || cls.includes('set-input') || cls.includes('grams') || cls.includes('cals') || cls.includes('calories') || cls.includes('count'))) {
    return true;
  }
  return false;
}

/**
 * ترقية حقل type="number" إلى type="text" مع inputmode="decimal"
 * هذا يمنع Safari / WebKit على iPhone و Android من حظر مفاتيح الأرقام العربية
 */
export function upgradeNumericInput(input) {
  if (!input || !(input instanceof HTMLInputElement)) return;
  if (input.type === 'number') {
    const isInt = input.step === '1' || input.getAttribute('step') === '1' || input.classList.contains('draft-item-count-input') || input.classList.contains('int-only');
    try {
      input.type = 'text';
      if (!input.getAttribute('inputmode')) {
        input.setAttribute('inputmode', isInt ? 'numeric' : 'decimal');
      }
      if (!input.getAttribute('autocomplete')) {
        input.setAttribute('autocomplete', 'off');
      }
    } catch (_) {}
  }
}

/**
 * تفعيل الرصد والتحويل التلقائي الشامل لجميع مدخلات التطبيق
 */
export function initArabicNumeralsAutoConvert() {
  if (typeof document === 'undefined') return;

  // منع التكرار
  if (window._neonArabicNumeralsInitialized) return;
  window._neonArabicNumeralsInitialized = true;

  // 1. ترقية الحقول الرقمية تلقائياً عند اللمس أو التحديد لمنع إجبار Safari على رفض الأرقام
  document.addEventListener('focusin', (e) => upgradeNumericInput(e.target), { capture: true });
  document.addEventListener('touchstart', (e) => upgradeNumericInput(e.target), { capture: true, passive: true });
  document.addEventListener('pointerdown', (e) => upgradeNumericInput(e.target), { capture: true });

  // فحص وترقية الحقول الموجودة في الصفحة
  try {
    document.querySelectorAll('input[type="number"]').forEach(upgradeNumericInput);
  } catch (_) {}

  // 2. اعتراض الكتابة اللحظية عبر beforeinput (يدعم لوحة المفاتيح العربية على الهواتف والمتصفحات)
  document.addEventListener('beforeinput', (e) => {
    if (!isArabicNumeralsEnabled()) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'password' || target.type === 'email') return;

    upgradeNumericInput(target);

    const data = e.data;
    if (!data || !ARABIC_DIGITS_REGEX.test(data)) return;

    const numericContext = isNumericInput(target);
    const normalized = normalizeArabicNumerals(data, numericContext);
    if (normalized === data) return;

    // محاولة إدخال الرقم المحول مباشرة عبر execCommand
    let inserted = false;
    try {
      inserted = document.execCommand('insertText', false, normalized);
    } catch (_) {
      inserted = false;
    }

    if (inserted) {
      e.preventDefault();
    }
    // ملاحظة: في حال لم تنجح execCommand (كما هو الحال في Safari على iOS)، لا نقوم بعمل e.preventDefault()
    // حتى لا يلغي المتصفح إدخال لوحة المفاتيح، بل يتركه يدخل ويقوم حدث input بالتحويل الفوري.
  }, { capture: true });

  // 3. اعتراض اللصق (Paste) وتحويل الأرقام المنسوخة باللغة العربية
  document.addEventListener('paste', (e) => {
    if (!isArabicNumeralsEnabled()) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'password' || target.type === 'email') return;

    upgradeNumericInput(target);

    const pasted = (e.clipboardData || window.clipboardData)?.getData('text');
    if (!pasted) return;

    const numericContext = isNumericInput(target);
    const trimmed = pasted.trim();
    let normalized = '';

    if (numericContext && ARABIC_WORDS_MAP[trimmed] !== undefined) {
      normalized = String(ARABIC_WORDS_MAP[trimmed]);
    } else if (ARABIC_DIGITS_REGEX.test(pasted)) {
      normalized = normalizeArabicNumerals(pasted, numericContext);
    }

    if (!normalized || normalized === pasted) return;

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

  // 4. صمام أمان عبر حدث input (يحول فوراً أثناء الكتابة أو الإملاء الصوتي)
  document.addEventListener('input', (e) => {
    if (!isArabicNumeralsEnabled()) return;
    const target = e.target;
    if (!target || !(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return;
    if (target.type === 'password' || target.type === 'email') return;

    const val = target.value;
    if (typeof val === 'string' && (ARABIC_DIGITS_REGEX.test(val) || (isNumericInput(target) && ARABIC_WORDS_MAP[val.trim()] !== undefined))) {
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

        // إطلاق حدث input لضمان تحديث الحسابات اللحظية في الواجهة
        target.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }, { capture: true });
}
