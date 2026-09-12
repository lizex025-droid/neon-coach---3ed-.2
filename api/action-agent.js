import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];

const SYSTEM_PROMPT = `You are the NEON ACTION AGENT for NEON COACH fitness app.
Your job is to convert user natural speech (Arabic, English, Franco, or mixed) into structured action tools.

RULES:
1. Output MUST be valid JSON only, without markdown fences or additional commentary.
2. Schema:
{
  "type": "actions" | "clarification" | "query",
  "actions": [
    {
      "tool": "toolName",
      "arguments": { ... }
    }
  ],
  "reply": "ultra short Arabic response like: تم، سجلته، تسجل، or a single concise question if missing vital info"
}

ALLOWED TOOLS:
- logMeal({ items: [{ nameAr: string, grams: number, calories: number, protein: number, carbs: number, fats: number, isEstimated: boolean }] })
- updateMeal({ mealId: string, items: array })
- deleteMeal({ mealId: string })
- logWater({ milliliters: number })
- updateWater({ milliliters: number })
- logWeight({ weightKg: number })
- updateWeight({ weightKg: number })
- logWorkoutSets({ exercise: string, weightKg: number, reps: number, sets: number, rpe?: number })
- logCardio({ cardioType: string, durationMinutes: number })
- logInBody({ weight: number, bodyFatPercentage?: number, skeletalMuscleMassKg?: number })
- addShoppingItems({ names: string[] })
- removeShoppingItem({ name: string })
- getTodayNutrition({ query: string })
- getTodayWorkout({})
- getTodayWater({})
- getTodaySupplements({})
- getTodaySummary({})
- undoLastAction({})
- stopVoiceSession({})

3. Multiple actions in one sentence must generate multiple items in the "actions" array.
4. If the user is clarifying or correcting (e.g. "no, I meant half a liter" or "لا قصدي 85 كيلو"), update the prior action rather than adding extra.
5. Keep "reply" ultra concise: "تم", "سجلته", "تسجل".
6. Never output arbitrary code, SQL queries, or unknown tools.`;

function loadLocalEnv() {
  if (process.env.GEMINI_API_KEY) return;
  for (const f of ['.env.local', '.env']) {
    const envPath = path.join(process.cwd(), f);
    if (!fs.existsSync(envPath)) continue;
    const text = fs.readFileSync(envPath, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
      if (!match || process.env[match[1]] != null) continue;
      process.env[match[1]] = match[2].trim();
    }
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  loadLocalEnv();
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const message = body && typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'message required' });

  const context = body && body.context ? body.context : {};

  if (!apiKey) {
    // إذا لم يكن هناك مفتاح، الرد بتوجيه للمحلل المحلي
    return res.status(200).json({
      type: 'actions',
      actions: [],
      reply: 'تم استلام الأمر محلياً.'
    });
  }

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
  const models = [primaryModel, ...DEFAULT_MODELS.filter(m => m !== primaryModel)];
  const prompt = `Context: ${JSON.stringify(context)}\nUser utterance: "${message}"`;

  try {
    for (const model of models) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
      const upstream = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
            responseMimeType: 'application/json'
          },
        }),
      });

      if (upstream.ok) {
        const json = await upstream.json();
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          try {
            const parsed = JSON.parse(text);
            return res.status(200).json(parsed);
          } catch (_) {}
        }
      }
    }

    return res.status(200).json({
      type: 'actions',
      actions: [],
      reply: 'تم.'
    });
  } catch (e) {
    return res.status(500).json({ error: 'server error: ' + e.message });
  }
};
