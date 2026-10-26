import test from 'node:test';
import assert from 'node:assert/strict';
import { estimateRestingMetabolism, estimateInitialExpenditure, calculateWeightTrend, estimateAdaptiveExpenditure, allocateMacros, distributeWeeklyCalories, projectWeight, dateFromDay, dayNumber } from '../src/domain/metabolicEngine.js';
import { calculateNutritionTargets } from '../src/domain/calculations.js';
import { calculateAdjustedDailyTargets } from '../src/domain/nutritionPlanPolicy.js';
import { metabolicInputs, parseMetabolicCsv } from '../src/domain/metabolicState.js';
const profile = { age:30, gender:'female', height:160, currentWeight:83, activityLevel:'sedentary', bodyFatPercent:40 };
const start = dayNumber('2026-09-01');
const synthetic = (slope = 0) => ({
  profile, endDate:dateFromDay(start+28),
  weights:Array.from({length:29},(_,i)=>({date:dateFromDay(start+i),weight:83+slope*i})),
  nutrition:Array.from({length:28},(_,i)=>({date:dateFromDay(start+i),calories:2200,status:'complete'}))
});

test('published RMR equations and measured RMR provenance are distinct',()=>{
  assert.equal(estimateRestingMetabolism(profile).rmr,1519);
  const muscular={...profile,currentWeight:121,rmrMethod:'cunningham',fatFreeMassKg:92.3,ffmReliable:true,ffmSource:'bia',ffmMeasuredAt:'2026-10-17'};
  assert.equal(estimateRestingMetabolism(muscular).rmr,2530.6);
  assert.equal(estimateRestingMetabolism({...muscular,ffmSource:'visual'}).method,'mifflin_st_jeor');
  assert.equal(estimateRestingMetabolism({...profile,rmrMethod:'measured',measuredRmr:1700,rmrMeasuredAt:'2026-10-01'}).measured,true);
  assert.equal(estimateRestingMetabolism({...profile,age:0}).valid,false);
});
test('activity model avoids adding step, job and legacy training expenditure together',()=>{
  const p={...profile,activityModel:'components',dailySteps:11000,jobActivity:'moving',workoutDaysCount:0};
  assert.equal(estimateInitialExpenditure(p).pal,1.5);
  assert.equal(estimateInitialExpenditure({...p,activityLevel:'extraActive'}).tdee,estimateInitialExpenditure(p).tdee);
});
test('83kg, 0.5%, 1913 TDEE reproduces 1457 kcal goal',()=>{
  const n=calculateNutritionTargets({...profile,knownTdee:1913,selectedWeeklyLossRate:.005});
  assert.equal(n.targetCalories,1457);
});
test('macros match energy and plan policy preserves zero-carb and other canonical targets',()=>{
  for(const macroStyle of ['standard','balanced','low_fat','low_carb','keto']) {
    const n=allocateMacros(2001,{...profile,macroStyle});
    assert.equal(n.macroCalories,2001);
    assert.ok(n.protein>=0&&n.carbs>=0&&n.fats>=0);
    const plan=calculateAdjustedDailyTargets({targetCalories:2001,...n});
    assert.equal(plan.carbs,n.carbs); assert.equal(plan.fats,n.fats);
  }
  assert.equal(calculateAdjustedDailyTargets({targetCalories:1800,protein:150,carbs:0,fats:133}).carbs,0);
  assert.ok(allocateMacros(2000,{...profile,macroStyle:'keto'}).carbs<=32);
});
test('infeasible protein budget is flagged rather than silently described as met',()=>{
  const n=allocateMacros(1000,{currentWeight:150}); assert.equal(n.feasible,false);assert.ok(n.protein<n.idealProtein);
});
test('calendar-aware robust trend rejects a scale outlier without EWMA slope bias',()=>{
  const rows=[0,2,4,8,14,21,28].map(i=>({date:dateFromDay(start+i),weight:100-i*.1}));
  rows[3].weight=130;
  const trend=calculateWeightTrend(rows);
  assert.ok(Math.abs(trend.weeklyChangeKg+.7)<1e-8);assert.equal(trend.outliers,1);
});
test('stable weight estimates intake as expenditure and repeated same-week checks are idempotent',()=>{
  const data=synthetic();const first=estimateAdaptiveExpenditure(data);
  assert.equal(first.candidateTdee,2200);assert.equal(first.calibrated,true);
  const repeated=estimateAdaptiveExpenditure({...data,previous:first});assert.equal(repeated.tdee,first.tdee);
  assert.ok(first.tdee>first.initialTdee);assert.ok(first.tdee-first.initialTdee<=150);
});
test('losing tissue increases expenditure estimate without a universal 7700 coefficient',()=>{
  const data=synthetic(-.05), n=estimateAdaptiveExpenditure(data);
  assert.ok(n.candidateTdee>2200);assert.equal(n.energyModel,'hall_forbes_tissue_approximation');
});
test('partial/missing days never become zero and never average only the remaining days',()=>{
  const data=synthetic();data.nutrition[15].status='partial';
  const n=estimateAdaptiveExpenditure(data);assert.equal(n.calibrated,false);assert.equal(n.candidateTdee,undefined);
  const prior={tdee:2400,lastUpdatedDate:'2026-09-10',calibrated:true};
  const hold=estimateAdaptiveExpenditure({...data,previous:prior});assert.equal(hold.status,'holding');assert.equal(hold.tdee,2400);
});
test('explicit fasting is valid but a zero-calorie complete day is not',()=>{
  const data=synthetic();data.nutrition[15]={...data.nutrition[15],status:'complete',calories:0};
  assert.equal(estimateAdaptiveExpenditure(data).calibrated,false);
  data.nutrition[15].status='fasting';assert.equal(estimateAdaptiveExpenditure(data).calibrated,true);
});
test('water-transition events, abrupt changes and sparse weights pause updates',()=>{
  const data=synthetic();
  assert.ok(estimateAdaptiveExpenditure({...data,events:[{date:dateFromDay(start+25),type:'creatine'}]}).reasons.includes('RECENT_WATER_TRANSITION'));
  assert.equal(estimateAdaptiveExpenditure({...data,weights:[data.weights[0],data.weights.at(-1)]}).calibrated,false);
  const shifted={...data,weights:data.weights.map((r,i)=>({...r,weight:i>=25?r.weight+4:r.weight}))};
  assert.equal(estimateAdaptiveExpenditure(shifted).calibrated,false);
});
test('exact weekly budget, floor and identical/every-day training edge cases',()=>{
  for(const days of [[],[0,1,3],[0,1,2,3,4,5,6]]) {
    const result=distributeWeeklyCalories(1457,{trainingDays:days,shift:150,floor:1200});
    assert.equal(result.reduce((a,b)=>a+b,0),10199);assert.ok(result.every(x=>x>=1200));
  }
  assert.throws(()=>distributeWeeklyCalories(1000,{floor:1200}));
});
test('manual targets remain manual and reached coached goals become maintenance',()=>{
  assert.equal(calculateNutritionTargets({...profile,targetMode:'manual',requestedTargetCalories:1700,adaptiveTdee:3000}).targetCalories,1700);
  const n=calculateNutritionTargets({...profile,targetMode:'coached',goal:'fat_loss',targetWeight:83,knownTdee:2200,selectedWeeklyLossRate:.005});
  assert.equal(n.targetCalories,2200);assert.equal(n.goalReached,true);
});
test('Hall linearized projection equilibrates rather than projecting linear loss forever',()=>{
  const p=projectWeight({profile,tdee:2200,intake:1700,days:90});assert.equal(p.model,'hall_2011_linearized');
  assert.equal(p.points[0].weight,83);assert.ok(p.points.at(-1).weight<83);assert.ok(p.points.at(-1).weight>=74.7);
  const flat=projectWeight({profile,tdee:2200,intake:2200,days:90});assert.equal(flat.points.at(-1).weight,83);
});
test('CSV import is atomic, explicit, bounded, and rejects impossible dates and duplicate days',()=>{
  const csv='date,weight,calories,status\n2026-09-01,83,2200,complete';assert.equal(parseMetabolicCsv(csv)[0].weight,83);
  assert.throws(()=>parseMetabolicCsv(csv+'\n2026-09-01,82,2200,complete'));
  assert.throws(()=>parseMetabolicCsv('date,calories,status\n2026-02-30,2200,complete'));
  assert.throws(()=>parseMetabolicCsv('date,calories,status\n2026-09-01,2200,'));
});
test('food metadata never defaults a partial or unknown day to complete; daily overrides are explicit',()=>{
  const inputs=metabolicInputs({loggedMeals:[{date:'2026-09-01',calories:1000}],metabolicData:{nutritionDays:{'2026-09-01':{status:'estimated',calories:2200}}}});
  assert.equal(inputs.nutrition[0].calories,2200);assert.equal(inputs.nutrition[0].status,'estimated');
  assert.equal(metabolicInputs({loggedMeals:[{date:'2026-09-01',calories:1000}]}).nutrition[0].status,'missing');
});

test('store confirms food, invalidates edited meals, preserves raw data and survives reload', async()=>{
  const memory=new Map(); globalThis.localStorage={getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
  const {store}=await import('../src/state/store.js');
  store.resetState();store.setUserProfile({...profile,onboardingCompleted:true,targetMode:'coached',targetCalories:1800});
  const meal=store.logMeal({calories:1800,protein:150,carbs:150,fats:67});
  const today=store.state.today.date;
  store.setNutritionDayStatus(today,'complete');assert.equal(store.state.metabolicData.nutritionDays[today].status,'complete');
  await store.updateLoggedMeal(meal.id,{calories:1850});assert.equal(store.state.metabolicData.nutritionDays[today].status,'partial');
  store.setNutritionDayStatus(today,'complete');
  store.setState({loggedMeals:[{...store.state.loggedMeals[0],calories:1900}]});
  assert.equal(store.state.metabolicData.nutritionDays[today].status,'partial');
  store.saveMetabolicSettings({macroStyle:'balanced',calorieFloor:1500,targetMode:'coached',calorieShift:150,metabolicTrainingDays:[0,1,3]});
  assert.equal(store.state.metabolicData.weeklyCalories.reduce((a,b)=>a+b,0),store.state.userProfile.targetCalories*7);
  const saved=store.loadState();assert.equal(saved.userProfile.macroStyle,'balanced');
  assert.equal(saved.loggedMeals.length,1);assert.equal(saved.metabolicData.nutritionDays[today].status,'partial');
  delete globalThis.localStorage;
});

test('weekly menu fits actual ingredient macros instead of changing only its target label', async()=>{
  const {generateNutritionPlan}=await import('../src/domain/nutritionPlanEngine.js');
  const plan=generateNutritionPlan({targetCalories:1926,targetProtein:140,targetCarbs:229,targetFats:50,weight:70});
  for(const day of plan.days) {
    assert.ok(Math.abs(day.plannedProtein-140)<10);
    assert.ok(Math.abs(day.plannedCarbs-229)<15);
    assert.ok(Math.abs(day.plannedFats-50)<5);
    assert.ok(Math.abs(day.plannedCalories-1926)<60);
    for(const meal of day.meals) assert.ok(Number.isInteger(meal.options[0].calories));
  }
});
test('a reached loss/gain goal has no continuing initial deficit/surplus', async()=>{
  const {calculateWeightLossOption,calculateWeightGainOption}=await import('../src/utils/calorieEngine.js');
  assert.equal(calculateWeightLossOption({currentWeightKg:83,targetWeightKg:83,maintenanceCalories:1913,weeklyRate:.005}).targetCaloriesRounded,1913);
  assert.equal(calculateWeightGainOption({currentWeightKg:83,targetWeightKg:83,maintenanceCalories:1913,weeklyRate:.005}).targetCaloriesRounded,1913);
});
