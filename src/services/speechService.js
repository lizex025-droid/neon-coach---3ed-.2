/**
 * NEON COACH - خدمة التعرف الصوتي باللغة العربية
 */

export const speechService = {
  isSupported() {
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  },

  startListening(onResult, onError, onEnd) {
    if (!this.isSupported()) {
      onError('التعرف الصوتي غير مدعوم في متصفحك الحالي. يرجى استخدام الإدخال الكتابي.');
      return null;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        if (event.results && event.results[0] && event.results[0][0]) {
          const transcript = event.results[0][0].transcript;
          onResult(transcript);
        }
      };

      recognition.onerror = (event) => {
        onError(`خطأ في التسجيل الصوتي: ${event.error || 'تم رفض الإذن'}`);
      };

      recognition.onend = () => {
        if (onEnd) onEnd();
      };

      recognition.start();
      return recognition;
    } catch (err) {
      onError('تعذر بدء التعرف الصوتي.');
      return null;
    }
  }
};
