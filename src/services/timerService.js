/**
 * NEON COACH - خدمة التوقيت الدقيق للجلسات وفترات الراحة
 * تعتمد على فرق الـ timestamps لضمان دقة الثواني حتى لو تم تصغير التطبيق أو قفل شاشة الجوال
 */

class TimerService {
  constructor() {
    this.sessionInterval = null;
    this.restInterval = null;
    this.onSessionTick = null;
    this.onRestTick = null;
    this.onRestComplete = null;
  }

  // --- مؤقت مدة الجلسة التدريبية الكاملة ---
  startSessionTimer(startTimeMs, onTick) {
    this.stopSessionTimer();
    this.onSessionTick = onTick;

    this.sessionInterval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.max(0, Math.floor((now - startTimeMs) / 1000));
      if (this.onSessionTick) {
        this.onSessionTick(elapsedSeconds);
      }
    }, 1000);
  }

  stopSessionTimer() {
    if (this.sessionInterval) {
      clearInterval(this.sessionInterval);
      this.sessionInterval = null;
    }
  }

  // --- مؤقت الراحة بين المجموعات ---
  startRestTimer(durationSeconds, onTick, onComplete) {
    this.stopRestTimer();
    const endTimestamp = Date.now() + (durationSeconds * 1000);
    this.onRestTick = onTick;
    this.onRestComplete = onComplete;

    // استدعاء أولي فوري
    if (this.onRestTick) this.onRestTick(durationSeconds);

    this.restInterval = setInterval(() => {
      const remainingSec = Math.max(0, Math.ceil((endTimestamp - Date.now()) / 1000));
      
      if (this.onRestTick) {
        this.onRestTick(remainingSec);
      }

      if (remainingSec <= 0) {
        this.stopRestTimer();
        this.playBeepSound();
        if (this.onRestComplete) {
          this.onRestComplete();
        }
      }
    }, 250);
  }

  stopRestTimer() {
    if (this.restInterval) {
      clearInterval(this.restInterval);
      this.restInterval = null;
    }
  }

  /**
   * تشغيل صوت تنبيه نيون خفيف عند انتهاء الراحة عبر Web Audio API
   */
  playBeepSound() {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
      // تجاهل إذا كان تفاعل المستخدم مقيداً
    }
  }

  formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    const pad = (n) => String(n).padStart(2, '0');
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  }
}

export const timerService = new TimerService();
