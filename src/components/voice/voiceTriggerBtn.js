/**
 * NEON ACTION AGENT - زر تشغيل الصوت العائم (Voice Trigger FAB)
 * زر نيون متوهج يظهر حصرياً في تابة NEON AI ومخفي تماماً في باقي التابات والصفحات
 */

import { neonVoiceOverlay } from './neonVoiceOverlay.js';
import { neonActionAgent } from '../../services/neonActionAgent.js';

export function updateVoiceTriggerVisibility(routeKey) {
  const btn = document.getElementById('neon-global-voice-fab');
  if (!btn) return;
  const currentKey = routeKey || (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const isNeonAi = currentKey === 'neon-ai';
  if (isNeonAi) {
    btn.classList.add('visible');
  } else {
    btn.classList.remove('visible');
  }
}

export function initGlobalVoiceTrigger() {
  let btn = document.getElementById('neon-global-voice-fab');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'neon-global-voice-fab';
    btn.className = 'neon-voice-fab';
    btn.setAttribute('aria-label', 'NEON ACTION AGENT - تحدث بالصوت');
    btn.title = 'تحدث مع نيون (Voice Agent)';
    btn.innerHTML = `
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
        <line x1="12" y1="19" x2="12" y2="23"></line>
        <line x1="8" y1="23" x2="16" y2="23"></line>
      </svg>
    `;

    btn.addEventListener('click', () => {
      neonVoiceOverlay.open({ triggerMicDirectly: true });
    });

    document.body.appendChild(btn);

    // تحديث حالة النبض عند التحدث
    neonActionAgent.subscribe((eventType, data, state) => {
      if (state === 'listening' || state === 'speech_detected') {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // استماع مباشر لأي تغير في عنوان التابة بالمتصفح
    window.addEventListener('hashchange', () => {
      const hash = window.location.hash || '';
      const currentRoute = hash.replace(/^#\/?/, '').split('?')[0];
      updateVoiceTriggerVisibility(currentRoute);
    });
  }

  // تطبيق الظهور/الإخفاء فوراً بناءً على التابة الحالية
  const initialHash = (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  updateVoiceTriggerVisibility(initialHash);
}
