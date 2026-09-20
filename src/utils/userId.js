/**
 * NEON COACH - إدارة هوية المستخدم الضيف والمستمر (User Identification Utility)
 * يضمن وجود UUID فريد ومستمر للمستخدم حتى وإن لم يسجل دخوله بعد،
 * ليتم حفظ بياناته وربطها بسلاسة في قاعدة بيانات Supabase.
 */

const GUEST_USER_ID_KEY = 'neon_guest_user_id_v1';

function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * الحصول على معرف المستخدم الضيف الحالي أو توليد معرف جديد وتخزينه
 * @returns {string} UUID صالح
 */
export function getOrCreateGuestUserId() {
  if (typeof localStorage === 'undefined') {
    return generateUUID();
  }
  try {
    let guestId = localStorage.getItem(GUEST_USER_ID_KEY);
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guestId || !uuidRegex.test(guestId)) {
      guestId = generateUUID();
      localStorage.setItem(GUEST_USER_ID_KEY, guestId);
    }
    return guestId;
  } catch (e) {
    return generateUUID();
  }
}
