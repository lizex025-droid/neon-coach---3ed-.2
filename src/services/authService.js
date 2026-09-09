import { store } from '../state/store.js';
import { supabase } from './supabaseClient.js';
import { syncService } from './syncService.js';
import { timerService } from './timerService.js';
import { aiService } from './aiService.js';

const LOGIN_FAILURE = 'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور، وأكّد بريدك أو استخدم استعادة كلمة المرور.';
const SIGNUP_NOTICE = 'إذا أمكن استخدام هذا البريد، ستصلك تعليمات المتابعة. إذا عندك حساب مسبقاً، سجّل الدخول أو استخدم استعادة كلمة المرور.';
const RESET_NOTICE = 'إذا كان البريد مرتبطاً بحساب، ستصلك رسالة استعادة كلمة المرور.';

export class AuthService {
  constructor(client = supabase, stateStore = store, sync = syncService, autoInit = false) {
    this.client = client;
    this.store = stateStore;
    this.sync = sync;
    this.currentSession = null;
    this.listeners = new Set();
    this.generation = 0;
    this.recovery = false;
    this.ready = autoInit ? this.initialize() : Promise.resolve();
  }
  async initialize() {
    // Remove credentials and unowned data written by the old demo authentication.
    for (const key of ['neon_auth_session_v1', 'neon_registered_users_v1', 'neon_coach_app_state_v1', 'neon_gemini_api_key', 'neon_openai_api_key']) {
      try { globalThis.localStorage?.removeItem(key); } catch {}
    }
    if (!this.client) return;
    this.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') { this.clearSession(); return; }
      if (event === 'PASSWORD_RECOVERY') this.recovery = true;
      // Never await Supabase work inside the auth callback (SDK holds a lock).
      if (session && ['SIGNED_IN', 'TOKEN_REFRESHED', 'USER_UPDATED', 'PASSWORD_RECOVERY'].includes(event)) {
        setTimeout(() => this.acceptSession(session).then(() => this.notifyListeners()).catch(() => this.clearSession()), 0);
      }
    });
    try {
      const { data, error } = await this.client.auth.getSession();
      if (error) throw error;
      if (data.session) await this.acceptSession(data.session);
    } catch { this.clearSession(); }
  }
  async acceptSession(session) {
    if (!session?.access_token || !session.user || session.user.is_anonymous) throw new Error('يلزم تسجيل الدخول بحساب مؤكد');
    if (this.currentSession?.token === session.access_token) return this.getCurrentUser();
    if (this.pendingToken === session.access_token) return this.pending;
    this.pendingToken = session.access_token;
    const generation = this.generation;
    this.pending = (async () => {
      const { data, error } = await this.client.auth.getUser(session.access_token);
      if (error || !data?.user || data.user.is_anonymous || !data.user.email_confirmed_at) throw new Error('تعذر التحقق من الحساب، أكد بريدك ثم سجل الدخول');
      const user = data.user;
      if (generation !== this.generation) throw new Error('انتهت الجلسة');
      if (this.getCurrentUser()?.id !== user.id) {
        this.store.logoutUser();
        this.store.loginUser({ id: user.id, email: user.email, name: user.user_metadata?.name || '', role: user.app_metadata?.role || 'client' }, user.app_metadata?.provider || 'email');
        const result = await this.sync.loadUserData(user.id);
        if (!result.success) throw new Error('تعذر تحميل بيانات حسابك. تحقق من الاتصال وحاول مجدداً');
      }
      if (generation !== this.generation) throw new Error('انتهت الجلسة');
      const userObj = { id: user.id, email: user.email, name: this.store.getState().userProfile.name,
        role: user.app_metadata?.role || 'client', onboardingCompleted: !!this.store.getState().userProfile.onboardingCompleted };
      this.currentSession = { token: session.access_token, user: userObj, expiresAt: session.expires_at * 1000 };
      this.notifyListeners();
      return userObj;
    })();
    try { return await this.pending; }
    catch (error) { this.clearSession(); throw error; }
    finally { this.pendingToken = null; this.pending = null; }
  }
  isAuthenticated() { return !!this.currentSession && this.currentSession.expiresAt > Date.now(); }
  getCurrentUser() { return this.currentSession?.user || null; }
  getCurrentSession() { return this.currentSession; }
  isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  errorResult(error) {
    const code = error?.code || '';
    const messages = {
      invalid_credentials: LOGIN_FAILURE,
      email_not_confirmed: LOGIN_FAILURE,
      user_already_exists: LOGIN_FAILURE,
      over_email_send_rate_limit: 'تم الوصول لحد إرسال الرسائل. انتظر قليلاً ثم حاول مجدداً',
      over_request_rate_limit: 'محاولات كثيرة. انتظر قليلاً ثم حاول مجدداً',
      weak_password: 'اختر كلمة مرور أقوى، لا تقل عن 12 خانة',
    };
    return { success: false, error: messages[code] || 'تعذر إتمام الطلب. تحقق من الاتصال وبياناتك وحاول مجدداً' };
  }
  async loginWithEmail(email, password) {
    email = String(email || '').trim().toLowerCase();
    password = String(password || ''); // Password whitespace is significant.
    if (!this.isValidEmail(email)) return { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
    if (!password) return { success: false, error: 'يرجى إدخال كلمة المرور' };
    if (!this.client) return this.errorResult();
    try {
      const { data, error } = await this.client.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: LOGIN_FAILURE };
      const user = await this.acceptSession(data.session);
      return { success: true, user, onboardingCompleted: user.onboardingCompleted };
    } catch { return { success: false, error: LOGIN_FAILURE }; }
  }
  async signUpWithEmail(name, email, password) {
    name = String(name || '').trim(); email = String(email || '').trim().toLowerCase();
    password = String(password || '');
    if (name.length < 2 || name.length > 100) return { success: false, error: 'يرجى إدخال اسمك بين حرفين و100 حرف' };
    if (!this.isValidEmail(email)) return { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
    if (password.length < 12) return { success: false, error: 'كلمة المرور يجب أن لا تقل عن 12 خانة' };
    if (!this.client) return this.errorResult();
    try {
      const { error } = await this.client.auth.signUp({ email, password, options: {
        data: { name }, emailRedirectTo: typeof location === 'undefined' ? undefined : location.origin + '/'
      } });
      if (error?.name === 'AuthRetryableFetchError') return this.errorResult(error);
      // Email confirmation stays enabled in Supabase. Never expose identities,
      // duplicate-user errors, or per-address mail delivery failures to the UI.
      return { success: true, needsConfirmation: true, message: SIGNUP_NOTICE };
    } catch (error) { return this.errorResult(error); }
  }
  async oauth(provider) {
    if (!this.client || typeof location === 'undefined') return this.errorResult();
    try {
      const { error } = await this.client.auth.signInWithOAuth({ provider, options: { redirectTo: location.origin + '/' } });
      return error ? this.errorResult(error) : { success: true, redirecting: true };
    } catch (error) { return this.errorResult(error); }
  }
  loginWithGoogle() { return this.oauth('google'); }
  loginWithApple() { return this.oauth('apple'); }
  loginWithFacebook() { return this.oauth('facebook'); }
  signUpWithGoogle() { return this.oauth('google'); }
  signUpWithApple() { return this.oauth('apple'); }
  loginAsDemo() { return Promise.resolve({ success: false, error: 'يلزم تسجيل الدخول بحساب شخصي' }); }
  async resetPassword(email) {
    email = String(email || '').trim().toLowerCase();
    if (!this.isValidEmail(email)) return { success: false, error: 'صيغة البريد الإلكتروني غير صحيحة' };
    if (!this.client) return this.errorResult();
    try {
      const origin = typeof location === 'undefined' ? undefined : location.origin + '/#reset-password';
      const { error } = await this.client.auth.resetPasswordForEmail(email, { redirectTo: origin });
      if (error?.name === 'AuthRetryableFetchError') return this.errorResult(error);
      return { success: true, message: RESET_NOTICE };
    } catch (error) { return this.errorResult(error); }
  }
  async updatePassword(password) {
    if (!this.isAuthenticated() || password.length < 12) return { success: false, error: 'يلزم رابط استعادة صالح وكلمة مرور من 12 خانة على الأقل' };
    const { error } = await this.client.auth.updateUser({ password });
    if (error) return this.errorResult(error);
    this.recovery = false;
    return { success: true };
  }
  clearSession() {
    this.generation++;
    this.currentSession = null;
    timerService.stopSessionTimer();
    timerService.stopRestTimer();
    aiService.clearCredentials();
    this.sync.stop();
    this.store.logoutUser();
    this.notifyListeners();
  }
  async logout() {
    const saved = await this.sync.flush();
    if (saved?.success === false) return { success: false, error: 'لم تُحفظ آخر تعديلاتك بعد. عالج مشكلة المزامنة قبل الخروج' };
    try {
      if (!this.client) throw new Error('Auth unavailable');
      // "local" revokes this device's server session and its refresh tokens.
      // Do not claim server logout succeeded before receiving its response.
      const { error } = await this.client.auth.signOut({ scope: 'local' });
      if (error) throw error;
      this.clearSession();
      return { success: true };
    } catch {
      // The SDK can clear browser storage even when the network request fails.
      return { success: false, error: 'تعذر تأكيد إنهاء الجلسة على الخادم. تحقق من الاتصال؛ قد تكون بيانات الدخول حُذفت من هذا الجهاز فقط.' };
    }
  }
  onAuthStateChange(callback) { this.listeners.add(callback); return () => this.listeners.delete(callback); }
  notifyListeners() { for (const listener of this.listeners) listener(this.currentSession); }
}
export const authService = new AuthService(supabase, store, syncService, typeof window !== 'undefined');
