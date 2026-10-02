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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/16d2b39c-385a-4920-ba4a-4b47f646f0b1.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/1a1e70e8-fc9d-43de-a06c-c083a38d2c66.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/2cca7084-6512-4c94-a5d6-33607815834f.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/33fff8ab-e759-4b53-b88e-6556f3590669.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/4c1a2f59-a915-436a-be61-0c008fdd7036.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/58f17f94-aa47-4b4a-873a-a1373acb396a.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/5cd1d372-55c6-4aa6-ab8b-57de4bf26ea5.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/6233536a-f72e-491d-951c-1b30a3a3fbfa.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/6b95a9f7-d46b-4a74-ab20-248a8e7274b1.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/8c11236b-730d-4265-82ad-27ead6da8107.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/9f514dce-4615-408e-aecc-ac44164dc233.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/c9ca49bb-5c3e-4bda-8ce7-5039bedb6616.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/cb519285-c2e3-463b-98a6-4f39c2601aa4.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/cd2ede6f-0128-4e48-b816-e79ee7fe06a1.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/d728d86f-a5c5-4bab-b6ba-87c9a940a058.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/da2e69f8-ff06-446d-a03a-1f712adb5335.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_bwt189bwt189bwt1.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_ggwcepggwcepggwc.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_la2pnwla2pnwla2p%20%281%29.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_la2pnwla2pnwla2p%20%282%29.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_la2pnwla2pnwla2p%20%283%29.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_la2pnwla2pnwla2p.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_yto4e3yto4e3yto4.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/Gemini_Generated_Image_n77rsfn77rsfn77r.jpg",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_16%20PM-1.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_17%20PM-2.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_18%20PM-3.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_18%20PM-4.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_19%20PM-5.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_21%20PM-6.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_22%20PM-7.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_23%20PM-8.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_06_25%20PM-9.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_10%20PM-1.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_11%20PM-2.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_13%20PM-3.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_14%20PM-4.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_16%20PM-5.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_18%20PM-6.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_19%20PM-7.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_21%20PM-8.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_22%20PM-9.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2006_17_24%20PM-10.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_35%20PM-1.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_36%20PM-2.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_38%20PM-3.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_39%20PM-4.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_41%20PM-5.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_42%20PM-6.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_44%20PM-7.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_46%20PM-8.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_48%20PM-9.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_22_49%20PM-10.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_03%20PM-1.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_04%20PM-2.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_06%20PM-3.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_07%20PM-4.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_08%20PM-5.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_10%20PM-6.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_11%20PM-7.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_13%20PM-8.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_14%20PM-9.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_40_15%20PM-10.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_32%20PM-1.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_33%20PM-2.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_34%20PM-3.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_35%20PM-4.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_36%20PM-5.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_37%20PM-6.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_38%20PM-7.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_39%20PM-8.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_40%20PM-9.png",
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
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%201%2C%202026%2C%2007_50_41%20PM-10.png",
    "description": "وجبة «بان كيك الشوفان والقمح الكامل» متوازنة ومحسوبة السعرات والماكروز لدعم أهدافك الرياضية.",
    "ingredients": [
      "بان كيك الشوفان والقمح الكامل"
    ],
    "steps": [
      "شاهد بوستر الوصفة لمتابعة المقادير وخطوات التحضير بالتفصيل."
    ]
  },
  {
    "id": "recipe-74",
    "titleAr": "بوظة البروتين الأصلية 35غ جبنة قريش",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 172,
    "protein": 30.8,
    "carbs": 2.8,
    "fats": 3.1,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍨",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_23%20PM-1.png",
    "description": "بوظة بروتين منعشة وسريعة غنية بالبروتين ومنخفضة الكارب محضرة بالوي وجبنة القريش وحليب اللوز.",
    "ingredients": [
      "30غ Whey بروتين",
      "35غ جبنة قريش (تفورك)",
      "70غ حليب لوز غير محلى",
      "ثلج كبير للخلط"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط الوي وجبنة قريش وحليب اللوز مع كمية كبيرة من الثلج في الخلاط.",
      "امزج الخليط حتى يصبح بقوام بوظة ناعم وكثيف.",
      "قدّم البوظة مباشرة في كوب أو وعاء بارد."
    ]
  },
  {
    "id": "recipe-75",
    "titleAr": "بوظة البروتين المفضلة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 211,
    "protein": 37.4,
    "carbs": 3.4,
    "fats": 3.9,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍨",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_25%20PM-2.png",
    "description": "بوظة بروتين لذيذة ومنعشة بـ 37.4غ بروتين مع إمكانية التبريد بالفريزر لقوام متماسك.",
    "ingredients": [
      "35غ Whey بروتين",
      "50غ جبنة قريش",
      "60غ حليب لوز غير محلى",
      "كمية كبيرة من الثلج"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط الوي والجبنة القريش وحليب اللوز مع كمية كبيرة من الثلج.",
      "يمكن وضعها في الفريزر 30 - 45 دقيقة اختيارياً لزيادة التماسك.",
      "قدّمها مباشرة كبوظة بروتين باردة."
    ]
  },
  {
    "id": "recipe-76",
    "titleAr": "بوظة البروتين 50غ جبنة قريش",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 194,
    "protein": 33.4,
    "carbs": 3.2,
    "fats": 3.9,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍨",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_27%20PM-3.png",
    "description": "بوظة بروتين صحية مناسبة للكيتو ومنخفضة الكارب بقوام كريمي كثيف ونكهة رائعة.",
    "ingredients": [
      "30غ Whey بروتين",
      "50غ جبنة قريش",
      "70غ حليب لوز غير محلى",
      "ثلج كبير للخلط"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "أضف الوي والجبنة القريش وحليب اللوز والثلج في الخلاط.",
      "اخلطها حتى يصبح القوام كريميًا كثيفًا.",
      "قدّمها فورًا كبوظة بروتين باردة."
    ]
  },
  {
    "id": "recipe-77",
    "titleAr": "بوظة البروتين 50غ جبنة قريش + Xanthan",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 194,
    "protein": 33.4,
    "carbs": 3.7,
    "fats": 3.9,
    "prepTime": "10 دقائق",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍨",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_30%20PM-4.png",
    "description": "بوظة بروتين متماسكة وكريمية غنية بالبروتين باستخدام صمغ الزانثان لقوام مثالي.",
    "ingredients": [
      "30غ Whey بروتين",
      "50غ جبنة قريش",
      "70غ حليب لوز غير محلى",
      "0.5غ صمغ الزانثان (Xanthan Gum)",
      "ثلج كبير للخلط"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "أضف جميع المكونات مع الثلج إلى الخلاط.",
      "اخلطها جيدًا حتى يصبح القوام أكثر تماسكًا بفضل الزانثان.",
      "قدّمها مباشرة كبوظة بروتين باردة وكريمية."
    ]
  },
  {
    "id": "recipe-78",
    "titleAr": "كفتة وجبنة قريش كوجبة خفيفة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 415,
    "protein": 40.2,
    "carbs": 4.2,
    "fats": 25.8,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🥩",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_32%20PM-5.png",
    "description": "وجبة مشبعة ومتوازنة من كفتة كتف العجل المحمرة بالزبدة مع الجبنة القريش وخس الآيسبرغ المقرمش.",
    "ingredients": [
      "120غ كفتة كتف عجل مطبوخة",
      "50غ جبنة قريش",
      "50غ خس آيسبرغ",
      "5غ زبدة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "سخّن الكفتة بالزبدة في المقلاة.",
      "جهّز الجبنة القريش والخس بجانب الكفتة.",
      "قدّم الوجبة كطبق خفيف متوازن غني بالبروتين."
    ]
  },
  {
    "id": "recipe-79",
    "titleAr": "كيكة البروتين بجبنة القريش",
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
    "servings": "حصة واحدة",
    "image": "🧁",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_36%20PM-6.png",
    "description": "كيكة بروتين سريعة بالميكروويف في دقيقة واحدة، منخفضة الكارب وغنية بـ 26.9غ بروتين.",
    "ingredients": [
      "20غ Whey بروتين",
      "50غ بيض كامل",
      "25غ جبنة قريش",
      "1.5غ بيكنج باودر"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط الوي والبيض والجبنة القريش والبيكنج باودر جيداً.",
      "اطبخها في الميكروويف لمدة 60-70 ثانية.",
      "أضف 10 ثوانٍ عند الحاجة ثم قدمها بعد أن تتماسك."
    ]
  },
  {
    "id": "recipe-80",
    "titleAr": "بان كيك اللوز والقريش والواي",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 312,
    "protein": 25.3,
    "carbs": 9.5,
    "fats": 21.1,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "حصتان",
    "image": "🥞",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_37%20PM-7.png",
    "description": "بان كيك عالي البروتين وصحي مصنوع من دقيق اللوز والجبنة القريش وبروتين الواي ومناسب للفطور.",
    "ingredients": [
      "1/2 كوب دقيق لوز",
      "2 ملعقة كبيرة Whey أو WPI",
      "1/2 كوب جبنة قريش",
      "2 بيض كبير",
      "1 ملعقة صغيرة بيكنج باودر",
      "إضافات اختيارية: توت أزرق، زبادي يوناني، شراب القيقب، قرفة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط دقيق اللوز والواي والجبنة القريش والبيض والبيكنج باودر.",
      "اطْهِ الخليط على نار منخفضة إلى متوسطة نحو دقيقتين لكل جانب.",
      "احصل على 5-6 قطع وقدمها مع الإضافات الاختيارية عند الرغبة."
    ]
  },
  {
    "id": "recipe-81",
    "titleAr": "كيك الشوفان والموز المخبوز",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 400,
    "protein": 13,
    "carbs": 73,
    "fats": 9,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🥧",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_39%20PM-8.png",
    "description": "كيك مخبوز صحي غني بالألياف والطاقة من الشوفان والموز وشراب القيقب الطبيعي.",
    "ingredients": [
      "1/2 كوب شوفان",
      "1 موزة ناضجة",
      "1 بيضة كبيرة",
      "1 ملعقة كبيرة شراب القيقب",
      "1/2 ملعقة صغيرة بيكنج باودر",
      "رشة ملح",
      "بخاخ طبخ",
      "1 ملعقة كبيرة كاكاو (اختياري)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اطحن الشوفان والموز والبيض والشراب والبيكنج باودر حتى يتجانس.",
      "صب الخليط في قالب صغير مدهون بالرش واخبزه عند 177°م لمدة 20-25 دقيقة.",
      "قدمه دافئاً أو بارداً بعد اكتمال النضج."
    ]
  },
  {
    "id": "recipe-82",
    "titleAr": "دجاج الترياكي والبروكلي مع صوص الفول السوداني",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 517,
    "protein": 81.3,
    "carbs": 7.3,
    "fats": 16.9,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_42%20PM-9.png",
    "description": "وجبة ضخمة البروتين بـ 81.3غ بروتين من صدور الدجاج وصوص الترياكي والبروكلي مع صوص الفول السوداني.",
    "ingredients": [
      "صدرا دجاج مقطعة قطعاً كبيرة",
      "100غ بروكلي (Tenderstem)",
      "1 فص ثوم مهروس",
      "1 ملعقة صغيرة زيت جوز الهند",
      "دفقة من صلصة الترياكي",
      "1 ملعقة كبيرة زبدة فول سوداني",
      "دفقة ماء ساخن"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "قلّب الثوم والدجاج بزيت جوز الهند حتى النضج.",
      "أضف البروكلي وقلّب لمدة 3 دقائق مع دفقة من صلصة الترياكي.",
      "خفّف زبدة الفول السوداني بالماء الساخن وقدّمها بجانب الدجاج."
    ]
  },
  {
    "id": "recipe-83",
    "titleAr": "سلطة الخس والجوز والشوفان والمانجو",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 290,
    "protein": 4.4,
    "carbs": 19,
    "fats": 23.2,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "طبق سلطة كبير",
    "image": "🥗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_44%20PM-10.png",
    "description": "سلطة غنية بالدهون الصحية والألياف تجمع بين الخس المشكل، قطع المانجو الطازجة، الجوز المحمص، والشوفان وتتبيلة خردل ديجون وزيت الزيتون.",
    "ingredients": [
      "1 مانجو طازجة مقطعة مكعبات",
      "1/4 كوب شوفان كويكر محمص",
      "1/4 كوب بذور عباد الشمس",
      "1/2 كوب جوز محمص ومقطع",
      "1/2 كوب أوريجانو",
      "6 أكواب من أنواع مختلفة من الخس",
      "1 ملعقة كبيرة عصير برتقال",
      "1/4 كوب زيت زيتون",
      "1/4 كوب جوز مفروم محمص",
      "2 ملعقة كبيرة عصير ليمون",
      "1 فص ثوم",
      "1/4 ملعقة صغيرة ملح",
      "رشة فلفل أسود",
      "1 ملعقة صغيرة خردل ديجون"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اطحن أو اخلط مكونات التتبيلة جيداً.",
      "اخلط التتبيلة مع الخس والشوفان والمكسرات.",
      "زيّن السلطة بمكعبات المانجو وقدّمها طازجة."
    ]
  }
];
