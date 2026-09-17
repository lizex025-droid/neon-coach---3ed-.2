import test from 'node:test';
import assert from 'node:assert/strict';

import { 
  renderProfileView, 
  setActiveSubPage, 
  getActiveSubPage 
} from '../src/views/profileView.js';
import { store } from '../src/state/store.js';

test('Main Hub renders compact user card, stat pills, and menu items', () => {
  store.setUserProfile({
    name: 'أحمد البطل',
    email: 'ahmad@example.com',
    currentWeight: 103,
    targetWeight: 90,
    streakDays: 12,
    birthDate: '1998-05-15',
    gender: 'male',
    height: 180
  });

  setActiveSubPage('main');
  const html = renderProfileView();

  // 1. User card details
  assert.match(html, /أحمد البطل/);
  assert.match(html, /ahmad@example\.com/);
  assert.match(html, /btn-edit-avatar/);

  // 2. Stat pills: weight and streak
  assert.match(html, /103 كغ/);
  assert.match(html, /الهدف 90 كغ/);
  assert.match(html, /🔥/);
  assert.match(html, /12 يومًا/);

  // 3. User card must NOT show birthdate, gender, height in the main hub
  assert.doesNotMatch(html, /1998-05-15/);
  assert.doesNotMatch(html, /الطول \(سم\)/);

  // 4. Menu categories and items
  assert.match(html, /الحساب والخطة/);
  assert.match(html, /بياناتي وخطتي/);
  assert.match(html, /الشارات والإنجازات/);

  assert.match(html, /إعدادات التطبيق/);
  assert.match(html, /اللغة والمظهر والوحدات/);
  assert.match(html, /الأجهزة والتطبيقات المرتبطة/);
  assert.match(html, /تحت التطوير/);

  assert.match(html, /الأمان والمساعدة/);
  assert.match(html, /الخصوصية والأمان/);
  assert.match(html, /الدعم والتواصل/);

  // 5. Logout button and footer
  assert.match(html, /تسجيل الخروج/);
  assert.match(html, /الإصدار 1\.0\.0/);
  assert.match(html, /الشروط والأحكام/);
  assert.match(html, /سياسة الخصوصية/);
});

test('Plan Sub-Page renders 5 ordered sections and smart confirmation modal', () => {
  setActiveSubPage('plan');
  const html = renderProfileView();

  // Top back button
  assert.match(html, /العودة إلى حسابي/);

  // 1. Personal info
  assert.match(html, /1\. المعلومات الشخصية/);
  assert.match(html, /plan-name/);
  assert.match(html, /plan-birthdate/);
  assert.match(html, /plan-gender/);
  assert.match(html, /البريد الإلكتروني \(للعرض فقط\)/);

  // 2. Body measurements
  assert.match(html, /2\. قياسات الجسم/);
  assert.match(html, /plan-height/);
  assert.match(html, /plan-current-weight/);
  assert.match(html, /plan-target-weight/);
  assert.match(html, /plan-bmi-badge/);

  // 3. Plan setup
  assert.match(html, /3\. إعداد الخطة/);
  assert.match(html, /plan-goal/);
  assert.match(html, /plan-level/);
  assert.match(html, /plan-workout-days/);
  assert.match(html, /plan-session-duration/);
  assert.match(html, /plan-equipment/);
  assert.match(html, /plan-workout-plan/);

  // 4. Nutrition
  assert.match(html, /4\. التغذية والماء/);
  assert.match(html, /plan-activity-level/);
  assert.match(html, /plan-target-calories/);
  assert.match(html, /plan-target-water/);
  assert.match(html, /btn-recalculate-targets/);

  // 5. Plan actions
  assert.match(html, /btn-save-plan-all/);
  assert.match(html, /btn-restart-quiz/);

  // Confirmation alert modal
  assert.match(html, /modal-plan-change-confirm/);
  assert.match(html, /سيؤدي هذا التغيير إلى إعادة حساب السعرات والخطة/);
});

test('Badges Sub-Page renders levels, XP progress, unlocked and locked badges', () => {
  setActiveSubPage('badges');
  const html = renderProfileView();

  assert.match(html, /العودة إلى حسابي/);
  assert.match(html, /المستوى/);
  assert.match(html, /XP/);
  assert.match(html, /الشارات المكتسبة/);
  assert.match(html, /سيد الالتزام/);
  assert.match(html, /شارات تنتظر فتحها/);
  assert.match(html, /الـ 40 يوماً الكاملة/);
});

test('Preferences Sub-Page renders language, theme, and units selectors', () => {
  setActiveSubPage('preferences');
  const html = renderProfileView();

  assert.match(html, /العودة إلى حسابي/);
  assert.match(html, /اللغة \(Language\)/);
  assert.match(html, /العربية \(RTL\)/);
  assert.match(html, /English \(LTR\)/);
  assert.match(html, /المظهر \(Theme\)/);
  assert.match(html, /داكن نيون/);
  assert.match(html, /كيلوغرام/);
  assert.match(html, /رطل/);
  assert.match(html, /سنتيمتر/);
  assert.match(html, /لتر/);
  assert.match(html, /يتم حفظ وتطبيق التفضيلات مباشرة/);
});

test('Security Sub-Page renders password, sessions, export, and delete modal requiring word confirmation', () => {
  setActiveSubPage('security');
  const html = renderProfileView();

  assert.match(html, /العودة إلى حسابي/);
  assert.match(html, /1\. تغيير كلمة المرور/);
  assert.match(html, /sec-new-password/);
  assert.match(html, /btn-update-password/);
  assert.match(html, /2\. الجلسات والأجهزة المسجلة/);
  assert.match(html, /btn-logout-other-devices/);
  assert.match(html, /3\. تصدير وحماية البيانات/);
  assert.match(html, /btn-export-backup/);
  assert.match(html, /4\. حذف الحساب نهائياً/);
  assert.match(html, /modal-delete-account/);
  assert.match(html, /اكتب كلمة .*حذف/);
  assert.match(html, /input-confirm-delete-word/);
});
