import { neonActionAgent } from '../services/neonActionAgent.js';
function element(tag, text, className) { const e = document.createElement(tag); if (text != null) e.textContent = text; if (className) e.className = className; return e; }
export function renderNeonResult(container, response) {
  container.replaceChildren();
  container.setAttribute('aria-live', 'polite');
  const labels = { success: '✓ تم تأكيد النتيجة', clarification: 'مطلوب معلومات أو تأكيد', partial: 'اكتمل جزء من الطلب', error: 'تعذر الحفظ', pending_sync: 'محفوظ محلياً وبانتظار المزامنة' };
  container.append(element('p', labels[response.status] || '', 'neon-ai-action-badge'), element('p', response.reply || ''));
  for (const card of response.cards || []) {
    const panel = element('section', null, 'neon-persisted-card'); container.append(panel);
    if (card.type === 'meal_draft') {
      panel.append(element('strong', card.question));
      for (const meal of card.meals || []) renderMeal(panel, meal);
      const picker = element('select'); picker.setAttribute('aria-label', 'اسم الوجبة');
      for (const [value, label] of [['breakfast', 'فطور'], ['lunch', 'غداء'], ['dinner', 'عشاء'], ['snack', 'سناك'], ['other', 'أخرى']]) { const option = element('option', label); option.value = value; picker.append(option); }
      picker.value = card.meals?.[0]?.mealType || 'lunch'; panel.append(picker);
      const yes = element('button', '✓ نعم، أضفها إلى وجباتي', 'btn btn-primary'); yes.type = 'button';
      const no = element('button', 'إلغاء', 'btn'); no.type = 'button'; panel.append(yes, no);
      const answer = async accept => { yes.disabled = no.disabled = true; const r = await neonActionAgent.confirm(card.id, accept, picker.value); if (r?.status) renderNeonResult(container, r); };
      yes.onclick = () => answer(true); no.onclick = () => answer(false);
    } else if (card.type === 'clarification') {
      panel.append(element('p', card.question));
      for (const option of card.options || []) {
        const btn = element('button', typeof option === 'string' ? option : option.label, 'btn'); btn.type = 'button';
        btn.onclick = async () => { const r = await neonActionAgent.handleUserUtterance(btn.textContent, { clarificationId: card.id }); if (r?.status) renderNeonResult(container, r); }; panel.append(btn);
      }
    } else if (card.type === 'meal' || card.type === 'food_nutrition') renderMeal(panel, card);
    else if (card.type === 'water') panel.append(element('h3', 'الماء'), element('p', `الكمية: ${card.amountMl} مل · الإجمالي: ${card.todayTotalMl} مل`), element('p', `الهدف: ${card.targetWaterMl} مل · المتبقي: ${card.remainingMl} مل`));
    else if (card.type === 'weight') panel.append(element('h3', `${card.weightKg} كغ`), element('p', `${card.date} · ${card.timestamp || ''}`), element('p', card.changeKg == null ? 'لا يوجد قياس سابق للمقارنة' : `التغير: ${card.changeKg} كغ`));
    else if (card.type === 'workout') {
      panel.append(element('h3', card.title), element('p', card.completed ? 'التمرين مكتمل' : 'التمرين قيد التنفيذ'));
      for (const ex of card.exercises || []) panel.append(element('p', `${ex.name}: ${ex.sets} × ${ex.reps} · ${ex.weightKg} كغ`));
    } else if (card.type === 'daily_summary') panel.append(element('h3', 'ملخص اليوم'), element('p', `السعرات: ${card.calories} · المتبقي: ${card.remainingCalories}`), element('p', `البروتين: ${card.protein} غ · المتبقي: ${card.remainingProtein} غ`), element('p', `كربوهيدرات: ${card.carbs} غ · دهون: ${card.fats} غ · ماء: ${card.waterMl} مل`), element('p', `التمارين: ${card.workouts?.length || 0}`));
    else panel.append(element('pre', JSON.stringify(card.data, null, 2)));
  }
  if (response.status === 'error') {
    const login = element('a', 'تسجيل الدخول'); login.href = '#auth'; container.append(login);
    const retry = element('button', 'إعادة محاولة نفس الطلب', 'btn'); retry.type = 'button';
    retry.onclick = async () => { retry.disabled = true; const r = await neonActionAgent.retry(); if (r) renderNeonResult(container, r); }; container.append(retry);
  }
}
function renderMeal(panel, meal) {
  panel.append(element('h3', meal.mealType || 'الوجبة'));
  for (const item of meal.items || []) panel.append(element('p', `${item.nameAr || item.nameEn}: ${item.grams} غ · ${item.state === 'raw' ? 'نيء' : 'مطبوخ'}`));
  panel.append(element('p', `${meal.calories} سعرة · بروتين ${meal.protein} غ · دهون ${meal.fats} غ`), element('p', `كربوهيدرات ${meal.carbs} غ · صافي ${meal.netCarbs} غ`));
}
