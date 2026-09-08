/**
 * NEON COACH - قائمة المشتريات الأسبوعية المجمعة (Grocery Shopping List)
 */

import { generateWeeklyShoppingList } from '../domain/nutritionEngine.js';
import { store } from '../state/store.js';

let shoppingItems = null;

export function renderShoppingListView() {
  const meals = store.getState().mealPlan?.meals || [];
  const freshItems = generateWeeklyShoppingList(meals);
  if (shoppingItems && shoppingItems.length) {
    const checkedMap = new Map(shoppingItems.map(i => [i.name, i.checked]));
    freshItems.forEach(item => {
      if (checkedMap.has(item.name)) item.checked = checkedMap.get(item.name);
    });
  }
  shoppingItems = freshItems;

  // تصنيف العناصر حسب الفئة
  const categories = {};
  shoppingItems.forEach((item, index) => {
    if (!categories[item.category]) categories[item.category] = [];
    categories[item.category].push({ ...item, index });
  });

  return `
    <div class="shopping-list-container" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط العنوان -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="shop-back-btn" class="btn-icon" aria-label="رجوع">
          ❯
        </button>
        <div style="text-align: center;">
          <h1 style="font-size: 1.4rem; font-weight: 900; color: #FFFFFF; margin-bottom: 2px;">
            قائمة المشتريات الأسبوعية
          </h1>
          <div style="font-size: 0.78rem; color: #55F7A5;">مجمعة تلقائياً من خطتك الغذائية</div>
        </div>
        <button id="clear-checked-shop-btn" class="btn-icon" title="حذف المكتمل">
          🗑️
        </button>
      </div>

      <!-- تصنيفات المشتريات -->
      <div style="display: flex; flex-direction: column; gap: 14px;">
        ${Object.keys(categories).map(catName => `
          <div class="neon-card" style="padding: 16px;">
            <div style="font-weight: 800; color: #55F7A5; font-size: 1rem; margin-bottom: 12px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 6px;">
              ${catName}
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${categories[catName].map(item => `
                <label style="display: flex; align-items: center; justify-content: space-between; cursor: pointer; text-decoration: ${item.checked ? 'line-through' : 'none'}; opacity: ${item.checked ? '0.5' : '1'};">
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" class="shop-check-item" data-idx="${item.index}" ${item.checked ? 'checked' : ''} style="width: 18px; height: 18px; accent-color: #55F7A5;">
                    <span style="font-weight: 600; color: #FFFFFF; font-size: 0.95rem;">${item.name}</span>
                  </div>
                  <span style="color: #B8C0BC; font-size: 0.85rem; font-family: monospace;">${item.unit}</span>
                </label>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- حقل إضافة صنف مخصص -->
      <div class="neon-card" style="padding: 14px; display: flex; gap: 10px;">
        <input type="text" id="add-custom-shop-input" placeholder="أضف صنفاً آخر إلى القائمة..." style="border-radius: 12px;">
        <button id="add-custom-shop-btn" class="btn btn-primary" style="padding: 10px 18px; border-radius: 12px; font-weight: 700;">
          إضافة
        </button>
      </div>

    </div>
  `;
}

function refreshShoppingListView() {
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderShoppingListView();
    bindShoppingListEvents();
  }
}

export function bindShoppingListEvents() {
  document.getElementById('shop-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#nutrition';
  });

  // تحديد صنف كمشترى
  document.querySelectorAll('.shop-check-item').forEach(chk => {
    chk.addEventListener('change', () => {
      const idx = Number(chk.getAttribute('data-idx'));
      if (shoppingItems[idx]) {
        shoppingItems[idx].checked = chk.checked;
        refreshShoppingListView();
      }
    });
  });

  // حذف العناصر المحددة
  document.getElementById('clear-checked-shop-btn')?.addEventListener('click', () => {
    shoppingItems = shoppingItems.filter(i => !i.checked);
    refreshShoppingListView();
  });

  // إضافة صنف مخصص
  const addBtn = document.getElementById('add-custom-shop-btn');
  const addInput = document.getElementById('add-custom-shop-input');
  addBtn?.addEventListener('click', () => {
    const val = addInput?.value?.trim();
    if (val) {
      shoppingItems.push({
        name: val,
        category: 'أصناف مخصصة',
        unit: 'حسب الحاجة',
        checked: false
      });
      addInput.value = '';
      refreshShoppingListView();
    }
  });
}
