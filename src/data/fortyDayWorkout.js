const asset = page => `https://cdn.shopify.com/s/files/1/0739/2205/2198/files/Push_Pull_Legs__page-${String(page).padStart(4, '0')}.jpg?v=${[10, 19, 24].includes(page) ? '1788696801' : [15, 20].includes(page) ? '1788696800' : '1788696802'}`;
const exercise = (number, title, sets, reps, page, alternative = '', r2Image = null) => ({
  number,
  title,
  sets,
  reps,
  image: r2Image || asset(page),
  pageImage: asset(page),
  alternative
});

export const FORTY_DAY_PROGRAM = Object.freeze({
  id: 'fortyDay',
  title: 'تمرين الـ40 يوم',
  description: 'برنامج Push / Pull / Legs لمدة 6 أيام أسبوعيًا، واليوم السابع راحة.',
  durationDays: 40,
  cover: 'https://cdn.shopify.com/s/files/1/0739/2205/2198/files/Push_Pull_Legs__page-0001.jpg?v=1788696803'
});

export const FORTY_DAY_DAYS = [
  { key: 'pushA', short: 'Push A', label: 'اليوم 1 — Push A', tone: 'push', exercises: [
    exercise(1, 'بنش برس | Bench Press', 3, '8-12', 5, 'دامبل بنش برس | Dumbbell Bench Press',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_30%20PM%20%281%29.png'),
    exercise(2, 'ضغط كتف بار أمامي | Barbell Shoulder Press', 3, '8-12', 6, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_32%20PM%20%283%29.png'),
    exercise(3, 'صدر علوي دامبل | Incline Dumbbell Bench Press', 2, '8-12', 6, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_31%20PM%20%283%29.png'),
    exercise(4, 'رفرفة كتف جانبية | Side Lateral Raise', 3, '15', 7, 'بالدامبل أو الكيبل | Dumbbell or Cable',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_44%20PM%20%283%29.png'),
    exercise(5, 'عزل صدر سفلي بالكيبل | Lower Chest Cable Fly', 2, '8-12', 7, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_33%20PM%20%287%29.png'),
    exercise(6, 'تمديد ترايسبس دامبل فوق الرأس | Overhead Dumbbell Triceps Extension', 3, '15', 8, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_36%20AM%20%285%29.png'),
    exercise(7, 'دفع ترايسبس للأسفل | Triceps Pushdown', 3, '15', 8, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_34%20AM%20%281%29.png')
  ] },
  { key: 'pullA', short: 'Pull A', label: 'اليوم 2 — Pull A', tone: 'pull', exercises: [
    exercise(1, 'سحب ييتس بالبار على البطن | Yates Row', 3, '8-12', 9, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_10%20PM%20%281%29.png'),
    exercise(2, 'سحب أمامي بقبضة عكسية | Reverse-Grip Lat Pulldown', 3, '8-12', 9, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_35%20PM%20%284%29.png'),
    exercise(3, 'عزل ظهر بالكيبل | Straight-Arm Cable Pulldown', 3, '8-12', 10, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%284%29.png'),
    exercise(4, 'سحب بار للذقن | Upright Row', 3, '8-12', 10, 'أو سحب ترابيس بالبار | Barbell Shrug',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%289%29.png'),
    exercise(5, 'هامر كيرل | Hammer Curl', 3, '8-12', 11, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%285%29.png'),
    exercise(6, 'بايسبس دامبل مائل | Incline Dumbbell Curl', 3, '8-12', 11, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%283%29.png')
  ] },
  { key: 'legsA40', short: 'Legs A', label: 'اليوم 3 — Legs A', tone: 'legs', exercises: [
    exercise(1, 'تسخين الرجلين | Leg Warm-up', 1, '10 دقائق للرجل + 5 دقائق للجسم', 12),
    exercise(2, 'رفرفة أمامية للرجل | Leg Extension', 3, '8-12', 12, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%282%29.png'),
    exercise(3, 'سكوات خلفي بالبار | Barbell Back Squat', 3, '8-12', 13, 'أو بديله المناسب',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_36%20PM%20%281%29.png'),
    exercise(4, 'رجل خلفي | Lying Leg Curl', 3, '8-12', 14, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_40%20PM%20%288%29.png'),
    exercise(5, 'سمانة على جهاز السميث | Smith Machine Calf Raise', 4, '15', 14, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_49%20PM%20%285%29.png'),
    exercise(6, 'إطالات للرجلين | Leg Stretching', 1, '', 15)
  ] },
  { key: 'pushB', short: 'Push B', label: 'اليوم 4 — Push B', tone: 'push', exercises: [
    exercise(1, 'بنش برس | Bench Press', 2, '8-12', 16, 'أو دامبل برس | Dumbbell Press',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_30%20PM%20%281%29.png'),
    exercise(2, 'ضغط كتف أمامي | Shoulder Press', 2, '8-12', 16, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_32%20PM%20%282%29.png'),
    exercise(3, 'ضغط صدر سفلي | Decline Bench Press', 2, '8-12', 17, 'جهاز أو Smith',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B5%D8%AF%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_07_31%20PM%20%284%29.png'),
    exercise(4, 'بنش برس قبضة ضيقة | Close-Grip Bench Press', 3, '15', 17, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_35%20AM%20%282%29.png'),
    exercise(5, 'تمديد ترايسبس بالحبل فوق الرأس | Overhead Cable Rope Triceps Extension', 3, '', 18, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%AA%D8%B1%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_03_36%20AM%20%284%29.png'),
    exercise(6, 'تمرين السواعد الأول | Forearms 1', 3, '12', 18, 'اختر تمرين السواعد المناسب',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B3%D9%88%D8%A7%D8%B9%D8%AF/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_10_10%20AM%20%282%29.png'),
    exercise(7, 'تمرين السواعد الثاني | Forearms 2', 3, '12', 18, 'اختر تمرينًا مختلفًا للسواعد',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B3%D9%88%D8%A7%D8%B9%D8%AF/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2012_10_09%20AM%20%281%29.png')
  ] },
  { key: 'pullB', short: 'Pull B', label: 'اليوم 5 — Pull B', tone: 'pull', exercises: [
    exercise(1, 'عقلة بوزن الجسم | Pull-Ups', 3, '', 19, 'أو سحب أمامي | Lat Pulldown',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%282%29.png'),
    exercise(2, 'تي بار واسع | Wide T-Bar Row', 2, '8-12', 19, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%286%29.png'),
    exercise(3, 'رفرفة كتف خلفية | Rear Delt Raise', 2, '8-12', 20, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D9%83%D8%AA%D9%81/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_54_33%20PM%20%287%29.png'),
    exercise(4, 'ديدليفت على البار المعلق | Rack Pull Deadlift', 3, '', 20, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%283%29.png'),
    exercise(5, 'بايسبس بار زجزاج | EZ-Bar Curl', 3, '8-12', 21, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%284%29.png'),
    exercise(6, 'بايسبس دامبل جالس | Seated Dumbbell Curl', 3, '8-12', 21, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A8%D8%A7%D9%8A%D8%B3%D9%8A%D8%A8%D8%B3/ChatGPT%20Image%20Sep%2015%2C%202026%2C%2001_53_54%20AM%20%287%29.png')
  ] },
  { key: 'legsB', short: 'Legs B', label: 'اليوم 6 — Legs B', tone: 'legs', exercises: [
    exercise(1, 'تسخين الرجلين | Leg Warm-up', 1, '10 دقائق للرجل + 5 دقائق للجسم', 22),
    exercise(2, 'ضغط الأرجل | Leg Press', 3, '8-12', 22, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_40%20PM%20%289%29.png'),
    exercise(3, 'ديدليفت روماني للرجل الخلفية | Stiff-Legged Deadlift', 3, '8-12', 23, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%B8%D9%87%D8%B1/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_53_11%20PM%20%287%29.png'),
    exercise(4, 'جهاز الفخذ الداخلي | Inner Thigh Machine', 3, 'أوزان خفيفة', 23, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%281%29.png'),
    exercise(5, 'جهاز الفخذ الخارجي | Outer Thigh Machine', 3, 'أوزان خفيفة', 23, 'اختياري إذا كان متوفرًا',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_47%20PM%20%281%29.png'),
    exercise(6, 'رفع السمانة | Calf Raise', 3, '8-12', 24, '',
      'https://pub-bc14264a47ab413ba995108f257ad83d.r2.dev/GYM.2/%D8%A7%D8%B1%D8%AC%D9%84/ChatGPT%20Image%20Sep%2014%2C%202026%2C%2011_55_49%20PM%20%285%29.png'),
    exercise(7, 'إطالات للرجلين | Leg Stretching', 1, '', 24)
  ] },
  { key: 'restDay', short: 'راحة', label: 'اليوم 7 — راحة', tone: 'rest', exercises: [] }
];

export function getFortyDay(dayKey) {
  return FORTY_DAY_DAYS.find(day => day.key === dayKey) || FORTY_DAY_DAYS[0];
}

export function fortyDayExerciseId(dayKey, exerciseIndex) {
  return `fortyDay_${dayKey}_${exerciseIndex}`;
}
