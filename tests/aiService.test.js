import test from 'node:test';
import assert from 'node:assert/strict';
import { aiService, formatUserContext, MASTER_COACH_SYSTEM_INSTRUCTION, parseMultipleMeals } from '../src/services/aiService.js';

test('برومبت المدرب الشخصي الشامل يحتوي على الإرشادات والقواعد العلمية الأساسية', () => {
  assert.ok(MASTER_COACH_SYSTEM_INSTRUCTION.includes('NEON AI MASTER COACH'));
  assert.ok(MASTER_COACH_SYSTEM_INSTRUCTION.includes('CSCS'));
  assert.ok(MASTER_COACH_SYSTEM_INSTRUCTION.includes('Progressive Overload'));
  assert.ok(MASTER_COACH_SYSTEM_INSTRUCTION.includes('البروتين'));
});

test('تنسيق سياق المتدرب الحي (formatUserContext) يدمج الأرقام والأهداف والإصابات بدقة', () => {
  const dummyContext = {
    userProfile: {
      name: 'سامر',
      fitnessGoal: 'تنشيف وبناء عضلات',
      currentWeightKg: 82,
      targetWeightKg: 76,
      heightCm: 178,
      gender: 'male',
      injuries: ['ألم أسفل الظهر']
    },
    today: {
      targetCalories: 2200,
      consumedCalories: 1400,
      targetProtein: 160,
      consumedProtein: 100,
      targetWaterLiters: 3.0,
      consumedWaterLiters: 1.8
    },
    workout: {
      dayName: 'يوم الصدر والترايسبس (Push Day)'
    }
  };

  const formatted = formatUserContext(dummyContext);
  assert.ok(formatted.includes('سامر'));
  assert.ok(formatted.includes('82 كغ'));
  assert.ok(formatted.includes('2200 سعرة'));
  assert.ok(formatted.includes('1400 سعرة'));
  assert.ok(formatted.includes('المتبقي اليوم: 800 سعرة | 60غ بروتين'));
  assert.ok(formatted.includes('ألم أسفل الظهر'));
  assert.ok(formatted.includes('يوم الصدر والترايسبس'));
});

test('إدارة مفاتيح API وتحديد المزود الافتراضي والمخصص', () => {
  // وضع المحاكي الافتراضي في بيئة Node
  const provider = aiService.getProviderName();
  assert.ok(typeof provider === 'string');

  // تعيين نموذج مخصص
  aiService.setActiveModel('gemini-2.0-flash');
  assert.equal(aiService.getActiveModel(), 'gemini-2.0-flash');

  aiService.setActiveModel('gemini-1.5-pro');
  assert.equal(aiService.getActiveModel(), 'gemini-1.5-pro');
});

test('المحادثة الذكية تجيب على الأسئلة الرياضية والتغذوية باحترافية المدرب المعتمد', async () => {
  const context = {
    userProfile: { name: 'عمر', fitnessGoal: 'تضخيم عضلي صافي' },
    today: { targetCalories: 2600, consumedCalories: 1800, targetProtein: 170, consumedProtein: 120 }
  };

  // 1. استفسار عن المتبقي من الماكروز
  const macroReply = await aiService.chatWithCoach('كم متبقي لي من السعرات والبروتين اليوم؟', context);
  assert.ok(macroReply.success);
  assert.ok(macroReply.reply.includes('800') || macroReply.reply.includes('سعرة'));
  assert.ok(macroReply.reply.includes('50') || macroReply.reply.includes('بروتين'));

  // 2. استفسار عن تمرين وألم المفصل
  const injuryReply = await aiService.chatWithCoach('أشعر بألم في مفصل الكتف أثناء تمرين البنش برس، ماذا أفعل؟', context);
  assert.ok(injuryReply.success);
  assert.ok(injuryReply.reply.includes('كتف') || injuryReply.reply.includes('مفصل'));
  assert.ok(injuryReply.reply.includes('دامبل') || injuryReply.reply.includes('زاوية') || injuryReply.reply.includes('طبيب'));

  // 3. استفسار عن التدرج بالأوزان
  const overloadReply = await aiService.chatWithCoach('كيف أطبق الزيادة التدريجية بالأوزان؟', context);
  assert.ok(overloadReply.success);
  assert.ok(overloadReply.reply.includes('تدرج') || overloadReply.reply.includes('أوزان') || overloadReply.reply.includes('تكرارات'));

  // 4. استفسار عن المكملات
  const suppReply = await aiService.chatWithCoach('ما رأيك في مكمل الكرياتين؟', context);
  assert.ok(suppReply.success);
  assert.ok(suppReply.reply.includes('كرياتين') || suppReply.reply.includes('مونوهيدرات'));
});

test('تنسيق السياق الشامل يغطي كافة السجلات: وجبات اليوم، الماء، المكملات، التمرين، و InBody', () => {
  const fullContext = {
    userProfile: {
      name: 'أحمد',
      currentWeight: 101.4,
      startWeight: 129,
      targetWeight: 90,
      fitnessGoal: 'تنشيف وخسارة دهون'
    },
    today: {
      targetCalories: 2100,
      consumedCalories: 1420,
      targetProtein: 160,
      consumedProtein: 112,
      targetWaterLiters: 2.5,
      consumedWaterLiters: 1.5,
      consumedGlasses: 5,
      todayWorkoutTitleAr: 'صدر وترايسبس'
    },
    loggedMeals: [
      { id: 'm1', titleAr: 'وجبة فطور', calories: 450, protein: 30, carbs: 50, fats: 10, items: [{ nameAr: 'شوفان', grams: 80 }] }
    ],
    dailyStackItems: [
      { id: 's1', name: 'Creatine monohydrate', dose: '5g', window: 'anytime' },
      { id: 's2', name: 'Omega-3', dose: '2g', window: 'lunch' }
    ],
    dailyStackTaken: { s1: 1234567 },
    progressReport: {
      firstDay: { waistCm: 122, benchPressKg: 60 },
      currentDay: { waistCm: 108, benchPressKg: 82.5 },
      weightChangeKg: -11,
      inBodyResult: { hasResult: true, bodyFatPercentage: 21.4, skeletalMuscleMassKg: 44.2, visceralFatLevel: 9 }
    }
  };

  const output = formatUserContext(fullContext);
  // فحص شمولية السجلات
  assert.ok(output.includes('وجبة فطور') && output.includes('شوفان'));
  assert.ok(output.includes('1.5 لتر') && output.includes('5'));
  assert.ok(output.includes('Creatine') && output.includes('تم التناول'));
  assert.ok(output.includes('Omega-3') && output.includes('لم يتم التناول'));
  assert.ok(output.includes('صدر وترايسبس'));
  assert.ok(output.includes('InBody') && output.includes('21.4%'));
  assert.ok(output.includes('-11 كغ') && output.includes('82.5 كغ'));
});

test('استفسار حساب الوجبة للذكاء الاصطناعي يعيد mealData مهيأة للإضافة المباشرة لسجل الوجبات', async () => {
  const reply = await aiService.chatWithCoach('احسب لي وجبة: 190غ صدر دجاج مشوي و 150غ بطاطا مسلوقة');
  assert.ok(reply.success);
  assert.ok(reply.mealData);
  assert.ok(reply.mealData.totalCalories > 300);
  assert.ok(reply.mealData.totalProtein > 40);
  assert.ok(Array.isArray(reply.mealData.items));
  assert.equal(reply.mealData.items.length, 2);
});

test('دالة parseMultipleMeals تحلل وتقسم أكثر من وجبة بشكل مستقل', () => {
  const text = 'فطور: 80غ شوفان مع 200مل حليب قليل الدسم. غداء: 200غ صدر دجاج مع 150غ أرز بسمتي.';
  const meals = parseMultipleMeals(text);
  assert.equal(meals.length, 2);
  assert.ok(meals[0].titleAr.includes('فطور'));
  assert.ok(meals[0].totalCalories > 200);
  assert.ok(meals[0].items.length >= 1);
  assert.ok(meals[1].titleAr.includes('غداء'));
  assert.ok(meals[1].totalCalories > 300);
  assert.ok(meals[1].items.length >= 1);
});

test('استفسار حساب عدة وجبات يعيد mealsData كمصفوفة تحتوي كافة الوجبات المحسوبة', async () => {
  const reply = await aiService.chatWithCoach('احسب وجباتي لليوم: فطور: 100غ شوفان و 3 بيضات. غداء: 200غ صدر دجاج و 150غ أرز.');
  assert.ok(reply.success);
  assert.ok(Array.isArray(reply.mealsData));
  assert.equal(reply.mealsData.length, 2);
  assert.ok(reply.mealsData[0].totalCalories > 200);
  assert.ok(reply.mealsData[1].totalCalories > 300);
});

test('حساب الوجبة بدقة (250 دجاج + 220 بطاطا + 300 سلطة) بدون نصوص مكررة', async () => {
  const reply = await aiService.chatWithCoach('احسب 250 صدر دجاج 220 بطاطا مسلوقة و300 غم سلطة');
  assert.ok(reply.success);
  assert.ok(reply.mealData);
  assert.equal(reply.mealData.items.length, 3);
  const salad = reply.mealData.items.find(i => i.nameAr.includes('سلطة'));
  assert.ok(salad);
  assert.equal(salad.grams, 300);
  assert.equal(salad.calories, 84);
  assert.equal(reply.mealData.totalCalories, 688);
  // التأكد من إزالة النص المكرر
  assert.ok(!reply.reply.includes('هل تود إضافتها إلى سجل وجباتك'));
});

test('استفسار كم متبقي لي من السعرات والبروتين لا يعامل كوجبة طعام ويعطي اقتراحاً لإكمالهم', async () => {
  const context = {
    today: { targetCalories: 2200, consumedCalories: 1500, targetProtein: 160, consumedProtein: 110 }
  };
  const reply = await aiService.chatWithCoach('كم متبقي لي من السعرات والبروتين اليوم وكيف أكملهم؟', context);
  assert.ok(reply.success);
  assert.equal(reply.mealData, undefined);
  assert.ok(reply.reply.includes('700'));
  assert.ok(reply.reply.includes('50'));
  assert.ok(reply.reply.includes('اقتراح') || reply.reply.includes('دجاج') || reply.reply.includes('بروتين'));
});

test('حفظ واسترجاع ومسح سجل محادثة الذكاء الاصطناعي في الذاكرة (store)', async () => {
  const { store } = await import('../src/state/store.js');
  store.clearAiChatHistory();
  assert.deepEqual(store.getAiChatHistory(), []);

  store.saveAiChatMessage({ sender: 'user', text: 'كم سعرة في 100غ صدر دجاج؟' });
  store.saveAiChatMessage({ sender: 'ai', text: 'صدر الدجاج المشوي 100غ يحتوي تقريباً على 165 سعرة و 31غ بروتين.' });

  const history = store.getAiChatHistory();
  assert.equal(history.length, 2);
  assert.equal(history[0].sender, 'user');
  assert.equal(history[1].sender, 'ai');

  store.clearAiChatHistory();
  assert.equal(store.getAiChatHistory().length, 0);
});

test('المدرب يتذكر المواضيع السابقة عند السؤال (ذكرني شو حكينا)', async () => {
  const chatHistory = [
    { sender: 'user', text: 'تمرين بنش برس وتكنيك النزول' },
    { sender: 'ai', text: 'شرح تكنيك البنش برس مع ضم لوحي الكتف.' }
  ];
  const reply = await aiService.chatWithCoach('ذكرني شو حكينا قبل شوي؟', {}, chatHistory);
  assert.ok(reply.success);
  assert.ok(reply.reply.includes('تمرين بنش برس') || reply.reply.includes('بنش برس'));
});
