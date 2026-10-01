import { ALL_LIBRARY_EXERCISES, detectExerciseMuscleGroup } from '../data/exerciseLibrary.js';
import { FORTY_DAY_DAYS, fortyDayExerciseId } from '../data/fortyDayWorkout.js';
import { ANAS_DAYS, anasExerciseId } from '../data/anasWorkout.js';
import { HASM_GROUPS, hasmExerciseId } from '../data/hasmWorkout.js';

export const TRAINING_RULES_VERSION = '2.0.0';

export const SPLIT_SCHEDULES = Object.freeze({
  ppl: { label: 'Push Pull Legs', supportedDays: [3, 6] },
  anas: { label: 'نظام أنس', supportedDays: [5] },
  hasm: { label: 'نظام الحسم', supportedDays: [4, 5, 6] }
});

const SPLIT_DAYS = { ppl: FORTY_DAY_DAYS, anas: ANAS_DAYS, hasm: HASM_GROUPS };
const REGION_LABELS = { shoulder: 'الكتف', knee: 'الركبة', lower_back: 'أسفل الظهر' };
const REGION_ALIASES = {
  shoulder: ['shoulder', 'overhead', 'press', 'upright', 'lateral', 'front raise', 'كتف'],
  knee: ['squat', 'leg press', 'extension', 'lunge', 'hack', 'ركبة', 'سكوات', 'أرجل'],
  lower_back: ['deadlift', 'rack pull', 'bent', 'yates', 'good morning', 'ديدلفت', 'أسفل الظهر']
};

const cleanSplit = value => value === 'ppl' || value === 'fortyDay' ? 'ppl' : value === 'anas' ? 'anas' : 'hasm';
const safeNumber = (value, fallback, min, max) => Math.min(max, Math.max(min, Number(value) || fallback));
const titleText = exercise => `${exercise?.title || ''} ${exercise?.nameEn || ''} ${exercise?.nameAr || ''}`.toLowerCase();

function stableId(prefix, text) {
  let hash = 2166136261;
  for (const char of String(text)) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return `${prefix}_${(hash >>> 0).toString(36)}`;
}

function baseExerciseId(splitKey, dayKey, index) {
  if (splitKey === 'ppl') return fortyDayExerciseId(dayKey, index);
  if (splitKey === 'anas') return anasExerciseId(dayKey, index);
  return hasmExerciseId(dayKey, index);
}

function inferMovement(exercise) {
  const text = titleText(exercise);
  if (/deadlift|rack pull|romanian|stiff|hip thrust|ديدلفت/.test(text)) return 'hip_hinge';
  if (/squat|leg press|lunge|hack|سكوات/.test(text)) return 'squat';
  if (/leg extension/.test(text)) return 'knee_extension';
  if (/leg curl/.test(text)) return 'knee_flexion';
  if (/overhead|shoulder press|military/.test(text)) return 'vertical_push';
  if (/bench|chest press|push.?up|dip/.test(text)) return 'horizontal_push';
  if (/pulldown|pull.?up|chin/.test(text)) return 'vertical_pull';
  if (/row/.test(text)) return 'horizontal_pull';
  if (/curl/.test(text)) return 'elbow_flexion';
  if (/tricep|pushdown|skull|extension/.test(text)) return 'elbow_extension';
  if (/calf/.test(text)) return 'calf';
  if (/plank|crunch|abdominal|core/.test(text)) return 'core';
  return 'isolation';
}

function loadedRegions(exercise) {
  const text = titleText(exercise);
  const movement = inferMovement(exercise);
  const regions = [];
  if (['vertical_push', 'horizontal_push'].includes(movement) || /upright|lateral|rear delt/.test(text)) regions.push('shoulder');
  if (['squat', 'knee_extension', 'knee_flexion'].includes(movement) || /leg press|lunge/.test(text)) regions.push('knee');
  if (movement === 'hip_hinge' || /bent|yates|back squat/.test(text)) regions.push('lower_back');
  return regions;
}

function inferComplexity(exercise) {
  const movement = inferMovement(exercise);
  if (['hip_hinge', 'squat'].includes(movement) || /barbell|pull.?up/.test(titleText(exercise))) return 'advanced';
  if (['vertical_push', 'horizontal_push', 'horizontal_pull', 'vertical_pull'].includes(movement)) return 'intermediate';
  return 'basic';
}

function equipmentKind(exercise) {
  const text = titleText(exercise);
  if (/cable|machine|smith|leg press|pulldown|كابل|جهاز/.test(text)) return 'machines';
  if (/barbell|ez.?bar|بار/.test(text)) return 'barbell';
  if (/dumbbell|دمبل/.test(text)) return 'dumbbells';
  if (/band|حبل مقاومة/.test(text)) return 'bands';
  if (/bodyweight|push.?up|plank|crunch|lunge/.test(text)) return 'bodyweight';
  return 'general';
}

function normalizeEquipment(input) {
  const explicit = Array.isArray(input.availableEquipment) ? input.availableEquipment.filter(Boolean) : [];
  if (explicit.length) return [...new Set(explicit)];
  return input.equipment === 'home'
    ? ['bodyweight', 'dumbbells', 'bands']
    : ['machines', 'barbell', 'dumbbells', 'cables', 'bodyweight', 'general'];
}

function normalizeConstraints(input) {
  const details = input.injuryDetails && typeof input.injuryDetails === 'object' ? input.injuryDetails : {};
  const selected = Array.isArray(input.injuries) ? input.injuries : [];
  const mapLegacy = label => /shoulder|كتف/i.test(label) ? 'shoulder' : /knee|ركبة/i.test(label) ? 'knee' : /back|ظهر/i.test(label) ? 'lower_back' : null;
  const regions = new Set([...Object.keys(details), ...selected.map(mapLegacy).filter(Boolean)]);
  return [...regions].map(region => {
    const detail = details[region] || {};
    return {
      region,
      side: detail.side || 'unspecified',
      status: detail.status || '',
      painSeverity: safeNumber(detail.painSeverity, 0, 0, 10),
      worsening: Boolean(detail.worsening),
      recentUnevaluated: Boolean(detail.recentUnevaluated),
      triggerMovements: String(detail.triggerMovements || '').trim(),
      clinicianInstructions: String(detail.clinicianInstructions || '').trim(),
      medicalBan: detail.medicalBan || 'none'
    };
  });
}

export function normalizeTrainingInput(input = {}) {
  const splitKey = cleanSplit(input.splitKey || input.workoutPlan);
  return {
    splitKey,
    gender: input.gender === 'female' ? 'female' : 'male',
    goal: input.trainingGoal || input.goal || 'general_fitness',
    selectedLevel: ['beginner', 'intermediate', 'advanced'].includes(input.trainingLevel || input.selectedLevel) ? (input.trainingLevel || input.selectedLevel) : 'beginner',
    experienceMonths: safeNumber(input.trainingExperienceMonths ?? input.experienceMonths, 0, 0, 600),
    breakMonths: safeNumber(input.trainingBreakMonths ?? input.breakMonths, 0, 0, 120),
    workoutDaysCount: safeNumber(input.workoutDaysCount, 4, 1, 6),
    sessionDurationMin: safeNumber(input.sessionDurationMin, 50, 25, 120),
    equipment: normalizeEquipment(input),
    focusAreas: Array.isArray(input.focusAreas) ? [...new Set(input.focusAreas)] : [],
    constraints: normalizeConstraints(input),
    sleepHours: safeNumber(input.sleepHours, 7, 3, 14)
  };
}

function constraintDecision(exercise, constraint) {
  const text = titleText(exercise);
  const regionLoaded = loadedRegions(exercise).includes(constraint.region);
  const triggers = constraint.triggerMovements.toLowerCase().split(/[,،;]+/).map(v => v.trim()).filter(Boolean);
  const explicitTrigger = triggers.some(trigger => text.includes(trigger)) ||
    triggers.some(trigger => REGION_ALIASES[constraint.region]?.some(alias => trigger.includes(alias) && text.includes(alias)));
  const highRisk = constraint.painSeverity >= 7 || constraint.worsening || constraint.recentUnevaluated;
  const banned = constraint.medicalBan === 'all' || (constraint.medicalBan === 'region' && regionLoaded);
  return { excluded: banned || explicitTrigger || (highRisk && regionLoaded), regionLoaded, explicitTrigger, highRisk };
}

function isEquipmentAvailable(exercise, available) {
  const kind = equipmentKind(exercise);
  return kind === 'general' || available.includes(kind) || (kind === 'machines' && available.includes('cables'));
}

function isCompatible(exercise, input) {
  if (!isEquipmentAvailable(exercise, input.equipment)) return false;
  return !input.constraints.some(constraint => constraintDecision(exercise, constraint).excluded);
}

function chooseAlternative(base, input, usedIds) {
  const group = detectExerciseMuscleGroup(base) || 'abs';
  const movement = inferMovement(base);
  const candidates = ALL_LIBRARY_EXERCISES
    .filter(item => item.groupKey === group && !usedIds.has(item.id) && isCompatible(item, input))
    .sort((a, b) => {
      const scoreA = (inferMovement(a) === movement ? 4 : 0) + (inferComplexity(a) === 'basic' ? 1 : 0);
      const scoreB = (inferMovement(b) === movement ? 4 : 0) + (inferComplexity(b) === 'basic' ? 1 : 0);
      return scoreB - scoreA;
    });
  return candidates[0] || null;
}

function dosage(exercise, input) {
  const compound = ['hip_hinge', 'squat', 'vertical_push', 'horizontal_push', 'horizontal_pull', 'vertical_pull'].includes(inferMovement(exercise));
  let sets = input.selectedLevel === 'beginner' ? 2 : input.selectedLevel === 'advanced' ? (compound ? 4 : 3) : 3;
  const focused = input.focusAreas.includes(detectExerciseMuscleGroup(exercise));
  if (focused && input.selectedLevel !== 'beginner') sets = Math.min(4, sets + 1);
  let reps = compound ? '8-12' : '10-15';
  let restSeconds = compound ? 120 : 75;
  if (input.goal === 'strength' && compound) { reps = '4-8'; restSeconds = 150; }
  if (input.goal === 'fat_loss' || input.goal === 'fitness') { reps = compound ? '8-12' : '12-15'; restSeconds = compound ? 90 : 60; }
  return { sets, reps, restSeconds, rir: input.selectedLevel === 'beginner' ? 3 : input.selectedLevel === 'advanced' ? 1 : 2, focused };
}

function buildExercise(base, baseId, input, usedIds, warnings) {
  let selected = base;
  let reason = 'محفوظ من ترتيب النظام الأصلي';
  const incompatibleEquipment = !isEquipmentAvailable(base, input.equipment);
  const blockedBy = input.constraints.filter(c => constraintDecision(base, c).excluded);
  if (incompatibleEquipment || blockedBy.length) {
    selected = chooseAlternative(base, input, usedIds);
    if (!selected) return { blocker: `لا يوجد بديل متوافق في المكتبة لتمرين ${base.title}. يلزم اختيار معدات أو مراجعة القيد الصحي.` };
    reason = incompatibleEquipment
      ? 'بديل من المكتبة متوافق مع المعدات المتاحة'
      : `بديل محافظ بسبب قيد ${blockedBy.map(c => REGION_LABELS[c.region]).join('، ')}`;
    warnings.push(`${base.title}: تم استبداله بخيار محافظ؛ البديل ليس ضماناً طبياً للأمان.`);
  }
  const dose = dosage(selected, input);
  const id = selected.id || baseId;
  usedIds.add(id);
  return {
    id,
    sourceExerciseId: selected.id || baseId,
    originalExerciseId: baseId,
    number: 0,
    title: selected.title,
    image: selected.image || base.image || '',
    pageImage: selected.pageImage || base.pageImage || '',
    alternative: selected.alternative || '',
    groupKey: detectExerciseMuscleGroup(selected) || detectExerciseMuscleGroup(base),
    movementPattern: inferMovement(selected),
    complexity: inferComplexity(selected),
    loadedRegions: loadedRegions(selected),
    equipment: equipmentKind(selected),
    sets: dose.sets,
    reps: dose.reps,
    restSeconds: dose.restSeconds,
    rir: dose.rir,
    reason: dose.focused ? `${reason}، مع أولوية للمنطقة المختارة` : reason,
    coachingNote: input.selectedLevel === 'beginner' ? 'ابدأ بوزن يسمح بتقنية ثابتة واترك 3 تكرارات احتياطية.' : 'زد الحمل تدريجياً فقط عند إكمال كل التكرارات بتقنية ثابتة.'
  };
}

function suggestedStartingPoint(input) {
  if (input.breakMonths >= 3) return 'العودة المحافظة: ابدأ بأحمال أقل وحجم مستوى مبتدئ لأسبوعين، دون تغيير المستوى الذي اخترته.';
  if (input.selectedLevel === 'beginner') return 'ابدأ بأوزان مريحة وركز على إتقان الحركة قبل زيادة الحمل.';
  return 'المستوى المختار محفوظ؛ اضبط الوزن يومياً حسب التكرارات الاحتياطية المطلوبة.';
}

export function generatePersonalizedTrainingDraft(rawInput = {}, options = {}) {
  const input = normalizeTrainingInput({ ...rawInput, splitKey: options.splitKey || rawInput.splitKey });
  const schedule = SPLIT_SCHEDULES[input.splitKey];
  const blockers = [];
  const warnings = [];
  const missingDetails = input.constraints.filter(c => !c.status && !c.triggerMovements && c.painSeverity === 0 && c.medicalBan === 'none');
  if (missingDetails.length) blockers.push(`أكمل تفاصيل ${missingDetails.map(c => REGION_LABELS[c.region]).join('، ')} قبل إنشاء خطة آمنة.`);
  if (input.constraints.some(c => c.medicalBan === 'all')) blockers.push('يوجد منع طبي شامل مسجل؛ لا يمكن إنشاء خطة قبل الحصول على توجيه مهني واضح.');
  input.constraints.filter(c => c.painSeverity >= 7 || c.worsening || c.recentUnevaluated).forEach(c => {
    warnings.push(`قيد ${REGION_LABELS[c.region]} يحتاج تقييماً مختصاً بسبب الشدة/التفاقم/حداثة الحالة. لن تُدرج الحركات المحمّلة عليه.`);
  });

  const scheduleConflict = !schedule.supportedDays.includes(input.workoutDaysCount)
    ? { requestedDays: input.workoutDaysCount, supportedDays: schedule.supportedDays, message: `${schedule.label} يدعم في هذا الإصدار ${schedule.supportedDays.join(' أو ')} أيام مع الحفاظ على ترتيبه. اختر أحدها قبل الاعتماد.` }
    : null;
  if (scheduleConflict) blockers.push(scheduleConflict.message);

  const sourceDays = SPLIT_DAYS[input.splitKey] || HASM_GROUPS;
  const selectedDays = sourceDays.filter(day => day.exercises?.length).slice(0, input.workoutDaysCount);
  const usedIds = new Set();
  const days = selectedDays.map(day => {
    const dayBlockers = [];
    const exercises = [];
    day.exercises.forEach((base, index) => {
      const built = buildExercise(base, baseExerciseId(input.splitKey, day.key, index), input, usedIds, warnings);
      if (built.blocker) dayBlockers.push(built.blocker);
      else exercises.push({ ...built, number: exercises.length + 1 });
    });
    blockers.push(...dayBlockers);
    const estimatedMinutes = 8 + exercises.reduce((sum, ex) => sum + ex.sets * (0.75 + ex.restSeconds / 60), 0) + exercises.length;
    if (estimatedMinutes > input.sessionDurationMin + 10) warnings.push(`${day.label}: الزمن التقديري ${Math.round(estimatedMinutes)} دقيقة، أطول من الوقت المختار. يمكن تقليل تمرين عزل بعد المعاينة.`);
    return {
      key: day.key,
      short: day.short,
      label: day.label,
      tone: day.tone,
      warmup: '5–8 دقائق حركة عامة ثم مجموعتان تمهيديتان لأول تمرين أساسي.',
      estimatedMinutes: Math.round(estimatedMinutes),
      exercises
    };
  });

  const createdAt = new Date().toISOString();
  const requestSeed = options.requestId || `${createdAt}_${input.splitKey}_${input.workoutDaysCount}`;
  return {
    id: stableId('training_draft', requestSeed),
    requestId: options.requestId || stableId('request', requestSeed),
    status: 'draft',
    rulesVersion: TRAINING_RULES_VERSION,
    createdAt,
    splitKey: input.splitKey,
    splitName: schedule.label,
    selectedLevel: input.selectedLevel,
    suggestedStartingPoint: suggestedStartingPoint(input),
    inputSnapshot: input,
    scheduleConflict,
    blockers: [...new Set(blockers)],
    warnings: [...new Set(warnings)],
    reasons: [
      `تم الحفاظ على نظام ${schedule.label} وترتيب أيامه دون تحويل تلقائي.`,
      `الجرعات مبنية على مستوى ${input.selectedLevel} وهدف ${input.goal}.`,
      input.focusAreas.length ? `الأولوية الاختيارية: ${input.focusAreas.join('، ')} مع إبقاء التوازن العام.` : 'لم تُفرض أولوية عضلية إضافية.'
    ],
    days,
    canApprove: blockers.length === 0 && days.length > 0 && days.every(day => day.exercises.length > 0)
  };
}

export function validatePersonalizedTrainingDraft(draft) {
  const errors = [];
  if (!draft || draft.status !== 'draft') errors.push('المسودة غير صالحة.');
  if (!SPLIT_SCHEDULES[draft?.splitKey]) errors.push('نظام التدريب غير معروف.');
  if (!Array.isArray(draft?.days) || !draft.days.length) errors.push('لا توجد أيام تدريب.');
  for (const day of draft?.days || []) {
    if (!day.key || !Array.isArray(day.exercises)) errors.push('بيانات يوم التدريب ناقصة.');
    for (const exercise of day.exercises || []) {
      if (!exercise.id || !exercise.title || !exercise.image) errors.push(`تمرين ناقص في ${day.label || day.key}.`);
      if (exercise.sets < 1 || !exercise.reps || exercise.restSeconds < 0 || exercise.rir < 0) errors.push(`جرعة غير صالحة لتمرين ${exercise.title}.`);
    }
  }
  if (draft?.blockers?.length) errors.push(...draft.blockers);
  return { valid: errors.length === 0, errors: [...new Set(errors)] };
}
