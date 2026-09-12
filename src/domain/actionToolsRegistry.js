/**
 * NEON ACTION AGENT - سجل الأدوات المحددة والصارمة (Typed Action Tools Registry)
 * يحتوي على جميع الأدوات المسموح بها مع التحقق من المعاملات، ودعم الـ Inverse Action لكل أداة لضمان التراجع الدقيق.
 * لا يسمح بأي أوامر SQL أو أكواد تنفيذية غير آمنة.
 */

import { FOOD_ITEMS } from '../data/foods.js';
import { EXERCISES } from '../data/exercises.js';

export const ALL_ACTION_TOOLS = [
  'logMeal',
  'updateMeal',
  'deleteMeal',
  'logWater',
  'updateWater',
  'logWeight',
  'updateWeight',
  'logBodyMeasurement',
  'logWorkoutSet',
  'logWorkoutSets',
  'completeWorkout',
  'updateWorkoutSet',
  'deleteWorkoutSet',
  'logSupplement',
  'markSupplementTaken',
  'logSteps',
  'logSleep',
  'logMood',
  'logEnergy',
  'logCardio',
  'logInBody',
  'addShoppingItem',
  'addShoppingItems',
  'removeShoppingItem',
  'getTodayNutrition',
  'getTodayWorkout',
  'getTodayWater',
  'getTodaySupplements',
  'getTodaySummary',
  'getUserProfile',
  'undoLastAction',
  'stopVoiceSession'
];

export const WRITE_ACTION_TOOLS = new Set([
  'logMeal',
  'updateMeal',
  'deleteMeal',
  'logWater',
  'updateWater',
  'logWeight',
  'updateWeight',
  'logBodyMeasurement',
  'logWorkoutSet',
  'logWorkoutSets',
  'completeWorkout',
  'updateWorkoutSet',
  'deleteWorkoutSet',
  'logSupplement',
  'markSupplementTaken',
  'logSteps',
  'logSleep',
  'logMood',
  'logEnergy',
  'logCardio',
  'logInBody',
  'addShoppingItem',
  'addShoppingItems',
  'removeShoppingItem',
  'undoLastAction'
]);

export function isWriteActionTool(toolName) {
  return WRITE_ACTION_TOOLS.has(toolName);
}

export const TOOL_SCHEMAS = {
  logMeal: {
    description: 'تسجيل وجبة غذائية بالأصناف والغرامات وحساب الماكروز',
    parameters: ['items'], // items: [{ foodName, foodId, grams, calories, protein, carbs, fats, isEstimated }]
    category: 'nutrition'
  },
  logWater: {
    description: 'إضافة كمية ماء مستهلكة بالملليلتر أو الأكواب',
    parameters: ['milliliters'],
    category: 'water'
  },
  updateWater: {
    description: 'تعديل أو تصحيح إجمالي كمية ماء اليوم',
    parameters: ['milliliters'],
    category: 'water'
  },
  logWeight: {
    description: 'تسجيل وزن الجسم الحالي بالكيلوغرام',
    parameters: ['weightKg'],
    category: 'weight'
  },
  updateWeight: {
    description: 'تصحيح وزن اليوم',
    parameters: ['weightKg'],
    category: 'weight'
  },
  logBodyMeasurement: {
    description: 'تسجيل قياسات الجسم بالسنتيمتر (خصر، صدر، إلخ)',
    parameters: ['waistCm', 'chestCm', 'hipsCm', 'armsCm', 'thighsCm'],
    category: 'measurements'
  },
  logWorkoutSet: {
    description: 'تسجيل مجموعة تدريبية واحدة (تمرين، وزن، عدات)',
    parameters: ['exercise', 'weightKg', 'reps'],
    category: 'workout'
  },
  logWorkoutSets: {
    description: 'تسجيل عدة جولات لتمرين معين مع الوزن والعدات',
    parameters: ['exercise', 'weightKg', 'sets', 'reps'],
    category: 'workout'
  },
  completeWorkout: {
    description: 'تسجيل إتمام وإنهاء جلسة التدريب اليومية',
    parameters: ['title'],
    category: 'workout'
  },
  logSupplement: {
    description: 'تسجيل مكمل وتناوله',
    parameters: ['supplement', 'dose', 'timing'],
    category: 'supplements'
  },
  markSupplementTaken: {
    description: 'تحديد مكمل كتم تناوله في جدول المكملات اليومية',
    parameters: ['supplement', 'dose'],
    category: 'supplements'
  },
  logSteps: {
    description: 'تسجيل عدد الخطوات اليومية',
    parameters: ['stepsCount'],
    category: 'lifestyle'
  },
  logSleep: {
    description: 'تسجيل عدد ساعات النوم',
    parameters: ['sleepHours'],
    category: 'lifestyle'
  },
  logMood: {
    description: 'تسجيل الحالة المزاجية',
    parameters: ['mood'],
    category: 'lifestyle'
  },
  logEnergy: {
    description: 'تسجيل مستوى الطاقة (1 إلى 5)',
    parameters: ['energyLevel'],
    category: 'lifestyle'
  },
  logCardio: {
    description: 'تسجيل تمرين هوائي أو كارديو',
    parameters: ['cardioType', 'durationMinutes', 'distanceKm', 'caloriesBurned'],
    category: 'cardio'
  },
  logInBody: {
    description: 'تسجيل نتائج فحص InBody (دهون، عضل، ماء)',
    parameters: ['weight', 'bodyFatPercentage', 'skeletalMuscleMassKg', 'visceralFatLevel'],
    category: 'inbody'
  },
  addShoppingItem: {
    description: 'إضافة عنصر لقائمة التسوق',
    parameters: ['name', 'quantity', 'category'],
    category: 'shopping'
  },
  addShoppingItems: {
    description: 'إضافة عدة عناصر لقائمة التسوق دفعة واحدة',
    parameters: ['names'],
    category: 'shopping'
  },
  removeShoppingItem: {
    description: 'حذف عنصر من قائمة التسوق',
    parameters: ['name'],
    category: 'shopping'
  },
  getTodayNutrition: {
    description: 'استعلام عن التغذية وسعرات وماكروز اليوم',
    parameters: [],
    category: 'query'
  },
  getTodayWorkout: {
    description: 'استعلام عن تمرين اليوم وحالته',
    parameters: [],
    category: 'query'
  },
  getTodayWater: {
    description: 'استعلام عن استهلاك الماء اليوم والهدف',
    parameters: [],
    category: 'query'
  },
  getTodaySupplements: {
    description: 'استعلام عن المكملات المأخوذة والمتبقية',
    parameters: [],
    category: 'query'
  },
  getTodaySummary: {
    description: 'استعلام شامل عن ملخص يوم المتدرب بالكامل',
    parameters: [],
    category: 'query'
  },
  getUserProfile: {
    description: 'استعلام عن أهداف المتدرب وبياناته',
    parameters: [],
    category: 'query'
  },
  undoLastAction: {
    description: 'التراجع عن آخر إجراء تم تنفيذه واستعادة الحالة السابقة',
    parameters: [],
    category: 'control'
  },
  stopVoiceSession: {
    description: 'إيقاف جلسة الاستماع الصوتي وإغلاق الميكروفون',
    parameters: [],
    category: 'control'
  }
};

/**
 * التحقق من صحة معاملات الأداة قبل تنفيذها
 */
export function validateToolArgs(toolName, args = {}) {
  if (!ALL_ACTION_TOOLS.includes(toolName)) {
    throw new Error(`أداة غير مسموحة: ${toolName}`);
  }

  switch (toolName) {
    case 'logWater':
    case 'updateWater': {
      const ml = Number(args.milliliters);
      if (isNaN(ml) || ml <= 0 || ml > 8000) {
        throw new Error('كمية الماء غير صالحة (يجب أن تكون بين 1 و 8000 مل)');
      }
      break;
    }
    case 'logWeight':
    case 'updateWeight': {
      const w = Number(args.weightKg);
      if (isNaN(w) || w < 20 || w > 400) {
        throw new Error('وزن الجسم غير صالح (بين 20 و 400 كغ)');
      }
      break;
    }
    case 'logWorkoutSet': {
      if (!args.exercise || typeof args.exercise !== 'string') {
        throw new Error('اسم التمرين مطلوب');
      }
      const weight = Number(args.weightKg);
      const reps = Number(args.reps);
      if (isNaN(weight) || weight < 0 || weight > 800) {
        throw new Error('وزن التمرين غير صالح');
      }
      if (!Number.isInteger(reps) || reps < 1 || reps > 250) {
        throw new Error('عدد التكرارات يجب أن يكون عدداً صحيحاً بين 1 و 250');
      }
      break;
    }
    case 'logWorkoutSets': {
      if (!args.exercise || typeof args.exercise !== 'string') {
        throw new Error('اسم التمرين مطلوب');
      }
      const weight = Number(args.weightKg);
      const sets = Number(args.sets);
      const reps = Number(args.reps);
      if (isNaN(weight) || weight < 0 || weight > 800) {
        throw new Error('وزن التمرين غير صالح');
      }
      if (!Number.isInteger(sets) || sets < 1 || sets > 30) {
        throw new Error('عدد الجولات يجب أن يكون بين 1 و 30');
      }
      if (!Number.isInteger(reps) || reps < 1 || reps > 250) {
        throw new Error('عدد التكرارات يجب أن يكون بين 1 و 250');
      }
      break;
    }
    case 'logSteps': {
      const steps = Number(args.stepsCount);
      if (isNaN(steps) || steps < 0 || steps > 150000) {
        throw new Error('عدد الخطوات غير صالح');
      }
      break;
    }
    case 'logSleep': {
      const hours = Number(args.sleepHours);
      if (isNaN(hours) || hours < 0 || hours > 24) {
        throw new Error('ساعات النوم غير صالحة');
      }
      break;
    }
    case 'logEnergy': {
      const energy = Number(args.energyLevel);
      if (isNaN(energy) || energy < 1 || energy > 5) {
        throw new Error('مستوى الطاقة يجب أن يكون بين 1 و 5');
      }
      break;
    }
  }

  return true;
}
