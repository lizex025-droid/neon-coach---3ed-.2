import { FORTY_DAY_DAYS, FORTY_DAY_PROGRAM, getFortyDay, fortyDayExerciseId } from '../data/fortyDayWorkout.js';
import { fortyDayWorkoutService } from '../services/fortyDayWorkoutService.js';
import { notificationService } from '../services/notificationService.js';
import '../styles/fortyDayWorkout.css';

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDuration = totalSeconds => {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
};
const hasCompletedSet = snapshot => (snapshot.session?.touchedExerciseIds || []).some(id => snapshot.trackers?.[id]?.sets?.some(set => set.done && (set.kg !== '' || set.reps !== '')));

export function renderFortyDayWorkoutView() {
  const snapshot = fortyDayWorkoutService.getSnapshot();
  const workoutNumber = Math.min(FORTY_DAY_PROGRAM.durationDays, snapshot.history.length + 1);
  const progress = Math.round((Math.min(snapshot.history.length, FORTY_DAY_PROGRAM.durationDays) / FORTY_DAY_PROGRAM.durationDays) * 100);
  return `
    <div class="forty-workout" id="forty-workout-root">
      <section class="forty-hero">
        <img src="${FORTY_DAY_PROGRAM.cover}" alt="غلاف ${FORTY_DAY_PROGRAM.title}" class="forty-hero-cover">
        <div class="forty-hero-overlay"></div>
        <div class="forty-hero-content">
          <span class="forty-kicker">NEON TRAINING PROGRAM</span>
          <h1>${FORTY_DAY_PROGRAM.title}</h1>
          <p>${FORTY_DAY_PROGRAM.description}</p>
          <div class="forty-progress-meta"><strong>اليوم ${workoutNumber} من ${FORTY_DAY_PROGRAM.durationDays}</strong><span>${progress}% مكتمل</span></div>
          <div class="forty-progress-track"><span style="width:${progress}%"></span></div>
        </div>
      </section>

      <section class="forty-session-bar">
        <div><small>وقت الجلسة</small><strong id="forty-session-timer">${snapshot.session ? formatDuration((Date.now() - snapshot.session.startedAt) / 1000) : '00:00:00'}</strong><span id="forty-session-status">${snapshot.session ? `جلسة ${escapeHtml(getFortyDay(snapshot.session.dayKey).short)} قيد التشغيل` : 'جاهز لبدء التمرين'}</span></div>
        <button type="button" id="forty-start-btn" class="btn btn-primary ${snapshot.session ? 'is-running' : ''}" ${snapshot.session ? 'disabled' : ''}>${snapshot.session ? 'التمرين قيد التشغيل' : 'ابدأ التمرين'}</button>
      </section>

      <section class="forty-rest-bar" id="forty-rest-bar" ${snapshot.restUntil && snapshot.restUntil > Date.now() ? '' : 'hidden'}>
        <div><small>وقت الراحة</small><strong id="forty-rest-timer">00:00</strong></div>
        <div class="forty-rest-progress"><span id="forty-rest-progress"></span></div>
        <div class="forty-rest-actions"><button type="button" data-action="rest-add">+30 ثانية</button><button type="button" data-action="rest-skip">تخطي</button></div>
      </section>

      <section class="forty-days-section">
        <div class="forty-section-heading"><div><span>خطة الأسبوع</span><h2>اختر يوم التمرين</h2></div><p>6 أيام Push / Pull / Legs ثم يوم راحة</p></div>
        <div class="forty-day-tabs" id="forty-day-tabs" dir="ltr">
          ${FORTY_DAY_DAYS.map(day => `<button type="button" class="forty-day-tab tone-${day.tone} ${day.key === snapshot.activeDay ? 'is-active' : ''}" data-day="${day.key}">${day.short}</button>`).join('')}
        </div>
      </section>

      <section class="forty-day-content" id="forty-day-content" aria-live="polite"></section>

      <div class="forty-finish-wrap">
        <button type="button" id="forty-finish-btn" class="btn btn-primary btn-lg" ${snapshot.session && hasCompletedSet(snapshot) ? '' : 'disabled'}>إنهاء التمرين وعرض الملخص</button>
        <small>أكمل جولة واحدة على الأقل لتفعيل إنهاء الجلسة</small>
      </div>

      <button type="button" class="forty-scroll-top" id="forty-scroll-top" aria-label="العودة إلى أعلى">↑</button>

      <div class="forty-modal" id="forty-image-modal" aria-hidden="true"><div class="forty-modal-sheet image-sheet"><button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button><img id="forty-image-preview" alt="صورة التمرين"></div></div>
      <div class="forty-modal" id="forty-detail-modal" aria-hidden="true"><div class="forty-modal-sheet" id="forty-detail-sheet"></div></div>
      <div class="forty-modal" id="forty-summary-modal" aria-hidden="true"><div class="forty-modal-sheet summary-sheet"><div class="forty-modal-top"><button type="button" data-close-modal>إغلاق</button><button type="button" id="forty-share-summary">مشاركة</button></div><div id="forty-summary-content"></div></div></div>
    </div>
  `;
}

function renderDay(dayKey) {
  const day = getFortyDay(dayKey);
  if (!day.exercises.length) return `<article class="forty-rest-day"><span>REST DAY</span><h2>اليوم السابع: راحة</h2><p>استشفاء، نوم جيد، وترطيب كافٍ. يمكنك إضافة مشي خفيف ثم العودة إلى Push A في اليوم التالي.</p></article>`;
  return `
    <header class="forty-day-header"><div><span>${escapeHtml(day.short)}</span><h2>${escapeHtml(day.label)}</h2></div><strong>${day.exercises.length} تمارين</strong></header>
    <div class="forty-exercise-grid">
      ${day.exercises.map((exercise, index) => renderExerciseCard(day, exercise, index)).join('')}
    </div>
  `;
}

function renderExerciseCard(day, exercise, exerciseIndex) {
  const tracker = fortyDayWorkoutService.getTracker(day.key, exerciseIndex);
  const completed = tracker.sets.length > 0 && tracker.sets.every(set => set.done);
  return `
    <article class="forty-exercise-card ${completed ? 'is-completed' : ''}" data-exercise-card="${exerciseIndex}">
      <div class="forty-exercise-head">
        <span class="forty-exercise-number">${exercise.number}</span>
        <div><h3>${escapeHtml(exercise.title)}</h3>${exercise.alternative ? `<p>بديل: ${escapeHtml(exercise.alternative)}</p>` : ''}</div>
        <button type="button" class="forty-image-btn" data-action="image" data-index="${exerciseIndex}" aria-label="عرض صورة التمرين">i</button>
      </div>
      <div class="forty-target-row"><span>${tracker.targetSets} جولات</span><span>${escapeHtml(tracker.targetReps || exercise.reps || 'حسب قدرتك')}</span><span>راحة ${tracker.rest}ث</span></div>
      <div class="forty-card-actions"><button type="button" data-action="history" data-index="${exerciseIndex}">السجل</button><button type="button" data-action="tune" data-index="${exerciseIndex}">تخصيص</button></div>
      <div class="forty-sets" role="table" aria-label="جولات ${escapeHtml(exercise.title)}">
        <div class="forty-set-head" role="row"><span>الجولة</span><span>الوزن</span><span>التكرار</span><span>تم</span></div>
        ${tracker.sets.map((set, setIndex) => `
          <div class="forty-set-row ${set.done ? 'is-done' : ''}" role="row">
            <span class="forty-set-number">${setIndex + 1}</span>
            <label><input type="number" min="0" max="1000" step="0.5" value="${set.kg}" placeholder="0" data-field="kg" data-index="${exerciseIndex}" data-set="${setIndex}" ${set.done ? 'disabled' : ''}><small>كغ</small></label>
            <label><input type="number" min="0" max="1000" step="1" value="${set.reps}" placeholder="0" data-field="reps" data-index="${exerciseIndex}" data-set="${setIndex}" ${set.done ? 'disabled' : ''}><small>عدة</small></label>
            <button type="button" class="forty-done-btn ${set.done ? 'is-done' : ''}" data-action="toggle-set" data-index="${exerciseIndex}" data-set="${setIndex}" aria-label="${set.done ? 'إلغاء إكمال الجولة' : 'إكمال الجولة'}">✓</button>
          </div>
        `).join('')}
      </div>
      <div class="forty-tracker-actions"><button type="button" data-action="add-set" data-index="${exerciseIndex}">إضافة جولة</button><button type="button" data-action="reset" data-index="${exerciseIndex}">إعادة ضبط التمرين</button></div>
    </article>
  `;
}

function renderHistoryModal(dayKey, exerciseIndex) {
  const exercise = getFortyDay(dayKey).exercises[exerciseIndex];
  const tracker = fortyDayWorkoutService.getTracker(dayKey, exerciseIndex);
  const history = tracker.history || [];
  const maxWeight = Math.max(1, ...history.map(row => Number(row.bestKg || row.weight || 0)));
  return `
    <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    <span class="forty-modal-kicker">تاريخ الأداء</span><h2>${escapeHtml(exercise.title)}</h2>
    ${history.length ? `<div class="forty-history-chart">${history.slice(-12).map(row => `<div title="${escapeHtml(row.date)} — ${row.bestKg || row.weight || 0} كغ"><span style="height:${Math.max(8, (Number(row.bestKg || row.weight || 0) / maxWeight) * 100)}%"></span><small>${escapeHtml(row.date)}</small></div>`).join('')}</div><div class="forty-history-list">${history.slice().reverse().map(row => `<div><strong>${escapeHtml(row.date)}</strong><span>${row.sets} جولات · ${row.bestKg || row.weight || 0} كغ × ${row.bestReps || row.reps || 0}</span></div>`).join('')}</div>` : '<p class="forty-empty">لا يوجد سجل لهذا التمرين بعد. أكمل الجلسة ليظهر تطورك هنا.</p>'}
  `;
}

function renderTuneModal(dayKey, exerciseIndex) {
  const exercise = getFortyDay(dayKey).exercises[exerciseIndex];
  const tracker = fortyDayWorkoutService.getTracker(dayKey, exerciseIndex);
  return `
    <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    <span class="forty-modal-kicker">تخصيص التمرين</span><h2>${escapeHtml(exercise.title)}</h2>
    <div class="forty-tune-form">
      <label>عدد الجولات<input id="forty-tune-sets" type="number" min="1" max="8" value="${tracker.targetSets}"></label>
      <label>التكرارات المستهدفة<input id="forty-tune-reps" type="text" value="${escapeHtml(tracker.targetReps || exercise.reps)}" placeholder="8-12"></label>
      <label>الوزن الافتراضي (كغ)<input id="forty-tune-weight" type="number" min="0" max="1000" step="0.5" value="${tracker.weight}"></label>
      <label>الراحة بالثواني<input id="forty-tune-rest" type="number" min="0" max="600" value="${tracker.rest}"></label>
    </div>
    <button type="button" class="btn btn-primary btn-block" data-action="save-tune" data-index="${exerciseIndex}">حفظ التخصيص</button>
  `;
}

function renderSummary(summary) {
  const rows = summary.exercises.length ? summary.exercises.map(exercise => `<div class="forty-summary-exercise"><strong>${escapeHtml(exercise.title)}</strong><span>${escapeHtml(exercise.bestSet)}</span></div>`).join('') : '<p class="forty-empty">لم يتم إدخال جولات مكتملة في هذه الجلسة.</p>';
  return `
    <span class="forty-modal-kicker">WORKOUT COMPLETE</span><h2>أحسنت، أنهيت التمرين</h2><p>${escapeHtml(summary.title)} · ${escapeHtml(summary.dateLabel)}</p>
    <div class="forty-summary-stats"><div><strong>${formatDuration(summary.durationSeconds)}</strong><small>المدة</small></div><div><strong>${summary.totalVolume}</strong><small>الحجم كغ</small></div><div><strong>${summary.exercises.length}</strong><small>التمارين</small></div><div><strong>${summary.totalSets}</strong><small>الجولات</small></div><div><strong>${summary.totalReps}</strong><small>التكرارات</small></div><div><strong>${summary.personalRecords}</strong><small>أرقام جديدة</small></div></div>
    <div class="forty-summary-exercises">${rows}</div>
  `;
}

export function bindFortyDayWorkoutEvents() {
  const root = document.getElementById('forty-workout-root');
  if (!root) return;
  const dayContent = document.getElementById('forty-day-content');
  const detailModal = document.getElementById('forty-detail-modal');
  const detailSheet = document.getElementById('forty-detail-sheet');
  const imageModal = document.getElementById('forty-image-modal');
  const summaryModal = document.getElementById('forty-summary-modal');
  let activeDay = fortyDayWorkoutService.getSnapshot().activeDay;
  let latestSummary = null;

  const openModal = modal => { modal?.classList.add('is-open'); modal?.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeModals = () => { root.querySelectorAll('.forty-modal').forEach(modal => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }); document.body.style.overflow = ''; };
  const renderActiveDay = () => {
    dayContent.innerHTML = renderDay(activeDay);
    root.querySelectorAll('[data-day]').forEach(button => button.classList.toggle('is-active', button.dataset.day === activeDay));
    updateSessionUI();
  };
  const updateSessionUI = () => {
    const snapshot = fortyDayWorkoutService.getSnapshot();
    const start = document.getElementById('forty-start-btn');
    const status = document.getElementById('forty-session-status');
    const finish = document.getElementById('forty-finish-btn');
    if (start) { start.disabled = Boolean(snapshot.session); start.classList.toggle('is-running', Boolean(snapshot.session)); start.textContent = snapshot.session ? 'التمرين قيد التشغيل' : 'ابدأ التمرين'; }
    if (status) status.textContent = snapshot.session ? `جلسة ${getFortyDay(snapshot.session.dayKey).short} قيد التشغيل` : 'جاهز لبدء التمرين';
    if (finish) finish.disabled = !(snapshot.session && hasCompletedSet(snapshot));
  };
  const updateTimers = () => {
    const snapshot = fortyDayWorkoutService.getSnapshot();
    const timer = document.getElementById('forty-session-timer');
    if (timer) timer.textContent = snapshot.session ? formatDuration((Date.now() - snapshot.session.startedAt) / 1000) : '00:00:00';
    const restBar = document.getElementById('forty-rest-bar');
    const restTimer = document.getElementById('forty-rest-timer');
    const restProgress = document.getElementById('forty-rest-progress');
    const remaining = snapshot.restUntil ? Math.max(0, Math.ceil((snapshot.restUntil - Date.now()) / 1000)) : 0;
    if (!remaining && snapshot.restUntil) fortyDayWorkoutService.skipRest();
    if (restBar) restBar.hidden = remaining <= 0;
    if (restTimer) restTimer.textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    if (restProgress) restProgress.style.width = `${snapshot.restDuration ? Math.min(100, (remaining / snapshot.restDuration) * 100) : 0}%`;
  };

  renderActiveDay();
  updateTimers();
  const timerInterval = window.setInterval(updateTimers, 1000);
  setTimeout(() => window.dismissNeonSplash?.(), 80);

  root.addEventListener('input', event => {
    const input = event.target.closest('input[data-field]');
    if (!input) return;
    fortyDayWorkoutService.updateSet(activeDay, Number(input.dataset.index), Number(input.dataset.set), input.dataset.field, input.value);
    updateSessionUI();
  });

  root.addEventListener('click', async event => {
    const dayButton = event.target.closest('[data-day]');
    if (dayButton) { activeDay = dayButton.dataset.day; fortyDayWorkoutService.setActiveDay(activeDay); renderActiveDay(); return; }
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-close-modal') || (button.closest('.forty-modal') && button === event.target.closest('.forty-modal'))) { closeModals(); return; }
    const index = Number(button.dataset.index);
    if (button.id === 'forty-start-btn') { if (getFortyDay(activeDay).exercises.length) { fortyDayWorkoutService.startWorkout(activeDay); updateSessionUI(); updateTimers(); } else notificationService.showToast('هذا يوم راحة. اختر يوم تدريب لبدء الجلسة.', 'info'); return; }
    if (button.dataset.action === 'toggle-set') { fortyDayWorkoutService.toggleSet(activeDay, index, Number(button.dataset.set)); renderActiveDay(); updateTimers(); return; }
    if (button.dataset.action === 'add-set') { fortyDayWorkoutService.addSet(activeDay, index); renderActiveDay(); return; }
    if (button.dataset.action === 'reset') { fortyDayWorkoutService.resetExercise(activeDay, index); renderActiveDay(); return; }
    if (button.dataset.action === 'image') { const exercise = getFortyDay(activeDay).exercises[index]; const preview = document.getElementById('forty-image-preview'); if (preview) { preview.src = exercise.image; preview.alt = exercise.title; } openModal(imageModal); return; }
    if (button.dataset.action === 'history') { detailSheet.innerHTML = renderHistoryModal(activeDay, index); openModal(detailModal); return; }
    if (button.dataset.action === 'tune') { detailSheet.innerHTML = renderTuneModal(activeDay, index); openModal(detailModal); return; }
    if (button.dataset.action === 'save-tune') { fortyDayWorkoutService.tuneExercise(activeDay, index, { targetSets: document.getElementById('forty-tune-sets')?.value, targetReps: document.getElementById('forty-tune-reps')?.value, weight: document.getElementById('forty-tune-weight')?.value, rest: document.getElementById('forty-tune-rest')?.value }); closeModals(); renderActiveDay(); return; }
    if (button.dataset.action === 'rest-add') { fortyDayWorkoutService.adjustRest(30); updateTimers(); return; }
    if (button.dataset.action === 'rest-skip') { fortyDayWorkoutService.skipRest(); updateTimers(); return; }
    if (button.id === 'forty-finish-btn') { latestSummary = fortyDayWorkoutService.finishWorkout(); if (latestSummary) { document.getElementById('forty-summary-content').innerHTML = renderSummary(latestSummary); openModal(summaryModal); renderActiveDay(); updateTimers(); } return; }
    if (button.id === 'forty-share-summary' && latestSummary) {
      const text = [`${latestSummary.title}`, `المدة: ${formatDuration(latestSummary.durationSeconds)}`, `الحجم: ${latestSummary.totalVolume} كغ`, `الجولات: ${latestSummary.totalSets}`, ...latestSummary.exercises.map(exercise => `${exercise.title}: ${exercise.bestSet}`)].join('\n');
      try { if (navigator.share) await navigator.share({ title: FORTY_DAY_PROGRAM.title, text }); else { await navigator.clipboard.writeText(text); button.textContent = 'تم النسخ'; } } catch (error) { if (error?.name !== 'AbortError') notificationService.showToast('تعذرت المشاركة على هذا الجهاز.', 'warning'); }
    }
    if (button.id === 'forty-scroll-top') window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  root.querySelectorAll('.forty-modal').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) closeModals(); }));
  const onKeyDown = event => { if (event.key === 'Escape') closeModals(); };
  const onScroll = () => document.getElementById('forty-scroll-top')?.classList.toggle('is-visible', window.scrollY > 500);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => { clearInterval(timerInterval); document.removeEventListener('keydown', onKeyDown); window.removeEventListener('scroll', onScroll); document.body.style.overflow = ''; };
}
