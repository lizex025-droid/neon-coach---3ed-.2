import {
  KCAL_PER_KG,
  ACTIVITY_FACTORS,
  ACTIVITY_UI_MAP,
  WEEKLY_LOSS_OPTIONS,
  WEEKLY_GAIN_OPTIONS,
  calculateBMR,
  calculateMaintenanceCalories,
  calculateWeeklyLossKg,
  calculateWeeklyGainKg,
  calculateEstimatedWeeks,
  calculateEstimatedGainWeeks,
  evaluateCalorieTarget,
  evaluateGainCalorieTarget,
  calculateWeightLossOption,
  calculateWeightGainOption,
  calculateAllWeightLossOptions,
  calculateAllWeightGainOptions,
  getRecommendedWeeklyLossRate,
  getRecommendedWeeklyGainRate,
  resolveActivityFactor
} from '../src/utils/calorieEngine.js';

import {
  calculateNutritionTargets,
  calculateFatLossPlan,
  calculateWeightGainPlan,
  GOALS
} from '../src/domain/calculations.js';

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`);
    throw new Error(message);
  }
  console.log(`✅ PASS: ${message}`);
}

function assertCloseTo(actual, expected, maxDiff = 0.05, message = '') {
  const diff = Math.abs(actual - expected);
  if (diff > maxDiff) {
    console.error(`❌ FAIL: ${message} (expected ~${expected}, got ${actual}, diff ${diff})`);
    throw new Error(`${message}: expected ~${expected}, got ${actual}`);
  }
  console.log(`✅ PASS: ${message} (${actual} ≈ ${expected})`);
}

console.log('=== NEON COACH Calorie Engine Verification Tests ===\n');

// 1. Mandatory Prompt Spec: Male, 25y, 70kg, 175cm, Moderate Activity (1.465), 1.0% Rate
console.log('--- Test 1: Prompt Mandatory Test Case ---');
const bmrMale = calculateBMR({ sex: 'male', age: 25, weightKg: 70, heightCm: 175 });
assertCloseTo(bmrMale, 1673.75, 0.001, 'Male 25y, 70kg, 175cm raw BMR = 1673.75');
assert(Math.round(bmrMale) === 1674, 'Rounded BMR for display = 1674');

const tdeeMale = calculateMaintenanceCalories(bmrMale, 'moderate');
assertCloseTo(tdeeMale, 2452.04375, 0.001, 'Moderate activity (1.465) TDEE = 2452.04375');
assert(Math.round(tdeeMale) === 2452, 'Rounded TDEE for display = 2452');

const opt100 = calculateWeightLossOption({
  currentWeightKg: 70,
  maintenanceCalories: tdeeMale,
  weeklyRate: 0.01,
  sex: 'male',
  age: 25
});
assertCloseTo(opt100.weeklyLossKg, 0.70, 0.001, 'Weekly loss for 1% of 70kg = 0.70 kg');
assertCloseTo(opt100.dailyDeficit, 777.7777, 0.01, 'Daily deficit for 0.70 kg/week ≈ 777.78 kcal');
assert(opt100.dailyDeficitRounded === 778, 'Daily deficit rounded = 778 kcal');
assertCloseTo(opt100.requestedTargetCalories, 1674.2659, 0.01, 'Daily calorie target = 1674.27 kcal');
assert(opt100.targetCaloriesRounded === 1674, 'Daily calorie target rounded = 1674 kcal');

// 2. 70kg weekly loss rates for all 6 options
console.log('\n--- Test 2: 70kg Loss Rates Across All 6 Options ---');
const expectedLosses = [
  { rate: 0.0025, expectedKg: 0.175 },
  { rate: 0.0050, expectedKg: 0.350 },
  { rate: 0.0075, expectedKg: 0.525 },
  { rate: 0.0100, expectedKg: 0.700 },
  { rate: 0.0150, expectedKg: 1.050 },
  { rate: 0.0200, expectedKg: 1.400 },
];
const allOptions70 = calculateAllWeightLossOptions({
  currentWeightKg: 70,
  maintenanceCalories: tdeeMale,
  sex: 'male',
  age: 25
});
assert(allOptions70.length === 6, 'Generated all 6 options');
expectedLosses.forEach((exp, idx) => {
  assertCloseTo(allOptions70[idx].weeklyLossKg, exp.expectedKg, 0.001, `Option ${idx + 1} (${exp.rate * 100}%): ${exp.expectedKg} kg/week`);
});

// 3. Prompt Test Case: 70kg, Rate 0.75%, TDEE 1932
console.log('\n--- Test 3: Prompt Example: 70kg, 0.75%, TDEE 1932 ---');
const opt075_1932 = calculateWeightLossOption({
  currentWeightKg: 70,
  maintenanceCalories: 1932,
  weeklyRate: 0.0075,
  sex: 'male',
  age: 25
});
assertCloseTo(opt075_1932.weeklyLossKg, 0.525, 0.001, 'Weekly loss = 0.525 kg');
assertCloseTo(opt075_1932.dailyDeficit, 583.333, 0.01, 'Daily deficit ≈ 583.33 kcal');
assert(opt075_1932.dailyDeficitRounded === 583, 'Daily deficit rounded = 583 kcal');
assertCloseTo(opt075_1932.requestedTargetCalories, 1348.667, 0.01, 'Target calories ≈ 1348.67 kcal');
assert(opt075_1932.targetCaloriesRounded === 1349, 'Target calories rounded = 1349 kcal');
// Check below minimum warning for male (< 1500)
assert(opt075_1932.safety.isBelowMinimum === true, '1349 is below 1500 male minimum -> warning flagged');
assert(opt075_1932.safety.warningCodes.includes('BELOW_GUIDANCE_MINIMUM'), 'Includes BELOW_GUIDANCE_MINIMUM code');

// 4. Female BMR and Guidance Minimum (1200 kcal)
console.log('\n--- Test 4: Female BMR & Minimums ---');
const bmrFemale = calculateBMR({ sex: 'female', age: 30, weightKg: 60, heightCm: 160 });
assertCloseTo(bmrFemale, 1289, 0.001, 'Female 30y, 60kg, 160cm raw BMR = 1289');
const tdeeFemale = calculateMaintenanceCalories(bmrFemale, 1.2); // sedentary = 1546.8
const femaleOpt = calculateWeightLossOption({
  currentWeightKg: 60,
  maintenanceCalories: tdeeFemale,
  weeklyRate: 0.01,
  sex: 'female',
  age: 30
});
// 60 * 0.01 = 0.6 kg -> weekly deficit 4666.67 -> daily deficit 666.67 -> target 1546.8 - 666.67 = 880.13 kcal
assert(femaleOpt.safety.guidanceMinimum === 1200, 'Female guidance minimum is 1200');
assert(femaleOpt.safety.isBelowMinimum === true, '880 is below 1200 female minimum');

// 5. Under 18 Restrictions
console.log('\n--- Test 5: Under 18 Age Restrictions ---');
const under18Options = calculateAllWeightLossOptions({
  currentWeightKg: 65,
  maintenanceCalories: 2200,
  sex: 'male',
  age: 16
});
assert(under18Options[0].isUnder18Disabled === false, '0.25% is allowed for under 18');
assert(under18Options[2].isUnder18Disabled === false, '0.75% is allowed for under 18');
assert(under18Options[3].isUnder18Disabled === false, '1.0% is allowed for under 18');
assert(under18Options[4].isUnder18Disabled === true, '1.5% is disabled for under 18');
assert(under18Options[5].isUnder18Disabled === true, '2.0% is disabled for under 18');

// 6. Estimated Weeks Calculation
console.log('\n--- Test 6: Estimated Weeks Calculation ---');
const weeks = calculateEstimatedWeeks({ currentWeightKg: 70, targetWeightKg: 65, weeklyLossKg: 0.5 });
assert(weeks === 10, '70kg to 65kg at 0.5kg/week = 10 weeks');

// 7. Extreme 2.0% Modal Confirmation Requirement
console.log('\n--- Test 7: Extreme 2.0% Confirmation ---');
assert(allOptions70[5].safety.requiresConfirmation === true, '2.0% requires confirmation modal');
assert(allOptions70[5].isExtreme === true, '2.0% is marked extreme');

// 8. Single Source of Truth in Nutrition Targets
console.log('\n--- Test 8: Nutrition Targets Macro Consistency ---');
const nutritionResult = calculateNutritionTargets({
  weight: 70,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  goal: GOALS.FAT_LOSS,
  requestedTargetCalories: 1674
});
assert(nutritionResult.requestedTargetCalories === 1674, 'Preserves requestedTargetCalories = 1674');
assert(nutritionResult.protein === 140, 'Protein = 70 * 2.0 = 140g');
// Check formula: (protein * 4) + (carbs * 4) + (fats * 9) == targetCalories
const macroSum = (nutritionResult.protein * 4) + (nutritionResult.carbs * 4) + (nutritionResult.fats * 9);
assert(macroSum === nutritionResult.targetCalories, `Macro sum (${macroSum}) strictly equals targetCalories (${nutritionResult.targetCalories})`);

// 9. User Scenario: 130kg at 2.0% Extreme Rate / 660 kcal - No inflation to 1202!
console.log('\n--- Test 9: 130kg Extreme Deficit (660 kcal Single Source of Truth) ---');
const extreme130Result = calculateNutritionTargets({
  weight: 130,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  goal: GOALS.FAT_LOSS,
  requestedTargetCalories: 660
});
assert(extreme130Result.targetCalories === 660, `Target calories must remain 660, got ${extreme130Result.targetCalories} (NEVER 1202!)`);
assert(extreme130Result.requestedTargetCalories === 660, 'Preserves requestedTargetCalories = 660');
const extremeSum = (extreme130Result.protein * 4) + (extreme130Result.carbs * 4) + (extreme130Result.fats * 9);
assert(extremeSum === 660, `Macro sum (${extremeSum}) strictly equals 660`);

// 10. Weight Gain Test Case: 70kg, 0.50% Recommended Rate, TDEE 2452
console.log('\n--- Test 10: Weight Gain 70kg at 0.5% (Recommended Rate) ---');
const gain050 = calculateWeightGainOption({
  currentWeightKg: 70,
  maintenanceCalories: tdeeMale,
  weeklyRate: 0.0050,
  sex: 'male',
  age: 25,
  targetWeightKg: 80
});
assertCloseTo(gain050.weeklyGainKg, 0.35, 0.001, 'Weekly gain for 0.5% of 70kg = 0.35 kg');
assertCloseTo(gain050.dailySurplus, 388.8888, 0.01, 'Daily surplus for 0.35 kg/week ≈ 388.89 kcal');
assert(gain050.dailySurplusRounded === 389, 'Daily surplus rounded = 389 kcal');
assertCloseTo(gain050.requestedTargetCalories, 2840.9326, 0.01, 'Daily gain target = 2840.93 kcal');
assert(gain050.targetCaloriesRounded === 2841, 'Daily gain target rounded = 2841 kcal');
assertCloseTo(gain050.estimatedWeeks, 28.6, 0.1, 'Estimated weeks 70kg -> 80kg at 0.35kg/wk ≈ 28.6 wks');

// 11. 70kg Gain Rates Across All 6 Options
console.log('\n--- Test 11: 70kg Gain Rates Across All 6 Options ---');
const expectedGains = [
  { rate: 0.0025, expectedKg: 0.175 },
  { rate: 0.0050, expectedKg: 0.350 },
  { rate: 0.0075, expectedKg: 0.525 },
  { rate: 0.0100, expectedKg: 0.700 },
  { rate: 0.0150, expectedKg: 1.050 },
  { rate: 0.0200, expectedKg: 1.400 },
];
const allGainOptions70 = calculateAllWeightGainOptions({
  currentWeightKg: 70,
  maintenanceCalories: tdeeMale,
  sex: 'male',
  age: 25,
  targetWeightKg: 80
});
assert(allGainOptions70.length === 6, 'Generated all 6 gain options');
expectedGains.forEach((exp, idx) => {
  assertCloseTo(allGainOptions70[idx].weeklyGainKg, exp.expectedKg, 0.001, `Gain Option ${idx + 1} (${exp.rate * 100}%): ${exp.expectedKg} kg/week`);
});

// 12. Gain Under-18 Restrictions and Extreme Confirmation
console.log('\n--- Test 12: Gain Under-18 Restrictions & Extreme Confirmation ---');
const u18GainOpt = calculateWeightGainOption({
  currentWeightKg: 60,
  maintenanceCalories: 2200,
  weeklyRate: 0.015,
  sex: 'male',
  age: 16
});
assert(u18GainOpt.isUnder18Disabled === true, '1.5% gain disabled for under 18');
const extremeGainOpt = calculateWeightGainOption({
  currentWeightKg: 70,
  maintenanceCalories: 2400,
  weeklyRate: 0.02,
  sex: 'male',
  age: 25
});
assert(extremeGainOpt.safety.requiresConfirmation === true, '2.0% EXTREME BULK requires confirmation');

// 13. Muscle Gain Nutrition Targets Macro Consistency
console.log('\n--- Test 13: Muscle Gain Nutrition Targets Macro Consistency ---');
const muscleGainTargets = calculateNutritionTargets({
  weight: 70,
  height: 175,
  age: 25,
  gender: 'male',
  activityLevel: 'moderate',
  goal: GOALS.MUSCLE_GAIN,
  weeklyGainPercent: 0.0050
});
assert(muscleGainTargets.protein === 140, 'Muscle gain protein = 70 * 2.0 = 140g');
assert(muscleGainTargets.targetCalories === 2841, `Target calories = 2841, got ${muscleGainTargets.targetCalories}`);
const muscleSum = (muscleGainTargets.protein * 4) + (muscleGainTargets.carbs * 4) + (muscleGainTargets.fats * 9);
assert(muscleSum === muscleGainTargets.targetCalories, `Muscle gain macro sum (${muscleSum}) strictly equals targetCalories (${muscleGainTargets.targetCalories})`);

console.log('\n🎉 ALL 13 TEST SUITES PASSED SUCCESSFULLY!');


