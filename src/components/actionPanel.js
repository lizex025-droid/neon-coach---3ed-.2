import { store } from '../state/store.js';
import { aiService } from '../services/aiService.js';
import { actionContext, interpretAction } from '../services/actionAssistant.js';
import { createActionVoiceSession } from '../services/actionVoiceSession.js';
import { todaySnapshot, TODAY_KINDS } from '../domain/actionAgent.js';
import { neonVoiceOverlay } from './voice/neonVoiceOverlay.js';
import '../styles/actionAgent.css';

export const escapeActionHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const labels = { workout: 'التمرين', nutrition: 'التغذية', water: 'الماء', supplements: 'المكملات' };
const routes = { workout: '#workout', nutrition: '#nutrition', water: '#water-supps', supplements: '#water-supps' };

export function renderTodayPriorities(state) {
  const today = todaySnapshot(state);
  const order = [...new Set([...today.order, ...TODAY_KINDS])].filter(kind => TODAY_KINDS.includes(kind));
  return `<div class="action-priorities" aria-label="أولويات اليوم">${order.map((kind, i) => `<a href="${routes[kind]}"><span>${i + 1}</span>${labels[kind]}</a>`).join('')}</div>`;
}

export function renderActionPanel() {
  return `<section class="action-agent neon-card" aria-labelledby="action-agent-title">
    <div class="action-heading"><div><h2 id="action-agent-title">NEON ACTION AGENT</h2><p>احكي لنيون. سجلاتك تتحدث قدامك.</p></div><span class="action-badge">متصل بسجلاتك</span></div>
    <div id="action-live-summary"></div>
    <button type="button" id="action-open-voice-overlay" class="neon-voice-main-btn" style="width: 100%; margin: 10px 0 14px; justify-content: center; font-size: 1.05rem;">🎙️ TAP TO TALK / تفعيل الميكروفون</button>
    <div class="action-shortcuts"><button type="button" data-action-prompt="زود كاسة مي">+ كاسة مي</button><button type="button" data-action-prompt="شو باقيلي بروتين؟">باقي البروتين</button><button type="button" data-action-prompt="شو عندي اليوم؟">ملخص اليوم</button><button type="button" id="action-undo" data-action-prompt="رجع آخر شغلة عملتها">تراجع</button></div>
    <div class="action-voice-options"><label><input id="action-wake" type="checkbox"> انتظر «يا نيون»</label><label><input id="action-speak" type="checkbox"> رد صوتي</label><label>لغة الصوت <select id="action-language" aria-label="لغة الصوت"><option value="ar-JO">العربية</option><option value="en-US">English</option></select></label></div>
    <p id="action-voice-status" role="status">الميكروفون متوقف — اضغطه لبدء المحادثة الصوتية.</p>
    <p id="action-feedback" role="status"></p>
    <details class="action-help"><summary>شو بقدر نيون يعمل؟</summary><p>«أكلت 250 غ دجاج و200 غ رز» · «أخذت الكرياتين» · «خلصت تمرين Push» · «عملت bench 80 كيلو 8 reps» · «وزني اليوم 79.4» · «ضيف بيض وحليب لقائمة المشتريات» · «شيل الحليب» · «خلّي التمرين أهم شي اليوم» · «رجع آخر شغلة عملتها» · «نيون وقف استماع».</p><p>التغييرات تُحفظ في سجلات هذا المتصفح. الأوامر المباشرة تعمل دون مفتاح AI؛ الصياغات الحرة تحتاج Gemini. تقدير الوجبات يعتمد على الصنف وطريقة تحضيره في قاعدة الأطعمة. الصوت قد يحتاج اتصالاً بالإنترنت، ويتوقف عند مغادرة الصفحة أو بعد 3 دقائق من عدم النشاط.</p></details>
  </section>`;
}

export function bindActionPanel({ onCommand }) {
  const root = document.querySelector('.action-agent');
  let voice = null, disposed = false, busy = false, request = null;
  const fingerprint = () => {
    const state = store.getActionContext();
    return JSON.stringify([actionContext(state), state.auth?.user?.id, state.loggedMeals, state.exerciseSetLogs, state.workoutHistory, state.actionHistory?.at(-1)?.id]);
  };
  function repaint() {
    const state = store.getActionContext(), today = todaySnapshot(state);
    const taken = state.supplementsSchedule.filter(item => item.schedule?.morning?.taken).length;
    const lastSet = state.exerciseSetLogs?.at(-1);
    root.querySelector('#action-live-summary').innerHTML = `<div class="action-metrics">
      <a href="#meal-log"><b>${today.calories}</b><span>سعرة مسجلة اليوم</span></a><a href="#nutrition"><b>${today.remainingProtein} غ</b><span>بروتين متبقي</span></a><a href="#water-supps"><b>${today.waterMl} مل</b><span>ماء اليوم</span></a><a href="#water-supps"><b>${taken} / ${state.supplementsSchedule.length}</b><span>مكملات مأخوذة</span></a>
    </div><p class="action-context">التمرين: ${escapeActionHtml(today.workout || 'غير محدد')}${today.workoutCompleted ? ' · مكتمل ✓' : ''} · الوزن: ${escapeActionHtml(state.userProfile?.currentWeight || '—')} كغ · <a href="#shopping-list">المشتريات (${store.getShoppingItems().length})</a></p>
    ${lastSet ? `<p class="action-context">آخر مجموعة: ${escapeActionHtml(lastSet.nameAr)} · ${lastSet.weight} كغ × ${lastSet.reps} · <a href="#progress">سجل القوة وPR</a></p>` : ''}
    ${renderTodayPriorities(state)}`;
    root.querySelector('#action-undo').disabled = !state.actionHistory?.length;
  }
  async function handle(query) {
    if (busy) return { reply: 'انتظر انتهاء الإجراء الحالي.' };
    busy = true;
    request = new AbortController();
    const timeout = setTimeout(() => request?.abort(), 25000);
    const initialContext = fingerprint();
    try {
      const plan = await interpretAction(query, store.getActionContext(), { apiKey: aiService.getCustomApiKey('gemini'), model: aiService.getActiveModel(), signal: request.signal });
      if (disposed) return { reply: '' };
      if (!plan) return null;
      if (initialContext !== fingerprint()) throw new Error('تغيرت سجلاتك أثناء فهم الطلب. أعد إرساله حتى أستخدم الأرقام الحالية.');
      const result = plan.tools?.length ? store.executeAgentTools(plan.tools) : { reply: plan.reply };
      if (result.stopListening) voice?.stop();
      repaint();
      root.querySelector('#action-feedback').textContent = result.reply;
      return { reply: result.reply, success: true, isAction: true };
    } catch (error) {
      const reply = error.name === 'AbortError' ? 'انتهت مهلة الطلب. لم يُنفذ أي إجراء؛ حاول مجدداً.' : error.message;
      if (!disposed) root.querySelector('#action-feedback').textContent = reply;
      return { reply, success: false, isAction: true };
    } finally { clearTimeout(timeout); busy = false; request = null; }
  }
  root.querySelectorAll('[data-action-prompt]').forEach(button => button.addEventListener('click', () => onCommand(button.dataset.actionPrompt)));
  root.querySelector('#action-open-voice-overlay')?.addEventListener('click', () => {
    neonVoiceOverlay.open();
  });
  root.querySelectorAll('.action-voice-options input, .action-voice-options select').forEach(input => input.addEventListener('change', () => voice?.stop()));
  const visibility = () => { if (document.hidden) voice?.stop(); };
  const pagehide = () => voice?.stop();
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('pagehide', pagehide);
  repaint();
  return {
    handle,
    toggleVoice() {
      neonVoiceOverlay.open();
    },
    dispose() { disposed = true; request?.abort(); voice?.stop(); document.removeEventListener('visibilitychange', visibility); window.removeEventListener('pagehide', pagehide); }
  };
}
