/**
 * NEON COACH - شاشة الملف الشخصي والإعدادات (Profile & Settings)
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { calculateAge, calculateBMI, calculateNutritionTargets } from '../domain/calculations.js';
import { neonIcon } from '../utils/neonIcons.js';

export function renderProfileView() {
  const state = store.getState();
  const profile = state.userProfile || {};
  const today = state.today || {};

  const currentWeight = Number(profile.currentWeight) || 75;
  const targetWeight = Number(profile.targetWeight) || currentWeight;
  const height = Number(profile.height) || 175;
  const birthDate = profile.birthDate || '2001-08-24';
  const age = calculateAge(birthDate) || 25;
  const gender = profile.gender || 'male';
  const goal = profile.goal || 'fat_loss';
  const workoutDaysCount = profile.workoutDaysCount || 4;
  const equipment = profile.equipment || 'gym';
  const unitSystem = profile.unitSystem || 'metric';

  const bmiInfo = calculateBMI(currentWeight, height);

  return `
    <div class="profile-container" style="padding: 16px 16px 110px; display: flex; flex-direction: column; gap: 16px; max-width: 520px; margin: 0 auto;">
      
      <!-- رأس الصفحة -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: 1.5rem; font-weight: 800; color: #FFFFFF; margin: 0;">حسابي والإعدادات</h1>
          <p style="font-size: 0.85rem; color: #B8C0BC; margin-top: 3px;">تعديل بياناتك، أهدافك، وإعدادات التطبيق</p>
        </div>
      </div>

      <!-- بطاقة المستخدم المختصرة ومزود المصادقة -->
      <div class="neon-card" style="padding: 16px 20px; display: flex; align-items: center; gap: 16px;">
        <div style="width: 58px; height: 58px; border-radius: 50%; background: #050d09; border: 2px solid #55F7A5; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 0 12px rgba(85,247,165,0.25); overflow: hidden;">
          ${profile.avatarUrl ? `<img src="${profile.avatarUrl}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">` : `<img src="./icons/neon-cat-coach.svg" alt="User" style="width: 40px; height: 40px;">`}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <h2 id="display-name" style="font-size: 1.15rem; font-weight: 800; color: #FFFFFF; margin: 0;">${profile.name || 'متدرب نيون'}</h2>
            <span class="badge badge-neon" style="font-size: 0.68rem; padding: 2px 8px;">ملف شخصي محلي 📱</span>
          </div>
          ${profile.email ? `<div id="display-email" style="font-size: 0.8rem; color: #B8C0BC; margin-top: 2px; font-family: monospace;">${profile.email}</div>` : ''}
        </div>
      </div>

      <!-- 1. المعلومات الأساسية -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          المعلومات الأساسية
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الاسم</label>
            <input type="text" id="setting-name" value="${profile.name || ''}" placeholder="اسمك الكامل" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.9rem;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">البريد الإلكتروني</label>
            <input type="email" id="setting-email" value="${profile.email || ''}" placeholder="بريدك الإلكتروني" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem; font-family: monospace;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الجنس</label>
            <select id="setting-gender" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.88rem;">
              <option value="male" ${gender === 'male' ? 'selected' : ''}>ذكر</option>
              <option value="female" ${gender === 'female' ? 'selected' : ''}>أنثى</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label" style="font-size: 0.82rem;">تاريخ الميلاد</label>
              <span id="label-age" style="font-size: 0.72rem; color: #55F7A5; font-weight: 700;">${age} سنة</span>
            </div>
            <input type="date" id="setting-birthdate" value="${birthDate}" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem; text-align: center;">
          </div>
        </div>
      </div>

      <!-- 2. القياسات والوزن -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>القياسات والوزن</span>
          <span id="quick-bmi-badge" class="badge badge-neon" style="font-size: 0.72rem; padding: 2px 8px;">BMI: ${bmiInfo.bmi} (${bmiInfo.category})</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">الطول (سم)</label>
            <input type="number" id="setting-height" value="${height}" style="text-align: center; padding: 9px 6px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-weight: 700;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">الوزن الحالي (كغ)</label>
            <input type="number" id="setting-current-weight" value="${currentWeight}" step="0.1" style="text-align: center; padding: 9px 6px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.35); color: #55F7A5; font-weight: 800;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">الوزن المطلوب (كغ)</label>
            <input type="number" id="setting-target-weight" value="${targetWeight}" step="0.1" style="text-align: center; padding: 9px 6px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- 3. الهدف والتمارين -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          هدفك ونمط تمرينك
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الهدف الأساسي</label>
            <select id="setting-goal" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="fat_loss" ${goal === 'fat_loss' ? 'selected' : ''}>حرق دهون وتنشيف 🔥</option>
              <option value="muscle_gain" ${goal === 'muscle_gain' ? 'selected' : ''}>بناء عضلات 💪</option>
              <option value="recomp" ${goal === 'recomp' ? 'selected' : ''}>حرق دهون وبناء عضلات معاً ⚡</option>
              <option value="maintenance" ${goal === 'maintenance' ? 'selected' : ''}>المحافظة على الوزن واللياقة ⚖️</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">أيام التمرين أسبوعياً</label>
            <select id="setting-workout-days" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="2" ${workoutDaysCount === 2 ? 'selected' : ''}>يومان</option>
              <option value="3" ${workoutDaysCount === 3 ? 'selected' : ''}>3 أيام</option>
              <option value="4" ${workoutDaysCount === 4 ? 'selected' : ''}>4 أيام (الموصى به)</option>
              <option value="5" ${workoutDaysCount === 5 ? 'selected' : ''}>5 أيام</option>
              <option value="6" ${workoutDaysCount === 6 ? 'selected' : ''}>6 أيام</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">مكان التمرين</label>
            <select id="setting-equipment" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="gym" ${equipment === 'gym' ? 'selected' : ''}>جيم (نادي رياضي)</option>
              <option value="home_dumbbells" ${equipment === 'home_dumbbells' ? 'selected' : ''}>أوزان ودمبلز بالبيت</option>
              <option value="bodyweight" ${equipment === 'bodyweight' ? 'selected' : ''}>بدون أوزان (وزن الجسم)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">نظام القياس</label>
            <select id="setting-unit-system" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="metric" ${unitSystem === 'metric' ? 'selected' : ''}>متري (كغ / سم)</option>
              <option value="imperial" ${unitSystem === 'imperial' ? 'selected' : ''}>إمبراطوري (باوند / إنش)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 4. التغذية والماء اليومية -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          <span style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">التغذية والماء</span>
          <button id="btn-recalculate-simple" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 8px;">
            ⚡ احتساب تلقائي
          </button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">هدف السعرات اليومي</label>
            <div style="position: relative;">
              <input type="number" id="setting-target-calories" value="${today.targetCalories || 2100}" step="50" min="800" max="8000" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5; font-weight: 800; font-family: monospace; width: 100%;">
              <span style="position: absolute; left: 10px; top: 10px; font-size: 0.75rem; color: #B8C0BC;">سعرة</span>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">هدف شرب الماء</label>
            <div style="position: relative;">
              <input type="number" id="setting-target-water" value="${today.targetWaterLiters || 2.4}" step="0.1" min="1" max="8" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5; font-weight: 800; font-family: monospace; width: 100%;">
              <span style="position: absolute; left: 10px; top: 10px; font-size: 0.75rem; color: #B8C0BC;">لتر</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. البيانات والنسخ الاحتياطي -->
      <div class="neon-card" style="padding: 16px 20px;">
        <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          البيانات والنسخ الاحتياطي
        </div>

        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          <button id="export-data-json-btn" class="btn btn-secondary" style="flex: 1; min-width: 130px; padding: 9px; font-size: 0.82rem; border-radius: 10px;">
            <span>تصدير نسخة</span> 💾
          </button>

          <button id="import-data-json-btn" class="btn btn-secondary" style="flex: 1; min-width: 130px; padding: 9px; font-size: 0.82rem; border-radius: 10px;">
            <span>استيراد نسخة</span> 📥
          </button>
          <input type="file" id="import-data-json-file" accept=".json" style="display: none;" />

          <button id="restart-questionnaire-btn" class="btn btn-secondary" style="width: 100%; padding: 10px; font-size: 0.84rem; border-radius: 10px; margin-top: 4px; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5; font-weight: 700;">
            <span>إعادة تحديد الخطة والأسئلة</span> 🔄
          </button>

          <button id="reset-app-data-btn" class="btn btn-danger" style="width: 100%; padding: 9px; font-size: 0.8rem; border-radius: 10px; margin-top: 2px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span>مسح البيانات وإعادة البدء</span>
            ${neonIcon('alert', 14)}
          </button>
        </div>
      </div>

      <!-- زر الحفظ الثابت بالأسفل -->
      <div style="position: sticky; bottom: 74px; z-index: 50; padding: 4px 0;">
        <button id="profile-save-all-btn" class="btn btn-primary btn-block btn-lg" style="border-radius: 14px; font-size: 1rem; padding: 13px; box-shadow: 0 0 20px rgba(85,247,165,0.35); display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>حفظ التغييرات</span>
          ${neonIcon('check', 16)}
        </button>
      </div>

    </div>
  `;
}

export function bindProfileEvents() {
  // تحديث العمر ومؤشر كتلة الجسم فوراً عند تغيير الأرقام
  function updateLiveMetrics() {
    const weight = Number(document.getElementById('setting-current-weight')?.value) || 75;
    const height = Number(document.getElementById('setting-height')?.value) || 175;
    const birthDate = document.getElementById('setting-birthdate')?.value;

    if (birthDate) {
      const age = calculateAge(birthDate);
      const ageLabel = document.getElementById('label-age');
      if (ageLabel) ageLabel.textContent = `${age} سنة`;
    }

    const bmiInfo = calculateBMI(weight, height);
    const bmiBadge = document.getElementById('quick-bmi-badge');
    if (bmiBadge) {
      bmiBadge.textContent = `BMI: ${bmiInfo.bmi} (${bmiInfo.category})`;
    }
  }

  ['setting-current-weight', 'setting-height', 'setting-birthdate'].forEach(id => {
    const el = document.getElementById(id);
    el?.addEventListener('input', updateLiveMetrics);
    el?.addEventListener('change', updateLiveMetrics);
  });

  // زر الاحتساب التلقائي للسعرات والماء
  document.getElementById('btn-recalculate-simple')?.addEventListener('click', () => {
    const existingProfile = store.getState().userProfile || {};
    const weight = Number(document.getElementById('setting-current-weight')?.value) || existingProfile.currentWeight || 75;
    const height = Number(document.getElementById('setting-height')?.value) || existingProfile.height || 175;
    const birthDate = document.getElementById('setting-birthdate')?.value || existingProfile.birthDate || '2001-08-24';
    const gender = document.getElementById('setting-gender')?.value || existingProfile.gender || 'male';
    const goal = document.getElementById('setting-goal')?.value || existingProfile.goal || 'fat_loss';

    const targets = calculateNutritionTargets({
      weight,
      height,
      birthDate,
      gender,
      activityLevel: existingProfile.activityLevel || 'moderate',
      goal,
      selectedWeeklyLossRate: existingProfile.selectedWeeklyLossRate || existingProfile.weeklyLossPercent,
      weeklyLossPercent: existingProfile.weeklyLossPercent,
      age: calculateAge(birthDate)
    });

    const calsInput = document.getElementById('setting-target-calories');
    const waterInput = document.getElementById('setting-target-water');

    if (calsInput) calsInput.value = targets.targetCalories;
    if (waterInput) waterInput.value = (Math.round((targets.targetWaterMl / 1000) * 10) / 10).toFixed(1);

    notificationService.showToast('تم احتساب السعرات والماء بنجاح ⚡', 'success');
  });

  // زر حفظ التغييرات
  document.getElementById('profile-save-all-btn')?.addEventListener('click', () => {
    const existingProfile = store.getState().userProfile || {};
    const name = document.getElementById('setting-name')?.value.trim() || existingProfile.name || 'متدرب نيون';
    const email = document.getElementById('setting-email')?.value.trim() || existingProfile.email || '';
    const gender = document.getElementById('setting-gender')?.value || existingProfile.gender || 'male';
    const birthDate = document.getElementById('setting-birthdate')?.value || existingProfile.birthDate || '';
    const currentWeight = Number(document.getElementById('setting-current-weight')?.value) || 75;
    const targetWeight = Number(document.getElementById('setting-target-weight')?.value) || currentWeight;
    const height = Number(document.getElementById('setting-height')?.value) || 175;

    const goal = document.getElementById('setting-goal')?.value || 'fat_loss';
    const workoutDaysCount = Number(document.getElementById('setting-workout-days')?.value) || 4;
    const equipment = document.getElementById('setting-equipment')?.value || 'gym';
    const unitSystem = document.getElementById('setting-unit-system')?.value || 'metric';

    const targetCalories = Number(document.getElementById('setting-target-calories')?.value) || 2100;
    const targetWaterLiters = Number(document.getElementById('setting-target-water')?.value) || 2.4;

    // حفظ في مخزن الحالة
    store.setUserProfile({
      ...existingProfile,
      name,
      email,
      gender,
      birthDate,
      currentWeight,
      targetWeight,
      height,
      goal,
      workoutDaysCount,
      equipment,
      unitSystem,
      targetCalories
    });

    store.setTargetCalories(targetCalories);

    const currentState = store.getState();
    currentState.today.targetWaterLiters = targetWaterLiters;
    store.saveState();

    // تحديث الاسم والبريد في رأس البطاقة
    const nameDisplay = document.getElementById('display-name');
    if (nameDisplay) nameDisplay.textContent = name;
    const emailDisplay = document.getElementById('display-email');
    if (emailDisplay) emailDisplay.textContent = email;

    notificationService.showToast('تم حفظ التغييرات بنجاح 💚', 'success');
  });

  // تصدير نسخة احتياطية
  document.getElementById('export-data-json-btn')?.addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `neon_coach_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notificationService.showToast('تم تصدير النسخة الاحتياطية 💾', 'success');
  });

  // استيراد نسخة احتياطية
  const importBtn = document.getElementById('import-data-json-btn');
  const importFileInput = document.getElementById('import-data-json-file');

  importBtn?.addEventListener('click', () => {
    importFileInput?.click();
  });

  importFileInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result);
        if (!parsed || typeof parsed !== 'object' || !parsed.userProfile) {
          throw new Error('الملف غير صالح');
        }
        store.restoreState(parsed);
        notificationService.showToast('تمت استعادة البيانات بنجاح 🚀', 'success');
        setTimeout(() => window.location.reload(), 500);
      } catch (err) {
        alert('فشل استيراد الملف: ' + (err.message || 'الملف غير صالح'));
      }
    };
    reader.readAsText(file);
    importFileInput.value = '';
  });

  // إعادة تحديد الخطة والأسئلة
  document.getElementById('restart-questionnaire-btn')?.addEventListener('click', () => {
    window.location.hash = '#questionnaire';
  });

  // إعادة ضبط التطبيق ومسح البيانات
  document.getElementById('reset-app-data-btn')?.addEventListener('click', () => {
    const confirmed = confirm('هل أنت متأكد من رغبتك في مسح كافة البيانات والبدء من جديد؟');
    if (confirmed) {
      store.resetState();
      alert('تم مسح البيانات بنجاح.');
      window.location.hash = '#questionnaire';
      window.location.reload();
    }
  });
}

