/**
 * Visual-only body-fat ranges for onboarding. These are broad self-assessments,
 * never equivalent to a scan or clinical body-composition measurement.
 */
export const BODY_FAT_RANGES = Object.freeze([
  { label: '3–4%', estimate: 3.5 },
  { label: '5–7%', estimate: 6 },
  { label: '8–12%', estimate: 10 },
  { label: '13–17%', estimate: 15 },
  { label: '18–23%', estimate: 20.5 },
  { label: '24–29%', estimate: 26.5 },
  { label: '30–34%', estimate: 32 },
  { label: '35–39%', estimate: 37 },
  { label: '40%+', estimate: 40 }
]);

export function getBodyFatRange(label) {
  return BODY_FAT_RANGES.find(item => item.label === label) || null;
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
  return `<section class="body-fat-step" dir="ltr" aria-labelledby="body-fat-heading">
    <div class="body-fat-heading" dir="rtl">
      <span class="body-fat-eyebrow">BASICS · BODY COMPOSITION</span>
      <h2 id="body-fat-heading">ما هي نسبة الدهون في جسمك؟</h2>
      <p>اختر الشكل الأقرب لجسمك. هذا تقدير بصري تقريبي، ومش ضروري تكون دقيق 100%.</p>
    </div>
    <div class="body-fat-grid" role="radiogroup" aria-label="نسبة الدهون التقريبية">
      ${BODY_FAT_RANGES.map((item, i) => `<button type="button" class="body-fat-option ${selectedRange === item.label ? 'is-selected' : ''}"
        role="radio" aria-checked="${selectedRange === item.label}" data-body-fat-range="${item.label}" aria-label="${item.label}">
        <span class="body-fat-illustration">${renderBodyFatSilhouette(i, gender)}</span>
        <span class="body-fat-chip">${selectedRange === item.label ? '<span class="body-fat-check" aria-hidden="true">✓</span>' : ''}${item.label}</span>
      </button>`).join('')}
    </div>
    <p class="body-fat-disclaimer" dir="rtl">الأشكال للمقارنة فقط، وليست قياسًا طبيًا. يمكنك تحديث اختيارك لاحقًا.</p>
    <button type="button" id="q-next-step-btn" class="body-fat-next">التالي <span dir="ltr">Next</span></button>
  </section>`;
}
