import { supabase } from './supabaseClient.js';
import { authService } from './authService.js';
export async function uploadProgressPhoto(file, angle) {
  const user = authService.getCurrentUser();
  if (!authService.isAuthenticated() || !user || !['front', 'side', 'back'].includes(angle)) throw new Error('يلزم تسجيل الدخول');
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) throw new Error('اختَر صورة JPG أو PNG أو WebP بحجم أقل من 10 ميغابايت');
  // Decode and re-encode to reject invalid images and remove EXIF location metadata.
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .85));
  if (!blob) throw new Error('تعذر معالجة الصورة');
  const path = `${user.id}/${angle}-${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from('progress-photos').upload(path, blob, { contentType: 'image/jpeg', upsert: false });
  if (error) throw new Error('تعذر رفع الصورة، تحقق من الاتصال وأعد المحاولة');
  if (authService.getCurrentUser()?.id !== user.id) throw new Error('تغير الحساب أثناء الرفع');
  return path;
}
export async function getProgressPhotoURL(path) {
  if (!path?.startsWith(authService.getCurrentUser()?.id + '/')) return null;
  const { data, error } = await supabase.storage.from('progress-photos').createSignedUrl(path, 300);
  if (error) return null;
  return data.signedUrl;
}
