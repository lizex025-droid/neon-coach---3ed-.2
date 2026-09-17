import { fortyDayWorkoutService } from '../services/fortyDayWorkoutService.js';
import { notificationService } from '../services/notificationService.js';
import '../styles/fortyDayWorkout.css';

const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
const formatDuration = totalSeconds => {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60].map(value => String(value).padStart(2, '0')).join(':');
};
const formatRest = totalSeconds => {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
};
const splitExerciseTitle = title => {
  const [arabic = '', english = ''] = String(title || '').split('|').map(part => part.trim());
  return { arabic, english: english || arabic };
};
const renderExerciseTitle = (title, englishFirst = false) => {
  const { arabic, english } = splitExerciseTitle(title);
  const arabicPart = `<span class="forty-title-ar" dir="rtl">${escapeHtml(arabic)}</span>`;
  const englishPart = `<em>${escapeHtml(english)}</em>`;
  return englishFirst ? `${englishPart}<span class="forty-title-slash">/</span>${arabicPart}` : `${arabicPart}<span class="forty-title-slash">/</span>${englishPart}`;
};
const hasCompletedSet = snapshot => (snapshot.session?.touchedExerciseIds || []).some(id => snapshot.trackers?.[id]?.sets?.some(set => set.done && (set.kg !== '' || set.reps !== '')));

export function renderFortyDayWorkoutView() {
  const snapshot = fortyDayWorkoutService.getSnapshot();
  const activePlan = fortyDayWorkoutService.getActivePlan();
  const program = fortyDayWorkoutService.getProgram(activePlan);
  const days = fortyDayWorkoutService.getDays(activePlan);
  const workoutNumber = Math.min(program.durationDays, snapshot.history.length + 1);
  const progress = Math.round((Math.min(snapshot.history.length, program.durationDays) / program.durationDays) * 100);
  const activeDay = days.some(d => d.key === snapshot.activeDay) ? snapshot.activeDay : days[0].key;
  const activeDayObj = fortyDayWorkoutService.getDay(activeDay, activePlan);

  return `
    <div class="forty-workout" id="forty-workout-root">
      <section class="forty-hero">
        <img src="${program.cover}" alt="غلاف ${program.title}" class="forty-hero-cover">
        <div class="forty-hero-overlay"></div>
        <div class="forty-hero-content">
          <div class="forty-plan-switcher" style="display: inline-flex; align-items: center; background: rgba(0,0,0,0.45); padding: 4px; border-radius: 999px; border: 1px solid var(--forty-line); margin-bottom: 12px; gap: 4px; z-index: 2;">
            <button type="button" data-action="switch-plan" data-plan="hasm" class="btn btn-sm ${activePlan === 'hasm' ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; font-size: 0.76rem; padding: 5px 14px; min-height: unset; cursor: pointer;">نظام الحسم (6 مجموعات)</button>
            <button type="button" data-action="switch-plan" data-plan="ppl" class="btn btn-sm ${activePlan === 'ppl' ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; font-size: 0.76rem; padding: 5px 14px; min-height: unset; cursor: pointer;">Push Pull Legs (6 أيام)</button>
          </div>
          <span class="forty-kicker">${program.kicker || 'NEON TRAINING PROGRAM'}</span>
          <h1>${program.title}</h1>
          <p>${program.description}</p>
          <div class="forty-progress-meta">
            <strong>${activePlan === 'hasm' ? `المجموعة النشطة: ${activeDayObj?.short || ''}` : `اليوم ${workoutNumber} من ${program.durationDays}`}</strong>
            <span>${progress}% مكتمل</span>
          </div>
          <div class="forty-progress-track"><span style="width:${progress}%"></span></div>
        </div>
      </section>

      <section class="forty-session-bar">
        <div>
          <small>وقت الجلسة · WORKOUT TIMER</small>
          <strong id="forty-session-timer">${snapshot.session ? formatDuration((Date.now() - snapshot.session.startedAt) / 1000) : '00:00:00'}</strong>
          <span id="forty-session-status">${snapshot.session ? `جلسة ${escapeHtml(fortyDayWorkoutService.getDay(snapshot.session.dayKey).short)} قيد التشغيل` : 'جاهز لبدء التمرين'}</span>
        </div>
        <button type="button" id="forty-start-btn" class="btn btn-primary ${snapshot.session ? 'is-running' : ''}" ${snapshot.session ? 'disabled' : ''}>${snapshot.session ? 'التمرين قيد التشغيل' : 'ابدأ التمرين · Start Workout'}</button>
      </section>

      <section class="forty-rest-bar" id="forty-rest-bar" ${snapshot.restUntil && snapshot.restUntil > Date.now() ? '' : 'hidden'}>
        <div><small>وقت الراحة</small><strong id="forty-rest-timer">00:00</strong></div>
        <div class="forty-rest-progress"><span id="forty-rest-progress"></span></div>
        <div class="forty-rest-actions"><button type="button" data-action="rest-add">+30 ثانية</button><button type="button" data-action="rest-skip">تخطي</button></div>
      </section>

      <section class="forty-days-section">
        <div class="forty-section-heading">
          <div>
            <span>${activePlan === 'hasm' ? 'خطة نظام الحسم' : 'خطة الأسبوع'}</span>
            <h2>${activePlan === 'hasm' ? 'اختر مجموعة العضلات لعرض تمارينها فقط' : 'اختر يوم التمرين'}</h2>
          </div>
          <p>${activePlan === 'hasm' ? '6 مجموعات عضلية مركزة لتضخيم وقوة مثالية' : '6 أيام Push / Pull / Legs ثم يوم راحة'}</p>
        </div>
        <div class="forty-day-tabs ${activePlan === 'hasm' ? 'hasm-tabs' : ''}" id="forty-day-tabs" role="tablist" aria-label="أيام التمرين">
          ${days.map((day, idx) => `
            <button type="button" role="tab" aria-selected="${day.key === activeDay ? 'true' : 'false'}" class="forty-day-tab tone-${day.tone} ${day.key === activeDay ? 'is-active' : ''}" data-day="${day.key}">
              <span class="forty-tab-day">${activePlan === 'hasm' ? `اليوم ${idx + 1}` : (day.key === 'rest' ? 'استشفاء' : `اليوم ${idx + 1}`)}</span>
              <span class="forty-tab-title">${escapeHtml(day.short)}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="forty-day-content" id="forty-day-content" aria-live="polite"></section>

      <div class="forty-finish-wrap">
        <button type="button" id="forty-finish-btn" class="btn btn-primary btn-lg" ${snapshot.session && hasCompletedSet(snapshot) ? '' : 'disabled'}>إنهاء التمرين وعرض الملخص</button>
        <small>أكمل جولة واحدة على الأقل لتفعيل إنهاء الجلسة</small>
      </div>

      <button type="button" class="forty-scroll-top" id="forty-scroll-top" aria-label="العودة إلى أعلى">↑</button>

      <div class="forty-modal" id="forty-image-modal" aria-hidden="true">
        <div class="forty-modal-sheet image-sheet">
          <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 0 4px; flex-wrap: wrap; gap: 8px;">
            <h3 id="forty-image-title" style="margin: 0; font-size: 0.95rem; color: #fff; font-weight: 700;"></h3>
            <div id="forty-image-toggles" style="display: flex; gap: 6px;"></div>
          </div>
          <img id="forty-image-preview" alt="صورة التمرين" style="display: block; width: 100%; max-height: 75vh; object-fit: contain; border-radius: 14px; background: #000;">
        </div>
      </div>
      <div class="forty-modal" id="forty-detail-modal" aria-hidden="true"><div class="forty-modal-sheet" id="forty-detail-sheet"></div></div>
      <div class="workout-summary-modal" id="forty-summary-modal" aria-hidden="true">
        <section class="workout-summary-sheet" role="dialog" aria-modal="true" aria-label="Workout summary">
          <div class="summary-top-actions">
            <button type="button" data-close-modal aria-label="إغلاق الملخص">×</button>
            <button type="button" id="forty-share-summary" aria-label="مشاركة الملخص">↗</button>
          </div>
          <div id="forty-summary-content"></div>
        </section>
      </div>
    </div>
  `;
}

function renderDay(dayKey) {
  const day = fortyDayWorkoutService.getDay(dayKey);
  if (!day || !day.exercises || !day.exercises.length) {
    return `<article class="forty-rest-day"><span>REST DAY</span><h2>اليوم السابع: راحة</h2><p>استشفاء، نوم جيد، وترطيب كافٍ. يمكنك إضافة مشي خفيف ثم العودة إلى التمرين في اليوم التالي.</p></article>`;
  }
  const trackers = fortyDayWorkoutService.getTrackersForDay(dayKey);
  return `
    <header class="forty-day-header">
      <div><span>${escapeHtml(day.short)}</span><h2>${escapeHtml(day.label)}</h2></div>
      <strong>${day.exercises.length} تمارين</strong>
    </header>
    <div class="forty-exercise-grid">
      ${day.exercises.map((exercise, index) => renderExerciseCard(day, exercise, index, trackers[index])).join('')}
    </div>
  `;
}

function renderExerciseCard(day, exercise, exerciseIndex, tracker) {
  const completed = tracker && tracker.sets.length > 0 && tracker.sets.every(set => set.done);
  return `
    <article class="forty-exercise-card ${completed ? 'is-completed' : ''}" data-exercise-card="${exerciseIndex}">
      <div class="forty-exercise-head">
        <span class="forty-exercise-number">${exercise.number}</span>
        <div><h3>${renderExerciseTitle(exercise.title)}</h3>${exercise.alternative ? `<p><span>بديل / Alternative:</span> ${escapeHtml(exercise.alternative)}</p>` : ''}</div>
        <button type="button" class="forty-image-btn" data-action="image" data-index="${exerciseIndex}" aria-label="عرض صورة التمرين">ⓘ</button>
      </div>
      <div class="forty-card-actions"><button type="button" data-action="history" data-index="${exerciseIndex}">history</button><button type="button" data-action="tune" data-index="${exerciseIndex}">tune</button></div>
      <div class="forty-sets" role="table" aria-label="جولات ${escapeHtml(exercise.title)}">
        ${(tracker?.sets || []).map((set, setIndex) => `
          <div class="forty-set-row ${set.done ? 'is-done' : ''}" role="row">
            <span class="forty-set-number">${setIndex + 1}</span>
            <label><input aria-label="Weight in kilograms" type="number" min="0" max="1000" step="0.5" value="${set.kg}" placeholder="kg" data-field="kg" data-index="${exerciseIndex}" data-set="${setIndex}" ${set.done ? 'disabled' : ''}><small>kg</small></label>
            <span class="forty-set-multiply">×</span>
            <label><input aria-label="Repetitions" type="number" min="0" max="1000" step="1" value="${set.reps}" placeholder="reps" data-field="reps" data-index="${exerciseIndex}" data-set="${setIndex}" ${set.done ? 'disabled' : ''}><small>reps</small></label>
            <button type="button" class="forty-done-btn ${set.done ? 'is-done' : ''}" data-action="toggle-set" data-index="${exerciseIndex}" data-set="${setIndex}" aria-label="${set.done ? 'إلغاء إكمال الجولة' : 'إكمال الجولة'}">✓</button>
          </div>
        `).join('')}
      </div>
      <div class="forty-tracker-actions"><button type="button" data-action="add-set" data-index="${exerciseIndex}">+ Add Set</button><button type="button" data-action="reset" data-index="${exerciseIndex}">Reset This Exercise</button></div>
    </article>
  `;
}

const rangeDays = { W: 7, M: 30, '3M': 90, '6M': 180, Y: 365 };
const filterHistory = (history, range) => {
  if (range === 'ALL') return history;
  const cutoff = Date.now() - (rangeDays[range] || 0) * 86400000;
  return history.filter(row => {
    const timestamp = new Date(row.isoDate || row.date || 0).getTime();
    return Number.isFinite(timestamp) && timestamp >= cutoff;
  });
};

function renderHistoryModal(dayKey, exerciseIndex, range = 'ALL') {
  const exercise = fortyDayWorkoutService.getDay(dayKey).exercises[exerciseIndex];
  const tracker = fortyDayWorkoutService.getTracker(dayKey, exerciseIndex);
  const history = filterHistory(tracker?.history || [], range);
  const maxWeight = Math.min(500, Math.max(25, Math.ceil(Math.max(0, ...history.map(row => Number(row.bestKg || row.weight || 0))) / 25) * 25));
  const points = history.map((row, index) => {
    const x = ((index + 1) / history.length) * 100;
    const y = 100 - (Math.min(maxWeight, Number(row.bestKg || row.weight || 0)) / maxWeight) * 100;
    return { x, y, weight: Number(row.bestKg || row.weight || 0), date: row.date || '-' };
  });
  const totalVolume = history.reduce((sum, row) => sum + Number(row.volume || (Number(row.weight || 0) * Number(row.reps || 0) * Number(row.sets || 0))), 0);
  const bestWeight = Math.max(0, ...history.map(row => Number(row.bestKg || row.weight || 0)));
  const roundCount = history.reduce((sum, row) => sum + (Array.isArray(row.rounds) ? row.rounds.length : Number(row.sets || 0)), 0);
  const loggedSets = (tracker?.sets || []).filter(set => set.kg !== '' && set.reps !== '').length;
  const tableRows = history.slice().reverse().flatMap(row => Array.isArray(row.rounds) && row.rounds.length
    ? row.rounds.map(round => ({ date: row.date, round: round.round, reps: round.reps, weight: round.kg }))
    : [{ date: row.date, round: row.sets || '-', reps: row.bestReps || row.reps || '-', weight: row.bestKg || row.weight || '-' }]);
  return `
    <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    <span class="forty-modal-kicker">HISTORY</span><h2 class="forty-modal-title">${renderExerciseTitle(exercise.title)}</h2>
    <div class="forty-history-ranges" data-history-index="${exerciseIndex}">
      ${['W', 'M', '3M', '6M', 'Y', 'ALL'].map(item => `<button type="button" data-action="history-range" data-index="${exerciseIndex}" data-range="${item}" class="${item === range ? 'is-active' : ''}">${item}</button>`).join('')}
    </div>
    <div class="forty-history-graph">
      <div class="forty-history-scale"><span>${maxWeight}</span><span>${Math.round(maxWeight / 2)}</span><span>0</span></div>
      <div class="forty-history-plot">
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Weight history chart">
          <defs><marker id="fortyHistoryArrow" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0,0 L7,3.5 L0,7 Z" class="forty-history-arrow"/></marker></defs>
          <line x1="0" y1="0" x2="100" y2="0"/><line x1="0" y1="50" x2="100" y2="50"/><line x1="0" y1="100" x2="100" y2="100"/>
          <line x1="0" y1="0" x2="0" y2="100" class="forty-history-hover-line" hidden/>
          ${points.length ? `<polyline points="0,100 ${points.map(point => `${point.x},${point.y}`).join(' ')}" marker-end="url(#fortyHistoryArrow)"/>` : ''}
        </svg>
        ${points.map(point => `<span class="forty-history-dot" style="left:${point.x}%;top:${point.y}%" title="${escapeHtml(point.date)} · ${point.weight} kg"></span>`).join('')}
        <div class="forty-history-hover-tip" hidden></div>
        <strong>${history.length ? `${roundCount} rounds · best ${bestWeight} kg` : 'No saved rounds yet'}</strong>
      </div>
    </div>
    <div class="forty-history-summary">
      <div><small>ROUNDS</small><b>${roundCount}</b></div>
      <div><small>CURRENT LOGGED</small><b>${loggedSets}/${tracker?.targetSets || 3}</b></div>
      <div><small>BEST</small><b>${bestWeight ? `${bestWeight} kg` : '-'}</b></div>
      <div><small>TOTAL VOLUME</small><b>${totalVolume ? `${Math.round(totalVolume)} kg` : '-'}</b></div>
    </div>
    <div class="forty-history-table">
      <div class="forty-history-head"><span>DATE</span><span>ROUND</span><span>REPS</span><span>WEIGHT</span></div>
      ${tableRows.length ? tableRows.map(row => `<div class="forty-history-row"><span>${escapeHtml(row.date || '-')}</span><span>${escapeHtml(row.round)}</span><span>${escapeHtml(row.reps)}</span><span>${row.weight === '-' ? '-' : `${escapeHtml(row.weight)} kg`}</span></div>`).join('') : '<div class="forty-history-empty">No rounds in this range.</div>'}
    </div>
  `;
}

function bindHistoryHover(sheet, dayKey, exerciseIndex, range) {
  const chart = sheet?.querySelector('.forty-history-plot svg');
  const line = chart?.querySelector('.forty-history-hover-line');
  const tip = sheet?.querySelector('.forty-history-hover-tip');
  const history = filterHistory(fortyDayWorkoutService.getTracker(dayKey, exerciseIndex)?.history || [], range);
  const maxWeight = Math.min(500, Math.max(25, Math.ceil(Math.max(0, ...history.map(row => Number(row.bestKg || row.weight || 0))) / 25) * 25));
  const points = history.map((row, index) => ({
    x: ((index + 1) / history.length) * 100,
    y: 100 - (Math.min(maxWeight, Number(row.bestKg || row.weight || 0)) / maxWeight) * 100,
    date: row.date || '-',
    sets: Array.isArray(row.rounds) ? row.rounds.length : row.sets || '-',
    reps: row.bestReps || row.reps || '-',
    weight: row.bestKg || row.weight || 0
  }));
  if (!chart || !line || !tip || !points.length) return;
  const hide = () => { line.setAttribute('hidden', ''); tip.hidden = true; };
  chart.addEventListener('mouseleave', hide);
  chart.addEventListener('mousemove', event => {
    const rect = chart.getBoundingClientRect();
    const mouseX = ((event.clientX - rect.left) / rect.width) * 100;
    const nearest = points.reduce((best, point) => Math.abs(point.x - mouseX) < Math.abs(best.x - mouseX) ? point : best, points[0]);
    line.removeAttribute('hidden');
    line.setAttribute('x1', nearest.x);
    line.setAttribute('x2', nearest.x);
    tip.hidden = false;
    tip.innerHTML = `<strong>${escapeHtml(nearest.date)}</strong><span>Rounds: ${escapeHtml(nearest.sets)}</span><span>Reps: ${escapeHtml(nearest.reps)}</span><span>Weight: ${escapeHtml(nearest.weight)} kg</span>`;
    tip.style.left = `${Math.min(Math.max((nearest.x / 100) * rect.width, 84), rect.width - 84)}px`;
    tip.style.top = `${Math.max((nearest.y / 100) * rect.height - 14, 18)}px`;
  });
}

function renderTuneModal(dayKey, exerciseIndex) {
  const exercise = fortyDayWorkoutService.getDay(dayKey).exercises[exerciseIndex];
  const tracker = fortyDayWorkoutService.getTracker(dayKey, exerciseIndex);
  return `
    <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    <span class="forty-modal-kicker">${escapeHtml(fortyDayWorkoutService.getDay(dayKey).short)} · TUNE</span><h2 class="forty-modal-title">${renderExerciseTitle(exercise.title)}</h2>
    <div class="forty-tune-form">
      <label class="forty-tune-row"><span>WEIGHT</span><span class="forty-tune-control"><input id="forty-tune-weight" type="number" min="0" max="1000" step="0.5" value="${tracker.weight}" placeholder="0"><small>kg</small></span></label>
      <div class="forty-tune-row"><span>SETS</span><span class="forty-tune-control"><button type="button" data-action="tune-step" data-target="forty-tune-sets" data-delta="-1">−</button><input id="forty-tune-sets" type="number" min="1" max="8" value="${tracker.targetSets}"><button type="button" data-action="tune-step" data-target="forty-tune-sets" data-delta="1">+</button></span></div>
      <label class="forty-tune-row"><span>REPS</span><span class="forty-tune-control"><input id="forty-tune-reps" type="text" value="${escapeHtml(tracker.targetReps || exercise.reps)}" placeholder="8-12"></span></label>
      <div class="forty-tune-row"><span>REST</span><span class="forty-tune-control"><button type="button" data-action="tune-rest" data-delta="-15">−</button><input id="forty-tune-rest" type="hidden" value="${tracker.rest}"><b id="forty-tune-rest-display">${formatRest(tracker.rest)}</b><button type="button" data-action="tune-rest" data-delta="15">+</button></span></div>
    </div>
    <div class="forty-tune-actions"><button type="button" data-close-modal>cancel</button><button type="button" class="is-primary" data-action="save-tune" data-index="${exerciseIndex}">save</button></div>
  `;
}

function renderSummary(summary) {
  const formatBestSet = exercise => exercise.bestKg > 0 ? `${exercise.bestKg} kg × ${exercise.bestReps || '-'}` : `${exercise.bestReps || exercise.reps || '-'} reps`;
  const rows = summary.exercises.length ? summary.exercises.map(exercise => `
    <div class="summary-exercise-row">
      <b>${exercise.sets} × ${escapeHtml(exercise.title)}${exercise.isPersonalRecord ? ' ★' : ''}</b>
      <span>${formatBestSet(exercise)}</span>
    </div>
  `).join('') : '<div class="summary-empty">لم يتم إدخال جولات في هذه الجلسة.</div>';
  return `
    <div class="summary-stars">★ ★ ★</div>
    <header class="summary-hero">
      <h2>أحسنت!</h2>
      <p>أنهيت جلسة ${summary.title} رقم ${summary.workoutNumber}</p>
    </header>
    <div class="summary-card">
      <div class="summary-card-head">
        <strong>${summary.title}</strong>
        <span>${escapeHtml(summary.dateLabel)}</span>
      </div>
      <div class="summary-stats">
        <div class="summary-stat"><b>◷ ${formatDuration(summary.durationSeconds)}</b><small>المدة</small></div>
        <div class="summary-stat"><b>${summary.totalVolume} kg</b><small>الحجم</small></div>
        <div class="summary-stat"><b>${summary.exercises.length}</b><small>التمارين</small></div>
        <div class="summary-stat"><b>${summary.totalSets}</b><small>الجولات</small></div>
        <div class="summary-stat"><b>${summary.totalReps}</b><small>التكرارات</small></div>
        <div class="summary-stat"><b>${summary.personalRecords}</b><small>PRs</small></div>
      </div>
      <div class="summary-exercise-head"><span>التمرين</span><span>أفضل جولة</span></div>
      ${rows}
    </div>
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

  let activePlan = fortyDayWorkoutService.getActivePlan();
  let days = fortyDayWorkoutService.getDays(activePlan);
  let activeDay = fortyDayWorkoutService.getSnapshot().activeDay;
  if (!days.some(d => d.key === activeDay)) {
    activeDay = days[0].key;
    fortyDayWorkoutService.setActiveDay(activeDay);
  }
  let latestSummary = null;

  const openModal = modal => { modal?.classList.add('is-open'); modal?.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeModals = () => { root.querySelectorAll('.forty-modal,.workout-summary-modal').forEach(modal => { modal.classList.remove('is-open'); modal.setAttribute('aria-hidden', 'true'); }); document.body.style.overflow = ''; };

  const renderActiveDay = () => {
    if (dayContent) dayContent.innerHTML = renderDay(activeDay);
    root.querySelectorAll('[data-day]').forEach(button => button.classList.toggle('is-active', button.dataset.day === activeDay));
    updateSessionUI();
  };

  const updateSessionUI = () => {
    const snapshot = fortyDayWorkoutService.getSnapshot();
    const start = document.getElementById('forty-start-btn');
    const status = document.getElementById('forty-session-status');
    const finish = document.getElementById('forty-finish-btn');
    if (start) {
      start.disabled = Boolean(snapshot.session);
      start.classList.toggle('is-running', Boolean(snapshot.session));
      start.textContent = snapshot.session ? 'التمرين قيد التشغيل' : 'ابدأ التمرين · Start Workout';
    }
    if (status) {
      status.textContent = snapshot.session ? `جلسة ${fortyDayWorkoutService.getDay(snapshot.session.dayKey).short} قيد التشغيل` : 'جاهز لبدء التمرين';
    }
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
    if (dayButton) {
      activeDay = dayButton.dataset.day;
      fortyDayWorkoutService.setActiveDay(activeDay);
      renderActiveDay();
      return;
    }

    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-close-modal') || (button.closest('.forty-modal') && button === event.target.closest('.forty-modal'))) {
      closeModals();
      return;
    }

    // تبديل الخطة بين نظام الحسم و PPL مباشرة من شاشة التمرين
    if (button.dataset.action === 'switch-plan') {
      const targetPlan = button.dataset.plan;
      fortyDayWorkoutService.setActivePlan(targetPlan);
      root.outerHTML = renderFortyDayWorkoutView();
      bindFortyDayWorkoutEvents();
      notificationService.showToast(`تم التبديل إلى ${targetPlan === 'hasm' ? 'نظام الحسم' : 'Push Pull Legs'} بنجاح`, 'info');
      return;
    }

    const index = Number(button.dataset.index);
    if (button.id === 'forty-start-btn') {
      const curDay = fortyDayWorkoutService.getDay(activeDay);
      if (curDay?.exercises && curDay.exercises.length) {
        fortyDayWorkoutService.startWorkout(activeDay);
        updateSessionUI();
        updateTimers();
      } else {
        notificationService.showToast('هذا يوم راحة. اختر مجموعة عضلية لبدء التمرين.', 'info');
      }
      return;
    }
    if (button.dataset.action === 'toggle-set') {
      fortyDayWorkoutService.toggleSet(activeDay, index, Number(button.dataset.set));
      renderActiveDay();
      updateTimers();
      return;
    }
    if (button.dataset.action === 'add-set') {
      fortyDayWorkoutService.addSet(activeDay, index);
      renderActiveDay();
      return;
    }
    if (button.dataset.action === 'reset') {
      fortyDayWorkoutService.resetExercise(activeDay, index);
      renderActiveDay();
      return;
    }
    if (button.dataset.action === 'image') {
      const exercise = fortyDayWorkoutService.getDay(activeDay).exercises[index];
      const preview = document.getElementById('forty-image-preview');
      const titleEl = document.getElementById('forty-image-title');
      const toggles = document.getElementById('forty-image-toggles');
      if (titleEl) titleEl.textContent = exercise.title;
      if (preview) {
        preview.src = exercise.image;
        preview.alt = exercise.title;
      }
      if (toggles) {
        if (exercise.pageImage && exercise.pageImage !== exercise.image) {
          toggles.innerHTML = `
            <button type="button" class="btn btn-sm btn-primary" id="btn-show-r2" style="font-size:0.72rem;padding:4px 10px;border-radius:999px;">صورة التمرين</button>
            <button type="button" class="btn btn-sm btn-ghost" id="btn-show-book" style="font-size:0.72rem;padding:4px 10px;border-radius:999px;">صفحة الكتاب</button>
          `;
          document.getElementById('btn-show-r2')?.addEventListener('click', () => {
            if (preview) preview.src = exercise.image;
            document.getElementById('btn-show-r2').className = 'btn btn-sm btn-primary';
            document.getElementById('btn-show-book').className = 'btn btn-sm btn-ghost';
          });
          document.getElementById('btn-show-book')?.addEventListener('click', () => {
            if (preview) preview.src = exercise.pageImage;
            document.getElementById('btn-show-book').className = 'btn btn-sm btn-primary';
            document.getElementById('btn-show-r2').className = 'btn btn-sm btn-ghost';
          });
        } else {
          toggles.innerHTML = '';
        }
      }
      openModal(imageModal);
      return;
    }
    if (button.dataset.action === 'history') {
      detailSheet.innerHTML = renderHistoryModal(activeDay, index);
      bindHistoryHover(detailSheet, activeDay, index, 'ALL');
      openModal(detailModal);
      return;
    }
    if (button.dataset.action === 'history-range') {
      const range = button.dataset.range || 'ALL';
      detailSheet.innerHTML = renderHistoryModal(activeDay, index, range);
      bindHistoryHover(detailSheet, activeDay, index, range);
      return;
    }
    if (button.dataset.action === 'tune') {
      detailSheet.innerHTML = renderTuneModal(activeDay, index);
      openModal(detailModal);
      return;
    }
    if (button.dataset.action === 'tune-step') {
      const input = document.getElementById(button.dataset.target);
      if (!input) return;
      input.value = Math.max(Number(input.min) || 1, Math.min(Number(input.max) || 8, Number(input.value || 0) + Number(button.dataset.delta || 0)));
      return;
    }
    if (button.dataset.action === 'tune-rest') {
      const input = document.getElementById('forty-tune-rest');
      const display = document.getElementById('forty-tune-rest-display');
      if (!input || !display) return;
      input.value = Math.max(0, Math.min(600, Number(input.value || 0) + Number(button.dataset.delta || 0)));
      display.textContent = formatRest(input.value);
      return;
    }
    if (button.dataset.action === 'save-tune') {
      fortyDayWorkoutService.tuneExercise(activeDay, index, {
        targetSets: document.getElementById('forty-tune-sets')?.value,
        targetReps: document.getElementById('forty-tune-reps')?.value,
        weight: document.getElementById('forty-tune-weight')?.value,
        rest: document.getElementById('forty-tune-rest')?.value
      });
      closeModals();
      renderActiveDay();
      return;
    }
    if (button.dataset.action === 'rest-add') {
      fortyDayWorkoutService.adjustRest(30);
      updateTimers();
      return;
    }
    if (button.dataset.action === 'rest-skip') {
      fortyDayWorkoutService.skipRest();
      updateTimers();
      return;
    }
    if (button.id === 'forty-finish-btn') {
      latestSummary = fortyDayWorkoutService.finishWorkout();
      if (latestSummary) {
        document.getElementById('forty-summary-content').innerHTML = renderSummary(latestSummary);
        openModal(summaryModal);
        renderActiveDay();
        updateTimers();
      }
      return;
    }
    if (button.id === 'forty-share-summary' && latestSummary) {
      const text = [`${latestSummary.title}`, `المدة: ${formatDuration(latestSummary.durationSeconds)}`, `الحجم: ${latestSummary.totalVolume} كغ`, `الجولات: ${latestSummary.totalSets}`, ...latestSummary.exercises.map(exercise => `${exercise.title}: ${exercise.bestSet}`)].join('\n');
      try {
        if (navigator.share) await navigator.share({ title: latestSummary.title, text });
        else { await navigator.clipboard.writeText(text); button.textContent = 'تم النسخ'; }
      } catch (error) {
        if (error?.name !== 'AbortError') notificationService.showToast('تعذرت المشاركة على هذا الجهاز.', 'warning');
      }
    }
    if (button.id === 'forty-scroll-top') window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  root.querySelectorAll('.forty-modal,.workout-summary-modal').forEach(modal => modal.addEventListener('click', event => { if (event.target === modal) closeModals(); }));
  const onKeyDown = event => { if (event.key === 'Escape') closeModals(); };
  const onScroll = () => document.getElementById('forty-scroll-top')?.classList.toggle('is-visible', window.scrollY > 500);
  document.addEventListener('keydown', onKeyDown);
  window.addEventListener('scroll', onScroll, { passive: true });
  return () => {
    clearInterval(timerInterval);
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('scroll', onScroll);
    document.body.style.overflow = '';
  };
}
