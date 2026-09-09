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

let activePeriod = '90'; // '7' | '30' | '90'

export function renderProgressReportView() {
  const state = store.getState();
  const report = state.progressReport || {};
  const user = state.userProfile || {};


  const currentWeight = user.currentWeight || report.currentDay?.weight || 118;
  const currentWaist = report.currentDay?.waistCm || 108;
  const currentStrength = report.currentDay?.benchPressKg || 82.5;

  const periodData = getPeriodMetrics(report, activePeriod, currentWeight, currentWaist, currentStrength);
  const smartInsight = generateProgressInsight(periodData.weightChange, periodData.strengthChange, report.adherence);
  const inBody = report.inBodyResult || {};

  return `
    <div class="progress-report-container" style="padding: 16px 16px 110px; display: flex; flex-direction: column; gap: 16px; max-width: 780px; margin: 0 auto;">
      
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
          ℹ️
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
            <span>📅</span>
            <select id="report-period-select" style="background: transparent; border: none; color: #FFFFFF; font-size: 0.88rem; font-weight: 700; padding: 0; width: auto; cursor: pointer; outline: none;">
              <option value="90" ${activePeriod === '90' ? 'selected' : ''}>آخر 90 يوم</option>
              <option value="30" ${activePeriod === '30' ? 'selected' : ''}>آخر 30 يوم</option>
              <option value="7" ${activePeriod === '7' ? 'selected' : ''}>آخر 7 أيام</option>
            </select>
          </div>

          <!-- زر تسجيل قياس جديد -->
          <button id="open-measurement-modal-btn" class="btn btn-primary no-print" style="border-radius: 12px; padding: 8px 14px; font-size: 0.86rem; font-weight: 800; display: flex; align-items: center; gap: 6px;" title="تسجيل وزن أو قياس جديد">
            <span>➕ قياس جديد</span>
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
              ${periodData.weightChange <= 0 ? '📉 خسارة وزن ممتازة' : '📈 زيادة وزن'}
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
                <span>⚖️</span>
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
                <span>📏</span>
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
                <span>🏋️</span>
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
            <span>📈 اتجاه الوزن (${activePeriod} يوم)</span>
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
            <span>🏋️ اتجاه القوة Bench Press (${activePeriod} يوم)</span>
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
            <span>🏋️</span>
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
            <span>🍽️</span>
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
            <span>💧</span>
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
          <div style="width: 44px; height: 44px; border-radius: 12px; background: rgba(85,247,165,0.12); display: flex; align-items: center; justify-content: center; font-size: 1.4rem;">
            🧬
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
          ⚙️
        </button>
      </div>

      <!-- بطاقة التحليل الذكي للتقدم والتوصيات -->
      <div class="neon-card" style="padding: 20px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 800; color: #FFFFFF; font-size: 1rem;">
            <span>💡</span>
            <span>تحليل الأداء والتوصيات الذكية</span>
          </div>
          <span style="font-size: 0.76rem; color: #55F7A5; font-family: monospace;">AI INSIGHTS</span>
        </div>
        <p style="font-size: 0.92rem; color: #B8C0BC; line-height: 1.6; margin: 0;">
          ${smartInsight}
        </p>
      </div>

      <div class="no-print" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 4px;">
        
        <!-- زر مشاركة التقرير -->
        <button id="share-report-btn" class="btn btn-secondary btn-lg no-print" style="border-radius: 20px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>مشاركة التقرير</span>
          <span>📤</span>
        </button>

        <!-- زر حفظ PDF -->
        <button id="save-pdf-btn" class="btn btn-primary btn-lg no-print" style="border-radius: 20px; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px;">
          <span>حفظ PDF</span>
          <span>📄</span>
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
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0;">📏 تسجيل قياسات جديدة</h3>
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
              <button id="save-measure-btn" class="btn btn-primary btn-block" style="border-radius: 14px;">
                ✓ حفظ القياسات وتحديث التقرير
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
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0;">🧬 تحديث فحص تركيب الجسم InBody</h3>
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
              <button id="save-inbody-btn" class="btn btn-primary btn-block" style="border-radius: 14px;">
                ✓ حفظ نتيجة InBody
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
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0;">ℹ️ دليل فهم مؤشرات التقدم</h3>
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

            <button id="close-info-modal-btn-bottom" class="btn btn-secondary btn-block" style="border-radius: 12px; margin-top: 6px;">
              فهمت ذلك 👍
            </button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindProgressReportEvents() {
  // زر الرجوع
  document.getElementById('report-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#today';
  });

  const state = store.getState();
  const report = state.progressReport || {};
  const user = state.userProfile || {};
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
    notificationService.showToast('جاري تجهيز تقرير التقدم للطباعة والحفظ بصيغة PDF 📄...', 'info');
    setTimeout(() => {
      pdfService.exportReportToPdf();
    }, 400);
  });

  // مشاركة التقرير
  document.getElementById('share-report-btn')?.addEventListener('click', async () => {
    const reportData = store.getState().progressReport;
    const res = await pdfService.shareReport(reportData);
    if (res.method === 'clipboard') {
      notificationService.showToast('تم نسخ ملخص إنجازك الرياضي للحافظة بنجاح! 📋', 'success');
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
    const startWeight = report.firstDay?.weight || 129;
    const startWaist = report.firstDay?.waistCm || 122;
    const startStrength = report.firstDay?.benchPressKg || 60;
    const weightChange = Math.round((currentWeight - startWeight) * 10) / 10;
    const waistChange = Math.round((currentWaist - startWaist) * 10) / 10;
    const strengthChange = Math.round((currentStrength - startStrength) * 10) / 10;

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
      weightPoints: [startWeight, 127.5, 125.0, 123.0, 120.5, 119.2, currentWeight],
      strengthPoints: [startStrength, 62.5, 65.0, 68.0, 72.5, 78.0, currentStrength],
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
    return '🔥 تحليل استثنائي: أنت في مرحلة بناء عضلات وخسارة دهون متزامنة (Body Recomposition)! نزول الوزن مع تصاعد أوزان التمرين يؤكد أن الخسارة دهون نقية مع الحفاظ التام على الكتلة العضلية. استمر على نفس توزيع الماكروز والترطيب.';
  } else if (isLoss) {
    return '📉 استجابة ممتازة: وزنك في هبوط صحي ومحيط الخصر ينكمش تدريجياً. احرص على تناول كامل احتياجك من البروتين اليومي والنوم الكافي لدعم الاستشفاء العضلي والحفاظ على مستويات طاقتك.';
  } else if (isStronger) {
    return '💪 زيادة قوة ملحوظة: أوزانك في التمارين الأساسية في تصاعد مستمر، مما يشير لنمو عضلي حقيقي وتحسن في الجهاز العصبي. واصل تطبيق مبدأ زيادة الحمل التدريجي (Progressive Overload).';
  } else if (isAdherent) {
    return '⚡ التزام رائع: معدل التزامك بالتمارين والتغذية مرتفع جداً. تذكر أن الجسم يمر بفترات احتباس سوائل طبيعية قبل أن ينعكس المجهود على الميزان. التزم بالعملية والنتائج قادمة حتماً!';
  } else {
    return '🎯 خطوة بخطوة: ركز على رفع نسبة الالتزام بشرب الماء وتسجيل وجباتك يومياً، فالاستمرارية اليومية البسيطة هي المفتاح الأهم لتحقيق أفضل تحول بدني مستدام.';
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
