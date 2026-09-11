/**
 * NEON COACH - شاشة تسجيل الدخول وإنشاء الحساب (Authentication View)
 * تدعم:
 * 1. تسجيل الدخول وإنشاء الحساب عبر Google
 * 2. تسجيل الدخول وإنشاء الحساب عبر Apple
 * 3. تسجيل الدخول وإنشاء الحساب بالبريد الإلكتروني وكلمة المرور
 * 4. التبديل الفوري والحيوي بين (تسجيل الدخول) و(إنشاء حساب)
 * 5. وضع التجربة السريعة كضيف (Demo Mode)
 * 6. استعادة كلمة المرور عبر نافذة مخصصة
 */

import { authService } from '../services/authService.js';
import { notificationService } from '../services/notificationService.js';

let currentMode = 'signup'; // 'signup' | 'login' - إنشاء حساب إجباري للبدء

export function renderAuthView() {
  const isLogin = currentMode === 'login';

  return `
    <div class="auth-page-container">
      
      <!-- شعار القط المدرب النيون الفاخر -->
      <div class="auth-mascot-wrapper" style="width: 110px; height: 110px; margin-bottom: 12px; filter: drop-shadow(0 0 24px rgba(85, 247, 165, 0.45));">
        <img src="./icons/neon-cat-coach.svg" alt="NEON COACH" style="width: 100%; height: 100%;">
      </div>

      <h1 style="font-size: 2.1rem; font-weight: 900; letter-spacing: 2px; color: #55F7A5; margin-bottom: 4px; text-shadow: 0 0 20px rgba(85, 247, 165, 0.4);">
        NEON COACH
      </h1>
      <p style="font-size: 0.95rem; color: #B8C0BC; margin-bottom: 24px; font-weight: 600;">
        أنشئ حسابك لبدء خطتك الشخصية ⚡
      </p>

      <!-- بطاقة المصادقة الرئيسية -->
      <div class="auth-card">
        
        <!-- تبويبات التبديل بين إنشاء حساب وتسجيل الدخول -->
        <div class="auth-tabs" role="tablist">
          <button type="button" id="tab-signup" class="auth-tab-btn ${!isLogin ? 'active' : ''}" role="tab" aria-selected="${!isLogin}">
            <span>✨</span>
            <span>إنشاء حساب</span>
          </button>
          <button type="button" id="tab-login" class="auth-tab-btn ${isLogin ? 'active' : ''}" role="tab" aria-selected="${isLogin}">
            <span>🔑</span>
            <span>تسجيل الدخول</span>
          </button>
        </div>

        <!-- أزرار الدخول السريع عبر Google و Apple -->
        <div class="social-auth-group">
          <!-- زر Google -->
          <button type="button" id="google-auth-btn" class="btn-social btn-google" title="${isLogin ? 'تسجيل الدخول بحساب Google' : 'إنشاء حساب عبر Google'}">
            <!-- أيقونة Google الملونة الرسمية -->
            <svg width="20" height="20" viewBox="0 0 24 24" style="flex-shrink: 0;">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>${isLogin ? 'متابعة باستخدام Google' : 'إنشاء حساب باستخدام Google'}</span>
          </button>

          <!-- زر Apple -->
          <button type="button" id="apple-auth-btn" class="btn-social btn-apple" title="${isLogin ? 'تسجيل الدخول بحساب Apple' : 'إنشاء حساب عبر Apple'}">
            <!-- أيقونة Apple الرسمية -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="flex-shrink: 0;">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.1c.62-.75 1.04-1.8.93-2.85-.9.04-1.99.6-2.64 1.35-.57.66-1.07 1.72-.94 2.74 1.01.08 2.03-.49 2.65-1.24z"/>
            </svg>
            <span>${isLogin ? 'متابعة باستخدام Apple' : 'إنشاء حساب باستخدام Apple'}</span>
          </button>

          <!-- زر Facebook -->
          <button type="button" id="facebook-auth-btn" class="btn-social btn-facebook" title="${isLogin ? 'تسجيل الدخول بحساب Facebook' : 'إنشاء حساب عبر Facebook'}">
            <!-- أيقونة Facebook الرسمية -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2" style="flex-shrink: 0;">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>${isLogin ? 'متابعة باستخدام Facebook' : 'إنشاء حساب باستخدام Facebook'}</span>
          </button>
        </div>

        <!-- فاصل البريد الإلكتروني -->
        <div class="auth-divider">
          <span>أو عبر البريد الإلكتروني</span>
        </div>

        <!-- نموذج تسجيل الدخول / إنشاء الحساب بالبريد -->
        <form id="auth-form" style="display: flex; flex-direction: column; gap: 14px;">
          
          <!-- حقل الاسم الكامل (في وضع إنشاء الحساب فقط) -->
          ${!isLogin ? `
            <div class="input-with-icon">
              <input type="text" id="auth-name" placeholder="الاسم الكامل" required style="padding-inline-start: 46px; border-radius: 16px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.95rem;">
              <span class="input-icon" style="color: #55F7A5;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
              </span>
            </div>
          ` : ''}

          <!-- حقل البريد الإلكتروني -->
          <div class="input-with-icon">
            <input type="email" id="auth-email" placeholder="البريد الإلكتروني" required style="padding-inline-start: 46px; border-radius: 16px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.95rem; font-family: monospace;">
            <span class="input-icon" style="color: #55F7A5;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            </span>
          </div>

          <!-- حقل كلمة المرور -->
          <div class="input-with-icon">
            <input type="password" id="auth-password" placeholder="كلمة المرور (12 خانة على الأقل)" required style="padding-inline-start: 46px; padding-inline-end: 44px; border-radius: 16px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.95rem;">
            <span class="input-icon" style="color: #55F7A5;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            </span>
            <button type="button" id="toggle-password-btn" class="input-action" aria-label="إظهار كلمة المرور" style="background: transparent; border: none; cursor: pointer; color: #8C9992; font-size: 1.1rem; padding: 4px;">
              👁️
            </button>
          </div>

          <!-- حقل تأكيد كلمة المرور (في إنشاء الحساب) -->
          ${!isLogin ? `
            <div class="input-with-icon">
              <input type="password" id="auth-confirm-password" placeholder="تأكيد كلمة المرور" required style="padding-inline-start: 46px; padding-inline-end: 44px; border-radius: 16px; background: #030806; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.95rem;">
              <span class="input-icon" style="color: #55F7A5;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
              </span>
              <button type="button" id="toggle-confirm-password-btn" class="input-action" aria-label="إظهار تأكيد كلمة المرور" style="background: transparent; border: none; cursor: pointer; color: #8C9992; font-size: 1.1rem; padding: 4px;">
                👁️
              </button>
            </div>
          ` : ''}

          <!-- خيارات إضافية: تذكرني / نسيت كلمة المرور -->
          ${isLogin ? `
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.85rem; margin-top: 2px;">
              <label style="display: flex; align-items: center; gap: 6px; color: #B8C0BC; cursor: pointer;">
                <input type="checkbox" id="auth-remember" checked style="accent-color: #55F7A5; width: 16px; height: 16px;">
                <span>تذكرني</span>
              </label>
              <a href="javascript:void(0)" id="forgot-password-link" style="color: #55F7A5; font-weight: 700; text-decoration: none;">
                نسيت كلمة المرور؟
              </a>
            </div>
          ` : `
            <div style="display: flex; align-items: flex-start; gap: 8px; font-size: 0.82rem; color: #B8C0BC; margin-top: 2px;">
              <input type="checkbox" id="auth-terms" checked required style="accent-color: #55F7A5; width: 16px; height: 16px; margin-top: 2px;">
              <span>أوافق على <a href="javascript:void(0)" style="color: #55F7A5;">شروط الاستخدام</a> و<a href="javascript:void(0)" style="color: #55F7A5;">سياسة الخصوصية</a></span>
            </div>
          `}

          <!-- زر الإجراء الأساسي -->
          <button type="submit" id="auth-submit-btn" class="btn btn-primary btn-lg btn-block" style="margin-top: 6px; border-radius: 18px; font-size: 1.05rem; font-weight: 900; box-shadow: 0 4px 18px rgba(85,247,165,0.35);">
            <span>${isLogin ? 'تسجيل الدخول 🚀' : 'إنشاء الحساب والبدء ✨'}</span>
          </button>

          <!-- إشعار إلزامية الحساب -->
          <div style="margin-top: 6px; text-align: center; font-size: 0.82rem; color: #8C9992;">
            <span>🔒 يلزم إنشاء حساب شخصي لحفظ خطتك وتتبع تقدمك بأمان</span>
          </div>

        </form>

      </div>

      <!-- تذييل الأمان والتشفير -->
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 28px; color: #8C9992; font-size: 0.84rem;">
        <span>جميع البيانات مشفرة ومحفوظة بأمان محلياً</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#55F7A5" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
      </div>

      <!-- ============================================ -->
      <!-- مودال استعادة كلمة المرور -->
      <!-- ============================================ -->
      <div id="forgot-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 24px; border-radius: 24px; max-width: 420px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="color: #55F7A5; font-size: 1.15rem; margin: 0;">🔑 استعادة كلمة المرور</h3>
            <button id="close-forgot-modal-btn" class="btn-icon">✕</button>
          </div>
          <p style="font-size: 0.86rem; color: #B8C0BC; line-height: 1.5; margin-bottom: 16px;">
            أدخل عنوان بريدك الإلكتروني المسجل، وسنرسل لك رابطاً لإعادة ضبط كلمة المرور فورياً:
          </p>
          <div class="form-group" style="margin-bottom: 16px;">
            <input type="email" id="forgot-email-input" placeholder="name@example.com" class="stack-field" style="direction: ltr; text-align: left;">
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="send-forgot-btn" class="btn btn-primary btn-block" style="border-radius: 12px;">
              إرسال الرابط ✉️
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- مودال المتابعة المباشرة بحساب Google / Apple -->
      <!-- ============================================ -->
      <div id="social-auth-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 88vh; padding: 24px; border-radius: 24px; max-width: 420px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span id="social-modal-icon" style="font-size: 1.3rem;">🌐</span>
              <h3 id="social-modal-title" style="color: #55F7A5; font-size: 1.15rem; margin: 0;">المتابعة بحساب Google</h3>
            </div>
            <button id="close-social-modal-btn" class="btn-icon">✕</button>
          </div>

          <p id="social-modal-desc" style="font-size: 0.86rem; color: #B8C0BC; line-height: 1.5; margin-bottom: 16px;">
            أدخل بريدك الإلكتروني لربط حسابك وتخصيص خطتك التدريبية والغذائية فورياً:
          </p>

          <form id="social-auth-form" style="display: flex; flex-direction: column; gap: 12px;">
            <div class="form-group" id="social-name-group">
              <label class="form-label" style="font-size: 0.84rem; color: #B8C0BC;">الاسم الكامل:</label>
              <input type="text" id="social-name-input" placeholder="اسمك الكامل" required class="stack-field" style="border-radius: 12px;">
            </div>

            <div class="form-group">
              <label class="form-label" id="social-email-label" style="font-size: 0.84rem; color: #B8C0BC;">البريد الإلكتروني:</label>
              <input type="email" id="social-email-input" placeholder="name@gmail.com" required class="stack-field" style="border-radius: 12px; direction: ltr; text-align: left;">
            </div>

            <div class="form-group">
              <label class="form-label" style="font-size: 0.84rem; color: #B8C0BC;">كلمة المرور (لحماية وتأمين حسابك):</label>
              <input type="password" id="social-pass-input" placeholder="12 خانة على الأقل" required minlength="12" class="stack-field" style="border-radius: 12px; direction: ltr; text-align: left;">
            </div>

            <button type="submit" id="social-submit-btn" class="btn btn-primary btn-block" style="border-radius: 14px; margin-top: 6px; font-weight: 800; font-size: 1rem;">
              <span id="social-submit-text">تسجيل وبدء الخطة 🚀</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  `;
}

let activeSocialProvider = 'google'; // 'google' | 'apple'

export function bindAuthViewEvents() {
  const form = document.getElementById('auth-form');
  const tabLogin = document.getElementById('tab-login');
  const tabSignup = document.getElementById('tab-signup');
  const googleBtn = document.getElementById('google-auth-btn');
  const appleBtn = document.getElementById('apple-auth-btn');
  const forgotPassLink = document.getElementById('forgot-password-link');
  const forgotModal = document.getElementById('forgot-modal');
  const closeForgotBtn = document.getElementById('close-forgot-modal-btn');
  const sendForgotBtn = document.getElementById('send-forgot-btn');

  const socialModal = document.getElementById('social-auth-modal');
  const closeSocialModalBtn = document.getElementById('close-social-modal-btn');
  const socialForm = document.getElementById('social-auth-form');
  const socialModalIcon = document.getElementById('social-modal-icon');
  const socialModalTitle = document.getElementById('social-modal-title');
  const socialModalDesc = document.getElementById('social-modal-desc');
  const socialEmailInput = document.getElementById('social-email-input');
  const socialSubmitText = document.getElementById('social-submit-text');

  // التبديل بين تسجيل الدخول وإنشاء الحساب
  tabLogin?.addEventListener('click', () => {
    if (currentMode !== 'login') {
      currentMode = 'login';
      refreshAuthView();
    }
  });

  tabSignup?.addEventListener('click', () => {
    if (currentMode !== 'signup') {
      currentMode = 'signup';
      refreshAuthView();
    }
  });

  // إظهار/إخفاء كلمة المرور
  setupPasswordToggle('toggle-password-btn', 'auth-password');
  setupPasswordToggle('toggle-confirm-password-btn', 'auth-confirm-password');

  // 1. تسجيل الدخول بحساب Google الرسمي (المباشر) مع بديل ذكي
  googleBtn?.addEventListener('click', async () => {
    setButtonLoading(googleBtn, true, 'جاري الاتصال بـ Google...');
    try {
      const res = await authService.loginWithGoogle();
      if (res && res.redirecting) {
        return; // جاري الانتقال لصفحة جوجل الرسمية
      }
      if (res && !res.success) {
        activeSocialProvider = 'google';
        if (socialModalTitle) socialModalTitle.textContent = 'المتابعة بحساب Google';
        if (socialModalIcon) socialModalIcon.textContent = '🌐';
        if (socialModalDesc) socialModalDesc.textContent = 'أدخل بريدك على Google لربط حسابك وتخصيص خطتك التدريبية فورياً:';
        if (socialEmailInput) socialEmailInput.placeholder = 'name@gmail.com';
        if (socialSubmitText) socialSubmitText.textContent = 'تسجيل وبدء خطتي مع Google 🚀';
        socialModal?.classList.add('open');
      }
    } catch (e) {
      activeSocialProvider = 'google';
      socialModal?.classList.add('open');
    } finally {
      setButtonLoading(googleBtn, false);
    }
  });

  // 2. فتح نافذة التسجيل بحساب Apple
  appleBtn?.addEventListener('click', () => {
    activeSocialProvider = 'apple';
    if (socialModalTitle) socialModalTitle.textContent = 'المتابعة بحساب Apple ID';
    if (socialModalIcon) socialModalIcon.textContent = '🍏';
    if (socialModalDesc) socialModalDesc.textContent = 'أدخل عنوان Apple ID لربط حسابك وتخصيص خطتك التدريبية فورياً:';
    if (socialEmailInput) socialEmailInput.placeholder = 'name@icloud.com';
    if (socialSubmitText) socialSubmitText.textContent = 'تسجيل وبدء خطتي مع Apple ID ✨';
    socialModal?.classList.add('open');
  });

  // 3. تسجيل الدخول بحساب Facebook الرسمي
  const facebookBtn = document.getElementById('facebook-auth-btn');
  facebookBtn?.addEventListener('click', async () => {
    setButtonLoading(facebookBtn, true, 'جاري الاتصال بـ Facebook...');
    try {
      const res = await authService.loginWithFacebook();
      if (res && res.redirecting) return;
      if (res && !res.success) {
        notificationService.showToast(res.error || 'تعذر الاتصال بـ Facebook، تأكد من تفعيل المزوّد في Supabase', 'error');
      }
    } catch (e) {
      notificationService.showToast('تعذر الاتصال بـ Facebook حالياً', 'error');
    } finally {
      setButtonLoading(facebookBtn, false);
    }
  });

  // إغلاق مودال التسجيل الاجتماعي
  closeSocialModalBtn?.addEventListener('click', () => {
    socialModal?.classList.remove('open');
  });

  socialModal?.addEventListener('click', (e) => {
    if (e.target === socialModal) {
      socialModal.classList.remove('open');
    }
  });

  // معالجة إرسال نموذج Google / Apple
  socialForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('social-submit-btn');
    const name = document.getElementById('social-name-input')?.value;
    const email = document.getElementById('social-email-input')?.value;
    const password = document.getElementById('social-pass-input')?.value;

    setButtonLoading(submitBtn, true, 'جاري ربط الحساب...');

    let res = await authService.signUpWithEmail(name, email, password);
    if (!res.success && res.error && res.error.includes('مسجل مسبقاً')) {
      res = await authService.loginWithEmail(email, password);
    }

    setButtonLoading(submitBtn, false);

    if (res.success) {
      socialModal?.classList.remove('open');
      const userName = res.user?.name || name || 'بطل';
      const providerLabel = activeSocialProvider === 'apple' ? 'Apple ID 🍏' : 'Google 🌐';
      notificationService.showToast(`أهلاً بك يا ${userName}! تم ربط حسابك عبر ${providerLabel} بنجاح`, 'success');
      setTimeout(() => {
        window.location.hash = res.onboardingCompleted ? '#today' : '#questionnaire';
      }, 350);
    } else {
      notificationService.showToast(res.error || 'تعذر إتمام التسجيل، يرجى التحقق من البيانات', 'error');
    }
  });

  // 3. إرسال نموذج البريد الإلكتروني
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = document.getElementById('auth-submit-btn');
    const email = document.getElementById('auth-email')?.value;
    const password = document.getElementById('auth-password')?.value;
    const remember = document.getElementById('auth-remember')?.checked;

    if (currentMode === 'signup') {
      const name = document.getElementById('auth-name')?.value;
      const confirmPass = document.getElementById('auth-confirm-password')?.value;

      if (password !== confirmPass) {
        notificationService.showToast('كلمتا المرور غير متطابقتين، يرجى التحقق', 'error');
        return;
      }

      setButtonLoading(submitBtn, true, 'جاري إنشاء الحساب...');
      const res = await authService.signUpWithEmail(name, email, password);
      setButtonLoading(submitBtn, false);

      if (res.success) {
        if (res.requiresEmailConfirmation) {
          notificationService.showToast(res.message || 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المُرسل إليك.', 'info');
          return;
        }
        const userName = res.user?.name || name || 'بطل';
        notificationService.showToast(`أهلاً بك يا ${userName}! لنبدأ بجمع بيانات خطتك التدريبية والغذائية 📋✨`, 'success');
        setTimeout(() => {
          window.location.hash = '#questionnaire';
        }, 350);
      } else {
        notificationService.showToast(res.error || 'فشل إنشاء الحساب', 'error');
      }

    } else {
      setButtonLoading(submitBtn, true, 'جاري التحقق...');
      const res = await authService.loginWithEmail(email, password, remember);
      setButtonLoading(submitBtn, false);

      if (res.success) {
        const nextHash = res.onboardingCompleted ? '#today' : '#questionnaire';
        const userName = res.user?.name || (email ? email.split('@')[0] : 'بطل');
        const msg = res.onboardingCompleted
          ? `مرحباً بعودتك ${userName} 💚`
          : `أهلاً بك ${userName}! لنستكمل بيانات خطتك التدريبية والغذائية 📋✨`;
        notificationService.showToast(msg, 'success');
        setTimeout(() => {
          window.location.hash = nextHash;
        }, 300);
      } else {
        notificationService.showToast(res.error || 'بيانات الدخول غير صحيحة', 'error');
      }
    }
  });

  // 4. استعادة كلمة المرور
  forgotPassLink?.addEventListener('click', () => {
    const currentEmail = document.getElementById('auth-email')?.value || '';
    const forgotEmailInput = document.getElementById('forgot-email-input');
    if (forgotEmailInput && currentEmail) {
      forgotEmailInput.value = currentEmail;
    }
    forgotModal?.classList.add('open');
  });

  closeForgotBtn?.addEventListener('click', () => {
    forgotModal?.classList.remove('open');
  });

  sendForgotBtn?.addEventListener('click', async () => {
    const email = document.getElementById('forgot-email-input')?.value;
    setButtonLoading(sendForgotBtn, true, 'جاري الإرسال...');
    const res = await authService.resetPassword(email);
    setButtonLoading(sendForgotBtn, false);

    if (res.success) {
      notificationService.showToast(res.message, 'success');
      forgotModal?.classList.remove('open');
    } else {
      notificationService.showToast(res.error, 'error');
    }
  });

  // إغلاق المودال عند النقر على الخلفية
  forgotModal?.addEventListener('click', (e) => {
    if (e.target === forgotModal) {
      forgotModal.classList.remove('open');
    }
  });
}

function setupPasswordToggle(btnId, inputId) {
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  btn?.addEventListener('click', () => {
    if (input.type === 'password') {
      input.type = 'text';
      btn.textContent = '🙈';
    } else {
      input.type = 'password';
      btn.textContent = '👁️';
    }
  });
}

function setButtonLoading(btn, isLoading, loadingText = '') {
  if (!btn) return;
  if (isLoading) {
    btn.dataset.originalHtml = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `<span>⏳</span> <span>${loadingText || 'جاري المعالجة...'}</span>`;
    btn.style.opacity = '0.75';
    btn.style.pointerEvents = 'none';
  } else {
    btn.disabled = false;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
    }
  }
}

function refreshAuthView() {
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderAuthView();
    bindAuthViewEvents();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    container.scrollTop = 0;
  }
}
