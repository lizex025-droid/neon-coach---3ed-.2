import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questionnaireMilestones,renderQuestionnaireMilestones,METABOLIC_DEFAULTS,METABOLIC_STEP_KEYS,renderMetabolicOnboardingStep,collectMetabolicAnswers,validateMetabolicAnswers} from '../src/components/metabolicOnboarding.js';
import {estimateInitialExpenditure,allocateMacros} from '../src/domain/metabolicEngine.js';
import {calculateNutritionTargets} from '../src/domain/calculations.js';
const today='2026-10-26';
const base={...METABOLIC_DEFAULTS,weight:83,height:160,age:30,gender:'female',targetMode:'coached',activityLevel:'sedentary'};

test('all four onboarding sections render meaningful questions with a working next control',()=>{
 for(const key of METABOLIC_STEP_KEYS){const html=renderMetabolicOnboardingStep(key,base,today);assert.match(html,/q-next-step-btn/);assert.match(html,/name="/);assert.ok(!html.includes('undefined'));}
 const html=renderMetabolicOnboardingStep('metabolic_history',base,today);assert.ok(!html.includes('name="weightHistoryHigher"'));assert.match(html,/مش متأكد/);
});
test('new questions are actually in the questionnaire and every displayed expenditure uses the shared engine',()=>{
 const src=readFileSync(new URL('../src/views/questionnaireView.js',import.meta.url),'utf8');
 for(const key of ['METABOLIC_ACTIVITY','METABOLIC_MEASUREMENT','METABOLIC_STRATEGY'])assert.ok(src.includes(`STEP_KEYS.${key}`));
 assert.ok(!src.includes('STEP_KEYS.METABOLIC_HISTORY,'),'historical-change page must not appear in any active questionnaire path');
 assert.ok(src.includes('if (METABOLIC_STEP_KEYS.includes(step)) return renderMetabolicOnboardingStep'));
 assert.ok(src.includes('validateMetabolicAnswers(stepKeyNow'));
 assert.equal((src.match(/calculateMaintenanceCalories\(/g)||[]).length,1,'only the explicit fallback may use legacy PAL');
});
test('questionnaire removes previous data and recent change page from every goal and updates the progress count',()=>{
 const source=readFileSync(new URL('../src/views/questionnaireView.js',import.meta.url),'utf8');
 const start=source.indexOf('export function getActiveSteps() {');
 const end=source.indexOf('// بيانات الاستبيان الجاري تعبئتها',start);
 assert.ok(start >= 0 && end > start);
 const paths=source.slice(start,end).match(/return \[([\s\S]*?)\];/g) || [];
 assert.equal(paths.length,3);
 const lengths=paths.map(value=>(value.match(/STEP_KEYS\.[A-Z_]+/g)||[]).length);
 assert.deepEqual(lengths,[14,14,13]);
 for(const path of paths){
   assert.doesNotMatch(path,/STEP_KEYS\.METABOLIC_HISTORY/);
   assert.match(path,/STEP_KEYS\.BODY_FAT,\s*STEP_KEYS\.METABOLIC_ACTIVITY/);
   assert.match(path,/STEP_KEYS\.REVIEW/);
 }
 assert.match(source,/renderQuestionnaireMilestones\(step, totalSteps\)/);
 assert.match(source,/الخطوة \$\{step\} من \$\{totalSteps\}/);
});
test('unknown is a valid explicit answer, and incomplete questions never silently choose an activity',()=>{
 assert.ok(validateMetabolicAnswers('metabolic_activity',base,today));
 assert.equal(validateMetabolicAnswers('metabolic_activity',{...base,dailyMovement:'unknown',jobActivity:'unknown',exerciseType:'unknown',liftingExperience:'unknown',cardioExperience:'unknown',athleticStatus:'unknown'},today),null);
});
test('actual exercise sessions are separate from a future 6-day training program',()=>{
 const p={...base,activityModel:'components',dailyMovement:'sedentary',jobActivity:'seated',exerciseType:'none',exerciseSessionsPerWeek:0,exerciseDurationMin:0,workoutDaysCount:6,sessionDurationMin:90};
 assert.equal(estimateInitialExpenditure(p).pal,1.2);
 assert.ok(estimateInitialExpenditure({...p,exerciseType:'cardio',exerciseSessionsPerWeek:4,exerciseDurationMin:45}).tdee>estimateInitialExpenditure(p).tdee);
});
test('steps and occupation change expenditure but do not double-count overlapping movement',()=>{
 const p={...base,activityModel:'components',dailyMovement:'sedentary',exerciseType:'none',jobActivity:'seated'};
 assert.ok(estimateInitialExpenditure({...p,dailySteps:10000}).tdee>estimateInitialExpenditure({...p,dailySteps:1000}).tdee);
 assert.equal(estimateInitialExpenditure({...p,dailySteps:10000,jobActivity:'moving'}).pal,1.5);
});
test('optional complete aggregate intake and prior weight inform the initial estimate without inventing daily logs',()=>{
 const p={...base,bodyFatPercent:40,recentWeightStartKg:84,recentWeightStartDate:'2026-09-28',historyEndDate:today,historyEndWeight:83,recentAverageCalories:2200,recentIntakeComplete:true,recentTransitionType:'none'};
 assert.equal(estimateInitialExpenditure(p).source,'reported_history_estimate');assert.ok(estimateInitialExpenditure(p).tdee>2200);
 assert.notEqual(estimateInitialExpenditure({...p,recentIntakeComplete:false}).source,'reported_history_estimate');
 assert.notEqual(estimateInitialExpenditure({...p,recentTransitionType:'carb_change'}).source,'reported_history_estimate');
 assert.notEqual(estimateInitialExpenditure({...p,currentWeight:80}).source,'reported_history_estimate');
});
test('history yes/no never applies an invented fixed metabolic penalty',()=>{
 assert.equal(estimateInitialExpenditure({...base,weightHistoryHigher:'yes'}).tdee,estimateInitialExpenditure({...base,weightHistoryHigher:'no'}).tdee);
});
test('RMR method validation rejects photo-derived FFM and requires measured results and dates',()=>{
 assert.ok(validateMetabolicAnswers('metabolic_measurement',{...base,rmrMethod:'cunningham',fatFreeMassKg:50,ffmReliable:true,ffmSource:'visual',ffmMeasuredAt:today},today));
 const p={...base,rmrMethod:'cunningham',fatFreeMassKg:50,ffmReliable:true,ffmSource:'dexa',ffmMeasuredAt:today};
 assert.equal(validateMetabolicAnswers('metabolic_measurement',p,today),null);assert.equal(estimateInitialExpenditure(p).rmr,1600);
 assert.ok(validateMetabolicAnswers('metabolic_measurement',{...base,rmrMethod:'measured'},today));
});
test('planned training type changes protein without pretending exercise experience measures RMR',()=>{
 const n=allocateMacros(2000,{...base,programTrainingType:'none'}),c=allocateMacros(2000,{...base,programTrainingType:'cardio'}),r=allocateMacros(2000,{...base,programTrainingType:'resistance'});
 assert.ok(n.protein<c.protein&&c.protein<r.protein);
 assert.equal(estimateInitialExpenditure({...base,liftingExperience:'advanced'}).rmr,estimateInitialExpenditure({...base,liftingExperience:'beginner'}).rmr);
});
test('weekly loss rate controls coached calories without manual calorie-floor choice',()=>{
  const html=renderMetabolicOnboardingStep('metabolic_strategy',{
    ...base,macroStyle:'balanced',programTrainingType:'resistance',
    proteinPreference:'moderate',calorieDistribution:'even'
  },today);
  assert.doesNotMatch(html,/calorieFloor|الحد الأدنى للتوصية بالسعرات|قيمة ثانية — أدخل الرقم[^<]*سعرة/);
  assert.match(html,/كيف نوزع ميزانية الأسبوع/);
  const p={...base,goal:'fat_loss',targetMode:'coached',knownTdee:3000,
    macroStyle:'balanced',programTrainingType:'resistance',
    proteinPreference:'moderate',calorieDistribution:'even',
    selectedWeeklyLossRate:0.005,requestedTargetCalories:1500,
    dailyCalorieDeficit:1500,calorieFloor:2600};
  const low=calculateNutritionTargets(p);
  const high=calculateNutritionTargets({...p,selectedWeeklyLossRate:0.015});
  assert.ok(high.targetCalories < low.targetCalories, 'faster chosen rate must yield a higher deficit');
  assert.notEqual(low.targetCalories,1500,'stale selected calories must not override chosen loss percentage');
  assert.equal(low.floorApplied,false,'stale high calorie-floor selection cannot override the chosen rate');
  const limited=calculateNutritionTargets({...p,calorieAdjustmentOverride:true,requestedTargetCalories:2200});
  assert.equal(limited.targetCalories,2200,'adaptive smoothing may cap weekly changes');
  const manual=calculateNutritionTargets({...p,targetMode:'manual',requestedTargetCalories:2200});
  assert.equal(manual.targetCalories,2200,'manual calorie mode must still honor explicit targets');
  const floor=calculateNutritionTargets({...p,knownTdee:1550,selectedWeeklyLossRate:0.02});
  assert.equal(floor.targetCalories,1200,'automatic female coached floor stays in place');
  assert.equal(floor.floorApplied,true);
  const root={dataset:{metaStep:'metabolic_strategy'},querySelectorAll:()=>[],querySelector:()=>null};
  assert.equal(collectMetabolicAnswers(root,{...p,calorieFloor:2500},today).calorieFloor,null);
});

test('strategy requires macro and distribution answers, not a user-entered calorie floor',()=>{
 assert.ok(validateMetabolicAnswers('metabolic_strategy',base,today));
 const p={...base,macroStyle:'balanced',programTrainingType:'resistance',proteinPreference:'moderate',calorieDistribution:'shift',calorieShift:150,metabolicTrainingDays:[0,1,3],calorieFloor:1200};
 assert.equal(validateMetabolicAnswers('metabolic_strategy',p,today),null);
 assert.ok(validateMetabolicAnswers('metabolic_strategy',{...p,metabolicTrainingDays:[]},today));
 const n=calculateNutritionTargets({...p,knownTdee:1913,selectedWeeklyLossRate:.005});assert.equal(n.targetCalories,1457);
});
test('radio, checkbox, numeric and zero-session answers are saved, not just displayed',()=>{
 const elements=[{name:'exerciseType',type:'radio',checked:true,value:'none'},{name:'exerciseSessionsPerWeek',type:'number',value:'6'},{name:'dailySteps',type:'number',value:'0'}];
 const root={dataset:{metaStep:'metabolic_activity'},querySelectorAll:()=>elements,querySelector:()=>null};
 const p=collectMetabolicAnswers(root,base,today);assert.equal(p.exerciseSessionsPerWeek,0);assert.equal(p.exerciseDurationMin,0);assert.equal(p.dailySteps,0);
});

// Daily budgets are already constrained. Do not recalculate the goal (maintenance
// would otherwise erase a shifted day's budget while retaining its calorie label).
test('daily shifted maintenance macros use the actual day budget after creation and rollover', () => {
  const source = readFileSync(new URL('../src/state/store.js', import.meta.url), 'utf8');
  assert.match(source, /allocateMacros\(budget\[index\], this.state.userProfile\)/);
  assert.match(source, /allocateMacros\(this.state.today.targetCalories, effective\)/);
  const profile = {weight:70,currentWeight:70,gender:'male',programTrainingType:'resistance',proteinPreference:'moderate',macroStyle:'balanced'};
  const macros = allocateMacros(2288,profile);
  assert.equal(macros.protein*4+macros.carbs*4+macros.fats*9,2288);
});

test('stored maintenance program conserves daily macro energy across shifted days and rollover', async () => {
  const memory=new Map();
  globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const {store}=await import('../src/state/store.js');
  store.resetState();
  store.setUserProfile({...base,gender:'male',weight:70,currentWeight:70,age:18,height:175,goal:'maintenance',knownTdee:2400,calorieFloor:1500,macroStyle:'balanced',programTrainingType:'resistance',proteinPreference:'moderate',calorieShift:150,metabolicTrainingDays:[0,1,3]});
  store.recalculateTargetsFromProfile();
  const energy=()=>store.state.today.targetProtein*4+store.state.today.targetCarbs*4+store.state.today.targetFats*9;
  assert.equal(energy(),store.state.today.targetCalories);
  assert.equal(store.state.metabolicData.weeklyCalories.reduce((a,b)=>a+b,0),16800);
  const next = new Date(store.state.today.date+'T12:00:00'); next.setDate(next.getDate()+1);
  store.ensureCurrentDay({now:next});
  assert.equal(energy(),store.state.today.targetCalories);
  assert.equal(store.loadState().userProfile.programTrainingType,'resistance');
  delete globalThis.localStorage;
});

test('safe numeric choices use exact presets, preserve custom values, and never leak numeric strings',()=>{
 const elements=[{name:'exerciseSessionsPerWeek',type:'number',value:'11'},{name:'exerciseSessionsPerWeekChoice',type:'radio',checked:true,value:'3'},{name:'exerciseDurationMin',type:'number',value:'47'},{name:'exerciseDurationMinChoice',type:'radio',checked:true,value:'custom'}];
 const root={dataset:{metaStep:'metabolic_activity'},querySelectorAll:selector=>selector.includes(':checked')?elements.filter(e=>e.checked):elements,querySelector:()=>null};
 const p=collectMetabolicAnswers(root,{...base,exerciseType:'resistance'},today);
 assert.equal(p.exerciseSessionsPerWeek,3);assert.equal(p.exerciseDurationMin,47);assert.ok(Number.isInteger(p.exerciseSessionsPerWeek));
 const html=renderMetabolicOnboardingStep('metabolic_activity',p,today);
 assert.ok(!html.includes('<select'));assert.match(html,/name="exerciseDurationMinChoice" value="custom" checked/);assert.match(html,/value="47"/);
});
test('recent transition needs no onset date, records report time once, and clears a removed transition',()=>{
 const root={dataset:{metaStep:'metabolic_history'},querySelectorAll:()=>[],querySelector:()=>null};
 const p=collectMetabolicAnswers(root,{...base,weightHistoryHigher:'no',recentWeightTrend:'unknown',recentTransitionType:'creatine'},today);
 assert.equal(validateMetabolicAnswers('metabolic_history',p,today),null);
 assert.equal(p.recentTransitionReportedAt,today);
 assert.equal(collectMetabolicAnswers(root,p,'2026-10-27').recentTransitionReportedAt,today);
 assert.equal(collectMetabolicAnswers(root,{...p,recentTransitionType:'none'},today).recentTransitionReportedAt,'');
 const html=renderMetabolicOnboardingStep('metabolic_history',p,today);assert.ok(!html.includes('name="recentTransitionDate"'));
});
test('milestones complete stage one on page five, update both directions, and support every goal length',()=>{
 for(const total of [13,14]){
 assert.deepEqual(questionnaireMilestones(4,total).map(m=>m.status),['active','pending','pending']);
 assert.deepEqual(questionnaireMilestones(5,total).map(m=>m.status),['complete','active','pending']);
 assert.deepEqual(questionnaireMilestones(10,total).map(m=>m.status),['complete','complete','active']);
 assert.deepEqual(questionnaireMilestones(total,total).map(m=>m.status),['complete','complete','complete']);
 assert.match(renderQuestionnaireMilestones(5,total),/المرحلة 1 مكتملة/);
 }
});

test('questionnaire excludes unused context and repeated training experience without requiring stale answers',()=>{
 const history=renderMetabolicOnboardingStep('metabolic_history',base,today);
 const activity=renderMetabolicOnboardingStep('metabolic_activity',base,today);
 for(const field of ['weightHistoryHigher','highestAdultWeight','recentWeightTrend','liftingExperience','cardioExperience','athleticStatus'])assert.ok(!(history+activity).includes(`name="${field}"`),field);
 assert.equal(validateMetabolicAnswers('metabolic_history',{...base,recentTransitionType:'none',highestAdultWeight:1,recentWeightTrend:'losing'},today),null);
 assert.equal(validateMetabolicAnswers('metabolic_activity',{...base,dailyMovement:'sedentary',jobActivity:'seated',exerciseType:'none'},today),null);
 const source=readFileSync(new URL('../src/views/questionnaireView.js',import.meta.url),'utf8');
 for(const id of ['q-sleep','q-training-experience','q-activity'])assert.ok(!source.includes(`id="${id}"`),id);
 assert.ok(!source.includes('ما هو مستوى التزامك المتوقع'));
 assert.match(source,/name="q-training-level"/);assert.match(source,/id="q-training-break"/);assert.match(source,/name="q-injuries"/);
 const root={dataset:{metaStep:'metabolic_activity'},querySelectorAll:()=>[],querySelector:()=>null};
 assert.equal(collectMetabolicAnswers(root,{...base,activityModel:'legacy'},today).activityModel,'components');
});
