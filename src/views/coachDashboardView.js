/**
 * NEON COACH - لوحة المدرب التجريبية (Coach Dashboard)
 * تتيح للمدرب استعراض العملاء، ومراجعة استبياناتهم وخططهم ومتابعاتهم واعتماد التعديلات
 */

import { store } from '../state/store.js';
import { notificationService } from '../services/notificationService.js';

let selectedClientId = 'client-1';
let activeClientTab = 'overview';

export function renderCoachDashboardView() {
  const state = store.getState();
  const clients = state.coachClients;
  const selectedClient = clients.find(c => c.id === selectedClientId) || clients[0];

  return `
    <div class="coach-dashboard-container" style="padding: 16px 16px 96px; display: flex; flex-direction: column; gap: 16px;">
      
      <!-- شريط العنوان وتنبيه وضع المدرب -->
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div>
          <h1 style="font-size: 1.6rem; font-weight: 900; color: #FFFFFF; margin-bottom: 2px;">
            لوحة المدرب 👔
          </h1>
          <div style="font-size: 0.8rem; color: #55F7A5;">إدارة المتدربين والخطط المعتمدة</div>
        </div>

        <button id="exit-coach-mode-btn" class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem; border-radius: 12px;">
          العودة لوضع المتدرب 🏋️
        </button>
      </div>

      <!-- قائمة العملاء التجريبيين وشريط البحث -->
      <div class="neon-card" style="padding: 16px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <span style="font-weight: 800; color: #FFFFFF; font-size: 0.95rem;">قائمة العملاء (${clients.length})</span>
          <input type="text" id="client-search-input" placeholder="بحث عن متدرب..." style="max-width: 160px; padding: 6px 10px; font-size: 0.82rem; border-radius: 10px;">
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${clients.map(cl => {
            const isSelected = cl.id === selectedClientId;
            return `
              <div class="neon-card alt client-card-item ${isSelected ? 'glow' : ''}" data-id="${cl.id}" style="padding: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; border-color: ${isSelected ? '#55F7A5' : 'rgba(85,247,165,0.15)'};">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <span style="font-size: 1.4rem;">${cl.avatar}</span>
                  <div>
                    <div style="font-weight: 800; color: #FFFFFF; font-size: 0.92rem;">${cl.name}</div>
                    <div style="font-size: 0.75rem; color: #B8C0BC;">${cl.goalAr} • آخر متابعة: ${cl.lastCheckinDate}</div>
                  </div>
                </div>

                <div style="display: flex; align-items: center; gap: 8px;">
                  ${cl.painAlert ? '<span class="badge badge-danger">⚠️ ألم مفصل</span>' : ''}
                  ${cl.status === 'needs_review' ? '<span class="badge badge-demo">بانتظار المراجعة</span>' : ''}
                  <span style="color: #55F7A5; font-weight: 800; font-family: monospace; font-size: 0.9rem;">${cl.adherencePct}%</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- بطاقة تفاصيل المتدرب المحدد والتبويبات -->
      <div class="neon-card" style="padding: 20px;">
        
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid rgba(85,247,165,0.15); padding-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.8rem;">${selectedClient.avatar}</span>
            <div>
              <h2 style="font-size: 1.25rem; font-weight: 900; color: #FFFFFF; margin: 0;">${selectedClient.name}</h2>
              <div style="font-size: 0.8rem; color: #B8C0BC;">الوزن الحالي: ${selectedClient.currentWeight} كغ (البداية: ${selectedClient.startWeight} كغ)</div>
            </div>
          </div>

          <button id="approve-plan-btn" class="btn btn-primary" style="padding: 8px 16px; font-size: 0.85rem; border-radius: 12px;">
            🛡️ اعتماد الخطة
          </button>
        </div>

        <!-- أزرار التبويبات -->
        <div style="display: flex; gap: 6px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px;">
          <button class="badge ${activeClientTab === 'overview' ? 'badge-neon' : 'badge-verified'} client-tab-btn" data-tab="overview">الملف والاستبيان</button>
          <button class="badge ${activeClientTab === 'training' ? 'badge-neon' : 'badge-verified'} client-tab-btn" data-tab="training">البرنامج التدريبي</button>
          <button class="badge ${activeClientTab === 'nutrition' ? 'badge-neon' : 'badge-verified'} client-tab-btn" data-tab="nutrition">الخطة الغذائية</button>
          <button class="badge ${activeClientTab === 'checkins' ? 'badge-neon' : 'badge-verified'} client-tab-btn" data-tab="checkins">المتابعات الأسبوعية</button>
        </div>

        <!-- محتوى التبويب -->
        <div id="coach-tab-content">
          ${renderClientTabContent(activeClientTab, state)}
        </div>

      </div>

    </div>
  `;
}

function renderClientTabContent(tab, state) {
  switch (tab) {
    case 'overview':
      return `
        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 0.9rem;">
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.1); padding-bottom: 6px;">
            <span style="color: #B8C0BC;">الهدف الأساسي:</span>
            <span style="color: #FFFFFF; font-weight: 700;">خسارة دهون وتنشيف مستدام</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.1); padding-bottom: 6px;">
            <span style="color: #B8C0BC;">السعرات المستهدفة:</span>
            <span style="color: #55F7A5; font-weight: 800; font-family: monospace;">2,100 سعرة (عجز 20%)</span>
          </div>
          <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(85,247,165,0.1); padding-bottom: 6px;">
            <span style="color: #B8C0BC;">الماكروز:</span>
            <span style="color: #FFFFFF;">بروتين 160غ | كارب 220غ | دهون 65غ</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: #B8C0BC;">حالة الاعتماد:</span>
            <span class="badge badge-verified">معتمدة حتى نهاية الشهر</span>
          </div>
        </div>
      `;

    case 'training':
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-weight: 700; color: #FFFFFF;">توزيع الجلسات (4 أيام أسبوعياً - جيم):</div>
          <div class="neon-card alt" style="padding: 10px;">• اليوم 1: صدر وترايسبس (دفع علوي) — 6 تمارين</div>
          <div class="neon-card alt" style="padding: 10px;">• اليوم 2: ظهر وبايسبس (سحب علوي) — 5 تمارين</div>
          <div class="neon-card alt" style="padding: 10px;">• اليوم 3: أرجل وبطن — 4 تمارين</div>
          <div class="neon-card alt" style="padding: 10px;">• اليوم 4: أكتاف وذراعين — 5 تمارين</div>
        </div>
      `;

    case 'nutrition':
      return `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-weight: 700; color: #FFFFFF;">جدول الوجبات المعتمد:</div>
          <div class="neon-card alt" style="padding: 10px;">🌅 الفطور: شوفان وتوت ولوز (420 سعرة)</div>
          <div class="neon-card alt" style="padding: 10px;">☀️ الغداء: صدر دجاج 190غ + بطاطا 170غ + سلطة (489 سعرة)</div>
          <div class="neon-card alt" style="padding: 10px;">🌙 العشاء: سلمون مشوي 150غ مع خضار (380 سعرة)</div>
          <div class="neon-card alt" style="padding: 10px;">🍏 سناك: زبادي يوناني وتوت أزرق (131 سعرة)</div>
        </div>
      `;

    case 'checkins':
      return `
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="font-weight: 700; color: #FFFFFF;">آخر متابعة (الأسبوع 4):</div>
          <div class="neon-card alt" style="padding: 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="color: #55F7A5; font-weight: 800;">الوزن: 101.4 كغ (↓ -1.6 كغ)</span>
              <span style="color: #B8C0BC;">النوم: 7 ساعات</span>
            </div>
            <div style="font-size: 0.85rem; color: #FFFFFF; margin-bottom: 6px;">
              الطاقة 4/5 • التوتر 2/5 • تمارين مكتملة: 4/4
            </div>
            <div style="font-size: 0.85rem; color: #B8C0BC; font-style: italic;">
              ملاحظة العميل: "أشعر بنشاط كبير وخفة بالحركة والتزمت بكافة الجلسات."
            </div>
          </div>
        </div>
      `;

    default:
      return '';
  }
}

export function bindCoachDashboardEvents() {
  document.getElementById('exit-coach-mode-btn')?.addEventListener('click', () => {
    store.setRole('client');
    window.location.hash = '#today';
  });

  // اختيار متدرب من القائمة
  document.querySelectorAll('.client-card-item').forEach(card => {
    card.addEventListener('click', () => {
      selectedClientId = card.getAttribute('data-id');
      window.location.hash = '#coach';
    });
  });

  // التبديل بين التبويبات
  document.querySelectorAll('.client-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeClientTab = btn.getAttribute('data-tab');
      window.location.hash = '#coach';
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const vc = document.getElementById('view-container');
      if (vc) vc.scrollTop = 0;
    });
  });

  // زر اعتماد الخطة من قبل المدرب
  document.getElementById('approve-plan-btn')?.addEventListener('click', () => {
    store.approveClientPlan(selectedClientId, 'تمت المراجعة والاعتماد — استمر على نفس توزيع السعرات والماكروز.');
    notificationService.showToast('تم اعتماد الخطة رسمياً وإظهار شارة "معتمدة من المدرب" للمتدرب 🛡️', 'success');
  });
}
