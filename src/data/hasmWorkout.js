/**
 * NEON COACH — نظام الحسم (Hasm System) Workout Data
 * وقت قليل وفعالية عالية — 4 مجموعات عضلية مركزة و 30 تمريناً أساسياً
 * مستخرج من hasm.html?book=hasm ومربوط بمكتبة صور Cloudflare R2 وصفحات الكتاب الأصلية
 */

export const HASM_PROGRAM = Object.freeze({
  id: 'hasm',
  key: 'hasm',
  title: 'نظام الحسم',
  shortTitle: 'الحسم',
  kicker: 'HASM SYSTEM WORKOUT',
  description: 'وقت قليل وفعالية عالية — 4 مجموعات عضلية مركزة لتضخيم وقوة مثالية بدون إجهاد زائد.',
  filterHeading: 'اختر مجموعة العضلات لعرض تمارينها فقط',
  durationDays: 30,
  cover: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0001.jpg?v=1785709351'
});

export const HASM_GROUPS = [
  {
    key: 'chestBiceps',
    label: 'صدر وبايسبس',
    short: 'صدر وبايسبس',
    tone: 'chest',
    description: 'تمارين الصدر وبايسبس بنظام الحسم (7 تمارين)',
    exercises: [
      {
        number: 1,
        title: 'بنش بريس للصدر أو دامبل بريس | Bench Press / Dumbbell Press',
        sets: 3,
        reps: '8-12',
        alternative: 'دامبل بنش بريس | Dumbbell Bench Press',
        page: 5,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_30%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0005.jpg?v=1785709350'
      },
      {
        number: 2,
        title: 'ضغط صدر علوي بزاوية 45 درجة | Incline Bench Press',
        sets: 3,
        reps: '8-12',
        alternative: 'صدر علوي بالدامبل | Incline Dumbbell Bench Press',
        page: 6,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_31%20PM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0006.jpg?v=1785709350'
      },
      {
        number: 3,
        title: 'عزل الصدر بجهاز الفراشة | Butterfly / Pec Deck',
        sets: 3,
        reps: '8-12',
        alternative: '',
        page: 7,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_33%20PM%20%288%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0007.jpg?v=1785709352'
      },
      {
        number: 4,
        title: 'عزل صدر مستوي بالدامبل | Flat Dumbbell Fly',
        sets: 3,
        reps: '8-12',
        alternative: '',
        page: 7,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_34%20PM%20%2810%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0007.jpg?v=1785709352'
      },
      {
        number: 5,
        title: 'عزل صدر سفلي بالكابل | Standing Cable Fly',
        sets: 3,
        reps: '8-12',
        alternative: 'كيبل كروس أوفر | Cable Crossover',
        page: 8,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_33%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0008.jpg?v=1785709350'
      },
      {
        number: 6,
        title: 'بايسبس بار زجزاج على المسطبة | Barbell Preacher Curl',
        sets: 3,
        reps: '8-12',
        alternative: 'دامبل بريتشر كيرل | Dumbbell Preacher Curl',
        page: 9,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0009.jpg?v=1785709353'
      },
      {
        number: 7,
        title: 'بايسبس تبادل دامبل جالس على بنش مائل | Incline Dumbbell Curl',
        sets: 3,
        reps: '8-12',
        alternative: 'بايسبس تبادل واقف | Standing Dumbbell Curl',
        page: 9,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0009.jpg?v=1785709353'
      }
    ]
  },
  {
    key: 'backAbs',
    label: 'ظهر وبطن',
    short: 'ظهر وبطن',
    tone: 'back',
    description: 'تمارين الظهر والبطن بنظام الحسم (7 تمارين)',
    exercises: [
      {
        number: 8,
        title: 'سحب أمامي للظهر | Lat Pulldown',
        sets: 3,
        reps: '8-12',
        alternative: 'عقلة | Pull-Ups',
        page: 10,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0010.jpg?v=1785709352'
      },
      {
        number: 9,
        title: 'سحب تي بار واسع | Wide-Grip T-Bar Row',
        sets: 3,
        reps: '8-12',
        alternative: 'سحب جهاز واسع | Wide Machine Row',
        page: 10,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0010.jpg?v=1785709352'
      },
      {
        number: 10,
        title: 'سحب أرضي بمسكة ضيقة | Seated Cable Row',
        sets: 3,
        reps: '8-12',
        alternative: 'سحب أرضي بمسطرة واسعة | Wide Seated Cable Row',
        page: 11,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_35%20PM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0011.jpg?v=1785709352'
      },
      {
        number: 11,
        title: 'منشار دامبل بيد واحدة | One-Arm Dumbbell Row',
        sets: 3,
        reps: '8-12',
        alternative: '',
        page: 11,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%289%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0011.jpg?v=1785709352'
      },
      {
        number: 12,
        title: 'عزل الظهر بالكابل والذراعان مستقيمتان | Straight-Arm Rope Pulldown',
        sets: 3,
        reps: '8-12',
        alternative: 'بلوفر بالدامبل | Dumbbell Pullover',
        page: 12,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%284%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0012.jpg?v=1785709352'
      },
      {
        number: 13,
        title: 'ديدلفت بالبار | Barbell Deadlift',
        sets: 3,
        reps: '8-12',
        alternative: 'ديدلفت روماني | Romanian Deadlift',
        page: 12,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0012.jpg?v=1785709352'
      },
      {
        number: 14,
        title: 'تمرين الوصول للبطن | Abdominal Reach',
        sets: 3,
        reps: '15-20',
        alternative: 'طحن البطن على الجهاز | Machine Crunch',
        page: 13,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%B7%D9%86/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_12_41%20AM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0013.jpg?v=1785709347'
      }
    ]
  },
  {
    key: 'shouldersTrapsTriceps',
    label: 'كتف وترابيس وترايسبس',
    short: 'كتف وترابيس وترايسبس',
    tone: 'shoulders',
    description: 'تمارين الكتف والترابيس والترايسبس بنظام الحسم (8 تمارين)',
    exercises: [
      {
        number: 15,
        title: 'ضغط كتف بالدامبل جالس أو على الجهاز | Seated Shoulder Press',
        sets: 3,
        reps: '8-12',
        alternative: 'ضغط كتف بار أمامي | Barbell Shoulder Press',
        page: 14,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_32%20PM%20%284%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0014.jpg?v=1785709353'
      },
      {
        number: 16,
        title: 'رفرفة كتف جانبية بالدامبل | Dumbbell Lateral Raise',
        sets: 3,
        reps: '12-15',
        alternative: 'رفرفة كتف جانبية بالكابل | Cable Lateral Raise',
        page: 14,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_44%20PM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0014.jpg?v=1785709353'
      },
      {
        number: 17,
        title: 'رفرفة كتف أمامية بالقرص أو الكابل | Front Plate Raise',
        sets: 3,
        reps: '12-15',
        alternative: 'رفرفة أمامية بالدامبلز | Dumbbell Front Raise',
        page: 15,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_43%20PM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0015.jpg?v=1785709353'
      },
      {
        number: 18,
        title: 'سحب الترابيس بالبار أو الدامبل | Barbell/Dumbbell Shrug',
        sets: 3,
        reps: '12-15',
        alternative: 'ترابيس على السميث | Smith Machine Shrug',
        page: 15,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_43%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0015.jpg?v=1785709353'
      },
      {
        number: 19,
        title: 'سحب الحبل للوجه للكتف الخلفي | Face Pull',
        sets: 3,
        reps: '12-15',
        alternative: 'فراشة خلفية | Reverse Pec Deck',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_32%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      },
      {
        number: 20,
        title: 'دفع الترايسبس بالكابل للأسفل | Triceps Pushdown',
        sets: 3,
        reps: '10-12',
        alternative: 'دفع ترايسبس بالحبل | Cable Rope Pushdown',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_34%20AM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      },
      {
        number: 21,
        title: 'بنش بريس بقبضة ضيقة للترايسبس | Close-Grip Bench Press',
        sets: 3,
        reps: '8-12',
        alternative: 'غطس متوازي | Triceps Dips',
        page: 17,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_35%20AM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0017.jpg?v=1785709352'
      },
      {
        number: 22,
        title: 'تمديد الترايسبس بالحبل فوق الرأس | Overhead Cable Rope Extension',
        sets: 3,
        reps: '10-12',
        alternative: 'تمديد ترايسبس دامبل فوق الرأس | Overhead Dumbbell Extension',
        page: 17,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_36%20AM%20%284%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0017.jpg?v=1785709352'
      }
    ]
  },
  {
    key: 'legsCalves',
    label: 'أرجل وسمانات',
    short: 'أرجل وسمانات',
    tone: 'legs',
    description: 'تمارين الأرجل والسمانات بنظام الحسم (8 تمارين)',
    exercises: [
      {
        number: 23,
        title: 'تسخين الرجلين على الدراجة | Stationary Bike Warm-Up',
        sets: 1,
        reps: '10 دقائق',
        alternative: 'مشاية كهربائية أو إحماء ديناميكي | Treadmill Warm-up',
        page: 18,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%B7%D9%86/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_12_39%20AM%20%284%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0018.jpg?v=1785709353'
      },
      {
        number: 24,
        title: 'رفرفة أمامية للرجل | Leg Extension',
        sets: 3,
        reps: '10-12',
        alternative: '',
        page: 18,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0018.jpg?v=1785709353'
      },
      {
        number: 25,
        title: 'ضغط الأرجل | Leg Press',
        sets: 3,
        reps: '8-12',
        alternative: 'هاك سكوات | Hack Squat',
        page: 19,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_40%20PM%20%289%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0019.jpg?v=1785709353'
      },
      {
        number: 26,
        title: 'ضم الفخذ للداخل | Hip Adductor Machine',
        sets: 3,
        reps: '12-15',
        alternative: '',
        page: 19,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0019.jpg?v=1785709353'
      },
      {
        number: 27,
        title: 'فتح الفخذ للخارج | Hip Abductor Machine',
        sets: 3,
        reps: '12-15',
        alternative: '',
        page: 19,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0019.jpg?v=1785709353'
      },
      {
        number: 28,
        title: 'رفرفة خلفية للرجل | Lying Leg Curl',
        sets: 3,
        reps: '10-12',
        alternative: 'رجل خلفي جالس | Seated Leg Curl',
        page: 20,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_40%20PM%20%288%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0020.jpg?v=1785709353'
      },
      {
        number: 29,
        title: 'تمرين السمانة على جهاز السميث | Smith Machine Calf Raise',
        sets: 3,
        reps: '15',
        alternative: 'سمانة على جهاز السمانة الواقف | Standing Calf Raise',
        page: 20,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_49%20PM%20%285%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0020.jpg?v=1785709353'
      },
      {
        number: 30,
        title: 'إطالات الرجلين | Leg Stretches',
        sets: 1,
        reps: '5 دقائق',
        alternative: 'إطالات العضلات الخلفية والرباعية',
        page: 21,
        image: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0021.jpg?v=1785709352',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0021.jpg?v=1785709352'
      }
    ]
  }
];

export function getHasmGroup(groupKey) {
  return HASM_GROUPS.find(g => g.key === groupKey) || HASM_GROUPS[0];
}

export function hasmExerciseId(groupKey, exerciseIndex) {
  return `hasm_${groupKey}_${exerciseIndex}`;
}

export function getAllHasmExercises() {
  return HASM_GROUPS.flatMap(group => group.exercises.map((ex, index) => ({
    ...ex,
    groupKey: group.key,
    groupLabel: group.label,
    id: hasmExerciseId(group.key, index)
  })));
}
