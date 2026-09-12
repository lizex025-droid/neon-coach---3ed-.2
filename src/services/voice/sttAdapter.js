/**
 * NEON ACTION AGENT - محول التعرف على الصوت (STT Adapter)
 * يدعم الاستماع المستمر باللغة العربية والإنجليزية، مع بث مباشر للنص المؤقت (Interim)
 * والتعامل مع أخطاء الميكروفون بذكاء ودعم المقاطعة الحية (Barge-in).
 */

export class SttAdapter {
  constructor({ lang = 'ar-JO', onInterim, onFinal, onSpeechStart, onError, onStateChange } = {}) {
    this.lang = lang;
    this.onInterim = onInterim;
    this.onFinal = onFinal;
    this.onSpeechStart = onSpeechStart;
    this.onError = onError;
    this.onStateChange = onStateChange;

    this.recognition = null;
    this.isActive = false;
    this.shouldRestart = false;
    this.restartTimeout = null;

    const SpeechRec = typeof window !== 'undefined'
      ? (window.SpeechRecognition || window.webkitSpeechRecognition)
      : null;
    this.SpeechRecClass = SpeechRec;
  }

  static isSupported() {
    return typeof window !== 'undefined' &&
      !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  start() {
    if (this.isActive) return;
    if (!this.SpeechRecClass) {
      if (this.onError) {
        this.onError('متصفحك لا يدعم ميزة التعرف الصوتي المباشر. يمكنك استخدام الإدخال النصي.');
      }
      return;
    }

    this.isActive = true;
    this.shouldRestart = true;
    this._initInstance();
  }

  _initInstance() {
    if (!this.isActive) return;

    try {
      const rec = new this.SpeechRecClass();
      this.recognition = rec;
      rec.lang = this.lang;
      rec.continuous = true;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      rec.onstart = () => {
        if (this.onStateChange) this.onStateChange('listening');
      };

      rec.onspeechstart = () => {
        if (this.onSpeechStart) this.onSpeechStart();
        if (this.onStateChange) this.onStateChange('speech_detected');
      };

      rec.onresult = (event) => {
        if (!this.isActive) return;

        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          const text = result[0].transcript;
          if (result.isFinal) {
            finalTranscript += text;
          } else {
            interimTranscript += text;
          }
        }

        if (interimTranscript && this.onInterim) {
          this.onInterim(interimTranscript);
        }

        if (finalTranscript && this.onFinal) {
          this.onFinal(finalTranscript.trim());
        }
      };

      rec.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        let msg = 'حدث خطأ أثناء التعرف على الصوت.';
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          msg = 'يرجى منح إذن استخدام الميكروفون من إعدادات المتصفح.';
          this.shouldRestart = false;
        } else if (event.error === 'network') {
          msg = 'تحقق من اتصال الإنترنت لخدمة التعرف الصوتي.';
        }

        if (this.onError) this.onError(msg, event.error);
      };

      rec.onend = () => {
        this.recognition = null;
        if (this.isActive && this.shouldRestart) {
          clearTimeout(this.restartTimeout);
          this.restartTimeout = setTimeout(() => {
            if (this.isActive && this.shouldRestart) {
              this._initInstance();
            }
          }, 200);
        } else {
          if (this.onStateChange) this.onStateChange('idle');
        }
      };

      rec.start();
    } catch (err) {
      if (this.onError) this.onError('تعذر تشغيل مستشعر الصوت: ' + (err.message || err));
    }
  }

  setLanguage(newLang) {
    this.lang = newLang;
    if (this.isActive) {
      this.shouldRestart = true;
      if (this.recognition) {
        try { this.recognition.abort(); } catch (_) {}
      }
    }
  }

  stop() {
    this.isActive = false;
    this.shouldRestart = false;
    clearTimeout(this.restartTimeout);
    if (this.recognition) {
      try {
        this.recognition.onend = null;
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
    if (this.onStateChange) this.onStateChange('idle');
  }
}
