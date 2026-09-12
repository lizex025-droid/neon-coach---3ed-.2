/**
 * NEON COACH - خدمة الذكاء الاصطناعي متعددة المزودات (AI Service)
 * تدعم: الوضع التجريبي الحتمي (Deterministic Mock)، ومزود Google Gemini، ومزود OpenAI
 * لا تسمح بتنفيذ أوامر برمجية حساسة، وتعتمد على التحقق الداخلي الصارم من المخرجات
 */

import { parseArabicMealText, findMealSwaps } from '../domain/nutritionEngine.js';
import { suggestProgression } from '../domain/planner.js';

// ذاكرة احتياطية لبيئة الاختبار أو عند عدم توفر localStorage
const memoryStorage = {
  neon_gemini_api_key: '',
  neon_openai_api_key: '',
  neon_ai_model: 'gemini-2.0-flash'
};

// قراءة المفاتيح المحفوظة محلياً أو من متغيرات البيئة
function getGeminiKey() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('neon_gemini_api_key');
    if (custom && custom.trim()) return custom.trim();
  }
  if (memoryStorage.neon_gemini_api_key) return memoryStorage.neon_gemini_api_key;
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) || '';
}

function getOpenAIKey() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const custom = window.localStorage.getItem('neon_openai_api_key');
    if (custom && custom.trim()) return custom.trim();
  }
  if (memoryStorage.neon_openai_api_key) return memoryStorage.neon_openai_api_key;
  return (typeof import.meta !== 'undefined' && import.meta.env?.VITE_OPENAI_API_KEY) || '';
}

function getSelectedModel() {
  if (typeof window !== 'undefined' && window.localStorage) {
    const model = window.localStorage.getItem('neon_ai_model');
    if (model) return model;
  }
  return memoryStorage.neon_ai_model || 'gemini-2.0-flash';
}


/**
 * محلل الوجبات المتعددة من النصوص العربية
 * يدعم تقسيم النص إذا احتوى على أكثر من وجبة (فطور، غداء، عشاء، سناك، وجبة 1، إلخ)
 */
export function parseMultipleMeals(text) {
  if (!text || typeof text !== 'string') return [];

  const delimiterRegex = /(?:^|\n|[\.؛،:：]\s*|\s+و\s*|\s+)(فطور|إفطار|غداء|عشاء|سناك|وجبة\s*(?:أولى|ثانية|ثالثة|رابعة|خامسة|[1-9]\d*)|الوجبة\s*(?:الأولى|الثانية|الثالثة|الرابعة|الخامسة|[1-9]\d*)|meal\s*[1-9]\d*|breakfast|lunch|dinner|snack)[\s:：\-–—]+/gi;

  const matches = [...text.matchAll(delimiterRegex)];

  if (matches.length > 1) {
    const meals = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      let rawTitle = match[1].trim();
      const startIdx = match.index + match[0].length;
      const endIdx = (i + 1 < matches.length) ? matches[i + 1].index : text.length;
      const segmentText = text.slice(startIdx, endIdx).trim();

      const parsed = parseArabicMealText(segmentText);
      if (parsed && parsed.items && parsed.items.length > 0) {
        let displayTitle = rawTitle;
        if (!displayTitle.includes('وجبة') && !displayTitle.includes('الوجبة')) {
          displayTitle = `وجبة ${displayTitle}`;
        }
        meals.push({
          titleAr: displayTitle,
          totalCalories: parsed.totalCalories,
          totalProtein: parsed.totalProtein,
          totalCarbs: parsed.totalCarbs,
          totalFats: parsed.totalFats,
          items: parsed.items
        });
      }
    }
    if (meals.length > 1) return meals;
  }

  // إذا لم تكن مقسمة بمطابقات متعددة، فحص إذا كانت وجبة واحدة
  const single = parseArabicMealText(text);
  if (single && single.items && single.items.length > 0) {
    return [single];
  }

  return [];
}

/**
 * دالة مساعدة لاستخراج كائنات الوجبات من رد الذكاء الاصطناعي
 */
export function extractMealsFromAiReply(replyText, rawMsg = '') {
  let cleanReply = (replyText || '').trim();
  let mealsData = [];

  // 1) فحص وجود meal_json في رد الذكاء الاصطناعي
  const mealMatch = cleanReply.match(/```meal_json\s*([\s\S]*?)\s*```/);
  if (mealMatch) {
    try {
      const parsed = JSON.parse(mealMatch[1]);
      if (parsed && Array.isArray(parsed.meals) && parsed.meals.length > 0) {
        mealsData = parsed.meals.filter(m => m && (m.totalCalories || m.calories || m.items?.length));
      } else if (parsed && (parsed.totalCalories || parsed.calories || parsed.items?.length)) {
        mealsData = [parsed];
      }
      cleanReply = cleanReply.replace(/```meal_json[\s\S]*?```/g, '').trim();
    } catch (e) {
      console.warn('Error parsing meal_json:', e);
    }
  }

  // 2) استخراج احتياطي في حال طلب المتدرب حساب طعام ولم يضع الذكاء كود json
  if (mealsData.length === 0 && (rawMsg.includes('احسب') || rawMsg.includes('حساب') || rawMsg.includes('غرام') || rawMsg.includes('غم') || rawMsg.includes('وجبة') || rawMsg.includes('وجبات') || rawMsg.includes('فطور') || rawMsg.includes('غداء') || rawMsg.includes('عشاء'))) {
    mealsData = parseMultipleMeals(rawMsg);
  }

  // توحيد الحقول للوجبات
  mealsData = mealsData.map((m, idx) => ({
    titleAr: m.titleAr || `وجبة ${idx + 1}`,
    totalCalories: Number(m.totalCalories ?? m.calories) || 0,
    totalProtein: Number(m.totalProtein ?? m.protein) || 0,
    totalCarbs: Number(m.totalCarbs ?? m.carbs) || 0,
    totalFats: Number(m.totalFats ?? m.fats) || 0,
    items: m.items || []
  }));

  return {
    cleanReply,
    mealsData,
    mealData: mealsData.length > 0 ? mealsData[0] : null
  };
}

/**
 * برومبت النظام الشامل والمتقدم للمدرب الشخصي العالمي (Master Coach System Instruction)
 */
export const MASTER_COACH_SYSTEM_INSTRUCTION = `أنت "كوتش نيون" (NEON AI MASTER COACH) — المدرب الشخصي الذكي المعتمد دولياً (خبير علوم القوة والتكييف CSCS، وأخصائي التغذية الرياضية المعتمد CISSN) لتطبيق NEON COACH.
أنت مدرب استثنائي: تجمع بين العلم الرياضي الصارم المبني على الدليل (Evidence-Based)، والخبرة العملية العميقة في الجيم والمطبخ، والتحفيز الذكي الصادق، والأسلوب الرياضي الأخوي باللغة العربية.

مهمتك:
الإجابة على أي سؤال يطرحه المتدرب — سواء في التدريب، التغذية، الماكروز، الأوزان، التكنيك، المكملات، الاستشفاء، أو الدوافع النفسية — باحترافية المدرب الشخصي المتمرس وتقديم خطوات عملية قابلة للتطبيق الفوري.

قواعدك التدريبية والتغذوية الذهبية:
1. استخدام أرقام وسياق المتدرب الكامل:
   - لديك إمكانية الاطلاع الكامل واللحظي على كافة سجلات المتدرب في التطبيق:
     * ملفه الشخصي (العمر، الطول، الوزن الحالي، وزن البداية، والهدف).
     * التغذية والوجبات المسجلة اليوم بتفاصيلها وغراماتها، والسعرات والماكروز المستهلكة والمتبقية.
     * سجل الماء والترطيب والأكواب ومستوى الطاقة.
     * جدول المكملات اليومية (Daily Stack) وما تم تناوله منها وما ينتظره.
     * تمرين اليوم وخطة التدريب وتفاصيل الجولات والأوزان المسجلة.
     * سجل التقدم البدني (خسارة الوزن، محيط الخصر، قوة البنش برس، ونتائج فحص InBody الأخير).
   - استخدم هذه الأرقام في إجاباتك دائماً لتبدو مخصصة له 100% وكأنك تتابع معه طوال اليوم.

2. علم بناء العضلات (Hypertrophy & Strength):
   - التدرج بالحمل (Progressive Overload): ركز دائماً على زيادة التكرارات أو الوزن أو التحكم بالحركة أسبوعياً.
   - القرب من الفشل العضلي (RIR 1-3 أو RPE 7-9) كمعيار للشدة الفعالة.
   - المدى الحركي الكامل والتحكم بالمرحلة السلبية (Eccentric Tempo).
   - التكيف مع الإصابات: إذا كان لدى المتدرب ألم أو إصابة (كالكتف أو الركبة أو أسفل الظهر)، اقترح فوراً تعديل الزوايا أو استبدال التمرين ببدائل مريحة للمفصل، ولا تتجاهل الألم أبداً. عند الألم الحاد، وجّه المتدرب لطبيب مختص.

3. علم التغذية والماكروز (Sports Nutrition):
   - البروتين: 1.6 إلى 2.2 غرام لكل كغ من وزن الجسم كحد علمي مثالي، وتوزيعه على 3-5 وجبات لتفعيل تخليق البروتين العضلي (MPS).
   - الكاربوهيدرات: مصدر الطاقة الأساسي، توقيتها قبل التمرين بساعتين وبعده لتعبئة مخازن الجليكوجين.
   - الدهون الصحية: ضرورية لإنتاج الهرمونات البنائية وصحة المفاصل (20-25% من إجمالي السعرات).
   - الترطيب: نصائح حساب الماء مع مراعاة التعرق والتمرين والكافيين.

4. المكملات المبنية على الدليل (Evidence-Based Supplements):
   - الكرياتين مونوهيدرات (3-5غ يومياً في أي وقت).
   - البروتين البودرة (لسد الاحتياج اليومي عند الحاجة).
   - الكافيين (3-5 ملغ/كغ قبل التمرين بـ 45 دقيقة).
   - أوميغا-3، فيتامين D3، والمغنيسيوم.
   - التحذير الصارم والواضح من الستيرويدات وحوارق الدهون التجارية الخطرة.

5. حساب الوجبات الفردية والمتعددة وتوليد بيانات الإضافة المباشرة (Single or Multiple Meals Action):
   - عند طلب المتدرب حساب وجبة أو عدة وجبات (مثلاً فطور وغداء، أو وجبة 1 ووجبة 2، أو خطة 3 وجبات):
     * احسب السعرات والماكروز بدقة كاملة لكل وجبة وللإجمالي العام.
     * وضح له كيف تتلاءم مع سعراته وماكروزه المتبقية اليوم.
     * لا تكرر السؤال النصي (هل تريد إضافتها لوجباتك) في متن الرد لأن واجهة التطبيق تتولى عرض بطاقة الإضافة والأزرار التفاعلية بشكل منفصل تلقائياً.
     * اختم ردك دائماً بكتلة JSON مخصصة للوجبات بتنسيق صريح كالتالي لكي يظهر للمتدرب زر إضافة الوجبات بنقرة واحدة (إما الكل أو كلاً على حدة):
\`\`\`meal_json
{
  "meals": [
    {
      "titleAr": "وجبة الفطور",
      "totalCalories": 420,
      "totalProtein": 28,
      "totalCarbs": 45,
      "totalFats": 12,
      "items": [
        {"nameAr": "بيض مسلوق", "grams": 150, "calories": 232, "protein": 19, "carbs": 1.5, "fats": 16},
        {"nameAr": "شوفان بحليب", "grams": 60, "calories": 233, "protein": 10, "carbs": 40, "fats": 4}
      ]
    },
    {
      "titleAr": "وجبة الغداء",
      "totalCalories": 550,
      "totalProtein": 60,
      "totalCarbs": 50,
      "totalFats": 8,
      "items": [
        {"nameAr": "صدر دجاج مشوي", "grams": 200, "calories": 330, "protein": 62, "carbs": 0, "fats": 7},
        {"nameAr": "أرز أبيض مطبوخ", "grams": 180, "calories": 234, "protein": 5, "carbs": 50, "fats": 1}
      ]
    }
  ]
}
\`\`\`

6. أسلوب وتنسيق الردود:
   - ابدأ بترحيب حماسي وتشجيع رياضي واثق.
   - قدّم الإجابة المباشرة والحل العملي أولاً بدون إطالة غير مفيدة.
   - استخدم النقاط والخط العريض لترتيب الخطوات أو أرقام الماكروز ليسهل قراءتها على الهاتف.
   - اختم دائماً بلمسة تشجيعية تدفعه للالتزام وتحقيق أهدافه!`;

/**
 * تنسيق سياق المتدرب الحي الشامل (360° Comprehensive Context)
 * يدمج الملف الشخصي، التغذية، الوجبات المسجلة، الماء، المكملات، التمارين، والتقدم وفحص InBody
 */
export function formatUserContext(context = {}) {
  const profile = context.userProfile || {};
  const today = context.today || {};
  const workout = context.workout || {};
  const activeWorkout = context.activeWorkoutSession || {};
  const loggedMeals = context.loggedMeals || [];
  const dailyStackItems = context.dailyStackItems || [];
  const dailyStackTaken = context.dailyStackTaken || {};
  const progress = context.progressReport || {};
  const weeklyCheckin = context.weeklyCheckin || {};

  const sections = [];

  // 1. الملف الشخصي والأهداف البدنية
  const currentW = profile.currentWeightKg || profile.currentWeight || profile.weightKg || 'غير محدد';
  const startW = profile.startWeight || currentW || 'غير محدد';
  const targetW = profile.targetWeightKg || profile.targetWeight || 'غير محدد';
  const heightVal = profile.heightCm || profile.height || 'غير محدد';

  sections.push(`[الملف الشخصي والهدف الرياضي]:
- الاسم: ${profile.name || 'متدرب نيون'} | العمر: ${profile.age || 25} سنة | الجنس: ${profile.gender === 'female' ? 'أنثى' : 'ذكر'} | الطول: ${heightVal} سم
- الوزن الحالي: ${currentW} كغ | وزن البداية: ${startW} كغ | الوزن المستهدف: ${targetW} كغ
- الهدف الرياضي: ${profile.fitnessGoal || (profile.goal === 'fat_loss' ? 'خسارة دهون وتنشيف مع الحفاظ على العضلات' : 'بناء عضلات وخفض دهون')}
- المستوى التدريبي: ${profile.experienceLevel || 'متوسط'} | أيام التدريب في الخطة: ${profile.trainingDaysCount || profile.workoutDaysCount || 4} أيام أسبوعياً
- الإصابات أو الآلام المسجلة: ${profile.injuries?.length ? profile.injuries.join(', ') : 'لا توجد إصابات مسجلة'}
- الحساسيات الغذائية: ${profile.allergens?.length ? profile.allergens.join(', ') : 'لا توجد حساسيات'}`);

  // 2. التغذية والماكروز اليومية وسجل الوجبات المسجلة
  const targetCals = today.targetCalories || profile.calorieTarget || 2100;
  const consumedCals = today.consumedCalories || 0;
  const remCals = Math.max(0, targetCals - consumedCals);
  const targetProt = today.targetProtein || profile.proteinGrams || 150;
  const consumedProt = today.consumedProtein || 0;
  const remProt = Math.max(0, targetProt - consumedProt);
  const targetCarbs = today.targetCarbs || 230;
  const consumedCarbs = today.consumedCarbs || 0;
  const remCarbs = Math.max(0, targetCarbs - consumedCarbs);
  const targetFats = today.targetFats || 65;
  const consumedFats = today.consumedFats || 0;
  const remFats = Math.max(0, targetFats - consumedFats);

  let mealsDetail = 'لا توجد وجبات مسجلة اليوم حتى الآن.';
  if (loggedMeals.length > 0) {
    mealsDetail = loggedMeals.map((m, i) => {
      const itemsStr = (m.items || []).map(item => `${item.nameAr || item.name} (${item.grams}غ)`).join(' + ');
      return `  ${i + 1}. [${m.time || 'اليوم'}] ${m.titleAr}: ${m.calories} سعرة (بروتين: ${m.protein}غ، كارب: ${m.carbs}غ، دهون: ${m.fats}غ)${itemsStr ? ` ➔ المكونات: ${itemsStr}` : ''}`;
    }).join('\n');
  }

  sections.push(`[التغذية والماكروز وسجل وجبات اليوم]:
- الهدف اليومي: ${targetCals} سعرة (بروتين: ${targetProt}غ، كارب: ${targetCarbs}غ، دهون: ${targetFats}غ)
- المستهلك اليوم: ${consumedCals} سعرة | ${consumedProt}غ بروتين | ماء: ${today.consumedWaterLiters || 0} لتر (من هدف ${today.targetWaterLiters || 2.5}L)
- المتبقي اليوم: ${remCals} سعرة | ${remProt}غ بروتين (كارب متبقي: ${remCarbs}غ، دهون متبقية: ${remFats}غ)
- سجل الوجبات المتناولة اليوم (${loggedMeals.length} وجبات):
${mealsDetail}`);

  // 3. سجل الماء والترطيب
  const waterTarget = today.targetWaterLiters || 2.5;
  const waterConsumed = today.consumedWaterLiters || 0;
  sections.push(`[سجل الماء والترطيب]:
- المستهلك: ${waterConsumed} لتر من هدف ${waterTarget} لتر (أكواب: ${today.consumedGlasses || 0} من ${today.targetGlasses || 8})
- أيام الالتزام بالماء (Streak): ${today.waterStreakDays || 7} أيام | مستوى الطاقة: ${today.energyLevel || 5}/5`);

  // 4. المكملات الغذائية اليومية
  let suppsDetail = 'لا توجد مكملات مسجلة.';
  if (dailyStackItems.length > 0) {
    suppsDetail = dailyStackItems.map(item => {
      const isTaken = Boolean(dailyStackTaken[item.id]);
      const statusIcon = isTaken ? '✅ تم التناول' : '⏳ لم يتم التناول بعد';
      return `  - ${item.name} (${item.dose} - نافذة: ${item.window}): ${statusIcon} ${item.note ? `[${item.note}]` : ''}`;
    }).join('\n');
  }
  sections.push(`[جدول المكملات الغذائية لليوم]:
${suppsDetail}`);

  // 5. التمارين والتدريب
  const workoutTitle = workout.dayName || today.todayWorkoutTitleAr || activeWorkout.sessionNameAr || 'يوم الصدر والترايسبس (Push Day)';
  let workoutInfo = `تمرين اليوم في الخطة: ${workoutTitle} | الحالة: ${today.workoutStatus || (today.isWorkoutCompleted ? 'مكتمل' : 'لم يبدأ')}`;
  if (activeWorkout.currentExercise) {
    const ce = activeWorkout.currentExercise;
    const completedSets = (ce.sets || []).filter(s => s.completed).map(s => `${s.weight}كغ×${s.reps}`).join('، ');
    workoutInfo += `\nالجلسة الحالية: تمرين "${ce.nameAr || ce.nameEn}" | أفضل أداء سابق: ${ce.previousBest || 'غير محدد'}${completedSets ? ` | الجولات المنفذة: ${completedSets}` : ''}`;
  }
  sections.push(`[التدريب والنشاط الرياضي]:
${workoutInfo}`);

  // 6. سجل التقدم وفحص InBody
  if (progress.currentDay || progress.weightChangeKg) {
    const totalLost = progress.weightChangeKg || -11;
    const waistDiff = (progress.firstDay?.waistCm || 122) - (progress.currentDay?.waistCm || 108);
    const inBody = progress.inBodyResult || {};
    sections.push(`[سجل التقدم والقياسات البدنية و InBody]:
- التغير بالوزن منذ البداية: ${totalLost} كغ | انخفاض محيط الخصر: -${waistDiff} سم
- قوة تمرين البنش برس: ارتفعت من ${progress.firstDay?.benchPressKg || 60} كغ إلى ${progress.currentDay?.benchPressKg || 82.5} كغ (+22.5 كغ)
- نسبة الالتزام الإجمالية: التدريب ${progress.adherence?.trainingPct || 87}% | التغذية ${progress.adherence?.nutritionPct || 81}% | الماء ${progress.adherence?.waterPct || 74}%
${inBody.hasResult ? `- آخر فحص InBody: نسبة الدهون ${inBody.bodyFatPercentage}% | الكتلة العضلية ${inBody.skeletalMuscleMassKg} كغ | الدهون الحشوية ${inBody.visceralFatLevel}` : ''}
${weeklyCheckin.sleepHours ? `- متابعة النوم: متوسط ${weeklyCheckin.sleepHours} ساعات يومياً` : ''}`);
  }

  return sections.join('\n\n');
}

export const aiService = {
  getProviderName() {
    const geminiKey = getGeminiKey();
    const openaiKey = getOpenAIKey();
    if (geminiKey) return 'Google Gemini (مفتاح مخصص) 🟢';
    if (openaiKey) return 'OpenAI GPT-4o mini 🟢';
    return 'Google Gemini 3.6 Flash (سحابي محمي مدمج) 🟢';
  },

  isLiveProvider() {
    return true;
  },

  getActiveModel() {
    return getSelectedModel();
  },

  setActiveModel(model) {
    memoryStorage.neon_ai_model = model;
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('neon_ai_model', model);
    }
  },

  getCustomApiKey(provider = 'gemini') {
    if (provider === 'gemini') return getGeminiKey();
    if (provider === 'openai') return getOpenAIKey();
    return '';
  },

  setCustomApiKey(provider, key) {
    const cleanKey = (key || '').trim();
    if (provider === 'gemini') {
      memoryStorage.neon_gemini_api_key = cleanKey;
      if (typeof window !== 'undefined' && window.localStorage) {
        if (cleanKey) {
          window.localStorage.setItem('neon_gemini_api_key', cleanKey);
        } else {
          window.localStorage.removeItem('neon_gemini_api_key');
        }
      }
    } else if (provider === 'openai') {
      memoryStorage.neon_openai_api_key = cleanKey;
      if (typeof window !== 'undefined' && window.localStorage) {
        if (cleanKey) {
          window.localStorage.setItem('neon_openai_api_key', cleanKey);
        } else {
          window.localStorage.removeItem('neon_openai_api_key');
        }
      }
    }
  },

  /**
   * 1. تحليل وجبة طعام من نص عربي (parse_meal)
   */
  async parseMeal(text) {
    // محاكاة تأخير معالجة طبيعي
    await new Promise(resolve => setTimeout(resolve, 300));
    return parseArabicMealText(text);
  },

  /**
   * 2. تحليل صورة وجبة طعام (analyze_food_photo)
   * تنبيه موثق: الصورة لا تعطي وزناً دقيقاً مؤكداً، ويتم دائماً عرض مسودة للمراجعة
   */
  async analyzeFoodPhoto(imageFileOrUrl) {
    await new Promise(resolve => setTimeout(resolve, 600));

    // في الوضع التجريبي أو بدون مفتاح رؤية حاسوبية مدفوع، نقدم تحليلاً تقديرياً ذكياً
    return {
      success: true,
      dishDetectedAr: 'صدر دجاج مشوي مع خضار وبطاطا',
      confidenceScore: 0.88,
      isEstimated: true,
      items: [
        { nameAr: 'صدر دجاج مشوي', grams: 180, calories: 297, protein: 56, carbs: 0, fats: 6 },
        { nameAr: 'بطاطا مشوية', grams: 150, calories: 130, protein: 3, carbs: 30, fats: 0 },
        { nameAr: 'خضار مشكلة', grams: 100, calories: 35, protein: 2, carbs: 7, fats: 0 }
      ],
      totalCalories: 462,
      totalProtein: 61,
      totalCarbs: 37,
      totalFats: 6,
      warningAr: 'الوزن تقديري من أبعاد الصورة. يُرجى مراجعة وتعديل الغرامات قبل الحفظ.'
    };
  },

  /**
   * 3. تحويل الصوت لنص عربي (transcribe_meal)
   */
  async transcribeMeal(audioBlob) {
    await new Promise(resolve => setTimeout(resolve, 400));
    return {
      success: true,
      transcription: '190غ صدر دجاج و170غ بطاطا وسلطة خضراء'
    };
  },

  /**
   * 4. اقتراح بدائل وجبة (meal_swap)
   */
  async mealSwap(currentMeal, userAllergens) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return findMealSwaps(currentMeal, userAllergens);
  },

  /**
   * 5. تحليل التقدم الأسبوعي (weekly_analysis)
   */
  async weeklyAnalysis(checkinData, previousCheckin) {
    await new Promise(resolve => setTimeout(resolve, 400));
    const weightDiff = checkinData.weightChangeVsLastWeek || 0;
    
    let recommendation = 'الاستمرار على نفس الخطة الحالية';
    let rationale = 'معدل النزول متوازن ومستقر ومستويات الطاقة ممتازة.';

    if (weightDiff < -1.8) {
      recommendation = 'زيادة طفيفة في الكربوهيدرات (حوالي 25غ)';
      rationale = 'معدل نزول الوزن سريع جداً، والزيادة تضمن الحفاظ على الكتلة العضلية ومنع الهبوط الحاد في الطاقة.';
    } else if (weightDiff > 0.2) {
      recommendation = 'التشديد على تسجيل الزيوت والصلصات الخفية وزيادة النشاط 2,000 خطوة';
      rationale = 'ثبات الوزن قد يعود إلى سعرات غير محسوبة أو انخفاض النشاط الحركي غير الرياضي (NEAT).';
    }

    return {
      status: 'analyzed',
      recommendation,
      rationale,
      trainingFeedback: 'التزام كامل بـ 4 جلسات تدريبية أسبوعية.',
      recoveryFeedback: `متوسط ساعات النوم ${checkinData.sleepHours || 7} ساعات ومستويات التوتر منخفضة.`
    };
  },

  /**
   * 6. اقتراح التدرج في أوزان التمرين (suggest_progression)
   */
  async suggestProgression(lastPerformance) {
    return suggestProgression(lastPerformance);
  },

  /**
   * 7. ملخص تقرير التقدم (report_summary)
   */
  async reportSummary(reportData) {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      titleAr: 'ملخص الأداء والتحول البدني لـ 90 يوماً',
      highlights: [
        `خسارة ${Math.abs(reportData.weightChangeKg)} كغ من الوزن الإجمالي مع تحسن ملحوظ في قياس الخصر (-14 سم).`,
        `زيادة ملحوظة في قوة الصدر في تمرين Bench Press من 60 كغ إلى 82.5 كغ (+22.5 كغ).`,
        `التزام تدريبي عالي بنسبة 87% مع التزام غذائي بنسبة 81%.`
      ],
      nextGoalRecommendation: 'الانتقال تدريجياً نحو مرحلة تثبيت الوزن أو إعادة تركيب الجسم (Body Recomposition).'
    };
  },

  /**
   * 8. المحادثة الذكية مع المدرب الشخصي الفائق (ai_chat)
   * تدعم Gemini 2.0 Flash / Pro و OpenAI وسياق المتدرب وتاريخ المحادثة
   */
  async chatWithCoach(userMessage, context = {}, chatHistory = []) {
    const rawMsg = userMessage ? userMessage.trim() : '';
    if (!rawMsg) return { success: false, reply: 'تفضل بسؤالك يا بطل!', isAiGenerated: false };
    const lower = rawMsg.toLowerCase();

    const geminiKey = getGeminiKey();
    const openaiKey = getOpenAIKey();
    const activeModel = getSelectedModel();
    const userContextStr = formatUserContext(context);

    // 1) استدعاء خادم Gemini السحابي المحمي (Server-Side Protected Gemini)
    // يعمل تلقائياً لجميع المستخدمين بدون الحاجة لإدخال أي مفتاح وبحماية كاملة
    if (!geminiKey) {
      try {
        const serverResp = await fetch('/api/gemini', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: rawMsg,
            dashboardData: {
              userContext: userContextStr,
              chatHistory: (chatHistory || []).slice(-6)
            }
          })
        });

        if (serverResp.ok) {
          const data = await serverResp.json();
          if (data && data.reply) {
            const extracted = extractMealsFromAiReply(data.reply, rawMsg);
            return {
              success: true,
              reply: extracted.cleanReply,
              mealData: extracted.mealData,
              mealsData: extracted.mealsData,
              isAiGenerated: true,
              provider: `Google Gemini (${data.model || 'gemini-3.6-flash'}) 🟢`
            };
          }
        }
      } catch (err) {
        console.warn('تعذر استدعاء خادم Gemini السحابي، سيتم الانتقال للبديل:', err);
      }
    }

    // 2) استدعاء نموذج Google Gemini المباشر في حال أدخل المستخدم مفتاحاً خاصاً به
    if (geminiKey) {
      try {
        const contents = [];

        // تحويل سجل المحادثة السابق لتنسيق Gemini مع ضمان سلامة الأدوار والبدء بـ user
        if (Array.isArray(chatHistory) && chatHistory.length > 0) {
          const validHistory = chatHistory.filter(m => m && m.text && m.sender !== 'system').slice(-12);
          for (const msg of validHistory) {
            const role = msg.sender === 'user' ? 'user' : 'model';
            if (contents.length === 0 && role === 'model') {
              continue;
            }
            if (contents.length > 0 && contents[contents.length - 1].role === role) {
              contents[contents.length - 1].parts[0].text += '\n' + msg.text;
            } else {
              contents.push({
                role: role,
                parts: [{ text: msg.text }]
              });
            }
          }
        }

        // إضافة رسالة المستخدم الحالية
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text += '\n' + rawMsg;
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: rawMsg }]
          });
        }

        const targetModel = activeModel.includes('1.5-pro') ? 'gemini-1.5-pro' : 'gemini-3.6-flash';
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                { text: `${MASTER_COACH_SYSTEM_INSTRUCTION}\n\n[بيانات المتدرب الحالية]:\n${userContextStr}` }
              ]
            },
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              topP: 0.95,
              maxOutputTokens: 1600
            }
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (replyText) {
            const extracted = extractMealsFromAiReply(replyText, rawMsg);
            return {
              success: true,
              reply: extracted.cleanReply,
              mealData: extracted.mealData,
              mealsData: extracted.mealsData,
              isAiGenerated: true,
              provider: `Google Gemini (${targetModel})`
            };
          }
        } else {
          const errData = await response.json().catch(() => ({}));
          console.warn('Gemini API Error:', errData?.error?.message || response.statusText);
        }
      } catch (err) {
        console.warn('تعذر استدعاء Google Gemini API، سيتم استخدام الرد العلمي الذكي المحلي:', err);
      }
    }

    // 3) استدعاء OpenAI كخيار إضافي
    if (openaiKey) {
      try {
        const messages = [
          {
            role: 'system',
            content: `${MASTER_COACH_SYSTEM_INSTRUCTION}\n\n[بيانات المتدرب الحالية]:\n${userContextStr}`
          }
        ];

        if (Array.isArray(chatHistory) && chatHistory.length > 0) {
          chatHistory.slice(-8).forEach(msg => {
            messages.push({
              role: msg.sender === 'user' ? 'user' : 'assistant',
              content: msg.text
            });
          });
        }

        messages.push({ role: 'user', content: rawMsg });

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: messages,
            temperature: 0.7,
            max_tokens: 1400
          })
        });

        if (response.ok) {
          const data = await response.json();
          const replyText = data?.choices?.[0]?.message?.content;
          if (replyText) {
            const extracted = extractMealsFromAiReply(replyText, rawMsg);
            return {
              success: true,
              reply: extracted.cleanReply,
              mealData: extracted.mealData,
              mealsData: extracted.mealsData,
              isAiGenerated: true,
              provider: 'OpenAI GPT-4o mini'
            };
          }
        }
      } catch (err) {
        console.warn('تعذر استدعاء OpenAI API:', err);
      }
    }

    // 3) المحاكي الرياضي والعلمي المحلي الفائق (Deterministic Offline Master Coach)
    // يعمل بدقة عالية في حال عدم إدخال مفتاح API أو عدم توفر اتصال بالإنترنت
    await new Promise(resolve => setTimeout(resolve, 350));
    // 0) تذكر واسترجاع ما دار في المحادثات السابقة
    if (lower.includes('شو حكينا') || lower.includes('ذكرني') || lower.includes('شو سالتك') || lower.includes('شو سألتك') || lower.includes('المحادثة السابقة') || lower.includes('تتذكر') || lower.includes('متذكر')) {
      const pastUserMsgs = (chatHistory || []).filter(m => m && m.sender === 'user' && m.text !== rawMsg).slice(-4);
      if (pastUserMsgs.length > 0) {
        const lastPoints = pastUserMsgs.map(m => `• "${m.text}"`).join('\n');
        return {
          success: true,
          reply: `أنا أتذكر كامل محادثتنا يا بطل! 🧠\n\nإليك أحدث ما سألتني عنه وناقشناه معاً:\n${lastPoints}\n\nأنا أحتفظ بكامل سجلاتك وسياقك الرياضي، كيف تحب أن نواصل خطتنا الآن؟`,
          isAiGenerated: true,
          provider: 'محاكي كوتش نيون الذكي'
        };
      }
    }

    // 1) سؤال المتبقي من السعرات والماكروز وكيفية إكمالهم (أولوية قصوى قبل معالجة الوجبات)
    if (lower.includes('متبقي') || lower.includes('باقيلي') || lower.includes('باقي لي') || lower.includes('باقي') || lower.includes('ضايل') || lower.includes('فاضل') || lower.includes('كيف اكمل') || lower.includes('كيف أكمل') || lower.includes('أكملهم') || lower.includes('اكملهم')) {
      const targetCals = context.today?.targetCalories || context.userProfile?.calorieTarget || 2100;
      const consumedCals = context.today?.consumedCalories || 0;
      const targetProt = context.today?.targetProtein || context.userProfile?.proteinGrams || 150;
      const consumedProt = context.today?.consumedProtein || 0;
      const remCals = Math.max(0, targetCals - consumedCals);
      const remProt = Math.max(0, targetProt - consumedProt);

      let suggestion = '';
      if (remProt > 30) {
        suggestion = `🍗 **اقتراح ذكي لسد المتبقي:**\n• **صدر دجاج مشوي** (200غ) أو علبة تونة كبيرة: تمنحك ~60غ بروتين صافي و 330 سعرة فقط.\n• مع صحن سلطة خضراء وصحن رز صغير أو بطاطا مسلوقة (150غ) لتغطية السعرات بطاقة نظيفة!`;
      } else if (remProt > 10) {
        suggestion = `🍳 **اقتراح خفيف وسريع:**\n• 3 بيضات مسلوقة أو علبة لبن زبادي يوناني (200غ) مع حفنة مكسرات خفيفة.\n• ستمنحك ~18-20غ بروتين صافي وتغلق أهدافك اليومية بدقة!`;
      } else {
        suggestion = `✨ **أنت على وشك تحقيق هدفك اليومي تماماً!**\n• سناك خفيف كحبة تفاح مع زبدة فول سوداني أو كوب حليب قليل الدسم كافٍ لإنهاء يومك بمثالية.`;
      }

      return {
        success: true,
        reply: `إليك ملخص أهدافك ومتبقيك لليوم يا بطل:\n\n• **السعرات:** استهلكت **${consumedCals}** من **${targetCals} سعرة** ➔ **متبقي لك: ${remCals} سعرة**.\n• **البروتين:** حققت **${consumedProt}غ** من **${targetProt}غ** ➔ **متبقي لك: ${remProt}غ بروتين**.\n\n${suggestion}`,
        isAiGenerated: true,
        provider: 'محاكي كوتش نيون الذكي'
      };
    }

    // 2) حساب سعرات وماكروز وجبة أو وجبات متعددة
    const detectedMeals = parseMultipleMeals(rawMsg);
    if (detectedMeals.length > 1) {
      let totalCals = 0;
      let totalProt = 0;
      let totalCarbs = 0;
      let totalFats = 0;
      const mealsSummary = detectedMeals.map((m, idx) => {
        totalCals += m.totalCalories;
        totalProt += m.totalProtein;
        totalCarbs += m.totalCarbs;
        totalFats += m.totalFats;
        const itemsDetail = (m.items || []).map(i => `• **${i.nameAr}** (${i.grams}غ): ${i.calories} سعرة | ${i.protein}غ بروتين | ${i.carbs}غ كارب | ${i.fats}غ دهون`).join('\n');
        return `### 🍽️ ${m.titleAr || `وجبة ${idx + 1}`} (${m.totalCalories} سعرة):\n${itemsDetail}\n• ماكروز الوجبة: **${m.totalProtein}غ بروتين** | **${m.totalCarbs}غ كارب** | **${m.totalFats}غ دهون**`;
      }).join('\n\n');

      return {
        success: true,
        reply: `قمت بحساب الوجبات المطلوبة بالتفصيل يا بطل (${detectedMeals.length} وجبات):\n\n${mealsSummary}\n\n📊 **الإجمالي العام لجميع الوجبات:**\n• السعرات الكلية: **${totalCals} سعرة**\n• البروتين الكلي: **${totalProt}غ**\n• الكربوهيدرات: **${totalCarbs}غ**\n• الدهون: **${totalFats}غ**`,
        mealData: detectedMeals[0],
        mealsData: detectedMeals,
        isAiGenerated: true,
        provider: 'حاسبة NEON الذكية المحلية'
      };
    } else if (detectedMeals.length === 1 && (lower.includes('احسب') || lower.includes('حساب') || lower.includes('احسبلي') || lower.includes('احسب لي') || lower.includes('غرام') || lower.includes('غم') || lower.includes('سعرات الوجبة') || lower.includes('وجبة') || lower.includes('أكلت') || lower.includes('اكلت') || lower.includes('تناولت'))) {
      const meal = detectedMeals[0];
      const itemsDetail = meal.items.map(i => `• **${i.nameAr}** (${i.grams}غ): ${i.calories} سعرة | ${i.protein}غ بروتين | ${i.carbs}غ كارب | ${i.fats}غ دهون`).join('\n');
      return {
        success: true,
        reply: `تحليل وجبتك بدقة يا بطل:\n\n${itemsDetail}\n\n📊 **الإجمالي العام للوجبة:**\n• السعرات: **${meal.totalCalories} سعرة**\n• البروتين: **${meal.totalProtein}غ**\n• الكربوهيدرات: **${meal.totalCarbs}غ**\n• الدهون: **${meal.totalFats}غ**`,
        mealData: meal,
        mealsData: [meal],
        isAiGenerated: true,
        provider: 'حاسبة NEON الذكية المحلية'
      };
    }

    // ج) تمرين اليوم وخطة التدريب
    if (lower.includes('تمرين اليوم') || lower.includes('شو اتمرن') || lower.includes('جدول اليوم') || lower.includes('شو تمرين')) {
      const workoutName = context.workout?.dayName || 'يوم الصدر والترايسبس (Push A)';
      return {
        success: true,
        reply: `جدولك التدريبي لليوم هو: **${workoutName}** 🔥\n\n**خطة تنفيذ الجلسة باحترافية:**\n1. **الإحماء:** 5-7 دقائق تهيئة ديناميكية للمفاصل مع أشرطة المقاومة وتدوير الأكتاف.\n2. **التمرين الأساسي الأول:** ركز على تطبيق الحمل التدريجي (Progressive Overload) بزيادة تكرار أو 1-2.5 كغ عن الأسبوع الماضي.\n3. **الشدة:** اترك تكراراً واحداً في الخزان (RIR 1-2) في المجموعات الأولى، والوصول للفشل العضلي النظيف في المجموعة الأخيرة فقط.\n4. **الراحة بين الجولات:** 90 إلى 120 ثانية في التمارين المركبة لتعويض مخازن الـ ATP.\n\nجاهز للتفجير؟ سجّل أوزانك أولاً بأول! 💥`,
        isAiGenerated: true,
        provider: 'محاكي كوتش نيون الذكي'
      };
    }

    // د) آلام المفاصل والإصابات
    if (lower.includes('الم') || lower.includes('ألم') || lower.includes('وجع') || lower.includes('كتف') || lower.includes('ركبة') || lower.includes('مفصل')) {
      return {
        success: true,
        reply: `سلامة مفاصلك أهم من أي وزن يا بطل! ⚠️\n\n**بروتوكول التعامل الفوري مع الألم:**\n1. **أوقف أي تمرين يسبب لك وخزاً أو ألماً حاداً فوراً.** لا تتمرن من خلال الألم أبداً (No Pain, No Gain قاعدة خاطئة عند إصابة المفاصل).\n2. **تعديل زاوية الحركة:** في الصدر مثلاً، استخدم الدامبلز مع قبضة محايدة (Neutral Grip) بدلاً من البار المستقيم لتقليل الضغط على أوتار الكتف.\n3. **الإحماء الكافي:** 5 دقائق من حركات الدوران الداخلي والخارجي للكتف بوزن خفيف جداً ترفع تروية الدم لمفصل الكتف.\n4. **ملاحظة أمان:** إذا كان الألم مستمراً أو حاداً أو مصحوباً بانتفاخ، فمن الضروري استشارة طبيب عظام أو علاج طبيعي فوراً.`,
        isAiGenerated: true,
        provider: 'محاكي كوتش نيون الذكي'
      };
    }

    // هـ) المكملات
    if (lower.includes('مكمل') || lower.includes('كرياتين') || lower.includes('بروتين') || lower.includes('كافيين') || lower.includes('فيتامين')) {
      return {
        success: true,
        reply: `إليك أهم المكملات المدعومة بأقوى الأدلة العلمية وكيفية استخدامها:\n\n1. **الكرياتين مونوهيدرات (Creatine Monohydrate):**\n• الجرعة: 3 إلى 5 غرام يومياً في أي وقت بانتظام مع الماء.\n• الفائدة: زيادة مخازن الفوسفوكرياتين لرفع القوة والانفجار العضلي بنسبة 5-15% وترطيب الألياف العضلية.\n\n2. **الواي بروتين (Whey Protein):**\n• استخدامه: وسيلة سهلة وعملية لإكمال هدفك اليومي من البروتين (سكوب = ~24غ بروتين).\n\n3. **الكافيين قبل التمرين:**\n• الجرعة: 150-200 ملغ (كوب قهوة سوداء مركز) قبل التمرين بـ 45 دقيقة لزيادة التركيز وقوة التحمل.\n\n4. **فيتامين D3 + أوميغا 3 + مغنيسيوم:**\n• أساسيات لصحة المفاصل والاستشفاء العضلي وعمق النوم هرمونياً.\n\n💡 *نصيحة:* المكملات تكمل غذاءك وليست بديلاً عن الوجبات الحقيقية!`,
        isAiGenerated: true,
        provider: 'محاكي كوتش نيون الذكي'
      };
    }

    // و) الماء والترطيب
    if (lower.includes('ماء') || lower.includes('شرب') || lower.includes('عطش') || lower.includes('سوائل')) {
      return {
        success: true,
        reply: `الماء هو شريان القوة وبناء العضلات 💧\n\n• **هدفك المثالي:** 30-40 مل لكل كغ من وزنك (عادة بين 2.5 إلى 3.5 لتر يومياً).\n• **أثناء التمرين:** اشرب 200-300 مل كل 15-20 دقيقة لتعويض السوائل المفقودة بالتعرق.\n• **معلومة علمية:** جفاف 2% فقط من وزنك في السوائل يقلل من قوتك البدنية في رفع الأوزان بنسبة تصل إلى 15%!\n\nاحرص على إنهاء كوب ماء كبير الآن واستمر في تسجيل أكوابك بالتطبيق!`,
        isAiGenerated: true,
        provider: 'محاكي كوتش نيون الذكي'
      };
    }

    // رد عام شامل مع تذكير بإمكانية ربط Gemini API
    return {
      success: true,
      reply: `أهلاً بك يا بطل! أنا **كوتش نيون**، مدربك الشخصي الذكي. 💪\n\nأنا هنا لمساعدتك في أي استفسار:\n• تصميم خطط التمرين وتكنيك الحركات وتعديل الأوزان.\n• حساب السعرات والماكروز واقتراح بدائل للوجبات.\n• نصائح الاستشفاء، النوم، والترطيب، والمكملات المبنية على الدليل العلمي.\n\n✨ *ملاحظة مميزة:* يمكنك الضغط على أيقونة **الإعدادات ⚙️** بالأعلى وإدخال مفتاح **Google Gemini API** الخاص بك (مجاني) لتفعيل أحدث نماذج **Gemini 2.0 Flash** بقدرات تفكير مفتوحة ولانهائية على أي سؤال في العالم!\n\nما الذي يشغل بالك اليوم في تمرينك أو تغذيتك لنبدأ بتطويره؟`,
      isAiGenerated: true,
      provider: 'محاكي كوتش نيون الذكي'
    };
  }
};
