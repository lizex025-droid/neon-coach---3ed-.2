/**
 * NEON COACH - نافذة إضافة أكلة جديدة يدوياً لقاعدة البيانات (Custom Food Modal)
 * تتيح للمستخدم إدخال اسم الأكلة وسعراتها والبروتين والكارب والدهون وحفظها فوراً في قاعدة البيانات
 */

import { addCustomFood } from '../data/foods.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';

export function renderCustomFoodModal(modalId = 'custom-food-modal') {
  return `
    <div id="${modalId}" class="ai-modal-overlay">
      <div class="ai-modal-panel" style="height: auto; max-height: 90vh; padding: 22px; border-radius: 24px; max-width: 440px; margin: auto; background: #08140D; border: 1px solid rgba(85,247,165,0.3); box-shadow: 0 0 35px rgba(0,0,0,0.85);">
        
        <!-- ترويسة النافذة -->
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 10px;">
          <h3 style="color: #55F7A5; font-size: 1.2rem; font-weight: 800; margin: 0; display: flex; align-items: center; gap: 8px;">
            <span>🥗</span>
            <span>إضافة أكلة لقاعدة البيانات</span>
          </h3>
          <button type="button" class="btn-icon close-custom-food-modal-btn" data-action="close" aria-label="إغلاق">✕</button>
        </div>

        <p style="font-size: 0.82rem; color: #8C9992; margin: 0 0 16px; line-height: 1.5;">
          إذا كانت الأكلة غير متوفرة في البحث، أدخل قيمها الغذائية لكل 100غ وستُحفظ مباشرة في قاعدة بياناتك لتتمكن من استخدامها دائماً.
        </p>

        <!-- استمارة إدخال الأكلة والماكروز -->
        <form class="custom-food-form" onsubmit="return false;" style="display: flex; flex-direction: column; gap: 12px;">
          
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

          <!-- أزرار الحفظ والإلغاء -->
          <div style="display: flex; gap: 10px; margin-top: 10px;">
            <button type="button" class="btn btn-primary submit-custom-food-btn" style="flex: 1; border-radius: 14px; font-weight: 800; padding: 12px; display: inline-flex; align-items: center; justify-content: center; gap: 8px;">
              <span>حفظ في قاعدة البيانات</span>
              ${neonIcon('check', 16)}
            </button>
            <button type="button" class="btn btn-secondary cancel-custom-food-btn" data-action="close" style="border-radius: 14px; padding: 12px 18px;">
              إلغاء
            </button>
          </div>

        </form>

      </div>
    </div>
  `;
}

export function bindCustomFoodModal({ modalId = 'custom-food-modal', onSaved = null, triggerBtn = null } = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) return null;

  const nameInput = modal.querySelector('.custom-food-name-input');
  const calInput = modal.querySelector('.custom-food-calories-input');
  const pInput = modal.querySelector('.custom-food-protein-input');
  const cInput = modal.querySelector('.custom-food-carbs-input');
  const fInput = modal.querySelector('.custom-food-fats-input');
  const calcPreview = modal.querySelector('.custom-food-macro-cals-preview');
  const calcBtn = modal.querySelector('.calc-calories-from-macros-btn');
  const submitBtn = modal.querySelector('.submit-custom-food-btn');
  const cancelBtn = modal.querySelector('.cancel-custom-food-btn');
  const closeBtn = modal.querySelector('.close-custom-food-modal-btn');

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

  const closeModal = () => {
    modal.classList.remove('open');
  };

  const openModal = (initialData = '') => {
    const prefillName = typeof initialData === 'string' ? initialData : (initialData?.name || '');
    if (nameInput) nameInput.value = prefillName || '';
    if (calInput) calInput.value = '';
    if (pInput) pInput.value = '';
    if (cInput) cInput.value = '';
    if (fInput) fInput.value = '';
    updateCalculatedCalories();

    modal.classList.add('open');
    setTimeout(() => {
      if (prefillName && calInput) {
        calInput.focus();
      } else if (nameInput) {
        nameInput.focus();
      }
    }, 60);
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

  // حفظ وإضافة الأكلة لقاعدة البيانات
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

    try {
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
        onSaved(newFood);
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
