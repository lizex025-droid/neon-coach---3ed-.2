/**
 * NEON COACH - محرك الحسابات الرياضية والبيولوجية الحتمية
 * تم توثيق جميع المعادلات من مراجع الفسيولوجيا الرياضية المعتمدة (Mifflin-St Jeor, Epley)
 */

export const GOALS = {
  FAT_LOSS: 'fat_loss',
  MUSCLE_GAIN: 'muscle_gain',
  MAINTENANCE: 'maintenance',
  RECOMP: 'recomp',
  STRENGTH: 'strength',
  GENERAL_HEALTH: 'general_health'
};

export const ACTIVITY_LEVELS = {
  SEDENTARY: 'sedentary', // مكتبي / قليل الحركة جداً (1.2)
  LIGHT: 'light',         // 1-3 أيام تمرين أسبوعياً (1.375)
  MODERATE: 'moderate',   // 3-5 أيام تمرين أسبوعياً (1.55)
  ACTIVE: 'active'        // 6-7 أيام تمرين عالي الكثافة (1.725)
};

/**
 * حساب العمر بدقة من تاريخ الميلاد
 * @param {string|Date} birthDateStr
 * @returns {number} العمر بالسنوات
 */
export function calculateAge(birthDateStr) {
  if (!birthDateStr) return 0;
  const birthDate = new Date(birthDateStr);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * حساب مؤشر كتلة الجسم (BMI) مع التوضيح بأنه مؤشر محدود
 * @param {number} weightKg
 * @param {number} heightCm
 * @returns {{ bmi: number, category: string, note: string }}
 */
export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, category: 'غير معروف', note: '' };
  }
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let category = 'طبيعي';
  if (bmi < 18.5) category = 'نقص في الوزن';
  else if (bmi < 25) category = 'وزن صحي';
  else if (bmi < 30) category = 'زيادة في الوزن';
  else category = 'سمنة';

  return {
    bmi,
    category,
    note: 'BMI هو مؤشر إحصائي عام ولا يميز بين كتلة العضلات والدهون.'
  };
}

/**
 * حساب معدل الأيض الأساسي (BMR) بمعادلة Mifflin-St Jeor
 * للذكور: (10 × الوزن) + (6.25 × الطول) - (5 × العمر) + 5
 * للإناث: (10 × الوزن) + (6.25 × الطول) - (5 × العمر) - 161
 */
export function calculateBMR(weightKg, heightCm, age, gender = 'male') {
  if (!weightKg || !heightCm || !age) return 1500;
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return gender === 'female' ? Math.round(base - 161) : Math.round(base + 5);
}

/**
 * حساب استهلاك الطاقة اليومي الكلي (TDEE) دون مضاعفة احتساب التمرين
 */
export function calculateTDEE(bmr, activityLevel) {
  const multipliers = {
    [ACTIVITY_LEVELS.SEDENTARY]: 1.2,
    [ACTIVITY_LEVELS.LIGHT]: 1.375,
    [ACTIVITY_LEVELS.MODERATE]: 1.55,
    [ACTIVITY_LEVELS.ACTIVE]: 1.725
  };
  const factor = multipliers[activityLevel] || 1.375;
  return Math.round(bmr * factor);
}

/**
 * حساب السعرات والماكروز مع التطابق الرياضي الصارم:
 * السعرات = (البروتين × 4) + (الكربوهيدرات × 4) + (الدهون × 9)
 */
export function calculateNutritionTargets(userProfile) {
  const {
    weight = 75,
    height = 175,
    birthDate,
    gender = 'male',
    activityLevel = ACTIVITY_LEVELS.LIGHT,
    goal = GOALS.FAT_LOSS
  } = userProfile;

  const age = Number(userProfile.age) || calculateAge(birthDate) || 25;
  const bmr = calculateBMR(weight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);

  // حساب السعرات المستهدفة بناء على الهدف
  let targetCalories = tdee;
  if (goal === GOALS.FAT_LOSS) {
    // عجز محافظ وآمن 20% (بين 300 إلى 500 سعرة)
    const deficit = Math.min(500, Math.round(tdee * 0.20));
    targetCalories = Math.max(bmr, tdee - deficit); // لا ننزل تحت الـ BMR تلقائياً
  } else if (goal === GOALS.MUSCLE_GAIN) {
    // فائض بناء عضلي نظيف 12% (حوالي 250-350 سعرة)
    targetCalories = Math.round(tdee * 1.12);
  } else if (goal === GOALS.RECOMP) {
    // إعادة تركيب الجسم: عجز طفيف جداً 7%
    targetCalories = Math.round(tdee * 0.93);
  }

  // توزيع الماكروز
  // البروتين: 1.8 إلى 2.0 غرام لكل كغ
  let proteinGrams = Math.round(weight * (goal === GOALS.FAT_LOSS ? 2.0 : 1.8));
  // الدهون: 25% من إجمالي السعرات (9 ك/غ)
  let fatGrams = Math.round((targetCalories * 0.25) / 9);

  // الكربوهيدرات: المتبقي من السعرات مقسوماً على 4
  const calsFromProteinAndFat = (proteinGrams * 4) + (fatGrams * 9);
  let remainingCals = Math.max(0, targetCalories - calsFromProteinAndFat);
  let carbGrams = Math.round(remainingCals / 4);

  // ضبط المجموع الدقيق لضمان التطابق الحسابي التام
  const exactCalories = (proteinGrams * 4) + (carbGrams * 4) + (fatGrams * 9);

  // هدف الماء: 35 مل لكل كغ + 500 مل للنشاط الرياضي
  const targetWaterMl = Math.round(weight * 35 + 500);

  return {
    bmr,
    tdee,
    targetCalories: exactCalories,
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
    waterMl: targetWaterMl,
    waterGlasses: Math.round(targetWaterMl / 250), // كوب = 250 مل
    calculatedAt: new Date().toISOString(),
    version: '1.0.0'
  };
}

/**
 * حساب الوزن الأقصى التقديري لتكرار واحد (e1RM) بمعادلة Epley
 * @param {number} weight الوزن المرفوع
 * @param {number} reps عدد التكرارات (يجب أن يكون بين 1 و 10 للدقة)
 */
export function calculateE1RM(weight, reps) {
  if (!weight || !reps || reps <= 0) return 0;
  if (reps === 1) return weight;
  // معادلة إيبلي: الوزن × (1 + التكرارات / 30)
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * حساب نسبة الحلقة الدائرية بدقة تامة ومنع تكرار أو تجاوز الأرقام الخاطئة
 */
export function calculatePercentage(current, target) {
  if (!target || target <= 0) return 0;
  if (current <= 0) return 0;
  const pct = Math.round((current / target) * 100);
  return Math.min(100, Math.max(0, pct));
}

/**
 * تحويل الوحدات
 */
export function kgToLbs(kg) {
  return Math.round(kg * 2.20462 * 10) / 10;
}

export function lbsToKg(lbs) {
  return Math.round((lbs / 2.20462) * 10) / 10;
}

export function cmToInches(cm) {
  return Math.round((cm / 2.54) * 10) / 10;
}

export function inchesToCm(inches) {
  return Math.round(inches * 2.54 * 10) / 10;
}
