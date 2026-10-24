import { ALL_LIBRARY_EXERCISES } from './exerciseLibrary.js';

export const ULF_DROP_NOTE = 'بعد آخر مجموعة فقط: خفّض الوزن 25–35% وأكمل حتى الفشل التقني (Technical Failure).';
export const ULF_PROGRAM = Object.freeze({
  id: 'ulf', key: 'ulf', title: 'Upper / Lower / Full Body',
  shortTitle: 'Upper / Lower / Full',
  kicker: 'MUSCLE RETENTION · FAT LOSS PHASE · 3 DAYS / WEEK',
  description: 'السبت Upper Body · الأحد Lower Body · الثلاثاء Full Body. 49 مجموعة عمل + 3 Drop Sets أسبوعيًا.',
  filterHeading: 'اختر يوم التمرين', durationDays: 0,
  cover: './icons/muscles/back.png',
  schedule: 'التدريب: السبت والأحد والثلاثاء. الراحة: الإثنين والأربعاء والخميس والجمعة.',
  dropSetNote: ULF_DROP_NOTE
});

// Rest intervals are suggested defaults; the user's supplied Sets / Reps / RIR stay exact.
function exercise(title, imageName, sets, reps, rir, restSeconds, { dropSet = false, imageFallback = false, restLabel } = {}) {
  const source = ALL_LIBRARY_EXERCISES.find(item => item.rawName === imageName);
  if (!source) throw new Error(`Missing ULF exercise image: ${imageName}`);
  return {
    title, sets, reps, rir, restSeconds, restLabel, dropSet,
    groupKey: source.groupKey, image: source.image,
    imageReference: source.nameEn,
    imageNote: imageFallback ? `صورة توضيحية لأقرب تمرين متاح: ${source.nameAr} (${source.nameEn})` : '',
    coachingNote: dropSet ? ULF_DROP_NOTE : ''
  };
}
const ex = exercise;

export const ULF_DAYS = [
  { key: 'ulfUpper', label: 'السبت — Upper Body', short: 'السبت · Upper', tone: 'push', exercises: [
    ex('بنش دامبل مستوي | Flat DB Bench Press', 'DUMBBELL BENCH PRESS', 3, '6–10', '1–2', 180),
    ex('تجديف مع إسناد الصدر | Chest-Supported Row', 'TRIPOD DUMBBELL ROW ALTERNATIVE', 3, '8–12', '1–2', 120, { imageFallback: true }),
    ex('ضغط صدر علوي بزاوية 45° بالدامبل | Incline DB Press', 'INCLINE BENCH PRESS', 2, '8–12', '1–2', 120, { imageFallback: true }),
    ex('سحب أمامي | Lat Pulldown', 'WIDE GRIP LAT PULLDOWN', 2, '8–12', '1–2', 120),
    ex('رفرفة جانبية بالكابل | Cable Lateral Raise', 'CABLE LATERAL RAISE', 2, '12–20', '0–1', 90, { dropSet: true }),
    ex('فراشة عكسية للكتف الخلفي | Reverse Pec Deck', 'REVERSE MACHINE FLYES', 1, '12–20', '0–1', 90),
    ex('بايسبس بالكابل | Cable Biceps Curl', 'OVERHEAD CABLE CURL', 2, '10–15', '0–1', 90, { imageFallback: true }),
    ex('تمديد ترايسبس فوق الرأس | Overhead Triceps Extension', 'OVERHEAD CABLE ROPE EXTENSION', 2, '10–15', '0–1', 90)
  ] },
  { key: 'ulfLower', label: 'الأحد — Lower Body', short: 'الأحد · Lower', tone: 'legs', exercises: [
    ex('هاك سكوات | Hack Squat', 'MACHINE HACK SQUATS', 3, '6–10', '1–2', 180),
    ex('ديدليفت روماني بالدامبل | DB Romanian Deadlift', 'ROMANIAN DEADLIFT', 2, '6–10', '2', 180, { imageFallback: true }),
    ex('دفع الأرجل | Leg Press', 'LEG PRESS', 2, '10–15', '1–2', 150),
    ex('ثني الأرجل جالسًا | Seated Leg Curl', 'SEATED LEG CURL', 2, '10–15', '0–1', 90, { dropSet: true }),
    ex('رفع السمانة واقفًا | Standing Calf Raise', 'STANDING MACHINE CALF RAISE', 2, '10–15', '0–1', 90),
    ex('كرنش بالكابل | Cable Crunch', 'MACHINE CRUNCH', 2, '10–15', '0–1', 90, { imageFallback: true })
  ] },
  { key: 'ulfFull', label: 'الثلاثاء — Full Body', short: 'الثلاثاء · Full', tone: 'pull', exercises: [
    ex('ضغط صدر علوي بزاوية 45° على الجهاز | Incline Machine Chest Press', 'INCLINE BENCH PRESS', 2, '8–12', '1–2', 120, { imageFallback: true }),
    ex('سحب أرضي بالكابل | Seated Cable Row', 'SEATED CABLE ROW', 2, '8–12', '1–2', 120),
    ex('سحب أمامي | Lat Pulldown', 'WIDE GRIP LAT PULLDOWN', 1, '10–12', '1', 120),
    ex('دفع الأرجل | Leg Press', 'LEG PRESS', 2, '10–15', '1–2', 150),
    ex('ثني الأرجل جالسًا | Seated Leg Curl', 'SEATED LEG CURL', 2, '10–15', '1–2', 90),
    ex('رفرفة جانبية بالكابل | Cable Lateral Raise', 'CABLE LATERAL RAISE', 2, '12–20', '0–1', 90),
    ex('بايسبس بالكابل | Cable Biceps Curl', 'OVERHEAD CABLE CURL', 2, '10–15', '0–1', 90, { dropSet: true, imageFallback: true }),
    ex('تمديد ترايسبس فوق الرأس | Overhead Triceps Extension', 'OVERHEAD CABLE ROPE EXTENSION', 2, '10–15', '0–1', 90),
    ex('رفع السمانة جالسًا | Seated Calf Raise', 'STANDING MACHINE CALF RAISE', 2, '10–15', '0–1', 90, { imageFallback: true }),
    ex('كرنش بالكابل | Cable Crunch', 'MACHINE CRUNCH', 2, '10–15', '0–1', 90, { imageFallback: true })
  ] }
].map(day => ({
  ...day,
  exercises: day.exercises.map((item, index) => ({ ...item, number: index + 1, id: `ulf_${day.key}_${index}` }))
}));

export const getUlfDay = key => ULF_DAYS.find(day => day.key === key) || ULF_DAYS[0];
