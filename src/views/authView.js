import { authService } from '../services/authService.js';

let currentMode = 'login';
let notice = '';
export function renderAuthView() {
  const signup = currentMode === 'signup';
  const reset = currentMode === 'forgot';
  return `<section class="auth-page-container">
    <img src="/icons/neon-cat-coach.svg" alt="" width="96" height="96">
    <h1>NEON COACH</h1><p>سجّل الدخول للوصول إلى خطتك وبياناتك الشخصية</p>
    <div class="auth-card">
      <div class="auth-tabs" role="tablist" aria-label="الدخول إلى حسابك">
        <button class="auth-tab-btn ${!signup ? 'active' : ''}" id="tab-login" role="tab" aria-selected="${!signup}">تسجيل الدخول</button>
        <button class="auth-tab-btn ${signup ? 'active' : ''}" id="tab-signup" role="tab" aria-selected="${signup}">إنشاء حساب</button>
      </div>
      <p id="auth-notice" role="status" aria-live="polite"></p>
      <form id="auth-form" class="auth-fields">
        ${signup ? '<label for="auth-name">الاسم الكامل</label><input id="auth-name" name="name" autocomplete="name" minlength="2" maxlength="100" required>' : ''}
        <label for="auth-email">البريد الإلكتروني</label>
        <input id="auth-email" name="email" type="email" autocomplete="email" dir="ltr" maxlength="254" required>
        ${!reset ? `<label for="auth-password">كلمة المرور${signup ? ' (12 خانة على الأقل)' : ''}</label>
        <div class="password-field"><input id="auth-password" name="password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" ${signup ? 'minlength="12"' : ''} maxlength="256" required>
        <button type="button" id="toggle-password-btn" aria-label="إظهار كلمة المرور">👁</button></div>` : ''}
        ${signup ? '<label for="auth-confirm-password">تأكيد كلمة المرور</label><input id="auth-confirm-password" type="password" autocomplete="new-password" minlength="12" required>' : ''}
        <button class="btn btn-primary btn-block" id="auth-submit-btn" type="submit">${reset ? 'إرسال رابط الاستعادة' : signup ? 'إنشاء حساب' : 'تسجيل الدخول'}</button>
      </form>
      <button class="btn btn-block" id="forgot-password-link">${reset ? 'العودة لتسجيل الدخول' : 'نسيت كلمة المرور؟'}</button>
      <p class="text-muted">${signup ? 'عندك حساب مسبقاً؟ اختَر تسجيل الدخول. بعد إنشاء الحساب أكّد بريدك من الرسالة.' : 'بياناتك مرتبطة بحسابك. لا يمكن استخدام التطبيق دون تسجيل الدخول.'}</p>
    </div>
  </section>`;
}
function refresh() {
  const container = document.getElementById('view-container');
  if (container) { container.innerHTML = renderAuthView(); bindAuthViewEvents(); }
}
export function bindAuthViewEvents() {
  const message = document.getElementById('auth-notice');
  message.textContent = notice;
  document.getElementById('tab-login').onclick = () => { currentMode = 'login'; notice = ''; refresh(); };
  document.getElementById('tab-signup').onclick = () => { currentMode = 'signup'; notice = ''; refresh(); };
  document.getElementById('forgot-password-link').onclick = () => { currentMode = currentMode === 'forgot' ? 'login' : 'forgot'; notice = ''; refresh(); };
  document.getElementById('toggle-password-btn')?.addEventListener('click', (event) => {
    const input = document.getElementById('auth-password');
    input.type = input.type === 'password' ? 'text' : 'password';
    event.currentTarget.setAttribute('aria-label', input.type === 'password' ? 'إظهار كلمة المرور' : 'إخفاء كلمة المرور');
  });
  let submitting = false;
  document.getElementById('auth-form').onsubmit = async (event) => {
    event.preventDefault();
    if (submitting) return;
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password')?.value;
    if (currentMode === 'signup' && password !== document.getElementById('auth-confirm-password').value) {
      message.textContent = 'كلمتا المرور غير متطابقتين'; return;
    }
    submitting = true;
    const button = document.getElementById('auth-submit-btn');
    button.disabled = true;
    message.textContent = 'جاري التحقق…';
    try {
      const result = currentMode === 'forgot' ? await authService.resetPassword(email)
        : currentMode === 'signup' ? await authService.signUpWithEmail(document.getElementById('auth-name').value, email, password)
        : await authService.loginWithEmail(email, password);
      if (result.success && result.user) {
        notice = '';
        location.hash = result.onboardingCompleted ? '#today' : '#questionnaire';
      } else {
        notice = result.message || result.error;
        if (result.needsConfirmation) {
          currentMode = 'login'; refresh();
          document.getElementById('auth-email').value = email;
        } else message.textContent = notice;
      }
    } catch { message.textContent = 'تعذر الاتصال، حاول مجدداً'; }
    finally { submitting = false; button.disabled = false; }
  };
}
export function renderResetPasswordView() {
  return `<section class="auth-page-container"><div class="auth-card"><h1>كلمة مرور جديدة</h1>
  <form id="reset-password-form" class="auth-fields"><label for="new-password">كلمة المرور (12 خانة على الأقل)</label>
  <input id="new-password" type="password" autocomplete="new-password" minlength="12" required>
  <label for="confirm-new-password">تأكيد كلمة المرور</label><input id="confirm-new-password" type="password" autocomplete="new-password" minlength="12" required>
  <button class="btn btn-primary">حفظ كلمة المرور</button><p role="status" id="reset-status"></p></form></div></section>`;
}
export function bindResetPasswordEvents() {
  document.getElementById('reset-password-form').onsubmit = async event => {
    event.preventDefault();
    const password = document.getElementById('new-password').value;
    const status = document.getElementById('reset-status');
    if (password !== document.getElementById('confirm-new-password').value) { status.textContent = 'كلمتا المرور غير متطابقتين'; return; }
    const button = event.currentTarget.querySelector('button');
    button.disabled = true;
    try {
      const result = await authService.updatePassword(password);
      if (result.success) location.hash = '#today';
      else status.textContent = result.error;
    } catch { status.textContent = 'تعذر حفظ كلمة المرور، حاول مجدداً'; }
    finally { button.disabled = false; }
  };
}
