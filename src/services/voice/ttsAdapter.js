/**
 * NEON ACTION AGENT - محول الرد الصوتي (TTS Adapter)
 * يضمن ردوداً صوتية سريعة ومقتضبة جداً ("تم", "سجلته", "تسجل")
 * مع دعم المقاطعة الفورية (Barge-in Cancelation).
 */

export class TtsAdapter {
  constructor({ defaultLang = 'ar-SA' } = {}) {
    this.defaultLang = defaultLang;
    this.synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isSpeakingNow = false;
    this.currentUtterance = null;
    this.voices = [];

    if (this.synth && typeof window !== 'undefined') {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices() || [];
    } catch (_) {}
  }

  _pickVoice(lang) {
    if (!this.voices || this.voices.length === 0) {
      this._loadVoices();
    }
    const prefix = (lang || this.defaultLang).split('-')[0].toLowerCase();
    // البحث عن صوت يطابق اللغة المفضلة
    const match = this.voices.find(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
    return match || null;
  }

  speak(text, { lang = null, onStart, onEnd } = {}) {
    if (!this.synth || !text) {
      if (onEnd) onEnd();
      return;
    }

    this.stop(); // إلغاء أي كلام سابق فوراً

    const utterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance = utterance;
    const targetLang = lang || this.defaultLang;
    utterance.lang = targetLang;
    utterance.rate = 1.08; // نبرة سريعة واثقة ورشيقة
    utterance.pitch = 1.0;

    const voice = this._pickVoice(targetLang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeakingNow = true;
      if (onStart) onStart();
    };

    utterance.onend = () => {
      this.isSpeakingNow = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    utterance.onerror = () => {
      this.isSpeakingNow = false;
      this.currentUtterance = null;
      if (onEnd) onEnd();
    };

    try {
      this.synth.speak(utterance);
    } catch (_) {
      this.isSpeakingNow = false;
      if (onEnd) onEnd();
    }
  }

  stop() {
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (_) {}
    }
    this.isSpeakingNow = false;
    this.currentUtterance = null;
  }

  isSpeaking() {
    return this.isSpeakingNow;
  }
}
