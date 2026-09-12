import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

const SYSTEM_PROMPT = `You are the NEON ACTION & KNOWLEDGE AGENT for NEON COACH fitness app.
Your role:
1. Convert user fitness and nutrition commands into structured action tools.
2. If the user asks for external information, searches, nutrition facts, exercise advice, or scientific studies, answer comprehensively, accurately, and politely in Arabic.

RULES:
1. Output MUST be valid JSON only, without markdown fences or extra text.
2. Schema:
{
  "type": "actions" | "clarification" | "query",
  "actions": [
    {
      "tool": "toolName",
      "arguments": { ... }
    }
  ],
  "reply": "Arabic response"
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
- completeWorkout({ title: string })
- logSupplement({ supplement: string, dose?: string })
- markSupplementTaken({ supplement: string })
- logCardio({ cardioType: string, durationMinutes: number })
- logInBody({ weight: number, bodyFatPercentage?: number, skeletalMuscleMassKg?: number })
- addShoppingItem({ name: string })
- addShoppingItems({ names: string[] })
- removeShoppingItem({ name: string })
- prioritize_today({ priority: "workout" | "nutrition" | "water" | "supplements" })
- getTodayNutrition({ query: string })
- getTodayWorkout({})
- getTodayWater({})
- getTodaySupplements({})
- getTodaySummary({})
- undoLastAction({})
- stopVoiceSession({})

CLASSIFICATION & REPLY RULES:
1. ACTION: If user wants to log, update, delete, or perform an app action, return type "actions", populate "actions" array, and set "reply" to a short Arabic confirmation like "تم" or "سجلته".
2. CLARIFICATION: If critical info is missing to perform an action, return type "clarification", actions: [], and ask one concise question.
3. SEARCH / EXTERNAL QUERY / KNOWLEDGE: If user asks a question, requests a search (e.g. "ابحث عن...", "كم سعرة في...", "ما هي فوائد...", "كيف أسوي...", "أحدث الدراسات عن..."), return type "query", actions: [], and in "reply" provide a direct, accurate, evidence-backed answer in Arabic with exact numbers, calories, macros, or study findings.`;

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
    return res.status(200).json({
      type: 'actions',
      actions: [],
      reply: 'تم استلام الأمر محلياً.'
    });
  }

  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const models = [primaryModel, ...DEFAULT_MODELS.filter(m => m !== primaryModel)];
  const prompt = `Context: ${JSON.stringify(context)}\nUser utterance: "${message}"`;

  const isSearchRequest = /(ابحث|بحث|غوغل|جوجل|دراسات|search|google)/i.test(message);

  try {
    for (const model of models) {
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

      if (isSearchRequest) {
        try {
          const searchUpstream = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              tools: [{ googleSearch: {} }],
              generationConfig: {
                temperature: 0.2,
                maxOutputTokens: 1000
              }
            }),
            signal: AbortSignal.timeout(6000)
          });
          if (searchUpstream.ok) {
            const json = await searchUpstream.json();
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) {
              try {
                const parsed = JSON.parse(text);
                return res.status(200).json(parsed);
              } catch (_) {
                return res.status(200).json({
                  type: 'query',
                  actions: [],
                  reply: text.trim()
                });
              }
            }
          }
        } catch (_) {}
      }

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
        signal: AbortSignal.timeout(7000)
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
}

