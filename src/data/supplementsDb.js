/**
 * NEON COACH - قاعدة بيانات المكملات والترطيب الشاملة
 * مستخرجة ومطابقة لقاعدة بيانات supplments.html مع تعزيزات الترجمة والدقة العلمية
 */

export const STACK_WINDOWS = [
  { key: 'morning', icon: '🌅', title: 'Morning', titleAr: 'الصباح', time: '7–10 AM' },
  { key: 'lunch', icon: '🍽️', title: 'Lunch', titleAr: 'الغداء', time: '12–2 PM' },
  { key: 'evening', icon: '🌙', title: 'Evening', titleAr: 'المساء', time: '9–11 PM' },
  { key: 'anytime', icon: '⏱️', title: 'Anytime', titleAr: 'أي وقت', time: 'No fixed window' }
];

export const SUPPLEMENT_DB = [
  { name: 'Creatine monohydrate', nameAr: 'كرياتين مونوهيدرات', displayName: 'Creatine monohydrate / كرياتين مونوهيدرات', dose: '5g', window: 'anytime', note: 'يومياً — الاستمرارية أهم من التوقيت', icon: '🏋️', aliases: ['creatine', 'كرياتين'] },
  { name: 'Beta-alanine', nameAr: 'بيتا ألانين', displayName: 'Beta-alanine / بيتا ألانين', dose: '2–5g', window: 'morning', note: 'قبل التمرين — تجزئة الجرعات لتجنب الوخز', icon: '🏋️', aliases: ['beta alanine', 'بيتا ألانين'] },
  { name: 'L-citrulline', nameAr: 'إل-سيترولين', displayName: 'L-citrulline / إل-سيترولين', dose: '6–8g', window: 'morning', note: 'قبل التمرين بـ 30 دقيقة لضخ الدم (Pump)', icon: '🏋️', aliases: ['citrulline', 'سيترولين'] },
  { name: 'BCAAs', nameAr: 'أحماض أمينية BCAA', displayName: 'BCAAs / أحماض أمينية BCAA', dose: '5–10g', window: 'anytime', note: 'أثناء أو بعد التمرين للاستشفاء', icon: '🏋️', aliases: ['bcaa', 'بي سي اي اي'] },
  { name: 'Whey protein', nameAr: 'بروتين واي', displayName: 'Whey protein / بروتين واي', dose: '25–40g', window: 'anytime', note: 'بعد التمرين أو لسد احتياجك اليومي من البروتين', icon: '🥤', aliases: ['whey', 'بروتين واي', 'واي بروتين'] },
  { name: 'Casein protein', nameAr: 'بروتين كازين', displayName: 'Casein protein / بروتين كازين', dose: '25–40g', window: 'evening', note: 'قبل النوم لإمداد العضلات البطيء أثناء الليل', icon: '🥤', aliases: ['casein', 'كازين'] },
  { name: 'L-carnitine', nameAr: 'إل-كارنتين', displayName: 'L-carnitine / إل-كارنتين', dose: '1–2g', window: 'morning', note: 'مع وجبة كارب لامتصاص مثالي', icon: '🏋️', aliases: ['carnitine', 'كارنتين'] },
  { name: 'Acetyl-L-carnitine', nameAr: 'أسيتيل إل-كارنتين', displayName: 'Acetyl-L-carnitine / أسيتيل إل-كارنتين', dose: '500mg–2g', window: 'morning', note: 'للطاقة ودعم التركيز الذهني', icon: '🧠', aliases: ['alcar', 'الكار'] },
  { name: 'HMB', nameAr: 'إتش إم بي (HMB)', displayName: 'HMB / إتش إم بي', dose: '3g', window: 'anytime', note: 'مقسمة على 3 مرات لحماية الكتلة العضلية', icon: '🏋️', aliases: ['hmb'] },
  { name: 'Glutamine', nameAr: 'جلوتامين', displayName: 'Glutamine / جلوتامين', dose: '5g', window: 'anytime', note: 'دعم الاستشفاء وصحة الأمعاء', icon: '🏋️', aliases: ['l-glutamine', 'جلوتامين'] },
  { name: 'Vitamin D3', nameAr: 'فيتامين د3', displayName: 'Vitamin D3 / فيتامين د3', dose: '2000–5000 IU', window: 'lunch', note: 'يذوب في الدهون — يؤخذ مع أكبر وجبة', icon: '☀️', aliases: ['vit d', 'vitamin d', 'd3', 'cholecalciferol', 'فيتامين د'] },
  { name: 'Vitamin K2 (MK-7)', nameAr: 'فيتامين ك2', displayName: 'Vitamin K2 (MK-7) / فيتامين ك2', dose: '100–200 mcg', window: 'lunch', note: 'يؤخذ مع فيتامين D3 لتوجيه الكالسيوم للعظام', icon: '💊', aliases: ['vit k', 'vitamin k', 'k2', 'mk7', 'فيتامين ك'] },
  { name: 'Vitamin C', nameAr: 'فيتامين سي', displayName: 'Vitamin C / فيتامين سي', dose: '500–1000mg', window: 'morning', note: 'مضاد أكسدة ومقوي للمناعة وتصنيع الكولاجين', icon: '🍊', aliases: ['vit c', 'ascorbic acid', 'فيتامين سي'] },
  { name: 'Vitamin B12', nameAr: 'فيتامين ب12', displayName: 'Vitamin B12 / فيتامين ب12', dose: '500–1000mcg', window: 'morning', note: 'يفضل شكل ميثيل كوبالامين لدعم الطاقة والأعصاب', icon: '⚡', aliases: ['b12', 'methylcobalamin', 'فيتامين ب12'] },
  { name: 'B-complex', nameAr: 'فيتامين ب مركب', displayName: 'B-complex / فيتامين ب مركب', dose: '1 cap', window: 'morning', note: 'مجموعة فيتامينات B كاملة لتحفيز الطاقة الحيوية', icon: '⚡', aliases: ['b complex', 'b vitamins', 'فيتامين ب مركب'] },
  { name: 'Vitamin A', nameAr: 'فيتامين أ', displayName: 'Vitamin A / فيتامين أ', dose: '5000 IU', window: 'lunch', note: 'يذوب في الدهون — لصحة النظر والمناعة', icon: '💊', aliases: ['vit a', 'retinol', 'فيتامين أ'] },
  { name: 'Vitamin E', nameAr: 'فيتامين هـ', displayName: 'Vitamin E / فيتامين هـ', dose: '400 IU', window: 'lunch', note: 'مضاد أكسدة قوي وصحة الخلايا والجلد', icon: '💊', aliases: ['vit e', 'tocopherol', 'فيتامين هـ'] },
  { name: 'Folate', nameAr: 'حمض الفوليك (فولات)', displayName: 'Folate / حمض الفوليك (فولات)', dose: '400–800mcg', window: 'morning', note: 'يفضل شكل ميثيل فولات', icon: '💊', aliases: ['folic acid', 'b9', 'methylfolate', 'فوليك اسيد'] },
  { name: 'Biotin', nameAr: 'بيوتين', displayName: 'Biotin / بيوتين', dose: '30mcg–5mg', window: 'anytime', note: 'لصحة الشعر والأظافر والبشرة', icon: '💅', aliases: ['biotin', 'b7', 'بيوتين'] },
  { name: 'Multivitamin', nameAr: 'ملتي فيتامين', displayName: 'Multivitamin / ملتي فيتامين', dose: '1 serving', window: 'lunch', note: 'مع الوجبة لسد أي نقص غذائي عام', icon: '💊', aliases: ['multi', 'multivitamin', 'ملتي فيتامين'] },
  { name: 'Magnesium glycinate', nameAr: 'مغنيسيوم غلايسينات', displayName: 'Magnesium glycinate / مغنيسيوم غلايسينات', dose: '200–400mg', window: 'evening', note: 'قبل النوم بـ 30–60 دقيقة لاسترخاء العضلات ونوم عميق', icon: '🌙', aliases: ['magnesium', 'mag glycinate', 'bisglycinate', 'مغنيسيوم غلايسينات'] },
  { name: 'Magnesium L-threonate', nameAr: 'مغنيسيوم ثريونات', displayName: 'Magnesium L-threonate / مغنيسيوم ثريونات', dose: '144mg elemental', window: 'evening', note: 'يعبر الحاجز الدماغي لدعم الذاكرة والتركيز', icon: '🧠', aliases: ['magtein', 'threonate', 'مغنيسيوم ثريونات'] },
  { name: 'Magnesium citrate', nameAr: 'مغنيسيوم سترات', displayName: 'Magnesium citrate / مغنيسيوم سترات', dose: '200–400mg', window: 'evening', note: 'يدعم استرخاء العضلات والجهاز الهضمي', icon: '🌙', aliases: ['mag citrate', 'مغنيسيوم سترات'] },
  { name: 'Zinc', nameAr: 'زنك', displayName: 'Zinc / زنك', dose: '15–30mg', window: 'evening', note: 'مع الأكل ولدعم المناعة وهرمون التستوستيرون', icon: '💊', aliases: ['zinc', 'زنك'] },
  { name: 'Iron', nameAr: 'حديد', displayName: 'Iron / حديد', dose: '18–65mg', window: 'morning', note: 'على معدة فارغة مع فيتامين سي لرفع الامتصاص', icon: '💊', aliases: ['iron', 'حديد'] },
  { name: 'Calcium', nameAr: 'كالسيوم', displayName: 'Calcium / كالسيوم', dose: '500mg', window: 'evening', note: 'مع الوجبة لصحة العظام والأسنان', icon: '🦴', aliases: ['calcium', 'كالسيوم'] },
  { name: 'Selenium', nameAr: 'سيلينيوم', displayName: 'Selenium / سيلينيوم', dose: '100–200mcg', window: 'anytime', note: 'دعم الغدة الدرقية ومضاد أكسدة', icon: '💊', aliases: ['selenium', 'سيلينيوم'] },
  { name: 'Iodine', nameAr: 'يود', displayName: 'Iodine / يود', dose: '150mcg', window: 'morning', note: 'دعم وظائف هرمونات الغدة الدرقية', icon: '💊', aliases: ['iodine', 'يود'] },
  { name: 'Omega-3 (Fish oil)', nameAr: 'أوميغا 3 (زيت السمك)', displayName: 'Omega-3 (Fish oil) / أوميغا 3 (زيت السمك)', dose: '2–3g EPA+DHA', window: 'lunch', note: 'مع وجبة غنية بالدهون لصحة القلب والمفاصل', icon: '🐟', aliases: ['omega 3', 'omega3', 'fish oil', 'epa', 'dha', 'أوميغا 3', 'اوميغا'] },
  { name: 'Krill oil', nameAr: 'زيت الكريل', displayName: 'Krill oil / زيت الكريل', dose: '500–1000mg', window: 'lunch', note: 'أوميغا 3 فوسفوليبيد سريعة الامتصاص', icon: '🐟', aliases: ['krill', 'زيت الكريل'] },
  { name: 'MCT oil', nameAr: 'زيت إم سي تي', displayName: 'MCT oil / زيت إم سي تي', dose: '1–2 tbsp', window: 'morning', note: 'طاقة سريعة للدماغ وحرق الدهون', icon: '🥥', aliases: ['mct', 'ام سي تي'] },
  { name: 'Flaxseed oil', nameAr: 'زيت بذور الكتان', displayName: 'Flaxseed oil / زيت بذور الكتان', dose: '1–2g', window: 'lunch', note: 'مصدر نباتي لأوميغا 3 مع الوجبة', icon: '🌱', aliases: ['flax', 'flaxseed', 'بذور الكتان'] },
  { name: 'L-theanine', nameAr: 'إل-ثيانين', displayName: 'L-theanine / إل-ثيانين', dose: '100–200mg', window: 'morning', note: 'يُدمج مع الكافيين لتركيز هادئ بدون توتر', icon: '🧠', aliases: ['theanine', 'ثيانين'] },
  { name: 'Caffeine', nameAr: 'كافيين', displayName: 'Caffeine / كافيين', dose: '100–200mg', window: 'morning', note: 'يقظة ونشاط وتحفيز الأداء الرياضي', icon: '☕', aliases: ['caffeine', 'كافيين'] },
  { name: 'Rhodiola rosea', nameAr: 'روديولا روزيا', displayName: 'Rhodiola rosea / روديولا روزيا', dose: '200–400mg', window: 'morning', note: 'عشبة لمقاومة التعب والإجهاد البدني', icon: '🌿', aliases: ['rhodiola', 'روديولا'] },
  { name: 'Lion\'s mane', nameAr: 'فطر عرف الأسد', displayName: 'Lion\'s mane / فطر عرف الأسد', dose: '500–1000mg', window: 'morning', note: 'دعم التركيز وتحفيز الخلايا العصبية', icon: '🍄', aliases: ['lions mane', 'hericium', 'عرف الأسد'] },
  { name: 'Bacopa monnieri', nameAr: 'باكوبا مونيري', displayName: 'Bacopa monnieri / باكوبا مونيري', dose: '300–600mg', window: 'morning', note: 'لتقوية الذاكرة الطويلة والاستيعاب', icon: '🌿', aliases: ['bacopa', 'باكوبا'] },
  { name: 'Ginkgo biloba', nameAr: 'جنكة بيلوبا', displayName: 'Ginkgo biloba / جنكة بيلوبا', dose: '120–240mg', window: 'morning', note: 'تنشيط الدورة الدموية الدماغية', icon: '🌿', aliases: ['ginkgo', 'جنكة بيلوبا'] },
  { name: 'Alpha-GPC', nameAr: 'ألفا جي بي سي', displayName: 'Alpha-GPC / ألفا جي بي سي', dose: '300–600mg', window: 'morning', note: 'مركب كولين لزيادة التركيز وقوة الانقباض', icon: '🧠', aliases: ['alpha gpc', 'ألفا جي بي سي'] },
  { name: 'Phosphatidylserine', nameAr: 'فوسفاتيديل سيرين', displayName: 'Phosphatidylserine / فوسفاتيديل سيرين', dose: '100–300mg', window: 'evening', note: 'تنظيم هرمون الكورتيزول وتخفيف التوتر', icon: '🧠', aliases: ['ps', 'فوسفاتيديل سيرين'] },
  { name: 'NAC', nameAr: 'إن-أسيتيل سيستيين (NAC)', displayName: 'NAC / إن-أسيتيل سيستيين (NAC)', dose: '600–1800mg', window: 'morning', note: 'مضاد أكسدة وتطهير الكبد ودعم الرئتين', icon: '💊', aliases: ['nac', 'n-acetyl cysteine', 'ان اسيتيل سيستيين'] },
  { name: 'Melatonin', nameAr: 'ميلاتونين', displayName: 'Melatonin / ميلاتونين', dose: '0.3–3mg', window: 'evening', note: 'قبل النوم بـ 30 دقيقة لضبط الساعة البيولوجية', icon: '🌙', aliases: ['melatonin', 'ميلاتونين'] },
  { name: 'Glycine', nameAr: 'جلايسين', displayName: 'Glycine / جلايسين', dose: '3g', window: 'evening', note: 'يخفض حرارة الجسم لنوم أعمق واستشفاء أفضل', icon: '🌙', aliases: ['glycine', 'جلايسين'] },
  { name: 'Apigenin', nameAr: 'أبيجينين', displayName: 'Apigenin / أبيجينين', dose: '50mg', window: 'evening', note: 'مستخلص البابونج للهدوء قبل النوم', icon: '🌙', aliases: ['apigenin', 'أبيجينين'] },
  { name: 'Ashwagandha', nameAr: 'أشواغاندا', displayName: 'Ashwagandha / أشواغاندا', dose: '300–600mg', window: 'evening', note: 'خفض الكورتيزول وتحسين جودة النوم والقوة', icon: '🌿', aliases: ['ashwagandha', 'ksm-66', 'أشواغاندا'] },
  { name: 'L-tryptophan', nameAr: 'إل-تريبتوفان', displayName: 'L-tryptophan / إل-تريبتوفان', dose: '500mg–1g', window: 'evening', note: 'مقدمة لهرمون السيروتونين والميلاتونين', icon: '🌙', aliases: ['tryptophan', 'تريبتوفان'] },
  { name: 'GABA', nameAr: 'غابا', displayName: 'GABA / غابا', dose: '500–750mg', window: 'evening', note: 'ناقل عصبي مهدئ للجهاز العصبي', icon: '🌙', aliases: ['gaba', 'غابا'] },
  { name: 'Valerian root', nameAr: 'جذور الناردين', displayName: 'Valerian root / جذور الناردين', dose: '300–600mg', window: 'evening', note: 'تهدئة التوتر والمساعدة على الاستغراق في النوم', icon: '🌙', aliases: ['valerian', 'جذور الناردين'] },
  { name: 'Probiotics', nameAr: 'بروبيوتيك (بكتيريا نافعة)', displayName: 'Probiotics / بروبيوتيك (بكتيريا نافعة)', dose: '10–50 billion CFU', window: 'morning', note: 'صحة الجهاز الهضمي وامتصاص المغذيات والمناعة', icon: '🦠', aliases: ['probiotic', 'بروبيوتيك'] },
  { name: 'Quercetin', nameAr: 'كيرسيتين', displayName: 'Quercetin / كيرسيتين', dose: '500–1000mg', window: 'anytime', note: 'مضاد التهابات قوي يدعم المناعة مع فيتامين سي', icon: '🌿', aliases: ['quercetin', 'كيرسيتين'] },
  { name: 'Curcumin', nameAr: 'كركمين', displayName: 'Curcumin / كركمين (خلاصة الكركم)', dose: '500–1000mg', window: 'lunch', note: 'مضاد أكسدة والتهابات المفاصل مع الفلفل الأسود', icon: '🌿', aliases: ['curcumin', 'turmeric', 'كركمين', 'كركم'] },
  { name: 'Resveratrol', nameAr: 'ريسفيراترول', displayName: 'Resveratrol / ريسفيراترول', dose: '250–500mg', window: 'morning', note: 'مضاد شيخوخة وصحة الشرايين والقلب', icon: '🍇', aliases: ['resveratrol', 'ريسفيراترول'] },
  { name: 'CoQ10 / Ubiquinol', nameAr: 'إنزيم كيو 10', displayName: 'CoQ10 / Ubiquinol / إنزيم كيو 10', dose: '100–200mg', window: 'lunch', note: 'طاقة الميتوكوندريا وصحة عضلة القلب مع الوجبة', icon: '💊', aliases: ['coq10', 'ubiquinol', 'كيو 10'] },
  { name: 'Alpha lipoic acid', nameAr: 'حمض ألفا ليبويك', displayName: 'Alpha lipoic acid / حمض ألفا ليبويك', dose: '300–600mg', window: 'morning', note: 'حساسية الإنسولين ومضاد أكسدة شامل', icon: '💊', aliases: ['ala', 'alpha lipoic', 'ألفا ليبويك'] },
  { name: 'Glutathione', nameAr: 'جلوتاثيون', displayName: 'Glutathione / جلوتاثيون', dose: '250–1000mg', window: 'morning', note: 'مضاد الأكسدة الرئيسي بالجسم ويفضل الشبيه بالليبوزومي', icon: '💊', aliases: ['glutathione', 'جلوتاثيون'] },
  { name: 'Astaxanthin', nameAr: 'أستازانتين', displayName: 'Astaxanthin / أستازانتين', dose: '4–12mg', window: 'lunch', note: 'مضاد أكسدة لصحة العيون والبشرة والمفاصل', icon: '💊', aliases: ['astaxanthin', 'أستازانتين'] },
  { name: 'Berberine', nameAr: 'بربرين', displayName: 'Berberine / بربرين', dose: '500mg', window: 'lunch', note: 'قبل الوجبة لتنظيم سكر الدم وحساسية الإنسولين', icon: '💊', aliases: ['berberine', 'بربرين'] },
  { name: 'Milk thistle', nameAr: 'حليب الشوك', displayName: 'Milk thistle / حليب الشوك (سيليمارين)', dose: '200–400mg', window: 'anytime', note: 'سيليمارين لتنقية ودعم وظائف الكبد', icon: '🌿', aliases: ['milk thistle', 'silymarin', 'حليب الشوك'] },
  { name: 'Spirulina', nameAr: 'سبيرولينا', displayName: 'Spirulina / سبيرولينا', dose: '3–5g', window: 'morning', note: 'طحالب غنية بالبروتين والمعادن ومضادات الأكسدة', icon: '🌱', aliases: ['spirulina', 'سبيرولينا'] },
  { name: 'Chlorella', nameAr: 'كلوريلا', displayName: 'Chlorella / كلوريلا', dose: '2–4g', window: 'morning', note: 'طحالب خضراء لتنقية الجسم والمعادن الثقيلة', icon: '🌱', aliases: ['chlorella', 'كلوريلا'] },
  { name: 'Tongkat ali', nameAr: 'تونكات علي', displayName: 'Tongkat ali / تونكات علي', dose: '200–400mg', window: 'morning', note: 'دعم هرمون الذكورة والطاقة والحيوية', icon: '🌿', aliases: ['tongkat', 'longjack', 'تونكات علي'] },
  { name: 'Fadogia agrestis', nameAr: 'فادوجيا أجريستيس', displayName: 'Fadogia agrestis / فادوجيا أجريستيس', dose: '600mg', window: 'morning', note: 'تحفيز التستوستيرون الطبيعي والأداء العضلي', icon: '🌿', aliases: ['fadogia', 'فادوجيا'] },
  { name: 'DHEA', nameAr: 'دي إتش إي إيه (DHEA)', displayName: 'DHEA / دي إتش إي إيه', dose: '25–50mg', window: 'morning', note: 'هرمون طاقة وتحفيز حيوي', icon: '💊', aliases: ['dhea', 'دي هيدرو إيبي آندروستيرون'] },
  { name: 'Pregnenolone', nameAr: 'بريجنينولون', displayName: 'Pregnenolone / بريجنينولون', dose: '10–50mg', window: 'morning', note: 'دعم التوازن الهرموني والذاكرة', icon: '💊', aliases: ['pregnenolone', 'بريجنينولون'] },
  { name: 'Tribulus terrestris', nameAr: 'تريبولوس', displayName: 'Tribulus terrestris / تريبولوس', dose: '250–750mg', window: 'morning', note: 'عشبة لزيادة الطاقة والنشاط البدني', icon: '🌿', aliases: ['tribulus', 'تريبولوس'] },
  { name: 'Maca root', nameAr: 'جذور الماكا', displayName: 'Maca root / جذور الماكا', dose: '1.5–3g', window: 'morning', note: 'طاقة وقوة وتحمل ومقاومة للإجهاد', icon: '🌿', aliases: ['maca', 'جذور الماكا'] },
  { name: 'Collagen peptides', nameAr: 'ببتيدات الكولاجين', displayName: 'Collagen peptides / ببتيدات الكولاجين', dose: '10–20g', window: 'anytime', note: 'لصحة المفاصل والأوتار والغضاريف مع فيتامين سي', icon: '💅', aliases: ['collagen', 'كولاجين'] },
  { name: 'Glucosamine', nameAr: 'جلوكوزامين', displayName: 'Glucosamine / جلوكوزامين', dose: '1500mg', window: 'lunch', note: 'بناء وحماية غضاريف المفاصل وتخفيف الاحتكاك', icon: '🦴', aliases: ['glucosamine', 'جلوكوزامين'] },
  { name: 'Chondroitin', nameAr: 'كوندرويتين', displayName: 'Chondroitin / كوندرويتين', dose: '1200mg', window: 'lunch', note: 'مرونة المفاصل وغالباً يقترن مع الجلوكوزامين', icon: '🦴', aliases: ['chondroitin', 'كوندرويتين'] },
  { name: 'MSM', nameAr: 'إم إس إم', displayName: 'MSM / إم إس إم', dose: '1–3g', window: 'anytime', note: 'كبريت عضوي لتخفيف التهابات المفاصل والاستشفاء', icon: '🦴', aliases: ['msm', 'ام اس ام'] },
  { name: 'Hyaluronic acid', nameAr: 'حمض الهيالورونيك', displayName: 'Hyaluronic acid / حمض الهيالورونيك', dose: '120–200mg', window: 'anytime', note: 'ترطيب عميق للمفاصل والأنسجة والجلد', icon: '💅', aliases: ['hyaluronic', 'ha', 'حمض الهيالورونيك'] },
  { name: 'Cordyceps', nameAr: 'فطر الكورديسيبس', displayName: 'Cordyceps / فطر الكورديسيبس', dose: '1–3g', window: 'morning', note: 'رفع استهلاك الأكسجين (VO2 max) والطاقة الهوائية', icon: '🍄', aliases: ['cordyceps', 'فطر الكورديسيبس'] },
  { name: 'Reishi', nameAr: 'فطر الريشي', displayName: 'Reishi / فطر الريشي', dose: '1–2g', window: 'evening', note: 'استرخاء الأعصاب ودعم المناعة والنوم', icon: '🍄', aliases: ['reishi', 'ganoderma', 'فطر الريشي'] },
  { name: 'Chaga', nameAr: 'فطر التشاغا', displayName: 'Chaga / فطر التشاغا', dose: '1–2g', window: 'morning', note: 'أعلى مضادات الأكسدة ومقوي مناعي طبيعي', icon: '🍄', aliases: ['chaga', 'فطر التشاغا'] }
];

export const SUBSTANCE_DB = [
  { id: 'adderall',    name: 'Adderall (mixed amphetamine salts)', cat: 'ADHD stim',    unit: 'mg',           defaultDose: 20,   mlPerUnit: 25,    note: 'Stim · reduces thirst signal · dries you out' },
  { id: 'concerta',    name: 'Concerta (methylphenidate ER)',      cat: 'ADHD stim',    unit: 'mg',           defaultDose: 36,   mlPerUnit: 13.9,  note: 'Stim · reduces thirst signal' },
  { id: 'vyvanse',     name: 'Vyvanse (lisdexamfetamine)',         cat: 'ADHD stim',    unit: 'mg',           defaultDose: 50,   mlPerUnit: 10,    note: 'Stim prodrug · long acting' },
  { id: 'ritalin',     name: 'Ritalin IR (methylphenidate)',       cat: 'ADHD stim',    unit: 'mg',           defaultDose: 20,   mlPerUnit: 20,    note: 'Short-acting stim' },
  { id: 'focalin',     name: 'Focalin / Focalin XR',               cat: 'ADHD stim',    unit: 'mg',           defaultDose: 20,   mlPerUnit: 20,    note: 'Methylphenidate isomer' },
  { id: 'modafinil',   name: 'Modafinil',                          cat: 'Wakefulness',  unit: 'mg',           defaultDose: 200,  mlPerUnit: 1.75,  note: 'Mild dehydrating effect' },
  { id: 'lithium',     name: 'Lithium',                            cat: 'Mood',         unit: 'mg',           defaultDose: 600,  mlPerUnit: 1.67,  note: 'Critical — narrow therapeutic window, dehydration → toxicity' },
  { id: 'hctz',        name: 'Hydrochlorothiazide (HCTZ)',         cat: 'Diuretic',     unit: 'mg',           defaultDose: 25,   mlPerUnit: 40,    note: 'Direct diuretic — drink to compensate' },
  { id: 'lasix',       name: 'Furosemide (Lasix)',                 cat: 'Diuretic',     unit: 'mg',           defaultDose: 40,   mlPerUnit: 30,    note: 'Loop diuretic · talk to your doctor about target' },
  { id: 'spironol',    name: 'Spironolactone',                     cat: 'Diuretic',     unit: 'mg',           defaultDose: 50,   mlPerUnit: 12,    note: 'K-sparing diuretic' },
  { id: 'sudafed',     name: 'Pseudoephedrine (Sudafed)',          cat: 'Decongestant', unit: 'mg',           defaultDose: 60,   mlPerUnit: 4.17,  note: 'Sympathomimetic · dries mucous membranes' },
  { id: 'phenyl',      name: 'Phenylephrine',                      cat: 'Decongestant', unit: 'mg',           defaultDose: 10,   mlPerUnit: 20,    note: 'Vasoconstrictor — mild' },
  { id: 'nicotine',    name: 'Nicotine pouch (Velo / Zyn)',        cat: 'Stim',         unit: 'pouches/day',  defaultDose: 4,    mlPerUnit: 62.5,  note: 'Vasoconstriction + dry mouth' },
  { id: 'nicpatch',    name: 'Nicotine patch',                     cat: 'Stim',         unit: 'mg',           defaultDose: 14,   mlPerUnit: 18,    note: '24-h transdermal · sustained release' },
  { id: 'alcohol',     name: 'Alcohol',                            cat: 'Depressant',   unit: 'drinks/day',   defaultDose: 1,    mlPerUnit: 400,   note: '~10ml urine per gram ethanol — adds up fast' },
  { id: 'cannabis',    name: 'Cannabis / THC',                     cat: 'Other',        unit: 'sessions/day', defaultDose: 1,    mlPerUnit: 250,   note: 'Cottonmouth — saliva gland inhibition' },
  { id: 'creatine',    name: 'Creatine monohydrate',               cat: 'Supplement',   unit: 'g/day',        defaultDose: 5,    mlPerUnit: 80,    note: 'Pulls water into muscle cells — drink more' }
];

export function searchSupplementsDb(query) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return [];
  const starts = [];
  const contains = [];
  SUPPLEMENT_DB.forEach((s) => {
    const nameLC = s.name.toLowerCase();
    const nameArLC = (s.nameAr || '').toLowerCase();
    const displayNameLC = (s.displayName || '').toLowerCase();
    const aliases = (s.aliases || []).map((a) => a.toLowerCase());
    const allNames = [nameLC, nameArLC, displayNameLC, ...aliases];
    if (allNames.some((n) => n.startsWith(q))) starts.push(s);
    else if (allNames.some((n) => n.includes(q))) contains.push(s);
  });
  return [...starts, ...contains].slice(0, 8);
}
