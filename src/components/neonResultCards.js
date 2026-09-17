import { neonActionAgent } from '../services/neonActionAgent.js';
import { store } from '../state/store.js';
import { macrosFor, searchFoods } from '../data/foods.js';

const MEAL_TYPES = [['breakfast', 'فطور'], ['lunch', 'غداء'], ['dinner', 'عشاء'], ['snack', 'سناك'], ['other', 'أخرى']];
const rounded = value => Math.round((Number(value) || 0) * 10) / 10;
function cleanDisplayText(value) {
  return String(value)
    .replace(/```[\s\S]*?```/g, '')
    .replace(/[*_`#>]/g, '')
    .replace(/[\u{1F000}-\u{1FAFF}]|\p{Extended_Pictographic}\uFE0F?|\p{Emoji_Presentation}/gu, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
function element(tag, text, className) { const node = document.createElement(tag); if (text != null) node.textContent = cleanDisplayText(text); if (className) node.className = className; return node; }

function normalizeDraftItem(item, index) {
  const grams = Math.max(1, Number(item.grams) || 100);
  const match = searchFoods(item.nameEn || item.nameAr || item.name || '', 1)[0];
  const values = { calories: Number(item.calories ?? item.kcal) || 0, protein: Number(item.protein ?? item.p) || 0, carbs: Number(item.carbs ?? item.c) || 0, fats: Number(item.fats ?? item.f) || 0 };
  return {
    key: `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 7)}`,
    foodId: item.foodId || match?.id || null,
    nameAr: item.nameAr || match?.nameAr || item.name || item.nameEn || 'صنف غذائي',
    nameEn: item.nameEn || match?.nameEn || item.nameAr || item.name || 'Food item',
    grams,
    basis: item.state || item.basis || match?.state || 'cooked',
    perGram: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, value / grams]))
  };
}
function itemMacros(item) { return Object.fromEntries(Object.entries(item.perGram).map(([key, value]) => [key, rounded(value * item.grams)])); }
function draftTotals(items) { return ['calories', 'protein', 'carbs', 'fats'].reduce((totals, key) => { totals[key] = rounded(items.reduce((sum, item) => sum + itemMacros(item)[key], 0)); return totals; }, {}); }

export function renderNeonResult(container, response) {
  container.replaceChildren();
  container.setAttribute('aria-live', 'polite');
  const labels = { success: 'تم تأكيد النتيجة', clarification: 'مطلوب مراجعة أو تأكيد', partial: 'اكتمل جزء من الطلب', error: 'تعذر الحفظ', pending_sync: 'محفوظ محلياً وبانتظار المزامنة' };
  container.append(element('p', labels[response.status] || '', 'neon-ai-action-badge'));
  if (response.reply) container.append(element('p', response.reply, 'neon-result-reply'));
  for (const card of response.cards || []) {
    const panel = element('section', null, 'neon-persisted-card'); container.append(panel);
    if (card.type === 'meal_draft') renderMealDraft(container, panel, card);
    else if (card.type === 'clarification') {
      panel.append(element('p', card.question));
      for (const option of card.options || []) { const btn = element('button', typeof option === 'string' ? option : option.label, 'btn'); btn.type = 'button'; btn.onclick = async () => { const result = await neonActionAgent.handleUserUtterance(btn.textContent, { clarificationId: card.id }); if (result?.status) renderNeonResult(container, result); }; panel.append(btn); }
    } else if (card.type === 'meal' || card.type === 'food_nutrition') renderMeal(panel, card);
    else if (card.type === 'water') panel.append(element('h3', 'الماء'), element('p', `الكمية: ${card.amountMl} مل · الإجمالي: ${card.todayTotalMl} مل`), element('p', `الهدف: ${card.targetWaterMl} مل · المتبقي: ${card.remainingMl} مل`));
    else if (card.type === 'weight') panel.append(element('h3', `${card.weightKg} كغ`), element('p', `${card.date} · ${card.timestamp || ''}`), element('p', card.changeKg == null ? 'لا يوجد قياس سابق للمقارنة' : `التغير: ${card.changeKg} كغ`));
    else if (card.type === 'workout') { panel.append(element('h3', card.title), element('p', card.completed ? 'التمرين مكتمل' : 'التمرين قيد التنفيذ')); for (const exercise of card.exercises || []) panel.append(element('p', `${exercise.name}: ${exercise.sets} × ${exercise.reps} · ${exercise.weightKg} كغ`)); }
    else if (card.type === 'daily_summary') panel.append(element('h3', 'ملخص اليوم'), element('p', `السعرات: ${card.calories} · المتبقي: ${card.remainingCalories}`), element('p', `البروتين: ${card.protein} غ · المتبقي: ${card.remainingProtein} غ`), element('p', `كربوهيدرات: ${card.carbs} غ · دهون: ${card.fats} غ · ماء: ${card.waterMl} مل`), element('p', `التمارين: ${card.workouts?.length || 0}`));
    else panel.append(element('pre', JSON.stringify(card.data, null, 2)));
  }
  if (response.status === 'error') {
    const retry = element('button', 'إعادة محاولة نفس الطلب', 'btn'); retry.type = 'button'; retry.onclick = async () => { retry.disabled = true; const result = await neonActionAgent.retry(); if (result) renderNeonResult(container, result); };
    container.append(retry);
  }
}

function renderMealDraft(container, panel, card) {
  const meal = card.meals?.[0] || {};
  let selectedType = MEAL_TYPES.some(([value]) => value === meal.mealType) ? meal.mealType : 'lunch';
  let items = (meal.items || []).map(normalizeDraftItem);
  panel.classList.add('neon-meal-confirmation');
  panel.append(element('h3', card.question || 'هل تود إضافة الوجبة التي ذكرتها؟', 'meal-confirm-title'), element('p', 'اختر اسم الوجبة وراجع كل كمية قبل الحفظ في التغذية.', 'meal-confirm-help'));

  const categoryWrap = element('div', null, 'meal-type-chips');
  const customName = element('input', null, 'meal-custom-name'); customName.type = 'text'; customName.placeholder = 'اكتب اسم الوجبة'; customName.setAttribute('aria-label', 'اسم الوجبة الأخرى');
  const renderCategories = () => {
    categoryWrap.replaceChildren();
    for (const [value, label] of MEAL_TYPES) { const chip = element('button', label, 'meal-type-chip'); chip.type = 'button'; chip.classList.toggle('selected', value === selectedType); chip.setAttribute('aria-pressed', String(value === selectedType)); chip.onclick = () => { selectedType = value; customName.hidden = value !== 'other'; renderCategories(); }; categoryWrap.append(chip); }
  };
  renderCategories(); customName.hidden = selectedType !== 'other'; panel.append(categoryWrap, customName);

  const macroGrid = element('div', null, 'meal-draft-macros');
  const itemList = element('div', null, 'meal-draft-items'); panel.append(macroGrid, itemList);
  const renderDraft = () => {
    const totals = draftTotals(items); macroGrid.replaceChildren();
    for (const [label, value, unit] of [['السعرات', totals.calories, 'سعرة'], ['البروتين', totals.protein, 'غ'], ['الكارب', totals.carbs, 'غ'], ['الدهون', totals.fats, 'غ']]) { const box = element('div', null, 'meal-macro-box'); box.append(element('span', label), element('strong', `${value} ${unit}`)); macroGrid.append(box); }
    itemList.replaceChildren();
    items.forEach((item, index) => {
      const macros = itemMacros(item); const row = element('article', null, 'meal-draft-item'); const heading = element('div', null, 'meal-item-heading');
      heading.append(element('strong', item.nameAr), element('small', `${macros.calories} سعرة · بروتين ${macros.protein}غ · كارب ${macros.carbs}غ · دهون ${macros.fats}غ`));
      const controls = element('div', null, 'meal-item-controls'); const amount = element('input'); amount.type = 'number'; amount.min = '1'; amount.max = '5000'; amount.value = String(item.grams); amount.setAttribute('aria-label', `كمية ${item.nameAr} بالغرام`);
      const basis = element('select'); basis.setAttribute('aria-label', `حالة ${item.nameAr}`); for (const [value, label] of [['cooked', 'مطبوخ'], ['raw', 'نيء']]) { const option = element('option', label); option.value = value; basis.append(option); } basis.value = item.basis;
      const edit = element('button', 'تعديل', 'btn meal-item-edit'); edit.type = 'button'; edit.onclick = () => { item.grams = Math.min(5000, Math.max(1, Number(amount.value) || item.grams)); item.basis = basis.value; renderDraft(); };
      const remove = element('button', 'حذف', 'btn meal-item-delete'); remove.type = 'button'; remove.onclick = () => { items.splice(index, 1); renderDraft(); };
      controls.append(amount, element('span', 'غ'), basis, edit, remove); row.append(heading, controls); itemList.append(row);
    });
    if (!items.length) itemList.append(element('p', 'أضف صنفاً واحداً على الأقل قبل حفظ الوجبة.', 'meal-empty-message'));
  };
  renderDraft();

  const addArea = element('div', null, 'meal-add-item'); const foodSearch = element('input'); foodSearch.type = 'search'; foodSearch.placeholder = 'ابحث لإضافة صنف غذائي...'; foodSearch.setAttribute('aria-label', 'بحث عن صنف لإضافته'); const suggestions = element('div', null, 'meal-food-suggestions'); addArea.append(foodSearch, suggestions); panel.append(addArea);
  foodSearch.oninput = () => {
    suggestions.replaceChildren();
    for (const food of searchFoods(foodSearch.value.trim(), 8)) { const option = element('div', null, 'meal-food-suggestion'); const info = element('span', `${food.nameAr || food.name} · ${food.caloriesPer100g || food.per100?.kcal || 0} سعرة/100غ`); const add = element('button', 'إضافة', 'btn'); add.type = 'button'; add.onclick = () => { const macros = macrosFor(food, 100); items.push(normalizeDraftItem({ foodId: food.id, nameAr: food.nameAr || food.name, nameEn: food.nameEn || food.name, grams: 100, state: food.state || 'cooked', calories: macros.kcal, protein: macros.p, carbs: macros.c, fats: macros.f }, items.length)); foodSearch.value = ''; suggestions.replaceChildren(); renderDraft(); }; option.append(info, add); suggestions.append(option); }
  };

  const actions = element('div', null, 'meal-confirm-actions'); const save = element('button', 'إضافة إلى التغذية', 'btn btn-primary'); const cancel = element('button', 'إلغاء', 'btn'); save.type = cancel.type = 'button'; actions.append(save, cancel); panel.append(actions);
  const setBusy = busy => { save.disabled = cancel.disabled = busy; save.textContent = busy ? 'جاري الحفظ...' : 'إضافة إلى التغذية'; };
  save.onclick = async () => {
    if (!items.length) return renderDraft();
    setBusy(true); const totals = draftTotals(items); const title = selectedType === 'other' ? customName.value.trim() || 'وجبة أخرى' : MEAL_TYPES.find(([value]) => value === selectedType)?.[1] || 'وجبة';
    try {
      if (card.local) {
        const logged = store.logMeal({ titleAr: title, ...totals, items: items.map(item => ({ foodId: item.foodId, nameAr: item.nameAr, nameEn: item.nameEn, grams: item.grams, state: item.basis, ...itemMacros(item) })) });
        window.dispatchEvent(new CustomEvent('neon:action-executed', { detail: { tool: 'logMeal', recordId: logged.id } }));
        renderNeonResult(container, { status: 'success', reply: `تمت إضافة ${title} إلى سجل التغذية.`, cards: [{ type: 'meal', mealType: title, ...totals, items: logged.items }] });
      } else {
        const payload = items.map(item => ({ foodName: item.nameEn || item.nameAr, grams: item.grams, basis: item.basis }));
        const result = await neonActionAgent.confirm(card.id, true, selectedType, payload); if (result?.status) renderNeonResult(container, result);
      }
    } catch (error) { renderNeonResult(container, { status: 'error', reply: error?.message || 'تعذر حفظ الوجبة.', cards: [] }); }
  };
  cancel.onclick = async () => { setBusy(true); if (card.local) return renderNeonResult(container, { status: 'success', reply: 'تم إلغاء مسودة الوجبة دون حفظها.', cards: [] }); const result = await neonActionAgent.confirm(card.id, false, selectedType); if (result?.status) renderNeonResult(container, result); };
}

function renderMeal(panel, meal) {
  panel.append(element('h3', meal.mealType || 'الوجبة'));
  for (const item of meal.items || []) panel.append(element('p', `${item.nameAr || item.nameEn}: ${item.grams} غ · ${(item.state || item.basis) === 'raw' ? 'نيء' : 'مطبوخ'}`));
  panel.append(element('p', `${rounded(meal.calories ?? meal.totalCalories)} سعرة · بروتين ${rounded(meal.protein ?? meal.totalProtein)} غ · دهون ${rounded(meal.fats ?? meal.totalFats)} غ`), element('p', `كربوهيدرات ${rounded(meal.carbs ?? meal.totalCarbs)} غ`));
}
