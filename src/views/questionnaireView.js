/**
 * NEON COACH - استبيان التخصيص الكامل (7 خطوات قابلة للاستئناف)
 * يطابق الصورتين المرجعيتين 0E211335 و A9EED71B مع رسمة القط على الميزان وحساب العمر والماكروز تلقائياً
 */

import { store } from '../state/store.js';
import { 
  calculateAge, 
  calculateNutritionTargets, 
  calculateBMR, 
  calculateTDEE, 
  calculateMaintenanceCalories,
  calculateWeightLossOption,
  calculateAllWeightLossOptions,
  WEEKLY_LOSS_OPTIONS,
  ACTIVITY_UI_MAP,
  kgToLbs, 
  lbsToKg,
  WEEKLY_LOSS_RATES,
  getRecommendedWeeklyLossRate,
  calculateFatLossPlan,
  evaluateWeightLossTarget
} from '../domain/calculations.js';
import { generateTrainingPlan } from '../domain/planner.js';
import { syncService } from '../services/syncService.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';
import { searchFoods } from '../data/foods.js';

let currentStep = 1;
let extremeConfirmed = false;

export const STEP_KEYS = {
  MEASUREMENTS: 'measurements',
  GOAL: 'goal',
  WEEKLY_LOSS_RATE: 'weekly_loss_rate',
  NUTRITION: 'nutrition',
  HEALTH: 'health',
  TRAINING: 'training',
  SUPPLEMENTS: 'supplements',
  REVIEW: 'review'
};

export function getActiveSteps() {
  if (formData.goal === 'fat_loss') {
    return [
      STEP_KEYS.MEASUREMENTS,
      STEP_KEYS.GOAL,
      STEP_KEYS.WEEKLY_LOSS_RATE,
      STEP_KEYS.NUTRITION,
      STEP_KEYS.HEALTH,
      STEP_KEYS.TRAINING,
      STEP_KEYS.SUPPLEMENTS,
      STEP_KEYS.REVIEW
    ];
  }
  return [
    STEP_KEYS.MEASUREMENTS,
    STEP_KEYS.GOAL,
    STEP_KEYS.NUTRITION,
    STEP_KEYS.HEALTH,
    STEP_KEYS.TRAINING,
    STEP_KEYS.SUPPLEMENTS,
    STEP_KEYS.REVIEW
  ];
}


// بيانات الاستبيان الجاري تعبئتها
let formData = {
  name: '',
  age: 18, // 18 سنة افتراضياً كما طلب المستخدم
  gender: 'male',
  height: 175, // 175 سم افتراضياً كما طلب المستخدم
  weight: 70, // 70 كغ افتراضياً كما طلب المستخدم
  unitSystem: 'metric', // metric or imperial
  goal: 'fat_loss',
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
  activityLevel: 'moderate',
  likedFoods: [],
  dislikedFoods: [],
  allergens: [],
  injuries: [],
  workoutDaysCount: 4,
  equipment: 'gym',
  sessionDurationMin: 50,
  sleepHours: 7,
  benchPressRecord: '',
  squatRecord: '',
  deadliftRecord: '',
  supplementsBudget: 'medium'
};

/**
 * قائمة الأطعمة المقترحة والمحبوبة في العالم العربي (بروتينات، نشويات، خضار، فواكه، وسناكات صحية)
 */
export const POPULAR_ARAB_RECOMMENDED_FOODS = [
  // بروتينات ولحوم (Proteins)
  { name: 'صدر دجاج', icon: '🍗', category: 'protein', popular: true },
  { name: 'لحم عجل قليل الدهن', icon: '🥩', category: 'protein', popular: true },
  { name: 'سمك مشوي', icon: '🐟', category: 'protein', popular: true },
  { name: 'بيض مسلوق', icon: '🍳', category: 'protein', popular: true },
  { name: 'تونة بالماء', icon: '🥫', category: 'protein', popular: true },
  { name: 'سلمون', icon: '🍣', category: 'protein', popular: false },
  { name: 'جبنة قريش', icon: '🧀', category: 'protein', popular: false },
  { name: 'جبنة حلوم لايت', icon: '🧀', category: 'protein', popular: false },

  // نشويات وطاقة (Carbs)
  { name: 'أرز أبيض', icon: '🍚', category: 'carbs', popular: true },
  { name: 'أرز بسمتي', icon: '🍚', category: 'carbs', popular: false },
  { name: 'بطاطا مشوية', icon: '🥔', category: 'carbs', popular: true },
  { name: 'بطاطا مسلوقة', icon: '🥔', category: 'carbs', popular: false },
  { name: 'بطاطا حلوة', icon: '🍠', category: 'carbs', popular: true },
  { name: 'شوفان', icon: '🥣', category: 'carbs', popular: true },
  { name: 'خبز قمح كامل', icon: '🍞', category: 'carbs', popular: false },
  { name: 'معكرونة مسلوقة', icon: '🍝', category: 'carbs', popular: false },
  { name: 'برغل وفريكة', icon: '🌾', category: 'carbs', popular: false },

  // خضروات وسلطات (Veggies)
  { name: 'خس', icon: '🥬', category: 'veggies', popular: true },
  { name: 'خيار', icon: '🥒', category: 'veggies', popular: true },
  { name: 'طماطم', icon: '🍅', category: 'veggies', popular: true },
  { name: 'بروكلي', icon: '🥦', category: 'veggies', popular: true },
  { name: 'جرجير', icon: '🌿', category: 'veggies', popular: true },
  { name: 'سبانخ', icon: '🍃', category: 'veggies', popular: false },
  { name: 'خضار مشكلة', icon: '🥕', category: 'veggies', popular: false },
  { name: 'كوسا وفاصوليا', icon: '🫛', category: 'veggies', popular: false },

  // فواكه وسناكات وصحي (Fruits & Healthy Snacks)
  { name: 'تمر', icon: '🌴', category: 'fruits', popular: true },
  { name: 'موز', icon: '🍌', category: 'fruits', popular: true },
  { name: 'تفاح', icon: '🍎', category: 'fruits', popular: false },
  { name: 'فراولة', icon: '🍓', category: 'fruits', popular: false },
  { name: 'زيت زيتون', icon: '🫒', category: 'fruits', popular: true },
  { name: 'زبادي يوناني', icon: '🥛', category: 'fruits', popular: true },
  { name: 'زبدة فول سوداني', icon: '🥜', category: 'fruits', popular: false },
  { name: 'مكسرات نية', icon: '🌰', category: 'fruits', popular: false },
  { name: 'حمص حب', icon: '🫘', category: 'fruits', popular: false }
];

export const COMMON_DISLIKED_SUGGESTIONS = [
  { name: 'سمك ومأكولات بحرية', icon: '🐟' },
  { name: 'تونة', icon: '🥫' },
  { name: 'كبدة', icon: '🥩' },
  { name: 'باذنجان', icon: '🍆' },
  { name: 'بامية', icon: '🫛' },
  { name: 'بروكلي', icon: '🥦' },
  { name: 'شوفان', icon: '🥣' },
  { name: 'بيض مسلوق', icon: '🍳' },
  { name: 'حليب وألبان', icon: '🥛' }
];

let activeMeasurementDrawer = 'age'; // الدرج المفتوح أولاً هو العمر مش الوزن كما طلب المستخدم
let weightUnit = 'kg'; // 'kg' or 'lb'

/**
 * دالة إنشاء HTML ملخص خطة خسارة الدهون التفاعلي المركزي
 */
function renderFatLossSummaryHTML(data) {
  const weight = Number(data.weight) || 70;
  const target = Number(data.targetWeight) || (weight - 5);
  const percent = Number(data.weeklyLossPercent) || 0.0075;
  const age = Number(data.age) || 18;
  const height = Number(data.height) || 175;
  const gender = data.gender || 'male';
  const activity = data.activityLevel || 'moderate';

  const rawBmr = calculateBMR({ sex: gender, age, weightKg: weight, heightCm: height });
  const rawTdee = calculateMaintenanceCalories(rawBmr, activity);

  const option = calculateWeightLossOption({
    currentWeightKg: weight,
    maintenanceCalories: rawTdee,
    weeklyRate: percent,
    sex: gender,
    age,
    targetWeightKg: target
  });

  const isTargetInvalid = target >= weight;

  return `
    <div class="neon-card" style="padding: 16px; border-radius: 16px; background: rgba(14, 22, 18, 0.7); border: 1px solid rgba(85,247,165,0.25);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; display: flex; align-items: center; gap: 6px;">
          <span>🎯</span>
          <span>هدفك المتوقع</span>
        </div>
        <div class="badge ${option.safety.badgeClass}" style="padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 0.75rem;">
          ${option.safety.badgeText}
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-bottom: 12px;">
        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="font-size: 0.72rem; color: #9CA3AF; margin-bottom: 2px;">سعرات الثبات المقدرة</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #55F7A5;">${Math.round(rawTdee).toLocaleString('en-US')} <span style="font-size: 0.75rem; color: #B8C0BC;">سعرة / يوم</span></div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="font-size: 0.72rem; color: #9CA3AF; margin-bottom: 2px;">النزول الأسبوعي المقدر</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #55F7A5;">${option.weeklyLossKgRounded.toFixed(2)} <span style="font-size: 0.75rem; color: #B8C0BC;">كغ / أسبوع</span></div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="font-size: 0.72rem; color: #9CA3AF; margin-bottom: 2px;">العجز اليومي المقدر</div>
          <div style="font-size: 1.1rem; font-weight: 800; color: #55F7A5;">-${option.dailyDeficitRounded} <span style="font-size: 0.75rem; color: #B8C0BC;">سعرة</span></div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
          <div style="font-size: 0.72rem; color: #9CA3AF; margin-bottom: 2px;">السعرات اليومية المقترحة</div>
          <div style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF;">${option.targetCaloriesRounded.toLocaleString('en-US')} <span style="font-size: 0.75rem; color: #B8C0BC;">سعرة</span></div>
        </div>

        <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); grid-column: span 2;">
          <div style="font-size: 0.72rem; color: #9CA3AF; margin-bottom: 2px;">المدة التقديرية للوصول للهدف (${target} كغ)</div>
          <div style="font-size: 1.05rem; font-weight: 800; color: ${isTargetInvalid ? '#F87171' : '#55F7A5'};">
            ${isTargetInvalid 
              ? 'تتطلب وزناً مستهدفاً أقل' 
              : `~ ${option.estimatedWeeks || '—'} <span style="font-size: 0.75rem; color: #B8C0BC;">أسبوع</span>`}
          </div>
        </div>
      </div>

      ${isTargetInvalid ? `
        <div style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 10px; padding: 8px 12px; font-size: 0.76rem; color: #FCA5A5; margin-bottom: 8px; text-align: center;">
          ⚠️ الوزن المستهدف (${target} كغ) يجب أن يكون أقل من وزنك الحالي (${weight} كغ) لحساب مدة الوصول.
        </div>
      ` : ''}

      ${option.safety.warningMessages.length > 0 ? `
        <div style="background: rgba(245, 158, 11, 0.09); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 8px 12px; font-size: 0.76rem; color: #FBBF24; margin-bottom: 8px; line-height: 1.4;">
          ${option.safety.warningMessages.map(msg => `<div>⚠️ ${msg}</div>`).join('')}
        </div>
      ` : ''}

      <div style="font-size: 0.68rem; color: #8E9892; text-align: center; margin-top: 4px;">
        المدة تقديرية وقد تختلف استجابة الجسم الفعلية.
      </div>
    </div>
  `;
}


export function renderQuestionnaireView() {
  const profile = store.getState()?.userProfile;
  // تحميل البيانات من الملف الشخصي الحقيقي إذا توفرت
  if (profile?.name && profile.name.trim()) {
    formData.name = profile.name;
  }
  if (profile?.age && Number(profile.age) > 0 && Number(profile.age) !== 25 && Number(profile.age) !== 10 && Number(profile.age) !== 17) {
    formData.age = Number(profile.age);
  } else {
    formData.age = 18;
  }
  if (profile?.height && Number(profile.height) > 0 && Number(profile.height) !== 170 && Number(profile.height) !== 128 && Number(profile.height) !== 194) {
    formData.height = Number(profile.height);
  } else {
    formData.height = 175;
  }
  if (profile?.currentWeight && Number(profile.currentWeight) > 0 && Number(profile.currentWeight) !== 75 && Number(profile.currentWeight) !== 35) {
    formData.weight = Number(profile.currentWeight);
  } else {
    formData.weight = 70;
  }
  if (profile?.targetWeight && Number(profile.targetWeight) > 0) {
    formData.targetWeight = Number(profile.targetWeight);
  }
  if (profile?.weeklyLossPercent && Number(profile.weeklyLossPercent) > 0) {
    formData.weeklyLossPercent = Number(profile.weeklyLossPercent);
  }
  if (profile?.goal) {
    formData.goal = profile.goal;
  }




  const activeSteps = getActiveSteps();
  const totalSteps = activeSteps.length;
  if (currentStep > totalSteps) currentStep = totalSteps;
  const currentStepKey = activeSteps[currentStep - 1] || activeSteps[0];

  return `
    <div class="questionnaire-container" style="min-height: 100vh; padding: 20px 16px 80px; max-width: 500px; margin: 0 auto;">
      
      <!-- شريط التقدم بين الخطوات -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <button id="q-back-step-btn" class="btn-icon" style="width: 38px; height: 38px; ${currentStep === 1 ? 'visibility: hidden;' : ''}" aria-label="رجوع">
          ❯
        </button>
        <span id="q-step-indicator-text" style="font-weight: 800; color: #55F7A5; font-size: 0.95rem; font-family: monospace;">
          الخطوة ${currentStep} من ${totalSteps}
        </span>
        <div style="width: 38px;"></div>
      </div>

      <!-- مؤشرات الخطوات -->
      <div id="q-steps-bar" style="display: flex; gap: 6px; margin-bottom: 24px;">
        ${Array.from({ length: totalSteps }, (_, i) => `
          <div style="flex: 1; height: 4px; border-radius: 999px; background: ${i + 1 <= currentStep ? '#55F7A5' : 'rgba(85, 247, 165, 0.15)'}; box-shadow: ${i + 1 === currentStep ? '0 0 8px #55F7A5' : 'none'}; transition: all 0.3s ease;"></div>
        `).join('')}
      </div>

      <!-- محتوى الخطوة النشطة -->
      <div id="step-content-area">
        ${renderStepContent(currentStepKey)}
      </div>

    </div>
  `;
}

function renderHorizontalPickerHTML(id, min, max, step, currentVal, unit) {
  const ticks = [];
  for (let v = min; v <= max; v += step) {
    ticks.push(v);
  }
  return `
    <div class="horizontal-picker-wrapper" id="wrapper-${id}">
      <div class="picker-edge-fade-left"></div>
      <div class="picker-edge-fade-right"></div>
      <div class="picker-center-pin"></div>
      
      <!-- إطار الكبسولة المركزية المضيء بدون أي رقم ثابت حتى لا يتداخل مع أرقام المسار -->
      <div class="picker-capsule-center">
        <span class="capsule-unit" id="capsule-unit-${id}">${unit}</span>
      </div>

      <!-- مسار الأرقام الأفقي القابل للتمرير والسحب يميناً ويساراً -->
      <div class="horizontal-scroll-track" id="track-${id}" data-id="${id}" data-unit="${unit}">
        <div class="picker-spacer"></div>
        ${ticks.map(val => {
          const isMajor = val % 5 === 0;
          const isActive = val === currentVal;
          return `
            <div class="picker-tick-item ${isMajor ? 'major' : ''} ${isActive ? 'active' : ''}" data-val="${val}">
              <div class="tick-line"></div>
              <div class="tick-number">${val}</div>
            </div>
          `;
        }).join('')}
        <div class="picker-spacer"></div>
      </div>

      <!-- أزرار التقديم والتأخير السريعة ومؤشر التمرير -->
      <div class="picker-nudge-bar">
        <button type="button" class="picker-nudge-btn picker-nudge-prev" data-target="${id}" aria-label="تقليل">❮</button>
        <span class="picker-hint-text">اسحب لليمين أو اليسار للتغيير ↔️</span>
        <button type="button" class="picker-nudge-btn picker-nudge-next" data-target="${id}" aria-label="زيادة">❯</button>
      </div>
    </div>
  `;
}


function renderStepContent(step) {
  switch (step) {
    case STEP_KEYS.MEASUREMENTS:
    case 1:
      // الخطوة 1: قياسات الجسم بنمط iOS المرجعي مع سكرول أفقي
      return `
        <div style="text-align: center; margin-bottom: 16px;">
          <h2 style="font-size: 1.55rem; color: #55F7A5; margin-bottom: 4px; font-weight: 800;">قياسات الجسم</h2>
          <p style="font-size: 0.9rem; color: #B8C0BC;">Body Measurements لحساب احتياجك بدقة</p>
        </div>

        <!-- رسمة القط على الميزان مطابقة للمرجع -->
        <div style="width: 150px; height: 150px; margin: 0 auto 16px; filter: drop-shadow(0 0 16px rgba(85, 247, 165, 0.3));">
          <img src="./icons/neon-cat-scale.svg" alt="Cat on scale" style="width: 100%; height: 100%;">
        </div>

        <!-- الاسم الشخصي -->
        <div class="neon-card" style="padding: 12px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #B8C0BC; font-weight: 700; font-size: 0.95rem;">الاسم الأول</span>
          <input type="text" id="q-name" value="${formData.name}" placeholder="الاسم الأول" style="width: 170px; text-align: right; padding: 7px 12px; border-radius: 10px; background: rgba(0,0,0,0.5); border: 1px solid rgba(85,247,165,0.25); color: #fff; font-size: 0.95rem;">
        </div>

        <!-- بطاقة قياسات الجسم المدمجة بنمط iOS المرجعي -->
        <div class="measurement-card-group">
          
          <!-- 1. الجنس (Sex) -->
          <div class="measurement-row" style="cursor: default;">
            <div class="measurement-label-side">
              <div class="measurement-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              </div>
              <span class="measurement-title">الجنس (Sex)</span>
            </div>
            <div class="gender-toggle-pills">
              <button type="button" class="gender-pill-btn ${formData.gender === 'male' ? 'active' : ''}" data-gender="male">ذكر</button>
              <button type="button" class="gender-pill-btn ${formData.gender === 'female' ? 'active' : ''}" data-gender="female">أنثى</button>
            </div>
          </div>

          <!-- 2. العمر (Year of birth / Age) - افتراضي 17 -->
          <div class="measurement-row ${activeMeasurementDrawer === 'age' ? 'active' : ''}" id="row-age" data-drawer="age">
            <div class="measurement-label-side">
              <div class="measurement-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span class="measurement-title">العمر (Age)</span>
            </div>
            <div class="measurement-value-side">
              <span class="measurement-val-text" id="row-val-age">${formData.age} سنة</span>
              <span class="measurement-chevron">❯</span>
            </div>
          </div>
          <!-- الدرج الأفقي لاختيار العمر -->
          <div class="measurement-picker-drawer ${activeMeasurementDrawer === 'age' ? 'open' : ''}" id="drawer-age">
            ${renderHorizontalPickerHTML('age', 10, 90, 1, formData.age, 'سنة')}
          </div>

          <!-- 3. الوزن (Weight) - افتراضي 70 -->
          <div class="measurement-row ${activeMeasurementDrawer === 'weight' ? 'active' : ''}" id="row-weight" data-drawer="weight">
            <div class="measurement-label-side">
              <div class="measurement-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="9" x2="12" y2="10"/></svg>
              </div>
              <span class="measurement-title">الوزن (Weight)</span>
            </div>
            <div class="measurement-value-side">
              <div class="unit-toggle-pills" onclick="event.stopPropagation();">
                <button type="button" class="unit-pill ${weightUnit === 'kg' ? 'active' : ''}" data-unit="kg">kg</button>
                <button type="button" class="unit-pill ${weightUnit === 'lb' ? 'active' : ''}" data-unit="lb">lb</button>
              </div>
              <span class="measurement-val-text" id="row-val-weight">${formData.weight} ${weightUnit === 'kg' ? 'كغ' : 'lb'}</span>
              <span class="measurement-chevron">❯</span>
            </div>
          </div>
          <!-- الدرج الأفقي لاختيار الوزن -->
          <div class="measurement-picker-drawer ${activeMeasurementDrawer === 'weight' ? 'open' : ''}" id="drawer-weight">
            ${renderHorizontalPickerHTML('weight', weightUnit === 'kg' ? 35 : 77, weightUnit === 'kg' ? 220 : 485, 1, weightUnit === 'kg' ? formData.weight : Math.round(kgToLbs(formData.weight)), weightUnit === 'kg' ? 'كغ' : 'lb')}
          </div>

          <!-- 4. الطول (Height) - افتراضي 170 -->
          <div class="measurement-row ${activeMeasurementDrawer === 'height' ? 'active' : ''}" id="row-height" data-drawer="height">
            <div class="measurement-label-side">
              <div class="measurement-icon-box">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 3H3v18h18V3z"/><path d="M3 9h4"/><path d="M3 15h4"/><path d="M3 12h8"/><path d="M3 6h4"/><path d="M3 18h4"/></svg>
              </div>
              <span class="measurement-title">الطول (Height)</span>
            </div>
            <div class="measurement-value-side">
              <span class="measurement-val-text" id="row-val-height">${formData.height} سم</span>
              <span class="measurement-chevron">❯</span>
            </div>
          </div>
          <!-- الدرج الأفقي لاختيار الطول -->
          <div class="measurement-picker-drawer ${activeMeasurementDrawer === 'height' ? 'open' : ''}" id="drawer-height">
            ${renderHorizontalPickerHTML('height', 120, 225, 1, formData.height, 'سم')}
          </div>

        </div>

        <!-- حقول مخفية لضمان التوافق التام مع الحفظ والحسابات -->
        <input type="hidden" id="q-age" value="${formData.age}">
        <input type="hidden" id="q-gender" value="${formData.gender}">
        <input type="hidden" id="q-weight" value="${formData.weight}">
        <input type="hidden" id="q-height" value="${formData.height}">

        <!-- ملاحظة قياسات الجسم مطابقة للمرجع -->
        <p style="font-size: 0.8rem; color: #8E9892; text-align: center; margin: 16px auto 0; line-height: 1.5; max-width: 90%;">
          Your body measurements are important for accurate steps, distance, and calories tracking.
        </p>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 22px; border-radius: 22px; font-size: 1.05rem; font-weight: 800;">
          متابعة ❯
        </button>
      `;

    case STEP_KEYS.GOAL:
    case 2:
      // الخطوة 2: الهدف ونمط الحياة (الصورة A9EED71B)
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">هدفك ونمط حياتك</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">لننشئ خطة تناسبك وتساعدك على الاستمرارية</p>
        </div>

        <div style="font-size: 0.95rem; font-weight: 700; color: #FFFFFF; margin-bottom: 12px;">اختر هدفك الأساسي:</div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          
          <div class="neon-card goal-card ${formData.goal === 'fat_loss' ? 'glow' : ''}" data-goal="fat_loss" style="padding: 16px 8px; text-align: center; cursor: pointer; border-color: ${formData.goal === 'fat_loss' ? '#55F7A5' : 'rgba(85,247,165,0.2)'};">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${neonIcon('flame', 36)}</div>
            <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF;">خسارة الدهون</div>
            <div style="font-size: 0.7rem; color: #B8C0BC; margin-top: 4px;">تقليل الدهون وتحسين اللياقة</div>
          </div>

          <div class="neon-card goal-card ${formData.goal === 'maintenance' ? 'glow' : ''}" data-goal="maintenance" style="padding: 16px 8px; text-align: center; cursor: pointer; border-color: ${formData.goal === 'maintenance' ? '#55F7A5' : 'rgba(85,247,165,0.2)'};">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${neonIcon('target', 36)}</div>
            <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF;">تثبيت الوزن</div>
            <div style="font-size: 0.7rem; color: #B8C0BC; margin-top: 4px;">الحفاظ على وزنك الحالي</div>
          </div>

          <div class="neon-card goal-card ${formData.goal === 'muscle_gain' ? 'glow' : ''}" data-goal="muscle_gain" style="padding: 16px 8px; text-align: center; cursor: pointer; border-color: ${formData.goal === 'muscle_gain' ? '#55F7A5' : 'rgba(85,247,165,0.2)'};">
            <div style="margin-bottom: 6px; display: flex; justify-content: center;">${neonIcon('dumbbell', 36)}</div>
            <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF;">زيادة الكتلة</div>
            <div style="font-size: 0.7rem; color: #B8C0BC; margin-top: 4px;">بناء العضلات وزيادة القوة</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="neon-card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap;">
            <div>
              <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">مستوى نشاطك اليومي</div>
              <div style="font-size: 0.8rem; color: #B8C0BC;">حدد نمط حركتك لحساب سعرات الثبات بدقة</div>
            </div>
            <select id="q-activity" style="min-width: 175px; padding: 8px 12px; border-radius: 10px; background: #0D1512; color: #55F7A5; border: 1px solid rgba(85,247,165,0.35); font-weight: 700; font-size: 0.85rem;">
              <option value="sedentary" ${formData.activityLevel === 'sedentary' ? 'selected' : ''}>مكتبي / قليل الحركة (1.200)</option>
              <option value="light" ${formData.activityLevel === 'light' ? 'selected' : ''}>نشاط خفيف 1-3 أيام (1.375)</option>
              <option value="moderate" ${formData.activityLevel === 'moderate' || !formData.activityLevel ? 'selected' : ''}>نشاط متوسط 4-5 أيام (1.465)</option>
              <option value="active" ${formData.activityLevel === 'active' ? 'selected' : ''}>نشاط عالي يومي (1.550)</option>
              <option value="veryActive" ${formData.activityLevel === 'veryActive' ? 'selected' : ''}>نشاط مكثف جداً 6-7 أيام (1.725)</option>
              <option value="extraActive" ${formData.activityLevel === 'extraActive' ? 'selected' : ''}>نشاط استثنائي / محترف (1.900)</option>
            </select>
          </div>

          <div class="neon-card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #B8C0BC; font-weight: 600;">الوزن المستهدف</span>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" id="q-target-weight" value="${formData.targetWeight}" style="width: 80px; text-align: center; padding: 6px 10px; border-radius: 10px;">
              <span style="color: #55F7A5; font-weight: 700;">كغ</span>
            </div>
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

    case STEP_KEYS.WEEKLY_LOSS_RATE: {
      // الصفحة المخصصة والمستقلة: سرعة النزول الأسبوعي وهدفك المتوقع
      const currentWeight = Number(formData.weight) || 70;
      const currentHeight = Number(formData.height) || 175;
      const currentAge = Number(formData.age) || 18;
      const currentGender = formData.gender || 'male';
      const currentActivity = formData.activityLevel || 'moderate';

      const rawBmr = calculateBMR({ sex: currentGender, age: currentAge, weightKg: currentWeight, heightCm: currentHeight });
      const rawTdee = calculateMaintenanceCalories(rawBmr, currentActivity);

      const options = calculateAllWeightLossOptions({
        currentWeightKg: currentWeight,
        maintenanceCalories: rawTdee,
        sex: currentGender,
        age: currentAge,
        targetWeightKg: formData.targetWeight
      });

      return `
        <div style="text-align: center; margin-bottom: 16px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">ما سرعة النزول التي تريدها؟</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">اختر معدل خسارة الوزن الأسبوعي كنسبة من وزن جسمك (${currentWeight} كغ)</p>
        </div>

        <!-- بطاقة سعرات الثبات و BMR العلوية البارزة -->
        <div class="neon-card maintenance-highlight-card" style="padding: 14px 16px; border-radius: 16px; margin-bottom: 18px; text-align: center;">
          <div style="font-size: 0.8rem; color: #B8C0BC; margin-bottom: 4px;">تقدير مبني على بيانات جسمك ومستوى النشاط</div>
          <div style="display: flex; justify-content: center; align-items: baseline; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 1.25rem; font-weight: 900; color: #55F7A5;">🔥 سعرات الثبات: ${Math.round(rawTdee).toLocaleString('en-US')} سعرة / يوم</span>
            <span style="font-size: 0.88rem; color: #9CA3AF;">(BMR: ${Math.round(rawBmr).toLocaleString('en-US')} سعرة / يوم)</span>
          </div>
          <div style="font-size: 0.72rem; color: #6B7280; margin-top: 4px;">
            السعرات التي تحافظ على وزنك الحالي دون زيادة أو نقصان
          </div>
        </div>

        <!-- شبكة بطاقات المعدلات الستة الديناميكية -->
        <div class="weekly-loss-rates-grid" role="radiogroup" aria-label="معدل خسارة الوزن الأسبوعي" style="margin-bottom: 18px;">
          ${options.map(opt => {
            const isSelected = Math.abs(formData.weeklyLossPercent - opt.rate) < 0.0001;
            const isDisabled = opt.isUnder18Disabled;
            const isExtreme = opt.isExtreme;
            return `
              <div class="neon-card rate-card ${isSelected ? 'active-rate' : ''} ${isExtreme ? 'extreme-card' : ''} ${isDisabled ? 'disabled' : ''}" 
                   data-rate="${opt.rate}" 
                   data-extreme="${isExtreme}"
                   data-disabled="${isDisabled}"
                   tabindex="${isDisabled ? '-1' : '0'}"
                   role="radio"
                   aria-checked="${isSelected}"
                   aria-disabled="${isDisabled}"
                   style="padding: 14px 10px; cursor: ${isDisabled ? 'not-allowed' : 'pointer'};">
                
                ${isSelected ? `
                  <div class="rate-card-check">✓</div>
                ` : ''}

                ${opt.isRecommended ? `
                  <div style="position: absolute; top: -9px; left: 50%; transform: translateX(-50%); background: #55F7A5; color: #0D1512; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 20px; white-space: nowrap; box-shadow: 0 0 10px rgba(85,247,165,0.4);">
                    موصى به ⭐
                  </div>
                ` : ''}

                ${isExtreme ? `
                  <div style="position: absolute; top: -9px; left: 50%; transform: translateX(-50%); background: #F59E0B; color: #000; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 20px; white-space: nowrap;">
                    EXTREME ⚠️
                  </div>
                ` : ''}

                ${isDisabled ? `
                  <div style="position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); background: rgba(239, 68, 68, 0.85); color: #FFF; font-size: 0.6rem; font-weight: 800; padding: 2px 6px; border-radius: 10px; white-space: nowrap;">
                    غير متاح دون 18 عاماً 🛡️
                  </div>
                ` : ''}

                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                  <span style="font-weight: 800; font-size: 1.05rem; color: ${isExtreme ? '#FBBF24' : '#55F7A5'};">${opt.percentText}</span>
                  <span style="font-size: 0.76rem; font-weight: 700; color: #FFFFFF;">${opt.label}</span>
                </div>

                <div style="font-size: 0.82rem; font-weight: 700; color: #E5E7EB; margin-bottom: 2px;">
                  ~ <span class="rate-card-kg">${opt.weeklyLossKgRounded.toFixed(2)}</span> كغ / أسبوع
                </div>

                <div class="rate-card-calories">
                  ${opt.targetCaloriesRounded.toLocaleString('en-US')} <span style="font-size: 0.72rem; font-weight: 600; color: #B8C0BC;">سعرة / يوم</span>
                </div>

                <div class="rate-card-deficit">
                  عجز يومي: ≈ ${opt.dailyDeficitRounded} سعرة
                </div>

                <div style="font-size: 0.68rem; color: #9CA3AF; line-height: 1.35; margin-top: auto;">
                  ${opt.description}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <!-- صندوق الملخص التفاعلي المصغر -->
        <div id="fat-loss-summary-box" style="margin-bottom: 20px;">
          ${renderFatLossSummaryHTML(formData)}
        </div>

        <!-- مودال التأكيد لمعدل 2% EXTREME -->
        <div id="extreme-loss-modal" class="modal-overlay" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 9999; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(6px);">
          <div class="neon-card" style="max-width: 440px; width: 100%; border: 1.5px solid #F59E0B; box-shadow: 0 0 25px rgba(245,158,11,0.25); padding: 24px; border-radius: 20px; background: #121A16;">
            <div style="text-align: center; margin-bottom: 16px;">
              <div style="font-size: 2.2rem; margin-bottom: 6px;">⚠️</div>
              <h3 style="font-size: 1.25rem; color: #FBBF24; font-weight: 800; margin-bottom: 6px;">تأكيد هدف النزول الشديد (EXTREME)</h3>
              <p style="font-size: 0.85rem; color: #D1D5DB; line-height: 1.5;">
                لقد اخترت معدل نزول أسبوعي <strong>2.0%</strong> من وزن جسمك. هذا المعدل يمثل عجزاً حرارياً قاسياً قد يؤدي لخسارة عضلية أو بطء في الأيض ويتطلب انضباطاً ومراقبة مستمرة.
              </p>
            </div>

            <div id="extreme-modal-stats" style="background: rgba(0,0,0,0.4); border-radius: 12px; padding: 12px 14px; margin-bottom: 16px; font-size: 0.85rem; border: 1px solid rgba(245,158,11,0.2);">
              <!-- يتم ملء الإحصائيات ديناميكياً -->
            </div>

            <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 0.82rem; color: #D1D5DB; margin-bottom: 20px; line-height: 1.4;">
              <input type="checkbox" id="extreme-confirm-checkbox" style="margin-top: 3px; accent-color: #55F7A5; width: 18px; height: 18px; flex-shrink: 0;">
              <span>أفهم أن هذا العجز شديد وأتحمل مسؤولية متابعة حالتي الصحية وسأقوم برفع السعرات فور الشعور بإرهاق مفرط.</span>
            </label>

            <div style="display: flex; gap: 10px;">
              <button type="button" id="extreme-cancel-btn" class="btn btn-secondary" style="flex: 1; border-radius: 14px; font-size: 0.88rem; padding: 10px;">
                اختيار معدل أقل (0.75%)
              </button>
              <button type="button" id="extreme-accept-btn" class="btn btn-primary" disabled style="flex: 1; border-radius: 14px; font-size: 0.88rem; padding: 10px; opacity: 0.5; cursor: not-allowed;">
                فهمت، متابعة
              </button>
            </div>
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 10px; border-radius: 22px;">
          متابعة
        </button>
      `;
    }

    case STEP_KEYS.NUTRITION:
    case 3:
      // تفضيلات التغذية والحساسيات
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">تفضيلات التغذية</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">نستبعد الحساسيات ونوفر وجباتك المفضلة</p>
        </div>

        <div class="form-group" style="margin-bottom: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="form-label" style="font-weight: 700; color: #55F7A5; margin: 0; display: flex; align-items: center; gap: 6px; font-size: 0.95rem;">
              <span>🥗</span>
              <span>أطعمة تحبها (اختر من المقترحات أو ابحث):</span>
            </label>
            <span class="liked-foods-count-badge" style="font-size: 0.74rem; color: #55F7A5; font-weight: 700;">
              ${formData.likedFoods.length ? `${formData.likedFoods.length} صنف مختار` : ''}
            </span>
          </div>

          <div class="food-tags-box" id="box-liked-foods">
            <div class="food-tags-wrapper" id="pills-liked-foods" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              ${formData.likedFoods.map(food => `
                <span class="food-tag-pill" data-food="${food}">
                  <span>${food}</span>
                  <span class="food-tag-remove" data-type="liked" data-food="${food}" title="حذف">×</span>
                </span>
              `).join('')}
            </div>
            <input type="text" id="q-liked-foods-input" class="food-tag-input" placeholder="${formData.likedFoods.length ? '+ أضف أكلة أخرى...' : 'اكتب أول حرف للبحث وإضافة الأكلة...'}" autocomplete="off">
            <div id="dropdown-liked-foods" class="food-autocomplete-dropdown" style="display: none;"></div>
          </div>

          <!-- اقتراحات سريعة موصى بها (الأكثر شعبية في الوطن العربي) -->
          <div class="food-recommendations-wrapper">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 0.78rem; color: #55F7A5; font-weight: 800; display: flex; align-items: center; gap: 5px;">
                <span>✨</span>
                <span>أطعمة شائعة ومحبوبة (اضغط للإضافة الفورية):</span>
              </span>
            </div>

            <!-- تصنيفات الأطعمة المقترحة -->
            <div class="food-rec-category-tabs" data-type="liked">
              <button type="button" class="rec-cat-tab active" data-cat="all">🔥 الأكثر شعبية</button>
              <button type="button" class="rec-cat-tab" data-cat="protein">🍗 بروتينات ولحوم</button>
              <button type="button" class="rec-cat-tab" data-cat="carbs">🍚 نشويات وطاقة</button>
              <button type="button" class="rec-cat-tab" data-cat="veggies">🥗 خضار وسلطات</button>
              <button type="button" class="rec-cat-tab" data-cat="fruits">🍎 فواكه وسناك</button>
            </div>

            <!-- شبكة الأزرار المقترحة -->
            <div class="food-rec-chips-grid" id="liked-food-rec-chips">
              ${POPULAR_ARAB_RECOMMENDED_FOODS.map(f => {
                const isSelected = formData.likedFoods.includes(f.name);
                const isPopular = f.popular ? 'true' : 'false';
                return `
                  <button type="button" class="food-rec-chip ${isSelected ? 'selected' : ''}" data-food="${f.name}" data-category="${f.category}" data-popular="${isPopular}">
                    <span>${f.icon}</span>
                    <span>${f.name}</span>
                    <span class="chip-status">${isSelected ? '✓' : '+'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 22px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <label class="form-label" style="font-weight: 700; color: #F87171; margin: 0; display: flex; align-items: center; gap: 6px; font-size: 0.95rem;">
              <span>🚫</span>
              <span>أطعمة لا تحبها (يتم استبعادها من خطتك):</span>
            </label>
            <span class="disliked-foods-count-badge" style="font-size: 0.74rem; color: #F87171; font-weight: 700;">
              ${formData.dislikedFoods.length ? `${formData.dislikedFoods.length} مستبعد` : ''}
            </span>
          </div>

          <div class="food-tags-box" id="box-disliked-foods">
            <div class="food-tags-wrapper" id="pills-disliked-foods" style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center;">
              ${formData.dislikedFoods.map(food => `
                <span class="food-tag-pill disliked-pill" data-food="${food}">
                  <span>${food}</span>
                  <span class="food-tag-remove" data-type="disliked" data-food="${food}" title="حذف">×</span>
                </span>
              `).join('')}
            </div>
            <input type="text" id="q-disliked-foods-input" class="food-tag-input" placeholder="${formData.dislikedFoods.length ? '+ أضف أكلة أخرى...' : 'اكتب أول حرف للبحث وإضافة الأكلة...'}" autocomplete="off">
            <div id="dropdown-disliked-foods" class="food-autocomplete-dropdown" style="display: none;"></div>
          </div>

          <!-- اقتراحات استبعاد سريعة -->
          <div class="food-recommendations-wrapper" style="border-color: rgba(248,113,113,0.18);">
            <div style="font-size: 0.78rem; color: #F87171; font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
              <span>⚡</span>
              <span>استبعاد سريع لأصناف لا يفضلها البعض:</span>
            </div>
            <div class="food-rec-chips-grid" id="disliked-food-rec-chips" style="max-height: 120px;">
              ${COMMON_DISLIKED_SUGGESTIONS.map(f => {
                const isSelected = formData.dislikedFoods.includes(f.name);
                return `
                  <button type="button" class="food-rec-chip disliked ${isSelected ? 'selected' : ''}" data-food="${f.name}">
                    <span>${f.icon}</span>
                    <span>${f.name}</span>
                    <span class="chip-status">${isSelected ? '✓' : '+'}</span>
                  </button>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" style="font-weight: 700; color: #FFFFFF; margin-bottom: 10px; display: block;">حساسيات غذائية مؤكدة (يتم استبعادها تماماً):</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
            ${['لاكتوز / ألبان', 'جلوتين / قمح', 'مكسرات', 'بيض', 'مأكولات بحرية'].map(all => `
              <label class="badge badge-neon" style="cursor: pointer; padding: 8px 14px; font-size: 0.85rem; user-select: none;">
                <input type="checkbox" name="q-allergens" value="${all}" ${formData.allergens.includes(all) ? 'checked' : ''} style="width: auto; margin-inline-end: 6px; accent-color: #55F7A5;">
                ${all}
              </label>
            `).join('')}
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

    case STEP_KEYS.HEALTH:
    case 4:
      // الصحة ونمط الحياة والنوم
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">الصحة ونمط الحياة</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">الاستشفاء والنوم هما سر النتيجة المستدامة</p>
        </div>

        <div class="neon-card" style="padding: 16px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span style="color: #FFFFFF; font-weight: 600;">متوسط ساعات النوم اليومية</span>
          <div style="display: flex; align-items: center; gap: 6px;">
            <input type="number" id="q-sleep" value="${formData.sleepHours}" min="4" max="12" style="width: 70px; text-align: center; border-radius: 10px;">
            <span style="color: #55F7A5;">ساعات</span>
          </div>
        </div>

        <div class="neon-card" style="padding: 16px 18px; margin-bottom: 14px;">
          <div style="font-weight: 700; color: #FFFFFF; margin-bottom: 8px;">إصابات سابقة أو آلام مفاصل:</div>
          <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${['لا يوجد', 'الكتف', 'الركبة', 'أسفل الظهر'].map(inj => `
              <label class="badge badge-neon" style="cursor: pointer; padding: 8px 14px;">
                <input type="checkbox" name="q-injuries" value="${inj}" style="width: auto; margin-inline-end: 6px;">
                ${inj}
              </label>
            `).join('')}
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

    case STEP_KEYS.TRAINING:
    case 5:
      // التدريب والأيام والمعدات
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">أيام ومكان التدريب</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">نصمم البرنامج بعدد الأيام الفعلي (1 - 6 أيام)</p>
        </div>

        <div class="neon-card" style="padding: 16px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-weight: 700; color: #FFFFFF;">عدد أيام التمرين بالأسبوع</div>
            <div style="font-size: 0.8rem; color: #B8C0BC;">اختر من 1 إلى 6 أيام</div>
          </div>
          <select id="q-workout-days" style="width: 110px; padding: 8px; border-radius: 10px; text-align: center;">
            ${[1, 2, 3, 4, 5, 6].map(d => `<option value="${d}" ${d === formData.workoutDaysCount ? 'selected' : ''}>${d} أيام</option>`).join('')}
          </select>
        </div>

        <div class="neon-card" style="padding: 16px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: #FFFFFF;">مكان التمرين</span>
          <select id="q-equipment" style="width: 140px; padding: 8px; border-radius: 10px;">
            <option value="gym" ${formData.equipment === 'gym' ? 'selected' : ''}>صالة رياضية (جيم)</option>
            <option value="home" ${formData.equipment === 'home' ? 'selected' : ''}>منزل بأوزان خفيفة</option>
          </select>
        </div>

        <div class="neon-card" style="padding: 16px 18px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; color: #FFFFFF;">مدة الجلسة المناسبة</span>
          <select id="q-session-duration" style="width: 140px; padding: 8px; border-radius: 10px;">
            <option value="40">35 - 45 دقيقة</option>
            <option value="50" selected>45 - 60 دقيقة</option>
            <option value="75">60 - 75 دقيقة</option>
          </select>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

    case STEP_KEYS.SUPPLEMENTS:
    case 6:
      // المكملات وخط البداية
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">المكملات وخط البداية</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">المكملات اختيارية ومكملة للتغذية الصحية وليست أساساً</p>
        </div>

        <div class="neon-card" style="padding: 16px 18px; margin-bottom: 14px;">
          <div style="font-weight: 700; color: #FFFFFF; margin-bottom: 10px;">المكملات التي تستخدمها حالياً:</div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <label style="display: flex; align-items: center; gap: 10px; color: #B8C0BC;">
              <input type="checkbox" checked style="width: auto;"> كرياتين مونوهيدرات
            </label>
            <label style="display: flex; align-items: center; gap: 10px; color: #B8C0BC;">
              <input type="checkbox" checked style="width: auto;"> أوميغا 3 (زيت سمك)
            </label>
            <label style="display: flex; align-items: center; gap: 10px; color: #B8C0BC;">
              <input type="checkbox" checked style="width: auto;"> فيتامين D3
            </label>
            <label style="display: flex; align-items: center; gap: 10px; color: #B8C0BC;">
              <input type="checkbox" style="width: auto;"> واي بروتين (Whey Protein)
            </label>
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          مراجعة بياناتي
        </button>
      `;

    case STEP_KEYS.REVIEW:
    case 7:
    case 8:
      // الخطوة 7: المراجعة النهائية وزر إنشاء الخطة
      const targets = calculateNutritionTargets(formData);
      const goalNames = {
        fat_loss: `خسارة دهون (عجز ${formData.dailyCalorieDeficit || 500} سعرة)`,
        maintenance: 'تثبيت الوزن (سعرات المحافظة)',
        muscle_gain: 'زيادة الكتلة العضلية (فائض 10%)'
      };
      const goalText = goalNames[formData.goal] || 'خسارة دهون';
      const eqText = formData.equipment === 'home' ? 'منزل بأوزان خفيفة' : 'صالة جيم';

      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">مراجعة خطتك الشخصية</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">راجع أهدافك قبل إنشاء وتفعيل خطة النيون</p>
        </div>

        <div class="neon-card" style="padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="color: #B8C0BC;">المتدرب</span>
            <span style="font-weight: 800; color: #FFFFFF;">${formData.name} (${formData.age} سنة)</span>
          </div>

          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="color: #B8C0BC;">الهدف الأساسي</span>
            <span style="font-weight: 800; color: #55F7A5;">${goalText}</span>
          </div>

          ${formData.goal === 'fat_loss' ? `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
              <span style="color: #B8C0BC;">معدل النزول الأسبوعي</span>
              <span style="font-weight: 800; color: #55F7A5;">${(formData.weeklyLossPercent * 100).toFixed(2)}% (~${formData.weeklyLossKg} كغ/أسبوع)</span>
            </div>
            ${formData.estimatedGoalWeeks ? `
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
                <span style="color: #B8C0BC;">المدة التقديرية للهدف</span>
                <span style="font-weight: 800; color: #FFFFFF;">حوالي ${formData.estimatedGoalWeeks} أسبوع</span>
              </div>
            ` : ''}
          ` : ''}

          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="color: #B8C0BC;">السعرات اليومية المستهدفة</span>
            <span style="font-weight: 900; color: #55F7A5; font-size: 1.1rem;">${targets.targetCalories} سعرة</span>
          </div>

          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="color: #B8C0BC;">الماكروز المستهدفة</span>
            <span style="font-weight: 700; color: #FFFFFF;">بروتين ${targets.protein}غ | كارب ${targets.carbs}غ | دهون ${targets.fats}غ</span>
          </div>

          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px; margin-bottom: 12px;">
            <span style="color: #B8C0BC;">أيام التدريب</span>
            <span style="font-weight: 800; color: #FFFFFF;">${formData.workoutDaysCount} أيام بالأسبوع (${eqText})</span>
          </div>

          <div style="display: flex; justify-content: space-between;">
            <span style="color: #B8C0BC;">الهدف اليومي للماء</span>
            <span style="font-weight: 800; color: #38BDF8;">${(targets.waterMl / 1000).toFixed(1)} لتر (${targets.waterGlasses} أكواب)</span>
          </div>
        </div>

        <div id="plan-generation-status" style="display: none; margin-bottom: 16px; text-align: center;">
          <div class="loading-spinner" style="margin: 0 auto 10px;"></div>
          <div style="color: #55F7A5; font-weight: 700;">جاري هندسة وتوليد برنامجك التدريبي والغذائي...</div>
        </div>

        <button id="create-my-plan-btn" class="btn btn-primary btn-lg btn-block" style="border-radius: 22px; font-size: 1.15rem; display: flex; align-items: center; justify-content: center; gap: 8px;">
          ${neonIcon('dumbbell', 22)}
          <span>إنشاء خطتي الآن</span>
        </button>
      `;

    default:
      return '';
  }
}

export function bindQuestionnaireEvents() {
  const activeSteps = getActiveSteps();
  const totalSteps = activeSteps.length;
  const currentStepKey = activeSteps[currentStep - 1] || activeSteps[0];

  const nextBtn = document.getElementById('q-next-step-btn');
  const backBtn = document.getElementById('q-back-step-btn');
  const createPlanBtn = document.getElementById('create-my-plan-btn');

  // تهيئة الأحداث المناسبة بحسب مفتاح الخطوة النشطة
  if (currentStepKey === STEP_KEYS.MEASUREMENTS) {
    initStep1HorizontalPickers();
  } else if (currentStepKey === STEP_KEYS.GOAL) {
    initGoalStepEvents();
  } else if (currentStepKey === STEP_KEYS.WEEKLY_LOSS_RATE) {
    initWeeklyLossRateEvents();
  } else if (currentStepKey === STEP_KEYS.NUTRITION) {
    initNutritionStepEvents();
  }

  // التقدم للخطوة التالية
  nextBtn?.addEventListener('click', () => {
    const stepsNow = getActiveSteps();
    const totalNow = stepsNow.length;
    const stepKeyNow = stepsNow[currentStep - 1] || stepsNow[0];

    // التحقق عند الخطوة 2 لهدف خسارة الدهون: الوزن المستهدف يجب أن يكون أقل
    if (stepKeyNow === STEP_KEYS.GOAL && formData.goal === 'fat_loss') {
      const targetWeight = Number(document.getElementById('q-target-weight')?.value) || formData.targetWeight;
      const weight = Number(formData.weight) || 70;
      if (targetWeight >= weight) {
        notificationService.showToast(`لهدف خسارة الدهون، يجب أن يكون الوزن المستهدف أقل من وزنك الحالي (${weight} كغ)`, 'warning');
        return;
      }
    }

    // التحقق عند شاشة معدل النزول: التأكيد لمعدل 2% EXTREME
    if (stepKeyNow === STEP_KEYS.WEEKLY_LOSS_RATE) {
      if (formData.weeklyLossPercent >= 0.02 && !extremeConfirmed) {
        const modal = document.getElementById('extreme-loss-modal');
        if (modal) {
          modal.style.display = 'flex';
          return;
        }
      }
    }

    saveCurrentStepInputs();
    if (currentStep < totalNow) {
      currentStep++;
      render();
    }
  });

  // الرجوع للخطوة السابقة
  backBtn?.addEventListener('click', () => {
    if (currentStep > 1) {
      currentStep--;
      render();
    }
  });

  // زر إنشاء الخطة النهائي
  createPlanBtn?.addEventListener('click', async () => {
    const statusDiv = document.getElementById('plan-generation-status');
    createPlanBtn.style.display = 'none';
    if (statusDiv) statusDiv.style.display = 'block';

    // توليد الخطة وحفظها في التخزين المركزي
    const targets = calculateNutritionTargets(formData);
    const trainingPlan = generateTrainingPlan(formData);

    const fullProfile = {
      ...formData,
      currentWeight: formData.weight,
      startWeight: formData.weight,
      bmr: formData.bmr || targets.bmr,
      maintenanceCalories: formData.maintenanceCalories || targets.tdee,
      selectedWeeklyLossRate: formData.selectedWeeklyLossRate || formData.weeklyLossPercent,
      selectedWeeklyLossPercent: formData.selectedWeeklyLossPercent || formData.weeklyLossPercent,
      selectedWeeklyLossKg: formData.selectedWeeklyLossKg || formData.weeklyLossKg,
      weeklyLossPercent: formData.weeklyLossPercent,
      weeklyLossKg: formData.weeklyLossKg,
      weeklyCalorieDeficit: formData.weeklyCalorieDeficit,
      dailyCalorieDeficit: formData.dailyCalorieDeficit,
      requestedTargetCalories: formData.requestedTargetCalories || targets.requestedTargetCalories || targets.targetCalories,
      requestedCalories: formData.requestedCalories || targets.targetCalories,
      estimatedGoalWeeks: formData.estimatedGoalWeeks,
      weightLossRiskLevel: formData.weightLossRiskLevel,
      calorieSafetyLevel: formData.calorieSafetyLevel,
      calorieWarningCodes: formData.calorieWarningCodes || [],
      calculationFormula: 'mifflin_st_jeor',
      targetCalories: targets.targetCalories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFats: targets.fats,
      targetWaterLiters: Number((targets.waterMl / 1000).toFixed(1)),
      targetGlasses: targets.waterGlasses,
      onboardingCompleted: true,
      onboarding_completed: true
    };

    store.setUserProfile(fullProfile);

    // تحديث أهداف اليوم وإعادة تعيين المستهلك للعميل الجديد
    store.getState().today.targetCalories = targets.targetCalories;
    store.getState().today.targetProtein = targets.protein;
    store.getState().today.targetCarbs = targets.carbs;
    store.getState().today.targetFats = targets.fats;
    store.getState().today.targetWaterLiters = Number((targets.waterMl / 1000).toFixed(1));
    store.getState().today.targetGlasses = targets.waterGlasses;
    store.getState().today.consumedCalories = 0;
    store.getState().today.consumedProtein = 0;
    store.getState().today.consumedCarbs = 0;
    store.getState().today.consumedFats = 0;
    store.getState().today.meals = [];
    store.getState().today.waterGlasses = 0;
    store.getState().today.waterMl = 0;
    store.saveState();

    // حفظ في قاعدة بيانات Supabase إذا كان هناك مستخدم
    const userId = store.getState()?.auth?.user?.id;
    if (userId) {
      try {
        await syncService.syncProfile(userId, fullProfile);
        await syncService.syncWaterLog(userId, 0, 0, targets.waterGlasses);
      } catch (syncErr) {
        console.warn('Sync warning upon plan creation:', syncErr);
      }
    }

    notificationService.showToast(`تم إنشاء وتفعيل خطتك الشخصية بنجاح يا ${formData.name || 'بطل'}! 🚀`, 'success');

    // الانتقال للوحة اليوم
    setTimeout(() => {
      currentStep = 1;
      window.location.hash = '#today';
    }, 600);
  });

  function initStep1HorizontalPickers() {
    const setupTrack = (id, initialVal, unitStr, onChange) => {
      const track = document.getElementById(`track-${id}`);
      const capsuleVal = document.getElementById(`capsule-val-${id}`);
      const rowVal = document.getElementById(`row-val-${id}`);
      const hiddenInput = document.getElementById(`q-${id}`);
      if (!track) return null;

      let isReady = false;

      const scrollToVal = (val, smooth = true) => {
        if (!track || track.clientWidth === 0) return;
        const item = track.querySelector(`.picker-tick-item[data-val="${val}"]`);
        if (item) {
          const targetScroll = item.offsetLeft - (track.clientWidth / 2) + (item.clientWidth / 2);
          track.scrollTo({ left: targetScroll, behavior: smooth ? 'smooth' : 'instant' });
        }
      };

      const updateActiveItem = () => {
        if (!track || track.clientWidth === 0) return;
        const center = track.scrollLeft + (track.clientWidth / 2);
        const items = track.querySelectorAll('.picker-tick-item');
        let closestItem = null;
        let minDistance = Infinity;

        for (const it of items) {
          const itemCenter = it.offsetLeft + (it.clientWidth / 2);
          const dist = Math.abs(center - itemCenter);
          if (dist < minDistance) {
            minDistance = dist;
            closestItem = it;
          }
        }

        if (closestItem) {
          const val = Number(closestItem.dataset.val);
          items.forEach(it => it.classList.remove('active'));
          closestItem.classList.add('active');

          if (rowVal) rowVal.textContent = `${val} ${unitStr}`;
          if (hiddenInput) hiddenInput.value = val;
          if (typeof onChange === 'function') onChange(val);
        }
      };

      // رصد التمرير لتحديث الرقم النشط فورياً فقط بعد اكتمال التموضع
      track.addEventListener('scroll', () => {
        if (!isReady) return;
        updateActiveItem();
      }, { passive: true });

      // النقر المباشر على أي رقم يجعله في المركز
      track.querySelectorAll('.picker-tick-item').forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = Number(item.dataset.val);
          scrollToVal(val, true);
        });
      });

      // دعم السحب بالفأرة على أجهزة الكمبيوتر
      let isDown = false;
      let startX = 0;
      let scrollLeft = 0;

      track.addEventListener('mousedown', (e) => {
        isDown = true;
        startX = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
      });

      const onMouseUp = () => {
        if (isDown) {
          isDown = false;
          const center = track.scrollLeft + (track.clientWidth / 2);
          const items = track.querySelectorAll('.picker-tick-item');
          let closestItem = null;
          let minDistance = Infinity;
          for (const it of items) {
            const itemCenter = it.offsetLeft + (it.clientWidth / 2);
            const dist = Math.abs(center - itemCenter);
            if (dist < minDistance) { minDistance = dist; closestItem = it; }
          }
          if (closestItem) {
            scrollToVal(Number(closestItem.dataset.val), true);
          }
        }
      };

      window.addEventListener('mouseup', onMouseUp);

      track.addEventListener('mousemove', (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.5;
        track.scrollLeft = scrollLeft - walk;
      });

      // دعم عجلة الفأرة (Mouse Wheel) للتمرير الأفقي
      track.addEventListener('wheel', (e) => {
        if (e.deltaY) {
          e.preventDefault();
          track.scrollLeft += (e.deltaY * 0.7);
        }
      }, { passive: false });

      // محاذاة القيمة الافتراضية في المركز فور التحميل بدقة وتفعيل الرصد
      scrollToVal(initialVal, false);
      updateActiveItem();
      setTimeout(() => {
        scrollToVal(initialVal, false);
        updateActiveItem();
        isReady = true;
      }, 100);

      return { scrollToVal, updateActiveItem, setReady: (val) => { isReady = val; } };
    };

    // مراقبة إدخال الاسم الأول
    document.getElementById('q-name')?.addEventListener('input', (e) => {
      formData.name = e.target.value.trim();
    });

    // 1. تهيئة مسار العمر (افتراضي 18 سنة)
    const ageCtrl = setupTrack('age', formData.age, 'سنة', (val) => {
      formData.age = val;
    });

    // 2. تهيئة مسار الوزن (افتراضي 70 كغ)
    const currentWeightDisp = weightUnit === 'kg' ? formData.weight : Math.round(kgToLbs(formData.weight));
    const currentWeightUnitStr = weightUnit === 'kg' ? 'كغ' : 'lb';
    let weightCtrl = setupTrack('weight', currentWeightDisp, currentWeightUnitStr, (val) => {
      if (weightUnit === 'kg') {
        formData.weight = val;
      } else {
        formData.weight = Math.round(lbsToKg(val));
      }
    });

    // 3. تهيئة مسار الطول (افتراضي 175 سم)
    const heightCtrl = setupTrack('height', formData.height, 'سم', (val) => {
      formData.height = val;
    });

    // ربط الأكورديون للنقر على الصفوف
    const rowConfigs = [
      { id: 'age', getCtrl: () => ageCtrl, getVal: () => formData.age },
      { id: 'weight', getCtrl: () => weightCtrl, getVal: () => (weightUnit === 'kg' ? formData.weight : Math.round(kgToLbs(formData.weight))) },
      { id: 'height', getCtrl: () => heightCtrl, getVal: () => formData.height }
    ];

    rowConfigs.forEach(r => {
      const rowEl = document.getElementById(`row-${r.id}`);
      const drawerEl = document.getElementById(`drawer-${r.id}`);
      if (rowEl && drawerEl) {
        rowEl.addEventListener('click', (e) => {
          if (e.target.closest('.unit-toggle-pills')) return;
          const isOpen = drawerEl.classList.contains('open');
          // إغلاق كل الأدراج أولاً
          rowConfigs.forEach(other => {
            document.getElementById(`drawer-${other.id}`)?.classList.remove('open');
            document.getElementById(`row-${other.id}`)?.classList.remove('active');
          });
          if (!isOpen) {
            drawerEl.classList.add('open');
            rowEl.classList.add('active');
            activeMeasurementDrawer = r.id;
            setTimeout(() => {
              const ctrl = r.getCtrl();
              if (ctrl) {
                ctrl.scrollToVal(r.getVal(), false);
                ctrl.updateActiveItem();
                ctrl.setReady(true);
              }
            }, 60);
          } else {
            activeMeasurementDrawer = null;
          }
        });
      }
    });

    // أزرار التقديم والتأخير (❮ و ❯)
    document.querySelectorAll('.picker-nudge-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const target = btn.dataset.target;
        const track = document.getElementById(`track-${target}`);
        if (!track) return;
        const isNext = btn.classList.contains('picker-nudge-next');
        const itemWidth = 70;
        track.scrollBy({ left: isNext ? itemWidth : -itemWidth, behavior: 'smooth' });
      });
    });

    // تبديل أزرار الجنس (ذكر / أنثى)
    document.querySelectorAll('.gender-pill-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const g = btn.dataset.gender;
        formData.gender = g;
        document.querySelectorAll('.gender-pill-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const gInput = document.getElementById('q-gender');
        if (gInput) gInput.value = g;
      });
    });

    // تبديل وحدات الوزن (kg / lb)
    document.querySelectorAll('.unit-pill').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const u = btn.dataset.unit;
        if (u === weightUnit) return;
        weightUnit = u;
        document.querySelectorAll('.unit-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const drawer = document.getElementById('drawer-weight');
        const rowValWeight = document.getElementById('row-val-weight');
        if (drawer) {
          const targetVal = u === 'kg' ? formData.weight : Math.round(kgToLbs(formData.weight));
          if (rowValWeight) rowValWeight.textContent = `${targetVal} ${u === 'kg' ? 'كغ' : 'lb'}`;
          drawer.innerHTML = renderHorizontalPickerHTML('weight', u === 'kg' ? 35 : 77, u === 'kg' ? 220 : 485, 1, targetVal, u === 'kg' ? 'كغ' : 'lb');
          weightCtrl = setupTrack('weight', targetVal, u === 'kg' ? 'كغ' : 'lb', (val) => {
            if (weightUnit === 'kg') formData.weight = val;
            else formData.weight = Math.round(lbsToKg(val));
          });
          drawer.querySelectorAll('.picker-nudge-btn').forEach(nb => {
            nb.addEventListener('click', (ev) => {
              ev.stopPropagation();
              const tr = document.getElementById('track-weight');
              const isN = nb.classList.contains('picker-nudge-next');
              tr?.scrollBy({ left: isN ? 70 : -70, behavior: 'smooth' });
            });
          });
        }
      });
    });
  }

  function initGoalStepEvents() {
    const targetWeightInput = document.getElementById('q-target-weight');
    const activitySelect = document.getElementById('q-activity');

    targetWeightInput?.addEventListener('input', (e) => {
      const val = Number(e.target.value);
      if (val > 0) {
        formData.targetWeight = val;
      }
    });

    activitySelect?.addEventListener('change', (e) => {
      formData.activityLevel = e.target.value;
    });

    document.querySelectorAll('.goal-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('.goal-card').forEach(c => {
          c.classList.remove('glow');
          c.style.borderColor = 'rgba(85,247,165,0.2)';
        });
        card.classList.add('glow');
        card.style.borderColor = '#55F7A5';
        formData.goal = card.getAttribute('data-goal');

        // تحديث شريط الخطوات والمؤشر ديناميكياً فور تغيير الهدف
        const activeSteps = getActiveSteps();
        const totalSteps = activeSteps.length;
        const headerStep = document.getElementById('q-step-indicator-text');
        if (headerStep) {
          headerStep.textContent = `الخطوة ${currentStep} من ${totalSteps}`;
        }
        const stepsBar = document.getElementById('q-steps-bar');
        if (stepsBar) {
          stepsBar.innerHTML = Array.from({ length: totalSteps }, (_, i) => `
            <div style="flex: 1; height: 4px; border-radius: 999px; background: ${i + 1 <= currentStep ? '#55F7A5' : 'rgba(85, 247, 165, 0.15)'}; box-shadow: ${i + 1 === currentStep ? '0 0 8px #55F7A5' : 'none'}; transition: all 0.3s ease;"></div>
          `).join('');
        }
      });
    });
  }

  function initWeeklyLossRateEvents() {
    const extremeModal = document.getElementById('extreme-loss-modal');
    const extremeCheckbox = document.getElementById('extreme-confirm-checkbox');
    const extremeAcceptBtn = document.getElementById('extreme-accept-btn');
    const extremeCancelBtn = document.getElementById('extreme-cancel-btn');

    const updateFatLossSummary = () => {
      const box = document.getElementById('fat-loss-summary-box');
      if (box) {
        box.innerHTML = renderFatLossSummaryHTML(formData);
      }
      const w = Number(formData.weight) || 70;
      const h = Number(formData.height) || 175;
      const age = Number(formData.age) || 18;
      const g = formData.gender || 'male';
      const act = formData.activityLevel || 'moderate';

      const rawBmr = calculateBMR({ sex: g, age, weightKg: w, heightCm: h });
      const rawTdee = calculateMaintenanceCalories(rawBmr, act);

      document.querySelectorAll('.rate-card').forEach(rc => {
        const rateVal = parseFloat(rc.dataset.rate);
        if (!isNaN(rateVal)) {
          const opt = calculateWeightLossOption({
            currentWeightKg: w,
            maintenanceCalories: rawTdee,
            weeklyRate: rateVal,
            sex: g,
            age,
            targetWeightKg: formData.targetWeight
          });
          const kgEl = rc.querySelector('.rate-card-kg');
          if (kgEl) kgEl.textContent = opt.weeklyLossKgRounded.toFixed(2);
          const calEl = rc.querySelector('.rate-card-calories');
          if (calEl) calEl.innerHTML = `${opt.targetCaloriesRounded.toLocaleString('en-US')} <span style="font-size: 0.72rem; font-weight: 600; color: #B8C0BC;">سعرة / يوم</span>`;
          const defEl = rc.querySelector('.rate-card-deficit');
          if (defEl) defEl.textContent = `عجز يومي: ≈ ${opt.dailyDeficitRounded} سعرة`;
        }
      });
    };

    const showExtremeModal = () => {
      if (!extremeModal) return;
      const w = Number(formData.weight) || 70;
      const h = Number(formData.height) || 175;
      const age = Number(formData.age) || 18;
      const g = formData.gender || 'male';
      const act = formData.activityLevel || 'moderate';

      const rawBmr = calculateBMR({ sex: g, age, weightKg: w, heightCm: h });
      const rawTdee = calculateMaintenanceCalories(rawBmr, act);
      const plan = calculateWeightLossOption({
        currentWeightKg: w,
        maintenanceCalories: rawTdee,
        weeklyRate: 0.02,
        sex: g,
        age,
        targetWeightKg: formData.targetWeight || (w - 5)
      });

      const statsDiv = document.getElementById('extreme-modal-stats');
      if (statsDiv) {
        statsDiv.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #E5E7EB;">
            <span>النزول الأسبوعي المقدر:</span>
            <strong style="color: #FBBF24;">${plan.weeklyLossKgRounded.toFixed(2)} كغ / أسبوع</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #E5E7EB;">
            <span>العجز اليومي المطلوب:</span>
            <strong style="color: #FBBF24;">-${plan.dailyDeficitRounded} سعرة</strong>
          </div>
          <div style="display: flex; justify-content: space-between; color: #E5E7EB;">
            <span>سعراتك اليومية الناتجة:</span>
            <strong style="color: #FBBF24;">${plan.targetCaloriesRounded.toLocaleString('en-US')} سعرة / يوم</strong>
          </div>
        `;
      }

      if (extremeCheckbox) {
        extremeCheckbox.checked = extremeConfirmed;
      }
      if (extremeAcceptBtn) {
        extremeAcceptBtn.disabled = !extremeConfirmed;
        extremeAcceptBtn.style.opacity = extremeConfirmed ? '1' : '0.5';
        extremeAcceptBtn.style.cursor = extremeConfirmed ? 'pointer' : 'not-allowed';
      }

      extremeModal.style.display = 'flex';
    };

    const hideExtremeModal = () => {
      if (extremeModal) extremeModal.style.display = 'none';
    };

    // تفاعل بطاقات المعدلات الستة
    document.querySelectorAll('.rate-card').forEach(rc => {
      const handleSelect = () => {
        if (rc.classList.contains('disabled') || rc.dataset.disabled === 'true') {
          notificationService.showToast('هذا الخيار غير متاح لمن هم دون 18 عاماً للحفاظ على النمو الصحي 🛡️', 'warning');
          return;
        }

        const rateVal = parseFloat(rc.dataset.rate);
        if (isNaN(rateVal)) return;

        formData.weeklyLossPercent = rateVal;
        formData.selectedWeeklyLossRate = rateVal;

        const w = Number(formData.weight) || 70;
        const h = Number(formData.height) || 175;
        const age = Number(formData.age) || 18;
        const g = formData.gender || 'male';
        const act = formData.activityLevel || 'moderate';
        const rawBmr = calculateBMR({ sex: g, age, weightKg: w, heightCm: h });
        const rawTdee = calculateMaintenanceCalories(rawBmr, act);
        const opt = calculateWeightLossOption({
          currentWeightKg: w,
          maintenanceCalories: rawTdee,
          weeklyRate: rateVal,
          sex: g,
          age,
          targetWeightKg: formData.targetWeight || (w - 5)
        });
        formData.bmr = Math.round(rawBmr);
        formData.rawBmr = rawBmr;
        formData.maintenanceCalories = Math.round(rawTdee);
        formData.rawMaintenanceCalories = rawTdee;
        formData.selectedWeeklyLossKg = opt.weeklyLossKgRounded;
        formData.weeklyLossKg = opt.weeklyLossKgRounded;
        formData.weeklyCalorieDeficit = opt.weeklyDeficitRounded;
        formData.dailyCalorieDeficit = opt.dailyDeficitRounded;
        formData.requestedTargetCalories = opt.targetCaloriesRounded;
        formData.requestedCalories = opt.targetCaloriesRounded;
        formData.targetCalories = opt.targetCaloriesRounded;
        formData.estimatedGoalWeeks = opt.estimatedWeeks;
        formData.weightLossRiskLevel = opt.safety.safetyLevel;
        formData.calorieSafetyLevel = opt.safety.safetyLevel;
        formData.calorieWarningCodes = opt.safety.warningCodes;

        document.querySelectorAll('.rate-card').forEach(c => {
          c.classList.remove('active-rate');
          c.setAttribute('aria-checked', 'false');
          c.querySelector('.rate-card-check')?.remove();
        });
        rc.classList.add('active-rate');
        rc.setAttribute('aria-checked', 'true');
        const check = document.createElement('div');
        check.className = 'rate-card-check';
        check.textContent = '✓';
        rc.appendChild(check);

        if (rateVal >= 0.02) {
          showExtremeModal();
        } else {
          extremeConfirmed = false;
        }

        updateFatLossSummary();
      };

      rc.addEventListener('click', handleSelect);
      rc.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleSelect();
        }
      });
    });

    // أحداث المودال
    extremeCheckbox?.addEventListener('change', (e) => {
      if (extremeAcceptBtn) {
        extremeAcceptBtn.disabled = !e.target.checked;
        extremeAcceptBtn.style.opacity = e.target.checked ? '1' : '0.5';
        extremeAcceptBtn.style.cursor = e.target.checked ? 'pointer' : 'not-allowed';
      }
    });

    extremeAcceptBtn?.addEventListener('click', () => {
      extremeConfirmed = true;
      hideExtremeModal();
      notificationService.showToast('تم تأكيد اختيار معدل النزول الشديد ⚠️', 'info');
    });

    extremeCancelBtn?.addEventListener('click', () => {
      hideExtremeModal();
      formData.weeklyLossPercent = 0.0075;
      formData.selectedWeeklyLossRate = 0.0075;
      extremeConfirmed = false;

      const w = Number(formData.weight) || 70;
      const h = Number(formData.height) || 175;
      const age = Number(formData.age) || 18;
      const g = formData.gender || 'male';
      const act = formData.activityLevel || 'moderate';
      const rawBmr = calculateBMR({ sex: g, age, weightKg: w, heightCm: h });
      const rawTdee = calculateMaintenanceCalories(rawBmr, act);
      const opt = calculateWeightLossOption({
        currentWeightKg: w,
        maintenanceCalories: rawTdee,
        weeklyRate: 0.0075,
        sex: g,
        age,
        targetWeightKg: formData.targetWeight || (w - 5)
      });
      formData.bmr = Math.round(rawBmr);
      formData.rawBmr = rawBmr;
      formData.maintenanceCalories = Math.round(rawTdee);
      formData.rawMaintenanceCalories = rawTdee;
      formData.selectedWeeklyLossKg = opt.weeklyLossKgRounded;
      formData.weeklyLossKg = opt.weeklyLossKgRounded;
      formData.weeklyCalorieDeficit = opt.weeklyDeficitRounded;
      formData.dailyCalorieDeficit = opt.dailyDeficitRounded;
      formData.requestedTargetCalories = opt.targetCaloriesRounded;
      formData.requestedCalories = opt.targetCaloriesRounded;
      formData.targetCalories = opt.targetCaloriesRounded;
      formData.estimatedGoalWeeks = opt.estimatedWeeks;
      formData.weightLossRiskLevel = opt.safety.safetyLevel;
      formData.calorieSafetyLevel = opt.safety.safetyLevel;
      formData.calorieWarningCodes = opt.safety.warningCodes;

      document.querySelectorAll('.rate-card').forEach(c => {
        const isRec = Math.abs(parseFloat(c.dataset.rate) - 0.0075) < 0.0001;
        c.classList.toggle('active-rate', isRec);
        c.setAttribute('aria-checked', String(isRec));
        c.querySelector('.rate-card-check')?.remove();
        if (isRec) {
          const check = document.createElement('div');
          check.className = 'rate-card-check';
          check.textContent = '✓';
          c.appendChild(check);
        }
      });
      updateFatLossSummary();
    });
  }

  function initNutritionStepEvents() {
    function setupFoodAutocomplete(type) {
      const isLiked = type === 'liked';
      const listKey = isLiked ? 'likedFoods' : 'dislikedFoods';
      const box = document.getElementById(`box-${type}-foods`);
      const pillsContainer = document.getElementById(`pills-${type}-foods`);
      const input = document.getElementById(`q-${type}-foods-input`);
      const dropdown = document.getElementById(`dropdown-${type}-foods`);

      if (!box || !pillsContainer || !input || !dropdown) return;

      let highlightedIndex = -1;

      const updateChipStates = () => {
        const chipsContainer = document.getElementById(`${type}-food-rec-chips`);
        if (chipsContainer) {
          chipsContainer.querySelectorAll('.food-rec-chip').forEach(chip => {
            const food = chip.dataset.food;
            const isSelected = formData[listKey].includes(food);
            chip.classList.toggle('selected', isSelected);
            const statusSpan = chip.querySelector('.chip-status');
            if (statusSpan) {
              statusSpan.textContent = isSelected ? '✓' : '+';
            }
          });
        }
        const badge = document.querySelector(`.${type}-foods-count-badge`);
        if (badge) {
          if (formData[listKey].length) {
            badge.textContent = `${formData[listKey].length} ${isLiked ? 'صنف مختار' : 'مستبعد'}`;
          } else {
            badge.textContent = '';
          }
        }
      };

      const renderPills = () => {
        pillsContainer.innerHTML = formData[listKey].map(food => `
          <span class="food-tag-pill ${isLiked ? '' : 'disliked-pill'}" data-food="${food}">
            <span>${food}</span>
            <span class="food-tag-remove" data-type="${type}" data-food="${food}" title="حذف">×</span>
          </span>
        `).join('');

        input.placeholder = formData[listKey].length 
          ? '+ أضف أكلة أخرى...' 
          : 'اكتب أول حرف للبحث وإضافة الأكلة...';

        updateChipStates();
      };

      const addFood = (foodName) => {
        if (!foodName) return;
        const cleanName = foodName.trim();
        if (!cleanName) return;
        if (!formData[listKey].includes(cleanName)) {
          formData[listKey].push(cleanName);
          renderPills();
        }
        input.value = '';
        closeDropdown();
        input.focus();
      };

      const removeFood = (foodName) => {
        formData[listKey] = formData[listKey].filter(f => f !== foodName);
        renderPills();
      };

      const closeDropdown = () => {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
        highlightedIndex = -1;
      };

      const renderDropdown = (items, query) => {
        if (!items.length && !query) {
          closeDropdown();
          return;
        }

        highlightedIndex = -1;

        let html = items.map((item, idx) => `
          <div class="food-autocomplete-item" data-index="${idx}" data-name="${item}">
            <span style="display: inline-flex; align-items: center; gap: 8px;">
              <span style="font-size: 0.95rem;">${isLiked ? '🟢' : '🔴'}</span>
              <span>${item}</span>
            </span>
          </div>
        `).join('');

        // إذا كان هناك نص مكتوب وغير مطابق تماماً لأحد العناصر، إتاحة إضافته كأكلة مخصصة
        const exactMatch = items.some(it => it.toLowerCase() === query.toLowerCase());
        if (query && !exactMatch) {
          html += `
            <div class="food-autocomplete-item custom-food" data-custom="true" data-name="${query}">
              <span style="display: inline-flex; align-items: center; gap: 8px;">
                <span>➕</span>
                <span>إضافة "<strong>${query}</strong>" كأكلة مخصصة</span>
              </span>
            </div>
          `;
        }

        dropdown.innerHTML = html;
        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.food-autocomplete-item').forEach(el => {
          el.addEventListener('mousedown', (e) => {
            e.preventDefault();
            const foodName = el.dataset.name;
            addFood(foodName);
          });
        });
      };

      // رصد الكتابة: البحث التفاعلي في قاعدة بيانات الأطعمة بمجرد كتابة الحرف الأول
      input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (!query) {
          closeDropdown();
          return;
        }

        const results = searchFoods(query, 16);
        const uniqueNames = [];
        const seen = new Set(formData[listKey]);

        for (const item of results) {
          const name = (item.nameAr || item.name || '').trim();
          if (name && !seen.has(name)) {
            seen.add(name);
            uniqueNames.push(name);
          }
        }

        renderDropdown(uniqueNames, query);
      });

      // التنقل بالأسهم واختيار الأكلة بـ Enter أو الفاصلة
      input.addEventListener('keydown', (e) => {
        const items = dropdown.querySelectorAll('.food-autocomplete-item');

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (items.length > 0) {
            highlightedIndex = (highlightedIndex + 1) % items.length;
            updateHighlight(items);
          }
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (items.length > 0) {
            highlightedIndex = (highlightedIndex - 1 + items.length) % items.length;
            updateHighlight(items);
          }
        } else if (e.key === 'Enter') {
          e.preventDefault();
          if (highlightedIndex >= 0 && items[highlightedIndex]) {
            const foodName = items[highlightedIndex].dataset.name;
            addFood(foodName);
          } else if (input.value.trim()) {
            addFood(input.value.trim());
          }
        } else if (e.key === ',' || e.key === '،') {
          e.preventDefault();
          if (input.value.trim()) {
            addFood(input.value.trim());
          }
        } else if (e.key === 'Backspace' && !input.value && formData[listKey].length > 0) {
          const lastItem = formData[listKey][formData[listKey].length - 1];
          removeFood(lastItem);
        } else if (e.key === 'Escape') {
          closeDropdown();
        }
      });

      const updateHighlight = (items) => {
        items.forEach((it, idx) => {
          it.classList.toggle('highlighted', idx === highlightedIndex);
          if (idx === highlightedIndex) {
            it.scrollIntoView({ block: 'nearest' });
          }
        });
      };

      // حذف الأكلة عند النقر على علامة ×
      pillsContainer.addEventListener('click', (e) => {
        const removeBtn = e.target.closest('.food-tag-remove');
        if (removeBtn) {
          e.stopPropagation();
          const foodName = removeBtn.dataset.food;
          removeFood(foodName);
        }
      });

      // التفاعل مع رقاقات الأطعمة المقترحة
      const chipsContainer = document.getElementById(`${type}-food-rec-chips`);
      chipsContainer?.addEventListener('click', (e) => {
        const chip = e.target.closest('.food-rec-chip');
        if (!chip) return;
        const food = chip.dataset.food;
        if (!food) return;
        if (formData[listKey].includes(food)) {
          removeFood(food);
        } else {
          addFood(food);
        }
      });

      // تبويبات التصنيفات في قسم الأطعمة المفضلة
      if (isLiked) {
        const catTabsContainer = document.querySelector('.food-rec-category-tabs[data-type="liked"]');
        catTabsContainer?.querySelectorAll('.rec-cat-tab').forEach(tab => {
          tab.addEventListener('click', () => {
            catTabsContainer.querySelectorAll('.rec-cat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.cat;
            const chips = chipsContainer?.querySelectorAll('.food-rec-chip');
            chips?.forEach(chip => {
              if (cat === 'all') {
                chip.style.display = chip.dataset.popular === 'true' ? 'inline-flex' : 'none';
              } else {
                chip.style.display = chip.dataset.category === cat ? 'inline-flex' : 'none';
              }
            });
          });
        });

        // ضبط الفلتر الافتراضي عند التحميل
        const chips = chipsContainer?.querySelectorAll('.food-rec-chip');
        chips?.forEach(chip => {
          chip.style.display = chip.dataset.popular === 'true' ? 'inline-flex' : 'none';
        });
      }

      updateChipStates();

      // النقر داخل الصندوق يوجه التركيز لحقل الكتابة
      box.addEventListener('click', (e) => {
        if (!e.target.closest('.food-tag-remove') && !e.target.closest('.food-autocomplete-dropdown')) {
          input.focus();
        }
      });

      // إغلاق القائمة عند النقر في الخارج
      document.addEventListener('click', (e) => {
        if (!box.contains(e.target)) {
          closeDropdown();
        }
      });
    }

    setupFoodAutocomplete('liked');
    setupFoodAutocomplete('disliked');
  }

  function saveCurrentStepInputs() {
    const activeSteps = getActiveSteps();
    const currentStepKey = activeSteps[currentStep - 1] || activeSteps[0];

    if (currentStepKey === STEP_KEYS.MEASUREMENTS) {
      const name = document.getElementById('q-name')?.value;
      const age = Number(document.getElementById('q-age')?.value) || formData.age;
      const gender = document.getElementById('q-gender')?.value || formData.gender;
      const height = Number(document.getElementById('q-height')?.value) || formData.height;
      const weight = Number(document.getElementById('q-weight')?.value) || formData.weight;
      if (name && name.trim()) formData.name = name.trim();
      if (age >= 10 && age <= 90) formData.age = age;
      if (gender) formData.gender = gender;
      if (height > 0) formData.height = height;
      if (weight > 0) formData.weight = weight;
    } else if (currentStepKey === STEP_KEYS.GOAL) {
      const targetWeight = Number(document.getElementById('q-target-weight')?.value);
      const activity = document.getElementById('q-activity')?.value;
      if (targetWeight > 0) formData.targetWeight = targetWeight;
      if (activity) formData.activityLevel = activity;
    } else if (currentStepKey === STEP_KEYS.WEEKLY_LOSS_RATE) {
      const w = Number(formData.weight) || 70;
      const h = Number(formData.height) || 175;
      const age = Number(formData.age) || 18;
      const g = formData.gender || 'male';
      const act = formData.activityLevel || 'moderate';
      const bmr = calculateBMR({ sex: g, age, weightKg: w, heightCm: h });
      const tdee = calculateMaintenanceCalories(bmr, act);
      const option = calculateWeightLossOption({
        currentWeightKg: w,
        maintenanceCalories: tdee,
        weeklyRate: formData.weeklyLossPercent || 0.0075,
        sex: g,
        age,
        targetWeightKg: formData.targetWeight || (w - 5)
      });
      formData.bmr = Math.round(bmr);
      formData.rawBmr = bmr;
      formData.maintenanceCalories = Math.round(tdee);
      formData.rawMaintenanceCalories = tdee;
      formData.selectedWeeklyLossRate = option.rate;
      formData.selectedWeeklyLossPercent = option.rate;
      formData.weeklyLossPercent = option.rate;
      formData.selectedWeeklyLossKg = option.weeklyLossKgRounded;
      formData.weeklyLossKg = option.weeklyLossKgRounded;
      formData.weeklyCalorieDeficit = option.weeklyDeficitRounded;
      formData.dailyCalorieDeficit = option.dailyDeficitRounded;
      formData.requestedTargetCalories = option.targetCaloriesRounded;
      formData.requestedCalories = option.targetCaloriesRounded;
      formData.estimatedGoalWeeks = option.estimatedWeeks;
      formData.weightLossRiskLevel = option.safety.safetyLevel;
      formData.calorieSafetyLevel = option.safety.safetyLevel;
      formData.calorieWarningCodes = option.safety.warningCodes;
    } else if (currentStepKey === STEP_KEYS.NUTRITION) {
      const likedInput = document.getElementById('q-liked-foods-input');
      if (likedInput && likedInput.value.trim()) {
        const val = likedInput.value.trim();
        if (!formData.likedFoods.includes(val)) {
          formData.likedFoods.push(val);
        }
        likedInput.value = '';
      }
      const dislikedInput = document.getElementById('q-disliked-foods-input');
      if (dislikedInput && dislikedInput.value.trim()) {
        const val = dislikedInput.value.trim();
        if (!formData.dislikedFoods.includes(val)) {
          formData.dislikedFoods.push(val);
        }
        dislikedInput.value = '';
      }
      const checkedAllergens = Array.from(document.querySelectorAll('input[name="q-allergens"]:checked')).map(el => el.value);
      formData.allergens = checkedAllergens;
    } else if (currentStepKey === STEP_KEYS.HEALTH) {
      const sleep = Number(document.getElementById('q-sleep')?.value);
      if (sleep > 0) formData.sleepHours = sleep;
      const checkedInjuries = Array.from(document.querySelectorAll('input[name="q-injuries"]:checked')).map(el => el.value);
      formData.injuries = checkedInjuries;
    } else if (currentStepKey === STEP_KEYS.TRAINING) {
      const days = Number(document.getElementById('q-workout-days')?.value);
      const eq = document.getElementById('q-equipment')?.value;
      const dur = Number(document.getElementById('q-session-duration')?.value);
      if (days > 0) formData.workoutDaysCount = days;
      if (eq) formData.equipment = eq;
      if (dur > 0) formData.sessionDurationMin = dur;
    }
  }

  function render() {
    const activeSteps = getActiveSteps();
    const totalSteps = activeSteps.length;
    if (currentStep > totalSteps) currentStep = totalSteps;
    const currentStepKey = activeSteps[currentStep - 1] || activeSteps[0];

    // 1. تحديث نص رقم الخطوة بالأعلى ديناميكياً مع كل شاشة: "الخطوة X من Y"
    const headerStep = document.getElementById('q-step-indicator-text');
    if (headerStep) {
      headerStep.textContent = `الخطوة ${currentStep} من ${totalSteps}`;
    }

    // 2. تحديث مؤشرات شريط التقدم
    const stepsBar = document.getElementById('q-steps-bar');
    if (stepsBar) {
      stepsBar.innerHTML = Array.from({ length: totalSteps }, (_, i) => `
        <div style="flex: 1; height: 4px; border-radius: 999px; background: ${i + 1 <= currentStep ? '#55F7A5' : 'rgba(85, 247, 165, 0.15)'}; box-shadow: ${i + 1 === currentStep ? '0 0 8px #55F7A5' : 'none'}; transition: all 0.3s ease;"></div>
      `).join('');
    }

    // 3. تحديث زر الرجوع
    const backBtn = document.getElementById('q-back-step-btn');
    if (backBtn) {
      backBtn.style.visibility = currentStep === 1 ? 'hidden' : 'visible';
    }

    // 4. تحديث محتوى الخطوة
    const area = document.getElementById('step-content-area');
    if (area) {
      area.innerHTML = renderStepContent(currentStepKey);
    }

    // 5. إعادة ربط أحداث الخطوة والتمرير للأعلى بسلاسة
    bindQuestionnaireEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
