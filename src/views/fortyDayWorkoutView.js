import { fortyDayWorkoutService } from '../services/fortyDayWorkoutService.js';
import { notificationService } from '../services/notificationService.js';
import { store } from '../state/store.js';
import { generatePersonalizedTrainingDraft } from '../domain/personalizedTrainingPlan.js';
import { showTrainingPlanPreview } from './questionnaireView.js';
import {
  EXERCISE_GROUPS,
  ALL_LIBRARY_EXERCISES,
  getExerciseGroups,
  getExercisesByGroup,
  searchExercises,
  detectExerciseMuscleGroup
} from '../data/exerciseLibrary.js';
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
const hasCompletedSet = snapshot => (snapshot.session?.touchedExerciseIds || []).some(id => {
  const tracker = snapshot.trackers?.[id];
  return [...(tracker?.sets || []), ...(tracker?.superset?.sets || []), ...(tracker?.dropSets || [])]
    .some(set => set.done && Number(set.reps) > 0);
});
const exerciseImageCache = new Map();
const MAX_WARM_EXERCISE_IMAGES = 12;

function warmExerciseImage(url, priority = 'low') {
  if (!url || typeof Image === 'undefined') return Promise.resolve(false);

  const cached = exerciseImageCache.get(url);
  if (cached) {
    exerciseImageCache.delete(url);
    exerciseImageCache.set(url, cached);
    if (priority === 'high') cached.image.fetchPriority = 'high';
    return cached.promise;
  }

  const image = new Image();
  image.decoding = 'async';
  image.fetchPriority = priority;
  const promise = new Promise(resolve => {
    image.onload = () => resolve(true);
    image.onerror = () => {
      exerciseImageCache.delete(url);
      resolve(false);
    };
  });

  exerciseImageCache.set(url, { image, promise });
  while (exerciseImageCache.size > MAX_WARM_EXERCISE_IMAGES) {
    exerciseImageCache.delete(exerciseImageCache.keys().next().value);
  }
  image.src = url;
  return promise;
}

export function renderFortyDayWorkoutView() {
  const snapshot = fortyDayWorkoutService.getSnapshot();
  const activePlan = fortyDayWorkoutService.getActivePlan();
  const program = fortyDayWorkoutService.getProgram(activePlan);
  const days = fortyDayWorkoutService.getDays(activePlan);
  const workoutNumber = Math.min(program.durationDays, snapshot.history.length + 1);
  const progress = program.durationDays ? Math.round((Math.min(snapshot.history.length, program.durationDays) / program.durationDays) * 100) : 0;
  const activeDay = days.some(d => d.key === snapshot.activeDay) ? snapshot.activeDay : days[0].key;
  const activeDayObj = fortyDayWorkoutService.getDay(activeDay, activePlan);
  const activeVersion = fortyDayWorkoutService.getActivePlanVersion(activePlan);

  return `
    <div class="forty-workout" id="forty-workout-root">
      <section class="forty-hero">
        <img src="${program.cover}" alt="غلاف ${program.title}" class="forty-hero-cover">
        <div class="forty-hero-overlay"></div>
        <div class="forty-hero-content">
          <div class="forty-active-plan-pill" style="display: inline-flex; align-items: center; gap: 8px; background: rgba(0,0,0,0.55); padding: 6px 14px; border-radius: 999px; border: 1px solid rgba(85,247,165,0.35); margin-bottom: 12px; z-index: 2; backdrop-filter: blur(8px);">
            <span style="display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: #55F7A5; box-shadow: 0 0 8px #55F7A5;"></span>
            <span style="color: #FFFFFF; font-size: 0.8rem; font-weight: 700;">${escapeHtml(program.title)}</span>
            ${activePlan === 'personalized' ? `<button type="button" data-action="create-personalized-plan" class="btn btn-xs" style="border-radius: 999px; font-size: 0.72rem; padding: 2px 10px; background: rgba(85,247,165,0.18); color: #55F7A5; border: 1px solid rgba(85,247,165,0.4); cursor: pointer; margin-right: 4px;">✨ تخصيص الخطة</button>` : ''}
            <a href="#profile/workout-plans" style="color: #55F7A5; font-size: 0.72rem; text-decoration: none; margin-right: 4px; opacity: 0.85; transition: opacity 0.2s;" title="تغيير الخطة من حسابي">تغيير ⚙️</a>
          </div>
          <span class="forty-kicker">${program.kicker || 'NEON TRAINING PROGRAM'}</span>
          <h1>${program.title}</h1>
          <p>${program.description}</p>
          <div class="forty-progress-meta">
            <strong>${(activePlan === 'ulf' || activePlan === 'fbw' || activePlan === 'hasm' || activePlan === 'anas' || activePlan === 'personalized') ? `اليوم النشط: ${activeDayObj?.short || ''}` : `اليوم ${workoutNumber} من ${program.durationDays}`}</strong>
            <span>${(activePlan === 'ulf' || activePlan === 'fbw') ? '3 أيام / أسبوع' : `${progress}% مكتمل`}</span>
          </div>
          ${(activePlan === 'ulf' || activePlan === 'fbw') ? `<p>${escapeHtml(program.schedule)}</p><p>${escapeHtml(program.dropSetNote)}</p>` : `<div class="forty-progress-track"><span style="width:${progress}%"></span></div>`}
        </div>
      </section>

      ${activeVersion ? `<section class="forty-session-bar" style="display:block;">
        <small>الخطة الشخصية المعتمدة · النسخة ${escapeHtml(activeVersion.id)}</small>
        <strong style="display:block;margin:6px 0;">${escapeHtml(activeVersion.selectedLevel)} · قواعد ${escapeHtml(activeVersion.rulesVersion)}</strong>
        <span>${escapeHtml(activeVersion.suggestedStartingPoint || activeVersion.reasons?.[0] || '')}</span>
        ${activeVersion.warnings?.length ? `<p style="color:#fbbf24;margin:8px 0 0;font-size:.82rem;">${escapeHtml(activeVersion.warnings[0])}</p>` : ''}
      </section>` : ''}

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
            <span>${activePlan === 'ulf' ? 'خطة Upper / Lower / Full Body' : activePlan === 'fbw' ? 'خطة FBW — Full Body' : activePlan === 'anas' ? 'خطة نظام أنس' : (activePlan === 'hasm' ? 'خطة نظام الحسم' : (activePlan === 'personalized' ? 'الخطة المقترحة من التطبيق' : 'خطة الأسبوع'))}</span>
            <h2>${activePlan === 'anas' ? 'اختر نوع التمرين' : (activePlan === 'hasm' ? 'اختر مجموعة العضلات لعرض تمارينها فقط' : (activePlan === 'personalized' ? 'اختر يوم التمرين المقترح' : 'اختر يوم التمرين'))}</h2>
          </div>
          <p>${activePlan === 'ulf' ? '3 أيام · السبت Upper / الأحد Lower / الثلاثاء Full Body' : activePlan === 'fbw' ? '3 أيام · السبت A / الأحد B / الثلاثاء C' : activePlan === 'anas' ? '5 أيام تدريبية: Push / Pull / Legs / Upper / كتف' : (activePlan === 'hasm' ? '6 مجموعات عضلية مركزة لتضخيم وقوة مثالية' : (activePlan === 'personalized' ? `${days.length} أيام تدريبية مخصصة ومعدلة حسب أهدافك وإصاباتك` : '6 أيام Push / Pull / Legs ثم يوم راحة'))}</p>
        </div>
        <div class="forty-day-tabs ${activePlan === 'hasm' ? 'hasm-tabs' : (activePlan === 'anas' ? 'anas-tabs' : (activePlan === 'personalized' ? 'personalized-tabs' : ''))}" id="forty-day-tabs" role="tablist" aria-label="أيام التمرين">
          ${days.map((day, idx) => `
            <button type="button" role="tab" aria-selected="${day.key === activeDay ? 'true' : 'false'}" class="forty-day-tab tone-${day.tone} ${day.key === activeDay ? 'is-active' : ''}" data-day="${day.key}">
              <span class="forty-tab-day">${(activePlan === 'ulf' || activePlan === 'fbw' || activePlan === 'hasm' || activePlan === 'anas' || activePlan === 'personalized') ? `اليوم ${idx + 1}` : (day.key === 'rest' ? 'استشفاء' : `اليوم ${idx + 1}`)}</span>
              <span class="forty-tab-title">${escapeHtml(day.short || day.label)}</span>
            </button>
          `).join('')}
        </div>
      </section>

      <section class="forty-day-content" id="forty-day-content" aria-live="polite"></section>

      <div class="forty-finish-wrap">
        <button type="button" id="reset-plan-default-btn" class="forty-reset-default-btn">
          <span style="font-size: 1.15rem; line-height: 1;">↺</span>
          <span>استعادة الخطة الافتراضية الأصلية</span>
        </button>
        <button type="button" id="open-exercise-library-btn" class="forty-add-exercise-btn">
          <span style="font-size: 1.25rem; font-weight: 900; line-height: 1;">＋</span>
          <span>إضافة تمارين من المكتبة الشاملة</span>
        </button>
        <button type="button" id="forty-finish-btn" class="btn btn-primary btn-lg" ${snapshot.session && hasCompletedSet(snapshot) ? '' : 'disabled'}>إنهاء التمرين وعرض الملخص</button>
        <small>أكمل جولة واحدة على الأقل لتفعيل إنهاء الجلسة</small>
      </div>

      <button type="button" class="forty-scroll-top" id="forty-scroll-top" aria-label="العودة إلى أعلى">↑</button>

      <div class="forty-modal" id="forty-image-modal" aria-hidden="true">
        <div class="forty-modal-sheet image-sheet">
          <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
          <div style="margin-bottom: 12px; padding: 0 40px 0 4px;">
            <h3 id="forty-image-title" style="margin: 0; font-size: 0.95rem; color: #fff; font-weight: 700;"></h3>
          </div>
          <div class="exercise-image-stage is-loading" id="forty-image-stage" aria-live="polite">
            <div class="exercise-image-load-state">
              <span class="exercise-image-spinner" aria-hidden="true"></span>
              <span id="forty-image-status">جاري تحميل صورة التمرين…</span>
            </div>
            <img id="forty-image-preview" alt="صورة التمرين" decoding="async">
          </div>
        </div>
      </div>
      <div class="forty-modal" id="forty-detail-modal" aria-hidden="true"><div class="forty-modal-sheet" id="forty-detail-sheet"></div></div>
      <div class="forty-modal" id="forty-library-modal" aria-hidden="true"><div class="forty-modal-sheet library-sheet" id="forty-library-sheet"></div></div>
      <div class="forty-modal" id="forty-manage-modal" aria-hidden="true"><div class="forty-modal-sheet manage-sheet" id="forty-manage-sheet"></div></div>
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
      <div style="text-align: left;">
        <strong>${day.exercises.length} تمارين</strong>
        ${day.estimatedMinutes ? `<div style="font-size:0.82rem;color:#55F7A5;margin-top:2px;font-weight:700;">≈ ${day.estimatedMinutes} دقيقة تدريب وإحماء</div>` : ''}
      </div>
    </header>
    ${day.tone ? `<div style="background:rgba(85,247,165,.08);border:1px solid rgba(85,247,165,.25);border-radius:12px;padding:8px 14px;margin-bottom:10px;font-size:0.83rem;color:#55F7A5;font-weight:700;">🎯 نمط الجلسة: ${escapeHtml(day.tone)}</div>` : ''}
    ${day.warmup ? `<div style="background:rgba(255,255,255,.03);border:1px solid rgba(85,247,165,.2);border-radius:14px;padding:12px 14px;margin-bottom:14px;color:#D8E3DE;font-size:0.85rem;"><strong style="color:#55F7A5;display:block;margin-bottom:4px;">🔥 الإحماء وتهيئة المفاصل المقترحة:</strong>${escapeHtml(day.warmup)}</div>` : ''}
    <div class="forty-exercise-grid">
      ${day.exercises.map((exercise, index) => renderExerciseCard(day, exercise, index, trackers[index], day.exercises.length)).join('')}
    </div>
  `;
}

const WORKOUT_MUSCLE_LABELS = {
  chest: 'الصدر',
  back: 'الظهر',
  legs: 'الأرجل',
  shoulders: 'الأكتاف',
  biceps: 'بايسبس',
  triceps: 'ترايسبس',
  abs: 'عضلات البطن والوسط',
  glutes: 'المؤخرة والأرجل الخلفية',
  calves: 'السمانة',
  forearms: 'الساعدين',
  cardio: 'لياقة وهوائي'
};

function renderExerciseCard(day, exercise, exerciseIndex, tracker, totalCount = 0) {
  const completed = tracker && tracker.sets.length > 0 && tracker.sets.every(set => set.done);
  const total = totalCount || (day?.exercises?.length ?? 1);
  const muscleBadge = WORKOUT_MUSCLE_LABELS[exercise.groupKey] || exercise.groupKey || '';
  return `
    <article class="forty-exercise-card ${completed ? 'is-completed' : ''}" data-exercise-card="${exerciseIndex}" data-index="${exerciseIndex}">
      <div class="forty-exercise-head">
        <div class="forty-exercise-reorder-wrap" title="اضغط مطولاً واسحب للترتيب">
          <button type="button" class="forty-quick-move-btn forty-move-up" data-action="quick-move-up" data-index="${exerciseIndex}" ${exerciseIndex === 0 ? 'disabled' : ''} aria-label="تقديم التمرين للأعلى">▲</button>
          <span class="forty-exercise-number forty-drag-handle">${exercise.number}</span>
          <button type="button" class="forty-quick-move-btn forty-move-down" data-action="quick-move-down" data-index="${exerciseIndex}" ${exerciseIndex === total - 1 ? 'disabled' : ''} aria-label="تأخير التمرين للأسفل">▼</button>
        </div>
        <div class="forty-exercise-title-block">
          <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin-bottom:3px;">
            <h3>${renderExerciseTitle(exercise.title)}</h3>
            ${muscleBadge ? `<span class="badge" style="font-size:0.72rem;padding:2px 8px;border-radius:8px;background:rgba(85,247,165,.12);color:#55F7A5;border:1px solid rgba(85,247,165,.25);">${escapeHtml(muscleBadge)}</span>` : ''}
          </div>
          ${exercise.alternative ? `<p><span>بديل / Alternative:</span> ${escapeHtml(exercise.alternative)}</p>` : ''}
          ${exercise.reason ? `<p><span>سبب الاختيار:</span> ${escapeHtml(exercise.reason)}</p>` : ''}
          ${exercise.restSeconds != null ? `<p><span>الجرعة المقترحة:</span> ${exercise.sets} مجموعات · ${escapeHtml(exercise.reps)} · راحة ${escapeHtml(exercise.restLabel || `${exercise.restSeconds}ث`)} · RIR ${exercise.rir}</p>` : ''}
          ${exercise.dropSet ? `<p class="badge">+ Drop Set بعد آخر مجموعة</p>` : ''}
          ${tracker?.superset ? `<p class="forty-linked-status">↔ SUPER SET · ${escapeHtml(tracker.superset.title)}</p>` : ''}
          ${tracker?.dropSets?.length ? `<p class="forty-linked-status is-drop">↓ DROP SET · ${tracker.dropSets.length} ${tracker.dropSets.length === 1 ? 'جولة' : 'جولات'}</p>` : ''}
          ${exercise.imageNote ? `<p>${escapeHtml(exercise.imageNote)}</p>` : ''}
          ${exercise.coachingNote ? `<p style="color:#55F7A5;font-size:0.8rem;margin-top:4px;"><span>💡 التدرج والتكنيك:</span> ${escapeHtml(exercise.coachingNote)}</p>` : ''}
        </div>
        <button type="button" class="forty-image-btn" data-action="image" data-index="${exerciseIndex}" data-image-url="${escapeHtml(exercise.image || '')}" aria-label="عرض صورة التمرين">ⓘ</button>
      </div>
      <div class="forty-card-actions"><button type="button" data-action="history" data-index="${exerciseIndex}">history</button><button type="button" data-action="tune" data-index="${exerciseIndex}">tune</button></div>
      <div class="forty-sets" role="table" aria-label="جولات ${escapeHtml(exercise.title)}">
        ${(tracker?.sets || []).map((set, setIndex) => `
          <div class="forty-set-row ${set.done ? 'is-done' : ''}" role="row" data-working-set="${setIndex}">
            <span class="forty-set-number">${setIndex + 1}</span>
            <label><input aria-label="Weight in kilograms" type="number" min="0" max="1000" step="0.5" value="${set.kg}" placeholder="kg" data-field="kg" data-index="${exerciseIndex}" data-set="${setIndex}" ${set.done ? 'disabled' : ''}><small>kg</small></label>
            <span class="forty-set-multiply">×</span>
            <label><input aria-label="Repetitions" type="number" min="0" max="1000" step="1" value="${set.reps}" placeholder="reps" data-field="reps" data-index="${exerciseIndex}" data-set="${setIndex}" ${set.done ? 'disabled' : ''}><small>reps</small></label>
            <button type="button" class="forty-done-btn ${set.done ? 'is-done' : ''}" data-action="toggle-set" data-index="${exerciseIndex}" data-set="${setIndex}" aria-label="${set.done ? 'إلغاء إكمال الجولة' : 'إكمال الجولة'}">✓</button>
          </div>
            ${(tracker?.dropSets || []).map((drop, dropIndex) => drop.parentSetIndex === setIndex ? `
              <div class="forty-linked-set-row is-drop ${drop.done ? 'is-done' : ''}" data-drop-index="${dropIndex}" data-parent-set="${setIndex}" data-exercise-index="${exerciseIndex}">
                <div class="forty-drop-drag-header">
                   <span class="forty-linked-set-tag">DROP ${dropIndex + 1} · Set ${setIndex + 1}</span>
                   <div class="forty-drop-reorder">
                     <button type="button" class="forty-drop-move-btn" data-action="move-drop" data-delta="-1" data-index="${exerciseIndex}" data-set="${dropIndex}" aria-label="نقل الدروب للجولة السابقة" ${setIndex === 0 ? 'disabled' : ''}>↑</button>
                     <button type="button" class="forty-drop-drag-handle" aria-label="اسحب الدروب سيت إلى أي جولة" title="اسحب إلى الجولة المطلوبة">⠿ <span>سحب</span></button>
                     <button type="button" class="forty-drop-move-btn" data-action="move-drop" data-delta="1" data-index="${exerciseIndex}" data-set="${dropIndex}" aria-label="نقل الدروب للجولة التالية" ${setIndex === tracker.sets.length - 1 ? 'disabled' : ''}>↓</button>
                   </div>
                 </div>
                <div class="forty-linked-set-fields">
                  <label><input type="number" min="0" max="1000" step="0.5" placeholder="kg" value="${drop.kg}" aria-label="Drop weight" data-linked-field="kg" data-linked-kind="drop" data-index="${exerciseIndex}" data-set="${dropIndex}" ${drop.done ? 'disabled' : ''}><small>kg</small></label>
                  <span>×</span>
                  <label><input type="number" min="0" max="1000" step="1" placeholder="reps" value="${drop.reps}" aria-label="Drop repetitions" data-linked-field="reps" data-linked-kind="drop" data-index="${exerciseIndex}" data-set="${dropIndex}" ${drop.done ? 'disabled' : ''}><small>reps</small></label>
                  <button type="button" class="forty-done-btn ${drop.done ? 'is-done' : ''}" data-action="toggle-linked" data-kind="drop" data-index="${exerciseIndex}" data-set="${dropIndex}" aria-label="حفظ الجولة">✓</button>
                </div>
                <small class="forty-linked-set-name">DROP SET · مرتبط بالجولة ${setIndex + 1} · اسحب لتغيير الجولة</small>
              </div>
            ` : '').join('')}
            ${tracker?.superset ? `
              <div class="forty-linked-set-row is-superset ${tracker.superset.sets[setIndex].done ? 'is-done' : ''}">
                <span class="forty-linked-set-tag">SS ${setIndex + 1}</span>
                <div class="forty-linked-set-fields">
                  <label><input type="number" min="0" max="1000" step="0.5" placeholder="kg" value="${tracker.superset.sets[setIndex].kg}" aria-label="Superset weight" data-linked-field="kg" data-linked-kind="superset" data-index="${exerciseIndex}" data-set="${setIndex}" ${tracker.superset.sets[setIndex].done ? 'disabled' : ''}><small>kg</small></label>
                  <span>×</span>
                  <label><input type="number" min="0" max="1000" step="1" placeholder="reps" value="${tracker.superset.sets[setIndex].reps}" aria-label="Superset repetitions" data-linked-field="reps" data-linked-kind="superset" data-index="${exerciseIndex}" data-set="${setIndex}" ${tracker.superset.sets[setIndex].done ? 'disabled' : ''}><small>reps</small></label>
                  <button type="button" class="forty-done-btn ${tracker.superset.sets[setIndex].done ? 'is-done' : ''}" data-action="toggle-linked" data-kind="superset" data-index="${exerciseIndex}" data-set="${setIndex}" aria-label="حفظ الجولة">✓</button>
                </div>
                <small class="forty-linked-set-name">SUPER SET · ${escapeHtml(tracker.superset.title)}</small>
              </div>
            ` : ''}
            ${tracker?.dropSets?.length ? `
              <div class="forty-set-drop-insert">
                <button type="button" data-action="add-drop-to-set" data-index="${exerciseIndex}" data-set="${setIndex}">+ Drop للجولة ${setIndex + 1}</button>
              </div>
            ` : ''}
        `).join('')}
      </div>
      <div class="forty-tracker-actions">
        <button type="button" data-action="add-set" data-index="${exerciseIndex}">+ Add Set</button>
        ${tracker?.dropSets?.length ? `<button type="button" class="forty-add-drop-btn" data-action="add-drop-round" data-index="${exerciseIndex}">+ Drop للجولة التالية</button>` : ''}
        <button type="button" class="forty-manage-btn" data-action="manage" data-index="${exerciseIndex}" aria-label="إدارة التمرين">⚙ Manage Exercise</button>
      </div>
    </article>
  `;
}

function renderManageExerciseSheet(dayKey, exerciseIndex) {
  const day = fortyDayWorkoutService.getDay(dayKey);
  const exercise = day?.exercises?.[exerciseIndex];
  if (!exercise) return '';
  const tracker = fortyDayWorkoutService.getTracker(dayKey, exerciseIndex);

  return `
    <div class="manage-sheet-head">
      <div>
        <span class="manage-sheet-tag">تمرين #${exerciseIndex + 1}</span>
        <h3 class="manage-sheet-title">${escapeHtml(exercise.title)}</h3>
      </div>
      <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    </div>

    <div class="manage-sheet-options">
      <!-- 1. Reset Exercise -->
      <button type="button" class="manage-option-card" data-manage-action="reset" data-index="${exerciseIndex}">
        <div class="manage-option-icon icon-reset">↺</div>
        <div class="manage-option-content">
          <div class="manage-option-title-row">
            <strong>إعادة ضبط التمرين</strong>
            <span class="manage-option-badge badge-reset">Reset Exercise</span>
          </div>
          <p>مسح الأوزان والتكرارات المسجلة وإرجاع الجولات فارغة للجلسة الحالية دون حذف التمرين من الخطة.</p>
        </div>
      </button>

      <!-- 2. Switch Exercise -->
      <button type="button" class="manage-option-card" data-manage-action="switch" data-index="${exerciseIndex}">
        <div class="manage-option-icon icon-switch">⇄</div>
        <div class="manage-option-content">
          <div class="manage-option-title-row">
            <strong>تبديل التمرين</strong>
            <span class="manage-option-badge badge-switch">Switch Exercise</span>
          </div>
          <p>استبدال هذا التمرين بآخر من مكتبة التمارين مع فتحه تلقائياً على نفس العضلة والحفاظ على مكانه في الجدول.</p>
        </div>
      </button>

      <button type="button" class="manage-option-card" data-manage-action="superset" data-index="${exerciseIndex}">
        <div class="manage-option-icon icon-superset">⇆</div>
        <div class="manage-option-content">
          <div class="manage-option-title-row"><strong>سوبر سيت</strong><span class="manage-option-badge badge-superset">Super Set</span></div>
          <p>${tracker?.superset ? `مرتبط مع: ${escapeHtml(tracker.superset.title)} · اضغط لتغييره من المكتبة.` : 'اختر تمرينًا من المكتبة ثم أدخل وزن وعدّات كل جولة سوبر سيت بجانب التمرين الأساسي.'}</p>
        </div>
      </button>
      ${tracker?.superset ? `<button type="button" class="forty-linked-remove" data-manage-action="remove-superset" data-index="${exerciseIndex}">إزالة ربط السوبر سيت</button>` : ''}
      <button type="button" class="manage-option-card" data-manage-action="drop-set" data-index="${exerciseIndex}">
        <div class="manage-option-icon icon-drop">↓</div>
        <div class="manage-option-content">
          <div class="manage-option-title-row"><strong>دروب سيت</strong><span class="manage-option-badge badge-drop">Drop Set</span></div>
          <p>${tracker?.dropSets?.length ? `مفعّل · ${tracker.dropSets.length} جولة إضافية. اضغط لإضافة جولة أخرى.` : 'أضف جولة بوزن أقل بعد آخر Set، مع خانة الوزن والعدّات وعلامة حفظ مستقلة.'}</p>
        </div>
      </button>
      ${tracker?.dropSets?.length ? `<button type="button" class="forty-linked-remove" data-manage-action="remove-drop" data-index="${exerciseIndex}">إزالة جولات الدروب سيت</button>` : ''}
      <!-- 5. Delete Exercise -->
      <button type="button" class="manage-option-card is-danger" data-manage-action="delete" data-index="${exerciseIndex}">
        <div class="manage-option-icon icon-delete">🗑</div>
        <div class="manage-option-content">
          <div class="manage-option-title-row">
            <strong style="color: #f87171;">حذف التمرين</strong>
            <span class="manage-option-badge badge-delete">Delete Exercise</span>
          </div>
          <p>حذف التمرين نهائياً من خطة وجلسة اليوم مع إمكانية إضافته مجدداً من المكتبة بأي وقت.</p>
        </div>
      </button>
    </div>
  `;
}

function renderDeleteConfirmSheet(dayKey, exerciseIndex) {
  const day = fortyDayWorkoutService.getDay(dayKey);
  const exercise = day?.exercises?.[exerciseIndex];
  if (!exercise) return '';

  return `
    <div class="manage-sheet-head">
      <div>
        <span class="manage-sheet-tag" style="color: #f87171;">تأكيد الحذف</span>
        <h3 class="manage-sheet-title" style="color: #f87171;">حذف التمرين من خطة اليوم؟</h3>
      </div>
      <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    </div>

    <div class="manage-confirm-body">
      <div class="manage-confirm-box">
        <p>هل أنت متأكد من حذف تمرين:</p>
        <h4>${escapeHtml(exercise.title)}</h4>
        <small>سيتم حذف التمرين وجولاته من جدول اليوم الحالي، ولن تفقد سجلك وتاريخك السابق لنفس التمرين.</small>
      </div>

      <div class="manage-confirm-actions">
        <button type="button" class="btn btn-danger confirm-delete-btn" data-confirm-delete-index="${exerciseIndex}">
          نعم، احذف التمرين
        </button>
        <button type="button" class="btn btn-secondary confirm-cancel-btn" data-manage-action="back-to-manage" data-index="${exerciseIndex}">
          تراجع
        </button>
      </div>
    </div>
  `;
}

function renderResetPlanConfirmSheet(dayKey, activePlan) {
  const planName = fortyDayWorkoutService.getProgram(activePlan).title;
  const day = fortyDayWorkoutService.getDay(dayKey);
  const dayName = day?.label || day?.short || 'اليوم الحالي';

  return `
    <div class="manage-sheet-head">
      <div>
        <span class="manage-sheet-tag" style="color: #fbbf24;">استعادة الضبط الافتراضي</span>
        <h3 class="manage-sheet-title">استعادة الخطة الافتراضية الأصلية</h3>
      </div>
      <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    </div>

    <div class="manage-confirm-body">
      <div class="manage-confirm-box" style="background: rgba(251, 191, 36, 0.08); border-color: rgba(251, 191, 36, 0.3);">
        <p style="color: rgba(255, 255, 255, 0.9);">
          هل ترغب في التراجع عن التعديلات وإرجاع التمارين إلى تشكيلتها وترتيبها الافتراضي الأصلي كما كانت بالبداية؟
        </p>
        <small style="color: rgba(255, 255, 255, 0.6);">
          الخطة النشطة: <strong>${escapeHtml(planName)}</strong> (${escapeHtml(dayName)})
        </small>
      </div>

      <div class="manage-sheet-options" style="gap: 10px; margin-bottom: 14px;">
        <button type="button" class="manage-option-card" data-confirm-reset-scope="day">
          <div class="manage-option-icon icon-reset">↺</div>
          <div class="manage-option-content">
            <div class="manage-option-title-row">
              <strong>استعادة تمارين اليوم الحالي فقط</strong>
            </div>
            <p>إرجاع تمارين (${escapeHtml(dayName)}) إلى التشكيلة والترتيب الأصلي المعتمد.</p>
          </div>
        </button>

        <button type="button" class="manage-option-card" data-confirm-reset-scope="plan">
          <div class="manage-option-icon icon-reset" style="background: rgba(251, 191, 36, 0.12); color: #fbbf24; border-color: rgba(251, 191, 36, 0.3);">↺</div>
          <div class="manage-option-content">
            <div class="manage-option-title-row">
              <strong>استعادة كامل خطة (${escapeHtml(planName)})</strong>
            </div>
            <p>إرجاع كافة أيام وأسابيع الخطة للوضع الافتراضي الأولي بالكامل.</p>
          </div>
        </button>
      </div>

      <button type="button" class="btn btn-secondary confirm-cancel-btn" data-close-modal style="width: 100%;">
        إلغاء وتراجع
      </button>
    </div>
  `;
}

function renderLibrarySheet(activeGroupKey = null, searchQuery = '', switchContext = null) {
  const isSupersetPick = switchContext?.mode === 'superset';
  const libraryMode = switchContext ? (isSupersetPick ? 'superset' : 'switch') : 'add';
  const switchBanner = switchContext && switchContext.sourceExercise ? `
    <div class="library-switch-banner">
      <div class="library-switch-meta">
        <span class="library-switch-icon">${isSupersetPick ? '⇆' : '🔄'}</span>
        <div>
          <div class="library-switch-label">${isSupersetPick ? 'ربط Super Set مع التمرين #' : 'تبديل تمرين #'}${switchContext.targetIndex + 1}</div>
          <strong class="library-switch-title">${escapeHtml(switchContext.sourceExercise.title)}</strong>
        </div>
      </div>
      <button type="button" class="btn-cancel-switch" data-lib-action="cancel-switch">${isSupersetPick ? 'إلغاء الاختيار' : 'إلغاء التبديل'}</button>
    </div>
  ` : '';

  // 1. عرض نتائج البحث النصي الحي
  if (searchQuery && searchQuery.trim()) {
    const results = searchExercises(searchQuery);
    return `
      <div class="library-head">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button type="button" class="btn-icon" data-lib-action="back-to-groups" aria-label="الرجوع للقائمة" style="width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(110,231,183,0.3); color: #fff; cursor: pointer;">
            ❯
          </button>
          <div class="library-head-title">
            <h2>نتائج البحث (${results.length})</h2>
            <p>${isSupersetPick ? 'اختر التمرين الثاني للسوبر سيت، وسيظهر تحت الجولات الأساسية' : switchContext ? 'اختر التمرين البديل ليأخذ مكانه فوراً' : 'اختر أي تمرين لإضافته إلى جدولك الحالي'}</p>
          </div>
        </div>
        <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
      </div>

      ${switchBanner}

      <div class="library-search-box">
        <input type="text" id="lib-search-input" value="${escapeHtml(searchQuery)}" placeholder="ابحث عن أي تمرين بالاسم..." class="library-search-input">
      </div>

      <div class="library-exercises-list">
        ${results.length ? results.map(ex => renderLibraryExerciseItem(ex, libraryMode)).join('') : `
          <div style="text-align: center; padding: 40px 10px; color: rgba(255,255,255,0.5);">
            لا توجد تمارين مطابقة لبحثك. جرب اسم عضلة أو تمرين آخر.
          </div>
        `}
      </div>
    `;
  }

  // 2. عرض تمارين عضلة محددة
  if (activeGroupKey) {
    const group = EXERCISE_GROUPS.find(g => g.key === activeGroupKey);
    const exercises = getExercisesByGroup(activeGroupKey);

    return `
      <div class="library-head">
        <div style="display: flex; align-items: center; gap: 10px;">
          <button type="button" class="btn-icon" data-lib-action="back-to-groups" aria-label="الرجوع لكافة العضلات" style="width: 38px; height: 38px; border-radius: 50%; background: rgba(255,255,255,0.06); border: 1px solid rgba(110,231,183,0.3); color: #fff; cursor: pointer;">
            ❯
          </button>
          <div class="library-head-title">
            <h2>${escapeHtml(group?.nameAr || 'التمارين')} (${exercises.length} تمرين)</h2>
            <p>${isSupersetPick ? 'اختر تمرين السوبر سيت' : switchContext ? 'اختر التمرين البديل ليأخذ مكانه في الخطة' : escapeHtml(group?.description || 'اختر تمريناً لإضافته')}</p>
          </div>
        </div>
        <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
      </div>

      ${switchBanner}

      <div class="library-exercises-list">
        ${exercises.map(ex => renderLibraryExerciseItem(ex, libraryMode)).join('')}
      </div>
    `;
  }

  // 3. العرض الرئيسي: شبكة ثنائية الأعمدة للمجموعات العضلية الثمانية مطابقة للصورة المرفقة
  return `
    <div class="library-head">
      <div class="library-head-title">
        <h2>مكتبة التمارين الشاملة وشروحاتها</h2>
        <p>${isSupersetPick ? 'اختر عضلة ثم تمرين السوبر سيت' : switchContext ? 'اختر العضلة لاستعراض التمارين البديلة' : 'اختر العضلة لعرض كافة تمارينها وإضافتها لخطة تمرينك'}</p>
      </div>
      <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
    </div>

    ${switchBanner}

    <div class="library-search-box">
      <input type="text" id="lib-search-input" placeholder="ابحث بالاسم عن أي تمرين (مثال: بنش، سكوات، ديدليفت)..." class="library-search-input">
    </div>

    <div class="library-groups-grid">
      ${EXERCISE_GROUPS.map(g => `
        <div class="lib-muscle-card" data-lib-group="${g.key}" role="button" tabindex="0">
          <div class="lib-muscle-img-wrap">
            <img src="${g.cover}" alt="${escapeHtml(g.nameAr)}" loading="lazy" decoding="async">
          </div>
          <div class="lib-muscle-card-footer">
            <div class="lib-card-meta-row">
              <span class="lib-card-count">${g.count} EXERCISE</span>
              <div class="lib-card-badge">${escapeHtml(g.nameAr)}</div>
            </div>
            <span class="lib-card-sub">إضغط للتوجه إلى صفحة التمارين</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderLibraryExerciseItem(ex, mode = 'add') {
  const isSwitchMode = mode !== 'add';
  return `
    <div class="lib-exercise-item" data-lib-item-id="${ex.id}">
      <div class="lib-exercise-thumb">
        <img src="${ex.image}" alt="${escapeHtml(ex.nameAr)}" loading="lazy" decoding="async">
      </div>
      <div class="lib-exercise-info">
        <h4>${escapeHtml(ex.nameAr)}</h4>
        <small>${escapeHtml(ex.nameEn)}</small>
        <p>معدة: ${escapeHtml(ex.equipment)} · ${ex.sets} جولات × ${ex.reps}</p>
      </div>
      <button type="button" class="btn ${isSwitchMode ? 'btn-switch' : 'btn-primary'} lib-add-btn" data-lib-add-id="${ex.id}">
        ${mode === 'superset' ? '⇆ Super Set' : isSwitchMode ? '⇄ اختيار كبديل' : '＋ إضافة'}
      </button>
    </div>
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
  const history = filterHistory(fortyDayWorkoutService.getSharedHistory(dayKey, exerciseIndex), range);
  const maxWeight = Math.min(500, Math.max(25, Math.ceil(Math.max(0, ...history.map(row => Number(row.bestKg || row.weight || 0))) / 25) * 25));
  const points = history.map((row, index) => {
    const x = ((index + 1) / history.length) * 100;
    const y = 100 - (Math.min(maxWeight, Number(row.bestKg || row.weight || 0)) / maxWeight) * 100;
    return { x, y, weight: Number(row.bestKg || row.weight || 0), date: row.date || '-' };
  });
  const totalVolume = history.reduce((sum, row) => sum + Number(row.volume || (Number(row.weight || 0) * Number(row.reps || 0) * Number(row.sets || 0))), 0);
  const bestWeight = Math.max(0, ...history.map(row => Number(row.bestKg || row.weight || 0)));
  const roundCount = history.reduce((sum, row) => sum +
    (Array.isArray(row.rounds) ? row.rounds.length : Number(row.sets || 0)) +
    (row.superRounds?.length || 0) + (row.dropRounds?.length || 0), 0);
  const loggedSets = [
    ...(tracker?.sets || []),
    ...(tracker?.superset?.sets || []),
    ...(tracker?.dropSets || [])
  ].filter(set => set.done && Number(set.reps) > 0).length;
  const tableRows = history.slice().reverse().flatMap(row => {
    const original = (row.rounds || []).map(round => ({
      date: row.date, round: `Set ${round.round}`, reps: round.reps, weight: round.kg
    }));
    const paired = (row.superRounds || []).map(round => ({
      date: row.date,
      round: `SS ${round.round} · ${(round.exerciseTitle || 'Super Set').split('|').at(-1).trim()}`,
      reps: round.reps, weight: round.kg
    }));
    const drops = (row.dropRounds || []).map(round => ({
      date: row.date, round: `DROP ${round.round} (Set ${round.afterSet})`,
      reps: round.reps, weight: round.kg
    }));
    const result = [...original, ...paired, ...drops];
    if (result.length) return result;
    return !Array.isArray(row.rounds)
      ? [{ date: row.date, round: row.sets || '-', reps: row.bestReps || row.reps || '-', weight: row.bestKg || row.weight || '-' }]
      : [];
  });
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
      <div><small>SAVED NOW</small><b>${loggedSets}/${tracker?.targetSets || 3}</b></div>
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
  const history = filterHistory(fortyDayWorkoutService.getSharedHistory(dayKey, exerciseIndex), range);
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
  const rows = summary.exercises.length ? summary.exercises.map(exercise => {
    const paired = exercise.superRounds || [];
    const drops = exercise.dropRounds || [];
    const pairBest = paired.reduce((best, set) => set.kg > (best?.kg || 0) ? set : best, paired[0]);
    const dropBest = drops.reduce((best, set) => set.kg > (best?.kg || 0) ? set : best, drops[0]);
    return `
      ${(exercise.rounds || []).length ? `<div class="summary-exercise-row">
        <b>${exercise.rounds.length} × ${escapeHtml(exercise.title)}${exercise.isPersonalRecord ? ' ★' : ''}</b>
        <span>${formatBestSet(exercise)}</span>
      </div>` : ''}
      ${paired.length ? `<div class="summary-exercise-row">
        <b>SS · ${paired.length} × ${escapeHtml(exercise.supersetTitle || paired[0]?.exerciseTitle || 'Super Set')}</b>
        <span>${pairBest?.kg || 0} kg × ${pairBest?.reps || 0}</span>
      </div>` : ''}
      ${drops.length ? `<div class="summary-exercise-row">
        <b>DROP · ${drops.length} × ${escapeHtml(exercise.title)}</b>
        <span>${dropBest?.kg || 0} kg × ${dropBest?.reps || 0}</span>
      </div>` : ''}
    `;
  }).join('') : '<div class="summary-empty">لم يتم إدخال جولات في هذه الجلسة.</div>';
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

function initDragAndReorder(container, onReorder) {
  let pressTimer = null;
  let isDragging = false;
  let draggedCard = null;
  let draggedIndex = -1;
  let currentTargetIndex = -1;
  let startX = 0;
  let startY = 0;
  let grabOffsetY = 0;
  let initialRects = [];
  let allCards = [];

  const resetAllCardStyles = () => {
    allCards.forEach(card => {
      card.style.transform = '';
      card.style.transition = '';
      card.style.zIndex = '';
      card.classList.remove('is-dragging');
    });
  };

  const cleanup = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }
    resetAllCardStyles();
    isDragging = false;
    draggedCard = null;
    draggedIndex = -1;
    currentTargetIndex = -1;
    initialRects = [];
    allCards = [];
    document.body.style.userSelect = '';
  };

  const startDrag = (card, clientX, clientY) => {
    allCards = Array.from(container.querySelectorAll('.forty-exercise-card'));
    if (allCards.length <= 1) return;

    draggedCard = card;
    draggedIndex = allCards.indexOf(card);
    if (draggedIndex === -1) return;

    currentTargetIndex = draggedIndex;
    initialRects = allCards.map(c => c.getBoundingClientRect());

    const cardMidY = initialRects[draggedIndex].top + initialRects[draggedIndex].height / 2;
    grabOffsetY = clientY - cardMidY;

    isDragging = true;
    draggedCard.classList.add('is-dragging');
    draggedCard.style.zIndex = '9999';
    draggedCard.style.transition = 'none';
    draggedCard.style.transform = 'translateY(0px) scale(1.035)';
    document.body.style.userSelect = 'none';

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(30);
    }
  };

  const updateDragPosition = (clientY) => {
    if (!isDragging || !draggedCard || draggedIndex === -1) return;

    const deltaY = clientY - startY;
    draggedCard.style.transform = `translateY(${deltaY}px) scale(1.035)`;

    const currentCardCenterY = clientY - grabOffsetY;
    let closestIndex = draggedIndex;
    let minDistance = Infinity;

    for (let i = 0; i < initialRects.length; i++) {
      const midY = initialRects[i].top + initialRects[i].height / 2;
      const dist = Math.abs(currentCardCenterY - midY);
      if (dist < minDistance) {
        minDistance = dist;
        closestIndex = i;
      }
    }

    if (closestIndex !== currentTargetIndex) {
      currentTargetIndex = closestIndex;
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(18);
      }
    }

    const draggedHeight = initialRects[draggedIndex].height + 18;

    allCards.forEach((card, idx) => {
      if (idx === draggedIndex) return;
      card.style.transition = 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)';

      if (draggedIndex < currentTargetIndex) {
        if (idx > draggedIndex && idx <= currentTargetIndex) {
          card.style.transform = `translateY(-${draggedHeight}px)`;
        } else {
          card.style.transform = 'translateY(0px)';
        }
      } else if (draggedIndex > currentTargetIndex) {
        if (idx < draggedIndex && idx >= currentTargetIndex) {
          card.style.transform = `translateY(${draggedHeight}px)`;
        } else {
          card.style.transform = 'translateY(0px)';
        }
      } else {
        card.style.transform = 'translateY(0px)';
      }
    });
  };

  const endDrag = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      pressTimer = null;
    }

    if (!isDragging) {
      cleanup();
      return;
    }

    const fromIdx = draggedIndex;
    const toIdx = currentTargetIndex;

    if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx && initialRects[toIdx] && initialRects[fromIdx]) {
      const finalDeltaY = initialRects[toIdx].top - initialRects[fromIdx].top;
      draggedCard.style.transition = 'transform 0.22s cubic-bezier(0.2, 0, 0, 1)';
      draggedCard.style.transform = `translateY(${finalDeltaY}px) scale(1)`;

      setTimeout(() => {
        cleanup();
        onReorder(fromIdx, toIdx);
      }, 230);
    } else {
      if (draggedCard) {
        draggedCard.style.transition = 'transform 0.2s ease';
        draggedCard.style.transform = 'translateY(0px) scale(1)';
      }
      setTimeout(() => {
        cleanup();
      }, 210);
    }
  };

  // Touch Events (Mobile)
  container.addEventListener('touchstart', (e) => {
    const card = e.target.closest('.forty-exercise-card');
    if (!card) return;
    if (e.target.closest('input, button, a, label, .forty-sets, .forty-card-actions, .forty-tracker-actions')) return;

    const touch = e.touches[0];
    startX = touch.clientX;
    startY = touch.clientY;

    pressTimer = setTimeout(() => {
      startDrag(card, touch.clientX, touch.clientY);
    }, 280);
  }, { passive: true });

  container.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    if (!isDragging) {
      if (pressTimer) {
        const dx = Math.abs(touch.clientX - startX);
        const dy = Math.abs(touch.clientY - startY);
        if (dx > 8 || dy > 8) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
      }
      return;
    }

    if (e.cancelable) e.preventDefault();
    updateDragPosition(touch.clientY);
  }, { passive: false });

  container.addEventListener('touchend', endDrag);
  container.addEventListener('touchcancel', cleanup);

  // Mouse / Pointer Events (Desktop)
  container.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    const card = e.target.closest('.forty-exercise-card');
    if (!card) return;
    if (e.target.closest('input, button, a, label, .forty-sets, .forty-card-actions, .forty-tracker-actions')) return;

    startX = e.clientX;
    startY = e.clientY;

    pressTimer = setTimeout(() => {
      startDrag(card, e.clientX, e.clientY);
    }, 280);

    const onMouseMove = (me) => {
      if (!isDragging) {
        if (pressTimer) {
          const dx = Math.abs(me.clientX - startX);
          const dy = Math.abs(me.clientY - startY);
          if (dx > 8 || dy > 8) {
            clearTimeout(pressTimer);
            pressTimer = null;
          }
        }
        return;
      }
      me.preventDefault();
      updateDragPosition(me.clientY);
    };

    const onMouseUp = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      endDrag();
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  });
}

// Drag a Drop Set by its grip onto any working set within the same exercise.
// This is independent from the existing drag-to-reorder exercise cards.
function bindDropRoundDrag(container, onMove) {
  let active = null;
  const cleanup = () => {
    if (!active) return;
    active.row.classList.remove('is-dragging-drop');
    active.targets.forEach(target => target.classList.remove('is-drop-target'));
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerCancel);
    active = null;
  };
  const onPointerMove = event => {
    if (!active || event.pointerId !== active.pointerId) return;
    const { targets } = active;
    const distance = Math.abs(event.clientY - active.startY) + Math.abs(event.clientX - active.startX);
    if (distance < 6 && !active.dragged) return;
    active.dragged = true;
    if (event.cancelable) event.preventDefault();
    let nearest = targets[0];
    let min = Infinity;
    for (const row of targets) {
      const rect = row.getBoundingClientRect();
      const d = Math.abs(event.clientY - (rect.top + rect.bottom) / 2);
      if (d < min) { nearest = row; min = d; }
    }
    active.nextParent = Number(nearest.dataset.workingSet);
    targets.forEach(row => row.classList.toggle('is-drop-target', row === nearest));
    active.row.classList.add('is-dragging-drop');
  };
  const onPointerUp = event => {
    if (!active || event.pointerId !== active.pointerId) return;
    const { dragged, nextParent, originalParent, exerciseIndex, dropIndex } = active;
    cleanup();
    if (dragged && nextParent !== originalParent) onMove(exerciseIndex, dropIndex, nextParent);
  };
  const onPointerCancel = event => {
    if (active && event.pointerId === active.pointerId) cleanup();
  };
  const onPointerDown = event => {
    const handle = event.target.closest?.('.forty-drop-drag-handle');
    if (!handle || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const row = handle.closest('.forty-linked-set-row.is-drop');
    const card = handle.closest('.forty-exercise-card');
    if (!row || !card) return;
    const targets = Array.from(card.querySelectorAll('.forty-set-row[data-working-set]'));
    if (!targets.length) return;
    event.preventDefault();
    active = {
      pointerId: event.pointerId, row, targets,
      startX: event.clientX, startY: event.clientY, dragged: false,
      exerciseIndex: Number(row.dataset.exerciseIndex),
      dropIndex: Number(row.dataset.dropIndex),
      originalParent: Number(row.dataset.parentSet),
      nextParent: Number(row.dataset.parentSet)
    };
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerCancel);
  };
  container.addEventListener('pointerdown', onPointerDown);
  return () => { cleanup(); container.removeEventListener('pointerdown', onPointerDown); };
}

export function bindFortyDayWorkoutEvents() {
  const root = document.getElementById('forty-workout-root');
  if (!root) return;
  const dayContent = document.getElementById('forty-day-content');
  const detailModal = document.getElementById('forty-detail-modal');
  const detailSheet = document.getElementById('forty-detail-sheet');
  const imageModal = document.getElementById('forty-image-modal');
  const summaryModal = document.getElementById('forty-summary-modal');
  const libraryModal = document.getElementById('forty-library-modal');
  const librarySheet = document.getElementById('forty-library-sheet');
  const manageModal = document.getElementById('forty-manage-modal');
  const manageSheet = document.getElementById('forty-manage-sheet');

  let activePlan = fortyDayWorkoutService.getActivePlan();
  let days = fortyDayWorkoutService.getDays(activePlan);
  let activeDay = fortyDayWorkoutService.getSnapshot().activeDay;
  if (!days.some(d => d.key === activeDay)) {
    activeDay = days[0].key;
    fortyDayWorkoutService.setActiveDay(activeDay);
  }
  let latestSummary = null;
  let currentLibGroup = null;
  let currentLibSearch = '';
  let pendingSwitchContext = null;
  let imageRequestId = 0;
  let imagePreloadObserver = null;

  const openModal = modal => { modal?.classList.add('is-open'); modal?.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const closeModals = () => {
    imageRequestId += 1;
    root.querySelectorAll('.forty-modal,.workout-summary-modal').forEach(modal => {
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
    });
    document.body.style.overflow = '';
  };

  const updateLibraryView = (groupKey = currentLibGroup, search = currentLibSearch) => {
    currentLibGroup = groupKey;
    currentLibSearch = search;
    if (librarySheet) {
      librarySheet.innerHTML = renderLibrarySheet(groupKey, search, pendingSwitchContext);
      const searchInput = librarySheet.querySelector('#lib-search-input');
      if (searchInput && search) {
        searchInput.focus();
        searchInput.selectionStart = searchInput.selectionEnd = searchInput.value.length;
      }
    }
  };

  const prepareVisibleExerciseImages = () => {
    imagePreloadObserver?.disconnect();
    imagePreloadObserver = null;
    const buttons = Array.from(root.querySelectorAll('.forty-image-btn[data-image-url]'));
    const warmButtonImage = button => warmExerciseImage(button.dataset.imageUrl, 'low');

    if (typeof IntersectionObserver === 'undefined') {
      buttons.slice(0, 2).forEach(warmButtonImage);
      return;
    }

    imagePreloadObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        warmButtonImage(entry.target);
        imagePreloadObserver?.unobserve(entry.target);
      });
    }, { rootMargin: '500px 0px' });
    buttons.forEach(button => imagePreloadObserver.observe(button));
  };

  const showExerciseImage = async exercise => {
    const preview = root.querySelector('#forty-image-preview');
    const titleEl = root.querySelector('#forty-image-title');
    const stage = root.querySelector('#forty-image-stage');
    const status = root.querySelector('#forty-image-status');
    if (!preview || !stage) return;

    const requestId = ++imageRequestId;
    const candidates = [...new Set([exercise?.image, exercise?.pageImage].filter(Boolean))];
    preview.removeAttribute('src');
    preview.alt = exercise?.title || 'صورة التمرين';
    stage.classList.remove('is-ready', 'is-error');
    stage.classList.add('is-loading');
    if (titleEl) titleEl.textContent = exercise?.title || '';
    if (status) status.textContent = 'جاري تحميل صورة التمرين…';
    openModal(imageModal);

    for (const url of candidates) {
      const loaded = await warmExerciseImage(url, 'high');
      if (requestId !== imageRequestId) return;
      if (!loaded) continue;

      preview.src = url;
      stage.classList.remove('is-loading', 'is-error');
      stage.classList.add('is-ready');
      return;
    }

    if (requestId !== imageRequestId) return;
    stage.classList.remove('is-loading', 'is-ready');
    stage.classList.add('is-error');
    if (status) status.textContent = 'تعذّر تحميل الصورة. حاول مرة أخرى.';
  };

  const updateSessionUI = () => {
    const snapshot = fortyDayWorkoutService.getSnapshot();
    const sessionDay = snapshot.session
      ? fortyDayWorkoutService.getDay(snapshot.session.dayKey)
      : null;
    const start = root.querySelector('#forty-start-btn');
    const status = root.querySelector('#forty-session-status');
    const finish = root.querySelector('#forty-finish-btn');

    if (start) {
      start.disabled = Boolean(snapshot.session);
      start.classList.toggle('is-running', Boolean(snapshot.session));
      start.textContent = snapshot.session
        ? 'التمرين قيد التشغيل'
        : 'ابدأ التمرين · Start Workout';
    }
    if (status) {
      status.textContent = snapshot.session
        ? `جلسة ${sessionDay?.short || ''} قيد التشغيل`
        : 'جاهز لبدء التمرين';
    }
    if (finish) finish.disabled = !(snapshot.session && hasCompletedSet(snapshot));
  };

  const updateTimers = () => {
    const snapshot = fortyDayWorkoutService.getSnapshot();
    const timer = root.querySelector('#forty-session-timer');
    const restBar = root.querySelector('#forty-rest-bar');
    const restTimer = root.querySelector('#forty-rest-timer');
    const restProgress = root.querySelector('#forty-rest-progress');
    const remaining = snapshot.restUntil
      ? Math.max(0, Math.ceil((snapshot.restUntil - Date.now()) / 1000))
      : 0;

    if (timer) {
      timer.textContent = snapshot.session
        ? formatDuration((Date.now() - snapshot.session.startedAt) / 1000)
        : '00:00:00';
    }
    if (!remaining && snapshot.restUntil) fortyDayWorkoutService.skipRest();
    if (restBar) restBar.hidden = remaining <= 0;
    if (restTimer) restTimer.textContent = formatRest(remaining);
    if (restProgress) {
      restProgress.style.width = `${snapshot.restDuration
        ? Math.min(100, (remaining / snapshot.restDuration) * 100)
        : 0}%`;
    }
  };

  const resetPlanDefaultBtn = document.getElementById('reset-plan-default-btn');
  if (resetPlanDefaultBtn) {
    resetPlanDefaultBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (manageSheet) {
        manageSheet.innerHTML = renderResetPlanConfirmSheet(activeDay, activePlan);
      }
      openModal(manageModal);
    });
  }

  const openLibraryBtn = document.getElementById('open-exercise-library-btn');
  if (openLibraryBtn) {
    openLibraryBtn.addEventListener('click', (e) => {
      e.preventDefault();
      pendingSwitchContext = null;
      currentLibGroup = null;
      currentLibSearch = '';
      updateLibraryView(null, '');
      openModal(libraryModal);
    });
  }

  const renderActiveDay = () => {
    if (dayContent) dayContent.innerHTML = renderDay(activeDay);
    root.querySelectorAll('[data-day]').forEach(button => button.classList.toggle('is-active', button.dataset.day === activeDay));
    updateSessionUI();
    prepareVisibleExerciseImages();
  };

  const stopDropDrag = dayContent ? bindDropRoundDrag(dayContent, (exerciseIndex, dropIndex, parentSetIndex) => {
    if (fortyDayWorkoutService.moveDropRound(activeDay, exerciseIndex, dropIndex, parentSetIndex)) {
      renderActiveDay();
      notificationService.showToast(`تم نقل Drop Set تحت الجولة ${parentSetIndex + 1} ✓`, 'success');
    }
  }) : () => {};
  if (dayContent) {
    initDragAndReorder(dayContent, (fromIndex, toIndex) => {
      fortyDayWorkoutService.reorderDayExercises(activeDay, fromIndex, toIndex);
      renderActiveDay();
      notificationService.showToast('تم تغيير ترتيب التمرين بنجاح ✓', 'success');
    });
  }

  renderActiveDay();
  updateTimers();
  const timerInterval = window.setInterval(updateTimers, 1000);
  setTimeout(() => window.dismissNeonSplash?.(), 80);

  root.addEventListener('input', event => {
    const input = event.target.closest('input[data-field]');
    if (!input) return;
    fortyDayWorkoutService.updateSet(
      activeDay,
      Number(input.dataset.index),
      Number(input.dataset.set),
      input.dataset.field,
      input.value
    );
    updateSessionUI();
  });
  root.addEventListener('input', event => {
    const input = event.target.closest('input[data-linked-field]');
    if (!input) return;
    fortyDayWorkoutService.updateLinkedSet(
      activeDay, Number(input.dataset.index), input.dataset.linkedKind,
      Number(input.dataset.set), input.dataset.linkedField, input.value
    );
  });

  const onImageIntent = event => {
    const button = event.target.closest?.('.forty-image-btn[data-image-url]');
    if (button) warmExerciseImage(button.dataset.imageUrl, 'high');
  };
  root.addEventListener('pointerover', onImageIntent, { passive: true });
  root.addEventListener('pointerdown', onImageIntent, { passive: true });
  root.addEventListener('focusin', onImageIntent);

  root.addEventListener('click', async event => {
    // 1. النقر على كارت عضلة في مكتبة التمارين
    const muscleCard = event.target.closest('[data-lib-group]');
    if (muscleCard) {
      const groupKey = muscleCard.dataset.libGroup;
      updateLibraryView(groupKey, '');
      return;
    }

    // 2. زر العودة لكافة مجموعات العضلات
    if (event.target.closest('[data-lib-action="back-to-groups"]')) {
      updateLibraryView(null, '');
      return;
    }

    // زر إلغاء التبديل
    if (event.target.closest('[data-lib-action="cancel-switch"]')) {
      pendingSwitchContext = null;
      updateLibraryView();
      return;
    }

    // 3. زر إضافة أو استبدال تمرين من المكتبة إلى خطة تمرين اليوم
    const addLibBtn = event.target.closest('[data-lib-add-id]');
    if (addLibBtn) {
      const exId = addLibBtn.dataset.libAddId;
      const exercise = ALL_LIBRARY_EXERCISES.find(e => e.id === exId);
      if (exercise) {
        if (pendingSwitchContext?.mode === 'superset') {
          const ok = fortyDayWorkoutService.configureSuperset(activeDay, pendingSwitchContext.targetIndex, exercise);
          if (!ok) {
            notificationService.showToast('اختر تمرينًا مختلفًا عن التمرين الأساسي.', 'warning');
            return;
          }
          pendingSwitchContext = null;
          closeModals();
          renderActiveDay();
          notificationService.showToast(`تم ربط Super Set مع "${exercise.nameAr}" ✓`, 'success');
        } else if (pendingSwitchContext && pendingSwitchContext.targetIndex >= 0) {
          fortyDayWorkoutService.replaceExerciseInDay(activeDay, pendingSwitchContext.targetIndex, exercise);
          const replacedName = exercise.nameAr || exercise.title;
          pendingSwitchContext = null;
          closeModals();
          renderActiveDay();
          notificationService.showToast(`تم استبدال التمرين بـ "${replacedName}" بنجاح ✓`, 'success');
        } else {
          fortyDayWorkoutService.addExerciseToDay(activeDay, exercise);
          addLibBtn.textContent = '✓ تمّت الإضافة';
          addLibBtn.style.background = '#22c55e';
          addLibBtn.style.borderColor = '#22c55e';
          addLibBtn.disabled = true;
          renderActiveDay();
          notificationService.showToast(`تمت إضافة "${exercise.nameAr}" إلى تمارين اليوم بنجاح `, 'success');
        }
      }
      return;
    }

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
      pendingSwitchContext = null;
      closeModals();
      return;
    }

    // تبديل الخطة بين نظام الحسم، نظام أنس، PPL، والخطة المقترحة مباشرة من شاشة التمرين
    if (button.dataset.action === 'switch-plan') {
      const targetPlan = button.dataset.plan;
      if (targetPlan === activePlan) return;
      const targetProgram = fortyDayWorkoutService.getProgram(targetPlan);
      const targetDays = fortyDayWorkoutService.getDays(targetPlan).filter(day => day.exercises?.length).length;
      const confirmed = window.confirm(`تغيير نظام التدريب إلى ${targetProgram.title}\n\n${targetProgram.description}\nعدد أيام/مجموعات التدريب: ${targetDays}\n\nلن تُحذف سجلاتك أو أوزانك السابقة، لكن النظام النشط سيتغير الآن. هل تريد المتابعة؟`);
      if (!confirmed) return;
      fortyDayWorkoutService.setActivePlan(targetPlan);
      root.outerHTML = renderFortyDayWorkoutView();
      bindFortyDayWorkoutEvents();
      const planName = fortyDayWorkoutService.getProgram(targetPlan).title;
      notificationService.showToast(`تم التبديل إلى ${planName} بنجاح`, 'info');
      return;
    }

    // زر إنشاء وتخصيص الخطة المقترحة
    if (button.dataset.action === 'create-personalized-plan') {
      openPersonalizedPlanCreatorModal();
      return;
    }

    // تأكيد استعادة الخطة الافتراضية (Reset Plan / Day to Default)
    const resetScopeBtn = event.target.closest('[data-confirm-reset-scope]');
    if (resetScopeBtn) {
      const scope = resetScopeBtn.dataset.confirmResetScope;
      if (scope === 'plan') {
        fortyDayWorkoutService.resetPlanToDefault(activePlan);
        closeModals();
        renderActiveDay();
        notificationService.showToast('تمت استعادة كامل الخطة الافتراضية الأصلية بنجاح ✓', 'success');
      } else {
        fortyDayWorkoutService.resetDayToDefault(activeDay);
        closeModals();
        renderActiveDay();
        notificationService.showToast('تمت استعادة تمارين اليوم الافتراضية بنجاح ✓', 'success');
      }
      return;
    }

    // إجراءات نافذة إدارة التمرين (Manage Exercise Actions)
    if (button.dataset.action === 'manage') {
      const idx = Number(button.dataset.index);
      if (manageSheet) {
        manageSheet.innerHTML = renderManageExerciseSheet(activeDay, idx);
      }
      openModal(manageModal);
      return;
    }
    if (button.dataset.manageAction === 'superset') {
      const idx = Number(button.dataset.index);
      const exercise = fortyDayWorkoutService.getDay(activeDay)?.exercises?.[idx];
      if (!exercise) return;
      pendingSwitchContext = { mode: 'superset', targetIndex: idx, sourceExercise: exercise };
      closeModals();
      updateLibraryView(null, '');
      openModal(libraryModal);
      return;
    }
    if (button.dataset.manageAction === 'remove-superset') {
      fortyDayWorkoutService.removeSuperset(activeDay, Number(button.dataset.index));
      closeModals();
      renderActiveDay();
      notificationService.showToast('تم فك ربط Super Set دون حذف السجل السابق.', 'info');
      return;
    }
    if (button.dataset.manageAction === 'drop-set') {
      const idx = Number(button.dataset.index);
      const tracker = fortyDayWorkoutService.getTracker(activeDay, idx);
      if (tracker?.dropSets?.length) fortyDayWorkoutService.addDropRound(activeDay, idx);
      else fortyDayWorkoutService.enableDropSet(activeDay, idx);
      closeModals();
      renderActiveDay();
      notificationService.showToast('تمت إضافة جولة Drop Set للتمرين.', 'success');
      return;
    }
    if (button.dataset.manageAction === 'remove-drop') {
      fortyDayWorkoutService.removeDropSet(activeDay, Number(button.dataset.index));
      closeModals();
      renderActiveDay();
      notificationService.showToast('تمت إزالة جولات Drop Set الحالية.', 'info');
      return;
    }
    if (button.dataset.manageAction === 'reset') {
      const idx = Number(button.dataset.index);
      fortyDayWorkoutService.resetExercise(activeDay, idx);
      closeModals();
      renderActiveDay();
      notificationService.showToast('تمت إعادة ضبط التمرين بنجاح ✓', 'success');
      return;
    }
    if (button.dataset.manageAction === 'switch') {
      const idx = Number(button.dataset.index);
      const day = fortyDayWorkoutService.getDay(activeDay);
      const exercise = day?.exercises?.[idx];
      if (exercise) {
        pendingSwitchContext = {
          targetIndex: idx,
          sourceExercise: exercise
        };
        const targetGroup = detectExerciseMuscleGroup(exercise, activeDay);
        closeModals();
        currentLibGroup = targetGroup;
        currentLibSearch = '';
        updateLibraryView(targetGroup, '');
        openModal(libraryModal);
      }
      return;
    }
    if (button.dataset.manageAction === 'delete') {
      const idx = Number(button.dataset.index);
      if (manageSheet) {
        manageSheet.innerHTML = renderDeleteConfirmSheet(activeDay, idx);
      }
      return;
    }
    if (button.dataset.manageAction === 'back-to-manage') {
      const idx = Number(button.dataset.index);
      if (manageSheet) {
        manageSheet.innerHTML = renderManageExerciseSheet(activeDay, idx);
      }
      return;
    }
    if (button.hasAttribute('data-confirm-delete-index')) {
      const idx = Number(button.dataset.confirmDeleteIndex);
      fortyDayWorkoutService.deleteExerciseFromDay(activeDay, idx);
      closeModals();
      renderActiveDay();
      notificationService.showToast('تم حذف التمرين من خطة اليوم بنجاح', 'info');
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
    if (button.dataset.action === 'quick-move-up') {
      const curIndex = Number(button.dataset.index);
      if (curIndex > 0) {
        fortyDayWorkoutService.reorderDayExercises(activeDay, curIndex, curIndex - 1);
        renderActiveDay();
        notificationService.showToast('تم تقديم التمرين للأعلى ⬆', 'info');
      }
      return;
    }
    if (button.dataset.action === 'quick-move-down') {
      const curIndex = Number(button.dataset.index);
      const curDay = fortyDayWorkoutService.getDay(activeDay);
      if (curDay?.exercises && curIndex < curDay.exercises.length - 1) {
        fortyDayWorkoutService.reorderDayExercises(activeDay, curIndex, curIndex + 1);
        renderActiveDay();
        notificationService.showToast('تم تأخير التمرين للأسفل ⬇', 'info');
      }
      return;
    }
    if (button.dataset.action === 'toggle-linked') {
      const kind = button.dataset.kind;
      const result = fortyDayWorkoutService.toggleLinkedSet(activeDay, index, kind, Number(button.dataset.set));
      if (result === null) {
        notificationService.showToast('أدخل عدد العدّات أولًا لحفظ الجولة.', 'warning');
        return;
      }
      renderActiveDay();
      updateTimers();
      notificationService.showToast(result ? `تم حفظ جولة ${kind === 'drop' ? 'Drop Set' : 'Super Set'} في History ✓` : 'تم إلغاء تسجيل الجولة.', 'success');
      return;
    }
    if (button.dataset.action === 'add-drop-to-set') {
      const added = fortyDayWorkoutService.addDropRound(activeDay, index, Number(button.dataset.set));
      if (!added) {
        notificationService.showToast('الحد الأقصى 12 جولة Drop Set لكل تمرين.', 'warning');
        return;
      }
      renderActiveDay();
      return;
    }
    if (button.dataset.action === 'move-drop') {
      const tracker = fortyDayWorkoutService.getTracker(activeDay, index);
      const dropIndex = Number(button.dataset.set);
      const target = (tracker?.dropSets?.[dropIndex]?.parentSetIndex ?? -1) + Number(button.dataset.delta);
      if (fortyDayWorkoutService.moveDropRound(activeDay, index, dropIndex, target)) {
        renderActiveDay();
      }
      return;
    }
    if (button.dataset.action === 'add-drop-round') {
      fortyDayWorkoutService.addDropRound(activeDay, index);
      renderActiveDay();
      return;
    }
    if (button.dataset.action === 'toggle-set') {
      const completed = fortyDayWorkoutService.toggleSet(activeDay, index, Number(button.dataset.set));
      if (completed === null) {
        notificationService.showToast('أدخل عدد التكرارات أولاً لحفظ الجولة في History.', 'warning');
        return;
      }
      renderActiveDay();
      updateTimers();
      notificationService.showToast(completed ? 'تم حفظ الجولة في History مباشرة ✓' : 'تم إلغاء تسجيل الجولة من History', 'success');
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
      showExerciseImage(exercise);
      return;
    }
    if (button.dataset.action === 'history') {
      detailSheet.className = 'forty-modal-sheet history-sheet';
      detailSheet.innerHTML = renderHistoryModal(activeDay, index);
      bindHistoryHover(detailSheet, activeDay, index, 'ALL');
      openModal(detailModal);
      return;
    }
    if (button.dataset.action === 'history-range') {
      const range = button.dataset.range || 'ALL';
      detailSheet.className = 'forty-modal-sheet history-sheet';
      detailSheet.innerHTML = renderHistoryModal(activeDay, index, range);
      bindHistoryHover(detailSheet, activeDay, index, range);
      return;
    }
    if (button.dataset.action === 'tune') {
      detailSheet.className = 'forty-modal-sheet tune-sheet';
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
    stopDropDrag();
    imageRequestId += 1;
    imagePreloadObserver?.disconnect();
    document.removeEventListener('keydown', onKeyDown);
    window.removeEventListener('scroll', onScroll);
    root.removeEventListener('pointerover', onImageIntent);
    root.removeEventListener('pointerdown', onImageIntent);
    root.removeEventListener('focusin', onImageIntent);
    document.body.style.overflow = '';
    document.body.style.userSelect = '';
  };
}

export function openPersonalizedPlanCreatorModal() {
  document.getElementById('personalized-plan-creator-modal')?.remove();
  const profile = store.getState()?.userProfile || {};
  const activeVersion = fortyDayWorkoutService.getActivePlanVersion('personalized');

  let mode = 'builder'; // 'builder' | 'library'
  let targetDayIndex = 0;
  let libSelectedGroup = 'all';
  let libSearchQuery = '';

  // تهيئة الأيام المخصصة: إما من النسخة النشطة السابقة أو جدول افتراضي
  let customDays = [];
  if (activeVersion?.days?.length) {
    customDays = activeVersion.days.map((d, i) => ({
      key: d.key || `pers_day_${i + 1}`,
      name: d.label || d.short || `اليوم ${i + 1}`,
      exercises: Array.isArray(d.exercises) ? d.exercises.map((ex, eIdx) => ({
        id: ex.id || `pers_ex_${i + 1}_${eIdx}`,
        title: ex.title || ex.nameAr,
        nameAr: ex.nameAr || ex.title,
        nameEn: ex.nameEn || '',
        sets: ex.sets || 3,
        reps: ex.reps || '8-12',
        restSeconds: ex.restSeconds || ex.rest || 90,
        rir: ex.rir || 2,
        image: ex.image || '',
        groupKey: ex.groupKey || 'chest',
        equipment: ex.equipment || 'gym'
      })) : []
    }));
  } else {
    customDays = [
      { key: 'pers_day_1', name: 'اليوم الأول: صدر وتراي', exercises: [] },
      { key: 'pers_day_2', name: 'اليوم الثاني: ظهر وباي', exercises: [] },
      { key: 'pers_day_3', name: 'اليوم الثالث: أرجل وأكتاف', exercises: [] }
    ];
  }

  const modal = document.createElement('div');
  modal.id = 'personalized-plan-creator-modal';
  modal.className = 'personalized-plan-creator-overlay';

  const renderContent = () => {
    const totalExercisesCount = customDays.reduce((acc, d) => acc + d.exercises.length, 0);

    // 1. وضع استعراض مكتبة التمارين لاختيار التمارين وإضافتها لليوم المحدد
    if (mode === 'library') {
      const targetDay = customDays[targetDayIndex] || customDays[0];

      let filteredExercises = ALL_LIBRARY_EXERCISES;
      if (libSelectedGroup !== 'all') {
        filteredExercises = filteredExercises.filter(e => e.groupKey === libSelectedGroup);
      }
      if (libSearchQuery.trim()) {
        const q = libSearchQuery.trim().toLowerCase();
        filteredExercises = filteredExercises.filter(e =>
          (e.nameAr || '').toLowerCase().includes(q) ||
          (e.nameEn || '').toLowerCase().includes(q) ||
          (e.title || '').toLowerCase().includes(q)
        );
      }

      return `
        <section role="dialog" aria-modal="true" aria-labelledby="creator-lib-title" class="creator-modal-dialog">
          
          <!-- Library Header -->
          <div class="creator-modal-header" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
            <button type="button" id="btn-back-to-builder" class="btn btn-sm btn-ghost" style="border-radius:10px;border:1px solid rgba(85,247,165,0.3);color:#55F7A5;padding:6px 12px;font-weight:700;font-size:0.8rem;cursor:pointer;white-space:nowrap;flex-shrink:0;">
              ← العودة للجدول
            </button>
            <div style="text-align:left;min-width:0;">
              <h3 id="creator-lib-title" style="color:#fff;margin:0;font-size:1.05rem;font-weight:800;white-space:nowrap;">مكتبة التمارين 📚</h3>
              <span style="color:#9BA9A2;font-size:0.72rem;">اختر تمارينك</span>
            </div>
          </div>

          <!-- وجهة الإضافة (شريط كامل وواضح) -->
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(85,247,165,0.08);border:1px solid rgba(85,247,165,0.25);border-radius:12px;padding:8px 12px;margin-bottom:10px;flex-shrink:0;box-sizing:border-box;">
            <label for="lib-picker-day-select" style="font-size:0.78rem;color:#55F7A5;font-weight:800;white-space:nowrap;flex-shrink:0;">🎯 إضافة التمارين إلى:</label>
            <select id="lib-picker-day-select" style="flex:1;min-width:0;padding:6px 10px;border-radius:8px;background:#030806;border:1px solid #55F7A5;color:#55F7A5;font-weight:700;font-size:0.82rem;cursor:pointer;text-overflow:ellipsis;">
              ${customDays.map((d, i) => `
                <option value="${i}" ${i === targetDayIndex ? 'selected' : ''}>
                  اليوم ${i + 1}: ${escapeHtml(d.name || `يوم ${i + 1}`)} (${d.exercises.length} تمارين)
                </option>
              `).join('')}
            </select>
          </div>

          <!-- شريط البحث -->
          <div style="margin-bottom:10px;flex-shrink:0;">
            <input type="text" id="lib-picker-search-input" value="${escapeHtml(libSearchQuery)}" placeholder="ابحث بالاسم (بنش، سكوات، ديدليفت)..." style="width:100%;padding:10px 14px;border-radius:12px;background:rgba(0,0,0,0.5);border:1px solid rgba(85,247,165,0.3);color:#fff;font-size:0.86rem;box-sizing:border-box;">
          </div>

          <!-- فلتر المجموعات العضلية -->
          <div class="creator-lib-chips">
            <button type="button" class="btn btn-xs creator-lib-chip-btn ${libSelectedGroup === 'all' ? 'btn-primary' : 'btn-ghost'}" data-lib-cat="all" style="border-radius:999px;padding:6px 14px;font-weight:700;border:1px solid ${libSelectedGroup === 'all' ? 'var(--neon-accent)' : 'rgba(255,255,255,0.15)'};">
              الكل (${ALL_LIBRARY_EXERCISES.length})
            </button>
            ${EXERCISE_GROUPS.map(g => `
              <button type="button" class="btn btn-xs creator-lib-chip-btn ${libSelectedGroup === g.key ? 'btn-primary' : 'btn-ghost'}" data-lib-cat="${g.key}" style="border-radius:999px;padding:6px 14px;font-weight:700;border:1px solid ${libSelectedGroup === g.key ? 'var(--neon-accent)' : 'rgba(255,255,255,0.15)'};">
                ${escapeHtml(g.nameAr)} (${g.count})
              </button>
            `).join('')}
          </div>

          <!-- قائمة التمارين المتاحة (تمرير سلس) -->
          <div id="creator-lib-exercises-list" class="creator-scroll-body" style="display:flex;flex-direction:column;gap:8px;">
            ${filteredExercises.length === 0 ? `
              <div style="text-align:center;padding:30px 10px;color:#8E9B94;font-size:0.88rem;">
                لا توجد نتائج مطابقة لبحثك. جرب اسم عضلة أو تمرين آخر.
              </div>
            ` : filteredExercises.map(ex => {
              const isAdded = targetDay.exercises.some(e => e.nameAr === ex.nameAr || e.title === ex.title || (ex.id && e.id === ex.id));
              return `
                <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;background:rgba(0,0,0,0.35);border:1px solid ${isAdded ? 'rgba(34,197,94,0.35)' : 'rgba(85,247,165,0.14)'};border-radius:14px;padding:8px 12px;box-sizing:border-box;">
                  <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                    <img src="${escapeHtml(ex.image)}" alt="" style="width:48px;height:48px;border-radius:10px;object-fit:cover;background:#000;flex-shrink:0;border:1px solid rgba(85,247,165,0.2);" loading="lazy">
                    <div style="min-width:0;flex:1;">
                      <div style="font-size:0.88rem;font-weight:800;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(ex.nameAr)}</div>
                      <div style="font-size:0.72rem;color:#8E9B94;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(ex.nameEn || '')} · ${escapeHtml(ex.equipment || 'جيم')} · ${ex.sets}×${ex.reps}</div>
                    </div>
                  </div>
                  <button type="button" class="btn btn-sm btn-lib-toggle-add ${isAdded ? 'is-added' : 'btn-primary'}" data-ex-id="${ex.id}" style="border-radius:10px;font-weight:800;font-size:0.78rem;padding:7px 12px;white-space:nowrap;cursor:pointer;flex-shrink:0;${isAdded ? 'background:rgba(34,197,94,0.18) !important;color:#22c55e !important;border:1px solid #22c55e !important;' : ''}">
                    ${isAdded ? '✓ مضاف' : '＋ إضافة'}
                  </button>
                </div>
              `;
            }).join('')}
          </div>

          <!-- زر العودة للجدول (مثبت دائماً بالأسفل) -->
          <div class="creator-modal-footer">
            <button type="button" id="btn-finish-lib-selection" class="btn btn-primary btn-block" style="border-radius:14px;font-weight:800;padding:12px;font-size:0.95rem;cursor:pointer;">
              تم · العودة لمراجعة الخطة (${totalExercisesCount} تمارين إجمالاً)
            </button>
          </div>
        </section>
      `;
    }

    // 2. وضع محرر الأيام والتمارين الرئيسي (Builder Mode)
    return `
      <section role="dialog" aria-modal="true" aria-labelledby="creator-modal-title" class="creator-modal-dialog">
        
        <!-- Header -->
        <div class="creator-modal-header" style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
          <div style="min-width:0;flex:1;">
            <span style="color:#55F7A5;font-size:0.75rem;font-weight:800;letter-spacing:0.5px;">تخصيص الخطة · NEON PLAN BUILDER</span>
            <h2 id="creator-modal-title" style="color:#fff;margin:2px 0 4px;font-size:1.15rem;font-weight:800;">إنشاء وتخصيص الخطة التدريبية ✨</h2>
            <p style="color:#9BA9A2;margin:0;font-size:0.78rem;line-height:1.4;">أضف أيام تمرينك، سمّ كل يوم بحرية، وأضف التمارين من المكتبة.</p>
          </div>
          <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <button type="button" id="btn-quick-smart-template" class="btn btn-sm btn-ghost" style="border:1px solid rgba(85,247,165,0.3);color:#55F7A5;border-radius:10px;font-size:0.74rem;padding:5px 10px;cursor:pointer;white-space:nowrap;" title="توليد مسودة ذكية مقترحة لتعديلها مباشرة">
              ⚡ اقتراح ذكي
            </button>
            <button type="button" id="close-creator-modal-btn" aria-label="إغلاق" style="background:transparent;border:0;color:#fff;font-size:1.8rem;cursor:pointer;line-height:1;padding:0 4px;">×</button>
          </div>
        </div>

        <!-- قائمة الأيام (تمرير سلس) -->
        <div class="creator-scroll-body">
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px;">
            ${customDays.map((day, dIdx) => `
              <div class="creator-day-card" data-day-card-index="${dIdx}">
                
                <!-- ترويسة اليوم: التسمية والرقم -->
                <div class="creator-day-title-row">
                  <span style="flex-shrink:0;background:#55F7A5;color:#030806;font-weight:800;font-size:0.78rem;padding:6px 10px;border-radius:8px;white-space:nowrap;">
                    اليوم ${dIdx + 1}
                  </span>
                  <input type="text" class="creator-day-name-input" data-day-index="${dIdx}" value="${escapeHtml(day.name)}" placeholder="اسم اليوم (مثال: صدر وتراي)..." style="flex:1;min-width:0;width:100%;padding:8px 12px;background:rgba(0,0,0,0.55);border:1px solid rgba(85,247,165,0.3);border-radius:10px;color:#FFFFFF;font-size:0.86rem;font-weight:700;box-sizing:border-box;">
                </div>

                <!-- سطر معلومات اليوم: عدد التمارين وزر الحذف -->
                <div class="creator-day-meta-row">
                  <span style="font-size:0.76rem;color:#55F7A5;background:rgba(85,247,165,0.1);border:1px solid rgba(85,247,165,0.25);border-radius:999px;padding:3px 10px;font-weight:700;">
                    ${day.exercises.length} تمارين
                  </span>
                  ${customDays.length > 1 ? `
                    <button type="button" class="btn-delete-day" data-day-index="${dIdx}" title="حذف هذا اليوم" style="background:rgba(239,68,68,0.12);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:8px;padding:4px 10px;cursor:pointer;font-size:0.76rem;font-weight:700;">
                      🗑️ حذف اليوم
                    </button>
                  ` : ''}
                </div>

                <!-- تمارين هذا اليوم -->
                <div class="day-exercises-container" style="display:flex;flex-direction:column;gap:8px;margin-bottom:10px;">
                  ${day.exercises.length === 0 ? `
                    <div style="text-align:center;padding:14px 10px;background:rgba(0,0,0,0.25);border:1px dashed rgba(85,247,165,0.2);border-radius:12px;color:#8E9B94;font-size:0.8rem;">
                      لا توجد تمارين بعد لهذا اليوم. اضغط أدناه لإضافة تمارين من المكتبة.
                    </div>
                  ` : day.exercises.map((ex, eIdx) => `
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;background:rgba(0,0,0,0.45);border:1px solid rgba(85,247,165,0.14);border-radius:12px;padding:8px 10px;box-sizing:border-box;">
                      <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
                        ${ex.image ? `<img src="${escapeHtml(ex.image)}" alt="" style="width:40px;height:40px;border-radius:8px;object-fit:cover;background:#000;flex-shrink:0;border:1px solid rgba(85,247,165,0.2);" loading="lazy">` : ''}
                        <div style="min-width:0;flex:1;">
                          <div style="font-size:0.86rem;font-weight:700;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            ${escapeHtml(ex.nameAr || ex.title)}
                          </div>
                          <div style="font-size:0.72rem;color:#8E9B94;display:flex;align-items:center;gap:6px;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                            <span>${ex.sets || 3} جولات × ${ex.reps || '8-12'}</span>
                            ${ex.equipment ? `<span>· ${escapeHtml(ex.equipment)}</span>` : ''}
                          </div>
                        </div>
                      </div>
                      <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                        <button type="button" class="btn-move-ex-up" data-day-index="${dIdx}" data-ex-index="${eIdx}" ${eIdx === 0 ? 'disabled' : ''} style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:6px;padding:4px 8px;font-size:0.72rem;cursor:pointer;opacity:${eIdx === 0 ? '0.25' : '1'};">▲</button>
                        <button type="button" class="btn-move-ex-down" data-day-index="${dIdx}" data-ex-index="${eIdx}" ${eIdx === day.exercises.length - 1 ? 'disabled' : ''} style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.15);color:#fff;border-radius:6px;padding:4px 8px;font-size:0.72rem;cursor:pointer;opacity:${eIdx === day.exercises.length - 1 ? '0.25' : '1'};">▼</button>
                        <button type="button" class="btn-remove-ex" data-day-index="${dIdx}" data-ex-index="${eIdx}" title="إزالة التمرين" style="background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.3);color:#f87171;border-radius:6px;padding:4px 8px;font-size:0.78rem;cursor:pointer;font-weight:700;">✕</button>
                      </div>
                    </div>
                  `).join('')}
                </div>

                <!-- زر إضافة تمارين لهذا اليوم من المكتبة (نص مختصر وأنيق لا يفيض) -->
                <button type="button" class="btn btn-sm btn-open-lib-for-day" data-day-index="${dIdx}" style="width:100%;border-radius:10px;padding:9px;font-weight:700;font-size:0.84rem;border:1px dashed #55F7A5;color:#55F7A5;background:rgba(85,247,165,0.06);cursor:pointer;box-sizing:border-box;">
                  ＋ إضافة تمارين من المكتبة
                </button>
              </div>
            `).join('')}
          </div>

          <!-- زر إضافة يوم جديد -->
          <button type="button" id="btn-creator-add-day" class="btn btn-secondary btn-block" style="border-radius:14px;padding:11px;font-weight:700;font-size:0.88rem;border:1px solid rgba(85,247,165,0.3);margin-bottom:8px;background:rgba(85,247,165,0.08);color:#55F7A5;cursor:pointer;box-sizing:border-box;">
            ＋ إضافة يوم تدريب جديد
          </button>
        </div>

        <!-- شريط الحفظ والاعتماد (مثبت بالأسفل دون تداخل) -->
        <div class="creator-modal-footer">
          <div style="display:flex;justify-content:space-between;align-items:center;width:100%;margin-bottom:8px;font-size:0.84rem;color:#D8E3DE;box-sizing:border-box;">
            <span>عدد الأيام: <strong style="color:#55F7A5;">${customDays.length}</strong></span>
            <span>إجمالي التمارين: <strong style="color:#55F7A5;">${totalExercisesCount}</strong></span>
          </div>
          <button type="button" id="btn-save-creator-plan" class="btn btn-primary btn-block" style="border-radius:14px;font-weight:800;font-size:0.98rem;padding:12px;box-shadow:0 0 25px rgba(85,247,165,0.3);cursor:pointer;box-sizing:border-box;">
            حفظ واعتماد الخطة في شاشة التمرين ✓
          </button>
        </div>
      </section>
    `;
  };

  modal.innerHTML = renderContent();
  document.body.appendChild(modal);

  const rebind = () => {
    modal.innerHTML = renderContent();
    attachListeners();
  };

  const attachListeners = () => {
    modal.querySelector('#close-creator-modal-btn')?.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // أحداث وضع المكتبة (Library Mode)
    if (mode === 'library') {
      modal.querySelector('#btn-back-to-builder')?.addEventListener('click', () => {
        mode = 'builder';
        rebind();
      });

      modal.querySelector('#btn-finish-lib-selection')?.addEventListener('click', () => {
        mode = 'builder';
        rebind();
      });

      // تغيير اليوم المستهدف
      modal.querySelector('#lib-picker-day-select')?.addEventListener('change', (e) => {
        targetDayIndex = Number(e.target.value);
        rebind();
      });

      // البحث
      const searchInput = modal.querySelector('#lib-picker-search-input');
      searchInput?.addEventListener('input', (e) => {
        libSearchQuery = e.target.value;
        const listContainer = modal.querySelector('#creator-lib-exercises-list');
        if (listContainer) {
          rebind();
          // إعادة التركيز على حقل البحث
          const newInput = modal.querySelector('#lib-picker-search-input');
          if (newInput) {
            newInput.focus();
            newInput.selectionStart = newInput.selectionEnd = newInput.value.length;
          }
        }
      });

      // فلتر العضلات
      modal.querySelectorAll('[data-lib-cat]').forEach(btn => {
        btn.addEventListener('click', () => {
          libSelectedGroup = btn.dataset.libCat;
          rebind();
        });
      });

      // إضافة / إلغاء التمرين
      modal.querySelectorAll('.btn-lib-toggle-add').forEach(btn => {
        btn.addEventListener('click', () => {
          const exId = btn.dataset.exId;
          const targetDay = customDays[targetDayIndex];
          if (!targetDay) return;

          const ex = ALL_LIBRARY_EXERCISES.find(item => item.id === exId);
          if (!ex) return;

          const existingIndex = targetDay.exercises.findIndex(e => e.nameAr === ex.nameAr || e.title === ex.title || (ex.id && e.id === ex.id));
          if (existingIndex >= 0) {
            targetDay.exercises.splice(existingIndex, 1);
            notificationService.showToast(`تم حذف (${ex.nameAr}) من (${targetDay.name})`, 'info');
          } else {
            targetDay.exercises.push({
              id: `pers_ex_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
              title: ex.nameAr || ex.title,
              nameAr: ex.nameAr || ex.title,
              nameEn: ex.nameEn || '',
              sets: ex.sets || 3,
              reps: ex.reps || '8-12',
              restSeconds: ex.restSeconds || 90,
              rir: 2,
              image: ex.image || '',
              groupKey: ex.groupKey || 'chest',
              equipment: ex.equipment || 'gym'
            });
            notificationService.showToast(`تمت إضافة (${ex.nameAr}) إلى (${targetDay.name}) ✓`, 'success');
          }
          rebind();
        });
      });

      return;
    }

    // أحداث وضع المحرر (Builder Mode)
    // تعديل أسماء الأيام
    modal.querySelectorAll('.creator-day-name-input').forEach(input => {
      input.addEventListener('input', (e) => {
        const dIdx = Number(input.dataset.dayIndex);
        if (customDays[dIdx]) {
          customDays[dIdx].name = e.target.value;
        }
      });
    });

    // حذف يوم
    modal.querySelectorAll('.btn-delete-day').forEach(btn => {
      btn.addEventListener('click', () => {
        const dIdx = Number(btn.dataset.dayIndex);
        if (customDays.length <= 1) {
          notificationService.showToast('يجب الاحتفاظ بيوم تمرين واحد على الأقل', 'warning');
          return;
        }
        if (confirm(`هل أنت متأكد من حذف (${customDays[dIdx]?.name || `اليوم ${dIdx + 1}`})؟`)) {
          customDays.splice(dIdx, 1);
          rebind();
        }
      });
    });

    // إعادة ترتيب التمارين للأعلى
    modal.querySelectorAll('.btn-move-ex-up').forEach(btn => {
      btn.addEventListener('click', () => {
        const dIdx = Number(btn.dataset.dayIndex);
        const eIdx = Number(btn.dataset.exIndex);
        const day = customDays[dIdx];
        if (day && eIdx > 0) {
          const temp = day.exercises[eIdx - 1];
          day.exercises[eIdx - 1] = day.exercises[eIdx];
          day.exercises[eIdx] = temp;
          rebind();
        }
      });
    });

    // إعادة ترتيب التمارين للأسفل
    modal.querySelectorAll('.btn-move-ex-down').forEach(btn => {
      btn.addEventListener('click', () => {
        const dIdx = Number(btn.dataset.dayIndex);
        const eIdx = Number(btn.dataset.exIndex);
        const day = customDays[dIdx];
        if (day && eIdx < day.exercises.length - 1) {
          const temp = day.exercises[eIdx + 1];
          day.exercises[eIdx + 1] = day.exercises[eIdx];
          day.exercises[eIdx] = temp;
          rebind();
        }
      });
    });

    // إزالة تمرين من اليوم
    modal.querySelectorAll('.btn-remove-ex').forEach(btn => {
      btn.addEventListener('click', () => {
        const dIdx = Number(btn.dataset.dayIndex);
        const eIdx = Number(btn.dataset.exIndex);
        const day = customDays[dIdx];
        if (day) {
          day.exercises.splice(eIdx, 1);
          rebind();
        }
      });
    });

    // فتح المكتبة لإضافة تمارين لهذا اليوم بالتحديد
    modal.querySelectorAll('.btn-open-lib-for-day').forEach(btn => {
      btn.addEventListener('click', () => {
        targetDayIndex = Number(btn.dataset.dayIndex) || 0;
        mode = 'library';
        libSearchQuery = '';
        rebind();
      });
    });

    // إضافة يوم تدريب جديد
    modal.querySelector('#btn-creator-add-day')?.addEventListener('click', () => {
      const nextNum = customDays.length + 1;
      customDays.push({
        key: `pers_day_${Date.now()}_${nextNum}`,
        name: `اليوم ${nextNum}: تمرين جديد`,
        exercises: []
      });
      rebind();
    });

    // اقتراح ذكي جاهز للتعديل (Quick Smart Template)
    modal.querySelector('#btn-quick-smart-template')?.addEventListener('click', () => {
      const daysInput = prompt('كم يوماً تريد في الأسبوع لهذا الاقتراح الذكي؟ (1 إلى 6 أيام):', String(customDays.length || 3));
      if (!daysInput) return;
      const count = Math.max(1, Math.min(6, parseInt(daysInput, 10) || 3));
      const draft = generatePersonalizedTrainingDraft({
        trainingLevel: profile.trainingLevel || 'intermediate',
        workoutDaysCount: count,
        sessionDurationMin: 60,
        equipment: profile.equipment || 'gym',
        goal: profile.goal || 'muscle_gain',
        injuries: profile.injuries || [],
        injuryDetails: profile.injuryDetails || {},
        availableEquipment: ['machines', 'barbell', 'dumbbells', 'cables', 'bodyweight']
      }, { splitKey: 'personalized', requestId: `quick_template_${Date.now()}` });

      if (draft?.days?.length) {
        customDays = draft.days.map((d, i) => ({
          key: d.key || `pers_day_${i + 1}`,
          name: d.label || d.short || `اليوم ${i + 1}`,
          exercises: (d.exercises || []).map((ex, eIdx) => ({
            id: ex.id || `pers_ex_${i + 1}_${eIdx}`,
            title: ex.title || ex.nameAr,
            nameAr: ex.nameAr || ex.title,
            nameEn: ex.nameEn || '',
            sets: ex.sets || 3,
            reps: ex.reps || '8-12',
            restSeconds: ex.restSeconds || 90,
            rir: ex.rir || 2,
            image: ex.image || '',
            groupKey: ex.groupKey || 'chest',
            equipment: ex.equipment || 'gym'
          }))
        }));
        notificationService.showToast(`تم ملء نموذج ذكي لـ ${count} أيام! يمكنك الآن تسمية الأيام وتعديل التمارين.`, 'success');
        rebind();
      }
    });

    // حفظ واعتماد الخطة المخصصة
    modal.querySelector('#btn-save-creator-plan')?.addEventListener('click', async () => {
      if (!customDays.length) {
        notificationService.showToast('يجب إضافة يوم تدريبي واحد على الأقل للخطة', 'warning');
        return;
      }

      // التحقق من أسماء الأيام
      customDays.forEach((d, i) => {
        if (!d.name || !d.name.trim()) {
          d.name = `اليوم ${i + 1}`;
        }
      });

      // التحقق من الأيام الفارغة
      const emptyDays = customDays.filter(d => !d.exercises || d.exercises.length === 0);
      if (emptyDays.length > 0) {
        const names = emptyDays.map(d => d.name).join('، ');
        const proceed = confirm(`الأيام التالية لا تحتوي على أي تمارين:\n(${names})\n\nهل ترغب بحفظ الخطة بدون هذه الأيام الفارغة؟`);
        if (!proceed) return;
        customDays = customDays.filter(d => d.exercises && d.exercises.length > 0);
        if (!customDays.length) {
          notificationService.showToast('يرجى إضافة تمرين واحد على الأقل للخطة قبل الحفظ', 'warning');
          return;
        }
      }

      // بناء نسخة الخطة
      const draftDays = customDays.map((d, dIdx) => ({
        key: `pers_day_${dIdx + 1}`,
        short: d.name.trim(),
        label: d.name.trim(),
        tone: 'hypertrophy',
        estimatedMinutes: Math.max(30, d.exercises.length * 9),
        warmup: 'إحماء وتهيئة المفاصل 5-10 دقائق، ومجموعات إحماء تدريجية قبل الأوزان الفعلية.',
        exercises: d.exercises.map((ex, eIdx) => ({
          ...ex,
          id: `pers_day_${dIdx + 1}_${eIdx}`,
          number: eIdx + 1,
          sets: Number(ex.sets) || 3,
          reps: String(ex.reps || '8-12'),
          restSeconds: Number(ex.restSeconds || ex.rest) || 90,
          rir: Number(ex.rir) || 2
        }))
      }));

      const draft = {
        id: `pers_${Date.now()}`,
        splitKey: 'personalized',
        splitName: 'الخطة المقترحة المخصصة',
        rulesVersion: '2026.1',
        selectedLevel: 'مخصص',
        suggestedStartingPoint: 'خطة تدريبية مخصصة ومصممة بالكامل من جانب المتدرب',
        inputSnapshot: {
          workoutDaysCount: draftDays.length,
          days: draftDays.map(d => ({ name: d.label, count: d.exercises.length }))
        },
        reasons: ['تم إنشاء أيام الخطة وتسميتها واختيار تمارينها يدوياً من مكتبة التمارين'],
        warnings: [],
        days: draftDays
      };

      const res = await fortyDayWorkoutService.activatePersonalizedPlan(draft);
      if (res.ok) {
        fortyDayWorkoutService.setActivePlan('personalized');
        const curProfile = store.getState()?.userProfile || {};
        store.setUserProfile({
          ...curProfile,
          workoutPlan: 'personalized',
          workoutDaysCount: draftDays.length
        });

        // مزامنة سحابية
        const effectiveUserId = store.getUserId?.() || authService.getEffectiveUserId?.();
        if (effectiveUserId) {
          syncService.syncProfile(effectiveUserId, store.getState().userProfile);
        }

        notificationService.showToast('تم حفظ واعتماد خطتك التدريبية المخصصة بنجاح! جاهز للتمرين 💪', 'success');
        modal.remove();

        // إعادة رسم شاشة التمرين
        const root = document.getElementById('forty-workout-root');
        if (root) {
          root.outerHTML = renderFortyDayWorkoutView();
          bindFortyDayWorkoutEvents();
        }
        if (typeof window !== 'undefined' && window.location.hash.includes('profile')) {
          window.dispatchEvent(new Event('hashchange'));
        }
      } else {
        notificationService.showToast((res.errors || ['تعذر تفعيل الخطة']).join(' '), 'error');
      }
    });
  };

  attachListeners();
}
