/**
 * NEON ACTION AGENT - محلل الأوامر الطبيعية وسياق المحادثة (Action Parser)
 * يفهم اللهجات العربية والإنجليزية والمصطلحات الرياضية والفرانكو
 * ويدعم الأوامر المتعددة في جملة واحدة وتصحيح الأخطاء اللحظي (Context Memory & Corrections).
 */

import { FOOD_ITEMS } from '../data/foods.js';
import { EXERCISES } from '../data/exercises.js';

export function normalizeText(text) {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '') // حذف التشكيل
    .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) // تحويل الأرقام الهندية للعربية
    .replace(/٫/g, '.')
    .trim();
}

// قواميس مرادفات الأطعمة والتمارين الشائعة
const FOOD_ALIASES = {
  'دجاج': 'chicken-breast-cooked',
  'صدر': 'chicken-breast-cooked',
  'صدر دجاج': 'chicken-breast-cooked',
  'صدور دجاج': 'chicken-breast-cooked',
  'صدور': 'chicken-breast-cooked',
  'سدر': 'chicken-breast-cooked',
  'سدر دجاج': 'chicken-breast-cooked',
  'سدور': 'chicken-breast-cooked',
  'سدور دجاج': 'chicken-breast-cooked',
  'دجاج مشوي': 'chicken-breast-cooked',
  'دجاج مطبوخ': 'chicken-breast-cooked',
  'دجاج نيء': 'chicken-breast-raw',
  'chicken': 'chicken-breast-cooked',
  'chicken breast': 'chicken-breast-cooked',
  'رز': 'white-rice-cooked',
  'ارز': 'white-rice-cooked',
  'رز ابيض': 'white-rice-cooked',
  'ارز ابيض': 'white-rice-cooked',
  'rice': 'white-rice-cooked',
  'white rice': 'white-rice-cooked',
  'بطاطا': 'boiled-potatoes',
  'بطاطس': 'boiled-potatoes',
  'بطاطا مسلوقه': 'boiled-potatoes',
  'شوفان': 'rolled-oats',
  'oats': 'rolled-oats',
  'oatmeal': 'rolled-oats',
  'بيض': 'whole-eggs-boiled',
  'بيض مسلوق': 'whole-eggs-boiled',
  'بيض مقلي': 'whole-eggs-boiled',
  'eggs': 'whole-eggs-boiled',
  'egg': 'whole-eggs-boiled',
  'لحم': 'beef-cooked',
  'لحمة': 'beef-cooked',
  'لحم عجل': 'beef-cooked',
  'تونه': 'canned-tuna',
  'تونة': 'canned-tuna',
  'tuna': 'canned-tuna',
  'سلمون': 'baked-salmon',
  'salmon': 'baked-salmon',
  'زيت زيتون': 'olive-oil',
  'olive oil': 'olive-oil',
  'سلطه': 'green-salad',
  'سلطة': 'green-salad',
  'موز': 'banana',
  'تفاح': 'apple',
  'لوز': 'raw-almonds'
};

const EXERCISE_ALIASES = {
  'بنش': 'flat-barbell-bench-press',
  'بنش برس': 'flat-barbell-bench-press',
  'بنش بريس': 'flat-barbell-bench-press',
  'bench': 'flat-barbell-bench-press',
  'bench press': 'flat-barbell-bench-press',
  'flat bench': 'flat-barbell-bench-press',
  'بنش عالي': 'incline-bench-press',
  'بنش مائل': 'incline-bench-press',
  'incline bench': 'incline-bench-press',
  'incline bench press': 'incline-bench-press',
  'سكوات': 'barbell-back-squat',
  'squat': 'barbell-back-squat',
  'squats': 'barbell-back-squat',
  'ديدلفت': 'conventional-deadlift',
  'deadlift': 'conventional-deadlift',
  'سحب ظهر': 'lat-pulldown',
  'سحب': 'lat-pulldown',
  'lat pulldown': 'lat-pulldown',
  'تجديف': 'barbell-bent-over-row',
  'row': 'barbell-bent-over-row',
  'ضغط كتف': 'overhead-press-barbell',
  'كتف': 'overhead-press-barbell',
  'overhead press': 'overhead-press-barbell',
  'ohp': 'overhead-press-barbell',
  'بايسبس': 'barbell-biceps-curl',
  'باي': 'barbell-biceps-curl',
  'biceps': 'barbell-biceps-curl',
  'ترايسبس': 'cable-triceps-pushdown',
  'تراي': 'cable-triceps-pushdown',
  'triceps': 'cable-triceps-pushdown'
};

function matchFood(name) {
  const norm = normalizeText(name);
  if (FOOD_ALIASES[norm]) {
    const found = FOOD_ITEMS.find(f => f.id === FOOD_ALIASES[norm]);
    if (found) return found;
  }
  const match = FOOD_ITEMS.find(f => {
    const fAr = normalizeText(f.nameAr);
    const fEn = normalizeText(f.nameEn);
    return fAr === norm || fEn === norm || fAr.includes(norm) || norm.includes(fAr);
  });
  return match || null;
}

function matchExercise(name) {
  const norm = normalizeText(name);
  if (EXERCISE_ALIASES[norm]) {
    const found = EXERCISES.find(ex => ex.id === EXERCISE_ALIASES[norm]);
    if (found) return found;
  }
  const match = EXERCISES.find(ex => {
    const exAr = normalizeText(ex.nameAr);
    const exEn = normalizeText(ex.nameEn);
    return exAr === norm || exEn === norm || exAr.includes(norm) || norm.includes(exAr);
  });
  return match || { id: norm.replace(/\s+/g, '-'), nameAr: name, nameEn: name };
}

/**
 * فك تشفير كمية الماء من أي صياغة عربية أو إنجليزية
 */
function parseWaterAmount(text) {
  const norm = normalizeText(text);
  if (norm.includes('لترين') || norm.includes('2 لتر') || norm.includes('2l') || norm.includes('2 liter')) {
    return 2000;
  }
  if (norm.includes('لتر ونصف') || norm.includes('لتر ونص') || norm.includes('1.5 لتر') || norm.includes('1.5l')) {
    return 1500;
  }
  if (norm.includes('نصف لتر') || norm.includes('نص لتر') || norm.includes('0.5 لتر') || norm.includes('half liter')) {
    return 500;
  }
  if (norm.includes('لتر') || norm.includes('1 لتر') || norm.includes('1l') || norm.includes('liter')) {
    return 1000;
  }
  if (norm.includes('كاستين') || norm.includes('كوبين') || norm.includes('2 كاس')) {
    return 500;
  }
  if (norm.includes('كاسه') || norm.includes('كاسة') || norm.includes('كوب') || norm.includes('glass') || norm.includes('cup')) {
    return 250;
  }
  const match = norm.match(/(\d+(?:\.\d+)?)\s*(مل|ملل|ملليلتر|لتر|كاسه|كوب|ml|l|liter|liters)/);
  if (match) {
    const val = parseFloat(match[1]);
    const unit = match[2];
    if (unit.startsWith('لتر') || unit === 'l' || unit.startsWith('liter')) return Math.round(val * 1000);
    if (unit.startsWith('كاس') || unit.startsWith('كوب')) return Math.round(val * 250);
    return Math.round(val);
  }
  return null;
}

/**
 * فك تشفير أجزاء الوجبة (أكلت 250 غ دجاج و 200 غ رز)
 */
function parseMealItems(text) {
  const norm = normalizeText(text)
    .replace(/^(?:احسبلي|احسب|سجل وجبه|سجلت وجبه|سجلت|سجل|ضيف|حط|اكلت|تناولت|فطرت|تغديت|تعشيت|كلت|وجبه|وجبة|i ate|had|ate|log meal|log)\s+/, '')
    .trim();

  // تقسيم الأصناف بحرف الواو أو الفواصل
  const segments = norm.split(/\s+و\s*|\s*[,،+]\s*|\s+and\s+/).filter(Boolean);
  const items = [];

  for (const seg of segments) {
    // 1) صيغة: "250 غ دجاج" أو "250 جرام سدر دجاج" أو "250g chicken"
    let m = seg.match(/^(\d+(?:\.\d+)?)\s*(?:غرام|جرام|غ|غم|جم|g|grams?)?\s+(.+)$/i);
    // 2) صيغة بديلة: "دجاج 250 غ" أو "سدر دجاج 250 جرام"
    if (!m || isNaN(parseFloat(m[1]))) {
      m = seg.match(/^(.+?)\s+(\d+(?:\.\d+)?)\s*(?:غرام|جرام|غ|غم|جم|g|grams?)?$/i);
      if (m) m = [m[0], m[2], m[1]]; // توحيد الترتيب
    }

    if (m && !isNaN(parseFloat(m[1]))) {
      const grams = parseFloat(m[1]);
      const foodName = m[2].trim().replace(/^(?:من|جرام|غرام|غ|غم|جم)\s+/, '');
      const food = matchFood(foodName);

      if (food) {
        items.push({
          foodId: food.id,
          nameAr: food.nameAr,
          grams,
          calories: Math.round(((food.caloriesPer100g || 100) * grams) / 100),
          protein: Math.round(((food.proteinPer100g || 10) * grams) / 10 * 10) / 10,
          carbs: Math.round(((food.carbsPer100g || 10) * grams) / 10 * 10) / 10,
          fats: Math.round(((food.fatsPer100g || 2) * grams) / 10 * 10) / 10,
          isEstimated: false
        });
      } else {
        // صنف خارجي غير موجود بقاعدة البيانات - تقدير معتدل مع الإشارة
        items.push({
          foodId: 'custom-' + foodName.replace(/\s+/g, '-'),
          nameAr: foodName,
          grams,
          calories: Math.round(1.5 * grams),
          protein: Math.round(0.12 * grams),
          carbs: Math.round(0.15 * grams),
          fats: Math.round(0.04 * grams),
          isEstimated: true
        });
      }
    }
  }

  return items;
}

/**
 * فك تشفير تمرين وأوزان وجولات
 */
function parseWorkoutSets(text) {
  const norm = normalizeText(text);

  // مثال 1: "عملت بنش 80 كيلو 3 جولات كل جولة 8 عدات" أو "بنش بريس 80 كيلو 3 جولات 8 عدات"
  let match = norm.match(/(?:عملت|لعبت|سجلت|سجل|تمرين)?\s*(.+?)\s+(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|ك|kg)?\s*(?:،|,)?\s*(\d+)\s*(?:جولات|مجموعات|sets?)\s*(?:كل جوله|كل جولة)?\s*(?:بـ|ب|x|×)?\s*(\d+)\s*(?:عدات|تكرار|reps?)?/i);
  if (match) {
    const exName = match[1].trim().replace(/^(عملت|لعبت|سجلت|سجل)\s+/, '');
    const weight = parseFloat(match[2]);
    const sets = parseInt(match[3], 10);
    const reps = parseInt(match[4], 10);
    const exercise = matchExercise(exName);
    return {
      exercise: exercise.nameAr || exName,
      exerciseId: exercise.id,
      weightKg: weight,
      sets: sets || 1,
      reps: reps || 10
    };
  }

  // مثال 2: "عملت بنش 80 كيلو 8 عدات" (جولة واحدة)
  match = norm.match(/(?:عملت|لعبت|سجلت|سجل)?\s*(.+?)\s+(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|ك|kg)\s*(?:،|,)?\s*(\d+)\s*(?:عدات|تكرار|reps?)/i);
  if (match) {
    const exName = match[1].trim().replace(/^(عملت|لعبت|سجلت|سجل)\s+/, '');
    const weight = parseFloat(match[2]);
    const reps = parseInt(match[3], 10);
    const exercise = matchExercise(exName);
    return {
      exercise: exercise.nameAr || exName,
      exerciseId: exercise.id,
      weightKg: weight,
      sets: 1,
      reps: reps
    };
  }

  // مثال 3: بالبنش 80، أول جولتين 10 عدات وآخر جولة 8
  if (norm.includes('اول جولتين') || norm.includes('اخر جوله') || norm.includes('اخر جولة')) {
    const exMatch = norm.match(/(?:ب|في|لعبت)?\s*(بنش|سكوات|ديدلفت|[a-z\s]+)\s+(\d+)/);
    if (exMatch) {
      const exercise = matchExercise(exMatch[1]);
      const weight = parseFloat(exMatch[2]);
      return {
        exercise: exercise.nameAr,
        exerciseId: exercise.id,
        weightKg: weight,
        sets: 3,
        reps: 10,
        customBreakdown: [
          { setNumber: 1, weight, reps: 10 },
          { setNumber: 2, weight, reps: 10 },
          { setNumber: 3, weight, reps: 8 }
        ]
      };
    }
  }

  return null;
}

/**
 * المحلل الرئيسي للأوامر الطبيعية مع دعم الذاكرة وتصحيح السياق (Context Memory)
 */
export function parseNaturalAction(rawText, sessionContext = {}) {
  const norm = normalizeText(rawText);
  if (!norm) return null;

  const actions = [];
  let reply = '';
  let clarificationNeeded = null;

  // 1. أوامر التحكم المباشرة (Stop & Undo)
  if (/(?:نيون\s+)?(?:وقف|اوقف|توقف عن|كافي|stop)\s+(?:استماع|الاستماع|تسجيل|التسجيل|مايك|listening)|(?:stop listening|mute)/i.test(norm)) {
    return {
      type: 'actions',
      actions: [{ tool: 'stopVoiceSession', arguments: {} }],
      reply: 'أوقفت الاستماع.'
    };
  }

  if (/(?:تراجع|رجع|الغ|إلغاء)\s*(?:اخر|آخر)?\s*(?:شغله|شغلة|اشي|شي|عمل|عملتها|سويتها|تغيير|حاجة|حاجه)|(?:undo)/i.test(norm)) {
    return {
      type: 'actions',
      actions: [{ tool: 'undoLastAction', arguments: {} }],
      reply: 'رجعت آخر إجراء.'
    };
  }

  // أولوية اليوم: "خلّي التمرين أهم شي اليوم"
  const prioMatch = norm.match(/(?:خلي|خلّي|حط|اجعل)?\s*(التمرين|تمرين|التغذية|تغذية|الاكل|الماء|المي|ماء|مي|المكملات|مكملات|workout|nutrition|water|supplements)\s*(?:اهم شي|اهم شيء|اول شي|اول شيء|اولوية|رقم واحد)/i) ||
    norm.match(/(?:تقديم|ترتيب)?\s*(?:اولوية|أولوية)\s*(التمرين|تمرين|التغذية|تغذية|الماء|المي|المكملات)/i);
  if (prioMatch) {
    const rawKind = prioMatch[1];
    let kind = 'workout';
    if (/تمرين|workout/.test(rawKind)) kind = 'workout';
    else if (/تغذي|اكل|طعام|nutrition/.test(rawKind)) kind = 'nutrition';
    else if (/ماء|مي|water/.test(rawKind)) kind = 'water';
    else if (/مكمل|supplements/.test(rawKind)) kind = 'supplements';

    return {
      type: 'actions',
      actions: [{ tool: 'prioritize_today', arguments: { priority: kind, kind } }],
      reply: 'حدثت أولويات اليوم وخليتها رقم 1.'
    };
  }

  // 2. معالجة التصحيحات المباشرة بناءً على سياق الجلسة السابقة (Correction handling)
  // مثال: "لا، قصدي نص لتر" أو "قصدي 78.9"
  const isCorrection = /^(?:لا\s*،?\s*)?(?:قصدي|تعديل|بل|بدل|عفوا)\s+(.+)$/i.test(norm) ||
    /^(?:لا\s*،?\s*)(?:وزني|شربت|الوزن|المي)\s+(.+)$/i.test(norm);

  if (isCorrection) {
    const corrBody = norm.replace(/^(?:لا\s*،?\s*)?(?:قصدي|تعديل|بل|بدل|عفوا)\s+/, '');

    // تصحيح ماء
    const waterAmt = parseWaterAmount(corrBody);
    if (waterAmt !== null) {
      return {
        type: 'actions',
        actions: [{ tool: 'updateWater', arguments: { milliliters: waterAmt } }],
        reply: `عدلتها لـ ${waterAmt} مل.`
      };
    }

    const weightMatch = corrBody.match(/(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|kg)?/);

    // تصحيح تمرين سابق: "لا قصدي 85 كيلو" عندما يكون آخر سياق هو تمرين
    if (sessionContext.lastExercise && weightMatch && !norm.includes('وزن')) {
      const w = parseFloat(weightMatch[1]);
      const prevSets = sessionContext.lastSets || 3;
      const prevReps = sessionContext.lastReps || 8;
      return {
        type: 'actions',
        actions: [{
          tool: 'logWorkoutSets',
          arguments: {
            exercise: sessionContext.lastExercise,
            weightKg: w,
            sets: prevSets,
            reps: prevReps
          }
        }],
        reply: `عدلته إلى ${sessionContext.lastExercise} ${w} كغ.`
      };
    }

    // تصحيح وزن الجسم: "قصدي 78.9"
    if (weightMatch && parseFloat(weightMatch[1]) >= 30 && parseFloat(weightMatch[1]) <= 300) {
      const w = parseFloat(weightMatch[1]);
      return {
        type: 'actions',
        actions: [{ tool: 'updateWeight', arguments: { weightKg: w } }],
        reply: `عدلت الوزن إلى ${w} كغ.`
      };
    }
  }

  // 3. معالجة الرد على سؤال توضيحي سابق (Clarification follow-up)
  if (sessionContext.pendingClarification === 'workout_sets_reps' && sessionContext.pendingExercise) {
    const setsMatch = norm.match(/(\d+)\s*(?:جولات|مجموعات|sets?)/i);
    const repsMatch = norm.match(/(\d+)\s*(?:عدات|تكرار|reps?)/i);
    if (setsMatch || repsMatch) {
      const sets = setsMatch ? parseInt(setsMatch[1], 10) : 3;
      const reps = repsMatch ? parseInt(repsMatch[1], 10) : 8;
      const weight = sessionContext.pendingWeight || 80;
      return {
        type: 'actions',
        actions: [{
          tool: 'logWorkoutSets',
          arguments: {
            exercise: sessionContext.pendingExercise,
            weightKg: weight,
            sets,
            reps
          }
        }],
        reply: 'سجلتهم.'
      };
    }
  }

  // 4. استعلامات اليوم (Read-only queries)
  if (/(?:شو|كم|قديش)\s+(?:باقيلي|باقي لي|ضايل|متبقي)\s+(?:من\s+)?(?:البروتين|بروتين)/i.test(norm)) {
    return {
      type: 'actions',
      actions: [{ tool: 'getTodayNutrition', arguments: { query: 'remaining_protein' } }],
      reply: ''
    };
  }

  if (/(?:شو عندي اليوم|شو علي اليوم|ملخص اليوم|اعطيني تقرير اليوم)/i.test(norm)) {
    return {
      type: 'actions',
      actions: [{ tool: 'getTodaySummary', arguments: {} }],
      reply: ''
    };
  }

  // 5. تفكيك الجملة إلى عدة أوامر إذا كانت متعددة (Multi-action splitter)
  // نقسم بحروف الربط مع الحفاظ على ترابط أجزاء الوجبة (مثل دجاج ورز)
  const segments = norm.split(/(?:،|,|\s+ثم\s+|\s+وايضا\s+|\s+وكمان\s+)/).filter(Boolean);

  for (const seg of segments) {
    const s = seg.trim();

    // أ) الماء
    if ((/(?:شربت|زود|زيد|كاسه|كوب|لتر|ماء|مي|water)/i.test(s) || (/(?:ضيف|اضف)/i.test(s) && /(?:ماء|مي|كاسه|كوب|لتر)/i.test(s))) && !/(?:تمرين|وزن|اكلت|قائمه|قائمة|مشتريات|تسوق)/.test(s)) {
      const ml = parseWaterAmount(s);
      if (ml) {
        actions.push({ tool: 'logWater', arguments: { milliliters: ml } });
      }
    }

    // ب) الوزن
    const wMatch = s.match(/(?:وزني(?: اليوم)?|سجل وزني|وزن اليوم)\s*(?:هو|صار)?\s*(\d+(?:\.\d+)?)\s*(?:كيلو|كغ|kg)?/i) ||
      s.match(/^(\d{2,3}(?:\.\d+)?)\s*(?:كيلو|كغ|kg)$/i);
    if (wMatch && parseFloat(wMatch[1]) >= 30 && parseFloat(wMatch[1]) <= 300) {
      actions.push({ tool: 'logWeight', arguments: { weightKg: parseFloat(wMatch[1]) } });
    }

    // ج) المكملات
    if (/(?:اخذت|اخدت|تناولت|بلعت|شربت مكمل)\s+(?:ال)?(كرياتين|بروتين|فيتامين|اوميغا|مغنيسيوم|creatine|protein|ashwagandha)/i.test(s)) {
      const suppMatch = s.match(/(?:اخذت|اخدت|تناولت|بلعت|شربت مكمل)\s+(.+)$/i);
      if (suppMatch) {
        actions.push({
          tool: 'markSupplementTaken',
          arguments: { supplement: suppMatch[1].trim() }
        });
      }
    }

    // د) قياسات الجسم (محيط الخصر، الصدر)
    const waistMatch = s.match(/(?:خصري|محيط خصري|الخصر)\s*(?:صار|قياسه)?\s*(\d+(?:\.\d+)?)\s*(?:سم|cm)?/i);
    if (waistMatch) {
      actions.push({
        tool: 'logBodyMeasurement',
        arguments: { waistCm: parseFloat(waistMatch[1]) }
      });
    }

    // هـ) الخطوات
    const stepsMatch = s.match(/(?:مشيت|قطعت|سجل)\s*(\d+)\s*(?:خطوه|خطوة|step|steps)/i);
    if (stepsMatch) {
      actions.push({
        tool: 'logSteps',
        arguments: { stepsCount: parseInt(stepsMatch[1], 10) }
      });
    }

    // و) النوم
    const sleepMatch = s.match(/(?:نمت|ساعات النوم)\s*(\d+(?:\.\d+)?)\s*(?:ساعات|ساعه|ساعة|hours?)/i);
    if (sleepMatch) {
      actions.push({
        tool: 'logSleep',
        arguments: { sleepHours: parseFloat(sleepMatch[1]) }
      });
    }

    // ز) الطاقة والمزاج
    const energyMatch = s.match(/(?:طاقتي|مستوى طاقتي|الطاقه)\s*(?:اليوم)?\s*(\d+)\s*(?:من 5)?/i);
    if (energyMatch) {
      actions.push({
        tool: 'logEnergy',
        arguments: { energyLevel: parseInt(energyMatch[1], 10) }
      });
    }

    // ح) إنهاء التمرين
    const finishMatch = s.match(/(?:خلصت|انهيت|اكملت)\s+(?:تمرين\s*(.*)|التمرين)$/i);
    if (finishMatch) {
      const title = (finishMatch[1] && finishMatch[1].trim()) ? finishMatch[1].trim() : 'تمرين اليوم';
      actions.push({
        tool: 'completeWorkout',
        arguments: { title }
      });
    }

    // ط) التدريب والجولات
    const workoutData = parseWorkoutSets(s);
    if (workoutData) {
      actions.push({
        tool: 'logWorkoutSets',
        arguments: workoutData
      });
    } else if (/(?:لعبت|عملت|سويت)\s+(بنش|سكوات|ديدلفت)\s+(\d+)\s*(?:كيلو|كغ)?$/i.test(s)) {
      // حالة نقص الجولات والعدات: تتطلب توضيحاً
      const m = s.match(/(?:لعبت|عملت|سويت)\s+(بنش|سكوات|ديدلفت)\s+(\d+)/i);
      clarificationNeeded = {
        type: 'clarification',
        pendingClarification: 'workout_sets_reps',
        pendingExercise: m[1],
        pendingWeight: parseFloat(m[2]),
        reply: 'كم جولة وكم عدة؟'
      };
    }

    // ي) الوجبات والتغذية
    if (/(?:اكلت|تناولت|فطرت|تغديت|تعشيت|وجبه|وجبة|غرام|جرام|غ\b|غم\b|جم\b|احسب|احسبلي|سدر|صدر|صدور)/i.test(s)) {
      const mealItems = parseMealItems(s);
      if (mealItems.length > 0) {
        actions.push({
          tool: 'logMeal',
          arguments: { items: mealItems }
        });
      }
    }

    // ك) قائمة المشتريات
    const shopAddMatch = s.match(/(?:ضيف|اضف|حط)\s+(.+?)\s+(?:لقائمه|لقائمة|على قائمة|للمشتريات|للتسوق|على المشتريات)/i);
    if (shopAddMatch) {
      const names = shopAddMatch[1].split(/\s+و\s*|\s*[,،+]\s*/).map(n => n.trim()).filter(Boolean);
      actions.push({
        tool: 'addShoppingItems',
        arguments: { names }
      });
    }

    const shopRemMatch = s.match(/(?:شيل|احذف|امسح)\s+(.+?)(?:\s+من (?:قائمة )?المشتريات)?$/i);
    if (shopRemMatch && !/(?:وجبه|وجبة|تمرين|مجموعه|مجموعة)/.test(shopRemMatch[1])) {
      actions.push({
        tool: 'removeShoppingItem',
        arguments: { name: shopRemMatch[1].trim() }
      });
    }
  }

  if (clarificationNeeded && actions.length === 0) {
    return clarificationNeeded;
  }

  if (actions.length > 0) {
    // إعداد رد مقتضب ومناسب
    if (actions.length === 1) {
      const a = actions[0];
      if (a.tool === 'logWater') reply = 'تسجل.';
      else if (a.tool === 'logWeight') reply = 'سجلته.';
      else if (a.tool === 'logWorkoutSets') reply = 'تم.';
      else if (a.tool === 'logMeal') reply = 'سجلت الوجبة.';
      else if (a.tool === 'markSupplementTaken') reply = 'تم.';
      else reply = 'تم.';
    } else {
      reply = 'سجلتهم كلهم.';
    }

    return {
      type: 'actions',
      actions,
      reply
    };
  }

  return null;
}
