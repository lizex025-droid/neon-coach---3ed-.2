# NEON Metabolic Engine v1

The app distinguishes estimated resting energy expenditure (RMR/REE), a user-entered indirect-calorimetry result, an initial activity-based TDEE estimate, and TDEE inferred from logged intake and weight. None is labeled a guaranteed individual measurement of total expenditure.

## Sources and implemented equations

- Mifflin et al. 1990: https://pubmed.ncbi.nlm.nih.gov/2305711/
  Men: 10 W + 6.25 H - 5 A + 5; women: 10 W + 6.25 H - 5 A - 161.
- Cunningham 1980: https://pubmed.ncbi.nlm.nih.gov/7435418/
  RMR = 500 + 22 FFM. The optional mode requires a measurement source, date and explicit reliability confirmation. Visual body-fat selection cannot activate it.
- Hall et al. 2011, complete appendix: https://www.niddk.nih.gov/-/media/Files/Labs-Branches-Sections/laboratory-biological-modeling/integrative-physiology-section/Hall-Lancet-Web-Appendix_508.pdf
  Tissue-energy approximation uses dL/dF = 10.4/F, fat energy density 39.5 MJ/kg and lean energy density 7.6 MJ/kg. It is a model assumption, not a measurement of tissue changes.
  Weight projection uses the **linearized, post-transition equations 11-15**, not the full NIH Body Weight Planner. It excludes early water/glycogen shifts, requires a body-fat estimate and stops beyond 10% weight change. All kJ terms are converted to kcal with 4.184 kJ/kcal. No date of reaching a distant goal is promised.
- Energy-balance estimator: mean actual intake minus modeled stored-energy change/day.
  Public explanation: https://help.macrofactorapp.com/dashboard/expenditure
  This is an independently implemented estimator, not a reproduction of MacroFactor's proprietary coefficients.
- Protein context: https://jissn.biomedcentral.com/articles/10.1186/s12970-017-0174-y
  Preferences and body-fat estimates select approximate protein targets; they do not infer individual requirements. Lean-athlete calorie-restriction recommendations do not automatically generalize to all users.

## Engineering choices requiring empirical validation

The following are conservative product policies, not published clinical cutoffs: seven-day EWMA time constant, Theil-Sen regression with a 1.5 kg/6-MAD outlier threshold, 21 consecutive complete intake days (up to 28), six weight measurements with near-boundary coverage, maximum seven-day weighing gap, a 14-day event hold, 35% blending, seven-day update spacing and maximum 150 kcal/5% TDEE adjustment per update. Target changes are limited separately to 150 kcal at check-in, except when a configured recommendation floor requires a larger correction.

The EWMA is for display. Regression estimates the slope from robust observations with actual calendar-day gaps to avoid feeding EWMA lag into the energy balance. Plausible sustained changes are not declared outliers solely because they differ from yesterday. Abrupt changes pause learning; the app cannot identify water from scale weight alone.

Known daily intake must cover the entire weight observation interval. Missing/partial days are not zeros or silently imputed; explicit fasting is zero. Estimated complete days are allowed and identified. Adding, editing or deleting a manually logged meal invalidates its completeness confirmation. Remote meal changes are reconciled before learning. Systematic food under-reporting can still bias inferred expenditure.

Legacy/manual targets remain fixed until coached mode is selected. New onboarding defaults to coached mode. A repeated same-week check-in cannot compound a correction. While holding, the last estimate and targets are retained. RMR/activity changes reset the prior but retain raw history.

The component activity estimate takes the maximum of step-based and occupational PAL to avoid counting overlapping movement twice, then adds incremental exercise above resting energy. The legacy multiplier already includes exercise. Step buckets, occupational coefficients and MET choices are initialization heuristics, not precise individual measurements.

## Targets and integration

- The 7700 kcal/kg coefficient is only an initial goal-rate approximation. It is not used for long-term projection, and is not used in adaptive tissue estimation when body composition is available.
- Coached recommendation floors default to 1200/1500 kcal/day for women/men. They are configurable guidance, not a statement of safety. Under-18, pregnancy and breastfeeding are outside adaptive model eligibility.
- Macro targets are produced once and consumed by the daily view and meal planner. Protein comes first. Balanced divides remaining energy equally; low-fat/high-fat ratios are transparent preferences, not superior metabolic equations. Keto uses a user-selected **total-carbohydrate** ceiling, distinct from net carbs.
- Generated integer macro targets conserve 4/4/9 energy. Actual food-label calories remain independent (fiber, polyols, specific Atwater factors and rounding).
- Weekly budget rounding conserves the exact integer weekly sum and recommendation floor. The profile stores average targets; daily shifted targets are applied on day rollover and consumed by the meal planner.
- Infeasible macro budgets are flagged; they must not be described as meeting the desired protein target.
- Meal quantities are fitted to protein, carbohydrate, fat and energy together using bounded non-negative coordinate descent. Independent ingredient changes use explicit ingredient nutrient data; fixed recipes are not decomposed into invented ingredient macro ratios for optimization. Countable foods remain whole pieces. Resulting food values are approximate and visibly flagged when the fit is poor.
- Weight/strength cannot measure fat or muscle kilograms. The old heuristic was removed.
- New settings, day confirmations, imports and calibration history are persisted in browser app state and included in existing full JSON backup exports. No new database columns are assumed; these records are not claimed to be cross-device synced.

## Validation scope

Regression tests cover published equation examples, the 83 kg/1913 TDEE/0.5% goal example, zero vs missing intake, confirmed fasting, sparse and irregular weights, outliers, fluid-transition holds, same-week idempotency, goal direction, integer budgets, CSV validation, macro consistency, store persistence and bounded dynamic projections. Synthetic tests validate implementation and invariants, not clinical accuracy. Clinical accuracy requires independent reference expenditure data and prospective validation.

## Onboarding v2: inputs connected to calculations

Four questionnaire sections now precede final plan creation, with explicit unknown options and validation. They are also restored when revisiting onboarding.

| Inputs | Actual use |
| --- | --- |
| Highest adult weight and recent direction | Context and consistency validation; no invented fixed metabolic suppression coefficient |
| Prior dated weight plus explicitly complete mean intake over 21–56 days | Optional initial energy-balance estimate, labeled as requiring calibration; never fabricated daily records |
| Movement outside exercise, actual steps and occupation | Component activity prior; overlapping step/job activity uses their maximum |
| Current exercise type, actual sessions and duration | Incremental exercise energy; kept separate from the future workout calendar |
| Lifting experience | Prefills the existing training level, which the user can review later |
| Cardio experience and athletic status | Saved context; no unsupported RMR multiplier |
| Measured RMR or reliable dated FFM | Selects indirect calorimetry input or Cunningham; Mifflin remains the default |
| Planned nutrition-program training and protein preference | Protein range selection |
| Balanced / low-fat / low-carb / keto | Remaining fat/carbohydrate allocation; keto uses total carbs |
| Even / shifted calories, training weekdays and calorie floor | Exact weekly budget and daily meal-plan targets |
| Recent carbohydrate, creatine or fluid transition | Holds adaptive expenditure updates during the transition window |

Activity coefficients, exercise MET approximations and protein preference brackets are transparent initial product assumptions requiring empirical validation. Added questions do not make these population estimates individual measurements. Public MacroFactor documentation does not disclose its complete initial-expenditure coefficients.

MacroFactor experience context: https://help.macrofactorapp.com/en/articles/59-change-your-cardio-experience
MacroFactor initial estimate and historical data: https://help.macrofactorapp.com/en/articles/206-what-should-i-do-if-my-initial-expenditure-or-recommended-energy-intake-seems-too-high-or-too-low

Questionnaire and metabolic settings are persisted in the app state on the current browser. The legacy Supabase profile table only syncs its supported columns; these additional settings are not yet guaranteed to transfer to another device.

## Choice-based questionnaire and milestones

Experience and measurement-source dropdowns are now radio cards. Exact session counts, duration, keto carbs, calorie shift and recommendation floors have preset cards plus a precise custom option; selected presets are stored as numbers. Measurements and optional recorded historical data retain exact numeric/date entry. Step categories remain categories rather than invented step-count midpoints.

The questionnaire no longer asks the onset date of a recent water/carbohydrate/creatine transition. It records when the user reports the recent event, separately from onset, and holds adaptive updates for 14 days from that report. Returning to the same answer does not restart the hold; changing the reported event does. Legacy dated events remain supported.

Three progress milestones mark phase 1 complete on reaching page 5, phase 2 on page 10, and phase 3 on reaching final review. This is questionnaire progress, not a health or estimation confidence score. Back navigation restores the corresponding progress state.
