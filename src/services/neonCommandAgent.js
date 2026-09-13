import { AudioAnalyser } from './voice/audioAnalyser.js';
import { SttAdapter } from './voice/sttAdapter.js';
import { TtsAdapter } from './voice/ttsAdapter.js';
import { neonSoundService } from './voice/neonSoundService.js';
import { submitNeonCommand, restoreNeonConversation, retryNeonCommand, commandTrace } from './submitNeonCommand.js';

export class NeonCommandAgent {
  constructor({ dispatch = submitNeonCommand } = {}) {
    this.dispatch = dispatch; this.listeners = new Set(); this.state = 'idle'; this.lang = 'ar-JO'; this.spokenReplies = false;
    this.tts = new TtsAdapter(); this.audioAnalyser = new AudioAnalyser(); this.sessionContext = {}; this.currentUtteranceText = ''; this.lastInterimText = '';
    this.stt = new SttAdapter({ onInterim: text => { this.currentUtteranceText = text; this._emit('transcript', { text, isFinal: false }); },
      onFinal: text => this.finalizeVoice(text), onError: error => { this.stopVoiceSession(); this._setState('error', { error }); },
      onSpeechStart: () => this._setState('speech_detected') });
  }
  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  _emit(type, data) { this.listeners.forEach(fn => fn(type, data, this.state)); }
  _setState(state, data = {}) { this.state = state; this._emit('state_change', { state, ...data }); if (['success', 'clarification', 'partial', 'error'].includes(state)) this._emit(state, data); }
  getState() { return this.state; }
  getSessionContext() { return this.sessionContext; }
  setLanguage(lang) { this.lang = lang; this.stt.setLanguage(lang); }
  setSpokenReplies(enabled) { this.spokenReplies = enabled; }
  async startVoiceSession({ onFrequencyData, stream } = {}) {
    if (this.busy || this.recording) return;
    this.recording = { requestId: crypto.randomUUID(), submitted: false, cancelled: false };
    this.currentUtteranceText = ''; this._setState('requesting_permission');
    try {
      await this.audioAnalyser.start({ stream, onFrequencyData, onSilence: () => this.stt.finish() });
      if (!this.recording || this.recording.cancelled) { this.audioAnalyser.stop(); return; }
      this.stt.start(); this._setState('listening');
    } catch { this.stopVoiceSession(); this._setState('error', { error: 'تعذر تشغيل الميكروفون. تحقق من إذن الوصول.' }); }
  }
  async finalizeVoice(text) {
    const recording = this.recording;
    if (!recording || recording.cancelled || recording.submitted || !text.trim()) return;
    recording.submitted = true;
    commandTrace({ ...recording, inputSource: 'voice' }, 'transcriptFinalized');
    this._emit('transcript', { text, isFinal: true }); this.audioAnalyser.stop(); this.stt.stop(); this.recording = null;
    return this.handleUserUtterance(text, { isVoice: true, requestId: recording.requestId });
  }
  stopVoiceSession() { if (this.recording) this.recording.cancelled = true; this.recording = null; this.stt.stop(); this.audioAnalyser.stop(); this.tts.stop(); this._setState('stopped'); }
  async handleUserUtterance(text, { isVoice = false, requestId = crypto.randomUUID(), ...extra } = {}) {
    if (this.busy) return this.busy;
    if (!text?.trim() && !extra.confirmation) return null;
    this._setState('processing');
    this.busy = this.dispatch({ text: text?.trim() || '', inputSource: isVoice ? 'voice' : 'text', requestId, ...extra })
      .then(r => this.present(r, isVoice)).catch(e => { this._setState('error', { error: e.message }); return { status: 'error', error: e.message }; })
      .finally(() => { this.busy = null; });
    return this.busy;
  }
  present(r, voice = false) {
    this.sessionContext.pendingClarification = r.clarification;
    if (r.status === 'error') this._setState('error', { error: r.error?.message || r.reply });
    else this._setState(r.status, { ...r, options: r.clarification?.options || [] });
    if (voice && r.status === 'success' && r.results?.some(x => x.persisted) && r.results.every(x => !x.changedResources.length || x.persisted)) neonSoundService.playAcknowledgement();
    if (voice && this.spokenReplies && r.reply) this.tts.speak(r.reply, { lang: this.lang });
    commandTrace(r, 'responseRendered'); return r;
  }
  confirm(pendingId, accept, mealType) { return this.handleUserUtterance('', { confirmation: { pendingId, accept, mealType } }); }
  async restore() { try { return await restoreNeonConversation(); } catch { return null; } }
  async retry() { try { return this.present(await retryNeonCommand()); } catch (e) { this._setState('error', { error: e.message }); } }
  undo() { return this.handleUserUtterance('Undo my last action'); }
  undoLastAction() { return this.undo(); }
  hasUndo() { return false; }
  getLastActionSummary() { return null; }
}
export const neonActionAgent = new NeonCommandAgent();
