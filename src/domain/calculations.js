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

export * from '../utils/calorieEngine.js';
import {
  calculateBMR as engineCalculateBMR,
  calculateMaintenanceCalories,
  calculateWeightLossOption,
  resolveActivityFactor,
  KCAL_PER_KG
} from '../utils/calorieEngine.js';

/**
 * حساب معدل الأيض الأساسي (BMR) بمعادلة Mifflin-St Jeor
 * للذكور: (10 × الوزن) + (6.25 × الطول) - (5 × العمر) + 5
 * للإناث: (10 × الوزن) + (6.25 × الطول) - (5 × العمر) - 161
 */
export function calculateBMR(weightKg, heightCm, age, gender = 'male') {
  return engineCalculateBMR(weightKg, heightCm, age, gender);
}

/**
 * حساب استهلاك الطاقة اليومي الكلي (TDEE) دون مضاعفة احتساب التمرين
 */
export function calculateTDEE(bmr, activityLevel) {
  return calculateMaintenanceCalories(bmr, activityLevel);
}

/**
 * حساب السعرات والماكروز مع التطابق الرياضي الصارم:
 * السعرات = (البروتين × 4) + (الكربوهيدرات × 4) + (الدهون × 9)
 * واعتماد السعرات اليومية المختارة كـ Single Source of Truth
 */
export function calculateNutritionTargets(userProfile) {
  const {
    weight = 75,
    height = 175,
    birthDate,
    age: directAge,
    gender = 'male',
    activityLevel = 'moderate',
    goal = GOALS.FAT_LOSS,
    requestedTargetCalories,
    dailyCalorieDeficit,
    selectedWeeklyLossRate,
    weeklyLossPercent
  } = userProfile;

  // استخدام العمر المُدخَل مباشرة أولاً، ثم حسابه من تاريخ الميلاد كحل بديل
  const age = (directAge && Number(directAge) > 0) ? Number(directAge) : (calculateAge(birthDate) || 25);
  const rawBmr = engineCalculateBMR(weight, height, age, gender);
  const rawTdee = calculateMaintenanceCalories(rawBmr, activityLevel);

  // حساب السعرات المستهدفة بناء على الهدف
  let targetCalories = Math.round(rawTdee);
  if (goal === GOALS.FAT_LOSS) {
    if (requestedTargetCalories && Number(requestedTargetCalories) > 0) {
      targetCalories = Math.round(Number(requestedTargetCalories));
    } else if (dailyCalorieDeficit && Number(dailyCalorieDeficit) > 0) {
      targetCalories = Math.round(rawTdee - Number(dailyCalorieDeficit));
    } else if (selectedWeeklyLossRate || weeklyLossPercent) {
      const rate = Number(selectedWeeklyLossRate || weeklyLossPercent);
      const option = calculateWeightLossOption({
        currentWeightKg: weight,
        maintenanceCalories: rawTdee,
        weeklyRate: rate,
        sex: gender,
        age
      });
      targetCalories = option.targetCaloriesRounded;
    } else {
      // عجز موصى به معتمد 0.75%
      const option = calculateWeightLossOption({
        currentWeightKg: weight,
        maintenanceCalories: rawTdee,
        weeklyRate: 0.0075,
        sex: gender,
        age
      });
      targetCalories = option.targetCaloriesRounded;
    }
  } else if (goal === GOALS.MUSCLE_GAIN) {
    // فائض بناء عضلي نظيف 12% (حوالي 250-350 سعرة)
    targetCalories = Math.round(rawTdee * 1.12);
  } else if (goal === GOALS.RECOMP) {
    // إعادة تركيب الجسم: عجز طفيف جداً 7%
    targetCalories = Math.round(rawTdee * 0.93);
  } else if (goal === GOALS.MAINTENANCE || goal === GOALS.GENERAL_HEALTH) {
    targetCalories = Math.round(rawTdee);
  }

  // ضبط وتوزيع الماكروز بحيث يكون مجموعها الرياضي مطابقاً تماماً لـ targetCalories دون أي تعديل أو تضخيم للسعرات
  const target = Math.max(200, Math.round(targetCalories));

  // الدهون: حوالي 25% من السعرات، مع اختيار غرامات دقيقة بحيث يكون المتبقي للبروتين والكارب قابلاً للقسمة على 4
  const rawFat = Math.max(5, Math.round((target * 0.25) / 9));
  let bestFat = rawFat;
  let minDiff = Infinity;
  for (let f = Math.max(5, rawFat - 4); f <= rawFat + 4; f++) {
    if (target - (f * 9) >= 0 && (target - (f * 9)) % 4 === 0) {
      if (Math.abs(f - rawFat) < minDiff) {
        minDiff = Math.abs(f - rawFat);
        bestFat = f;
      }
    }
  }
  const fatGrams = bestFat;
  const totalCalsForPAndC = target - (fatGrams * 9);
  const totalGramsPAndC = Math.floor(totalCalsForPAndC / 4);

  // البروتين: 2.0 غرام لكل كغ لخسارة الدهون، 1.8 غرام للأهداف الأخرى
  const idealProtein = Math.round(weight * (goal === GOALS.FAT_LOSS ? 2.0 : 1.8));
  let proteinGrams = 0;
  let carbGrams = 0;

  if (idealProtein <= totalGramsPAndC) {
    proteinGrams = idealProtein;
    carbGrams = totalGramsPAndC - idealProtein;
  } else {
    // في حالات العجز الشديد أو الأوزان العالية جداً، يتم تخصيص الميزانية القصوى الممكنة للبروتين مع ترك نسبة للكارب
    proteinGrams = Math.min(idealProtein, Math.round(totalGramsPAndC * 0.85));
    carbGrams = totalGramsPAndC - proteinGrams;
  }

  // هدف الماء: 35 مل لكل كغ + 500 مل للنشاط الرياضي
  const targetWaterMl = Math.round(weight * 35 + 500);

  return {
    bmr: Math.round(rawBmr),
    rawBmr,
    tdee: Math.round(rawTdee),
    rawTdee,
    targetCalories: target,
    requestedTargetCalories: target,
    protein: proteinGrams,
    carbs: carbGrams,
    fats: fatGrams,
    waterMl: targetWaterMl,
    waterGlasses: Math.round(targetWaterMl / 250), // كوب = 250 مل
    calculatedAt: new Date().toISOString(),
    version: '2.0.0'
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
 * تحليل نص أفضل جولة لاستخراج الوزن والتكرارات بدقة
 * يدعم التنسيقات: "72.5 كغ × 9 تكرارات", "100 kg x 8", "32 كغ × 10", "100 كغ", etc.
 * @param {string} bestSetStr
 * @returns {{ weight: number, reps: number }}
 */
export function parseExerciseBestSet(bestSetStr) {
  if (!bestSetStr || typeof bestSetStr !== 'string') return { weight: 0, reps: 0 };
  const normalized = bestSetStr.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));

  // 1. استخراج وزن وتكرار مع فاصل (× أو x أو *)
  const matchWithSep = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:كغ|كجم|kg)?\s*[×xX*]\s*([0-9]+)/i);
  if (matchWithSep) {
    return {
      weight: parseFloat(matchWithSep[1]) || 0,
      reps: parseInt(matchWithSep[2], 10) || 0
    };
  }

  // 2. استخراج وزن فقط
  const matchWeightOnly = normalized.match(/([0-9]+(?:\.[0-9]+)?)\s*(?:كغ|كجم|kg)/i);
  if (matchWeightOnly) {
    return {
      weight: parseFloat(matchWeightOnly[1]) || 0,
      reps: 1
    };
  }

  // 3. استخراج تكرارات فقط
  const matchRepsOnly = normalized.match(/([0-9]+)\s*(?:تكرار|تكرارات|reps)/i);
  if (matchRepsOnly) {
    return {
      weight: 0,
      reps: parseInt(matchRepsOnly[1], 10) || 0
    };
  }

  return { weight: 0, reps: 0 };
}

/**
 * حساب مقياس القوة للتمرين (معادلة 1RM أو الوزن الفعلي أو عدد الجولات كحد أدنى)
 * @param {Object} ex
 * @returns {number}
 */
export function getExerciseStrengthScore(ex) {
  if (!ex) return 0;
  let weight = Number(ex.weight ?? ex.weightKg ?? ex.bestKg) || 0;
  let reps = Number(ex.reps ?? ex.bestReps) || 0;
  if (!weight && ex.bestSet) {
    const parsed = parseExerciseBestSet(ex.bestSet);
    weight = parsed.weight;
    if (!reps) reps = parsed.reps;
  }
  if (weight > 0) {
    return reps > 0 ? Math.round(weight * (1 + reps / 30) * 10) / 10 : weight;
  }
  if (reps > 0) return reps;
  return Number(ex.setsCount ?? ex.sets) || 0;
}

/**
 * تصنيف التمرين إلى المجموعة العضلية الرئيسية بدقة
 * يدعم جميع الأسماء بالعربية والإنجليزية والمختصرات الشائعة
 * @param {string} name
 * @param {Object} [ex]
 * @returns {string} كود المجموعة العضلية
 */
export function detectMuscleGroup(name, ex = null) {
  if (ex) {
    if (ex.category) {
      const cat = String(ex.category).toLowerCase();
      if (cat === 'chest') return 'chest';
      if (cat === 'back') return 'back';
      if (cat === 'legs' || cat === 'leg') return 'legs';
      if (cat === 'shoulders' || cat === 'shoulder') return 'shoulders';
      if (cat === 'core' || cat === 'abs') return 'core';
      if (cat === 'biceps') return 'biceps';
      if (cat === 'triceps') return 'triceps';
      if (cat === 'arms') {
        const n = ((ex.nameAr || '') + ' ' + (ex.name || '') + ' ' + (ex.nameEn || '')).toLowerCase();
        if (/تراي|tricep|pushdown|french|skull/.test(n)) return 'triceps';
        if (/باي|bicep|curl|preacher|hammer/.test(n)) return 'biceps';
        return 'arms';
      }
    }
    if (ex.muscleGroup) {
      const mg = String(ex.muscleGroup).toLowerCase();
      if (/chest|صدر/.test(mg)) return 'chest';
      if (/back|ظهر/.test(mg)) return 'back';
      if (/shoulder|كتف/.test(mg)) return 'shoulders';
      if (/leg|رجل|فخذ|ساق/.test(mg)) return 'legs';
      if (/bicep|باي/.test(mg)) return 'biceps';
      if (/tricep|تراي/.test(mg)) return 'triceps';
      if (/core|abs|بطن/.test(mg)) return 'core';
    }
  }

  const s = (((ex && (ex.nameAr || ex.name || ex.nameEn)) || name || '')).toLowerCase();

  // 1. البطن والجذع / Core
  if (/بطن|معدة|خواصر|بلانك|كرانش|abs|abdom|core|plank|crunch/.test(s)) return 'core';

  // 2. الأرجل والساقين / Legs (تأتي قبل كيرل لتمييز leg curl عن بايسبس)
  if (/رجل|أرجل|ارجل|ساق|فخذ|أفخاذ|افخاذ|سمانة|سكوات|طعن|رومان|rdl|romanian|squat|lunge|quad|hamstring|calf|calves|leg press|hack squat|leg extension|leg curl/.test(s)) return 'legs';

  // 3. الأكتاف / Shoulders
  if (/كتف|أكتاف|اكتاف|رفرفة|ترابيس|shoulder|deltoid|delt|lateral raise|overhead press|military press|ohp|arnold|shrug/.test(s)) return 'shoulders';

  // 4. البايسبس / Biceps
  if (/باي|بايسبس|ثني.*باي|كيرل|bicep|curl|preacher|hammer/.test(s)) return 'biceps';

  // 5. الترايسبس / Triceps
  if (/تراي|ترايسبس|مد.*تراي|ضغط.*تراي|بوش.*داون|tricep|pushdown|french press|skull crusher/.test(s)) return 'triceps';

  // 6. الذراعين عموماً / Arms
  if (/ذراع|سواعد|forearm/.test(s)) return 'arms';

  // 7. الصدر / Chest
  if (/صدر|بنش|bench|chest|pec|fly|push.?up|incline.*press|decline.*press|flat.*press|incline.*db|db.*incline|ضغط.*مائل|ضغط.*مستوي/.test(s)) return 'chest';

  // 8. الظهر / Back
  if (/ظهر|سحب|لاتس|مجنص|عقلة|تجديف|ديدلفت|deadlift|lat |lats|row|pull.?up|pulldown|chin.?up|t-bar/.test(s)) return 'back';

  // دمج أي ضغط عام مع الصدر
  if (/press|ضغط/.test(s)) return 'chest';

  return 'other_' + s;
}

/**
 * فلترة تمارين الجلسة بحيث يظهر أقوى تمرين فقط لكل مجموعة عضلية
 * (مثلاً: بنش برس للصدر فقط دون التمارين الثانوية للصدر)
 * @param {Array} exercises مصفوفة تمارين الجلسة التدريبية
 * @returns {Array} مصفوفة التمارين بعد إبقاء التمرين الأقوى حصراً لكل عضلة
 */
export function filterStrongestExercisePerMuscle(exercises) {
  if (!Array.isArray(exercises) || exercises.length <= 1) return exercises || [];

  const bestByMuscle = new Map();

  exercises.forEach((ex, idx) => {
    const name = ex.nameAr || ex.title || ex.name || '';
    const muscle = detectMuscleGroup(name, ex);
    const score = getExerciseStrengthScore(ex);

    if (!bestByMuscle.has(muscle)) {
      bestByMuscle.set(muscle, { ex, score, idx });
    } else {
      const current = bestByMuscle.get(muscle);
      if (score > current.score) {
        bestByMuscle.set(muscle, { ex, score, idx });
      }
    }
  });

  // الحفاظ على الترتيب الأصلي للظهور
  return Array.from(bestByMuscle.values())
    .sort((a, b) => a.idx - b.idx)
    .map(item => item.ex);
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

/**
 * ثوابت معدلات خسارة الوزن الأسبوعية (كنسبة من وزن الجسم)
 */
export const WEEKLY_LOSS_RATES = [
  {
    id: 'rate_025',
    value: 0.0025,
    percentText: '0.25%',
    label: 'هادئ',
    description: 'نزول بطيء ومستدام جدًا، مثالي للحفاظ التام على العضلات والأداء',
    riskLevel: 'mild',
    requiresConfirmation: false
  },
  {
    id: 'rate_050',
    value: 0.0050,
    percentText: '0.5%',
    label: 'معتدل',
    description: 'نزول متوازن ومريح مع استدامة عالية ومجهود مناسب',
    riskLevel: 'normal',
    requiresConfirmation: false
  },
  {
    id: 'rate_075',
    value: 0.0075,
    percentText: '0.75%',
    label: 'موصى به',
    isRecommended: true,
    description: 'المعدل الذهبي لأغلب المتدربين — أفضل توازن بين السرعة والحفاظ على الكتلة العضلية',
    riskLevel: 'optimal',
    requiresConfirmation: false
  },
  {
    id: 'rate_100',
    value: 0.0100,
    percentText: '1.0%',
    label: 'سريع',
    description: 'نزول قوي وواضح، يتطلب انضباطًا غذائيًا ومتابعة للطاقة',
    riskLevel: 'fast',
    requiresConfirmation: false
  },
  {
    id: 'rate_150',
    value: 0.0150,
    percentText: '1.5%',
    label: 'شديد',
    isAggressive: true,
    description: 'عجز قاسٍ، يناسب الأوزان العالية ولفترات قصيرة ومحددة مع زيادة البروتين',
    riskLevel: 'aggressive',
    requiresConfirmation: false
  },
  {
    id: 'rate_200',
    value: 0.0200,
    percentText: '2.0%',
    label: 'EXTREME ⚠️',
    isExtreme: true,
    description: 'أقصى معدل نزول ممكن — عجز شديد يتطلب تأكيدًا ومراقبة دقيقة للأعراض',
    riskLevel: 'extreme',
    requiresConfirmation: true
  }
];

/**
 * دالة التوصية الذكية بمعدل النزول الأسبوعي المناسب
 */
export function getRecommendedWeeklyLossRate(userData = {}) {
  const { weight = 75, height = 175 } = userData;
  const heightM = (height || 175) / 100;
  const bmi = (weight && heightM > 0) ? (weight / (heightM * heightM)) : 24;

  if (bmi < 21) {
    return WEEKLY_LOSS_RATES.find(r => r.value === 0.0025) || WEEKLY_LOSS_RATES[0];
  } else if (bmi >= 32) {
    return WEEKLY_LOSS_RATES.find(r => r.value === 0.0075) || WEEKLY_LOSS_RATES[2];
  }
  return WEEKLY_LOSS_RATES.find(r => r.value === 0.0075) || WEEKLY_LOSS_RATES[2];
}

/**
 * تقييم مخاطر هدف نزول الوزن
 */
export function evaluateWeightLossTarget({
  currentWeight = 75,
  targetWeight = 70,
  weeklyLossPercent = 0.0075,
  dailyDeficit = 500,
  requestedCalories = 2000,
  tdee = 2500,
  gender = 'male'
} = {}) {
  const minCalorieFloor = gender === 'female' ? 1200 : 1500;
  const deficitRatio = tdee > 0 ? (dailyDeficit / tdee) : 0.2;

  let riskLevel = 'normal';
  let requiresConfirmation = false;
  let badgeText = 'ضمن حدود الحساب الحالية ✅';
  let badgeClass = 'badge-normal';
  let warningText = '';

  if (weeklyLossPercent >= 0.02) {
    riskLevel = 'extreme';
    requiresConfirmation = true;
    badgeText = 'هدف شديد ⚠️';
    badgeClass = 'badge-extreme';
    warningText = 'نزول 2% أسبوعياً يمثل عجزاً شديداً قد يؤدي لخسارة عضلية، بطء في الأيض، أو إرهاق سريع. يتطلب التزاماً صارماً بمغذيات دقيقة وتأكيداً واعياً.';
  } else if (requestedCalories < minCalorieFloor || deficitRatio > 0.40) {
    riskLevel = 'high_risk';
    requiresConfirmation = true;
    badgeText = 'يتطلب حذرًا ⚠️';
    badgeClass = 'badge-warning';
    warningText = `السعرات الناتجة (${requestedCalories} سعرة) أقل من الحد الأدنى المقترح (${minCalorieFloor} سعرة) أو العجز يتجاوز 40% من طاقتك الكلية.`;
  } else if (weeklyLossPercent >= 0.015) {
    riskLevel = 'aggressive';
    requiresConfirmation = false;
    badgeText = 'نزول شديد';
    badgeClass = 'badge-aggressive';
    warningText = 'عجز مرتفع، يوصى به للأشخاص ذوي نسبة الدهون العالية ولفترة محددة مع رفع كمية البروتين.';
  } else if (weeklyLossPercent <= 0.0025) {
    riskLevel = 'mild';
    requiresConfirmation = false;
    badgeText = 'نزول هادئ ومستدام ✅';
    badgeClass = 'badge-mild';
    warningText = '';
  } else {
    riskLevel = 'optimal';
    requiresConfirmation = false;
    badgeText = 'ضمن حدود الحساب الحالية ✅';
    badgeClass = 'badge-optimal';
    warningText = '';
  }

  return {
    riskLevel,
    requiresConfirmation,
    badgeText,
    badgeClass,
    warningText,
    minCalorieFloor,
    deficitRatio: Math.round(deficitRatio * 100)
  };
}

export function calculateFatLossPlan({
  currentWeight = 75,
  targetWeight = 70,
  weeklyLossPercent = 0.0075,
  tdee = 2500,
  bmr = 1700,
  gender = 'male',
  age = 25
} = {}) {
  const weight = Number(currentWeight) || 75;
  const target = Number(targetWeight) || (weight - 5);
  const rate = Number(weeklyLossPercent) || 0.0075;

  const option = calculateWeightLossOption({
    currentWeightKg: weight,
    maintenanceCalories: tdee,
    weeklyRate: rate,
    sex: gender,
    age,
    targetWeightKg: target
  });

  const totalLossKg = Math.max(0, Math.round((weight - target) * 10) / 10);

  return {
    currentWeight: weight,
    targetWeight: target,
    weeklyLossPercent: rate,
    weeklyLossKg: option.weeklyLossKgRounded,
    weeklyDeficit: option.weeklyDeficitRounded,
    dailyDeficit: option.dailyDeficitRounded,
    requestedCalories: option.targetCaloriesRounded,
    totalLossKg,
    estimatedWeeks: option.estimatedWeeks,
    tdee: Math.round(tdee),
    bmr: Math.round(bmr),
    safety: option.safety,
    riskLevel: option.safety.safetyLevel,
    requiresConfirmation: option.safety.requiresConfirmation,
    badgeText: option.safety.badgeText,
    badgeClass: option.safety.badgeClass,
    warningText: option.safety.warningMessages.join(' '),
    minCalorieFloor: option.safety.guidanceMinimum,
    deficitRatio: Math.round((option.dailyDeficit / (tdee || 2500)) * 100)
  };
}

