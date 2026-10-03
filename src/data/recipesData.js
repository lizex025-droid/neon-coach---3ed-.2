/**
 * NEON COACH - قاعدة بيانات الوصفات الصحية والرياضية
 * وصفات محسوبة السعرات والماكروز بدقة، مصنفة حسب الوجبات ونوع الهدف
 */

export const RECIPE_CATEGORIES = [
  {
    "id": "all",
    "label": "الكل",
    "icon": "✨"
  },
  {
    "id": "favorites",
    "label": "المفضلة",
    "icon": "🤍"
  },
  {
    "id": "high_protein",
    "label": "عالي البروتين",
    "icon": "💪"
  },
  {
    "id": "main_dishes",
    "label": "وجبات رئيسية",
    "icon": "🍗"
  },
  {
    "id": "salads",
    "label": "سلطات",
    "icon": "🥗"
  },
  {
    "id": "breakfast",
    "label": "فطور ومخبوزات",
    "icon": "🍳"
  },
  {
    "id": "soups",
    "label": "شوربات",
    "icon": "🥣"
  },
  {
    "id": "sandwiches",
    "label": "ساندويتشات",
    "icon": "🥪"
  },
  {
    "id": "snacks_dessert",
    "label": "سناك وحلويات",
    "icon": "🍪"
  },
  {
    "id": "drinks_smoothies",
    "label": "مشروبات وسموثي",
    "icon": "🥤"
  },
  {
    "id": "appetizers_dips",
    "label": "مقبلات وصوصات",
    "icon": "🥑"
  }
];

export const RECIPES_DATA = [
  {
    "id": "recipe-1",
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
    "id": "recipe-2",
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
    "id": "recipe-3",
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
    "id": "recipe-4",
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
    "id": "recipe-5",
    "titleAr": "سالمون مشوي بالعسل والصويا",
    "titleEn": "Grilled Salmon",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 311,
    "protein": 34,
    "carbs": 10,
    "fats": 14,
    "prepTime": "37 دقيقة",
    "difficulty": "سهل",
    "servings": "4 حصص",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_20%20PM-9.png",
    "description": "وجبة «سالمون مشوي بالعسل والصويا» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "2 tablespoons honey",
      "1 tablespoon soy sauce",
      "1 tablespoon olive oil",
      "1 tablespoon lemon juice",
      "1 teaspoon Dijon mustard",
      "½ teaspoon paprika",
      "½ teaspoon garlic powder",
      "½ teaspoon salt",
      "½ teaspoon black pepper",
      "4 (6-ounce) salmon fillets with skin",
      "Lemon wedges and fresh parsley for garnish (اختياري)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اخلط مكونات التتبيلة وانقع السالمون 20 دقيقة.",
      "اشوه على حرارة متوسطة مرتفعة 4–5 دقائق من جهة الجلد.",
      "3–4 دقائق من الجهة الأخرى حتى النضج.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-6",
    "titleAr": "بان كيك الجوكر",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 350,
    "protein": 55,
    "carbs": 24,
    "fats": 6,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_16%20PM-3.png",
    "description": "وجبة «بان كيك الجوكر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "6 بياض بيض",
      "2 ملعقة كبيرة شوفان",
      "نصف ملعقة صغيرة قرفة",
      "فانيليا حسب الرغبة",
      "30غ Whey",
      "5غ كاكاو غير محلى",
      "حليب سائل للقوام، الكمية غير محددة",
      "زبدة فول سوداني اختيارية",
      "بخاخ زيت اختياري"
    ],
    "steps": [
      "افصل بياض ست بيضات واخفقه حتى يصبح رغويًا ومتماسكًا.",
      "أضف الشوفان والقرفة ونصف كمية الواي ببطء مع استمرار الخفق الهادئ.",
      "حضّر الصوص من بقية الواي والكاكاو والفانيليا وقليل من الحليب حتى يصبح لزجًا.",
      "رش مقلاة غير لاصقة بقليل من الزيت واطهِ البان كيك على الوجهين حتى يتحمر.",
      "قدّم البان كيك مع صوص البروتين."
    ]
  },
  {
    "id": "recipe-7",
    "titleAr": "بان كيك صحي",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 12,
    "carbs": 46,
    "fats": 11,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_19%20PM-4.png",
    "description": "وجبة «بان كيك صحي» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "40غ دقيق أو شوفان",
      "بيضة",
      "لبن وفانيلا وBaking Powder ومحلي",
      "7غ سمن",
      "تفاح أو موز للتزيين"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات وتطهى على المقلاة، ويضاف تزيين الفاكهة والقرفة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-8",
    "titleAr": "بطاطس بالمشروم والبروكلي",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 17,
    "carbs": 43.1,
    "fats": 9.6,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_35%20PM-5.png",
    "description": "وجبة «بطاطس بالمشروم والبروكلي» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "160غ بطاطس مسلوقة",
      "100غ بروكلي",
      "80غ مشروم",
      "20غ شيدر قليل الدسم",
      "20غ بارميزان"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تفرغ البطاطا وتحشى بالخضار والجبن.",
      "تخبز 7-8 دقائق.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-9",
    "titleAr": "بيض بالجبن القريش",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 22,
    "carbs": 5.7,
    "fats": 22.2,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_37%20PM-6.png",
    "description": "وجبة «بيض بالجبن القريش» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "2 بيضة",
      "90غ جبنة قريش أو بلدية",
      "10غ زيت أو زبدة",
      "ثوم وملح وفلفل"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يخلط البيض والجبنة ويطهى الخليط في المقلاة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-10",
    "titleAr": "شوربة الدجاج بالشوفان والذرة",
    "titleEn": "",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": false,
    "calories": 235,
    "protein": 13.7,
    "carbs": 39.3,
    "fats": 3.2,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_03%20PM-2.png",
    "description": "وجبة «شوربة الدجاج بالشوفان والذرة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "30غ شوفان",
      "15غ حليب بودرة",
      "40غ ذرة",
      "4 أكواب ماء أو مرق",
      "شوربة دجاج"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات على البارد.",
      "تغلى وتطهى 15 دقيقة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-11",
    "titleAr": "الدجاج المكسيكي",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 380,
    "protein": 36.8,
    "carbs": 7.6,
    "fats": 22.4,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_12%20PM-7.png",
    "description": "وجبة «الدجاج المكسيكي» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "100غ دجاج",
      "15مل زيت ذرة",
      "80غ فلفل ألوان",
      "80غ مشروم",
      "10غ شيدر"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج ويشوى مع الخضار ويقدم مع الشيدر.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-12",
    "titleAr": "صدر دجاج بالنكهة الإيطالية",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 448,
    "protein": 36.1,
    "carbs": 34.3,
    "fats": 17.7,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_17%20PM-10.png",
    "description": "وجبة «صدر دجاج بالنكهة الإيطالية» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "100غ صدر دجاج",
      "100غ بصل",
      "10مل زيت ذرة",
      "50غ خبز تورتيلا"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج والبصل ويخبزان.",
      "يقدمان مع خبز التورتيلا.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-13",
    "titleAr": "أرز بالخضار مع دجاج بصلصة الشوي والصويا",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 855,
    "protein": 82.3,
    "carbs": 58.6,
    "fats": 30.8,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_49%20PM-3.png",
    "description": "وجبة «أرز بالخضار مع دجاج بصلصة الشوي والصويا» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "380غ دجاج قبل الطبخ أو 270غ بعده مع الجلد",
      "30غ أرز قبل الطبخ أو 80غ بعده",
      "300غ خضار"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يخبز الدجاج في الصلصة ويقدم مع أرز مطبوخ بالخضار.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-14",
    "titleAr": "أفخاذ دجاج مع المعكرونة بالصلصة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 897,
    "protein": 71.6,
    "carbs": 50.7,
    "fats": 48.7,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_51%20PM-4.png",
    "description": "وجبة «أفخاذ دجاج مع المعكرونة بالصلصة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "450غ فخذ دجاج مع الجلد والعظم قبل الطبخ",
      "45غ معكرونة قبل الطبخ",
      "10غ زيت",
      "طماطم وبصل وثوم ومعجون طماطم وتوابل"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج ويخبز مغطى.",
      "يحمر.",
      "تحضر صلصة الطماطم بالزيت وتطهى معها المعكرونة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-15",
    "titleAr": "الكبدة الإسكندراني",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 667,
    "protein": 63.2,
    "carbs": 28.1,
    "fats": 33.3,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_55%20PM-6.png",
    "description": "وجبة «الكبدة الإسكندراني» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "380غ كبدة قبل الطبخ",
      "20غ زيت",
      "ثوم وفلفل وخل وكمون وكزبرة وليمون"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تشوح الكبدة والثوم بالزيت.",
      "يضاف الفلفل والمنكهات حتى النضج.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-16",
    "titleAr": "ترياكي الدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 958,
    "protein": 80.8,
    "carbs": 68.1,
    "fats": 40,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_56%20PM-7.png",
    "description": "وجبة «ترياكي الدجاج» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "260غ دجاج",
      "160غ أناناس",
      "240غ فلفل ملون",
      "60مل صويا قليلة الصوديوم",
      "20مل خل أرز",
      "20غ عسل",
      "10غ زيت",
      "80غ ثوم مهروس"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يشوح الدجاج والثوم.",
      "تضاف الصلصات والفلفل والأناناس حتى النضج.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-17",
    "titleAr": "دجاج بالخضراوات",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 728,
    "protein": 79.9,
    "carbs": 30.5,
    "fats": 30.4,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_59%20PM-9.png",
    "description": "وجبة «دجاج بالخضراوات» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "420غ دجاج فخذ وصدر قبل الطبخ أو 270غ بعده",
      "200-300غ خضار مطبوخة",
      "صويا حلوة أو دبس رمان ومعجون طماطم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج ويخبز 45 دقيقة على 180° ويقدم مع الخضار.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-18",
    "titleAr": "سباغيتي باللحم",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 722,
    "protein": 87.4,
    "carbs": 43.1,
    "fats": 20,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_21%20PM-1.png",
    "description": "وجبة «سباغيتي باللحم» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "380غ لحم مفروم ≤3% دهن قبل الطبخ",
      "40غ معكرونة قبل الطبخ",
      "طماطم وبصل وثوم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يطهى اللحم دون زيت مع صلصة الطماطم ويقدم فوق السباغيتي المسلوقة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-19",
    "titleAr": "صدور دجاج مشوية مع شوربة الشوفان",
    "titleEn": "",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 618,
    "protein": 86.1,
    "carbs": 35.9,
    "fats": 12.5,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_30%20PM-6.png",
    "description": "وجبة «صدور دجاج مشوية مع شوربة الشوفان» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "360غ صدر دجاج قبل الطبخ أو 250غ بعده",
      "50غ شوفان قبل الطبخ",
      "10غ كاتشب"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يشوى الدجاج بالتتبيلة المختارة ويطبخ الشوفان بالماء والبهارات كشوربة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-20",
    "titleAr": "صينية بطاطس بالكفتة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 878,
    "protein": 86.9,
    "carbs": 50.9,
    "fats": 40.3,
    "prepTime": "45 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🥘",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_36%20PM-10.png",
    "description": "صينية بطاطس بالكفتة في الفرن بنكهة شرقية أصيلة وبروتين عالٍ لدعم أهدافك البدنية.",
    "ingredients": [
      "370 غ كفتة لحم 3% دسم (قبل الطبخ)",
      "100 غ بطاطا",
      "150 غ بصل",
      "150 غ بندورة",
      "50 غ فلفل",
      "10 غ زيت",
      "صلصة طماطم (ضمن الوصفة)"
    ],
    "steps": [
      "جهّز جميع المكونات.",
      "رتّب البطاطا والكفتة والبصل والبندورة والفلفل في صينية.",
      "أضف الزيت والصلصة ثم اخبز نحو 40 دقيقة حتى تنضج.",
      "قدّم الصينية ساخنة."
    ]
  },
  {
    "id": "recipe-21",
    "titleAr": "فوتشيني صحي",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 707,
    "protein": 92.6,
    "carbs": 46.2,
    "fats": 15.7,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍝",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_36_03%20PM-6.png",
    "description": "فوتشيني ألفريدو بصلصة بيضاء صحية وقطع الدجاج المشوي بدون كريمة ثقيلة.",
    "ingredients": [
      "320 غ صدر دجاج",
      "34 غ معكرونة فوتشيني جافة",
      "250 غ حليب قليل الدسم",
      "10 غ دقيق",
      "20 غ جبنة لايت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "حضّر صلصة بشاميل خفيفة من الحليب والدقيق والجبنة.",
      "اشوِ الدجاج واسلق الفوتشيني ثم اخلطهما مع الصلصة.",
      "قدّم الفوتشيني الصحي ساخنًا."
    ]
  },
  {
    "id": "recipe-22",
    "titleAr": "كبسة الدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 796,
    "protein": 87.6,
    "carbs": 48.8,
    "fats": 27.6,
    "prepTime": "40 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_36_08%20PM-9.png",
    "description": "كبسة دجاج شرقية أصيلة محسوبة الماكروز بنكهة التوابل واللومي والأرز طويل الحبة.",
    "ingredients": [
      "400 غ دجاج فخذ وصدر",
      "35 غ أرز",
      "10 غ زيت",
      "60 غ بصل",
      "80 غ جزر",
      "100 غ طماطم أو صلصة طماطم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اطبخ الدجاج مع البصل والجزر والطماطم وبهارات الكبسة.",
      "أضف الأرز إلى المرق واطبخه حتى ينضج ثم أعد الدجاج.",
      "قدّم الكبسة ساخنة."
    ]
  },
  {
    "id": "recipe-23",
    "titleAr": "كبسة دجاج وبطاطا",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 895,
    "protein": 87.5,
    "carbs": 67.6,
    "fats": 31.8,
    "prepTime": "45 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_36_10%20PM-10.png",
    "description": "كبسة الدجاج مع قطع البطاطا الذهبية لنكهة غنية ومصدر كربوهيدرات معقدة يدعم تدريبك.",
    "ingredients": [
      "420 غ دجاج دون جلد",
      "48 غ أرز",
      "100 غ بطاطا",
      "10 غ زيت",
      "100 غ طماطم أو صلصة طماطم",
      "50 غ بصل"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اطبخ الدجاج مع بهارات الكبسة والبصل والطماطم.",
      "أضف البطاطا والأرز إلى المرق واتركها تنضج.",
      "قدّم كبسة الدجاج والبطاطا ساخنة."
    ]
  },
  {
    "id": "recipe-24",
    "titleAr": "مجدرة الأرز والعدس",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 669,
    "protein": 54.2,
    "carbs": 83.5,
    "fats": 14.3,
    "prepTime": "35 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍲",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_29%20AM-1.png",
    "description": "مجدرة الأرز والعدس الكلاسيكية بنكهة الكمون وصلصة الطماطم مع تعزيز بروتيني مدروس.",
    "ingredients": [
      "50 غ عدس جاف",
      "50 غ أرز جاف",
      "10 غ زيت زيتون",
      "120 غ صلصة طماطم",
      "45 غ Whey"
    ],
    "steps": [
      "اسلق العدس حتى يلين نصف استواء.",
      "أضف الأرز واطهه مع العدس حتى ينضجا.",
      "سخّن صلصة الطماطم وامزجها مع الطبق أو قدّمها فوقه.",
      "قدّم المجدرة ساخنة، ويمكن تناول الواي كمكمل جانبي حسب الخطة."
    ]
  },
  {
    "id": "recipe-25",
    "titleAr": "معكرونة بالتونة والخضروات",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 655,
    "protein": 98.3,
    "carbs": 44.7,
    "fats": 8.7,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍝",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_30%20AM-2.png",
    "description": "باستا بالتونة والخضار مع جبنة خفيفة، وجبة سريعة التحضير وعالية البروتين بعد التمرين.",
    "ingredients": [
      "220 غ تونة مصفاة",
      "30 غ Whey",
      "40 غ معكرونة جافة",
      "40 غ جبنة لايت",
      "150 غ خضار مشكلة"
    ],
    "steps": [
      "اسلق المعكرونة حتى تنضج.",
      "حضّر الخضار في مقلاة خفيفة حتى تطرى.",
      "أضف التونة والمعكرونة والجبنة وقلّب المزيج.",
      "قدّم الطبق ساخنًا، ويمكن تناول الواي ضمن الوجبة أو كمكمل جانبي."
    ]
  },
  {
    "id": "recipe-26",
    "titleAr": "معكرونة بالجبن وصدور الدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 697,
    "protein": 93.9,
    "carbs": 43.2,
    "fats": 14.9,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍝",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_32%20AM-3.png",
    "description": "باستا كريمية بصدور الدجاج والجبن الخفيف، قوام كريمي رائع بدون دهون زائدة.",
    "ingredients": [
      "330 غ صدر دجاج نيء",
      "30 غ معكرونة جافة",
      "20 غ جبنة لايت",
      "250 غ حليب قليل الدسم",
      "10 غ دقيق"
    ],
    "steps": [
      "شوّح الدجاج حتى ينضج.",
      "أضف الدقيق ثم الحليب وحرّك حتى تتكون صلصة خفيفة.",
      "اسلق المعكرونة وأضفها مع الجبنة إلى الصلصة.",
      "قلّب جيدًا وقدّمها ساخنة."
    ]
  },
  {
    "id": "recipe-27",
    "titleAr": "معكرونة بالخضروات وقطع الدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 996,
    "protein": 107.5,
    "carbs": 74.2,
    "fats": 29.2,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍝",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_34%20AM-4.png",
    "description": "طبق معكرونة غني بالخضار والدجاج المشوّح مع صوص كريمي خفيف لوجبة تضخيم مثالية.",
    "ingredients": [
      "380 غ صدر دجاج نيء",
      "37 غ معكرونة جافة",
      "300 غ خضار",
      "10 غ زيت",
      "15 غ دقيق",
      "200 غ حليب قليل الدسم",
      "50 غ كريمة طبخ خفيفة"
    ],
    "steps": [
      "شوّح الدجاج والخضار في الزيت.",
      "أضف الدقيق ثم الحليب والكريمة مع التحريك.",
      "اسلق المعكرونة وأضفها إلى الصلصة.",
      "قلّب حتى تتجانس وقدّمها ساخنة."
    ]
  },
  {
    "id": "recipe-28",
    "titleAr": "معكرونة بشاميل باللحم المفروم",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 829,
    "protein": 89.6,
    "carbs": 61.5,
    "fats": 22.1,
    "prepTime": "40 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🥘",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_36%20AM-5.png",
    "description": "صينية مكرونة بشاميل صحية باللحم المفروم البقري قليل الدسم وبشاميل خفيف بدون زبدة مفرطة.",
    "ingredients": [
      "350 غ لحم مفروم قليل الدهن",
      "30 غ دقيق",
      "35 غ معكرونة جافة",
      "250 غ حليب قليل الدسم"
    ],
    "steps": [
      "اطهِ اللحم المفروم حتى ينضج.",
      "حضّر صلصة البشاميل من الدقيق والحليب.",
      "اسلق المعكرونة واخلطها مع اللحم والبشاميل.",
      "اخبزها أو قدّمها بعد التحمير الخفيف."
    ]
  },
  {
    "id": "recipe-29",
    "titleAr": "مقلوبة الدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 799,
    "protein": 107.5,
    "carbs": 59.4,
    "fats": 13,
    "prepTime": "45 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍲",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_38%20AM-6.png",
    "description": "مقلوبة الدجاج الفلسطينية الشهيرة بنسخة صحية من صدور الدجاج والخضار المشوية وحمص الشام.",
    "ingredients": [
      "420 غ صدر دجاج نيء",
      "40 غ أرز جاف",
      "140 غ خضار مشكلة",
      "50 غ حمص مسلوق",
      "100 غ طماطم"
    ],
    "steps": [
      "اسلق الدجاج حتى ينضج.",
      "اشوِ الخضار ورتّبها مع الدجاج والحمص.",
      "أضف الأرز والمرق ثم اطهُ الطبق حتى يكتمل.",
      "اقلب المقلوبة وقدّمها ساخنة."
    ]
  },
  {
    "id": "recipe-30",
    "titleAr": "بان كيك كيتو قليل جدًا بالكارب",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 315,
    "protein": 33.6,
    "carbs": 7.4,
    "fats": 18.3,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🥞",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_39%20AM-7.png",
    "description": "بان كيك كيتو منخفض الكربوهيدرات محضر بدقيق اللوز والواي لفطور بروتيني مثالي.",
    "ingredients": [
      "30 غ Whey",
      "50 غ بيض كامل",
      "15 غ طحين لوز",
      "3 غ Baking Powder",
      "60 غ ماء",
      "5 غ زبدة"
    ],
    "steps": [
      "اخلط الواي والبيض وطحين اللوز والبايكينغ باودر.",
      "أضف الماء وحرّك حتى يصبح الخليط ناعمًا.",
      "سخّن المقلاة مع الزبدة واسكب الخليط.",
      "اطهِ البان كيك وقدّمه دافئًا."
    ]
  },
  {
    "id": "recipe-31",
    "titleAr": "تتبيلة الجمبري",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 341,
    "protein": 61,
    "carbs": 5.5,
    "fats": 9.3,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍤",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_43%20AM-9.png",
    "description": "جمبري متبل بالثوم والليمون والبابريكا مطهو بلمسة زبدة خفيفة، بروتين صافٍ ونكهة بحرية منعشة.",
    "ingredients": [
      "250 غ جمبري",
      "10 غ زبدة",
      "20 غ عصير ليمون",
      "6 غ ثوم",
      "2 غ بابريكا",
      "1 غ شطة"
    ],
    "steps": [
      "اخلط عصير الليمون مع الثوم والبابريكا والشطة.",
      "غطّ الجمبري بالتتبيلة واتركه قليلًا.",
      "سخّن الزبدة في المقلاة.",
      "اطهِ الجمبري حتى ينضج وقدّمه مباشرة."
    ]
  },
  {
    "id": "recipe-32",
    "titleAr": "تتبيلة سالمون بالمقلاة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 402,
    "protein": 30.9,
    "carbs": 3.4,
    "fats": 28.1,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🐟",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_44%20AM-10.png",
    "description": "قطعة سالمون مشوية في المقلاة بصوص الليمون والمستردة والشبت غنية بدهون الأوميغا 3 المفيدة.",
    "ingredients": [
      "150 غ سالمون",
      "10 غ زبدة",
      "15 غ عصير ليمون",
      "5 غ ثوم",
      "10 غ مسترد",
      "2 غ شبت"
    ],
    "steps": [
      "اخلط الليمون والثوم والمسترد والشبت.",
      "غطّ السالمون بالتتبيلة.",
      "سخّن الزبدة في المقلاة واطهِ السالمون.",
      "قدّمه مع الصوص المتبقي وهو ساخن."
    ]
  },
  {
    "id": "recipe-33",
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
    "id": "recipe-34",
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
    "id": "recipe-35",
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
    "id": "recipe-36",
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
    "id": "recipe-37",
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
    "id": "recipe-38",
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
    "id": "recipe-39",
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
    "id": "recipe-40",
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
    "id": "recipe-41",
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
    "id": "recipe-42",
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
    "id": "recipe-43",
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
    "id": "recipe-44",
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
    "id": "recipe-45",
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
    "id": "recipe-46",
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
    "id": "recipe-47",
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
    "id": "recipe-48",
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
    "id": "recipe-49",
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
    "id": "recipe-50",
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
    "id": "recipe-51",
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
    "id": "recipe-52",
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
    "id": "recipe-53",
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
    "id": "recipe-54",
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
    "id": "recipe-55",
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
    "id": "recipe-56",
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
    "id": "recipe-57",
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
    "id": "recipe-58",
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
    "id": "recipe-59",
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
    "id": "recipe-60",
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
      "35غ جبنة قريش",
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
    "id": "recipe-61",
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
    "image": "🍦",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_25%20PM-2.png",
    "description": "النسخة المفضلة من بوظة البروتين بقوام كريمي فائق ونسبة بروتين 37.4غ مع بذور الشيا.",
    "ingredients": [
      "40غ Whey بروتين",
      "35غ جبنة قريش",
      "70غ حليب لوز غير محلى",
      "3غ بذور شيا",
      "ثلج كبير"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط البروتين وجبنة القريش وحليب اللوز وبذور الشيا والثلج في الخلاط.",
      "اخلط على سرعة عالية حتى يصبح القوام كريمياً متجانساً.",
      "قدّمها فوراً واستمتع بوجبة سناك منعشة."
    ]
  },
  {
    "id": "recipe-62",
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
    "description": "بوظة بروتين كريمية مدعمة بـ 50غ جبنة قريش لزيادة الكازين والشبع.",
    "ingredients": [
      "30غ Whey بروتين",
      "50غ جبنة قريش",
      "70غ حليب لوز غير محلى",
      "ثلج كبير"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "ضع البروتين والجبنة القريش وحليب اللوز والثلج في الخلاط.",
      "اخلط حتى يتكون قوام بوظة ناعم وثقيل.",
      "اسكبها في وعاء التقديم وتناولها مباشرة."
    ]
  },
  {
    "id": "recipe-63",
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
    "image": "🍦",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_30%20PM-4.png",
    "description": "بوظة بروتين مثالية القوام باستخدام صمغ الزانثان والجبنة القريش لملمس مثل الآيس كريم التجاري.",
    "ingredients": [
      "30غ Whey بروتين",
      "50غ جبنة قريش",
      "70غ حليب لوز غير محلى",
      "1غ صمغ الزانثان (Xanthan Gum)",
      "ثلج كبير"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط البروتين والجبنة وحليب اللوز والزانثان والثلج.",
      "اخلط بقوة حتى يتضاعف حجم الخليط ويصبح كثيفاً ومطاطياً كالآيس كريم.",
      "قدّمها فوراً في كأس بارد."
    ]
  },
  {
    "id": "recipe-64",
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
    "id": "recipe-65",
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
    "id": "recipe-66",
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
    "id": "recipe-67",
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
    "id": "recipe-68",
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
    "id": "recipe-69",
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
    "id": "recipe-70",
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
    "id": "recipe-71",
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
    "id": "recipe-72",
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
    "id": "recipe-73",
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
    "id": "recipe-74",
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
    "id": "recipe-75",
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
    "id": "recipe-76",
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
    "id": "recipe-77",
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
    "id": "recipe-78",
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
    "id": "recipe-79",
    "titleAr": "كفتة وجبنة قريش كوجبة خفيفة",
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
    "servings": "حصة واحدة",
    "image": "🍢",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_32%20PM-5.png",
    "description": "وجبة سريعة تجمع كفتة اللحم المشوية مع جبنة القريش لوجبة عالية البروتين وسريعة التحضير.",
    "ingredients": [
      "150غ كفتة لحم مشوية",
      "50غ جبنة قريش",
      "بهارات خفيفة حسب الرغبة"
    ],
    "steps": [
      "سخّن أو اشوِ كفتة اللحم جيداً.",
      "قدّم الكفتة بجانب جبنة القريش الطازجة.",
      "تناولها كوجبة مشبعة قبل أو بعد التمرين."
    ]
  },
  {
    "id": "recipe-80",
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
    "id": "recipe-81",
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
    "id": "recipe-82",
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
    "id": "recipe-83",
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
    "id": "recipe-84",
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
    "id": "recipe-85",
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
    "id": "recipe-86",
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
    "id": "recipe-87",
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
    "id": "recipe-88",
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
    "id": "recipe-89",
    "titleAr": "كيكة البروتين بجبنة القريش",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 183,
    "protein": 26.9,
    "carbs": 2.5,
    "fats": 6.4,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍰",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2001_16_36%20PM-6.png",
    "description": "كيكة بروتين إسفنجية خفيفة وسريعة محضرة بالمايكرويف باستخدام البروتين وجبنة القريش.",
    "ingredients": [
      "30غ Whey بروتين شوكولاتة",
      "50غ جبنة قريش",
      "1 بياض بيض أو ملعقة حليب",
      "1/2 ملعقة صغيرة بيكنج باودر"
    ],
    "steps": [
      "اخلط المكونات جيداً في مج أو وعاء صغير آمن للمايكرويف.",
      "ضعها في المايكرويف لمدة 60-90 ثانية حتى ترتفع وتنضج.",
      "دعها تبرد قليلاً ثم استمتع بها."
    ]
  },
  {
    "id": "recipe-90",
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
    "id": "recipe-91",
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
    "id": "recipe-92",
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
    "id": "recipe-93",
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
    "id": "recipe-94",
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
    "id": "recipe-95",
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
    "id": "recipe-96",
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
    "id": "recipe-97",
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
    "id": "recipe-98",
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
    "id": "recipe-99",
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
    "id": "recipe-100",
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
    "id": "recipe-101",
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
    "id": "recipe-102",
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
    "id": "recipe-103",
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
    "id": "recipe-104",
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
    "id": "recipe-105",
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
  },
  {
    "id": "recipe-106",
    "titleAr": "سلطة يونانية بالباذنجان والسبانخ",
    "titleEn": "Greek Salad",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 97,
    "protein": 3,
    "carbs": 10,
    "fats": 5,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "8 حصص",
    "image": "🥗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_55_52%20PM-1.png",
    "description": "وجبة «سلطة يونانية بالباذنجان والسبانخ» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "ملعقة كبيرة من خل العنب الأحمر",
      "ملعقة طعام من عصير الليمون",
      "ملعقتان صغيرتان من الريحان الطازج المفروم أو 3/4 ملعقة صغيرة من الريحان المجفف",
      "1/4 ملعقة صغيرة من الملح",
      "1/4 ملعقة صغيرة من الفلفل الأسود المطحون حديثًا",
      "2 1/2 ملعقة كبيرة من زيت الزيتون البكر شديد النقاوة",
      "1 باذنجانة كبيرة، حوالي 1 1/2 رطل (680 غم)، مقشرة ومقطعة إلى مكعبات كل منها 1/2بوصة (1.3 سم) ( نحو 7 أكواب)",
      "رطل (454 غم) من السبانخ، منزوعة العنق ومقطعة إلى أجزاء بحجم القضمة",
      "1 خيار إنجليزي (صوب) ، غير مقشر، منزوع البذور ومبشور",
      "1 طماطم، منزوعة البذور ومبشورة",
      "1/2 بصلة حمراء، مبشورة",
      "ملعقتان كبيرتان من الزيتون الأسود اليوناني المفروم الخالي من البذور",
      "ملعقتا طعام من جبن الفيتا المفتت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اشوِ مكعبات الباذنجان عند 232°م مدة 18–20 دقيقة واتركها تبرد.",
      "اجمعها مع السبانخ والخضار والتتبيلة.",
      "أضف الزيتون والفيتا.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-107",
    "titleAr": "جرانولا الشوفان واللوز والتمر",
    "titleEn": "Homemade Healthy Granola",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 175,
    "protein": 4.4,
    "carbs": 24,
    "fats": 7.5,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "غير متوفر",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_55_54%20PM-2.png",
    "description": "وجبة «جرانولا الشوفان واللوز والتمر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "٢ كوب حبوب الشوفان الكاملة من كويكر",
      "١\\٢ كوب لوز مقطع",
      "١/٤ كوب تمر سكري مقطع وبدون الفص",
      "(٢ ملعقة كبير من شراب القيقب (١٠٠٪ طبيعي",
      "١ ملعقة كبيرة عسل",
      "١ ملعقة كبير",
      "١ ملعقة صغيرة زيت جور الهند",
      "١/٤ ملعقة صغيرة من نكهة الفانيلا",
      "رشة كبيرة من ملح البحر الناعم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اخلط الشوفان واللوز والتمر والمحليات والزيت والفانيليا والملح.",
      "افرد على صينية مبطنة واخبز عند 150°م نحو 10 دقائق.",
      "برّد.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-108",
    "titleAr": "كرات طاقة بالشوفان وزبدة الفول السوداني",
    "titleEn": "No Bake Energy Bites",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 247,
    "protein": 6,
    "carbs": 28,
    "fats": 14,
    "prepTime": "45 دقيقة",
    "difficulty": "سهل",
    "servings": "9 حصص",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_55_55%20PM-3.png",
    "description": "وجبة «كرات طاقة بالشوفان وزبدة الفول السوداني» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1 cup quick oats",
      "½ cup creamy peanut butter",
      "¼ cup shredded coconut",
      "¼ cup ground flaxseed",
      "½ cup mini chocolate chips",
      "⅓ cup honey"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اجمع المكونات حتى تتماسك وبرّد الخليط 30 دقيقة.",
      "شكّل 18 كرة متساوية؛ كل حصة كرتان.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-109",
    "titleAr": "لقيمات الخضار والشوفان بالفرن",
    "titleEn": "Baked Vegetable Oat Bites",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 514,
    "protein": 15.4,
    "carbs": 102.9,
    "fats": 4.5,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "غير متوفر",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_55_56%20PM-4.png",
    "description": "وجبة «لقيمات الخضار والشوفان بالفرن» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "١/٢ كوب شوفان كويكر®، مطحون",
      "٢/٣ كوب دقيق جميع الاستعمالات",
      "٢ م صغيرة بيكنج باودر",
      "١/٢ م صغيرة ملح (حسب الرغبة)",
      "١ ١/٢ م صغيرة كزبرة جافة مطحونة",
      "رشة فلفل أسود",
      "١/٤ كوب جزر مبشور",
      "١/٤ كوب فلفل رومي مفروم",
      "١ حبة بصل أخضر، مفرومة",
      "٢ فص ثوم مفرم",
      "٣ م كبيرة بقدونس مفروم",
      "٣/٤ كوب ماء دافيء",
      "٢ م كبيرة شوفان كويكر",
      "سمسم (اختياري) (اختياري)",
      "سلطة أو صوص تمر هندي",
      "زيت لدهن القالب، كمية غير محددة في الطريقة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اخلط المقادير ووزعها في قوالب صغيرة مدهونة.",
      "اخبز عند 175°م مدة 12–14 دقيقة حتى النضج.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-110",
    "titleAr": "شوربة البروكلي والعدس والشيدر",
    "titleEn": "Broccoli and Cheddar Soup",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 700,
    "protein": 50.1,
    "carbs": 80.9,
    "fats": 19.5,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_55_58%20PM-5.png",
    "description": "وجبة «شوربة البروكلي والعدس والشيدر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1 tsp olive oil",
      "1 clove garlic, peeled and crushed",
      "100g dried green lentils",
      "100g broccoli florets",
      "280ml skimmed milk",
      "salt and pepper",
      "20g yoghurt, such as greek, natural, soya",
      "40g cheddar cheese, grated",
      "water to cover lentils (quantity not specified)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "قلّب الثوم بالزيت وأضف العدس وماء يغطيه، واطبخ 15 دقيقة.",
      "أضف البروكلي والحليب 5 دقائق.",
      "اطحن.",
      "قدم مع الزبادي والشيدر.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-111",
    "titleAr": "شوربة الدجاج والفاصوليا البيضاء بالفلفل الأخضر",
    "titleEn": "Green Chile Chicken Soup with White Beans",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 340,
    "protein": 35,
    "carbs": 39,
    "fats": 6,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "6 حصص",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_56_00%20PM-6.png",
    "description": "وجبة «شوربة الدجاج والفاصوليا البيضاء بالفلفل الأخضر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1 tablespoon olive oil",
      "1 small white onion, diced",
      "1 green bell pepper, diced",
      "2 garlic cloves, minced",
      "1 lb Rotisserie white chicken meat, pulled",
      "2 teaspoons cumin",
      "2 teaspoons white black pepper *",
      "3.5 cups low sodium chicken broth, warmed",
      "1 cup mild salsa verde",
      "2 cans (30oz) cannellini beans",
      "1/3 cup cilantro, finely chopped",
      "sea salt & pepper to taste",
      "2 tablespoons arrowroot (اختياري)",
      "avocado slices (اختياري)",
      "red onion, chopped (اختياري)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "قلّب البصل والفلفل بالزيت.",
      "أضف الثوم والدجاج المطبوخ والبهارات.",
      "أضف الفاصوليا والصلصة الخضراء والمرق واتركها 15 دقيقة.",
      "أضف الكزبرة والنشا المذاب إن رغبت بالتكثيف.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-112",
    "titleAr": "شوربة الشوفان التقليدية باللحم",
    "titleEn": "Traditional Oat Soup with Lamb",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 1090,
    "protein": 59,
    "carbs": 72,
    "fats": 64,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "غير متوفر",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_56_01%20PM-7.png",
    "description": "وجبة «شوربة الشوفان التقليدية باللحم» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "٢/٣ كوب شوفان كويكر",
      "٢ م كبيرة زيت نباتي",
      "١ حبة بصل متوسطة، مفرومة",
      "١ فص ثوم، مفروم",
      "٣٥٠ جم لحم ضأني بالعظم ، مقطع قطع صغيرة",
      "٢ حبة طماطم متوسطة، مطحونة",
      "٢ م كبيرة صلصة طماطم",
      "١ مكعب مرق دجاج",
      "١/٤ م صغيرة فلفل أسود",
      "١/٤ م صغيرة كمون مطحون",
      "١/٤ م صغيرة بهارات مشكلة (حسب الرغبة)",
      "١/٣ م صغيرة ملح (حسب الرغبة)",
      "٧ ١/٢ أكواب ماء مغلي"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "قلّب البصل واللحم والثوم.",
      "أضف الطماطم والمرق والتوابل.",
      "أضف الماء واطبخ حتى يطرى اللحم 45–55 دقيقة.",
      "أضف الشوفان 10–12 دقيقة.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-113",
    "titleAr": "شوربة العدس والشوفان مع البصل بالبالسميك",
    "titleEn": "Creamy Lentil and Oat Soup",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 812,
    "protein": 26,
    "carbs": 113,
    "fats": 31,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "غير متوفر",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_56_03%20PM-8.png",
    "description": "وجبة «شوربة العدس والشوفان مع البصل بالبالسميك» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "١/٢ كوب شوفان كويكر",
      "٢ م كبيرة زيت زيتون",
      "١ حبة بصل متوسطة، مفرومة",
      "١/٤ كوب كرفس مفروم",
      "١ فص ثوم، مفروم",
      "١ كوب جزر مقطع مكعبات صغيرة",
      "٦ أكواب ماء مغلي",
      "١ كوب مرق الدجاج",
      "١ م صغيرة ملح (حسب الرغبة)",
      "٣/٤ كوب عدس، مغسول",
      "١/٤ م صغيرة فلفل أسود مطحون",
      "١/٢ م صغيرة نعناع مجفف",
      "١ م كبيرة عصير ليمون",
      "٢ م كبيرة زيت زيتون",
      "١ حبة بصل متوسطة، مقطعة شرائح رفيعة",
      "٣ م كبيرة خل البالسميك"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "قلّب البصل والكرفس والثوم والجزر، وأضف السوائل والعدس.",
      "الشوفان حتى النضج.",
      "اطحن الشوربة وأضف النعناع والليمون.",
      "حضّر البصل بالزيت والبالسميك وقدمه فوقها.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-114",
    "titleAr": "شوربة العدس والفاصوليا السوداء",
    "titleEn": "Black Bean and Lentil Soup",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 536,
    "protein": 28,
    "carbs": 84,
    "fats": 13,
    "prepTime": "45 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_56_04%20PM-9.png",
    "description": "وجبة «شوربة العدس والفاصوليا السوداء» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1 tsp coconut oil",
      "1 carrot, peeled and diced",
      "1 stick celery, finely chopped",
      "½ onion, peeled and diced",
      "20g curry paste",
      "65g dried green lentils",
      "400ml water",
      "100g tinned black beans, drained",
      "60g yoghurt, such as greek, natural, soya",
      "1 small bunch coriander, chopped"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "قلّب الخضار بالزيت.",
      "أضف معجون الكاري والعدس والماء، واطبخ 25–30 دقيقة.",
      "أضف الفاصوليا.",
      "اطحن نصف الشوربة مع الزبادي.",
      "أعدها للقدر وسخن برفق.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-115",
    "titleAr": "شوربة اللحم والفاصوليا والخضار",
    "titleEn": "Hearty Beef and Bean Soup",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 470,
    "protein": 49,
    "carbs": 54,
    "fats": 7,
    "prepTime": "55 دقيقة",
    "difficulty": "سهل",
    "servings": "5 حصص",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2010_56_06%20PM-10.png",
    "description": "وجبة «شوربة اللحم والفاصوليا والخضار» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1.5 lb lean top sirloin, cubed (3/4 inch)",
      "1 can (15 oz) kidney beans, drained and rinsed",
      "1 can (15 oz) cannellini beans, drained and rinsed",
      "1 medium onion, diced",
      "2 medium carrots, diced",
      "3 celery stalks, diced",
      "1.5 tbsp Land seasoning (Herb & Garlic)",
      "1 tsp ground fennel",
      "1/2 tsp ground sage",
      "Salt and pepper to taste",
      "1 can (14.5 oz) diced tomatoes",
      "2 tbsp tomato paste",
      "5 cups beef broth (low sodium or no salt added)",
      "2 cups frozen mixed vegetables",
      "fresh parsley for garnish (اختياري)",
      "2 tbsp olive oil or avocado oil * (اختياري)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اجمع اللحم والخضار والفاصوليا والطماطم والمرق والتوابل في قدر.",
      "اتركها على نار هادئة 30–45 دقيقة حتى يطرى اللحم، وأضف الخضار المجمدة في آخر 5–10 دقائق.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-116",
    "titleAr": "شوربة المأكولات البحرية والبطاطا الحلوة بالكاجن",
    "titleEn": "Cajun Sweet Potato Seafood Bisque",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 450,
    "protein": 46,
    "carbs": 29,
    "fats": 17,
    "prepTime": "45 دقيقة",
    "difficulty": "سهل",
    "servings": "4 حصص",
    "image": "🥣",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_08%20PM-1.png",
    "description": "وجبة «شوربة المأكولات البحرية والبطاطا الحلوة بالكاجن» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "2 tbsp olive oil",
      "1 medium sweet potato (300g), peeled/cubed",
      "1 yellow (or white) onion, chopped",
      "2 celery stalks, chopped",
      "1 green bell pepper (chopped)",
      "2 tbsp tomato paste",
      "Custom Cajun Blend: 2 tbsp Taco Titan, 2 tsp thyme, 1 tsp sage, 1-2 tsp white pepper.",
      "5 cups seafood stock",
      "2 lbs mixed seafood (shrimp, cod, salmon, crab – whatever you have in your fridge)",
      "1 tbsp cold butter (OPTIONAL) – added at the end for creaminess (اختياري)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "قلّب الخضار والتوابل وأضف البطاطا والمرق، واطبخ 25–30 دقيقة.",
      "اطحن.",
      "أضف السمك والجمبري بالتدريج حتى النضج.",
      "أضف الليمون والزيت أو الزبدة الاختيارية.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-117",
    "titleAr": "حمص بالشمندر والليمون",
    "titleEn": "Beetroot Hummus",
    "category": "appetizers_dips",
    "categoryRaw": "مقبلات وصوصات",
    "isHighProtein": false,
    "calories": 90,
    "protein": 6,
    "carbs": 15,
    "fats": 1,
    "prepTime": "60 دقيقة",
    "difficulty": "سهل",
    "servings": "غير متوفر",
    "image": "🥑",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_10%20PM-2.png",
    "description": "وجبة «حمص بالشمندر والليمون» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "500g raw beetroot, leaves trimmed to 1 inch, but root left whole",
      "2 x 400g cans chickpeas, drained",
      "juice 2 lemons",
      "1 tbsp ground cumin",
      "yogurt, toasted cumin seeds, mint and crusty bread, to serve",
      "2 teaspoons salt (from method)",
      "black pepper to taste (from method)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اسلق الشمندر 30–40 دقيقة.",
      "برّده وقشّره.",
      "اطحنه مع الحمص والليمون والكمون، وتبّل وقدّم مع الزينة.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-118",
    "titleAr": "حمص بالطحينة والليمون",
    "titleEn": "Hummus",
    "category": "appetizers_dips",
    "categoryRaw": "مقبلات وصوصات",
    "isHighProtein": false,
    "calories": 33,
    "protein": 1,
    "carbs": 2,
    "fats": 3,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "6 حصص",
    "image": "🥑",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_11%20PM-3.png",
    "description": "وجبة «حمص بالطحينة والليمون» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1 (15-ounce) can chickpeas",
      "3 tablespoons lemon juice",
      "2 tablespoons tahini",
      "2 small garlic cloves",
      "¾ teaspoon salt",
      "3 ice cubes",
      "Extra-virgin olive oil for serving (اختياري)",
      "Paprika for serving (اختياري)",
      "Chopped fresh parsley for serving (اختياري)"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "صفِّ الحمص ويمكن تقشيره للحصول على قوام أنعم.",
      "اطحنه مع الليمون والطحينة والثوم والملح والثلج، وقدّم مع الزينة.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-119",
    "titleAr": "صوص الأفوكادو والزبادي والكزبرة",
    "titleEn": "Quick Avocado Crema",
    "category": "appetizers_dips",
    "categoryRaw": "مقبلات وصوصات",
    "isHighProtein": false,
    "calories": 12,
    "protein": 1,
    "carbs": 1,
    "fats": 1,
    "prepTime": "5 دقيقة",
    "difficulty": "سهل",
    "servings": "28 حصص",
    "image": "🥑",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_12%20PM-4.png",
    "description": "وجبة «صوص الأفوكادو والزبادي والكزبرة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "1/2 large ripe avocado",
      "1 cup 2% Greek yogurt",
      "2 garlic cloves",
      "1/2 cup fresh cilantro with stem",
      "juice from 2 limes",
      "3/4 cup water",
      "sea salt & pepper to taste"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اطحن الأفوكادو والزبادي والثوم والكزبرة والليمون والماء.",
      "عدّل القوام بالماء والملح والفلفل.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-120",
    "titleAr": "شوفان البروتين بالتوت والبهارات",
    "titleEn": "Spiced Berry Porridge",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 532,
    "protein": 51,
    "carbs": 70,
    "fats": 7,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_14%20PM-5.png",
    "description": "وجبة «شوفان البروتين بالتوت والبهارات» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "60g rolled oats",
      "½ tsp mixed spice",
      "300ml skimmed milk",
      "30g protein powder, vanilla or unflavoured",
      "65g raspberries, fresh or frozen",
      "30g blackberries, fresh or frozen",
      "50g yoghurt, such as greek, natural, soya"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اطبخ الشوفان مع الحليب والبروتين والبهارات 8–10 دقائق مع التحريك.",
      "أضف التوت.",
      "الزبادي بعد إبعاد القدر عن النار.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-121",
    "titleAr": "شوفان ليلي بالزبادي والشيا",
    "titleEn": "Overnight Oats with Greek Yogurt and Chia",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 319,
    "protein": 16,
    "carbs": 50,
    "fats": 10,
    "prepTime": "485 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_15%20PM-6.png",
    "description": "وجبة «شوفان ليلي بالزبادي والشيا» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "½ cup rolled oats",
      "½ cup milk of choice",
      "¼ cup Greek yogurt non-fat",
      "1 tablespoon chia seeds",
      "1 tablespoon sweetener honey or maple syrup",
      "¼ teaspoon vanilla extract"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اخلط قاعدة الشوفان والحليب مع الزبادي والشيا والمحلي والفانيليا.",
      "غطّه وبرّده ليلًا، أو ساعتين على الأقل، وقدّمه مباشرة.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-122",
    "titleAr": "فرنش توست مافن مع التفاح واللوز",
    "titleEn": "French Toast Muffins with Caramel Apples",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 480,
    "protein": 24,
    "carbs": 54,
    "fats": 20,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_17%20PM-7.png",
    "description": "وجبة «فرنش توست مافن مع التفاح واللوز» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "2 medium eggs",
      "2 tbsp skimmed milk",
      "1 pinch salt",
      "1 pinch ground cinnamon",
      "1 wholemeal muffin, split",
      "½ tsp brown sugar",
      "2 tsp honey",
      "½ apple, peeled, cored and cut into wedges",
      "1 tsp butter",
      "30g yoghurt, such as greek, natural, soya",
      "10g flaked almonds, toasted"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "انقع نصفي المافن في البيض والحليب والقرفة 5 دقائق.",
      "اطبخ التفاح مع العسل والسكر 5 دقائق، وحمّر المافن بالزبدة.",
      "قدم مع الزبادي واللوز.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-123",
    "titleAr": "كاري اللحم البطيء مع الأرز البني",
    "titleEn": "Slow Cooked Beef Curry",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 614,
    "protein": 45,
    "carbs": 65,
    "fats": 22,
    "prepTime": "80 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_18%20PM-8.png",
    "description": "وجبة «كاري اللحم البطيء مع الأرز البني» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "130g lean diced beef",
      "2 tsp plain flour",
      "1 pinch salt",
      "2 tsp coconut oil",
      "1 small red onion, peeled and finely chopped",
      "1 clove garlic, peeled and crushed",
      "½ aubergine, diced",
      "20g ginger, peeled and grated",
      "½ tsp chilli powder",
      "½ tsp ground cumin",
      "½ tsp garam masala",
      "½ tsp turmeric",
      "300g tinned chopped tomatoes",
      "300ml beef stock or water",
      "80g cooked brown rice",
      "1 small bunch coriander, chopped"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "غطّ اللحم بالدقيق وحمّره.",
      "قلّب البصل والثوم والباذنجان والزنجبيل والتوابل.",
      "أضف الطماطم والمرق واللحم واتركه 50–60 دقيقة.",
      "قدم مع الأرز المطبوخ والكزبرة.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-124",
    "titleAr": "سموثي بروتين بالتفاح واللوز والشوفان",
    "titleEn": "Christmas Mince Pie Smoothie",
    "category": "drinks_smoothies",
    "categoryRaw": "مشروبات وسموثي",
    "isHighProtein": true,
    "calories": 518,
    "protein": 35,
    "carbs": 57,
    "fats": 20,
    "prepTime": "5 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥤",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_01_22%20PM-10.png",
    "description": "وجبة «سموثي بروتين بالتفاح واللوز والشوفان» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "260ml semi-skimmed milk",
      "30g rolled oats",
      "20g mincemeat",
      "20g protein powder, vanilla or unflavoured",
      "40g apple sauce",
      "20g almond butter",
      "1 handful ice"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة، واغسل/قطّع المكونات التي تحتاج تجهيزًا قبل بدء الطهي.",
      "اجمع المكونات في الخلاط.",
      "اخلط حتى يصبح ناعمًا، وعدّل الثلج حسب القوام.",
      "قدّم الوجبة بعد اكتمال النضج، وقسّمها حسب عدد الحصص المذكور في الوصفة."
    ]
  },
  {
    "id": "recipe-125",
    "titleAr": "خلطة البيض والجبنة قريش والدجاج",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 457,
    "protein": 52.2,
    "carbs": 3.7,
    "fats": 23.7,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_11%20PM-1.png",
    "description": "وجبة «خلطة البيض والجبنة قريش والدجاج» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "150غ بيض كامل",
      "50غ جبنة قريش",
      "80غ صدر دجاج مطبوخ",
      "5غ زبدة",
      "4غ Baking Powder"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يخلط ويطهى حتى يتماسك.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-126",
    "titleAr": "خلطة بعد الجيم بالكفتة والدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 703,
    "protein": 73.3,
    "carbs": 4.4,
    "fats": 42.4,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_14%20PM-2.png",
    "description": "وجبة «خلطة بعد الجيم بالكفتة والدجاج» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "150غ بيض كامل",
      "130غ كفتة كتف عجل مطبوخة",
      "50غ صدر دجاج مطبوخ",
      "30غ جبنة قريش",
      "5غ زبدة",
      "4غ Baking Powder"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يخلط ويطهى حتى يتماسك.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-127",
    "titleAr": "بودينغ الأرز والليمون بالواي",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 350,
    "protein": 30,
    "carbs": 55,
    "fats": 3,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_20%20PM-5.png",
    "description": "وجبة «بودينغ الأرز والليمون بالواي» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "50غ أرز قصير الحبة",
      "250مل حليب خالي الدسم",
      "10غ قرفة",
      "35غ Whey فانيلا",
      "بشر ليمون"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات وتخبز على 150° حتى النضج.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-128",
    "titleAr": "بودينغ الموز وزبدة الفول السوداني",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 15,
    "carbs": 41,
    "fats": 15,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_23%20PM-6.png",
    "description": "وجبة «بودينغ الموز وزبدة الفول السوداني» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "100غ موز",
      "150غ حليب خالي الدسم",
      "15غ زبدة فول سوداني",
      "20غ شيا",
      "10غ Whey"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات وتبرد 4 ساعات أو طوال الليل.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-129",
    "titleAr": "فشار البروتين",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 350,
    "protein": 30,
    "carbs": 49,
    "fats": 6,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_24%20PM-7.png",
    "description": "وجبة «فشار البروتين» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "60غ ذرة فشار",
      "بخاخ زيت اختياري",
      "15غ Whey",
      "5غ كاكاو غير محلى",
      "فانيليا حسب الرغبة",
      "حليب سائل للقوام، الكمية غير محددة"
    ],
    "steps": [
      "حوّل الذرة إلى فشار في المقلاة الهوائية باستخدام بخاخ الزيت عند الرغبة.",
      "اخلط الواي والكاكاو والفانيليا مع قليل من الحليب حتى يصبح الصوص لزجًا.",
      "أضف صوص البروتين إلى الفشار وحرّكه جيدًا.",
      "برّد الفشار عدة دقائق ثم قدّمه."
    ]
  },
  {
    "id": "recipe-130",
    "titleAr": "خبز ردة مع اللانشون",
    "titleEn": "",
    "category": "sandwiches",
    "categoryRaw": "ساندويتشات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 15,
    "carbs": 48,
    "fats": 8,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_26%20PM-8.png",
    "description": "وجبة «خبز ردة مع اللانشون» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "65غ خبز",
      "100غ لانشون حبش أو لحم بقري قليل السعرات",
      "خضار",
      "10غ مخلل",
      "100مل عصير برتقال"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يجمع كسندويتش ويقدم مع الخضار والعصير.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-131",
    "titleAr": "ساندويتش شيدر مع أفوكادو",
    "titleEn": "",
    "category": "sandwiches",
    "categoryRaw": "ساندويتشات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 17,
    "carbs": 31.2,
    "fats": 10.9,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_27%20PM-1.png",
    "description": "وجبة «ساندويتش شيدر مع أفوكادو» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "60غ خبز",
      "100غ شيدر قليل السعرات",
      "50غ أفوكادو",
      "10غ زيت زيتون",
      "ليمون"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يهرس الأفوكادو، يحشى الخبز بالأفوكادو والجبنة.",
      "يحمص بالزيت.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-132",
    "titleAr": "قوارب البيتزا بالبيض",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 550,
    "protein": 25,
    "carbs": 38,
    "fats": 34,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_28%20PM-9.png",
    "description": "وجبة «قوارب البيتزا بالبيض» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "70غ عجينة بيتزا",
      "20غ خليط موزاريلا وفيتا",
      "بيضة كاملة",
      "بياض بيضة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تشكل العجينة كقارب وتخبز.",
      "يضاف الجبن والبيض وتكمل في الفرن.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-133",
    "titleAr": "منقوشة البيض",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 350,
    "protein": 33,
    "carbs": 6.9,
    "fats": 16.1,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_29%20PM-2.png",
    "description": "وجبة «منقوشة البيض» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "60غ عجينة قبل الخبز",
      "20غ خليط جبنة",
      "بيضة كاملة",
      "بياض بيضة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تفرد العجينة وتضاف الجبنة والبيض.",
      "تخبز على مرحلتين.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-134",
    "titleAr": "أقراص التونة المشوية",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 400,
    "protein": 18,
    "carbs": 23.3,
    "fats": 30.1,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_30%20PM-3.png",
    "description": "وجبة «أقراص التونة المشوية» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "100غ تونة مصفاة",
      "40غ بيض",
      "50غ بصل أخضر",
      "30غ مسترد",
      "20غ بقدونس",
      "10غ زيت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات وتشكل أقراصًا وتشوى 4 دقائق لكل جانب.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-135",
    "titleAr": "الشكشوكة",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 17,
    "carbs": 36,
    "fats": 11,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_31%20PM-10.png",
    "description": "وجبة «الشكشوكة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "3 بيضات",
      "15غ زيت زيتون",
      "بصل وثوم و3 حبات بندورة وبقدونس وتوابل"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تحضر صلصة الطماطم.",
      "يكسر البيض فوقها ويطهى مغطى.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-136",
    "titleAr": "الفول المدمس",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 16,
    "carbs": 53.4,
    "fats": 13.2,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_32%20PM-4.png",
    "description": "وجبة «الفول المدمس» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "200غ فول مدمس",
      "12غ زيت",
      "طماطم وبصل وثوم وفلفل ومعجون طماطم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يشوح البصل والثوم والخضار.",
      "يضاف الفول ويطهى 5 دقائق.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-137",
    "titleAr": "بيض بالمشروم والجبن",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 20,
    "carbs": 13.6,
    "fats": 23.4,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_39%20PM-7.png",
    "description": "وجبة «بيض بالمشروم والجبن» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "2 بيضة",
      "2 بياض",
      "80غ مشروم",
      "10غ زيت",
      "15غ خبز",
      "15غ جبنة",
      "ثوم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يشوح المشروم والثوم.",
      "يطهى مع البيض وتضاف الجبنة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-138",
    "titleAr": "بيض مقلي مع جبنة قليلة الدسم",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 350,
    "protein": 25,
    "carbs": 1.5,
    "fats": 27,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_40%20PM-8.png",
    "description": "وجبة «بيض مقلي مع جبنة قليلة الدسم» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "3 بيضات وسط",
      "15غ موزاريلا قليلة الدهن",
      "13غ زبدة أو 10غ زيت زيتون"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يطهى البيض على نار هادئة وتضاف الجبنة حتى تذوب.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-139",
    "titleAr": "تونة بالجبنة",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 20,
    "carbs": 27.1,
    "fats": 25.7,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_43%20PM-9.png",
    "description": "وجبة «تونة بالجبنة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "70غ تونة",
      "70غ جبنة كريمية ناعمة",
      "40غ خبز",
      "بصلة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يشوح البصل.",
      "تضاف التونة والجبنة على نار هادئة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-140",
    "titleAr": "سلطة العدس والمشروم",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": false,
    "calories": 350,
    "protein": 20,
    "carbs": 38.7,
    "fats": 13.7,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_12_44%20PM-10.png",
    "description": "وجبة «سلطة العدس والمشروم» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "150غ عدس مسلوق",
      "150غ مشروم",
      "80غ جرجير",
      "5غ زيت زيتون",
      "15غ رانش"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات ويضاف الليمون والزيت والصوص.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-141",
    "titleAr": "سوفليه البيض والدجاج",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 321,
    "protein": 37.8,
    "carbs": 6.9,
    "fats": 15.1,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_02%20PM-1.png",
    "description": "وجبة «سوفليه البيض والدجاج» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "80غ صدر دجاج مسلوق",
      "40غ بصل",
      "80غ كوسا",
      "60غ بياض بيض",
      "40غ بيض كامل",
      "8غ زيت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تشوح الخضار والدجاج، يضاف البيض.",
      "بياض مخفوق وتخبز 30 دقيقة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-142",
    "titleAr": "طاجن الفول بالبيض",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": false,
    "calories": 399,
    "protein": 22.5,
    "carbs": 33,
    "fats": 20.3,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_05%20PM-3.png",
    "description": "وجبة «طاجن الفول بالبيض» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "100غ فول",
      "2 بيضة",
      "10غ زيت",
      "بصل وفلفل وعصير طماطم وثوم وبقدونس"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تحضر خلطة الفول والطماطم.",
      "توضع في طاجن ويكسر البيض فوقها وتخبز.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-143",
    "titleAr": "فطور الجوكر",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 349,
    "protein": 25.4,
    "carbs": 40.6,
    "fats": 9.2,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_07%20PM-4.png",
    "description": "وجبة «فطور الجوكر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "20غ توست",
      "15غ جبنة لايت",
      "30غ رقائق فتنس",
      "100غ حليب 1%",
      "10غ Whey",
      "بيضة مسلوقة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تقدم رقائق الفتنس بالحليب والواي مع توست الجبنة والبيض.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-144",
    "titleAr": "كيك البروتين بطريقة الجوكر",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": true,
    "calories": 391,
    "protein": 40.1,
    "carbs": 37.7,
    "fats": 12.1,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_09%20PM-5.png",
    "description": "وجبة «كيك البروتين بطريقة الجوكر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "100غ شوفان مطحون ناعم",
      "3 بيضات كاملة",
      "300مل حليب",
      "30غ Whey بنكهة مناسبة",
      "2 ملعقة صغيرة بيكنج باودر",
      "فانيليا حسب الرغبة",
      "محلي خالٍ من السعرات حسب الرغبة",
      "بخاخ زيت خفيف للقالب"
    ],
    "steps": [
      "اطحن الشوفان حتى يصبح قريبًا من قوام الدقيق ثم زنه للتأكد من الكمية.",
      "اخفق البيض والحليب والواي والفانيليا والمحلي بالخلاط حتى تتجانس المكونات.",
      "انخل الشوفان المطحون والبيكنج باودر، ثم ادمجهما يدويًا مع الخليط للحفاظ على الهواء.",
      "رش قالب الخبز بطبقة خفيفة من الزيت واسكب الخليط فيه.",
      "اخبز الكيك في فرن مسخن مسبقًا نحو 15 دقيقة، ثم اختبر النضج واتركه يهدأ قبل التقديم."
    ]
  },
  {
    "id": "recipe-145",
    "titleAr": "مخبوز التفاح والقرفة",
    "titleEn": "",
    "category": "snacks_dessert",
    "categoryRaw": "سناك وحلويات",
    "isHighProtein": false,
    "calories": 359,
    "protein": 16.6,
    "carbs": 46.2,
    "fats": 13.4,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_11%20PM-6.png",
    "description": "وجبة «مخبوز التفاح والقرفة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "3 أكواب شوفان",
      "5 ملعقة Baking Powder",
      "قرفة ومحلي",
      "4 ملاعق زبدة",
      "2 بيضة",
      "5 كوب حليب",
      "3 تفاحات",
      "سكوب Whey"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات الجافة والسائلة، يوضع التفاح في القاع.",
      "يخبز الخليط 45 دقيقة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-146",
    "titleAr": "دجاج مشوي مع كوسا وباذنجان",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 392,
    "protein": 50.9,
    "carbs": 11,
    "fats": 16,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_14%20PM-8.png",
    "description": "وجبة «دجاج مشوي مع كوسا وباذنجان» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "150غ صدر دجاج نيء",
      "10غ زيت",
      "100غ كوسا وباذنجان",
      "100غ مشروم"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج بعصير البرتقال والبهارات ويشوى.",
      "تشوى الخضار.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-147",
    "titleAr": "رول دجاج محشو سبانخ ومشروم",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 415,
    "protein": 53.5,
    "carbs": 6.1,
    "fats": 19.3,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_21_16%20PM-9.png",
    "description": "وجبة «رول دجاج محشو سبانخ ومشروم» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "150غ شرائح صدر دجاج",
      "10غ شيدر",
      "50غ مشروم",
      "120غ خلطة سبانخ",
      "10غ زيت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تطهى حشوة السبانخ والمشروم، تلف داخل الدجاج وتخبز نحو 30 دقيقة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-148",
    "titleAr": "فاصولياء خضراء بالثوم والبارميزان",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": false,
    "calories": 431,
    "protein": 24.2,
    "carbs": 24.5,
    "fats": 28.1,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_46%20PM-1.png",
    "description": "وجبة «فاصولياء خضراء بالثوم والبارميزان» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "200غ فاصولياء خضراء مسلوقة",
      "10غ زبدة",
      "5غ زيت زيتون",
      "20غ ثوم",
      "50غ بارميزان"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تطهى الفاصولياء مع الدهون والثوم.",
      "ترش بالبارميزان.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-149",
    "titleAr": "قطع لحم بقري بالبروكلي",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 329,
    "protein": 39.3,
    "carbs": 8.6,
    "fats": 16.6,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_48%20PM-2.png",
    "description": "وجبة «قطع لحم بقري بالبروكلي» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "140غ لحم بقري قليل الدهن قبل الطبخ",
      "100غ بروكلي",
      "10غ بشر ليمون",
      "5غ زيت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل اللحم ويشوح.",
      "يطهى بالماء ويضاف البروكلي في النهاية.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-150",
    "titleAr": "السماقية الفلسطينية",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 978,
    "protein": 73.3,
    "carbs": 62.8,
    "fats": 49.5,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_53%20PM-5.png",
    "description": "وجبة «السماقية الفلسطينية» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "320غ لحم قبل الطبخ",
      "200غ سلق",
      "50غ حمص مسلوق",
      "10غ زيت",
      "20غ طحينة",
      "40غ طحين",
      "سماق"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يطهى اللحم والسلق والحمص، ويحضر ماء السماق والطحين والطحينة.",
      "يضاف للخليط.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-151",
    "titleAr": "تونة أو سردين بالسلطة",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": true,
    "calories": 498,
    "protein": 81.6,
    "carbs": 36,
    "fats": 4.2,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_26_58%20PM-8.png",
    "description": "وجبة «تونة أو سردين بالسلطة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "290غ تونة أو سردين مصفّى",
      "130غ ذرة مسلوقة أو 65غ خبز",
      "بصل وليمون وسلطة"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تغسل التونة بالليمون وتخلط مع البصل والسلطة، مع الذرة أو الخبز كمصدر كارب.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-152",
    "titleAr": "ساندويتش التونة",
    "titleEn": "",
    "category": "sandwiches",
    "categoryRaw": "ساندويتشات",
    "isHighProtein": true,
    "calories": 656,
    "protein": 69.5,
    "carbs": 33.7,
    "fats": 26.6,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_27_01%20PM-10.png",
    "description": "وجبة «ساندويتش التونة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "250غ تونة مصفاة أو 130غ",
      "سكوب Whey",
      "10غ زيت زيتون",
      "55غ خبز",
      "بيضة ورانش وفلفل"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "تخلط المكونات وتشكل أقراصًا، تبرد قليلًا.",
      "تشوى وتقدم كسندويتش.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-153",
    "titleAr": "سلطة الجرجير والدجاج المشوي",
    "titleEn": "",
    "category": "salads",
    "categoryRaw": "سلطات",
    "isHighProtein": true,
    "calories": 781,
    "protein": 87.7,
    "carbs": 15,
    "fats": 40.8,
    "prepTime": "15 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_22%20PM-2.png",
    "description": "وجبة «سلطة الجرجير والدجاج المشوي» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "260غ صدر دجاج مشوي",
      "160غ طماطم شيري",
      "30غ مسترد خالي السعرات",
      "20غ رانش",
      "20غ زيت زيتون",
      "200غ جرجير"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يخلط الصوص.",
      "يجمع مع الدجاج والخضار.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-154",
    "titleAr": "شاورما الجوكر",
    "titleEn": "",
    "category": "sandwiches",
    "categoryRaw": "ساندويتشات",
    "isHighProtein": true,
    "calories": 1050,
    "protein": 95.7,
    "carbs": 68.7,
    "fats": 43.3,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🥪",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_24%20PM-3.png",
    "description": "وجبة «شاورما الجوكر» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "350غ شاورما دجاج مطبوخة من الفخذ والصدر",
      "70غ خبز",
      "100غ حمص مسلوق أو 50غ طحينية"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج باللبن والثوم وبهارات الشاورما.",
      "يخبز على أسياخ.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-155",
    "titleAr": "صدر بالزعتر والأوريجانو",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 705,
    "protein": 80.5,
    "carbs": 24.6,
    "fats": 31.7,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_25%20PM-4.png",
    "description": "وجبة «صدر بالزعتر والأوريجانو» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "380غ صدر دجاج قبل الطبخ أو 250غ بعده",
      "200غ باذنجان مشوي",
      "22غ زيت زيتون",
      "ليمون وثوم وزعتر"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يشوى الصدر والباذنجان.",
      "يقلب الباذنجان مع الليمون والثوم والزيت والتوابل.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-156",
    "titleAr": "صدور دجاج مشوية بالمستردة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 723,
    "protein": 87.4,
    "carbs": 8.7,
    "fats": 36.1,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "1 حصة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_28%20PM-5.png",
    "description": "وجبة «صدور دجاج مشوية بالمستردة» محسوبة السعرات والماكروز بدقة، مصممة لدعم طاقتك اليومية وأهدافك الرياضية.",
    "ingredients": [
      "380غ صدر دجاج قبل الطبخ",
      "100غ مستردة خالية السعرات",
      "20غ زيت",
      "20غ بارميزان",
      "بندورة مشوية"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة في عمود المكونات.",
      "يتبل الدجاج ويخبز نحو 40 دقيقة، ويقدم مع البارميزان والبندورة.",
      "راقب القوام/النضج أثناء الطهي، ثم قدّم الوجبة مباشرة أو اتركها تبرد إذا كانت من الحلويات."
    ]
  },
  {
    "id": "recipe-157",
    "titleAr": "صدور دجاج مع أرز بني",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 574,
    "protein": 81.2,
    "carbs": 34,
    "fats": 10.2,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_31%20PM-7.png",
    "description": "وجبة «صدور دجاج مع أرز بني» متكاملة وغنية بالبروتين لدعم البناء العضلي والشبع الطويل.",
    "ingredients": [
      "250 غ صدر دجاج مشوي",
      "40 غ أرز بني (جاف)",
      "100 غ خيار",
      "10 غ صلصة حارة"
    ],
    "steps": [
      "جهّز المكونات.",
      "اسلق الأرز البني بلا زيت حتى ينضج.",
      "اشوِ الدجاج بالبهارات.",
      "قدّم الدجاج مع الأرز البني والخيار والصلصة الحارة."
    ]
  },
  {
    "id": "recipe-158",
    "titleAr": "صدور مشوية مع العدس والخضار",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 630,
    "protein": 81.8,
    "carbs": 53,
    "fats": 8.3,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_33%20PM-8.png",
    "description": "وجبة «صدور مشوية مع العدس والخضار» غنية بالبروتين والألياف لتعزيز الاستشفاء والشبع.",
    "ingredients": [
      "200 غ صدر دجاج مشوي",
      "65 غ عدس جاف",
      "200 غ خضار مشكلة"
    ],
    "steps": [
      "جهّز المكونات.",
      "اشوِ صدر الدجاج بالتتبيلة المناسبة.",
      "اسلق العدس في ماء مع ملح وكمون حتى ينضج.",
      "قدّم الدجاج مع العدس والخضار المطهوة أو المشوحة."
    ]
  },
  {
    "id": "recipe-159",
    "titleAr": "صدور مشوية مع صوص وشوربة خضار",
    "titleEn": "",
    "category": "soups",
    "categoryRaw": "شوربات",
    "isHighProtein": true,
    "calories": 579,
    "protein": 86,
    "carbs": 19.5,
    "fats": 16.2,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_31_34%20PM-9.png",
    "description": "وجبة متكاملة من صدور الدجاج المشوية وشوربة الخضار الدافئة مع صوص الزبادي المنعش.",
    "ingredients": [
      "250 غ صدر دجاج مشوي",
      "250 غ خضار مشكلة للشوربة",
      "100 غ زبادي لايت",
      "5 غ زيت زيتون"
    ],
    "steps": [
      "جهّز المكونات بالكميات المذكورة.",
      "اشوِ الدجاج حتى ينضج.",
      "حضّر شوربة الخضار من الخضار المشكلة.",
      "قدّم الدجاج مع الشوربة وصوص الزبادي."
    ]
  },
  {
    "id": "recipe-160",
    "titleAr": "طاجن خضار بصدر الدجاج",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 916,
    "protein": 109,
    "carbs": 64,
    "fats": 26.2,
    "prepTime": "40 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍲",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_35_53%20PM-1.png",
    "description": "طاجن خضار بصدر الدجاج والجبن والحمص، وجبة غنية وضخمة الماكروز لبناء العضلات.",
    "ingredients": [
      "380 غ صدر دجاج",
      "400 غ خضار مشكلة",
      "10 غ زيت زيتون",
      "15 غ جبنة شيدر أو بارميزان",
      "100 غ حمص مسلوق",
      "70 غ بصل أخضر",
      "50 غ فلفل أحمر"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "اخلط الدجاج والخضار والحمص والبصل الأخضر والفلفل مع الزيت ورتّبها في طاجن.",
      "اخبز الطاجن على مرحلتين حتى ينضج الدجاج وتطرى الخضار، ثم أضف الجبنة في النهاية.",
      "قدّم الطاجن ساخنًا."
    ]
  },
  {
    "id": "recipe-161",
    "titleAr": "فاصوليا بيضاء بالصلصة مع فخذ دجاج",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 703,
    "protein": 83.7,
    "carbs": 37.2,
    "fats": 25.8,
    "prepTime": "35 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_35_55%20PM-2.png",
    "description": "فاصوليا بيضاء بالصلصة مع فخذ الدجاج المشوي والأرز، توازن مثالي بين البروتين والكارب.",
    "ingredients": [
      "400 غ فخذ دجاج منزوع الجلد والعظم",
      "20 غ فاصوليا بيضاء جافة",
      "20 غ أرز",
      "5 غ زيت زيتون",
      "120 غ صلصة طماطم"
    ],
    "steps": [
      "جهّز المكونات بالكميات المذكورة.",
      "اسلق الفاصوليا البيضاء ثم اطبخها بصلصة الطماطم.",
      "اشوِ فخذ الدجاج واسلق الأرز حتى ينضج.",
      "قدّم الفاصوليا بالصلصة مع فخذ الدجاج المشوي والأرز."
    ]
  },
  {
    "id": "recipe-162",
    "titleAr": "فاصوليا بيضاء مع اللحم المفروم",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 726,
    "protein": 74.8,
    "carbs": 54.9,
    "fats": 21.2,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍲",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_35_56%20PM-3.png",
    "description": "يخنة الفاصوليا البيضاء التقليدية باللحم المفروم قليل الدهن مع الأرز لغداء مغذٍ ومشبع.",
    "ingredients": [
      "300 غ لحم مفروم قليل الدهن 3%",
      "35 غ فاصوليا بيضاء جافة",
      "25 غ أرز",
      "5 غ زيت",
      "50 غ بصل",
      "120 غ صلصة طماطم"
    ],
    "steps": [
      "جهّز جميع المكونات.",
      "شوّح البصل ثم أضف اللحم المفروم حتى يتحمر.",
      "أضف صلصة الطماطم والفاصوليا البيضاء المسلوقة واطبخها حتى تتسبك، واسلق الأرز.",
      "قدّم الفاصوليا البيضاء مع اللحم فوق أو بجانب الأرز."
    ]
  },
  {
    "id": "recipe-163",
    "titleAr": "فخذ مشوي مع خضار مشكلة",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 772,
    "protein": 91.4,
    "carbs": 38.3,
    "fats": 28.3,
    "prepTime": "40 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍗",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_35_58%20PM-4.png",
    "description": "صينية دجاج وخضار مشكلة بالفرن بنكهات غنية وتحمير شهي لدعم نمط الحياة الصحي.",
    "ingredients": [
      "420 غ دجاج فخذ وصدر",
      "120 غ بطاطا",
      "100 غ كوسا",
      "100 غ جزر",
      "80 غ قرع",
      "10 غ زيت"
    ],
    "steps": [
      "جهّز الدجاج والخضار بالكميات المذكورة.",
      "تبّل الدجاج والخضار ورتّبها في صينية.",
      "اخبز الدجاج والخضار معًا حتى تنضج وتتحمّر.",
      "قدّم الطبق ساخنًا."
    ]
  },
  {
    "id": "recipe-164",
    "titleAr": "فلافل مشوية",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 713,
    "protein": 59.1,
    "carbs": 87.5,
    "fats": 16.4,
    "prepTime": "30 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🧆",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_36_00%20PM-5.png",
    "description": "فلافل شرقية صحية مشوية بالفرن مدعمة ببروتين الواي لتمنحك طعم الفلافل اللذيذ بدون قلي.",
    "ingredients": [
      "50 غ فول جاف",
      "60 غ حمص جاف",
      "10 غ سمسم",
      "50 غ بيض كامل",
      "20 غ بقدونس",
      "50 غ بصل",
      "8 غ ثوم",
      "10 غ دقيق",
      "30 غ Whey"
    ],
    "steps": [
      "انقع الفول والحمص ثم جهّز جميع المكونات.",
      "اطحن الفول والحمص مع البصل والثوم والبقدونس والبيض والدقيق والواي حتى يتكوّن خليط متماسك.",
      "شكّل أقراص الفلافل، ورش السمسم، ثم اخبزها على 180-200 درجة حتى تتحمر.",
      "قدّم الفلافل المشوية ساخنة."
    ]
  },
  {
    "id": "recipe-165",
    "titleAr": "فيليه سمك مع أرز وخضار",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 842,
    "protein": 89.2,
    "carbs": 61,
    "fats": 28.1,
    "prepTime": "25 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🐟",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_36_05%20PM-7.png",
    "description": "فيليه سمك أبيض مشوي خفيف مع أرز وخضار سوتيه، غني بأوميغا 3 والبروتين الصافي.",
    "ingredients": [
      "400 غ فيليه سمك",
      "50 غ أرز",
      "20 غ زيت",
      "300 غ خضار مسلوقة"
    ],
    "steps": [
      "جهّز السمك والأرز والخضار والمكونات.",
      "ادهن السمك بالزيت وتبّله.",
      "اطبخ السمك في المقلاة الهوائية أو الفرن، واسلق الأرز واطبخ الخضار.",
      "قدّم السمك مع الأرز والخضار."
    ]
  },
  {
    "id": "recipe-166",
    "titleAr": "كبدة مشوية مع لبن",
    "titleEn": "",
    "category": "main_dishes",
    "categoryRaw": "وجبات رئيسية",
    "isHighProtein": true,
    "calories": 742,
    "protein": 81.9,
    "carbs": 42.1,
    "fats": 28.1,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🥩",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%202%2C%202026%2C%2011_36_06%20PM-8.png",
    "description": "كبدة مشوية غنية بالحديد وفيتامين B12 مع خضار سوتيه ولبن رائب بالزعتر.",
    "ingredients": [
      "350 غ كبدة",
      "200 غ لبن 3% دسم",
      "20 غ زعتر",
      "150 غ خضار مشكلة",
      "5 غ زيت"
    ],
    "steps": [
      "جهّز جميع المكونات بالكميات المذكورة.",
      "شوّح أو اشوِ الكبدة بقليل من الزيت حتى تنضج.",
      "اطبخ الخضار ثم أعد الكبدة، وجهّز اللبن مع الزعتر للتقديم.",
      "قدّم الكبدة مع الخضار واللبن."
    ]
  },
  {
    "id": "recipe-167",
    "titleAr": "بيض بالفرن بصفار أقل وبياض أكثر",
    "titleEn": "",
    "category": "breakfast",
    "categoryRaw": "فطور ومخبوزات",
    "isHighProtein": true,
    "calories": 323,
    "protein": 38.5,
    "carbs": 6.5,
    "fats": 14.5,
    "prepTime": "20 دقيقة",
    "difficulty": "سهل",
    "servings": "حصة واحدة",
    "image": "🍳",
    "imageUrl": "https://pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev/ChatGPT%20Image%20Oct%203%2C%202026%2C%2012_04_41%20AM-8.png",
    "description": "قالب بيض بالفرن عالي البروتين بمزيج متوازن من بياض البيض والخضار وجبنة الموزاريلا.",
    "ingredients": [
      "165 غ بياض بيض",
      "100 غ بيض كامل",
      "30 غ موزاريلا",
      "50 غ طماطم",
      "30 غ فلفل رومي"
    ],
    "steps": [
      "اخفق البياض مع البيض الكامل.",
      "أضف الموزاريلا والطماطم والفلفل.",
      "اسكب الخليط في قالب صغير.",
      "اخبزه حتى يتماسك وقدّمه ساخنًا."
    ]
  }
];
