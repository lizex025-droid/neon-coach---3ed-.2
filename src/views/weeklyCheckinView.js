import { store } from '../state/store.js';
import { syncService } from '../services/syncService.js';
import { uploadProgressPhoto, getProgressPhotoURL } from '../services/photoService.js';
import { authService } from '../services/authService.js';
const metrics = [
  ['currentWeight', 'الوزن الحالي (كغ)', 20, 400, .1],
  ['energy', 'الطاقة (1–5)', 1, 5, 1], ['hunger', 'الجوع (1–5)', 1, 5, 1],
  ['stress', 'التوتر (1–5)', 1, 5, 1], ['sleepHours', 'ساعات النوم', 0, 24, .5],
  ['workoutsCompleted', 'التمارين المكتملة هذا الأسبوع', 0, 14, 1],
  ['waterGlassesAvg', 'متوسط أكواب الماء يومياً', 0, 40, 1],
];
export function renderWeeklyCheckinView() {
  const checkin = store.getState().weeklyCheckin;
  return `<section class="checkin-page"><h1>المتابعة الأسبوعية</h1><p>سجّل قياساتك وتابع تقدمك. صورك محفوظة بمساحة خاصة بحسابك.</p>
  <form id="checkin-form" class="auth-fields">
    <div class="checkin-grid">${metrics.map(([key, label, min, max, step]) => `<label class="neon-card" for="checkin-${key}">${label}<input id="checkin-${key}" name="${key}" type="number" min="${min}" max="${max}" step="${step}" value="${Number(checkin[key]) || ''}" required></label>`).join('')}</div>
    <label><input id="checkin-pain" type="checkbox" ${checkin.hasPain ? 'checked' : ''}> عندي ألم أثناء التمرين</label>
    <label for="checkin-notes">ملاحظاتك وتفاصيل الألم</label><textarea id="checkin-notes" rows="4" maxlength="4000"></textarea>
    <div class="checkin-grid">${[['front', 'أمام'], ['side', 'جانب'], ['back', 'خلف']].map(([angle, label]) => `<label class="neon-card">صورة ${label}<input type="file" accept="image/jpeg,image/png,image/webp" data-angle="${angle}" class="photo-upload-input"><img id="photo-${angle}" alt="صورة التقدم ${label}" hidden><span id="photo-status-${angle}" role="status"></span></label>`).join('')}</div>
    <p role="status" id="checkin-status"></p><button id="submit-checkin-btn" class="btn btn-primary">حفظ المتابعة الأسبوعية</button>
  </form></section>`;
}
export function bindWeeklyCheckinEvents() {
  const owner = authService.getCurrentUser()?.id;
  const checkin = store.getState().weeklyCheckin;
  document.getElementById('checkin-notes').value = checkin.userNotes || '';
  const previews = async (angle, path) => {
    const url = await getProgressPhotoURL(path);
    const img = document.getElementById('photo-' + angle);
    if (url && img && authService.getCurrentUser()?.id === owner) { img.src = url; img.hidden = false; }
  };
  for (const [angle, path] of Object.entries(checkin.photos || {})) previews(angle, path);
  let uploading = 0;
  document.querySelectorAll('.photo-upload-input').forEach(input => input.addEventListener('change', async () => {
    const file = input.files?.[0]; if (!file) return;
    const angle = input.dataset.angle; const status = document.getElementById('photo-status-' + angle);
    uploading++; input.disabled = true; status.textContent = 'جاري رفع الصورة…';
    try {
      const path = await uploadProgressPhoto(file, angle);
      if (authService.getCurrentUser()?.id !== owner) return;
      store.state.weeklyCheckin.photos ||= {};
      store.state.weeklyCheckin.photos[angle] = path;
      // Keep other form input intact while the upload is saved.
      syncService.schedule();
      if (!(await syncService.flush()).success) throw new Error('رُفعت الصورة لكن لم يُحفظ ربطها بعد. أعد محاولة المزامنة');
      status.textContent = 'تم حفظ الصورة'; await previews(angle, path);
    } catch (error) { status.textContent = error.message; }
    finally { uploading--; input.disabled = false; }
  }));
  document.getElementById('checkin-form').onsubmit = async event => {
    event.preventDefault(); const status = document.getElementById('checkin-status');
    if (uploading) { status.textContent = 'انتظر اكتمال رفع الصور'; return; }
    const values = Object.fromEntries(metrics.map(([key]) => [key, Number(document.getElementById('checkin-' + key).value)]));
    values.userNotes = document.getElementById('checkin-notes').value;
    values.hasPain = document.getElementById('checkin-pain').checked;
    store.submitWeeklyCheckin(values);
    const result = await syncService.flush();
    if (result.success) location.hash = '#progress';
    else status.textContent = 'تعذر الحفظ. تحقق من الاتصال وأعد المحاولة';
  };
}
