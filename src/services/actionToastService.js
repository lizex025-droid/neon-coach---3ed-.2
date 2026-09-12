/**
 * NEON ACTION AGENT - خدمة الإشعارات التفاعلية العابرة للتابات (Cross-Tab Action Toasts)
 * عند تعديل بيانات تابة غير مفتوحة حالياً، تظهر بطاقة إشعار نيون سريعة مع زر VIEW للانتقال الاختياري.
 */

export function showActionToast({ module, title, details, routeHash }) {
  // إزالة أي إشعار سابق
  const existing = document.getElementById('neon-action-toast-instance');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'neon-action-toast-instance';
  toast.className = 'neon-action-toast';

  toast.innerHTML = `
    <div style="font-size: 1.4rem;">⚡</div>
    <div class="neon-action-toast-body">
      <span class="neon-action-toast-tag">${module.toUpperCase()} UPDATED</span>
      <span class="neon-action-toast-text">${details || title}</span>
    </div>
    <a href="${routeHash || '#'}" class="neon-action-toast-view-btn">VIEW</a>
    <button type="button" style="background: none; border: none; color: #a0aec0; cursor: pointer; font-size: 1.1rem; padding: 0 4px;" aria-label="إغلاق">✕</button>
  `;

  document.body.appendChild(toast);

  // إظهار بانسيابية
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });

  const closeBtn = toast.querySelector('button');
  const viewBtn = toast.querySelector('a');

  const dismiss = () => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 350);
  };

  if (closeBtn) closeBtn.addEventListener('click', dismiss);
  if (viewBtn) viewBtn.addEventListener('click', dismiss);

  setTimeout(dismiss, 5500);
}

export function initCrossTabActionToastListener(getCurrentRoute) {
  window.addEventListener('neon:action-executed', (event) => {
    const detail = event.detail || {};
    const actions = detail.actions || [];
    const current = getCurrentRoute ? getCurrentRoute() : '';

    for (const act of actions) {
      let targetRoute = '';
      let moduleName = '';
      let targetHash = '';
      let details = '';

      if (act.tool === 'logWorkoutSets' || act.tool === 'logWorkoutSet' || act.tool === 'completeWorkout') {
        targetRoute = 'workout';
        moduleName = 'Workout';
        targetHash = '#workout';
        details = `${act.arguments?.exercise || 'تمرين'} · ${act.arguments?.weightKg || 0} kg × ${act.arguments?.sets || 1} × ${act.arguments?.reps || 8}`;
      } else if (act.tool === 'logMeal' || act.tool === 'updateMeal') {
        targetRoute = 'nutrition';
        moduleName = 'Nutrition';
        targetHash = '#nutrition';
        const items = act.arguments?.items || [];
        details = items.map(i => i.nameAr).join(' + ');
      } else if (act.tool === 'logWater' || act.tool === 'updateWater') {
        targetRoute = 'water-supps';
        moduleName = 'Water';
        targetHash = '#water-supps';
        details = `+${act.arguments?.milliliters || 250} ml`;
      } else if (act.tool === 'markSupplementTaken') {
        targetRoute = 'water-supps';
        moduleName = 'Supplements';
        targetHash = '#water-supps';
        details = `${act.arguments?.supplement || 'مكمل'} مسجل تم`;
      } else if (act.tool === 'logWeight' || act.tool === 'updateWeight' || act.tool === 'logBodyMeasurement') {
        targetRoute = 'progress';
        moduleName = 'Progress';
        targetHash = '#progress';
        details = act.arguments?.weightKg ? `${act.arguments.weightKg} kg` : `الخصر: ${act.arguments?.waistCm} سم`;
      } else if (act.tool === 'addShoppingItems' || act.tool === 'removeShoppingItem') {
        targetRoute = 'shopping-list';
        moduleName = 'Shopping';
        targetHash = '#shopping-list';
        details = (act.arguments?.names || [act.arguments?.name]).join(', ');
      }

      if (targetRoute && targetRoute !== current && current !== 'neon-ai') {
        showActionToast({
          module: moduleName,
          details,
          routeHash: targetHash
        });
      }
    }
  });
}
