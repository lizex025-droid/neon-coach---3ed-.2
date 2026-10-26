import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {METABOLIC_DEFAULTS,METABOLIC_STEP_KEYS,renderMetabolicOnboardingStep,collectMetabolicAnswers,validateMetabolicAnswers} from '../src/components/metabolicOnboarding.js';
import {estimateInitialExpenditure,allocateMacros,estimateAdaptiveExpenditure} from '../src/domain/metabolicEngine.js';
import {calculateNutritionTargets} from '../src/domain/calculations.js';
const today='2026-10-26';
const base={...METABOLIC_DEFAULTS,weight:83,height:160,age:30,gender:'female',targetMode:'coached',activityLevel:'sedentary'};

test('all four onboarding sections render meaningful questions with a working next control',()=>{
 for(const key of METABOLIC_STEP_KEYS){const html=renderMetabolicOnboardingStep(key,base,today);assert.match(html,/q-next-step-btn/);assert.match(html,/name="/);assert.ok(!html.includes('undefined'));}
 const html=renderMetabolicOnboardingStep('metabolic_history',base,today);assert.match(html,/92 كغ/);assert.match(html,/مش متأكد/);
});
test('new questions are actually in the questionnaire and every displayed expenditure uses the shared engine',()=>{
 const src=readFileSync(new URL('../src/views/questionnaireView.js',import.meta.url),'utf8');
 for(const key of ['METABOLIC_HISTORY','METABOLIC_ACTIVITY','METABOLIC_MEASUREMENT','METABOLIC_STRATEGY'])assert.ok(src.includes(`STEP_KEYS.${key}`));
 assert.ok(src.includes('if (METABOLIC_STEP_KEYS.includes(step)) return renderMetabolicOnboardingStep'));
 assert.ok(src.includes('validateMetabolicAnswers(stepKeyNow'));
 assert.equal((src.match(/calculateMaintenanceCalories\(/g)||[]).length,1,'only the explicit fallback may use legacy PAL');
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
test('strategy requires answers, respects floors, and validates shifted days',()=>{
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
