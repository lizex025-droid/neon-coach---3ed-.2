/**
 * NEON COACH - استبيان التخصيص الكامل (7 خطوات قابلة للاستئناف)
 * يطابق الصورتين المرجعيتين 0E211335 و A9EED71B مع رسمة القط على الميزان وحساب العمر والماكروز تلقائياً
 */

import { store } from '../state/store.js';
import { calculateAge, calculateNutritionTargets, kgToLbs, lbsToKg } from '../domain/calculations.js';
import { generateTrainingPlan } from '../domain/planner.js';
import { syncService } from '../services/syncService.js';
import { notificationService } from '../services/notificationService.js';
import { renderMeasurementPicker, bindMeasurementPickers } from '../components/measurementPicker.js';

let currentStep = 1;
const TOTAL_STEPS = 7;

// بيانات الاستبيان الجاري تعبئتها
let formOwner = null;
let formData = {};

export function renderQuestionnaireView() {
  const state = store.getState();
  const profile = state.userProfile;
  if (formOwner !== state.auth.user?.id) {
    formOwner = state.auth.user?.id;
    currentStep = state.questionnaireDraft?.step || 1;
    formData = { ...profile, weight: profile.currentWeight || 75, height: profile.height || 175,
      age: profile.age || calculateAge(profile.birthDate) || 25, birthDate: null, targetWeight: profile.targetWeight || profile.currentWeight || 75,
      likedFoods: [...(profile.likedFoods || [])], dislikedFoods: [...(profile.dislikedFoods || [])],
      benchPressRecord: '', squatRecord: '', deadliftRecord: '', sleepHours: 7,
      ...state.questionnaireDraft?.data };
  }
  if (profile && profile.name) {
    formData.name = profile.name;
  }

  return `
    <div class="questionnaire-container" style="min-height: 100vh; padding: 20px 16px 80px; max-width: 500px; margin: 0 auto;">
      
      <!-- شريط التقدم بين الخطوات السبع -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
        <button id="q-back-step-btn" class="btn-icon" style="width: 38px; height: 38px;" aria-label="رجوع">
          ❯
        </button>
        <span id="q-step-indicator-text" style="font-weight: 800; color: #55F7A5; font-size: 0.95rem; font-family: monospace;">
          الخطوة ${currentStep} من ${TOTAL_STEPS}
        </span>
        <div style="width: 38px;"></div>
      </div>

      <!-- مؤشرات الخطوات -->
      <div id="q-steps-bar" style="display: flex; gap: 6px; margin-bottom: 24px;">
        ${Array.from({ length: TOTAL_STEPS }, (_, i) => `
          <div style="flex: 1; height: 4px; border-radius: 999px; background: ${i + 1 <= currentStep ? '#55F7A5' : 'rgba(85, 247, 165, 0.15)'}; box-shadow: ${i + 1 === currentStep ? '0 0 8px #55F7A5' : 'none'}; transition: all 0.3s ease;"></div>
        `).join('')}
      </div>

      <!-- محتوى الخطوة النشطة -->
      <div id="step-content-area">
        ${renderStepContent(currentStep)}
      </div>

    </div>
  `;
}

function renderStepContent(step) {
  switch (step) {
    case 1:
      // الخطوة 1: المعلومات الأساسية ورسمة القط على الميزان (الصورة 0E211335)
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">معلوماتك الأساسية</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">نستخدمها لحساب احتياجك اليومي بدقة علمية</p>
        </div>

        <!-- رسمة القط على الميزان مطابقة للمرجع -->
        <div style="width: 200px; height: 200px; margin: 0 auto 20px; filter: drop-shadow(0 0 16px rgba(85, 247, 165, 0.3));">
          <img src="./icons/neon-cat-scale.svg" alt="Cat on scale" style="width: 100%; height: 100%;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="neon-card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #B8C0BC; font-weight: 600;">الاسم</span>
            <input type="text" id="q-name" value="${formData.name}" style="width: 140px; text-align: left; padding: 6px 10px; border-radius: 10px;">
          </div>

          ${renderMeasurementPicker('q-age', 'العمر', 'سنة', formData.age, 18, 100)}

          <div class="neon-card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
            <span style="color: #B8C0BC; font-weight: 600;">الجنس (لحساب BMR)</span>
            <select id="q-gender" style="width: 130px; padding: 6px 10px; border-radius: 10px;">
              <option value="male" ${formData.gender === 'male' ? 'selected' : ''}>ذكر</option>
              <option value="female" ${formData.gender === 'female' ? 'selected' : ''}>أنثى</option>
            </select>
          </div>

          ${renderMeasurementPicker('q-height', 'الطول', 'سم', formData.height, 100, 250)}

          ${renderMeasurementPicker('q-weight', 'الوزن الحالي', 'كغ', formData.weight, 30, 400, 0.5)}
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

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
            <div style="font-size: 1.8rem; margin-bottom: 6px;">🔥</div>
            <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF;">خسارة الدهون</div>
            <div style="font-size: 0.7rem; color: #B8C0BC; margin-top: 4px;">تقليل الدهون وتحسين اللياقة</div>
          </div>

          <div class="neon-card goal-card ${formData.goal === 'maintenance' ? 'glow' : ''}" data-goal="maintenance" style="padding: 16px 8px; text-align: center; cursor: pointer; border-color: ${formData.goal === 'maintenance' ? '#55F7A5' : 'rgba(85,247,165,0.2)'};">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">⚖️</div>
            <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF;">تثبيت الوزن</div>
            <div style="font-size: 0.7rem; color: #B8C0BC; margin-top: 4px;">الحفاظ على وزنك الحالي</div>
          </div>

          <div class="neon-card goal-card ${formData.goal === 'muscle_gain' ? 'glow' : ''}" data-goal="muscle_gain" style="padding: 16px 8px; text-align: center; cursor: pointer; border-color: ${formData.goal === 'muscle_gain' ? '#55F7A5' : 'rgba(85,247,165,0.2)'};">
            <div style="font-size: 1.8rem; margin-bottom: 6px;">🏋️</div>
            <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF;">زيادة الكتلة</div>
            <div style="font-size: 0.7rem; color: #B8C0BC; margin-top: 4px;">بناء العضلات وزيادة القوة</div>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          <div class="neon-card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">مستوى نشاطك اليومي</div>
              <div style="font-size: 0.8rem; color: #B8C0BC;">تمارين خفيفة 1-3 أيام في الأسبوع</div>
            </div>
            <select id="q-activity" style="width: 130px; padding: 6px 10px; border-radius: 10px;">
              <option value="sedentary">مكتبي / خامل</option>
              <option value="light" selected>نشاط قليل (1-3)</option>
              <option value="moderate">متوسط (3-5)</option>
              <option value="active">نشاط عالي (6-7)</option>
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

    case 3:
      // الخطوة 3: التغذية والحساسيات وتفضيلات الأطعمة
      return `
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="font-size: 1.6rem; color: #55F7A5; margin-bottom: 6px; font-weight: 800;">تفضيلات التغذية</h2>
          <p style="font-size: 0.95rem; color: #B8C0BC;">نستبعد الحساسيات ونوفر وجباتك المفضلة</p>
        </div>

        <div class="form-group">
          <label class="form-label">أطعمة تحبها (مفصولة بفاصلة):</label>
          <input type="text" id="q-liked-foods" value="${formData.likedFoods.join('، ')}" style="border-radius: 14px;">
        </div>

        <div class="form-group">
          <label class="form-label">أطعمة لا تحبها:</label>
          <input type="text" id="q-disliked-foods" value="${formData.dislikedFoods.join('، ')}" style="border-radius: 14px;">
        </div>

        <div class="form-group">
          <label class="form-label">حساسيات غذائية مؤكدة (يتم استبعادها تماماً):</label>
          <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 6px;">
            ${[['dairy','لاكتوز / ألبان'], ['gluten','جلوتين / قمح'], ['nuts','مكسرات'], ['eggs','بيض'], ['fish','مأكولات بحرية']].map(([all, label]) => `
              <label class="badge badge-neon" style="cursor: pointer; padding: 8px 14px; font-size: 0.85rem;">
                <input type="checkbox" name="q-allergens" value="${all}" ${formData.allergens.includes(all) ? 'checked' : ''} style="width: auto; margin-inline-end: 6px;">
                ${label}
              </label>
            `).join('')}
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

    case 4:
      // الخطوة 4: نمط الحياة والنوم والعوائق
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
            ${[['shoulder','الكتف'], ['knee','الركبة'], ['lower_back','أسفل الظهر']].map(([inj, label]) => `
              <label class="badge badge-neon" style="cursor: pointer; padding: 8px 14px;">
                <input type="checkbox" name="q-injuries" value="${inj}" ${formData.injuries.includes(inj) ? 'checked' : ''} style="width: auto; margin-inline-end: 6px;">
                ${label}
              </label>
            `).join('')}
          </div>
        </div>

        <button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 24px; border-radius: 22px;">
          متابعة
        </button>
      `;

    case 5:
      // الخطوة 5: التدريب والأيام والمعدات
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

    case 6:
      // الخطوة 6: المكملات والميزانية
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

    case 7:
      // الخطوة 7: المراجعة النهائية وزر إنشاء الخطة
      const targets = calculateNutritionTargets(formData);
      const goalNames = {
        fat_loss: 'خسارة دهون (عجز 20%)',
        maintenance: 'تثبيت الوزن (سعرات المحافظة)',
        muscle_gain: 'زيادة الكتلة العضلية (فائض 10%)'
      };
      const goalText = goalNames[formData.goal] || 'خسارة دهون (عجز 20%)';
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

        <button id="create-my-plan-btn" class="btn btn-primary btn-lg btn-block" style="border-radius: 22px; font-size: 1.15rem;">
          🏋️ إنشاء خطتي الآن
        </button>
      `;

    default:
      return '';
  }
}

export function bindQuestionnaireEvents() {
  bindMeasurementPickers();
  const nextBtn = document.getElementById('q-next-step-btn');
  const backBtn = document.getElementById('q-back-step-btn');
  const createPlanBtn = document.getElementById('create-my-plan-btn');

  // التقدم للخطوة التالية
  nextBtn?.addEventListener('click', () => {
    saveCurrentStepInputs();
    if (currentStep === 1 && (!formData.name || !Number.isInteger(formData.age) || formData.age < 18 || formData.age > 100 || formData.height < 100 || formData.height > 250 || formData.weight < 30 || formData.weight > 400)) {
      notificationService.showToast('أدخل الاسم والعمر بين 18 و100 سنة، والطول والوزن ضمن الحدود المسموحة.', 'error'); return;
    }
    if (currentStep === 2 && (formData.targetWeight < 30 || formData.targetWeight > 400)) {
      notificationService.showToast('أدخل وزناً مستهدفاً بين 30 و400 كغ.', 'error'); return;
    }
    if (currentStep < TOTAL_STEPS) {
      currentStep++;
      store.state.questionnaireDraft = { step: currentStep, data: { ...formData } };
      store.saveState();
      render();
    }
  });

  // الرجوع للخطوة السابقة
  backBtn?.addEventListener('click', () => {
    saveCurrentStepInputs();
    if (currentStep > 1) {
      currentStep--;
      render();
    } else {
      window.location.hash = '#auth';
    }
  });

  // اختيار بطاقات الأهداف في الخطوة 2
  document.querySelectorAll('.goal-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.goal-card').forEach(c => {
        c.classList.remove('glow');
        c.style.borderColor = 'rgba(85,247,165,0.2)';
      });
      card.classList.add('glow');
      card.style.borderColor = '#55F7A5';
      formData.goal = card.getAttribute('data-goal');
    });
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
      startWeight: store.state.userProfile.startWeight || formData.weight,
      targetCalories: targets.targetCalories,
      targetProtein: targets.protein,
      targetCarbs: targets.carbs,
      targetFats: targets.fats,
      targetWaterLiters: Number((targets.waterMl / 1000).toFixed(1)),
      targetGlasses: targets.waterGlasses,
      onboardingCompleted: true,
      onboarding_completed: true
    };

    delete store.state.questionnaireDraft;
    store.setUserProfile(fullProfile);
    if (!store.state.progressReport.firstDay.weight) store.state.progressReport.firstDay.weight = formData.weight;
    store.state.progressReport.currentDay.weight = formData.weight;
    store.state.weeklyCheckin.currentWeight = formData.weight;

    // تحديث أهداف اليوم وإعادة تعيين المستهلك للعميل الجديد
    store.getState().today.targetCalories = targets.targetCalories;
    store.getState().today.targetProtein = targets.protein;
    store.getState().today.targetCarbs = targets.carbs;
    store.getState().today.targetFats = targets.fats;
    store.getState().today.targetWaterLiters = Number((targets.waterMl / 1000).toFixed(1));
    store.getState().today.targetGlasses = targets.waterGlasses;
    store.saveState();

    // المزامنة السحابية الفورية في جدول profiles وجدول water_logs بـ Supabase
    const saved = await syncService.flush();
    if (!saved.success) {
      createPlanBtn.style.display = '';
      if (statusDiv) statusDiv.style.display = 'none';
      notificationService.showToast('تعذر حفظ خطتك سحابياً. تحقق من الاتصال وأعد المحاولة.', 'error');
      return;
    }

    notificationService.showToast(`تم إنشاء وتفعيل خطتك الشخصية بنجاح يا ${formData.name || 'بطل'}! 🚀`, 'success');

    // الانتقال للوحة اليوم
    currentStep = 1;
    if (location.hash === '#questionnaire') window.location.hash = '#today';
  });

  // تفاعل فوري لتحديث العمر عند تغيير تاريخ الميلاد
  function saveCurrentStepInputs() {
    if (currentStep === 1) {
      const name = document.getElementById('q-name')?.value;
      const age = Number(document.getElementById('q-age')?.value);
      const gender = document.getElementById('q-gender')?.value;
      const height = Number(document.getElementById('q-height')?.value);
      const weight = Number(document.getElementById('q-weight')?.value);
      formData.name = (name || '').trim();
      formData.age = age;
      formData.birthDate = null;
      if (gender) formData.gender = gender;
      formData.height = height;
      formData.weight = weight;
    } else if (currentStep === 2) {
      const targetWeight = Number(document.getElementById('q-target-weight')?.value);
      const activity = document.getElementById('q-activity')?.value;
      if (targetWeight) formData.targetWeight = targetWeight;
      if (activity) formData.activityLevel = activity;
    } else if (currentStep === 3) {
      const splitFoods = value => String(value || '').split(/[,\u060c]/).map(s => s.trim()).filter(Boolean);
      formData.likedFoods = splitFoods(document.getElementById('q-liked-foods')?.value);
      formData.dislikedFoods = splitFoods(document.getElementById('q-disliked-foods')?.value);
      formData.allergens = [...document.querySelectorAll('[name="q-allergens"]:checked')].map(input => input.value);
    } else if (currentStep === 4) {
      formData.sleepHours = Number(document.getElementById('q-sleep')?.value) || 7;
      formData.injuries = [...document.querySelectorAll('[name="q-injuries"]:checked')].map(input => input.value);
    } else if (currentStep === 5) {
      const days = Number(document.getElementById('q-workout-days')?.value);
      const eq = document.getElementById('q-equipment')?.value;
      const dur = Number(document.getElementById('q-session-duration')?.value);
      if (days) formData.workoutDaysCount = days;
      if (eq) formData.equipment = eq;
      if (dur) formData.sessionDurationMin = dur;
    }
  }

  function render() {
    // 1. تحديث نص رقم الخطوة بالأعلى ديناميكياً مع كل شاشة: "الخطوة X من 7"
    const headerStep = document.getElementById('q-step-indicator-text');
    if (headerStep) {
      headerStep.textContent = `الخطوة ${currentStep} من ${TOTAL_STEPS}`;
    }

    // 2. تحديث مؤشرات شريط التقدم السبعة
    const stepsBar = document.getElementById('q-steps-bar');
    if (stepsBar) {
      stepsBar.innerHTML = Array.from({ length: TOTAL_STEPS }, (_, i) => `
        <div style="flex: 1; height: 4px; border-radius: 999px; background: ${i + 1 <= currentStep ? '#55F7A5' : 'rgba(85, 247, 165, 0.15)'}; box-shadow: ${i + 1 === currentStep ? '0 0 8px #55F7A5' : 'none'}; transition: all 0.3s ease;"></div>
      `).join('');
    }

    // 3. تحديث محتوى الخطوة
    const area = document.getElementById('step-content-area');
    if (area) {
      area.innerHTML = renderStepContent(currentStep);
    }

    // 4. إعادة ربط أحداث الخطوة والتمرير للأعلى بسلاسة
    bindQuestionnaireEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
