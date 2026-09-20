/**
 * NEON COACH - شاشة خطة التغذية اليومية وسجل الوجبات
 * تفاعلية بالكامل: تعديل وحذف وتبديل الوجبات يعمل فوراً
 */

import { store } from '../state/store.js';
import { calculatePercentage } from '../domain/calculations.js';
import { findMealSwaps } from '../domain/nutritionEngine.js';
import { macrosFor, isCountBasedFood, isLiquidFood, getFoodPieceWeight, getFoodUnitLabel, searchFoods } from '../data/foods.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';
import { renderCustomFoodModal, bindCustomFoodModal } from '../components/customFoodModal.js';

export function renderNutritionView() {
  const state = store.getState();
  const { today, mealPlan } = state;
  const loggedMeals = (state.loggedMeals || []).filter(meal => !meal.date || meal.date === state.today.date);

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
          <span class="badge badge-verified" style="display: inline-flex; align-items: center; gap: 4px;">
            ${neonIcon('shield', 14)} خطة معتمدة
          </span>
        </div>
        <button id="shopping-list-btn" class="btn-icon" title="قائمة المشتريات" aria-label="قائمة المشتريات">

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
              <button id="edit-calorie-target-btn" class="btn btn-secondary" style="padding: 2px 8px; font-size: 0.75rem; border-radius: 8px; gap: 4px; height: 24px; border-color: rgba(85,247,165,0.3); display: inline-flex; align-items: center;" title="تعديل هدف السعرات يدوياً">
                <span>تعديل</span>
                ${neonIcon('pencil', 12)}
              </button>
            </div>
            <div id="target-calories-display-wrap" style="display: flex; align-items: baseline; gap: 6px; margin-bottom: 8px; cursor: pointer;" title="اضغط للتعديل اليدوي">
              <span style="font-size: 2.2rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">
                ${today.targetCalories.toLocaleString('en-US')}
              </span>
              <span style="font-size: 0.85rem; color: #B8C0BC;">سعرة</span>
              <span style="margin-inline-start: auto; display: inline-flex; align-items: center;">${neonIcon('flame', 22)}</span>
            </div>

            <!-- تفصيل السعرات الكلية والمخصوم والمتبقي -->
            <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 4px; font-size: 0.76rem; background: ${isOverCalories ? 'rgba(255,85,85,0.08)' : 'rgba(255,255,255,0.03)'}; border: 1px solid ${isOverCalories ? 'rgba(255,85,85,0.3)' : 'rgba(85,247,165,0.18)'}; border-radius: 8px; padding: 6px 8px; margin-bottom: 12px; word-break: break-word;">
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
            ${neonIcon('plate', 18)}
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
              ${neonIcon('alert', 20)}
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
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 900; color: #FFFFFF; margin: 0;">الأكلات المسجلة اليوم</h2>
            <small style="color: #8C9992; font-size: 0.8rem;">الوجبات التي أكلتها بالفعل اليوم (${loggedMeals.length})</small>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <button type="button" id="open-custom-food-btn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px; border-color: rgba(85,247,165,0.35);" title="إضافة أو تعديل أكلة في قاعدة البيانات">
              <span> أكلاتي المخصصة</span>
            </button>
            <button type="button" id="open-saved-meals-btn" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 12px; display: inline-flex; align-items: center; gap: 4px; border-color: rgba(255,200,60,0.4); color: #FFC83C; background: rgba(255,200,60,0.07);" title="الوجبات المحفوظة والمفضلة">
              <span>⭐ وجباتي</span>
            </button>
            <a href="#meal-log" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.85rem; border-radius: 12px;">
              <span> إضافة وجبة</span>
            </a>
          </div>
        </div>

        ${loggedMeals.length ? loggedMeals.map(meal => `
          <div class="neon-card" style="padding: 16px; border-color: rgba(85,247,165,0.25);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 8px;">
              <div>
                <span style="font-size: 0.72rem; color: #55F7A5; font-weight: 700;">مسجلة ${meal.time || ''}</span>
                <h3 style="font-size: 1.1rem; font-weight: 800; color: #FFFFFF; margin: 2px 0 0;">${meal.titleAr || meal.name || 'وجبة مسجلة'}</h3>
              </div>
              <strong style="color: #55F7A5; font-size: 1.25rem; font-family: monospace;">${meal.calories} سعرة</strong>
            </div>

            <!-- أصناف الوجبة -->
            ${meal.items && meal.items.length ? `
              <div style="display: flex; flex-direction: column; gap: 6px; margin: 8px 0; padding: 10px 12px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid rgba(85,247,165,0.08);">
                ${meal.items.map(it => {
                  const isCount = it.isCountBased || isCountBasedFood(it.foodId || it.nameAr || it.name);
                  const pWeight = it.pieceWeight || getFoodPieceWeight(it.foodId || it.nameAr || it.name);
                  const uLabel = it.unitLabel || getFoodUnitLabel(it.foodId || it.nameAr || it.name);
                  const countVal = it.count || Math.max(1, Math.round((it.grams || pWeight) / pWeight));
                  const displayQty = isCount ? `${countVal} ${uLabel} <span style="color: #8C9992; font-size: 0.72rem; font-family: monospace;">(~${it.grams}${uLabel === 'مل' ? 'مل' : 'غ'})</span>` : `${it.grams} ${uLabel || 'غ'}`;

                  return `
                    <div style="display: flex; justify-content: space-between; font-size: 0.88rem; color: #FFFFFF; align-items: center;">
                      <span>${it.nameAr || it.name}</span>
                      <b style="color: #55F7A5; font-family: monospace;">${displayQty}</b>
                    </div>
                  `;
                }).join('')}
              </div>
            ` : ''}

            <!-- ماكروز الوجبة -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; text-align: center; font-size: 0.8rem; padding: 8px 0; border-top: 1px solid rgba(85,247,165,0.1); border-bottom: 1px solid rgba(85,247,165,0.1); margin-bottom: 10px;">
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.protein || 0}g</b><div style="color: #B8C0BC; font-size: 0.7rem;">بروتين</div></div>
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.carbs || 0}g</b><div style="color: #B8C0BC; font-size: 0.7rem;">كارب</div></div>
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.fats || 0}g</b><div style="color: #B8C0BC; font-size: 0.7rem;">دهون</div></div>
              <div><b style="color: #FFFFFF; font-family: monospace;">${meal.items?.length || 1}</b><div style="color: #B8C0BC; font-size: 0.7rem;">أصناف</div></div>
            </div>

            <div style="display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap;">
              <button type="button" class="btn btn-secondary save-logged-to-fav-btn" data-meal-id="${meal.id}" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px; color: #FFC83C; border-color: rgba(255,200,60,0.35); background: rgba(255,200,60,0.06);" title="حفظ هذه الوجبة في وجباتي المفضلة">
                <span>⭐ للمفضلة</span>
              </button>
              <button type="button" class="btn btn-secondary edit-logged-meal-btn" data-meal-id="${meal.id}" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px;">
                ${neonIcon('pencil', 14)} تعديل
              </button>
              <button type="button" class="btn btn-secondary delete-logged-meal-btn" data-meal-id="${meal.id}" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 10px; color: #FF6B6B; border-color: rgba(255,107,107,0.3);">
                 حذف
              </button>
            </div>
          </div>
        `).join('') : `
          <div class="neon-card" style="padding: 18px; text-align: center; color: #8C9992; font-size: 0.88rem;">
            لم تسجل أي وجبة اليوم بعد. اضغط " إضافة وجبة" لإضافة وجبتك الأولى.
          </div>
        `}
      </div>

      <!-- تم إخفاء قسم (الخطة المقترحة من المدرب وتوزيع الوجبات الموصى بها مع إمكانية التبديل) مؤقتاً بناءً على الطلب -->

      <!-- نافذة الوجبات المحفوظة -->
      <div id="saved-meals-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 20px; border-radius: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #FFC83C; font-size: 1.15rem; font-weight: 900; margin: 0;">⭐ وجباتي المحفوظة</h3>
            <button type="button" id="close-saved-meals-modal-btn" class="btn-icon" data-action="close" aria-label="إغلاق">✕</button>
          </div>
          <div id="saved-meals-modal-list" style="display: flex; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 65vh;">
          </div>
        </div>
      </div>

      <!-- نافذة تبديل الوجبة المنبثقة -->
      <div id="swap-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 20px; border-radius: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="color: #55F7A5; font-size: 1.2rem;"> اختر بديل الوجبة</h3>
            <button type="button" id="close-swap-modal-btn" class="btn-icon" data-action="close" aria-label="إغلاق">✕</button>
          </div>
          <div id="swap-options-list" style="display: flex; flex-direction: column; gap: 12px; overflow-y: auto; max-height: 60vh;">
          </div>
        </div>
      </div>

      <!-- نافذة تعديل الوجبة المسجلة المنبثقة -->
      <div id="edit-logged-meal-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 88vh; padding: 22px; border-radius: 24px; max-width: 470px; margin: auto;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="color: #55F7A5; font-size: 1.25rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${neonIcon('pencil', 20)}
              <span>تعديل الوجبة</span>
            </h3>
            <button type="button" id="close-edit-logged-meal-modal-btn" class="btn-icon" data-action="close" aria-label="إغلاق">✕</button>
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

            <!-- أصناف الوجبة الحالية مع إمكانية حذف أو تعديل أي صنف -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.82rem; font-weight: 700; color: #B8C0BC;">مكونات الوجبة</label>
                <small id="edit-items-count-label" style="color: #55F7A5; font-size: 0.75rem;"></small>
              </div>
              <div id="edit-logged-meal-fields" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto; padding-right: 2px;"></div>
            </div>

            <!-- إضافة صنف جديد من قاعدة البيانات -->
            <div style="position: relative; border-top: 1px dashed rgba(85,247,165,0.2); padding-top: 10px;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #55F7A5; margin-bottom: 6px;">
                + إضافة صنف جديد من قاعدة البيانات:
              </label>
              <input type="text" id="edit-meal-food-search-input" class="stack-field" style="width: 100%; border-radius: 12px; padding: 9px 12px; font-size: 0.85rem; background: #020704; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF;" placeholder="ابحث في قاعدة البيانات (شوفان، دجاج، موز، رز...)">
              <div id="edit-meal-food-search-results" style="display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; background: #08130F; border: 1px solid rgba(85,247,165,0.3); border-radius: 12px; max-height: 190px; overflow-y: auto; padding: 6px; box-shadow: 0 10px 30px rgba(0,0,0,0.95); margin-top: 4px;"></div>
            </div>

            <div style="display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap;">
              <button type="button" id="save-edited-logged-meal-btn" class="btn btn-primary" style="flex: 1; min-width: 120px; border-radius: 14px; font-weight: 800; padding: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                <span>حفظ التعديل</span>
                ${neonIcon('check', 16)}
              </button>
              <button type="button" id="save-edited-as-fav-btn" class="btn btn-secondary" style="border-radius: 14px; padding: 12px 14px; color: #FFC83C; border-color: rgba(255,200,60,0.4); background: rgba(255,200,60,0.07); display: inline-flex; align-items: center; justify-content: center; gap: 4px;" title="حفظ هذه الوجبة كما هي في الوجبات المفضلة">
                <span>⭐ للمفضلة</span>
              </button>
              <button type="button" id="cancel-edit-logged-meal-btn" class="btn btn-secondary" data-action="close" style="border-radius: 14px; padding: 12px 16px;">
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
            <h3 style="color: #55F7A5; font-size: 1.2rem; margin: 0; display: flex; align-items: center; gap: 8px;">
              ${neonIcon('flame', 22)}
              <span>تعديل هدف السعرات اليومي</span>
            </h3>
            <button type="button" id="close-calorie-target-modal-btn" class="btn-icon" data-action="close" aria-label="إغلاق">✕</button>
          </div>
          
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <div>
              <label style="display: block; font-size: 0.85rem; font-weight: 700; color: #FFFFFF; margin-bottom: 6px;">
                هدف السعرات الجديد
              </label>
              <div style="position: relative;">
                <input type="number" id="manual-target-calories-input" class="stack-field" style="font-size: 1.35rem; font-weight: 900; font-family: monospace; color: #55F7A5; padding-inline-end: 55px;" value="${today.targetCalories}" min="800" max="8000" step="50" />
                <span style="position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #8C9992; font-size: 0.85rem; font-weight: 700;">سعرة</span>
              </div>
            </div>

            <!-- خيار توزيع الماكروز -->
            <div style="background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(85, 247, 165, 0.15); border-radius: 14px; padding: 14px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
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
                    ${neonIcon('alert', 16)}
                    <span>تنبيه: الماكروز المدخلة لا تطابق هدف السعرات!</span>
                  </div>
                  <div id="macro-validation-text"></div>
                  <div style="font-size: 0.72rem; color: #B8C0BC; margin-top: 6px; border-top: 1px dashed rgba(255,85,85,0.3); padding-top: 4px; display: flex; align-items: center; gap: 4px;">
                    ${neonIcon('bulb', 14)} <strong>القاعدة العلمية:</strong> 1غ بروتين = 4 سعرة | 1غ كارب = 4 سعرة | 1غ دهون = 9 سعرة
                  </div>
                  <button type="button" id="auto-fix-macros-btn" class="btn btn-primary" style="width: 100%; margin-top: 8px; padding: 8px 12px; font-size: 0.78rem; font-weight: 800; border-radius: 8px;">
                     تعديل واقتراح تقسيم الماكروز لتطابق الهدف تماماً
                  </button>
                </div>

                <div id="macro-validation-success" style="display: none; padding: 8px 12px; border-radius: 10px; background: rgba(85, 247, 165, 0.1); border: 1px solid #55F7A5; color: #55F7A5; font-size: 0.78rem; font-weight: 700; align-items: center; gap: 6px;">
                  ${neonIcon('check', 16)}
                  <span>الماكروز مطابقة بدقة لهدف السعرات (100% علمياً)</span>
                </div>
              </div>

              <div id="auto-macros-preview" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; text-align: center; font-size: 0.82rem; color: #B8C0BC;">
                <div>بروتين: <b id="preview-protein" style="color: #FFFFFF; font-family: monospace;">${today.targetProtein}غ</b></div>
                <div>كارب: <b id="preview-carbs" style="color: #FFFFFF; font-family: monospace;">${today.targetCarbs}غ</b></div>
                <div>دهون: <b id="preview-fats" style="color: #FFFFFF; font-family: monospace;">${today.targetFats}غ</b></div>
              </div>
            </div>

            <div style="display: flex; gap: 10px;">
              <button type="button" id="save-calorie-target-btn" class="btn btn-primary" style="flex: 1; border-radius: 14px; font-weight: 800; padding: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;">
                <span>حفظ الهدف الجديد</span>
                ${neonIcon('check', 16)}
              </button>
              <button type="button" id="cancel-calorie-target-btn" class="btn btn-secondary" data-action="close" style="border-radius: 14px; padding: 12px 18px;">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- نافذة إضافة أكلة يدوياً لقاعدة البيانات -->
      ${renderCustomFoodModal('nutrition-custom-food-modal')}

    </div>
  `;
}

function removeDetachedModals() {
  ['saved-meals-modal', 'edit-logged-meal-modal', 'edit-calorie-target-modal', 'swap-modal', 'nutrition-custom-food-modal'].forEach(id => {
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
    case 'breakfast': return '';
    case 'lunch': return '';
    case 'dinner': return '';
    case 'snack': return '';
    default: return '';
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
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mealId = btn.getAttribute('data-meal-id');
      if (!mealId) return;
      try {
        await store.deleteLoggedMeal(mealId);
      } catch (err) {
        console.warn('تنبيه أثناء حذف الوجبة:', err);
      }
      notificationService.showToast('تم حذف الوجبة وتصحيح المجاميع اليومية', 'info');
      refreshNutritionView();
    });
  });

  // تنظيف أي نوافذ يتيمة قديمة ملحقة بـ body مباشرة
  document.querySelectorAll('body > #saved-meals-modal, body > #edit-calorie-target-modal, body > #edit-logged-meal-modal, body > #swap-modal, body > #nutrition-custom-food-modal').forEach(el => el.remove());

  // حفظ وجبة مسجلة مباشرة إلى الوجبات المفضلة من بطاقة الوجبة
  document.querySelectorAll('.save-logged-to-fav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mealId = btn.getAttribute('data-meal-id');
      const meal = (store.getState().loggedMeals || []).find(m => m.id === mealId);
      if (!meal) return;
      const res = store.saveToFavorites(meal);
      if (res && res.success) {
        notificationService.showToast(`تم حفظ "${meal.titleAr || 'الوجبة'}" في وجباتي المفضلة ⭐`, 'success');
      } else {
        notificationService.showToast('هذه الوجبة موجودة بالفعل في وجباتك المفضلة', 'info');
      }
    });
  });

  // نافذة الوجبات المحفوظة
  const savedMealsModal = document.getElementById('saved-meals-modal');
  const openSavedMealsBtn = document.getElementById('open-saved-meals-btn');
  const closeSavedMealsBtn = document.getElementById('close-saved-meals-modal-btn');

  const openSavedMealsModal = () => {
    const savedMeals = store.getState().savedMeals || [];
    const listEl = document.getElementById('saved-meals-modal-list');
    if (!listEl) return;

    if (savedMeals.length === 0) {
      listEl.innerHTML = `
        <div style="text-align: center; color: #8C9992; padding: 26px 16px; font-size: 0.9rem;">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">⭐</div>
          <div style="color: #FFFFFF; font-weight: 800; font-size: 1.05rem; margin-bottom: 6px;">لا توجد وجبات محفوظة بعد</div>
          <p style="margin: 0 auto 16px; font-size: 0.84rem; color: #8C9992; max-width: 280px; line-height: 1.5;">
            يمكنك حفظ أي وجبة مسجلة بالضغط على <strong>⭐ للمفضلة</strong> لتسجيلها بضغطة زر لاحقاً دون الحاجة لكتابتها كل يوم.
          </p>
          <a href="#meal-log" id="saved-modal-go-add-meal" class="btn btn-primary btn-sm" style="border-radius: 12px; padding: 8px 18px; font-size: 0.85rem; font-weight: 800; display: inline-flex; align-items: center; gap: 6px;">
            <span>الذهاب لإضافة وجبة جديدة</span>
            <span>←</span>
          </a>
        </div>
      `;
      document.getElementById('saved-modal-go-add-meal')?.addEventListener('click', () => {
        savedMealsModal?.classList.remove('open');
      });
    } else {
      listEl.innerHTML = savedMeals.map(meal => `
        <div style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,200,60,0.05); border: 1px solid rgba(255,200,60,0.2); border-radius: 14px; padding: 12px 14px; gap: 10px;">
          <div style="flex: 1; min-width: 0;">
            <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${meal.titleAr}</div>
            <div style="font-size: 0.78rem; color: #B8C0BC; margin-top: 2px; font-family: monospace;">
              <span style="color: #FFC83C; font-weight: 700;">${meal.calories}</span> سعرة ·
              بروتين <span style="color: #55F7A5;">${meal.protein}غ</span> ·
              كارب ${meal.carbs}غ · دهون ${meal.fats}غ
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            <button type="button" class="btn btn-primary btn-sm log-saved-meal-now-btn" data-saved-id="${meal.id}" style="font-size: 0.78rem; padding: 6px 14px; border-radius: 10px; white-space: nowrap;">
              + سجّل الآن
            </button>
            <button type="button" class="btn-icon delete-saved-from-modal-btn" data-saved-id="${meal.id}" style="color: #FF6B6B; font-size: 1rem; width: 28px; height: 28px;" title="حذف من المحفوظات">
              🗑
            </button>
          </div>
        </div>
      `).join('');

      listEl.querySelectorAll('.log-saved-meal-now-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const savedId = btn.getAttribute('data-saved-id');
          const saved = (store.getState().savedMeals || []).find(m => m.id === savedId);
          if (!saved) return;
          store.logMeal({
            titleAr: saved.titleAr,
            calories: saved.calories,
            protein: saved.protein,
            carbs: saved.carbs,
            fats: saved.fats,
            items: saved.items
          });
          notificationService.showToast(`تم تسجيل "${saved.titleAr}" في سجل اليوم ✓`, 'success');
          savedMealsModal?.classList.remove('open');
          refreshNutritionView();
        });
      });

      listEl.querySelectorAll('.delete-saved-from-modal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const savedId = btn.getAttribute('data-saved-id');
          if (confirm('هل تريد حذف هذه الوجبة من قائمة وجباتي المحفوظة؟')) {
            store.deleteSavedMeal(savedId);
            notificationService.showToast('تم حذف الوجبة من المحفوظات', 'info');
            openSavedMealsModal();
          }
        });
      });
    }

    savedMealsModal?.classList.add('open');
  };

  openSavedMealsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openSavedMealsModal();
  });
  closeSavedMealsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    savedMealsModal?.classList.remove('open');
  });
  savedMealsModal?.addEventListener('click', (e) => {
    if (e.target === savedMealsModal || e.target.closest('[data-action="close"]')) {
      e.preventDefault();
      e.stopPropagation();
      savedMealsModal.classList.remove('open');
    }
  });

  // عناصر نافذة تعديل الوجبة المسجلة
  const editModal = document.getElementById('edit-logged-meal-modal');
  const closeEditModalBtn = document.getElementById('close-edit-logged-meal-modal-btn');
  const cancelEditModalBtn = document.getElementById('cancel-edit-logged-meal-btn');
  const editTitleInput = document.getElementById('edit-logged-title-input');
  const editFieldsContainer = document.getElementById('edit-logged-meal-fields');
  const saveEditedBtn = document.getElementById('save-edited-logged-meal-btn');
  const saveEditedAsFavBtn = document.getElementById('save-edited-as-fav-btn');
  const foodSearchInput = document.getElementById('edit-meal-food-search-input');
  const foodSearchResults = document.getElementById('edit-meal-food-search-results');
  const calModal = document.getElementById('edit-calorie-target-modal');
  const swapModal = document.getElementById('swap-modal');

  let currentEditingMealId = null;
  let currentEditingItems = [];
  let directFallbackData = null;

  const closeEditModal = () => {
    editModal?.classList.remove('open');
    document.querySelectorAll('#edit-logged-meal-modal').forEach(m => m.classList.remove('open'));
    currentEditingMealId = null;
    currentEditingItems = [];
    directFallbackData = null;
    if (foodSearchInput) foodSearchInput.value = '';
    if (foodSearchResults) {
      foodSearchResults.style.display = 'none';
      foodSearchResults.innerHTML = '';
    }
  };

  closeEditModalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeEditModal();
  });
  cancelEditModalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeEditModal();
  });
  editModal?.addEventListener('click', (e) => {
    if (e.target === editModal || e.target.closest('[data-action="close"]')) {
      e.preventDefault();
      e.stopPropagation();
      closeEditModal();
    }
  });

  // حساب وتحديث الملخص الحي للماكروز والسعرات في نافذة التعديل
  const updateEditSummary = () => {
    let totalC = 0, totalP = 0, totalCarb = 0, totalF = 0;
    if (currentEditingItems.length > 0) {
      currentEditingItems.forEach(it => {
        totalC += (it.calories || 0);
        totalP += (it.protein || 0);
        totalCarb += (it.carbs || 0);
        totalF += (it.fats || 0);
      });
    } else if (directFallbackData) {
      totalC = Number(document.getElementById('edit-direct-cals')?.value) || 0;
      totalP = Number(document.getElementById('edit-direct-protein')?.value) || 0;
      totalCarb = Number(document.getElementById('edit-direct-carbs')?.value) || 0;
      totalF = Number(document.getElementById('edit-direct-fats')?.value) || 0;
    }

    const sumC = document.getElementById('edit-summary-cals');
    const sumP = document.getElementById('edit-summary-protein');
    const sumCarb = document.getElementById('edit-summary-carbs');
    const sumF = document.getElementById('edit-summary-fats');
    if (sumC) sumC.textContent = Math.round(totalC).toLocaleString('en-US');
    if (sumP) sumP.textContent = `${Math.round(totalP)}غ`;
    if (sumCarb) sumCarb.textContent = `${Math.round(totalCarb)}غ`;
    if (sumF) sumF.textContent = `${Math.round(totalF)}غ`;

    const countBadge = document.getElementById('edit-items-count-label');
    if (countBadge) {
      countBadge.textContent = currentEditingItems.length > 0 ? `(${currentEditingItems.length} صنف)` : '';
    }
  };

  // إعادة رسم محتويات أصناف الوجبة داخل نافذة التعديل
  const renderEditModalContent = () => {
    if (!editFieldsContainer) return;

    if (currentEditingItems.length > 0) {
      editFieldsContainer.innerHTML = currentEditingItems.map((item, idx) => {
        const isCount = item.isCountBased || isCountBasedFood(item.foodId || item.nameAr || item.name);
        const pWeight = item.pieceWeight || getFoodPieceWeight(item.foodId || item.nameAr || item.name);
        const uLabel = item.unitLabel || getFoodUnitLabel(item.foodId || item.nameAr || item.name);
        const countVal = item.count || Math.max(1, Math.round((item.grams || pWeight) / pWeight));

        return `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(85,247,165,0.15); border-radius: 12px; padding: 10px 12px; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
            <div style="flex: 1; min-width: 0;">
              <span style="color: #FFFFFF; font-weight: 700; font-size: 0.9rem; display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.nameAr || item.name}</span>
              <div style="display: flex; align-items: center; gap: 6px; margin-top: 2px;">
                <small class="item-cal-badge" id="item-cal-${idx}" style="color: #55F7A5; font-size: 0.76rem; font-family: monospace;">${item.calories || 0} سعرة</small>
                ${isCount ? `<small style="color: #8C9992; font-size: 0.72rem;">(${pWeight}غ / ${uLabel})</small>` : ''}
              </div>
            </div>
            <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
              ${isCount ? `
                <div style="display: flex; align-items: center; gap: 4px;">
                  <input type="number" class="edit-logged-count" data-idx="${idx}" data-weight="${pWeight}" data-unit="${uLabel}" value="${countVal}" min="1" step="1" style="width: 58px; text-align: center; border-radius: 10px; background: #020704; border: 1px solid rgba(85,247,165,0.4); color: #55F7A5; font-size: 0.95rem; font-weight: 800; font-family: monospace; padding: 6px 2px;">
                  <span style="color: #55F7A5; font-weight: 700; font-size: 0.8rem; white-space: nowrap;">${uLabel}</span>
                  <span class="edit-item-grams-hint-${idx}" style="color: #8C9992; font-size: 0.72rem; font-family: monospace;">(~${countVal * pWeight}غ)</span>
                </div>
              ` : `
                <div style="display: flex; align-items: center; gap: 4px;">
                  <input type="number" class="edit-logged-grams" data-idx="${idx}" value="${item.grams || 100}" min="0" step="5" style="width: 70px; text-align: center; border-radius: 10px; background: #020704; border: 1px solid rgba(85,247,165,0.35); color: #FFFFFF; font-size: 0.95rem; font-weight: 800; font-family: monospace; padding: 6px 2px;">
                  <span style="color: #55F7A5; font-weight: 700; font-size: 0.82rem;">${uLabel || 'غ'}</span>
                </div>
              `}
              <button type="button" class="btn-icon remove-item-from-edit-btn" data-idx="${idx}" style="color: #FF6B6B; font-size: 0.95rem; width: 30px; height: 30px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: rgba(255,107,107,0.1); border: 1px solid rgba(255,107,107,0.25);" title="حذف هذا الصنف من الوجبة">
                🗑
              </button>
            </div>
          </div>
        `;
      }).join('');

      // مستمعي التعديل للغرامات
      editFieldsContainer.querySelectorAll('.edit-logged-grams').forEach(inp => {
        inp.addEventListener('input', () => {
          const idx = Number(inp.getAttribute('data-idx'));
          const newG = Math.max(0, Number(inp.value) || 0);
          const it = currentEditingItems[idx];
          if (it) {
            it.grams = newG;
            const m = it.foodId ? macrosFor(it.foodId, newG) : null;
            if (m) {
              it.calories = Math.round(m.kcal);
              it.protein = Math.round(m.p);
              it.carbs = Math.round(m.c);
              it.fats = Math.round(m.f);
            } else {
              const ratio = (it.grams && it.grams > 0) ? (newG / it.grams) : 1;
              it.calories = Math.round((it.calories || 0) * ratio);
              it.protein = Math.round((it.protein || 0) * ratio);
              it.carbs = Math.round((it.carbs || 0) * ratio);
              it.fats = Math.round((it.fats || 0) * ratio);
            }
            const badge = document.getElementById(`item-cal-${idx}`);
            if (badge) badge.textContent = `${it.calories} سعرة`;
            updateEditSummary();
          }
        });
      });

      // مستمعي التعديل للعدد
      editFieldsContainer.querySelectorAll('.edit-logged-count').forEach(inp => {
        inp.addEventListener('input', () => {
          const idx = Number(inp.getAttribute('data-idx'));
          const count = Math.max(1, Number(inp.value) || 1);
          const pWeight = Number(inp.getAttribute('data-weight')) || 50;
          const uLabel = inp.getAttribute('data-unit') || 'بيضة';
          const newG = count * pWeight;
          const it = currentEditingItems[idx];
          if (it) {
            it.count = count;
            it.grams = newG;
            it.isCountBased = true;
            it.pieceWeight = pWeight;
            it.unitLabel = uLabel;
            const m = it.foodId ? macrosFor(it.foodId, newG) : null;
            if (m) {
              it.calories = Math.round(m.kcal);
              it.protein = Math.round(m.p);
              it.carbs = Math.round(m.c);
              it.fats = Math.round(m.f);
            } else {
              const ratio = (it.grams && it.grams > 0) ? (newG / it.grams) : 1;
              it.calories = Math.round((it.calories || 0) * ratio);
              it.protein = Math.round((it.protein || 0) * ratio);
              it.carbs = Math.round((it.carbs || 0) * ratio);
              it.fats = Math.round((it.fats || 0) * ratio);
            }
            const badge = document.getElementById(`item-cal-${idx}`);
            if (badge) badge.textContent = `${it.calories} سعرة`;
            const hint = editFieldsContainer.querySelector(`.edit-item-grams-hint-${idx}`);
            if (hint) hint.textContent = `(~${newG}غ)`;
            updateEditSummary();
          }
        });
      });

      // مستمعي زر حذف صنف
      editFieldsContainer.querySelectorAll('.remove-item-from-edit-btn').forEach(delBtn => {
        delBtn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const idx = Number(delBtn.getAttribute('data-idx'));
          const removed = currentEditingItems.splice(idx, 1)[0];
          renderEditModalContent();
          if (removed) {
            notificationService.showToast(`تم حذف "${removed.nameAr || removed.name}" من الوجبة`, 'info');
          }
        });
      });
    } else if (directFallbackData) {
      // إدخال مباشر بدون أصناف
      editFieldsContainer.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="grid-column: span 2;">
            <label style="font-size: 0.78rem; color: #B8C0BC; display: block; margin-bottom: 4px;">السعرات الإجمالية (سعرة)</label>
            <input type="number" id="edit-direct-cals" class="stack-field" style="width: 100%; padding: 8px 12px; font-size: 1.1rem; font-weight: 800; font-family: monospace; color: #55F7A5; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px;" value="${directFallbackData.calories || 0}">
          </div>
          <div>
            <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">بروتين (غ)</label>
            <input type="number" id="edit-direct-protein" class="stack-field" style="width: 100%; padding: 8px; font-size: 0.95rem; font-family: monospace; text-align: center; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px; color: #FFFFFF;" value="${directFallbackData.protein || 0}">
          </div>
          <div>
            <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">كارب (غ)</label>
            <input type="number" id="edit-direct-carbs" class="stack-field" style="width: 100%; padding: 8px; font-size: 0.95rem; font-family: monospace; text-align: center; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px; color: #FFFFFF;" value="${directFallbackData.carbs || 0}">
          </div>
          <div style="grid-column: span 2;">
            <label style="font-size: 0.74rem; color: #B8C0BC; display: block; margin-bottom: 4px;">دهون (غ)</label>
            <input type="number" id="edit-direct-fats" class="stack-field" style="width: 100%; padding: 8px; font-size: 0.95rem; font-family: monospace; text-align: center; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 10px; color: #FFFFFF;" value="${directFallbackData.fats || 0}">
          </div>
        </div>
      `;
      editFieldsContainer.querySelectorAll('input').forEach(inp => {
        inp.addEventListener('input', () => {
          directFallbackData.calories = Number(document.getElementById('edit-direct-cals')?.value) || 0;
          directFallbackData.protein = Number(document.getElementById('edit-direct-protein')?.value) || 0;
          directFallbackData.carbs = Number(document.getElementById('edit-direct-carbs')?.value) || 0;
          directFallbackData.fats = Number(document.getElementById('edit-direct-fats')?.value) || 0;
          updateEditSummary();
        });
      });
    } else {
      // حُذفت جميع الأصناف
      editFieldsContainer.innerHTML = `
        <div style="text-align: center; padding: 14px; background: rgba(255,255,255,0.02); border: 1px dashed rgba(85,247,165,0.2); border-radius: 12px; color: #8C9992; font-size: 0.82rem;">
          لا توجد أصناف في هذه الوجبة حالياً.<br>
          <span style="color: #55F7A5; font-weight: 700;">استخدم خانة البحث بالأسفل لإضافة أي صنف من قاعدة البيانات!</span>
        </div>
      `;
    }

    updateEditSummary();
  };

  // ربط البحث في قاعدة بيانات الأطعمة داخل نافذة تعديل الوجبة
  foodSearchInput?.addEventListener('input', () => {
    const query = foodSearchInput.value.trim();
    if (!query) {
      if (foodSearchResults) {
        foodSearchResults.style.display = 'none';
        foodSearchResults.innerHTML = '';
      }
      return;
    }
    const results = searchFoods(query, 10);
    if (!foodSearchResults) return;

    if (!results || results.length === 0) {
      foodSearchResults.innerHTML = `
        <div style="padding: 10px 12px; text-align: center; color: #8C9992; font-size: 0.82rem;">
          لم يتم العثور على أطعمة مطابقة في قاعدة البيانات
        </div>
      `;
      foodSearchResults.style.display = 'block';
      return;
    }

    foodSearchResults.innerHTML = results.map(f => {
      const isCount = isCountBasedFood(f.id || f.nameAr || f.name);
      const uLabel = getFoodUnitLabel(f.id || f.nameAr || f.name);
      const cal = f.per100?.kcal ?? f.calories_kcal ?? f.caloriesPer100g ?? 0;
      const p = f.per100?.p ?? f.protein_g ?? f.proteinPer100g ?? 0;
      const c = f.per100?.c ?? f.carbs_g ?? f.carbsPer100g ?? 0;
      const fat = f.per100?.f ?? f.fat_g ?? f.fatsPer100g ?? 0;
      const unitSuffix = isCount ? `لكل ${uLabel}: ` : `لكل 100${uLabel === 'مل' ? 'مل' : 'غ'}: `;

      return `
        <div class="edit-food-search-item" data-food-id="${f.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 10px; border-radius: 8px; cursor: pointer; border-bottom: 1px solid rgba(85,247,165,0.08); transition: background 0.15s;">
          <div style="flex: 1; min-width: 0; padding-left: 8px;">
            <div style="font-weight: 700; color: #FFFFFF; font-size: 0.88rem;">${f.nameAr || f.name}</div>
            <div style="font-size: 0.74rem; color: #8C9992; font-family: monospace;">
              ${unitSuffix}
              <span style="color: #FFC83C;">${cal}</span> سعرة · بروتين ${p}غ · كارب ${c}غ · دهون ${fat}غ
            </div>
          </div>
          <button type="button" class="btn btn-primary btn-sm" style="font-size: 0.74rem; padding: 4px 10px; border-radius: 8px; white-space: nowrap; pointer-events: none;">
            + إضافة
          </button>
        </div>
      `;
    }).join('');
    foodSearchResults.style.display = 'block';

    foodSearchResults.querySelectorAll('.edit-food-search-item').forEach(itemEl => {
      itemEl.addEventListener('mouseenter', () => { itemEl.style.background = 'rgba(85,247,165,0.1)'; });
      itemEl.addEventListener('mouseleave', () => { itemEl.style.background = 'transparent'; });
      itemEl.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const fid = itemEl.getAttribute('data-food-id');
        const f = results.find(x => x.id === fid);
        if (!f) return;
        const isCount = isCountBasedFood(f.id || f.nameAr || f.name);
        const pWeight = getFoodPieceWeight(f.id || f.nameAr || f.name);
        const uLabel = getFoodUnitLabel(f.id || f.nameAr || f.name);
        const defaultGrams = isCount ? pWeight : 100;
        const m = macrosFor(f.id, defaultGrams) || {
          kcal: f.per100?.kcal || f.calories_kcal || 0,
          p: f.per100?.p || f.protein_g || 0,
          c: f.per100?.c || f.carbs_g || 0,
          f: f.per100?.f || f.fat_g || 0
        };

        // إلغاء الوضع المباشر فور إضافة صنف حقيقي
        directFallbackData = null;

        currentEditingItems.push({
          foodId: f.id,
          name: f.name,
          nameAr: f.nameAr || f.name,
          grams: defaultGrams,
          count: isCount ? 1 : undefined,
          isCountBased: isCount,
          isLiquid: isLiquidFood(f),
          pieceWeight: isCount ? pWeight : undefined,
          unitLabel: uLabel,
          calories: Math.round(m.kcal),
          protein: Math.round(m.p),
          carbs: Math.round(m.c),
          fats: Math.round(m.f)
        });

        foodSearchInput.value = '';
        foodSearchResults.style.display = 'none';
        foodSearchResults.innerHTML = '';
        renderEditModalContent();
        notificationService.showToast(`تمت إضافة "${f.nameAr || f.name}" للوجبة ✓`, 'success');
      });
    });
  });

  // فتح وتعبئة نافذة تعديل الوجبة
  document.querySelectorAll('.edit-logged-meal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const mealId = btn.getAttribute('data-meal-id');
      const meal = (store.getState().loggedMeals || []).find(m => m.id === mealId);
      if (!meal || !editFieldsContainer) return;
      currentEditingMealId = mealId;

      if (editTitleInput) editTitleInput.value = meal.titleAr || 'وجبة مسجلة';

      // استنساخ عميق للأصناف
      currentEditingItems = (meal.items && meal.items.length > 0)
        ? JSON.parse(JSON.stringify(meal.items))
        : [];

      if (currentEditingItems.length === 0) {
        directFallbackData = {
          calories: meal.calories || 0,
          protein: meal.protein || 0,
          carbs: meal.carbs || 0,
          fats: meal.fats || 0
        };
      } else {
        directFallbackData = null;
      }

      if (foodSearchInput) foodSearchInput.value = '';
      if (foodSearchResults) {
        foodSearchResults.style.display = 'none';
        foodSearchResults.innerHTML = '';
      }

      renderEditModalContent();
      editModal?.classList.add('open');
    });
  });

  // حفظ الوجبة الحالية في الوجبات المفضلة من داخل نافذة التعديل
  saveEditedAsFavBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const titleAr = editTitleInput?.value.trim() || 'وجبة مفضلة';
    let totalC = 0, totalP = 0, totalCarb = 0, totalF = 0;
    if (currentEditingItems.length > 0) {
      currentEditingItems.forEach(it => {
        totalC += (it.calories || 0);
        totalP += (it.protein || 0);
        totalCarb += (it.carbs || 0);
        totalF += (it.fats || 0);
      });
    } else if (directFallbackData) {
      totalC = Number(document.getElementById('edit-direct-cals')?.value) || 0;
      totalP = Number(document.getElementById('edit-direct-protein')?.value) || 0;
      totalCarb = Number(document.getElementById('edit-direct-carbs')?.value) || 0;
      totalF = Number(document.getElementById('edit-direct-fats')?.value) || 0;
    }

    const res = store.saveToFavorites({
      titleAr,
      calories: Math.round(totalC),
      protein: Math.round(totalP),
      carbs: Math.round(totalCarb),
      fats: Math.round(totalF),
      items: currentEditingItems
    });

    if (res && res.success) {
      notificationService.showToast(`تم حفظ "${titleAr}" في وجباتي المفضلة ⭐`, 'success');
    } else {
      notificationService.showToast('هذه الوجبة محفوظة بالفعل في وجباتك المفضلة', 'info');
    }
  });

  // حفظ التعديلات على الوجبة وتحديث السجل اليومي
  saveEditedBtn?.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentEditingMealId) return;
    const meal = (store.getState().loggedMeals || []).find(m => m.id === currentEditingMealId);
    if (!meal) return;

    const copy = JSON.parse(JSON.stringify(meal));
    const titleAr = editTitleInput?.value.trim();
    if (titleAr) copy.titleAr = titleAr;

    if (currentEditingItems.length > 0) {
      copy.items = currentEditingItems;
      copy.calories = currentEditingItems.reduce((s, i) => s + (i.calories || 0), 0);
      copy.protein = currentEditingItems.reduce((s, i) => s + (i.protein || 0), 0);
      copy.carbs = currentEditingItems.reduce((s, i) => s + (i.carbs || 0), 0);
      copy.fats = currentEditingItems.reduce((s, i) => s + (i.fats || 0), 0);
    } else if (directFallbackData) {
      copy.items = [];
      copy.calories = Number(document.getElementById('edit-direct-cals')?.value) || 0;
      copy.protein = Number(document.getElementById('edit-direct-protein')?.value) || 0;
      copy.carbs = Number(document.getElementById('edit-direct-carbs')?.value) || 0;
      copy.fats = Number(document.getElementById('edit-direct-fats')?.value) || 0;
    } else {
      copy.items = [];
      copy.calories = 0;
      copy.protein = 0;
      copy.carbs = 0;
      copy.fats = 0;
    }

    try {
      await store.updateLoggedMeal(currentEditingMealId, copy);
    } catch (err) {
      notificationService.showToast(err.message, 'error');
      return;
    }

    closeEditModal();
    notificationService.showToast('تم تعديل الوجبة وتحديث السعرات اليومية بنجاح ✓', 'success');
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

  closeSwapBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    swapModal?.classList.remove('open');
    document.querySelectorAll('#swap-modal').forEach(m => m.classList.remove('open'));
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
          notificationService.showToast('تم تبديل الوجبة بنجاح وتحديث خطتك الغذائية ', 'success');
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

  const closeCalModal = () => {
    if (calModal) calModal.classList.remove('open');
    document.querySelectorAll('#edit-calorie-target-modal').forEach(m => m.classList.remove('open'));
  };

  const openCalModal = () => {
    if (calModal) calModal.classList.add('open');
    setTimeout(() => {
      calInput?.focus();
      calInput?.select();
    }, 50);
  };

  openCalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openCalModal();
  });
  targetWrap?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    openCalModal();
  });

  closeCalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeCalModal();
  });
  cancelCalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeCalModal();
  });

  calModal?.addEventListener('click', (e) => {
    if (
      e.target === calModal ||
      e.target.closest('[data-action="close"]') ||
      e.target.closest('#close-calorie-target-modal-btn') ||
      e.target.closest('#cancel-calorie-target-btn')
    ) {
      e.preventDefault();
      e.stopPropagation();
      closeCalModal();
    }
  });

  const closeSwapModal = () => {
    swapModal?.classList.remove('open');
    document.querySelectorAll('#swap-modal').forEach(m => m.classList.remove('open'));
  };

  swapModal?.addEventListener('click', (e) => {
    if (e.target === swapModal || e.target.closest('[data-action="close"]') || e.target.closest('#close-swap-modal-btn')) {
      e.preventDefault();
      e.stopPropagation();
      closeSwapModal();
    }
  });

  // صمام أمان: زر Esc للإغلاق الفوري لأي نافذة منبثقة مفتوحة
  const handleEscModalClose = (e) => {
    if (e.key === 'Escape') {
      savedMealsModal?.classList.remove('open');
      closeCalModal();
      closeEditModal();
      closeSwapModal();
      document.getElementById('nutrition-custom-food-modal')?.classList.remove('open');
      document.querySelectorAll('.ai-modal-overlay.open').forEach(m => m.classList.remove('open'));
    }
  };
  document.removeEventListener('keydown', handleEscModalClose);
  document.addEventListener('keydown', handleEscModalClose);

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
    const userWeight = Number(store.getState().userProfile?.currentWeight) || 0;
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
      newP = Math.round(userWeight > 0 ? Math.min(userWeight * 2.2, (targetVal * 0.3) / 4) : (targetVal * 0.3) / 4);
      newF = Math.round((targetVal * 0.25) / 9);
      newC = Math.round(Math.max(0, targetVal - (newP * 4 + newF * 9)) / 4);
    }

    if (pInput) pInput.value = newP;
    if (fInput) fInput.value = newF;
    if (cInput) cInput.value = newC;

    updateMacroValidation();
    notificationService.showToast(`تم تعديل الماكروز لتطابق ${targetVal.toLocaleString('en-US')} سعرة بدقة! `, 'success');
  });

  document.getElementById('manual-protein-input')?.addEventListener('input', updateMacroValidation);
  document.getElementById('manual-carbs-input')?.addEventListener('input', updateMacroValidation);
  document.getElementById('manual-fats-input')?.addEventListener('input', updateMacroValidation);

  // تحديث المعاينة الحية عند كتابة السعرات
  const updatePreview = () => {
    const val = Number(calInput?.value) || 2000;
    const userWeight = Number(store.getState().userProfile?.currentWeight) || 0;
    const p = Math.round(userWeight > 0 ? Math.min(userWeight * 2.2, (val * 0.3) / 4) : (val * 0.3) / 4);
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
    if (!newTarget || newTarget < 500) {
      notificationService.showToast('يرجى إدخال رقم سعرات صحيح (500 على الأقل)', 'error');
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
    closeCalModal();
    notificationService.showToast(`تم تعديل هدف السعرات اليومي إلى ${newTarget.toLocaleString('en-US')} سعرة بنجاح `, 'success');
    refreshNutritionView();
  });

  // تفعيل نافذة إضافة أكلة يدوياً لقاعدة البيانات
  const openCustomFoodBtn = document.getElementById('open-custom-food-btn');
  bindCustomFoodModal({
    modalId: 'nutrition-custom-food-modal',
    triggerBtn: openCustomFoodBtn,
    onSaved: (newFood) => {
      // إشعار نجاح وتحديث خفيف
      console.log('Custom food added from nutrition view:', newFood.name);
    }
  });
}
