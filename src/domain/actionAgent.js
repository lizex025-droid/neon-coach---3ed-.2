import { FOOD_ITEMS } from '../data/foods.js';
import { EXERCISES } from '../data/exercises.js';
import { generateWeeklyShoppingList } from './nutritionEngine.js';

export const normalizeCommand = value => String(value).toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/[\u064B-\u065F]/g, '').replace(/[٠-٩]/g, n => '٠١٢٣٤٥٦٧٨٩'.indexOf(n)).replace(/٫/g, '.').trim();
export const localDate = (now = new Date()) => `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const clone = value => value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const round = value => Math.round(value * 10) / 10;
export const TODAY_KINDS = ['workout', 'nutrition', 'water', 'supplements'];
export const ACTION_TOOLS = ['log_meal', 'add_water', 'take_supplement', 'finish_workout', 'log_set', 'log_weight', 'add_shopping', 'remove_shopping', 'prioritize_today', 'remaining_protein', 'today_summary', 'undo', 'stop_listening'];
const ALLOWED_ROOTS = ['today', 'loggedMeals', 'waterLogs', 'supplementsSchedule', 'actionSupplementTaken', 'activeWorkoutSession', 'workoutHistory', 'exerciseSetLogs', 'personalRecords', 'weightLogs', 'userProfile', 'progressReport', 'shoppingItems'];

export function shoppingItemsFor(state) {
  return state.shoppingItems ?? generateWeeklyShoppingList(state.mealPlan?.meals || []).map((item, i) => ({ ...item, id: `plan-${i}` }));
}

export function todaySnapshot(state, now = new Date()) {
  const date = localDate(now);
  const current = state.today?.date === date;
  const meals = (state.loggedMeals || []).filter(meal => (meal.date || state.today?.date) === date);
  const protein = round(meals.reduce((sum, meal) => sum + (Number(meal.protein) || 0), 0));
  return {
    date, meals, protein, targetProtein: Number(state.today?.targetProtein) || 0,
    remainingProtein: Math.max(0, round((Number(state.today?.targetProtein) || 0) - protein)),
    calories: round(meals.reduce((sum, meal) => sum + (Number(meal.calories) || 0), 0)),
    waterMl: current ? Math.round((Number(state.today.consumedWaterLiters) || 0) * 1000) : 0,
    targetWaterMl: Math.round((Number(state.today?.targetWaterLiters) || 0) * 1000),
    workout: state.today?.todayWorkoutTitleAr || state.activeWorkoutSession?.sessionNameAr || '',
    workoutCompleted: current && !!state.today?.isWorkoutCompleted,
    order: current && Array.isArray(state.today.actionOrder) ? state.today.actionOrder : TODAY_KINDS
  };
}

export function summaryReply(state, now = new Date()) {
  const today = todaySnapshot(state, now);
  const supplements = (state.supplementsSchedule || []).map(item => `${item.nameAr}: ${item.schedule?.morning?.taken || item.schedule?.evening?.taken ? 'تم' : 'متبقي'}`).join('، ');
  return `تمرين اليوم: ${today.workout || 'غير محدد'}${today.workoutCompleted ? ' — مكتمل' : ''}.\nالتغذية: ${today.calories} / ${state.today?.targetCalories || 0} سعرة؛ باقي البروتين ${today.remainingProtein} غ.\nالماء: ${today.waterMl} / ${today.targetWaterMl} مل.\nالمكملات: ${supplements || 'لا يوجد مكملات مسجلة'}.`;
}

const foodAliases = {
  'دجاج': 'chicken-breast-cooked', 'صدر دجاج': 'chicken-breast-cooked', 'دجاج مشوي': 'chicken-breast-cooked', 'دجاج مطبوخ': 'chicken-breast-cooked', 'دجاج نيء': 'chicken-breast-raw',
  'رز': 'white-rice-cooked', 'ارز': 'white-rice-cooked', 'رز مطبوخ': 'white-rice-cooked', 'ارز مطبوخ': 'white-rice-cooked',
  'بطاطا': 'boiled-potatoes', 'بطاطا مسلوقة': 'boiled-potatoes', 'شوفان': 'rolled-oats', 'بيض': 'whole-eggs-boiled', 'بيض مسلوق': 'whole-eggs-boiled',
  'زيت زيتون': 'olive-oil', 'سلطة': 'green-salad', 'سلمون': 'baked-salmon', 'لوز': 'raw-almonds'
};

function foodFor(name) {
  const normalized = normalizeCommand(name);
  const alias = foodAliases[normalized];
  if (alias) return FOOD_ITEMS.find(food => food.id === alias);
  const matches = FOOD_ITEMS.filter(food => normalizeCommand(food.nameAr) === normalized || normalizeCommand(food.nameEn) === normalized);
  return matches.length === 1 ? matches[0] : undefined;
}

export function parseMealForAction(text) {
  const body = normalizeCommand(text).replace(/^(?:اكلت|تناولت|سجل وجبة|i ate)\s+/, '');
  const segments = body.split(/\s+و\s*|\s*[,،;+]\s*|\s+and\s+/).filter(Boolean);
  const items = [];
  for (const segment of segments) {
    const match = segment.match(/^(\d+(?:\.\d+)?)\s*(?:غرام|جرام|غ|غم|جم|g|grams?)\s+(.+)$/i);
    if (!match) return { reply: 'اذكر كمية كل صنف بالغرام واسمه، مثل: أكلت 250 غ دجاج و200 غ رز. لم أسجل الوجبة بعد.' };
    const food = foodFor(match[2]);
    if (!food) return { reply: `لم أحدد «${match[2]}» بدقة. اذكر نوعه وطريقة التحضير أو اختره من سجل الوجبات. لم أسجل أي جزء من الوجبة.` };
    items.push({ foodId: food.id, grams: Number(match[1]) });
  }
  return items.length ? { tools: [{ name: 'log_meal', args: { items } }] } : { reply: 'اذكر أصناف الوجبة وكمياتها.' };
}

function exerciseFor(name) {
  const normalized = normalizeCommand(name);
  if (['bench', 'bench press', 'بنش', 'بنش برس'].includes(normalized)) return EXERCISES.find(ex => ex.id === 'flat-barbell-bench-press');
  const matches = EXERCISES.filter(ex => ex.id === name || normalizeCommand(ex.nameAr) === normalized || normalizeCommand(ex.nameEn) === normalized);
  return matches.length === 1 ? matches[0] : undefined;
}

// Only explicit, complete commands execute locally. Other chat remains normal coaching.
export function parseActionCommand(text) {
  const raw = text.trim();
  const input = normalizeCommand(raw).replace(/^(?:يا\s+)?(?:نيون|neon)[،,:\s]+/, '').replace(/[.!؟?]+$/, '').trim();
  const tool = (name, args = {}) => ({ tools: [{ name, args }] });
  if (/^(?:وقف|اوقف|توقف عن)\s+(?:(?:ال)?استماع|التسجيل)$|^stop listening$/.test(input)) return tool('stop_listening');
  if (/^(?:تراجع|undo|رجع اخر (?:شغلة|شغله|شي|تغيير)(?: عملتها)?|تراجع عن اخر (?:تغيير|عملية))$/.test(input)) return tool('undo');
  if (/^(?:شو|كم|قديش)\s+(?:باقيلي|باقي لي|باقي|متبقي|متبقي لي|ضايل)\s+(?:من )?(?:البروتين|بروتين)$/.test(input)) return tool('remaining_protein');
  if (/^(?:شو عندي اليوم|شو علي اليوم|اعرض ملخص اليوم|ملخص اليوم|what.*today)$/.test(input)) return tool('today_summary');
  if (/^(?:اكلت|تناولت(?! مكمل)|سجل وجبة|i ate)\s/.test(input)) return parseMealForAction(input);
  if (/^(?:زود|زيد|ضيف|اضف|شربت)\s+(?:كاسة|كاسه|كوب)\s+(?:مي|مية|ماء)$/.test(input)) return tool('add_water', { amountMl: 250 });
  let match = input.match(/^(?:زود|زيد|ضيف|اضف|شربت)\s+(\d+(?:\.\d+)?)\s*(مل|لتر|ml|l)\s+(?:مي|مية|ماء|water)$/);
  if (match) return tool('add_water', { amountMl: Number(match[1]) * (/^(لتر|l)$/.test(match[2]) ? 1000 : 1) });
  match = input.match(/^(?:اخذت|اخدت|تناولت مكمل)\s+(.+)$/);
  if (match) return tool('take_supplement', { supplement: match[1] });
  match = input.match(/^(?:خلصت|انهيت|اكملت)\s+تمرين\s+(.+)$/);
  if (match) return tool('finish_workout', { title: match[1] });
  match = input.match(/^(?:عملت|سجلت|سجل)\s+(.+?)\s+(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|kg)\s+(\d+)\s*(?:reps?|تكرار|تكرارات|عدات)$/);
  if (match) return tool('log_set', { exercise: match[1], weightKg: Number(match[2]), reps: Number(match[3]) });
  match = input.match(/^(?:وزني(?: اليوم)?|سجل وزني)\s+(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|kg)?$/);
  if (match) return tool('log_weight', { weightKg: Number(match[1]) });
  match = input.match(/^(?:ضيف|اضف|حط)\s+(.+?)\s+(?:لقائمة المشتريات|على قائمة المشتريات|للمشتريات)$/);
  if (match) return tool('add_shopping', { names: match[1].split(/\s+و\s*|\s*[,،+]\s*/).filter(Boolean) });
  match = input.match(/^(?:شيل|احذف)\s+(.+?)(?:\s+من (?:قائمة )?المشتريات)?$/);
  if (match) return tool('remove_shopping', { name: match[1] });
  match = input.match(/^(?:خلي|خلّي)\s+(التمرين|التغذية|المي|الماء|المكملات)\s+(?:اهم شي|اهم شيء|اول شي|اولوية)\s*(?:اليوم)?$/);
  if (match) return tool('prioritize_today', { kind: { التمرين: 'workout', التغذية: 'nutrition', المي: 'water', الماء: 'water', المكملات: 'supplements' }[match[1]] });
  return null;
}

function number(value, min, max, label) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error(`${label} غير صالح؛ لم أحفظ التغيير.`);
  return value;
}
function name(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 160) throw new Error('الاسم غير صالح.');
  return value.trim();
}
function uniqueMatch(items, reference, getName) {
  const ref = normalizeCommand(reference).replace(/^ال/, '');
  const exact = items.filter(item => normalizeCommand(getName(item)).replace(/^ال/, '') === ref);
  if (exact.length === 1) return exact[0];
  const matches = items.filter(item => normalizeCommand(getName(item)).includes(ref));
  if (matches.length !== 1) throw new Error('لم أحدد الصنف بدقة. اذكر اسمه الكامل كما يظهر في سجلك.');
  return matches[0];
}

function prepareDay(state, date) {
  state.today ||= {};
  const oldDate = state.today.date;
  state.loggedMeals = (state.loggedMeals || []).map(meal => ({ ...meal, date: meal.date || oldDate || date }));
  if (oldDate !== date) {
    Object.assign(state.today, { date, consumedCalories: 0, consumedProtein: 0, consumedCarbs: 0, consumedFats: 0, consumedWaterLiters: 0, consumedGlasses: 0, isWorkoutCompleted: false, workoutStatus: 'not_started', actionOrder: [...TODAY_KINDS] });
  }
}

// The executor accepts tools, never arbitrary state patches, code, URLs or user IDs.
export function executeActionTools(original, tools, { now = new Date(), createId = () => crypto.randomUUID() } = {}) {
  if (!Array.isArray(tools) || !tools.length || tools.length > 12) throw new Error('قائمة إجراءات غير صالحة.');
  if (tools.some(tool => !tool || !ACTION_TOOLS.includes(tool.name))) throw new Error('الأداة المطلوبة غير مسموحة.');
  if (tools.some(tool => ['undo', 'stop_listening'].includes(tool.name)) && tools.length !== 1) throw new Error('اطلب التراجع أو إيقاف الاستماع بأمر مستقل.');
  if (tools[0].name === 'undo') return undoAction(original, now);
  const state = clone(original), replies = [];
  const date = localDate(now), timestamp = now.toISOString();
  let stopListening = false;
  for (const tool of tools) {
    const args = tool.args || {};
    const allowedArgs = { log_meal: ['items'], add_water: ['amountMl'], take_supplement: ['supplement'], finish_workout: ['title'], log_set: ['exercise', 'weightKg', 'reps'], log_weight: ['weightKg'], add_shopping: ['names'], remove_shopping: ['name'], prioritize_today: ['kind'], remaining_protein: [], today_summary: [], stop_listening: [] };
    if (typeof args !== 'object' || Array.isArray(args) || Object.keys(args).some(key => !allowedArgs[tool.name]?.includes(key))) throw new Error('معاملات الأداة غير مسموحة.');
    if (tool.name === 'stop_listening') { stopListening = true; replies.push('أوقفت الاستماع.'); continue; }
    if (tool.name === 'remaining_protein') {
      const today = todaySnapshot(state, now);
      replies.push(`باقيلك ${today.remainingProtein} غ بروتين. المسجل اليوم ${today.protein} غ من هدف ${today.targetProtein} غ.`); continue;
    }
    if (tool.name === 'today_summary') { replies.push(summaryReply(state, now)); continue; }
    prepareDay(state, date);
    switch (tool.name) {
      case 'log_meal': {
        if (!Array.isArray(args.items) || !args.items.length || args.items.length > 20) throw new Error('اذكر أصناف الوجبة وكمياتها.');
        const items = args.items.map(item => {
          const food = FOOD_ITEMS.find(food => food.id === item.foodId);
          if (!food) throw new Error('صنف غير معروف. اختره من قاعدة الأطعمة أولاً.');
          const grams = number(item.grams, 1, 3000, 'وزن الطعام');
          return { foodId: food.id, nameAr: food.nameAr, grams, calories: round(food.caloriesPer100g * grams / 100), protein: round(food.proteinPer100g * grams / 100), carbs: round(food.carbsPer100g * grams / 100), fats: round(food.fatsPer100g * grams / 100) };
        });
        if (items.some(item => ['calories', 'protein', 'carbs', 'fats'].some(key => !Number.isFinite(item[key])))) throw new Error('قيم الصنف ناقصة؛ لم أسجل الوجبة.');
        const meal = { id: createId(), date, timestamp, time: now.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }), titleAr: items.map(item => item.nameAr).join(' + '), items, isEstimated: true };
        for (const key of ['calories', 'protein', 'carbs', 'fats']) meal[key] = round(items.reduce((sum, item) => sum + item[key], 0));
        state.loggedMeals.push(meal);
        for (const key of ['Calories', 'Protein', 'Carbs', 'Fats']) state.today[`consumed${key}`] = round(state.loggedMeals.filter(item => item.date === date).reduce((sum, item) => sum + (item[key.toLowerCase()] || 0), 0));
        replies.push(`سجلت الوجبة: ${meal.calories} سعرة و${meal.protein} غ بروتين. تقدير حسب: ${meal.titleAr}.`);
        break;
      }
      case 'add_water': {
        const ml = number(args.amountMl, 1, 3000, 'كمية الماء');
        state.today.consumedWaterLiters = Math.round(((state.today.consumedWaterLiters || 0) + ml / 1000) * 1000) / 1000;
        state.today.consumedGlasses = round(state.today.consumedWaterLiters * 4);
        (state.waterLogs ||= []).push({ id: createId(), date, timestamp, amountMl: ml });
        replies.push(`أضفت ${ml} مل ماء. مجموع اليوم ${Math.round(state.today.consumedWaterLiters * 1000)} مل.`); break;
      }
      case 'take_supplement': {
        const item = uniqueMatch(state.supplementsSchedule || [], name(args.supplement), item => item.nameAr);
        if (item.schedule?.morning?.taken || item.schedule?.evening?.taken) { replies.push(`${item.nameAr} مسجل كمأخوذ اليوم مسبقاً.`); break; }
        for (const slot of Object.values(item.schedule || {})) { slot.taken = true; slot.time = now.toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }); }
        state.actionSupplementTaken ||= {};
        state.actionSupplementTaken[item.id] = now.getTime();
        replies.push(`سجلت تناول ${item.nameAr}.`); break;
      }
      case 'log_set': {
        const exercise = exerciseFor(name(args.exercise));
        if (!exercise) throw new Error('لم أحدد التمرين. اذكر اسمه الكامل من مكتبة التدريب.');
        const weight = number(args.weightKg, 0, 600, 'وزن التمرين'), reps = number(args.reps, 1, 200, 'عدد التكرارات');
        if (!Number.isInteger(reps)) throw new Error('عدد التكرارات يجب أن يكون عدداً صحيحاً.');
        const set = { id: createId(), date, timestamp, exerciseId: exercise.id, nameAr: exercise.nameAr, weight, reps, completed: true };
        (state.exerciseSetLogs ||= []).push(set);
        const active = state.activeWorkoutSession;
        if (active?.currentExercise?.id === exercise.id) {
          active.currentExercise.sets ||= [];
          active.currentExercise.sets.push({ ...set, setNumber: active.currentExercise.sets.length + 1 });
        }
        state.personalRecords ||= {};
        let previous = state.personalRecords[exercise.id];
        const knownSets = (original.activeWorkoutSession?.currentExercise?.id === exercise.id ? original.activeWorkoutSession.currentExercise.sets || [] : []).filter(item => item.completed);
        for (const session of state.workoutHistory || []) {
          for (const entry of session.exercises || []) {
            if (entry.id === exercise.id || exerciseFor(entry.nameAr || entry.nameEn || '')?.id === exercise.id) {
              if (Array.isArray(entry.sets)) knownSets.push(...entry.sets.filter(item => item.completed !== false));
            }
          }
        }
        for (const known of knownSets) {
          if (Number.isFinite(known.weight) && Number.isFinite(known.reps) && (!previous || known.weight > previous.weight || (known.weight === previous.weight && known.reps > previous.reps))) previous = { ...known, nameAr: exercise.nameAr, exerciseId: exercise.id };
        }
        const isPR = !previous || weight > previous.weight || (weight === previous.weight && reps > previous.reps);
        state.personalRecords[exercise.id] = isPR ? { ...set } : previous;
        if (exercise.id === 'flat-barbell-bench-press' && isPR && state.progressReport) {
          state.progressReport.currentDay.benchPressKg = weight;
          (state.progressReport.strengthTrendData ||= []).push({ date, day: state.progressReport.periodDays || 0, weight });
        }
        replies.push(`سجلت ${exercise.nameAr}: ${weight} كغ × ${reps}.${isPR ? ' أفضل مجموعة مسجلة لهذا التمرين (PR).' : ''}`); break;
      }
      case 'finish_workout': {
        const title = name(args.title);
        state.workoutHistory ||= [];
        if (state.workoutHistory.some(item => item.date === date && normalizeCommand(item.title) === normalizeCommand(title))) { replies.push('هذا التمرين مسجل كمكتمل اليوم مسبقاً.'); break; }
        const sets = (state.exerciseSetLogs || []).filter(item => item.date === date && !item.workoutId);
        const activeExercise = state.activeWorkoutSession?.currentExercise;
        if (state.activeWorkoutSession?.startedAtTimestamp && localDate(new Date(state.activeWorkoutSession.startedAtTimestamp)) === date) {
          for (const activeSet of activeExercise?.sets || []) {
            if (activeSet.completed && !sets.some(set => activeSet.id && set.id === activeSet.id) && Number.isFinite(activeSet.weight) && Number.isFinite(activeSet.reps)) sets.push({ ...activeSet, exerciseId: activeExercise.id, nameAr: activeExercise.nameAr });
          }
        }
        const id = createId();
        const exercises = [...new Set(sets.map(item => item.exerciseId))].map(exerciseId => {
          const group = sets.filter(item => item.exerciseId === exerciseId);
          const best = group.reduce((a, b) => a.weight > b.weight || (a.weight === b.weight && a.reps > b.reps) ? a : b);
          return { id: exerciseId, nameAr: best.nameAr, sets: clone(group), setsCount: group.length, bestSet: `${best.weight} كغ × ${best.reps} تكرار` };
        });
        sets.forEach(set => { set.workoutId = id; });
        state.workoutHistory.unshift({ id, title, date, timestamp, dateLabel: now.toLocaleDateString('ar'), durationMinutes: state.activeWorkoutSession?.startedAtTimestamp ? Math.max(0, Math.round((now.getTime() - state.activeWorkoutSession.startedAtTimestamp) / 60000)) : 0, totalSets: sets.length, totalReps: sets.reduce((sum, set) => sum + set.reps, 0), totalVolumeKg: sets.reduce((sum, set) => sum + set.weight * set.reps, 0), exercises });
        Object.assign(state.today, { isWorkoutCompleted: true, workoutStatus: 'completed', todayWorkoutTitleAr: title });
        if (state.activeWorkoutSession) state.activeWorkoutSession.startedAtTimestamp = null;
        replies.push(`سجلت إكمال تمرين ${title}.${sets.length ? ` معه ${sets.length} مجموعة مسجلة.` : ' تفاصيل المجموعات غير مسجلة.'}`); break;
      }
      case 'log_weight': {
        const weight = number(args.weightKg, 20, 500, 'وزن الجسم');
        state.weightLogs ||= [];
        state.weightLogs = state.weightLogs.filter(item => item.date !== date);
        state.weightLogs.push({ id: createId(), date, timestamp, weight });
        state.userProfile.currentWeight = weight;
        if (state.progressReport) {
          const report = state.progressReport;
          report.currentDay = { ...report.currentDay, date, weight };
          report.weightChangeKg = round(weight - (report.firstDay?.weight || state.userProfile.startWeight || weight));
          report.weightTrendData = (report.weightTrendData || []).filter(item => item.date !== date);
          report.weightTrendData.push({ date, day: report.periodDays || 0, weight });
        }
        replies.push(`سجلت وزن اليوم ${weight} كغ.`); break;
      }
      case 'add_shopping': {
        if (!Array.isArray(args.names) || !args.names.length || args.names.length > 30) throw new Error('اذكر أصناف المشتريات.');
        state.shoppingItems = shoppingItemsFor(state);
        for (const value of args.names) {
          const itemName = name(value);
          if (!state.shoppingItems.some(item => normalizeCommand(item.name) === normalizeCommand(itemName))) state.shoppingItems.push({ id: createId(), name: itemName, category: 'أصناف مخصصة', unit: 'حسب الحاجة', checked: false });
        }
        replies.push('حدثت قائمة المشتريات.'); break;
      }
      case 'remove_shopping': {
        state.shoppingItems = shoppingItemsFor(state);
        const item = uniqueMatch(state.shoppingItems, name(args.name), item => item.name);
        state.shoppingItems = state.shoppingItems.filter(other => other !== item);
        replies.push(`شلت ${item.name} من المشتريات.`); break;
      }
      case 'prioritize_today': {
        if (!TODAY_KINDS.includes(args.kind)) throw new Error('أولوية اليوم غير صالحة.');
        state.today.actionOrder = [args.kind, ...TODAY_KINDS.filter(kind => kind !== args.kind)];
        replies.push('حدثت ترتيب أولويات اليوم.'); break;
      }
    }
  }
  const patches = [];
  for (const key of ALLOWED_ROOTS) diff(original[key], state[key], [key], patches);
  if (patches.length) state.actionHistory = [...(original.actionHistory || []).slice(-19), { id: createId(), owner: original.auth?.user?.id || 'local', date, timestamp, tools: tools.map(tool => tool.name), patches }];
  return { state: patches.length ? state : original, reply: replies.join('\n'), changed: !!patches.length, stopListening };
}

function diff(before, after, path, patches) {
  if (JSON.stringify(before) === JSON.stringify(after)) return;
  if (before && after && typeof before === 'object' && typeof after === 'object' && !Array.isArray(before) && !Array.isArray(after)) {
    for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) diff(before[key], after[key], [...path, key], patches);
  } else patches.push({ path, before: clone(before), after: clone(after), hadBefore: before !== undefined });
}

function undoAction(original, now) {
  const entry = original.actionHistory?.at(-1);
  if (!entry) throw new Error('لا يوجد إجراء للتراجع عنه.');
  if (entry.owner !== (original.auth?.user?.id || 'local')) throw new Error('هذا الإجراء مرتبط بحساب آخر.');
  if (entry.date !== localDate(now)) throw new Error('هذا الإجراء من يوم سابق. عدّل السجل المطلوب مباشرة.');
  if (!Array.isArray(entry.patches) || entry.patches.some(patch => !Array.isArray(patch.path) || !ALLOWED_ROOTS.includes(patch.path[0]) || patch.path.some(part => ['__proto__', 'constructor', 'prototype'].includes(part)))) throw new Error('سجل التراجع غير صالح.');
  for (const patch of entry.patches) {
    const current = patch.path.reduce((value, key) => value?.[key], original);
    if (JSON.stringify(current) !== JSON.stringify(patch.after)) throw new Error('تغير هذا السجل بعد الإجراء. عدّله مباشرة حتى لا نخسر تعديلاتك الأحدث.');
  }
  const state = clone(original);
  for (const patch of entry.patches) {
    const parent = patch.path.slice(0, -1).reduce((value, key) => value[key], state);
    const key = patch.path.at(-1);
    if (patch.hadBefore) parent[key] = clone(patch.before); else delete parent[key];
  }
  state.actionHistory = state.actionHistory.slice(0, -1);
  return { state, changed: true, reply: 'رجعت آخر إجراء وكل التغييرات المرتبطة فيه.' };
}
