/**
 * NEON ACTION AGENT - المنسق المركزي للعميل الصوتي والأدوات (Universal Action Agent)
 * يربط بين: ميكروفون المستخدم، الـ Audio Analyser، محول STT، ومحول TTS، ومحرك فك التشفير المحلي،
 * وبوابة الذكاء الاصطناعي، ونظام الـ Undo المتكامل، ومخزن الحالة المركزي (Store)، و Supabase.
 */

import { AudioAnalyser } from './voice/audioAnalyser.js';
import { SttAdapter } from './voice/sttAdapter.js';
import { TtsAdapter } from './voice/ttsAdapter.js';
import { parseNaturalAction } from '../domain/actionParser.js';
import { isWriteActionTool, validateToolArgs } from '../domain/actionToolsRegistry.js';
import { store } from '../state/store.js';
import { syncService } from './syncService.js';
import { neonSoundService } from './voice/neonSoundService.js';

class NeonActionAgent {
  constructor() {
    this.audioAnalyser = new AudioAnalyser();
    this.tts = new TtsAdapter();
    this.stt = null;

    this.state = 'idle'; // idle, requesting_permission, mic_ready, listening, speech_detected, processing, clarification, executing, success, error, stopped
    this.listeners = new Set();

    // ذاكرة السياق القصير للجلسة (Short-term session memory)
    this.sessionContext = {
      lastExercise: null,
      lastSets: null,
      lastReps: null,
      lastWeight: null,
      lastWaterMl: null,
      pendingClarification: null,
      pendingExercise: null,
      pendingWeight: null
    };

    // سجل التراجع الدقيق (Undo Stack)
    this.undoStack = [];
    this.spokenReplies = false; // الإخراج كتابة على الشاشة فقط بدون صوت
    this.lang = 'ar-JO';
    this.lastInterimText = '';

    this._initStt();
  }

  _initStt() {
    this.stt = new SttAdapter({
      lang: this.lang,
      onSpeechStart: () => {
        // ميزة المقاطعة الحية (Barge-in): إيقاف صوت Nova فوراً عندما يبدأ المستخدم بالكلام
        if (this.tts.isSpeaking()) {
          this.tts.stop();
        }
        this._setState('speech_detected');
      },
      onInterim: (interimText) => {
        this.lastInterimText = interimText;
        this._emit('transcript', { text: interimText, isFinal: false });
      },
      onFinal: async (finalText) => {
        this.lastInterimText = '';
        this._emit('transcript', { text: finalText, isFinal: true });
        await this.handleUserUtterance(finalText);
      },
      onError: (errorMsg) => {
        this._setState('error', { error: errorMsg });
      },
      onStateChange: (sttState) => {
        if (sttState === 'listening' && this.state !== 'listening') {
          this._setState('listening');
        }
      }
    });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _emit(eventType, data = {}) {
    for (const listener of this.listeners) {
      try {
        listener(eventType, data, this.state);
      } catch (e) {
        console.error('NeonActionAgent listener error:', e);
      }
    }
  }

  _setState(newState, payload = {}) {
    this.state = newState;
    this._emit('state_change', { state: newState, ...payload });
  }

  getState() {
    return this.state;
  }

  getSessionContext() {
    return this.sessionContext;
  }

  setSpokenReplies(enabled) {
    this.spokenReplies = !!enabled;
  }

  setLanguage(lang) {
    this.lang = lang;
    if (this.stt) this.stt.setLanguage(lang);
  }

  /**
   * تشغيل جلسة الاستماع والميكروفون بالكامل
   */
  async startVoiceSession({ onFrequencyData, stream } = {}) {
    if (this.state === 'listening' || this.state === 'processing') return;

    // تشغيل نغمة التأكيد فوراً عند فتح المايك وبدء الجلسة
    neonSoundService.initializeAudio();
    neonSoundService.playAcknowledgement();

    this._setState('requesting_permission');

    try {
      // 1. تشغيل محلل الترددات الحقيقي
      await this.audioAnalyser.start({
        stream,
        onFrequencyData: (freqData, volume) => {
          if (onFrequencyData) onFrequencyData(freqData, volume);
          this._emit('audio_level', { volume, frequencyData: freqData });
        },
        onVoiceActivity: (isSpeaking) => {
          if (isSpeaking) {
            if (this.tts.isSpeaking()) this.tts.stop();
          }
        },
        onSilence: () => {
          // السكوت بعد الكلام: إنهاء التسجيل تلقائياً ومعالجة النص المكتشف
          if (this.lastInterimText && (this.state === 'speech_detected' || this.state === 'listening')) {
            const txt = this.lastInterimText.trim();
            this.lastInterimText = '';
            this.handleUserUtterance(txt);
          }
        }
      });

      this._setState('mic_ready');

      // 2. تشغيل محول التعرف الصوتي
      this.stt.start();
      this._setState('listening');
      return true;
    } catch (err) {
      console.error('Failed to start voice session:', err);
      let errorMsg = 'تعذر تشغيل الميكروفون. يرجى التأكد من منحه الإذن.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'تم رفض إذن الوصول للميكروفون. يرجى تفعيله من إعدادات المتصفح.';
      } else if (err.code === 'INSECURE_CONTEXT' || err.message === 'INSECURE_CONTEXT') {
        errorMsg = 'INSECURE_CONTEXT';
      }
      this._setState('error', { error: errorMsg });
      this.stopVoiceSession();
      throw err;
    }
  }

  /**
   * إيقاف الاستماع الفعلي وإغلاق قنوات الصوت
   */
  stopVoiceSession() {
    if (this.audioAnalyser) this.audioAnalyser.stop();
    if (this.stt) this.stt.stop();
    if (this.tts) this.tts.stop();
    this._setState('stopped');
  }

  /**
   * معالجة نص المستخدم الصوتي أو المكتوب وتحديد وتنفيذ الأداة
   */
  async handleUserUtterance(text) {
    const raw = (text || '').trim();
    if (!raw) return null;

    this._setState('processing', { text: raw });

    try {
      // 1) فحص الفهم المحلي فائق السرعة مع سياق الذاكرة
      let plan = parseNaturalAction(raw, this.sessionContext);

      // 2) إذا لم يُفهم محلياً، الاستعانة بالخادم الذكي (/api/action-agent)
      if (!plan) {
        plan = await this._callServerAiAgent(raw);
      }

      if (!plan) {
        // محاولة تقديم إجابة ذكية عامة إن لم تكن أمراً تنفيذياً
        try {
          const { aiService } = await import('./aiService.js');
          const chatRes = await aiService.chatWithCoach(raw, {
            userProfile: store.getState().userProfile,
            today: store.getState().today,
            loggedMeals: store.getState().loggedMeals || []
          }, []);
          const chatReply = chatRes?.reply || 'تم استلام طلبك.';
          this._setState('success', { actions: [], results: [], reply: chatReply });
          if (this.spokenReplies && chatReply) {
            this.tts.speak(chatReply, { lang: this.lang });
          }
          return { success: true, actions: [], reply: chatReply, results: [] };
        } catch (_) {
          this._setState('error', { error: 'لم أستطع تحديد الإجراء المناسب. جرب قول: شربت كاسة مي، أو وزني 78.5.' });
          return null;
        }
      }

      // 3) إذا كان الرد يحتاج توضيحاً (Clarification):
      if (plan.type === 'clarification') {
        this.sessionContext.pendingClarification = plan.pendingClarification;
        this.sessionContext.pendingExercise = plan.pendingExercise;
        this.sessionContext.pendingWeight = plan.pendingWeight;

        this._setState('clarification', { reply: plan.reply });
        if (this.spokenReplies && plan.reply) {
          this.tts.speak(plan.reply, { lang: this.lang });
        }
        return { reply: plan.reply, isClarification: true };
      }

      // مسح الأسئلة التوضيحية عند بدء تنفيذ إجراء مكتمل
      this.sessionContext.pendingClarification = null;

      // 4) تنفيذ قائمة الإجراءات
      if (plan.actions && plan.actions.length > 0) {
        this._setState('executing', { actions: plan.actions });

        const executionResults = [];
        for (const action of plan.actions) {
          validateToolArgs(action.tool, action.arguments);
          const res = await this._executeSingleTool(action.tool, action.arguments);
          executionResults.push(res);
        }

        // تشغيل صوت التأكيد (Acknowledgement Beep) مرة واحدة فقط بعد نجاح مهام التعديل والحفظ الحقيقية
        const hasWriteAction = plan.actions.some(act => isWriteActionTool(act.tool));
        const allSucceeded = executionResults.length > 0 && executionResults.every(r => r && r.success !== false);

        if (hasWriteAction && allSucceeded) {
          const isOnlyUndo = plan.actions.length === 1 && plan.actions[0].tool === 'undoLastAction';
          if (!isOnlyUndo) {
            neonSoundService.playAcknowledgement();
          }
        }

        // تحضير الرد المكتوب التفصيلي للعرض على الشاشة (بدون صوت)
        let finalReply = plan.reply;
        if (!finalReply || finalReply === 'تم.' || finalReply === 'تسجل.' || finalReply === 'سجلته.') {
          const summaries = executionResults.map(r => r?.summaryText).filter(Boolean);
          if (summaries.length > 0) {
            finalReply = summaries.join(' · ');
          }
        }
        if (!finalReply) {
          finalReply = 'تم تسجيل الإجراء بنجاح ✓';
        }

        // إشعار النجاح المرئي (كتابة على الشاشة فقط)
        this._setState('success', {
          actions: plan.actions,
          results: executionResults,
          reply: finalReply
        });

        if (this.spokenReplies && finalReply) {
          this.tts.speak(finalReply, { lang: this.lang });
        }

        // إرسال حدث عام لتحديث أي تابة غير مفتوحة عبر Toast
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('neon:action-executed', {
            detail: {
              actions: plan.actions,
              reply: finalReply,
              results: executionResults
            }
          }));
        }

        return { success: true, actions: plan.actions, reply: finalReply, results: executionResults };
      }

      // 5) إذا وُجد رد دون أدوات (مثل رد استعلام خادم أو بحث خارجي)
      if (plan.reply) {
        const isQuery = plan.type === 'query' || (!plan.actions?.length && (plan.reply.length > 25 || plan.reply.includes('\n')));
        this._setState('success', {
          type: isQuery ? 'query' : 'statement',
          actions: [],
          results: [],
          reply: plan.reply
        });
        if (this.spokenReplies && plan.reply) {
          // قراءة الجملة الأولى بصوت واضح لتجربة استماع مريحة
          const spoken = plan.reply.split('\n').find(s => s.trim()) || plan.reply;
          const cleanSpoken = spoken.replace(/[*#-]/g, '').trim();
          this.tts.speak(cleanSpoken, { lang: this.lang });
        }
        return { success: true, type: isQuery ? 'query' : 'statement', actions: [], reply: plan.reply, results: [] };
      }

      this._setState('idle');
      return null;
    } catch (err) {
      console.error('Error executing user utterance:', err);
      this._setState('error', { error: err.message || 'حدث خطأ أثناء تنفيذ الطلب.' });
      return { success: false, error: err.message };
    }
  }

  /**
   * تنفيذ أداة فردية وتحديث مخزن الحالة وقاعدة بيانات Supabase وحفظ الـ Undo
   */
  async _executeSingleTool(toolName, args) {
    const currentState = store.getState();
    const userId = currentState.auth?.user?.id;
    let inverse = null;
    let moduleUpdated = 'today';
    let summaryText = '';

    switch (toolName) {
      case 'logWater': {
        const ml = args.milliliters;
        const prevLiters = currentState.today.consumedWaterLiters || 0;
        const prevGlasses = currentState.today.consumedGlasses || 0;

        const newLiters = Math.round((prevLiters + ml / 1000) * 100) / 100;
        const newGlasses = prevGlasses + Math.round(ml / 250);

        store.setState({
          today: {
            ...currentState.today,
            consumedWaterLiters: newLiters,
            consumedGlasses: newGlasses
          }
        });
        store.saveState();

        this.sessionContext.lastWaterMl = ml;
        moduleUpdated = 'water';
        summaryText = `+${ml} مل ماء`;

        inverse = () => {
          store.setState({
            today: {
              ...store.getState().today,
              consumedWaterLiters: prevLiters,
              consumedGlasses: prevGlasses
            }
          });
          store.saveState();
          if (userId) syncService.syncWaterLog(userId, prevLiters * 1000, prevGlasses);
        };

        if (userId) {
          syncService.syncWaterLog(userId, Math.round(newLiters * 1000), newGlasses);
        }
        break;
      }

      case 'updateWater': {
        const ml = args.milliliters;
        const prevLiters = currentState.today.consumedWaterLiters || 0;
        const prevGlasses = currentState.today.consumedGlasses || 0;

        const newLiters = Math.round((ml / 1000) * 100) / 100;
        const newGlasses = Math.round(ml / 250);

        store.setState({
          today: {
            ...currentState.today,
            consumedWaterLiters: newLiters,
            consumedGlasses: newGlasses
          }
        });
        store.saveState();

        this.sessionContext.lastWaterMl = ml;
        moduleUpdated = 'water';
        summaryText = `تعديل الماء: ${ml} مل`;

        inverse = () => {
          store.setState({
            today: {
              ...store.getState().today,
              consumedWaterLiters: prevLiters,
              consumedGlasses: prevGlasses
            }
          });
          store.saveState();
          if (userId) syncService.syncWaterLog(userId, prevLiters * 1000, prevGlasses);
        };

        if (userId) {
          syncService.syncWaterLog(userId, ml, newGlasses);
        }
        break;
      }

      case 'logWeight':
      case 'updateWeight': {
        const weight = args.weightKg;
        const prevWeight = currentState.userProfile?.currentWeight || 75;

        store.setUserProfile({ currentWeight: weight });
        store.logProgressMeasurement({ weight });

        this.sessionContext.lastWeight = weight;
        moduleUpdated = 'weight';
        summaryText = `الوزن: ${weight} كغ`;

        inverse = () => {
          store.setUserProfile({ currentWeight: prevWeight });
          store.logProgressMeasurement({ weight: prevWeight });
          if (userId) syncService.syncProfile(userId, { currentWeight: prevWeight });
        };

        if (userId) {
          syncService.syncProfile(userId, { currentWeight: weight });
        }
        break;
      }

      case 'logBodyMeasurement': {
        const waist = args.waistCm;
        const prevWaist = currentState.progressReport?.currentDay?.waistCm;

        store.logProgressMeasurement({ waistCm: waist });
        moduleUpdated = 'progress';
        summaryText = `الخصر: ${waist} سم`;

        inverse = () => {
          store.logProgressMeasurement({ waistCm: prevWaist });
        };

        if (userId) {
          syncService.syncInbodyRecord(userId, {
            weight: currentState.userProfile?.currentWeight || 75,
            waistCm: waist
          });
        }
        break;
      }

      case 'logWorkoutSets':
      case 'logWorkoutSet': {
        const exName = args.exercise;
        const weight = args.weightKg;
        const sets = args.sets || 1;
        const reps = args.reps || 8;

        // إضافة المجموعات لجلسة التمرين أو السجل
        const addedSetIds = [];
        for (let i = 0; i < sets; i++) {
          const setId = 'set_' + Date.now() + '_' + i;
          addedSetIds.push(setId);
          // إضافة مجموعة نشطة
          store.addWorkoutSet();
          const lastIdx = (store.getState().activeWorkoutSession?.currentExercise?.sets?.length || 1) - 1;
          store.updateWorkoutSet(lastIdx, 'weight', weight);
          store.updateWorkoutSet(lastIdx, 'reps', reps);
          store.updateWorkoutSet(lastIdx, 'completed', true);
        }

        // فحص الأرقام القياسية (PR)
        const currentPr = currentState.personalRecords?.[args.exerciseId] || null;
        const isPr = !currentPr || weight > currentPr.weight || (weight === currentPr.weight && reps > currentPr.reps);

        if (isPr) {
          store.setState({
            personalRecords: {
              ...(store.getState().personalRecords || {}),
              [args.exerciseId || exName]: {
                nameAr: exName,
                weight,
                reps,
                date: new Date().toISOString().split('T')[0]
              }
            }
          });
          store.saveState();
        }

        this.sessionContext.lastExercise = exName;
        this.sessionContext.lastSets = sets;
        this.sessionContext.lastReps = reps;
        this.sessionContext.lastWeight = weight;

        moduleUpdated = 'workout';
        summaryText = `${exName}: ${weight} كغ × ${sets} جولات × ${reps} عدات ${isPr ? '🏆 PR' : ''}`;

        inverse = () => {
          // استعادة الحالة السابقة
          store.setState({
            activeWorkoutSession: currentState.activeWorkoutSession,
            personalRecords: currentState.personalRecords
          });
          store.saveState();
        };
        break;
      }

      case 'completeWorkout': {
        const title = args.title || 'جلسة تدريبية';
        store.finishWorkoutSession({ title });
        moduleUpdated = 'workout';
        summaryText = `إكمال تمرين: ${title} ✓`;

        inverse = () => {
          store.setState({
            today: {
              ...store.getState().today,
              isWorkoutCompleted: false,
              workoutStatus: 'not_started'
            }
          });
          store.saveState();
        };

        if (userId) {
          syncService.syncWorkoutLog(userId, { title, completed: true });
        }
        break;
      }

      case 'logMeal': {
        const items = args.items || [];
        const mealTitle = items.map(i => `${i.nameAr} (${i.grams}غ)`).join(' + ');
        const totalCals = items.reduce((s, i) => s + (i.calories || 0), 0);
        const totalP = items.reduce((s, i) => s + (i.protein || 0), 0);
        const totalC = items.reduce((s, i) => s + (i.carbs || 0), 0);
        const totalF = items.reduce((s, i) => s + (i.fats || 0), 0);

        const newMeal = store.logMeal({
          titleAr: mealTitle || 'وجبة جديدة',
          calories: totalCals,
          protein: totalP,
          carbs: totalC,
          fats: totalF,
          items: items
        });

        moduleUpdated = 'nutrition';
        summaryText = `وجبة: ${mealTitle} (${totalCals} سعرة، ${totalP}غ بروتين)`;

        inverse = () => {
          if (newMeal?.id) {
            store.deleteLoggedMeal(newMeal.id);
          }
        };
        break;
      }

      case 'markSupplementTaken': {
        const suppName = (args.supplement || 'مكمل').trim();
        const cleanSuppName = suppName.replace(/^(?:ال|الـ)/, '');
        const schedule = store.getState().supplementsSchedule || [];
        let found = schedule.find(s => {
          const sName = (s.nameAr || '').replace(/^(?:ال|الـ)/, '');
          return sName.includes(cleanSuppName) || cleanSuppName.includes(sName) ||
            s.nameEn?.toLowerCase().includes(suppName.toLowerCase());
        });

        const timeStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
        const prevSchedule = JSON.parse(JSON.stringify(schedule));

        if (found) {
          if (!found.schedule) found.schedule = {};
          if (!found.schedule.morning) found.schedule.morning = {};
          found.schedule.morning.taken = true;
          found.schedule.morning.time = timeStr;
          store.saveState();
        } else {
          const newSupp = {
            id: 'supp_' + Date.now(),
            nameAr: suppName,
            dose: args.dose || 'جرعة يومية',
            timing: 'صباحاً',
            verifiedSource: 'مسجل صوتياً',
            schedule: {
              morning: { taken: true, time: timeStr },
              evening: { taken: true, time: timeStr }
            }
          };
          schedule.push(newSupp);
          store.setState({ supplementsSchedule: schedule });
          store.saveState();
          found = newSupp;
        }

        try {
          const stackItems = store.getDailyStackItems?.() || [];
          const stackItem = stackItems.find(i => (i.name || '').includes(cleanSuppName));
          if (stackItem) {
            const takenMap = store.getDailyStackTaken?.() || {};
            takenMap[stackItem.id] = Date.now();
            store.setDailyStackTaken?.(takenMap);
          }
        } catch (_) {}

        moduleUpdated = 'supplements';
        summaryText = `تناول: ${found?.nameAr || suppName} ✓`;

        inverse = () => {
          store.setState({ supplementsSchedule: prevSchedule });
          store.saveState();
        };
        break;
      }

      case 'logSteps': {
        const steps = args.stepsCount;
        const prevSteps = currentState.today.stepsCount || 0;
        store.setState({
          today: {
            ...store.getState().today,
            stepsCount: steps
          }
        });
        store.saveState();
        moduleUpdated = 'today';
        summaryText = `الخطوات: ${steps.toLocaleString('en-US')} خطوة`;

        inverse = () => {
          store.setState({
            today: { ...store.getState().today, stepsCount: prevSteps }
          });
          store.saveState();
        };
        break;
      }

      case 'logSleep': {
        const hours = args.sleepHours;
        const prevHours = currentState.today.sleepHours || 0;
        store.setState({
          today: { ...store.getState().today, sleepHours: hours }
        });
        store.saveState();
        moduleUpdated = 'today';
        summaryText = `النوم: ${hours} ساعات`;

        inverse = () => {
          store.setState({
            today: { ...store.getState().today, sleepHours: prevHours }
          });
          store.saveState();
        };

        if (userId) {
          syncService.syncEnergyLog(userId, currentState.today.energyLevel || 4, hours);
        }
        break;
      }

      case 'logEnergy': {
        const level = args.energyLevel;
        store.setEnergyLevel(level);
        moduleUpdated = 'today';
        summaryText = `الطاقة: ${level} من 5`;
        if (userId) {
          syncService.syncEnergyLog(userId, level);
        }
        break;
      }

      case 'addShoppingItem':
      case 'addShoppingItems': {
        const names = Array.isArray(args.names) ? args.names : (args.name ? [args.name] : []);
        const currentItems = store.getShoppingItems();
        const newItems = [...currentItems];

        for (const n of names) {
          if (!n || !n.trim()) continue;
          newItems.push({
            id: 'shop_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            name: n.trim(),
            category: 'مخصص',
            unit: 'حسب الحاجة',
            checked: false
          });
        }
        store.setShoppingItems(newItems);
        moduleUpdated = 'shopping';
        summaryText = `إضافة ${names.join(' و ')} للمشتريات`;

        inverse = () => {
          store.setShoppingItems(currentItems);
        };
        break;
      }

      case 'removeShoppingItem': {
        const rawName = (args.name || '').trim();
        const nameToClean = rawName.replace(/^(?:ال|الـ)/, '');
        const currentItems = store.getShoppingItems();
        const updated = currentItems.filter(item => {
          const itemName = (item.name || '').trim();
          const cleanItemName = itemName.replace(/^(?:ال|الـ)/, '');
          return !itemName.toLowerCase().includes(rawName.toLowerCase()) &&
                 !cleanItemName.toLowerCase().includes(nameToClean.toLowerCase());
        });
        store.setShoppingItems(updated);
        moduleUpdated = 'shopping';
        summaryText = `حذف ${rawName} من المشتريات`;

        inverse = () => {
          store.setShoppingItems(currentItems);
        };
        break;
      }

      case 'prioritize_today': {
        const rawKind = (args.priority || args.kind || '').toLowerCase().trim();
        let kind = 'workout';
        if (rawKind.includes('تمرين') || rawKind.includes('workout') || rawKind.includes('تدريب')) kind = 'workout';
        else if (rawKind.includes('تغذي') || rawKind.includes('اكل') || rawKind.includes('طعام') || rawKind.includes('nutrition') || rawKind.includes('سعرات')) kind = 'nutrition';
        else if (rawKind.includes('ماء') || rawKind.includes('مي') || rawKind.includes('شرب') || rawKind.includes('water')) kind = 'water';
        else if (rawKind.includes('مكمل') || rawKind.includes('supplements')) kind = 'supplements';

        const prevOrder = currentState.today?.actionOrder || ['nutrition', 'workout', 'water', 'supplements'];
        const ALL_KINDS = ['workout', 'nutrition', 'water', 'supplements'];
        const newOrder = [kind, ...ALL_KINDS.filter(k => k !== kind)];

        store.setState({
          today: {
            ...currentState.today,
            actionOrder: newOrder,
            priorityFocus: kind
          }
        });
        store.saveState();

        const labelsAr = {
          workout: 'التمرين',
          nutrition: 'التغذية',
          water: 'الماء',
          supplements: 'المكملات'
        };

        moduleUpdated = 'today';
        summaryText = `تم تقديم ${labelsAr[kind] || kind} كأولوية أولى لليوم ⭐`;

        inverse = () => {
          store.setState({
            today: {
              ...store.getState().today,
              actionOrder: prevOrder,
              priorityFocus: prevOrder[0] || 'nutrition'
            }
          });
          store.saveState();
        };
        break;
      }

      case 'getTodayNutrition': {
        const { targetProtein, consumedProtein } = store.getState().today;
        const rem = Math.max(0, (targetProtein || 180) - (consumedProtein || 0));
        return {
          moduleUpdated: 'nutrition',
          summaryText: `باقيلك ${rem} غ بروتين اليوم. (المسجل ${consumedProtein || 0} غ من ${targetProtein || 180} غ)`
        };
      }

      case 'getTodaySummary': {
        const { consumedCalories, targetCalories, consumedProtein, targetProtein, consumedWaterLiters, targetWaterLiters, isWorkoutCompleted } = store.getState().today;
        const text = `تمرين اليوم: ${isWorkoutCompleted ? 'مكتمل ✓' : 'بانتظارك'}. السعرات: ${consumedCalories} من ${targetCalories}. الماء: ${consumedWaterLiters} من ${targetWaterLiters} لتر. البروتين: ${consumedProtein} من ${targetProtein} غ.`;
        return { moduleUpdated: 'today', summaryText: text };
      }

      case 'undoLastAction': {
        return this.undoLastAction();
      }

      case 'stopVoiceSession': {
        this.stopVoiceSession();
        return { moduleUpdated: 'control', summaryText: 'أوقفت الاستماع' };
      }
    }

    if (inverse) {
      this.undoStack.push({
        toolName,
        args,
        inverse,
        summaryText,
        timestamp: Date.now()
      });
      // الاحتفاظ بآخر 20 تراجع
      if (this.undoStack.length > 20) {
        this.undoStack.shift();
      }
    }

    return {
      toolName,
      moduleUpdated,
      summaryText,
      success: true
    };
  }

  /**
   * التراجع الفعلي عن آخر عملية تم إجراؤها
   */
  undoLastAction() {
    if (this.undoStack.length === 0) {
      const msg = 'لا يوجد إجراء سابق للتراجع عنه.';
      if (this.spokenReplies) this.tts.speak(msg, { lang: this.lang });
      return { success: false, summaryText: msg };
    }

    const last = this.undoStack.pop();
    try {
      last.inverse();
      neonSoundService.playAcknowledgement();
      const msg = `تراجعت عن: ${last.summaryText}`;
      if (this.spokenReplies) this.tts.speak('رجعت آخر شغلة.', { lang: this.lang });
      this._emit('undo_performed', { action: last });
      return { success: true, summaryText: msg };
    } catch (e) {
      console.error('Failed to undo action:', e);
      return { success: false, summaryText: 'تعذر التراجع عن الإجراء.' };
    }
  }

  undo() {
    return this.undoLastAction();
  }

  hasUndo() {
    return this.undoStack.length > 0;
  }

  getLastActionSummary() {
    if (this.undoStack.length === 0) return null;
    return this.undoStack[this.undoStack.length - 1].summaryText;
  }

  /**
   * استدعاء الخادم الذكي للتعامل مع العبارات غير المباشرة
   */
  async _callServerAiAgent(text) {
    try {
      const resp = await fetch('/api/action-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          context: {
            today: store.getState().today,
            profile: store.getState().userProfile
          }
        })
      });

      if (!resp.ok) return null;
      const data = await resp.json();
      return data;
    } catch (_) {
      return null;
    }
  }
}

export const neonActionAgent = new NeonActionAgent();
