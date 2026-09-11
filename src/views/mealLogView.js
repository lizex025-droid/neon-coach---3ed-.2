/**
 * NEON COACH - شاشة سجل الوجبات والذكاء الاصطناعي (Meal Log View)
 * تفاعلية بالكامل: جميع الأزرار تعمل فوراً مع تحديث لحظي للواجهة
 */

import { store } from '../state/store.js';
import { aiService } from '../services/aiService.js';
import { speechService } from '../services/speechService.js';
import { notificationService } from '../services/notificationService.js';
import { searchFoods, foodById, macrosFor, IMPORTED_FOOD_COUNT, isCountBasedFood, getFoodPieceWeight, getFoodUnitLabel } from '../data/foods.js';
import { mealNameFromItems } from '../domain/nutritionCalculations.js';
import { neonIcon } from '../utils/neonIcons.js';
import { renderCustomFoodModal, bindCustomFoodModal } from '../components/customFoodModal.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

let activeDraft = {
  titleAr: 'وجبة جديدة',
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  items: []
};

function recalcDraft(draft) {
  draft.calories = 0;
  draft.protein = 0;
  draft.carbs = 0;
  draft.fats = 0;

  for (const item of draft.items) {
    if (item.isCountBased && item.pieceWeight) {
      item.count = Math.max(1, Number(item.count) || Math.round((Number(item.grams) || item.pieceWeight) / item.pieceWeight));
      item.grams = item.count * item.pieceWeight;
    }
    const grams = Math.max(0, Number(item.grams) || 0);
    const m = item.foodId ? macrosFor(item.foodId, grams) : null;
    if (m) {
      item.calories = Math.round(m.kcal);
      item.protein = Math.round(m.p);
      item.carbs = Math.round(m.c);
      item.fats = Math.round(m.f);
    } else {
      const baseCal = item.baseKcal || (item.grams ? (item.calories * 100 / item.grams) : item.calories);
      const baseP = item.baseP || (item.grams ? (item.protein * 100 / item.grams) : item.protein);
      const baseC = item.baseC || (item.grams ? (item.carbs * 100 / item.grams) : item.carbs);
      const baseF = item.baseF || (item.grams ? (item.fats * 100 / item.grams) : item.fats);
      item.calories = Math.round(baseCal * (grams / 100));
      item.protein = Math.round(baseP * (grams / 100));
      item.carbs = Math.round(baseC * (grams / 100));
      item.fats = Math.round(baseF * (grams / 100));
    }
    draft.calories += item.calories;
    draft.protein += item.protein;
    draft.carbs += item.carbs;
    draft.fats += item.fats;
  }

  draft.titleAr = mealNameFromItems(draft.items, 'وجبة مسجلة');
  return draft;
}

export function renderMealLogView() {
  const state = store.getState();
  const targetCalories = state.today.targetCalories || 2000;
  const consumed = state.today.consumedCalories || 0;
  const remaining = Math.max(0, targetCalories - consumed);
  const isOver = consumed > targetCalories;
  const actualPct = targetCalories > 0 ? Math.round((consumed / targetCalories) * 100) : 0;

  return `
    <div class="meal-log-container" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط العنوان العلوي -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="meallog-back-btn" class="btn-icon" aria-label="رجوع" title="رجوع للتغذية">
          ❯
        </button>
        <h1 style="font-size: 1.3rem; font-weight: 900; color: #FFFFFF; margin: 0;">
          سجل الوجبات
        </h1>
        <button id="meallog-chat-btn" class="btn-icon" aria-label="المحادثة" title="المساعد الذكي">
          💬
        </button>
      </div>

      <!-- بطاقة السعرات الكلية والمخصومة والمتبقية -->
      <div class="neon-card" style="padding: 18px 20px; ${isOver ? 'border-color: rgba(255,85,85,0.4);' : ''}">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; align-items: center; text-align: center; margin-bottom: 14px;">
          
          <div style="background: rgba(255,255,255,0.03); padding: 10px 6px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 0.74rem; color: #B8C0BC; margin-bottom: 2px;">السعرات الكلية</div>
            <div style="font-size: 1.35rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">
              ${targetCalories.toLocaleString('en-US')}
            </div>
            <span style="font-size: 0.68rem; color: #8C9992;">الهدف اليومي</span>
          </div>

          <div style="background: ${isOver ? 'rgba(255,85,85,0.12)' : 'rgba(255,85,85,0.06)'}; padding: 10px 6px; border-radius: 12px; border: 1px solid ${isOver ? 'rgba(255,85,85,0.35)' : 'rgba(255,85,85,0.15)'};">
            <div style="font-size: 0.74rem; color: #FF8888; margin-bottom: 2px;">تم خصمه</div>
            <div style="font-size: 1.35rem; font-weight: 900; color: #FF5555; font-family: monospace;">
              ${consumed.toLocaleString('en-US')}
            </div>
            <span style="font-size: 0.68rem; color: #8C9992;">المستهلك (${actualPct}%)</span>
          </div>

          <div style="background: ${isOver ? 'rgba(255,85,85,0.08)' : 'rgba(85,247,165,0.08)'}; padding: 10px 6px; border-radius: 12px; border: 1px solid ${isOver ? 'rgba(255,85,85,0.25)' : 'rgba(85,247,165,0.25)'};">
            <div style="font-size: 0.74rem; color: ${isOver ? '#FF8888' : '#55F7A5'}; margin-bottom: 2px;">المتبقي بعد الخصم</div>
            <div style="font-size: 1.35rem; font-weight: 900; color: ${isOver ? '#FF5555' : '#55F7A5'}; font-family: monospace;">
              ${isOver ? `-${(consumed - targetCalories).toLocaleString('en-US')}` : remaining.toLocaleString('en-US')}
            </div>
            <span style="font-size: 0.68rem; color: ${isOver ? '#FF8888' : '#8C9992'};">${isOver ? 'تجاوز' : 'سعرة متبقية'}</span>
          </div>

        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; margin-bottom: 6px;">
          <span style="color: #B8C0BC;">معادلة اليوم: <strong style="color: #FFFFFF; font-family: monospace;">${targetCalories.toLocaleString('en-US')}</strong> - <strong style="color: #FF5555; font-family: monospace;">${consumed.toLocaleString('en-US')}</strong> =</span>
          <span style="font-weight: 800; font-family: monospace; color: ${isOver ? '#FF5555' : '#55F7A5'}; display: inline-flex; align-items: center; gap: 4px;">
            ${isOver ? `<span>تجاوزت الهدف بـ ${(consumed - targetCalories).toLocaleString('en-US')} سعرة</span> ${neonIcon('alert', 14)}` : `<span>متبقي ${remaining.toLocaleString('en-US')} سعرة</span>`}
          </span>
        </div>

        <div class="macro-bar-track" style="height: 6px;">
          <div class="macro-bar-fill" style="width: ${Math.min(100, actualPct)}%; ${isOver ? 'background: #FF5555; box-shadow: 0 0 10px rgba(255,85,85,0.6);' : ''}"></div>
        </div>
      </div>

      <!-- بطاقة مسودة الوجبة والبحث المدمجة -->
      <div id="meal-draft-card" class="neon-card" style="padding: 22px; border-color: rgba(85,247,165,0.4); box-shadow: 0 0 25px rgba(85,247,165,0.12);">
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
          <div>
            <div id="draft-calories" style="font-size: 2.4rem; font-weight: 900; color: #55F7A5; font-family: monospace; line-height: 1;">
              ${activeDraft.calories}
            </div>
            <div style="font-size: 0.8rem; color: #B8C0BC;">سعرة إجمالية</div>
          </div>

          <div style="display: flex; align-items: center; gap: 10px;">
            <h2 id="draft-title" style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; margin: 0; text-align: left; max-width: 190px;">
              ${activeDraft.titleAr}
            </h2>
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(85,247,165,0.12); border: var(--border-neon); display: flex; align-items: center; justify-content: center;">
              ${neonIcon('plate', 24)}
            </div>
          </div>
        </div>

        <!-- شريط الماكروز P / C / F (بروتين، كربوهيدرات، دهون) -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; padding: 12px 0; border-top: 1px solid rgba(85,247,165,0.15); border-bottom: 1px solid rgba(85,247,165,0.15); margin-bottom: 14px;">
          <div>
            <div style="font-size: 0.75rem; color: #B8C0BC;">بروتين</div>
            <div id="draft-protein" style="font-size: 1.1rem; font-weight: 900; color: #55F7A5; font-family: monospace;">${activeDraft.protein}g</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: #B8C0BC;">كربوهيدرات</div>
            <div id="draft-carbs" style="font-size: 1.1rem; font-weight: 900; color: #55F7A5; font-family: monospace;">${activeDraft.carbs}g</div>
          </div>
          <div>
            <div style="font-size: 0.75rem; color: #B8C0BC;">دهون</div>
            <div id="draft-fats" style="font-size: 1.1rem; font-weight: 900; color: #55F7A5; font-family: monospace;">${activeDraft.fats}g</div>
          </div>
        </div>

        <!-- حقل/زر البحث عن صنف (تحت بروتين/كربوهيدرات/دهون) -->
        <div style="margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; gap: 8px; flex-wrap: wrap;">
            <label for="food-search-input" style="font-size: 0.82rem; color: #55F7A5; font-weight: 700; display: flex; align-items: center; gap: 6px;">
              <span>🔍</span>
              <span>ابحث وأضف صنفًا للوجبة</span>
            </label>
            <div style="display: flex; align-items: center; gap: 6px;">
              <button type="button" id="meallog-open-custom-food-btn" class="btn btn-outline-neon btn-sm" style="font-size: 0.74rem; padding: 3px 10px; border-radius: 10px; border-color: rgba(85,247,165,0.4); color: #55F7A5; background: rgba(85,247,165,0.08); display: inline-flex; align-items: center; gap: 4px;" title="إضافة أو تعديل أكلة في قاعدة البيانات">
                <span>🥗 أكلاتي المخصصة / إضافة</span>
              </button>
              <span class="badge" style="background: rgba(85,247,165,0.12); color: #55F7A5; border: 1px solid rgba(85,247,165,0.3); font-size: 0.72rem; padding: 2px 8px;">
                ${IMPORTED_FOOD_COUNT} صنف
              </span>
            </div>
          </div>
          <div style="position: relative;">
            <input type="text" id="food-search-input" placeholder="ابحث عن أكلة (مثال: صدر دجاج، بيض، رز، بطاطا...)" autocomplete="off" style="width: 100%; border-radius: 14px; padding: 12px 16px; background: #06100C; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF; font-size: 0.95rem;">
            <div id="food-search-results" class="food-search-results" style="display: none; margin-top: 8px;"></div>
          </div>
        </div>

        <!-- تفاصيل المكونات الفردية والأوزان القابلة للتعديل مباشرة -->
        <div id="draft-items-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          ${activeDraft.items.length ? activeDraft.items.map((item, idx) => {
            const isCount = item.isCountBased || isCountBasedFood(item.foodId || item.nameAr || item.name);
            const pWeight = item.pieceWeight || getFoodPieceWeight(item.foodId || item.nameAr || item.name);
            const uLabel = item.unitLabel || getFoodUnitLabel(item.foodId || item.nameAr || item.name);
            const countVal = item.count || Math.max(1, Math.round((item.grams || pWeight) / pWeight));

            return `
              <div class="draft-item-row" data-idx="${idx}">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button type="button" class="btn-icon delete-draft-item" data-idx="${idx}" style="color: #FF6B6B; font-size: 1.1rem; width: 32px; height: 32px;" title="حذف">
                    ✕
                  </button>
                  <div>
                    <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">${item.nameAr || item.name}</div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                      <small class="item-cal-badge" style="color: #55F7A5; font-family: monospace; font-size: 0.8rem;">${item.calories} سعرة</small>
                      ${isCount ? `<small style="color: #8C9992; font-size: 0.72rem;">(${pWeight}غ / ${uLabel})</small>` : ''}
                    </div>
                  </div>
                </div>
                ${isCount ? `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="number" class="draft-item-count-input" data-idx="${idx}" min="1" step="1" value="${countVal}" style="width: 65px; text-align: center; border-radius: 10px; background: #020704; border: 1px solid rgba(85,247,165,0.4); color: #55F7A5; font-size: 1.05rem; font-weight: 800; font-family: monospace; padding: 6px 4px;">
                    <span style="color: #55F7A5; font-weight: 700; font-size: 0.84rem; white-space: nowrap;">${uLabel}</span>
                    <span class="item-grams-hint" style="color: #8C9992; font-size: 0.75rem; font-family: monospace;">(~${item.grams}غ)</span>
                  </div>
                ` : `
                  <div style="display: flex; align-items: center; gap: 6px;">
                    <input type="number" class="draft-item-grams-input" data-idx="${idx}" min="0" step="5" value="${item.grams}">
                    <span style="color: #B8C0BC; font-size: 0.85rem;">غ</span>
                  </div>
                `}
              </div>
            `;
          }).join('') : `
            <div style="padding: 24px 16px; text-align: center; color: #8C9992; font-size: 0.92rem; border: 1px dashed rgba(85,247,165,0.2); border-radius: 14px; background: rgba(5,13,9,0.5);">
              <div style="margin-bottom: 6px; display: flex; justify-content: center;">${neonIcon('plate', 32)}</div>
              <div style="color: #FFFFFF; font-weight: 700; margin-bottom: 4px;">لم يتم إضافة أطعمة إلى الوجبة بعد</div>
              <small style="color: #8C9992;">ابحث عن الأطعمة في الصندوق بالأعلى لإضافتها مباشرة للوجبة.</small>
            </div>
          `}
        </div>

        <!-- زر تأكيد وحفظ الوجبة -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="confirm-save-meal-btn" class="btn btn-primary btn-lg btn-block" style="border-radius: 18px; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;">
            <span>تأكيد وحفظ الوجبة كاملة</span>
            ${neonIcon('check', 18)}
          </button>
        </div>

      </div>

      <!-- نافذة إضافة أكلة يدوياً لقاعدة البيانات -->
      ${renderCustomFoodModal('meallog-custom-food-modal')}

    </div>
  `;
}

function refreshMealLogView(focusIdx = null) {
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderMealLogView();
    bindMealLogEvents();

    if (focusIdx !== null && focusIdx !== undefined) {
      const scrollToAdded = () => {
        const row = document.querySelector(`.draft-item-row[data-idx="${focusIdx}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });

          const rect = row.getBoundingClientRect();
          const currentScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
          const targetY = currentScroll + rect.top - (window.innerHeight / 2) + (rect.height / 2);
          window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });

          row.style.transition = 'box-shadow 0.35s ease, border-color 0.35s ease, transform 0.25s ease';
          row.style.borderColor = '#55F7A5';
          row.style.boxShadow = '0 0 22px rgba(85, 247, 165, 0.6)';
          row.style.transform = 'scale(1.02)';

          const input = row.querySelector('.draft-item-grams-input');
          if (input) {
            input.focus();
            input.select();
          }

          setTimeout(() => {
            row.style.borderColor = '';
            row.style.boxShadow = '';
            row.style.transform = '';
          }, 2000);
        } else {
          const draftCard = document.getElementById('meal-draft-card');
          draftCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      requestAnimationFrame(scrollToAdded);
      setTimeout(scrollToAdded, 80);
      setTimeout(scrollToAdded, 250);
    }
  }
}

export function bindMealLogEvents() {
  const backBtn = document.getElementById('meallog-back-btn');
  const chatBtn = document.getElementById('meallog-chat-btn');
  const micBtn = document.getElementById('meal-mic-btn');
  const photoInput = document.getElementById('meal-photo-upload');
  const textInput = document.getElementById('meal-quick-input');
  const sendBtn = document.getElementById('send-meal-input-btn');
  const confirmBtn = document.getElementById('confirm-save-meal-btn');

  const foodSearchInput = document.getElementById('food-search-input');
  const foodSearchResults = document.getElementById('food-search-results');

  // زر الرجوع
  backBtn?.addEventListener('click', () => {
    window.location.hash = '#nutrition';
  });

  // زر المحادثة
  chatBtn?.addEventListener('click', () => {
    window.location.hash = '#neon-ai';
  });

  // دالة إضافة صنف إلى مسودة الوجبة وتحديث الشاشة مع التمرير للصنف المضاف لضبط أرقامه
  const addFoodToDraft = (food) => {
    if (!food) return;
    let targetIdx = -1;
    const isCount = isCountBasedFood(food);
    const pieceWeight = getFoodPieceWeight(food);
    const unitLabel = getFoodUnitLabel(food);
    const existingIdx = activeDraft.items.findIndex(item => item.foodId === food.id);

    if (existingIdx !== -1) {
      if (isCount) {
        activeDraft.items[existingIdx].count = (Number(activeDraft.items[existingIdx].count) || 1) + 1;
        activeDraft.items[existingIdx].grams = activeDraft.items[existingIdx].count * pieceWeight;
      } else {
        activeDraft.items[existingIdx].grams = (Number(activeDraft.items[existingIdx].grams) || 0) + 100;
      }
      targetIdx = existingIdx;
    } else {
      const defaultCount = isCount ? ((food.id === 'F026' || (food.nameAr && food.nameAr.includes('بياض'))) ? 3 : (food.id === 'F027' ? 1 : 2)) : 1;
      const initialGrams = isCount ? (defaultCount * pieceWeight) : 100;
      const factor = initialGrams / 100;

      activeDraft.items.push({
        id: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        foodId: food.id,
        nameAr: food.name || food.nameAr,
        name: food.name || food.nameAr,
        isCountBased: isCount,
        pieceWeight: isCount ? pieceWeight : null,
        unitLabel: isCount ? unitLabel : 'غ',
        count: isCount ? defaultCount : null,
        grams: initialGrams,
        calories: Math.round((food.per100?.kcal || 0) * factor),
        protein: Math.round((food.per100?.p || 0) * factor * 10) / 10,
        carbs: Math.round((food.per100?.c || 0) * factor * 10) / 10,
        fats: Math.round((food.per100?.f || 0) * factor * 10) / 10
      });
      targetIdx = activeDraft.items.length - 1;
    }
    recalcDraft(activeDraft);
    const msg = isCount ? `تمت إضافة ${food.name || food.nameAr} بالعدد إلى الوجبة 🍳` : `تمت إضافة ${food.name || food.nameAr} إلى الوجبة 🥗`;
    notificationService.showToast(msg, 'success');
    refreshMealLogView(targetIdx);
  };

  // تفعيل نافذة إضافة وتعديل الأكلات في قاعدة البيانات
  const customModal = bindCustomFoodModal({
    modalId: 'meallog-custom-food-modal',
    triggerBtn: document.getElementById('meallog-open-custom-food-btn'),
    onSaved: (savedFood, mode) => {
      if (foodSearchInput) foodSearchInput.value = '';
      if (foodSearchResults) {
        foodSearchResults.style.display = 'none';
        foodSearchResults.innerHTML = '';
      }
      if (mode === 'create') {
        addFoodToDraft(savedFood);
      } else if (mode === 'edit' && savedFood) {
        // تحديث أي أصناف موجودة بالفعل في المسودة الحالية بنفس الصنف المعدل
        let modified = false;
        activeDraft.items.forEach(item => {
          if (item.id === savedFood.id) {
            item.name = savedFood.name || savedFood.nameAr || item.name;
            item.caloriesPer100g = savedFood.per100?.kcal || 0;
            item.proteinPer100g = savedFood.per100?.p || 0;
            item.carbsPer100g = savedFood.per100?.c || 0;
            item.fatsPer100g = savedFood.per100?.f || 0;
            const factor = (item.grams || 100) / 100;
            item.calories = Math.round(item.caloriesPer100g * factor);
            item.protein = Math.round(item.proteinPer100g * factor);
            item.carbs = Math.round(item.carbsPer100g * factor);
            item.fats = Math.round(item.fatsPer100g * factor);
            modified = true;
          }
        });
        if (modified) {
          recalcDraft(activeDraft);
          refreshMealLogView();
        }
      }
    }
  });

  // البحث الرئيسي في الأطعمة
  foodSearchInput?.addEventListener('input', () => {
    const q = foodSearchInput.value.trim();
    if (!q) {
      foodSearchResults.style.display = 'none';
      foodSearchResults.innerHTML = '';
      return;
    }
    const results = searchFoods(q, 14);
    foodSearchResults.style.display = 'flex';
    if (!results.length) {
      foodSearchResults.innerHTML = `
        <div style="padding: 14px 10px; text-align: center; color: #8C9992; font-size: 0.86rem; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div>لم نجد صنفًا مطابقًا لـ "<span style="color: #FFFFFF; font-weight: 700;">${escapeHtml(q)}</span>"</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">
            <button type="button" id="search-empty-add-custom-btn" class="btn btn-primary btn-sm" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 12px;">
              ➕ أضف "${escapeHtml(q)}" يدوياً لقاعدة البيانات
            </button>
            <button type="button" id="search-empty-manage-custom-btn" class="btn btn-secondary btn-sm" style="padding: 6px 12px; font-size: 0.82rem; border-radius: 12px;">
              📋 إدارة أكلاتي
            </button>
          </div>
        </div>
      `;
      document.getElementById('search-empty-add-custom-btn')?.addEventListener('click', () => {
        customModal?.open(q);
      });
      document.getElementById('search-empty-manage-custom-btn')?.addEventListener('click', () => {
        customModal?.open({ tab: 'list' });
      });
      return;
    }
    foodSearchResults.innerHTML = results.map(f => {
      const isCount = isCountBasedFood(f);
      const pWeight = getFoodPieceWeight(f);
      const uLabel = getFoodUnitLabel(f);
      const perUnitKcal = Math.round((f.per100?.kcal || 0) * (pWeight / 100));
      const kcalBadge = isCount ? `~${perUnitKcal} kcal / ${uLabel} (${pWeight}غ)` : `${f.per100?.kcal || 0} kcal / 100g`;

      return `
        <div class="food-search-result-row" style="display: flex; align-items: center; gap: 6px; width: 100%;">
          <button type="button" class="food-search-result-btn" data-food-id="${f.id}" style="flex: 1;">
            <div>
              <b>${escapeHtml(f.name || f.nameAr)}</b>
              ${f.nameEn ? `<small>${escapeHtml(f.nameEn)}</small>` : ''}
              ${f.isCustom ? '<span style="color: #55F7A5; font-size: 0.72rem; margin-right: 4px; font-weight: 700;">(مخصص)</span>' : ''}
              ${isCount ? `<span style="color: #55F7A5; font-size: 0.72rem; margin-right: 4px; font-weight: 700;">(بالعدد: ${pWeight}غ)</span>` : ''}
            </div>
            <span class="food-kcal-badge">${kcalBadge}</span>
          </button>
          ${f.isCustom ? `
            <button type="button" class="edit-custom-food-search-btn" data-custom-id="${f.id}" title="تعديل أو حذف الصنف من قاعدة البيانات" style="background: #07100D; border: 1px solid rgba(85,247,165,0.25); border-radius: 12px; color: #55F7A5; padding: 9px 10px; font-size: 0.82rem; cursor: pointer; flex-shrink: 0; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s ease;">
              <span>✏️</span>
              <span style="font-size: 0.72rem; font-weight: 700;">تعديل</span>
            </button>
          ` : ''}
        </div>
      `;
    }).join('') + `
      <div style="padding: 8px 12px; border-top: 1px solid rgba(85,247,165,0.15); display: flex; justify-content: space-between; align-items: center; background: rgba(5,13,9,0.85); border-radius: 0 0 14px 14px; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.76rem; color: #8C9992;">الصنف غير موجود أو تريد إدارة أكلاتك؟</span>
        <div style="display: flex; gap: 6px;">
          <button type="button" id="search-footer-manage-custom-btn" class="btn btn-secondary btn-sm" style="font-size: 0.74rem; padding: 4px 8px; border-radius: 10px;">
            📋 أكلاتي
          </button>
          <button type="button" id="search-footer-add-custom-btn" class="btn btn-outline-neon btn-sm" style="font-size: 0.74rem; padding: 4px 10px; border-radius: 10px;">
            ➕ أضف صنفاً
          </button>
        </div>
      </div>
    `;

    document.getElementById('search-footer-add-custom-btn')?.addEventListener('click', () => {
      customModal?.open(q);
    });

    document.getElementById('search-footer-manage-custom-btn')?.addEventListener('click', () => {
      customModal?.open({ tab: 'list' });
    });

    foodSearchResults.querySelectorAll('.edit-custom-food-search-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const cid = btn.getAttribute('data-custom-id');
        const customFood = foodById(cid);
        if (customFood) {
          customModal?.open({ editFood: customFood });
        }
      });
    });

    foodSearchResults.querySelectorAll('[data-food-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = foodById(btn.getAttribute('data-food-id'));
        if (f) {
          if (foodSearchInput) foodSearchInput.value = '';
          if (foodSearchResults) {
            foodSearchResults.style.display = 'none';
            foodSearchResults.innerHTML = '';
          }
          addFoodToDraft(f);
        }
      });
    });
  });

  // تعديل عدد الحبات اللحظي للأصناف المعتمدة على العدد (كالبيض)
  document.querySelectorAll('.draft-item-count-input').forEach(input => {
    input.addEventListener('input', () => {
      const idx = Number(input.getAttribute('data-idx'));
      const count = Math.max(1, Number(input.value) || 1);
      const item = activeDraft.items[idx];
      if (item) {
        item.count = count;
        item.grams = count * (item.pieceWeight || 50);
        recalcDraft(activeDraft);

        const calsEl = document.getElementById('draft-calories');
        const pEl = document.getElementById('draft-protein');
        const cEl = document.getElementById('draft-carbs');
        const fEl = document.getElementById('draft-fats');
        const row = input.closest('.draft-item-row');
        const itemCal = row?.querySelector('.item-cal-badge');
        const gramsHint = row?.querySelector('.item-grams-hint');
        if (calsEl) calsEl.textContent = activeDraft.calories;
        if (pEl) pEl.textContent = activeDraft.protein + 'g';
        if (cEl) cEl.textContent = activeDraft.carbs + 'g';
        if (fEl) fEl.textContent = activeDraft.fats + 'g';
        if (itemCal && item) itemCal.textContent = item.calories + ' سعرة';
        if (gramsHint) gramsHint.textContent = `(~${item.grams}غ)`;
      }
    });

    input.addEventListener('change', () => {
      refreshMealLogView();
    });
  });

  // تعديل الغرامات اللحظي للأصناف العادية
  document.querySelectorAll('.draft-item-grams-input').forEach(input => {
    input.addEventListener('input', () => {
      const idx = Number(input.getAttribute('data-idx'));
      const val = Math.max(0, Number(input.value) || 0);
      if (activeDraft.items[idx]) {
        activeDraft.items[idx].grams = val;
        recalcDraft(activeDraft);

        const calsEl = document.getElementById('draft-calories');
        const pEl = document.getElementById('draft-protein');
        const cEl = document.getElementById('draft-carbs');
        const fEl = document.getElementById('draft-fats');
        const itemCal = input.closest('.draft-item-row')?.querySelector('.item-cal-badge');
        if (calsEl) calsEl.textContent = activeDraft.calories;
        if (pEl) pEl.textContent = activeDraft.protein + 'g';
        if (cEl) cEl.textContent = activeDraft.carbs + 'g';
        if (fEl) fEl.textContent = activeDraft.fats + 'g';
        if (itemCal && activeDraft.items[idx]) itemCal.textContent = activeDraft.items[idx].calories + ' سعرة';
      }
    });

    input.addEventListener('change', () => {
      refreshMealLogView();
    });
  });

  // حذف صنف من المسودة
  document.querySelectorAll('.delete-draft-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.getAttribute('data-idx'));
      activeDraft.items.splice(idx, 1);
      recalcDraft(activeDraft);
      notificationService.showToast('تم حذف الصنف من الوجبة', 'info');
      refreshMealLogView();
    });
  });

  // تحليل النص الكتابي
  const handleMealText = async (text) => {
    if (!text.trim()) return;
    notificationService.showToast('جاري تحليل مكونات الوجبة ذكياً...', 'info');
    const result = await aiService.parseMeal(text);
    if (result.success) {
      activeDraft = {
        titleAr: 'وجبة محسوبة ذكياً',
        calories: result.totalCalories,
        protein: result.totalProtein,
        carbs: result.totalCarbs,
        fats: result.totalFats,
        items: result.items
      };
      recalcDraft(activeDraft);
      notificationService.showToast('تم تحليل الوجبة! راجع الأوزان واضغط تأكيد وحفظ', 'success');
      refreshMealLogView(0);
    }
  };

  sendBtn?.addEventListener('click', () => {
    if (textInput && textInput.value) {
      handleMealText(textInput.value);
    }
  });

  textInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleMealText(textInput.value);
    }
  });

  // التسجيل الصوتي
  micBtn?.addEventListener('click', () => {
    notificationService.showToast('جاري الاستماع... تحدث باللغة العربية الآن 🎙️', 'info');
    speechService.startListening(
      (transcript) => {
        if (textInput) textInput.value = transcript;
        handleMealText(transcript);
      },
      (errorMsg) => {
        notificationService.showToast(errorMsg, 'error');
      }
    );
  });

  // رفع صورة وجبة
  photoInput?.addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    notificationService.showToast('جاري فحص صورة الوجبة وتقدير المكونات 📸...', 'info');
    const photoResult = await aiService.analyzeFoodPhoto(file);
    if (photoResult.success) {
      activeDraft = {
        titleAr: photoResult.dishDetectedAr,
        calories: photoResult.totalCalories,
        protein: photoResult.totalProtein,
        carbs: photoResult.totalCarbs,
        fats: photoResult.totalFats,
        items: photoResult.items
      };
      recalcDraft(activeDraft);
      notificationService.showToast(photoResult.warningAr, 'warning');
      refreshMealLogView(0);
    }
  });

  // تأكيد وحفظ الوجبة في السجل اليومي المركزي
  confirmBtn?.addEventListener('click', () => {
    if (!activeDraft.items.length) {
      notificationService.showToast('يرجى إضافة صنف غذائي واحد على الأقل قبل الحفظ', 'error');
      return;
    }
    recalcDraft(activeDraft);
    store.logMeal(activeDraft);
    notificationService.showToast('تم حفظ الوجبة وتحديث مجاميع اليوم بنجاح! 🏆', 'success');
    activeDraft = {
      titleAr: 'وجبة جديدة',
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      items: []
    };
    window.location.hash = '#nutrition';
  });
}
