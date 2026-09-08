/**
 * NEON COACH - أدوات وحركات الرسوم البيانية والعدادات التفاعلية (Animation Utilities)
 * تدعم الرسوم البيانية التفاعلية، العدادات الرقمية التصاعدية، وحلقات النيون
 */

/**
 * تحريك رقم تصاعدي من الصفر (أو قيمة بداية) حتى الرقم المستهدف بنعومة فائقة
 * @param {HTMLElement|string} targetElement - العنصر أو معرّف العنصر في DOM
 * @param {number} targetValue - الرقم النهائي المستهدف
 * @param {Object} options - خيارات الحركة (duration, decimals, prefix, suffix, startVal)
 */
export function animateCountUp(targetElement, targetValue, options = {}) {
  let el = targetElement;
  if (typeof targetElement === 'string') {
    el = typeof document !== 'undefined' ? document.getElementById(targetElement) : null;
  }
  if (!el || typeof targetValue !== 'number' || isNaN(targetValue)) return;

  const decimals = options.decimals !== undefined ? options.decimals : (Number.isInteger(targetValue) ? 0 : 1);
  const prefix = options.prefix || '';
  const suffix = options.suffix || '';

  // عرض القيمة الحقيقية الدقيقة فوراً وبدون تأخير لمنع قراءة أرقام خاطئة
  const formatted = targetValue.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  el.textContent = `${prefix}${formatted}${suffix}`;
}

/**
 * ضبط حلقات النيون الدائرية لتظهر النسبة المستهدفة فوراً وبدقة تامة
 * @param {SVGElement|string} circleElement - دائرة الـ SVG
 * @param {number} targetOffset - الإزاحة النهائية
 * @param {number} circumference - المحيط الكلي للدائرة
 */
export function animateRingOffset(circleElement, targetOffset, circumference) {
  let el = circleElement;
  if (typeof circleElement === 'string') {
    el = typeof document !== 'undefined' ? document.getElementById(circleElement) : null;
  }
  if (!el || !el.style) return;

  // تعيين الإزاحة الدقيقة فوراً بدون تصفير مزعج
  el.style.strokeDashoffset = String(targetOffset);
}
