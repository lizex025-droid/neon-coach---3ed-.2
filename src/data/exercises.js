/**
 * NEON COACH - قاعدة بيانات التمارين الشاملة
 * كل تمرين يحوي الاسم العربي والإنجليزي، العضلات المستهدفة، المعدات، التوجيهات، والبدائل المعتمدة
 */

export const EXERCISES = [
  {
    id: 'incline-bench-press',
    nameAr: 'ضغط صدر علوي بزاوية 45°',
    nameEn: 'Incline Bench Press',
    muscleGroupAr: 'صدر علوي وترايسبس',
    muscleGroupEn: 'Upper Chest & Triceps',
    category: 'chest',
    equipment: 'barbell', // barbell, dumbbell, machine, bodyweight
    instructions: 'ثبت ظهرك على المقعد المائل بزاوية 30-45 درجة. انزل بالبار ببطء إلى أعلى الصدر ثم ادفع بقوة للأعلى دون قفل المرفقين تماماً.',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSec: 90,
    defaultRpe: 8,
    icon: 'barbell',
    substitutes: ['dumbbell-incline-press', 'smith-incline-press', 'incline-chest-press-machine']
  },
  {
    id: 'flat-barbell-bench-press',
    nameAr: 'ضغط صدر مستوي بالبار',
    nameEn: 'Flat Barbell Bench Press',
    muscleGroupAr: 'الصدر الأوسط والأكتاف الأمامية',
    muscleGroupEn: 'Mid Chest & Front Delts',
    category: 'chest',
    equipment: 'barbell',
    instructions: 'قبضة أعرض قليلاً من مستوى الكتفين. اثنِ لوحي الكتف للخلف والأسفل. انزل بالبار حتى يلامس وسط الصدر برفق ثم ارفع مع الزفير.',
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSec: 120,
    defaultRpe: 8.5,
    icon: 'barbell',
    substitutes: ['dumbbell-flat-press', 'chest-press-machine', 'push-ups']
  },
  {
    id: 'cable-chest-fly',
    nameAr: 'تفتيح الصدر بالكابل',
    nameEn: 'Cable Chest Fly',
    muscleGroupAr: 'عضلة الصدر (عزل)',
    muscleGroupEn: 'Chest Isolation',
    category: 'chest',
    equipment: 'cables',
    instructions: 'قف بخطوة للأمام مع انحناء خفيف في المرفقين. اجمع المقبضين أمام منتصف الصدر مع عصر العضلة لمدة ثانية في النهاية.',
    defaultSets: 3,
    defaultReps: '12-15',
    defaultRestSec: 60,
    defaultRpe: 8,
    icon: 'cable',
    substitutes: ['pec-deck-fly', 'dumbbell-fly']
  },
  {
    id: 'tricep-rope-pushdown',
    nameAr: 'ضغط ترايسبس بالحبل على الكيبل',
    nameEn: 'Tricep Rope Pushdown',
    muscleGroupAr: 'الترايسبس (الرأس الجانبي والطويل)',
    muscleGroupEn: 'Triceps Lateral & Long Head',
    category: 'arms',
    equipment: 'cables',
    instructions: 'ثبت المرفقين بجانب الجذع تماماً. ادفع الحبل للأسفل وافتحه للخارج في أسفل الحركة مع ثبات كامل للجسم.',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSec: 60,
    defaultRpe: 8,
    icon: 'cable',
    substitutes: ['straight-bar-pushdown', 'overhead-cable-extension', 'skull-crushers']
  },
  {
    id: 'overhead-tricep-extension',
    nameAr: 'مد ترايسبس فوق الرأس بالدمبل',
    nameEn: 'Overhead Dumbbell Tricep Extension',
    muscleGroupAr: 'الرأس الطويل للترايسبس',
    muscleGroupEn: 'Triceps Long Head',
    category: 'arms',
    equipment: 'dumbbell',
    instructions: 'ارفع الدمبل بكلتا اليدين فوق الرأس. انزل بالوزن خلف الرأس مع بقاء المرفقين موجهين للأمام دون تباعد مفرط.',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSec: 75,
    defaultRpe: 8,
    icon: 'dumbbell',
    substitutes: ['cable-overhead-extension', 'french-press']
  },
  {
    id: 'barbell-squat',
    nameAr: 'سكوات خلفي بالبار',
    nameEn: 'Barbell Back Squat',
    muscleGroupAr: 'الأفخاذ الأمامية والمؤخرة وأسفل الظهر',
    muscleGroupEn: 'Quadriceps, Glutes & Core',
    category: 'legs',
    equipment: 'barbell',
    instructions: 'القدمان باتساع الكتفين مع زاوية خفيفة للأصابع للخارج. خذ نفساً عميقاً، انزل بالحوض للأسفل مع الحفاظ على استقامة العمود الفقري حتى يوازي الفخذ الأرض.',
    defaultSets: 4,
    defaultReps: '6-8',
    defaultRestSec: 150,
    defaultRpe: 8.5,
    icon: 'barbell',
    substitutes: ['leg-press', 'goblet-squat', 'hack-squat']
  },
  {
    id: 'romanian-deadlift',
    nameAr: 'ديدلفت روماني بالبار',
    nameEn: 'Romanian Deadlift (RDL)',
    muscleGroupAr: 'الأفخاذ الخلفية والمؤخرة وأسفل الظهر',
    muscleGroupEn: 'Hamstrings & Glutes',
    category: 'legs',
    equipment: 'barbell',
    instructions: 'انحناء خفيف في الركبتين وثباتهما. ادفع الحوض للخلف كأنك تغلق باباً بخلفيتك مع انزلاق البار بمحاذاة الساقين للشعور بتمدد قوي في الهامسترينغ.',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSec: 90,
    defaultRpe: 8,
    icon: 'barbell',
    substitutes: ['dumbbell-rdl', 'leg-curl', 'cable-pull-through']
  },
  {
    id: 'lat-pulldown',
    nameAr: 'سحب ظهر أمامي واسع',
    nameEn: 'Wide-Grip Lat Pulldown',
    muscleGroupAr: 'عضلات الظهر العريضة (اللاتس)',
    muscleGroupEn: 'Latissimus Dorsi',
    category: 'back',
    equipment: 'machine',
    instructions: 'أمسك المقبض بقبضة واسعة. اسحب المقبض لأسفل الصدر العلوي مع فتح الصدر للأعلى وعصر عضلات الظهر.',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSec: 75,
    defaultRpe: 8,
    icon: 'machine',
    substitutes: ['pull-ups', 'cable-straight-arm-pulldown', 'seated-cable-row']
  },
  {
    id: 'barbell-bent-over-row',
    nameAr: 'سحب ظهر بالبار منحنياً',
    nameEn: 'Bent-Over Barbell Row',
    muscleGroupAr: 'منتصف الظهر وسماكة اللاتس والترابيس',
    muscleGroupEn: 'Mid-Back, Rhomboids & Lats',
    category: 'back',
    equipment: 'barbell',
    instructions: 'انحنِ بالجذع بزاوية 45 درجة مع ثبات الظهر. اسحب البار باتجاه أسفل السرة مع توجيه المرفقين للخلف.',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSec: 90,
    defaultRpe: 8,
    icon: 'barbell',
    substitutes: ['dumbbell-row', 't-bar-row', 'chest-supported-row']
  },
  {
    id: 'dumbbell-lateral-raise',
    nameAr: 'رفرفة أكتاف جانبي بالدمبل',
    nameEn: 'Dumbbell Lateral Raise',
    muscleGroupAr: 'عضلة الكتف الجانبي',
    muscleGroupEn: 'Side Deltoid',
    category: 'shoulders',
    equipment: 'dumbbell',
    instructions: 'قف مستقيماً مع ميل طفيف للأمام. ارفع الذراعين للجانبين حتى مستوى الكتفين مع توجيه المرفقين للأعلى قليلاً.',
    defaultSets: 4,
    defaultReps: '12-15',
    defaultRestSec: 60,
    defaultRpe: 8.5,
    icon: 'dumbbell',
    substitutes: ['cable-lateral-raise', 'machine-lateral-raise']
  },
  {
    id: 'seated-dumbbell-shoulder-press',
    nameAr: 'ضغط أكتاف جالس بالدمبل',
    nameEn: 'Seated Dumbbell Shoulder Press',
    muscleGroupAr: 'الكتف الأمامي والعلوي',
    muscleGroupEn: 'Anterior Deltoids & Triceps',
    category: 'shoulders',
    equipment: 'dumbbell',
    instructions: 'اضبط المقعد بزاوية قائمة أو 80 درجة. ارفع الدمبلين للأعلى حتى يقتربا من التلامس مع النزول إلى مستوى الأذنين ببطء.',
    defaultSets: 3,
    defaultReps: '8-10',
    defaultRestSec: 90,
    defaultRpe: 8,
    icon: 'dumbbell',
    substitutes: ['overhead-barbell-press', 'machine-shoulder-press']
  },
  {
    id: 'incline-dumbbell-curl',
    nameAr: 'ثني بايسبس بالدمبل على مقعد مائل',
    nameEn: 'Incline Dumbbell Bicep Curl',
    muscleGroupAr: 'عضلة البايسبس (الرأس الطويل للتمدد)',
    muscleGroupEn: 'Biceps Brachii (Long Head)',
    category: 'arms',
    equipment: 'dumbbell',
    instructions: 'استلقِ على مقعد مائل بزاوية 45-60 درجة لتمدد البايسبس. اثنِ المرفق مع تدوير المعصم للخارج في قمة الحركة.',
    defaultSets: 3,
    defaultReps: '10-12',
    defaultRestSec: 60,
    defaultRpe: 8,
    icon: 'dumbbell',
    substitutes: ['standing-barbell-curl', 'cable-bicep-curl', 'hammer-curls']
  }
];

export function getExerciseById(id) {
  return EXERCISES.find(e => e.id === id) || EXERCISES[0];
}

export function getSubstitutesForExercise(id) {
  const exercise = getExerciseById(id);
  if (!exercise || !exercise.substitutes) return [];
  return exercise.substitutes.map(subId => EXERCISES.find(e => e.id === subId)).filter(Boolean);
}
