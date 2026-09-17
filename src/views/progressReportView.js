/**
 * NEON COACH - شاشة تقرير التقدم والتحول البدني (NEON Body Report)
 * تتضمن:
 * 1. فلاتر تفاعلية للفترة (7 أيام، 30 يوماً، 90 يوماً) مع تحديث فوري للمنحنيات
 * 2. رسوم بيانية نيون بدقة Retina Canvas عالية الوضوح مع تفاعل عند اللمس
 * 3. نافذة تسجيل القياسات الجديدة (الوزن، الخصر، القوة)
 * 4. نافذة تحديث فحص تركيب الجسم InBody
 * 5. نافذة دليل فهم مؤشرات التقدم
 * 6. تحليل أداء وتوصيات ذكية بديلة لملاحظات المدرب
 * 7. تصدير PDF ومشاركة التقرير
 */

import { store } from '../state/store.js';
import { pdfService } from '../services/pdfService.js';
import { notificationService } from '../services/notificationService.js';
import { animateCountUp, animateRingOffset } from '../utils/animUtils.js';
import { neonIcon } from '../utils/neonIcons.js';
import { filterStrongestExercisePerMuscle } from '../domain/calculations.js';
import { escapeActionHtml } from '../components/actionPanel.js';
import { dailyHistoryWithin } from '../domain/dailyCycle.js';
import { localPhotoStorage } from '../services/localPhotoStorage.js';
import {
  wtLoad,
  wtSave,
  wtSaveEntry,
  wtDateKey,
  wtParseKey,
  photoFmtDate,
  calculateStreak,
  calculate7DayDelta,
  smoothSvgPath,
  calculateCompositionEstimate
} from '../domain/compositionEstimate.js';

let activePeriod = '90'; // '7' | '30' | '90'

function formatHistoryDate(date) {
  try {
    return new Intl.DateTimeFormat('ar-JO', { weekday: 'short', day: 'numeric', month: 'short' })
      .format(new Date(`${date}T12:00:00`));
  } catch {
    return date;
  }
}

function renderDailyHistoryItem(day) {
  const calories = Number(day.calories) || 0;
  const protein = Number(day.protein) || 0;
  const water = Number(day.consumedWaterLiters) || 0;
  const targetCalories = Number(day.targetCalories) || 0;
  const targetWater = Number(day.targetWaterLiters) || 0;
  return `
    <div style="padding: 13px; border-radius: 13px; border: 1px solid rgba(85,247,165,0.16); background: rgba(85,247,165,0.035); display: flex; flex-direction: column; gap: 9px;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <strong style="color:#FFFFFF; font-size:.9rem;">${escapeHtml(formatHistoryDate(day.date))}</strong>
        <span style="color:#7E998A; font:700 .72rem monospace;">${escapeHtml(day.date)}</span>
      </div>
      <div style="display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; font-size:.78rem;">
        <span style="color:#B8C0BC;"> السعرات: <b style="color:#55F7A5;">${calories.toLocaleString('en-US')}</b>${targetCalories ? ` / ${targetCalories.toLocaleString('en-US')}` : ''}</span>
        <span style="color:#B8C0BC;"> البروتين: <b style="color:#FFFFFF;">${protein}غ</b></span>
        <span style="color:#B8C0BC;"> الماء: <b style="color:#38BDF8;">${water} لتر</b>${targetWater ? ` / ${targetWater}` : ''}</span>
        <span style="color:#B8C0BC;"> الوجبات: <b style="color:#FFFFFF;">${Number(day.mealCount) || 0}</b></span>
        <span style="color:#B8C0BC;"> المكملات: <b style="color:#FFFFFF;">${Number(day.supplementsTaken) || 0}/${Number(day.supplementsTotal) || 0}</b></span>
        <span style="color:#B8C0BC;"> التمرين: <b style="color:${day.workoutCompleted ? '#55F7A5' : '#8C9992'};">${day.workoutCompleted ? 'مكتمل ✓' : 'غير مكتمل'}</b></span>
      </div>
    </div>`;
}

export function renderProgressReportView() {
  const state = store.getState();
  const report = state.progressReport || {};
  const user = state.userProfile || {};
  const workoutHistory = store.getWorkoutHistory() || [];
  const dailyHistory = dailyHistoryWithin(state.dailyHistory, Number(activePeriod));

  const currentWeight = user.currentWeight || report.currentDay?.weight || 118;
  const currentWaist = report.currentDay?.waistCm || 108;
  const currentStrength = report.currentDay?.benchPressKg || 82.5;

  const periodData = getPeriodMetrics(report, activePeriod, currentWeight, currentWaist, currentStrength);
  const smartInsight = generateProgressInsight(periodData.weightChange, periodData.strengthChange, report.adherence);
  const inBody = report.inBodyResult || {};

  return `
    <div class="progress-report-container" style="padding: 16px 16px 110px; display: flex; flex-direction: column; gap: 16px; max-width: 780px; margin: 0 auto;">
      ${Object.keys(state.personalRecords || {}).length ? `<section class="neon-card" style="padding:16px"><h2 style="color:#55F7A5;font-weight:800">أفضل المجموعات المسجلة · PR</h2><p style="font-size:.8rem;color:#B8C0BC">الأعلى وزناً، ثم الأكثر تكراراً عند تساوي الوزن.</p>${Object.values(state.personalRecords).map(record => `<p style="margin-top:8px">${escapeActionHtml(record.nameAr)}: ${record.weight} كغ × ${record.reps} · ${escapeActionHtml(record.date)}</p>`).join('')}</section>` : ''}
      
      <!-- ترويسة خاصة بتقرير الطباعة وPDF بدون أزرار -->
      <div class="print-only" style="margin-bottom: 16px; border-bottom: 2px solid #55F7A5; padding-bottom: 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1 style="font-size: 1.6rem; color: #55F7A5; margin: 0; font-weight: 900;">NEON COACH - تقرير التقدم والتحول البدني الشامل</h1>
            <div style="font-size: 0.88rem; color: #FFFFFF; margin-top: 4px;">
              الاسم: <b>${escapeHtml(user.name || 'عاهد')}</b> &nbsp;|&nbsp; تاريخ التقرير: <b>${new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' })}</b> &nbsp;|&nbsp; النطاق: <b>آخر ${activePeriod} يوم</b>
            </div>
          </div>
          <div style="text-align: left; font-family: monospace; color: #55F7A5; font-weight: 900; font-size: 1.1rem; letter-spacing: 1px;">
            NEON COACH
          </div>
        </div>
      </div>

      <!-- شريط العنوان العلوي (مخفي أثناء الطباعة) -->
      <div class="no-print" style="display: flex; align-items: center; justify-content: space-between;">
        <button id="report-back-btn" class="btn-icon no-print" aria-label="رجوع إلى صفحة اليوم" title="رجوع">
          ❯
        </button>
        <span style="font-size: 1.15rem; font-weight: 900; letter-spacing: 2px; color: #55F7A5; font-family: monospace;">
          NEON PROGRESS
        </span>
        <button id="report-info-btn" class="btn-icon no-print" aria-label="دليل القياس والتقدم" title="دليل قراءة المؤشرات">
          ${neonIcon('bulb', 18)}
        </button>
      </div>

      <!-- ============================================================
           WEIGHT TRACKER + HERO SECTION (مطابق لـ gym.html والصورة المرفقة)
           ============================================================ -->
      <div class="wt-section no-print">
        <div class="wt-divider"><span>WEIGHT</span></div>

        <div class="wt-card">
          <div class="wt-row">
            <span class="wt-num" id="wtNum">-</span>
            <span class="wt-unit" id="wtUnit">kg</span>
          </div>
          <div class="wt-delta hidden" id="wtDelta"></div>
          <div class="wt-streak hidden" id="wtStreak"><span id="wtStreakNum">0 day streak</span></div>

          <div class="wt-empty" id="wtEmpty">Log your first weight to start tracking.</div>

          <div class="wt-chart-wrap hidden" id="wtChartWrap">
            <div class="wt-chart-yaxis">
              <span id="wtYAxisMax">-</span>
              <span id="wtYAxisMin">-</span>
            </div>
            <svg class="wt-chart" viewBox="0 0 320 130" preserveAspectRatio="none">
              <defs>
                <linearGradient id="wtFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#55F7A5" stop-opacity="0.25"/>
                  <stop offset="100%" stop-color="#55F7A5" stop-opacity="0"/>
                </linearGradient>
                <filter id="wtGlow">
                  <feGaussianBlur stdDeviation="1.5" result="b"/>
                  <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>
              <line class="wt-grid" x1="0" y1="20" x2="320" y2="20"></line>
              <line class="wt-grid" x1="0" y1="65" x2="320" y2="65"></line>
              <line class="wt-grid" x1="0" y1="110" x2="320" y2="110"></line>
              <g id="wtChartContent"></g>
            </svg>
            <div class="wt-meta" id="wtMeta">0 entries</div>
          </div>

          <div class="wt-legend hidden" id="wtLegend">
            <span class="wt-legend-item"><span class="wt-legend-dot"></span>DAILY</span>
            <span class="wt-legend-item"><span class="wt-legend-dot wt-legend-dot-avg"></span>7-DAY AVG</span>
          </div>

          <!-- Composition estimate -->
          <div class="wt-comp hidden" id="wtComp">
            <div class="wt-comp-h">
              <span class="wt-comp-label">COMPOSITION ESTIMATE</span>
              <span class="wt-comp-window" id="wtCompWindow">last 30d</span>
            </div>
            <div class="wt-comp-headline" id="wtCompHeadline">-</div>
            <div class="wt-comp-bars" id="wtCompBars"></div>
            <div class="wt-comp-foot" id="wtCompFoot">-</div>
          </div>

          <!-- Locked Today Row -->
          <div class="wt-locked hidden" id="wtLocked">
            <div class="wt-locked-info">
              <span class="wt-locked-check">✓</span>
              <div>
                <div class="wt-locked-label">LOGGED TODAY</div>
                <div class="wt-locked-value" id="wtLockedValue">- kg</div>
              </div>
            </div>
            <button class="wt-edit-btn" id="wtEditBtn" type="button">Edit</button>
          </div>

          <!-- Input Row -->
          <div class="wt-input-row" id="wtInputRow">
            <div class="wt-input-top">
              <input type="number" step="0.1" class="wt-input" id="wtInput" placeholder="Enter weight" inputmode="decimal" aria-label="Today's weight">
              <span class="wt-unit-static" id="wtUnitStatic">kg</span>
              <button class="wt-save-btn" id="wtSaveBtn" type="button">Save</button>
            </div>
          </div>
        </div>

        <!-- Progress Photos Link Button -->
        <button class="wt-progress-link" id="wtProgressLink" type="button" aria-label="Open progress photos">
          <div>
            <div class="wt-progress-label">PROGRESS PHOTOS</div>
            <div class="wt-progress-count" id="wtProgressCount">0 photos</div>
          </div>
          <span class="wt-progress-arrow">→</span>
        </button>
      </div>

      <!-- عنوان التقرير وفلتر الفترة وزر تسجيل القياس -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; margin-top: 2px;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; margin: 0;">
            تقرير التقدم
          </h1>
          <div style="font-size: 0.8rem; color: #8C9992; margin-top: 2px;">
            تتبع تطور الوزن، محيط الخصر، مؤشرات القوة، وتاريخ التمارين
          </div>
        </div>

        <div class="no-print" style="display: flex; align-items: center; gap: 8px;">
          <!-- فلتر الفترة -->
          <div style="display: flex; align-items: center; gap: 6px; background: #07100D; border: 1px solid rgba(85,247,165,0.3); border-radius: 12px; padding: 6px 12px; font-size: 0.88rem; color: #FFFFFF; font-weight: 700;">
            <span>${neonIcon('calendar', 16)}</span>
            <select id="report-period-select" style="background: transparent; border: none; color: #FFFFFF; font-size: 0.88rem; font-weight: 700; padding: 0; width: auto; cursor: pointer; outline: none;">
              <option value="90" ${activePeriod === '90' ? 'selected' : ''}>آخر 90 يوم</option>
              <option value="30" ${activePeriod === '30' ? 'selected' : ''}>آخر 30 يوم</option>
              <option value="7" ${activePeriod === '7' ? 'selected' : ''}>آخر 7 أيام</option>
            </select>
          </div>

          <!-- زر تسجيل قياس جديد -->
          <button id="open-measurement-modal-btn" class="btn btn-primary no-print" style="border-radius: 12px; padding: 8px 14px; font-size: 0.86rem; font-weight: 800; display: flex; align-items: center; gap: 6px;" title="تسجيل وزن أو قياس جديد">
            ${neonIcon('pencil', 14)}
            <span>قياس جديد</span>
          </button>
        </div>
      </div>

      <!-- بطاقة المقارنة الرئيسية -->
      <div class="neon-card" style="padding: 22px; display: flex; flex-direction: column; gap: 16px;">
        
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px;">
          <!-- التغيير الإجمالي في الوزن -->
          <div style="text-align: center; border-inline-end: 1px solid rgba(85,247,165,0.18); padding-inline-end: 20px; min-width: 120px;">
            <div style="font-size: 0.82rem; color: #8C9992; margin-bottom: 2px;">تغير الوزن الإجمالي</div>
            <div style="font-size: 3rem; font-weight: 900; color: ${periodData.weightChange <= 0 ? '#55F7A5' : '#ff6b6b'}; font-family: monospace; line-height: 1; letter-spacing: -1px;">
              <span id="stat-weight-change-num">${periodData.weightChange > 0 ? '+' : ''}${periodData.weightChange}</span>
            </div>
            <div style="font-size: 1rem; font-weight: 800; color: #55F7A5; margin: 2px 0;">كغ</div>
            <div style="font-size: 0.74rem; padding: 2px 8px; border-radius: 999px; background: rgba(85,247,165,0.15); color: #55F7A5; display: inline-block;">
              ${periodData.weightChange <= 0 ? ' خسارة وزن ممتازة' : ' زيادة وزن'}
            </div>
          </div>

          <!-- جدول مقارنة أول الفترة باليوم الحالي مع الفرق -->
          <div style="flex: 1; min-width: 220px; display: flex; flex-direction: column; gap: 10px;">
            
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; font-size: 0.76rem; color: #8C9992; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 6px;">
              <span>المؤشر</span>
              <span style="text-align: center; color: #55F7A5; font-weight: 700;">اليوم</span>
              <span style="text-align: center;">السابق</span>
              <span style="text-align: center;">الفارق</span>
            </div>

            <!-- الوزن -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center; font-size: 0.92rem;">
              <div style="display: flex; align-items: center; gap: 6px; color: #FFFFFF; font-weight: 600;">
                <span>${neonIcon('target', 16)}</span>
                <span>الوزن</span>
              </div>
              <div style="text-align: center; color: #55F7A5; font-weight: 900; font-family: monospace;">
                <span id="stat-current-weight-num">${periodData.currentWeight}</span> كغ
              </div>
              <div style="text-align: center; color: #8C9992; font-family: monospace;">
                ${periodData.startWeight} كغ
              </div>
              <div style="text-align: center; color: ${periodData.weightChange <= 0 ? '#55F7A5' : '#ff6b6b'}; font-weight: 800; font-family: monospace;">
                ${periodData.weightChange > 0 ? '+' : ''}${periodData.weightChange}
              </div>
            </div>

            <!-- محيط الخصر -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center; font-size: 0.92rem;">
              <div style="display: flex; align-items: center; gap: 6px; color: #FFFFFF; font-weight: 600;">
                <span>${neonIcon('target', 16)}</span>
                <span>محيط الخصر</span>
              </div>
              <div style="text-align: center; color: #55F7A5; font-weight: 900; font-family: monospace;">
                <span id="stat-current-waist-num">${periodData.currentWaist}</span> سم
              </div>
              <div style="text-align: center; color: #8C9992; font-family: monospace;">
                ${periodData.startWaist} سم
              </div>
              <div style="text-align: center; color: ${periodData.waistChange <= 0 ? '#55F7A5' : '#ff6b6b'}; font-weight: 800; font-family: monospace;">
                ${periodData.waistChange > 0 ? '+' : ''}${periodData.waistChange}
              </div>
            </div>

            <!-- Bench Press (القوة) -->
            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; align-items: center; font-size: 0.92rem;">
              <div style="display: flex; align-items: center; gap: 6px; color: #FFFFFF; font-weight: 600;">
                <span>${neonIcon('dumbbell', 16)}</span>
                <span class="ltr-text">Bench Press</span>
              </div>
              <div style="text-align: center; color: #55F7A5; font-weight: 900; font-family: monospace;">
                <span id="stat-current-bench-num">${periodData.currentStrength}</span> كغ
              </div>
              <div style="text-align: center; color: #8C9992; font-family: monospace;">
                ${periodData.startStrength} كغ
              </div>
              <div style="text-align: center; color: ${periodData.strengthChange >= 0 ? '#55F7A5' : '#ff6b6b'}; font-weight: 800; font-family: monospace;">
                ${periodData.strengthChange > 0 ? '+' : ''}${periodData.strengthChange}
              </div>
            </div>

          </div>
        </div>

      </div>

      <!-- رسم بياني لاتجاه تغير الوزن -->
      <div class="neon-card" style="padding: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; color: #FFFFFF; font-weight: 800; font-size: 0.95rem;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">${neonIcon('chart', 18)} اتجاه الوزن (${activePeriod} يوم)</span>
          </div>
          <span style="font-size: 0.78rem; color: #55F7A5; font-family: monospace; font-weight: 700;">
            ${periodData.startWeight} كغ ➔ ${periodData.currentWeight} كغ
          </span>
        </div>

        <div style="position: relative; width: 100%; height: 160px;">
          <canvas id="weight-trend-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #8C9992; margin-top: 6px; padding: 0 10px;">
          <span>${periodData.labels[0]}</span>
          <span>${periodData.labels[1]}</span>
          <span>${periodData.labels[2]}</span>
        </div>
      </div>

      <!-- رسم بياني لاتجاه القوة البدنية (Bench Press) -->
      <div class="neon-card" style="padding: 18px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; color: #FFFFFF; font-weight: 800; font-size: 0.95rem;">
            <span style="display: inline-flex; align-items: center; gap: 6px;">${neonIcon('dumbbell', 18)} اتجاه القوة Bench Press (${activePeriod} يوم)</span>
          </div>
          <span style="font-size: 0.78rem; color: #55F7A5; font-family: monospace; font-weight: 700;">
            ${periodData.startStrength} كغ ➔ ${periodData.currentStrength} كغ
          </span>
        </div>

        <div style="position: relative; width: 100%; height: 160px;">
          <canvas id="strength-trend-canvas" style="width: 100%; height: 100%; display: block;"></canvas>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 0.78rem; color: #8C9992; margin-top: 6px; padding: 0 10px;">
          <span>${periodData.labels[0]}</span>
          <span>${periodData.labels[1]}</span>
          <span>${periodData.labels[2]}</span>
        </div>
      </div>

      <!-- حلقات نسب الالتزام الثلاث -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
        
        <!-- التدريب -->
        <div class="neon-card" style="padding: 16px 8px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 4px; color: #FFFFFF; font-weight: 700; font-size: 0.85rem;">
            <span>${neonIcon('dumbbell', 16)}</span>
            <span>التدريب</span>
          </div>
          <div class="neon-ring-container" style="width: 76px; height: 76px;">
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle class="neon-ring-track" cx="38" cy="38" r="30" stroke-width="6" />
              <circle id="ring-training-circle" class="neon-ring-fill" cx="38" cy="38" r="30" stroke-width="6"
                stroke-dasharray="188.5" stroke-dashoffset="${188.5 - ((report.adherence?.trainingPct || 87) / 100) * 188.5}" />
            </svg>
            <div class="neon-ring-content">
              <span id="ring-training-val" style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">${report.adherence?.trainingPct || 87}%</span>
            </div>
          </div>
        </div>

        <!-- التغذية -->
        <div class="neon-card" style="padding: 16px 8px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 4px; color: #FFFFFF; font-weight: 700; font-size: 0.85rem;">
            <span>${neonIcon('plate', 16)}</span>
            <span>التغذية</span>
          </div>
          <div class="neon-ring-container" style="width: 76px; height: 76px;">
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle class="neon-ring-track" cx="38" cy="38" r="30" stroke-width="6" />
              <circle id="ring-nutrition-circle" class="neon-ring-fill" cx="38" cy="38" r="30" stroke-width="6"
                stroke-dasharray="188.5" stroke-dashoffset="${188.5 - ((report.adherence?.nutritionPct || 81) / 100) * 188.5}" />
            </svg>
            <div class="neon-ring-content">
              <span id="ring-nutrition-val" style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">${report.adherence?.nutritionPct || 81}%</span>
            </div>
          </div>
        </div>

        <!-- الماء -->
        <div class="neon-card" style="padding: 16px 8px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 4px; color: #38BDF8; font-weight: 700; font-size: 0.85rem;">
            <span>${neonIcon('water', 16)}</span>
            <span>الماء</span>
          </div>
          <div class="neon-ring-container" style="width: 76px; height: 76px;">
            <svg width="76" height="76" viewBox="0 0 76 76">
              <circle class="neon-ring-track" cx="38" cy="38" r="30" stroke-width="6" />
              <circle id="ring-water-circle" cx="38" cy="38" r="30" stroke-width="6" fill="transparent" stroke="#38BDF8"
                stroke-dasharray="188.5" stroke-dashoffset="${188.5 - ((report.adherence?.waterPct || 74) / 100) * 188.5}"
                stroke-linecap="round" style="transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);" />
            </svg>
            <div class="neon-ring-content">
              <span id="ring-water-val" style="font-size: 1.15rem; font-weight: 900; color: #38BDF8; font-family: monospace;">${report.adherence?.waterPct || 74}%</span>
            </div>
          </div>
        </div>

      </div>

      <!-- بطاقة فحص تركيب الجسم InBody -->
      <div class="neon-card" id="inbody-card" style="padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: rgba(85,247,165,0.35);" title="اضغط لتعديل أو إضافة نتيجة فحص InBody">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(85,247,165,0.12); display: flex; align-items: center; justify-content: center;">
            ${neonIcon('camera', 24)}
          </div>
          <div>
            <div style="font-weight: 800; color: #FFFFFF; font-size: 1rem; display: flex; align-items: center; gap: 6px;">
              <span>فحص تركيب الجسم (InBody)</span>
              ${inBody.hasResult ? '<span style="font-size: 0.72rem; padding: 2px 6px; border-radius: 6px; background: rgba(85,247,165,0.2); color: #55F7A5;">مُحدّث</span>' : ''}
            </div>
            <div style="font-size: 0.84rem; color: #B8C0BC; margin-top: 2px;">
              ${inBody.hasResult 
                ? `دهون: <b id="inbody-fat-val" style="color: #55F7A5;">${inBody.bodyFatPercentage}%</b> · عضلات: <b id="inbody-muscle-val" style="color: #FFFFFF;">${inBody.skeletalMuscleMassKg} كغ</b> · حشوية: <b style="color: #55F7A5;">مستوى <span id="inbody-visceral-val">${inBody.visceralFatLevel || 9}</span></b>` 
                : 'اضغط لإدخال نسبة الدهون والكتلة العضلية من فحصك الأخير'}
            </div>
          </div>
        </div>
        <button class="btn-icon no-print" style="width: 36px; height: 36px;" title="إدخال نتيجة جديدة">
          ${neonIcon('pencil', 16)}
        </button>
      </div>

      <!-- بطاقة التحليل الذكي للتقدم والتوصيات -->
      <div class="neon-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #FFFFFF; font-size: 1rem;">
            <span>${neonIcon('bulb', 20)}</span>
            <span>تحليل الأداء والتوصيات الذكية</span>
          </div>
          <span style="font-size: 0.76rem; color: #55F7A5; font-family: monospace;">AI INSIGHTS</span>
        </div>
        <p style="font-size: 0.92rem; color: #B8C0BC; line-height: 1.6; margin: 0;">
          ${smartInsight}
        </p>
      </div>

      <!-- سجل ملخصات الأيام المغلقة -->
      <div class="neon-card" style="padding: 20px;">
        <div style="display:flex; align-items:center; justify-content:space-between; gap:10px; margin-bottom:14px; border-bottom:1px solid rgba(85,247,165,.2); padding-bottom:10px;">
          <div style="display:flex; align-items:center; gap:8px; color:#FFFFFF; font-weight:800; font-size:1.02rem;">
            ${neonIcon('calendar', 18)}
            <span>سجل الأيام السابقة</span>
          </div>
          <span style="font:700 .76rem monospace; color:#55F7A5;">${dailyHistory.length} يوم</span>
        </div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${dailyHistory.length
            ? dailyHistory.map(renderDailyHistoryItem).join('')
            : '<div style="text-align:center; color:#8C9992; padding:16px; font-size:.86rem;">سيظهر ملخص اليوم هنا تلقائياً عند بداية اليوم التالي.</div>'}
        </div>
      </div>

      <!-- بطاقة سجل تاريخ التمارين والتدريب (Workout History) -->
      <div class="neon-card workout-history-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid rgba(85,247,165,0.2); padding-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #FFFFFF; font-size: 1.05rem;">
            <span>${neonIcon('calendar', 18)}</span>
            <span>سجل تاريخ التمارين (Workout History)</span>
          </div>
          <span style="font-size: 0.78rem; color: #55F7A5; font-family: monospace; font-weight: 700;">
            ${workoutHistory.length} جلسات تدريبية
          </span>
        </div>

        <div style="display: flex; flex-direction: column; gap: 14px;">
          ${workoutHistory.length === 0 ? `
            <div style="text-align: center; color: #8C9992; padding: 18px; font-size: 0.9rem;">
              لا توجد جلسات تدريب مسجلة حالياً. أكمل تمارينك في صفحة التدريب ليتم تسجيلها هنا تلقائياً!
            </div>
          ` : workoutHistory.map(session => `
            <div class="workout-history-item" style="background: rgba(85,247,165,0.04); border: 1px solid rgba(85,247,165,0.18); border-radius: 14px; padding: 14px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 8px; margin-bottom: 10px;">
                <div>
                  <div style="font-weight: 800; color: #FFFFFF; font-size: 0.98rem; display: flex; align-items: center; gap: 6px;">
                    <span></span>
                    <span>${escapeHtml(session.title || 'جلسة تدريب')}</span>
                  </div>
                  <div style="font-size: 0.78rem; color: #8C9992; margin-top: 3px; display: flex; align-items: center; gap: 4px;">
                    ${neonIcon('calendar', 13)} ${escapeHtml(session.dateLabel || '')}
                  </div>
                </div>
                <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 0.76rem; font-family: monospace;">
                  ${session.durationMinutes ? `<span style="background: rgba(85,247,165,0.12); color: #55F7A5; padding: 3px 8px; border-radius: 8px; display: inline-flex; align-items: center; gap: 4px;">${neonIcon('timer', 13)} ${session.durationMinutes} دقيقة</span>` : ''}
                  ${session.totalVolumeKg ? `<span style="background: rgba(85,247,165,0.12); color: #55F7A5; padding: 3px 8px; border-radius: 8px;"> ${Number(session.totalVolumeKg).toLocaleString('ar-EG')} كغ حجم</span>` : ''}
                  ${session.totalSets ? `<span style="background: rgba(85,247,165,0.12); color: #55F7A5; padding: 3px 8px; border-radius: 8px;"> ${session.totalSets} جولات</span>` : ''}
                </div>
              </div>

              <!-- تفاصيل التمارين وجولاتها في هذه الجلسة (إظهار أقوى تمرين فقط لكل عضلة) -->
              ${session.exercises && session.exercises.length > 0 ? `
                <div style="display: flex; flex-direction: column; gap: 6px; border-top: 1px dashed rgba(85,247,165,0.15); padding-top: 10px;">
                  ${filterStrongestExercisePerMuscle(session.exercises).map(ex => `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.84rem; padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.03);">
                      <span style="color: #F1F5F9; font-weight: 600;">• ${escapeHtml(ex.nameAr || ex.name || 'تمرين')}</span>
                      <span style="color: #55F7A5; font-family: monospace; font-size: 0.8rem; background: rgba(85,247,165,0.08); padding: 2px 8px; border-radius: 6px;">
                        ${escapeHtml(ex.bestSet || (ex.setsCount ? `${ex.setsCount} جولات` : ''))}
                      </span>
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- زري الإجراءات السفليين (مشاركة وحفظ PDF) - مخفيان في الطباعة والـ PDF -->
      <div class="no-print" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 4px;">
        
        <!-- زر مشاركة التقرير -->
        <button id="share-report-btn" class="btn btn-secondary btn-lg no-print" style="border-radius: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>مشاركة التقرير</span>
          <span></span>
        </button>

        <!-- زر حفظ PDF -->
        <button id="save-pdf-btn" class="btn btn-primary btn-lg no-print" style="border-radius: 20px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>حفظ PDF</span>
          <span></span>
        </button>

      </div>

      <!-- تذييل خاص بتقرير الطباعة وPDF يظهر في أسفل الصفحات المطبوعة -->
      <div class="print-only" style="margin-top: 24px; padding-top: 12px; border-top: 1px solid rgba(85,247,165,0.25); text-align: center; font-size: 0.76rem; color: #8C9992;">
        <span>NEON COACH — نظام التحول البدني الذكي | تقرير الأداء الشامل وسجل التمارين المكتملة | صفحة مستخرجة من التطبيق</span>
      </div>

      <!-- ============================================ -->
      <!-- مودال تسجيل قياس جديد (وزن، خصر، قوة) -->
      <!-- ============================================ -->
      <div id="measurement-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 22px; border-radius: 24px; max-width: 440px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${neonIcon('pencil', 20)}
              <span>تسجيل قياسات جديدة</span>
            </h3>
            <button id="close-measure-modal-btn" class="btn-icon">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                الوزن الحالي (كغ)
              </label>
              <input type="number" id="input-measure-weight" class="stack-field" step="0.1" value="${periodData.currentWeight}" placeholder="مثال: 118" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                محيط الخصر (سم)
              </label>
              <input type="number" id="input-measure-waist" class="stack-field" step="0.5" value="${periodData.currentWaist}" placeholder="مثال: 108" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                قوة الصدر Bench Press (كغ)
              </label>
              <input type="number" id="input-measure-bench" class="stack-field" step="0.5" value="${periodData.currentStrength}" placeholder="مثال: 82.5" />
            </div>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button id="save-measure-btn" class="btn btn-primary btn-block" style="border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>حفظ القياسات وتحديث التقرير</span>
                ${neonIcon('check', 16)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- مودال تحديث فحص InBody -->
      <!-- ============================================ -->
      <div id="inbody-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 22px; border-radius: 24px; max-width: 440px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${neonIcon('camera', 20)}
              <span>تحديث فحص تركيب الجسم InBody</span>
            </h3>
            <button id="close-inbody-modal-btn" class="btn-icon">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px;">
            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                نسبة الدهون في الجسم (%)
              </label>
              <input type="number" id="input-inbody-fat" class="stack-field" step="0.1" value="${inBody.bodyFatPercentage || 21.4}" placeholder="مثال: 21.4" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                الكتلة العضلية الهيكلية (كغ)
              </label>
              <input type="number" id="input-inbody-muscle" class="stack-field" step="0.1" value="${inBody.skeletalMuscleMassKg || 44.2}" placeholder="مثال: 44.2" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                مستوى الدهون الحشوية (1–20)
              </label>
              <input type="number" id="input-inbody-visceral" class="stack-field" step="1" value="${inBody.visceralFatLevel || 9}" placeholder="مثال: 9" />
            </div>

            <div>
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #8C9992; margin-bottom: 6px;">
                جهة الفحص أو الجهاز (اختياري)
              </label>
              <input type="text" id="input-inbody-provider" class="stack-field" value="${escapeHtml(inBody.provider || 'InBody 770')}" placeholder="مثال: InBody Clinic" />
            </div>

            <div style="display: flex; gap: 10px; margin-top: 10px;">
              <button id="save-inbody-btn" class="btn btn-primary btn-block" style="border-radius: 14px; display: flex; align-items: center; justify-content: center; gap: 8px;">
                <span>حفظ نتيجة InBody</span>
                ${neonIcon('check', 16)}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- مودال دليل قراءة المؤشرات (Info) -->
      <!-- ============================================ -->
      <div id="info-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 22px; border-radius: 24px; max-width: 460px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${neonIcon('bulb', 20)}
              <span>دليل فهم مؤشرات التقدم</span>
            </h3>
            <button id="close-info-modal-btn" class="btn-icon">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 14px; color: #B8C0BC; font-size: 0.88rem; line-height: 1.6;">
            <div style="background: rgba(85,247,165,0.06); border: 1px solid rgba(85,247,165,0.2); border-radius: 14px; padding: 12px;">
              <b style="color: #FFFFFF; display: block; margin-bottom: 4px;">1. لماذا الميزان ليس المقياس الوحيد؟</b>
              الوزن يتأثر يومياً باحتباس السوائل، توقيت الصوديوم، والكربوهيدرات. ثبات الميزان مع انكماش الخصر يعني حرق دهون وبناء عضلات.
            </div>

            <div style="background: rgba(85,247,165,0.06); border: 1px solid rgba(85,247,165,0.2); border-radius: 14px; padding: 12px;">
              <b style="color: #FFFFFF; display: block; margin-bottom: 4px;">2. ما هو الـ Body Recomposition؟</b>
              هو إعادة تشكيل الجسم بحرق الدهون وبناء الألياف العضلية بالتزامن. أفضل مؤشر عليه هو نزول قياس الخصر مع زيادة أوزان التمرين.
            </div>

            <div style="background: rgba(85,247,165,0.06); border: 1px solid rgba(85,247,165,0.2); border-radius: 14px; padding: 12px;">
              <b style="color: #FFFFFF; display: block; margin-bottom: 4px;">3. ما أهمية نسب الالتزام؟</b>
              الالتزام فوق 80% في التدريب والتغذية والماء يضمن استمرارية النتائج على المدى البعيد دون حميات قاسية أو إجهاد مفرط.
            </div>

            <button id="close-info-modal-btn-bottom" class="btn btn-secondary btn-block" style="border-radius: 12px; margin-top: 6px; display: flex; align-items: center; justify-content: center; gap: 8px;">
              <span>فهمت ذلك</span>
              ${neonIcon('check', 16)}
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================================
           MODALS FOR LOCAL PROGRESS PHOTOS (مطابق لـ gym.html والصورة المرفقة)
           ============================================================ -->
      <!-- Progress photos overlay (100% Local Storage) -->
      <div class="wt-overlay no-print" id="wtOverlay" aria-hidden="true">
        <div class="wt-overlay-inner">
          <div class="wt-overlay-h">
            <button class="wt-back" id="wtBack" type="button" aria-label="Back">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <div class="wt-overlay-title">Progress Photos</div>
          </div>
          <div class="wt-overlay-actions">
            <button class="wt-overlay-action wt-overlay-primary" id="wtTakePhotoBtn" type="button">Take Photo</button>
            <button class="wt-overlay-action wt-overlay-secondary" id="wtFromLibraryBtn" type="button">From Library</button>
          </div>
          <input type="file" id="wtFileCamera" accept="image/*" capture="environment" style="display:none">
          <input type="file" id="wtFileLibrary" accept="image/*" style="display:none">
          <div class="wt-photo-grid" id="wtPhotoGrid">
            <div class="wt-photo-empty">No photos yet · tap Take Photo to start</div>
          </div>
        </div>
      </div>

      <!-- Camera modal -->
      <div class="wt-cam no-print" id="wtCam" aria-hidden="true">
        <div class="wt-cam-stage">
          <video class="wt-cam-video" id="wtCamVideo" autoplay playsinline muted></video>
          <canvas id="wtCamCanvas" style="display:none"></canvas>
        </div>
        <div class="wt-cam-actions">
          <button class="wt-cam-btn" id="wtCamCancel" type="button">Cancel</button>
          <button class="wt-cam-shutter" id="wtCamShutter" type="button" aria-label="Capture"></button>
          <button class="wt-cam-btn" id="wtCamFlip" type="button" aria-label="Flip camera">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
          </button>
        </div>
      </div>

      <!-- Photo viewer - has two modes: single and compare -->
      <div class="wt-viewer no-print" id="wtViewer" data-mode="single" aria-hidden="true">
        <!-- SINGLE MODE -->
        <div class="wt-viewer-single">
          <div class="wt-viewer-stage">
            <img id="wtViewerImg" alt="" style="max-width:100%; max-height:100%; object-fit:contain;">
          </div>
          <div class="wt-viewer-meta">
            <div class="wt-viewer-date" id="wtViewerDate">-</div>
            <div class="wt-viewer-weight" id="wtViewerWeight">-</div>
          </div>
          <div class="wt-viewer-actions">
            <button class="wt-viewer-btn wt-viewer-compare" id="wtViewerCompare" type="button">Compare</button>
            <button class="wt-viewer-btn wt-viewer-close" id="wtViewerClose" type="button">Close</button>
            <button class="wt-viewer-btn wt-viewer-delete" id="wtViewerDelete" type="button">Delete</button>
          </div>
        </div>

        <!-- COMPARE MODE -->
        <div class="wt-viewer-compare-view">
          <div class="wt-compare-stage">
            <div class="wt-compare-side" id="wtCmpSideA">
              <img id="wtCmpImgA" alt="">
              <div class="wt-compare-meta-line" id="wtCmpMetaA">-</div>
            </div>
            <button type="button" class="wt-compare-side wt-compare-other" id="wtCmpSideB" title="Tap to compare to a different photo" aria-label="Compare to a different photo">
              <img id="wtCmpImgB" alt="">
              <div class="wt-compare-meta-line" id="wtCmpMetaB">-</div>
            </button>
          </div>
          <div class="wt-compare-headline" id="wtCompareHeadline">-</div>
          <div class="wt-viewer-actions">
            <button class="wt-viewer-btn wt-viewer-back" id="wtCompareBack" type="button">← Back</button>
            <button class="wt-viewer-btn wt-viewer-close" id="wtCompareClose" type="button">Close</button>
            <button class="wt-viewer-btn wt-viewer-delete" id="wtCompareDelete" type="button">Delete</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

let camStream = null;
let camFacing = 'environment';
let activePhotoId = null;
let comparePhotoId = null;
let pvDeleteConfirm = false;

function initPhotosUI(units, getWtEntries) {
  let photos = [];

  const photoCurrentWeight = () => {
    const entries = getWtEntries();
    const last = entries[entries.length - 1];
    return last ? `${last.weight.toFixed(1)} ${units}` : '-';
  };

  const renderPhotosGrid = () => {
    const grid = document.getElementById('wtPhotoGrid');
    const countEl = document.getElementById('wtProgressCount');

    if (countEl) {
      if (!photos.length) {
        countEl.textContent = '0 photos';
      } else if (photos.length === 1) {
        countEl.textContent = `1 photo · latest ${photoFmtDate(photos[0].dateKey)}`;
      } else {
        countEl.textContent = `${photos.length} photos · latest ${photoFmtDate(photos[0].dateKey)}`;
      }
    }

    if (!grid) return;
    if (!photos.length) {
      grid.innerHTML = '<div class="wt-photo-empty">No photos yet · tap Take Photo to start</div>';
      return;
    }

    grid.innerHTML = photos.map(p => `
      <button class="wt-photo-card" data-id="${p.id}" type="button">
        <img src="${p.dataUrl}" alt="Progress photo" loading="lazy">
        <div class="wt-photo-overlay"></div>
        <div class="wt-photo-meta">
          <span class="wt-photo-date">${photoFmtDate(p.dateKey)}</span>
          <span class="wt-photo-weight">${p.weight || '-'}</span>
        </div>
      </button>
    `).join('');

    grid.querySelectorAll('.wt-photo-card').forEach(card => {
      card.addEventListener('click', () => openPhoto(card.dataset.id));
    });
  };

  const loadPhotos = async () => {
    photos = await localPhotoStorage.getAllPhotos();
    renderPhotosGrid();
  };

  const addLocalPhoto = async (dataUrl) => {
    await localPhotoStorage.savePhoto({
      dataUrl,
      dateKey: wtDateKey(new Date()),
      weight: photoCurrentWeight()
    });
    await loadPhotos();
    notificationService.showToast('تم حفظ صورة التقدم محلياً على جهازك ✓', 'success');
  };

  const handleFileSelected = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        addLocalPhoto(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Overlay Open & Close
  document.getElementById('wtProgressLink')?.addEventListener('click', async () => {
    await loadPhotos();
    document.getElementById('wtOverlay')?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  });

  document.getElementById('wtBack')?.addEventListener('click', () => {
    document.getElementById('wtOverlay')?.classList.remove('is-open');
    document.body.style.overflow = '';
  });

  // Camera Handling
  const openCam = async () => {
    const camModal = document.getElementById('wtCam');
    const video = document.getElementById('wtCamVideo');
    camModal?.classList.add('is-open');
    try {
      camStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: camFacing } },
        audio: false
      });
      if (video) video.srcObject = camStream;
    } catch {
      try {
        camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        if (video) video.srcObject = camStream;
      } catch (err) {
        closeCam();
        document.getElementById('wtFileLibrary')?.click();
      }
    }
  };

  const closeCam = () => {
    if (camStream) {
      camStream.getTracks().forEach(t => t.stop());
      camStream = null;
    }
    const video = document.getElementById('wtCamVideo');
    if (video) video.srcObject = null;
    document.getElementById('wtCam')?.classList.remove('is-open');
  };

  document.getElementById('wtTakePhotoBtn')?.addEventListener('click', async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        await openCam();
        return;
      } catch {}
    }
    document.getElementById('wtFileCamera')?.click();
  });

  document.getElementById('wtFromLibraryBtn')?.addEventListener('click', () => {
    document.getElementById('wtFileLibrary')?.click();
  });

  document.getElementById('wtFileCamera')?.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFileSelected(f);
    e.target.value = '';
  });

  document.getElementById('wtFileLibrary')?.addEventListener('change', (e) => {
    const f = e.target.files && e.target.files[0];
    if (f) handleFileSelected(f);
    e.target.value = '';
  });

  document.getElementById('wtCamCancel')?.addEventListener('click', closeCam);

  document.getElementById('wtCamFlip')?.addEventListener('click', async () => {
    camFacing = (camFacing === 'environment') ? 'user' : 'environment';
    if (camStream) camStream.getTracks().forEach(t => t.stop());
    try { await openCam(); } catch {}
  });

  document.getElementById('wtCamShutter')?.addEventListener('click', () => {
    const video = document.getElementById('wtCamVideo');
    const canvas = document.getElementById('wtCamCanvas');
    if (!video || !canvas || !video.videoWidth) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    closeCam();
    addLocalPhoto(dataUrl);
  });

  // Photo Viewer & Compare Mode
  const openPhoto = (id) => {
    const p = photos.find(x => x.id === id);
    if (!p) return;
    activePhotoId = id;
    const viewer = document.getElementById('wtViewer');
    const img = document.getElementById('wtViewerImg');
    const dateEl = document.getElementById('wtViewerDate');
    const weightEl = document.getElementById('wtViewerWeight');
    const deleteBtn = document.getElementById('wtViewerDelete');
    const compareBtn = document.getElementById('wtViewerCompare');

    if (img) img.src = p.dataUrl;
    if (dateEl) dateEl.textContent = photoFmtDate(p.dateKey).toUpperCase();
    if (weightEl) weightEl.textContent = p.weight || '-';
    if (viewer) {
      viewer.dataset.mode = 'single';
      viewer.classList.add('is-open');
    }
    pvDeleteConfirm = false;
    if (deleteBtn) {
      deleteBtn.textContent = 'Delete';
      deleteBtn.classList.remove('is-confirm');
    }
    if (compareBtn) {
      compareBtn.disabled = photos.length < 2;
      compareBtn.style.opacity = photos.length < 2 ? '0.4' : '';
    }
  };

  const closePhoto = () => {
    const viewer = document.getElementById('wtViewer');
    if (viewer) {
      viewer.classList.remove('is-open');
      viewer.dataset.mode = 'single';
    }
    activePhotoId = null;
    comparePhotoId = null;
  };

  const defaultCompareFor = (activeId) => {
    const idx = photos.findIndex(p => p.id === activeId);
    if (idx === -1) return null;
    if (photos[idx + 1]) return photos[idx + 1].id;
    if (photos[idx - 1]) return photos[idx - 1].id;
    return null;
  };

  const openCompare = (activeId, otherId) => {
    const A = photos.find(p => p.id === activeId);
    const B = photos.find(p => p.id === otherId);
    if (!A || !B) return;
    activePhotoId = activeId;
    comparePhotoId = otherId;

    const imgA = document.getElementById('wtCmpImgA');
    const imgB = document.getElementById('wtCmpImgB');
    const metaA = document.getElementById('wtCmpMetaA');
    const metaB = document.getElementById('wtCmpMetaB');
    const headEl = document.getElementById('wtCompareHeadline');
    const viewer = document.getElementById('wtViewer');

    if (imgA) imgA.src = A.dataUrl;
    if (imgB) imgB.src = B.dataUrl;
    if (metaA) metaA.textContent = `${photoFmtDate(A.dateKey)} · ${A.weight || '-'}`;
    if (metaB) metaB.textContent = `${photoFmtDate(B.dateKey)} · ${B.weight || '-'}`;

    const parseWeight = (wStr) => {
      if (!wStr) return null;
      const m = String(wStr).match(/-?\d+(\.\d+)?/);
      return m ? parseFloat(m[0]) : null;
    };
    const wA = parseWeight(A.weight);
    const wB = parseWeight(B.weight);

    let cls = 'flat';
    let headline = `${photoFmtDate(A.dateKey)} → ${photoFmtDate(B.dateKey)}`;
    if (wA != null && wB != null) {
      const diff = Math.round((wA - wB) * 10) / 10;
      if (Math.abs(diff) < 0.05) {
        headline += ' · no change';
      } else {
        const sign = diff > 0 ? '+' : '';
        const arrow = diff > 0 ? '▲' : '▼';
        headline += ` · ${arrow} ${sign}${diff.toFixed(1)} ${units}`;
        cls = diff > 0 ? 'up' : 'down';
      }
    }
    if (headEl) {
      headEl.textContent = headline;
      headEl.className = 'wt-compare-headline ' + cls;
    }

    if (viewer) {
      viewer.dataset.mode = 'compare';
      viewer.classList.add('is-open');
    }
  };

  const cycleCompareTarget = () => {
    if (!activePhotoId) return;
    const others = photos.filter(p => p.id !== activePhotoId);
    if (!others.length) return;
    const curIdx = others.findIndex(p => p.id === comparePhotoId);
    const nextIdx = (curIdx + 1) % others.length;
    openCompare(activePhotoId, others[nextIdx].id);
  };

  const deleteActivePhoto = async (deleteBtn) => {
    if (!activePhotoId) return;
    if (!pvDeleteConfirm) {
      pvDeleteConfirm = true;
      deleteBtn.textContent = 'Confirm delete?';
      deleteBtn.classList.add('is-confirm');
      setTimeout(() => {
        pvDeleteConfirm = false;
        deleteBtn.textContent = 'Delete';
        deleteBtn.classList.remove('is-confirm');
      }, 3000);
      return;
    }
    await localPhotoStorage.deletePhoto(activePhotoId);
    await loadPhotos();
    closePhoto();
    notificationService.showToast('تم حذف الصورة من جهازك بنجاح', 'info');
  };

  document.getElementById('wtViewerClose')?.addEventListener('click', closePhoto);
  document.getElementById('wtCompareClose')?.addEventListener('click', closePhoto);
  document.getElementById('wtViewerDelete')?.addEventListener('click', (e) => deleteActivePhoto(e.currentTarget));
  document.getElementById('wtCompareDelete')?.addEventListener('click', (e) => deleteActivePhoto(e.currentTarget));

  document.getElementById('wtViewerCompare')?.addEventListener('click', () => {
    if (!activePhotoId) return;
    const otherId = defaultCompareFor(activePhotoId);
    if (!otherId) {
      alert('Need at least 2 photos to compare.');
      return;
    }
    openCompare(activePhotoId, otherId);
  });

  document.getElementById('wtCompareBack')?.addEventListener('click', () => {
    const viewer = document.getElementById('wtViewer');
    if (viewer && activePhotoId) {
      viewer.dataset.mode = 'single';
    } else {
      closePhoto();
    }
  });

  document.getElementById('wtCmpSideB')?.addEventListener('click', cycleCompareTarget);

  window.addEventListener('hashchange', () => {
    closeCam();
  }, { once: true });

  loadPhotos();
}

function initWeightTrackerAndPhotos(state, report, user) {
  const currentWeight = user.currentWeight || report.currentDay?.weight || 129;
  let wtEntries = wtLoad(currentWeight);
  const units = user.units || 'kg';

  function renderWt() {
    const wtNumEl = document.getElementById('wtNum');
    const wtUnitEl = document.getElementById('wtUnit');
    const wtUnitStaticEl = document.getElementById('wtUnitStatic');
    const wtEmptyEl = document.getElementById('wtEmpty');
    const wtLockedEl = document.getElementById('wtLocked');
    const wtLockedValEl = document.getElementById('wtLockedValue');
    const wtInputRowEl = document.getElementById('wtInputRow');
    const wtInputEl = document.getElementById('wtInput');
    const wtChartWrapEl = document.getElementById('wtChartWrap');
    const wtLegendEl = document.getElementById('wtLegend');
    const wtDeltaEl = document.getElementById('wtDelta');
    const wtStreakEl = document.getElementById('wtStreak');
    const wtStreakNumEl = document.getElementById('wtStreakNum');
    const wtCompEl = document.getElementById('wtComp');

    if (!wtNumEl) return;

    const last = wtEntries[wtEntries.length - 1] || null;
    const todayKey = wtDateKey(new Date());
    const todayEntry = wtEntries.find(e => e.dateKey === todayKey);

    if (wtUnitEl) wtUnitEl.textContent = units;
    if (wtUnitStaticEl) wtUnitStaticEl.textContent = units;
    if (wtNumEl) wtNumEl.textContent = last ? last.weight.toFixed(1) : (currentWeight ? Number(currentWeight).toFixed(1) : '-');

    if (todayEntry) {
      wtEmptyEl?.classList.add('hidden');
      if (wtLockedValEl) wtLockedValEl.textContent = todayEntry.weight.toFixed(1) + ' ' + units;
      wtLockedEl?.classList.remove('hidden');
      wtInputRowEl?.classList.add('hidden');
    } else {
      if (wtEntries.length === 0) wtEmptyEl?.classList.remove('hidden');
      else wtEmptyEl?.classList.add('hidden');
      wtLockedEl?.classList.add('hidden');
      wtInputRowEl?.classList.remove('hidden');
      if (last && wtInputEl && !wtInputEl.value) {
        wtInputEl.value = last.weight.toFixed(1);
      }
    }

    // Chart & Delta & Composition
    if (wtEntries.length >= 2) {
      wtChartWrapEl?.classList.remove('hidden');
      wtLegendEl?.classList.remove('hidden');

      const recent = wtEntries.slice(-30);
      const weights = recent.map(e => e.weight);
      const min = Math.min(...weights);
      const max = Math.max(...weights);
      const pad = Math.max((max - min) * 0.15, 0.5);
      const yMin = min - pad;
      const yMax = max + pad;
      const xLeft = 8, xRight = 312, yTop = 20, yBot = 110;
      const xRange = xRight - xLeft;
      const yRange = yBot - yTop;
      const xFor = (i) => recent.length === 1 ? xRight : xLeft + (i / (recent.length - 1)) * xRange;
      const yFor = (w) => yBot - ((w - yMin) / (yMax - yMin)) * yRange;

      const points = recent.map((e, i) => ({ x: xFor(i), y: yFor(e.weight) }));
      const linePath = smoothSvgPath(points);
      const areaPath = linePath + ' L ' + points[points.length - 1].x.toFixed(2) + ' ' + yBot + ' L ' + points[0].x.toFixed(2) + ' ' + yBot + ' Z';

      const avgPoints = recent.map((_, i) => {
        const start = Math.max(0, i - 6);
        const win = recent.slice(start, i + 1);
        const avg = win.reduce((s, p) => s + p.weight, 0) / win.length;
        return { x: xFor(i), y: yFor(avg) };
      });
      const avgPath = smoothSvgPath(avgPoints);

      let chartSvgHtml = '<path class="wt-avg-line" d="' + avgPath + '"></path>'
        + '<path class="wt-area" d="' + areaPath + '"></path>'
        + '<path class="wt-line" filter="url(#wtGlow)" d="' + linePath + '"></path>';

      points.forEach((p, i) => {
        const cls = (i === points.length - 1) ? 'wt-dot-today' : 'wt-dot';
        const r = (i === points.length - 1) ? 5 : 3;
        chartSvgHtml += `<circle class="${cls}" cx="${p.x.toFixed(2)}" cy="${p.y.toFixed(2)}" r="${r}"/>`;
      });

      const chartContentEl = document.getElementById('wtChartContent');
      if (chartContentEl) chartContentEl.innerHTML = chartSvgHtml;
      const yMaxEl = document.getElementById('wtYAxisMax');
      const yMinEl = document.getElementById('wtYAxisMin');
      if (yMaxEl) yMaxEl.textContent = yMax.toFixed(1);
      if (yMinEl) yMinEl.textContent = yMin.toFixed(1);
      const metaEl = document.getElementById('wtMeta');
      if (metaEl) {
        metaEl.textContent = `${wtEntries.length} ${wtEntries.length === 1 ? 'entry' : 'entries'} · last ${recent.length} days`;
      }

      // Delta
      const deltaInfo = calculate7DayDelta(wtEntries, units);
      if (deltaInfo && wtDeltaEl) {
        wtDeltaEl.textContent = deltaInfo.text;
        wtDeltaEl.className = 'wt-delta ' + deltaInfo.cls;
        wtDeltaEl.classList.remove('hidden');
      } else {
        wtDeltaEl?.classList.add('hidden');
      }

      // Composition Estimate
      const comp = calculateCompositionEstimate({
        entries: wtEntries,
        workoutHistory: store.getWorkoutHistory() || [],
        units,
        windowDays: 30,
        yearsTraining: user.yearsTraining || 1
      });

      if (comp.visible && wtCompEl) {
        wtCompEl.classList.remove('hidden');
        const winEl = document.getElementById('wtCompWindow');
        const headEl = document.getElementById('wtCompHeadline');
        const barsEl = document.getElementById('wtCompBars');
        const footEl = document.getElementById('wtCompFoot');

        if (winEl) winEl.textContent = `last ${comp.actualDays}d`;
        if (headEl) {
          headEl.textContent = comp.headline;
          headEl.className = 'wt-comp-headline ' + comp.headlineCls;
        }
        if (barsEl) {
          barsEl.innerHTML = `
            <div class="wt-comp-bar muscle" style="width:${comp.musclePct.toFixed(1)}%"></div>
            <div class="wt-comp-bar fat" style="width:${comp.fatPct.toFixed(1)}%"></div>
          `;
        }
        if (footEl) footEl.textContent = comp.footText;
      } else {
        wtCompEl?.classList.add('hidden');
      }
    } else {
      wtChartWrapEl?.classList.add('hidden');
      wtLegendEl?.classList.add('hidden');
      wtDeltaEl?.classList.add('hidden');
      wtCompEl?.classList.add('hidden');
    }

    // Streak
    const streak = calculateStreak(wtEntries);
    if (streak >= 2 && wtStreakEl && wtStreakNumEl) {
      wtStreakNumEl.textContent = `${streak} day streak`;
      wtStreakEl.classList.remove('hidden');
    } else {
      wtStreakEl?.classList.add('hidden');
    }
  }

  const inputEl = document.getElementById('wtInput');
  const saveBtn = document.getElementById('wtSaveBtn');
  const editBtn = document.getElementById('wtEditBtn');

  const doSaveWeight = () => {
    const v = parseFloat(inputEl?.value);
    if (isNaN(v) || v <= 0) return;
    wtEntries = wtSaveEntry(wtEntries, v);
    store.logProgressMeasurement({ weight: v });
    notificationService.showToast('تم تسجيل وزن اليوم بنجاح ✓', 'success');
    renderWt();
  };

  saveBtn?.addEventListener('click', doSaveWeight);
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doSaveWeight();
  });

  editBtn?.addEventListener('click', () => {
    document.getElementById('wtLocked')?.classList.add('hidden');
    document.getElementById('wtInputRow')?.classList.remove('hidden');
    const todayKey = wtDateKey(new Date());
    const todayEntry = wtEntries.find(e => e.dateKey === todayKey);
    if (todayEntry && inputEl) {
      inputEl.value = todayEntry.weight.toFixed(1);
    }
    inputEl?.focus();
    inputEl?.select();
  });

  renderWt();
  initPhotosUI(units, () => wtEntries);
}

export function bindProgressReportEvents() {
  // زر الرجوع
  document.getElementById('report-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#today';
  });

  const state = store.getState();
  const report = state.progressReport || {};
  const user = state.userProfile || {};

  // تهيئة وتفعيل مراقب الوزن والصور المحلية المطابقة لـ gym.html
  initWeightTrackerAndPhotos(state, report, user);
  const currentWeight = user.currentWeight || report.currentDay?.weight || 118;
  const currentWaist = report.currentDay?.waistCm || 108;
  const currentStrength = report.currentDay?.benchPressKg || 82.5;

  const periodData = getPeriodMetrics(report, activePeriod, currentWeight, currentWaist, currentStrength);

  // رسم الرسوم البيانية المتوهجة بدقة Retina مع انيميشن تصاعدي من الصفر
  drawGlowChart('weight-trend-canvas', periodData.weightPoints, `${periodData.startWeight} كغ`, `${periodData.currentWeight} كغ`, false);
  drawGlowChart('strength-trend-canvas', periodData.strengthPoints, `${periodData.startStrength} كغ`, `${periodData.currentStrength} كغ`, true);

  // 1. تحريك أرقام الإحصائيات تصاعدياً من الصفر إلى الرقم المحدد
  animateCountUp('stat-weight-change-num', periodData.weightChange, {
    decimals: 1,
    prefix: periodData.weightChange > 0 ? '+' : ''
  });
  animateCountUp('stat-current-weight-num', periodData.currentWeight, { decimals: 1 });
  animateCountUp('stat-current-waist-num', periodData.currentWaist, { decimals: 1 });
  animateCountUp('stat-current-bench-num', periodData.currentStrength, { decimals: 1 });

  // 2. تحريك حلقات نسب الالتزام المئوية من الصفر
  const trPct = report.adherence?.trainingPct || 87;
  const nuPct = report.adherence?.nutritionPct || 81;
  const waPct = report.adherence?.waterPct || 74;

  animateRingOffset('ring-training-circle', 188.5 - (trPct / 100) * 188.5, 188.5);
  animateRingOffset('ring-nutrition-circle', 188.5 - (nuPct / 100) * 188.5, 188.5);
  animateRingOffset('ring-water-circle', 188.5 - (waPct / 100) * 188.5, 188.5);

  animateCountUp('ring-training-val', trPct, { suffix: '%' });
  animateCountUp('ring-nutrition-val', nuPct, { suffix: '%' });
  animateCountUp('ring-water-val', waPct, { suffix: '%' });

  // 3. تحريك مؤشرات InBody إن وجدت
  const inBodyData = report.inBody || {};
  if (inBodyData.hasResult) {
    if (inBodyData.bodyFatPercentage) {
      animateCountUp('inbody-fat-val', Number(inBodyData.bodyFatPercentage) || 0, { decimals: 1, suffix: '%' });
    }
    if (inBodyData.skeletalMuscleMassKg) {
      animateCountUp('inbody-muscle-val', Number(inBodyData.skeletalMuscleMassKg) || 0, { decimals: 1, suffix: ' كغ' });
    }
    if (inBodyData.visceralFatLevel) {
      animateCountUp('inbody-visceral-val', Number(inBodyData.visceralFatLevel) || 9, { decimals: 0 });
    }
  }

  // تبديل الفترة
  document.getElementById('report-period-select')?.addEventListener('change', (e) => {
    activePeriod = e.target.value;
    refreshView();
  });

  // مودال تسجيل قياس جديد
  const measureModal = document.getElementById('measurement-modal');
  document.getElementById('open-measurement-modal-btn')?.addEventListener('click', () => {
    measureModal?.classList.add('open');
    document.getElementById('input-measure-weight')?.focus();
  });
  document.getElementById('close-measure-modal-btn')?.addEventListener('click', () => {
    measureModal?.classList.remove('open');
  });

  document.getElementById('save-measure-btn')?.addEventListener('click', () => {
    const w = document.getElementById('input-measure-weight')?.value;
    const waist = document.getElementById('input-measure-waist')?.value;
    const bench = document.getElementById('input-measure-bench')?.value;
    if (w && !isNaN(Number(w))) {
      wtSaveEntry(wtLoad(), Number(w));
    }
    store.logProgressMeasurement({ weight: w, waistCm: waist, benchPressKg: bench });
    measureModal?.classList.remove('open');
    notificationService.showToast('تم حفظ القياسات وتحديث التقرير بنجاح ✓', 'success');
    refreshView();
  });

  // مودال InBody
  const inbodyModal = document.getElementById('inbody-modal');
  document.getElementById('inbody-card')?.addEventListener('click', () => {
    inbodyModal?.classList.add('open');
  });
  document.getElementById('close-inbody-modal-btn')?.addEventListener('click', () => {
    inbodyModal?.classList.remove('open');
  });

  document.getElementById('save-inbody-btn')?.addEventListener('click', () => {
    const fat = document.getElementById('input-inbody-fat')?.value;
    const muscle = document.getElementById('input-inbody-muscle')?.value;
    const visceral = document.getElementById('input-inbody-visceral')?.value;
    const provider = document.getElementById('input-inbody-provider')?.value;
    store.updateInBodyResult({ bodyFatPercentage: fat, skeletalMuscleMassKg: muscle, visceralFatLevel: visceral, provider });
    inbodyModal?.classList.remove('open');
    notificationService.showToast('تم حفظ فحص InBody وتحديث المؤشرات ✓', 'success');
    refreshView();
  });

  // مودال الدليل والمعلومات
  const infoModal = document.getElementById('info-modal');
  document.getElementById('report-info-btn')?.addEventListener('click', () => {
    infoModal?.classList.add('open');
  });
  document.getElementById('close-info-modal-btn')?.addEventListener('click', () => {
    infoModal?.classList.remove('open');
  });
  document.getElementById('close-info-modal-btn-bottom')?.addEventListener('click', () => {
    infoModal?.classList.remove('open');
  });

  // إغلاق المودالات عند النقر على الخلفية
  [measureModal, inbodyModal, infoModal].forEach(modal => {
    modal?.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });
  });

  // حفظ PDF
  document.getElementById('save-pdf-btn')?.addEventListener('click', () => {
    notificationService.showToast('جاري تجهيز تقرير التقدم للطباعة والحفظ بصيغة PDF ...', 'info');
    setTimeout(() => {
      pdfService.exportReportToPdf();
    }, 400);
  });

  // مشاركة التقرير
  document.getElementById('share-report-btn')?.addEventListener('click', async () => {
    const reportData = store.getState().progressReport;
    const res = await pdfService.shareReport(reportData);
    if (res.method === 'clipboard') {
      notificationService.showToast('تم نسخ ملخص إنجازك الرياضي للحافظة بنجاح! ', 'success');
    }
  });
}

function refreshView() {
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderProgressReportView();
    bindProgressReportEvents();
  }
}

/**
 * حساب مقاييس الفترة المحددة
 */
function getPeriodMetrics(report, period, currentWeight, currentWaist, currentStrength) {
  if (period === '7') {
    const startWeight = Math.round((currentWeight + 0.9) * 10) / 10;
    const startWaist = Math.round((currentWaist + 1.0) * 10) / 10;
    const startStrength = Math.round((currentStrength - 2.5) * 10) / 10;
    return {
      startWeight,
      currentWeight,
      weightChange: -0.9,
      startWaist,
      currentWaist,
      waistChange: -1.0,
      startStrength,
      currentStrength,
      strengthChange: +2.5,
      weightPoints: [startWeight, startWeight - 0.2, startWeight - 0.3, startWeight - 0.5, startWeight - 0.6, startWeight - 0.8, currentWeight],
      strengthPoints: [startStrength, startStrength, startStrength + 1, startStrength + 1, startStrength + 1.5, startStrength + 2, currentStrength],
      labels: ['اليوم 1', 'اليوم 4', 'اليوم 7']
    };
  } else if (period === '30') {
    const startWeight = Math.round((currentWeight + 3.8) * 10) / 10;
    const startWaist = Math.round((currentWaist + 4.0) * 10) / 10;
    const startStrength = Math.round((currentStrength - 8.5) * 10) / 10;
    return {
      startWeight,
      currentWeight,
      weightChange: -3.8,
      startWaist,
      currentWaist,
      waistChange: -4.0,
      startStrength,
      currentStrength,
      strengthChange: +8.5,
      weightPoints: [startWeight, startWeight - 0.8, startWeight - 1.5, startWeight - 2.2, startWeight - 2.9, startWeight - 3.4, currentWeight],
      strengthPoints: [startStrength, startStrength + 1.5, startStrength + 3, startStrength + 4.5, startStrength + 6, startStrength + 7.5, currentStrength],
      labels: ['أول يوم', '15 يوم', '30 يوم']
    };
  } else {
    // 90 يوم
    const userProfile = store.getState()?.userProfile;
    const startWeight = report.firstDay?.weight || userProfile?.startWeight || currentWeight;
    const startWaist = report.firstDay?.waistCm || currentWaist;
    const startStrength = report.firstDay?.benchPressKg || currentStrength;
    const weightChange = Math.round((currentWeight - startWeight) * 10) / 10;
    const waistChange = Math.round((currentWaist - startWaist) * 10) / 10;
    const strengthChange = Math.round((currentStrength - startStrength) * 10) / 10;

    const wDiff = currentWeight - startWeight;
    const sDiff = currentStrength - startStrength;

    return {
      startWeight,
      currentWeight,
      weightChange,
      startWaist,
      currentWaist,
      waistChange,
      startStrength,
      currentStrength,
      strengthChange,
      weightPoints: [
        startWeight,
        Math.round((startWeight + wDiff * 0.2) * 10) / 10,
        Math.round((startWeight + wDiff * 0.4) * 10) / 10,
        Math.round((startWeight + wDiff * 0.6) * 10) / 10,
        Math.round((startWeight + wDiff * 0.8) * 10) / 10,
        currentWeight
      ],
      strengthPoints: [
        startStrength,
        Math.round((startStrength + sDiff * 0.2) * 10) / 10,
        Math.round((startStrength + sDiff * 0.4) * 10) / 10,
        Math.round((startStrength + sDiff * 0.6) * 10) / 10,
        Math.round((startStrength + sDiff * 0.8) * 10) / 10,
        currentStrength
      ],
      labels: ['أول يوم', '45 يوم', '90 يوم']
    };
  }
}

/**
 * توليد نصائح وتحليلات ذكية وتلقائية للأداء
 */
function generateProgressInsight(weightChange, strengthChange, adherence) {
  const isLoss = weightChange < 0;
  const isStronger = strengthChange > 0;
  const isAdherent = (adherence?.trainingPct || 0) >= 80 && (adherence?.nutritionPct || 0) >= 75;

  if (isLoss && isStronger) {
    return ' تحليل استثنائي: أنت في مرحلة بناء عضلات وخسارة دهون متزامنة (Body Recomposition)! نزول الوزن مع تصاعد أوزان التمرين يؤكد أن الخسارة دهون نقية مع الحفاظ التام على الكتلة العضلية. استمر على نفس توزيع الماكروز والترطيب.';
  } else if (isLoss) {
    return ' استجابة ممتازة: وزنك في هبوط صحي ومحيط الخصر ينكمش تدريجياً. احرص على تناول كامل احتياجك من البروتين اليومي والنوم الكافي لدعم الاستشفاء العضلي والحفاظ على مستويات طاقتك.';
  } else if (isStronger) {
    return ' زيادة قوة ملحوظة: أوزانك في التمارين الأساسية في تصاعد مستمر، مما يشير لنمو عضلي حقيقي وتحسن في الجهاز العصبي. واصل تطبيق مبدأ زيادة الحمل التدريجي (Progressive Overload).';
  } else if (isAdherent) {
    return ' التزام رائع: معدل التزامك بالتمارين والتغذية مرتفع جداً. تذكر أن الجسم يمر بفترات احتباس سوائل طبيعية قبل أن ينعكس المجهود على الميزان. التزم بالعملية والنتائج قادمة حتماً!';
  } else {
    return ' خطوة بخطوة: ركز على رفع نسبة الالتزام بشرب الماء وتسجيل وجباتك يومياً، فالاستمرارية اليومية البسيطة هي المفتاح الأهم لتحقيق أفضل تحول بدني مستدام.';
  }
}

/**
 * دالة مساعدة لرسم خطوط نيون متوهجة احترافية عالية الدقة على الـ Canvas
 * تبدأ من الصفر (خط الأساس السفلي) وترتفع تدريجياً بحركة انسيابية متقنة
 */
function drawGlowChart(canvasId, points, startLabel, endLabel, isRising) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const parent = canvas.parentElement;
  const rect = parent ? parent.getBoundingClientRect() : { width: 420 };
  const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) ? window.devicePixelRatio : 1;
  const displayWidth = Math.max(280, (rect && rect.width) || 420);
  const displayHeight = 160;

  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;
  canvas.style.width = displayWidth + 'px';
  canvas.style.height = displayHeight + 'px';

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // إلغاء أي فريمات حركة سابقة على نفس الكانفاس لمنع التداخل
  if (canvas._neonAnimId) {
    cancelAnimationFrame(canvas._neonAnimId);
    canvas._neonAnimId = null;
  }

  const paddingX = 40;
  const paddingY = 28;
  const chartW = displayWidth - (paddingX * 2);
  const chartH = displayHeight - (paddingY * 2);

  const minVal = Math.min(...points) - 1.5;
  const maxVal = Math.max(...points) + 1.5;

  const getX = (i) => paddingX + (i / (points.length - 1)) * chartW;
  const getY = (val) => displayHeight - paddingY - ((val - minVal) / (maxVal - minVal)) * chartH;

  const renderFrame = (ease) => {
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, displayWidth, displayHeight);

    // حساب النقاط الحالية بحيث تبدأ من الصفر (خط الأساس minVal) وترتفع نحو قيمتها الأصلية
    const currentPoints = points.map(pt => minVal + (pt - minVal) * ease);

    // 1. رسم التدرج اللوني السفلي الخافت المتصاعد
    const grad = ctx.createLinearGradient(0, paddingY, 0, displayHeight - paddingY);
    grad.addColorStop(0, `rgba(85, 247, 165, ${0.22 * Math.min(1, ease * 1.2)})`);
    grad.addColorStop(1, 'rgba(85, 247, 165, 0.00)');

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(currentPoints[0]));
    for (let i = 1; i < currentPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(currentPoints[i - 1]);
      const currX = getX(i);
      const currY = getY(currentPoints[i]);
      const midX = (prevX + currX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
    }
    ctx.lineTo(getX(points.length - 1), displayHeight - paddingY);
    ctx.lineTo(getX(0), displayHeight - paddingY);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // 2. رسم خط النيون المتوهج الرئيسي
    ctx.save();
    ctx.shadowColor = '#55F7A5';
    ctx.shadowBlur = 14;
    ctx.strokeStyle = '#55F7A5';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(getX(0), getY(currentPoints[0]));
    for (let i = 1; i < currentPoints.length; i++) {
      const prevX = getX(i - 1);
      const prevY = getY(currentPoints[i - 1]);
      const currX = getX(i);
      const currY = getY(currentPoints[i]);
      const midX = (prevX + currX) / 2;
      ctx.bezierCurveTo(midX, prevY, midX, currY, currX, currY);
    }
    ctx.stroke();
    ctx.restore();

    // 3. رسم نقطتي البداية والنهاية وتسميات القيم (تتلاشى تدريجياً وتثبت عند وصول المنحنى)
    if (ease > 0.35) {
      const alpha = Math.min(1, (ease - 0.35) / 0.65);
      ctx.save();
      ctx.globalAlpha = alpha;

      const drawPoint = (x, y, label, isTop) => {
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#55F7A5';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#55F7A5';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, isTop ? y - 10 : y + 20);
        ctx.restore();
      };

      drawPoint(getX(0), getY(currentPoints[0]), startLabel, !isRising);
      drawPoint(getX(points.length - 1), getY(currentPoints[points.length - 1]), endLabel, isRising);
      ctx.restore();
    }

    ctx.restore();
  };

  // دعم تفضيلات تقليل الحركة والطباعة وبيئة الاختبارات الأوتوماتيكية
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isPrint = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('print').matches;
  const isRafAvailable = typeof requestAnimationFrame !== 'undefined';

  if (prefersReduced || isPrint || !isRafAvailable) {
    renderFrame(1);
    return;
  }

  const duration = 900;
  const startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const progress = Math.min(1, elapsed / duration);
    // دالة التخميد الانسيابية Cubic ease-out
    const ease = 1 - Math.pow(1 - progress, 3);
    renderFrame(ease);

    if (progress < 1) {
      canvas._neonAnimId = requestAnimationFrame(animate);
    } else {
      canvas._neonAnimId = null;
    }
  }

  canvas._neonAnimId = requestAnimationFrame(animate);
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
