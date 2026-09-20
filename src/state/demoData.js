/**
 * NEON COACH - الحالة الأولية الفارغة (Empty Initial State)
 * حالة نظيفة تماماً بدون بيانات وهمية أو مستخدم تجريبي.
 * تُستخدم فقط عند عدم وجود بيانات محفوظة في localStorage.
 * بعد تسجيل الدخول، يتم تحميل البيانات الحقيقية من Supabase.
 */

import { DEFAULT_MEALS } from '../data/foods.js';

const initialDate = new Date();
const INITIAL_LOCAL_DATE = `${initialDate.getFullYear()}-${String(initialDate.getMonth() + 1).padStart(2, '0')}-${String(initialDate.getDate()).padStart(2, '0')}`;

export const EMPTY_INITIAL_STATE = {
  currentRole: 'client', // 'client' or 'coach'
  onboardingAuthPending: false,

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

  // ملف المستخدم — يبدأ بقيم افتراضية نظيفة، وتبقى 0 إذا لم يدخل المستخدم شيئاً
  userProfile: {
    id: 'local_user',
    name: '',
    email: '',
    onboardingCompleted: false,
    gender: 'male',
    age: 0,
    height: 0,
    startWeight: 0,
    currentWeight: 0,
    targetWeight: 0,
    bmr: 0,
    maintenanceCalories: 0,
    selectedWeeklyLossRate: 0,
    selectedWeeklyLossPercent: 0,
    weeklyLossPercent: 0,
    selectedWeeklyLossKg: 0,
    weeklyLossKg: 0,
    weeklyCalorieDeficit: 0,
    dailyCalorieDeficit: 0,
    requestedTargetCalories: 0,
    requestedCalories: 0,
    estimatedGoalWeeks: 0,
    weightLossRiskLevel: 'optimal',
    calorieSafetyLevel: 'optimal',
    calorieWarningCodes: [],
    calculationFormula: 'mifflin_st_jeor',
    unitSystem: 'metric',
    goal: 'fat_loss',
    activityLevel: 'moderate',
    workoutDaysCount: 0,
    workoutPlan: 'hasm',
    preferredDays: [],
    equipment: 'gym',
    sessionDurationMin: 0,
    experienceLevel: 'beginner',
    injuries: [],
    allergens: [],
    likedFoods: [],
    dislikedFoods: [],
    supplements: [],
    supplementsBudget: 'medium',
    registeredAt: null
  },

  // أهداف اليوم — أصفار حتى يتم حساب الهدف من الاستبيان أو إدخال المستخدم
  today: {
    date: INITIAL_LOCAL_DATE,
    targetCalories: 0,
    consumedCalories: 0,
    targetProtein: 0,
    consumedProtein: 0,
    targetCarbs: 0,
    consumedCarbs: 0,
    targetFats: 0,
    consumedFats: 0,
    // الماء
    targetWaterLiters: 0,
    consumedWaterLiters: 0,
    targetGlasses: 0,
    consumedGlasses: 0,
    waterStreakDays: 0,
    // الطاقة (1-5)
    energyLevel: 0,
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
    dailyTargetCalories: 0,
    meals: DEFAULT_MEALS
  },

  // سجل الوجبات المؤكدة — فارغ
  loggedMeals: [],

  // ملخص الأيام المغلقة — يحفظ الإنجاز عند بدء يوم جديد
  dailyHistory: [],

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
    workoutsTarget: 0,
    waterGlassesAvg: 0,
    waterGlassesTarget: 0,
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

  // الوجبات المحفوظة — يمكن للمستخدم حفظ وجباته المتكررة لاستخدامها بسرعة
  savedMeals: [],

  // ذاكرة محادثات الذكاء الاصطناعي
  aiChatHistory: []
};
