/**
 * NEON COACH - شاشة الوصفات الرياضية الصحية (Healthy Fitness Recipes Hub)
 * استكشاف وصفات محسوبة السعرات والماكروز مع خيارات التصفية والبحث والإضافة الفورية لوجبات اليوم والمفضلة
 */

import { RECIPE_CATEGORIES, RECIPES_DATA } from '../data/recipesData.js';
import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';

let activeCategory = 'all';
let searchQuery = '';
let activeModalRecipeId = null;

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderRecipesView() {
  const filteredRecipes = RECIPES_DATA.filter(recipe => {
    const matchesCategory = activeCategory === 'all'
      ? true
      : activeCategory === 'high_protein'
        ? recipe.isHighProtein
        : (recipe.category === activeCategory || recipe.categoryRaw === activeCategory);

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q
      ? true
      : (recipe.titleAr.toLowerCase().includes(q) ||
         (recipe.titleEn && recipe.titleEn.toLowerCase().includes(q)) ||
         (recipe.categoryRaw && recipe.categoryRaw.toLowerCase().includes(q)) ||
         (recipe.description && recipe.description.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  return `
    <div class="recipes-view-container view-fade-slide" style="max-width: 900px; margin: 0 auto; padding: 14px 12px 105px; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- ترويسة الصفحة -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-top: 2px;">
        <div style="flex: 1; min-width: 0;">
          <h1 style="font-size: 1.55rem; font-weight: 900; color: #FFFFFF; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.65rem;">📖</span>
            <span>وصفات نيون الصحية</span>
          </h1>
          <div style="font-size: 0.82rem; color: #8C9992; margin-top: 3px; line-height: 1.4;">
            وجبات رياضية محسوبة السعرات والماكروز لدعم أهدافك الرياضية
          </div>
        </div>

        <div style="display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.25); border-radius: 20px; font-size: 0.76rem; font-weight: 800; color: #55F7A5; flex-shrink: 0; margin-top: 4px;">
          <span>${filteredRecipes.length}</span>
          <span style="color: #B8C0BC;">وصفة</span>
        </div>
      </div>

      <!-- شريط البحث السريع -->
      <div style="position: relative; width: 100%;">
        <input
          type="text"
          id="recipes-search-input"
          value="${escapeHtml(searchQuery)}"
          placeholder="ابحث عن أكلة، مكون (دجاج، شوفان، تونة...)"
          style="width: 100%; min-height: 46px; padding: 12px 42px 12px 36px; background: #07100D; border: 1px solid rgba(85,247,165,0.22); border-radius: 14px; color: #FFFFFF; font-size: 0.92rem; outline: none; transition: border-color 0.2s;"
        />
        <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 1.05rem; pointer-events: none; opacity: 0.7;">
          🔍
        </span>
        ${searchQuery ? `
          <button id="recipes-clear-search" style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #8C9992; font-size: 1.1rem; cursor: pointer; padding: 6px; display: flex; align-items: center; justify-content: center;">
            ✕
          </button>
        ` : ''}
      </div>

      <!-- فلاتر التصنيفات (Category Chips) -->
      <div class="recipes-category-scroll">
        ${RECIPE_CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          return `
            <button
              type="button"
              class="recipe-cat-chip ${isSelected ? 'active' : ''}"
              data-cat="${cat.id}"
            >
              <span class="chip-icon">${cat.icon}</span>
              <span class="chip-label">${cat.label}</span>
            </button>
          `;
        }).join('')}
      </div>

      <!-- شبكة بطاقات الوصفات -->
      ${filteredRecipes.length === 0 ? `
        <div style="text-align: center; padding: 50px 20px; background: rgba(7, 16, 13, 0.6); border: 1px dashed rgba(85,247,165,0.2); border-radius: 20px; margin-top: 10px;">
          <div style="font-size: 3rem; margin-bottom: 12px;">🥗</div>
          <h3 style="color: #FFFFFF; font-size: 1.15rem; font-weight: 800; margin: 0 0 6px;">لا توجد وصفات مطابقة لبحثك</h3>
          <p style="color: #8C9992; font-size: 0.85rem; margin: 0 0 16px;">جرّب كتابة كلمة أخرى أو قم باختيار تصنيف مختلف</p>
          <button id="recipes-reset-filter-btn" class="btn btn-secondary" style="border-radius: 12px; padding: 8px 18px; font-size: 0.85rem;">
            عرض كافة الوصفات
          </button>
        </div>
      ` : `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
          ${filteredRecipes.map(recipe => renderRecipeCard(recipe)).join('')}
        </div>
      `}

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

  return `
    <div class="neon-card recipe-card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-radius: 18px; position: relative; overflow: hidden; transition: transform 0.2s ease, border-color 0.2s ease;">
      
      <!-- الجزء العلوي: الأيقونة والعناوين -->
      <div>
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
          <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.22); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0;">
            ${recipe.image || '🥗'}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #B8C0BC; border: 1px solid rgba(255,255,255,0.08);">
              ⏱️ ${escapeHtml(recipe.prepTime)}
            </span>
            ${isHighProt ? `
              <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; background: rgba(85,247,165,0.15); color: #55F7A5; border: 1px solid rgba(85,247,165,0.3);">
                💪 بروتين
              </span>
            ` : ''}
          </div>
        </div>

        <h3 style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; margin: 0 0 10px; line-height: 1.35;">
          ${escapeHtml(recipe.titleAr)}
        </h3>

        <!-- صورة عرض الطبق النهائي مقتصة ومظبوطة النسبة من بوستر الوصفة -->
        ${recipe.imageUrl ? `
          <div class="recipe-dish-preview btn-open-recipe" data-recipe-id="${recipe.id}" style="width: 100%; aspect-ratio: 16 / 9.2; border-radius: 14px; overflow: hidden; position: relative; background: #020704; border: 1px solid rgba(85,247,165,0.22); margin-bottom: 6px; cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;" title="انقر لعرض المقادير وطريقة التحضير بالكامل">
            <img
              src="${escapeHtml(recipe.imageUrl)}"
              alt="${escapeHtml(recipe.titleAr)}"
              loading="lazy"
              style="position: absolute; width: 200%; left: -3%; right: auto; top: 0; transform: translateY(-69.5%); display: block; pointer-events: none; max-width: none; border-radius: 0;"
            />
          </div>
        ` : `
          <p style="font-size: 0.78rem; color: #8C9992; margin: 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${escapeHtml(recipe.description || recipe.categoryRaw || 'وجبة رياضية متوازنة محسوبة السعرات')}
          </p>
        `}
      </div>

      <!-- الماكروز والسعرات -->
      <div style="background: rgba(3, 10, 7, 0.6); padding: 10px; border-radius: 12px; border: 1px solid rgba(85,247,165,0.12);">
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
      </div>

      <!-- أزرار الإجراءات -->
      <div style="display: flex; align-items: center; gap: 10px; margin-top: 4px;">
        <button
          type="button"
          class="btn btn-secondary btn-open-recipe"
          data-recipe-id="${recipe.id}"
          style="flex: 1; min-height: 44px; border-radius: 12px; padding: 10px 14px; font-size: 0.88rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 6px; border: 1px solid rgba(85,247,165,0.25); background: rgba(85,247,165,0.06); color: #FFFFFF; cursor: pointer;"
        >
          <span>المقادير والتحضير</span>
          <span style="color: #55F7A5; font-size: 1.05rem;">←</span>
        </button>

        <button
          type="button"
          class="btn-icon btn-log-recipe-meal"
          data-recipe-id="${recipe.id}"
          title="إضافة هذه الوجبة إلى سجل اليوم"
          aria-label="إضافة هذه الوجبة إلى سجل اليوم"
          style="width: 44px; height: 44px; min-width: 44px; min-height: 44px; border-radius: 12px; background: rgba(85,247,165,0.12); border: 1px solid rgba(85,247,165,0.35); color: #55F7A5; flex-shrink: 0; font-size: 1.35rem; font-weight: 900; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;"
        >
          +
        </button>
      </div>

    </div>
  `;
}

function renderRecipeModalDetail(recipe) {
  const calBadge = recipe.calories && recipe.calories !== '—' ? `(${recipe.calories} سعرة)` : '';
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
      <div style="position: relative; width: 100%; border-radius: 16px; overflow: hidden; background: #030806; border: 1px solid rgba(85,247,165,0.22); box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <img
          src="${escapeHtml(recipe.imageUrl)}"
          alt="${escapeHtml(recipe.titleAr)}"
          loading="eager"
          style="width: 100%; height: auto; display: block; border-radius: 15px;"
        />
      </div>

      <!-- أزرار الإجراء السريع: زر الإضافة وزر الحفظ -->
      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 4px;">
        <button
          type="button"
          id="btn-modal-add-to-today"
          data-recipe-id="${recipe.id}"
          class="btn btn-primary btn-block"
          style="border-radius: 14px; padding: 13px; font-size: 0.96rem; font-weight: 900; display: flex; align-items: center; justify-content: center; gap: 8px; cursor: pointer;"
        >
          <span>➕</span>
          <span>إضافة هذه الوجبة إلى سجل اليوم ${calBadge}</span>
        </button>

        <button
          type="button"
          id="btn-modal-save-fav"
          data-recipe-id="${recipe.id}"
          class="btn btn-secondary btn-block"
          style="border-radius: 14px; padding: 11px; font-size: 0.9rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 7px; cursor: pointer; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.28); color: #FFFFFF;"
        >
          <span>⭐</span>
          <span>حفظ في وجباتي المفضلة</span>
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

function saveRecipeToFavorites(recipe) {
  if (!recipe) return;
  const numCal = typeof recipe.calories === 'number' ? recipe.calories : (parseFloat(recipe.calories) || 0);
  const numProt = typeof recipe.protein === 'number' ? recipe.protein : (parseFloat(recipe.protein) || 0);
  const numCarb = typeof recipe.carbs === 'number' ? recipe.carbs : (parseFloat(recipe.carbs) || 0);
  const numFat = typeof recipe.fats === 'number' ? recipe.fats : (parseFloat(recipe.fats) || 0);

  const favDraft = {
    titleAr: recipe.titleAr,
    calories: numCal,
    protein: numProt,
    carbs: numCarb,
    fats: numFat,
    items: [{ name: recipe.titleAr, weight: 1 }]
  };
  const res = store.saveToFavorites(favDraft);
  if (res.success) {
    notificationService.showToast(`تم حفظ «${recipe.titleAr}» في الوجبات المفضلة ✓`, 'success');
  } else if (res.reason === 'duplicate') {
    notificationService.showToast('هذه الوجبة موجودة بالفعل في المفضلة', 'info');
  }
}

export function bindRecipesEvents() {
  const container = document.querySelector('.recipes-view-container');
  if (!container) return;

  const refreshView = () => {
    const parent = container.parentElement || document.getElementById('view-container');
    if (parent) {
      parent.innerHTML = renderRecipesView();
      bindRecipesEvents();
    }
  };

  // 1. فلتر التصنيفات
  container.querySelectorAll('.recipe-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      activeCategory = chip.dataset.cat;
      refreshView();
    });
  });

  // 2. البحث
  const searchInput = document.getElementById('recipes-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      // تحديث فوري عند التوقف عن الكتابة
      clearTimeout(window._recipeSearchDebounce);
      window._recipeSearchDebounce = setTimeout(() => {
        refreshView();
        const updatedInput = document.getElementById('recipes-search-input');
        if (updatedInput) {
          updatedInput.focus();
          updatedInput.setSelectionRange(searchQuery.length, searchQuery.length);
        }
      }, 150);
    });
  }

  document.getElementById('recipes-clear-search')?.addEventListener('click', () => {
    searchQuery = '';
    refreshView();
  });

  document.getElementById('recipes-reset-filter-btn')?.addEventListener('click', () => {
    activeCategory = 'all';
    searchQuery = '';
    refreshView();
  });

  // 3. فتح تفاصيل الوصفة في المودال
  const modal = document.getElementById('recipe-detail-modal');
  const modalContent = document.getElementById('recipe-modal-content');

  const openRecipeModal = (recipeId) => {
    const recipe = RECIPES_DATA.find(r => r.id === recipeId);
    if (!recipe || !modal || !modalContent) return;
    activeModalRecipeId = recipeId;
    modalContent.innerHTML = renderRecipeModalDetail(recipe);
    modal.style.display = 'flex';
    modal.classList.add('open');

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

    document.getElementById('btn-modal-save-fav')?.addEventListener('click', () => {
      saveRecipeToFavorites(recipe);
    });
  };

  container.querySelectorAll('.btn-open-recipe').forEach(btn => {
    btn.addEventListener('click', () => {
      openRecipeModal(btn.dataset.recipeId);
    });
  });

  // 4. زر الإضافة السريعة من البطاقة مباشرة (+)
  container.querySelectorAll('.btn-log-recipe-meal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const recipe = RECIPES_DATA.find(r => r.id === btn.dataset.recipeId);
      if (recipe) {
        logRecipeToStore(recipe);
        // تأثير حركي خفيف على الزر
        btn.style.transform = 'scale(1.25)';
        btn.textContent = '✓';
        btn.style.background = '#55F7A5';
        btn.style.color = '#020704';
        setTimeout(() => {
          btn.style.transform = 'scale(1)';
          btn.textContent = '+';
          btn.style.background = 'rgba(85,247,165,0.12)';
          btn.style.color = '#55F7A5';
        }, 800);
      }
    });
  });

  // إغلاق المودال عند النقر على الخلفية
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('open');
      modal.style.display = 'none';
    }
  });
}
