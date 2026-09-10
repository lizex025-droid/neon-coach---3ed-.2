/**
 * NEON COACH - نافذة إضافة وتعديل وحذف الأكلات في قاعدة البيانات (Custom Food Modal & Manager)
 * تتيح للمستخدم إدخال وتعديل وحذف الأكلات الخاصة به وسعراتها والماكروز بكل سهولة
 */

import { addCustomFood, updateCustomFood, deleteCustomFood, getCustomFoods, foodById } from '../data/foods.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function renderCustomFoodModal(modalId = 'custom-food-modal') {
  return `
    <div id="${modalId}" class="ai-modal-overlay">
      <div class="ai-modal-panel" style="height: auto; max-height: 90vh; padding: 22px; border-radius: 24px; max-width: 460px; margin: auto; background: #08140D; border: 1px solid rgba(85,247,165,0.3); box-shadow: 0 0 35px rgba(0,0,0,0.85); display: flex; flex-direction: column;">
        
        <!-- ترويسة النافذة -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 10px;">
          <h3 class="modal-header-title" style="color: #55F7A5; font-size: 1.2rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🥗</span>
            <span class="header-title-text">إضافة وتعديل الأكلات بقاعدة البيانات</span>
          </h3>
          <button type="button" class="btn-icon close-custom-food-modal-btn" data-action="close" aria-label="إغلاق">✕</button>
        </div>

        <!-- أزرار التبديل: إضافة / تعديل | أكلاتي المحفوظة -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; background: rgba(5,13,9,0.8); border: 1px solid rgba(85,247,165,0.2); border-radius: 12px; padding: 4px; margin-bottom: 14px;">
          <button type="button" class="tab-btn custom-tab-form-btn" style="padding: 8px 10px; border-radius: 8px; border: none; background: #55F7A5; color: #020704; font-weight: 800; font-size: 0.82rem; cursor: pointer; transition: all 0.2s;">
            ➕ إضافة / تعديل
          </button>
          <button type="button" class="tab-btn custom-tab-list-btn" style="padding: 8px 10px; border-radius: 8px; border: none; background: transparent; color: #B8C0BC; font-weight: 700; font-size: 0.82rem; cursor: pointer; transition: all 0.2s;">
            📋 أكلاتي المحفوظة (<span class="custom-foods-count-badge">0</span>)
          </button>
        </div>

        <!-- التبويب الأول: استمارة الإضافة والتعديل -->
        <div class="custom-form-container" style="display: flex; flex-direction: column; gap: 12px;">
          
          <!-- شريط تنبيه وضع التعديل -->
          <div class="edit-mode-banner" style="display: none; background: rgba(85,247,165,0.12); border: 1px solid #55F7A5; border-radius: 12px; padding: 8px 12px; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span>✏️</span>
              <span style="color: #55F7A5; font-size: 0.8rem; font-weight: 700;">جاري تعديل: <b class="editing-food-name-label" style="color: #FFFFFF;"></b></span>
            </div>
            <button type="button" class="cancel-edit-mode-btn" style="background: none; border: none; color: #8C9992; font-size: 0.76rem; cursor: pointer; text-decoration: underline;">
              الرجوع للإضافة ↩️
            </button>
          </div>

          <p class="custom-form-description" style="font-size: 0.82rem; color: #8C9992; margin: 0; line-height: 1.5;">
            إذا كانت الأكلة غير متوفرة في البحث، أدخل قيمها الغذائية لكل 100غ وستُحفظ مباشرة في قاعدة بياناتك لتتمكن من استخدامها دائماً.
          </p>

          <!-- استمارة إدخال الأكلة والماكروز -->
          <form class="custom-food-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 12px;">
            <input type="hidden" class="editing-food-id" value="">

            <!-- اسم الأكلة -->
            <div>
              <label style="display: block; font-size: 0.82rem; font-weight: 700; color: #B8C0BC; margin-bottom: 6px;">
                اسم الأكلة <span style="color: #FF5555;">*</span>
              </label>
              <input type="text" class="custom-food-name-input" required placeholder="مثال: شاورما دايت، كبسة لحم بيتية، بروتين شيك..." style="width: 100%; border-radius: 12px; padding: 12px 14px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF; font-size: 0.95rem; font-weight: 700;">
            </div>

            <!-- السعرات الحرارية لكل 100غ -->
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <label style="font-size: 0.82rem; font-weight: 700; color: #B8C0BC;">
                  السعرات الحرارية (لكل 100غ) <span style="color: #FF5555;">*</span>
                </label>
                <button type="button" class="calc-calories-from-macros-btn" style="background: none; border: none; color: #55F7A5; font-size: 0.74rem; cursor: pointer; text-decoration: underline; padding: 0;">
                  احسبها من الماكروز ⚡
                </button>
              </div>
              <input type="number" class="custom-food-calories-input" min="0" step="1" required placeholder="مثال: 165" style="width: 100%; border-radius: 12px; padding: 12px 14px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #55F7A5; font-size: 1.15rem; font-family: monospace; font-weight: 900;">
            </div>

            <!-- شبكة الماكروز الثلاثية: بروتين / كارب / دهون -->
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #B8C0BC; margin-bottom: 6px;">
                  بروتين (غ) <span style="color: #FF5555;">*</span>
                </label>
                <input type="number" class="custom-food-protein-input" min="0" step="0.1" required placeholder="0" style="width: 100%; border-radius: 12px; padding: 10px 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF; font-size: 1rem; font-family: monospace; font-weight: 800; text-align: center;">
              </div>

              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #B8C0BC; margin-bottom: 6px;">
                  كارب (غ) <span style="color: #FF5555;">*</span>
                </label>
                <input type="number" class="custom-food-carbs-input" min="0" step="0.1" required placeholder="0" style="width: 100%; border-radius: 12px; padding: 10px 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF; font-size: 1rem; font-family: monospace; font-weight: 800; text-align: center;">
              </div>

              <div>
                <label style="display: block; font-size: 0.78rem; font-weight: 700; color: #B8C0BC; margin-bottom: 6px;">
                  دهون (غ) <span style="color: #FF5555;">*</span>
                </label>
                <input type="number" class="custom-food-fats-input" min="0" step="0.1" required placeholder="0" style="width: 100%; border-radius: 12px; padding: 10px 10px; background: #030806; border: 1px solid rgba(85,247,165,0.3); color: #FFFFFF; font-size: 1rem; font-family: monospace; font-weight: 800; text-align: center;">
              </div>
            </div>

            <!-- شريط المعاينة اللحظية للماكروز -->
            <div class="custom-food-macro-calc-box" style="background: rgba(85,247,165,0.06); border: 1px dashed rgba(85,247,165,0.25); border-radius: 12px; padding: 8px 12px; font-size: 0.78rem; color: #B8C0BC; display: flex; justify-content: space-between; align-items: center; margin-top: 2px;">
              <span>السعرات المحسوبة من الماكروز:</span>
              <span class="custom-food-macro-cals-preview" style="color: #55F7A5; font-family: monospace; font-weight: 800;">0 سعرة</span>
            </div>

            <!-- أزرار الحفظ والإلغاء والحذف -->
            <div style="display: flex; gap: 8px; margin-top: 8px;">
              <button type="button" class="btn btn-primary submit-custom-food-btn" style="flex: 1; border-radius: 14px; font-weight: 800; padding: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
                <span class="submit-btn-label">حفظ في قاعدة البيانات</span>
                ${neonIcon('check', 16)}
              </button>
              <button type="button" class="btn btn-secondary delete-current-custom-food-btn" style="display: none; border-radius: 14px; padding: 12px 14px; color: #FF6B6B; border-color: rgba(255,107,107,0.35); align-items: center; gap: 4px;" title="حذف هذا الصنف نهائياً من قاعدة البيانات">
                <span>🗑️ حذف</span>
              </button>
              <button type="button" class="btn btn-secondary cancel-custom-food-btn" data-action="close" style="border-radius: 14px; padding: 12px 16px;">
                إلغاء
              </button>
            </div>

          </form>
        </div>

        <!-- التبويب الثاني: قائمة الأكلات المحفوظة للتعديل والحذف السريع -->
        <div class="custom-list-container" style="display: none; flex-direction: column; gap: 10px; overflow-y: auto; max-height: 56vh; padding-inline-end: 2px;">
          <div class="custom-foods-list-items" style="display: flex; flex-direction: column; gap: 8px;">
            <!-- سيتم توليدها ديناميكياً -->
          </div>
        </div>

      </div>
    </div>
  `;
}

export function bindCustomFoodModal({ modalId = 'custom-food-modal', onSaved = null, triggerBtn = null } = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const titleText = modal.querySelector('.header-title-text');
  const tabFormBtn = modal.querySelector('.custom-tab-form-btn');
  const tabListBtn = modal.querySelector('.custom-tab-list-btn');
  const formContainer = modal.querySelector('.custom-form-container');
  const listContainer = modal.querySelector('.custom-list-container');
  const listItemsDiv = modal.querySelector('.custom-foods-list-items');
  const countBadge = modal.querySelector('.custom-foods-count-badge');
  const editModeBanner = modal.querySelector('.edit-mode-banner');
  const editingFoodNameLabel = modal.querySelector('.editing-food-name-label');
  const cancelEditModeBtn = modal.querySelector('.cancel-edit-mode-btn');

  const editingIdInput = modal.querySelector('.editing-food-id');
  const nameInput = modal.querySelector('.custom-food-name-input');
  const calInput = modal.querySelector('.custom-food-calories-input');
  const pInput = modal.querySelector('.custom-food-protein-input');
  const cInput = modal.querySelector('.custom-food-carbs-input');
  const fInput = modal.querySelector('.custom-food-fats-input');
  const calcPreview = modal.querySelector('.custom-food-macro-cals-preview');
  const calcBtn = modal.querySelector('.calc-calories-from-macros-btn');
  const submitBtn = modal.querySelector('.submit-custom-food-btn');
  const submitBtnLabel = modal.querySelector('.submit-btn-label');
  const deleteCurrentBtn = modal.querySelector('.delete-current-custom-food-btn');
  const cancelBtn = modal.querySelector('.cancel-custom-food-btn');
  const closeBtn = modal.querySelector('.close-custom-food-modal-btn');

  let currentTab = 'form'; // 'form' or 'list'

  const updateCalculatedCalories = () => {
    const p = Math.max(0, parseFloat(pInput?.value) || 0);
    const c = Math.max(0, parseFloat(cInput?.value) || 0);
    const f = Math.max(0, parseFloat(fInput?.value) || 0);
    const sum = Math.round((p * 4) + (c * 4) + (f * 9));
    if (calcPreview) calcPreview.textContent = `${sum.toLocaleString('en-US')} سعرة`;
    return sum;
  };

  pInput?.addEventListener('input', updateCalculatedCalories);
  cInput?.addEventListener('input', updateCalculatedCalories);
  fInput?.addEventListener('input', updateCalculatedCalories);

  // زر الحساب التلقائي للسعرات من الماكروز
  calcBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    const sum = updateCalculatedCalories();
    if (calInput) {
      calInput.value = sum;
      notificationService.showToast(`تم ضبط السعرات على ${sum} سعرة بناءً على الماكروز ⚖️`, 'info');
    }
  });

  const updateCountBadge = () => {
    const foods = getCustomFoods();
    if (countBadge) countBadge.textContent = foods.length;
  };

  const renderList = () => {
    updateCountBadge();
    const foods = getCustomFoods();

    if (!foods.length) {
      listItemsDiv.innerHTML = `
        <div style="padding: 28px 16px; text-align: center; color: #8C9992; font-size: 0.88rem; border: 1px dashed rgba(85,247,165,0.2); border-radius: 14px; background: rgba(5,13,9,0.4);">
          <div style="font-size: 2.2rem; margin-bottom: 8px;">🍽️</div>
          <div style="color: #FFFFFF; font-weight: 700; margin-bottom: 4px;">لم تقم بإضافة أكلات خاصة بعد</div>
          <p style="font-size: 0.8rem; color: #8C9992; margin: 0 0 12px;">أي أكلة تضيفها ستظهر هنا لتتمكن من تعديل أرقامها أو حذفها متى أردت.</p>
          <button type="button" class="btn btn-outline-neon btn-sm switch-to-create-sub-btn" style="border-radius: 10px; font-size: 0.78rem;">
            ➕ أضف صنفك الأول
          </button>
        </div>
      `;
      listItemsDiv.querySelector('.switch-to-create-sub-btn')?.addEventListener('click', () => {
        clearEditMode();
        switchTab('form');
      });
      return;
    }

    listItemsDiv.innerHTML = foods.map(f => `
      <div class="custom-food-card" data-food-id="${f.id}" style="background: rgba(5,13,9,0.7); border: 1px solid rgba(85,247,165,0.2); border-radius: 14px; padding: 12px 14px; display: flex; justify-content: space-between; align-items: center; gap: 10px;">
        <div style="min-width: 0; flex: 1;">
          <div style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem; margin-bottom: 3px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(f.name || f.nameAr)}
          </div>
          <div style="font-size: 0.76rem; color: #55F7A5; font-family: monospace; display: flex; gap: 8px; flex-wrap: wrap;">
            <span><b>${f.per100?.kcal || f.caloriesPer100g || 0}</b> kcal</span>
            <span style="color: #B8C0BC;">ب: <b>${f.per100?.p || f.proteinPer100g || 0}g</b></span>
            <span style="color: #B8C0BC;">ك: <b>${f.per100?.c || f.carbsPer100g || 0}g</b></span>
            <span style="color: #B8C0BC;">د: <b>${f.per100?.f || f.fatsPer100g || 0}g</b></span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <button type="button" class="btn btn-secondary edit-saved-food-btn" data-food-id="${f.id}" style="padding: 5px 10px; font-size: 0.78rem; border-radius: 10px; display: inline-flex; align-items: center; gap: 4px;" title="تعديل">
            <span>✏️</span> <span>تعديل</span>
          </button>
          <button type="button" class="btn btn-secondary delete-saved-food-btn" data-food-id="${f.id}" style="padding: 5px 10px; font-size: 0.78rem; border-radius: 10px; color: #FF6B6B; border-color: rgba(255,107,107,0.3);" title="حذف">
            <span>🗑️</span>
          </button>
        </div>
      </div>
    `).join('');

    listItemsDiv.querySelectorAll('.edit-saved-food-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = btn.getAttribute('data-food-id');
        const food = foodById(foodId) || foods.find(f => f.id === foodId);
        if (food) {
          setEditMode(food);
          switchTab('form');
        }
      });
    });

    listItemsDiv.querySelectorAll('.delete-saved-food-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = btn.getAttribute('data-food-id');
        const food = foodById(foodId) || foods.find(f => f.id === foodId);
        const foodName = food?.name || food?.nameAr || 'هذا الصنف';
        if (confirm(`هل أنت متأكد من حذف "${foodName}" نهائياً من قاعدة البيانات؟`)) {
          deleteCustomFood(foodId);
          notificationService.showToast(`تم حذف "${foodName}" من قاعدة البيانات بنجاح 🗑️`, 'info');
          renderList();
          if (editingIdInput && editingIdInput.value === foodId) {
            clearEditMode();
          }
        }
      });
    });
  };

  const switchTab = (tab) => {
    currentTab = tab;
    if (tab === 'form') {
      formContainer.style.display = 'flex';
      listContainer.style.display = 'none';
      tabFormBtn.style.background = '#55F7A5';
      tabFormBtn.style.color = '#020704';
      tabListBtn.style.background = 'transparent';
      tabListBtn.style.color = '#B8C0BC';
    } else {
      formContainer.style.display = 'none';
      listContainer.style.display = 'flex';
      tabListBtn.style.background = '#55F7A5';
      tabListBtn.style.color = '#020704';
      tabFormBtn.style.background = 'transparent';
      tabFormBtn.style.color = '#B8C0BC';
      renderList();
    }
  };

  tabFormBtn?.addEventListener('click', () => switchTab('form'));
  tabListBtn?.addEventListener('click', () => switchTab('list'));

  const setEditMode = (food) => {
    if (!food) return;
    if (editingIdInput) editingIdInput.value = food.id;
    if (nameInput) nameInput.value = food.name || food.nameAr || '';
    if (calInput) calInput.value = food.per100?.kcal || food.caloriesPer100g || 0;
    if (pInput) pInput.value = food.per100?.p || food.proteinPer100g || 0;
    if (cInput) cInput.value = food.per100?.c || food.carbsPer100g || 0;
    if (fInput) fInput.value = food.per100?.f || food.fatsPer100g || 0;
    updateCalculatedCalories();

    if (editModeBanner) editModeBanner.style.display = 'flex';
    if (editingFoodNameLabel) editingFoodNameLabel.textContent = food.name || food.nameAr || '';
    if (submitBtnLabel) submitBtnLabel.textContent = 'حفظ التعديلات في قاعدة البيانات';
    if (deleteCurrentBtn) deleteCurrentBtn.style.display = 'inline-flex';
    if (titleText) titleText.textContent = 'تعديل الأكلة في قاعدة البيانات';
  };

  const clearEditMode = () => {
    if (editingIdInput) editingIdInput.value = '';
    if (nameInput) nameInput.value = '';
    if (calInput) calInput.value = '';
    if (pInput) pInput.value = '';
    if (cInput) cInput.value = '';
    if (fInput) fInput.value = '';
    updateCalculatedCalories();

    if (editModeBanner) editModeBanner.style.display = 'none';
    if (submitBtnLabel) submitBtnLabel.textContent = 'حفظ في قاعدة البيانات';
    if (deleteCurrentBtn) deleteCurrentBtn.style.display = 'none';
    if (titleText) titleText.textContent = 'إضافة أكلة لقاعدة البيانات';
  };

  cancelEditModeBtn?.addEventListener('click', () => {
    clearEditMode();
  });

  deleteCurrentBtn?.addEventListener('click', () => {
    const foodId = editingIdInput?.value;
    if (!foodId) return;
    const food = foodById(foodId);
    const foodName = food?.name || food?.nameAr || 'هذا الصنف';
    if (confirm(`هل أنت متأكد من حذف "${foodName}" نهائياً من قاعدة البيانات؟`)) {
      deleteCustomFood(foodId);
      notificationService.showToast(`تم حذف "${foodName}" من قاعدة البيانات بنجاح 🗑️`, 'info');
      clearEditMode();
      updateCountBadge();
      closeModal();
    }
  });

  const closeModal = () => {
    modal.classList.remove('open');
  };

  const openModal = (initialData = '') => {
    clearEditMode();
    updateCountBadge();

    if (initialData && typeof initialData === 'object' && initialData.tab === 'list') {
      switchTab('list');
    } else if (initialData && typeof initialData === 'object' && initialData.editFood) {
      setEditMode(initialData.editFood);
      switchTab('form');
    } else if (initialData && typeof initialData === 'object' && initialData.editId) {
      const food = foodById(initialData.editId);
      if (food) setEditMode(food);
      switchTab('form');
    } else {
      const prefillName = typeof initialData === 'string' ? initialData : (initialData?.name || '');
      if (nameInput) nameInput.value = prefillName || '';
      switchTab('form');
      setTimeout(() => {
        if (prefillName && calInput) {
          calInput.focus();
        } else if (nameInput) {
          nameInput.focus();
        }
      }, 60);
    }

    modal.classList.add('open');
  };

  if (triggerBtn) {
    triggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  }

  closeBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.closest('[data-action="close"]')) {
      closeModal();
    }
  });

  // حفظ أو تعديل الأكلة في قاعدة البيانات
  submitBtn?.addEventListener('click', () => {
    const name = nameInput?.value.trim();
    if (!name) {
      notificationService.showToast('يرجى كتابة اسم الأكلة أولاً', 'error');
      nameInput?.focus();
      return;
    }

    let calories = parseFloat(calInput?.value);
    const p = parseFloat(pInput?.value);
    const c = parseFloat(cInput?.value);
    const f = parseFloat(fInput?.value);

    // إذا ترك السعرات فارغة، نحسبها تلقائياً من الماكروز إن وجدت
    if (isNaN(calories) || calories < 0) {
      const calculated = updateCalculatedCalories();
      if (calculated > 0) {
        calories = calculated;
        if (calInput) calInput.value = calculated;
      } else {
        notificationService.showToast('يرجى تحديد السعرات الحرارية لكل 100غ', 'error');
        calInput?.focus();
        return;
      }
    }

    if (isNaN(p) || p < 0) {
      notificationService.showToast('يرجى إدخال كمية البروتين (أدخل 0 إن لم يوجد)', 'error');
      pInput?.focus();
      return;
    }

    if (isNaN(c) || c < 0) {
      notificationService.showToast('يرجى إدخال كمية الكربوهيدرات (أدخل 0 إن لم يوجد)', 'error');
      cInput?.focus();
      return;
    }

    if (isNaN(f) || f < 0) {
      notificationService.showToast('يرجى إدخال كمية الدهون (أدخل 0 إن لم يوجد)', 'error');
      fInput?.focus();
      return;
    }

    const editId = editingIdInput?.value;

    try {
      if (editId) {
        // تحديث صنف موجود
        const updated = updateCustomFood(editId, {
          name,
          calories,
          protein: p,
          carbs: c,
          fats: f,
          servingSize: 100
        });

        notificationService.showToast(`تم تعديل "${name}" في قاعدة البيانات بنجاح! ✅`, 'success');
        clearEditMode();
        closeModal();

        if (typeof onSaved === 'function') {
          onSaved(updated, 'edit');
        }
      } else {
        // إضافة صنف جديد
        const newFood = addCustomFood({
          name,
          calories,
          protein: p,
          carbs: c,
          fats: f,
          servingSize: 100
        });

        notificationService.showToast(`تمت إضافة "${name}" إلى قاعدة الأطعمة بنجاح! 🥗`, 'success');
        closeModal();

        if (typeof onSaved === 'function') {
          onSaved(newFood, 'create');
        }
      }
    } catch (err) {
      notificationService.showToast(err.message || 'فشل حفظ الصنف', 'error');
    }
  });

  return {
    open: openModal,
    close: closeModal
  };
}
