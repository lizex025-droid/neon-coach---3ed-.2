const fs = require('fs');
const path = require('path');

const DEFAULT_MODELS = [
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.6-flash',
  'gemini-3.7-flash',
  'gemini-3.8-flash'
];

const SYSTEM_PROMPT =
  "You are Nova, Ahed's permanent bilingual AI personal trainer coach and nutrition analyst inside pdfs.html. " +
  "Primary languages: Arabic first, English second. Reply in Arabic by default, with English terms in parentheses when useful. " +
  "You can see JSON data from the page: coachTraining, local coach memory, library blocks and links, saved supplement stack, creatine status, water coach data, bodyweight, and gym logs when available. " +
  "Use saved profile, memory, and logs before asking repeat questions. " +
  "Always distinguish between **known data**, **inferred data**, and **missing data**. Do not invent missing numbers. " +
  "If food quantity, cooked/raw state, unit, supplement dose/timing, or workout context is missing and needed, ask exactly one concise clarifying question. " +
  "When nutrition is discussed, calculate or estimate calories, protein, carbs, and fats when enough data exists, and label confidence. " +
  "When asked about creatine, mention saved dose, timing, whether it is marked taken today, low-stock status if present, water impact if present, and the linked Supplements + Water block. " +
  "When asked about blocks or PDFs, name the relevant block and include its link from the JSON. " +
  "Be emotionally intelligent, direct, respectful, evidence-aware, safety-first, and never shame the user. " +
  "Never say one off-plan meal ruined everything. " +
  "Do not diagnose medical conditions, prescribe medication, give steroid advice, or recommend starvation/purging/dangerous restriction. " +
  "For severe fatigue, dizziness, chest pain, fainting, self-harm ideation, purging, dangerous restriction, or serious symptoms, advise stopping and seeking qualified help. " +
  "For nutrition calculations, answer with totals first only: calories, protein, carbs, fats, then one short note. Do not include known/inferred/missing sections unless explicitly asked. Do not start with filler phrases like بالتأكيد or تمام. " +
  "Answer in short bullet points starting with '- ', plain language. " +
  "Wrap key words and numbers in **double asterisks**. " +
  "End with one '- اليوم اعمل:' bullet giving the single next action.";

function extractGeminiText(json) {
  if (!json || typeof json !== 'object') return '';
  if (Array.isArray(json.candidates)) {
    return json.candidates
      .map((candidate) => (((candidate || {}).content || {}).parts || [])
        .map((part) => part && part.text ? part.text : '')
        .join(''))
      .filter(Boolean)
      .join('\n');
  }
  return '';
}

function explainEmptyGeminiResponse(json) {
  const candidate = json && Array.isArray(json.candidates) && json.candidates[0];
  const reason = candidate && candidate.finishReason;
  if (reason === 'SAFETY') return '- Gemini blocked this reply for **safety**. Try asking it in a simpler way.';
  if (reason === 'MAX_TOKENS') return '- Gemini ran out of output space. Ask a **shorter question**.';
  return '- Gemini answered, but Nova could not read the text. Try again in a few seconds.';
}

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

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

  loadLocalEnv();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'server not configured' });

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { body = {}; }
  }

  const message = body && typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return res.status(400).json({ error: 'message required' });

  const dashboardData = body && body.dashboardData && typeof body.dashboardData === 'object'
    ? body.dashboardData
    : {};
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
  const models = [primaryModel, ...DEFAULT_MODELS.filter(m => m !== primaryModel)];
  const prompt = 'Dashboard data as JSON:\n' + JSON.stringify(dashboardData) +
    '\n\nUser message:\n' + message;

  const isSearchRequest = /(ابحث|بحث|غوغل|جوجل|دراسات|search|google)/i.test(message);

  try {
    let lastError = null;
    for (const model of models) {
      const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' +
        encodeURIComponent(model) + ':generateContent';

      if (isSearchRequest) {
        try {
          const searchUpstream = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'x-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: prompt }] }],
              tools: [{ googleSearch: {} }],
              generationConfig: {
                maxOutputTokens: 1200,
                temperature: 0.3,
              },
            }),
            signal: AbortSignal.timeout(6000)
          });
          if (searchUpstream.ok) {
            const json = await searchUpstream.json();
            const text = extractGeminiText(json);
            if (text) {
              return res.status(200).json({ reply: text, model });
            }
          }
        } catch (_) {}
      }

      const upstream = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [{
            role: 'user',
            parts: [{ text: prompt }],
          }],
          generationConfig: {
            maxOutputTokens: 1200,
            temperature: 0.3,
          },
        }),
      });

      const upstreamText = await upstream.text();
      let json = null;
      try { json = upstreamText ? JSON.parse(upstreamText) : null; } catch {}
      if (upstream.ok) {
        return res.status(200).json({
          reply: extractGeminiText(json) || explainEmptyGeminiResponse(json),
          model,
        });
      }

      const msg = json && json.error && json.error.message
        ? json.error.message
        : (upstreamText || 'Gemini request failed');
      lastError = { message: msg, status: upstream.status };
    }

    return res.status(lastError && lastError.status ? lastError.status : 503).json({
      error: lastError && lastError.message ? lastError.message : 'Gemini is temporarily unavailable.',
    });
  } catch (e) {
    return res.status(500).json({
      error: 'fetch error: ' + (e && e.message ? e.message : String(e)),
    });
  }
};
