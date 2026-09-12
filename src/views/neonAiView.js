/**
 * NEON COACH - شاشة المدرب الذكي المستقلة (NEON AI Master View)
 * سكشن مخصص بالكامل للمدرب الذكي في شريط التنقل السفلي بين التغذية والتدريب
 */

import { aiService } from '../services/aiService.js';
import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { neonIcon } from '../utils/neonIcons.js';
import { renderActionPanel, bindActionPanel } from '../components/actionPanel.js';

// ذاكرة المحادثة المستمرة لشاشة NEON AI
const screenChatHistory = [];

export function renderNeonAiView() {
  const state = store.getState();
  const provider = aiService.getProviderName();
  const currentKey = aiService.getCustomApiKey('gemini') || '';
  const currentModel = aiService.getActiveModel();

  // ملخص السياق اللحظي
  const targetCals = state.today.targetCalories || 2000;
  const consumedCals = state.today.consumedCalories || 0;
  const remCals = Math.max(0, targetCals - consumedCals);
  const isOverCals = consumedCals > targetCals;
  const waterGlasses = state.today.consumedGlasses || 0;
  const suppsTaken = (state.supplementsSchedule || []).filter(s => s.schedule?.morning?.taken || s.schedule?.evening?.taken).length;
  const suppsTotal = (state.supplementsSchedule || []).length;
  const todayWorkout = state.workoutPlan?.dayNameAr || 'جلسة تدريبية';

  return `
    <div class="neon-ai-page-container" style="padding: 14px 16px 120px; display: flex; flex-direction: column; gap: 14px; min-height: 100%;">
      
      <!-- ترويسة سكشن NEON AI -->
      <div class="neon-card glow" style="padding: 14px 16px; border-color: rgba(85,247,165,0.4); background: linear-gradient(135deg, rgba(8,24,16,0.95), rgba(4,12,8,0.98));">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
            <div style="position: relative; width: 40px; height: 40px; flex-shrink: 0; border-radius: 50%; background: rgba(85,247,165,0.14); border: 2px solid #55F7A5; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 16px rgba(85,247,165,0.35);">
              <img src="./icons/neon-cat-coach.svg" alt="NEON AI" style="width: 26px; height: 26px;">
              <span style="position: absolute; bottom: 0; right: 0; width: 9px; height: 9px; border-radius: 50%; background: #55F7A5; border: 2px solid #000; box-shadow: 0 0 6px #55F7A5;"></span>
            </div>
            <div style="min-width: 0; flex: 1;">
              <div style="font-size: 1.05rem; font-weight: 900; color: #FFFFFF; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <span>NEON AI</span>
                <span class="badge" style="background: rgba(85,247,165,0.18); color: #55F7A5; border: 1px solid rgba(85,247,165,0.4); font-size: 0.65rem; padding: 2px 6px;">كوتش معتمد</span>
              </div>
              <div id="neon-ai-provider-badge" style="font-size: 0.72rem; color: #55F7A5; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${provider} · مطلع على سجلاتك 360°
              </div>
            </div>
          </div>

          <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
            <button id="neon-ai-clear-chat-btn" class="btn-icon" style="width: 34px; height: 34px; font-size: 0.95rem; border-color: rgba(255,85,85,0.3); color: #ff7777;" title="مسح سجل المحادثة والبدء من جديد" aria-label="مسح المحادثة">
              🗑️
            </button>
            <button id="neon-ai-settings-toggle-btn" class="btn-icon" style="width: 34px; height: 34px; font-size: 1rem; border-color: rgba(85,247,165,0.3); display: flex; align-items: center; justify-content: center;" title="إعدادات المفتاح والنموذج" aria-label="الإعدادات">
              ${neonIcon('pencil', 16)}
            </button>
          </div>
        </div>

        <!-- شريط اطلاع الذكاء الاصطناعي على السجلات الحية -->
        <div style="display: flex; gap: 6px; overflow-x: auto; margin-top: 12px; padding-top: 10px; border-top: 1px solid rgba(85,247,165,0.15); scrollbar-width: none; -webkit-overflow-scrolling: touch;">
          <div class="badge" style="flex-shrink: 0; background: ${isOverCals ? 'rgba(255,85,85,0.12)' : 'rgba(85,247,165,0.08)'}; color: #B8C0BC; font-size: 0.72rem; display: flex; align-items: center; gap: 5px; border: 1px solid ${isOverCals ? 'rgba(255,85,85,0.3)' : 'rgba(85,247,165,0.2)'}; white-space: nowrap;">
            <span>${neonIcon('flame', 14)}</span>
            <span>الكلية: <strong style="color: #FFFFFF; font-family: monospace;">${targetCals.toLocaleString('en-US')}</strong></span>
            <span style="color: rgba(255,255,255,0.25);">|</span>
            <span>المستهلك: <strong style="color: ${isOverCals ? '#FF5555' : '#55F7A5'}; font-family: monospace;">${consumedCals.toLocaleString('en-US')}</strong></span>
            <span style="color: rgba(255,255,255,0.25);">|</span>
            ${isOverCals ? `
              <span style="color: #FF5555; font-weight: 800; display: inline-flex; align-items: center; gap: 4px;">تجاوز بـ ${(consumedCals - targetCals).toLocaleString('en-US')} سعرة! ${neonIcon('alert', 12)}</span>
            ` : `
              <span style="color: #55F7A5; font-weight: 800;">المتبقي بعد الخصم: <strong style="color: #FFFFFF; font-family: monospace;">${remCals.toLocaleString('en-US')}</strong> سعرة</span>
            `}
          </div>
          <div class="badge" style="flex-shrink: 0; white-space: nowrap; background: rgba(85,247,165,0.08); color: #B8C0BC; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(85,247,165,0.2);">
            ${neonIcon('water', 14)} ماء: <strong style="color: #FFFFFF;">${waterGlasses}</strong> أكواب
          </div>
          <div class="badge" style="flex-shrink: 0; white-space: nowrap; background: rgba(85,247,165,0.08); color: #B8C0BC; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(85,247,165,0.2);">
            ${neonIcon('shield', 14)} مكملات: <strong style="color: #FFFFFF;">${suppsTaken}/${suppsTotal}</strong>
          </div>
          <div class="badge" style="flex-shrink: 0; white-space: nowrap; background: rgba(85,247,165,0.08); color: #B8C0BC; font-size: 0.72rem; display: flex; align-items: center; gap: 4px; border: 1px solid rgba(85,247,165,0.2);">
            ${neonIcon('dumbbell', 14)} ${todayWorkout}
          </div>
        </div>
      </div>

      <!-- لوحة إعدادات المفتاح والنموذج (قابلة للفتح/الإغلاق) -->
      <div id="neon-ai-settings-panel" class="neon-card" style="display: none; padding: 14px 16px; border-color: rgba(85,247,165,0.3); background: #06140b;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 0.82rem; font-weight: 700; color: #55F7A5; display: flex; align-items: center; gap: 6px;">${neonIcon('pencil', 14)} إعدادات محرك NEON AI الذكي</span>
          <button type="button" id="neon-ai-settings-close-btn" style="background: none; border: none; color: #8fa097; font-size: 0.85rem; cursor: pointer;">✕ إغلاق</button>
        </div>
        <div style="font-size: 0.75rem; color: #b2c2ba; margin-bottom: 10px; line-height: 1.4;">
          أدخل مفتاح <strong>Google Gemini API</strong> للحصول على أقصى سرعة وذكاء تحليلي:
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; gap: 6px;">
            <input type="password" id="neon-ai-gemini-key-input" value="${currentKey}" placeholder="ألصق مفتاح Gemini هنا (AIza...)" style="flex: 1; padding: 8px 12px; font-size: 0.78rem; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 8px; color: #FFFFFF;" autocomplete="off">
            <button type="button" id="neon-ai-save-key-btn" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.78rem; font-weight: 700;">حفظ</button>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
            <select id="neon-ai-model-select" style="background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 6px; color: #55F7A5; font-size: 0.75rem; padding: 5px 8px;">
              <option value="gemini-2.0-flash" ${currentModel === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash (الأسرع والأذكى - موصى به)</option>
              <option value="gemini-1.5-pro" ${currentModel === 'gemini-1.5-pro' ? 'selected' : ''}>Gemini 1.5 Pro (تحليل متعمق)</option>
              <option value="gpt-4o-mini" ${currentModel === 'gpt-4o-mini' ? 'selected' : ''}>OpenAI GPT-4o-mini</option>
            </select>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button type="button" id="neon-ai-clear-key-btn" style="background: rgba(255,85,85,0.12); border: 1px solid rgba(255,85,85,0.35); border-radius: 6px; color: #ff7777; font-size: 0.72rem; padding: 4px 8px; cursor: pointer;">مسح المفتاح</button>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="font-size: 0.72rem; color: #55F7A5; text-decoration: underline;">مفتاح مجاني ↗</a>
            </div>
          </div>
          <div id="neon-ai-key-status-msg" style="font-size: 0.72rem; color: #55F7A5; min-height: 16px;"></div>
        </div>
      </div>

      <!-- مقترحات سريعة تفاعلية بأسلوب Chips أفقية متجاوبة بدون تكدس -->
      <div class="neon-ai-quick-scroll-row" style="display: flex; gap: 8px; overflow-x: auto; padding: 4px 2px; scrollbar-width: none; -webkit-overflow-scrolling: touch;">
        <button class="neon-ai-quick-btn" data-prompt="احسب 200غ صدر دجاج مع 150غ أرز مسلوق وسلطة">
          ${neonIcon('plate', 16)}
          <span>احسب وجبة</span>
        </button>
        <button class="neon-ai-quick-btn" data-prompt="كم متبقي لي من السعرات والبروتين اليوم وكيف أكملهم؟">
          ${neonIcon('chart', 16)}
          <span>متبقي الماكروز</span>
        </button>
        <button class="neon-ai-quick-btn" data-prompt="ما هو تمرين اليوم بالتفصيل وكيف أطبقه؟">
          ${neonIcon('dumbbell', 16)}
          <span>تمرين اليوم</span>
        </button>
        <button class="neon-ai-quick-btn" data-prompt="ما رأيك العلمي في الكرياتين والبروتين وكيف أتناولهم؟">
          ${neonIcon('shield', 16)}
          <span>المكملات اليومية</span>
        </button>
        <button class="neon-ai-quick-btn" data-prompt="أشعر بألم في مفصل الكتف أثناء البنش، ما التعديل الآمن؟">
          ${neonIcon('alert', 16)}
          <span>ألم الكتف</span>
        </button>
        <button class="neon-ai-quick-btn" data-prompt="ما هي أفضل استراتيجية للتدرج بالأوزان (Progressive Overload)؟">
          ${neonIcon('chart', 16)}
          <span>التدرج بالأوزان</span>
        </button>
      </div>

      ${renderActionPanel()}

      <!-- حاوية الرسائل والمحادثة المحفوظة -->
      <div id="neon-ai-messages-list" class="neon-card" style="min-height: 380px; max-height: 520px; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(3,10,7,0.85); border-color: rgba(85,247,165,0.2);">
        <div class="chat-bubble ai">
          مرحباً يا بطل! أنا مدربك الذكي <strong>NEON AI</strong> المعتمد عالمياً في التدريب الرياضي والتغذية (CSCS & CISSN).
          <div style="height: 6px;"></div>
          أنا أحتفظ بذاكرة محادثاتنا وسجلاتك كاملة 360° (هدفك، تمارينك، وجباتك، والماء والمكملات).
          <div style="height: 4px;"></div>
          اسألني عن أي وجبة لحسابها وإضافتها فوراً، أو استفسر عن تمرينك، التكنيك، أو خطتك! 🚀
        </div>
      </div>

      <!-- نموذج إرسال الرسالة والإدخال الصوتي -->
      <form id="neon-ai-form" style="display: flex; gap: 8px; align-items: center; position: sticky; bottom: 68px; z-index: 10; background: rgba(2,6,4,0.95); backdrop-filter: blur(12px); padding: 8px 10px; border-radius: 16px; border: 1px solid rgba(85,247,165,0.3); box-shadow: 0 4px 20px rgba(0,0,0,0.6);">
        <button type="button" id="neon-ai-voice-btn" class="btn-icon" style="width: 42px; height: 42px; font-size: 1.15rem; color: #55F7A5; flex-shrink: 0;" title="تسجيل صوتي" aria-label="تشغيل أو إيقاف الميكروفون" aria-pressed="false">
          🎙️
        </button>
        <input type="text" id="neon-ai-input" maxlength="4000" aria-label="رسالتك لنيون" placeholder="احكي لنيون: أكلت… شربت… عملت… أو اسأل الكوتش" autocomplete="off" style="flex: 1; border: none; background: transparent; color: #FFFFFF; font-size: 0.95rem; outline: none; padding: 6px 4px;">
        <button type="submit" class="btn btn-primary" style="padding: 10px 18px; font-weight: 800; font-size: 0.9rem; flex-shrink: 0;">
          إرسال ⚡
        </button>
      </form>

    </div>
  `;
}

function formatAiMarkdown(text) {
  if (!text) return '';
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  let lineIdx = 0;
  safe = safe.replace(/^###\s+(.*)$/gm, (_, title) => {
    lineIdx++;
    return `<div class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; font-weight: 800; color: #55F7A5; margin: 8px 0 4px 0; font-size: 0.95rem;">${title}</div>`;
  });
  safe = safe.replace(/^##\s+(.*)$/gm, (_, title) => {
    lineIdx++;
    return `<div class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; font-weight: 800; color: #55F7A5; margin: 10px 0 6px 0; font-size: 1rem;">${title}</div>`;
  });

  const lines = safe.split('\n');
  let inList = false;
  const processedLines = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (/^[-*•]\s+(.*)/.test(trimmed)) {
      const match = trimmed.match(/^[-*•]\s+(.*)/);
      if (!inList) {
        processedLines.push('<ul style="margin: 6px 0; padding-right: 18px; list-style-type: disc;">');
        inList = true;
      }
      lineIdx++;
      processedLines.push(`<li class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; margin-bottom: 4px; line-height: 1.45;">${match[1]}</li>`);
    } else if (/^\d+\.\s+(.*)/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      lineIdx++;
      processedLines.push(`<div class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; margin: 4px 0; line-height: 1.45;"><strong style="color: #55F7A5;">${match[1]}.</strong> ${match[2]}</div>`);
    } else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      if (trimmed === '') {
        processedLines.push('<div style="height: 6px;"></div>');
      } else {
        lineIdx++;
        processedLines.push(`<div class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; line-height: 1.5;">${trimmed}</div>`);
      }
    }
  }

  if (inList) processedLines.push('</ul>');
  return processedLines.join('');
}

export function bindNeonAiViewEvents() {
  const settingsToggleBtn = document.getElementById('neon-ai-settings-toggle-btn');
  const settingsPanel = document.getElementById('neon-ai-settings-panel');
  const settingsCloseBtn = document.getElementById('neon-ai-settings-close-btn');
  const saveKeyBtn = document.getElementById('neon-ai-save-key-btn');
  const clearKeyBtn = document.getElementById('neon-ai-clear-key-btn');
  const keyInput = document.getElementById('neon-ai-gemini-key-input');
  const modelSelect = document.getElementById('neon-ai-model-select');
  const keyStatusMsg = document.getElementById('neon-ai-key-status-msg');
  const providerBadge = document.getElementById('neon-ai-provider-badge');
  const chatForm = document.getElementById('neon-ai-form');
  const chatInput = document.getElementById('neon-ai-input');
  const messagesContainer = document.getElementById('neon-ai-messages-list');
  const voiceBtn = document.getElementById('neon-ai-voice-btn');
  let sending = false;
  let disposed = false;
  const actionAgent = bindActionPanel({ onCommand: query => sendQuery(query) });

  const updateProviderDisplay = () => {
    if (providerBadge) {
      providerBadge.textContent = `${aiService.getProviderName()} · مطلع على سجلاتك 360°`;
    }
  };

  // زر مسح المحادثة
  const clearChatBtn = document.getElementById('neon-ai-clear-chat-btn');
  clearChatBtn?.addEventListener('click', () => {
    if (confirm('هل تريد مسح سجل المحادثة والبدء من جديد مع المدرب؟')) {
      if (store.clearAiChatHistory) store.clearAiChatHistory();
      screenChatHistory.length = 0;
      if (messagesContainer) {
        messagesContainer.innerHTML = `
          <div class="chat-bubble ai">
            مرحباً يا بطل! أنا مدربك الذكي <strong>NEON AI</strong> المعتمد عالمياً في التدريب الرياضي والتغذية (CSCS & CISSN).
            <div style="height: 6px;"></div>
            أنا أحتفظ بذاكرة محادثاتنا وسجلاتك كاملة 360° (هدفك، تمارينك، وجباتك، والماء والمكملات).
            <div style="height: 4px;"></div>
            اسألني عن أي وجبة لحسابها وإضافتها فوراً، أو استفسر عن تمرينك، التكنيك، أو خطتك! 🚀
          </div>
        `;
      }
      notificationService.showToast('تم مسح سجل المحادثة بنجاح 🧹', 'info');
    }
  });

  // استعادة وتحميل المحادثات السابقة من ذاكرة التطبيق
  const savedHistory = typeof store.getAiChatHistory === 'function' ? store.getAiChatHistory() : [];
  if (savedHistory.length > 0 && messagesContainer) {
    messagesContainer.innerHTML = '';
    screenChatHistory.length = 0;
    savedHistory.forEach(msg => {
      screenChatHistory.push({ sender: msg.sender, text: msg.text });
      appendScreenMessage(msg.text, msg.sender, msg.mealsData || null, false);
    });
    setTimeout(() => {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 60);
  }

  // لوحة الإعدادات
  settingsToggleBtn?.addEventListener('click', () => {
    if (!settingsPanel) return;
    const isVisible = settingsPanel.style.display !== 'none';
    settingsPanel.style.display = isVisible ? 'none' : 'block';
    if (!isVisible && keyInput) {
      keyInput.value = aiService.getCustomApiKey('gemini') || '';
      keyInput.focus();
    }
  });

  settingsCloseBtn?.addEventListener('click', () => {
    if (settingsPanel) settingsPanel.style.display = 'none';
  });

  saveKeyBtn?.addEventListener('click', () => {
    const key = (keyInput?.value || '').trim();
    if (key) {
      aiService.setCustomApiKey('gemini', key);
      if (modelSelect) aiService.setActiveModel(modelSelect.value);
      updateProviderDisplay();
      if (keyStatusMsg) {
        keyStatusMsg.textContent = '✅ تم حفظ المفتاح بنجاح! محرك NEON AI جاهز الآن بقوته الكاملة.';
        keyStatusMsg.style.color = '#55F7A5';
      }
      setTimeout(() => {
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (keyStatusMsg) keyStatusMsg.textContent = '';
      }, 1500);
    } else {
      if (keyStatusMsg) {
        keyStatusMsg.textContent = 'يرجى إدخال مفتاح صالح.';
        keyStatusMsg.style.color = '#ff9966';
      }
    }
  });

  clearKeyBtn?.addEventListener('click', () => {
    aiService.setCustomApiKey('gemini', '');
    if (keyInput) keyInput.value = '';
    updateProviderDisplay();
    if (keyStatusMsg) {
      keyStatusMsg.textContent = 'تم مسح المفتاح والعودة للوضع التجريبي الذكي.';
      keyStatusMsg.style.color = '#8fa097';
    }
  });

  modelSelect?.addEventListener('change', () => {
    aiService.setActiveModel(modelSelect.value);
    updateProviderDisplay();
  });

  // تسجيل الصوت
  voiceBtn?.addEventListener('click', () => {
    actionAgent.toggleVoice();
  });

  // الأسئلة السريعة
  document.querySelectorAll('.neon-ai-quick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt && chatInput) {
        chatInput.value = prompt;
        chatForm?.dispatchEvent(new Event('submit'));
      }
    });
  });

  function getInitialMealCategory(detectedTitle = '') {
    const t = (detectedTitle || '').toLowerCase();
    if (t.includes('فطور') || t.includes('إفطار')) return 'فطور';
    if (t.includes('غداء')) return 'غداء';
    if (t.includes('عشاء')) return 'عشاء';
    if (t.includes('سناك')) return 'سناك';

    const customNames = typeof store.getCustomMealNames === 'function' ? store.getCustomMealNames() : [];
    const matchedCustom = customNames.find(c => t.includes(c.toLowerCase()));
    if (matchedCustom) return matchedCustom;

    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'فطور';
    if (hour >= 12 && hour < 18) return 'غداء';
    if (hour >= 18 && hour < 24) return 'عشاء';
    return 'سناك';
  }

  // إرسال الرسائل
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = (chatInput?.value || '').trim();
    if (!query || sending) return;
    chatInput.value = '';
    await sendQuery(query);
  });

  async function sendQuery(query) {
    if (sending || disposed) return 'انتظر انتهاء الطلب الحالي.';
    sending = true;
    const sendButton = chatForm?.querySelector('[type="submit"]');
    if (sendButton) sendButton.disabled = true;

    appendScreenMessage(query, 'user');
    screenChatHistory.push({ sender: 'user', text: query });
    if (typeof store.saveAiChatMessage === 'function') {
      store.saveAiChatMessage({ sender: 'user', text: query });
    }

    const thinkingId = 'neon-ai-thinking-' + Date.now();
    const thinkingBubble = document.createElement('div');
    thinkingBubble.className = 'chat-bubble ai';
    thinkingBubble.id = thinkingId;
    thinkingBubble.innerHTML = `<span class="loading-spinner" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 6px;"></span> <span style="color: #55F7A5; font-weight: 600;">⚡ مدرب NEON AI يحلل بياناتك ويكتب الرد...</span>`;
    messagesContainer?.appendChild(thinkingBubble);
    messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });

    try {
      const state = store.getState();
      const dailyStackItems = typeof store.getDailyStackItems === 'function' ? store.getDailyStackItems() : [];
      const dailyStackTaken = typeof store.getDailyStackTaken === 'function' ? store.getDailyStackTaken() : {};
      const context = {
        userProfile: state.userProfile,
        today: state.today,
        loggedMeals: state.loggedMeals || [],
        mealPlan: state.mealPlan,
        activeWorkoutSession: state.activeWorkoutSession,
        workoutSchedule: state.workoutSchedule,
        fortyDay: state.fortyDay,
        weeklyCheckin: state.weeklyCheckin,
        progressReport: state.progressReport,
        dailyStackItems,
        dailyStackTaken,
        workout: state.workout
      };

      const response = await actionAgent.handle(query) || await aiService.chatWithCoach(query, context, screenChatHistory);
      if (disposed) return '';
      document.getElementById(thinkingId)?.remove();

      const replyText = response.reply || 'تم استلام استفسارك بنجاح.';
      screenChatHistory.push({ sender: 'ai', text: replyText });

      if (screenChatHistory.length > 20) {
        screenChatHistory.splice(0, screenChatHistory.length - 20);
      }

      const mealsToPass = response.mealsData || (response.mealData ? [response.mealData] : null);
      if (typeof store.saveAiChatMessage === 'function') {
        store.saveAiChatMessage({ sender: 'ai', text: replyText, mealsData: mealsToPass });
      }

      appendScreenMessage(replyText, 'ai', mealsToPass);
      return replyText;
    } catch (err) {
      if (disposed) return '';
      document.getElementById(thinkingId)?.remove();
      const errMsg = 'عذراً يا بطل! حدث خطأ مؤقت في الاتصال. يمكنك إعادة السؤال أو التحقق من مفتاح API من زر الإعدادات ⚙️.';
      appendScreenMessage(errMsg, 'ai');
      if (typeof store.saveAiChatMessage === 'function') {
        store.saveAiChatMessage({ sender: 'ai', text: errMsg });
      }
      return errMsg;
    } finally {
      sending = false;
      if (sendButton) sendButton.disabled = false;
    }
  }

  function appendScreenMessage(msgText, sender, mealsDataOrSingle = null) {
    if (!messagesContainer) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    if (sender === 'ai') {
      const formattedHtml = formatAiMarkdown(msgText);
      const textContainer = document.createElement('div');
      textContainer.innerHTML = formattedHtml;
      bubble.appendChild(textContainer);

      const mealsList = Array.isArray(mealsDataOrSingle)
        ? mealsDataOrSingle.filter(m => m && (m.totalCalories > 0 || m.calories > 0 || m.items?.length > 0))
        : (mealsDataOrSingle && (mealsDataOrSingle.totalCalories > 0 || mealsDataOrSingle.items?.length > 0) ? [mealsDataOrSingle] : []);

      // 1) في حال وجود وجبة واحدة مفردة
      if (mealsList.length === 1) {
        const mealData = mealsList[0];
        const cals = mealData.totalCalories ?? mealData.calories ?? 0;
        const prot = mealData.totalProtein ?? mealData.protein ?? 0;
        const carbs = mealData.totalCarbs ?? mealData.carbs ?? 0;
        const fats = mealData.totalFats ?? mealData.fats ?? 0;
        const detectedTitle = mealData.titleAr || 'وجبة محسوبة بالذكاء الاصطناعي';
        const initialCategory = getInitialMealCategory(detectedTitle);

        const defaultCategories = ['فطور', 'غداء', 'عشاء', 'سناك'];
        const customSavedNames = typeof store.getCustomMealNames === 'function' ? store.getCustomMealNames() : [];

        const defaultChipsHtml = defaultCategories.map(cat => `
          <button type="button" class="ai-meal-chip ${cat === initialCategory ? 'active' : ''}" data-cat="${cat}">
            ${cat}
          </button>
        `).join('');

        const customChipsHtml = customSavedNames.map(cat => `
          <div class="ai-meal-chip ${cat === initialCategory ? 'active' : ''}" data-cat="${cat}">
            <span>${cat}</span>
            <span class="ai-chip-delete-btn" data-del-cat="${cat}" title="حذف من الذاكرة">&times;</span>
          </div>
        `).join('');

        const actionCard = document.createElement('div');
        actionCard.className = 'ai-meal-confirm-card';
        actionCard.style.cssText = 'margin-top: 12px; padding: 14px; background: rgba(6,20,13,0.92); border: 1px solid rgba(85,247,165,0.35); border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);';
        actionCard.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 1.15rem;">🍽️</span>
            <strong style="font-size: 0.86rem; color: #55F7A5;">هل تريد إضافة هذه الوجبة إلى سجل وجباتك اليوم؟</strong>
          </div>
          <div style="font-size: 0.77rem; color: #d0ded6; margin-bottom: 10px; line-height: 1.45;">
            <span style="color: #55F7A5; font-weight: 700;">${cals}</span> سعرة | 
            <span style="color: #55F7A5; font-weight: 700;">${prot}غ</span> بروتين | 
            <span style="color: #55F7A5; font-weight: 700;">${carbs}غ</span> كارب | 
            <span style="color: #55F7A5; font-weight: 700;">${fats}غ</span> دهون
          </div>

          <!-- شريط اختيار اسم وتصنيف الوجبة -->
          <div class="ai-meal-name-picker" style="margin-bottom: 12px; padding: 10px; background: rgba(0,0,0,0.45); border-radius: 10px; border: 1px dashed rgba(85,247,165,0.25);">
            <div style="font-size: 0.75rem; color: #a4b5ac; margin-bottom: 7px; font-weight: 700; display: flex; justify-content: space-between; align-items: center;">
              <span>🏷️ اختر تصنيف / اسم الوجبة:</span>
              <span class="ai-selected-meal-name-badge" style="color: #55F7A5; font-weight: 800;">${initialCategory}</span>
            </div>
            <div class="ai-meal-chips-list" style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              ${defaultChipsHtml}
              ${customChipsHtml}
              <button type="button" class="ai-meal-chip ai-chip-other" data-cat="__other__">
                ✏️ أخرى
              </button>
            </div>
            <div class="ai-custom-meal-input-wrapper" style="display: none; margin-top: 8px;">
              <input type="text" class="ai-custom-meal-input" placeholder="اكتب اسم الوجبة المخصص (مثل: سناك بعد التمرين)..." style="width: 100%; box-sizing: border-box; padding: 7px 12px; background: rgba(0,0,0,0.7); border: 1px solid #55F7A5; border-radius: 8px; color: #FFFFFF; font-size: 0.82rem; outline: none;">
            </div>
          </div>

          <div class="ai-meal-btns-row" style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-primary ai-add-meal-confirm-btn" style="padding: 7px 16px; font-size: 0.8rem; font-weight: 800; border-radius: 8px;">
              ✓ نعم، أضفها لوجباتي
            </button>
            <button type="button" class="btn ai-add-meal-cancel-btn" style="padding: 7px 14px; font-size: 0.8rem; background: rgba(255,255,255,0.06); color: #8fa097; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; cursor: pointer;">
              لا
            </button>
          </div>
          <div class="ai-meal-status-feedback" style="display: none; font-size: 0.8rem; padding-top: 4px; line-height: 1.4;"></div>
        `;

        let selectedMealName = initialCategory;
        const chipsContainer = actionCard.querySelector('.ai-meal-chips-list');
        const customInputWrapper = actionCard.querySelector('.ai-custom-meal-input-wrapper');
        const customInput = actionCard.querySelector('.ai-custom-meal-input');
        const nameBadge = actionCard.querySelector('.ai-selected-meal-name-badge');

        chipsContainer?.addEventListener('click', (e) => {
          const delBtn = e.target.closest('.ai-chip-delete-btn');
          if (delBtn) {
            e.stopPropagation();
            const nameToDel = delBtn.getAttribute('data-del-cat');
            if (nameToDel && store.deleteCustomMealName) {
              store.deleteCustomMealName(nameToDel);
              const chipElem = delBtn.closest('.ai-meal-chip');
              const wasActive = chipElem.classList.contains('active');
              chipElem.remove();
              if (wasActive) {
                const firstChip = chipsContainer.querySelector('.ai-meal-chip[data-cat="فطور"]');
                if (firstChip) {
                  firstChip.classList.add('active');
                  selectedMealName = 'فطور';
                  if (nameBadge) nameBadge.textContent = selectedMealName;
                }
              }
            }
            return;
          }

          const chip = e.target.closest('.ai-meal-chip');
          if (!chip) return;

          chipsContainer.querySelectorAll('.ai-meal-chip').forEach(c => c.classList.remove('active'));
          chip.classList.add('active');

          const cat = chip.getAttribute('data-cat');
          if (cat === '__other__') {
            selectedMealName = '__other__';
            if (customInputWrapper) customInputWrapper.style.display = 'block';
            if (customInput) customInput.focus();
            if (nameBadge) nameBadge.textContent = (customInput?.value || '').trim() || 'أخرى (اكتب الاسم)';
          } else {
            selectedMealName = cat;
            if (customInputWrapper) customInputWrapper.style.display = 'none';
            if (nameBadge) nameBadge.textContent = selectedMealName;
          }
        });

        customInput?.addEventListener('input', () => {
          const val = customInput.value.trim();
          if (nameBadge && selectedMealName === '__other__') {
            nameBadge.textContent = val || 'أخرى (اكتب الاسم)';
          }
        });

        const confirmBtn = actionCard.querySelector('.ai-add-meal-confirm-btn');
        const cancelBtn = actionCard.querySelector('.ai-add-meal-cancel-btn');
        const btnsRow = actionCard.querySelector('.ai-meal-btns-row');
        const feedbackEl = actionCard.querySelector('.ai-meal-status-feedback');
        const pickerBox = actionCard.querySelector('.ai-meal-name-picker');

        confirmBtn?.addEventListener('click', () => {
          let finalTitle = selectedMealName;
          if (selectedMealName === '__other__') {
            const customVal = customInput ? customInput.value.trim() : '';
            if (customVal) {
              finalTitle = customVal;
              if (store.saveCustomMealName) {
                store.saveCustomMealName(customVal);
              }
            } else {
              finalTitle = 'وجبة إضافية';
            }
          }

          store.logMeal({
            titleAr: finalTitle,
            calories: cals,
            protein: prot,
            carbs: carbs,
            fats: fats,
            items: mealData.items || []
          });

          const updatedState = store.getState();
          const remCals = Math.max(0, updatedState.today.targetCalories - updatedState.today.consumedCalories);

          btnsRow.style.display = 'none';
          if (pickerBox) pickerBox.style.display = 'none';
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = '#55F7A5';
          feedbackEl.innerHTML = `✅ <strong>تمت إضافة (${finalTitle}) بنجاح إلى سجل التغذية!</strong><br>تم خصم السعرات من هدفك. المستهلك اليوم: <strong style="color:#FFFFFF;">${updatedState.today.consumedCalories}</strong> سعرة (المتبقي: <strong style="color:#FFFFFF;">${remCals}</strong> سعرة).`;

          notificationService.showToast(`تمت إضافة (${finalTitle}) لسجل اليوم وتحديث السعرات! 🥗`, 'success');
          const sysMsg = `قام المتدرب بإضافة (${finalTitle}: ${cals} سعرة) لسجل اليوم وتحديث السعرات.`;
          screenChatHistory.push({ sender: 'system', text: sysMsg });
          if (typeof store.saveAiChatMessage === 'function') {
            store.saveAiChatMessage({ sender: 'system', text: sysMsg });
          }
        });

        cancelBtn?.addEventListener('click', () => {
          btnsRow.style.display = 'none';
          if (pickerBox) pickerBox.style.display = 'none';
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = '#8fa097';
          feedbackEl.textContent = 'تم التخطي — لم تتم إضافة الوجبة للسجل.';
        });

        bubble.appendChild(actionCard);
      }
      // 2) في حال وجود أكثر من وجبة واحدة (Multiple Meals)
      else if (mealsList.length > 1) {
        const totalCals = mealsList.reduce((sum, m) => sum + (Number(m.totalCalories ?? m.calories) || 0), 0);
        const totalProt = mealsList.reduce((sum, m) => sum + (Number(m.totalProtein ?? m.protein) || 0), 0);
        const allCategories = typeof store.getAllMealCategoryNames === 'function' ? store.getAllMealCategoryNames() : ['فطور', 'غداء', 'عشاء', 'سناك'];

        const actionCard = document.createElement('div');
        actionCard.className = 'ai-meal-confirm-card';
        actionCard.style.cssText = 'margin-top: 12px; padding: 14px; background: rgba(6,20,13,0.92); border: 1px solid rgba(85,247,165,0.35); border-radius: 12px; box-shadow: 0 4px 18px rgba(0,0,0,0.4);';

        const mealsRowsHtml = mealsList.map((m, idx) => {
          const cals = m.totalCalories ?? m.calories ?? 0;
          const prot = m.totalProtein ?? m.protein ?? 0;
          const carbs = m.totalCarbs ?? m.carbs ?? 0;
          const fats = m.totalFats ?? m.fats ?? 0;
          const initialCat = getInitialMealCategory(m.titleAr || '');

          const optionsHtml = allCategories.map(c => `
            <option value="${c}" ${c === initialCat ? 'selected' : ''}>${c}</option>
          `).join('');

          return `
            <div class="ai-single-meal-row" data-idx="${idx}" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: rgba(255,255,255,0.03); border: 1px solid rgba(85,247,165,0.18); border-radius: 8px; margin-bottom: 6px; gap: 8px;">
              <div style="flex: 1; min-width: 0;">
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <select class="ai-meal-row-select" data-idx="${idx}" style="background: rgba(0,0,0,0.65); border: 1px solid rgba(85,247,165,0.35); color: #55F7A5; border-radius: 6px; font-size: 0.74rem; font-weight: 700; padding: 3px 6px; outline: none; cursor: pointer;">
                    ${optionsHtml}
                    <option value="__other__">✏️ أخرى...</option>
                  </select>
                </div>
                <div style="font-size: 0.72rem; color: #a4b5ac; margin-top: 3px;">
                  <span style="color: #55F7A5; font-weight: 700;">${cals}</span> سعرة · 
                  <span style="color: #55F7A5;">${prot}غ</span> بروتين · 
                  ${carbs}غ كارب · ${fats}غ دهون
                </div>
              </div>
              <button type="button" class="btn btn-add-individual-meal" data-idx="${idx}" style="padding: 5px 12px; font-size: 0.74rem; background: rgba(85,247,165,0.15); border: 1px solid rgba(85,247,165,0.35); color: #55F7A5; border-radius: 6px; cursor: pointer; font-weight: 700; white-space: nowrap;">
                + إضافة
              </button>
            </div>
          `;
        }).join('');

        actionCard.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
            <span style="font-size: 1.15rem;">🍽️</span>
            <strong style="font-size: 0.86rem; color: #55F7A5;">تم حساب ${mealsList.length} وجبات — هل تريد إضافتها إلى التغذية؟</strong>
          </div>
          <div style="font-size: 0.75rem; color: #b8c8be; margin-bottom: 8px;">
            المجموع الكلي: <strong style="color: #55F7A5;">${totalCals} سعرة</strong> | <strong style="color: #55F7A5;">${totalProt}غ بروتين</strong>
          </div>
          <div class="ai-meals-list-container" style="margin-bottom: 10px;">
            ${mealsRowsHtml}
          </div>
          <div class="ai-meal-btns-row" style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button type="button" class="btn btn-primary ai-add-all-meals-btn" style="padding: 7px 16px; font-size: 0.8rem; font-weight: 800; border-radius: 8px;">
              ✓ إضافة جميع الوجبات (${mealsList.length}) دفعة واحدة
            </button>
            <button type="button" class="btn ai-add-meal-cancel-btn" style="padding: 7px 14px; font-size: 0.8rem; background: rgba(255,255,255,0.06); color: #8fa097; border: 1px solid rgba(255,255,255,0.15); border-radius: 8px; cursor: pointer;">
              إلغاء
            </button>
          </div>
          <div class="ai-meal-status-feedback" style="display: none; font-size: 0.8rem; padding-top: 6px; line-height: 1.4;"></div>
        `;

        actionCard.querySelectorAll('.ai-meal-row-select').forEach(sel => {
          sel.addEventListener('change', () => {
            if (sel.value === '__other__') {
              const customVal = prompt('اكتب اسم الوجبة المخصص:');
              if (customVal && customVal.trim()) {
                const trimmed = customVal.trim();
                if (store.saveCustomMealName) store.saveCustomMealName(trimmed);
                const opt = document.createElement('option');
                opt.value = trimmed;
                opt.textContent = trimmed;
                opt.selected = true;
                sel.prepend(opt);
              } else {
                sel.value = 'فطور';
              }
            }
          });
        });

        const addAllBtn = actionCard.querySelector('.ai-add-all-meals-btn');
        const cancelBtn = actionCard.querySelector('.ai-add-meal-cancel-btn');
        const btnsRow = actionCard.querySelector('.ai-meal-btns-row');
        const feedbackEl = actionCard.querySelector('.ai-meal-status-feedback');
        const addedIndices = new Set();

        // إضافة وجبة فردية من القائمة
        actionCard.querySelectorAll('.btn-add-individual-meal').forEach(singleBtn => {
          singleBtn.addEventListener('click', () => {
            const idx = Number(singleBtn.getAttribute('data-idx'));
            if (addedIndices.has(idx)) return;
            const m = mealsList[idx];
            if (!m) return;

            const chosenTitle = actionCard.querySelector(`.ai-meal-row-select[data-idx="${idx}"]`)?.value || m.titleAr || `وجبة ${idx + 1}`;

            store.logMeal({
              titleAr: chosenTitle,
              calories: Number(m.totalCalories ?? m.calories) || 0,
              protein: Number(m.totalProtein ?? m.protein) || 0,
              carbs: Number(m.totalCarbs ?? m.carbs) || 0,
              fats: Number(m.totalFats ?? m.fats) || 0,
              items: m.items || []
            });

            addedIndices.add(idx);
            singleBtn.textContent = '✅ مضافة';
            singleBtn.style.background = 'rgba(85,247,165,0.3)';
            singleBtn.style.color = '#FFFFFF';
            singleBtn.disabled = true;

            const updatedState = store.getState();
            notificationService.showToast(`تمت إضافة (${chosenTitle}) بنجاح!`, 'success');
            const singleSysMsg = `قام المتدرب بإضافة (${chosenTitle}: ${Number(m.totalCalories ?? m.calories) || 0} سعرة) لسجل اليوم.`;
            screenChatHistory.push({ sender: 'system', text: singleSysMsg });
            if (typeof store.saveAiChatMessage === 'function') {
              store.saveAiChatMessage({ sender: 'system', text: singleSysMsg });
            }

            if (addedIndices.size === mealsList.length) {
              btnsRow.style.display = 'none';
              feedbackEl.style.display = 'block';
              feedbackEl.style.color = '#55F7A5';
              feedbackEl.innerHTML = `✅ <strong>تمت إضافة جميع الوجبات بنجاح إلى سجل التغذية!</strong><br>المستهلك اليوم: <strong style="color:#FFFFFF;">${updatedState.today.consumedCalories}</strong> سعرة.`;
            }
          });
        });

        // إضافة جميع الوجبات دفعة واحدة
        addAllBtn?.addEventListener('click', () => {
          let countAdded = 0;
          mealsList.forEach((m, idx) => {
            if (!addedIndices.has(idx)) {
              const chosenTitle = actionCard.querySelector(`.ai-meal-row-select[data-idx="${idx}"]`)?.value || m.titleAr || `وجبة ${idx + 1}`;

              store.logMeal({
                titleAr: chosenTitle,
                calories: Number(m.totalCalories ?? m.calories) || 0,
                protein: Number(m.totalProtein ?? m.protein) || 0,
                carbs: Number(m.totalCarbs ?? m.carbs) || 0,
                fats: Number(m.totalFats ?? m.fats) || 0,
                items: m.items || []
              });
              addedIndices.add(idx);
              countAdded++;
            }
          });

          const updatedState = store.getState();
          const remCals = Math.max(0, updatedState.today.targetCalories - updatedState.today.consumedCalories);

          btnsRow.style.display = 'none';
          actionCard.querySelectorAll('.btn-add-individual-meal').forEach(btn => {
            btn.textContent = '✅ تمت الإضافة';
            btn.disabled = true;
          });
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = '#55F7A5';
          feedbackEl.innerHTML = `✅ <strong>تمت إضافة جميع الوجبات (${countAdded} وجبات) بنجاح إلى سجل التغذية!</strong><br>المستهلك اليوم: <strong style="color:#FFFFFF;">${updatedState.today.consumedCalories}</strong> سعرة (المتبقي: <strong style="color:#FFFFFF;">${remCals}</strong> سعرة).`;
          notificationService.showToast(`تمت إضافة ${countAdded} وجبات وتحديث السعرات بالكامل! 🏆`, 'success');

          const allSysMsg = `قام المتدرب بإضافة (${countAdded} وجبات) لسجل اليوم وتحديث السعرات بالكامل.`;
          screenChatHistory.push({ sender: 'system', text: allSysMsg });
          if (typeof store.saveAiChatMessage === 'function') {
            store.saveAiChatMessage({ sender: 'system', text: allSysMsg });
          }
        });

        cancelBtn?.addEventListener('click', () => {
          btnsRow.style.display = 'none';
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = '#8fa097';
          feedbackEl.textContent = 'تم الإلغاء.';
        });

        bubble.appendChild(actionCard);
      }
    } else if (sender === 'system') {
      bubble.style.cssText = 'background: rgba(85,247,165,0.08); border: 1px dashed rgba(85,247,165,0.3); color: #8fa097; font-size: 0.8rem; text-align: center; margin: 8px auto; padding: 6px 14px; border-radius: 20px; max-width: 90%;';
      bubble.innerHTML = `<span>ℹ️ ${msgText}</span>`;
    } else {
      bubble.textContent = msgText;
    }

    messagesContainer.appendChild(bubble);

    if (sender === 'ai') {
      setTimeout(() => {
        const containerRect = messagesContainer.getBoundingClientRect();
        const bubbleRect = bubble.getBoundingClientRect();
        const currentScroll = messagesContainer.scrollTop;
        const targetScroll = currentScroll + (bubbleRect.top - containerRect.top) - 14;
        messagesContainer.scrollTo({
          top: Math.max(0, targetScroll),
          behavior: 'smooth'
        });
      }, 25);
    } else {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  return () => {
    disposed = true;
    actionAgent.dispose();
  };
}
