import { store } from '../state/store.js';

export const pdfService = {
  /**
   * تصدير التقرير للطباعة وحفظه كـ PDF
   */
  exportReportToPdf() {
    window.print();
  },

  /**
   * مشاركة التقرير عبر Web Share API إن كانت مدعومة مع fallback للنسخ
   */
  async shareReport(reportData) {
    const user = store?.getState?.()?.userProfile || {};
    const name = user.name || 'البطل';
    const change = reportData.weightChangeKg || 0;
    const changeText = change < 0 
      ? `خسارة ${Math.abs(change)} كغ من الوزن 📉` 
      : (change > 0 ? `زيادة ${change} كغ 📈` : 'ثبات الوزن');
    const shareText = `تقرير تقدم NEON COACH لـ ${name}:\n- ${changeText}\n- الوزن الحالي: ${reportData.currentDay?.weight || 0} كغ\n- قوة تمرين الصدر Bench Press: ${reportData.currentDay?.benchPressKg || 0} كغ\n- التزام التدريب: ${reportData.adherence?.trainingPct || 0}%\n- التزام التغذية: ${reportData.adherence?.nutritionPct || 0}%\n- التزام الماء: ${reportData.adherence?.waterPct || 0}%\nلياقتك، خطتك، تقدمك 💚`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NEON Body Report - تقرير التقدم',
          text: shareText,
          url: window.location.href
        });
        return { success: true, method: 'share' };
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.warn('Share error, fallback to clipboard', e);
        }
      }
    }

    // fallback: نسخ الرابط والملخص للحافظة
    try {
      await navigator.clipboard.writeText(shareText);
      return { success: true, method: 'clipboard' };
    } catch (err) {
      return { success: false, method: 'none' };
    }
  }
};
