/**
 * NEON COACH - شاشة سجل الوجبات والذكاء الاصطناعي (Meal Log View)
 * تفاعلية بالكامل: جميع الأزرار تعمل فوراً مع تحديث لحظي للواجهة
 */

import { store } from '../state/store.js';
import { aiService } from '../services/aiService.js';
import { speechService } from '../services/speechService.js';
import { notificationService } from '../services/notificationService.js';
import { searchFoods, foodById, macrosFor, IMPORTED_FOOD_COUNT } from '../data/foods.js';
import { mealNameFromItems } from '../domain/nutritionCalculations.js';

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
          <span style="font-weight: 800; font-family: monospace; color: ${isOver ? '#FF5555' : '#55F7A5'};">
            ${isOver ? `تجاوزت الهدف بـ ${(consumed - targetCalories).toLocaleString('en-US')} سعرة ⚠️` : `متبقي ${remaining.toLocaleString('en-US')} سعرة ⚡`}
          </span>
        </div>

        <div class="macro-bar-track" style="height: 6px;">
          <div class="macro-bar-fill" style="width: ${Math.min(100, actualPct)}%; ${isOver ? 'background: #FF5555; box-shadow: 0 0 10px rgba(255,85,85,0.6);' : ''}"></div>
        </div>
      </div>

      <!-- بطاقة البحث السريع في قاعدة الأطعمة (أكثر من 600 صنف) -->
      <div class="neon-card food-search-card" style="padding: 18px 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div>
            <span style="font-size: 0.8rem; color: #55F7A5; font-weight: 700;">قاعدة الأطعمة</span>
            <h3 style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; margin: 2px 0 0;">ابحث وأضف صنفًا للوجبة</h3>
          </div>
          <span class="badge" style="background: rgba(85,247,165,0.12); color: #55F7A5; border: 1px solid rgba(85,247,165,0.3); font-size: 0.75rem;">
            ${IMPORTED_FOOD_COUNT} صنف
          </span>
        </div>
        <div>
          <input type="text" id="food-search-input" placeholder="مثال: صدر دجاج، بطاطا، أرز، بيض..." autocomplete="off" style="width: 100%; border-radius: 14px; padding: 12px 16px; background: #06100C; border: 1px solid rgba(85,247,165,0.25); color: #FFFFFF; font-size: 0.95rem;">
          <div id="food-search-results" class="food-search-results" style="display: none; margin-top: 10px;"></div>
        </div>
        <small style="color: #8C9992; font-size: 0.75rem; margin-top: 8px; display: block;">
          أضف أصناف الوجبة واحداً بعد الآخر، ثم عدّل وزن كل صنف مباشرة قبل الحفظ.
        </small>
      </div>


      <!-- بطاقة مسودة الوجبة الحية -->
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
            <div style="width: 44px; height: 44px; border-radius: 50%; background: rgba(85,247,165,0.12); border: var(--border-neon); display: flex; align-items: center; justify-content: center; font-size: 1.3rem;">
              🍲
            </div>
          </div>
        </div>

        <!-- شريط الماكروز P / C / F -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; text-align: center; padding: 12px 0; border-top: 1px solid rgba(85,247,165,0.15); border-bottom: 1px solid rgba(85,247,165,0.15); margin-bottom: 16px;">
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

        <!-- زر إضافة صنف آخر -->
        <button type="button" id="add-extra-food-btn" class="btn btn-secondary btn-block" style="margin-bottom: 14px; border-radius: 14px; font-weight: 700; border-style: dashed;">
          <span>➕ إضافة صنف آخر للوجبة</span>
        </button>

        <!-- تفاصيل المكونات الفردية والأوزان القابلة للتعديل مباشرة -->
        <div id="draft-items-list" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px;">
          ${activeDraft.items.length ? activeDraft.items.map((item, idx) => `
            <div class="draft-item-row" data-idx="${idx}">
              <div style="display: flex; align-items: center; gap: 8px;">
                <button type="button" class="btn-icon delete-draft-item" data-idx="${idx}" style="color: #FF6B6B; font-size: 1.1rem; width: 32px; height: 32px;" title="حذف">
                  ✕
                </button>
                <div>
                  <div style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">${item.nameAr || item.name}</div>
                  <small class="item-cal-badge" style="color: #55F7A5; font-family: monospace; font-size: 0.8rem;">${item.calories} سعرة</small>
                </div>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <input type="number" class="draft-item-grams-input" data-idx="${idx}" min="0" step="5" value="${item.grams}">
                <span style="color: #B8C0BC; font-size: 0.85rem;">غ</span>
              </div>
            </div>
          `).join('') : `
            <div style="padding: 24px 16px; text-align: center; color: #8C9992; font-size: 0.92rem; border: 1px dashed rgba(85,247,165,0.2); border-radius: 14px; background: rgba(5,13,9,0.5);">
              <div style="font-size: 1.6rem; margin-bottom: 6px;">🍽️</div>
              <div style="color: #FFFFFF; font-weight: 700; margin-bottom: 4px;">لم يتم إضافة أطعمة إلى الوجبة بعد</div>
              <small style="color: #8C9992;">ابحث عن الأطعمة في الصندوق بالأعلى، أو اكتب، أو صوّر طبقك للبدء.</small>
            </div>
          `}
        </div>

        <!-- زر تأكيد وحفظ الوجبة -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button id="confirm-save-meal-btn" class="btn btn-primary btn-lg btn-block" style="border-radius: 18px; font-weight: 800;">
            تأكيد وحفظ الوجبة كاملة 🥗
          </button>
        </div>

      </div>

      <!-- إشعار: ضمن خطتك اليوم ✔ -->
      <div class="neon-card" style="padding: 14px 18px; display: flex; align-items: center; justify-content: space-between; border-color: rgba(85,247,165,0.35);">
        <span style="font-weight: 700; color: #FFFFFF; font-size: 0.95rem;">ضمن خطتك اليومية</span>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(85,247,165,0.15); border: 1px solid #55F7A5; display: flex; align-items: center; justify-content: center; color: #55F7A5;">
          ✓
        </div>
      </div>

      <!-- نافذة إضافة صنف آخر المنبثقة -->
      <div id="add-extra-food-modal" class="ai-modal-overlay">
        <div class="ai-modal-panel" style="height: auto; max-height: 85vh; padding: 20px; border-radius: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
            <h3 style="color: #55F7A5; font-size: 1.15rem; margin: 0;">➕ إضافة صنف آخر</h3>
            <button id="close-extra-food-modal-btn" class="btn-icon">✕</button>
          </div>
          <div>
            <input type="text" id="extra-food-search-input" placeholder="ابحث عن الصنف (مثال: تفاح، بيض، رز...)" autocomplete="off" style="width: 100%; border-radius: 14px; padding: 12px 14px; background: #06100C; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF;">
            <div id="extra-food-results" class="food-search-results" style="margin-top: 12px; max-height: 50vh;"></div>
          </div>
        </div>
      </div>

    </div>
  `;
}

function refreshMealLogView(focusIdx = null) {
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderMealLogView();
    bindMealLogEvents();

    if (focusIdx !== null && focusIdx !== undefined) {
      setTimeout(() => {
        const row = document.querySelector(`.draft-item-row[data-idx="${focusIdx}"]`);
        if (row) {
          row.scrollIntoView({ behavior: 'smooth', block: 'center' });
          row.style.transition = 'box-shadow 0.35s ease, border-color 0.35s ease, transform 0.25s ease';
          row.style.borderColor = '#55F7A5';
          row.style.boxShadow = '0 0 18px rgba(85, 247, 165, 0.45)';
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
          }, 1800);
        } else {
          const draftCard = document.getElementById('meal-draft-card');
          draftCard?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
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

  const addExtraFoodBtn = document.getElementById('add-extra-food-btn');
  const extraFoodModal = document.getElementById('add-extra-food-modal');
  const closeExtraFoodModalBtn = document.getElementById('close-extra-food-modal-btn');
  const extraFoodInput = document.getElementById('extra-food-search-input');
  const extraFoodResults = document.getElementById('extra-food-results');

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
    const existingIdx = activeDraft.items.findIndex(item => item.foodId === food.id);
    if (existingIdx !== -1) {
      activeDraft.items[existingIdx].grams = (Number(activeDraft.items[existingIdx].grams) || 0) + 100;
      targetIdx = existingIdx;
    } else {
      activeDraft.items.push({
        id: `food_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        foodId: food.id,
        nameAr: food.name || food.nameAr,
        name: food.name || food.nameAr,
        grams: 100,
        calories: Math.round(food.per100?.kcal || 0),
        protein: Math.round(food.per100?.p || 0),
        carbs: Math.round(food.per100?.c || 0),
        fats: Math.round(food.per100?.f || 0)
      });
      targetIdx = activeDraft.items.length - 1;
    }
    recalcDraft(activeDraft);
    notificationService.showToast(`تمت إضافة ${food.name || food.nameAr} إلى الوجبة 🥗`, 'success');
    refreshMealLogView(targetIdx);
  };

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
      foodSearchResults.innerHTML = '<div style="padding: 10px; color: #8C9992; font-size: 0.85rem; text-align: center;">لم نجد صنفًا مطابقًا. جرب كلمة أخرى.</div>';
      return;
    }
    foodSearchResults.innerHTML = results.map(f => `
      <button type="button" class="food-search-result-btn" data-food-id="${f.id}">
        <div>
          <b>${f.name || f.nameAr}</b>
          ${f.nameEn ? `<small>${f.nameEn}</small>` : ''}
        </div>
        <span class="food-kcal-badge">${f.per100?.kcal || 0} kcal / 100g</span>
      </button>
    `).join('');

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

  // نافذة إضافة صنف آخر
  addExtraFoodBtn?.addEventListener('click', () => {
    extraFoodModal?.classList.add('open');
    if (extraFoodInput) {
      extraFoodInput.value = '';
      renderExtraFoodList(searchFoods('', 10));
      setTimeout(() => extraFoodInput.focus(), 80);
    }
  });

  closeExtraFoodModalBtn?.addEventListener('click', () => {
    extraFoodModal?.classList.remove('open');
  });

  const renderExtraFoodList = (results) => {
    if (!extraFoodResults) return;
    if (!results.length) {
      extraFoodResults.innerHTML = '<div style="padding: 10px; color: #8C9992; font-size: 0.85rem; text-align: center;">اكتب اسم الصنف للبحث...</div>';
      return;
    }
    extraFoodResults.innerHTML = results.map(f => `
      <button type="button" class="food-search-result-btn" data-extra-food-id="${f.id}">
        <div>
          <b>${f.name || f.nameAr}</b>
          ${f.nameEn ? `<small>${f.nameEn}</small>` : ''}
        </div>
        <span class="food-kcal-badge">${f.per100?.kcal || 0} kcal / 100g</span>
      </button>
    `).join('');

    extraFoodResults.querySelectorAll('[data-extra-food-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const f = foodById(btn.getAttribute('data-extra-food-id'));
        if (f) {
          extraFoodModal?.classList.remove('open');
          addFoodToDraft(f);
        }
      });
    });
  };

  extraFoodInput?.addEventListener('input', () => {
    const q = extraFoodInput.value.trim();
    renderExtraFoodList(searchFoods(q, 18));
  });

  // تعديل الغرامات اللحظي لكل صنف
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
    if (!photoResult.success) notificationService.showToast(photoResult.warningAr, 'warning');
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
