import { dayNumber } from '../domain/metabolicEngine.js';

export const METABOLIC_STEP_KEYS = ['metabolic_history','metabolic_activity','metabolic_measurement','metabolic_strategy'];
export const METABOLIC_DEFAULTS = {
  weightHistoryHigher:null, highestAdultWeight:null, recentWeightTrend:null, recentWeightStartKg:null,
  recentWeightStartDate:'', recentAverageCalories:null, recentIntakeComplete:false, historyEndDate:'', historyEndWeight:null,
  dailyMovement:null, dailySteps:null, jobActivity:null, activityModel:'components',
  exerciseType:null, exerciseSessionsPerWeek:null, exerciseDurationMin:null,
  liftingExperience:null, cardioExperience:null, athleticStatus:null,
  rmrMethod:'mifflin_st_jeor', measuredRmr:null, rmrMeasuredAt:'', fatFreeMassKg:null,
  ffmSource:'', ffmMeasuredAt:'', ffmReliable:false, knownTdee:null,
  macroStyle:null, programTrainingType:null, proteinPreference:null, ketoCarbs:30,
  calorieDistribution:null, calorieShift:0, metabolicTrainingDays:[], calorieFloor:null,
  recentTransitionType:null, recentTransitionDate:'', recentTransitionReportedAt:'', metabolicOnboardingVersion:2
};
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const choices=(name,title,value,options)=>`<fieldset class="metabolic-question"><legend>${title}</legend><div class="metabolic-choice-list">${options.map(([id,label,description])=>`<label class="metabolic-choice"><input type="radio" name="${name}" value="${id}" ${value===id?'checked':''}><span><b>${label}</b>${description?`<small>${description}</small>`:''}</span></label>`).join('')}</div></fieldset>`;
const input=(name,label,value,type='number',extra='')=>`<label class="metabolic-field">${label}<input name="${name}" value="${esc(value)}" type="${type}" ${extra}></label>`;
const select=(name,label,value,options)=>choices(name,label,value,options.filter(([id])=>id!==''));
// Presets are exact choices, never hidden midpoint estimates. Custom retains the original precision.
const numberChoices=(name,title,value,presets,unit,extra='',optional=false)=>{
  const ids=presets.map(String), selected=value===null||value===undefined?'':ids.includes(String(value))?String(value):'custom';
  return `<div class="metabolic-number-choice" data-number-field="${name}">${choices(name+'Choice',title,selected,[...presets.map(n=>[String(n),`${n} ${unit}`]),['custom','قيمة ثانية — أدخل الرقم'],...(optional?[['','مش عارف / تخطي']]:[])])}<div data-meta-visible="${name}Choice:custom">${input(name,'القيمة الدقيقة',value,'number',extra)}</div></div>`;
};
export function renderMetabolicOnboardingStep(key,p,today) {
  const header=(title,copy)=>`<h2 style="color:#55F7A5;font-size:1.5rem;margin-bottom:8px">${title}</h2><p style="color:#B8C0BC;margin-bottom:20px">${copy}</p>`;
  let body='';
  if(key==='metabolic_history') body=header('بيانات سابقة وتغيّرات حديثة','الأرقام السابقة اختيارية لتحسين تقدير البداية، والتغيّرات الحديثة تساعدنا على التعامل مع تقلّبات الماء.')+
    `<details><summary>عندي أرقام سابقة أو متوسط سعرات موثوق (اختياري)</summary><div class="metabolic-fields">${input('recentWeightStartKg','وزنك السابق بالكيلوغرام',p.recentWeightStartKg,'number','min="20" max="500" step="0.1"')}${input('recentWeightStartDate','تاريخ الوزن السابق',p.recentWeightStartDate,'date',`max="${today}"`)}${input('recentAverageCalories','متوسط الأكل الفعلي يوميًا خلال نفس الفترة',p.recentAverageCalories,'number','min="500" max="10000"')}<label><input type="checkbox" name="recentIntakeComplete" ${p.recentIntakeComplete?'checked':''}> المتوسط يشمل كل أيام الفترة وكل الطعام، وليس هدف الحمية فقط</label><small>لن ننشئ أيام طعام أو أوزانًا وهمية من هذا المتوسط. استيراد السجل اليومي متاح من صفحة الحرق لاحقًا.</small></div></details>`+
    choices('recentTransitionType','هل صار تغيّر واضح خلال آخر أسبوعين؟',p.recentTransitionType,[['none','لا'],['carb_change','تغيّر كبير بالكارب / بدء كيتو'],['creatine','بدء كرياتين'],['fluid_change','تغيّر سوائل أو احتباس ماء'],['unknown','مش متأكد']])+
    '<small>عند وجود تغيّر حديث، نؤجّل تعديل الحرق لفترة قصيرة حتى يستقر اتجاه الوزن.</small>';
  if(key==='metabolic_activity') body=header('حركتك خارج النادي وتمرينك الحالي','نفصل الحركة اليومية عن التمرين، حتى ما نحسب النشاط مرتين. هذه إجابات عن الأسابيع الماضية؛ جدولك القادم له إعداداته لاحقًا.')+
    choices('dailyMovement','كم تتحرك خارج التمرين؟',p.dailyMovement,[['sedentary','قليل الحركة','عادة أقل من 5000 خطوة'],['moderate','متوسط الحركة','عادة 5000–15000 خطوة'],['very_active','كثير الحركة','عادة أكثر من 15000 خطوة'],['unknown','مش عارف']])+
    `<details><summary>عندي متوسط خطوات دقيق من الساعة أو الهاتف (اختياري)</summary>${input('dailySteps','متوسط الخطوات الفعلي',p.dailySteps,'number','min="0" max="60000" step="1"')}</details>`+
    choices('jobActivity','طبيعة شغلك أو يومك المعتاد؟',p.jobActivity,[['seated','جلوس غالبًا'],['standing','وقوف غالبًا'],['moving','مشي وحركة مستمرة'],['physical','عمل بدني'],['unknown','مش عارف']])+
    choices('exerciseType','شو التمرين اللي بتعمله حاليًا؟',p.exerciseType,[['none','ما بتمرن حاليًا'],['resistance','مقاومة / حديد'],['cardio','كارديو / رياضة تحمّل'],['mixed','كارديو ومقاومة'],['unknown','مش متأكد']])+
    `<div class="metabolic-fields" data-meta-visible="exerciseType:resistance,cardio,mixed">${numberChoices('exerciseSessionsPerWeek','عدد الحصص الفعلي بالأسبوع',p.exerciseSessionsPerWeek,[1,2,3,4,5,6,7,8,10,12,14],'حصص','min="1" max="14" step="1"')}${numberChoices('exerciseDurationMin','متوسط مدة الحصة',p.exerciseDurationMin,[15,30,45,60,75,90,120],'دقيقة','min="5" max="180" step="1"')}</div>`;
  if(key==='metabolic_measurement') body=header('هل عندك قياس للأيض أو تركيب الجسم؟','تقدير الدهون من الصور يبقى تقديريًا. اختر القياس فقط إذا عندك نتيجة فحص، ويمكنك المتابعة بالمعادلة الافتراضية.')+
    choices('rmrMethod','كيف نبدأ تقدير الطاقة في الراحة RMR؟',p.rmrMethod,[['mifflin_st_jeor','معادلة Mifflin–St Jeor','تحتاج العمر والجنس والطول والوزن'],['cunningham','معادلة Cunningham','تحتاج FFM من قياس مناسب'],['measured','عندي فحص Indirect Calorimetry','أُدخل RMR المقاس فعليًا']])+
    `<div class="metabolic-fields" data-meta-visible="rmrMethod:measured">${input('measuredRmr','RMR المقاس (سعرة/يوم)',p.measuredRmr,'number','min="500" max="6000"')}${input('rmrMeasuredAt','تاريخ فحص RMR',p.rmrMeasuredAt,'date',`max="${today}"`)}</div>`+
    `<details ${p.rmrMethod==='cunningham'?'open':''}><summary>إدخال الكتلة الخالية من الدهون FFM</summary><div class="metabolic-fields">${input('fatFreeMassKg','FFM بالكيلوغرام، وليست كتلة العضلات وحدها',p.fatFreeMassKg,'number','min="10" max="300" step="0.1"')}${select('ffmSource','مصدر القياس',p.ffmSource,[['','اختر'],['dexa','DXA'],['bodpod','Bod Pod'],['bia','Tanita / InBody / BIA'],['clinical','تقييم سريري']])}${input('ffmMeasuredAt','تاريخ القياس',p.ffmMeasuredAt,'date',`max="${today}"`)}<label><input type="checkbox" name="ffmReliable" ${p.ffmReliable?'checked':''}> القياس بظروف مناسبة وترطيب مستقر، وليس تقدير صورة</label></div></details>`+
    input('knownTdee','عندي TDEE معروف من متابعة سابقة (اختياري، ليس BMR من Tanita)',p.knownTdee,'number','min="500" max="10000"');
  if(key==='metabolic_strategy') body=header('توزيع السعرات والماكروز','هذه الخيارات تدخل بالحساب النهائي والخطة الأسبوعية مباشرة.')+
    choices('macroStyle','شو نظام التغذية المفضل؟',p.macroStyle,[['balanced','Balanced','تقسيم المتبقي بعد البروتين بالتساوي بين طاقة الدهون والكارب'],['low_fat','Low-fat','دهون أقل وكارب أعلى'],['low_carb','Low-carb','كارب أقل ودهون أعلى'],['keto','Keto','تحديد سقف إجمالي الكارب']])+
    `<div data-meta-visible="macroStyle:keto">${numberChoices('ketoCarbs','هدف إجمالي الكارب (ليس صافي الكارب)',p.ketoCarbs,[10,20,30,40,50],'غ','min="10" max="50"')}</div>`+
    choices('programTrainingType','أي تدريب ناوي تعمل خلال خطة التغذية؟',p.programTrainingType,[['none','لا شيء أو نشاط خفيف'],['resistance','مقاومة / حديد'],['cardio','كارديو'],['mixed','كارديو ومقاومة']])+
    choices('proteinPreference','كمية البروتين المفضلة ضمن النطاق؟',p.proteinPreference,[['low','أقل'],['moderate','متوسط'],['high','مرتفع']])+
    choices('calorieDistribution','كيف نوزع ميزانية الأسبوع؟',p.calorieDistribution,[['even','نفس السعرات كل يوم'],['shift','أعلى بأيام التدريب وأقل بالراحة']])+
    `<div class="metabolic-fields" data-meta-visible="calorieDistribution:shift">${numberChoices('calorieShift','زيادة أيام التدريب',p.calorieShift || 150,[50,100,150,200,250,300,400,500],'سعرة','min="50" max="500" step="1"')}<div style="display:flex;gap:12px;flex-wrap:wrap">${['السبت','الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة'].map((d,i)=>`<label class="metabolic-day-choice"><input type="checkbox" name="metabolicTrainingDays" value="${i}" ${(p.metabolicTrainingDays||[]).includes(i)?'checked':''}> ${d}</label>`).join('')}</div></div>`+
    '<small>سعراتك تتحدد تلقائيًا حسب معدل النزول الذي اخترته والاحتياج المقدر، مع حد حماية تلقائي. هذا القسم يغيّر توزيع الأسبوع فقط.</small>';
  return `<div id="metabolic-onboarding" data-meta-step="${key}" class="metabolic-onboarding">${body}<button id="q-next-step-btn" class="btn btn-primary btn-lg btn-block" style="margin-top:20px">متابعة</button></div>`;
}

export function collectMetabolicAnswers(root,p,today) {
  const updates={};
  for(const el of root.querySelectorAll('input,select')) {
    if(!el.name || el.name==='metabolicTrainingDays') continue;
    if(el.type==='radio'){if(el.checked)updates[el.name]=el.value;}
    else if(el.type==='checkbox')updates[el.name]=el.checked;
    else updates[el.name]=el.type==='number'?(el.value===''?null:Number(el.value)):el.value;
  }
  for(const el of root.querySelectorAll('input[type=radio]:checked')) {
    if(!el.name?.endsWith('Choice'))continue;
    const field=el.name.slice(0,-6);
    if(el.value!=='custom')updates[field]=el.value===''?null:Number(el.value);
  }
  if(root.querySelector('[name="metabolicTrainingDays"]')) updates.metabolicTrainingDays=[...root.querySelectorAll('[name="metabolicTrainingDays"]:checked')].map(el=>Number(el.value));
  if(updates.rmrMethod==='mifflin_st_jeor')updates.measuredRmr=null;
  if(root.dataset?.metaStep==='metabolic_activity')updates.activityModel='components';
  if(updates.exerciseType==='unknown') {updates.exerciseSessionsPerWeek=null;updates.exerciseDurationMin=null;}
  if(updates.exerciseType==='none') {updates.exerciseSessionsPerWeek=0;updates.exerciseDurationMin=0;}
  if(updates.calorieDistribution==='even')updates.calorieShift=0;
  // The calorie guidance floor is calculated by the engine, not a user input.
  if(root.dataset?.metaStep==='metabolic_strategy')updates.calorieFloor=null;
  if(root.dataset?.metaStep==='metabolic_history'){
    updates.historyEndDate=today;updates.historyEndWeight=Number(p.weight);
    const transition=updates.recentTransitionType ?? p.recentTransitionType;
    if(['carb_change','creatine','fluid_change'].includes(transition)) {
      updates.recentTransitionReportedAt=transition===p.recentTransitionType&&p.recentTransitionReportedAt?p.recentTransitionReportedAt:today;
    } else updates.recentTransitionReportedAt='';
  }
  return {...p,...updates};
}
export function updateMetabolicVisibility(root,p) {
  for(const el of root.querySelectorAll('[data-meta-visible]')){
    const [key,options]=el.dataset.metaVisible.split(':');
    const checked=root.querySelector(`input[name="${key}"]:checked`);
    el.hidden=!options.split(',').includes(String(checked?.value ?? p[key]));
  }
  if(p.rmrMethod==='cunningham')root.querySelector('details')?.setAttribute('open','');
}
export function validateMetabolicAnswers(key,p,today) {
  const need=(value,options)=>options.includes(value);
  if(key==='metabolic_history') {
    if(!need(p.recentTransitionType,['none','carb_change','creatine','fluid_change','unknown']))return 'حدد وجود تغيّر حديث، أو اختر مش متأكد.';
    const anyHistory=p.recentWeightStartKg!==null||p.recentWeightStartDate||p.recentAverageCalories!==null||p.recentIntakeComplete;
    if(anyHistory && !(p.recentWeightStartKg>=20&&p.recentWeightStartKg<=500&&dayNumber(p.recentWeightStartDate)!==null&&p.recentWeightStartDate<today))return 'أكمل الوزن السابق وتاريخه أو اترك الأرقام السابقة فارغة.';
    if(p.recentAverageCalories!==null&&!(p.recentAverageCalories>=500&&p.recentAverageCalories<=10000))return 'متوسط السعرات غير صالح.';
  }
  if(key==='metabolic_activity') {
    if(!need(p.dailyMovement,['sedentary','moderate','very_active','unknown'])||!need(p.jobActivity,['seated','standing','moving','physical','unknown'])||!need(p.exerciseType,['none','resistance','cardio','mixed','unknown']))return 'أكمل أسئلة النشاط، أو اختر مش عارف.';
    if(p.dailySteps!==null&&!(p.dailySteps>=0&&p.dailySteps<=60000))return 'متوسط الخطوات غير صالح.';
    if(['resistance','cardio','mixed'].includes(p.exerciseType)&&!(Number.isInteger(p.exerciseSessionsPerWeek)&&p.exerciseSessionsPerWeek>=1&&p.exerciseSessionsPerWeek<=14&&p.exerciseDurationMin>=5&&p.exerciseDurationMin<=180))return 'حدد عدد الحصص الحالي ومدة الحصة.';
  }
  if(key==='metabolic_measurement') {
    if(p.rmrMethod==='measured'&&!(p.measuredRmr>=500&&p.measuredRmr<=6000&&dayNumber(p.rmrMeasuredAt)!==null&&p.rmrMeasuredAt<=today))return 'أدخل RMR المقاس وتاريخ الفحص.';
    if(p.rmrMethod==='cunningham'&&!(p.ffmReliable&&p.fatFreeMassKg>0&&p.fatFreeMassKg<Number(p.weight)&&['dexa','bodpod','bia','clinical'].includes(p.ffmSource)&&dayNumber(p.ffmMeasuredAt)!==null&&p.ffmMeasuredAt<=today))return 'Cunningham تحتاج FFM موثوقة، مصدر وتاريخ، وقيمة أقل من الوزن الكلي.';
    if(p.knownTdee!==null&&!(p.knownTdee>=500&&p.knownTdee<=10000))return 'TDEE المدخل غير صالح.';
  }
  if(key==='metabolic_strategy') {
    if(!need(p.macroStyle,['balanced','low_fat','low_carb','keto'])||!need(p.programTrainingType,['none','resistance','cardio','mixed'])||!need(p.proteinPreference,['low','moderate','high'])||!need(p.calorieDistribution,['even','shift']))return 'اختر النظام ونوع التدريب والبروتين وتوزيع السعرات.';
    if(p.macroStyle==='keto'&&!(p.ketoCarbs>=10&&p.ketoCarbs<=50))return 'سقف كارب الكيتو بين 10 و50 غرام إجمالي كارب.';
    if(p.calorieDistribution==='shift'&&!(p.calorieShift>=50&&p.calorieShift<=500&&p.metabolicTrainingDays?.length>0&&p.metabolicTrainingDays.length<7))return 'للتوزيع المتغيّر اختر أيام تدريب وراحة ومقدار الزيادة.';
  }
  return null;
}

export function questionnaireMilestones(step,totalSteps) {
  return [{label:'أساسياتك',start:1,end:5},{label:'هدفك وتغذيتك',start:5,end:10},{label:'تجهيز خطتك',start:10,end:totalSteps}]
    .map((m,i)=>({...m,number:i+1,status:step>=m.end?'complete':step>=m.start?'active':'pending'}));
}
export function renderQuestionnaireMilestones(step,totalSteps) {
  return `<ol class="q-milestones" aria-label="مراحل إعداد خطتك">${questionnaireMilestones(step,totalSteps).map(m=>`<li class="q-milestone ${m.status}" ${m.status==='active'?'aria-current="step"':''}><span class="q-milestone-number" aria-hidden="true">${m.status==='complete'?'✓':m.number}</span><span><b>${m.label}</b><small>${m.status==='complete'?`المرحلة ${m.number} مكتملة`:m.status==='active'?'عم نجهزها':'لاحقًا'}</small></span></li>`).join('')}</ol>`;
}
