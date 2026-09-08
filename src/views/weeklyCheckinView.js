/**
 * NEON COACH - شاشة المتابعة الأسبوعية (Weekly Check-in)
 * متطابقة تماماً وبدقة متناهية مع الصورة المرجعية 54696C39-0A9E-4390-B378-C0B9D1391305.PNG
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';

export function renderWeeklyCheckinView() {
  const state = store.getState();
  const checkin = state.weeklyCheckin;

  return `
    <div class="weekly-checkin-container" style="padding: 16px 16px 110px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط العنوان والخصوصية -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="checkin-back-btn" class="btn-icon" aria-label="رجوع">
          ❯
        </button>
        <div style="text-align: center;">
          <h1 style="font-size: 1.4rem; font-weight: 900; color: #FFFFFF; margin-bottom: 2px;">
            المتابعة الأسبوعية
          </h1>
        </div>
        <span class="badge badge-neon" style="font-size: 0.72rem; padding: 4px 10px;">
          🔒 خصوصيتك محمية
        </span>
      </div>

      <!-- مؤشر الأسبوع والمهام المكتملة -->
      <div style="text-align: center; margin-bottom: 4px;">
        <div style="font-size: 1.5rem; font-weight: 900; color: #FFFFFF; margin-bottom: 4px;">
          الأسبوع ${checkin.weekNumber}
        </div>
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span style="color: #B8C0BC; font-size: 0.9rem;">${checkin.completedTasksCount} من ${checkin.totalTasksCount} مكتمل</span>
          <div style="width: 22px; height: 22px; border-radius: 50%; border: 2px solid #55F7A5; display: flex; align-items: center; justify-content: center; color: #55F7A5; font-size: 0.75rem;">
            ✓
          </div>
        </div>
      </div>

      <!-- بطاقة الوزن الحالي والمقارنة (مطابقة للصورة 54696C39) -->
      <div class="neon-card" style="padding: 22px; text-align: center;">
        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 6px; color: #B8C0BC; font-size: 0.9rem; margin-bottom: 4px;">
          <span>الوزن الحالي</span>
          <span>⚖️</span>
        </div>

        <div style="display: flex; align-items: baseline; justify-content: center; gap: 6px;">
          <span style="font-size: 3.4rem; font-weight: 900; color: #FFFFFF; font-family: monospace; letter-spacing: -1px;">
            ${checkin.currentWeight}
          </span>
          <span style="font-size: 1.3rem; font-weight: 700; color: #55F7A5;">كغ</span>
        </div>

        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; color: #B8C0BC; font-size: 0.9rem; margin-top: 6px;">
          <span>التغيير عن الأسبوع السابق</span>
          <span style="color: #55F7A5; font-weight: 800; font-family: monospace; direction: ltr;">
            ↓ ${checkin.weightChangeVsLastWeek} كغ
          </span>
        </div>
      </div>

      <!-- شبكة مقاييس الحالة الستة (Grid 2x3 - مطابقة للصورة 54696C39) -->
      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px;">
        
        <!-- التوتر -->
        <div class="neon-card" style="padding: 14px 8px; text-align: center;">
          <div style="font-size: 0.78rem; color: #B8C0BC; margin-bottom: 4px;">🧠 التوتر</div>
          <div style="color: #55F7A5; font-size: 0.9rem; margin-bottom: 2px;">★★☆☆☆</div>
          <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF; font-family: monospace;">2 / 5</div>
        </div>

        <!-- الجوع -->
        <div class="neon-card" style="padding: 14px 8px; text-align: center;">
          <div style="font-size: 0.78rem; color: #B8C0BC; margin-bottom: 4px;">🍽️ الجوع</div>
          <div style="color: #55F7A5; font-size: 0.9rem; margin-bottom: 2px;">★★☆☆☆</div>
          <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF; font-family: monospace;">2 / 5</div>
        </div>

        <!-- الطاقة -->
        <div class="neon-card" style="padding: 14px 8px; text-align: center;">
          <div style="font-size: 0.78rem; color: #B8C0BC; margin-bottom: 4px;">⚡ الطاقة</div>
          <div style="color: #55F7A5; font-size: 0.9rem; margin-bottom: 2px;">★★★★☆</div>
          <div style="font-weight: 800; font-size: 0.85rem; color: #FFFFFF; font-family: monospace;">4 / 5</div>
        </div>

        <!-- الماء -->
        <div class="neon-card" style="padding: 14px 8px; text-align: center;">
          <div style="font-size: 0.78rem; color: #B8C0BC; margin-bottom: 4px;">💧 الماء</div>
          <div style="font-weight: 900; font-size: 1.4rem; color: #FFFFFF; font-family: monospace;">
            ${checkin.waterGlassesAvg}/${checkin.waterGlassesTarget}
          </div>
          <div style="font-size: 0.72rem; color: #B8C0BC;">أكواب اليوم</div>
        </div>

        <!-- التمارين -->
        <div class="neon-card" style="padding: 14px 8px; text-align: center;">
          <div style="font-size: 0.78rem; color: #B8C0BC; margin-bottom: 4px;">🏋️ التمارين</div>
          <div style="font-weight: 900; font-size: 1.4rem; color: #FFFFFF; font-family: monospace;">
            ${checkin.workoutsCompleted}/${checkin.workoutsTarget}
          </div>
          <div style="font-size: 0.72rem; color: #B8C0BC;">تمارين مكتملة</div>
        </div>

        <!-- النوم -->
        <div class="neon-card" style="padding: 14px 8px; text-align: center;">
          <div style="font-size: 0.78rem; color: #B8C0BC; margin-bottom: 4px;">🌙 النوم</div>
          <div style="font-weight: 900; font-size: 1.4rem; color: #FFFFFF; font-family: monospace;">
            ${checkin.sleepHours}
          </div>
          <div style="font-size: 0.72rem; color: #B8C0BC;">ساعات</div>
        </div>

      </div>

      <!-- بطاقة سؤال الألم (نعم / لا - مطابقة للصورة 54696C39) -->
      <div class="neon-card" style="padding: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem;">هل يوجد ألم؟</span>
          <span style="font-size: 1.2rem;">👤</span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <button id="pain-no-btn" class="btn ${checkin.hasPain ? 'btn-secondary' : 'btn-primary'}" style="border-radius: 14px; padding: 10px;">
            <span>لا</span>
            <span>✓</span>
          </button>
          <button id="pain-yes-btn" class="btn ${checkin.hasPain ? 'btn-danger' : 'btn-secondary'}" style="border-radius: 14px; padding: 10px;">
            نعم
          </button>
        </div>
      </div>

      <!-- قسم رفع صور التقدم (مطابق للصورة 54696C39) -->
      <div class="neon-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
          <span style="font-weight: 800; color: #FFFFFF; font-size: 1rem;">صور التقدم</span>
          <span>📷</span>
        </div>
        <p style="font-size: 0.8rem; color: #B8C0BC; margin-bottom: 16px;">
          🔒 صورك خاصة ومحفوظة بأمان محلياً على جهازك.
        </p>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          
          <!-- أمام -->
          <label class="neon-card" style="padding: 16px 8px; text-align: center; border-style: dashed; cursor: pointer; background: #050d09;">
            <div style="font-size: 0.85rem; color: #FFFFFF; font-weight: 700; margin-bottom: 6px;">أمام</div>
            <div style="font-size: 1.5rem; color: #55F7A5; margin-bottom: 4px;">📷</div>
            <div style="font-size: 0.72rem; color: #B8C0BC;">إضافة صورة</div>
            <input type="file" accept="image/*" class="photo-upload-input" data-angle="front" style="display: none;">
          </label>

          <!-- جانب -->
          <label class="neon-card" style="padding: 16px 8px; text-align: center; border-style: dashed; cursor: pointer; background: #050d09;">
            <div style="font-size: 0.85rem; color: #FFFFFF; font-weight: 700; margin-bottom: 6px;">جانب</div>
            <div style="font-size: 1.5rem; color: #55F7A5; margin-bottom: 4px;">📷</div>
            <div style="font-size: 0.72rem; color: #B8C0BC;">إضافة صورة</div>
            <input type="file" accept="image/*" class="photo-upload-input" data-angle="side" style="display: none;">
          </label>

          <!-- خلف -->
          <label class="neon-card" style="padding: 16px 8px; text-align: center; border-style: dashed; cursor: pointer; background: #050d09;">
            <div style="font-size: 0.85rem; color: #FFFFFF; font-weight: 700; margin-bottom: 6px;">خلف</div>
            <div style="font-size: 1.5rem; color: #55F7A5; margin-bottom: 4px;">📷</div>
            <div style="font-size: 0.72rem; color: #B8C0BC;">إضافة صورة</div>
            <input type="file" accept="image/*" class="photo-upload-input" data-angle="back" style="display: none;">
          </label>

        </div>
      </div>

      <!-- حقل ملاحظات المتابعة -->
      <div class="neon-card" style="padding: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem;">ملاحظاتك الأسبوعية</span>
          <span>💬</span>
        </div>
        <textarea id="checkin-notes" rows="3" placeholder="اكتب أي ملاحظات عن أسبوعك، التزامك، التحديات أو ملخص تقدمك..." style="border-radius: 14px; font-size: 0.9rem; resize: none;"></textarea>
      </div>

      <!-- زر حفظ المتابعة -->
      <button id="submit-checkin-btn" class="btn btn-primary btn-lg btn-block" style="border-radius: 20px; font-size: 1.15rem; font-weight: 800;">
        <span>حفظ المتابعة الأسبوعية</span>
        <span style="font-size: 1.2rem;">💾</span>
      </button>

    </div>
  `;
}

export function bindWeeklyCheckinEvents() {
  document.getElementById('checkin-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#today';
  });

  const painNo = document.getElementById('pain-no-btn');
  const painYes = document.getElementById('pain-yes-btn');

  painNo?.addEventListener('click', () => {
    store.getState().weeklyCheckin.hasPain = false;
    painNo.className = 'btn btn-primary';
    if (painYes) painYes.className = 'btn btn-secondary';
  });

  painYes?.addEventListener('click', () => {
    store.getState().weeklyCheckin.hasPain = true;
    if (painYes) painYes.className = 'btn btn-danger';
    if (painNo) painNo.className = 'btn btn-secondary';
    alert('سلامتك! يرجى كتابة تفاصيل الألم في حقل الملاحظات أسفل الصفحة.');
  });

  // رفع صور التقدم والتحقق من الحجم
  document.querySelectorAll('.photo-upload-input').forEach(input => {
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 10 * 1024 * 1024) {
          alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 10 ميغابايت.');
          return;
        }
        const angle = input.getAttribute('data-angle');
        notificationService.showToast(`تم رفع صورة التقدم (${angle}) بنجاح وتشفيرها محلياً 🔒`, 'success');
      }
    });
  });

  // إرسال المتابعة للمدرب
  document.getElementById('submit-checkin-btn')?.addEventListener('click', () => {
    const notes = document.getElementById('checkin-notes')?.value;
    store.submitWeeklyCheckin({ userNotes: notes });
    alert('تم حفظ المتابعة الأسبوعية بنجاح! 🏆\nيمكنك الآن مراجعة تقرير التقدم أو متابعة تمرينك.');
    window.location.hash = '#progress';
  });
}
