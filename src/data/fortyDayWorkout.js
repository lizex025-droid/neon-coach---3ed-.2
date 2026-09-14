const asset = page => `https://cdn.shopify.com/s/files/1/0739/2205/2198/files/Push_Pull_Legs__page-${String(page).padStart(4, '0')}.jpg?v=${[10, 19, 24].includes(page) ? '1788696801' : [15, 20].includes(page) ? '1788696800' : '1788696802'}`;
const exercise = (number, title, sets, reps, page, alternative = '') => ({ number, title, sets, reps, image: asset(page), alternative });

export const FORTY_DAY_PROGRAM = Object.freeze({
  id: 'fortyDay',
  title: 'تمرين الـ40 يوم',
  description: 'برنامج Push / Pull / Legs لمدة 6 أيام أسبوعيًا، واليوم السابع راحة.',
  durationDays: 40,
  cover: 'https://cdn.shopify.com/s/files/1/0739/2205/2198/files/Push_Pull_Legs__page-0001.jpg?v=1788696803'
});

export const FORTY_DAY_DAYS = [
  { key: 'pushA', short: 'Push A', label: 'اليوم 1 — Push A', tone: 'push', exercises: [
    exercise(1, 'بنش برس | Bench Press', 3, '8-12', 5, 'دامبل بنش برس | Dumbbell Bench Press'),
    exercise(2, 'ضغط كتف بار أمامي | Barbell Shoulder Press', 3, '8-12', 6),
    exercise(3, 'صدر علوي دامبل | Incline Dumbbell Bench Press', 2, '8-12', 6),
    exercise(4, 'رفرفة كتف جانبية | Side Lateral Raise', 3, '15', 7, 'بالدامبل أو الكيبل | Dumbbell or Cable'),
    exercise(5, 'عزل صدر سفلي بالكيبل | Lower Chest Cable Fly', 2, '8-12', 7),
    exercise(6, 'تمديد ترايسبس دامبل فوق الرأس | Overhead Dumbbell Triceps Extension', 3, '15', 8),
    exercise(7, 'دفع ترايسبس للأسفل | Triceps Pushdown', 3, '15', 8)
  ] },
  { key: 'pullA', short: 'Pull A', label: 'اليوم 2 — Pull A', tone: 'pull', exercises: [
    exercise(1, 'سحب ييتس بالبار على البطن | Yates Row', 3, '8-12', 9),
    exercise(2, 'سحب أمامي بقبضة عكسية | Reverse-Grip Lat Pulldown', 3, '8-12', 9),
    exercise(3, 'عزل ظهر بالكيبل | Straight-Arm Cable Pulldown', 3, '8-12', 10),
    exercise(4, 'سحب بار للذقن | Upright Row', 3, '8-12', 10, 'أو سحب ترابيس بالبار | Barbell Shrug'),
    exercise(5, 'هامر كيرل | Hammer Curl', 3, '8-12', 11),
    exercise(6, 'بايسبس دامبل مائل | Incline Dumbbell Curl', 3, '8-12', 11)
  ] },
  { key: 'legsA40', short: 'Legs A', label: 'اليوم 3 — Legs A', tone: 'legs', exercises: [
    exercise(1, 'تسخين الرجلين | Leg Warm-up', 1, '10 دقائق للرجل + 5 دقائق للجسم', 12),
    exercise(2, 'رفرفة أمامية للرجل | Leg Extension', 3, '8-12', 12),
    exercise(3, 'سكوات خلفي بالبار | Barbell Back Squat', 3, '8-12', 13, 'أو بديله المناسب'),
    exercise(4, 'رجل خلفي | Lying Leg Curl', 3, '8-12', 14),
    exercise(5, 'سمانة على جهاز السميث | Smith Machine Calf Raise', 4, '15', 14),
    exercise(6, 'إطالات للرجلين | Leg Stretching', 1, '', 15)
  ] },
  { key: 'pushB', short: 'Push B', label: 'اليوم 4 — Push B', tone: 'push', exercises: [
    exercise(1, 'بنش برس | Bench Press', 2, '8-12', 16, 'أو دامبل برس | Dumbbell Press'),
    exercise(2, 'ضغط كتف أمامي | Shoulder Press', 2, '8-12', 16),
    exercise(3, 'ضغط صدر سفلي | Decline Bench Press', 2, '8-12', 17, 'جهاز أو Smith'),
    exercise(4, 'بنش برس قبضة ضيقة | Close-Grip Bench Press', 3, '15', 17),
    exercise(5, 'تمديد ترايسبس بالحبل فوق الرأس | Overhead Cable Rope Triceps Extension', 3, '', 18),
    exercise(6, 'تمرين السواعد الأول | Forearms 1', 3, '12', 18, 'اختر تمرين السواعد المناسب'),
    exercise(7, 'تمرين السواعد الثاني | Forearms 2', 3, '12', 18, 'اختر تمرينًا مختلفًا للسواعد')
  ] },
  { key: 'pullB', short: 'Pull B', label: 'اليوم 5 — Pull B', tone: 'pull', exercises: [
    exercise(1, 'عقلة بوزن الجسم | Pull-Ups', 3, '', 19, 'أو سحب أمامي | Lat Pulldown'),
    exercise(2, 'تي بار واسع | Wide T-Bar Row', 2, '8-12', 19),
    exercise(3, 'رفرفة كتف خلفية | Rear Delt Raise', 2, '8-12', 20),
    exercise(4, 'ديدليفت على البار المعلق | Rack Pull Deadlift', 3, '', 20),
    exercise(5, 'بايسبس بار زجزاج | EZ-Bar Curl', 3, '8-12', 21),
    exercise(6, 'بايسبس دامبل جالس | Seated Dumbbell Curl', 3, '8-12', 21)
  ] },
  { key: 'legsB', short: 'Legs B', label: 'اليوم 6 — Legs B', tone: 'legs', exercises: [
    exercise(1, 'تسخين الرجلين | Leg Warm-up', 1, '10 دقائق للرجل + 5 دقائق للجسم', 22),
    exercise(2, 'ضغط الأرجل | Leg Press', 3, '8-12', 22),
    exercise(3, 'ديدليفت روماني للرجل الخلفية | Stiff-Legged Deadlift', 3, '8-12', 23),
    exercise(4, 'جهاز الفخذ الداخلي | Inner Thigh Machine', 3, 'أوزان خفيفة', 23),
    exercise(5, 'جهاز الفخذ الخارجي | Outer Thigh Machine', 3, 'أوزان خفيفة', 23, 'اختياري إذا كان متوفرًا'),
    exercise(6, 'رفع السمانة | Calf Raise', 3, '8-12', 24),
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
