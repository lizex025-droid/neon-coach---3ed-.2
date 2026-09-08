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

const SESSION_STORAGE_KEY = 'neon_auth_session_v1';
const USERS_STORAGE_KEY = 'neon_registered_users_v1';

class AuthService {
  constructor() {
    this.listeners = new Set();
    this.inMemoryUsers = [];
    this.currentSession = this.loadStoredSession();
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

    // محاكاة استجابة الشبكة (Latency simulation)
    await this.delay(350);

    // التحقق من وجود المستخدم المسجل أو الحساب التجريبي الافتراضي
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
        createdAt: new Date().toISOString()
      };
      this.saveRegisteredUser({ ...userObj, password: trimmedPass });
    }

    const session = {
      token: 'jwt_neon_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now(),
      provider: 'email',
      user: userObj,
      loggedInAt: new Date().toISOString(),
      rememberMe: !!rememberMe
    };

    this.saveSession(session);
    store.loginUser(userObj, 'email', session.token);

    return { success: true, user: userObj, token: session.token };
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

    await this.delay(400);

    const registeredUsers = this.getRegisteredUsers();
    const exists = registeredUsers.some(u => u.email.toLowerCase() === trimmedEmail);
    if (exists) {
      return { success: false, error: 'هذا البريد الإلكتروني مسجل مسبقاً، يمكنك تسجيل الدخول مباشرة' };
    }

    const newUser = {
      id: 'usr_' + Math.random().toString(36).slice(2, 9),
      name: trimmedName,
      email: trimmedEmail,
      provider: 'email',
      createdAt: new Date().toISOString()
    };

    this.saveRegisteredUser({ ...newUser, password: trimmedPass });

    const session = {
      token: 'jwt_neon_' + Math.random().toString(36).slice(2, 12) + '_' + Date.now(),
      provider: 'email',
      user: newUser,
      loggedInAt: new Date().toISOString(),
      isNewUser: true
    };

    this.saveSession(session);
    store.registerUser(newUser, 'email');

    return { success: true, user: newUser, token: session.token, isNewUser: true };
  }

  /**
   * تسجيل الدخول / إنشاء حساب عبر Google (Google OAuth Foundation)
   * تم بناء الهيكل بحيث يمكن استبدال دالة المحاكاة بـ Google Identity Services (GIS SDK)
   */
  async loginWithGoogle() {
    await this.delay(500);

    // بيانات الحساب المسترجعة من Google
    const googleUser = {
      id: 'google_1084592038192837',
      name: 'عاهد عبد',
      email: 'ahed.coach@gmail.com',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      provider: 'google',
      isVerifiedEmail: true,
      lastLogin: new Date().toISOString()
    };

    const session = {
      token: 'oauth_google_' + Math.random().toString(36).slice(2, 14) + '_' + Date.now(),
      provider: 'google',
      user: googleUser,
      loggedInAt: new Date().toISOString()
    };

    this.saveSession(session);
    store.loginUser(googleUser, 'google', session.token);

    return { success: true, user: googleUser, token: session.token };
  }

  /**
   * إنشاء حساب عبر Google (تطابق عملية تسجيل الدخول في بروتوكول OAuth)
   */
  async signUpWithGoogle() {
    return this.loginWithGoogle();
  }

  /**
   * تسجيل الدخول / إنشاء حساب عبر Apple (Sign in with Apple Foundation)
   */
  async loginWithApple() {
    await this.delay(500);

    // بيانات الحساب المسترجعة من Apple ID
    const appleUser = {
      id: 'apple_001928.918273645.0912',
      name: 'عاهد (Apple ID)',
      email: 'ahed@privaterelay.appleid.com',
      provider: 'apple',
      isVerifiedEmail: true,
      lastLogin: new Date().toISOString()
    };

    const session = {
      token: 'apple_id_token_' + Math.random().toString(36).slice(2, 14) + '_' + Date.now(),
      provider: 'apple',
      user: appleUser,
      loggedInAt: new Date().toISOString()
    };

    this.saveSession(session);
    store.loginUser(appleUser, 'apple', session.token);

    return { success: true, user: appleUser, token: session.token };
  }

  /**
   * إنشاء حساب عبر Apple
   */
  async signUpWithApple() {
    return this.loginWithApple();
  }

  /**
   * تسجيل الدخول المباشر كضيف (Demo Mode)
   */
  async loginAsDemo() {
    await this.delay(250);

    const demoUser = {
      id: 'demo_user_01',
      name: 'أحمد (وضع تجريبي)',
      email: 'demo@neoncoach.app',
      provider: 'demo',
      isDemo: true,
      loggedInAt: new Date().toISOString()
    };

    const session = {
      token: 'demo_token_' + Date.now(),
      provider: 'demo',
      user: demoUser,
      loggedInAt: new Date().toISOString()
    };

    this.saveSession(session);
    store.loginUser(demoUser, 'demo', session.token);

    return { success: true, user: demoUser, token: session.token };
  }

  /**
   * استعادة كلمة المرور
   */
  async resetPassword(email) {
    const trimmedEmail = String(email || '').trim().toLowerCase();
    if (!trimmedEmail || !this.isValidEmail(trimmedEmail)) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح' };
    }

    await this.delay(400);
    return {
      success: true,
      message: `تم إرسال رابط إعادة تعيين كلمة المرور إلى ${trimmedEmail}. يرجى مراجعة صندوق الوارد لديك.`
    };
  }

  /**
   * تسجيل الخروج
   */
  logout() {
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
