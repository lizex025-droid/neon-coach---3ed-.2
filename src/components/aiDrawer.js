/**
 * NEON COACH - الزر العائم ونافذة المحادثة الذكية للذكاء الاصطناعي (AI Coach Drawer)
 * يدعم: أحدث نماذج Google Gemini (2.0 Flash / Pro) و OpenAI وذاكرة المحادثة المتعددة
 */

import { aiService } from '../services/aiService.js';
import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';

export function renderAiDrawer() {
  const provider = aiService.getProviderName();
  const currentKey = aiService.getCustomApiKey('gemini') || '';
  const currentModel = aiService.getActiveModel();

  return `
    <!-- نافذة المحادثة المنبثقة -->
    <div id="ai-modal-overlay" class="ai-modal-overlay" role="dialog" aria-modal="true">
      <div class="ai-modal-panel">
        <!-- ترويسة المحادثة -->
        <div class="ai-modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="./icons/neon-cat-coach.svg" alt="AI Avatar" style="width: 28px; height: 28px;">
            <div>
              <div style="font-weight: 800; font-size: 0.95rem; color: #FFFFFF; letter-spacing: 0.5px;">NEON AI MASTER COACH</div>
              <div id="ai-provider-badge" style="font-size: 0.72rem; color: #55F7A5; font-weight: 600;">${provider}</div>
            </div>
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <button id="ai-settings-toggle-btn" class="btn-icon" style="width: 36px; height: 36px; font-size: 1.05rem;" title="إعدادات نموذج الذكاء ومفتاح API" aria-label="الإعدادات">
              ⚙️
            </button>
            <button id="ai-modal-close-btn" class="btn-icon" style="width: 36px; height: 36px;" aria-label="إغلاق">
              ✕
            </button>
          </div>
        </div>

        <!-- لوحة إعدادات المفتاح والنموذج (قابلة للفتح/الإغلاق) -->
        <div id="ai-settings-panel" style="display: none; padding: 14px 16px; background: #06140b; border-bottom: 1px solid rgba(85,247,165,0.25);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 0.82rem; font-weight: 700; color: #55F7A5;">⚙️ إعدادات المحرك الذكي (AI Engine)</span>
            <button type="button" id="ai-settings-close-btn" style="background: none; border: none; color: #8fa097; font-size: 0.85rem; cursor: pointer;">إغلاق ✕</button>
          </div>
          <div style="font-size: 0.75rem; color: #b2c2ba; margin-bottom: 10px; line-height: 1.4;">
            أدخل مفتاح <strong>Google Gemini API</strong> الخاص بك لتفعيل الردود الذكية الفورية المدعومة بأحدث نماذج الذكاء الاصطناعي:
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <div style="display: flex; gap: 6px;">
              <input type="password" id="ai-gemini-key-input" value="${currentKey}" placeholder="ألصق مفتاح Gemini هنا (AIza...)" style="flex: 1; padding: 8px 12px; font-size: 0.78rem; background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 8px; color: #FFFFFF;" autocomplete="off">
              <button type="button" id="ai-save-key-btn" class="btn btn-primary" style="padding: 6px 14px; font-size: 0.78rem; font-weight: 700;">حفظ</button>
            </div>
            <div style="display: flex; gap: 8px; align-items: center; justify-content: space-between; flex-wrap: wrap;">
              <select id="ai-model-select" style="background: #020704; border: 1px solid rgba(85,247,165,0.3); border-radius: 6px; color: #55F7A5; font-size: 0.75rem; padding: 5px 8px;">
                <option value="gemini-2.0-flash" ${currentModel === 'gemini-2.0-flash' ? 'selected' : ''}>Gemini 2.0 Flash (الأسرع والأذكى - موصى به)</option>
                <option value="gemini-1.5-pro" ${currentModel === 'gemini-1.5-pro' ? 'selected' : ''}>Gemini 1.5 Pro (تحليل متعمق)</option>
                <option value="gpt-4o-mini" ${currentModel === 'gpt-4o-mini' ? 'selected' : ''}>OpenAI GPT-4o-mini</option>
              </select>
              <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" id="ai-clear-key-btn" style="background: rgba(255,85,85,0.12); border: 1px solid rgba(255,85,85,0.35); border-radius: 6px; color: #ff7777; font-size: 0.72rem; padding: 4px 8px; cursor: pointer;">مسح المفتاح</button>
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener" style="font-size: 0.72rem; color: #55F7A5; text-decoration: underline;">مفتاح مجاني ↗</a>
              </div>
            </div>
            <div id="ai-key-status-msg" style="font-size: 0.72rem; color: #55F7A5; min-height: 16px;"></div>
          </div>
        </div>

        <div id="ai-messages-container" class="ai-modal-messages">
          <div class="chat-bubble ai">
            مرحباً يا بطل! أنا كوتش نيون (NEON AI Master Coach) — مدربك الشخصي وأخصائي التغذية الذكي المعتمد.
            <div style="height: 6px;"></div>
            جاهز للإجابة باحترافية كاملة عن تمارينك، الماكروز، التكنيك، التدرج بالأوزان، المكملات، أو خطتك لليوم! 🚀
          </div>
        </div>

        <!-- أسئلة سريعة مقترحة -->
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 8px 16px; background: #040a07; scrollbar-width: none;">
          <button class="badge badge-neon quick-prompt" data-prompt="ما هو تمرين اليوم بالتفصيل وكيف أطبقه؟">🏋️ تمرين اليوم</button>
          <button class="badge badge-neon quick-prompt" data-prompt="كم متبقي لي من السعرات والبروتين اليوم وكيف أكملهم؟">🥗 متبقي الماكروز</button>
          <button class="badge badge-neon quick-prompt" data-prompt="أشعر بألم في مفصل الكتف أثناء البنش، ما التعديل الآمن؟">⚠️ نصيحة لألم الكتف</button>
          <button class="badge badge-neon quick-prompt" data-prompt="ما هي أفضل استراتيجية للتدرج بالأوزان (Progressive Overload)؟">📈 التدرج بالأوزان</button>
          <button class="badge badge-neon quick-prompt" data-prompt="ما رأيك العلمي في الكرياتين والبروتين وكيف أتناولهم؟">💊 المكملات الفعالة</button>
        </div>

        <form id="ai-chat-form" class="ai-modal-input-area">
          <input type="text" id="ai-chat-input" placeholder="اسأل مدربك الذكي أي سؤال..." autocomplete="off">
          <button type="submit" class="btn btn-primary" style="padding: 10px 18px; font-weight: 700;">
            إرسال
          </button>
        </form>
      </div>
    </div>
  `;
}

/**
 * منسق نصوص متقدم وخفيف يحول نصوص الماركداون إلى HTML منسق بأمان
 */
function formatAiResponse(text) {
  if (!text) return '';
  // 1. حماية وتطهير الرموز الأساسية لمنع XSS
  let safe = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. تحويل الخط العريض **نص**
  safe = safe.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // 3. تحويل العناوين ###
  let lineIdx = 0;
  safe = safe.replace(/^###\s+(.*)$/gm, (_, title) => {
    lineIdx++;
    return `<div class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; font-weight: 800; color: #55F7A5; margin: 8px 0 4px 0; font-size: 0.95rem;">${title}</div>`;
  });
  safe = safe.replace(/^##\s+(.*)$/gm, (_, title) => {
    lineIdx++;
    return `<div class="ai-reveal-line" style="animation-delay: ${(lineIdx * 0.035).toFixed(3)}s; font-weight: 800; color: #55F7A5; margin: 10px 0 6px 0; font-size: 1rem;">${title}</div>`;
  });

  // 4. معالجة القوائم النقطية والمرقمة والأسطر
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

  if (inList) {
    processedLines.push('</ul>');
  }

  return processedLines.join('');
}

export function bindAiDrawerEvents() {
  const fab = document.getElementById('ai-coach-fab');
  const overlay = document.getElementById('ai-modal-overlay');
  const closeBtn = document.getElementById('ai-modal-close-btn');
  const settingsToggleBtn = document.getElementById('ai-settings-toggle-btn');
  const settingsPanel = document.getElementById('ai-settings-panel');
  const settingsCloseBtn = document.getElementById('ai-settings-close-btn');
  const saveKeyBtn = document.getElementById('ai-save-key-btn');
  const clearKeyBtn = document.getElementById('ai-clear-key-btn');
  const keyInput = document.getElementById('ai-gemini-key-input');
  const modelSelect = document.getElementById('ai-model-select');
  const keyStatusMsg = document.getElementById('ai-key-status-msg');
  const providerBadge = document.getElementById('ai-provider-badge');
  const chatForm = document.getElementById('ai-chat-form');
  const chatInput = document.getElementById('ai-chat-input');
  const messagesContainer = document.getElementById('ai-messages-container');

  if (!fab || !overlay) return;

  // ذاكرة المحادثة المتعددة للجلسة الحالية
  const chatHistory = [];

  const updateProviderDisplay = () => {
    if (providerBadge) {
      providerBadge.textContent = aiService.getProviderName();
    }
  };

  const openDrawer = () => {
    overlay.classList.add('open');
    chatInput?.focus();
  };

  const closeDrawer = () => {
    overlay.classList.remove('open');
    if (settingsPanel) settingsPanel.style.display = 'none';
  };

  fab.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDrawer();
  });

  // التحكم في لوحة الإعدادات
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

  // حفظ مفتاح API
  saveKeyBtn?.addEventListener('click', () => {
    const key = (keyInput?.value || '').trim();
    if (key) {
      aiService.setCustomApiKey('gemini', key);
      if (modelSelect) {
        aiService.setActiveModel(modelSelect.value);
      }
      updateProviderDisplay();
      if (keyStatusMsg) {
        keyStatusMsg.textContent = '✅ تم حفظ المفتاح بنجاح! المدرب جاهز الآن بقوة Gemini الكاملة.';
        keyStatusMsg.style.color = '#55F7A5';
      }
      setTimeout(() => {
        if (settingsPanel) settingsPanel.style.display = 'none';
        if (keyStatusMsg) keyStatusMsg.textContent = '';
      }, 1500);
    } else {
      if (keyStatusMsg) {
        keyStatusMsg.textContent = 'يرجى إدخال مفتاح صالح أو الضغط على مسح للعودة للوضع التجريبي.';
        keyStatusMsg.style.color = '#ff9966';
      }
    }
  });

  // تغيير النموذج المفضل
  modelSelect?.addEventListener('change', () => {
    aiService.setActiveModel(modelSelect.value);
    updateProviderDisplay();
  });

  // مسح المفتاح والرجوع للمحاكي
  clearKeyBtn?.addEventListener('click', () => {
    aiService.setCustomApiKey('gemini', '');
    if (keyInput) keyInput.value = '';
    updateProviderDisplay();
    if (keyStatusMsg) {
      keyStatusMsg.textContent = 'تم مسح المفتاح والعودة إلى المحاكي المحلي.';
      keyStatusMsg.style.color = '#ffaa55';
    }
    setTimeout(() => {
      if (keyStatusMsg) keyStatusMsg.textContent = '';
    }, 2000);
  });

  // النقر على الأزرار السريعة
  document.querySelectorAll('.quick-prompt').forEach(btn => {
    btn.addEventListener('click', () => {
      const prompt = btn.getAttribute('data-prompt');
      if (prompt && chatInput) {
        chatInput.value = prompt;
        chatForm?.dispatchEvent(new Event('submit'));
      }
    });
  });

  // إرسال رسالة للمحادثة
  chatForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    // إضافة رسالة المستخدم للواجهة ولذاكرة المحادثة
    appendMessage(text, 'user');
    chatHistory.push({ sender: 'user', text });
    chatInput.value = '';

    // مؤشر جاري الكتابة
    const typingElem = document.createElement('div');
    typingElem.className = 'chat-bubble ai';
    typingElem.innerHTML = '<span class="loading-spinner" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle; margin-left: 6px;"></span> كوتش نيون يفكر في إجابتك...';
    messagesContainer.appendChild(typingElem);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

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

      const response = await aiService.chatWithCoach(text, context, chatHistory);
      typingElem.remove();

      // حفظ الرد بذاكرة المحادثة
      const replyText = response.reply || 'تم استلام استفسارك بنجاح.';
      chatHistory.push({ sender: 'ai', text: replyText });

      // تقليم تاريخ المحادثة لمنع التضخم
      if (chatHistory.length > 20) {
        chatHistory.splice(0, chatHistory.length - 20);
      }

      appendMessage(replyText, 'ai', response.mealsData || (response.mealData ? [response.mealData] : null));
    } catch (err) {
      typingElem.remove();
      appendMessage('عذراً يا بطل! حدث خطأ مؤقت في الاتصال. يمكنك إعادة السؤال أو التحقق من مفتاح API من زر الإعدادات ⚙️.', 'ai');
    }
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

  function appendMessage(msgText, sender, mealsDataOrSingle = null) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    if (sender === 'ai') {
      bubble.innerHTML = formatAiResponse(msgText);

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

          <!-- شريط اختيار اسم وتصنيف الوجبة (فطور، غداء، عشاء، سناك، أو اسم مخصص محفوظ) -->
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
          // حذف اسم مخصص من الذاكرة
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
            customInputWrapper.style.display = 'block';
            customInput.focus();
            if (nameBadge) nameBadge.textContent = customInput.value.trim() || 'أخرى (اكتب الاسم)';
          } else {
            selectedMealName = cat;
            customInputWrapper.style.display = 'none';
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
          chatHistory.push({ sender: 'system', text: `قام المتدرب بإضافة (${finalTitle}: ${cals} سعرة) لسجل اليوم وتحديث السعرات.` });
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
            singleBtn.textContent = '✅ تمت الإضافة';
            singleBtn.style.background = 'rgba(85,247,165,0.3)';
            singleBtn.style.color = '#FFFFFF';
            singleBtn.disabled = true;

            const updatedState = store.getState();
            const remCals = Math.max(0, updatedState.today.targetCalories - updatedState.today.consumedCalories);

            feedbackEl.style.display = 'block';
            feedbackEl.style.color = '#55F7A5';
            feedbackEl.innerHTML = `✅ تمت إضافة (${chosenTitle}). المستهلك: <strong>${updatedState.today.consumedCalories}</strong> سعرة (المتبقي: <strong>${remCals}</strong> سعرة).`;
            notificationService.showToast(`تمت إضافة (${chosenTitle}) وخصم سعراتها! 🥗`, 'success');

            if (addedIndices.size === mealsList.length) {
              btnsRow.style.display = 'none';
              feedbackEl.innerHTML = `✅ <strong>تمت إضافة جميع الوجبات (${mealsList.length}) بنجاح!</strong><br>المستهلك اليوم: <strong>${updatedState.today.consumedCalories}</strong> سعرة (المتبقي: <strong>${remCals}</strong> سعرة).`;
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
        });

        cancelBtn?.addEventListener('click', () => {
          btnsRow.style.display = 'none';
          feedbackEl.style.display = 'block';
          feedbackEl.style.color = '#8fa097';
          feedbackEl.textContent = 'تم الإلغاء.';
        });

        bubble.appendChild(actionCard);
      }
    } else {
      bubble.textContent = msgText;
    }

    messagesContainer.appendChild(bubble);

    if (sender === 'ai') {
      // التمرير الذكي لظهور الرد من فوق لتحت (إبقاء بداية الرد في أعلى الشاشة)
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
}

