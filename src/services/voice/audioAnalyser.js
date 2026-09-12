/**
 * NEON ACTION AGENT - خدمة تحليل الصوت الحي (Audio Analyser)
 * تستخدم Web Audio API (AudioContext + AnalyserNode) لالتقاط مستوى الصوت وتردداته الحقيقية
 * وتحريك الـ Waveform لحظياً بنبض صوت المستخدم الحقيقي بدون أي تزييف.
 */

export class AudioAnalyser {
  constructor() {
    this.audioCtx = null;
    this.analyser = null;
    this.source = null;
    this.stream = null;
    this.animFrameId = null;
    this.isRunning = false;
    this.frequencyData = null;
    this.timeDomainData = null;
    this.fftSize = 128; // 64 تردد - مثالي للأعمدة المتناسقة
    this.volumeThreshold = 0.04;
    this.silenceTimer = null;
    this.silenceDuration = 1800; // 1.8 ثانية سكوت لاعتبار المستخدم أنهى الجملة
  }

  static isSupported() {
    return typeof window !== 'undefined' &&
      !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia) &&
      !!(window.AudioContext || window.webkitAudioContext);
  }

  async start({ onFrequencyData, onVolumeChange, onVoiceActivity, onSilence, stream: incomingStream } = {}) {
    if (this.isRunning) return;

    try {
      // 1. فتح وتنشيط AudioContext فوراً داخل تفاعل المستخدم المباشر (User Gesture) لتجاوز قيود iOS Safari
      const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
      if (AudioContextClass && !this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        try { await this.audioCtx.resume(); } catch (_) {}
      }

      if (incomingStream) {
        this.stream = incomingStream;
      } else {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          const isSecure = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
          const err = new Error(isSecure
            ? 'متصفحك لا يدعم واجهة المايكروفون (MediaDevices).'
            : 'INSECURE_CONTEXT');
          err.code = isSecure ? 'NOT_SUPPORTED' : 'INSECURE_CONTEXT';
          throw err;
        }

        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      if (!this.audioCtx && AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        await this.audioCtx.resume();
      }

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = this.fftSize;
      this.analyser.smoothingTimeConstant = 0.78; // تنعيم حركة الأعمدة بشكل فائق الانسيابية
      this.analyser.minDecibels = -85;
      this.analyser.maxDecibels = -10;

      this.source = this.audioCtx.createMediaStreamSource(this.stream);
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(bufferLength);
      this.timeDomainData = new Uint8Array(bufferLength);
      this.isRunning = true;

      let hadVoice = false;

      const loop = () => {
        if (!this.isRunning) return;

        this.analyser.getByteFrequencyData(this.frequencyData);
        this.analyser.getByteTimeDomainData(this.timeDomainData);

        // حساب متوسط الطاقة / الصوت الفعلي (RMS)
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += this.frequencyData[i];
        }
        const avg = sum / bufferLength;
        const normalizedVolume = Math.min(1, avg / 128); // من 0 إلى 1

        if (onVolumeChange) onVolumeChange(normalizedVolume);
        if (onFrequencyData) onFrequencyData(this.frequencyData, normalizedVolume);

        const isSpeaking = normalizedVolume > this.volumeThreshold;
        if (isSpeaking) {
          if (!hadVoice) {
            hadVoice = true;
            if (onVoiceActivity) onVoiceActivity(true);
          }
          if (this.silenceTimer) {
            clearTimeout(this.silenceTimer);
            this.silenceTimer = null;
          }
        } else if (hadVoice && !this.silenceTimer) {
          this.silenceTimer = setTimeout(() => {
            if (this.isRunning && hadVoice) {
              hadVoice = false;
              if (onVoiceActivity) onVoiceActivity(false);
              if (onSilence) onSilence();
            }
          }, this.silenceDuration);
        }

        this.animFrameId = requestAnimationFrame(loop);
      };

      this.animFrameId = requestAnimationFrame(loop);
      return true;
    } catch (err) {
      this.stop();
      throw err;
    }
  }

  stop() {
    this.isRunning = false;
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    if (this.source) {
      try { this.source.disconnect(); } catch (_) {}
      this.source = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => {
        try { track.stop(); } catch (_) {}
      });
      this.stream = null;
    }
    if (this.audioCtx && this.audioCtx.state !== 'closed') {
      try { this.audioCtx.close(); } catch (_) {}
      this.audioCtx = null;
    }
    this.analyser = null;
  }
}
