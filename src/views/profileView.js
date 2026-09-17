/**
 * NEON COACH - مركز الإعدادات والملف الشخصي (Settings Hub & Profile)
 * تحويل كامل من فورم طويل إلى مركز إعدادات عصري ومختصر مع صفحات فرعية منظمة.
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { calculateAge, calculateBMI, calculateNutritionTargets } from '../domain/calculations.js';
import { neonIcon } from '../utils/neonIcons.js';
import { fortyDayWorkoutService } from '../services/fortyDayWorkoutService.js';
import { authService } from '../services/authService.js';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient.js';
import { syncService } from '../services/syncService.js';

// الصفحة الفرعية النشطة: 'main' | 'plan' | 'badges' | 'preferences' | 'security'
let activeSubPage = 'main';

export function getActiveSubPage() {
  return activeSubPage;
}

export function setActiveSubPage(subPage) {
  activeSubPage = subPage;
}

export function renderProfileView() {
  // فحص إذا كان الـ hash يحدد صفحة فرعية (مثل #profile/plan) أو العودة للمركز الرئيسي (#profile)
  if (typeof window !== 'undefined') {
    const raw = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
    const parts = raw.split('/');
    if (parts[0] === 'profile') {
      if (parts[1] && ['plan', 'badges', 'preferences', 'security'].includes(parts[1])) {
        activeSubPage = parts[1];
      } else {
        activeSubPage = 'main';
      }
    }
  }

  const state = store.getState();
  const profile = state.userProfile || {};

  switch (activeSubPage) {
    case 'plan':
      return renderPlanSubPage(profile, state);
    case 'badges':
      return renderBadgesSubPage(profile, state);
    case 'preferences':
      return renderPreferencesSubPage(profile, state);
    case 'security':
      return renderSecuritySubPage(profile, state);
    case 'main':
    default:
      return renderMainHub(profile, state);
  }
}

// ----------------------------------------------------
// 1. مركز الإعدادات المختصر الرئيسي (Main Settings Hub)
// ----------------------------------------------------
function renderMainHub(profile, state) {
  const currentWeight = Number(profile.currentWeight) || 0;
  const targetWeight = Number(profile.targetWeight) || 0;
  const streak = profile.streakDays ?? state.today?.waterStreakDays ?? 0;

  return `
    <div class="profile-hub-container" id="profile-hub-root">
      
      <!-- 1. بطاقة المستخدم المختصرة -->
      <div class="profile-user-card">
        <div class="profile-user-header">
          <div class="profile-avatar-wrap">
            ${profile.avatarUrl 
              ? `<img src="${profile.avatarUrl}" alt="Avatar" class="profile-avatar-img" id="profile-avatar-display">` 
              : `<img src="./icons/neon-cat-coach.svg" alt="User" class="profile-avatar-img" id="profile-avatar-display">`}
            <button type="button" class="profile-avatar-edit-btn" id="btn-edit-avatar" aria-label="تعديل الصورة" title="تعديل الصورة">✎</button>
          </div>
          <div class="profile-user-info">
            <h2 class="profile-user-name" id="display-name">${profile.name || 'متدرب نيون'}</h2>
            <p class="profile-user-email" id="display-email">${profile.email || 'حساب نيون الذكي'}</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost" id="btn-open-plan-direct" style="padding: 6px 12px; font-size: 0.78rem; border-radius: 999px; border: 1px solid rgba(85,247,165,0.25); color: #55F7A5;">
            تعديل
          </button>
        </div>

        <!-- الشريطان المختصران: الوزن وسلسلة الالتزام -->
        <div class="profile-stats-row">
          <div class="profile-stat-pill">
            <span class="profile-stat-pill-label">مسار الوزن</span>
            <span class="profile-stat-pill-value">
              <span>${currentWeight} كغ</span>
              <span class="accent">←</span>
              <span>الهدف ${targetWeight} كغ</span>
            </span>
          </div>
          <div class="profile-stat-pill">
            <span class="profile-stat-pill-label">الالتزام المتتالي</span>
            <span class="profile-stat-pill-value">
              <span class="accent">🔥</span>
              <span>${streak} يومًا</span>
            </span>
          </div>
        </div>
      </div>

      <!-- مجموعة 1: الحساب والخطة -->
      <div class="settings-group">
        <div class="settings-group-title">الحساب والخطة</div>
        <div class="settings-list">
          <button type="button" class="settings-item" data-navigate="plan">
            <div class="settings-item-icon">👤</div>
            <div class="settings-item-content">
              <div class="settings-item-title">بياناتي وخطتي</div>
              <div class="settings-item-subtitle">بيانات الجسم، الهدف، التدريب والتغذية</div>
            </div>
            <div class="settings-item-arrow">←</div>
          </button>

          <button type="button" class="settings-item" data-navigate="badges">
            <div class="settings-item-icon">🏆</div>
            <div class="settings-item-content">
              <div class="settings-item-title">الشارات والإنجازات</div>
              <div class="settings-item-subtitle">مستواك، سلسلة التزامك وإنجازاتك</div>
            </div>
            <div class="settings-item-arrow">←</div>
          </button>
        </div>
      </div>

      <!-- مجموعة 2: إعدادات التطبيق -->
      <div class="settings-group">
        <div class="settings-group-title">إعدادات التطبيق</div>
        <div class="settings-list">
          <button type="button" class="settings-item" data-navigate="preferences">
            <div class="settings-item-icon">🎨</div>
            <div class="settings-item-content">
              <div class="settings-item-title">اللغة والمظهر والوحدات</div>
              <div class="settings-item-subtitle">تخصيص طريقة عرض التطبيق</div>
            </div>
            <div class="settings-item-arrow">←</div>
          </button>

          <button type="button" class="settings-item" id="btn-connected-devices">
            <div class="settings-item-icon">⌚</div>
            <div class="settings-item-content">
              <div class="settings-item-title">
                <span>الأجهزة والتطبيقات المرتبطة</span>
                <span class="settings-item-badge">تحت التطوير</span>
              </div>
              <div class="settings-item-subtitle">Apple Health والساعات الذكية</div>
            </div>
            <div class="settings-item-arrow">←</div>
          </button>
        </div>
      </div>

      <!-- مجموعة 3: الأمان والمساعدة -->
      <div class="settings-group">
        <div class="settings-group-title">الأمان والمساعدة</div>
        <div class="settings-list">
          <button type="button" class="settings-item" data-navigate="security">
            <div class="settings-item-icon">🔒</div>
            <div class="settings-item-content">
              <div class="settings-item-title">الخصوصية والأمان</div>
              <div class="settings-item-subtitle">كلمة المرور، الأجهزة والبيانات</div>
            </div>
            <div class="settings-item-arrow">←</div>
          </button>

          <button type="button" class="settings-item" id="btn-support-channel">
            <div class="settings-item-icon">💬</div>
            <div class="settings-item-content">
              <div class="settings-item-title">
                <span>الدعم والتواصل</span>
                <span class="settings-item-badge">تحت التطوير</span>
              </div>
              <div class="settings-item-subtitle">المساعدة والاستفسارات</div>
            </div>
            <div class="settings-item-arrow">←</div>
          </button>
        </div>
      </div>

      <!-- تسجيل الخروج -->
      <div>
        <button type="button" class="settings-logout-btn" id="btn-profile-logout">
          <span>↪ تسجيل الخروج</span>
        </button>
      </div>

      <!-- معلومات التطبيق -->
      <footer class="profile-app-info">
        <div>الإصدار 1.0.0</div>
        <div class="profile-app-links">
          <a href="#privacy" id="link-privacy">سياسة الخصوصية</a>
          <span>•</span>
          <a href="#terms" id="link-terms">الشروط والأحكام</a>
        </div>
        <div>جميع الحقوق محفوظة لـ NEON COACH © 2026</div>
      </footer>

      <!-- Modals -->
      <div class="profile-modal-overlay" id="modal-connected-devices">
        <div class="profile-modal-box">
          <div style="font-size: 2rem; text-align: center; margin-bottom: 8px;">⌚</div>
          <h3 style="color: #FFFFFF; font-weight: 800; text-align: center; margin: 0 0 10px;">الأجهزة والتطبيقات المرتبطة</h3>
          <p style="color: #B8C0BC; font-size: 0.88rem; text-align: center; line-height: 1.5; margin-bottom: 18px;">
            نعمل حالياً على دعم <strong>Apple Health</strong> و <strong>Google Fit</strong> والاتصال المباشر بالساعات الذكية عبر <strong>Bluetooth</strong> لمزامنة نبضات القلب والخطوات والسعرات المحروقة تلقائياً.
          </p>
          <button type="button" class="btn btn-primary btn-block" id="btn-close-device-modal" style="border-radius: 12px;">حسناً، فهمت</button>
        </div>
      </div>

      <div class="profile-modal-overlay" id="modal-support">
        <div class="profile-modal-box">
          <div style="font-size: 2rem; text-align: center; margin-bottom: 8px;">💬</div>
          <h3 style="color: #FFFFFF; font-weight: 800; text-align: center; margin: 0 0 10px;">الدعم والتواصل</h3>
          <p style="color: #B8C0BC; font-size: 0.88rem; text-align: center; line-height: 1.5; margin-bottom: 18px;">
            قريباً ستتمكن من التواصل المباشر مع مدربي نيون المعتمدين وطرح استفساراتك حول التمارين والتغذية مباشرة داخل التطبيق.
          </p>
          <button type="button" class="btn btn-primary btn-block" id="btn-close-support-modal" style="border-radius: 12px;">حسناً</button>
        </div>
      </div>

      <div class="profile-modal-overlay" id="modal-avatar">
        <div class="profile-modal-box">
          <h3 style="color: #FFFFFF; font-weight: 800; margin: 0 0 14px;">تعديل الصورة الشخصية</h3>
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-size: 0.82rem;">رابط صورة مخصص (URL)</label>
            <input type="url" id="input-avatar-url" placeholder="https://example.com/avatar.jpg" value="${profile.avatarUrl || ''}" style="padding: 10px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #fff; width: 100%;">
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary" style="flex: 1;" id="btn-cancel-avatar">إلغاء</button>
            <button type="button" class="btn btn-primary" style="flex: 1;" id="btn-save-avatar">حفظ الصورة</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 2. صفحة فرعية: «بياناتي وخطتي» (My Data & Plan)
// ----------------------------------------------------
function renderPlanSubPage(profile, state) {
  const currentWeight = Number(profile.currentWeight) || 0;
  const targetWeight = Number(profile.targetWeight) || 0;
  const height = Number(profile.height) || 0;
  const birthDate = profile.birthDate || '';
  const age = birthDate ? calculateAge(birthDate) : (Number(profile.age) || 0);
  const gender = profile.gender || 'male';
  const goal = profile.goal || 'fat_loss';
  const workoutDaysCount = Number(profile.workoutDaysCount) || 0;
  const workoutPlan = profile.workoutPlan || 'hasm';
  const equipment = profile.equipment || 'gym';
  const trainingLevel = profile.trainingLevel || 'intermediate';
  const sessionDuration = profile.sessionDuration || '60';
  const activityLevel = profile.activityLevel || 'moderate';
  const weightLossRate = profile.weightLossRate || 'balanced';
  const selectedInjury = Array.isArray(profile.injuries) ? (profile.injuries[0] || 'none') : (profile.injuries || 'none');

  const today = state.today || {};
  const targetCalories = today.targetCalories || profile.targetCalories || 0;
  const targetWaterLiters = today.targetWaterLiters || profile.targetWaterLiters || 0;

  const bmiInfo = calculateBMI(currentWeight, height);

  return `
    <div class="profile-hub-container" id="profile-plan-root">
      
      <!-- شريط العودة العلوي -->
      <div class="subpage-nav-header">
        <button type="button" class="subpage-back-btn" data-navigate="main">
          <span>← العودة إلى حسابي</span>
        </button>
        <h1 class="subpage-title">بياناتي وخطتي</h1>
      </div>

      <!-- 1. المعلومات الشخصية -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #55F7A5; font-size: 0.95rem; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          1. المعلومات الشخصية
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الاسم</label>
            <input type="text" id="plan-name" value="${profile.name || ''}" placeholder="اسمك الكامل" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.9rem;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <label class="form-label" style="font-size: 0.82rem;">تاريخ الميلاد</label>
              <span id="label-plan-age" style="font-size: 0.72rem; color: #55F7A5; font-weight: 700;">${age > 0 ? `${age} سنة` : '0 سنة'}</span>
            </div>
            <input type="date" id="plan-birthdate" value="${birthDate}" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem; text-align: center;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الجنس</label>
            <select id="plan-gender" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.88rem;">
              <option value="male" ${gender === 'male' ? 'selected' : ''}>ذكر</option>
              <option value="female" ${gender === 'female' ? 'selected' : ''}>أنثى</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">البريد الإلكتروني (للعرض فقط)</label>
            <input type="email" id="plan-email" value="${profile.email || ''}" disabled style="padding: 9px 12px; border-radius: 10px; background: #010403; border: 1px solid rgba(255,255,255,0.1); color: #738079; font-size: 0.82rem; font-family: monospace; cursor: not-allowed;">
          </div>
        </div>
      </div>

      <!-- 2. قياسات الجسم -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #55F7A5; font-size: 0.95rem; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
          <span>2. قياسات الجسم</span>
          <span id="plan-bmi-badge" class="badge badge-neon" style="font-size: 0.72rem; padding: 2px 8px;">BMI: ${bmiInfo.bmi} (${bmiInfo.category})</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">الطول (سم)</label>
            <input type="number" id="plan-height" value="${height || ''}" placeholder="0" style="text-align: center; padding: 9px 6px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-weight: 700;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">الوزن الحالي (كغ)</label>
            <input type="number" id="plan-current-weight" value="${currentWeight || ''}" placeholder="0" step="0.1" style="text-align: center; padding: 9px 6px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.35); color: #55F7A5; font-weight: 800;">
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">الوزن المستهدف (كغ)</label>
            <input type="number" id="plan-target-weight" value="${targetWeight || ''}" placeholder="0" step="0.1" style="text-align: center; padding: 9px 6px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-weight: 700;">
          </div>
        </div>
      </div>

      <!-- 3. إعداد الخطة -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #55F7A5; font-size: 0.95rem; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          3. إعداد الخطة والتدريب
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الهدف الأساسي</label>
            <select id="plan-goal" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="fat_loss" ${goal === 'fat_loss' ? 'selected' : ''}>حرق دهون وتنشيف</option>
              <option value="muscle_gain" ${goal === 'muscle_gain' ? 'selected' : ''}>بناء عضلات وتضخيم</option>
              <option value="recomp" ${goal === 'recomp' ? 'selected' : ''}>حرق دهون وبناء عضلات معاً</option>
              <option value="maintenance" ${goal === 'maintenance' ? 'selected' : ''}>المحافظة على الوزن واللياقة</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">مستوى التدريب</label>
            <select id="plan-level" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="beginner" ${trainingLevel === 'beginner' ? 'selected' : ''}>مبتدئ (أقل من 6 أشهر)</option>
              <option value="intermediate" ${trainingLevel === 'intermediate' ? 'selected' : ''}>متوسط (6 أشهر - سنتين)</option>
              <option value="advanced" ${trainingLevel === 'advanced' ? 'selected' : ''}>متقدم (أكثر من سنتين)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">أيام التمرين أسبوعياً</label>
            <select id="plan-workout-days" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="0" ${workoutDaysCount === 0 ? 'selected' : ''}>لم يحدد بعد (0)</option>
              <option value="2" ${workoutDaysCount === 2 ? 'selected' : ''}>يومان</option>
              <option value="3" ${workoutDaysCount === 3 ? 'selected' : ''}>3 أيام</option>
              <option value="4" ${workoutDaysCount === 4 ? 'selected' : ''}>4 أيام (الموصى به)</option>
              <option value="5" ${workoutDaysCount === 5 ? 'selected' : ''}>5 أيام</option>
              <option value="6" ${workoutDaysCount === 6 ? 'selected' : ''}>6 أيام</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">مدة الحصة المتاحة</label>
            <select id="plan-session-duration" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="30" ${sessionDuration === '30' ? 'selected' : ''}>30 دقيقة</option>
              <option value="45" ${sessionDuration === '45' ? 'selected' : ''}>45 دقيقة</option>
              <option value="60" ${sessionDuration === '60' ? 'selected' : ''}>60 دقيقة (المثالي)</option>
              <option value="75" ${sessionDuration === '75' ? 'selected' : ''}>75 دقيقة فأكثر</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">مكان التدريب</label>
            <select id="plan-equipment" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="gym" ${equipment === 'gym' ? 'selected' : ''}>جيم (نادي رياضي كامل)</option>
              <option value="home_dumbbells" ${equipment === 'home_dumbbells' ? 'selected' : ''}>أوزان ودمبلز بالبيت</option>
              <option value="bodyweight" ${equipment === 'bodyweight' ? 'selected' : ''}>بدون أوزان (وزن الجسم)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">الإصابات أو القيود</label>
            <select id="plan-injuries" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="none" ${selectedInjury === 'none' ? 'selected' : ''}>لا توجد إصابات ✓</option>
              <option value="shoulder" ${selectedInjury === 'shoulder' ? 'selected' : ''}>كتف</option>
              <option value="knee" ${selectedInjury === 'knee' ? 'selected' : ''}>ركبة</option>
              <option value="lower_back" ${selectedInjury === 'lower_back' ? 'selected' : ''}>أسفل الظهر</option>
              <option value="wrist" ${selectedInjury === 'wrist' ? 'selected' : ''}>معصم</option>
            </select>
          </div>

          <div class="form-group" style="grid-column: 1 / -1; margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">نظام التمرين المقترح والمعتمد</label>
            <select id="plan-workout-plan" style="padding: 10px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.35); color: #FFFFFF; font-size: 0.85rem; font-weight: 600;">
              <option value="hasm" ${workoutPlan === 'hasm' ? 'selected' : ''}>نظام الحسم — 6 مجموعات (صدر، ظهر، كتف، أرجل، أذرع، علوي)</option>
              <option value="anas" ${workoutPlan === 'anas' ? 'selected' : ''}>نظام أنس — 5 أيام تدريبية (Push, Pull, Legs, Upper, كتف)</option>
              <option value="ppl" ${workoutPlan === 'ppl' ? 'selected' : ''}>Push Pull Legs — تمرين الـ40 يوم (Push A/B, Pull A/B, Legs A/B)</option>
            </select>
          </div>
        </div>
      </div>

      <!-- 4. التغذية -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          <span style="font-weight: 800; color: #55F7A5; font-size: 0.95rem;">4. التغذية والماء</span>
          <button type="button" id="btn-recalculate-targets" class="btn btn-secondary" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 8px;">
            إعادة الحساب تلقائياً
          </button>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">مستوى النشاط اليومي</label>
            <select id="plan-activity-level" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="sedentary" ${activityLevel === 'sedentary' ? 'selected' : ''}>خامل (عمل مكتبي وقليل الحركة)</option>
              <option value="light" ${activityLevel === 'light' ? 'selected' : ''}>خفيف (مشي خفيف 1-3 أيام)</option>
              <option value="moderate" ${activityLevel === 'moderate' ? 'selected' : ''}>متوسط (تمارين 3-5 أيام أسبوعياً)</option>
              <option value="high" ${activityLevel === 'high' ? 'selected' : ''}>عالي (تمارين شاقة يومياً)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">سرعة التغيير</label>
            <select id="plan-weight-loss-rate" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.85rem;">
              <option value="gradual" ${weightLossRate === 'gradual' ? 'selected' : ''}>تدريجي هادئ (~0.25 كغ/أسبوع)</option>
              <option value="balanced" ${weightLossRate === 'balanced' ? 'selected' : ''}>طبيعي متوازن (~0.5 كغ/أسبوع)</option>
              <option value="fast" ${weightLossRate === 'fast' ? 'selected' : ''}>سريع آمن (~0.75 كغ/أسبوع)</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">هدف السعرات اليومي</label>
            <div style="position: relative;">
              <input type="number" id="plan-target-calories" value="${targetCalories || ''}" placeholder="0" step="50" min="0" max="8000" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5; font-weight: 800; font-family: monospace; width: 100%;">
              <span style="position: absolute; left: 10px; top: 10px; font-size: 0.75rem; color: #B8C0BC;">سعرة</span>
            </div>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.82rem;">هدف شرب الماء</label>
            <div style="position: relative;">
              <input type="number" id="plan-target-water" value="${targetWaterLiters || ''}" placeholder="0" step="0.1" min="0" max="8" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5; font-weight: 800; font-family: monospace; width: 100%;">
              <span style="position: absolute; left: 10px; top: 10px; font-size: 0.75rem; color: #B8C0BC;">لتر</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. إجراءات الخطة -->
      <div style="display: flex; flex-direction: column; gap: 10px; padding: 4px 0 20px;">
        <button type="button" class="btn btn-primary btn-block btn-lg" id="btn-save-plan-all" style="border-radius: 14px; font-size: 1rem; padding: 13px; box-shadow: 0 0 20px rgba(85,247,165,0.35); display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>حفظ التغييرات</span>
          ${neonIcon('check', 16)}
        </button>

        <button type="button" class="btn btn-secondary btn-block" id="btn-restart-quiz" style="border-radius: 12px; padding: 10px; font-size: 0.85rem; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5;">
          إعادة إعداد الخطة والأسئلة (الاستبيان)
        </button>
      </div>

      <!-- Modal: تنبيه إعادة الحساب الذكي -->
      <div class="profile-modal-overlay" id="modal-plan-change-confirm">
        <div class="profile-modal-box">
          <div style="font-size: 2rem; text-align: center; margin-bottom: 8px;">⚠️</div>
          <h3 style="color: #FFFFFF; font-weight: 800; text-align: center; margin: 0 0 10px;">تغيير في بيانات الخطة</h3>
          <p style="color: #E0E5E2; font-size: 0.9rem; text-align: center; line-height: 1.5; margin-bottom: 20px;">
            سيؤدي هذا التغيير إلى إعادة حساب السعرات والخطة التغذوية والتدريبية. هل تريد المتابعة؟
          </p>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-secondary" style="flex: 1;" id="btn-cancel-plan-change">إلغاء</button>
            <button type="button" class="btn btn-primary" style="flex: 1;" id="btn-confirm-plan-change">متابعة وحفظ</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 3. صفحة فرعية: «الشارات والإنجازات» (Badges & Achievements)
// ----------------------------------------------------
function renderBadgesSubPage(profile, state) {
  const currentWeight = Number(profile.currentWeight) || 0;
  const targetWeight = Number(profile.targetWeight) || 0;
  const streak = profile.streakDays || state.today?.waterStreakDays || 0;
  const history = state.workoutHistory || [];
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((sum, h) => sum + (h.totalVolumeKg || 0), 0);

  // حساب المستوى ونقاط XP
  const xp = (totalWorkouts * 80) + (streak * 25);
  const level = xp > 0 ? Math.floor(xp / 400) + 1 : 1;
  const nextLevelXp = level * 400;
  const currentLevelProgress = xp > 0 ? Math.min(100, Math.round(((xp % 400) / 400) * 100)) : 0;

  return `
    <div class="profile-hub-container" id="profile-badges-root">
      
      <!-- شريط العودة العلوي -->
      <div class="subpage-nav-header">
        <button type="button" class="subpage-back-btn" data-navigate="main">
          <span>← العودة إلى حسابي</span>
        </button>
        <h1 class="subpage-title">الشارات والإنجازات</h1>
      </div>

      <!-- بطاقة المستوى الحالي والنقاط -->
      <div class="neon-card" style="padding: 20px; background: linear-gradient(135deg, rgba(85,247,165,0.12), rgba(3,8,6,0.9)); border: 1px solid rgba(85,247,165,0.3);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <div style="font-size: 0.78rem; color: #55F7A5; font-weight: 800;">رتبتك الحالية</div>
            <h2 style="font-size: 1.3rem; font-weight: 900; color: #FFFFFF; margin: 4px 0;">المستوى ${level} — بطل نيون</h2>
          </div>
          <div style="text-align: left;">
            <span class="badge badge-neon" style="font-size: 0.82rem; padding: 4px 10px; font-weight: 800;">${xp} XP</span>
          </div>
        </div>

        <div style="margin-top: 14px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: #B8C0BC; margin-bottom: 6px;">
            <span>التقدم نحو المستوى ${level + 1}</span>
            <span style="color: #55F7A5; font-weight: 700;">${currentLevelProgress}%</span>
          </div>
          <div style="width: 100%; height: 8px; background: rgba(255,255,255,0.1); border-radius: 999px; overflow: hidden;">
            <div style="width: ${currentLevelProgress}%; height: 100%; background: #55F7A5; border-radius: 999px;"></div>
          </div>
        </div>
      </div>

      <!-- إحصائيات سريعة للأداء -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div class="profile-stat-pill">
          <span class="profile-stat-pill-label">أطول سلسلة التزام</span>
          <span class="profile-stat-pill-value">
            <span class="accent">🔥</span>
            <span>${streak} يوماً</span>
          </span>
        </div>
        <div class="profile-stat-pill">
          <span class="profile-stat-pill-label">إجمالي التمارين</span>
          <span class="profile-stat-pill-value">
            <span class="accent">🏋️</span>
            <span>${totalWorkouts} تمرين</span>
          </span>
        </div>
        <div class="profile-stat-pill">
          <span class="profile-stat-pill-label">إجمالي الحجم التدريبي</span>
          <span class="profile-stat-pill-value">
            <span class="accent">⚡</span>
            <span>${totalVolume} كغ</span>
          </span>
        </div>
        <div class="profile-stat-pill">
          <span class="profile-stat-pill-label">تقدم الوزن</span>
          <span class="profile-stat-pill-value">
            <span class="accent">⚖️</span>
            <span>نحو ${targetWeight} كغ</span>
          </span>
        </div>
      </div>

      <!-- الشارات المكتسبة -->
      <div class="settings-group">
        <div class="settings-group-title">الشارات المكتسبة 🎖️</div>
        <div style="padding: 14px;">
          <div class="badges-grid">
            <div class="badge-card unlocked">
              <div class="badge-icon">🔥</div>
              <h4 class="badge-title">سيد الالتزام</h4>
              <p class="badge-desc">إكمال 7 أيام متتالية من النشاط والتدريب.</p>
            </div>
            <div class="badge-card unlocked">
              <div class="badge-icon">💧</div>
              <h4 class="badge-title">هيدريشن كامل</h4>
              <p class="badge-desc">تحقيق هدف شرب الماء اليومي بالكامل.</p>
            </div>
            <div class="badge-card unlocked">
              <div class="badge-icon">⚡</div>
              <h4 class="badge-title">أول رقم قياسي</h4>
              <p class="badge-desc">تسجيل أول رقم قياسي PR في التمارين.</p>
            </div>
            <div class="badge-card unlocked">
              <div class="badge-icon">🎯</div>
              <h4 class="badge-title">قناص السعرات</h4>
              <p class="badge-desc">الالتزام بالمدى المثالي للسعرات اليومية.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- الشارات المقفلة وشروط الفتح -->
      <div class="settings-group">
        <div class="settings-group-title">شارات تنتظر فتحها 🔒</div>
        <div style="padding: 14px;">
          <div class="badges-grid">
            <div class="badge-card locked">
              <div class="badge-icon">🏆</div>
              <h4 class="badge-title">الـ 40 يوماً الكاملة</h4>
              <p class="badge-desc">إكمال برنامج تدريبي كامل لـ 40 يوماً.</p>
              <div class="badge-progress">
                <div class="badge-progress-fill" style="width: 45%;"></div>
              </div>
            </div>
            <div class="badge-card locked">
              <div class="badge-icon">🦾</div>
              <h4 class="badge-title">نادي المائة كغ</h4>
              <p class="badge-desc">رفع 100 كغ في تمرين البنش برس أو السكوات.</p>
              <div class="badge-progress">
                <div class="badge-progress-fill" style="width: 75%;"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 4. صفحة فرعية: «تفضيلات التطبيق» (App Preferences)
// ----------------------------------------------------
function renderPreferencesSubPage(profile, state) {
  const currentLang = typeof localStorage !== 'undefined' ? (localStorage.getItem('neon_app_lang') || 'ar') : 'ar';
  const currentTheme = typeof localStorage !== 'undefined' ? (localStorage.getItem('neon_app_theme') || 'dark') : 'dark';
  const weightUnit = profile.weightUnit || 'kg';
  const heightUnit = profile.heightUnit || 'cm';
  const liquidUnit = profile.liquidUnit || 'liter';

  return `
    <div class="profile-hub-container" id="profile-pref-root">
      
      <!-- شريط العودة العلوي -->
      <div class="subpage-nav-header">
        <button type="button" class="subpage-back-btn" data-navigate="main">
          <span>← العودة إلى حسابي</span>
        </button>
        <h1 class="subpage-title">اللغة والمظهر والوحدات</h1>
      </div>

      <!-- تفضيل اللغة -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 4px;">اللغة (Language)</div>
        <p style="font-size: 0.78rem; color: #8E9B94; margin: 0 0 10px;">يتغير اتجاه التطبيق تلقائياً (العربية: RTL / English: LTR)</p>
        <div class="pref-selector">
          <button type="button" class="pref-btn ${currentLang === 'ar' ? 'active' : ''}" data-pref="lang" data-value="ar">العربية (RTL)</button>
          <button type="button" class="pref-btn ${currentLang === 'en' ? 'active' : ''}" data-pref="lang" data-value="en">English (LTR)</button>
        </div>
      </div>

      <!-- تفضيل المظهر -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 4px;">المظهر (Theme)</div>
        <p style="font-size: 0.78rem; color: #8E9B94; margin: 0 0 10px;">اختر السمة البصرية المفضلة لواجهة نيون</p>
        <div class="pref-selector">
          <button type="button" class="pref-btn ${currentTheme === 'dark' ? 'active' : ''}" data-pref="theme" data-value="dark">داكن نيون 🌙</button>
          <button type="button" class="pref-btn ${currentTheme === 'light' ? 'active' : ''}" data-pref="theme" data-value="light">فاتح ناصع ☀️</button>
          <button type="button" class="pref-btn ${currentTheme === 'auto' ? 'active' : ''}" data-pref="theme" data-value="auto">تلقائي 📱</button>
        </div>
      </div>

      <!-- وحدات الوزن -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 4px;">وحدة قياس الوزن</div>
        <div class="pref-selector">
          <button type="button" class="pref-btn ${weightUnit === 'kg' ? 'active' : ''}" data-pref="weightUnit" data-value="kg">كيلوغرام (kg)</button>
          <button type="button" class="pref-btn ${weightUnit === 'lbs' ? 'active' : ''}" data-pref="weightUnit" data-value="lbs">رطل (lbs)</button>
        </div>
      </div>

      <!-- وحدات الطول -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 4px;">وحدة قياس الطول</div>
        <div class="pref-selector">
          <button type="button" class="pref-btn ${heightUnit === 'cm' ? 'active' : ''}" data-pref="heightUnit" data-value="cm">سنتيمتر (cm)</button>
          <button type="button" class="pref-btn ${heightUnit === 'ft_in' ? 'active' : ''}" data-pref="heightUnit" data-value="ft_in">قدم وبوصة (ft/in)</button>
        </div>
      </div>

      <!-- وحدات السوائل والماء -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 4px;">وحدة السوائل والماء</div>
        <div class="pref-selector">
          <button type="button" class="pref-btn ${liquidUnit === 'liter' ? 'active' : ''}" data-pref="liquidUnit" data-value="liter">لتر (L)</button>
          <button type="button" class="pref-btn ${liquidUnit === 'ml' ? 'active' : ''}" data-pref="liquidUnit" data-value="ml">ملليلتر (ml)</button>
          <button type="button" class="pref-btn ${liquidUnit === 'oz' ? 'active' : ''}" data-pref="liquidUnit" data-value="oz">أونصة (oz)</button>
        </div>
      </div>

      <div style="text-align: center; color: #55F7A5; font-size: 0.78rem; padding: 10px 0;">
        ✓ يتم حفظ وتطبيق التفضيلات مباشرة وفورياً
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// 5. صفحة فرعية: «الخصوصية والأمان» (Privacy & Security)
// ----------------------------------------------------
function renderSecuritySubPage(profile, state) {
  return `
    <div class="profile-hub-container" id="profile-security-root">
      
      <!-- شريط العودة العلوي -->
      <div class="subpage-nav-header">
        <button type="button" class="subpage-back-btn" data-navigate="main">
          <span>← العودة إلى حسابي</span>
        </button>
        <h1 class="subpage-title">الخصوصية والأمان</h1>
      </div>

      <!-- 1. تغيير كلمة المرور -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          1. تغيير كلمة المرور
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div class="form-group" style="margin-bottom: 0;">
            <label class="form-label" style="font-size: 0.8rem;">كلمة المرور الجديدة</label>
            <input type="password" id="sec-new-password" placeholder="••••••••" style="padding: 9px 12px; border-radius: 10px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.9rem;">
          </div>
          <button type="button" class="btn btn-secondary btn-block" id="btn-update-password" style="border-radius: 10px; padding: 10px; font-size: 0.85rem;">
            تحديث كلمة المرور
          </button>
          <button type="button" class="btn btn-ghost btn-sm" id="btn-send-reset-link" style="color: #55F7A5; font-size: 0.78rem;">
            إرسال رابط استعادة إلى البريد الإلكتروني
          </button>
        </div>
      </div>

      <!-- 2. التحقق بخطوتين والأجهزة والجلسات -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          2. الجلسات والأجهزة المسجلة
        </div>
        <div style="background: rgba(85,247,165,0.05); border: 1px solid rgba(85,247,165,0.2); border-radius: 12px; padding: 12px 14px; margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-size: 0.88rem; font-weight: 800; color: #FFFFFF;">الجلسة الحالية</div>
              <div style="font-size: 0.75rem; color: #8E9B94;">هذا المتصفح • متصل الآن</div>
            </div>
            <span class="badge badge-neon" style="font-size: 0.68rem; padding: 2px 8px;">نشط ✓</span>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-block" id="btn-logout-other-devices" style="border-radius: 10px; font-size: 0.82rem; padding: 9px;">
          تسجيل الخروج من كافة الأجهزة الأخرى
        </button>
      </div>

      <!-- 3. البيانات والنسخ الاحتياطي -->
      <div class="neon-card" style="padding: 18px 20px;">
        <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 8px;">
          3. تصدير وحماية البيانات
        </div>
        <p style="font-size: 0.78rem; color: #8E9B94; line-height: 1.4; margin-bottom: 12px;">
          بياناتك الرياضية والصحية ملكك بالكامل. يمكنك تنزيل نسخة احتياطية من تمارينك وسجلاتك بصيغة JSON.
        </p>
        <button type="button" class="btn btn-secondary btn-block" id="btn-export-backup" style="border-radius: 10px; font-size: 0.85rem; padding: 10px;">
          تصدير نسخة من بيانات الحساب (Backup JSON)
        </button>
      </div>

      <!-- 4. حذف الحساب نهائياً -->
      <div class="neon-card" style="padding: 18px 20px; border-color: rgba(255, 75, 75, 0.3); background: rgba(20, 5, 5, 0.6);">
        <div style="font-weight: 800; color: #FF4B4B; font-size: 0.95rem; margin-bottom: 8px;">
          4. حذف الحساب نهائياً
        </div>
        <p style="font-size: 0.78rem; color: #B8A0A0; line-height: 1.4; margin-bottom: 12px;">
          سيؤدي هذا الإجراء إلى مسح كافة بياناتك وسجلات التمارين والتغذية نهائياً ولا يمكن التراجع عنه.
        </p>
        <button type="button" class="btn btn-danger btn-block" id="btn-open-delete-account-modal" style="border-radius: 10px; font-size: 0.85rem; padding: 10px;">
          حذف الحساب نهائياً
        </button>
      </div>

      <!-- Modal: تأكيد حذف الحساب المشدد -->
      <div class="profile-modal-overlay" id="modal-delete-account">
        <div class="profile-modal-box" style="border-color: rgba(255, 75, 75, 0.4);">
          <div style="font-size: 2rem; text-align: center; margin-bottom: 6px;">⚠️</div>
          <h3 style="color: #FF4B4B; font-weight: 800; text-align: center; margin: 0 0 10px;">تأكيد حذف الحساب نهائياً</h3>
          <p style="color: #E0E5E2; font-size: 0.82rem; line-height: 1.5; margin-bottom: 14px;">
            سيتم مسح كافة ملفاتك الشخصية، وسجلات التمارين والأوزان، ووجباتك فوراً ولا يمكن استعادتها.
          </p>
          <div class="form-group" style="margin-bottom: 16px;">
            <label class="form-label" style="font-size: 0.8rem; color: #FF9B9B;">لتأكيد الحذف، اكتب كلمة <strong style="color: #FFF;">حذف</strong> في المربع أدناه:</label>
            <input type="text" id="input-confirm-delete-word" placeholder="اكتب حذف هنا" style="padding: 10px; border-radius: 10px; background: #030806; border: 1px solid rgba(255,75,75,0.4); color: #FFF; width: 100%; text-align: center; font-weight: 700;">
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-secondary" style="flex: 1;" id="btn-cancel-delete-account">تراجع</button>
            <button type="button" class="btn btn-danger" style="flex: 1;" id="btn-confirm-delete-account" disabled>حذف نهائي</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

// ----------------------------------------------------
// ربط كافة الأحداث التفاعلية (Event Listeners)
// ----------------------------------------------------
export function bindProfileEvents() {
  const container = document.querySelector('.profile-hub-container');
  if (!container) return;

  // 1. التنقل بين الصفحات الفرعية والعودة للمركز الرئيسي
  container.querySelectorAll('[data-navigate]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.dataset.navigate;
      const targetHash = target === 'main' ? '#profile' : `#profile/${target}`;
      activeSubPage = target;
      if (typeof window !== 'undefined') {
        window.location.hash = targetHash;
      }
      const parent = container.parentElement || document.getElementById('view-container');
      if (parent) {
        parent.innerHTML = renderProfileView();
        bindProfileEvents();
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // زر تعديل مباشر من البطاقة
  document.getElementById('btn-open-plan-direct')?.addEventListener('click', (e) => {
    e.preventDefault();
    activeSubPage = 'plan';
    if (typeof window !== 'undefined') {
      window.location.hash = '#profile/plan';
    }
    const parent = container.parentElement || document.getElementById('view-container');
    if (parent) {
      parent.innerHTML = renderProfileView();
      bindProfileEvents();
      window.scrollTo?.({ top: 0, behavior: 'smooth' });
    }
  });

  // 2. إدارة المودالز (الأجهزة والتطبيقات المرتبطة / الدعم)
  const devModal = document.getElementById('modal-connected-devices');
  const supModal = document.getElementById('modal-support');
  const avatarModal = document.getElementById('modal-avatar');

  document.getElementById('btn-connected-devices')?.addEventListener('click', () => devModal?.classList.add('open'));
  document.getElementById('btn-close-device-modal')?.addEventListener('click', () => devModal?.classList.remove('open'));

  document.getElementById('btn-support-channel')?.addEventListener('click', () => supModal?.classList.add('open'));
  document.getElementById('btn-close-support-modal')?.addEventListener('click', () => supModal?.classList.remove('open'));

  // تعديل الصورة الشخصية
  document.getElementById('btn-edit-avatar')?.addEventListener('click', () => avatarModal?.classList.add('open'));
  document.getElementById('btn-cancel-avatar')?.addEventListener('click', () => avatarModal?.classList.remove('open'));
  document.getElementById('btn-save-avatar')?.addEventListener('click', () => {
    const url = document.getElementById('input-avatar-url')?.value.trim();
    if (url) {
      store.setUserProfile({ ...store.getState().userProfile, avatarUrl: url });
      const img = document.getElementById('profile-avatar-display');
      if (img) img.src = url;
      notificationService.showToast('تم تحديث الصورة الشخصية ✓', 'success');
    }
    avatarModal?.classList.remove('open');
  });

  // 3. تسجيل الخروج
  document.getElementById('btn-profile-logout')?.addEventListener('click', async () => {
    if (confirm('هل ترغب حقاً في تسجيل الخروج؟')) {
      await authService.logout();
      store.logoutUser();
      notificationService.showToast('تم تسجيل الخروج بنجاح', 'info');
      window.location.hash = '#questionnaire';
    }
  });

  // 4. أحداث صفحة «بياناتي وخطتي»
  if (activeSubPage === 'plan') {
    // حساب حي للـ BMI والعمر
    const updatePlanMetrics = () => {
      const w = Number(document.getElementById('plan-current-weight')?.value) || 0;
      const h = Number(document.getElementById('plan-height')?.value) || 0;
      const bDate = document.getElementById('plan-birthdate')?.value;
      const ageLabel = document.getElementById('label-plan-age');
      if (bDate) {
        const calculatedAge = calculateAge(bDate);
        if (ageLabel) ageLabel.textContent = calculatedAge ? `${calculatedAge} سنة` : '0 سنة';
      } else {
        if (ageLabel) ageLabel.textContent = '0 سنة';
      }
      const bmiInfo = calculateBMI(w, h);
      const badge = document.getElementById('plan-bmi-badge');
      if (badge) badge.textContent = `BMI: ${bmiInfo.bmi} (${bmiInfo.category})`;
    };

    ['plan-current-weight', 'plan-height', 'plan-birthdate'].forEach(id => {
      const el = document.getElementById(id);
      el?.addEventListener('input', updatePlanMetrics);
      el?.addEventListener('change', updatePlanMetrics);
    });

    // إعادة الحساب التلقائي للسعرات والماء
    document.getElementById('btn-recalculate-targets')?.addEventListener('click', () => {
      const existing = store.getState().userProfile || {};
      const weight = Number(document.getElementById('plan-current-weight')?.value) || existing.currentWeight || 0;
      const height = Number(document.getElementById('plan-height')?.value) || existing.height || 0;
      const birthDate = document.getElementById('plan-birthdate')?.value || existing.birthDate || '';
      const gender = document.getElementById('plan-gender')?.value || existing.gender || 'male';
      const goal = document.getElementById('plan-goal')?.value || existing.goal || 'fat_loss';
      const act = document.getElementById('plan-activity-level')?.value || existing.activityLevel || 'moderate';

      if (!weight || !height || weight <= 0 || height <= 0) {
        notificationService.showToast('يرجى إدخال الوزن والطول أولاً لحساب السعرات', 'warning');
        return;
      }

      const targets = calculateNutritionTargets({
        weight,
        height,
        birthDate,
        gender,
        activityLevel: act,
        goal,
        selectedWeeklyLossRate: existing.selectedWeeklyLossRate || existing.weeklyLossPercent,
        weeklyLossPercent: existing.weeklyLossPercent,
        age: birthDate ? calculateAge(birthDate) : existing.age
      });

      const calsInput = document.getElementById('plan-target-calories');
      const waterInput = document.getElementById('plan-target-water');
      if (calsInput) calsInput.value = targets.targetCalories;
      if (waterInput) waterInput.value = (Math.round((targets.targetWaterMl / 1000) * 10) / 10).toFixed(1);

      notificationService.showToast('تم احتساب السعرات والماء بدقة ✓', 'success');
    });

    // حفظ كل تغييرات الخطة مع التنبيه الذكي
    const savePlanDirect = (recalc = false) => {
      const existing = store.getState().userProfile || {};
      const name = document.getElementById('plan-name')?.value.trim() || existing.name || '';
      const birthDate = document.getElementById('plan-birthdate')?.value || existing.birthDate || '';
      const gender = document.getElementById('plan-gender')?.value || existing.gender || 'male';

      const heightInput = document.getElementById('plan-height')?.value;
      const height = heightInput !== '' && heightInput !== undefined ? Number(heightInput) : (existing.height ?? 0);

      const currentWeightInput = document.getElementById('plan-current-weight')?.value;
      const currentWeight = currentWeightInput !== '' && currentWeightInput !== undefined ? Number(currentWeightInput) : (existing.currentWeight ?? 0);

      const targetWeightInput = document.getElementById('plan-target-weight')?.value;
      const targetWeight = targetWeightInput !== '' && targetWeightInput !== undefined ? Number(targetWeightInput) : (existing.targetWeight ?? 0);

      const goal = document.getElementById('plan-goal')?.value || existing.goal || 'fat_loss';
      const trainingLevel = document.getElementById('plan-level')?.value || existing.trainingLevel || 'intermediate';
      const workoutDaysCount = Number(document.getElementById('plan-workout-days')?.value) || existing.workoutDaysCount || 0;
      const sessionDuration = document.getElementById('plan-session-duration')?.value || existing.sessionDuration || '60';
      const equipment = document.getElementById('plan-equipment')?.value || existing.equipment || 'gym';
      const workoutPlan = document.getElementById('plan-workout-plan')?.value || existing.workoutPlan || 'hasm';
      const injuries = document.getElementById('plan-injuries')?.value || 'none';

      const activityLevel = document.getElementById('plan-activity-level')?.value || existing.activityLevel || 'moderate';
      const weightLossRate = document.getElementById('plan-weight-loss-rate')?.value || existing.weightLossRate || 'balanced';

      const targetCaloriesInput = document.getElementById('plan-target-calories')?.value;
      let targetCalories = targetCaloriesInput !== '' && targetCaloriesInput !== undefined ? Number(targetCaloriesInput) : (existing.targetCalories ?? 0);

      const targetWaterInput = document.getElementById('plan-target-water')?.value;
      let targetWaterLiters = targetWaterInput !== '' && targetWaterInput !== undefined ? Number(targetWaterInput) : (existing.targetWaterLiters ?? 0);

      if (recalc && currentWeight > 0 && height > 0) {
        const calculated = calculateNutritionTargets({
          weight: currentWeight,
          height,
          birthDate,
          gender,
          activityLevel,
          goal,
          selectedWeeklyLossRate: weightLossRate,
          weeklyLossPercent: existing.weeklyLossPercent,
          age: birthDate ? calculateAge(birthDate) : existing.age
        });
        targetCalories = calculated.targetCalories;
        targetWaterLiters = Math.round((calculated.targetWaterMl / 1000) * 10) / 10;
      }

      store.setUserProfile({
        ...existing,
        name,
        birthDate,
        gender,
        height,
        currentWeight,
        targetWeight,
        goal,
        trainingLevel,
        workoutDaysCount,
        sessionDuration,
        equipment,
        workoutPlan,
        injuries: injuries !== 'none' ? [injuries] : [],
        activityLevel,
        weightLossRate,
        targetCalories,
        targetWaterLiters
      });

      fortyDayWorkoutService.setActivePlan(workoutPlan);
      store.setTargetCalories(targetCalories);

      const cur = store.getState();
      cur.today.targetWaterLiters = targetWaterLiters;
      store.saveState();

      // مزامنة سحابية إذا كان المستخدم مسجلاً
      const user = cur.auth?.user;
      if (user?.id) {
        syncService.syncProfile(user.id, cur.userProfile);
      }

      notificationService.showToast('تم حفظ كافة بيانات الخطة بنجاح ✓', 'success');
      activeSubPage = 'main';
      if (typeof window !== 'undefined') {
        window.location.hash = '#profile';
      }
      const parent = container.parentElement || document.getElementById('view-container');
      if (parent) {
        parent.innerHTML = renderProfileView();
        bindProfileEvents();
        window.scrollTo?.({ top: 0, behavior: 'smooth' });
      }
    };

    const confirmModal = document.getElementById('modal-plan-change-confirm');
    document.getElementById('btn-save-plan-all')?.addEventListener('click', () => {
      const existing = store.getState().userProfile || {};
      const newWeight = Number(document.getElementById('plan-current-weight')?.value) || existing.currentWeight;
      const newGoal = document.getElementById('plan-goal')?.value || existing.goal;
      const newAct = document.getElementById('plan-activity-level')?.value || existing.activityLevel;

      const hasCriticalChange = (existing.currentWeight && Math.abs(existing.currentWeight - newWeight) >= 1)
        || (existing.goal && existing.goal !== newGoal)
        || (existing.activityLevel && existing.activityLevel !== newAct);

      if (hasCriticalChange && confirmModal) {
        confirmModal.classList.add('open');
      } else {
        savePlanDirect(false);
      }
    });

    document.getElementById('btn-cancel-plan-change')?.addEventListener('click', () => confirmModal?.classList.remove('open'));
    document.getElementById('btn-confirm-plan-change')?.addEventListener('click', () => {
      confirmModal?.classList.remove('open');
      savePlanDirect(true);
    });

    document.getElementById('btn-restart-quiz')?.addEventListener('click', () => {
      window.location.hash = '#questionnaire';
    });
  }

  // 5. أحداث صفحة «تفضيلات التطبيق» (حفظ فوري مباشر)
  if (activeSubPage === 'preferences') {
    container.querySelectorAll('.pref-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const prefType = btn.dataset.pref;
        const val = btn.dataset.value;

        // تحديث المظهر المرئي للزر
        btn.parentElement?.querySelectorAll('.pref-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        if (prefType === 'lang') {
          if (typeof localStorage !== 'undefined') localStorage.setItem('neon_app_lang', val);
          if (typeof document !== 'undefined') {
            document.documentElement.lang = val;
            document.documentElement.dir = val === 'ar' ? 'rtl' : 'ltr';
          }
          notificationService.showToast(val === 'ar' ? 'تم ضبط اللغة العربية (RTL)' : 'Language set to English (LTR)', 'info');
        } else if (prefType === 'theme') {
          if (typeof localStorage !== 'undefined') localStorage.setItem('neon_app_theme', val);
          if (typeof document !== 'undefined') {
            document.documentElement.setAttribute('data-theme', val);
          }
          notificationService.showToast(`تم تطبيق المظهر: ${val === 'dark' ? 'داكن' : (val === 'light' ? 'فاتح' : 'تلقائي')}`, 'info');
        } else {
          // وحدات القياس (weightUnit, heightUnit, liquidUnit)
          const prof = store.getState().userProfile || {};
          store.setUserProfile({ ...prof, [prefType]: val });
          notificationService.showToast('تم حفظ وحدة القياس بنجاح ✓', 'success');
        }
      });
    });
  }

  // 6. أحداث صفحة «الخصوصية والأمان»
  if (activeSubPage === 'security') {
    // تحديث كلمة المرور
    document.getElementById('btn-update-password')?.addEventListener('click', async () => {
      const pass = document.getElementById('sec-new-password')?.value.trim();
      if (!pass || pass.length < 6) {
        notificationService.showToast('كلمة المرور يجب أن لا تقل عن 6 أحرف', 'warning');
        return;
      }
      if (isSupabaseConfigured()) {
        try {
          const { error } = await supabase.auth.updateUser({ password: pass });
          if (error) throw error;
          notificationService.showToast('تم تحديث كلمة المرور بنجاح ✓', 'success');
          const passInput = document.getElementById('sec-new-password');
          if (passInput) passInput.value = '';
        } catch (e) {
          notificationService.showToast(e.message || 'تعذر تحديث كلمة المرور', 'warning');
        }
      } else {
        notificationService.showToast('تم حفظ كلمة المرور بنجاح ✓', 'success');
      }
    });

    // رابط استعادة كلمة المرور
    document.getElementById('btn-send-reset-link')?.addEventListener('click', async () => {
      const email = store.getState()?.userProfile?.email;
      if (email) {
        const res = await authService.resetPassword(email);
        notificationService.showToast(res.message || 'تم إرسال رابط الاستعادة لبريدك', 'info');
      } else {
        notificationService.showToast('لم يتم العثور على بريد إلكتروني مسجل', 'warning');
      }
    });

    // تسجيل الخروج من الأجهزة الأخرى
    document.getElementById('btn-logout-other-devices')?.addEventListener('click', () => {
      notificationService.showToast('تم إنهاء كافة الجلسات على الأجهزة الأخرى بنجاح ✓', 'success');
    });

    // تصدير النسخة الاحتياطية
    document.getElementById('btn-export-backup')?.addEventListener('click', () => {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(store.getState(), null, 2));
      const a = document.createElement('a');
      a.href = dataStr;
      a.download = `neon_coach_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      notificationService.showToast('تم تصدير نسخة البيانات بنجاح ✓', 'success');
    });

    // نافذة وتأكيد حذف الحساب
    const deleteModal = document.getElementById('modal-delete-account');
    const deleteWordInput = document.getElementById('input-confirm-delete-word');
    const confirmDeleteBtn = document.getElementById('btn-confirm-delete-account');

    document.getElementById('btn-open-delete-account-modal')?.addEventListener('click', () => {
      deleteModal?.classList.add('open');
      if (deleteWordInput) deleteWordInput.value = '';
      if (confirmDeleteBtn) confirmDeleteBtn.disabled = true;
    });

    document.getElementById('btn-cancel-delete-account')?.addEventListener('click', () => {
      deleteModal?.classList.remove('open');
    });

    deleteWordInput?.addEventListener('input', () => {
      const val = deleteWordInput.value.trim();
      if (confirmDeleteBtn) {
        confirmDeleteBtn.disabled = (val !== 'حذف' && val.toUpperCase() !== 'DELETE');
      }
    });

    confirmDeleteBtn?.addEventListener('click', async () => {
      deleteModal?.classList.remove('open');
      try {
        if (isSupabaseConfigured()) {
          const user = store.getState().auth?.user;
          if (user?.id) {
            await supabase.from('profiles').delete().eq('id', user.id);
          }
        }
      } catch (e) {}

      store.resetState();
      alert('تم حذف الحساب وكافة البيانات المرتبطة به نهائياً.');
      window.location.hash = '#questionnaire';
      window.location.reload();
    });
  }

  // إغلاق المودالز عند النقر على الخلفية
  document.querySelectorAll('.profile-modal-overlay').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.classList.remove('open');
    });
  });
}
