/**
 * NEON COACH - شاشة الوصفات الرياضية الصحية (Healthy Fitness Recipes Hub)
 * استكشاف وصفات محسوبة السعرات والماكروز مع خيارات التصفية والبحث والإضافة الفورية لوجبات اليوم والمفضلة
 */

import { RECIPE_CATEGORIES, RECIPES_DATA } from '../data/recipesData.js';
import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { initImageProtectionGuard } from '../utils/imageSecurity.js';

let activeCategory = 'all';
let searchQuery = '';
let currentSort = 'default';
let activeModalRecipeId = null;

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function getCategoryMeta(recipe) {
  const cat = RECIPE_CATEGORIES.find(c => c.id === recipe.category || c.id === recipe.categoryRaw);
  if (cat && cat.id !== 'all' && cat.id !== 'favorites' && cat.id !== 'high_protein') {
    return { label: cat.label, icon: cat.icon };
  }
  return { label: recipe.categoryRaw || 'وجبة رياضية', icon: recipe.image || '🍗' };
}

function getFilteredRecipes() {
  const favoriteIds = store.getFavoriteRecipeIds ? store.getFavoriteRecipeIds() : [];

  let list = RECIPES_DATA.filter(recipe => {
    let matchesCategory = true;
    if (activeCategory === 'all') {
      matchesCategory = true;
    } else if (activeCategory === 'favorites') {
      matchesCategory = favoriteIds.includes(recipe.id);
    } else if (activeCategory === 'high_protein') {
      matchesCategory = recipe.isHighProtein;
    } else {
      matchesCategory = (recipe.category === activeCategory || recipe.categoryRaw === activeCategory);
    }

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q
      ? true
      : (recipe.titleAr.toLowerCase().includes(q) ||
         (recipe.titleEn && recipe.titleEn.toLowerCase().includes(q)) ||
         (recipe.categoryRaw && recipe.categoryRaw.toLowerCase().includes(q)) ||
         (recipe.description && recipe.description.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  // تطبيق الترتيب (Sorting)
  if (currentSort === 'high_protein') {
    list = [...list].sort((a, b) => {
      const pA = typeof a.protein === 'number' ? a.protein : (parseFloat(a.protein) || 0);
      const pB = typeof b.protein === 'number' ? b.protein : (parseFloat(b.protein) || 0);
      return pB - pA;
    });
  } else if (currentSort === 'low_cal') {
    list = [...list].sort((a, b) => {
      const cA = typeof a.calories === 'number' ? a.calories : (parseFloat(a.calories) || 0);
      const cB = typeof b.calories === 'number' ? b.calories : (parseFloat(b.calories) || 0);
      return cA - cB;
    });
  } else if (currentSort === 'high_cal') {
    list = [...list].sort((a, b) => {
      const cA = typeof a.calories === 'number' ? a.calories : (parseFloat(a.calories) || 0);
      const cB = typeof b.calories === 'number' ? b.calories : (parseFloat(b.calories) || 0);
      return cB - cA;
    });
  } else if (currentSort === 'quickest') {
    list = [...list].sort((a, b) => {
      const tA = parseInt(a.prepTime, 10) || 30;
      const tB = parseInt(b.prepTime, 10) || 30;
      return tA - tB;
    });
  }

  return list;
}

function renderCardsHtml(recipes) {
  if (recipes.length === 0) {
    if (activeCategory === 'favorites') {
      return `
        <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: rgba(7, 16, 13, 0.6); border: 1px dashed rgba(239, 68, 68, 0.3); border-radius: 20px; margin-top: 10px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🤍</div>
          <h3 style="color: #FFFFFF; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px;">لا توجد وصفات في المفضلة بعد</h3>
          <p style="color: #8C9992; font-size: 0.85rem; margin: 0 0 16px;">اضغط على علامة القلب في أي وصفة لحفظها هنا والرجوع إليها بسهولة في أي وقت</p>
          <button id="recipes-reset-filter-btn" class="btn btn-secondary" style="border-radius: 12px; padding: 8px 18px; font-size: 0.85rem; border: 1px solid rgba(85,247,165,0.3); background: rgba(85,247,165,0.1); color: #55F7A5;">
            تصفح كافة الوصفات
          </button>
        </div>
      `;
    }

    return `
      <div style="grid-column: 1 / -1; text-align: center; padding: 50px 20px; background: rgba(7, 16, 13, 0.6); border: 1px dashed rgba(85,247,165,0.2); border-radius: 20px; margin-top: 10px;">
        <div style="font-size: 3rem; margin-bottom: 12px;">🥗</div>
        <h3 style="color: #FFFFFF; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px;">لا توجد وصفات مطابقة لبحثك</h3>
        <p style="color: #8C9992; font-size: 0.85rem; margin: 0 0 16px;">جرّب كتابة كلمة أخرى أو قم باختيار تصنيف مختلف</p>
        <button id="recipes-reset-filter-btn" class="btn btn-secondary" style="border-radius: 12px; padding: 8px 18px; font-size: 0.85rem;">
          عرض كافة الوصفات
        </button>
      </div>
    `;
  }
  return recipes.map(recipe => renderRecipeCard(recipe)).join('');
}

export function renderRecipesView() {
  const filteredRecipes = getFilteredRecipes();
  const favoriteIds = store.getFavoriteRecipeIds ? store.getFavoriteRecipeIds() : [];

  return `
    <div class="recipes-view-container view-fade-slide" style="max-width: 900px; margin: 0 auto; padding: 14px 12px 105px; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- ترويسة الصفحة مطابقة للتصميم -->
      <div style="text-align: center; margin-top: 4px; margin-bottom: 2px;">
        <h1 style="font-size: 1.65rem; font-weight: 900; color: #FFFFFF; margin: 0 0 6px; letter-spacing: -0.02em;">
          وصفات تناسب هدفك
        </h1>
        <div style="font-size: 0.88rem; color: #8C9992; margin: 0;">
          اختر وجبتك وسجلها بسهولة
        </div>
      </div>

      <!-- شريط البحث السريع -->
      <div style="position: relative; width: 100%;">
        <input
          type="text"
          id="recipes-search-input"
          value="${escapeHtml(searchQuery)}"
          placeholder="ابحث عن وصفة أو مكون..."
          style="width: 100%; min-height: 48px; padding: 12px 42px 12px 38px; background: #07100D; border: 1px solid rgba(85,247,165,0.22); border-radius: 14px; color: #FFFFFF; font-size: 0.92rem; outline: none; transition: border-color 0.2s;"
        />
        <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 1.05rem; pointer-events: none; opacity: 0.7;">
          🔍
        </span>
        <button id="recipes-clear-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #8C9992; font-size: 1.1rem; cursor: pointer; padding: 6px; display: ${searchQuery ? 'flex' : 'none'}; align-items: center; justify-content: center;">
          ✕
        </button>
      </div>

      <!-- فلاتر التصنيفات (Category Chips) وتتضمن المفضلة -->
      <div class="recipes-category-scroll">
        ${RECIPE_CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          const isFavCat = cat.id === 'favorites';
          const favCount = isFavCat ? favoriteIds.length : null;
          return `
            <button
              type="button"
              class="recipe-cat-chip ${isSelected ? 'active' : ''}"
              data-cat="${cat.id}"
            >
              <span class="chip-icon">${isFavCat && isSelected ? '❤️' : cat.icon}</span>
              <span class="chip-label">${cat.label}</span>
              ${favCount !== null && favCount > 0 ? `
                <span style="font-size: 0.72rem; padding: 2px 7px; border-radius: 99px; background: rgba(239,68,68,0.25); color: #EF4444; font-weight: 900; margin-right: 2px;">
                  ${favCount}
                </span>
              ` : ''}
            </button>
          `;
        }).join('')}
      </div>

      <!-- شريط التحكم: عداد الوصفات والترتيب والتصفية -->
      <div class="recipes-sort-bar">
        <div style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.25); border-radius: 20px; font-size: 0.78rem; font-weight: 800; color: #55F7A5;">
          <span id="recipes-count-badge">${filteredRecipes.length}</span>
          <span style="color: #B8C0BC;">وصفة معتمدة</span>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="recipes-sort-select" class="recipes-sort-select" aria-label="ترتيب الوصفات">
            <option value="default" ${currentSort === 'default' ? 'selected' : ''}>الترتيب: الافتراضي</option>
            <option value="high_protein" ${currentSort === 'high_protein' ? 'selected' : ''}>الترتيب: الأعلى بروتيناً</option>
            <option value="low_cal" ${currentSort === 'low_cal' ? 'selected' : ''}>الترتيب: الأقل سعرات</option>
            <option value="high_cal" ${currentSort === 'high_cal' ? 'selected' : ''}>الترتيب: الأكثر سعرات</option>
            <option value="quickest" ${currentSort === 'quickest' ? 'selected' : ''}>الترتيب: الأسرع تحضيراً</option>
          </select>
        </div>
      </div>

      <!-- شبكة بطاقات الوصفات -->
      <div id="recipes-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
        ${renderCardsHtml(filteredRecipes)}
      </div>

      <!-- مودال عرض تفاصيل الوصفة والمقادير والتحضير -->
      <div id="recipe-detail-modal" class="ai-modal-overlay" style="display: none;">
        <div class="ai-modal-panel" id="recipe-modal-content" style="max-width: 580px; max-height: 90vh; overflow-y: auto; padding: 18px; text-align: right; box-sizing: border-box;">
          <!-- محتوى المودال يتم تحديثه ديناميكياً -->
        </div>
      </div>

    </div>
  `;
}

function renderRecipeCard(recipe) {
  const isHighProt = typeof recipe.protein === 'number' ? recipe.protein >= 25 : (parseFloat(recipe.protein) >= 25);
  const calText = recipe.calories !== undefined && recipe.calories !== null ? recipe.calories : '—';
  const protText = recipe.protein !== undefined && recipe.protein !== null ? `${recipe.protein}${recipe.protein !== '—' && !String(recipe.protein).includes('غ') ? 'غ' : ''}` : '—';
  const carbText = recipe.carbs !== undefined && recipe.carbs !== null ? `${recipe.carbs}${recipe.carbs !== '—' && !String(recipe.carbs).includes('غ') ? 'غ' : ''}` : '—';
  const fatText = recipe.fats !== undefined && recipe.fats !== null ? `${recipe.fats}${recipe.fats !== '—' && !String(recipe.fats).includes('غ') ? 'غ' : ''}` : '—';
  const catMeta = getCategoryMeta(recipe);
  const isFav = store.isRecipeFavorite ? store.isRecipeFavorite(recipe.id) : false;

  return `
    <div class="neon-card recipe-card" style="padding: 14px; display: flex; flex-direction: column; justify-content: space-between; gap: 12px; border-radius: 18px; position: relative; overflow: hidden; background: #07100D; border: 1px solid rgba(85,247,165,0.18);">
      
      <!-- الجزء العلوي: الصورة مع زر القلب للمفضلة -->
      <div>
        <div style="position: relative; width: 100%; aspect-ratio: 16 / 9.5; border-radius: 14px; overflow: hidden; background: #020704; box-shadow: 0 4px 12px rgba(0,0,0,0.35);">
          
          <!-- زر القلب (إضافة / إزالة من المفضلة) -->
          <button
            type="button"
            class="recipe-fav-heart-btn ${isFav ? 'is-fav' : ''}"
            data-recipe-id="${recipe.id}"
            title="${isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}"
            aria-label="${isFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}"
          >
            ${isFav
              ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
              : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`
            }
          </button>

          <!-- صورة عرض الطبق النهائي -->
          ${recipe.imageUrl ? `
            <div class="recipe-dish-preview btn-open-recipe" data-recipe-id="${recipe.id}" style="width: 100%; height: 100%; cursor: pointer;" title="انقر لعرض تفاصيل ومقادير الوصفة">
              <img
                src="${escapeHtml(recipe.imageUrl)}"
                alt="${escapeHtml(recipe.titleAr)}"
                loading="lazy"
                decoding="async"
                draggable="false"
                style="position: absolute; width: 200%; left: -3%; right: auto; top: 0; transform: translateY(-69.5%) translateZ(0); display: block; max-width: none; border-radius: 0;"
              />
            </div>
          ` : `
            <div class="recipe-dish-preview btn-open-recipe" data-recipe-id="${recipe.id}" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 2.8rem; cursor: pointer;">
              ${recipe.image || '🥗'}
            </div>
          `}
        </div>

        <!-- عنوان الوجبة (في المنتصف كما في الصورة) -->
        <h3 class="btn-open-recipe" data-recipe-id="${recipe.id}" style="font-size: 1.06rem; font-weight: 800; color: #FFFFFF; margin: 10px 0 6px; text-align: center; line-height: 1.35; cursor: pointer;">
          ${escapeHtml(recipe.titleAr)}
        </h3>

        <!-- شارات التصنيف ووقت التحضير -->
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px;">
          <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #B8C0BC; border: 1px solid rgba(255,255,255,0.08); display: inline-flex; align-items: center; gap: 4px;">
            <span>${catMeta.icon}</span>
            <span>${escapeHtml(catMeta.label)}</span>
          </span>
          <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 9px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #B8C0BC; border: 1px solid rgba(255,255,255,0.08); display: inline-flex; align-items: center; gap: 4px;">
            <span>⏱️</span>
            <span>${escapeHtml(recipe.prepTime)}</span>
          </span>
          ${isHighProt ? `
            <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; background: rgba(85,247,165,0.12); color: #55F7A5; border: 1px solid rgba(85,247,165,0.28);">
              💪 بروتين
            </span>
          ` : ''}
        </div>
      </div>

      <!-- الماكروز والسعرات (شبكة من 4 أعمدة مع كلمة للحصة الواحدة) -->
      <div style="background: rgba(3, 10, 7, 0.65); padding: 9px 8px 6px; border-radius: 12px; border: 1px solid rgba(85,247,165,0.12);">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 4px;">
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">سعرات</div>
            <div style="font-size: 1.05rem; font-weight: 900; color: #55F7A5; font-family: monospace;">${calText}</div>
          </div>
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">بروتين</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">${protText}</div>
          </div>
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">كارب</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #38BDF8; font-family: monospace;">${carbText}</div>
          </div>
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">دهون</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #F59E0B; font-family: monospace;">${fatText}</div>
          </div>
        </div>
        <div style="text-align: left; font-size: 0.68rem; color: #8C9992; margin-top: 5px; padding-left: 4px;">
          للحصة الواحدة
        </div>
      </div>

      <!-- أزرار الإجراءات: زر أضف لليوم وزر عرض الوصفة -->
      <div style="display: flex; align-items: center; gap: 8px; margin-top: 2px;">
        <!-- زر أضف لليوم (الزر الأساسي باللون الأخضر النيون) -->
        <button
          type="button"
          class="btn-log-recipe-meal"
          data-recipe-id="${recipe.id}"
          title="إضافة هذه الوجبة إلى سجل اليوم"
          aria-label="إضافة هذه الوجبة إلى سجل اليوم"
          style="flex: 1.25; min-height: 42px; border-radius: 12px; padding: 8px 12px; font-size: 0.88rem; font-weight: 900; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: none; background: #55F7A5; color: #07100D; cursor: pointer;"
        >
          <span style="font-size: 1.15rem; font-weight: 900; line-height: 1;">+</span>
          <span>أضف لليوم</span>
        </button>

        <!-- زر عرض الوصفة -->
        <button
          type="button"
          class="btn-open-recipe"
          data-recipe-id="${recipe.id}"
          style="flex: 1; min-height: 42px; border-radius: 12px; padding: 8px 10px; font-size: 0.85rem; font-weight: 800; display: inline-flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid rgba(85,247,165,0.22); background: rgba(255,255,255,0.05); color: #FFFFFF; cursor: pointer;"
        >
          <span style="font-size: 0.92rem; opacity: 0.85;">📄</span>
          <span>عرض الوصفة</span>
        </button>
      </div>

    </div>
  `;
}

function renderRecipeModalDetail(recipe) {
  const calBadge = recipe.calories && recipe.calories !== '—' ? `(${recipe.calories} سعرة)` : '';
  const isFav = store.isRecipeFavorite ? store.isRecipeFavorite(recipe.id) : false;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; direction: rtl; text-align: right;">
      
      <!-- ترويسة المودال -->
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 10px;">
        <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
          <span style="font-size: 1.5rem; flex-shrink: 0;">${recipe.image || '🥗'}</span>
          <h2 style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
            ${escapeHtml(recipe.titleAr)}
          </h2>
        </div>

        <button type="button" id="btn-close-recipe-modal" class="btn-icon" aria-label="إغلاق" style="width: 36px; height: 36px; min-width: 36px; border-radius: 10px; color: #B8C0BC; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
          ✕
        </button>
      </div>

      <!-- صورة الوصفة الكاملة (المقادير والتحضير المصورة) -->
      <div class="recipe-modal-poster-wrap" style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; background: #030806; border: 1px solid rgba(85,247,165,0.22); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <img
          src="${escapeHtml(recipe.imageUrl)}"
          alt="${escapeHtml(recipe.titleAr)}"
          loading="eager"
          decoding="async"
          draggable="false"
          style="width: 100%; height: auto; display: block; border-radius: 15px;"
        />
      </div>

      <!-- أزرار الإجراء السريع: زر الإضافة لليوم وزر القلب للمفضلة -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
        <button
          type="button"
          id="btn-modal-add-to-today"
          data-recipe-id="${recipe.id}"
          class="btn btn-primary btn-block"
          style="border-radius: 14px; padding: 13px; font-size: 0.96rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer; background: #55F7A5; color: #07100D;"
        >
          <span style="font-size: 1.1rem; font-weight: 900;">+</span>
          <span>إضافة هذه الوجبة إلى سجل اليوم ${calBadge}</span>
        </button>

        <button
          type="button"
          id="btn-modal-toggle-fav"
          data-recipe-id="${recipe.id}"
          class="btn btn-secondary btn-block"
          style="border-radius: 14px; padding: 11px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 7px; cursor: pointer; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.28); color: #FFFFFF;"
        >
          <span>${isFav ? '❤️' : '🤍'}</span>
          <span>${isFav ? 'إزالة من الوجبات المفضلة' : 'حفظ في وجباتي المفضلة'}</span>
        </button>
      </div>

    </div>
  `;
}

function logRecipeToStore(recipe) {
  if (!recipe) return;
  const numCal = typeof recipe.calories === 'number' ? recipe.calories : (parseFloat(recipe.calories) || 0);
  const numProt = typeof recipe.protein === 'number' ? recipe.protein : (parseFloat(recipe.protein) || 0);
  const numCarb = typeof recipe.carbs === 'number' ? recipe.carbs : (parseFloat(recipe.carbs) || 0);
  const numFat = typeof recipe.fats === 'number' ? recipe.fats : (parseFloat(recipe.fats) || 0);

  const newMeal = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'rec_' + Date.now(),
    titleAr: recipe.titleAr,
    calories: numCal,
    protein: numProt,
    carbs: numCarb,
    fats: numFat,
    time: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' }),
    items: [{ name: recipe.titleAr, weight: 1, calories: numCal }]
  };

  store.logMeal(newMeal);
  notificationService.showToast(`تمت إضافة «${recipe.titleAr}» إلى وجبات اليوم ✓`, 'success');
}

export function bindRecipesEvents() {
  const container = document.querySelector('.recipes-view-container');
  if (!container) return;

  // تفعيل حماية الصور من النقر بزر الفأرة الأيمن والسحب
  initImageProtectionGuard(container);

  const countBadge = container.querySelector('#recipes-count-badge');
  const cardsGrid = container.querySelector('#recipes-cards-grid');

  const updateGridOnly = () => {
    const filtered = getFilteredRecipes();
    if (countBadge) countBadge.textContent = filtered.length;
    if (cardsGrid) {
      cardsGrid.innerHTML = renderCardsHtml(filtered);
    }
    // تحديث عداد المفضلة في الشريحة إن وجد
    const favChip = container.querySelector('.recipe-cat-chip[data-cat="favorites"]');
    if (favChip) {
      const favIds = store.getFavoriteRecipeIds ? store.getFavoriteRecipeIds() : [];
      let badge = favChip.querySelector('span:last-child');
      if (favIds.length > 0) {
        if (!badge || badge.classList.contains('chip-label')) {
          const newSpan = document.createElement('span');
          newSpan.style.cssText = 'font-size: 0.72rem; padding: 2px 7px; border-radius: 99px; background: rgba(239,68,68,0.25); color: #EF4444; font-weight: 900; margin-right: 2px;';
          newSpan.textContent = favIds.length;
          favChip.appendChild(newSpan);
        } else {
          badge.textContent = favIds.length;
        }
      } else if (badge && !badge.classList.contains('chip-label')) {
        badge.remove();
      }
    }
  };

  // 1. فلتر التصنيفات (تشمل الكل والمفضلة وكافة الأقسام)
  container.querySelectorAll('.recipe-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.cat;
      container.querySelectorAll('.recipe-cat-chip').forEach(c => {
        const isCurrent = c.dataset.cat === activeCategory;
        c.classList.toggle('active', isCurrent);
        const iconSpan = c.querySelector('.chip-icon');
        if (c.dataset.cat === 'favorites' && iconSpan) {
          iconSpan.textContent = isCurrent ? '❤️' : '🤍';
        }
      });
      updateGridOnly();
    });
  });

  // 2. قائمة الترتيب (Sorting)
  const sortSelect = container.querySelector('#recipes-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      updateGridOnly();
    });
  }

  // 3. البحث الفوري (Debounced)
  const searchInput = document.getElementById('recipes-search-input');
  const clearBtn = document.getElementById('recipes-clear-search');

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (clearBtn) clearBtn.style.display = searchQuery ? 'flex' : 'none';
      clearTimeout(window._recipeSearchDebounce);
      window._recipeSearchDebounce = setTimeout(() => {
        updateGridOnly();
      }, 100);
    });
  }

  clearBtn?.addEventListener('click', () => {
    searchQuery = '';
    if (searchInput) {
      searchInput.value = '';
      searchInput.focus();
    }
    clearBtn.style.display = 'none';
    updateGridOnly();
  });

  // 4. إعادة ضبط الفلاتر عند الضغط على زر "عرض كافة الوصفات" في الحالة الفارغة
  container.addEventListener('click', (e) => {
    if (e.target.closest('#recipes-reset-filter-btn')) {
      activeCategory = 'all';
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      if (clearBtn) clearBtn.style.display = 'none';
      container.querySelectorAll('.recipe-cat-chip').forEach(c => {
        c.classList.toggle('active', c.dataset.cat === 'all');
      });
      updateGridOnly();
    }
  });

  // 5. فتح تفاصيل الوصفة في المودال (Event Delegation)
  const modal = document.getElementById('recipe-detail-modal');
  const modalContent = document.getElementById('recipe-modal-content');

  const openRecipeModal = (recipeId) => {
    const recipe = RECIPES_DATA.find(r => r.id === recipeId);
    if (!recipe || !modal || !modalContent) return;
    activeModalRecipeId = recipeId;
    modalContent.innerHTML = renderRecipeModalDetail(recipe);
    modal.style.display = 'flex';
    modal.classList.add('open');

    // إذا كانت الصورة محملة مسبقاً نضمن ظهورها فوراً
    const modalImg = modalContent.querySelector('img');
    if (modalImg && modalImg.complete) {
      modalImg.style.opacity = '1';
    }

    // ربط أزرار المودال
    document.getElementById('btn-close-recipe-modal')?.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.style.display = 'none';
    });

    document.getElementById('btn-modal-add-to-today')?.addEventListener('click', () => {
      logRecipeToStore(recipe);
      modal.classList.remove('open');
      modal.style.display = 'none';
    });

    document.getElementById('btn-modal-toggle-fav')?.addEventListener('click', () => {
      if (store.toggleFavoriteRecipe) {
        const isNowFav = store.toggleFavoriteRecipe(recipe.id);
        const favBtn = document.getElementById('btn-modal-toggle-fav');
        if (favBtn) {
          favBtn.innerHTML = `
            <span>${isNowFav ? '❤️' : '🤍'}</span>
            <span>${isNowFav ? 'إزالة من الوجبات المفضلة' : 'حفظ في وجباتي المفضلة'}</span>
          `;
        }
        if (isNowFav) {
          notificationService.showToast(`تمت إضافة «${recipe.titleAr}» إلى المفضلة ❤️`, 'success');
        } else {
          notificationService.showToast(`تمت إزالة «${recipe.titleAr}» من المفضلة`, 'info');
        }
        updateGridOnly();
      }
    });
  };

  // 6. تفويض أحداث النقر للبطاقات (زر القلب وزر أضف لليوم وزر عرض الوصفة)
  container.addEventListener('click', (e) => {
    // أ. النقر على زر القلب (المفضلة)
    const heartBtn = e.target.closest('.recipe-fav-heart-btn');
    if (heartBtn) {
      e.stopPropagation();
      e.preventDefault();
      const recipeId = heartBtn.dataset.recipeId;
      const recipe = RECIPES_DATA.find(r => r.id === recipeId);
      if (!recipe) return;

      const isNowFav = store.toggleFavoriteRecipe(recipeId);
      heartBtn.classList.toggle('is-fav', isNowFav);
      heartBtn.title = isNowFav ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة';
      heartBtn.setAttribute('aria-label', heartBtn.title);

      if (isNowFav) {
        heartBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#EF4444" stroke="#EF4444" stroke-width="1.5"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`;
        heartBtn.style.transform = 'scale(1.28)';
        setTimeout(() => { heartBtn.style.transform = 'scale(1)'; }, 200);
        notificationService.showToast(`تمت إضافة «${recipe.titleAr}» إلى المفضلة ❤️`, 'success');
      } else {
        heartBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`;
        notificationService.showToast(`تمت إزالة «${recipe.titleAr}» من المفضلة`, 'info');
      }

      // إذا كان التصنيف النشط هو المفضلة يتم تحديث الشبكة فوراً
      if (activeCategory === 'favorites') {
        updateGridOnly();
      } else {
        // تحديث عداد المفضلة في الشريحة العلوية
        const favChip = container.querySelector('.recipe-cat-chip[data-cat="favorites"]');
        if (favChip) {
          const favIds = store.getFavoriteRecipeIds ? store.getFavoriteRecipeIds() : [];
          let badge = favChip.querySelector('span:last-child');
          if (favIds.length > 0) {
            if (!badge || badge.classList.contains('chip-label')) {
              const newSpan = document.createElement('span');
              newSpan.style.cssText = 'font-size: 0.72rem; padding: 2px 7px; border-radius: 99px; background: rgba(239,68,68,0.25); color: #EF4444; font-weight: 900; margin-right: 2px;';
              newSpan.textContent = favIds.length;
              favChip.appendChild(newSpan);
            } else {
              badge.textContent = favIds.length;
            }
          } else if (badge && !badge.classList.contains('chip-label')) {
            badge.remove();
          }
        }
      }
      return;
    }

    // ب. النقر على زر "أضف لليوم"
    const logBtn = e.target.closest('.btn-log-recipe-meal');
    if (logBtn) {
      e.stopPropagation();
      const recipe = RECIPES_DATA.find(r => r.id === logBtn.dataset.recipeId);
      if (recipe) {
        logRecipeToStore(recipe);
        const originalHtml = logBtn.innerHTML;
        logBtn.innerHTML = `
          <span style="font-size: 1.1rem; line-height: 1;">✓</span>
          <span>تمت الإضافة!</span>
        `;
        logBtn.style.background = '#6df8b3';
        logBtn.style.transform = 'scale(0.96)';
        setTimeout(() => {
          logBtn.innerHTML = originalHtml;
          logBtn.style.background = '#55F7A5';
          logBtn.style.transform = 'scale(1)';
        }, 1200);
      }
      return;
    }

    // ج. النقر على زر أو كارت "عرض الوصفة"
    const openBtn = e.target.closest('.btn-open-recipe');
    if (openBtn) {
      openRecipeModal(openBtn.dataset.recipeId);
    }
  });

  // إغلاق المودال عند النقر على الخلفية
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
  });
}
