import { store } from '../state/store.js';
import { localDate } from '../domain/actionAgent.js';
import { dayNumber, dateFromDay, estimateInitialExpenditure, projectWeight } from '../domain/metabolicEngine.js';
import { metabolicInputs, parseMetabolicCsv } from '../domain/metabolicState.js';
const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));

const labels = { initial: 'تقدير أولي', calibrating: 'قيد المعايرة', stable: 'تقدير مستقر', holding: 'التحديث معلّق' };
const reasons = {
  PROFILE_REQUIRED: 'أكمل العمر والجنس والطول والوزن لحساب التقدير.',
  NEED_21_CONSECUTIVE_COMPLETE_DAYS: 'نحتاج 21 يومًا متتاليًا من الطعام المكتمل أو المقدّر بالكامل. الأيام الناقصة لا تُحسب صفرًا.',
  INSUFFICIENT_WEIGHT_COVERAGE: 'نحتاج 6 قياسات وزن على الأقل تغطي الفترة، مع قياس حديث.',
  WEIGHT_GAP: 'يوجد انقطاع طويل في قياسات الوزن.',
  RECENT_WATER_TRANSITION: 'تم تسجيل تغيّر قد يؤثر على الماء خلال آخر 14 يومًا.',
  ABRUPT_WEIGHT_CHANGE: 'يوجد تغيّر حاد في الوزن؛ ننتظر استقرار الاتجاه.',
  RAPID_WEIGHT_CHANGE: 'التغيّر أسرع من نطاق تقدير الأنسجة؛ نحتفظ بآخر تقدير.',
  INCOMPLETE_ALIGNED_INTERVAL: 'سجل الطعام لا يغطي فترة تغيّر الوزن كاملة.',
  IMPLAUSIBLE_ENERGY_BALANCE: 'النتيجة خارج نطاق المعايرة؛ راجع الكميات والقياسات.',
  NEXT_WEEKLY_UPDATE_PENDING: 'تم التحديث هذا الأسبوع؛ التحديث التالي بعد 7 أيام.',
  OUTSIDE_MODEL_POPULATION: 'هذا المحرك مخصص للبالغين خارج الحمل والرضاعة.'
};
const styles = 'padding:18px;display:grid;gap:12px';
const field = (name, label, value, attributes = '') => `<label style="display:grid;gap:5px;min-width:0">${label}<input name="${name}" value="${esc(String(value ?? ''))}" ${attributes} style="width:100%;min-width:0;padding:10px;border-radius:10px"></label>`;
const select = (name, label, value, options) => `<label style="display:grid;gap:5px;min-width:0">${label}<select name="${name}" style="width:100%;min-width:0;padding:10px;border-radius:10px">${options.map(([id, text]) => `<option value="${id}" ${value === id ? 'selected' : ''}>${text}</option>`).join('')}</select></label>`;
let message = '';
export function renderMetabolicSummary() {
  const snapshot = store.getMetabolicSnapshot();
  return `<section class="neon-card" style="${styles}"><div style="display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap"><strong>NEON Metabolic Engine</strong><span>${labels[snapshot.status] || labels.initial}</span></div><div>الصرف اليومي المقدّر TDEE: <b dir="ltr">${snapshot.tdee ? Math.round(snapshot.tdee) + ' kcal/day' : '—'}</b></div><small style="color:#B8C0BC">${reasons[snapshot.reasons[0]] || 'المعايرة تعتمد على الطعام الفعلي واتجاه الوزن، وليست قياسًا مخبريًا.'}</small><a href="#metabolism" class="btn btn-secondary">الحرق، جودة السجل وإعدادات الحساب</a></section>`;
}

export function renderMetabolismView() {
  const state = store.getState(), p = state.userProfile || {};
  const inputs = metabolicInputs(state);
  const snap = store.getMetabolicSnapshot(), initial = estimateInitialExpenditure(p);
  const today = localDate();
  const daily = inputs.nutrition.find(d => d.date === today);
  const projection = projectWeight({ profile: p, tdee: snap.tdee, intake: p.targetCalories, days: 90 });
  const training = new Set((p.metabolicTrainingDays || []).map(Number));
  return `<div style="padding:16px 16px 120px;display:grid;gap:16px;max-width:840px;margin:auto">
    <div style="display:flex;justify-content:space-between;align-items:center"><h1 style="font-size:1.5rem">الحرق والمعايرة</h1><a href="#nutrition" class="btn btn-secondary">رجوع</a></div>
    <p role="status" style="color:#55F7A5;overflow-wrap:anywhere">${esc(message)}</p>
    ${renderMetabolicSummary()}
    <section class="neon-card" style="${styles}"><strong>مصدر الأرقام</strong>
      ${p.macroWarnings?.length ? '<p role="alert" style="color:#ffce85">هدف البروتين المطلوب لا يتسع ضمن السعرات؛ الماكروز الحالية أقل منه. راجع هدف السعرات قبل اعتماد الخطة.</p>' : ''}
      ${p.floorApplied ? '<small>تم تطبيق الحد الأدنى للتوصية؛ معدل النزول المطلوب قد لا يتحقق بهذه الميزانية.</small>' : ''}
      ${p.goalReached ? '<small>الوزن المستهدف تحقق؛ التوصية الحالية للمحافظة على الوزن.</small>' : ''}
      <div>الطاقة في الراحة RMR: <b>${initial.rmr ? Math.round(initial.rmr) : '—'}</b> سعرة/يوم · ${initial.measured ? 'قياس مُدخل من فحص مخبري' : 'تقدير بمعادلة'}</div>
      <div>حالة البيانات: ${snap.quality.completeDays || 0} يوم مكتمل متتالٍ · ${snap.quality.weighIns || snap.trend.observations?.length || 0} قياسات وزن</div>
      <div>اتجاه الوزن: <b dir="ltr">${snap.trend.weeklyChangeKg == null ? '—' : snap.trend.weeklyChangeKg.toFixed(2) + ' kg/week'}</b></div>
      <small>استقرار التقدير لا يعني نسبة دقة مخبرية. نقص كميات الطعام المسجّلة يؤثر على النتيجة.</small>
    </section>
    <section class="neon-card" style="${styles}"><h2 style="font-size:1.1rem">تأكيد سجل الطعام</h2>
      <p style="font-size:.85rem">أكد اليوم بعد تسجيل كل الطعام. تعديل الطعام لاحقًا يعيد حالته إلى «جزئي». اترك مجموع السعرات فارغًا لاستخدام الوجبات المسجلة؛ أدخله لتقدير يوم كامل.</p>
      <form id="metabolic-day-form" style="display:grid;gap:12px">
        ${field('date','التاريخ',today,`type="date" required max="${today}"`)}
        ${select('status','حالة اليوم',daily?.status || 'missing', [['missing','غير مسجّل'],['partial','مسجّل جزئيًا'],['complete','كل الطعام مسجّل'],['estimated','تقدير كامل لليوم'],['fasting','صيام كامل: صفر سعرة مؤكد']])}
        ${field('calories','مجموع اليوم الاختياري (kcal)','', 'type="number" min="0" max="15000" step="1" placeholder="من الوجبات المسجلة"')}
        <p id="metabolic-day-total" style="font-size:.85rem">المسجّل لهذا التاريخ: ${daily?.calories ?? 0} سعرة</p>
        <button class="btn btn-primary" type="submit">حفظ حالة اليوم</button>
      </form>
      <div style="display:grid;gap:6px;font-size:.8rem">${Array.from({length:7},(_,i)=>dateFromDay(dayNumber(today)-i)).map(date=>{const r=inputs.nutrition.find(r=>r.date===date); return `<div style="display:flex;justify-content:space-between;gap:8px"><span dir="ltr">${date}</span><span>${r?.calories ?? '—'} kcal · ${({complete:'مكتمل',estimated:'تقديري',partial:'جزئي',fasting:'صيام',missing:'غير مكتمل'})[r?.status] || 'غير مكتمل'}</span></div>`;}).join('')}</div>
    </section>
    <section class="neon-card" style="${styles}"><strong>الوزن والتغيّرات المؤقتة</strong>
      <form id="metabolic-weight-form" style="display:flex;gap:8px;flex-wrap:wrap">${field('weight','وزن اليوم بالكيلوغرام','', 'type="number" required min="20" max="500" step="0.1"')}<button class="btn btn-secondary" type="submit">تسجيل الوزن</button></form>
      <label>تغيّر بدأ اليوم<select id="metabolic-event" style="width:100%;padding:10px"><option value="carb_change">تغيّر كبير بالكارب / بدء الكيتو</option><option value="creatine">بدء الكرياتين</option><option value="illness">مرض أو تعافٍ</option><option value="fluid_change">احتباس ماء أو تغيّر سوائل</option></select></label>
      <button id="metabolic-save-event" class="btn btn-secondary">تسجيل التغيّر وإمهال المعايرة 14 يومًا</button>
      <button id="metabolic-checkin" class="btn btn-primary">إجراء التحديث الأسبوعي الآن</button>
    </section>
    <details class="neon-card" style="${styles}"><summary style="cursor:pointer;font-weight:800">إعدادات المعادلات والماكروز</summary>
      <form id="metabolic-settings" style="display:grid;gap:14px;margin-top:16px">
        ${select('targetMode','طريقة إدارة الهدف',p.targetMode || 'manual',[['manual','يدوي: أحافظ على هدف السعرات الحالي'],['coached','متكيّف: توصية حسب الهدف والبيانات']])}
        ${select('rmrMethod','مصدر RMR',p.rmrMethod || 'mifflin_st_jeor',[['mifflin_st_jeor','Mifflin–St Jeor: افتراضي'],['cunningham','Cunningham: يحتاج FFM موثوقة'],['measured','Indirect Calorimetry: قياس مخبري']])}
        ${field('measuredRmr','RMR من الفحص (اختياري)',p.measuredRmr,'type="number" min="500" max="6000"')}
        ${field('rmrMeasuredAt','تاريخ فحص RMR',p.rmrMeasuredAt,`type="date" max="${today}"`)}
        ${field('fatFreeMassKg','الكتلة الخالية من الدهون FFM بالكيلوغرام',p.fatFreeMassKg,'type="number" min="10" max="300" step="0.1"')}
        ${select('ffmSource','مصدر FFM',p.ffmSource || '',[['','غير متوفر'],['dexa','DXA'],['bodpod','Bod Pod'],['bia','BIA / Tanita / InBody'],['clinical','تقييم سريري']])}
        ${field('ffmMeasuredAt','تاريخ قياس FFM',p.ffmMeasuredAt,`type="date" max="${today}"`)}
        <label><input type="checkbox" name="ffmReliable" ${p.ffmReliable ? 'checked' : ''}> أؤكد أن FFM من قياس مناسب وبظروف ترطيب مستقرة، وليست من اختيار صورة</label>
        ${field('knownTdee','TDEE معروف اختياريًا؛ يختلف عن RMR',p.knownTdee,'type="number" min="500" max="10000"')}
        ${select('activityModel','تقدير النشاط الأولي',p.activityModel || 'legacy',[['legacy','معامل النشاط المختار سابقًا، شاملًا التمرين'],['components','الخطوات والعمل والتمرين']])}
        ${field('dailySteps','متوسط الخطوات اليومي',p.dailySteps,'type="number" min="0" max="60000"')}
        ${select('jobActivity','طبيعة اليوم',p.jobActivity || 'seated',[['seated','جلوس غالبًا'],['standing','وقوف غالبًا'],['moving','حركة مستمرة'],['physical','عمل بدني']])}
        ${select('exerciseType','نوع التمرين',p.exerciseType || 'resistance',[['resistance','مقاومة'],['cardio','كارديو'],['mixed','مختلط']])}
        ${field('workoutDaysCount','حصص التمرين بالأسبوع',p.workoutDaysCount,'type="number" min="0" max="7"')}
        ${field('sessionDurationMin','مدة الحصة بالدقائق',p.sessionDurationMin,'type="number" min="0" max="180"')}
        ${select('macroStyle','توزيع الماكروز',p.macroStyle || 'standard',[['standard','التوزيع الحالي'],['balanced','Balanced: تقسيم المتبقي بالتساوي'],['low_fat','Low-fat'],['low_carb','Low-carb'],['keto','Keto']])}
        ${select('proteinPreference','مستوى البروتين',p.proteinPreference || 'moderate',[['low','أقل ضمن النطاق'],['moderate','متوسط'],['high','مرتفع']])}
        ${field('ketoCarbs','هدف كارب الكيتو (غرام، إجمالي الكارب)',p.ketoCarbs || 30,'type="number" min="10" max="50"')}
        <small>إجمالي الكارب وصافي الكارب مختلفان؛ الكيتو هنا يضبط هدف إجمالي الكارب، ولا يطرح الألياف تلقائيًا.</small>
        ${field('calorieFloor','الحد الأدنى للتوصية',p.calorieFloor || (p.gender==='female'?1200:1500),'type="number" min="1200" max="4000" required')}
        <small>هذا قيد للتوصية، ولا يضمن أن الهدف مناسب لكل شخص. معدل النزول المختار سابقًا يبقى محفوظًا.</small>
        ${field('calorieShift','زيادة أيام التدريب مع حفظ ميزانية الأسبوع',p.calorieShift || 0,'type="number" min="0" max="500"')}
        <div style="display:flex;gap:12px;flex-wrap:wrap">${['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map((d,i)=>`<label><input type="checkbox" name="trainingDay" value="${i}" ${training.has(i)?'checked':''}> ${d}</label>`).join('')}</div>
        <button type="submit" class="btn btn-primary">حفظ وإعادة الحساب</button>
      </form>
    </details>
    <details class="neon-card" style="${styles}"><summary>استيراد سجل سابق CSV</summary><p style="font-size:.85rem;margin-top:12px">الأعمدة: date,weight,calories,status. الوزن بالكيلوغرام. الحالات: complete أو estimated أو partial أو missing أو fasting. لا نصنّف يومًا مكتملًا تلقائيًا. البيانات المستوردة تستبدل بيانات نفس التاريخ في سجل المعايرة فقط.</p><pre dir="ltr" style="overflow:auto;font-size:.75rem">date,weight,calories,status\n2026-10-01,83,2200,complete</pre><input id="metabolic-csv" type="file" accept=".csv,text/csv" aria-label="استيراد CSV"></details>
    ${state.metabolicData?.weeklyCalories ? `<section class="neon-card" style="${styles}"><strong>ميزانية الأسبوع: ${state.metabolicData.weeklyCalories.reduce((a,b)=>a+b,0)} سعرة</strong>${state.metabolicData.weeklyCalories.map((c,i)=>`<div style="display:flex;justify-content:space-between"><span>${['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'][i]}</span><b>${c}</b></div>`).join('')}</section>` : ''}
    ${projection ? `<section class="neon-card" style="${styles}"><strong>توقع وزن تقريبي بعد استقرار السوائل</strong><small>نموذج Hall الخطي للتغيّرات المعتدلة، لا يحاكي مرحلة الماء الأولى ولا يضمن موعد الوصول.</small>${[30,60,90].map(day=>{const point=projection.points.find(x=>x.day===day);return point?`<div>بعد ${day} يومًا: حوالي ${point.weight.toFixed(1)} كغ</div>`:'';}).join('')}</section>` : ''}
    <p style="font-size:.8rem;color:#B8C0BC">الإعدادات وسجل المعايرة محفوظة على هذا المتصفح وضمن النسخة الاحتياطية للتطبيق.</p>
    <p style="font-size:.8rem"><a href="https://pubmed.ncbi.nlm.nih.gov/2305711/" target="_blank" rel="noopener">Mifflin</a> · <a href="https://pubmed.ncbi.nlm.nih.gov/7435418/" target="_blank" rel="noopener">Cunningham</a> · <a href="https://www.niddk.nih.gov/research-funding/at-niddk/labs-branches/laboratory-biological-modeling/integrative-physiology-section/research/body-weight-planner" target="_blank" rel="noopener">NIH / Hall</a></p>
  </div>`;
}
const refresh = () => { const root = document.getElementById('view-container'); if (root) { root.innerHTML = renderMetabolismView(); bindMetabolismEvents(); } };
function act(fn) { try { fn(); message = 'تم الحفظ.'; } catch (error) { message = error.message; } refresh(); }
export function bindMetabolismEvents() {
  document.getElementById('metabolic-day-form')?.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); act(()=>store.setNutritionDayStatus(data.get('date'),data.get('status'),data.get('calories') === '' ? null : Number(data.get('calories')))); });
  document.querySelector('#metabolic-day-form [name="date"]')?.addEventListener('change', event => {
    const r = metabolicInputs(store.getState()).nutrition.find(r=>r.date===event.target.value);
    const form = document.getElementById('metabolic-day-form'); form.elements.status.value = r?.status || 'missing'; form.elements.calories.value = '';
    document.getElementById('metabolic-day-total').textContent = `المسجّل لهذا التاريخ: ${r?.calories ?? 0} سعرة`;
  });
  document.getElementById('metabolic-weight-form')?.addEventListener('submit', event=>{event.preventDefault(); const weight=Number(new FormData(event.currentTarget).get('weight'));act(()=>store.logProgressMeasurement({weight}));});
  document.getElementById('metabolic-save-event')?.addEventListener('click',()=>act(()=>store.addMetabolicEvent(document.getElementById('metabolic-event').value)));
  document.getElementById('metabolic-checkin')?.addEventListener('click',()=>act(()=>store.submitWeeklyCheckin({})));
  document.getElementById('metabolic-settings')?.addEventListener('submit',event=>{
    event.preventDefault(); const data=new FormData(event.currentTarget); const settings=Object.fromEntries(data);
    for(const key of ['measuredRmr','fatFreeMassKg','knownTdee','dailySteps','workoutDaysCount','sessionDurationMin','ketoCarbs','calorieFloor','calorieShift']) settings[key]=data.get(key)===''?null:Number(data.get(key));
    settings.ffmReliable=data.has('ffmReliable'); settings.metabolicTrainingDays=data.getAll('trainingDay').map(Number); delete settings.trainingDay;
    act(()=>{
      const p=store.getState().userProfile;
      if(settings.rmrMethod==='measured' && !(settings.measuredRmr>=500 && settings.rmrMeasuredAt)) throw new Error('أدخل قيمة RMR المقاسة وتاريخ الفحص.');
      if(settings.rmrMethod==='cunningham' && !(settings.ffmReliable && settings.ffmSource && settings.ffmMeasuredAt && settings.fatFreeMassKg>0 && settings.fatFreeMassKg<Number(p.currentWeight || p.weight))) throw new Error('Cunningham تحتاج FFM أقل من الوزن، مع تأكيد المصدر وتاريخ القياس.');
      if(!estimateInitialExpenditure({...p,...settings}).valid) throw new Error('أكمل بيانات العمر والطول والوزن والجنس أولًا.');
      store.saveMetabolicSettings(settings);
    });
  });
  document.getElementById('metabolic-csv')?.addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;if(file.size>100000){message='الملف كبير جدًا.';refresh();return;}try{const rows=parseMetabolicCsv(await file.text());store.importMetabolicHistory(rows);message=`تم استيراد ${rows.length} يومًا.`;}catch(error){message=error.message;}refresh();});
}
