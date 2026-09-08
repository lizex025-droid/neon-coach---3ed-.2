/**
 * NEON COACH - محرك توليد وتخصيص البرامج التدريبية
 * يولد برامج تدريبية متطابقة بدقة مع عدد الأيام المحددة (1-6 أيام)، والمعدات، وموانع الإصابات
 */

import { EXERCISES, getExerciseById } from '../data/exercises.js';

export const SPLIT_TEMPLATES = {
  1: {
    nameAr: 'يوم تدريبي شامل (Full Body)',
    days: [
      { nameAr: 'تمرين شامل لجميع العضلات', type: 'fullbody', focus: ['chest', 'back', 'legs', 'shoulders'] }
    ]
  },
  2: {
    nameAr: 'توزيع اليومين الشامل (Full Body A / B)',
    days: [
      { nameAr: 'تمرين شامل (أ)', type: 'fullbody_a', focus: ['chest', 'back', 'legs'] },
      { nameAr: 'تمرين شامل (ب)', type: 'fullbody_b', focus: ['shoulders', 'legs', 'arms', 'back'] }
    ]
  },
  3: {
    nameAr: 'توزيع 3 أيام شامل متدرج (Full Body A / B / C)',
    days: [
      { nameAr: 'شامل — تركيز سحب ودفع', type: 'fullbody_a', focus: ['chest', 'back', 'legs'] },
      { nameAr: 'شامل — تركيز أرجل وأكتاف', type: 'fullbody_b', focus: ['legs', 'shoulders', 'arms'] },
      { nameAr: 'شامل — تركيز قوة مركبة', type: 'fullbody_c', focus: ['back', 'chest', 'legs'] }
    ]
  },
  4: {
    nameAr: 'توزيع علوي / سفلي 4 أيام (Upper / Lower)',
    days: [
      { nameAr: 'الجزء العلوي (أ) — دفع وسحب', type: 'upper_a', focus: ['chest', 'back', 'arms'] },
      { nameAr: 'الجزء السفلي (أ) — أرجل وبطن', type: 'lower_a', focus: ['legs'] },
      { nameAr: 'الجزء العلوي (ب) — أكتاف وظهر وذراعين', type: 'upper_b', focus: ['shoulders', 'back', 'arms', 'chest'] },
      { nameAr: 'الجزء السفلي (ب) — تركيز خلفيات ومؤخرة', type: 'lower_b', focus: ['legs'] }
    ]
  },
  5: {
    nameAr: 'توزيع علوي / سفلي مع أيام تخصص 5 أيام',
    days: [
      { nameAr: 'صدر وترايسبس (دفع علوي)', type: 'push', focus: ['chest', 'arms'] },
      { nameAr: 'ظهر وبايسبس (سحب علوي)', type: 'pull', focus: ['back', 'arms'] },
      { nameAr: 'أرجل وبطن (سفلي مكثف)', type: 'legs', focus: ['legs'] },
      { nameAr: 'أكتاف وذراعين (عزل)', type: 'shoulders_arms', focus: ['shoulders', 'arms'] },
      { nameAr: 'تمرين شامل لزيادة الحرق والقوة', type: 'fullbody_hybrid', focus: ['chest', 'back', 'legs'] }
    ]
  },
  6: {
    nameAr: 'توزيع دفع / سحب / أرجل مرتين (PPL x 2)',
    days: [
      { nameAr: 'دفع 1 (صدر وأكتاف وترايسبس)', type: 'push_1', focus: ['chest', 'shoulders', 'arms'] },
      { nameAr: 'سحب 1 (ظهر وبايسبس)', type: 'pull_1', focus: ['back', 'arms'] },
      { nameAr: 'أرجل 1 (أمامي وخلفي وبطن)', type: 'legs_1', focus: ['legs'] },
      { nameAr: 'دفع 2 (تركيز أكتاف وصدر علوي)', type: 'push_2', focus: ['chest', 'shoulders', 'arms'] },
      { nameAr: 'سحب 2 (تركيز سماكة الظهر)', type: 'pull_2', focus: ['back', 'arms'] },
      { nameAr: 'أرجل 2 (تركيز خلفيات وقوة)', type: 'legs_2', focus: ['legs'] }
    ]
  }
};

/**
 * توليد خطة تدريبية مخصصة بناء على تفضيلات المستخدم
 */
export function generateTrainingPlan(preferences) {
  const daysPerWeek = Math.min(6, Math.max(1, Number(preferences.workoutDaysCount) || 4));
  const template = SPLIT_TEMPLATES[daysPerWeek] || SPLIT_TEMPLATES[4];
  const equipment = preferences.equipment || 'gym'; // 'gym' or 'home'
  const injuries = preferences.injuries || []; // e.g. ['shoulder', 'knee', 'lower_back']
  const sessionDurationMin = preferences.sessionDurationMin || 50;

  // توليد الجلسات التدريبية المطابقة تماماً لعدد الأيام
  const weeklyWorkouts = template.days.map((dayTemplate, index) => {
    // تصفية التمارين المناسبة وتجنب الإصابات
    const selectedExercises = EXERCISES.filter(ex => {
      // فحص المعدات إذا كان منزلي بدون أجهزة
      if (equipment === 'home' && (ex.equipment === 'cables' || ex.equipment === 'machine')) {
        return false;
      }
      // فحص الإصابات
      if (injuries.includes('shoulder') && ex.id === 'seated-dumbbell-shoulder-press') return false;
      if (injuries.includes('knee') && ex.id === 'barbell-squat') return false;
      if (injuries.includes('lower_back') && ex.id === 'romanian-deadlift') return false;

      // مطابقة تركيز اليوم
      return dayTemplate.focus.includes(ex.category);
    }).slice(0, sessionDurationMin <= 40 ? 4 : 6);

    return {
      dayIndex: index + 1,
      dayTitleAr: dayTemplate.nameAr,
      isRestDay: false,
      estimatedMinutes: sessionDurationMin,
      exercisesCount: selectedExercises.length,
      exercises: selectedExercises.map(ex => ({
        exerciseId: ex.id,
        nameAr: ex.nameAr,
        nameEn: ex.nameEn,
        equipment: ex.equipment,
        targetSets: ex.defaultSets,
        targetReps: ex.defaultReps,
        targetRpe: ex.defaultRpe,
        restSeconds: ex.defaultRestSec,
        completed: false
      }))
    };
  });

  return {
    templateNameAr: template.nameAr,
    daysPerWeek,
    workouts: weeklyWorkouts,
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    status: 'active'
  };
}

/**
 * اقتراح زيادة الوزن أو التكرار تدريجياً (Progressive Overload)
 * لا نقوم بزيادة عشوائية؛ نقترح الزيادة فقط إذا أكمل المتدرب كافة المجموعات مع RPE أقل من 8.5
 */
export function suggestProgression(lastPerformance) {
  if (!lastPerformance || !lastPerformance.sets || lastPerformance.sets.length === 0) {
    return { shouldIncrease: false, reason: 'لا توجد بيانات أداء سابقة كافية.' };
  }

  const allCompleted = lastPerformance.sets.every(s => s.completed);
  const avgRpe = lastPerformance.sets.reduce((sum, s) => sum + (Number(s.rpe) || 8), 0) / lastPerformance.sets.length;

  if (allCompleted && avgRpe <= 8.0) {
    return {
      shouldIncrease: true,
      recommendedWeightIncreaseKg: 2.5,
      reason: `تم إنجاز كافة المجموعات بمستوى جهد مريح (RPE ${avgRpe.toFixed(1)}). يُقترح زيادة 2.5 كغ في الجلسة القادمة.`
    };
  }

  return {
    shouldIncrease: false,
    recommendedWeightIncreaseKg: 0,
    reason: `الحفاظ على نفس الوزن الحالي لتثبيت التكنيك وإتقان المدى الحركي الكامل.`
  };
}
