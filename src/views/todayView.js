/**
 * NEON COACH - شاشة اليوم (Today Dashboard)
 * متطابقة تماماً وبدقة بصرية فائقة مع الصورة المرجعية 9C561622-5F8F-4796-B822-FE30FF082A2B.PNG
 */

import { store } from '../state/store.js';
import { calculatePercentage } from '../domain/calculations.js';
import { animateCountUp, animateRingOffset } from '../utils/animUtils.js';

export function renderTodayView() {
  const state = store.getState();
  const { today, userProfile } = state;

  const calPct = calculatePercentage(today.consumedCalories, today.targetCalories);
  const proteinPct = calculatePercentage(today.consumedProtein, today.targetProtein);
  const carbsPct = calculatePercentage(today.consumedCarbs, today.targetCarbs);
  const fatsPct = calculatePercentage(today.consumedFats, today.targetFats);

  const waterPct = calculatePercentage(today.consumedGlasses, today.targetGlasses);
  const suppsTakenCount = state.supplementsSchedule.filter(s => s.schedule.morning.taken || s.schedule.evening.taken).length;
  const suppsTotalCount = state.supplementsSchedule.length;
  const suppsPct = calculatePercentage(suppsTakenCount, suppsTotalCount);

  let waterHelperMsg = 'ابدأ يومك بكوب ماء لإنعاش جسمك وعضلاتك 💧';
  if (waterPct >= 100) {
    waterHelperMsg = '🎉 رائع! حققت هدفك اليومي للترطيب الكامل بنجاح.';
  } else if (waterPct >= 70) {
    waterHelperMsg = '⚡ اقتربت جداً من هدفك اليومي! استمر في الشرب.';
  } else if (waterPct >= 30) {
    waterHelperMsg = '💧 ممتاز! أنت في المسار الصحيح للمحافظة على ترطيبك.';
  }

  // حساب محيط الدائرة للـ SVG Ring (r = 45 => circumference = 2 * PI * 45 ≈ 282.743)
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (calPct / 100) * circumference;

  // حلقات الماء والمكملات الأصغر (r = 38 => circumference ≈ 238.7)
  const smRadius = 38;
  const smCircumference = 2 * Math.PI * smRadius;
  const waterOffset = smCircumference - (waterPct / 100) * smCircumference;
  const suppsOffset = smCircumference - (suppsPct / 100) * smCircumference;

  return `
    <div class="today-view-container" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- قسم الترحيب ورسائل المدرب -->
      <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
        <h1 style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; letter-spacing: -0.5px;">
          مساء الخير، ${userProfile.name || 'أحمد'}
        </h1>
        <span style="display: inline-flex; align-items: center; gap: 6px; color: #55F7A5; font-size: 0.88rem; font-weight: 600;">
          <span>جاهز لليوم؟ واصل الالتزام ⚡</span>
        </span>
      </div>

      <!-- بطاقة السعرات والماكروز الرئيسية -->
      <div id="today-calorie-card" class="neon-card" style="padding: 20px 18px; display: flex; flex-direction: column; gap: 16px; cursor: pointer;" title="اضغط لعرض خطة وسجل التغذية">
        
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; align-items: center; gap: 6px; color: #F59E0B; font-weight: 700; font-size: 0.95rem;">
            <span>🔥</span>
            <span>سعرات اليوم</span>
          </div>
          <a href="#nutrition" style="color: #55F7A5; font-size: 0.82rem; font-weight: 700; text-decoration: none;">خطة التغذية ❯</a>
        </div>

        <!-- الجزء العلوي: الحلقة الدائرية وبجانبها أرقام السعرات وشارة الخصم -->
        <div style="display: flex; align-items: center; gap: 16px; width: 100%;">
          
          <!-- الحلقة الدائرية للسعرات -->
          <div class="neon-ring-container" style="width: 104px; height: 104px; flex-shrink: 0;">
            <svg width="104" height="104" viewBox="0 0 104 104">
              <circle class="neon-ring-track" cx="52" cy="52" r="${radius}" stroke-width="8" />
              <circle id="today-cal-ring-circle" class="neon-ring-fill" cx="52" cy="52" r="${radius}" stroke-width="8"
                stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" />
            </svg>
            <div class="neon-ring-content">
              <span id="today-cal-pct-val" style="font-size: 1.55rem; font-weight: 900; color: #FFFFFF; font-family: monospace; line-height: 1;">${calPct}%</span>
              <span style="font-size: 0.72rem; color: #B8C0BC; margin-top: 2px;">تقدم اليوم</span>
            </div>
          </div>

          <!-- الأرقام والماكروز وشارة المتبقي بعد الخصم -->
          <div style="flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 8px;">
            
            <div style="display: flex; align-items: baseline; gap: 4px; flex-wrap: wrap;">
              <span id="today-consumed-cals-val" style="font-size: 1.85rem; font-weight: 900; color: #55F7A5; font-family: monospace; letter-spacing: -0.5px; line-height: 1;">
                ${today.consumedCalories.toLocaleString('en-US')}
              </span>
              <span style="font-size: 1.2rem; font-weight: 700; color: #FFFFFF;">/</span>
              <span style="font-size: 1.2rem; font-weight: 800; color: #D1D5DB; font-family: monospace;">
                ${today.targetCalories.toLocaleString('en-US')}
              </span>
              <span style="font-size: 0.8rem; color: #8F9692; margin-inline-start: 2px;">سعرة</span>
              <button id="today-edit-target-cals-btn" style="background: rgba(85,247,165,0.1); border: 1px solid rgba(85,247,165,0.3); border-radius: 6px; color: #55F7A5; cursor: pointer; font-size: 0.7rem; font-weight: 700; padding: 2px 7px; margin-inline-start: auto;" title="تعديل هدف السعرات يدوياً">
                ✏️ تعديل
              </button>
            </div>

            <!-- تفصيل المتبقي بعد الخصم -->
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 0.76rem; background: ${today.consumedCalories > today.targetCalories ? 'rgba(255,85,85,0.12)' : 'rgba(85,247,165,0.08)'}; border: 1px solid ${today.consumedCalories > today.targetCalories ? 'rgba(255,85,85,0.3)' : 'rgba(85,247,165,0.22)'}; border-radius: 8px; padding: 5px 9px;">
              <span style="color: #B8C0BC; white-space: nowrap; font-size: 0.72rem;">المتبقي بعد الخصم:</span>
              <span style="font-weight: 800; font-family: monospace; color: ${today.consumedCalories > today.targetCalories ? '#FF6B6B' : '#55F7A5'}; white-space: nowrap; font-size: 0.75rem;">
                ${today.consumedCalories > today.targetCalories ? `+${(today.consumedCalories - today.targetCalories).toLocaleString('en-US')} زيادة ⚠️` : `${(today.targetCalories - today.consumedCalories).toLocaleString('en-US')} متبقية ⚡`}
              </span>
            </div>

          </div>

        </div>

        <!-- خط فاصل خفيف نيون -->
        <div style="height: 1px; background: rgba(85, 247, 165, 0.12); width: 100%;"></div>

        <!-- أشرطة الماكروز الثلاثة بكامل العرض (Full-Width) دون انضغاط أو قص -->
        <div style="display: flex; flex-direction: column; gap: 10px; width: 100%;">
          
          <!-- بروتين -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin-bottom: 4px;">
              <span style="color: #FFFFFF; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #55F7A5; display: inline-block; box-shadow: 0 0 6px rgba(85,247,165,0.6);"></span>
                بروتين
              </span>
              <span style="color: #B8C0BC; font-family: monospace; font-size: 0.82rem;">
                <b style="color: #55F7A5;">${today.consumedProtein}</b> / ${today.targetProtein} غ
                <span style="color: #6E7E76; font-size: 0.72rem; margin-inline-start: 4px;">(${proteinPct}%)</span>
              </span>
            </div>
            <div class="macro-bar-track" style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div class="macro-bar-fill" style="width: ${proteinPct}%; height: 100%; background: linear-gradient(90deg, #10B981, #55F7A5); border-radius: 999px;"></div>
            </div>
          </div>

          <!-- كارب -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin-bottom: 4px;">
              <span style="color: #FFFFFF; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #38BDF8; display: inline-block; box-shadow: 0 0 6px rgba(56,189,248,0.6);"></span>
                كارب
              </span>
              <span style="color: #B8C0BC; font-family: monospace; font-size: 0.82rem;">
                <b style="color: #38BDF8;">${today.consumedCarbs}</b> / ${today.targetCarbs} غ
                <span style="color: #6E7E76; font-size: 0.72rem; margin-inline-start: 4px;">(${carbsPct}%)</span>
              </span>
            </div>
            <div class="macro-bar-track" style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div class="macro-bar-fill" style="width: ${carbsPct}%; height: 100%; background: linear-gradient(90deg, #0284C7, #38BDF8); border-radius: 999px;"></div>
            </div>
          </div>

          <!-- دهون -->
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.82rem; margin-bottom: 4px;">
              <span style="color: #FFFFFF; font-weight: 700; display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; border-radius: 50%; background: #F59E0B; display: inline-block; box-shadow: 0 0 6px rgba(245,158,11,0.6);"></span>
                دهون
              </span>
              <span style="color: #B8C0BC; font-family: monospace; font-size: 0.82rem;">
                <b style="color: #F59E0B;">${today.consumedFats}</b> / ${today.targetFats} غ
                <span style="color: #6E7E76; font-size: 0.72rem; margin-inline-start: 4px;">(${fatsPct}%)</span>
              </span>
            </div>
            <div class="macro-bar-track" style="height: 6px; background: rgba(255,255,255,0.06); border-radius: 999px; overflow: hidden;">
              <div class="macro-bar-fill" style="width: ${fatsPct}%; height: 100%; background: linear-gradient(90deg, #D97706, #F59E0B); border-radius: 999px;"></div>
            </div>
          </div>

        </div>

      </div>

      <!-- بطاقة تمرين اليوم (مطابقة للصورة 9C561622) -->
      <div class="neon-card" style="padding: 0; overflow: hidden; position: relative; background: #07100D;">
        <div style="position: absolute; inset: 0; background: linear-gradient(90deg, rgba(2,6,5,0.95) 45%, rgba(2,6,5,0.4) 100%), url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=700&q=80') center/cover no-repeat; opacity: 0.35; pointer-events: none;"></div>

        <div style="position: relative; z-index: 2; padding: 22px; display: flex; flex-direction: column; gap: 14px;">
          
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px; color: #55F7A5; font-size: 0.95rem; font-weight: 700;">
              <span>🏋️</span>
              <span>تمرين اليوم</span>
            </div>
          </div>

          <div>
            <h2 style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; margin-bottom: 8px;">
              ${today.todayWorkoutTitleAr}
            </h2>
            <div style="display: flex; align-items: center; gap: 14px; font-size: 0.88rem; color: #B8C0BC;">
              <span>• ${today.todayWorkoutExercisesCount} تمارين</span>
              <span>⏱️ ${today.todayWorkoutDuration}</span>
            </div>
          </div>

          <a href="./40-days-workout.html?book=fortyDay" id="start-workout-btn" class="btn btn-primary btn-lg" style="border-radius: 20px; font-size: 1.1rem; width: 100%; margin-top: 4px;">
            ابدأ التمرين ▶
          </a>

        </div>
      </div>

      <!-- قسم تتبع الماء والترطيب والمكملات اليومية -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        
        <!-- بطاقة تتبع الماء والترطيب الشاملة -->
        <div class="neon-card" style="padding: 20px; display: flex; flex-direction: column; gap: 16px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px; color: #38BDF8; font-weight: 700; font-size: 1rem;">
              <span style="font-size: 1.3rem;">💧</span>
              <div>
                <div style="color: #FFFFFF; font-weight: 800; font-size: 1.05rem;">تتبع الماء والترطيب</div>
                <div style="font-size: 0.78rem; color: #8C9992;">الهدف اليومي: ${today.targetWaterLiters || 2.5} لتر (${today.targetGlasses} أكواب)</div>
              </div>
            </div>
            <span id="today-water-pct-badge" style="font-size: 0.85rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: rgba(56, 189, 248, 0.15); color: #38BDF8; font-family: monospace;">
              ${waterPct}%
            </span>
          </div>

          <!-- عداد الترطيب الدائري والإحصائيات -->
          <div style="display: flex; align-items: center; justify-content: space-around; gap: 16px; background: rgba(3, 14, 9, 0.6); padding: 14px; border-radius: 16px; border: 1px solid rgba(56, 189, 248, 0.2);">
            <div class="neon-ring-container" style="width: 86px; height: 86px; flex-shrink: 0;">
              <svg width="86" height="86" viewBox="0 0 86 86">
                <circle class="neon-ring-track" cx="43" cy="43" r="${smRadius}" stroke-width="7" />
                <circle id="today-water-ring-circle" cx="43" cy="43" r="${smRadius}" stroke-width="7" fill="transparent" stroke="#38BDF8"
                  stroke-dasharray="${smCircumference}" stroke-dashoffset="${waterOffset}" stroke-linecap="round"
                  style="transform: rotate(-90deg); transform-origin: 50% 50%; transition: stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1);" />
              </svg>
              <div class="neon-ring-content">
                <span id="today-water-glasses-val" style="font-size: 1.15rem; font-weight: 900; color: #38BDF8; font-family: monospace;">
                  ${today.consumedGlasses}/${today.targetGlasses}
                </span>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 6px; flex: 1;">
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: #8C9992;">المستهلك:</span>
                <span style="color: #FFFFFF; font-weight: 800; font-family: monospace;"><b style="color: #38BDF8;">${today.consumedWaterLiters || 0}</b> / ${today.targetWaterLiters || 2.5} لتر</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 0.88rem;">
                <span style="color: #8C9992;">الأكواب:</span>
                <span style="color: #FFFFFF; font-weight: 800; font-family: monospace;"><b style="color: #38BDF8;">${today.consumedGlasses}</b> / ${today.targetGlasses} كوب</span>
              </div>
              <div style="font-size: 0.78rem; color: #55F7A5; margin-top: 2px;">
                ${waterHelperMsg}
              </div>
            </div>
          </div>

          <!-- أزرار تسجيل الماء السريعة (+ كوب، + زجاجة، - تراجع) -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 48px; gap: 8px;">
            <button id="today-add-water-btn" class="btn btn-secondary" style="border-radius: 12px; padding: 10px 8px; font-size: 0.86rem; color: #38BDF8; border-color: rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; gap: 6px;" title="إضافة كوب ماء 250 مل">
              <span>➕ كوب (+250 مل)</span>
            </button>
            <button id="today-add-bottle-btn" class="btn btn-secondary" style="border-radius: 12px; padding: 10px 8px; font-size: 0.86rem; color: #38BDF8; border-color: rgba(56, 189, 248, 0.35); display: flex; align-items: center; justify-content: center; gap: 6px;" title="إضافة زجاجة ماء 500 مل">
              <span>🍾 زجاجة (+500 مل)</span>
            </button>
            <button id="today-undo-water-btn" class="btn btn-secondary" style="border-radius: 12px; padding: 10px 0; font-size: 1.1rem; color: #ff6b6b; border-color: rgba(255, 107, 107, 0.3); display: flex; align-items: center; justify-content: center;" title="تراجع عن كوب (-250 مل)" ${today.consumedGlasses <= 0 ? 'disabled' : ''}>
              <span>−</span>
            </button>
          </div>
        </div>

        <!-- بطاقة المكملات اليومية -->
        <div class="neon-card" style="padding: 18px; display: flex; flex-direction: column; gap: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px; color: #55F7A5; font-weight: 700; font-size: 1rem;">
              <span style="font-size: 1.3rem;">💊</span>
              <div>
                <div style="color: #FFFFFF; font-weight: 800; font-size: 1.05rem;">المكملات اليومية (Daily Stack)</div>
                <div style="font-size: 0.78rem; color: #8C9992;">خطة مكملاتك وجرعاتها بالعربي والإنجليزي</div>
              </div>
            </div>
            <span style="font-size: 0.85rem; font-weight: 800; padding: 4px 10px; border-radius: 999px; background: rgba(85, 247, 165, 0.15); color: #55F7A5; font-family: monospace;">
              ${suppsTakenCount}/${suppsTotalCount}
            </span>
          </div>

          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(3, 14, 9, 0.6); padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(85, 247, 165, 0.18);">
            <div style="font-size: 0.86rem; color: #B8C0BC;">
              تم تناول <b style="color: #55F7A5;">${suppsTakenCount}</b> من أصل <b style="color: #FFFFFF;">${suppsTotalCount}</b> مكملات اليوم (${suppsPct}%)
            </div>
            <a href="#water-supps" class="btn btn-primary" style="border-radius: 12px; padding: 8px 16px; font-size: 0.86rem; text-decoration: none; white-space: nowrap;">
              فتح المكملات 💊
            </a>
          </div>
        </div>

      </div>

      <!-- بطاقة: كيف طاقتك اليوم؟ (5 حالات طاقة - مطابقة للصورة 9C561622) -->
      <div class="neon-card" style="padding: 18px;">
        <div style="display: flex; align-items: center; gap: 8px; color: #55F7A5; font-weight: 700; font-size: 0.95rem; margin-bottom: 4px;">
          <span>⚡</span>
          <span>كيف طاقتك اليوم؟</span>
        </div>
        <p style="font-size: 0.82rem; color: #B8C0BC; margin-bottom: 12px;">
          سجل حالتك لنقدم لك توجيهات أفضل.
        </p>

        <div class="energy-selector">
          ${[
            { level: 5, icon: '😄', label: 'ممتاز' },
            { level: 4, icon: '🙂', label: 'جيد' },
            { level: 3, icon: '😐', label: 'متوسط' },
            { level: 2, icon: '🙁', label: 'منخفض' },
            { level: 1, icon: '😫', label: 'مرهق' }
          ].map(item => `
            <button class="energy-btn ${today.energyLevel === item.level ? 'selected' : ''}" data-energy="${item.level}">
              <span class="energy-icon">${item.icon}</span>
              <span class="energy-label">${item.label}</span>
            </button>
          `).join('')}
        </div>
      </div>

      <!-- نافذة تعديل هدف السعرات اليومي يدوياً -->
      <div id="today-calorie-target-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 22px; border-radius: 24px; max-width: 440px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0;">🔥 تعديل هدف السعرات اليومي</h3>
            <button id="close-today-cal-modal-btn" class="btn-icon">✕</button>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #FFFFFF; margin-bottom: 6px;">
                هدف السعرات الجديد
              </label>
              <div style="position: relative;">
                <input type="number" id="today-manual-target-cals-input" class="stack-field" style="font-size: 1.35rem; font-weight: 900; font-family: monospace; color: #55F7A5; padding-inline-end: 55px;" value="${today.targetCalories}" min="800" max="8000" step="50" />
                <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8C9992; font-size: 0.85rem; font-weight: 700;">سعرة</span>
              </div>
            </div>

            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(85, 247, 165, 0.15); border-radius: 14px; padding: 14px;">
              <div style="font-size: 0.82rem; color: #B8C0BC; margin-bottom: 8px;">
                سيتم تلقائياً تحديث وتوزيع أهداف البروتين، الكاربوهيدرات، والدهون بنسب علمية متوازنة.
              </div>
              <div id="today-macros-preview" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; font-size: 0.82rem; color: #B8C0BC;">
                <div>بروتين: <b id="today-preview-protein" style="color: #FFFFFF; font-family: monospace;">${today.targetProtein}غ</b></div>
                <div>كارب: <b id="today-preview-carbs" style="color: #FFFFFF; font-family: monospace;">${today.targetCarbs}غ</b></div>
                <div>دهون: <b id="today-preview-fats" style="color: #FFFFFF; font-family: monospace;">${today.targetFats}غ</b></div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button id="save-today-cal-target-btn" class="btn btn-primary" style="flex: 1; border-radius: 14px; font-weight: 800; padding: 12px;">
                حفظ الهدف الجديد ✅
              </button>
              <button id="cancel-today-cal-modal-btn" class="btn btn-secondary" style="border-radius: 14px; padding: 12px 18px;">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindTodayViewEvents() {
  const state = store.getState();
  const { today } = state;

  // تحريك حلقة السعرات اليومية ورقم التقدم ورقم السعرات المستهلكة من الصفر
  const calPct = calculatePercentage(today.consumedCalories, today.targetCalories);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - ((calPct / 100) * circumference);

  animateRingOffset('today-cal-ring-circle', strokeDashoffset, circumference);
  animateCountUp('today-cal-pct-val', calPct, { suffix: '%' });
  animateCountUp('today-consumed-cals-val', today.consumedCalories, { decimals: 0 });

  // تحريك حلقة الماء ونسبة الترطيب
  const waterPct = calculatePercentage(today.consumedGlasses, today.targetGlasses);
  const smRadius = 34;
  const smCircumference = 2 * Math.PI * smRadius;
  const waterOffset = smCircumference - ((Math.min(100, waterPct) / 100) * smCircumference);

  animateRingOffset('today-water-ring-circle', waterOffset, smCircumference);
  animateCountUp('today-water-pct-badge', waterPct, { suffix: '%' });

  // النقر على كرت السعرات للانتقال للتغذية
  document.getElementById('today-calorie-card')?.addEventListener('click', (e) => {
    // منع التكرار إذا كان النقر على زر تعديل الهدف أو داخل المودال
    if (e.target.closest('#today-edit-target-cals-btn') || e.target.closest('#today-calorie-target-modal')) {
      return;
    }
    if (e.target.tagName !== 'A') {
      window.location.hash = '#nutrition';
    }
  });

  // نافذة تعديل هدف السعرات اليومي
  const todayCalModal = document.getElementById('today-calorie-target-modal');
  const todayEditCalBtn = document.getElementById('today-edit-target-cals-btn');
  const closeTodayCalBtn = document.getElementById('close-today-cal-modal-btn');
  const cancelTodayCalBtn = document.getElementById('cancel-today-cal-modal-btn');
  const saveTodayCalBtn = document.getElementById('save-today-cal-target-btn');
  const todayCalInput = document.getElementById('today-manual-target-cals-input');

  todayEditCalBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    todayCalModal?.classList.add('open');
    todayCalInput?.focus();
    todayCalInput?.select();
  });

  closeTodayCalBtn?.addEventListener('click', () => todayCalModal?.classList.remove('open'));
  cancelTodayCalBtn?.addEventListener('click', () => todayCalModal?.classList.remove('open'));

  // معاينة الماكروز المحدثة
  todayCalInput?.addEventListener('input', () => {
    const val = Number(todayCalInput?.value) || 2000;
    const userWeight = store.getState().userProfile?.currentWeight || 75;
    const p = Math.round(Math.min(userWeight * 2.2, (val * 0.3) / 4));
    const f = Math.round((val * 0.25) / 9);
    const rem = Math.max(0, val - (p * 4 + f * 9));
    const c = Math.round(rem / 4);

    const prevP = document.getElementById('today-preview-protein');
    const prevC = document.getElementById('today-preview-carbs');
    const prevF = document.getElementById('today-preview-fats');
    if (prevP) prevP.textContent = `${p}غ`;
    if (prevC) prevC.textContent = `${c}غ`;
    if (prevF) prevF.textContent = `${f}غ`;
  });

  saveTodayCalBtn?.addEventListener('click', () => {
    const newTarget = Number(todayCalInput?.value);
    if (!newTarget || newTarget < 500) {
      return;
    }
    store.setTargetCalories(newTarget);
    todayCalModal?.classList.remove('open');
    const container = document.getElementById('view-container');
    if (container) {
      container.innerHTML = renderTodayView();
      bindTodayViewEvents();
    }
  });

  // أزرار تتبع الماء والترطيب السريعة
  document.getElementById('today-add-water-btn')?.addEventListener('click', () => {
    store.addWaterCup(250);
  });

  document.getElementById('today-add-bottle-btn')?.addEventListener('click', () => {
    store.addWaterCup(500);
  });

  document.getElementById('today-undo-water-btn')?.addEventListener('click', () => {
    store.undoWaterCup(250);
  });

  // أزرار تقييم الطاقة
  document.querySelectorAll('.energy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const level = Number(btn.getAttribute('data-energy'));
      if (level) {
        store.setEnergyLevel(level);
      }
    });
  });

  // زر رسالة المدرب
  const coachBanner = document.getElementById('coach-message-banner');
  coachBanner?.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.hash = '#neon-ai';
  });
}
