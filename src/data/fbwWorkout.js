import { ALL_LIBRARY_EXERCISES } from './exerciseLibrary.js';

export const FBW_DROP_NOTE = 'بعد آخر مجموعة فقط: خفّض الوزن 25–35% وأكمل حتى الفشل التقني (Technical Failure).';
export const FBW_PROGRAM = Object.freeze({
  id: 'fbw', key: 'fbw', title: 'FBW — Full Body', shortTitle: 'FBW',
  kicker: 'MUSCLE RETENTION · FAT LOSS PHASE · 3 DAYS / WEEK',
  description: 'السبت A: صدر وأماميات · الأحد B: ظهر وخلفيات · الثلاثاء C: تضخيم متوازن. 48 مجموعة عمل + 3 Drop Sets أسبوعيًا.',
  filterHeading: 'اختر يوم Full Body', durationDays: 0,
  cover: './icons/muscles/back.png',
  schedule: 'التدريب: السبت والأحد والثلاثاء. الراحة: الإثنين والأربعاء والخميس والجمعة.',
  dropSetNote: FBW_DROP_NOTE
});

function exercise(title, imageName, sets, reps, rir, restSeconds, { dropSet = false, imageFallback = false, restLabel } = {}) {
  const source = ALL_LIBRARY_EXERCISES.find(item => item.rawName === imageName);
  if (!source) throw new Error(`Missing FBW exercise image: ${imageName}`);
  return {
    title, sets, reps, rir, restSeconds, restLabel, dropSet,
    groupKey: source.groupKey, image: source.image,
    imageReference: source.nameEn,
    imageNote: imageFallback ? `صورة توضيحية لأقرب تمرين متاح: ${source.nameAr} (${source.nameEn})` : '',
    coachingNote: dropSet ? FBW_DROP_NOTE : ''
  };
}
const ex = exercise;
export const FBW_DAYS = [
  { key: 'fbwA', label: 'السبت — Full Body A (Chest + Quads)', short: 'السبت · A', tone: 'push', exercises: [
    ex('هاك سكوات | Hack Squat', 'MACHINE HACK SQUATS', 2, '6–10', '1–2', 180),
    ex('بنش دامبل مستوي | Flat DB Bench Press', 'DUMBBELL BENCH PRESS', 3, '6–10', '1–2', 180, { restLabel: '2–3 دقائق' }),
    ex('سحب أمامي | Lat Pulldown', 'WIDE GRIP LAT PULLDOWN', 3, '8–12', '1–2', 120),
    ex('ثني الأرجل جالسًا | Seated Leg Curl', 'SEATED LEG CURL', 1, '10–15', '1–2', 90),
    ex('رفرفة جانبية بالكابل | Cable Lateral Raise', 'CABLE LATERAL RAISE', 2, '12–20', '0–1', 90, { dropSet: true }),
    ex('تمديد ترايسبس فوق الرأس | Overhead Triceps Extension', 'OVERHEAD CABLE ROPE EXTENSION', 1, '10–15', '0–1', 90),
    ex('بايسبس بالكابل | Cable Biceps Curl', 'OVERHEAD CABLE CURL', 1, '10–15', '0–1', 90, { imageFallback: true }),
    ex('رفع السمانة واقفًا | Standing Calf Raise', 'STANDING MACHINE CALF RAISE', 1, '10–15', '0–1', 90),
    ex('كرنش بالكابل | Cable Crunch', 'MACHINE CRUNCH', 1, '10–15', '0–1', 90, { imageFallback: true })
  ] },
  { key: 'fbwB', label: 'الأحد — Full Body B (Back + Hamstrings)', short: 'الأحد · B', tone: 'pull', exercises: [
    ex('ديدليفت روماني بالدامبل | DB Romanian Deadlift', 'ROMANIAN DEADLIFT', 2, '6–10', '1–2', 180, { imageFallback: true }),
    ex('تجديف مع إسناد الصدر | Chest-Supported Row', 'T-BAR ROW', 3, '8–12', '1–2', 120, { imageFallback: true }),
    ex('فرد الأرجل | Leg Extension', 'LEG EXTENSION', 2, '12–15', '2–3', 90),
    ex('ثني الأرجل جالسًا | Seated Leg Curl', 'SEATED LEG CURL', 2, '10–15', '0–1', 90, { dropSet: true }),
    ex('ضغط صدر علوي بالجهاز | Incline Machine Chest Press', 'INCLINE BENCH PRESS', 1, '10–12', '1–2', 120, { imageFallback: true }),
    ex('فراشة عكسية للكتف الخلفي | Reverse Pec Deck', 'REVERSE MACHINE FLYES', 2, '12–20', '0–1', 90),
    ex('دفع ترايسبس بالحبل | Rope Triceps Pressdown', 'CABLE PUSH DOWN', 1, '12–15', '0–1', 90),
    ex('بايسبس بالكابل | Cable Biceps Curl', 'OVERHEAD CABLE CURL', 1, '10–15', '0–1', 90, { imageFallback: true }),
    ex('رفع السمانة جالسًا | Seated Calf Raise', 'STANDING MACHINE CALF RAISE', 1, '10–15', '0–1', 90, { imageFallback: true }),
    ex('كرنش بالكابل | Cable Crunch', 'MACHINE CRUNCH', 1, '12–15', '0–1', 90, { imageFallback: true })
  ] },
  { key: 'fbwC', label: 'الثلاثاء — Full Body C (Balanced Hypertrophy)', short: 'الثلاثاء · C', tone: 'legs', exercises: [
    ex('دفع الأرجل | Leg Press', 'LEG PRESS', 2, '8–12', '1–2', 180),
    ex('ضغط صدر علوي بالدامبل | Incline DB Press', 'INCLINE BENCH PRESS', 2, '8–12', '1–2', 120, { imageFallback: true }),
    ex('سحب أرضي بالكابل | Seated Cable Row', 'SEATED CABLE ROW', 2, '8–12', '1–2', 120),
    ex('ثني الأرجل مستلقيًا أو جالسًا | Lying / Seated Leg Curl', 'SEATED LEG CURL', 1, '10–15', '0–1', 90),
    ex('رفرفة جانبية بالكابل | Cable Lateral Raise', 'CABLE LATERAL RAISE', 2, '12–20', '0–1', 90),
    ex('بايسبس بالكابل | Cable Biceps Curl', 'OVERHEAD CABLE CURL', 2, '10–15', '0–1', 90, { dropSet: true, imageFallback: true }),
    ex('تمديد ترايسبس فوق الرأس | Overhead Triceps Extension', 'OVERHEAD CABLE ROPE EXTENSION', 2, '10–15', '0–1', 90),
    ex('رفع السمانة | Calf Raise', 'STANDING MACHINE CALF RAISE', 2, '10–15', '0–1', 90),
    ex('كرنش بالكابل | Cable Crunch', 'MACHINE CRUNCH', 2, '10–15', '0–1', 90, { imageFallback: true })
  ] }
].map(day => ({ ...day, exercises: day.exercises.map((item, index) => ({ ...item, number: index + 1, id: `fbw_${day.key}_${index}` })) }));

export const getFbwDay = key => FBW_DAYS.find(day => day.key === key) || FBW_DAYS[0];
