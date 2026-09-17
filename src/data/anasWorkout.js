/**
 * NEON COACH — نظام أنس (Anas System) Workout Data
 * مستخرج من anas.html?book=anas ومربوط بمكتبة صور Cloudflare R2 وصفحات الكتاب الأصلية
 */

export const ANAS_PROGRAM = Object.freeze({
  id: 'anas',
  key: 'anas',
  title: 'نظام أنس',
  shortTitle: 'أنس',
  kicker: 'ANAS WORKOUT SYSTEM',
  description: 'خطة تدريبية متكاملة مقسمة إلى 5 أيام: Push / Pull / Legs / Upper / كتف وبطن وسواعد.',
  filterHeading: 'اختر نوع التمرين',
  durationDays: 30,
  cover: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0001.jpg?v=1785709351'
});

export const ANAS_DAYS = [
  {
    key: 'saturdayPush',
    label: 'السبت — Push',
    short: 'Push',
    tone: 'push',
    description: 'تمارين الدفع: صدر، أكتاف، وترايسبس (7 تمارين)',
    exercises: [
      {
        number: 1,
        title: 'صدر إنكلاين علوي | Incline Chest Press',
        sets: 3,
        reps: '',
        alternative: 'صدر علوي بالدامبل | Incline Dumbbell Bench Press',
        page: 6,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_31%20PM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0006.jpg?v=1785709350'
      },
      {
        number: 2,
        title: 'صدر مستوي | Flat Chest Press / Flat Bench Press',
        sets: 3,
        reps: '',
        alternative: 'دامبل بنش بريس | Dumbbell Bench Press',
        page: 5,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_30%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0005.jpg?v=1785709350'
      },
      {
        number: 3,
        title: 'كتف جانبي | Lateral Raise',
        sets: 3,
        reps: '',
        alternative: 'رفرفة جانبي بالكابل | Cable Side Lateral Raise',
        page: 14,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0014.jpg?v=1785709353'
      },
      {
        number: 4,
        title: 'كتف أمامي | Front Deltoid Exercise / Front Raise',
        sets: 3,
        reps: '',
        alternative: 'رفرفة أمامية بالكابل | Cable Front Raise',
        page: 15,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0015.jpg?v=1785709353'
      },
      {
        number: 5,
        title: 'ترايسبس بالحبل | Rope Triceps Pushdown',
        sets: 3,
        reps: '',
        alternative: 'دفع مسطرة للأسفل | Straight-Bar Triceps Pushdown',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_36%20AM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      },
      {
        number: 6,
        title: 'ترايسبس سنغل آرم | Single-Arm Triceps Pushdown',
        sets: 3,
        reps: '',
        alternative: 'ترايسبس بالكيبل بيد واحدة | Cable One-Arm Pushdown',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_34%20AM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      },
      {
        number: 7,
        title: 'ترايسبس من فوق الرأس | Overhead Triceps Extension',
        sets: 3,
        reps: '',
        alternative: 'تمديد ترايسبس دامبل فوق الرأس | Overhead Dumbbell Extension',
        page: 17,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_36%20AM%20%284%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0017.jpg?v=1785709352'
      }
    ]
  },
  {
    key: 'sundayPull',
    label: 'الأحد — Pull',
    short: 'Pull',
    tone: 'pull',
    description: 'تمارين السحب: ظهر، كتف خلفي، وبايسبس (6 تمارين)',
    exercises: [
      {
        number: 1,
        title: 'سحب ظهر من فوق | Lat Pulldown',
        sets: 3,
        reps: '',
        alternative: 'عقلة | Pull-Ups',
        page: 10,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0010.jpg?v=1785709352'
      },
      {
        number: 2,
        title: 'تمرين ظهر على الجهاز | Machine Row / Back Machine',
        sets: 3,
        reps: '',
        alternative: 'سحب تي بار واسع | Wide-Grip T-Bar Row',
        page: 10,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0010.jpg?v=1785709352'
      },
      {
        number: 3,
        title: 'سحب أرضي | Seated Cable Row',
        sets: 3,
        reps: '',
        alternative: 'سحب أرضي بمسكة ضيقة | Seated Cable Row',
        page: 11,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0011.jpg?v=1785709352'
      },
      {
        number: 4,
        title: 'كتف خلفي | Rear Delt Fly / Reverse Fly',
        sets: 3,
        reps: '',
        alternative: 'جهاز الفراشة الخلفي | Reverse Pec Deck',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%288%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      },
      {
        number: 5,
        title: 'بايسبس بار | Barbell Curl',
        sets: 3,
        reps: '',
        alternative: 'بايسبس بار زجزاج على المسطبة | Barbell Preacher Curl',
        page: 9,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0009.jpg?v=1785709353'
      },
      {
        number: 6,
        title: 'بايسبس عزل | Isolation Biceps Curl',
        sets: 3,
        reps: '',
        alternative: 'بايسبس تبادل دامبل جالس على بنش مائل | Incline Dumbbell Curl',
        page: 9,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%283%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0009.jpg?v=1785709353'
      }
    ]
  },
  {
    key: 'mondayLegs',
    label: 'الاثنين — Legs',
    short: 'Legs',
    tone: 'legs',
    description: 'تمارين الأرجل والسمانات (5 تمارين)',
    exercises: [
      {
        number: 1,
        title: 'تمارين أرجل | Leg Day / Leg Workout',
        sets: 3,
        reps: '',
        alternative: 'سكوات بالبار أو الدفع بالرجل | Squat or Leg Press',
        page: 18,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_36%20PM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0018.jpg?v=1785709353'
      },
      {
        number: 2,
        title: 'رفرفة أمامية للرجل | Leg Extension',
        sets: 3,
        reps: '',
        alternative: '',
        page: 18,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%282%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0018.jpg?v=1785709353'
      },
      {
        number: 3,
        title: 'ضغط الأرجل | Leg Press',
        sets: 3,
        reps: '',
        alternative: '',
        page: 19,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_39%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0019.jpg?v=1785709353'
      },
      {
        number: 4,
        title: 'رفرفة خلفية للرجل | Lying Leg Curl',
        sets: 3,
        reps: '',
        alternative: '',
        page: 20,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_40%20PM%20%288%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0020.jpg?v=1785709353'
      },
      {
        number: 5,
        title: 'تمرين السمانة على جهاز السميث | Smith Machine Calf Raise',
        sets: 3,
        reps: '',
        alternative: '',
        page: 20,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_49%20PM%20%285%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0020.jpg?v=1785709353'
      }
    ]
  },
  {
    key: 'wednesdayUpper',
    label: 'الأربعاء — Upper',
    short: 'Upper',
    tone: 'upper',
    description: 'تمارين الجزء العلوي: صدر، ظهر، باي، وتراي (6 تمارين)',
    exercises: [
      {
        number: 1,
        title: 'صدر بالفراشة | Pec Deck Fly / Chest Fly',
        sets: 3,
        reps: '',
        alternative: 'عزل الصدر بجهاز الفراشة | Butterfly / Pec Deck',
        page: 7,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_33%20PM%20%288%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0007.jpg?v=1785709352'
      },
      {
        number: 2,
        title: 'صدر سفلي | Decline Chest Press',
        sets: 3,
        reps: '',
        alternative: 'عزل صدر سفلي بالكابل | Standing Cable Fly',
        page: 8,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_33%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0008.jpg?v=1785709350'
      },
      {
        number: 3,
        title: 'ديد ليفت للظهر | Deadlift',
        sets: 3,
        reps: '',
        alternative: 'ديدلفت بالبار | Barbell Deadlift',
        page: 12,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%285%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0012.jpg?v=1785709352'
      },
      {
        number: 4,
        title: 'سحب ظهر بالكابل | Cable Row',
        sets: 3,
        reps: '',
        alternative: 'عزل الظهر بالكابل والذراعان مستقيمتان | Straight-Arm Rope Pulldown',
        page: 12,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%284%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0012.jpg?v=1785709352'
      },
      {
        number: 5,
        title: 'بايسبس | Biceps Exercise / Biceps Curl',
        sets: 3,
        reps: '',
        alternative: 'تبادل همر دامبلز | Alternating Dumbbell Hammer Curl',
        page: 9,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%285%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0009.jpg?v=1785709353'
      },
      {
        number: 6,
        title: 'ترايسبس | Triceps Exercise',
        sets: 3,
        reps: '',
        alternative: 'دفع مسطرة للأسفل | Triceps Pushdown',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_34%20AM%20%281%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      }
    ]
  },
  {
    key: 'thursdayAccessories',
    label: 'الخميس — أكتاف + بطن + سواعد',
    short: 'كتف',
    tone: 'shoulders',
    description: 'أكتاف، سواعد، وبطن (5 تمارين)',
    exercises: [
      {
        number: 1,
        title: 'كتف جانبي | Lateral Raise',
        sets: 3,
        reps: '',
        alternative: 'رفرفة جانبي بالكابل | Cable Side Lateral Raise',
        page: 14,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0014.jpg?v=1785709353'
      },
      {
        number: 2,
        title: 'كتف خلفي | Rear Delt Fly',
        sets: 3,
        reps: '',
        alternative: 'جهاز الفراشة الخلفي | Reverse Pec Deck',
        page: 16,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%288%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0016.jpg?v=1785709353'
      },
      {
        number: 3,
        title: 'كتف أمامي | Front Deltoid Exercise / Front Raise',
        sets: 3,
        reps: '',
        alternative: 'رفرفة أمامية بالكابل | Cable Front Raise',
        page: 15,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0015.jpg?v=1785709353'
      },
      {
        number: 4,
        title: 'تمارين سواعد | Forearm Exercises',
        sets: 3,
        reps: '',
        alternative: 'تمرينان سواعد | 2 Forearm Exercises',
        page: 24,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_55%20AM%20%286%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0701/6736/3720/files/pages-to-jpg-0024.jpg?v=1769279348'
      },
      {
        number: 5,
        title: 'تمارين بطن | Abdominal / Abs Exercises',
        sets: 3,
        reps: '',
        alternative: 'تمرينان بطن | 2 Abs Exercises',
        page: 13,
        image: 'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%287%29.png',
        pageImage: 'https://cdn.shopify.com/s/files/1/0854/4560/7664/files/page-0013.jpg?v=1785709347'
      }
    ]
  }
];

export function getAnasDay(dayKey) {
  return ANAS_DAYS.find(d => d.key === dayKey) || ANAS_DAYS[0];
}

export function anasExerciseId(dayKey, exerciseIndex) {
  return `anas_${dayKey}_${exerciseIndex}`;
}

export function getAllAnasExercises() {
  return ANAS_DAYS.flatMap(day => day.exercises.map((ex, index) => ({
    ...ex,
    dayKey: day.key,
    dayLabel: day.label,
    id: anasExerciseId(day.key, index)
  })));
}
