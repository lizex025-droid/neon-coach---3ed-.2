/**
 * NEON ACTION AGENT - شاشة المحادثة الصوتية التفاعلية الكاملة (Voice Overlay)
 * تحاكي تجربة Taskmaster بهوية NEON COACH:
 * - شاشة خيال علمي داكنة مع إطار نيون نحيف
 * - Waveform حقيقي يرسم ترددات الميكروفون عبر Canvas
 * - تحول سلس إلى كرة نيون مشعة (Glowing Orb) في حالة التفكير (Thinking)
 * - عرض لحظي للنص (Live Transcript) ومعاينة مباشرة للإجراءات المكتشفة
 */

import { neonActionAgent } from '../../services/neonActionAgent.js';
import '../../styles/voiceAgent.css';

export class NeonVoiceOverlay {
  constructor() {
    this.overlayEl = null;
    this.canvasEl = null;
    this.canvasCtx = null;
    this.animFrameId = null;
    this.isOpen = false;
    this.frequencyData = null;
    this.volume = 0;
    this.isRendering = false;

    // عناصر الـ DOM
    this.heroActivateEl = null;
    this.heroActivateBtnEl = null;
    this.permGuideEl = null;
    this.activeVisualizerEl = null;
    this.stateTextEl = null;
    this.transcriptEl = null;
    this.writtenWrapperEl = null;
    this.writtenReplyEl = null;
    this.previewDeckEl = null;
    this.mainBtnEl = null;
    this.mainBtnLabelEl = null;
    this.undoBtnEl = null;

    this._setupDom();
    this._bindAgentEvents();
  }

  _setupDom() {
    if (document.getElementById('neon-voice-overlay')) {
      this.overlayEl = document.getElementById('neon-voice-overlay');
      this._queryDomElements();
      return;
    }

    const html = `
      <div id="neon-voice-overlay" class="neon-voice-overlay" aria-modal="true" role="dialog">
        <div class="neon-voice-border-frame"></div>

        <!-- رأس الشاشة -->
        <div class="neon-voice-header">
          <div class="neon-voice-title-box">
            <span class="neon-voice-title">NEON ACTION AGENT</span>
            <span class="neon-voice-mode-badge"><span class="dot"></span> الإدخال: صوت · الإخراج: كتابة</span>
          </div>
          <button id="neon-voice-close-btn" class="neon-voice-close-btn" aria-label="إغلاق">✕</button>
        </div>

        <!-- المنطقة البصرية التفاعلية -->
        <div class="neon-voice-visual-zone">

          <!-- 1. شاشة طلب تفعيل المايك (Hero Activate Mic View - على طريقة Taskmaster) -->
          <div id="neon-voice-hero-activate" class="neon-voice-hero-activate">
            <div class="neon-voice-activate-orb-wrap">
              <button id="neon-voice-hero-activate-btn" class="neon-voice-activate-btn" aria-label="تفعيل المايكروفون">
                <div class="neon-voice-activate-rings">
                  <span class="ring r1"></span>
                  <span class="ring r2"></span>
                  <span class="ring r3"></span>
                </div>
                <div class="neon-voice-activate-icon">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                    <line x1="12" y1="19" x2="12" y2="23"></line>
                    <line x1="8" y1="23" x2="16" y2="23"></line>
                  </svg>
                </div>
                <span class="neon-voice-activate-label">ACTIVATE MIC</span>
                <span class="neon-voice-activate-sub">انقر للتفعيل والتحدث</span>
              </button>
            </div>

            <div class="neon-voice-hero-copy">
              <h2 class="neon-voice-hero-title">تفعيل المايكروفون للبدء</h2>
              <p class="neon-voice-hero-desc">انقر لتفعيل المايك والتحدث بصوتك مباشرة مع نيون. المدخلات بصوتك والرد يظهر مكتوباً فوراً على الشاشة بدون صوت.</p>
            </div>

            <!-- إرشادات الإذن في حال الحظر من المتصفح -->
            <div id="neon-voice-perm-guide" class="neon-voice-perm-guide" style="display: none;">
              <div class="perm-icon">🔒</div>
              <div class="perm-text">
                <strong>مطلوب إذن المايكروفون في المتصفح</strong>
                <p>يرجى النقر على أيقونة القفل أو المايكروفون في شريط عنوان المتصفح واختيار "سماح (Allow)" للمايك ثم إعادة النقر على الزر.</p>
                <button id="neon-voice-perm-retry-btn" class="perm-retry-btn">إعادة المحاولة</button>
              </div>
            </div>
          </div>

          <!-- 2. شاشة التفاعل الصوتي الحية (Active Visualizer View) -->
          <div id="neon-voice-active-visualizer" class="neon-voice-active-visualizer" style="display: none;">
            <div class="neon-waveform-container">
              <canvas id="neon-voice-waveform-canvas" class="neon-waveform-canvas"></canvas>
            </div>
            <div class="neon-glowing-orb" id="neon-voice-orb"></div>

            <div class="neon-voice-status-box">
              <span class="neon-voice-label">NEON ACTION AGENT</span>
              <span id="neon-voice-state-text" class="neon-voice-state-text highlight">LISTENING...</span>
            </div>

            <!-- صوت المستخدم المباشر (Voice Input) -->
            <div id="neon-voice-transcript-wrapper" class="neon-voice-box-wrapper transcript-box-wrapper">
              <div class="neon-voice-box-header">
                <span class="neon-box-tag tag-voice">🎙️ صوتك المسموع (Voice Input)</span>
              </div>
              <div id="neon-voice-transcript" class="neon-live-transcript-box">بانتظار كلامك... تحدث الآن بصوتك</div>
            </div>

            <!-- رد المساعد المكتوب على الشاشة (Written Output on Screen) -->
            <div id="neon-voice-written-wrapper" class="neon-voice-box-wrapper written-reply-wrapper" style="display: none;">
              <div class="neon-voice-box-header">
                <span class="neon-box-tag tag-reply">✍️ رد نيون المكتوب (Written Output)</span>
              </div>
              <div id="neon-voice-written-reply" class="neon-written-reply-box"></div>
            </div>

            <!-- معاينة الإجراءات المكتشفة -->
            <div id="neon-voice-preview-deck" class="neon-action-preview-deck"></div>
          </div>

        </div>

        <!-- أزرار التحكم السفلية -->
        <div class="neon-voice-footer">
          <div class="neon-voice-btn-row">
            <button id="neon-voice-main-btn" class="neon-voice-main-btn">
              <span>🎙️</span>
              <span id="neon-voice-main-btn-label">ACTIVATE MIC</span>
            </button>
            <button id="neon-voice-undo-btn" class="neon-voice-undo-btn" disabled>
              <span>↶</span>
              <span>تراجع (Undo)</span>
            </button>
          </div>

          <!-- اقتراحات سريعة -->
          <div class="neon-voice-chips">
            <button class="neon-voice-chip" data-prompt="شربت نص لتر مي">💧 شربت نص لتر</button>
            <button class="neon-voice-chip" data-prompt="وزني اليوم 78.4">⚖️ وزني 78.4</button>
            <button class="neon-voice-chip" data-prompt="عملت بنش 80 كيلو 3 جولات 8 عدات">🏋️ بنش 80 كغ 3×8</button>
            <button class="neon-voice-chip" data-prompt="أخذت الكرياتين">⚡ أخذت الكرياتين</button>
            <button class="neon-voice-chip" data-prompt="شو باقيلي بروتين؟">🥩 باقي البروتين</button>
          </div>
        </div>
      </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div.firstElementChild);

    this.overlayEl = document.getElementById('neon-voice-overlay');
    this._queryDomElements();
    this._bindUserControls();
  }

  _queryDomElements() {
    this.canvasEl = document.getElementById('neon-voice-waveform-canvas');
    this.heroActivateEl = document.getElementById('neon-voice-hero-activate');
    this.heroActivateBtnEl = document.getElementById('neon-voice-hero-activate-btn');
    this.permGuideEl = document.getElementById('neon-voice-perm-guide');
    this.activeVisualizerEl = document.getElementById('neon-voice-active-visualizer');
    this.stateTextEl = document.getElementById('neon-voice-state-text');
    this.transcriptEl = document.getElementById('neon-voice-transcript');
    this.writtenWrapperEl = document.getElementById('neon-voice-written-wrapper');
    this.writtenReplyEl = document.getElementById('neon-voice-written-reply');
    this.previewDeckEl = document.getElementById('neon-voice-preview-deck');
    this.mainBtnEl = document.getElementById('neon-voice-main-btn');
    this.mainBtnLabelEl = document.getElementById('neon-voice-main-btn-label');
    this.undoBtnEl = document.getElementById('neon-voice-undo-btn');

    if (this.canvasEl) {
      this.canvasCtx = this.canvasEl.getContext('2d');
      this._resizeCanvas();
      window.addEventListener('resize', () => this._resizeCanvas());
    }
  }

  _resizeCanvas() {
    if (!this.canvasEl) return;
    const rect = this.canvasEl.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    this.canvasEl.width = (rect.width || 600) * dpr;
    this.canvasEl.height = (rect.height || 110) * dpr;
  }

  _bindUserControls() {
    const closeBtn = document.getElementById('neon-voice-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    // زر تفعيل المايك الكبير (Hero Activate Button)
    if (this.heroActivateBtnEl) {
      this.heroActivateBtnEl.addEventListener('click', () => {
        this._activateMicAction();
      });
    }

    // زر إعادة المحاولة في صندوق إذن المتصفح
    const retryBtn = document.getElementById('neon-voice-perm-retry-btn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        this._activateMicAction();
      });
    }

    // الزر الرئيسي السفلي
    if (this.mainBtnEl) {
      this.mainBtnEl.addEventListener('click', () => {
        const state = neonActionAgent.getState();
        if (state === 'listening' || state === 'speech_detected') {
          neonActionAgent.stopVoiceSession();
          this._updateUiState('stopped');
        } else {
          this._activateMicAction();
        }
      });
    }

    // زر التراجع (Undo)
    if (this.undoBtnEl) {
      this.undoBtnEl.addEventListener('click', () => {
        const res = neonActionAgent.undoLastAction();
        this.undoBtnEl.disabled = !neonActionAgent.hasUndo();
        this._showWrittenReply(res.summaryText ? `↶ تم التراجع: ${res.summaryText}` : '↶ تم التراجع عن آخر إجراء', 'undo');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'UNDO DONE ✓';
        }
      });
    }

    // الأزرار السريعة للاختبار الفوري
    const chips = this.overlayEl?.querySelectorAll('.neon-voice-chip') || [];
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const prompt = chip.dataset.prompt;
        if (prompt) {
          this._showActiveView();
          if (this.transcriptEl) this.transcriptEl.textContent = prompt;
          neonActionAgent.handleUserUtterance(prompt);
        }
      });
    });
  }

  _bindAgentEvents() {
    neonActionAgent.subscribe((eventType, data, state) => {
      switch (eventType) {
        case 'state_change':
          this._updateUiState(state, data);
          break;

        case 'audio_level':
          this.volume = data.volume;
          this.frequencyData = data.frequencyData;
          break;

        case 'transcript':
          if (this.transcriptEl) {
            this.transcriptEl.textContent = data.text || 'بانتظار كلامك... تحدث الآن بصوتك';
          }
          break;

        case 'undo_performed':
          if (this.undoBtnEl) {
            this.undoBtnEl.disabled = !neonActionAgent.hasUndo();
          }
          break;
      }
    });
  }

  async _activateMicAction() {
    if (this.permGuideEl) this.permGuideEl.style.display = 'none';

    // طلب الإذن فوراً وبشكل متزامن داخل تفاعل المستخدم (User Gesture) ليظهره المتصفح فوراً
    let streamPromise = null;
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      streamPromise = navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }

    try {
      this._updateActivateBtnText('طلب الإذن...');
      const stream = streamPromise ? await streamPromise : null;
      await neonActionAgent.startVoiceSession({ stream });
      this._showActiveView();
      this._startWaveformRender();
    } catch (err) {
      console.warn('Microphone activation failed:', err);
      this._showHeroActivateView();
      if (this.permGuideEl) {
        const textP = this.permGuideEl.querySelector('p');
        if (textP) {
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            textP.textContent = 'تم رفض الإذن من المتصفح. اضغط على أيقونة القفل أو المايك في شريط عنوان المتصفح واختر "سماح (Allow)".';
          } else if (!window.isSecureContext && location.protocol !== 'https:') {
            const host = window.location.hostname;
            textP.innerHTML = `يتطلب إذن المايكروفون على iPhone اتصال HTTPS آمن.<br><a href="https://${host}:3443/" style="color:#00F2FE;font-weight:bold;text-decoration:underline;display:inline-block;margin-top:6px;">اضغط هنا للانتقال إلى الرابط الآمن https://${host}:3443</a>`;
          } else {
            textP.textContent = err.message || 'تعذر الحصول على إذن المايكروفون من المتصفح.';
          }
        }
        this.permGuideEl.style.display = 'flex';
      }
      this._updateActivateBtnText('ACTIVATE MIC');
    }
  }

  _updateActivateBtnText(text) {
    const label = this.heroActivateBtnEl?.querySelector('.neon-voice-activate-label');
    if (label) label.textContent = text;
  }

  _showHeroActivateView() {
    if (this.heroActivateEl) this.heroActivateEl.style.display = 'flex';
    if (this.activeVisualizerEl) this.activeVisualizerEl.style.display = 'none';
    if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'ACTIVATE MIC';
    this._stopWaveformRender();
  }

  _showActiveView() {
    if (this.heroActivateEl) this.heroActivateEl.style.display = 'none';
    if (this.activeVisualizerEl) this.activeVisualizerEl.style.display = 'flex';
    if (this.permGuideEl) this.permGuideEl.style.display = 'none';
    if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'LISTENING';
    this._resizeCanvas();
  }

  _showWrittenReply(text, type = 'success') {
    if (!this.writtenWrapperEl || !this.writtenReplyEl) return;
    this.writtenWrapperEl.style.display = 'block';

    let icon = '✓';
    if (type === 'clarification') icon = '❓';
    else if (type === 'error') icon = '⚠️';
    else if (type === 'undo') icon = '↶';
    else if (type === 'query') icon = '📊';

    this.writtenReplyEl.className = `neon-written-reply-box reply-${type} animate-in`;
    this.writtenReplyEl.innerHTML = `
      <div class="reply-content-row">
        <span class="reply-icon-badge">${icon}</span>
        <div class="reply-text-body">${text}</div>
      </div>
    `;
  }

  _updateUiState(state, data = {}) {
    if (!this.overlayEl) return;

    this.overlayEl.classList.remove('state-listening', 'state-processing', 'state-success', 'state-error');

    switch (state) {
      case 'requesting_permission':
        this._updateActivateBtnText('جاري طلب الإذن...');
        if (this.stateTextEl) this.stateTextEl.textContent = 'REQUESTING MIC...';
        break;

      case 'listening':
      case 'mic_ready':
        this._showActiveView();
        this._startWaveformRender();
        this.overlayEl.classList.add('state-listening');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'LISTENING...';
          this.stateTextEl.className = 'neon-voice-state-text highlight';
        }
        if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'LISTENING';
        break;

      case 'speech_detected':
        this._showActiveView();
        this.overlayEl.classList.add('state-listening');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'LISTENING...';
          this.stateTextEl.className = 'neon-voice-state-text highlight';
        }
        break;

      case 'processing':
        this._showActiveView();
        this.overlayEl.classList.add('state-processing');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'UNDERSTANDING...';
          this.stateTextEl.className = 'neon-voice-state-text';
        }
        if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'THINKING';
        break;

      case 'clarification':
        this._showActiveView();
        this.overlayEl.classList.add('state-listening');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'CLARIFICATION NEEDED';
          this.stateTextEl.className = 'neon-voice-state-text highlight';
        }
        this._showWrittenReply(data.reply || 'بانتظار توضيحك...', 'clarification');
        break;

      case 'executing':
        this._showActiveView();
        this.overlayEl.classList.add('state-processing');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'EXECUTING ACTION...';
          this.stateTextEl.className = 'neon-voice-state-text highlight';
        }
        this._renderActionPreviews(data.actions);
        break;

      case 'success':
        this._showActiveView();
        this.overlayEl.classList.add('state-success');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'SAVED ✓';
          this.stateTextEl.className = 'neon-voice-state-text highlight';
        }
        if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'LISTENING';
        if (this.undoBtnEl) this.undoBtnEl.disabled = !neonActionAgent.hasUndo();

        const isQuery = (data.actions || []).some(a => a.tool.startsWith('getToday'));
        this._showWrittenReply(data.reply || 'تم تسجيل الإجراء بنجاح ✓', isQuery ? 'query' : 'success');
        this._renderActionPreviews(data.actions, true);
        break;

      case 'error':
        this.overlayEl.classList.add('state-error');
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'ERROR';
          this.stateTextEl.className = 'neon-voice-state-text';
        }
        if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'RETRY';
        this._showWrittenReply(data.error || 'تعذر فهم أو تنفيذ الطلب.', 'error');
        break;

      case 'stopped':
      case 'idle':
        if (this.stateTextEl) {
          this.stateTextEl.textContent = 'STOPPED';
          this.stateTextEl.className = 'neon-voice-state-text';
        }
        if (this.mainBtnLabelEl) this.mainBtnLabelEl.textContent = 'ACTIVATE MIC';
        this._stopWaveformRender();
        break;
    }
  }

  _renderActionPreviews(actions = [], isComplete = false) {
    if (!this.previewDeckEl) return;
    this.previewDeckEl.innerHTML = '';

    actions.forEach(act => {
      const card = document.createElement('div');
      card.className = 'neon-action-card';

      let tag = 'ACTION';
      let desc = '';

      if (act.tool === 'logWater' || act.tool === 'updateWater') {
        tag = 'WATER';
        desc = `+${act.arguments?.milliliters || 250} ml`;
      } else if (act.tool === 'logWeight' || act.tool === 'updateWeight') {
        tag = 'WEIGHT';
        desc = `${act.arguments?.weightKg} kg`;
      } else if (act.tool === 'logWorkoutSets' || act.tool === 'logWorkoutSet') {
        tag = 'WORKOUT';
        desc = `${act.arguments?.exercise || 'Exercise'} · ${act.arguments?.weightKg || 0} kg × ${act.arguments?.sets || 1} sets × ${act.arguments?.reps || 8} reps`;
      } else if (act.tool === 'logMeal') {
        tag = 'NUTRITION';
        const items = act.arguments?.items || [];
        desc = items.map(i => `${i.nameAr} (${i.grams}g)`).join(' + ');
      } else if (act.tool === 'markSupplementTaken') {
        tag = 'SUPPLEMENT';
        desc = `${act.arguments?.supplement || 'Creatine'} taken`;
      } else if (act.tool === 'logBodyMeasurement') {
        tag = 'MEASURE';
        desc = `Waist: ${act.arguments?.waistCm} cm`;
      } else if (act.tool === 'logSteps') {
        tag = 'STEPS';
        desc = `${act.arguments?.stepsCount} steps`;
      } else if (act.tool === 'addShoppingItems') {
        tag = 'SHOPPING';
        desc = `+ ${(act.arguments?.names || []).join(', ')}`;
      } else if (act.tool === 'getTodayNutrition') {
        tag = 'QUERY';
        desc = 'استعلام البروتين المتبقي';
      } else if (act.tool === 'getTodaySummary') {
        tag = 'QUERY';
        desc = 'ملخص اليوم التدريبي';
      } else {
        tag = act.tool;
        desc = JSON.stringify(act.arguments || {});
      }

      card.innerHTML = `
        <div style="display: flex; align-items: center;">
          <span class="neon-action-badge-tag">${tag}</span>
          <span class="neon-action-card-text">${desc}</span>
        </div>
        <span class="neon-action-card-check">${isComplete ? '✓' : '...'}</span>
      `;

      this.previewDeckEl.appendChild(card);
    });
  }

  /**
   * تشغيل رسم الـ Waveform الحقيقي التفاعلي
   */
  _startWaveformRender() {
    if (this.isRendering) return;
    this.isRendering = true;

    const render = () => {
      if (!this.isRendering) return;

      if (this.canvasCtx && this.canvasEl) {
        const ctx = this.canvasCtx;
        const width = this.canvasEl.width;
        const height = this.canvasEl.height;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        const barCount = 48; // عدد الأعمدة الأفقية
        const spacing = width / barCount;
        const barWidth = Math.max(3, spacing * 0.55);

        // تدرج لوني أخضر نيون مع توهج
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, '#00ff87');
        gradient.addColorStop(0.5, '#55f7a5');
        gradient.addColorStop(1, '#00ff87');

        ctx.fillStyle = gradient;
        ctx.shadowColor = '#00ff87';
        ctx.shadowBlur = this.volume > 0.08 ? 14 : 4;

        for (let i = 0; i < barCount; i++) {
          // محاكاة توزيع الترددات من المنتصف للأطراف بشكل متناظر
          const distFromCenter = Math.abs(i - barCount / 2) / (barCount / 2);
          const freqIndex = Math.floor((1 - distFromCenter) * ((this.frequencyData?.length || 32) * 0.7));
          const freqVal = this.frequencyData ? this.frequencyData[freqIndex] || 0 : 0;

          // الارتفاع يعتمد على صوت الميكروفون الحقيقي
          const activeHeight = (freqVal / 255) * (height * 0.85) * (0.3 + this.volume * 0.7);
          const baselineHeight = 4 + Math.sin(Date.now() * 0.005 + i * 0.3) * 3; // نبض خفيف جداً عند الصمت
          const finalHeight = Math.max(baselineHeight, activeHeight);

          const x = i * spacing + (spacing - barWidth) / 2;
          const y = centerY - finalHeight / 2;

          // رسم العمود بحواف منحنية
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, finalHeight, 3);
          ctx.fill();
        }
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    this.animFrameId = requestAnimationFrame(render);
  }

  _stopWaveformRender() {
    this.isRendering = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  async open(options = {}) {
    if (this.isOpen) return;
    this.isOpen = true;
    this.overlayEl.classList.add('open');
    this._resizeCanvas();
    if (this.undoBtnEl) this.undoBtnEl.disabled = !neonActionAgent.hasUndo();

    // إذا كان المايكروفون يعمل بالفعل (جلسة نشطة)، ننتقل للشاشة النشطة فوراً
    if (neonActionAgent.getState() === 'listening') {
      this._showActiveView();
      this._startWaveformRender();
    } else {
      // إظهار شاشة طلب تفعيل المايكروفون (Activate Mic Hero View)
      this._showHeroActivateView();
      if (options.triggerMicDirectly) {
        this._activateMicAction();
      }
    }
  }

  close() {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.overlayEl.classList.remove('open');
    this._stopWaveformRender();
    neonActionAgent.stopVoiceSession();
    this._showHeroActivateView();
  }
}

export const neonVoiceOverlay = new NeonVoiceOverlay();

