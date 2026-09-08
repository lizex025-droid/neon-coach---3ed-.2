/**
 * NEON COACH - شاشة مسار تمرين الـ 40 يوم والمكتبة المرجعية
 * مستوحى من المراجع المستقلة ومكتبة ملفات الـ PDF
 */

import { FORTY_DAY_PROGRAM, PDF_LIBRARY } from '../data/fortyDayProgram.js';
import { notificationService } from '../services/notificationService.js';

let activeProgramDay = 1;

export function renderFortyDayView() {
  const prog = FORTY_DAY_PROGRAM;

  return `
    <div class="forty-day-container" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط العنوان -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="forty-back-btn" class="btn-icon" aria-label="رجوع">
          ❯
        </button>
        <div style="text-align: center;">
          <h1 style="font-size: 1.4rem; font-weight: 900; color: #FFFFFF; margin-bottom: 2px;">
            تحدي الـ 40 يوماً
          </h1>
          <span class="badge badge-neon">NEON Transformation</span>
        </div>
        <div style="width: 44px;"></div>
      </div>

      <!-- بطاقة نبذة التحدي والمراحل الثلاث -->
      <div class="neon-card" style="padding: 20px;">
        <h2 style="font-size: 1.2rem; font-weight: 900; color: #55F7A5; margin-bottom: 6px;">
          ${prog.titleAr}
        </h2>
        <p style="font-size: 0.88rem; color: #B8C0BC; margin-bottom: 16px;">
          ${prog.descriptionAr}
        </p>

        <!-- المراحل الثلاث -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${prog.phases.map(ph => `
            <div class="neon-card alt" style="padding: 10px 14px; border-color: rgba(85,247,165,0.15);">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-weight: 800; color: #FFFFFF; font-size: 0.88rem;">${ph.titleAr}</span>
                <span class="badge badge-verified" style="font-size: 0.72rem;">${ph.daysRange}</span>
              </div>
              <div style="font-size: 0.78rem; color: #B8C0BC;">${ph.focus}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- شبكة الأيام الأربعين (40-Day Grid) -->
      <div class="neon-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <span style="font-weight: 800; color: #FFFFFF; font-size: 1rem;">خريطة التقدم (40 يوماً)</span>
          <span style="font-size: 0.8rem; color: #55F7A5;">اليوم الحالي: ${activeProgramDay}</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(8, 1fr); gap: 6px;">
          ${prog.days.map(d => {
            const isCompleted = d.day < activeProgramDay;
            const isCurrent = d.day === activeProgramDay;
            return `
              <button class="day-cell-btn" data-day="${d.day}" style="aspect-ratio: 1; border-radius: 10px; border: 1px solid ${isCurrent ? '#55F7A5' : isCompleted ? 'rgba(85,247,165,0.4)' : 'rgba(255,255,255,0.1)'}; background: ${isCurrent ? '#55F7A5' : isCompleted ? 'rgba(85,247,165,0.15)' : '#050d09'}; color: ${isCurrent ? '#020605' : isCompleted ? '#55F7A5' : '#B8C0BC'}; font-weight: 800; font-family: monospace; font-size: 0.85rem; cursor: pointer; padding: 0; box-shadow: ${isCurrent ? '0 0 10px #55F7A5' : 'none'};">
                ${d.day}
              </button>
            `;
          }).join('')}
        </div>

        <!-- بطاقة تفاصيل اليوم المختار -->
        <div id="selected-day-details" style="margin-top: 16px; padding-top: 14px; border-top: 1px solid rgba(85,247,165,0.2);">
          ${renderDayDetails(prog.days[activeProgramDay - 1])}
        </div>
      </div>

      <!-- مكتبة الملفات والكتب المرجعية المستقلة -->
      <div class="neon-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #55F7A5; font-size: 1rem; margin-bottom: 14px;">
          <span>📚</span>
          <span>مكتبة البرامج والملفات المرجعية</span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px;">
          ${PDF_LIBRARY.map(pdf => `
            <div class="neon-card alt" style="padding: 14px; display: flex; align-items: center; justify-content: space-between; border-color: rgba(85,247,165,0.18);">
              <div>
                <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 2px;">${pdf.titleAr}</div>
                <div style="font-size: 0.78rem; color: #B8C0BC;">${pdf.pages} صفحة • ${pdf.fileSize} • <span style="color: #55F7A5;">${pdf.badge}</span></div>
              </div>
              <button class="btn btn-secondary download-pdf-guide-btn" data-title="${pdf.titleAr}" style="padding: 6px 14px; font-size: 0.8rem; border-radius: 12px;">
                تحميل 📥
              </button>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

function renderDayDetails(dayObj) {
  if (!dayObj) return '';
  return `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
      <span style="font-weight: 800; color: #FFFFFF; font-size: 1.1rem;">اليوم ${dayObj.day}: ${dayObj.titleAr}</span>
      <span class="badge ${dayObj.isRest ? 'badge-verified' : 'badge-neon'}">${dayObj.isRest ? 'استشفاء / راحة' : `${dayObj.durationMin} دقيقة`}</span>
    </div>
    <div style="font-size: 0.85rem; color: #B8C0BC;">
      ${dayObj.note || `${dayObj.exercisesCount} تمارين موثقة مع فترات راحة محسوبة.`}
    </div>
  `;
}

export function bindFortyDayEvents() {
  document.getElementById('forty-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#workout';
  });

  // النقر على يوم في خريطة الـ 40 يوم
  document.querySelectorAll('.day-cell-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const day = Number(btn.getAttribute('data-day'));
      activeProgramDay = day;
      const detailsArea = document.getElementById('selected-day-details');
      if (detailsArea) {
        detailsArea.innerHTML = renderDayDetails(FORTY_DAY_PROGRAM.days[day - 1]);
      }
      document.querySelectorAll('.day-cell-btn').forEach(b => {
        b.style.borderColor = 'rgba(255,255,255,0.1)';
      });
      btn.style.borderColor = '#55F7A5';
    });
  });

  // محاكاة تنزيل ملفات الـ PDF
  document.querySelectorAll('.download-pdf-guide-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const title = btn.getAttribute('data-title');
      notificationService.showToast(`جاري تنزيل "${title}" بصيغة PDF كاملة 📥`, 'success');
    });
  });
}
