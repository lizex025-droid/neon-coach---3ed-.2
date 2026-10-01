import { resolveProtectedUrl } from '../utils/imageSecurity.js';
/**
 * NEON COACH - قاعدة بيانات الوصفات الصحية والرياضية
 * وصفات محسوبة السعرات والماكروز بدقة، مصنفة حسب الوجبات ونوع الهدف
 */

export const RECIPE_CATEGORIES = [
  { id: 'all', label: 'الكل', icon: '✨' },
  { id: 'high_protein', label: 'عالي البروتين', icon: '💪' },
  { id: 'main_dishes', label: 'وجبات رئيسية', icon: '🍗' },
  { id: 'salads', label: 'سلطات', icon: '🥗' },
  { id: 'breakfast', label: 'فطور ومخبوزات', icon: '🍳' },
  { id: 'snacks_dessert', label: 'سناك وحلويات', icon: '🍪' }
];

export const RECIPES_DATA = [
  {
    "id": "recipe-1",
    "titleAr": "طاجن الدجاج المغربي بالأرز والخضار",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 510,
    "protein": 46,
    "carbs": 49,
    "fats": 13,
    "prepTime": "35 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍲",
    "imageUrl": resolveProtectedUrl('recipe-1'),
    "description": "وجبة «طاجن الدجاج المغربي بالأرز والخضار» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "طاجن الدجاج المغربي بالأرز والخضار"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-2",
    "titleAr": "صدر دجاج مشوي ببطاطا بومباي والليمون",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 430,
    "protein": 48,
    "carbs": 22,
    "fats": 18,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-2'),
    "description": "وجبة «صدر دجاج مشوي ببطاطا بومباي والليمون» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "صدر دجاج مشوي ببطاطا بومباي والليمون"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-3",
    "titleAr": "سلطة دجاج الباربكيو والخضار",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": true,
    "calories": 266,
    "protein": 26,
    "carbs": 25,
    "fats": 2,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": resolveProtectedUrl('recipe-3'),
    "description": "وجبة «سلطة دجاج الباربكيو والخضار» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "سلطة دجاج الباربكيو والخضار"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-4",
    "titleAr": "فتوش بخبز القمح الكامل المحمص",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 108,
    "protein": 3,
    "carbs": 15,
    "fats": 4,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": resolveProtectedUrl('recipe-4'),
    "description": "وجبة «فتوش بخبز القمح الكامل المحمص» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "فتوش بخبز القمح الكامل المحمص"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-5",
    "titleAr": "تبولة البرغل والخضار",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 92,
    "protein": 2,
    "carbs": 13,
    "fats": 4,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": resolveProtectedUrl('recipe-5'),
    "description": "وجبة «تبولة البرغل والخضار» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "تبولة البرغل والخضار"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-6",
    "titleAr": "سلطة الكينوا بالخيار والطماطم والفيتا",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 274,
    "protein": 10,
    "carbs": 35,
    "fats": 11,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": resolveProtectedUrl('recipe-6'),
    "description": "وجبة «سلطة الكينوا بالخيار والطماطم والفيتا» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "سلطة الكينوا بالخيار والطماطم والفيتا"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-7",
    "titleAr": "سلطة الجمبري والمعكرونة بالشبت",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": true,
    "calories": 329,
    "protein": 35,
    "carbs": 45,
    "fats": 1,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍤",
    "imageUrl": resolveProtectedUrl('recipe-7'),
    "description": "وجبة «سلطة الجمبري والمعكرونة بالشبت» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "سلطة الجمبري والمعكرونة بالشبت"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-8",
    "titleAr": "صينية دجاج سريراتشا وخضار مع الكينوا",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 500,
    "protein": 43,
    "carbs": 49,
    "fats": 16,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥘",
    "imageUrl": resolveProtectedUrl('recipe-8'),
    "description": "وجبة «صينية دجاج سريراتشا وخضار مع الكينوا» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "صينية دجاج سريراتشا وخضار مع الكينوا"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-9",
    "titleAr": "شاورما أفخاذ الدجاج بالمقلاة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": false,
    "calories": 203,
    "protein": 22,
    "carbs": 1,
    "fats": 12,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🌯",
    "imageUrl": resolveProtectedUrl('recipe-9'),
    "description": "وجبة «شاورما أفخاذ الدجاج بالمقلاة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "شاورما أفخاذ الدجاج بالمقلاة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-10",
    "titleAr": "دجاج الكركم مع الكسكس والخضار",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 560,
    "protein": 65,
    "carbs": 45,
    "fats": 12,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-10'),
    "description": "وجبة «دجاج الكركم مع الكسكس والخضار» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دجاج الكركم مع الكسكس والخضار"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-11",
    "titleAr": "برغر الدجاج المسحب المدخن والبطاطا الحلوة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 660,
    "protein": 57,
    "carbs": 79,
    "fats": 13,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍔",
    "imageUrl": resolveProtectedUrl('recipe-11'),
    "description": "وجبة «برغر الدجاج المسحب المدخن والبطاطا الحلوة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "برغر الدجاج المسحب المدخن والبطاطا الحلوة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-12",
    "titleAr": "فاهيتا دجاج وخضار بتورتيلا كاملة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 498,
    "protein": 41,
    "carbs": 42,
    "fats": 18,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🌮",
    "imageUrl": resolveProtectedUrl('recipe-12'),
    "description": "وجبة «فاهيتا دجاج وخضار بتورتيلا كاملة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "فاهيتا دجاج وخضار بتورتيلا كاملة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-13",
    "titleAr": "شرائح صدر الدجاج تحت الشواية",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 313,
    "protein": 36,
    "carbs": 0,
    "fats": 14.2,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-13'),
    "description": "وجبة «شرائح صدر الدجاج تحت الشواية» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "شرائح صدر الدجاج تحت الشواية"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-14",
    "titleAr": "كاري الدجاج بالكاجو والزبادي",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 580,
    "protein": 52,
    "carbs": 26,
    "fats": 30,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍛",
    "imageUrl": resolveProtectedUrl('recipe-14'),
    "description": "وجبة «كاري الدجاج بالكاجو والزبادي» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كاري الدجاج بالكاجو والزبادي"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-15",
    "titleAr": "سلطة التونة والفاصوليا البيضاء",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 316,
    "protein": 19,
    "carbs": 23,
    "fats": 10,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": resolveProtectedUrl('recipe-15'),
    "description": "وجبة «سلطة التونة والفاصوليا البيضاء» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "سلطة التونة والفاصوليا البيضاء"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-16",
    "titleAr": "سلطة شاورما الدجاج بالطحينة",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": true,
    "calories": 570,
    "protein": 60,
    "carbs": 20.5,
    "fats": 27.5,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": resolveProtectedUrl('recipe-16'),
    "description": "وجبة «سلطة شاورما الدجاج بالطحينة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "سلطة شاورما الدجاج بالطحينة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-17",
    "titleAr": "دجاج الليمون والطحينة مع الفاصوليا",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 760,
    "protein": 63,
    "carbs": 68,
    "fats": 25,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-17'),
    "description": "وجبة «دجاج الليمون والطحينة مع الفاصوليا» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دجاج الليمون والطحينة مع الفاصوليا"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-18",
    "titleAr": "مافن البروتين بالليمون والخشخاش",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور وحلويات",
    "isHighProtein": true,
    "calories": 462,
    "protein": 32,
    "carbs": 64.5,
    "fats": 8.2,
    "prepTime": "35 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🧁",
    "imageUrl": resolveProtectedUrl('recipe-18'),
    "description": "وجبة «مافن البروتين بالليمون والخشخاش» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "مافن البروتين بالليمون والخشخاش"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-19",
    "titleAr": "بيتزا صغيرة بالسبانخ والريكوتا والبيض",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 445,
    "protein": 34.1,
    "carbs": 33.3,
    "fats": 19.5,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍕",
    "imageUrl": resolveProtectedUrl('recipe-19'),
    "description": "وجبة «بيتزا صغيرة بالسبانخ والريكوتا والبيض» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بيتزا صغيرة بالسبانخ والريكوتا والبيض"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-20",
    "titleAr": "بودينغ الشيا بحليب اللوز والعسل",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور وحلويات",
    "isHighProtein": false,
    "calories": 198,
    "protein": 5,
    "carbs": 28,
    "fats": 9,
    "prepTime": "10 دقائق + تبريد",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍧",
    "imageUrl": resolveProtectedUrl('recipe-20'),
    "description": "وجبة «بودينغ الشيا بحليب اللوز والعسل» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بودينغ الشيا بحليب اللوز والعسل"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-21",
    "titleAr": "كوكيز البروتين والموز والشوفان",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 286,
    "protein": 18.8,
    "carbs": 32.3,
    "fats": 10,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍪",
    "imageUrl": resolveProtectedUrl('recipe-21'),
    "description": "وجبة «كوكيز البروتين والموز والشوفان» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كوكيز البروتين والموز والشوفان"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-22",
    "titleAr": "بان كيك الموز بثلاثة مكونات",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور وحلويات",
    "isHighProtein": false,
    "calories": 231,
    "protein": 9,
    "carbs": 39,
    "fats": 5,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥞",
    "imageUrl": resolveProtectedUrl('recipe-22'),
    "description": "وجبة «بان كيك الموز بثلاثة مكونات» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بان كيك الموز بثلاثة مكونات"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-23",
    "titleAr": "خبز الشوفان والجبنة القريش",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "خبز وفطور",
    "isHighProtein": false,
    "calories": 117,
    "protein": 8,
    "carbs": 11,
    "fats": 5,
    "prepTime": "80 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍞",
    "imageUrl": resolveProtectedUrl('recipe-23'),
    "description": "وجبة «خبز الشوفان والجبنة القريش» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "خبز الشوفان والجبنة القريش"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-24",
    "titleAr": "دجاج بالبقسماط والفاصوليا والثوم والبروكلي",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 700,
    "protein": 63,
    "carbs": 51,
    "fats": 28,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-24'),
    "description": "وجبة «دجاج بالبقسماط والفاصوليا والثوم والبروكلي» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دجاج بالبقسماط والفاصوليا والثوم والبروكلي"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-25",
    "titleAr": "بان كيك Whey بالماء",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور وحلويات",
    "isHighProtein": true,
    "calories": 274,
    "protein": 37,
    "carbs": 2.3,
    "fats": 13.1,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥞",
    "imageUrl": resolveProtectedUrl('recipe-25'),
    "description": "وجبة «بان كيك Whey بالماء» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بان كيك Whey بالماء"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-26",
    "titleAr": "براوني/حلى بروتين بالمقلاة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 242,
    "protein": 26.1,
    "carbs": 6.2,
    "fats": 13.7,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍫",
    "imageUrl": resolveProtectedUrl('recipe-26'),
    "description": "وجبة «براوني/حلى بروتين بالمقلاة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "براوني/حلى بروتين بالمقلاة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-27",
    "titleAr": "براوني كيتو طري",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 307,
    "protein": 11.7,
    "carbs": 7.9,
    "fats": 27.7,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🧁",
    "imageUrl": resolveProtectedUrl('recipe-27'),
    "description": "وجبة «براوني كيتو طري» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "براوني كيتو طري"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-28",
    "titleAr": "كوكيز كيتو",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 489,
    "protein": 22.7,
    "carbs": 19,
    "fats": 40.4,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍪",
    "imageUrl": resolveProtectedUrl('recipe-28'),
    "description": "وجبة «كوكيز كيتو» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كوكيز كيتو"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-29",
    "titleAr": "بوظة البروتين الأصلية",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 172,
    "protein": 30.8,
    "carbs": 2.8,
    "fats": 3.1,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍨",
    "imageUrl": resolveProtectedUrl('recipe-29'),
    "description": "وجبة «بوظة البروتين الأصلية» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بوظة البروتين الأصلية"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-30",
    "titleAr": "بوظة البروتين المفضلة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 211,
    "protein": 37.4,
    "carbs": 3.4,
    "fats": 3.9,
    "prepTime": "5 دقائق + تجميد اختياري",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍦",
    "imageUrl": resolveProtectedUrl('recipe-30'),
    "description": "وجبة «بوظة البروتين المفضلة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بوظة البروتين المفضلة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-31",
    "titleAr": "بوظة البروتين 50غ تفورك",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 194,
    "protein": 33.4,
    "carbs": 3.2,
    "fats": 3.9,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍨",
    "imageUrl": resolveProtectedUrl('recipe-31'),
    "description": "وجبة «بوظة البروتين 50غ تفورك» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بوظة البروتين 50غ تفورك"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-32",
    "titleAr": "بوظة البروتين مع Xanthan",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 194,
    "protein": 33.4,
    "carbs": 3.7,
    "fats": 3.9,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍦",
    "imageUrl": resolveProtectedUrl('recipe-32'),
    "description": "وجبة «بوظة البروتين مع Xanthan» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بوظة البروتين مع Xanthan"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-33",
    "titleAr": "كريم نوتيلا كيتو بزبدة الفول السوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 263,
    "protein": 12.1,
    "carbs": 13.9,
    "fats": 21.9,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍫",
    "imageUrl": resolveProtectedUrl('recipe-33'),
    "description": "وجبة «كريم نوتيلا كيتو بزبدة الفول السوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كريم نوتيلا كيتو بزبدة الفول السوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-34",
    "titleAr": "كريمة بروتين بزبدة الفول السوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 162,
    "protein": 20.2,
    "carbs": 4,
    "fats": 8,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥜",
    "imageUrl": resolveProtectedUrl('recipe-34'),
    "description": "وجبة «كريمة بروتين بزبدة الفول السوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كريمة بروتين بزبدة الفول السوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-35",
    "titleAr": "موس شوكولاتة وزبدة فول سوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 134,
    "protein": 6.1,
    "carbs": 7,
    "fats": 11.1,
    "prepTime": "35 دقيقة مع التبريد",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍮",
    "imageUrl": resolveProtectedUrl('recipe-35'),
    "description": "وجبة «موس شوكولاتة وزبدة فول سوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "موس شوكولاتة وزبدة فول سوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-36",
    "titleAr": "توبينغ كيكة عيد الميلاد بدون زبدة فول سوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 339,
    "protein": 7,
    "carbs": 9.4,
    "fats": 34.1,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🎂",
    "imageUrl": resolveProtectedUrl('recipe-36'),
    "description": "وجبة «توبينغ كيكة عيد الميلاد بدون زبدة فول سوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "توبينغ كيكة عيد الميلاد بدون زبدة فول سوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-37",
    "titleAr": "توبينغ كيكة عيد الميلاد بزبدة فول سوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 486,
    "protein": 13.3,
    "carbs": 14.4,
    "fats": 46.7,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🎂",
    "imageUrl": resolveProtectedUrl('recipe-37'),
    "description": "وجبة «توبينغ كيكة عيد الميلاد بزبدة فول سوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "توبينغ كيكة عيد الميلاد بزبدة فول سوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-38",
    "titleAr": "خبز التونة",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "خبز وفطور",
    "isHighProtein": true,
    "calories": 254,
    "protein": 36.6,
    "carbs": 1.8,
    "fats": 10.3,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍞",
    "imageUrl": resolveProtectedUrl('recipe-38'),
    "description": "وجبة «خبز التونة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "خبز التونة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-39",
    "titleAr": "خبز بياض البيض",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "خبز وفطور",
    "isHighProtein": false,
    "calories": 53,
    "protein": 10.8,
    "carbs": 1.3,
    "fats": 0.2,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍞",
    "imageUrl": resolveProtectedUrl('recipe-39'),
    "description": "وجبة «خبز بياض البيض» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "خبز بياض البيض"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-40",
    "titleAr": "خبز بياض البيض والموزاريلا",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "خبز وفطور",
    "isHighProtein": false,
    "calories": 109,
    "protein": 16.4,
    "carbs": 1.9,
    "fats": 3.6,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍞",
    "imageUrl": resolveProtectedUrl('recipe-40'),
    "description": "وجبة «خبز بياض البيض والموزاريلا» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "خبز بياض البيض والموزاريلا"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-41",
    "titleAr": "خبز كيتو بالجبنة الكريمية",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "خبز وفطور",
    "isHighProtein": false,
    "calories": 316,
    "protein": 15.7,
    "carbs": 3.9,
    "fats": 26.7,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍞",
    "imageUrl": resolveProtectedUrl('recipe-41'),
    "description": "وجبة «خبز كيتو بالجبنة الكريمية» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "خبز كيتو بالجبنة الكريمية"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-42",
    "titleAr": "خبز كيتو بالدجاج والبيض",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "خبز وفطور",
    "isHighProtein": true,
    "calories": 525,
    "protein": 50.1,
    "carbs": 2.2,
    "fats": 34.1,
    "prepTime": "35 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍞",
    "imageUrl": resolveProtectedUrl('recipe-42'),
    "description": "وجبة «خبز كيتو بالدجاج والبيض» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "خبز كيتو بالدجاج والبيض"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-43",
    "titleAr": "نسخة المدرسة بالدجاج والبيض",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 361,
    "protein": 41.7,
    "carbs": 5.9,
    "fats": 18,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥪",
    "imageUrl": resolveProtectedUrl('recipe-43'),
    "description": "وجبة «نسخة المدرسة بالدجاج والبيض» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "نسخة المدرسة بالدجاج والبيض"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-44",
    "titleAr": "دونات بروتين شوكولاتة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 288,
    "protein": 24.8,
    "carbs": 6.1,
    "fats": 19.3,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍩",
    "imageUrl": resolveProtectedUrl('recipe-44'),
    "description": "وجبة «دونات بروتين شوكولاتة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دونات بروتين شوكولاتة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-45",
    "titleAr": "دونات بروتين – 3 حبات",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 80,
    "protein": 15.2,
    "carbs": 2,
    "fats": 1.4,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍩",
    "imageUrl": resolveProtectedUrl('recipe-45'),
    "description": "وجبة «دونات بروتين – 3 حبات» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دونات بروتين – 3 حبات"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-46",
    "titleAr": "دونات كيتو بروتين",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 332,
    "protein": 27.3,
    "carbs": 7.6,
    "fats": 22.7,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍩",
    "imageUrl": resolveProtectedUrl('recipe-46'),
    "description": "وجبة «دونات كيتو بروتين» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دونات كيتو بروتين"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-47",
    "titleAr": "ساندويتش خبز التونة للمدرسة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك / وجبة خفيفة",
    "isHighProtein": true,
    "calories": 430,
    "protein": 59.3,
    "carbs": 5.7,
    "fats": 17.4,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥪",
    "imageUrl": resolveProtectedUrl('recipe-47'),
    "description": "وجبة «ساندويتش خبز التونة للمدرسة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "ساندويتش خبز التونة للمدرسة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-48",
    "titleAr": "كفتة وتفورك كوجبة خفيفة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك / وجبة خفيفة",
    "isHighProtein": true,
    "calories": 415,
    "protein": 40.2,
    "carbs": 4.2,
    "fats": 25.8,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍢",
    "imageUrl": resolveProtectedUrl('recipe-48'),
    "description": "وجبة «كفتة وتفورك كوجبة خفيفة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كفتة وتفورك كوجبة خفيفة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-49",
    "titleAr": "فادج بروتين بالشوكولاتة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 237,
    "protein": 21.1,
    "carbs": 10.2,
    "fats": 15,
    "prepTime": "50 دقيقة مع التبريد",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍫",
    "imageUrl": resolveProtectedUrl('recipe-49'),
    "description": "وجبة «فادج بروتين بالشوكولاتة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "فادج بروتين بالشوكولاتة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-50",
    "titleAr": "Reese’s كيتو",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 685,
    "protein": 24.1,
    "carbs": 32.6,
    "fats": 61.9,
    "prepTime": "35 دقيقة مع التجميد",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥜",
    "imageUrl": resolveProtectedUrl('recipe-50'),
    "description": "وجبة «Reese’s كيتو» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "Reese’s كيتو"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-51",
    "titleAr": "حلى الجيلاتين والطحينة مع 20غ زبدة فول سوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 266,
    "protein": 27.5,
    "carbs": 6.9,
    "fats": 15.8,
    "prepTime": "60 دقيقة مع التبريد",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍮",
    "imageUrl": resolveProtectedUrl('recipe-51'),
    "description": "وجبة «حلى الجيلاتين والطحينة مع 20غ زبدة فول سوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "حلى الجيلاتين والطحينة مع 20غ زبدة فول سوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-52",
    "titleAr": "حلى الجيلاتين والطحينة مع 25غ زبدة فول سوداني",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 296,
    "protein": 28.8,
    "carbs": 7.9,
    "fats": 18.3,
    "prepTime": "60 دقيقة مع التبريد",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍮",
    "imageUrl": resolveProtectedUrl('recipe-52'),
    "description": "وجبة «حلى الجيلاتين والطحينة مع 25غ زبدة فول سوداني» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "حلى الجيلاتين والطحينة مع 25غ زبدة فول سوداني"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-53",
    "titleAr": "كرات طاقة كيتو",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 304,
    "protein": 12.8,
    "carbs": 13.2,
    "fats": 25.9,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥥",
    "imageUrl": resolveProtectedUrl('recipe-53'),
    "description": "وجبة «كرات طاقة كيتو» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كرات طاقة كيتو"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-54",
    "titleAr": "Mug Cake كيتو شوكولاتة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 179,
    "protein": 19.7,
    "carbs": 4.4,
    "fats": 10.1,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "☕",
    "imageUrl": resolveProtectedUrl('recipe-54'),
    "description": "وجبة «Mug Cake كيتو شوكولاتة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "Mug Cake كيتو شوكولاتة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-55",
    "titleAr": "Mug Cake كيتو فانيلا",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 167,
    "protein": 18.7,
    "carbs": 1.5,
    "fats": 9.4,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "☕",
    "imageUrl": resolveProtectedUrl('recipe-55'),
    "description": "وجبة «Mug Cake كيتو فانيلا» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "Mug Cake كيتو فانيلا"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-56",
    "titleAr": "حلى بياض البيض وجوز الهند",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 432,
    "protein": 27.5,
    "carbs": 30,
    "fats": 24.1,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥥",
    "imageUrl": resolveProtectedUrl('recipe-56'),
    "description": "وجبة «حلى بياض البيض وجوز الهند» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "حلى بياض البيض وجوز الهند"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-57",
    "titleAr": "سناك شوكولاتة بروتين",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 305,
    "protein": 32.4,
    "carbs": 6.3,
    "fats": 17.6,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍫",
    "imageUrl": resolveProtectedUrl('recipe-57'),
    "description": "وجبة «سناك شوكولاتة بروتين» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "سناك شوكولاتة بروتين"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-58",
    "titleAr": "كيكة SynPro السريعة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 192,
    "protein": 29.1,
    "carbs": 3.5,
    "fats": 6.8,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍰",
    "imageUrl": resolveProtectedUrl('recipe-58'),
    "description": "وجبة «كيكة SynPro السريعة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة SynPro السريعة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-59",
    "titleAr": "كيكة أو سلاشي بروتين بالشوكولاتة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 280,
    "protein": 32.1,
    "carbs": 5.2,
    "fats": 15.2,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥤",
    "imageUrl": resolveProtectedUrl('recipe-59'),
    "description": "وجبة «كيكة أو سلاشي بروتين بالشوكولاتة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة أو سلاشي بروتين بالشوكولاتة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-60",
    "titleAr": "كيكة البروتين بالتفورك",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 183,
    "protein": 26.9,
    "carbs": 2.5,
    "fats": 6.4,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍰",
    "imageUrl": resolveProtectedUrl('recipe-60'),
    "description": "وجبة «كيكة البروتين بالتفورك» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة البروتين بالتفورك"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-61",
    "titleAr": "كيكة الشوكولاتة المنفذة فعليًا",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 356,
    "protein": 37.7,
    "carbs": 8.7,
    "fats": 20.3,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🎂",
    "imageUrl": resolveProtectedUrl('recipe-61'),
    "description": "وجبة «كيكة الشوكولاتة المنفذة فعليًا» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة الشوكولاتة المنفذة فعليًا"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-62",
    "titleAr": "كيكة بروتين بالشوكولاتة والجوز",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 295,
    "protein": 34.4,
    "carbs": 7.5,
    "fats": 15.6,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍰",
    "imageUrl": resolveProtectedUrl('recipe-62'),
    "description": "وجبة «كيكة بروتين بالشوكولاتة والجوز» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة بروتين بالشوكولاتة والجوز"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-63",
    "titleAr": "كيكة بروتين ببياض البيض",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 194,
    "protein": 27.9,
    "carbs": 2.9,
    "fats": 7.7,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍰",
    "imageUrl": resolveProtectedUrl('recipe-63'),
    "description": "وجبة «كيكة بروتين ببياض البيض» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة بروتين ببياض البيض"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-64",
    "titleAr": "كيكة شوكولاتة بروتين بالطحينة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 428,
    "protein": 42.1,
    "carbs": 13.4,
    "fats": 25.5,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍫",
    "imageUrl": resolveProtectedUrl('recipe-64'),
    "description": "وجبة «كيكة شوكولاتة بروتين بالطحينة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة شوكولاتة بروتين بالطحينة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-65",
    "titleAr": "كيكة شوكولاتة بروتين – 40غ Whey",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 346,
    "protein": 41.3,
    "carbs": 9.7,
    "fats": 18,
    "prepTime": "5 دقائق",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍰",
    "imageUrl": resolveProtectedUrl('recipe-65'),
    "description": "وجبة «كيكة شوكولاتة بروتين – 40غ Whey» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة شوكولاتة بروتين – 40غ Whey"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-66",
    "titleAr": "كيكة عيد الميلاد الكيتو – القاعدة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 931,
    "protein": 37.5,
    "carbs": 24.3,
    "fats": 82.4,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🎂",
    "imageUrl": resolveProtectedUrl('recipe-66'),
    "description": "وجبة «كيكة عيد الميلاد الكيتو – القاعدة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "كيكة عيد الميلاد الكيتو – القاعدة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-67",
    "titleAr": "دجاج وموزاريلا وآيسبرغ",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 598,
    "protein": 84.7,
    "carbs": 7.9,
    "fats": 23.8,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-67'),
    "description": "وجبة «دجاج وموزاريلا وآيسبرغ» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دجاج وموزاريلا وآيسبرغ"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-68",
    "titleAr": "دجاج وموزاريلا ولبنة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 670,
    "protein": 88.3,
    "carbs": 6.3,
    "fats": 30.4,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-68'),
    "description": "وجبة «دجاج وموزاريلا ولبنة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "دجاج وموزاريلا ولبنة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-69",
    "titleAr": "وجبة دجاج وبيض وموزاريلا – 190غ",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 580,
    "protein": 80.1,
    "carbs": 2.4,
    "fats": 25.5,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-69'),
    "description": "وجبة «وجبة دجاج وبيض وموزاريلا – 190غ» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "وجبة دجاج وبيض وموزاريلا – 190غ"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-70",
    "titleAr": "وجبة دجاج وبيض وموزاريلا – 200غ",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 596,
    "protein": 83.2,
    "carbs": 2.4,
    "fats": 25.9,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": resolveProtectedUrl('recipe-70'),
    "description": "وجبة «وجبة دجاج وبيض وموزاريلا – 200غ» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "وجبة دجاج وبيض وموزاريلا – 200غ"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-71",
    "titleAr": "وجبة كيتو شاورما دجاج وخضار",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 887,
    "protein": 96.2,
    "carbs": 11.9,
    "fats": 48.8,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🌯",
    "imageUrl": resolveProtectedUrl('recipe-71'),
    "description": "وجبة «وجبة كيتو شاورما دجاج وخضار» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "وجبة كيتو شاورما دجاج وخضار"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-72",
    "titleAr": "بان كيك الشوفان بالقرفة",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور وحلويات",
    "isHighProtein": false,
    "calories": "—",
    "protein": "—",
    "carbs": "—",
    "fats": "—",
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥞",
    "imageUrl": resolveProtectedUrl('recipe-72'),
    "description": "وجبة «بان كيك الشوفان بالقرفة» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بان كيك الشوفان بالقرفة"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-73",
    "titleAr": "بان كيك الشوفان والقمح الكامل",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور وحلويات",
    "isHighProtein": false,
    "calories": 228,
    "protein": 7,
    "carbs": 31,
    "fats": 9,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥞",
    "imageUrl": resolveProtectedUrl('recipe-73'),
    "description": "وجبة «بان كيك الشوفان والقمح الكامل» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بان كيك الشوفان والقمح الكامل"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  }
];
