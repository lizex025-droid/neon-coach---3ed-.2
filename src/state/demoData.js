/**
 * NEON COACH - البيانات التجريبية المتكاملة (Demo Data)
 * متطابقة تماماً مع قيم الصور المرجعية العشر وشخصية المتدرب "أحمد"
 */

import { DEFAULT_MEALS } from '../data/foods.js';

export const INITIAL_DEMO_DATA = {
  isDemoMode: true,
  currentRole: 'client', // 'client' or 'coach'

  // ملف المستخدم الشخصي
  userProfile: {
    id: 'user-ahmed-01',
    name: 'أحمد',
    email: 'ahmed@neoncoach.app',
    gender: 'male',
    birthDate: '2001-08-24', // كما في الصورة 2
    age: 25,
    height: 187, // سم
    startWeight: 129, // كغ (كما في صورة التقرير)
    currentWeight: 101.4, // كغ (كما في صورة المتابعة الأسبوعية)
    targetWeight: 90, // كغ (كما في صورة الهدف)
    unitSystem: 'metric', // 'metric' or 'imperial'
    goal: 'fat_loss', // خسارة الدهون
    activityLevel: 'light', // نشاط قليل (1-3 أيام)
    workoutDaysCount: 4,
    preferredDays: ['الأحد', 'الثلاثاء', 'الخميس', 'السبت'],
    equipment: 'gym',
    sessionDurationMin: 50,
    experienceLevel: 'intermediate',
    injuries: [],
    allergens: [],
    likedFoods: ['دجاج', 'أرز', 'بيض'],
    dislikedFoods: ['سمك', 'بروكلي'],
    supplementsBudget: 'medium',
    registeredAt: '2026-06-01T00:00:00.000Z'
  },

  // أهداف اليوم المسجلة (مطابقة تماماً لصورة اليوم 9C561622)
  today: {
    date: new Date().toISOString().split('T')[0],
    targetCalories: 2100,
    consumedCalories: 1420,
    targetProtein: 160,
    consumedProtein: 112,
    targetCarbs: 220,
    consumedCarbs: 165,
    targetFats: 65,
    consumedFats: 45,
    // الماء
    targetWaterLiters: 2.4,
    consumedWaterLiters: 1.5,
    targetGlasses: 8,
    consumedGlasses: 5,
    waterStreakDays: 7,
    // الطاقة (1-5)
    energyLevel: 5, // ممتاز
    // تمرين اليوم
    todayWorkoutTitleAr: 'تمارين الـ 40 يوم (Push A)',
    todayWorkoutDuration: '45 - 60 دقيقة',
    todayWorkoutExercisesCount: 7,
    isWorkoutCompleted: false,
    workoutStatus: 'not_started' // 'not_started', 'in_progress', 'completed'
  },

  // خطة الوجبات
  mealPlan: {
    status: 'approved_by_coach', // معتمدة من المدرب
    approvedAt: '2026-09-01',
    dailyTargetCalories: 2100,
    meals: DEFAULT_MEALS
  },

  // سجل الوجبات المؤكدة لليوم
  loggedMeals: [
    {
      id: 'log-1',
      titleAr: 'وجبة الفطور',
      time: '08:30 ص',
      calories: 420,
      protein: 26,
      carbs: 58,
      fats: 9,
      items: [
        { nameAr: 'شوفان كامل مع حليب', grams: 60, calories: 233, protein: 10, carbs: 40, fats: 4 },
        { nameAr: 'توت ولوز', grams: 95, calories: 135, protein: 4, carbs: 13, fats: 7 }
      ]
    },
    {
      id: 'log-2',
      titleAr: 'وجبة الغداء',
      time: '02:15 م',
      calories: 489,
      protein: 64,
      carbs: 40,
      fats: 7,
      items: [
        { nameAr: 'صدر دجاج مشوي', grams: 190, calories: 313, protein: 59, carbs: 0, fats: 7 },
        { nameAr: 'بطاطا مسلوقة', grams: 170, calories: 148, protein: 3, carbs: 34, fats: 0 },
        { nameAr: 'سلطة خضراء', grams: 100, calories: 28, protein: 2, carbs: 6, fats: 0 }
      ]
    }
  ],

  // جلسة التمرين الحالية (مطابقة للصورة 64E97D80)
  activeWorkoutSession: {
    sessionNameAr: 'صدر وترايسبس',
    startedAtTimestamp: null,
    elapsedSeconds: 1458, // 00:24:18
    currentExerciseIndex: 1, // تمرين 2 من 6
    isResting: false,
    restTimeRemainingSec: 72, // 01:12
    totalRestTimeSec: 90,
    currentExercise: {
      id: 'incline-bench-press',
      nameEn: 'Incline Bench Press',
      nameAr: 'ضغط صدر علوي بزاوية 45°',
      previousBest: '70 كغ × 10',
      sets: [
        { setNumber: 1, weight: 70, reps: 10, rpe: 8, completed: true },
        { setNumber: 2, weight: 72.5, reps: 9, rpe: 9, completed: true },
        { setNumber: 3, weight: 70, reps: 8, rpe: 8.5, completed: false }
      ]
    },
    painReports: []
  },

  // جدول المكملات المعتمد (مطابق للصورة C2DC0486)
  supplementsSchedule: [
    {
      id: 'supp-creatine',
      nameAr: 'كرياتين مونوهيدرات',
      dose: '5 غرام',
      timing: 'الصباح والمساء',
      verifiedSource: 'البروتوكول الرياضي المعتمد',
      schedule: {
        morning: { taken: true, time: '08:00 ص' },
        evening: { taken: true, time: '09:00 م' }
      }
    },
    {
      id: 'supp-omega3',
      nameAr: 'أوميغا 3 (زيت سمك)',
      dose: '1000 ملغ',
      timing: 'مع وجبة الإفطار والعشاء',
      verifiedSource: 'توصية غذائية معتمدة',
      schedule: {
        morning: { taken: false, time: null },
        evening: { taken: false, time: null }
      }
    },
    {
      id: 'supp-vitamind',
      nameAr: 'فيتامين D3',
      dose: '5000 وحدة دولية',
      timing: 'الصباح مع دهون صحية',
      verifiedSource: 'فحص دم موثق',
      schedule: {
        morning: { taken: true, time: '08:30 ص' },
        evening: { taken: true, time: '09:00 م' }
      }
    }
  ],

  // المتابعة الأسبوعية (مطابقة للصورة 54696C39)
  weeklyCheckin: {
    weekNumber: 4,
    completedTasksCount: 6,
    totalTasksCount: 8,
    currentWeight: 101.4,
    weightChangeVsLastWeek: -1.6,
    energy: 4,
    hunger: 2,
    stress: 2,
    sleepHours: 7,
    workoutsCompleted: 4,
    workoutsTarget: 4,
    waterGlassesAvg: 6,
    waterGlassesTarget: 8,
    hasPain: false,
    painNotes: '',
    coachFeedback: 'التزام استثنائي في الأسبوع الرابع. استمر في التركيز على كمية شرب الماء.'
  },

  // بيانات تقرير التقدم (مطابقة تماماً للصورة 0D91AB20)
  progressReport: {
    periodDays: 90,
    firstDay: {
      date: '2026-06-01',
      weight: 129,
      waistCm: 122,
      benchPressKg: 60
    },
    currentDay: {
      date: '2026-09-01',
      weight: 118,
      waistCm: 108,
      benchPressKg: 82.5
    },
    weightChangeKg: -11,
    weightTrendData: [
      { day: 1, weight: 129 },
      { day: 15, weight: 127.5 },
      { day: 30, weight: 125.8 },
      { day: 45, weight: 123.0 },
      { day: 60, weight: 120.5 },
      { day: 75, weight: 119.2 },
      { day: 90, weight: 118.0 }
    ],
    strengthTrendData: [
      { day: 1, weight: 60 },
      { day: 15, weight: 62.5 },
      { day: 30, weight: 65.0 },
      { day: 45, weight: 67.5 },
      { day: 60, weight: 72.5 },
      { day: 75, weight: 77.5 },
      { day: 90, weight: 82.5 }
    ],
    adherence: {
      trainingPct: 87,
      nutritionPct: 81,
      waterPct: 74
    },
    inBodyResult: {
      hasResult: true,
      testDate: '2026-08-28',
      provider: 'InBody 770 Clinic',
      skeletalMuscleMassKg: 44.2,
      bodyFatPercentage: 21.4,
      visceralFatLevel: 9
    },
    coachNotes: 'تقدم ممتاز — نستمر على نفس الخطة.'
  },

  // لوحة المدرب — قائمة العملاء التجريبيين
  coachClients: [
    {
      id: 'client-1',
      name: 'أحمد المنصور',
      avatar: '👨‍💼',
      goalAr: 'خسارة دهون وتنشيف',
      currentWeight: 101.4,
      startWeight: 129.0,
      lastCheckinDate: 'اليوم، 10:30 ص',
      adherencePct: 88,
      status: 'needs_review', // needs_review, active, rest
      painAlert: false,
      unreadMessagesCount: 1
    },
    {
      id: 'client-2',
      name: 'سارة العتيبي',
      avatar: '👩‍💻',
      goalAr: 'زيادة كتلة عضلية ولياقة',
      currentWeight: 58.2,
      startWeight: 54.0,
      lastCheckinDate: 'منذ يومين',
      adherencePct: 94,
      status: 'active',
      painAlert: false,
      unreadMessagesCount: 0
    },
    {
      id: 'client-3',
      name: 'عمر الخالد',
      avatar: '🏃‍♂️',
      goalAr: 'قوة ورفع أثقال',
      currentWeight: 84.5,
      startWeight: 88.0,
      lastCheckinDate: 'منذ 4 أيام',
      adherencePct: 76,
      status: 'pain_alert',
      painAlert: true,
      unreadMessagesCount: 2
    }
  ]
};
