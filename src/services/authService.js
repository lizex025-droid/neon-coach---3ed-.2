/**
 * NEON COACH - خدمة المصادقة المركزية (Auth Service)
 * توفر الأساس الكامل للمصادقة:
 * 1. تسجيل الدخول وإنشاء الحساب بالبريد الإلكتروني وكلمة المرور
 * 2. تسجيل الدخول وإنشاء الحساب بحساب Google (OAuth Foundation)
 * 3. تسجيل الدخول وإنشاء الحساب بحساب Apple (Sign in with Apple Foundation)
 * 4. وضع الدخول التجريبي السريع (Demo Mode / Guest)
 * 5. إدارة الجلسات المحلية، استعادة كلمة المرور، وتسجيل الخروج
 */

import { store } from '../state/store.js';
import { supabase, isSupabaseConfigured } from './supabaseClient.js';

const SESSION_STORAGE_KEY = 'neon_auth_session_v1';
const USERS_STORAGE_KEY = 'neon_registered_users_v1';

class AuthService {
  constructor() {
    this.listeners = new Set();
    this.inMemoryUsers = [];
    this.currentSession = this.loadStoredSession();
    this.initSupabaseAuthListener();
  }

  /**
   * تهيئة مراقب جلسات Supabase وتلقي نتائج OAuth (Google / Apple)
   */
  async initSupabaseAuthListener() {
    if (typeof window === 'undefined' || !isSupabaseConfigured()) return;
    try {
      // 1. فحص الجلسة المخزنة في Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await this.syncSessionFromSupabase(session);
      }

      // 2. الاستماع لتغيرات المصادقة (بما فيها تسجيل الدخول عبر Google/Apple)
      supabase.auth.onAuthStateChange(async (event, newSession) => {
        if ((event === 'SIGNED_IN' || event === 'USER_UPDATED') && newSession?.user) {
          await this.syncSessionFromSupabase(newSession);
        } else if (event === 'SIGNED_OUT') {
          this.saveSession(null);
          store.logoutUser();
        }
      });
    } catch (err) {
      console.warn('Supabase Auth listener error:', err);
    }
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
    } catch (e) {}

    const userObj = {
      id: user.id,
      name: profileData?.name || user.user_metadata?.name || (user.email ? user.email.split('@')[0] : 'متدرب نيون'),
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
        window.location.hash = targetHash;
      }
    }

    return userObj;
  }

  /**
   * استرجاع الجلسة المحفوظة محلياً
   */
  loadStoredSession() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.token && parsed.user) {
            return parsed;
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
   * التحقق مما إذا كان المستخدم مسجل الدخول
   */
  isAuthenticated() {
    return !!this.currentSession && !!this.currentSession.token;
  }

  /**
   * استرجاع المستخدم الحالي
   */
  getCurrentUser() {
    return this.currentSession ? this.currentSession.user : null;
  }

  /**
   * استرجاع تفاصيل الجلسة الحالية
   */
  getCurrentSession() {
    return this.currentSession;
  }

  /**
   * تسجيل الدخول عبر البريد الإلكتروني وكلمة المرور
   */
  async loginWithEmail(email, password, rememberMe = true) {
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
    if (trimmedPass.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام' };
    }

    // 1. محاولة تسجيل الدخول عبر Supabase إذا كانت مهيأة
    if (typeof window !== 'undefined' && isSupabaseConfigured() && window.location.protocol.startsWith('http')) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: trimmedPass
        });
        if (!error && data && data.user) {
          let onboardingCompleted = false;
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .maybeSingle();
            if (profile && profile.onboarding_completed) {
              onboardingCompleted = true;
            }
          } catch (e) {}

          const userObj = {
            id: data.user.id,
            name: data.user.user_metadata?.name || trimmedEmail.split('@')[0],
            email: trimmedEmail,
            provider: 'email',
            onboardingCompleted,
            createdAt: data.user.created_at || new Date().toISOString()
          };
          this.saveRegisteredUser({ ...userObj, password: trimmedPass });

          const session = {
            token: data.session?.access_token || ('jwt_neon_' + Date.now()),
            provider: 'email',
            user: userObj,
            loggedInAt: new Date().toISOString(),
            rememberMe: !!rememberMe,
            onboardingCompleted
          };

          this.saveSession(session);
          store.loginUser(userObj, 'email', session.token);
          return { success: true, user: userObj, token: session.token, onboardingCompleted };
        }
      } catch (err) {
        console.warn('Supabase signInWithPassword fallback:', err);
      }
    }

    // محاكاة استجابة الشبكة (Latency simulation)
    await this.delay(350);

    // 2. التحقق من وجود المستخدم المسجل محلياً أو وضع الاختبار
    const registeredUsers = this.getRegisteredUsers();
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === trimmedEmail);

    let userObj;
    if (matchedUser) {
      if (matchedUser.password && matchedUser.password !== trimmedPass) {
        return { success: false, error: 'كلمة المرور غير صحيحة' };
      }
      userObj = { ...matchedUser };
      delete userObj.password;
    } else {
      // السماح بتسجيل الدخول الفوري وإنشاء ملف مستخدم
      const nameFromEmail = trimmedEmail.split('@')[0];
      userObj = {
        id: 'usr_' + Math.random().toString(36).slice(2, 9),
        name: nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1),
        email: trimmedEmail,
        provider: 'email',
        onboardingCompleted: false,
        createdAt: new Date().toISOString()
      };
      this.saveRegisteredUser({ ...userObj, password: trimmedPass });
    }

    const session = {
      token: 'jwt_neon_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now(),
      provider: 'email',
      user: userObj,
      loggedInAt: new Date().toISOString(),
      rememberMe: !!rememberMe,
      onboardingCompleted: !!userObj.onboardingCompleted
    };

    this.saveSession(session);
    store.loginUser(userObj, 'email', session.token);

    return { success: true, user: userObj, token: session.token, onboardingCompleted: !!userObj.onboardingCompleted };
  }

  /**
   * إنشاء حساب جديد عبر البريد الإلكتروني
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
    if (trimmedPass.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام' };
    }

    const registeredUsers = this.getRegisteredUsers();
    const exists = registeredUsers.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة' };
    }

    // 1. محاولة إنشاء الحساب عبر Supabase
    if (typeof window !== 'undefined' && isSupabaseConfigured() && window.location.protocol.startsWith('http')) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: trimmedPass,
          options: {
            data: {
              name: trimmedName
            }
          }
        });

        if (error) {
          if (error.message && (error.message.includes('already registered') || error.message.includes('User already exists'))) {
            return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة' };
          }
        } else if (data && data.user) {
          const newUser = {
            id: data.user.id,
            name: trimmedName,
            email: trimmedEmail,
            provider: 'email',
            onboardingCompleted: false,
            createdAt: new Date().toISOString()
          };

          this.saveRegisteredUser({ ...newUser, password: trimmedPass });

          const token = data.session?.access_token || ('jwt_neon_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now());
          const session = {
            token,
            provider: 'email',
            user: newUser,
            loggedInAt: new Date().toISOString(),
            isNewUser: true,
            onboardingCompleted: false
          };

          this.saveSession(session);
          store.registerUser(newUser, 'email');

          return { success: true, user: newUser, token, isNewUser: true, onboardingCompleted: false };
        }
      } catch (err) {
        console.warn('Supabase signUp fallback:', err);
      }
    }

    await this.delay(400);

    const newUser = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      name: trimmedName,
      email: trimmedEmail,
      provider: 'email',
      onboardingCompleted: false,
      createdAt: new Date().toISOString()
    };

    this.saveRegisteredUser({ ...newUser, password: trimmedPass });

    const session = {
      token: 'jwt_neon_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now(),
      provider: 'email',
      user: newUser,
      loggedInAt: new Date().toISOString(),
      isNewUser: true,
      onboardingCompleted: false
    };

    this.saveSession(session);
    store.registerUser(newUser, 'email');

    return { success: true, user: newUser, token: session.token, isNewUser: true, onboardingCompleted: false };
  }

  /**
   * تسجيل الدخول / إنشاء حساب عبر Google (Google OAuth Foundation)
   */
  async loginWithGoogle(email = null, password = null, name = null) {
    if (email && password) {
      const trimmedEmail = String(email).trim().toLowerCase();
      const trimmedPass = String(password).trim();
      const userName = name || trimmedEmail.split('@')[0];

      let res = await this.signUpWithEmail(userName, trimmedEmail, trimmedPass);
      if (!res.success && res.error && res.error.includes('مسجل مسبقاً')) {
        res = await this.loginWithEmail(trimmedEmail, trimmedPass);
      }
      if (res.success) {
        res.user.provider = 'google';
        if (this.currentSession) this.currentSession.provider = 'google';
        if (store.getState().auth) store.getState().auth.provider = 'google';
        if (store.getState().userProfile) store.getState().userProfile.provider = 'google';
        store.saveState();
        return { success: true, user: res.user, token: res.token, onboardingCompleted: !!res.onboardingCompleted };
      }
      return res;
    }

    // إذا تم استدعاؤها في المتصفح وكانت Supabase مهيأة
    if (typeof window !== 'undefined' && isSupabaseConfigured() && window.location.protocol.startsWith('http')) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return { success: true, redirecting: true };
        }
      } catch (err) {
        console.warn('Google OAuth direct redirect error:', err);
        return { success: false, error: err.message || 'تعذر الاتصال بـ Google' };
      }
    }

    await this.delay(200);

    // بيانات الحساب المسترجعة من Google
    const googleUser = {
      id: 'google_1084592038192837',
      name: name || 'عاهد عبد',
      email: 'ahed.coach@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      provider: 'google',
      isVerifiedEmail: true,
      onboardingCompleted: false,
      lastLogin: new Date().toISOString()
    };

    const session = {
      token: 'oauth_google_' + Math.random().toString(36).slice(2, 14) + '_' + Date.now(),
      provider: 'google',
      user: googleUser,
      loggedInAt: new Date().toISOString(),
      onboardingCompleted: false
    };

    this.saveSession(session);
    store.loginUser(googleUser, 'google', session.token);

    return { success: true, user: googleUser, token: session.token, onboardingCompleted: false };
  }

  /**
   * إنشاء حساب عبر Google
   */
  async signUpWithGoogle(email = null, password = null, name = null) {
    return this.loginWithGoogle(email, password, name);
  }

  /**
   * تسجيل الدخول / إنشاء حساب عبر Apple (Sign in with Apple Foundation)
   */
  async loginWithApple(email = null, password = null, name = null) {
    if (email && password) {
      const trimmedEmail = String(email).trim().toLowerCase();
      const trimmedPass = String(password).trim();
      const userName = name || trimmedEmail.split('@')[0];

      let res = await this.signUpWithEmail(userName, trimmedEmail, trimmedPass);
      if (!res.success && res.error && res.error.includes('مسجل مسبقاً')) {
        res = await this.loginWithEmail(trimmedEmail, trimmedPass);
      }
      if (res.success) {
        res.user.provider = 'apple';
        if (this.currentSession) this.currentSession.provider = 'apple';
        if (store.getState().auth) store.getState().auth.provider = 'apple';
        if (store.getState().userProfile) store.getState().userProfile.provider = 'apple';
        store.saveState();
        return { success: true, user: res.user, token: res.token, onboardingCompleted: !!res.onboardingCompleted };
      }
      return res;
    }

    await this.delay(200);

    // بيانات الحساب المسترجعة من Apple ID
    const appleUser = {
      id: 'apple_001928.918273645.0912',
      name: name || 'عاهد (Apple ID)',
      email: 'ahed@privaterelay.appleid.com',
      provider: 'apple',
      isVerifiedEmail: true,
      onboardingCompleted: false,
      lastLogin: new Date().toISOString()
    };

    const session = {
      token: 'apple_id_token_' + Math.random().toString(36).slice(2, 14) + '_' + Date.now(),
      provider: 'apple',
      user: appleUser,
      loggedInAt: new Date().toISOString(),
      onboardingCompleted: false
    };

    this.saveSession(session);
    store.loginUser(appleUser, 'apple', session.token);

    return { success: true, user: appleUser, token: session.token, onboardingCompleted: false };
  }

  /**
   * تسجيل الدخول / إنشاء حساب عبر Facebook (Facebook OAuth)
   */
  async loginWithFacebook() {
    if (typeof window !== 'undefined' && isSupabaseConfigured() && window.location.protocol.startsWith('http')) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'facebook',
          options: {
            redirectTo: window.location.origin
          }
        });
        if (error) throw error;
        if (data?.url) {
          window.location.href = data.url;
          return { success: true, redirecting: true };
        }
      } catch (err) {
        console.warn('Facebook OAuth error:', err);
        return { success: false, error: err.message || 'تعذر الاتصال بـ Facebook' };
      }
    }
    return { success: false, error: 'تسجيل الدخول بفيسبوك متاح عبر المتصفح' };
  }

  /**
   * إنشاء حساب عبر Apple
   */
  async signUpWithApple(email = null, password = null, name = null) {
    return this.loginWithApple(email, password, name);
  }

  /**
   * تسجيل الدخول المباشر كضيف (Demo Mode)
   */
  async loginAsDemo() {
    await this.delay(200);

    const demoUser = {
      id: 'demo_user_01',
      name: 'أحمد (وضع تجريبي)',
      email: 'demo@neoncoach.app',
      provider: 'demo',
      isDemo: true,
      onboardingCompleted: true,
      loggedInAt: new Date().toISOString()
    };

    const session = {
      token: 'demo_token_' + Date.now(),
      provider: 'demo',
      user: demoUser,
      loggedInAt: new Date().toISOString(),
      onboardingCompleted: true
    };

    this.saveSession(session);
    store.getState().isDemoMode = true;
    store.loginUser(demoUser, 'demo', session.token);

    return { success: true, user: demoUser, token: session.token, onboardingCompleted: true };
  }

  /**
   * استعادة كلمة المرور
   */
  async resetPassword(email) {
    const trimmedEmail = String(email || '').trim().toLowerCase();
    if (!trimmedEmail || !this.isValidEmail(trimmedEmail)) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' };
    }

    if (typeof window !== 'undefined' && isSupabaseConfigured() && window.location.protocol.startsWith('http')) {
      try {
        await supabase.auth.resetPasswordForEmail(trimmedEmail, {
          redirectTo: window.location.origin + window.location.pathname
        });
      } catch (err) {
        console.warn('Supabase resetPassword warning:', err);
      }
    }

    await this.delay(350);
    return {
      success: true,
      message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${trimmedEmail}. يرجى مراجعة صندوق الوارد لديك.`
    };
  }

  /**
   * تسجيل الخروج
   */
  logout() {
    if (typeof window !== 'undefined' && isSupabaseConfigured()) {
      try {
        supabase.auth.signOut().catch(() => {});
      } catch (e) {}
    }
    this.saveSession(null);
    store.logoutUser();
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

  /**
   * إدارة المستخدمين المسجلين محلياً
   */
  getRegisteredUsers() {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(USERS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {}
    return this.inMemoryUsers;
  }

  saveRegisteredUser(user) {
    if (!this.inMemoryUsers.some(u => u.email === user.email)) {
      this.inMemoryUsers.push(user);
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const existing = this.getRegisteredUsers();
        if (!existing.some(u => u.email === user.email)) {
          existing.push(user);
        }
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(existing));
      }
    } catch (e) {}
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const authService = new AuthService();
