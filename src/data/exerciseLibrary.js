/**
 * NEON COACH - مكتبة التمارين الشاملة مقسمة حسب المجموعات العضلية
 * 87 تمريناً احترافياً موزعاً على 8 مجموعات عضلية رئيسية
 * متطابقة تماماً مع تصميم واجهة المكتبة والبطاقات الشاملة
 */

import { R2_EXERCISE_IMAGES } from './r2ExerciseImages.js';

export const EXERCISE_GROUPS = [
  {
    key: 'chest',
    nameAr: 'تمارين الصدر',
    nameEn: 'Chest',
    count: 10,
    r2GroupKey: 'صدر',
    cover: '/icons/muscles/chest.jpg',
    description: 'تمارين عضلات الصدر العلوي والمستوي والسفلي والعزل'
  },
  {
    key: 'legs',
    nameAr: 'تمارين الأرجل',
    nameEn: 'Legs',
    count: 15,
    r2GroupKey: 'ارجل',
    cover: '/icons/muscles/legs.jpg',
    description: 'تمارين الأفخاذ الأمامية والخلفية والسمانة والديدليفت'
  },
  {
    key: 'back',
    nameAr: 'تمارين الظهر',
    nameEn: 'Back',
    count: 18,
    r2GroupKey: 'ظهر',
    cover: '/icons/muscles/back.png',
    description: 'تمارين عضلات المجنص والترابيس وأسفل الظهر والسحب'
  },
  {
    key: 'shoulders',
    nameAr: 'تمارين الكتف',
    nameEn: 'Shoulders',
    count: 14,
    r2GroupKey: 'كتف',
    cover: '/icons/muscles/shoulders.png',
    description: 'تمارين الكتف الأمامي والجانبي والخلفي والترابيس'
  },
  {
    key: 'biceps',
    nameAr: 'باي سيبس',
    nameEn: 'Biceps',
    count: 7,
    r2GroupKey: 'بايسيبس',
    cover: '/icons/muscles/biceps.png',
    description: 'تمارين ذراع البايسبس بالبار والدامبل والكابل'
  },
  {
    key: 'triceps',
    nameAr: 'تراي سيبس',
    nameEn: 'Triceps',
    count: 9,
    r2GroupKey: 'ترايسيبس',
    cover: '/icons/muscles/triceps.png',
    description: 'تمارين ذراع الترايسبس والرأس الطويل والجانبي'
  },
  {
    key: 'abs',
    nameAr: 'تمارين البطن',
    nameEn: 'Abs & Core',
    count: 6,
    r2GroupKey: 'بطن',
    cover: '/icons/muscles/abs.png',
    description: 'تمارين عضلات البطن العلوية والسفلية والخواصر'
  },
  {
    key: 'forearms',
    nameAr: 'تمارين السواعد',
    nameEn: 'Forearms',
    count: 8,
    r2GroupKey: 'سواعد',
    cover: '/icons/muscles/forearms.png',
    description: 'تمارين قوة القبضة وثني المعصم وعضلات الساعد'
  }
];

// قواميس ترجمة وتفاصيل التمارين باللغتين مع الجولات والتكرارات الافتراضية
const EXERCISE_METADATA = {
  // الصدر
  'BARBELL BENCH PRESS': { nameAr: 'بنش برس بالبار', nameEn: 'Barbell Bench Press', sets: 3, reps: '8-12', equipment: 'باربل' },
  'REVERSE GRIP BENCH PRESS': { nameAr: 'بنش برس بقبضة عكسية', nameEn: 'Reverse Grip Bench Press', sets: 3, reps: '8-12', equipment: 'باربل' },
  'INCLINE BENCH PRESS': { nameAr: 'ضغط صدر علوي بالبار', nameEn: 'Incline Barbell Bench Press', sets: 3, reps: '8-12', equipment: 'باربل' },
  'SMITH MACHINE DECLINE BENCH PRESS': { nameAr: 'ضغط صدر سفلي على جهاز السميث', nameEn: 'Smith Decline Bench Press', sets: 3, reps: '8-12', equipment: 'جهاز سميث' },
  'DUMBBELL BENCH PRESS': { nameAr: 'بنش برس بالدامبل', nameEn: 'Dumbbell Bench Press', sets: 3, reps: '8-12', equipment: 'دامبل' },
  'INCLINE DUMBBELL FLY': { nameAr: 'تفتيح صدر علوي بالدامبل', nameEn: 'Incline Dumbbell Fly', sets: 3, reps: '10-15', equipment: 'دامبل' },
  'CABLE CROSSOVER': { nameAr: 'كروس أوفر بالكيبل للصدر', nameEn: 'Cable Crossover', sets: 3, reps: '12-15', equipment: 'كيبل' },
  'PEC DECK FLY': { nameAr: 'تفتيح صدر بجهاز الفراشة', nameEn: 'Pec Deck Fly', sets: 3, reps: '10-15', equipment: 'جهاز' },
  'DECLINE DUMBBELL FLY': { nameAr: 'تفتيح صدر سفلي بالدامبل', nameEn: 'Decline Dumbbell Fly', sets: 3, reps: '10-15', equipment: 'دامبل' },
  'DUMBBELL FLY': { nameAr: 'تفتيح صدر مستوي بالدامبل', nameEn: 'Flat Dumbbell Fly', sets: 3, reps: '10-15', equipment: 'دامبل' },

  // الظهر
  'REVERSE GRIP BENT OVER ROW': { nameAr: 'تجديف بالبار بقبضة عكسية (ييتس رو)', nameEn: 'Reverse Grip Bent Over Row', sets: 3, reps: '8-12', equipment: 'باربل' },
  'WIDE GRIP LAT PULLDOWN': { nameAr: 'سحب أمامي واسع للظهر', nameEn: 'Wide Grip Lat Pulldown', sets: 3, reps: '8-12', equipment: 'سحب كيبل' },
  'RACK PULLS': { nameAr: 'راك بولز أسفل الظهر', nameEn: 'Rack Pulls', sets: 3, reps: '6-10', equipment: 'باربل' },
  'STRAIGHT ARM CABLE PULLOVER': { nameAr: 'بول أوفر بالكيبل ذراع مفرودة', nameEn: 'Straight Arm Cable Pullover', sets: 3, reps: '10-15', equipment: 'كيبل' },
  'HYPEREXTENSION': { nameAr: 'تمديد أسفل الظهر على الجهاز', nameEn: 'Hyperextension', sets: 3, reps: '12-15', equipment: 'جهاز' },
  'T-BAR ROW': { nameAr: 'تجديف تي بار بالوزن', nameEn: 'T-Bar Row', sets: 3, reps: '8-12', equipment: 'تي بار' },
  'ROMANIAN DEADLIFT': { nameAr: 'ديدليفت روماني للأوتار وأسفل الظهر', nameEn: 'Romanian Deadlift', sets: 3, reps: '8-12', equipment: 'باربل' },
  'T-BAR ROW CLOSE GRIP': { nameAr: 'تجديف تي بار بقبضة ضيقة', nameEn: 'Close Grip T-Bar Row', sets: 3, reps: '8-12', equipment: 'تي بار' },
  'TRIPOD DUMBBELL ROW': { nameAr: 'تجديف فردي بالدامبل (ترايبود)', nameEn: 'Tripod Dumbbell Row', sets: 3, reps: '8-12', equipment: 'دامبل' },
  'TRIPOD DUMBBELL ROW ALTERNATIVE': { nameAr: 'تجديف دامبل بديل مع إسناد الصدر', nameEn: 'Chest Supported Dumbbell Row', sets: 3, reps: '8-12', equipment: 'دامبل' },
  'BENT OVER ROW': { nameAr: 'تجديف بالبار منحني للظهر', nameEn: 'Bent Over Barbell Row', sets: 3, reps: '8-12', equipment: 'باربل' },
  'BENT OVER BARBELL ROW ALTERNATIVES': { nameAr: 'تجديف بار زاوية بديلة للظهر', nameEn: 'Barbell Row Alternative Angle', sets: 3, reps: '8-12', equipment: 'باربل' },
  'SEATED CABLE ROW': { nameAr: 'سحب أرضي بالكيبل جالس', nameEn: 'Seated Cable Row', sets: 3, reps: '8-12', equipment: 'كيبل' },
  'REVERSE GRIP LAT PULL DOWN': { nameAr: 'سحب أمامي بقبضة عكسية ضيقة', nameEn: 'Reverse Grip Lat Pulldown', sets: 3, reps: '8-12', equipment: 'سحب كيبل' },
  'SEATED STRAIGHT BAR CABLE ROW': { nameAr: 'سحب جالس بالبار المستقيم', nameEn: 'Seated Straight Bar Cable Row', sets: 3, reps: '8-12', equipment: 'كيبل' },
  'SEATED CABLE ROW WIDE GRIP': { nameAr: 'سحب جالس بقبضة عريضة للظهر العلوي', nameEn: 'Wide Grip Seated Cable Row', sets: 3, reps: '8-12', equipment: 'كيبل' },
  'V-BAR PULLDOWN': { nameAr: 'سحب للظهر بقبضة V المثلثة', nameEn: 'V-Bar Pulldown', sets: 3, reps: '8-12', equipment: 'سحب كيبل' },
  'LAT PULL DOWN FRONT ALTERNATIVE': { nameAr: 'سحب للصدر بالكيبل زاوية بديلة', nameEn: 'Front Lat Pulldown Alternative', sets: 3, reps: '8-12', equipment: 'سحب كيبل' },

  // الأكتاف
  'STANDING FACE PULL': { nameAr: 'سحب للوجه بالكيبل (فيس بول)', nameEn: 'Standing Cable Face Pull', sets: 3, reps: '12-15', equipment: 'كيبل' },
  'MACHINE SHOULDER PRESS': { nameAr: 'ضغط كتف على الجهاز', nameEn: 'Machine Shoulder Press', sets: 3, reps: '8-12', equipment: 'جهاز' },
  'BARBELL SHOULDER PRESS': { nameAr: 'ضغط كتف أمامي بالبار', nameEn: 'Barbell Shoulder Press', sets: 3, reps: '8-12', equipment: 'باربل' },
  'SEATED DUMBBELL SHOULDER PRESS': { nameAr: 'ضغط كتف جالس بالدامبل', nameEn: 'Seated Dumbbell Shoulder Press', sets: 3, reps: '8-12', equipment: 'دامبل' },
  'REVERSE MACHINE FLYES': { nameAr: 'رفرفة كتف خلفي على جهاز الفراشة', nameEn: 'Reverse Machine Flyes', sets: 3, reps: '12-15', equipment: 'جهاز' },
  'HEAD-ON-BENCH DUMBBELL REAR DELT RAISE': { nameAr: 'رفرفة كتف خلفي مسند الرأس بالدامبل', nameEn: 'Head-On-Bench Rear Delt Raise', sets: 3, reps: '12-15', equipment: 'دامبل' },
  'HIGH CABLE REVERSE FLY': { nameAr: 'رفرفة خلفية بالكيبل المرتفع', nameEn: 'High Cable Reverse Fly', sets: 3, reps: '12-15', equipment: 'كيبل' },
  'BARBELL UPRIGHT ROW': { nameAr: 'سحب بار للذقن (أبرايت رو)', nameEn: 'Barbell Upright Row', sets: 3, reps: '10-12', equipment: 'باربل' },
  'STANDING DUMBBELL SHRUG': { nameAr: 'هز كتفين بالدامبل (ترابيس)', nameEn: 'Standing Dumbbell Shrug', sets: 3, reps: '12-15', equipment: 'دامبل' },
  'STANDING BARBELL SHRUG': { nameAr: 'هز كتفين بالبار (ترابيس)', nameEn: 'Standing Barbell Shrug', sets: 3, reps: '12-15', equipment: 'باربل' },
  'FRONT PLATE RAISE': { nameAr: 'رفرفة أمامية بقرص الوزن', nameEn: 'Front Plate Raise', sets: 3, reps: '12-15', equipment: 'طارة وزن' },
  'DUMBBELL LATERAL RAISE': { nameAr: 'رفرفة كتف جانبي بالدامبل', nameEn: 'Dumbbell Lateral Raise', sets: 3, reps: '12-15', equipment: 'دامبل' },
  'CABLE LATERAL RAISE': { nameAr: 'رفرفة كتف جانبي بالكيبل', nameEn: 'Cable Lateral Raise', sets: 3, reps: '12-15', equipment: 'كيبل' },

  // بايسيبس
  'BARBELL CURL': { nameAr: 'مرجحة بايسبس بالبار المستقيم', nameEn: 'Barbell Biceps Curl', sets: 3, reps: '8-12', equipment: 'باربل' },
  'BARBELL PREACHER CURL': { nameAr: 'مرجحة بايسبس على جهاز لاري سكوت', nameEn: 'Barbell Preacher Curl', sets: 3, reps: '8-12', equipment: 'مقعد بريتشر' },
  'DUMBBELL INCLINE CURL': { nameAr: 'مرجحة بايسبس بالدامبل على مقعد مائل', nameEn: 'Incline Dumbbell Curl', sets: 3, reps: '8-12', equipment: 'دامبل' },
  'EZ BARBELL CURL': { nameAr: 'مرجحة بايسبس بالبار الزجزاج', nameEn: 'EZ Barbell Curl', sets: 3, reps: '8-12', equipment: 'بار EZ' },
  'HAMMER CURL': { nameAr: 'مرجحة هامر شاكوش بالدامبل', nameEn: 'Hammer Curl', sets: 3, reps: '8-12', equipment: 'دامبل' },
  'OVERHEAD CABLE CURL': { nameAr: 'مرجحة بايسبس بالكيبل المرتفع', nameEn: 'Overhead Cable Curl', sets: 3, reps: '10-15', equipment: 'كيبل' },
  'DUMBBELL CONCENTRATION CURL': { nameAr: 'مرجحة تركيز بالدامبل فردي', nameEn: 'Dumbbell Concentration Curl', sets: 3, reps: '10-12', equipment: 'دامبل' },

  // ترايسيبس
  'CABLE PUSH DOWN': { nameAr: 'دفع ترايسبس بالحبل على الكيبل', nameEn: 'Cable Rope Pushdown', sets: 3, reps: '10-15', equipment: 'كيبل' },
  'CLOSE GRIP BENCH PRESS': { nameAr: 'بنش برس بقبضة ضيقة للترايسبس', nameEn: 'Close Grip Bench Press', sets: 3, reps: '8-12', equipment: 'باربل' },
  'CABLE TRICEP KICKBACK': { nameAr: 'ركل ترايسبس للخلف بالكيبل', nameEn: 'Cable Tricep Kickback', sets: 3, reps: '12-15', equipment: 'كيبل' },
  'OVERHEAD CABLE ROPE EXTENSION': { nameAr: 'تمديد ترايسبس فوق الرأس بالكيبل', nameEn: 'Overhead Cable Rope Extension', sets: 3, reps: '10-15', equipment: 'كيبل' },
  'SEATED OVERHEAD DUMBBELL EXTENSION': { nameAr: 'تمديد ترايسبس جالس بالدامبل فوق الرأس', nameEn: 'Seated Overhead Dumbbell Extension', sets: 3, reps: '10-12', equipment: 'دامبل' },
  'TRICEPS PUSHDOWN WITH REVERSE GRIP': { nameAr: 'دفع ترايسبس بالكيبل بقبضة مقلوبة', nameEn: 'Reverse Grip Tricep Pushdown', sets: 3, reps: '10-15', equipment: 'كيبل' },
  'PUSHDOWN STRAIGHT BAR TRICEP': { nameAr: 'دفع ترايسبس بالبار المستقيم', nameEn: 'Straight Bar Tricep Pushdown', sets: 3, reps: '10-15', equipment: 'كيبل' },
  'TRICEP DIPS': { nameAr: 'غطس متوازي للترايسبس', nameEn: 'Tricep Dips', sets: 3, reps: '8-12', equipment: 'متوازي' },
  'BAR SKULL CRUSHERS': { nameAr: 'سكل كراشرز بالبار (كسار الجمجمة)', nameEn: 'Barbell Skull Crushers', sets: 3, reps: '8-12', equipment: 'بار EZ' },

  // بطن
  'PLANK': { nameAr: 'تمرين البلانك للبطن والكور', nameEn: 'Core Plank', sets: 3, reps: '45-60 ثانية', equipment: 'وزن الجسم' },
  'HANGING KNEE RAISE': { nameAr: 'رفع الركبتين معلقاً للبطن السفلي', nameEn: 'Hanging Knee Raise', sets: 3, reps: '12-15', equipment: 'عقلة' },
  'MACHINE CRUNCH': { nameAr: 'طحن البطن على الجهاز بالوزن', nameEn: 'Machine Crunch', sets: 3, reps: '12-15', equipment: 'جهاز' },
  'ABDOMINAL AIR BIKE': { nameAr: 'دراجة هوائية للبطن والخواصر', nameEn: 'Abdominal Air Bike', sets: 3, reps: '15-20', equipment: 'وزن الجسم' },
  'LYING LEG RAISE': { nameAr: 'رفع الأرجل مستلقياً للبطن', nameEn: 'Lying Leg Raise', sets: 3, reps: '12-15', equipment: 'وزن الجسم' },
  'ABDOMINAL REACH': { nameAr: 'مد اليدين للبطن العلوي (كرانش)', nameEn: 'Abdominal Reach Crunch', sets: 3, reps: '15-20', equipment: 'وزن الجسم' },

  // سواعد
  'REVERSE GRIP BARBELL CURL': { nameAr: 'مرجحة بار قبضة عكسية للسواعد', nameEn: 'Reverse Grip Barbell Curl', sets: 3, reps: '10-15', equipment: 'باربل' },
  'BARBELL WRIST CURL OVER BENCH': { nameAr: 'ثني المعصم بالبار على المقعد', nameEn: 'Barbell Wrist Curl Over Bench', sets: 3, reps: '12-15', equipment: 'باربل' },
  'STANDING WRIST CURL BEHIND BACK': { nameAr: 'ثني المعصم بالبار خلف الظهر', nameEn: 'Standing Behind Back Wrist Curl', sets: 3, reps: '12-15', equipment: 'باربل' },
  'SEATED REVERSE BARBELL WRIST CURL': { nameAr: 'ثني المعصم العكسي بالبار جالساً', nameEn: 'Seated Reverse Barbell Wrist Curl', sets: 3, reps: '12-15', equipment: 'باربل' },
  'CABLE WRIST CURLS': { nameAr: 'ثني المعصم بالكيبل', nameEn: 'Cable Wrist Curls', sets: 3, reps: '12-15', equipment: 'كيبل' },
  'BRACHIORADIALIS DUMBBELL': { nameAr: 'تمرين عضلة الساعد بالدامبل', nameEn: 'Brachioradialis Dumbbell Curl', sets: 3, reps: '10-15', equipment: 'دامبل' },
  'REVERSE WRIST CURLS': { nameAr: 'ثني المعصم العكسي بالدامبل', nameEn: 'Reverse Dumbbell Wrist Curls', sets: 3, reps: '12-15', equipment: 'دامبل' },

  // أرجل
  'BARBELL BACK SQUAT': { nameAr: 'سكوات خلفي بالبار', nameEn: 'Barbell Back Squat', sets: 3, reps: '8-12', equipment: 'باربل' },
  'DUMBBELL SQUAT': { nameAr: 'سكوات بالدامبل', nameEn: 'Dumbbell Squat', sets: 3, reps: '10-12', equipment: 'دامبل' },
  'DUMBBELL BULGARIAN SPLIT SQUAT': { nameAr: 'سكوات بلغاري منفصل بالدامبل', nameEn: 'Bulgarian Split Squat', sets: 3, reps: '10-12', equipment: 'دامبل' },
  'MACHINE HACK SQUATS': { nameAr: 'هاك سكوات على الجهاز', nameEn: 'Machine Hack Squat', sets: 3, reps: '8-12', equipment: 'جهاز' },
  'SMITH HACK SQUAT ALTERNATIVE': { nameAr: 'هاك سكوات على جهاز السميث', nameEn: 'Smith Machine Hack Squat', sets: 3, reps: '8-12', equipment: 'جهاز سميث' },
  'SQUAT ALTERNATIVE': { nameAr: 'سكوات سومو بوزن حر', nameEn: 'Sumo Goblet Squat', sets: 3, reps: '10-12', equipment: 'دامبل' },
  'SEATED LEG CURL': { nameAr: 'ثني الأرجل جالساً (خلفيات)', nameEn: 'Seated Leg Curl', sets: 3, reps: '10-15', equipment: 'جهاز' },
  'LEG PRESS': { nameAr: 'دفع الأرجل على الجهاز (ليج برس)', nameEn: '45° Leg Press', sets: 3, reps: '8-12', equipment: 'جهاز' },
  'SUMO DEADLIFT': { nameAr: 'ديدليفت سومو للأرجل والمؤخرة', nameEn: 'Sumo Deadlift', sets: 3, reps: '6-10', equipment: 'باربل' },
  'HIP ADDUCTION MACHINE': { nameAr: 'ضم الأفخاذ على الجهاز (ضامة)', nameEn: 'Hip Adduction Machine', sets: 3, reps: '12-15', equipment: 'جهاز' },
  'LEG EXTENSION': { nameAr: 'فرد الأرجل على الجهاز (أماميات)', nameEn: 'Leg Extension', sets: 3, reps: '10-15', equipment: 'جهاز' },
  'BARBELL LUNGE': { nameAr: 'طعنات بالبار للأرجل (لانجز)', nameEn: 'Barbell Walking Lunge', sets: 3, reps: '10-12', equipment: 'باربل' },
  'BODYWEIGHT LUNGE': { nameAr: 'طعنات بوزن الجسم', nameEn: 'Bodyweight Lunge', sets: 3, reps: '12-15', equipment: 'وزن الجسم' },
  'STANDING MACHINE CALF RAISE': { nameAr: 'رفع السمانة واقفاً على الجهاز', nameEn: 'Standing Calf Raise', sets: 4, reps: '15-20', equipment: 'جهاز' }
};

// توليد قاعدة التمارين الشاملة مع المعرفات والبيانات
export const ALL_LIBRARY_EXERCISES = R2_EXERCISE_IMAGES.map((item, index) => {
  const meta = EXERCISE_METADATA[item.name] || {};
  const group = EXERCISE_GROUPS.find(g => g.r2GroupKey === item.group) || EXERCISE_GROUPS[0];
  const nameAr = meta.nameAr || item.name;
  const nameEn = meta.nameEn || item.name;
  const title = `${nameAr} | ${nameEn}`;

  return {
    id: `lib_ex_${index}_${item.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
    rawName: item.name,
    nameAr,
    nameEn,
    title,
    groupKey: group.key,
    groupNameAr: group.nameAr,
    r2GroupKey: item.group,
    image: item.url,
    sets: meta.sets || 3,
    reps: meta.reps || '8-12',
    equipment: meta.equipment || 'عام'
  };
});

/**
 * الحصول على جميع مجموعات العضلات
 */
export function getExerciseGroups() {
  return EXERCISE_GROUPS;
}

/**
 * جلب تمارين مجموعة عضلية معينة
 */
export function getExercisesByGroup(groupKey) {
  return ALL_LIBRARY_EXERCISES.filter(ex => ex.groupKey === groupKey);
}

/**
 * بحث سريع في مكتبة التمارين باللغتين العربية والإنجليزية
 */
export function searchExercises(query) {
  if (!query || !query.trim()) return ALL_LIBRARY_EXERCISES;
  const q = query.trim().toLowerCase();
  return ALL_LIBRARY_EXERCISES.filter(ex =>
    ex.nameAr.toLowerCase().includes(q) ||
    ex.nameEn.toLowerCase().includes(q) ||
    ex.title.toLowerCase().includes(q) ||
    ex.groupNameAr.toLowerCase().includes(q)
  );
}

/**
 * كشف المجموعة العضلية لتمرين معين لفتح المكتبة مباشرة عليها عند التبديل
 */
export function detectExerciseMuscleGroup(exercise, dayKey = '') {
  if (!exercise) return null;

  // 1. إذا كان محدد مسبقاً
  if (exercise.groupKey && EXERCISE_GROUPS.some(g => g.key === exercise.groupKey)) {
    return exercise.groupKey;
  }

  const title = String(exercise.title || exercise.nameAr || exercise.nameEn || exercise.name || '').toLowerCase();

  // 2. مطابقة بالاسم مع تمارين المكتبة
  const foundInLib = ALL_LIBRARY_EXERCISES.find(ex =>
    (ex.id && exercise.id && ex.id === exercise.id) ||
    ex.nameAr.toLowerCase() === title ||
    ex.nameEn.toLowerCase() === title ||
    ex.title.toLowerCase() === title
  );
  if (foundInLib) {
    return foundInLib.groupKey;
  }

  // 3. تحليل الكلمات المفتاحية في العنوان
  if (/بنش|صدر|chest|bench|fly|pectoral|incline|decline|dip/i.test(title)) return 'chest';
  if (/ظهر|سحب|مجنص|back|row|lat|pull\s*down|deadlift|pulldown/i.test(title)) return 'back';
  if (/رجل|ارجل|أرجل|سكوات|فخذ|سمانة|بطات|leg|squat|quad|hamstring|calf|lunge/i.test(title) && !/chest|shoulder/i.test(title)) return 'legs';
  if (/كتف|shoulder|overhead|military|lateral|deltoid|front raise|rear delt/i.test(title)) return 'shoulders';
  if (/ساعد|سواعد|forearm|wrist/i.test(title)) return 'forearms';
  if (/باي|biceps|curl|hammer|preacher/i.test(title)) return 'biceps';
  if (/تراي|triceps|pushdown|skull|extension|french press/i.test(title)) return 'triceps';
  if (/بطن|abs|abdominal|crunch|plank|core/i.test(title)) return 'abs';

  // 4. استنتاج من مفتاح اليوم (dayKey) كـ fallback ذكي
  const dk = String(dayKey || '').toLowerCase();
  if (dk.includes('chest')) return 'chest';
  if (dk.includes('back')) return 'back';
  if (dk.includes('leg')) return 'legs';
  if (dk.includes('shoulder')) return 'shoulders';
  if (dk.includes('bicep')) return 'biceps';
  if (dk.includes('tricep')) return 'triceps';
  if (dk.includes('push')) return 'chest';
  if (dk.includes('pull')) return 'back';

  return null;
}

