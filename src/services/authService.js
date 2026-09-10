/**
 * NEON COACH - خدمة المصادقة المركزية (Auth Service)
 * يوفر الأساس الكامل للمصادقة عبر Supabase فقط:
 * 1. تسجيل الدخول وإنشاء الحساب بالبريد الإلكتروني وكلمة المرور
 * 2. تسجيل الدخول وإنشاء الحساب بحساب Google (OAuth)
 * 3. تسجيل الدخول وإنشاء الحساب بحساب Facebook (OAuth)
 * 4. إدارة الجلسات، استعادة كلمة المرور، وتسجيل الخروج
 *
 * ⚠️ لا يوجد وضع تجريبي — لا يوجد تسجيل دخول محلي — Supabase فقط
 */

import { store } from '../state/store.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const SESSION_STORAGE_KEY = 'neon_auth_session_v1';
const PASSWORD_MIN_LENGTH = 12;

class AuthService {
  constructor() {
    this.listeners = new Set();
    this.currentSession = this.loadStoredSession();
    this._authReady = false;
    this._authReadyResolvers = [];
    this.initSupabaseAuthListener();
  }

  /**
   * يعيد Promise يُحَل عند جاهزية حالة المصادقة من Supabase
   */
  whenAuthReady() {
    if (this._authReady) return Promise.resolve();
    return new Promise(resolve => this._authReadyResolvers.push(resolve));
  }

  _resolveAuthReady() {
    if (!this._authReady) {
      this._authReady = true;
      for (const resolve of this._authReadyResolvers) resolve();
      this._authReadyResolvers = [];
    }
  }

  /**
   * تهيئة مراقب جلسات Supabase وتلقي نتائج OAuth
   */
  async initSupabaseAuthListener() {
    if (typeof window === 'undefined' || !isSupabaseConfigured()) {
      this._resolveAuthReady();
      return;
    }

    try {
      // 1. فحص الجلسة الحالية في Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.syncSessionFromSupabase(session);
      } else {
        this.saveSession(null);
      }
    } catch (err) {
      console.warn('Supabase getSession error:', err);
    } finally {
      // حل وعد الجاهزية بغض النظر عن النتيجة
      this._resolveAuthReady();
    }

    // 2. الاستماع لتغيرات المصادقة (OAuth, تسجيل الدخول، الخروج)
    supabase.auth.onAuthStateChange(async (event, newSession) => {
      if ((event === 'SIGNED_IN' || event === 'USER_UPDATED' || event === 'TOKEN_REFRESHED') && newSession?.user) {
        await this.syncSessionFromSupabase(newSession);
      } else if (event === 'SIGNED_OUT') {
        this.saveSession(null);
        store.logoutUser();
        if (typeof window !== 'undefined') {
          window.location.hash = '#questionnaire';
        }
      }
    });
  }

  async syncSessionFromSupabase(session) {
    const user = session.user;
    const provider = user.app_metadata?.provider || 'email';

    // فحص هل أكمل المستخدم استبيان الخطة في جدول profiles
    let onboardingCompleted = false;
    let profileData = null;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      if (data) {
        profileData = data;
        onboardingCompleted = !!data.onboarding_completed;
      }
    } catch (e) {
      console.warn('Profile fetch error:', e);
    }

    const userObj = {
      id: user.id,
      name: profileData?.name || user.user_metadata?.full_name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'متدرب نيون'),
      email: user.email || '',
      provider: provider,
      avatarUrl: user.user_metadata?.avatar_url || null,
      onboardingCompleted: onboardingCompleted,
      createdAt: user.created_at || new Date().toISOString()
    };

    const sessionObj = {
      token: session.access_token,
      provider: provider,
      user: userObj,
      loggedInAt: new Date().toISOString(),
      onboardingCompleted: onboardingCompleted
    };

    this.saveSession(sessionObj);
    store.loginUser(userObj, provider, session.access_token);

    if (profileData) {
      store.setUserProfile({
        name: profileData.name || userObj.name,
        email: profileData.email || userObj.email,
        age: profileData.age,
        gender: profileData.gender,
        height: profileData.height,
        currentWeight: profileData.current_weight,
        targetWeight: profileData.target_weight,
        goal: profileData.fitness_goal,
        activityLevel: profileData.activity_level,
        workoutDaysCount: profileData.training_days_per_week,
        equipment: profileData.equipment,
        injuries: profileData.injuries,
        allergens: profileData.allergies,
        likedFoods: profileData.liked_foods,
        dislikedFoods: profileData.disliked_foods,
        targetCalories: profileData.target_calories,
        targetProtein: profileData.target_protein,
        targetCarbs: profileData.target_carbs,
        targetFats: profileData.target_fats,
        targetWaterLiters: profileData.target_water_liters,
        targetGlasses: profileData.target_glasses,
        onboardingCompleted: onboardingCompleted,
        onboarding_completed: onboardingCompleted
      });
    }

    if (typeof window !== 'undefined') {
      const targetHash = !onboardingCompleted ? '#questionnaire' : '#today';
      if (window.location.hash !== targetHash) {
        if (window.location.hash.includes('access_token=') || window.location.hash.includes('refresh_token=')) {
          try {
            window.history.replaceState(null, '', window.location.pathname + targetHash);
          } catch (_) {
            window.location.hash = targetHash;
          }
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } else {
          window.location.hash = targetHash;
        }
      }
    }

    return userObj;
  }

  /**
   * استرجاع الجلسة المحفوظة محلياً (Supabase token فقط — لا نسمح بـ jwt_neon_*)
   */
  loadStoredSession() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          // قبول الجلسة فقط إذا كانت تحتوي على رمز Supabase حقيقي
          if (parsed && parsed.token && parsed.user &&
              !parsed.token.startsWith('jwt_neon_') &&
              !parsed.token.startsWith('demo_') &&
              !parsed.token.startsWith('oauth_google_') &&
              !parsed.token.startsWith('apple_id_')) {
            return parsed;
          } else {
            // تنظيف الجلسات القديمة الوهمية
            localStorage.removeItem(SESSION_STORAGE_KEY);
          }
        }
      }
    } catch (e) {
      console.warn('تعذر قراءة جلسة المصادقة:', e);
    }
    return null;
  }

  /**
   * حفظ الجلسة محلياً
   */
  saveSession(session) {
    this.currentSession = session;
    try {
      if (typeof localStorage !== 'undefined') {
        if (session) {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
        } else {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        }
      }
    } catch (e) {
      console.warn('تعذر حفظ جلسة المصادقة:', e);
    }
    this.notifyListeners(session);
  }

  /**
   * التحقق مما إذا كان المستخدم مسجل الدخول (Supabase session فقط)
   */
  isAuthenticated() {
    if (!this.currentSession || !this.currentSession.token) return false;
    // رفض الرموز المزيفة القديمة
    const token = this.currentSession.token;
    if (token.startsWith('jwt_neon_') || token.startsWith('demo_') ||
        token.startsWith('oauth_google_') || token.startsWith('apple_id_')) {
      this.saveSession(null);
      return false;
    }
    return true;
  }

  getCurrentUser() {
    return this.currentSession ? this.currentSession.user : null;
  }

  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * تسجيل الدخول عبر البريد الإلكتروني وكلمة المرور (Supabase فقط)
   */
  async loginWithEmail(email, password) {
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const trimmedPass = String(password || '').trim();

    if (!trimmedEmail) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني' };
    }
    if (!this.isValidEmail(trimmedEmail)) {
      return { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'يرجى إدخال كلمة المرور' };
    }
    if (trimmedPass.length < PASSWORD_MIN_LENGTH) {
      return { success: false, error: `كلمة المرور يجب أن لا تقل عن ${PASSWORD_MIN_LENGTH} حرفاً أو رقماً` };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'خدمة المصادقة غير متاحة. يرجى التحقق من الاتصال بالإنترنت.' };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPass
      });

      if (error) {
        if (error.message?.includes('Email not confirmed')) {
          return {
            success: false,
            error: 'يرجى تأكيد بريدك الإلكتروني عبر الرابط المُرسل إليك.'
          };
        }
        if (error.message?.includes('Invalid login credentials')) {
          return { success: false, error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }
        return { success: false, error: error.message || 'تعذر تسجيل الدخول' };
      }

      if (!data?.user || !data?.session) {
        return { success: false, error: 'لم يتم استلام بيانات الجلسة من الخادم' };
      }

      const userObj = await this.syncSessionFromSupabase(data.session);
      return { 
        success: true, 
        user: userObj, 
        token: data.session.access_token,
        onboardingCompleted: !!userObj?.onboardingCompleted 
      };
    } catch (err) {
      console.error('loginWithEmail error:', err);
      return { success: false, error: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' };
    }
  }

  /**
   * إنشاء حساب جديد عبر البريد الإلكتروني (Supabase فقط)
   */
  async signUpWithEmail(name, email, password) {
    const trimmedName = String(name || '').trim();
    const trimmedEmail = String(email || '').trim().toLowerCase();
    const trimmedPass = String(password || '').trim();

    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: 'يرجى إدخال اسمك الكامل (حرفين على الأقل)' };
    }
    if (!trimmedEmail) {
      return { success: false, error: 'يرجى إدخال البريد الإلكتروني' };
    }
    if (!this.isValidEmail(trimmedEmail)) {
      return { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
    }
    if (!trimmedPass) {
      return { success: false, error: 'يرجى إدخال كلمة المرور' };
    }
    if (trimmedPass.length < PASSWORD_MIN_LENGTH) {
      return { success: false, error: `كلمة المرور يجب أن لا تقل عن ${PASSWORD_MIN_LENGTH} حرفاً أو رقماً` };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'خدمة المصادقة غير متاحة. يرجى التحقق من الاتصال بالإنترنت.' };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: trimmedPass,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName
          }
        }
      });

      if (error) {
        if (error.message?.includes('already registered') || error.message?.includes('User already exists')) {
          return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً. يمكنك تسجيل الدخول مباشرة.' };
        }
        if (error.code === 'over_email_send_rate_limit') {
          return {
            success: false,
            error: 'تم تجاوز حد إرسال الإيميلات. يرجى إيقاف (Confirm email) من Supabase › Auth › Providers › Email للتسجيل الفوري.'
          };
        }
        return { success: false, error: error.message || 'تعذر إنشاء الحساب' };
      }

      if (!data?.user) {
        return { success: false, error: 'تعذر إنشاء الحساب. يرجى المحاولة مرة أخرى.' };
      }

      // إذا كان هناك جلسة فورية (Confirm email = OFF)
      if (data.session) {
        const userObj = await this.syncSessionFromSupabase(data.session);
        return { 
          success: true, 
          user: userObj, 
          token: data.session.access_token,
          isNewUser: true, 
          onboardingCompleted: false 
        };
      }

      // إذا كان التأكيد مطلوباً
      return {
        success: true,
        requiresEmailConfirmation: true,
        user: { name: trimmedName, email: trimmedEmail },
        message: `تم إرسال رابط التأكيد إلى ${trimmedEmail}. يرجى التحقق من بريدك الإلكتروني.`
      };
    } catch (err) {
      console.error('signUpWithEmail error:', err);
      return { success: false, error: 'حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.' };
    }
  }

  /**
   * تسجيل الدخول عبر Google (Supabase OAuth Redirect)
   */
  async loginWithGoogle() {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'خدمة المصادقة غير متاحة.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? window.location.origin : 'https://neon-coach-murex.vercel.app')
        : 'https://neon-coach-murex.vercel.app';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }
      return { success: false, error: 'تعذر الحصول على رابط Google OAuth' };
    } catch (err) {
      console.warn('Google OAuth error:', err);
      return { success: false, error: err.message || 'تعذر الاتصال بـ Google' };
    }
  }

  /**
   * إنشاء حساب عبر Google
   */
  async signUpWithGoogle() {
    return this.loginWithGoogle();
  }

  /**
   * تسجيل الدخول عبر Facebook (Supabase OAuth Redirect)
   */
  async loginWithFacebook() {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'خدمة المصادقة غير متاحة.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? window.location.origin : 'https://neon-coach-murex.vercel.app')
        : 'https://neon-coach-murex.vercel.app';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: { redirectTo }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }
      return { success: false, error: 'تعذر الحصول على رابط Facebook OAuth' };
    } catch (err) {
      console.warn('Facebook OAuth error:', err);
      return { success: false, error: err.message || 'تعذر الاتصال بـ Facebook' };
    }
  }

  /**
   * تسجيل الدخول عبر Apple (Supabase OAuth Redirect)
   */
  async loginWithApple() {
    if (!isSupabaseConfigured()) {
      return { success: false, error: 'خدمة المصادقة غير متاحة.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? window.location.origin : 'https://neon-coach-murex.vercel.app')
        : 'https://neon-coach-murex.vercel.app';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo }
      });

      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
        return { success: true, redirecting: true };
      }
      return { success: false, error: 'تعذر الحصول على رابط Apple OAuth' };
    } catch (err) {
      console.warn('Apple OAuth error:', err);
      return { success: false, error: err.message || 'تعذر الاتصال بـ Apple' };
    }
  }

  async signUpWithApple() {
    return this.loginWithApple();
  }

  /**
   * استعادة كلمة المرور
   */
  async resetPassword(email) {
    const trimmedEmail = String(email || '').trim().toLowerCase();
    if (!trimmedEmail || !this.isValidEmail(trimmedEmail)) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' };
    }

    if (!isSupabaseConfigured()) {
      return { success: false, error: 'خدمة المصادقة غير متاحة.' };
    }

    try {
      const redirectTo = typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : 'https://neon-coach-murex.vercel.app';

      await supabase.auth.resetPasswordForEmail(trimmedEmail, { redirectTo });
    } catch (err) {
      console.warn('Supabase resetPassword warning:', err);
    }

    return {
      success: true,
      message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${trimmedEmail}. يرجى مراجعة صندوق الوارد لديك.`
    };
  }

  /**
   * تسجيل الخروج
   */
  async logout() {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn('signOut error:', e);
    }
    this.saveSession(null);
    store.logoutUser();
    if (typeof window !== 'undefined') {
      window.location.hash = '#questionnaire';
    }
    return { success: true };
  }

  /**
   * الاشتراك بتغيرات حالة المصادقة
   */
  onAuthStateChange(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback);
      return () => this.listeners.delete(callback);
    }
    return () => {};
  }

  notifyListeners(session) {
    for (const listener of this.listeners) {
      try {
        listener(session);
      } catch (e) {
        console.error('Error in auth listener:', e);
      }
    }
  }

  /**
   * التحقق من صحة البريد الإلكتروني
   */
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();
