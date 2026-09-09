/**
 * NEON COACH - شاشة خطة التغذية اليومية وسجل الوجبات
 * تفاعلية بالكامل: تعديل وحذف وتبديل الوجبات يعمل فوراً
 */

import { store } from '../state/store.js';
import { calculatePercentage } from '../domain/calculations.js';
import { findMealSwaps } from '../domain/nutritionEngine.js';
import { macrosFor } from '../data/foods.js';
import { notificationService } from '../services/notificationService.js';

export function renderNutritionView() {
  removeDetachedModals();
  const state = store.getState();
  const { today, mealPlan } = state;
  const loggedMeals = state.loggedMeals || [];

  const isOverCalories = today.consumedCalories > today.targetCalories;
  const actualPct = today.targetCalories > 0 ? Math.round((today.consumedCalories / today.targetCalories) * 100) : 0;
  const calPct = calculatePercentage(today.consumedCalories, today.targetCalories);
  const exceededCals = Math.max(0, today.consumedCalories - today.targetCalories);
  const proteinPct = calculatePercentage(today.consumedProtein || 0, today.targetProtein || 1);
  const carbsPct = calculatePercentage(today.consumedCarbs || 0, today.targetCarbs || 1);
  const fatsPct = calculatePercentage(today.consumedFats || 0, today.targetFats || 1);
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = isOverCalories ? 0 : (circumference - (calPct / 100) * circumference);

  return `
    <div class="nutrition-view-container" style="padding: 16px 16px 120px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط العنوان والشارة المعتمدة -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="nutrition-back-btn" class="btn-icon" aria-label="رجوع" title="رجوع لشاشة اليوم">
          ❯
        </button>
        <div style="text-align: center;">
          <h1 style="font-size: 1.4rem; font-weight: 900; color: #FFFFFF; margin-bottom: 4px;">
            خطتي الغذائية
          </h1>
          <span class="badge badge-verified">
            🛡️ خطة معتمدة
          </span>
        </div>
        <button id="shopping-list-btn" class="btn-icon" title="قائمة المشتريات" aria-label="قائمة المشتريات">
          🛒
        </button>
      </div>

      <!-- بطاقة الهدف اليومي الكلي -->
      <div class="neon-card" style="padding: 22px; ${isOverCalories ? 'border-color: rgba(255,85,85,0.4); box-shadow: 0 0 20px rgba(255,85,85,0.15);' : ''}">
        
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px;">
          
          <!-- الحلقة الدائرية للهدف -->
          <div class="neon-ring-container" style="width: 116px; height: 116px; flex-shrink: 0;">
            <svg width="116" height="116" viewBox="0 0 116 116">
              <circle class="neon-ring-track" cx="58" cy="58" r="${radius}" stroke-width="8" />
              <circle class="neon-ring-fill" cx="58" cy="58" r="${radius}" stroke-width="8"
                stroke="${isOverCalories ? '#FF5555' : '#55F7A5'}"
                style="${isOverCalories ? 'filter: drop-shadow(0 0 8px rgba(255,85,85,0.8));' : ''}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" />
            </svg>
            <div class="neon-ring-content">
              <span style="font-size: 1.5rem; font-weight: 900; color: ${isOverCalories ? '#FF5555' : '#FFFFFF'}; font-family: monospace;">${actualPct}%</span>
              <span style="font-size: 0.7rem; color: ${isOverCalories ? '#FF8888' : '#B8C0BC'}; font-weight: ${isOverCalories ? '700' : 'normal'};">${isOverCalories ? 'تم تجاوز الهدف!' : 'من هدف اليوم'}</span>
            </div>
          </div>

          <!-- السعرات والماكروز -->
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px;">
              <span style="font-size: 0.85rem; color: #B8C0BC;">الهدف اليومي</span>
              <button id="edit-calorie-target-btn" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 8px; gap: 4px; height: 24px; border-color: rgba(85,247,165,0.3);" title="تعديل هدف السعرات يدوياً">
                <span>تعديل</span>
                <span>✏️</span>
              </button>
            </div>
            <div id="target-calories-display-wrap" style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; cursor: pointer;" title="اضغط للتعديل اليدوي">
              <span style="font-size: 2.2rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">
                ${today.targetCalories.toLocaleString('en-US')}
              </span>
              <span style="font-size: 0.85rem; color: #B8C0BC;">سعرة</span>
              <span style="margin-inline-start: auto; font-size: 1.2rem; color: ${isOverCalories ? '#FF5555' : '#55F7A5'};">🔥</span>
            </div>

            <!-- تفصيل السعرات الكلية والمخصوم والمتبقي -->
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.76rem; background: ${isOverCalories ? 'rgba(255,85,85,0.08)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isOverCalories ? 'rgba(255,85,85,0.3)' : 'rgba(85,247,165,0.18)'}; border-radius: 8px; padding: 4px 8px; margin-bottom: 12px;">
              <span style="color: #B8C0BC;">الكلية: <b style="color: #FFFFFF;">${today.targetCalories.toLocaleString('en-US')}</b> - الخصم: <b style="color: ${isOverCalories ? '#FF5555' : '#55F7A5'};">${(today.consumedCalories || 0).toLocaleString('en-US')}</b></span>
              <span style="font-weight: 800; color: ${isOverCalories ? '#FF5555' : '#55F7A5'}; font-family: monospace;">
                = ${isOverCalories ? `تجاوز +${(today.consumedCalories - today.targetCalories).toLocaleString('en-US')}` : `المتبقي ${Math.max(0, today.targetCalories - today.consumedCalories).toLocaleString('en-US')} سعرة`}
              </span>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center;">
              <div>
                <div style="font-size: 0.75rem; color: #B8C0BC;">بروتين</div>
                <div style="font-weight: 800; font-size: 0.88rem; color: #FFFFFF; font-family: monospace; white-space: nowrap;">
                  <b style="color: #55F7A5;">${today.consumedProtein || 0}</b><span style="font-size: 0.75rem; color: #8C9992;"> / ${today.targetProtein}غ</span>
                </div>
                <div class="macro-bar-track" style="height: 4px; margin-top: 4px;"><div class="macro-bar-fill" style="width: ${proteinPct}%;"></div></div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #B8C0BC;">كارب</div>
                <div style="font-weight: 800; font-size: 0.88rem; color: #FFFFFF; font-family: monospace; white-space: nowrap;">
                  <b style="color: #55F7A5;">${today.consumedCarbs || 0}</b><span style="font-size: 0.75rem; color: #8C9992;"> / ${today.targetCarbs}غ</span>
                </div>
                <div class="macro-bar-track" style="height: 4px; margin-top: 4px;"><div class="macro-bar-fill" style="width: ${carbsPct}%;"></div></div>
              </div>
              <div>
                <div style="font-size: 0.75rem; color: #B8C0BC;">دهون</div>
                <div style="font-weight: 800; font-size: 0.88rem; color: #FFFFFF; font-family: monospace; white-space: nowrap;">
                  <b style="color: #55F7A5;">${today.consumedFats || 0}</b><span style="font-size: 0.75rem; color: #8C9992;"> / ${today.targetFats}غ</span>
                </div>
                <div class="macro-bar-track" style="height: 4px; margin-top: 4px;"><div class="macro-bar-fill" style="width: ${fatsPct}%;"></div></div>
              </div>
            </div>

          </div>

        </div>

        <!-- شريط تم تناول السعرات -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.88rem; margin-bottom: 6px; padding-top: 10px; border-top: 1px solid rgba(85,247,165,0.12);">
          <div style="display: flex; align-items: center; gap: 6px; color: #FFFFFF;">
            <span>🍽️</span>
            <span>تم تناول <b style="color: ${isOverCalories ? '#FF5555' : '#55F7A5'}; font-family: monospace;">${today.consumedCalories.toLocaleString('en-US')}</b> سعرة</span>
          </div>
          ${isOverCalories ? `
            <span style="font-size: 0.8rem; color: #FF8888; font-weight: 800;">
              تجاوز الهدف: <b style="color: #FF5555; font-family: monospace;">+${exceededCals.toLocaleString('en-US')}</b> سعرة
            </span>
          ` : `
            <span style="font-size: 0.8rem; color: #8C9992;">
              المتبقي: <b style="color: #FFFFFF; font-family: monospace;">${Math.max(0, today.targetCalories - today.consumedCalories)}</b> سعرة
            </span>
          `}
        </div>
        <div class="macro-bar-track" style="height: 8px;">
          <div class="macro-bar-fill" style="width: ${isOverCalories ? '100' : calPct}%; ${isOverCalories ? 'background: #FF5555; box-shadow: 0 0 10px rgba(255,85,85,0.7);' : ''}"></div>
        </div>

        ${isOverCalories ? `
          <div style="margin-top: 12px; background: rgba(255, 85, 85, 0.12); border: 1px solid #FF5555; border-radius: 12px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; color: #FF8888; font-size: 0.85rem; font-weight: 700; box-shadow: 0 0 14px rgba(255,85,85,0.25);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.2rem;">⚠️</span>
              <span>تم أكل <strong style="color: #FFFFFF; font-family: monospace;">${actualPct}%</strong> من سعرات اليوم</span>
            </div>
            <span class="badge" style="background: rgba(255,85,85,0.25); color: #FF5555; border: 1px solid #FF5555; font-family: monospace; font-size: 0.78rem;">
              +${exceededCals.toLocaleString('en-US')} سعرة زائدة
            </span>
          </div>
        ` : ''}

      </div>

      <!-- قسم الأكلات المسجلة اليوم -->
      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 900; color: #FFFFFF; margin: 0;">الأكلات المسجلة اليوم</h2>
            <small style="color: #8C9992; font-size: 0.8rem;">الوجبات التي أكلتها بالفعل اليوم (${loggedMeals.length})</small>
          </div>
          <a href="#meal-log" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 12px;">
            <span>➕ إضافة أكل</span>
          </a>
        </div>

        ${loggedMeals.length ? loggedMeals.map(meal => `
          <div class="neon-card" style="padding: 16px; border-color: rgba(85,247,165,0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 0.72rem; color: #55F7A5; font-weight: 700;">مسجلة ${meal.time || ''}</span>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF; margin: 2px 0 0;">${meal.titleAr}</h3>
              </div>
              <strong style="color: #55F7A5; font-size: 1.25rem; font-family: monospace;">${meal.calories} سعرة</strong>
            </div>

            <!-- أصناف الوجبة -->
            ${meal.items && meal.items.length ? `
              <div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0; padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid rgba(85,247,165,0.08);">
                ${meal.items.map(it => `
                  <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #FFFFFF;">
                    <span>${it.nameAr || it.name}</span>
                    <b style="color: #55F7A5; font-family: monospace;">${it.grams} غ</b>
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <!-- ماكروز الوجبة -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; font-size: 0.8rem; padding: 8px 0; border-top: 1px solid rgba(85,247,165,0.1); border-bottom: 1px solid rgba(85,247,165,0.1); margin-bottom: 10px;">
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.protein || 0}g</b><div style="color: #B8C0BC; font-size: 0.7rem;">بروتين</div></div>
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.carbs || 0}g</b><div style="color: #B8C0BC; font-size: 0.7rem;">كارب</div></div>
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.fats || 0}g</b><div style="color: #B8C0BC; font-size: 0.7rem;">دهون</div></div>
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.items?.length || 1}</b><div style="color: #B8C0BC; font-size: 0.7rem;">أصناف</div></div>
            </div>

            <div style="display: flex; gap: 8px; justify-content: flex-end;">
              <button type="button" class="btn btn-secondary edit-logged-meal-btn" data-meal-id="${meal.id}" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 10px;">
                ✏️ تعديل
              </button>
              <button type="button" class="btn btn-secondary delete-logged-meal-btn" data-meal-id="${meal.id}" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 10px; color: #FF6B6B; border-color: rgba(255,107,107,0.3);">
                🗑️ حذف
              </button>
            </div>
          </div>
        `).join('') : `
          <div class="neon-card" style="padding: 18px; text-align: center; color: #8C9992; font-size: 0.88rem;">
            لم تسجل أي وجبة اليوم بعد. اضغط "➕ إضافة أكل" لإضافة وجبتك الأولى.
          </div>
        `}
      </div>

      <!-- تم إخفاء قسم (الخطة المقترحة من المدرب وتوزيع الوجبات الموصى بها مع إمكانية التبديل) مؤقتاً بناءً على الطلب -->

      <!-- زر تسجيل وجبة الأساسي في الأسفل -->
      <a href="#meal-log" class="btn btn-primary btn-lg btn-block" style="border-radius: 24px; font-size: 1.15rem; box-shadow: var(--neon-glow-btn);">
        <span>تسجيل وجبة</span>
        <span style="font-size: 1.3rem;">➕</span>
      </a>

      <!-- نافذة تبديل الوجبة المنبثقة -->
      <div id="swap-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 20px; border-radius: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem;">🔁 اختر بديل الوجبة</h3>
            <button id="close-swap-modal-btn" class="btn-icon">✕</button>
          </div>
          <div id="swap-options-list" style="display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 60vh;">
          </div>
        </div>
      </div>

      <!-- نافذة تعديل الوجبة المسجلة المنبثقة -->
      <div id="edit-logged-meal-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 88vh; padding: 22px; border-radius: 24px; max-width: 460px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="color: #55F7A5; font-size: 1.25rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
              <span>✏️ تعديل الوجبة</span>
            </h3>
            <button type="button" id="close-edit-logged-meal-modal-btn" class="btn-icon" aria-label="إغلاق">✕</button>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #B8C0BC; margin-bottom: 6px;">
                اسم وتصنيف الوجبة
              </label>
              <input type="text" id="edit-logged-title-input" class="stack-field" style="width: 100%; border-radius: 12px; padding: 10px 14px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF; font-size: 0.95rem; font-weight: 700;" placeholder="اسم الوجبة...">
            </div>

            <!-- بطاقة ملخص الماكروز الحية للتعديل -->
            <div id="edit-logged-macros-summary" style="background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.25); border-radius: 14px; padding: 10px 14px; display: flex; justify-content: space-around; text-align: center;">
              <div>
                <div style="font-size: 0.72rem; color: #B8C0BC;">السعرات</div>
                <div id="edit-summary-cals" style="font-size: 1.15rem; font-weight: 900; color: #55F7A5; font-family: monospace;">0</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: #B8C0BC;">بروتين</div>
                <div id="edit-summary-protein" style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; font-family: monospace;">0غ</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: #B8C0BC;">كارب</div>
                <div id="edit-summary-carbs" style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; font-family: monospace;">0غ</div>
              </div>
              <div>
                <div style="font-size: 0.72rem; color: #B8C0BC;">دهون</div>
                <div id="edit-summary-fats" style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; font-family: monospace;">0غ</div>
              </div>
            </div>

            <!-- حقول المكونات أو الماكروز المباشرة -->
            <div id="edit-logged-meal-fields" style="display: flex; flex-direction: column; gap: 10px; max-height: 280px; overflow-y: auto; padding-right: 2px;"></div>

            <div style="display: flex; gap: 10px; margin-top: 6px;">
              <button type="button" id="save-edited-logged-meal-btn" class="btn btn-primary" style="flex: 1; border-radius: 14px; font-weight: 800; padding: 12px;">
                حفظ التعديل ✅
              </button>
              <button type="button" id="cancel-edit-logged-meal-btn" class="btn btn-secondary" style="border-radius: 14px; padding: 12px 18px;">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- نافذة تعديل هدف السعرات اليومي يدوياً -->
      <div id="edit-calorie-target-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 22px; border-radius: 24px; max-width: 440px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0;">🔥 تعديل هدف السعرات اليومي</h3>
            <button id="close-calorie-target-modal-btn" class="btn-icon">✕</button>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #FFFFFF; margin-bottom: 6px;">
                هدف السعرات الجديد
              </label>
              <div style="position: relative;">
                <input type="number" id="manual-target-calories-input" class="stack-field" style="font-size: 1.35rem; font-weight: 900; font-family: monospace; color: #55F7A5; padding-inline-end: 55px;" value="${today.targetCalories}" min="500" max="8000" step="1" inputmode="numeric" />
                <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8C9992; font-size: 0.85rem; font-weight: 700;">سعرة</span>
              </div>
            </div>

            <!-- خيار توزيع الماكروز -->
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(85, 247, 165, 0.15); border-radius: 14px; padding: 14px;">
              <div class="macro-options-row" style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                <span style="font-size: 0.85rem; font-weight: 800; color: #FFFFFF;">توزيع الماكروز</span>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.78rem; color: #55F7A5; cursor: pointer;">
                  <input type="checkbox" id="auto-recalc-macros-checkbox" checked style="accent-color: #55F7A5;" />
                  <span>توزيع ذكي تلقائي</span>
                </label>
              </div>

              <div id="custom-macros-inputs" style="display: none; flex-direction: column; gap: 10px;">
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                  <div>
                    <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">بروتين (غ)</label>
                    <input type="number" id="manual-protein-input" class="stack-field" style="padding: 6px; text-align: center; font-family: monospace; font-size: 0.9rem;" value="${today.targetProtein}" />
                    <span style="font-size: 0.68rem; color: #8fa097; display: block; margin-top: 2px;">× 4 سعرة</span>
                  </div>
                  <div>
                    <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">كارب (غ)</label>
                    <input type="number" id="manual-carbs-input" class="stack-field" style="padding: 6px; text-align: center; font-family: monospace; font-size: 0.9rem;" value="${today.targetCarbs}" />
                    <span style="font-size: 0.68rem; color: #8fa097; display: block; margin-top: 2px;">× 4 سعرة</span>
                  </div>
                  <div>
                    <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">دهون (غ)</label>
                    <input type="number" id="manual-fats-input" class="stack-field" style="padding: 6px; text-align: center; font-family: monospace; font-size: 0.9rem;" value="${today.targetFats}" />
                    <span style="font-size: 0.68rem; color: #8fa097; display: block; margin-top: 2px;">× 9 سعرة</span>
                  </div>
                </div>

                <!-- ملخص مجموع سعرات الماكروز الحسابي -->
                <div style="background: rgba(0,0,0,0.5); padding: 8px 12px; border-radius: 10px; border: 1px solid rgba(85,247,165,0.2); font-size: 0.78rem; display: flex; justify-content: space-between; align-items: center;">
                  <span style="color: #B8C0BC;">مجموع سعرات الماكروز:</span>
                  <span id="manual-macros-cals-sum" style="color: #55F7A5; font-weight: 800; font-family: monospace; font-size: 0.95rem;">${(today.targetProtein * 4) + (today.targetCarbs * 4) + (today.targetFats * 9)} سعرة</span>
                </div>

                <!-- تنبيه عدم التطابق والزر الذكي لتعديل وتوزيع الماكروز -->
                <div id="macro-validation-warning" style="display: none; padding: 12px; border-radius: 12px; background: rgba(255, 85, 85, 0.12); border: 1px solid #FF5555; color: #FFAAAA; font-size: 0.8rem; line-height: 1.5;">
                  <div style="font-weight: 800; color: #FF5555; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                    <span>⚠️ تنبيه: الماكروز المدخلة لا تطابق هدف السعرات!</span>
                  </div>
                  <div id="macro-validation-text"></div>
                  <div style="font-size: 0.72rem; color: #B8C0BC; margin-top: 6px; border-top: 1px dashed rgba(255,85,85,0.3); padding-top: 4px;">
                    💡 <strong>القاعدة العلمية:</strong> 1غ بروتين = 4 سعرة | 1غ كارب = 4 سعرة | 1غ دهون = 9 سعرة
                  </div>
                  <button type="button" id="auto-fix-macros-btn" class="btn btn-primary" style="width: 100%; margin-top: 8px; padding: 8px 12px; font-size: 0.78rem; font-weight: 800; border-radius: 8px;">
                    ⚡ تعديل واقتراح تقسيم الماكروز لتطابق الهدف تماماً
                  </button>
                </div>

                <div id="macro-validation-success" style="display: none; padding: 8px 12px; border-radius: 10px; background: rgba(85, 247, 165, 0.1); border: 1px solid #55F7A5; color: #55F7A5; font-size: 0.78rem; font-weight: 700;">
                  ✅ الماكروز مطابقة بدقة لهدف السعرات (100% علمياً)
                </div>
              </div>

              <div id="auto-macros-preview" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; font-size: 0.82rem; color: #B8C0BC;">
                <div>بروتين: <b id="preview-protein" style="color: #FFFFFF; font-family: monospace;">${today.targetProtein}غ</b></div>
                <div>كارب: <b id="preview-carbs" style="color: #FFFFFF; font-family: monospace;">${today.targetCarbs}غ</b></div>
                <div>دهون: <b id="preview-fats" style="color: #FFFFFF; font-family: monospace;">${today.targetFats}غ</b></div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button id="save-calorie-target-btn" class="btn btn-primary" style="flex: 1; border-radius: 14px; font-weight: 800; padding: 12px;">
                حفظ الهدف الجديد ✅
              </button>
              <button id="cancel-calorie-target-btn" class="btn btn-secondary" style="border-radius: 14px; padding: 12px 18px;">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function removeDetachedModals() {
  ['edit-logged-meal-modal', 'edit-calorie-target-modal', 'swap-modal'].forEach(id => {
    const el = document.getElementById(id);
    if (el && el.parentElement === document.body) {
      el.remove();
    }
  });
}

function refreshNutritionView() {
  removeDetachedModals();
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderNutritionView();
    bindNutritionEvents();
  }
}

function getMealIcon(type) {
  switch (type) {
    case 'breakfast': return '🌅';
    case 'lunch': return '☀️';
    case 'dinner': return '🌙';
    case 'snack': return '🍏';
    default: return '🍽️';
  }
}

export function bindNutritionEvents() {
  // زر الرجوع
  document.getElementById('nutrition-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#today';
  });

  // زر قائمة المشتريات
  document.getElementById('shopping-list-btn')?.addEventListener('click', () => {
    window.location.hash = '#shopping-list';
  });

  // حذف وجبة مسجلة فوراً
  document.querySelectorAll('.delete-logged-meal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mealId = btn.getAttribute('data-meal-id');
      store.deleteLoggedMeal(mealId);
      notificationService.showToast('تم حذف الوجبة وتصحيح المجاميع اليومية', 'info');
      refreshNutritionView();
    });
  });

  // عناصر نافذة تعديل الوجبة المسجلة
  const editModal = document.getElementById('edit-logged-meal-modal');
  const closeEditModalBtn = document.getElementById('close-edit-logged-meal-modal-btn');
  const cancelEditModalBtn = document.getElementById('cancel-edit-logged-meal-btn');
  const editTitleInput = document.getElementById('edit-logged-title-input');
  const editFieldsContainer = document.getElementById('edit-logged-meal-fields');
  const saveEditedBtn = document.getElementById('save-edited-logged-meal-btn');
  const calModal = document.getElementById('edit-calorie-target-modal');
  const swapModal = document.getElementById('swap-modal');
  let currentEditingMealId = null;

  // نقل النوافذ المنبثقة إلى document.body مباشرة لضمان ظهورها أمام المستخدم بدقة 100% فوق كل العناصر ودون تأثر بالتمرير
  [editModal, calModal, swapModal].forEach(modal => {
    if (modal && modal.parentElement !== document.body) {
      modal.dataset.routeModal = 'nutrition';
      modal.setAttribute('role', 'dialog');
      document.body.appendChild(modal);
    }
  });

  const closeEditModal = () => {
    editModal?.classList.remove('open');
    currentEditingMealId = null;
  };

  closeEditModalBtn?.addEventListener('click', closeEditModal);
  cancelEditModalBtn?.addEventListener('click', closeEditModal);
  editModal?.addEventListener('click', (e) => {
    if (e.target === editModal) closeEditModal();
  });

  // فتح وتعبئة نافذة تعديل الوجبة
  document.querySelectorAll('.edit-logged-meal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const mealId = btn.getAttribute('data-meal-id');
      const meal = (store.getState().loggedMeals || []).find(m => m.id === mealId);
      if (!meal || !editFieldsContainer) return;
      currentEditingMealId = mealId;

      if (editTitleInput) editTitleInput.value = meal.titleAr || 'وجبة مسجلة';

      const items = meal.items || [];
      if (items.length > 0) {
        editFieldsContainer.innerHTML = items.map((item, idx) => `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(85,247,165,0.15); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div style="flex: 1;">
              <span style="color: #FFFFFF; font-weight: 700; font-size: 0.9rem; display: block;">${item.nameAr || item.name}</span>
              <small class="item-cal-badge" id="item-cal-${idx}" style="color: #55F7A5; font-size: 0.76rem;">${item.calories || 0} سعرة</small>
            </div>
            <div style="display: flex; align-items: center; gap: 6px;">
              <input type="number" class="edit-logged-grams" data-idx="${idx}" value="${item.grams || 100}" min="0" step="5" style="width: 85px; text-align: center; border-radius: 10px; background: #020704; border: 1px solid rgba(85,247,165,0.35); color: #FFFFFF; font-size: 1rem; font-weight: 800; font-family: monospace; padding: 8px 4px;">
              <span style="color: #55F7A5; font-weight: 700; font-size: 0.85rem;">غ</span>
            </div>
          </div>
        `).join('');
      } else {
        // وجبة مباشرة بدون تفصيل أصناف
        editFieldsContainer.innerHTML = `
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="grid-column: span 2;">
              <label style="font-size: 0.78rem; color: #B8C0BC; display: block; margin-bottom: 4px;">السعرات الإجمالية (سعرة)</label>
              <input type="number" id="edit-direct-cals" class="stack-field" style="width: 100%; padding: 8px 12px; font-size: 1.1rem; font-weight: 800; font-family: monospace; color: #55F7A5; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px;" value="${meal.calories || 0}">
            </div>
            <div>
              <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">بروتين (غ)</label>
              <input type="number" id="edit-direct-protein" class="stack-field" style="width: 100%; padding: 8px; font-size: 0.95rem; font-family: monospace; text-align: center; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px; color: #FFFFFF;" value="${meal.protein || 0}">
            </div>
            <div>
              <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">كارب (غ)</label>
              <input type="number" id="edit-direct-carbs" class="stack-field" style="width: 100%; padding: 8px; font-size: 0.95rem; font-family: monospace; text-align: center; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px; color: #FFFFFF;" value="${meal.carbs || 0}">
            </div>
            <div style="grid-column: span 2;">
              <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">دهون (غ)</label>
              <input type="number" id="edit-direct-fats" class="stack-field" style="width: 100%; padding: 8px; font-size: 0.95rem; font-family: monospace; text-align: center; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px; color: #FFFFFF;" value="${meal.fats || 0}">
            </div>
          </div>
        `;
      }

      // حساب وتحديث الملخص اللحظي
      const updateLiveEditSummary = () => {
        let totalC = 0, totalP = 0, totalCarb = 0, totalF = 0;
        if (items.length > 0) {
          editFieldsContainer.querySelectorAll('.edit-logged-grams').forEach(inp => {
            const idx = Number(inp.getAttribute('data-idx'));
            const newG = Math.max(0, Number(inp.value) || 0);
            const it = items[idx];
            if (it) {
              const m = it.foodId ? macrosFor(it.foodId, newG) : null;
              let itemCal = 0;
              if (m) {
                itemCal = Math.round(m.kcal);
                totalP += Math.round(m.p);
                totalCarb += Math.round(m.c);
                totalF += Math.round(m.f);
              } else {
                const ratio = (it.grams && it.grams > 0) ? (newG / it.grams) : 1;
                itemCal = Math.round((it.calories || 0) * ratio);
                totalP += Math.round((it.protein || 0) * ratio);
                totalCarb += Math.round((it.carbs || 0) * ratio);
                totalF += Math.round((it.fats || 0) * ratio);
              }
              totalC += itemCal;
              const badge = document.getElementById(`item-cal-${idx}`);
              if (badge) badge.textContent = `${itemCal} سعرة`;
            }
          });
        } else {
          totalC = Number(document.getElementById('edit-direct-cals')?.value) || 0;
          totalP = Number(document.getElementById('edit-direct-protein')?.value) || 0;
          totalCarb = Number(document.getElementById('edit-direct-carbs')?.value) || 0;
          totalF = Number(document.getElementById('edit-direct-fats')?.value) || 0;
        }

        const sumC = document.getElementById('edit-summary-cals');
        const sumP = document.getElementById('edit-summary-protein');
        const sumCarb = document.getElementById('edit-summary-carbs');
        const sumF = document.getElementById('edit-summary-fats');
        if (sumC) sumC.textContent = totalC.toLocaleString('en-US');
        if (sumP) sumP.textContent = `${totalP}غ`;
        if (sumCarb) sumCarb.textContent = `${totalCarb}غ`;
        if (sumF) sumF.textContent = `${totalF}غ`;
      };

      editFieldsContainer.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', updateLiveEditSummary);
      });

      updateLiveEditSummary();
      editModal?.classList.add('open');
    });
  });

  saveEditedBtn?.addEventListener('click', () => {
    if (!currentEditingMealId) return;
    const meal = (store.getState().loggedMeals || []).find(m => m.id === currentEditingMealId);
    if (!meal) return;

    const copy = JSON.parse(JSON.stringify(meal));
    if (editTitleInput) {
      const newTitle = editTitleInput.value.trim();
      if (newTitle) copy.titleAr = newTitle;
    }

    const items = copy.items || [];
    if (items.length > 0) {
      editFieldsContainer?.querySelectorAll('.edit-logged-grams').forEach(input => {
        const idx = Number(input.getAttribute('data-idx'));
        const newGrams = Math.max(0, Number(input.value) || 0);
        const item = copy.items[idx];
        if (item) {
          item.grams = newGrams;
          const m = item.foodId ? macrosFor(item.foodId, newGrams) : null;
          if (m) {
            item.calories = Math.round(m.kcal);
            item.protein = Math.round(m.p);
            item.carbs = Math.round(m.c);
            item.fats = Math.round(m.f);
          } else {
            const ratio = (item.grams && item.grams > 0) ? (newGrams / item.grams) : 1;
            item.calories = Math.round((item.calories || 0) * ratio);
            item.protein = Math.round((item.protein || 0) * ratio);
            item.carbs = Math.round((item.carbs || 0) * ratio);
            item.fats = Math.round((item.fats || 0) * ratio);
          }
        }
      });

      copy.calories = copy.items.reduce((s, i) => s + (i.calories || 0), 0);
      copy.protein = copy.items.reduce((s, i) => s + (i.protein || 0), 0);
      copy.carbs = copy.items.reduce((s, i) => s + (i.carbs || 0), 0);
      copy.fats = copy.items.reduce((s, i) => s + (i.fats || 0), 0);
    } else {
      copy.calories = Number(document.getElementById('edit-direct-cals')?.value) || 0;
      copy.protein = Number(document.getElementById('edit-direct-protein')?.value) || 0;
      copy.carbs = Number(document.getElementById('edit-direct-carbs')?.value) || 0;
      copy.fats = Number(document.getElementById('edit-direct-fats')?.value) || 0;
    }

    store.updateLoggedMeal(currentEditingMealId, copy);
    closeEditModal();
    notificationService.showToast('تم تعديل الوجبة وتحديث السعرات اليومية بنجاح 🥗', 'success');
    refreshNutritionView();
  });

  // فتح وإغلاق تفاصيل المكونات للخطة المقترحة
  document.querySelectorAll('.toggle-meal-expand').forEach(btn => {
    btn.addEventListener('click', () => {
      const mealId = btn.getAttribute('data-meal-id');
      const details = document.getElementById(`meal-details-${mealId}`);
      if (details) {
        const isHidden = details.style.display === 'none';
        details.style.display = isHidden ? 'block' : 'none';
        btn.textContent = isHidden ? '▲' : '▼';
      }
    });
  });

  // فتح نافذة تبديل الوجبة
  const closeSwapBtn = document.getElementById('close-swap-modal-btn');
  const swapList = document.getElementById('swap-options-list');

  closeSwapBtn?.addEventListener('click', () => {
    swapModal?.classList.remove('open');
  });

  document.querySelectorAll('.swap-meal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const mealId = btn.getAttribute('data-meal-id');
      const meal = store.getState().mealPlan.meals.find(m => m.id === mealId);
      if (!meal || !swapList) return;

      const userAllergens = store.getState().userProfile.allergens || [];
      const swaps = findMealSwaps(meal, userAllergens);

      swapList.innerHTML = swaps.map((sw, idx) => `
        <div class="neon-card" style="padding: 16px; border-color: rgba(85,247,165,0.3);">
          <div style="font-weight: 800; color: #FFFFFF; font-size: 1rem; margin-bottom: 4px;">${sw.titleAr}</div>
          <div style="font-size: 0.85rem; color: #B8C0BC; margin-bottom: 8px;">${sw.description}</div>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #55F7A5; font-family: monospace; font-size: 0.9rem;">${sw.calories} سعرة | ${sw.protein}غ بروتين</span>
            <button class="btn btn-primary select-swap-option" data-meal-id="${meal.id}" data-swap-index="${idx}" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 12px;">
              اعتماد البديل
            </button>
          </div>
        </div>
      `).join('');

      swapModal?.classList.add('open');

      document.querySelectorAll('.select-swap-option').forEach(selBtn => {
        selBtn.addEventListener('click', () => {
          const swIdx = Number(selBtn.getAttribute('data-swap-index'));
          const selectedSwap = swaps[swIdx];
          store.swapMealPlan(mealId, selectedSwap);
          swapModal?.classList.remove('open');
          notificationService.showToast('تم تبديل الوجبة بنجاح وتحديث خطتك الغذائية 🥗', 'success');
          refreshNutritionView();
        });
      });
    });
  });

  // نافذة تعديل هدف السعرات اليومي يدوياً
  const openCalBtn = document.getElementById('edit-calorie-target-btn');
  const targetWrap = document.getElementById('target-calories-display-wrap');
  const closeCalBtn = document.getElementById('close-calorie-target-modal-btn');
  const cancelCalBtn = document.getElementById('cancel-calorie-target-btn');
  const saveCalBtn = document.getElementById('save-calorie-target-btn');
  const calInput = document.getElementById('manual-target-calories-input');
  const autoCheckbox = document.getElementById('auto-recalc-macros-checkbox');
  const customInputs = document.getElementById('custom-macros-inputs');
  const previewDiv = document.getElementById('auto-macros-preview');

  const openCalModal = () => {
    calModal?.classList.add('open');
    calInput?.focus();
    calInput?.select();
  };

  openCalBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    openCalModal();
  });
  targetWrap?.addEventListener('click', openCalModal);

  closeCalBtn?.addEventListener('click', () => calModal?.classList.remove('open'));
  cancelCalBtn?.addEventListener('click', () => calModal?.classList.remove('open'));
  calModal?.addEventListener('click', (e) => {
    if (e.target === calModal) calModal.classList.remove('open');
  });
  swapModal?.addEventListener('click', (e) => {
    if (e.target === swapModal) swapModal.classList.remove('open');
  });

  // التحقق الحي من تطابق سعرات الماكروز مع هدف السعرات اليومية
  const updateMacroValidation = () => {
    const targetVal = Number(calInput?.value) || 0;
    const manP = document.getElementById('manual-protein-input');
    const manC = document.getElementById('manual-carbs-input');
    const manF = document.getElementById('manual-fats-input');

    const p = Number(manP?.value) || 0;
    const c = Number(manC?.value) || 0;
    const f = Number(manF?.value) || 0;

    const totalFromMacros = (p * 4) + (c * 4) + (f * 9);
    const sumElem = document.getElementById('manual-macros-cals-sum');
    if (sumElem) {
      sumElem.textContent = `${totalFromMacros.toLocaleString('en-US')} سعرة`;
    }

    const warningBox = document.getElementById('macro-validation-warning');
    const warningText = document.getElementById('macro-validation-text');
    const successBox = document.getElementById('macro-validation-success');

    if (autoCheckbox?.checked) {
      if (warningBox) warningBox.style.display = 'none';
      if (successBox) successBox.style.display = 'none';
      return;
    }

    const diff = totalFromMacros - targetVal;
    if (Math.abs(diff) > 5) {
      if (warningBox) warningBox.style.display = 'block';
      if (successBox) successBox.style.display = 'none';
      if (warningText) {
        warningText.innerHTML = `مجموع سعرات الماكروز التي أدخلتها هو <strong>${totalFromMacros.toLocaleString('en-US')} سعرة</strong> (${p}غ بروتين × 4 + ${c}غ كارب × 4 + ${f}غ دهون × 9)، بينما هدف السعرات اليومية الذي حددته هو <strong>${targetVal.toLocaleString('en-US')} سعرة</strong>.<br>هناك فرق قدره <strong style="color: #FF5555; font-family: monospace;">${diff > 0 ? '+' + diff.toLocaleString('en-US') : diff.toLocaleString('en-US')} سعرة</strong>.`;
      }
    } else {
      if (warningBox) warningBox.style.display = 'none';
      if (successBox) successBox.style.display = 'block';
    }
  };

  // زر الاقتراح والتعديل التلقائي للماكروز لتطابق الهدف العلمي
  const autoFixBtn = document.getElementById('auto-fix-macros-btn');
  autoFixBtn?.addEventListener('click', () => {
    const targetVal = Number(calInput?.value) || 2000;
    const userWeight = store.getState().userProfile?.currentWeight || 75;
    const pInput = document.getElementById('manual-protein-input');
    const cInput = document.getElementById('manual-carbs-input');
    const fInput = document.getElementById('manual-fats-input');

    const curP = Number(pInput?.value) || 0;
    const curC = Number(cInput?.value) || 0;
    const curF = Number(fInput?.value) || 0;
    const curTotal = (curP * 4) + (curC * 4) + (curF * 9);

    let newP, newF, newC;
    if (curTotal > 0 && curP > 0) {
      // تعديل نسبي ذكي يحافظ على نسب المتدرب المفضلة
      const pRatio = (curP * 4) / curTotal;
      const fRatio = (curF * 9) / curTotal;
      newP = Math.round((targetVal * pRatio) / 4);
      newF = Math.round((targetVal * fRatio) / 9);
      newC = Math.round(Math.max(0, targetVal - (newP * 4 + newF * 9)) / 4);
    } else {
      // توزيع رياضي علمي متوازن
      newP = Math.round(Math.min(userWeight * 2.2, (targetVal * 0.3) / 4));
      newF = Math.round((targetVal * 0.25) / 9);
      newC = Math.round(Math.max(0, targetVal - (newP * 4 + newF * 9)) / 4);
    }

    if (pInput) pInput.value = newP;
    if (fInput) fInput.value = newF;
    if (cInput) cInput.value = newC;

    updateMacroValidation();
    notificationService.showToast(`تم تعديل الماكروز لتطابق ${targetVal.toLocaleString('en-US')} سعرة بدقة! ⚖️`, 'success');
  });

  document.getElementById('manual-protein-input')?.addEventListener('input', updateMacroValidation);
  document.getElementById('manual-carbs-input')?.addEventListener('input', updateMacroValidation);
  document.getElementById('manual-fats-input')?.addEventListener('input', updateMacroValidation);

  // تحديث المعاينة الحية عند كتابة السعرات
  const updatePreview = () => {
    const val = Number(calInput?.value) || 2000;
    const userWeight = store.getState().userProfile?.currentWeight || 75;
    const p = Math.round(Math.min(userWeight * 2.2, (val * 0.3) / 4));
    const f = Math.round((val * 0.25) / 9);
    const rem = Math.max(0, val - (p * 4 + f * 9));
    const c = Math.round(rem / 4);

    const prevP = document.getElementById('preview-protein');
    const prevC = document.getElementById('preview-carbs');
    const prevF = document.getElementById('preview-fats');
    if (prevP) prevP.textContent = `${p}غ`;
    if (prevC) prevC.textContent = `${c}غ`;
    if (prevF) prevF.textContent = `${f}غ`;

    const manP = document.getElementById('manual-protein-input');
    const manC = document.getElementById('manual-carbs-input');
    const manF = document.getElementById('manual-fats-input');
    if (manP && autoCheckbox?.checked) manP.value = p;
    if (manC && autoCheckbox?.checked) manC.value = c;
    if (manF && autoCheckbox?.checked) manF.value = f;

    updateMacroValidation();
  };

  calInput?.addEventListener('input', updatePreview);

  autoCheckbox?.addEventListener('change', () => {
    if (autoCheckbox.checked) {
      if (customInputs) customInputs.style.display = 'none';
      if (previewDiv) previewDiv.style.display = 'grid';
      updatePreview();
    } else {
      if (customInputs) customInputs.style.display = 'flex';
      if (previewDiv) previewDiv.style.display = 'none';
      updateMacroValidation();
    }
  });

  saveCalBtn?.addEventListener('click', () => {
    const newTarget = Number(calInput?.value);
    if (!Number.isFinite(newTarget) || newTarget < 500 || newTarget > 8000) {
      notificationService.showToast('أدخل هدفاً بين 500 و8000 سعرة. لم يتم تغيير هدفك.', 'error');
      calInput?.focus();
      return;
    }

    let customMacros = null;
    if (!autoCheckbox?.checked) {
      const p = Number(document.getElementById('manual-protein-input')?.value) || 0;
      const c = Number(document.getElementById('manual-carbs-input')?.value) || 0;
      const f = Number(document.getElementById('manual-fats-input')?.value) || 0;
      const macroTotal = (p * 4) + (c * 4) + (f * 9);
      const diff = Math.abs(macroTotal - newTarget);

      if (diff > 25) {
        notificationService.showToast(`تنبيه: مجموع الماكروز (${macroTotal} سعرة) يختلف عن الهدف (${newTarget} سعرة). يمكنك استخدام زر التعديل التلقائي لمطابقتها!`, 'warning');
      }

      customMacros = { protein: p, carbs: c, fats: f };
    }

    store.setTargetCalories(newTarget, customMacros);
    calModal?.classList.remove('open');
    notificationService.showToast(`تم تعديل هدف السعرات اليومي إلى ${newTarget.toLocaleString('en-US')} سعرة بنجاح 🔥`, 'success');
    refreshNutritionView();
  });
}
