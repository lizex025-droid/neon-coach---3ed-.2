import { fortyDayWorkoutService } from '../services/fortyDayWorkoutService.js';
import { notificationService } from '../services/notificationService.js';
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
const hasCompletedSet = snapshot => (snapshot.session?.touchedExerciseIds || []).some(id => snapshot.trackers?.[id]?.sets?.some(set => set.done && (set.kg !== '' || set.reps !== '')));
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
  const progress = Math.round((Math.min(snapshot.history.length, program.durationDays) / program.durationDays) * 100);
  const activeDay = days.some(d => d.key === snapshot.activeDay) ? snapshot.activeDay : days[0].key;
  const activeDayObj = fortyDayWorkoutService.getDay(activeDay, activePlan);
  const activeVersion = fortyDayWorkoutService.getActivePlanVersion(activePlan);

  return `
    <div class="forty-workout" id="forty-workout-root">
      <section class="forty-hero">
        <img src="${program.cover}" alt="غلاف ${program.title}" class="forty-hero-cover">
        <div class="forty-hero-overlay"></div>
        <div class="forty-hero-content">
          <div class="forty-plan-switcher" style="display: inline-flex; align-items: center; background: rgba(0,0,0,0.45); padding: 4px; border-radius: 999px; border: 1px solid var(--forty-line); margin-bottom: 12px; gap: 4px; z-index: 2; flex-wrap: wrap;">
            <button type="button" data-action="switch-plan" data-plan="hasm" class="btn btn-sm ${activePlan === 'hasm' ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; font-size: 0.76rem; padding: 5px 14px; min-height: unset; cursor: pointer;">نظام الحسم</button>
            <button type="button" data-action="switch-plan" data-plan="anas" class="btn btn-sm ${activePlan === 'anas' ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; font-size: 0.76rem; padding: 5px 14px; min-height: unset; cursor: pointer;">نظام أنس</button>
            <button type="button" data-action="switch-plan" data-plan="ppl" class="btn btn-sm ${activePlan === 'ppl' ? 'btn-primary' : 'btn-ghost'}" style="border-radius: 999px; font-size: 0.76rem; padding: 5px 14px; min-height: unset; cursor: pointer;">Push Pull Legs</button>
          </div>
          <span class="forty-kicker">${program.kicker || 'NEON TRAINING PROGRAM'}</span>
          <h1>${program.title}</h1>
          <p>${program.description}</p>
          <div class="forty-progress-meta">
            <strong>${activePlan === 'hasm' || activePlan === 'anas' ? `اليوم النشط: ${activeDayObj?.short || ''}` : `اليوم ${workoutNumber} من ${program.durationDays}`}</strong>
            <span>${progress}% مكتمل</span>
          </div>
          <div class="forty-progress-track"><span style="width:${progress}%"></span></div>
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
            <span>${activePlan === 'anas' ? 'خطة نظام أنس' : (activePlan === 'hasm' ? 'خطة نظام الحسم' : 'خطة الأسبوع')}</span>
            <h2>${activePlan === 'anas' ? 'اختر نوع التمرين' : (activePlan === 'hasm' ? 'اختر مجموعة العضلات لعرض تمارينها فقط' : 'اختر يوم التمرين')}</h2>
          </div>
          <p>${activePlan === 'anas' ? '5 أيام تدريبية: Push / Pull / Legs / Upper / كتف' : (activePlan === 'hasm' ? '6 مجموعات عضلية مركزة لتضخيم وقوة مثالية' : '6 أيام Push / Pull / Legs ثم يوم راحة')}</p>
        </div>
        <div class="forty-day-tabs ${activePlan === 'hasm' ? 'hasm-tabs' : (activePlan === 'anas' ? 'anas-tabs' : '')}" id="forty-day-tabs" role="tablist" aria-label="أيام التمرين">
          ${days.map((day, idx) => `
            <button type="button" role="tab" aria-selected="${day.key === activeDay ? 'true' : 'false'}" class="forty-day-tab tone-${day.tone} ${day.key === activeDay ? 'is-active' : ''}" data-day="${day.key}">
              <span class="forty-tab-day">${activePlan === 'hasm' || activePlan === 'anas' ? `اليوم ${idx + 1}` : (day.key === 'rest' ? 'استشفاء' : `اليوم ${idx + 1}`)}</span>
              <span class="forty-tab-title">${escapeHtml(day.short)}</span>
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
          ${exercise.restSeconds != null ? `<p><span>الجرعة المقترحة:</span> ${exercise.sets} مجموعات · ${escapeHtml(exercise.reps)} · راحة ${exercise.restSeconds}ث · RIR ${exercise.rir}</p>` : ''}
          ${exercise.coachingNote ? `<p style="color:#55F7A5;font-size:0.8rem;margin-top:4px;"><span>💡 التدرج والتكنيك:</span> ${escapeHtml(exercise.coachingNote)}</p>` : ''}
        </div>
        <button type="button" class="forty-image-btn" data-action="image" data-index="${exerciseIndex}" data-image-url="${escapeHtml(exercise.image || '')}" aria-label="عرض صورة التمرين">ⓘ</button>
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
      <div class="forty-tracker-actions">
        <button type="button" data-action="add-set" data-index="${exerciseIndex}">+ Add Set</button>
        <button type="button" class="forty-manage-btn" data-action="manage" data-index="${exerciseIndex}" aria-label="إدارة التمرين">⚙ Manage Exercise</button>
      </div>
    </article>
  `;
}

function renderManageExerciseSheet(dayKey, exerciseIndex) {
  const day = fortyDayWorkoutService.getDay(dayKey);
  const exercise = day?.exercises?.[exerciseIndex];
  if (!exercise) return '';

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

      <!-- 3. Delete Exercise -->
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
  const planName = activePlan === 'anas' ? 'نظام أنس' : (activePlan === 'hasm' ? 'نظام الحسم' : 'Push Pull Legs');
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
  const switchBanner = switchContext && switchContext.sourceExercise ? `
    <div class="library-switch-banner">
      <div class="library-switch-meta">
        <span class="library-switch-icon">🔄</span>
        <div>
          <div class="library-switch-label">تبديل تمرين #${switchContext.targetIndex + 1}</div>
          <strong class="library-switch-title">${escapeHtml(switchContext.sourceExercise.title)}</strong>
        </div>
      </div>
      <button type="button" class="btn-cancel-switch" data-lib-action="cancel-switch">إلغاء التبديل</button>
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
            <p>${switchContext ? 'اختر التمرين البديل ليأخذ مكانه فوراً' : 'اختر أي تمرين لإضافته إلى جدولك الحالي'}</p>
          </div>
        </div>
        <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
      </div>

      ${switchBanner}

      <div class="library-search-box">
        <input type="text" id="lib-search-input" value="${escapeHtml(searchQuery)}" placeholder="ابحث عن أي تمرين بالاسم..." class="library-search-input">
      </div>

      <div class="library-exercises-list">
        ${results.length ? results.map(ex => renderLibraryExerciseItem(ex, Boolean(switchContext))).join('') : `
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
            <p>${switchContext ? 'اختر التمرين البديل ليأخذ مكانه في الخطة' : escapeHtml(group?.description || 'اختر تمريناً لإضافته')}</p>
          </div>
        </div>
        <button type="button" class="forty-modal-close" data-close-modal aria-label="إغلاق">×</button>
      </div>

      ${switchBanner}

      <div class="library-exercises-list">
        ${exercises.map(ex => renderLibraryExerciseItem(ex, Boolean(switchContext))).join('')}
      </div>
    `;
  }

  // 3. العرض الرئيسي: شبكة ثنائية الأعمدة للمجموعات العضلية الثمانية مطابقة للصورة المرفقة
  return `
    <div class="library-head">
      <div class="library-head-title">
        <h2>مكتبة التمارين الشاملة وشروحاتها</h2>
        <p>${switchContext ? 'اختر العضلة لاستعراض التمارين البديلة' : 'اختر العضلة لعرض كافة تمارينها وإضافتها لخطة تمرينك'}</p>
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

function renderLibraryExerciseItem(ex, isSwitchMode = false) {
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
        ${isSwitchMode ? '⇄ اختيار كبديل' : '＋ إضافة'}
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
        if (pendingSwitchContext && pendingSwitchContext.targetIndex >= 0) {
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

    // تبديل الخطة بين نظام الحسم و PPL مباشرة من شاشة التمرين
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
      const planName = targetPlan === 'anas' ? 'نظام أنس' : (targetPlan === 'hasm' ? 'نظام الحسم' : 'Push Pull Legs');
      notificationService.showToast(`تم التبديل إلى ${planName} بنجاح`, 'info');
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
      showExerciseImage(exercise);
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
