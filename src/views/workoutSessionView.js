/**
 * NEON COACH - شاشة جلسة التمرين الحية (Active Workout Session)
 * متطابقة تماماً مع الصورة المرجعية 64E97D80-8E57-4B80-8280-826B3454E8C0.PNG
 * توقيت حي محسوب بـ timestamps لمقاومة إغلاق أو تصغير المتصفح
 */

import { store } from '../state/store.js';
import { timerService } from '../services/timerService.js';
import { notificationService } from '../services/notificationService.js';

export function renderWorkoutSessionView() {
  const state = store.getState();
  const session = state.activeWorkoutSession;
  const currentEx = session.currentExercise;

  const formattedTime = timerService.formatTime(session.elapsedSeconds);

  return `
    <div class="workout-session-container" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط علوي مع زر الرجوع والعنوان -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="session-back-btn" class="btn-icon" aria-label="رجوع">
          ❯
        </button>
        <div style="text-align: center;">
          <div style="font-size: 0.85rem; color: #55F7A5; font-weight: 700;">تمرين اليوم</div>
          <h1 style="font-size: 1.4rem; font-weight: 900; color: #FFFFFF; margin: 0;">
            ${session.sessionNameAr}
          </h1>
        </div>
        <div style="width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
          🔥
        </div>
      </div>

      <!-- بطاقتي الوقت المنقضي والتقدم -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        
        <!-- الوقت المنقضي -->
        <div class="neon-card" style="padding: 16px; text-align: center;">
          <div style="font-size: 0.82rem; color: #B8C0BC; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>⏱️</span>
            <span>الوقت المنقضي</span>
          </div>
          <div id="session-elapsed-timer" style="font-size: 1.6rem; font-weight: 900; color: #55F7A5; font-family: monospace; letter-spacing: 1px;">
            ${formattedTime}
          </div>
        </div>

        <!-- التقدم -->
        <div class="neon-card" style="padding: 16px; text-align: center;">
          <div style="font-size: 0.82rem; color: #B8C0BC; margin-bottom: 4px; display: flex; align-items: center; justify-content: center; gap: 4px;">
            <span>🏋️</span>
            <span>التقدم</span>
          </div>
          <div style="font-size: 1.6rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">
            2 من 6
          </div>
        </div>

      </div>

      <!-- بطاقة التمرين الحالي (مطابقة للصورة 64E97D80) -->
      <div class="neon-card" style="padding: 20px;">
        
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <h2 class="ltr-text" style="font-size: 1.4rem; font-weight: 900; color: #FFFFFF; margin-bottom: 4px;">
              ${currentEx.nameEn}
            </h2>
            <div style="font-size: 0.9rem; color: #B8C0BC;">
              ${currentEx.nameAr}
            </div>
          </div>

          <!-- رسم توضيحي للتمرين -->
          <div style="width: 52px; height: 52px; border-radius: var(--radius-md); background: rgba(85,247,165,0.08); border: var(--border-neon); display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">
            🏋️‍♂️
          </div>
        </div>

        <!-- شارة الأداء السابق -->
        <div class="badge badge-neon" style="margin-bottom: 18px; padding: 6px 12px; font-family: monospace;">
          <span>🕒 السابق:</span>
          <span>${currentEx.previousBest}</span>
        </div>

        <!-- جدول المجموعات الفعلي -->
        <table class="sets-table">
          <thead>
            <tr>
              <th>المجموعة</th>
              <th>الوزن (كغ)</th>
              <th>التكرارات</th>
              <th>RPE</th>
              <th>إنجاز</th>
            </tr>
          </thead>
          <tbody id="sets-tbody">
            ${currentEx.sets.map((set, idx) => `
              <tr data-set-index="${idx}">
                <td style="font-weight: 800; color: #FFFFFF; font-family: monospace;">${set.setNumber}</td>
                <td>
                  <input type="number" class="set-input set-weight-input" value="${set.weight}" step="0.5" data-index="${idx}">
                </td>
                <td>
                  <input type="number" class="set-input set-reps-input" value="${set.reps}" data-index="${idx}">
                </td>
                <td>
                  <input type="number" class="set-input set-rpe-input" value="${set.rpe || ''}" placeholder="-" min="1" max="10" step="0.5" style="color: #55F7A5;" data-index="${idx}">
                </td>
                <td>
                  <button class="set-check-btn ${set.completed ? 'checked' : ''}" data-index="${idx}" aria-label="تحديد إنجاز المجموعة">
                    ${set.completed ? '✓' : ''}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <!-- زر إضافة مجموعة -->
        <button id="add-set-btn" class="btn btn-secondary btn-block" style="border-style: dashed; border-radius: 14px; margin-top: 8px;">
          ➕ إضافة مجموعة
        </button>

      </div>

      <!-- مؤقت الراحة التنازلي التفاعلي (مطابق للصورة 64E97D80) -->
      <div class="neon-card" style="padding: 18px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem; color: #B8C0BC; font-weight: 600;">
          <span>⏱️</span>
          <span>الراحة</span>
        </div>

        <div id="rest-timer-display" style="font-size: 2.5rem; font-weight: 900; color: #55F7A5; font-family: monospace; letter-spacing: 2px; text-shadow: 0 0 16px rgba(85, 247, 165, 0.4);">
          01:12
        </div>

        <!-- شريط تقدم الراحة -->
        <div style="width: 100%; height: 6px; background: rgba(255, 255, 255, 0.1); border-radius: 999px; overflow: hidden; margin-top: 4px;">
          <div id="rest-timer-bar" style="width: 75%; height: 100%; background: #55F7A5; border-radius: 999px; transition: width 0.3s ease; box-shadow: 0 0 8px #55F7A5;"></div>
        </div>

        <div style="display: flex; gap: 10px; margin-top: 8px;">
          <button id="skip-rest-btn" class="badge badge-neon" style="cursor: pointer; padding: 6px 16px;">
            تخطي الراحة ⏭
          </button>
          <button id="add-30s-rest-btn" class="badge badge-neon" style="cursor: pointer; padding: 6px 16px;">
            +30 ثانية
          </button>
        </div>
      </div>

      <!-- زر أشعر بألم ⚠️ (مطابق للصورة 64E97D80) -->
      <button id="pain-alert-btn" class="btn btn-danger btn-block" style="border-radius: 16px; padding: 14px; font-weight: 700; font-size: 0.95rem;">
        <span>أشعر بألم</span>
        <span>⚠️</span>
      </button>

      <!-- زر إنهاء التمرين (مطابق للصورة 64E97D80) -->
      <button id="finish-workout-btn" class="btn btn-primary btn-lg btn-block" style="border-radius: 20px; font-size: 1.15rem;">
        <span>إنهاء التمرين</span>
        <span>✓</span>
      </button>

      <!-- نافذة تسجيل الألم المنبثقة -->
      <div id="pain-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 90vh; padding: 20px; border-radius: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #FF4D4D; font-size: 1.2rem;">⚠️ توثيق الألم أثناء التمرين</h3>
            <button id="close-pain-modal-btn" class="btn-icon">✕</button>
          </div>
          <p style="font-size: 0.88rem; color: #B8C0BC; margin-bottom: 14px;">
            سلامتك أولاً. نوصي بإيقاف التمرين فوراً إذا كان الألم حاداً في المفصل.
          </p>
          <div class="form-group">
            <label class="form-label">موضع الألم:</label>
            <select id="pain-location">
              <option value="الكتف الأيمن">الكتف الأيمن</option>
              <option value="الكتف الأيسر">الكتف الأيسر</option>
              <option value="المرفق">المرفق</option>
              <option value="أسفل الظهر">أسفل الظهر</option>
              <option value="الركبة">الركبة</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">شدة الألم (1 - 10):</label>
            <input type="range" id="pain-severity" min="1" max="10" value="5">
            <div style="display: flex; justify-content: space-between; font-size: 0.8rem; color: #B8C0BC;">
              <span>خفيف (1)</span>
              <span>متوسط (5)</span>
              <span>شديد (10)</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label">ملاحظات إضافية:</label>
            <textarea id="pain-notes" rows="2" placeholder="وصف شعورك أثناء الحركة..."></textarea>
          </div>
          <button id="save-pain-btn" class="btn btn-danger btn-block" style="border-radius: 14px;">
            توثيق وحفظ الملاحظة
          </button>
        </div>
      </div>

    </div>
  `;
}

export function bindWorkoutSessionEvents() {
  const state = store.getState();

  // بدء توقيت الجلسة الفعلي إذا لم يكن مشتغلاً
  const startedAt = state.activeWorkoutSession.startedAtTimestamp || (Date.now() - (state.activeWorkoutSession.elapsedSeconds * 1000));
  timerService.startSessionTimer(startedAt, (elapsedSec) => {
    state.activeWorkoutSession.elapsedSeconds = elapsedSec;
    const timerElem = document.getElementById('session-elapsed-timer');
    if (timerElem) {
      timerElem.textContent = timerService.formatTime(elapsedSec);
    }
  });

  // بدء مؤقت الراحة 72 ثانية (01:12)
  let restSecRemaining = state.activeWorkoutSession.restTimeRemainingSec || 72;
  const totalRestSec = state.activeWorkoutSession.totalRestTimeSec || 90;

  const updateRestDisplay = (sec) => {
    const display = document.getElementById('rest-timer-display');
    const bar = document.getElementById('rest-timer-bar');
    if (display) display.textContent = timerService.formatTime(sec);
    if (bar) {
      const pct = (sec / totalRestSec) * 100;
      bar.style.width = `${pct}%`;
    }
  };

  timerService.startRestTimer(restSecRemaining, (sec) => {
    restSecRemaining = sec;
    updateRestDisplay(sec);
  }, () => {
    notificationService.showToast('انتهت فترة الراحة! حان وقت المجموعة التالية 🏋️', 'info');
  });

  // تخطي الراحة
  document.getElementById('skip-rest-btn')?.addEventListener('click', () => {
    timerService.stopRestTimer();
    updateRestDisplay(0);
  });

  // زيادة 30 ثانية للراحة
  document.getElementById('add-30s-rest-btn')?.addEventListener('click', () => {
    restSecRemaining += 30;
    timerService.startRestTimer(restSecRemaining, updateRestDisplay);
  });

  // النقر على تحديد إنجاز المجموعة
  document.querySelectorAll('.set-check-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-index'));
      store.toggleSetCompletion(idx);
      btn.classList.toggle('checked');
      btn.textContent = btn.classList.contains('checked') ? '✓' : '';
      
      // بدء مؤقت راحة جديد تلقائياً عند إكمال مجموعة
      if (btn.classList.contains('checked')) {
        timerService.startRestTimer(90, updateRestDisplay);
      }
    });
  });

  // تعديل أوزان وتكرارات المجموعات
  document.querySelectorAll('.set-weight-input').forEach(input => {
    input.addEventListener('change', () => {
      const idx = Number(input.getAttribute('data-index'));
      store.updateWorkoutSet(idx, 'weight', Number(input.value));
    });
  });

  document.querySelectorAll('.set-reps-input').forEach(input => {
    input.addEventListener('change', () => {
      const idx = Number(input.getAttribute('data-index'));
      store.updateWorkoutSet(idx, 'reps', Number(input.value));
    });
  });

  // إضافة مجموعة
  document.getElementById('add-set-btn')?.addEventListener('click', () => {
    store.addWorkoutSet();
    window.location.hash = '#workout-session'; // إعادة رسم
  });

  // زر الرجوع
  document.getElementById('session-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#today';
  });

  // زر أشعر بألم
  const painBtn = document.getElementById('pain-alert-btn');
  const painModal = document.getElementById('pain-modal');
  const closePainBtn = document.getElementById('close-pain-modal-btn');
  const savePainBtn = document.getElementById('save-pain-btn');

  painBtn?.addEventListener('click', () => {
    if (painModal) painModal.classList.add('open');
  });

  closePainBtn?.addEventListener('click', () => {
    if (painModal) painModal.classList.remove('open');
  });

  savePainBtn?.addEventListener('click', () => {
    const loc = document.getElementById('pain-location')?.value;
    const sev = document.getElementById('pain-severity')?.value;
    const note = document.getElementById('pain-notes')?.value;
    store.logWorkoutPain(loc, sev, note);
    painModal.classList.remove('open');
    notificationService.showToast('تم توثيق الألم في سجلك. ننصحك بالراحة وعدم تحميل المفصل.', 'warning');
  });

  // إنهاء التمرين
  document.getElementById('finish-workout-btn')?.addEventListener('click', () => {
    timerService.stopSessionTimer();
    timerService.stopRestTimer();
    store.finishWorkoutSession();
    alert('عاش يا بطل! تم إنهاء التمرين بنجاح وحفظ الحجم التدريبي الكامل في سجلك الرياضي 🏆');
    window.location.hash = '#today';
  });
}
