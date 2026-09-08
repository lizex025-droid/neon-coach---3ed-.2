/**
 * NEON COACH - مكتبة مسار تمرين الـ 40 يوم والبرامج التدريبية المعتمدة
 * مستوحى من منهجيات التدريب المنهجي والمكتبة المرجعية (بدون اعتماد خارجي مكسور)
 */

export const FORTY_DAY_PROGRAM = {
  id: 'forty-day-transformation',
  titleAr: 'تحدي الـ 40 يوماً — NEON Transformation',
  descriptionAr: 'برنامج تدريبي متدرج مصمم لزيادة اللياقة والقوة وبناء العادات الرياضية المستمرة على مدار 40 يوماً.',
  totalDays: 40,
  phases: [
    {
      phase: 1,
      titleAr: 'المرحلة الأولى: التأسيس والتكيف العصبي العضلي',
      daysRange: 'الأيام 1 - 14',
      focus: 'إتقان التكنيك الحركي، تهيئة المفاصل والأوتار، وتأسيس روتين التدريب اليومي.'
    },
    {
      phase: 2,
      titleAr: 'المرحلة الثانية: التكثيف وزيادة الحجم التدريبي',
      daysRange: 'الأيام 15 - 28',
      focus: 'زيادة الحمل التدريبي التدريجي (Progressive Overload) وزيادة الشدة إلى RPE 8.'
    },
    {
      phase: 3,
      titleAr: 'المرحلة الثالثة: ذروة القوة وإعادة التكوين',
      daysRange: 'الأيام 29 - 40',
      focus: 'اختبار مستويات القوة الجديدة، أقصى حرق دهون، وتثبيت النتائج المكتسبة.'
    }
  ],
  // توليد جدول الـ 40 يوماً
  days: Array.from({ length: 40 }, (_, idx) => {
    const dayNumber = idx + 1;
    const cycleDay = (idx % 7) + 1; // 1 to 7

    if (cycleDay === 1) {
      return {
        day: dayNumber,
        titleAr: 'صدر وترايسبس (دفع)',
        category: 'workout',
        durationMin: 50,
        exercisesCount: 5,
        isRest: false,
        exercises: ['incline-bench-press', 'flat-barbell-bench-press', 'cable-chest-fly', 'tricep-rope-pushdown', 'overhead-tricep-extension']
      };
    } else if (cycleDay === 2) {
      return {
        day: dayNumber,
        titleAr: 'ظهر وبايسبس (سحب)',
        category: 'workout',
        durationMin: 50,
        exercisesCount: 5,
        isRest: false,
        exercises: ['lat-pulldown', 'barbell-bent-over-row', 'incline-dumbbell-curl']
      };
    } else if (cycleDay === 3) {
      return {
        day: dayNumber,
        titleAr: 'أرجل وبطن (سفلي)',
        category: 'workout',
        durationMin: 55,
        exercisesCount: 4,
        isRest: false,
        exercises: ['barbell-squat', 'romanian-deadlift']
      };
    } else if (cycleDay === 4) {
      return {
        day: dayNumber,
        titleAr: 'استشفاء نشط وإطالات',
        category: 'recovery',
        durationMin: 30,
        exercisesCount: 3,
        isRest: true,
        note: 'مشي خفيف 5,000 خطوة مع تمارين تمدد مرونة وإراحة العضلات.'
      };
    } else if (cycleDay === 5) {
      return {
        day: dayNumber,
        titleAr: 'أكتاف وترابيس وبطن',
        category: 'workout',
        durationMin: 45,
        exercisesCount: 4,
        isRest: false,
        exercises: ['seated-dumbbell-shoulder-press', 'dumbbell-lateral-raise']
      };
    } else if (cycleDay === 6) {
      return {
        day: dayNumber,
        titleAr: 'تمارين قوة شاملة Full Body',
        category: 'workout',
        durationMin: 50,
        exercisesCount: 5,
        isRest: false,
        exercises: ['flat-barbell-bench-press', 'barbell-squat', 'lat-pulldown']
      };
    } else {
      return {
        day: dayNumber,
        titleAr: 'راحة تامة واستشفاء',
        category: 'rest',
        durationMin: 0,
        exercisesCount: 0,
        isRest: true,
        note: 'يوم راحة كامل لإعادة شحن الطاقة. يوم الراحة لا يكسر سلسلة استمرارية التدريب.'
      };
    }
  })
};

/**
 * مكتبة ملفات PDF والكتب التدريبية المرجعية المستقلة
 */
export const PDF_LIBRARY = [
  {
    id: 'pdf-40-days-guide',
    titleAr: 'دليل تمرين الـ 40 يوماً الكامل',
    titleEn: '40 Days Workout Guidebook',
    pages: 48,
    fileSize: '4.2 MB',
    category: 'training',
    badge: 'برنامج معتمد',
    summaryAr: 'شرح مفصل لكل يوم تدريبي مع صور الأداء الصحيح ومخططات توزيع الأحمال وفترات الراحة.'
  },
  {
    id: 'pdf-nutrition-mastery',
    titleAr: 'أطلس التغذية وحساب الماكروز الذكي',
    titleEn: 'Nutrition & Macro Mastery',
    pages: 36,
    fileSize: '3.1 MB',
    category: 'nutrition',
    badge: 'تغذية',
    summaryAr: 'دليل حساب الاحتياج اليومي وجداول الأطعمة العربية الشائعة وقوائم البدائل المتكافئة.'
  },
  {
    id: 'pdf-injury-prevention',
    titleAr: 'الوقاية من إصابات المفاصل وإدارة الألم',
    titleEn: 'Joint Health & Injury Prevention',
    pages: 28,
    fileSize: '2.5 MB',
    category: 'health',
    badge: 'صحة واستشفاء',
    summaryAr: 'توجيهات فسيولوجية للتعامل مع آلام الأكتاف وأسفل الظهر وتعديل زوايا التمرين الآمنة.'
  }
];
