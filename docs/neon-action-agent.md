# NEON ACTION AGENT

The agent is part of `#neon-ai`. Voice and typed messages share the same dispatcher. Normal coaching questions keep using the existing coach; reported actions go through the restricted executor. The UI shows current nutrition, water, supplements, workout, weight and Today priorities after each action.

| Tool | Records changed/read |
| --- | --- |
| `log_meal` | `loggedMeals` and today's calorie/macronutrient totals; food IDs and grams only, macros calculated from the existing food database |
| `add_water` | `waterLogs`, today's liters and glasses (one glass = 250 ml) |
| `take_supplement` | Existing supplement schedule and dated `daily_stack_taken_v2` storage; idempotent |
| `finish_workout` | Workout history and today's completion; includes recorded sets, does not invent missing sets/volume/duration |
| `log_set` | Exercise set log, matching active exercise, best recorded set per exercise and bench strength history |
| `log_weight` | Dated weight log, profile weight and progress report; replaces the same day's measurement |
| `add_shopping`, `remove_shopping` | The persistent shopping list used by `#shopping-list` |
| `prioritize_today` | Order of workout, nutrition, water and supplements in Today priorities |
| `remaining_protein`, `today_summary` | Read current records and targets; no mutation |
| `undo` | Last successful agent transaction, including dependent changes |
| `stop_listening` | Ends the microphone session |

Direct Arabic commands, including the examples in the UI, do not require an AI key. Free phrasing uses the existing Gemini key and selected model from NEON AI settings. Only minimal action context and food/exercise catalogs are sent to Gemini; authentication tokens and the full profile are excluded. Gemini output is checked and passed through the same executor as direct commands. Unknown tools, invalid quantities, unknown foods/exercises and ambiguous deletions do not mutate records. Requests time out after 25 seconds.

Meal values are estimates for the named food preparation. For example, the short aliases `دجاج` and `رز` use the existing grilled chicken breast and cooked white rice entries, and the response explicitly names those assumptions. Missing quantities and unknown foods return a clarification without partial logging. Explicit raw chicken uses the raw database entry. No default meal or guessed food quantity is logged.

PR means the heaviest recorded set for that exercise, with reps breaking ties at equal weight. It is not an estimated one-rep max. Sets explicitly stored in the current workout or structured workout history are also considered.

Persistence uses the existing browser state key `neon_coach_app_state_v1`. Supplement and workout mirror keys are updated for the existing standalone screens. Multi-key storage failures roll back writes and leave the in-memory state unchanged. This implementation does not add Supabase migrations or cloud synchronization for agent actions. It works in the application's local mode; a browser refresh retains the records.

Undo keeps the last 20 agent transactions and records only changed paths. It retains chat and unrelated edits, refuses to overwrite a subsequent manual edit to a touched record, and cannot cross user or calendar-day boundaries. Read-only requests and repeated supplement/workout completion do not consume an undo entry.

Voice starts only after clicking the microphone. Browser SpeechRecognition provides final transcripts; interim and repeated final events do not execute twice. Optional “يا نيون” activation applies within the explicitly started session. Recognition pauses during execution and optional spoken replies. Stop, route changes, hidden pages and three minutes of inactivity release the session. Recognition support and network requirements depend on the browser; text entry remains available.

Run feature checks with:

```sh
node --test tests/actionAgent.test.js tests/actionPersistence.test.js tests/actionVoice.test.js
npx vite build
```

The feature tests cover all requested command categories, atomic batches, validation, undo conflicts, daily boundaries, persistence rollback, supplement mirrors, duplicate speech results, wake-word behavior and microphone cleanup. Automated speech checks simulate recognition events; they do not verify a physical microphone or a live Gemini account.
