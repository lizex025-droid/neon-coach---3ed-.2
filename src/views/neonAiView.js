/**
 * NEON COACH - واجهة NEON AI المحدثة (AI Action Agent Master View)
 * تصميم Minimal, Premium, Dark, Neon Green فائق التطور
 * الترتيب الرأسي الدقيق:
 * 1. VOICE RECORDING AREA (Real Audio Waveform + Silence Detection)
 * 2. AI RESULT AREA (Action Execution Result Card + Undo)
 * 3. TEXT INPUT AREA (Unified Pipeline - Always Present)
 */

import { aiService } from '../services/aiService.js';
import { store } from '../state/store.js';
import { neonActionAgent } from '../services/neonActionAgent.js';
import { neonSoundService } from '../services/neonSoundService.js';
import '../styles/neonAiMaster.css';

export function renderNeonAiView() {
  const currentKey = aiService.getCustomApiKey('gemini') || '';
  const currentModel = aiService.getActiveModel();

  return `
    <div class="neon-ai-master-container">
      
      <!-- =================================================================
           1. VOICE RECORDING AREA (Taskmaster Voice Orb + Directional Waveform)
           ================================================================= -->
      <section id="neon-ai-voice-card" class="neon-ai-voice-stage" aria-label="منطقة التسجيل الصوتي">
        
        <!-- الدائرة النيون المتوهجة الأيقونية (Taskmaster Glowing Breathing Orb) -->
        <div class="start-circle-wrapper" id="neon-ai-orb-wrapper" role="button" tabindex="0" title="انقر للتحدث مع نيون" aria-label="بدء التسجيل الصوتي">
          <div class="start-circle" id="neon-ai-start-circle"></div>
        </div>

        <!-- مسرح الـ Waveform الانسيابي باتجاه واحد هادئ ومريح للعين -->
        <div class="waveform-container" id="neon-ai-waveform-container" role="button" tabindex="0" title="انقر لإيقاف التسجيل" aria-label="إيقاف التسجيل">
          <canvas id="neon-ai-waveform-canvas" class="waveform-canvas"></canvas>
          <div class="waveform-stop-button" title="إيقاف التسجيل">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <rect x="9" y="9" width="6" height="6" fill="currentColor"></rect>
            </svg>
          </div>
        </div>

        <!-- التغذية الراجعة الصوتية ومسودة الكلام المباشر -->
        <div class="neon-ai-voice-feedback">
          <div id="neon-ai-transcript" class="neon-ai-live-transcript" aria-live="polite"></div>
          <div class="neon-ai-voice-hint" id="neon-ai-voice-hint">
            <span id="neon-ai-timer" class="neon-ai-voice-timer">00:00</span>
            <span id="neon-ai-voice-sub">انقر على الدائرة لبدء التسجيل الصوتي</span>
          </div>
        </div>
      </section>

      <!-- =================================================================
           2. AI RESULT AREA (Middle Tier)
           ================================================================= -->
      <section id="neon-ai-result-card" class="neon-ai-result-card is-empty" aria-live="polite">
        <div class="neon-ai-result-header">
          <div class="neon-ai-result-header-left">
            <span class="neon-ai-result-title">نتيجة NEON AI</span>
            <span id="neon-ai-result-time" class="neon-ai-result-timestamp">الآن</span>
          </div>
          <button type="button" id="neon-ai-undo-btn" class="neon-ai-undo-btn" disabled>
            <span>↶</span>
            <span>تراجع (Undo)</span>
          </button>
        </div>

        <div id="neon-ai-result-body" class="neon-ai-result-body">
          <!-- يتم ملء محتوى النتيجة الحقيقية هنا ديناميكياً -->
        </div>
      </section>

      <!-- =================================================================
           3. TEXT INPUT AREA (Bottom Tier)
           ================================================================= -->
      <form id="neon-ai-form" class="neon-ai-input-card">
        <button type="submit" id="neon-ai-send-btn" class="neon-ai-send-btn">
          <span>إرسال ›</span>
        </button>
        <input 
          type="text" 
          id="neon-ai-text-input" 
          class="neon-ai-text-field" 
          maxlength="4000" 
          placeholder="اكتب سؤالك أو ما أكلت أو تمرينك..." 
          autocomplete="off" 
          aria-label="أدخل طلبك لـ NEON AI"
        />
        <button type="button" id="neon-ai-settings-toggle" class="neon-ai-settings-toggle" title="إعدادات المفتاح" aria-label="الإعدادات">
          <span>•••</span>
        </button>
      </form>

      <!-- لوحة إعدادات المفتاح المنبثقة الخفية (تفتح فقط من زر •••) -->
      <div id="neon-ai-settings-modal" class="neon-ai-settings-modal" role="dialog" aria-modal="true">
        <div class="neon-ai-settings-dialog">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,255,156,0.2); padding-bottom: 10px;">
            <span style="font-weight: 800; color: #00FF9C; font-size: 1.05rem;">إعدادات NEON AI</span>
            <button type="button" id="neon-ai-settings-close-btn" style="background: none; border: none; color: #7E998A; font-size: 1.1rem; cursor: pointer;">✕</button>
          </div>
          <div style="font-size: 0.84rem; color: #00FF9C; line-height: 1.5; background: rgba(0,255,156,0.06); border: 1px solid rgba(0,255,156,0.25); border-radius: 12px; padding: 12px 14px;">
            🔒 <strong>الذكاء الاصطناعي مفعّل ومحمي تلقائياً:</strong><br>
            <span style="color: #c0d8cc; font-size: 0.82rem;">نظام NEON AI متصل بمحرك Google Gemini السحابي المحمي المدمج في الخادم — لا يُطلب من المستخدمين إدخال أي مفتاح.</span>
          </div>
          <div style="font-size: 0.78rem; color: #7E998A; line-height: 1.4; margin-top: 4px;">
            (اختياري فقط) إذا كنت ترغب بتجاوز المفتاح السحابي واستخدام مفتاح شخصي خاص بك:
          </div>
          <input 
            type="password" 
            id="neon-ai-gemini-key-input" 
            value="${currentKey}" 
            placeholder="مفتاح شخصي اختياري (متروك فارغاً افتراضياً)" 
            style="padding: 10px 14px; background: #010603; border: 1px solid rgba(0,255,156,0.3); border-radius: 12px; color: #fff; font-size: 0.88rem; outline: none;"
          />
          <select id="neon-ai-model-select" style="padding: 10px 14px; background: #010603; border: 1px solid rgba(0,255,156,0.3); border-radius: 12px; color: #fff; font-size: 0.85rem; outline: none;">
            <option value="gemini-3.6-flash" selected>Gemini 3.6 Flash (المثبت السحابي - فائق السرعة)</option>
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (مستقر)</option>
            <option value="gemini-1.5-pro">Gemini 1.5 Pro (أعلى دقة)</option>
          </select>
          <div id="neon-ai-key-status" style="font-size: 0.78rem; min-height: 18px;"></div>
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 6px;">
            <button type="button" id="neon-ai-clear-key-btn" style="background: transparent; border: 1px solid rgba(255,85,85,0.4); color: #ff7777; padding: 8px 16px; border-radius: 10px; font-weight: 700; cursor: pointer;">مسح</button>
            <button type="button" id="neon-ai-save-key-btn" style="background: #00FF9C; border: none; color: #020704; padding: 8px 20px; border-radius: 10px; font-weight: 800; cursor: pointer;">حفظ</button>
          </div>
        </div>
      </div>

    </div>
  `;
}

export function bindNeonAiViewEvents() {
  // 1. استخراج عناصر الواجهة
  const voiceCard = document.getElementById('neon-ai-voice-card');
  const orbWrapper = document.getElementById('neon-ai-orb-wrapper');
  const waveformContainer = document.getElementById('neon-ai-waveform-container');
  const canvasEl = document.getElementById('neon-ai-waveform-canvas');
  const voiceSub = document.getElementById('neon-ai-voice-sub');
  const timerEl = document.getElementById('neon-ai-timer');
  const transcriptEl = document.getElementById('neon-ai-transcript');
  
  const resultCard = document.getElementById('neon-ai-result-card');
  const resultTimeEl = document.getElementById('neon-ai-result-time');
  const resultBodyEl = document.getElementById('neon-ai-result-body');
  const undoBtn = document.getElementById('neon-ai-undo-btn');

  const chatForm = document.getElementById('neon-ai-form');
  const chatInput = document.getElementById('neon-ai-text-input');
  const sendBtn = document.getElementById('neon-ai-send-btn');

  const settingsToggle = document.getElementById('neon-ai-settings-toggle');
  const settingsModal = document.getElementById('neon-ai-settings-modal');
  const settingsCloseBtn = document.getElementById('neon-ai-settings-close-btn');
  const saveKeyBtn = document.getElementById('neon-ai-save-key-btn');
  const clearKeyBtn = document.getElementById('neon-ai-clear-key-btn');
  const keyInput = document.getElementById('neon-ai-gemini-key-input');
  const modelSelect = document.getElementById('neon-ai-model-select');
  const keyStatus = document.getElementById('neon-ai-key-status');

  let isRunning = true;
  let isListening = false;
  let timerInterval = null;
  let startTime = 0;
  let animFrameId = null;

  // تحميل مسبق لصوت التأكيد في الخلفية
  neonSoundService.preloadSounds().catch(() => {});

  // تنبيه استباقي خفيف إذا كان المستخدم على هاتف محمول/آيفون برابط غير مشفر (HTTP)
  const isSecureInitial = typeof window !== 'undefined' && (window.isSecureContext || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (!isSecureInitial && window.location.protocol === 'http:' && voiceSub) {
    voiceSub.innerHTML = `🔒 <span style="color: #00F2FE;">للآيفون:</span> انقر هنا للانتقال للرابط الآمن <code>https://</code> لتفعيل المايك`;
  }

  // 2. إعداد الـ Canvas والـ Waveform الانسيابي باتجاه واحد وبسرعة هادئة ومريحة
  const ctx = canvasEl?.getContext('2d');
  let currentFreqData = new Uint8Array(64);
  let currentVolume = 0;
  let smoothedVolume = 0;
  let wavePhase = 0;
  const smoothedBarHeights = [];

  function resizeCanvas() {
    if (!canvasEl || !canvasEl.parentElement) return;
    const rect = canvasEl.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvasEl.width = Math.floor(rect.width * dpr);
    canvasEl.height = Math.floor(rect.height * dpr);
  }

  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  function drawWaveform() {
    if (!isRunning || !ctx || !canvasEl) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = canvasEl.width / dpr;
    const height = canvasEl.height / dpr;
    if (width <= 0 || height <= 0) {
      animFrameId = requestAnimationFrame(drawWaveform);
      return;
    }

    const centerY = height / 2;

    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.save();
    ctx.scale(dpr, dpr);

    const barWidth = 3;
    const barGap = 3.5;
    const step = barWidth + barGap;
    const maxBarHeight = (height / 2) - 4;
    const totalBars = Math.min(54, Math.floor((width - 40) / step));
    const totalW = totalBars * step - barGap;
    const startX = (width - totalW) / 2;

    // تنعيم مستوى الصوت وتحديث المرحلة بسرعة هادئة وبطيئة ومريحة للعين
    smoothedVolume += (currentVolume - smoothedVolume) * 0.16;
    wavePhase += 0.016; // سرعة هادئة وانسيابية (تتحرك باتجاه واحد دون ارتعاش)

    ctx.shadowColor = 'rgba(0, 255, 156, 0.65)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#00FF9C';

    const isProcessing = voiceCard?.classList.contains('is-processing');

    for (let i = 0; i < totalBars; i++) {
      // غلاف قوسي ناعم (Hann Window) لضمان تلاشي الأطراف بسلاسة
      const envelope = Math.sin((i / (totalBars - 1)) * Math.PI);

      let targetH = 2; // حالة السكون

      if (isListening) {
        // حركة باتجاه واحد متصلة (من اليسار لليمين) بدون أي تقاطع أو خطين يدخلان في بعض
        const directionalWave = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(i * 0.22 - wavePhase));
        
        // ربط ناعم مع الترددات الصوتية
        const freqIndex = Math.min(currentFreqData.length - 1, Math.floor((i / totalBars) * currentFreqData.length));
        const freqVal = (currentFreqData[freqIndex] || 0) / 255;
        
        const voiceIntensity = freqVal * 0.68 + smoothedVolume * 0.32;
        targetH = Math.max(2, (2 + voiceIntensity * directionalWave * maxBarHeight * 1.12) * envelope);
      } else if (isProcessing) {
        // موجة معالجة نيونية واحدة تمشي باتجاه واحد ببطء وانسيابية تامة
        const procWave = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(i * 0.16 - wavePhase));
        targetH = Math.max(2, procWave * envelope * (maxBarHeight * 0.52));
      }

      // تنعيم تدريجي للارتفاع يمنع أي وميض أو ارتعاش حاد
      smoothedBarHeights[i] = (smoothedBarHeights[i] || 2) + (targetH - (smoothedBarHeights[i] || 2)) * 0.2;
      const barHeight = smoothedBarHeights[i];

      const x = startX + i * step;
      const topY = centerY - barHeight;
      const totalH = barHeight * 2;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(x, topY, barWidth, totalH, 2);
      } else {
        ctx.rect(x, topY, barWidth, totalH);
      }
      ctx.fill();
    }

    ctx.restore();
    animFrameId = requestAnimationFrame(drawWaveform);
  }

  drawWaveform();

  // 3. إدارة التوقيت الزمني
  function startTimer() {
    stopTimer();
    startTime = Date.now();
    timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
      const secs = String(elapsed % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${mins}:${secs}`;
    }, 500);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    if (timerEl) timerEl.textContent = '00:00';
  }

  // 4. تغيير حالات منطقة الصوت
  function setVoiceState(state, info = {}) {
    voiceCard?.classList.remove('is-listening', 'is-processing');

    switch (state) {
      case 'listening':
        isListening = true;
        voiceCard?.classList.add('is-listening');
        orbWrapper?.classList.add('is-hidden');
        waveformContainer?.classList.add('active', 'visible');
        if (voiceSub) voiceSub.textContent = 'أستمع إليك الآن... تحدث بصوتك المباشر (انقر للإيقاف)';
        startTimer();
        setTimeout(() => resizeCanvas(), 60);
        break;

      case 'processing':
        isListening = false;
        voiceCard?.classList.add('is-processing');
        orbWrapper?.classList.add('is-hidden');
        waveformContainer?.classList.add('active', 'visible');
        if (voiceSub) voiceSub.textContent = 'جاري فهم الإجراء وتحديث سجلاتك...';
        stopTimer();
        break;

      case 'idle':
      default:
        isListening = false;
        orbWrapper?.classList.remove('is-hidden');
        waveformContainer?.classList.remove('active', 'visible');
        if (voiceSub) voiceSub.textContent = 'انقر على الدائرة لبدء التسجيل الصوتي';
        stopTimer();
        currentVolume = 0;
        break;
    }
  }

  // فحص ما إذا كان المتصفح يعمل في بيئة آمنة (Secure Context)
  function isSecureContextEnv() {
    if (typeof window === 'undefined') return true;
    if (window.isSecureContext) return true;
    const host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1';
  }

  // بطاقة توجيه iPhone إلى HTTPS لتمكين إذن المايكروفون
  function renderHttpsRedirectCard() {
    if (!resultBodyEl) return;
    resultCard?.classList.remove('is-empty');
    resultCard?.classList.remove('has-error');
    const host = window.location.hostname;
    const httpsUrl = `https://${host}:3443/#neon-ai`;

    resultBodyEl.innerHTML = `
      <div class="neon-ai-action-badge" style="background: rgba(0, 242, 254, 0.12); color: #00F2FE; border: 1px solid rgba(0, 242, 254, 0.3);">
        <span>🔒 لتشغيل المايكروفون على الآيفون</span>
      </div>
      <div class="neon-ai-action-subject" style="font-size: 1.05rem; line-height: 1.5; color: #fff; margin: 8px 0 10px;">
        متصفح Safari على iPhone يمنع إظهار إذن المايكروفون عبر روابط HTTP العادية. انقر بالأسفل للانتقال للرابط الآمن:
      </div>
      <a href="${httpsUrl}" style="display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px 16px; background: linear-gradient(135deg, #00f2fe, #4facfe); color: #05070f; font-weight: 800; font-size: 1rem; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 18px rgba(0, 242, 254, 0.35); margin-bottom: 12px;">
        <span>الانتقال للرابط الآمن https://${host}:3443</span>
        <span style="font-size: 1.15rem;">↗</span>
      </a>
      <div style="background: rgba(255, 255, 255, 0.04); border: 1px dashed rgba(0, 242, 254, 0.3); border-radius: 10px; padding: 10px 12px; font-size: 0.82rem; color: #94A3B8; line-height: 1.55; text-align: right;">
        <strong style="color: #00FF9C;">📌 خطوة واحدة بسيطة عند فتح الرابط:</strong><br>
        اضغط على <strong>"إظهار التفاصيل (Show Details)"</strong> ثم <strong>"زيارة هذا الموقع الإلكتروني (visit this website)"</strong>، وبعدها سيطلب منك سفاري إذن المايكروفون وتضغط <strong>[سماح / Allow]</strong> فوراً!
      </div>
    `;
    showResultCard();
  }

  // 5. بدء وإيقاف جلسة الصوت الحقيقية
  async function toggleVoiceSession() {
    if (isListening) {
      neonActionAgent.stopVoiceSession();
      setVoiceState('idle');
      return;
    }

    // إذا كان المستخدم على هاتف iPhone عبر رابط غير مشفر HTTP، نوجهه فوراً للرابط الآمن HTTPS
    if (!isSecureContextEnv() && window.location.protocol === 'http:') {
      renderHttpsRedirectCard();
      return;
    }

    // تهيئة الصوت وتشغيل نغمة التأكيد المباشرة مع تفاعل المستخدم
    neonSoundService.initializeAudio();
    neonSoundService.playAcknowledgement();

    try {
      setVoiceState('listening');
      if (transcriptEl) transcriptEl.textContent = 'بانتظار كلامك...';

      await neonActionAgent.startVoiceSession({
        onFrequencyData: (freqData, volume) => {
          currentFreqData = freqData;
          currentVolume = volume;
        }
      });
    } catch (err) {
      console.error('Voice start failed:', err);
      setVoiceState('idle');
      if (err.code === 'INSECURE_CONTEXT' || err.message === 'INSECURE_CONTEXT' || !isSecureContextEnv()) {
        renderHttpsRedirectCard();
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        displayResultError('تم رفض إذن المايكروفون. يرجى السماح به من إعدادات المتصفح أو أيقونة aA في شريط العنوان.');
      } else {
        displayResultError(err.message || 'تعذر فتح الميكروفون — يرجى السماح بالإذن في المتصفح.');
      }
    }
  }

  orbWrapper?.addEventListener('click', () => {
    toggleVoiceSession();
  });

  orbWrapper?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleVoiceSession();
    }
  });

  waveformContainer?.addEventListener('click', () => {
    toggleVoiceSession();
  });

  // 6. الاستماع لأحداث الوكيل الصوتي (neonActionAgent)
  const unsubscribeAgent = neonActionAgent.subscribe((eventType, data, state) => {
    if (!isRunning) return;

    if (eventType === 'transcript') {
      if (transcriptEl && data?.text) {
        transcriptEl.textContent = data.text;
      }
    } else if (eventType === 'state_change') {
      if (state === 'processing' || state === 'executing') {
        setVoiceState('processing');
      } else if (state === 'listening' || state === 'speech_detected') {
        setVoiceState('listening');
      } else if (state === 'idle' || state === 'stopped') {
        setVoiceState('idle');
      }
    } else if (eventType === 'success') {
      setVoiceState('idle');
      renderSuccessResult(data);
    } else if (eventType === 'clarification') {
      setVoiceState('idle');
      renderClarificationResult(data.reply);
    } else if (eventType === 'error') {
      setVoiceState('idle');
      displayResultError(data.error || 'تعذر معالجة الطلب');
    }
  });

  // 7. المعالجة الموحدة للأوامر (Voice + Text)
  async function handleUnifiedInput(rawText) {
    const text = (rawText || '').trim();
    if (!text) return;

    setVoiceState('processing');
    if (chatInput) chatInput.value = '';
    if (sendBtn) sendBtn.disabled = true;

    try {
      const response = await neonActionAgent.handleUserUtterance(text);

      if (!response) {
        // إذا لم يكن إجراءً، تجربة الإجابة الذكية
        const state = store.getState();
        const fallbackReply = await aiService.chatWithCoach(text, {
          userProfile: state.userProfile,
          today: state.today,
          loggedMeals: state.loggedMeals || []
        }, []);

        setVoiceState('idle');
        renderGeneralAnswerResult(fallbackReply.reply || 'تم استلام استفسارك.');
      }
    } catch (err) {
      console.error('Unified execution error:', err);
      setVoiceState('idle');
      displayResultError(err.message || 'حدث خطأ أثناء التنفيذ.');
    } finally {
      if (sendBtn) sendBtn.disabled = false;
    }
  }

  chatForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = chatInput?.value || '';
    if (val) handleUnifiedInput(val);
  });

  // 8. رسم وعرض بطاقة النتيجة (Result Card Rendering)
  function showResultCard() {
    if (!resultCard) return;
    resultCard.classList.remove('is-empty');
    resultCard.classList.add('animate-in', 'has-action');
    voiceCard?.classList.add('compact');
    if (undoBtn) undoBtn.disabled = !neonActionAgent.hasUndo();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    if (resultTimeEl) resultTimeEl.textContent = `الآن · ${timeStr}`;

    setTimeout(() => resizeCanvas(), 100);
  }

  function renderSuccessResult(data) {
    if (!resultBodyEl) return;

    const actions = data.actions || [];
    const results = data.results || [];

    // في حال وجود إجراء تمرين
    const workoutAction = actions.find(a => a.tool === 'logWorkoutSets' || a.tool === 'logWorkoutSet');
    // إنهاء جلسة التمرين
    const completeWorkoutAction = actions.find(a => a.tool === 'completeWorkout');
    // في حال وجود إجراء ماء
    const waterAction = actions.find(a => a.tool === 'logWater' || a.tool === 'updateWater');
    // في حال وجود إجراء وزن
    const weightAction = actions.find(a => a.tool === 'logWeight' || a.tool === 'updateWeight');
    // في حال وجود إجراء وجبة
    const mealAction = actions.find(a => a.tool === 'logMeal' || a.tool === 'updateMeal');
    // مكملات
    const suppAction = actions.find(a => a.tool === 'markSupplementTaken' || a.tool === 'logSupplement');
    // مشتريات
    const shopAddAction = actions.find(a => a.tool === 'addShoppingItems' || a.tool === 'addShoppingItem');
    const shopRemAction = actions.find(a => a.tool === 'removeShoppingItem');
    // أولوية اليوم
    const prioAction = actions.find(a => a.tool === 'prioritize_today');
    // استعلام البروتين والتغذية
    const nutritionQueryAction = actions.find(a => a.tool === 'getTodayNutrition');
    // استعلام ملخص اليوم
    const summaryQueryAction = actions.find(a => a.tool === 'getTodaySummary');
    // إيقاف الاستماع
    const stopVoiceAction = actions.find(a => a.tool === 'stopVoiceSession');

    // إذا كانت أوامر متعددة (أكثر من إجراء واحد)
    if (actions.length > 1) {
      let rowsHtml = '<div class="neon-ai-multi-actions">';
      actions.forEach(act => {
        let label = 'إجراء';
        let val = '';
        if (act.tool === 'completeWorkout') {
          label = 'تمرين';
          val = `${act.arguments.title || 'إكمال التمرين'} ✓`;
        } else if (act.tool.includes('Workout')) {
          label = 'تمرين';
          val = `${act.arguments.exercise || 'تمرين'} · ${act.arguments.weightKg}كغ × ${act.arguments.reps} × ${act.arguments.sets || 1}`;
        } else if (act.tool.includes('Water')) {
          label = 'ماء';
          val = `+${act.arguments.milliliters} مل`;
        } else if (act.tool.includes('Weight')) {
          label = 'وزن';
          val = `${act.arguments.weightKg} كغ`;
        } else if (act.tool.includes('Meal')) {
          label = 'تغذية';
          val = `${act.arguments.items?.map(i => i.nameAr).join(' + ') || 'وجبة'}`;
        } else if (act.tool.includes('Supplement')) {
          label = 'مكمل';
          val = `${act.arguments.supplement || 'مكمل'} ✓`;
        } else if (act.tool.includes('Shopping')) {
          label = 'مشتريات';
          val = `${(act.arguments.names || [act.arguments.name || '']).join(' و ')}`;
        } else if (act.tool === 'prioritize_today') {
          label = 'أولويات';
          val = `تقديم ${act.arguments.priority || 'التمرين'}`;
        }
        rowsHtml += `
          <div class="neon-ai-action-row">
            <div class="neon-ai-action-row-left"><span>✓</span><span>${label}</span></div>
            <div class="neon-ai-action-row-val">${val}</div>
          </div>
        `;
      });
      rowsHtml += '</div>';

      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge">
          <span>✓ تم تنفيذ ${actions.length} إجراءات بنجاح</span>
        </div>
        ${rowsHtml}
        <div class="neon-ai-action-footer-note">تم الحفظ والمزامنة الفورية في كافة السجلات</div>
      `;
      showResultCard();
      return;
    }

    // إنهاء التمرين
    if (completeWorkoutAction) {
      const title = completeWorkoutAction.arguments.title || 'جلسة تدريبية';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(85,247,165,0.15); color: #55F7A5; border-color: rgba(85,247,165,0.3);">
          <span>🏆 تم إنهاء تمرين اليوم</span>
        </div>
        <div class="neon-ai-action-subject">${title}</div>
        <div class="neon-ai-action-metric">تم تسجيله كمكتمل في سجل تاريخ التمارين واليوم ✓</div>
        <div class="neon-ai-action-footer-note">عاش يا بطل! تم التحديث فوراً في صفحة اليوم</div>
      `;
      showResultCard();
      return;
    }

    // تمرين مفرد مع فحص PR
    if (workoutAction) {
      const ex = workoutAction.arguments.exercise || 'تمرين';
      const w = workoutAction.arguments.weightKg || 0;
      const r = workoutAction.arguments.reps || 8;
      const s = workoutAction.arguments.sets || 1;
      const isPr = (data.results?.[0]?.summaryText || '').includes('PR') || (data.results?.[0]?.summaryText || '').includes('🏆');

      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="${isPr ? 'background: rgba(255,215,0,0.15); color: #FFD700; border-color: rgba(255,215,0,0.3);' : ''}">
          <span>${isPr ? '🏆 رقم قياسي جديد (PR)!' : '✓ تم تسجيل التمرين'}</span>
        </div>
        <div class="neon-ai-action-subject">${ex}</div>
        <div class="neon-ai-action-metric">${w} كيلو × ${r} عدات ${s > 1 ? `× ${s} جولات` : ''}</div>
        <div class="neon-ai-action-footer-note">${isPr ? 'أعلى إنجاز مسجل لهذا التمرين! تم حفظه في الـ PRs' : 'تم الحفظ في سجل التمرين'}</div>
      `;
      showResultCard();
      return;
    }

    // ماء مفرد
    if (waterAction) {
      const ml = waterAction.arguments.milliliters || 0;
      const todayWater = store.getState().today.consumedWaterLiters || 0;
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge">
          <span>✓ تم تسجيل الماء</span>
        </div>
        <div class="neon-ai-action-subject">+${ml} مل</div>
        <div class="neon-ai-action-metric">المجموع اليومي: ${todayWater} لتر</div>
        <div class="neon-ai-action-footer-note">تم التحديث الفوري في بطاقة الترطيب بتاب اليوم</div>
      `;
      showResultCard();
      return;
    }

    // وزن مفرد
    if (weightAction) {
      const wt = weightAction.arguments.weightKg || 0;
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge">
          <span>✓ تم تحديث الوزن</span>
        </div>
        <div class="neon-ai-action-subject">${wt} كغ</div>
        <div class="neon-ai-action-footer-note">تم تحديث الوزن في البروفايل ومخطط التقدم</div>
      `;
      showResultCard();
      return;
    }

    // وجبة غذائية
    if (mealAction) {
      const items = mealAction.arguments.items || [];
      const name = items.map(i => `${i.nameAr} (${i.grams}غ)`).join(' + ') || 'وجبة غذائية';
      const cals = items.reduce((s, i) => s + (i.calories || 0), 0);
      const prot = items.reduce((s, i) => s + (i.protein || 0), 0);
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge">
          <span>✓ تم تسجيل الوجبة</span>
        </div>
        <div class="neon-ai-action-subject">${name}</div>
        <div class="neon-ai-action-metric">${cals} سعرة · ${prot}غ بروتين</div>
        <div class="neon-ai-action-footer-note">تم الخصم مباشرة من السعرات والماكروز في تاب اليوم</div>
      `;
      showResultCard();
      return;
    }

    // مكمل غذائي
    if (suppAction) {
      const supp = suppAction.arguments.supplement || 'المكمل';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(85,247,165,0.15); color: #55F7A5; border-color: rgba(85,247,165,0.3);">
          <span>💊 تم تسجيل المكمل</span>
        </div>
        <div class="neon-ai-action-subject">${supp}</div>
        <div class="neon-ai-action-metric">تم تأكيد تناوله اليوم بنجاح ✓</div>
        <div class="neon-ai-action-footer-note">تم التحديث في جدول مكملاتك اليومية (Daily Stack)</div>
      `;
      showResultCard();
      return;
    }

    // إضافة للمشتريات
    if (shopAddAction) {
      const names = shopAddAction.arguments.names || (shopAddAction.arguments.name ? [shopAddAction.arguments.name] : []);
      const listStr = names.join(' و ') || 'أصناف التسوق';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(56,189,248,0.15); color: #38BDF8; border-color: rgba(56,189,248,0.3);">
          <span>🛒 قائمة المشتريات</span>
        </div>
        <div class="neon-ai-action-subject">${listStr}</div>
        <div class="neon-ai-action-metric">تمت الإضافة إلى قائمة التسوق بنجاح ✓</div>
        <div class="neon-ai-action-footer-note">يمكنك مراجعتها في قسم خطة التغذية والتسوق</div>
      `;
      showResultCard();
      return;
    }

    // حذف من المشتريات
    if (shopRemAction) {
      const name = shopRemAction.arguments.name || 'العنصر';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(255,107,107,0.15); color: #FF6B6B; border-color: rgba(255,107,107,0.3);">
          <span>🗑️ حذف من المشتريات</span>
        </div>
        <div class="neon-ai-action-subject">${name}</div>
        <div class="neon-ai-action-metric">تمت إزالته من قائمة التسوق ✓</div>
        <div class="neon-ai-action-footer-note">تم تحديث قائمة المشتريات فورياً</div>
      `;
      showResultCard();
      return;
    }

    // أولوية اليوم
    if (prioAction) {
      const labelsAr = { workout: 'التمرين', nutrition: 'التغذية', water: 'الماء', supplements: 'المكملات' };
      const rawKind = prioAction.arguments.priority || prioAction.arguments.kind || 'workout';
      const label = labelsAr[rawKind] || 'التمرين';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(255,215,0,0.15); color: #FFD700; border-color: rgba(255,215,0,0.3);">
          <span>⭐ إعادة ترتيب الأولويات</span>
        </div>
        <div class="neon-ai-action-subject">${label} هو الأولوية الأولى</div>
        <div class="neon-ai-action-metric">تم رفع بطاقة ${label} لأعلى الصفحة في تاب اليوم ✓</div>
        <div class="neon-ai-action-footer-note">تم تحديث ترتيب أولويات يومك بنجاح</div>
      `;
      showResultCard();
      return;
    }

    // استعلام البروتين
    if (nutritionQueryAction) {
      const rep = data.reply || (results[0]?.summaryText) || 'معلومات الماكروز';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(85,247,165,0.15); color: #55F7A5; border-color: rgba(85,247,165,0.3);">
          <span>🍗 استعلام البروتين</span>
        </div>
        <div class="neon-ai-action-subject" style="font-size: 1.15rem; line-height: 1.5;">${rep}</div>
        <div class="neon-ai-action-footer-note">استناداً إلى أهدافك والوجبات المسجلة اليوم</div>
      `;
      showResultCard();
      return;
    }

    // استعلام ملخص اليوم
    if (summaryQueryAction) {
      const rep = data.reply || (results[0]?.summaryText) || 'ملخص اليوم';
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(85,247,165,0.15); color: #55F7A5; border-color: rgba(85,247,165,0.3);">
          <span>📋 ملخص يومك الشامل</span>
        </div>
        <div class="neon-ai-action-subject" style="font-size: 1.05rem; line-height: 1.6; font-weight: 600;">${rep}</div>
        <div class="neon-ai-action-footer-note">كافة بياناتك متزامنة ومحدثة في لوحة التحكم</div>
      `;
      showResultCard();
      return;
    }

    // إيقاف الاستماع
    if (stopVoiceAction) {
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge" style="background: rgba(255,107,107,0.15); color: #FF6B6B; border-color: rgba(255,107,107,0.3);">
          <span>🛑 إيقاف الاستماع</span>
        </div>
        <div class="neon-ai-action-subject">أوقفت الاستماع الصوتي</div>
        <div class="neon-ai-action-metric">الميكروفون مغلق الآن ✓</div>
        <div class="neon-ai-action-footer-note">انقر على الدائرة في أي وقت لإعادة التشغيل</div>
      `;
      showResultCard();
      return;
    }

    // أي استجابة أخرى أو استعلام (Question/Query)
    const reply = data.reply || 'تم تنفيذ العملية بنجاح ✓';
    resultBodyEl.innerHTML = `
      <div class="neon-ai-action-badge">
        <span>✓ نتيجة الاستعلام</span>
      </div>
      <div class="neon-ai-action-subject">${reply}</div>
      <div class="neon-ai-action-footer-note">استناداً إلى سجلاتك المحدثة اليوم</div>
    `;
    showResultCard();
  }

  function renderGeneralAnswerResult(replyText) {
    if (!resultBodyEl) return;
    resultBodyEl.innerHTML = `
      <div class="neon-ai-action-badge">
        <span>✓ إجابة NEON AI</span>
      </div>
      <div class="neon-ai-action-metric" style="font-size: 1.15rem; color: #FFFFFF; line-height: 1.6; text-align: center; max-width: 800px;">
        ${replyText}
      </div>
    `;
    showResultCard();
  }

  function renderClarificationResult(questionText) {
    if (!resultBodyEl) return;
    resultBodyEl.innerHTML = `
      <div class="neon-ai-clarification-box">
        <div class="neon-ai-clarification-text">❓ ${questionText}</div>
        <div class="neon-ai-action-footer-note">تحدث الآن بالإجابة أو اكتبها في الأسفل</div>
      </div>
    `;
    showResultCard();
    // تفعيل الاستماع الصوتي فوراً لمساعدة المستخدم بالرد
    setTimeout(() => {
      if (!isListening) toggleVoiceSession();
    }, 400);
  }

  function displayResultError(errorMessage) {
    if (!resultBodyEl) return;
    resultCard?.classList.add('has-error');
    resultBodyEl.innerHTML = `
      <div style="color: #FF5555; font-weight: 800; font-size: 1.1rem; margin-bottom: 4px;">⚠️ ${errorMessage}</div>
      <button type="button" id="neon-ai-retry-btn" class="neon-ai-undo-btn" style="border-color: rgba(255,85,85,0.4); color: #FFAAAA; margin-top: 8px;">
        إعادة المحاولة
      </button>
    `;
    showResultCard();
    document.getElementById('neon-ai-retry-btn')?.addEventListener('click', () => {
      toggleVoiceSession();
    });
  }

  // 9. زر التراجع (Undo)
  undoBtn?.addEventListener('click', () => {
    if (!neonActionAgent.hasUndo()) return;
    const res = neonActionAgent.undo();
    if (res && res.success) {
      resultBodyEl.innerHTML = `
        <div class="neon-ai-action-badge">
          <span>↶ تم التراجع بنجاح</span>
        </div>
        <div class="neon-ai-action-subject">${res.summaryText || 'تم التراجع عن الإجراء السابق'}</div>
        <div class="neon-ai-action-footer-note">تم استرجاع السجلات للحالة السابقة</div>
      `;
      undoBtn.disabled = !neonActionAgent.hasUndo();
    }
  });

  // 10. إعدادات المفتاح والنموذج (Sleek Modal)
  settingsToggle?.addEventListener('click', () => {
    settingsModal?.classList.add('is-open');
    if (keyInput) keyInput.value = aiService.getCustomApiKey('gemini') || '';
  });

  settingsCloseBtn?.addEventListener('click', () => {
    settingsModal?.classList.remove('is-open');
  });

  settingsModal?.addEventListener('click', (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove('is-open');
    }
  });

  saveKeyBtn?.addEventListener('click', () => {
    const k = (keyInput?.value || '').trim();
    if (k) {
      aiService.setCustomApiKey('gemini', k);
      if (modelSelect) aiService.setActiveModel(modelSelect.value);
      if (keyStatus) {
        keyStatus.textContent = '✅ تم حفظ المفتاح بنجاح!';
        keyStatus.style.color = '#00FF9C';
      }
      setTimeout(() => settingsModal?.classList.remove('is-open'), 1200);
    }
  });

  clearKeyBtn?.addEventListener('click', () => {
    aiService.setCustomApiKey('gemini', '');
    if (keyInput) keyInput.value = '';
    if (keyStatus) {
      keyStatus.textContent = 'تم مسح المفتاح والعودة للوضع المحلي.';
      keyStatus.style.color = '#7E998A';
    }
  });

  // تنظيف الموارد عند مغادرة الشاشة
  return () => {
    isRunning = false;
    if (animFrameId) cancelAnimationFrame(animFrameId);
    stopTimer();
    unsubscribeAgent();
    window.removeEventListener('resize', resizeCanvas);
    if (isListening) neonActionAgent.stopVoiceSession();
  };
}
