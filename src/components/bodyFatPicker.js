/**
 * Visual-only body-fat ranges for onboarding. These are broad self-assessments,
 * never equivalent to a scan or clinical body-composition measurement.
 */
const BODY_FAT_IMAGE_SOURCE = 'Cloudflare R2 · User-provided NEON physique images';

export const BODY_FAT_RANGES = Object.freeze([
  { label: '3–4%', estimate: 3.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_20_47%20AM-1.png' },
  { label: '5–7%', estimate: 6, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_20_51%20AM-2.png' },
  { label: '8–12%', estimate: 10, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_20_53%20AM-3.png' },
  { label: '13–17%', estimate: 15, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_20_54%20AM-4.png' },
  { label: '18–23%', estimate: 20.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_20_56%20AM-5.png' },
  { label: '24–29%', estimate: 26.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_20_58%20AM-6.png' },
  { label: '30–34%', estimate: 32, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_00%20AM-7.png' },
  { label: '35–39%', estimate: 37, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_01%20AM-8.png' },
  { label: '40%+', estimate: 40, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_02%20AM-9.png' }
]);

export const FEMALE_BODY_FAT_RANGES = Object.freeze([
  { label: '10–13%', estimate: 11.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_42%20AM-1.png' },
  { label: '14–17%', estimate: 15.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_44%20AM-2.png' },
  { label: '18–23%', estimate: 20.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_46%20AM-3.png' },
  { label: '24–28%', estimate: 26, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_47%20AM-4.png' },
  { label: '29–33%', estimate: 31, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_50%20AM-5.png' },
  { label: '34–37%', estimate: 35.5, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_53%20AM-6.png' },
  { label: '38–42%', estimate: 40, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_55%20AM-7.png' },
  { label: '43–49%', estimate: 46, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_57%20AM-8.png' },
  { label: '50%+', estimate: 50, image: 'https://pub-64c7fdc3eb7c4a228263029521b77ed1.r2.dev/ChatGPT%20Image%20Oct%2026%2C%202026%2C%2010_21_58%20AM-9.png' }
]);

export function getBodyFatRanges(gender = 'male') {
  return gender === 'female' ? FEMALE_BODY_FAT_RANGES : BODY_FAT_RANGES;
}

export function getBodyFatRange(label, gender = 'male') {
  return getBodyFatRanges(gender).find(item => item.label === label) || null;
}

// Nine individually varied, neutral-gray anatomy illustrations. The width,
// definition and central adiposity shift progressively across the nine tiles.
export function renderBodyFatSilhouette(index, gender = 'male') {
  const i = Math.max(0, Math.min(8, Number(index) || 0));
  const isFemale = gender === 'female';
  const shoulder = isFemale ? 48 : 55;
  const chest = (isFemale ? 36 : 41) + i * 1.8;
  const waist = (isFemale ? 25 : 27) + i * 4.2;
  const hip = (isFemale ? 37 : 31) + i * 3.1;
  const neck = isFemale ? 12 : 15;
  const absVisibility = i <= 2 ? 0.8 : i === 3 ? 0.43 : i === 4 ? 0.12 : 0;
  const ribsVisibility = i <= 3 ? 0.58 : 0;
  const armOutsideL = 90 - shoulder - 5;
  const armOutsideR = 90 + shoulder + 5;
  const torso = [
    'M', 90 - neck, 15,
    'L', 90 - neck - 3, 29,
    'Q', 90 - shoulder + 4, 32, 90 - shoulder, 49,
    'Q', 90 - chest - 4, 69, 90 - chest, 89,
    'Q', 90 - waist - 5, 115, 90 - waist, 147,
    'Q', 90 - hip, 172, 90 - hip, 203,
    'L', 90 + hip, 203,
    'Q', 90 + hip, 172, 90 + waist, 147,
    'Q', 90 + waist + 5, 115, 90 + chest, 89,
    'Q', 90 + chest + 4, 69, 90 + shoulder, 49,
    'Q', 90 + shoulder - 4, 32, 90 + neck + 3, 29,
    'L', 90 + neck, 15, 'Z'
  ].join(' ');
  const bellyY = 131 + i * 1.5;
  const chestDetail = isFemale
    ? '<path d="M50 77 Q63 69 79 84 M101 84 Q117 69 130 77" fill="none"/>'
    : '<path d="M49 74 Q66 94 86 83 M94 83 Q114 94 131 74" fill="none"/>';
  const abs = [96, 116, 136].map(y =>
    '<path d="M67 ' + y + ' Q77 ' + (y - 5) + ' 87 ' + y + ' M93 ' + y + ' Q104 ' + (y - 5) + ' 114 ' + y + '"/>'
  ).join('');
  return `<svg viewBox="0 0 180 216" role="img" aria-label="رسم تقريبي لتكوين الجسم" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="bf-skin-${i}-${gender}" x1="0" x2="1"><stop stop-color="#c6c8cb"/><stop offset=".5" stop-color="#dedfe1"/><stop offset="1" stop-color="#bfc2c6"/></linearGradient></defs>
    <path d="M${armOutsideL + 10} 44 Q${armOutsideL - 8} 54 ${armOutsideL - 6} 82 L${armOutsideL - 17} 170 Q${armOutsideL - 15} 189 ${armOutsideL + 5} 184 L${armOutsideL + 21} 95 Z" fill="#c9cbcf" stroke="#b2b4b9" stroke-width="2"/>
    <path d="M${armOutsideR - 10} 44 Q${armOutsideR + 8} 54 ${armOutsideR + 6} 82 L${armOutsideR + 17} 170 Q${armOutsideR + 15} 189 ${armOutsideR - 5} 184 L${armOutsideR - 21} 95 Z" fill="#c9cbcf" stroke="#b2b4b9" stroke-width="2"/>
    <path d="${torso}" fill="url(#bf-skin-${i}-${gender})" stroke="#b0b4b7" stroke-width="1.6"/>
    <g stroke="#a4a8ac" stroke-width="2.3" stroke-linecap="round" opacity=".83">${chestDetail}
      <path d="M90 23 V40 M90 87 V${bellyY}" />
      <path d="M${90-waist} 118 Q${90-waist-6} 136 ${90-hip+5} 157 M${90+waist} 118 Q${90+waist+6} 136 ${90+hip-5} 157" fill="none"/>
    </g>
    <g fill="none" stroke="#a6a9ad" stroke-width="2.4" stroke-linecap="round" opacity="${absVisibility}">${abs}</g>
    <g fill="none" stroke="#a8acaf" stroke-width="2" opacity="${ribsVisibility}">
      <path d="M55 69 Q66 82 75 87 M125 69 Q114 82 105 87 M58 85 Q66 98 73 103 M122 85 Q114 98 107 103"/>
    </g>
    <path d="M${90-hip} 203 L${90+hip} 203" stroke="#62676d" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

export function renderBodyFatStep(selectedRange = '', gender = 'male') {
  const isFemale = gender === 'female';
  const choices = getBodyFatRanges(gender);
  const validSelection = getBodyFatRange(selectedRange, gender)?.label || '';
  return `<section class="body-fat-step" dir="rtl" aria-labelledby="body-fat-heading">
    <div class="body-fat-heading">
      <span class="body-fat-eyebrow">NEON COACH · BODY COMPOSITION</span>
      <h2 id="body-fat-heading">ما هي نسبة الدهون في جسمك؟</h2>
      <p>اختر الصورة الأقرب لشكل جسمك. النسبة تقديرية، وبختلف المظهر حسب توزيع الدهون والكتلة العضلية.</p>
    </div>
    <div class="body-fat-grid" role="radiogroup" aria-label="نسبة الدهون التقريبية لل${isFemale ? 'نساء' : 'رجال'}">
      ${choices.map((item, i) => `<button type="button" class="body-fat-option ${validSelection === item.label ? 'is-selected' : ''}"
        role="radio" aria-checked="${validSelection === item.label}" data-body-fat-range="${item.label}" aria-label="${item.label}">
        <span class="body-fat-illustration">
          <img class="body-fat-photo" src="${item.image}" alt="نموذج ${isFemale ? 'امرأة' : 'رجل'} بنسبة دهون ${item.label}" loading="${i < 3 ? 'eager' : 'lazy'}" decoding="async" referrerpolicy="no-referrer">
          <span class="body-fat-image-fallback" hidden>${renderBodyFatSilhouette(i, gender)}</span>
        </span>
        <!-- R2 photos already contain their percentage labels; do not duplicate them. -->
        <span class="body-fat-selection-check" aria-hidden="true">✓</span>
        <!-- A label is only displayed if the photo fails and the SVG fallback appears. -->
        <span class="body-fat-fallback-label" hidden>${item.label}</span>
      </button>`).join('')}
    </div>
    <p class="body-fat-disclaimer">هذه الصور للتمثيل البصري فقط؛ لا يمكن تحديد نسبة الدهون بدقة من صورة الجسم وحدها.</p>
    <button type="button" id="q-next-step-btn" class="body-fat-next">التالي <span dir="ltr">Next</span></button>
  </section>`;
}
