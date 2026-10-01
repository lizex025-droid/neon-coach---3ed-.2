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
        : recipe.category === activeCategory;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q
      ? true
      : (recipe.titleAr.toLowerCase().includes(q) ||
         recipe.titleEn.toLowerCase().includes(q) ||
         recipe.description.toLowerCase().includes(q) ||
         recipe.ingredients.some(ing => ing.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  return `
    <div class="recipes-view-container view-fade-slide" style="max-width: 900px; margin: 0 auto; padding: 16px 14px 100px; display: flex; flex-direction: column; gap: 18px;">
      
      <!-- ترويسة الصفحة -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px; margin-top: 4px;">
        <div>
          <h1 style="font-size: 1.8rem; font-weight: 900; color: #FFFFFF; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 1.9rem;">📖</span>
            <span>وصفات نيون الصحية</span>
          </h1>
          <div style="font-size: 0.84rem; color: #8C9992; margin-top: 3px;">
            وجبات رياضية محسوبة السعرات والماكروز لدعم أهدافك الرياضية وبناء العضلات
          </div>
        </div>

        <div style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.25); border-radius: 20px; font-size: 0.8rem; font-weight: 800; color: #55F7A5;">
          <span>${filteredRecipes.length}</span>
          <span style="color: #B8C0BC;">وصفة متاحة</span>
        </div>
      </div>

      <!-- شريط البحث السريع -->
      <div style="position: relative; width: 100%;">
        <input
          type="text"
          id="recipes-search-input"
          value="${escapeHtml(searchQuery)}"
          placeholder="ابحث عن أكلة، مكون (دجاج، شوفان، تونة...)"
          style="width: 100%; padding: 12px 42px 12px 16px; background: #07100D; border: 1px solid rgba(85,247,165,0.22); border-radius: 14px; color: #FFFFFF; font-size: 0.92rem; outline: none; transition: border-color 0.2s;"
        />
        <span style="position: absolute; right: 14px; top: 50%; transform: translateY(-50%); font-size: 1.1rem; pointer-events: none; opacity: 0.7;">
          🔍
        </span>
        ${searchQuery ? `
          <button id="recipes-clear-search" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; color: #8C9992; font-size: 1.1rem; cursor: pointer; padding: 4px;">
            ✕
          </button>
        ` : ''}
      </div>

      <!-- فلاتر التصنيفات (Category Chips) -->
      <div class="recipes-category-scroll" style="display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; scrollbar-width: none; -webkit-overflow-scrolling: touch;">
        ${RECIPE_CATEGORIES.map(cat => {
          const isSelected = activeCategory === cat.id;
          return `
            <button
              type="button"
              class="recipe-cat-chip ${isSelected ? 'active' : ''}"
              data-cat="${cat.id}"
              style="display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; font-size: 0.84rem; font-weight: 700; white-space: nowrap; cursor: pointer; transition: all 0.2s ease; border: 1px solid ${isSelected ? '#55F7A5' : 'rgba(255,255,255,0.08)'}; background: ${isSelected ? 'rgba(85,247,165,0.18)' : 'rgba(255,255,255,0.03)'}; color: ${isSelected ? '#55F7A5' : '#B8C0BC'}; box-shadow: ${isSelected ? '0 0 12px rgba(85,247,165,0.25)' : 'none'};"
            >
              <span>${cat.icon}</span>
              <span>${cat.label}</span>
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
        <div class="ai-modal-box" id="recipe-modal-content" style="max-width: 560px; max-height: 88vh; overflow-y: auto; text-align: right;">
          <!-- محتوى المودال يتم تحديثه ديناميكياً -->
        </div>
      </div>

    </div>
  `;
}

function renderRecipeCard(recipe) {
  return `
    <div class="neon-card recipe-card" style="padding: 18px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px; border-radius: 18px; position: relative; overflow: hidden; transition: transform 0.2s ease, border-color 0.2s ease;">
      
      <!-- الجزء العلوي: الأيقونة والعناوين -->
      <div>
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px;">
          <div style="width: 44px; height: 44px; border-radius: 14px; background: rgba(85,247,165,0.08); border: 1px solid rgba(85,247,165,0.22); display: flex; align-items: center; justify-content: center; font-size: 1.6rem; flex-shrink: 0;">
            ${recipe.image}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 0.72rem; font-weight: 700; padding: 3px 8px; border-radius: 8px; background: rgba(255,255,255,0.05); color: #B8C0BC; border: 1px solid rgba(255,255,255,0.08);">
              ⏱️ ${recipe.prepTime}
            </span>
            ${recipe.isHighProtein ? `
              <span style="font-size: 0.72rem; font-weight: 800; padding: 3px 8px; border-radius: 8px; background: rgba(85,247,165,0.15); color: #55F7A5; border: 1px solid rgba(85,247,165,0.3);">
                💪 بروتين
              </span>
            ` : ''}
          </div>
        </div>

        <h3 style="font-size: 1.05rem; font-weight: 800; color: #FFFFFF; margin: 0 0 6px; line-height: 1.35;">
          ${escapeHtml(recipe.titleAr)}
        </h3>
        <p style="font-size: 0.78rem; color: #8C9992; margin: 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
          ${escapeHtml(recipe.description)}
        </p>
      </div>

      <!-- الماكروز والسعرات -->
      <div style="background: rgba(3, 10, 7, 0.6); padding: 10px; border-radius: 12px; border: 1px solid rgba(85,247,165,0.12);">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 4px;">
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">سعرات</div>
            <div style="font-size: 1.05rem; font-weight: 900; color: #55F7A5; font-family: monospace;">${recipe.calories}</div>
          </div>
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">بروتين</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">${recipe.protein}غ</div>
          </div>
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">كارب</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #38BDF8; font-family: monospace;">${recipe.carbs}غ</div>
          </div>
          <div>
            <div style="font-size: 0.66rem; color: #8C9992;">دهون</div>
            <div style="font-size: 0.95rem; font-weight: 900; color: #F59E0B; font-family: monospace;">${recipe.fats}غ</div>
          </div>
        </div>
      </div>

      <!-- أزرار الإجراءات -->
      <div style="display: flex; align-items: center; gap: 8px;">
        <button
          type="button"
          class="btn btn-secondary btn-open-recipe"
          data-recipe-id="${recipe.id}"
          style="flex: 1; border-radius: 10px; padding: 8px; font-size: 0.82rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 4px;"
        >
          <span>المقادير والتحضير</span>
          <span>←</span>
        </button>

        <button
          type="button"
          class="btn-icon btn-log-recipe-meal"
          data-recipe-id="${recipe.id}"
          title="إضافة هذه الوجبة إلى سجل اليوم"
          style="width: 38px; height: 38px; border-radius: 10px; background: rgba(85,247,165,0.12); border: 1px solid rgba(85,247,165,0.35); color: #55F7A5; flex-shrink: 0; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s;"
        >
          +
        </button>
      </div>

    </div>
  `;
}

function renderRecipeModalDetail(recipe) {
  return `
    <div style="display: flex; flex-direction: column; gap: 16px;">
      
      <!-- ترويسة المودال -->
      <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 14px; background: rgba(85,247,165,0.1); border: 1px solid rgba(85,247,165,0.3); display: flex; align-items: center; justify-content: center; font-size: 1.8rem;">
            ${recipe.image}
          </div>
          <div>
            <h2 style="font-size: 1.25rem; font-weight: 900; color: #FFFFFF; margin: 0 0 4px;">
              ${escapeHtml(recipe.titleAr)}
            </h2>
            <div style="font-size: 0.78rem; color: #8C9992;">
              ${escapeHtml(recipe.titleEn)} • ${recipe.servings} • صعوبة: ${recipe.difficulty}
            </div>
          </div>
        </div>

        <button type="button" id="btn-close-recipe-modal" class="btn-icon" style="width: 34px; height: 34px; border-radius: 10px; color: #8C9992; font-size: 1rem; cursor: pointer;">
          ✕
        </button>
      </div>

      <!-- بطاقة الماكروز التفصيلية -->
      <div style="background: rgba(85,247,165,0.06); padding: 12px 14px; border-radius: 14px; border: 1px solid rgba(85,247,165,0.2);">
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); text-align: center; gap: 6px;">
          <div>
            <div style="font-size: 0.72rem; color: #8C9992; margin-bottom: 2px;">السعرات</div>
            <div style="font-size: 1.25rem; font-weight: 900; color: #55F7A5; font-family: monospace;">${recipe.calories}</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: #8C9992; margin-bottom: 2px;">البروتين</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #FFFFFF; font-family: monospace;">${recipe.protein}غ</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: #8C9992; margin-bottom: 2px;">الكارب</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #38BDF8; font-family: monospace;">${recipe.carbs}غ</div>
          </div>
          <div>
            <div style="font-size: 0.72rem; color: #8C9992; margin-bottom: 2px;">الدهون</div>
            <div style="font-size: 1.15rem; font-weight: 900; color: #F59E0B; font-family: monospace;">${recipe.fats}غ</div>
          </div>
        </div>
      </div>

      <!-- قائمة المكونات والمقادير -->
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 800; color: #55F7A5; margin: 0 0 8px; display: flex; align-items: center; gap: 6px;">
          <span>🛒</span>
          <span>المكونات والمقادير (${recipe.ingredients.length})</span>
        </h4>
        <div style="display: flex; flex-direction: column; gap: 6px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
          ${recipe.ingredients.map((ing, idx) => `
            <label style="display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #E0E5E2; cursor: pointer; user-select: none;">
              <input type="checkbox" style="accent-color: #55F7A5; width: 16px; height: 16px; cursor: pointer;" />
              <span>${escapeHtml(ing)}</span>
            </label>
          `).join('')}
        </div>
      </div>

      <!-- خطوات التحضير -->
      <div>
        <h4 style="font-size: 0.95rem; font-weight: 800; color: #55F7A5; margin: 0 0 8px; display: flex; align-items: center; gap: 6px;">
          <span>👨‍🍳</span>
          <span>طريقة التحضير بالخطوات</span>
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${recipe.steps.map((step, idx) => `
            <div style="display: flex; align-items: flex-start; gap: 10px; background: rgba(255,255,255,0.02); padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05);">
              <div style="width: 24px; height: 24px; border-radius: 50%; background: rgba(85,247,165,0.15); color: #55F7A5; font-weight: 900; font-size: 0.78rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px;">
                ${idx + 1}
              </div>
              <div style="font-size: 0.84rem; color: #E0E5E2; line-height: 1.5;">
                ${escapeHtml(step)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- أزرار الإجراء السريع -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
        <button
          type="button"
          id="btn-modal-add-to-today"
          data-recipe-id="${recipe.id}"
          class="btn btn-primary btn-block"
          style="border-radius: 12px; padding: 12px; font-size: 0.95rem; font-weight: 800; display: flex; align-items: center; justify-content: center; gap: 8px;"
        >
          <span>➕</span>
          <span>إضافة هذه الوجبة إلى سجل اليوم (${recipe.calories} سعرة)</span>
        </button>

        <button
          type="button"
          id="btn-modal-save-fav"
          data-recipe-id="${recipe.id}"
          class="btn btn-secondary btn-block"
          style="border-radius: 12px; padding: 10px; font-size: 0.88rem; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 6px;"
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
  const newMeal = {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'rec_' + Date.now(),
    titleAr: recipe.titleAr,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fats: recipe.fats,
    time: new Date().toLocaleTimeString('ar-JO', { hour: '2-digit', minute: '2-digit' }),
    items: recipe.ingredients.map(ing => ({ name: ing, weight: 100, calories: 0 }))
  };

  store.logMeal(newMeal);
  notificationService.showToast(`تمت إضافة «${recipe.titleAr}» إلى وجبات اليوم ✓`, 'success');
}

function saveRecipeToFavorites(recipe) {
  if (!recipe) return;
  const favDraft = {
    titleAr: recipe.titleAr,
    calories: recipe.calories,
    protein: recipe.protein,
    carbs: recipe.carbs,
    fats: recipe.fats,
    items: recipe.ingredients.map(ing => ({ name: ing, weight: 100 }))
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
