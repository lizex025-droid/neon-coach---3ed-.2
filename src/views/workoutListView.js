/**
 * NEON COACH - شاشة جدول التدريب الأساسي المعتمد
 * تم اعتماد جدول تمرين الـ 40 يوم (40-days-workout) كجدول رسمي وحصري للتطبيق
 */

export function renderWorkoutListView() {
  return `
    <div class="workout-list-container" style="padding: 24px 16px 96px; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; gap: 18px;">
      
      <div class="neon-card glow" style="padding: 32px 24px; border-color: #55F7A5; max-width: 480px; width: 100%; background: linear-gradient(135deg, rgba(8,24,16,0.95), rgba(4,12,8,0.98));">
        <div style="font-size: 2.4rem; margin-bottom: 8px;">🏋️</div>
        <h1 style="font-size: 1.5rem; font-weight: 900; color: #FFFFFF; margin-bottom: 8px;">
          جدول تمارين الـ 40 يوماً
        </h1>
        <div class="badge badge-neon" style="margin-bottom: 14px; display: inline-block;">
          الجدول التدريبي الأساسي المعتمد
        </div>
        <p style="font-size: 0.9rem; color: #B8C0BC; line-height: 1.6; margin-bottom: 24px;">
          جاري تجهيز وتحميل جدول تمارين الـ 40 يوماً الشامل (Push / Pull / Legs)...
        </p>
        <a href="./40-days-workout.html?book=fortyDay" class="btn btn-primary btn-block" style="border-radius: 16px; font-weight: 900; font-size: 1rem; padding: 14px 20px;">
          دخول جدول تمارين الـ 40 يوماً ▶
        </a>
      </div>

    </div>
  `;
}

export function bindWorkoutListEvents() {
  // Only the explicit link leaves the SPA; rendering never schedules navigation.
}
