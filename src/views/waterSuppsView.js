/**
 * NEON COACH - شاشة المكملات اليومية الذكية (Daily Supplements Stack)
 * مكملات ثنائية اللغة (عربي / إنجليزي) مع إكمال تلقائي وتعبئة الجرعة المناسبة تلقائياً
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';
import { STACK_WINDOWS, searchSupplementsDb } from '../data/supplementsDb.js';

export function renderWaterSuppsView() {
  const items = store.getDailyStackItems();
  const taken = store.getDailyStackTaken();
  const lowList = store.getDailyStackLow();
  const total = items.length;
  const done = items.filter(i => !!taken[i.id]).length;
  const suppPct = total ? Math.round((done / total) * 100) : 0;

  return `
    <div class="water-supps-page" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px; max-width: 780px; margin: 0 auto;">
      
      <!-- شريط العنوان والرجوع -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <button id="ws-back-btn" class="btn-icon" aria-label="رجوع إلى اليوم" title="رجوع">
          ❯
        </button>
        <div style="text-align: center;">
          <h1 style="font-size: 1.35rem; font-weight: 900; color: #FFFFFF; margin-bottom: 2px;">
            المكملات اليومية
          </h1>
          <span style="font-size: 0.76rem; color: #55F7A5; font-family: monospace; letter-spacing: 0.05em;">
            DAILY SUPPLEMENTS STACK
          </span>
        </div>
        <div style="width: 40px;"></div>
      </div>

      <!-- بطاقة المكملات اليومية -->
      <div class="stack-card-wrap">
        
        <div class="stack-head-bar">
          <div>
            <div class="stack-main-title">اضغط على المكمل عند تناوله اليوم</div>
            <div class="stack-sub-progress" id="stackProgressText">
              ${done} من ${total} تم تناولها اليوم · يتجدد تلقائياً 6:00 ص
            </div>
          </div>
          <div class="stack-count-badge" id="stackCountPill">
            ${done}/${total} (${suppPct}%)
          </div>
        </div>

        <!-- شريط التقدم النيوني -->
        <div class="stack-progress-track" aria-hidden="true">
          <div class="stack-progress-fill" style="width: ${suppPct}%;"></div>
        </div>

        <!-- مجموعات المكملات مقسمة حسب النوافذ الزمنية -->
        <div class="stack-groups-container">
          ${STACK_WINDOWS.map(win => {
            const winItems = items.filter(item => (item.window || 'anytime') === win.key);
            if (winItems.length === 0) return '';
            return `
              <div class="stack-window-section">
                <div class="stack-window-head">
                  <span class="win-icon">${win.icon}</span>
                  <span class="win-title">${win.titleAr} (${win.title})</span>
                  <span class="win-time">${win.time}</span>
                </div>
                <div class="stack-window-list">
                  ${winItems.map(item => {
                    const isTaken = !!taken[item.id];
                    const isLow = lowList.includes(item.id);
                    const meta = [item.dose, item.note].filter(Boolean).join(' · ');
                    return `
                      <div class="stack-item-row ${isTaken ? 'taken' : ''}">
                        <button class="stack-item-check ${isTaken ? 'checked' : ''}" data-action="toggle" data-id="${item.id}" aria-label="تحديد كمكتمل">
                          ${isTaken ? '✓' : ''}
                        </button>
                        <div class="stack-item-content">
                          <div class="item-name" data-edit="name" data-id="${item.id}" title="اضغط للتعديل">${escapeHtml(item.name)}</div>
                          <div class="item-meta" data-edit="meta" data-id="${item.id}" title="اضغط للتعديل">${escapeHtml(meta)}</div>
                        </div>
                        <button class="stack-low-tag ${isLow ? 'is-low' : ''}" data-action="low" data-id="${item.id}" title="تنبيه قرب نفاد الكمية">
                          ${isLow ? '⚠️ قارب على النفاد' : '↓ كمية كافية'}
                        </button>
                        <button class="stack-del-btn" data-action="delete" data-id="${item.id}" title="حذف المكمل">
                          ×
                        </button>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('')}
          ${total === 0 ? `
            <div style="text-align: center; padding: 28px; color: #8C9992; font-size: 0.95rem;">
              لم تقم بإضافة مكملات بعد. اكتب اسم أي مكمل أدناه للبحث واختياره مع جرعته تلقائياً.
            </div>
          ` : ''}
        </div>

        <!-- نموذج إضافة مكمل جديد الذكي باللغتين مع الإكمال والجرعة التلقائية -->
        <div class="stack-form-wrap" style="margin-top: 20px;">
          <div class="stack-form-title">➕ إضافة مكمل إلى الخطة (Add Supplement)</div>
          <div style="font-size: 0.8rem; color: #8C9992; margin-bottom: 10px;">
            اكتب أول أحرف من المكمل (عربي أو إنجليزي) وستظهر لك المقترحات والجرعة المناسبة تلقائياً:
          </div>
          <div class="stack-form-grid">
            <div class="stack-name-container">
              <input id="stackAddName" type="text" placeholder="اسم المكمل (مثل: كرياتين، أوميغا 3، Creatine)..." class="stack-field" autocomplete="off" spellcheck="false" />
              <div id="stackSearchResults" class="stack-autocomplete-dropdown" hidden></div>
            </div>
            <input id="stackAddDose" type="text" placeholder="الجرعة المناسبة (مثل: 5g)" class="stack-field" />
            <select id="stackAddWindow" class="stack-field" style="cursor: pointer;">
              <option value="morning">الصباح (Morning)</option>
              <option value="lunch">الغداء (Lunch)</option>
              <option value="evening">المساء (Evening)</option>
              <option value="anytime" selected>أي وقت (Anytime)</option>
            </select>
            <button id="stackAddBtn" class="stack-submit-btn" type="button">
              + إضافة
            </button>
          </div>
        </div>

      </div>

    </div>
  `;
}

export function bindWaterSuppsEvents() {
  // زر الرجوع إلى صفحة اليوم
  document.getElementById('ws-back-btn')?.addEventListener('click', () => {
    window.location.hash = '#today';
  });

  // ============================================
  // البحث الذكي والإكمال التلقائي للجرعة والمكمل
  // ============================================
  const nameInput = document.getElementById('stackAddName');
  const doseInput = document.getElementById('stackAddDose');
  const winSelect = document.getElementById('stackAddWindow');
  const addBtn = document.getElementById('stackAddBtn');
  const resultsEl = document.getElementById('stackSearchResults');
  let pendingNote = '';

  if (nameInput && resultsEl) {
    nameInput.addEventListener('input', () => {
      const q = nameInput.value.trim();
      if (!q) {
        resultsEl.hidden = true;
        resultsEl.innerHTML = '';
        return;
      }
      const matches = searchSupplementsDb(q);
      if (matches.length === 0) {
        resultsEl.hidden = true;
        resultsEl.innerHTML = '';
        return;
      }
      resultsEl.hidden = false;
      resultsEl.innerHTML = matches.map(s => {
        const fullDisplay = s.displayName || `${s.name}${s.nameAr ? ' / ' + s.nameAr : ''}`;
        return `
          <button class="stack-autocomplete-item" type="button" 
            data-name="${escapeHtml(fullDisplay)}" 
            data-dose="${escapeHtml(s.dose)}" 
            data-window="${escapeHtml(s.window || 'anytime')}" 
            data-note="${escapeHtml(s.note || '')}">
            <span class="ac-icon">${s.icon || '💊'}</span>
            <div class="ac-body">
              <div class="ac-name" style="font-weight: 800; color: #FFFFFF;">${escapeHtml(fullDisplay)}</div>
              <div class="ac-meta">
                <span style="color: #55F7A5; font-weight: 700;">الجرعة المناسبة: ${escapeHtml(s.dose)}</span>
                ${s.note ? ' · ' + escapeHtml(s.note) : ''}
              </div>
            </div>
          </button>
        `;
      }).join('');
    });

    // اختيار مكمل من القائمة يملأ الاسم والجرعة والنافذة الزمنية تلقائياً
    resultsEl.addEventListener('click', (e) => {
      const itemBtn = e.target.closest('.stack-autocomplete-item');
      if (!itemBtn) return;
      nameInput.value = itemBtn.dataset.name || '';
      doseInput.value = itemBtn.dataset.dose || '';
      if (winSelect) {
        winSelect.value = itemBtn.dataset.window || 'anytime';
      }
      pendingNote = itemBtn.dataset.note || '';
      resultsEl.hidden = true;
      doseInput.focus();
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.stack-name-container')) {
        resultsEl.hidden = true;
      }
    });
  }

  const handleAdd = () => {
    const name = nameInput?.value.trim();
    const dose = doseInput?.value.trim();
    const windowKey = winSelect?.value || 'anytime';
    if (!name) return;
    store.addDailyStackItem(name, dose, windowKey, pendingNote);
    notificationService.showToast(`تمت إضافة ${name} بنجاح 💊`, 'success');
    refreshView();
  };

  addBtn?.addEventListener('click', handleAdd);
  doseInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleAdd();
  });
  nameInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && resultsEl && resultsEl.hidden) {
      handleAdd();
    }
  });

  // تفاعلات قائمة المكملات (تحديد مكتمل، قارب على النفاد، حذف، وتعديل مباشر)
  document.querySelector('.stack-groups-container')?.addEventListener('click', (e) => {
    const actionBtn = e.target.closest('[data-action]');
    if (actionBtn) {
      const id = actionBtn.dataset.id;
      const action = actionBtn.dataset.action;
      if (action === 'toggle') {
        store.toggleDailyStackTaken(id);
        refreshView();
      } else if (action === 'low') {
        store.toggleDailyStackLow(id);
        refreshView();
      } else if (action === 'delete') {
        store.deleteDailyStackItem(id);
        notificationService.showToast('تم حذف المكمل من الخطة', 'info');
        refreshView();
      }
      return;
    }

    const editable = e.target.closest('[data-edit]');
    if (editable && editable.getAttribute('contenteditable') !== 'true') {
      const id = editable.dataset.id;
      const field = editable.dataset.edit;
      editable.setAttribute('contenteditable', 'true');
      editable.focus();
      const onBlur = () => {
        editable.removeAttribute('contenteditable');
        editable.removeEventListener('blur', onBlur);
        editable.removeEventListener('keydown', onKey);
        store.updateDailyStackItem(id, field, editable.innerText);
        refreshView();
      };
      const onKey = (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          editable.blur();
        }
      };
      editable.addEventListener('blur', onBlur);
      editable.addEventListener('keydown', onKey);
    }
  });
}

function refreshView() {
  const container = document.getElementById('view-container');
  if (container) {
    container.innerHTML = renderWaterSuppsView();
    bindWaterSuppsEvents();
  }
}

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
