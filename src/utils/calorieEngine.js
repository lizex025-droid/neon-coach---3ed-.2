/**
 * NEON COACH - Calorie Calculation Engine (Single Source of Truth)
 * Pure biological and mathematical calculations based on Mifflin-St Jeor & Standard Activity Multipliers.
 */

// Constant energy equivalent of 1 kg body mass (3500 kcal / 0.45 kg ≈ 7777.777777777778 kcal/kg)
export const KCAL_PER_KG = 3500 / 0.45;

/**
 * Standard Physical Activity Multipliers
 */
export const ACTIVITY_FACTORS = {
  bmr: 1.0,
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.465,
  active: 1.55,
  veryActive: 1.725,
  extraActive: 1.9,
};

/**
 * UI Mapping for Activity Levels with Arabic labels and precise descriptions
 */
export const ACTIVITY_UI_MAP = {
  sedentary: {
    factor: 1.2,
    label: 'مكتبي / قليل الحركة جداً',
    description: 'أعمال مكتبية بدون تمارين أو حركة قليلة (1.200)',
    daysText: 'بدون تمارين'
  },
  light: {
    factor: 1.375,
    label: 'نشاط خفيف (1-3 أيام/أسبوع)',
    description: 'تمارين خفيفة أو مشي منتظم 1-3 مرات أسبوعياً (1.375)',
    daysText: '1-3 أيام'
  },
  moderate: {
    factor: 1.465,
    label: 'نشاط متوسط (4-5 أيام/أسبوع)',
    description: 'تمارين متوسطة الشدة 4-5 مرات أسبوعياً (1.465)',
    daysText: '4-5 أيام'
  },
  active: {
    factor: 1.55,
    label: 'نشاط عالي (يومي / تمارين مكثفة 3-4 أيام)',
    description: 'تمارين شاقة يومياً أو عمل بدني نشط (1.550)',
    daysText: 'يومي أو مكثف'
  },
  veryActive: {
    factor: 1.725,
    label: 'نشاط عالي جداً (تمارين مكثفة 6-7 أيام)',
    description: 'تمارين شاقة جداً 6-7 مرات أسبوعياً أو وظيفة شاقة (1.725)',
    daysText: '6-7 أيام شاقة'
  },
  extraActive: {
    factor: 1.9,
    label: 'نشاط استثنائي (رياضي محترف / عمل شاق جداً)',
    description: 'تدريب احترافي مرتين باليوم أو عمل بدني ثقيل يومياً (1.900)',
    daysText: 'رياضي محترف'
  }
};

/**
 * 6 Standard Weekly Loss Rate Options (as percentage of body weight)
 */
export const WEEKLY_LOSS_OPTIONS = [
  {
    id: 'rate_025',
    rate: 0.0025,
    percent: 0.25,
    percentText: '0.25%',
    label: 'بطيء جداً',
    speedCategory: 'gentle',
    description: 'أسهل في الالتزام، خسارة بطيئة ومستدامة بأقل مجهود',
    tag: 'مستدام',
    riskLevel: 'mild',
    requiresConfirmation: false
  },
  {
    id: 'rate_050',
    rate: 0.0050,
    percent: 0.50,
    percentText: '0.5%',
    label: 'معتدل - هادئ',
    speedCategory: 'moderate',
    description: 'نزول متوازن ومريح مع استدامة عالية ومجهود مناسب',
    tag: 'متوازن',
    riskLevel: 'normal',
    requiresConfirmation: false
  },
  {
    id: 'rate_075',
    rate: 0.0075,
    percent: 0.75,
    percentText: '0.75%',
    label: 'معتدل (موصى به)',
    speedCategory: 'recommended',
    description: 'المعدل الذهبي: أفضل توازن بين سرعة النزول والحفاظ على العضلات',
    tag: 'موصى به ⭐',
    isRecommended: true,
    riskLevel: 'optimal',
    requiresConfirmation: false
  },
  {
    id: 'rate_100',
    rate: 0.0100,
    percent: 1.00,
    percentText: '1.0%',
    label: 'سريع',
    speedCategory: 'fast',
    description: 'نزول سريع وقوي، يتطلب التزاماً غذائياً أعلى ومتابعة للطاقة',
    tag: 'سريع',
    riskLevel: 'fast',
    requiresConfirmation: false
  },
  {
    id: 'rate_150',
    rate: 0.0150,
    percent: 1.50,
    percentText: '1.5%',
    label: 'سريع جداً',
    speedCategory: 'aggressive',
    description: 'عجز قاسٍ، يحتاج تركيزاً كبيراً على البروتين ولفترات محددة',
    tag: 'تحدي 🔥',
    isAggressive: true,
    riskLevel: 'aggressive',
    requiresConfirmation: false
  },
  {
    id: 'rate_200',
    rate: 0.0200,
    percent: 2.00,
    percentText: '2.0%',
    label: 'أقصى نزول (EXTREME)',
    speedCategory: 'extreme',
    description: 'أقصى معدل نزول — عجز شديد جداً قد يؤثر على الكتلة العضلية أو النشاط ويتطلب إقراراً',
    tag: 'EXTREME ⚠️',
    isExtreme: true,
    riskLevel: 'extreme',
    requiresConfirmation: true
  }
];

/**
 * 6 Standard Weekly Muscle / Weight Gain Rate Options (as percentage of body weight)
 */
export const WEEKLY_GAIN_OPTIONS = [
  {
    id: 'gain_025',
    rate: 0.0025,
    percent: 0.25,
    percentText: '0.25%',
    label: 'بطيء ونقي (Lean Bulk)',
    speedCategory: 'gentle',
    description: 'بناء عضلي نقي بأقل زيادة دهون ممكنة، أسهل في الهضم وأكثر استدامة',
    tag: 'نقي ومستدام 🛡️',
    riskLevel: 'mild',
    requiresConfirmation: false
  },
  {
    id: 'gain_050',
    rate: 0.0050,
    percent: 0.50,
    percentText: '0.5%',
    label: 'معتدل (موصى به)',
    speedCategory: 'recommended',
    description: 'المعدل الذهبي للبناء العضلي: تضخيم ممتاز وتطور ملحوظ في القوة مع دهون دنيا',
    tag: 'موصى به ⭐',
    isRecommended: true,
    riskLevel: 'optimal',
    requiresConfirmation: false
  },
  {
    id: 'gain_075',
    rate: 0.0075,
    percent: 0.75,
    percentText: '0.75%',
    label: 'نشط (Steady Bulk)',
    speedCategory: 'steady',
    description: 'زيادة سريعة ونشطة، مثالية للأجسام النحيفة أو من يجد صعوبة في زيادة الوزن',
    tag: 'نشط 🚀',
    riskLevel: 'normal',
    requiresConfirmation: false
  },
  {
    id: 'gain_100',
    rate: 0.0100,
    percent: 1.00,
    percentText: '1.0%',
    label: 'سريع (Hardgainer)',
    speedCategory: 'fast',
    description: 'زيادة وزن قوية وسريعة للأجسام سريعة الحرق، تتطلب وجبات عالية الكثافة وسعرات فائضة',
    tag: 'سريع ⚡',
    riskLevel: 'fast',
    requiresConfirmation: false
  },
  {
    id: 'gain_150',
    rate: 0.0150,
    percent: 1.50,
    percentText: '1.5%',
    label: 'سريع جداً (Aggressive)',
    speedCategory: 'aggressive',
    description: 'تضخيم مكثف وفائض حراري كبير لزيادة سريعة للوزن، قد يصاحبه زيادة في نسبة الدهون',
    tag: 'تحدي تضخيم 🔥',
    isAggressive: true,
    riskLevel: 'aggressive',
    requiresConfirmation: false
  },
  {
    id: 'gain_200',
    rate: 0.0200,
    percent: 2.00,
    percentText: '2.0%',
    label: 'أقصى زيادة (EXTREME BULK)',
    speedCategory: 'extreme',
    description: 'أقصى معدل زيادة وزن — فائض سعري ضخم جداً يتطلب تدريباً شاقاً لتوجيه الطاقة نحو العضلات',
    tag: 'EXTREME ⚠️',
    isExtreme: true,
    riskLevel: 'extreme',
    requiresConfirmation: true
  }
];


/**
 * Calculate Basal Metabolic Rate (BMR) using Mifflin-St Jeor formula without intermediate rounding.
 * Supports both object signature ({ sex, age, weightKg, heightCm }) and positional (weightKg, heightCm, age, gender).
 */
export function calculateBMR(arg1, arg2, arg3, arg4) {
  let sex = 'male';
  let age = 25;
  let weightKg = 70;
  let heightCm = 175;

  if (typeof arg1 === 'object' && arg1 !== null) {
    sex = (arg1.sex || arg1.gender || 'male').toString().toLowerCase();
    age = Number(arg1.age) || 25;
    weightKg = Number(arg1.weightKg ?? arg1.weight) || 70;
    heightCm = Number(arg1.heightCm ?? arg1.height) || 175;
  } else {
    weightKg = Number(arg1) || 70;
    heightCm = Number(arg2) || 175;
    age = Number(arg3) || 25;
    sex = (arg4 || 'male').toString().toLowerCase();
  }

  const isFemale = sex === 'female' || sex === 'f' || sex === 'أنثى' || sex === 'انثى';
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return isFemale ? (base - 161) : (base + 5);
}

/**
 * Resolve activity factor from number or string key
 */
export function resolveActivityFactor(activityLevelOrFactor) {
  if (typeof activityLevelOrFactor === 'number' && !isNaN(activityLevelOrFactor) && activityLevelOrFactor > 0) {
    return activityLevelOrFactor;
  }
  if (typeof activityLevelOrFactor === 'string') {
    const key = activityLevelOrFactor.trim();
    if (ACTIVITY_FACTORS[key] !== undefined) {
      return ACTIVITY_FACTORS[key];
    }
    if (ACTIVITY_UI_MAP[key]?.factor !== undefined) {
      return ACTIVITY_UI_MAP[key].factor;
    }
    const parsed = parseFloat(key);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return ACTIVITY_FACTORS.moderate; // default 1.465
}

/**
 * Calculate Total Daily Energy Expenditure (Maintenance Calories)
 * Raw multiplication without intermediate rounding.
 */
export function calculateMaintenanceCalories(bmr, activityLevelOrFactor = 'moderate') {
  const factor = resolveActivityFactor(activityLevelOrFactor);
  const rawBmr = typeof bmr === 'number' ? bmr : Number(bmr) || 1500;
  return rawBmr * factor;
}

/**
 * Calculate weekly weight loss in kilograms
 */
export function calculateWeeklyLossKg(currentWeightKg, weeklyRate) {
  const weight = Number(currentWeightKg) || 70;
  const rate = Number(weeklyRate) || 0.0075;
  return weight * rate;
}

/**
 * Calculate estimated weeks to reach goal weight
 */
export function calculateEstimatedWeeks({ currentWeightKg, targetWeightKg, weeklyLossKg }) {
  const current = Number(currentWeightKg);
  const target = Number(targetWeightKg);
  const loss = Number(weeklyLossKg);

  if (!current || !target || !loss || loss <= 0 || current <= target) {
    return null;
  }

  const weightToLose = current - target;
  const weeks = weightToLose / loss;
  return Math.round(weeks * 10) / 10;
}

/**
 * Evaluate safety and physiological guidance limits for a given target
 */
export function evaluateCalorieTarget({
  sex = 'male',
  maintenanceCalories = 2400,
  dailyDeficit = 500,
  requestedTargetCalories = 1900,
  weeklyRate = 0.0075,
  age = 25
} = {}) {
  const isFemale = (sex || 'male').toString().toLowerCase() === 'female' ||
    (sex || 'male').toString().toLowerCase() === 'f' ||
    sex === 'أنثى' || sex === 'انثى';
  const guidanceMinimum = isFemale ? 1200 : 1500;

  const isBelowMinimum = requestedTargetCalories < guidanceMinimum;
  const isDeficitOver1000 = dailyDeficit > 1000;
  const isExtreme = weeklyRate >= 0.02;
  const isUnder18 = Number(age) > 0 && Number(age) < 18;
  const isUnder18Restricted = isUnder18 && weeklyRate > 0.01;

  const warningCodes = [];
  const warningMessages = [];

  if (isBelowMinimum) {
    warningCodes.push('BELOW_GUIDANCE_MINIMUM');
    warningMessages.push(`السعرات اليومية المقترحة (${Math.round(requestedTargetCalories)} سعرة) أقل من الحد الأدنى الإرشادي للصحة (${guidanceMinimum} سعرة). يُنصح باختيار معدل نزول أهدأ أو زيادة النشاط الحركي لرفع سعرات الثبات.`);
  }

  if (isDeficitOver1000) {
    warningCodes.push('DEFICIT_OVER_1000');
    warningMessages.push(`العجز اليومي (${Math.round(dailyDeficit)} سعرة) يتجاوز 1000 سعرة يومياً، وهو عجز حاد قد يزيد من احتمالية الإرهاق أو فقدان الكتلة العضلية.`);
  }

  if (isExtreme) {
    warningCodes.push('EXTREME_RATE');
    warningMessages.push('معدل 2.0% نزول شديد جداً ومكثف. يتطلب التزاماً صارماً بمغذيات دقيقة وإقراراً واعياً.');
  }

  if (isUnder18Restricted) {
    warningCodes.push('UNDER_18_RESTRICTION');
    warningMessages.push('نظراً لأن عمرك دون 18 عاماً، يُنصح بمعدلات نزول معتدلة (1% أو أقل) لدعم النمو الطبيعي وصحة المراهقين.');
  }

  let safetyLevel = 'optimal';
  let badgeText = 'ضمن حدود الحساب الحالية ✅';
  let badgeClass = 'badge-optimal';

  if (isExtreme || (isBelowMinimum && dailyDeficit > 800)) {
    safetyLevel = 'extreme';
    badgeText = 'هدف شديد ⚠️';
    badgeClass = 'badge-extreme';
  } else if (isBelowMinimum || isDeficitOver1000) {
    safetyLevel = 'caution';
    badgeText = 'يتطلب حذرًا ⚠️';
    badgeClass = 'badge-warning';
  } else if (weeklyRate >= 0.015) {
    safetyLevel = 'aggressive';
    badgeText = 'نزول شديد';
    badgeClass = 'badge-aggressive';
  } else if (weeklyRate <= 0.0025) {
    safetyLevel = 'mild';
    badgeText = 'نزول هادئ ومستدام ✅';
    badgeClass = 'badge-mild';
  }

  return {
    safetyLevel,
    guidanceMinimum,
    isBelowMinimum,
    isDeficitOver1000,
    isExtreme,
    isUnder18Restricted,
    requiresConfirmation: isExtreme || (isBelowMinimum && isDeficitOver1000),
    warningCodes,
    warningMessages,
    badgeText,
    badgeClass,
    advice: isBelowMinimum ? `الحد الإرشادي الآمن لجسمك هو ${guidanceMinimum} سعرة على الأقل.` : ''
  };
}

/**
 * Calculate weight loss metrics for a single option
 */
export function calculateWeightLossOption({
  currentWeightKg = 70,
  maintenanceCalories = 2400,
  weeklyRate = 0.0075,
  sex = 'male',
  age = 25,
  targetWeightKg = null
}) {
  const weight = Number(currentWeightKg) || 70;
  const maintenance = Number(maintenanceCalories) || 2400;
  const rate = Number(weeklyRate) || 0.0075;

  const weeklyLossKg = weight * rate;
  const weeklyDeficit = weeklyLossKg * KCAL_PER_KG;
  const dailyDeficit = weeklyDeficit / 7;
  const requestedTargetCalories = maintenance - dailyDeficit;

  const safety = evaluateCalorieTarget({
    sex,
    maintenanceCalories: maintenance,
    dailyDeficit,
    requestedTargetCalories,
    weeklyRate: rate,
    age
  });

  const estimatedWeeks = calculateEstimatedWeeks({
    currentWeightKg: weight,
    targetWeightKg,
    weeklyLossKg
  });

  // Find option meta if available
  const optionMeta = WEEKLY_LOSS_OPTIONS.find(o => Math.abs(o.rate - rate) < 0.0001) || {
    rate,
    percent: rate * 100,
    percentText: `${(rate * 100).toFixed(2)}%`,
    label: 'مخصص',
    description: '',
    tag: ''
  };

  const isUnder18 = Number(age) > 0 && Number(age) < 18;
  const isUnder18Disabled = isUnder18 && rate > 0.01;

  return {
    ...optionMeta,
    weeklyLossKg,
    weeklyLossKgRounded: Number(weeklyLossKg.toFixed(2)),
    weeklyDeficit,
    weeklyDeficitRounded: Math.round(weeklyDeficit),
    dailyDeficit,
    dailyDeficitRounded: Math.round(dailyDeficit),
    requestedTargetCalories,
    targetCaloriesRounded: Math.round(requestedTargetCalories),
    estimatedWeeks,
    safety,
    isUnder18Disabled,
    raw: {
      weeklyLossKg,
      weeklyDeficit,
      dailyDeficit,
      requestedTargetCalories
    }
  };
}

/**
 * Calculate all 6 weight loss rate options for the given profile
 */
export function calculateAllWeightLossOptions({
  currentWeightKg = 70,
  maintenanceCalories = 2400,
  sex = 'male',
  age = 25,
  targetWeightKg = null
}) {
  return WEEKLY_LOSS_OPTIONS.map(opt => {
    return calculateWeightLossOption({
      currentWeightKg,
      maintenanceCalories,
      weeklyRate: opt.rate,
      sex,
      age,
      targetWeightKg
    });
  });
}

/**
 * Smart recommendation logic for default rate
 */
export function getRecommendedWeeklyLossRate(userData = {}) {
  const age = Number(userData.age) || 25;
  if (age < 18) {
    return WEEKLY_LOSS_OPTIONS.find(r => r.rate === 0.005) || WEEKLY_LOSS_OPTIONS[1];
  }
  return WEEKLY_LOSS_OPTIONS.find(r => r.rate === 0.0075) || WEEKLY_LOSS_OPTIONS[2];
}

/**
 * Calculate weekly weight gain in kilograms
 */
export function calculateWeeklyGainKg(currentWeightKg, weeklyRate) {
  const weight = Number(currentWeightKg) || 70;
  const rate = Number(weeklyRate) || 0.0050;
  return weight * rate;
}

/**
 * Calculate estimated weeks to reach goal weight for weight gain
 */
export function calculateEstimatedGainWeeks({ currentWeightKg, targetWeightKg, weeklyGainKg }) {
  const current = Number(currentWeightKg);
  const target = Number(targetWeightKg);
  const gain = Number(weeklyGainKg);

  if (!current || !target || !gain || gain <= 0 || current >= target) {
    return null;
  }

  const weightToGain = target - current;
  const weeks = weightToGain / gain;
  return Math.round(weeks * 10) / 10;
}

/**
 * Evaluate safety and physiological guidance limits for weight/muscle gain
 */
export function evaluateGainCalorieTarget({
  maintenanceCalories = 2400,
  dailySurplus = 400,
  requestedTargetCalories = 2800,
  weeklyRate = 0.005,
  age = 25
} = {}) {
  const isSurplusOver1000 = dailySurplus > 1000;
  const isExtreme = weeklyRate >= 0.02;
  const isUnder18 = Number(age) > 0 && Number(age) < 18;
  const isUnder18Restricted = isUnder18 && weeklyRate > 0.01;

  const warningCodes = [];
  const warningMessages = [];

  if (isSurplusOver1000) {
    warningCodes.push('SURPLUS_OVER_1000');
    warningMessages.push(`الفائض اليومي (+${Math.round(dailySurplus)} سعرة) يتجاوز 1000 سعرة يومياً، وهو فائض مرتفع جداً قد يزيد من تخزين الدهون بجانب البناء العضلي.`);
  }

  if (isExtreme) {
    warningCodes.push('EXTREME_GAIN_RATE');
    warningMessages.push('معدل 2.0% زيادة فائقة وقوية جداً. يتطلب تمريناً رياضياً مكثفاً ومتابعة دورية لتجنب اكتساب دهون فائضة.');
  }

  if (isUnder18Restricted) {
    warningCodes.push('UNDER_18_RESTRICTION');
    warningMessages.push('نظراً لأن عمرك دون 18 عاماً، يُنصح بمعدلات زيادة معتدلة (1% أو أقل) لدعم النمو والتوازن الهرموني الطبيعي.');
  }

  let safetyLevel = 'optimal';
  let badgeText = 'ضمن حدود النمو المتوازن ✅';
  let badgeClass = 'badge-optimal';

  if (isExtreme || (isSurplusOver1000 && weeklyRate >= 0.015)) {
    safetyLevel = 'extreme';
    badgeText = 'تضخيم مكثف ⚠️';
    badgeClass = 'badge-extreme';
  } else if (isSurplusOver1000) {
    safetyLevel = 'caution';
    badgeText = 'يتطلب تمرين شاق ⚠️';
    badgeClass = 'badge-warning';
  } else if (weeklyRate >= 0.01) {
    safetyLevel = 'fast';
    badgeText = 'زيادة نشطة وسريعة ⚡';
    badgeClass = 'badge-aggressive';
  } else if (weeklyRate <= 0.0025) {
    safetyLevel = 'mild';
    badgeText = 'زيادة نقية ومستدامة ✅';
    badgeClass = 'badge-mild';
  }

  return {
    safetyLevel,
    isSurplusOver1000,
    isExtreme,
    isUnder18Restricted,
    requiresConfirmation: isExtreme || isSurplusOver1000,
    warningCodes,
    warningMessages,
    badgeText,
    badgeClass
  };
}

/**
 * Calculate weight/muscle gain metrics for a single option
 */
export function calculateWeightGainOption({
  currentWeightKg = 70,
  maintenanceCalories = 2400,
  weeklyRate = 0.0050,
  sex = 'male',
  age = 25,
  targetWeightKg = null
}) {
  const weight = Number(currentWeightKg) || 70;
  const maintenance = Number(maintenanceCalories) || 2400;
  const rate = Number(weeklyRate) || 0.0050;

  const weeklyGainKg = weight * rate;
  const weeklySurplus = weeklyGainKg * KCAL_PER_KG;
  const dailySurplus = weeklySurplus / 7;
  const requestedTargetCalories = maintenance + dailySurplus;

  const safety = evaluateGainCalorieTarget({
    maintenanceCalories: maintenance,
    dailySurplus,
    requestedTargetCalories,
    weeklyRate: rate,
    age
  });

  const estimatedWeeks = calculateEstimatedGainWeeks({
    currentWeightKg: weight,
    targetWeightKg,
    weeklyGainKg
  });

  const optionMeta = WEEKLY_GAIN_OPTIONS.find(o => Math.abs(o.rate - rate) < 0.0001) || {
    rate,
    percent: rate * 100,
    percentText: `${(rate * 100).toFixed(2)}%`,
    label: 'مخصص',
    description: '',
    tag: ''
  };

  const isUnder18 = Number(age) > 0 && Number(age) < 18;
  const isUnder18Disabled = isUnder18 && rate > 0.01;

  return {
    ...optionMeta,
    weeklyGainKg,
    weeklyGainKgRounded: Number(weeklyGainKg.toFixed(2)),
    weeklySurplus,
    weeklySurplusRounded: Math.round(weeklySurplus),
    dailySurplus,
    dailySurplusRounded: Math.round(dailySurplus),
    requestedTargetCalories,
    targetCaloriesRounded: Math.round(requestedTargetCalories),
    estimatedWeeks,
    safety,
    isUnder18Disabled,
    raw: {
      weeklyGainKg,
      weeklySurplus,
      dailySurplus,
      requestedTargetCalories
    }
  };
}

/**
 * Calculate all 6 weight gain rate options for the given profile
 */
export function calculateAllWeightGainOptions({
  currentWeightKg = 70,
  maintenanceCalories = 2400,
  sex = 'male',
  age = 25,
  targetWeightKg = null
}) {
  return WEEKLY_GAIN_OPTIONS.map(opt => {
    return calculateWeightGainOption({
      currentWeightKg,
      maintenanceCalories,
      weeklyRate: opt.rate,
      sex,
      age,
      targetWeightKg
    });
  });
}

/**
 * Smart recommendation logic for default gain rate
 */
export function getRecommendedWeeklyGainRate(userData = {}) {
  const age = Number(userData.age) || 25;
  if (age < 18) {
    return WEEKLY_GAIN_OPTIONS.find(r => r.rate === 0.0025) || WEEKLY_GAIN_OPTIONS[0];
  }
  return WEEKLY_GAIN_OPTIONS.find(r => r.rate === 0.0050) || WEEKLY_GAIN_OPTIONS[1];
}

