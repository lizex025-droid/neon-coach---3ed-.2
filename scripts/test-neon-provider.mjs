import { understandWithGemini } from '../api/langgraph/provider.js';
import { validateAction } from '../api/langgraph/toolRegistry.js';
const inputs = [
  ['Log 500 ml of water.', 'logWater', 'amountMl', 500],
  ['I drank half a liter of water.', 'logWater', 'amountMl', 500],
  ["Add half a liter to today's water.", 'logWater', 'amountMl', 500],
  ['Add the 500 ml water bottle I drank.', 'logWater', 'amountMl', 500],
  ['My weight today is 79.5.', 'logWeight', 'weightKg', 79.5],
  ['My weight became seventy-nine and a half.', 'logWeight', 'weightKg', 79.5],
  ['Log 79.5 kilograms for today.', 'logWeight', 'weightKg', 79.5],
  ['شربت نص لتر مي', 'logWater', 'amountMl', 500],
  ['How do I log my weight?', null],
  ['Translate: I drank 500 ml of water.', null]
];
const context = { currentDate: '2026-09-13', timezone: 'Asia/Amman', loggedMeals: [], weightHistory: [], workoutHistory: [], shoppingList: [] };
let failed = 0;
const startCase = Math.max(1, Number(process.argv.find(a => a.startsWith('--from='))?.split('=')[1] || 1));
for (let i = startCase - 1; i < inputs.length; i++) {
  const [normalizedText, tool, key, value] = inputs[i];
  try {
    const plan = await understandWithGemini({ normalizedText, context, messages: [], pending: null, summary: '' });
    const actions = plan.actions.map(validateAction);
    const ok = tool ? actions.length === 1 && actions[0].tool === tool && actions[0].args[key] === value : actions.length === 0;
    console.log(JSON.stringify({ case: i + 1, pass: ok, intent: plan.intent, tools: actions.map(a => a.tool) }));
    if (!ok) failed++;
  } catch (err) {
    console.log(JSON.stringify({ case: i + 1, pass: false, code: err.code || 'ERROR', providerStatus: err.providerStatus })); failed++;
    // Provider outage is not fixed by spending requests repeatedly.
    if (['PROVIDER_NOT_CONFIGURED', 'PROVIDER_UNAVAILABLE'].includes(err.code)) break;
  }
}
process.exitCode = failed ? 1 : 0;
