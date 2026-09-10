/**
 * NEON COACH - الحالة الأولية الفارغة (Empty Initial State)
 * حالة نظيفة تماماً بدون بيانات وهمية أو مستخدم تجريبي.
 * تُستخدم فقط عند عدم وجود بيانات محفوظة في localStorage.
 * بعد تسجيل الدخول، يتم تحميل البيانات الحقيقية من Supabase.
 */

import { DEFAULT_MEALS } from '../data/foods.js';

export const EMPTY_INITIAL_STATE = {
  currentRole: 'client', // 'client' or 'coach'

  // حالة المصادقة المحلية — بدون الحاجة لتسجيل دخول
  auth: {
    isAuthenticated: true,
    user: {
      id: 'local_user',
      name: 'متدرب نيون',
      email: ''
    },
    provider: 'local',
    token: null
  },

  // ملف المستخدم — يبدأ بقيم افتراضية متوافقة مع شاشة الأسئلة
  userProfile: {
    id: 'local_user',
    name: '',
    email: '',
    onboardingCompleted: false,
    gender: 'male',
    age: 18,
    height: 175,
    startWeight: 70,
    currentWeight: 70,
    targetWeight: 65,
    bmr: 1674,
    maintenanceCalories: 2452,
    selectedWeeklyLossRate: 0.0075,
    selectedWeeklyLossPercent: 0.0075,
    weeklyLossPercent: 0.0075,
    selectedWeeklyLossKg: 0.53,
    weeklyLossKg: 0.53,
    weeklyCalorieDeficit: 4083,
    dailyCalorieDeficit: 583,
    requestedTargetCalories: 1869,
    requestedCalories: 1869,
    estimatedGoalWeeks: 9.4,
    weightLossRiskLevel: 'optimal',
    calorieSafetyLevel: 'optimal',
    calorieWarningCodes: [],
    calculationFormula: 'mifflin_st_jeor',
    unitSystem: 'metric',
    goal: 'fat_loss',
    activityLevel: 'moderate',
    workoutDaysCount: 4,
    preferredDays: [],
    equipment: 'gym',
    sessionDurationMin: 50,
    experienceLevel: 'beginner',
    injuries: [],
    allergens: [],
    likedFoods: [],
    dislikedFoods: [],
    supplementsBudget: 'medium',
    registeredAt: null
  },

  // أهداف اليوم — أصفار حتى يتم حساب الهدف من الاستبيان
  today: {
    date: new Date().toISOString().split('T')[0],
    targetCalories: 2000,
    consumedCalories: 0,
    targetProtein: 150,
    consumedProtein: 0,
    targetCarbs: 200,
    consumedCarbs: 0,
    targetFats: 60,
    consumedFats: 0,
    // الماء
    targetWaterLiters: 2.5,
    consumedWaterLiters: 0,
    targetGlasses: 10,
    consumedGlasses: 0,
    waterStreakDays: 0,
    // الطاقة (1-5)
    energyLevel: 3,
    // تمرين اليوم
    todayWorkoutTitleAr: '',
    todayWorkoutDuration: '',
    todayWorkoutExercisesCount: 0,
    isWorkoutCompleted: false,
    workoutStatus: 'not_started'
  },

  // خطة الوجبات الافتراضية
  mealPlan: {
    status: 'pending',
    approvedAt: null,
    dailyTargetCalories: 2000,
    meals: DEFAULT_MEALS
  },

  // سجل الوجبات المؤكدة — فارغ
  loggedMeals: [],

  // جلسة التمرين الحالية — فارغة
  activeWorkoutSession: {
    sessionNameAr: '',
    startedAtTimestamp: null,
    elapsedSeconds: 0,
    currentExerciseIndex: 0,
    isResting: false,
    restTimeRemainingSec: 0,
    totalRestTimeSec: 90,
    currentExercise: null,
    painReports: []
  },

  // جدول المكملات — فارغ حتى يضيفها المستخدم
  supplementsSchedule: [],

  // المتابعة الأسبوعية
  weeklyCheckin: {
    weekNumber: 1,
    completedTasksCount: 0,
    totalTasksCount: 0,
    currentWeight: null,
    weightChangeVsLastWeek: 0,
    energy: 3,
    hunger: 3,
    stress: 3,
    sleepHours: 7,
    workoutsCompleted: 0,
    workoutsTarget: 4,
    waterGlassesAvg: 0,
    waterGlassesTarget: 10,
    hasPain: false,
    painNotes: '',
    coachFeedback: ''
  },

  // بيانات تقرير التقدم — تُملأ من البيانات الحقيقية
  progressReport: {
    periodDays: 0,
    firstDay: {
      date: null,
      weight: null,
      waistCm: null,
      benchPressKg: null
    },
    currentDay: {
      date: null,
      weight: null,
      waistCm: null,
      benchPressKg: null
    },
    weightChangeKg: 0,
    weightTrendData: [],
    strengthTrendData: [],
    adherence: {
      trainingPct: 0,
      nutritionPct: 0,
      waterPct: 0
    },
    inBodyResult: {
      hasResult: false,
      testDate: null,
      provider: null,
      skeletalMuscleMassKg: null,
      bodyFatPercentage: null,
      visceralFatLevel: null
    },
    coachNotes: ''
  },

  // لوحة المدرب — قائمة العملاء الحقيقيين (تُحمَّل من Supabase)
  coachClients: [],

  // سجل التمارين — فارغ (يُملأ من Supabase أو من الجلسات المكتملة)
  workoutHistory: [],

  // ذاكرة محادثات الذكاء الاصطناعي
  aiChatHistory: []
};
