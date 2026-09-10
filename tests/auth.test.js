import test from 'node:test';
import assert from 'node:assert/strict';

test('التحقق من صحة مدخلات تسجيل الدخول بالبريد الإلكتروني', async () => {
  const { authService } = await import('../src/services/authService.js');

  // بريد فارغ
  const r1 = await authService.loginWithEmail('', '123456');
  assert.equal(r1.success, false);
  assert.match(r1.error, /البريد/);

  // صيغة بريد غير صحيحة
  const r2 = await authService.loginWithEmail('invalid-email', '123456');
  assert.equal(r2.success, false);
  assert.match(r2.error, /صيغة/);

  // كلمة مرور قصيرة
  const r3 = await authService.loginWithEmail('test@neoncoach.app', '123');
  assert.equal(r3.success, false);
  assert.match(r3.error, /6 أحرف/);

  // تسجيل دخول صالح
  const r4 = await authService.loginWithEmail('captain@neoncoach.app', 'Secret123!');
  assert.equal(r4.success, true);
  assert.ok(r4.token);
  assert.equal(r4.user.email, 'captain@neoncoach.app');
  assert.equal(authService.isAuthenticated(), true);
});

test('إنشاء حساب جديد بالبريد الإلكتروني والاسم الكامل', async () => {
  const { authService } = await import('../src/services/authService.js');

  // اسم فارغ
  const r1 = await authService.signUpWithEmail('A', 'newuser@neoncoach.app', '123456');
  assert.equal(r1.success, false);
  assert.match(r1.error, /اسمك/);

  // إنشاء حساب صالح
  const uniqueEmail = `user_${Date.now()}@neoncoach.app`;
  const r2 = await authService.signUpWithEmail('عاهد عبد', uniqueEmail, 'Password2026!');
  assert.equal(r2.success, true);
  assert.equal(r2.user.name, 'عاهد عبد');
  assert.equal(r2.user.email, uniqueEmail);
  assert.equal(r2.user.provider, 'email');

  // محاولة تسجيل نفس البريد مرة أخرى
  const r3 = await authService.signUpWithEmail('عاهد آخر', uniqueEmail, 'AnotherPassword!');
  assert.equal(r3.success, false);
  assert.match(r3.error, /مسجل مسبقاً/);
});

test('تسجيل الدخول وإنشاء الحساب بحساب Google (OAuth Foundation)', async () => {
  const { authService } = await import('../src/services/authService.js');
  const { store } = await import('../src/state/store.js');

  const res = await authService.loginWithGoogle();
  assert.equal(res.success, true);
  assert.ok(res.token.startsWith('oauth_google_'));
  assert.equal(res.user.provider, 'google');
  assert.ok(res.user.email.includes('@gmail.com'));
  assert.equal(authService.isAuthenticated(), true);

  // التحقق من تحديث مخزن الحالة
  const state = store.getState();
  assert.equal(state.auth?.provider, 'google');
  assert.equal(state.userProfile.provider, 'google');
  assert.equal(state.userProfile.name, res.user.name);

  // اختبار دالة signUpWithGoogle
  const signupRes = await authService.signUpWithGoogle();
  assert.equal(signupRes.success, true);
  assert.equal(signupRes.user.provider, 'google');
});

test('تسجيل الدخول وإنشاء الحساب بحساب Apple (Sign in with Apple Foundation)', async () => {
  const { authService } = await import('../src/services/authService.js');
  const { store } = await import('../src/state/store.js');

  const res = await authService.loginWithApple();
  assert.equal(res.success, true);
  assert.ok(res.token.startsWith('apple_id_token_'));
  assert.equal(res.user.provider, 'apple');
  assert.ok(res.user.email.includes('appleid.com'));

  // التحقق من تحديث مخزن الحالة
  const state = store.getState();
  assert.equal(state.auth?.provider, 'apple');
  assert.equal(state.userProfile.provider, 'apple');

  // اختبار دالة signUpWithApple
  const signupRes = await authService.signUpWithApple();
  assert.equal(signupRes.success, true);
  assert.equal(signupRes.user.provider, 'apple');
});

test('تسجيل الدخول في وضع التجربة المباشر (Demo Mode)', async () => {
  const { authService } = await import('../src/services/authService.js');
  const { store } = await import('../src/state/store.js');

  const res = await authService.loginAsDemo();
  assert.equal(res.success, true);
  assert.equal(res.user.provider, 'demo');
  assert.equal(res.user.isDemo, true);

  const state = store.getState();
  assert.equal(state.auth?.provider, 'demo');
});

test('طلب استعادة كلمة المرور وإرسال الرابط', async () => {
  const { authService } = await import('../src/services/authService.js');

  const badRes = await authService.resetPassword('notanemail');
  assert.equal(badRes.success, false);

  const goodRes = await authService.resetPassword('ahed@example.com');
  assert.equal(goodRes.success, true);
  assert.match(goodRes.message, /ahed@example.com/);
});

test('تسجيل الخروج وإنهاء الجلسة بأمان', async () => {
  const { authService } = await import('../src/services/authService.js');
  const { store } = await import('../src/state/store.js');

  // التأكد من وجود جلسة ثم الخروج
  await authService.loginAsDemo();
  assert.equal(authService.isAuthenticated(), true);

  const res = authService.logout();
  assert.equal(res.success, true);
  assert.equal(authService.isAuthenticated(), false);
  assert.equal(authService.getCurrentUser(), null);

  const state = store.getState();
  assert.equal(state.auth?.isAuthenticated, false);
});
