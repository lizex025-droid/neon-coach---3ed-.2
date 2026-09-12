// Recognition belongs to a view; all timers and microphone activity end on dispose.
export function createActionVoiceSession({ onCommand, onStatus, lang = 'ar-JO', wakeWord = false, spokenReplies = false, host = window }) {
  const Recognition = host.SpeechRecognition || host.webkitSpeechRecognition;
  let active = false, recognition = null, restartTimer, idleTimer, speakingTimer, generation = 0;
  let awake = !wakeWord;
  const status = (state, text) => onStatus?.(state, text);
  function stop() {
    active = false;
    generation++;
    clearTimeout(restartTimer);
    clearTimeout(idleTimer);
    clearTimeout(speakingTimer);
    if (recognition) {
      recognition.onend = null;
      recognition.abort();
      recognition = null;
    }
    if (spokenReplies) host.speechSynthesis?.cancel();
    status('off', 'الميكروفون متوقف');
  }
  function resetIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { stop(); status('off', 'توقف الاستماع بعد 3 دقائق من عدم النشاط.'); }, 180000);
  }
  function listen() {
    if (!active || recognition) return;
    const instance = new Recognition();
    recognition = instance;
    instance.lang = lang;
    instance.continuous = false;
    instance.interimResults = true;
    let finalReceived = false;
    instance.onstart = () => status('listening', awake ? 'أسمعك… قل أمرك، أو «وقف الاستماع».' : 'بانتظار «يا نيون»…');
    instance.onresult = async event => {
      if (!active || finalReceived) return;
      const result = event.results[event.resultIndex];
      if (!result) return;
      let text = result[0].transcript.trim();
      status('listening', text);
      if (!result.isFinal) return;
      finalReceived = true;
      resetIdle();
      if (!awake) {
        if (!/(?:يا\s+)?(?:نيون|neon)/i.test(text)) return;
        awake = true;
        text = text.replace(/^.*?(?:نيون|neon)[،,:\s]*/i, '').trim();
        if (!text) return;
      }
      const turn = generation;
      instance.onend = null;
      instance.abort();
      recognition = null;
      status('working', 'أنفّذ طلبك…');
      try {
        const reply = await onCommand(text);
        if (!active || turn !== generation) return;
        if (spokenReplies && reply && host.speechSynthesis && host.SpeechSynthesisUtterance) {
          status('speaking', reply);
          await new Promise(resolve => {
            const utterance = new host.SpeechSynthesisUtterance(reply);
            utterance.lang = lang;
            utterance.onend = utterance.onerror = () => { clearTimeout(speakingTimer); resolve(); };
            speakingTimer = setTimeout(() => { host.speechSynthesis.cancel(); resolve(); }, 12000);
            host.speechSynthesis.speak(utterance);
          });
        }
      } catch {
        if (active) status('error', 'تعذر تنفيذ الطلب. جرّب كتابته.');
      } finally {
        if (active && turn === generation) restartTimer = setTimeout(listen, 350);
      }
    };
    instance.onerror = event => {
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      stop();
      status('error', event.error === 'not-allowed' || event.error === 'service-not-allowed'
        ? 'اسمح بالميكروفون من إعدادات المتصفح، ثم جرّب مجدداً.'
        : 'تعذر التعرف على الصوت. تحقق من الاتصال والميكروفون أو اكتب طلبك.');
    };
    instance.onend = () => {
      if (recognition === instance) recognition = null;
      if (active) restartTimer = setTimeout(listen, 350);
    };
    try { instance.start(); } catch { stop(); status('error', 'تعذر تشغيل الميكروفون. استخدم الإدخال الكتابي.'); }
  }
  return {
    start() {
      if (active) return;
      if (!Recognition) { status('error', 'التعرف الصوتي غير مدعوم هنا. يمكنك كتابة الأوامر.'); return; }
      active = true;
      awake = !wakeWord;
      resetIdle();
      status('starting', 'بانتظار إذن الميكروفون…');
      listen();
    },
    stop,
    isActive: () => active
  };
}
