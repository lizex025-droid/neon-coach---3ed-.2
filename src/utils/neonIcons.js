/**
 * NEON COACH - أيقونات النيون الزجاجية الحصرية
 * 16 أيقونة زجاجية نيون خضراء عالية الدقة تحل محل الإيموجيات في جميع شاشات التطبيق
 */

const SUPABASE_ICONS_CDN = 'https://fqwjcacuxsumqpmdsfxc.supabase.co/storage/v1/object/public/app-icons';

export const NEON_ICONS = {
  flame: `${SUPABASE_ICONS_CDN}/neon-flame.png`,      // 🔥 سعرات / طاقة / حرق
  dumbbell: `${SUPABASE_ICONS_CDN}/neon-dumbbell.png`,// 🏋️ تمرين / أثقال / جيم
  calendar: `${SUPABASE_ICONS_CDN}/neon-calendar.png`,// 📅 تقويم / جدول الـ 40 يوم / متابعة
  bell: `${SUPABASE_ICONS_CDN}/neon-bell.png`,        // 🔔 إشعارات / تذكيرات
  pencil: `${SUPABASE_ICONS_CDN}/neon-pencil.png`,    // ✏️ تعديل / تخصيص / تدوين
  check: `${SUPABASE_ICONS_CDN}/neon-check.png`,      // ✅ تم / مكتمل / نجاح / حفظ
  water: `${SUPABASE_ICONS_CDN}/neon-water.png`,      // 💧 ماء / ترطيب
  plate: `${SUPABASE_ICONS_CDN}/neon-plate.png`,      // 🍽️ وجبة / تغذية / صحن
  chart: `${SUPABASE_ICONS_CDN}/neon-chart.png`,      // 📊 إحصائيات / تقدم / تقرير
  target: `${SUPABASE_ICONS_CDN}/neon-target.png`,    // 🎯 هدف / سعرات مستهدفة
  timer: `${SUPABASE_ICONS_CDN}/neon-timer.png`,      // ⏱️ عداد / وقت راحة / مؤقت
  bulb: `${SUPABASE_ICONS_CDN}/neon-bulb.png`,        // 💡 نصائح / أفكار / ذكاء
  shield: `${SUPABASE_ICONS_CDN}/neon-shield.png`,    // 🛡️ أمان / خطة معتمدة / حماية
  camera: `${SUPABASE_ICONS_CDN}/neon-camera.png`,    // 📷 صور / كاميرا / تقرير InBody
  user: `${SUPABASE_ICONS_CDN}/neon-user.png`,        // 👤 حسابي / متدرب / ملف شخصي
  alert: `${SUPABASE_ICONS_CDN}/neon-alert.png`       // ⚠️ تحذير / تنبيه / تجاوز
};


/**
 * دالة مساعدة لإنشاء عنصر أيقونة نيون فوري
 * @param {keyof typeof NEON_ICONS} name
 * @param {number|string} size
 * @param {string} extraClass
 * @param {string} alt
 */
export function neonIcon(name, size = 20, extraClass = '', alt = '') {
  const src = NEON_ICONS[name] || NEON_ICONS.flame;
  const localFallback = `./icons/neon/neon-${name}.png`;
  const s = typeof size === 'number' ? `${size}px` : size;
  return `<img src="${src}" onerror="this.onerror=null;this.src='${localFallback}'" class="neon-icon ${extraClass}" alt="${alt || name}" style="width: ${s}; height: ${s}; object-fit: contain; vertical-align: middle; display: inline-block; filter: drop-shadow(0 0 6px rgba(85,247,165,0.45));" loading="lazy" />`;
}

