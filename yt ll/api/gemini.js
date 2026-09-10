const DEFAULT_MODEL = 'gemini-3.5-flash';

const SYSTEM_PROMPT =
  "You are Nova, a practical personal trainer and fitness coach living inside the user's dashboard. " +
  "You answer the user's questions directly, especially about workouts, exercise selection, form, progression, recovery, nutrition basics, and training habits. " +
  "You can see their saved dashboard data, including gym logs, bodyweight, goals, sleep, water, and health data when available. Use that data to personalize advice, but do not invent numbers that are not present. " +
  "When asked for exercises, suggest concrete movements with sets, reps, rest time, and simple form cues. Prefer safe, realistic training plans over extreme routines. " +
  "If the user asks a general question, still answer it normally, then add a useful fitness angle when relevant. " +
  "Do not diagnose injuries or medical conditions. For pain, injury, chest pain, fainting, severe symptoms, or medical risk, advise stopping the exercise and seeing a qualified professional. " +
  "Answer in short bullet points starting with '- ', few words each, plain language. " +
  "Wrap key words and numbers in **double asterisks**. " +
  "End with one '- Do today:' bullet giving the single next action.";

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

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method not allowed' });

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
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) + ':generateContent';
  const prompt = 'Dashboard data as JSON:\n' + JSON.stringify(dashboardData) +
    '\n\nUser message:\n' + message;

  try {
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
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });

    const upstreamText = await upstream.text();
    let json = null;
    try { json = upstreamText ? JSON.parse(upstreamText) : null; } catch {}
    if (!upstream.ok) {
      const message = json && json.error && json.error.message
        ? json.error.message
        : (upstreamText || 'Gemini request failed');
      return res.status(upstream.status).json({ error: message, status: upstream.status });
    }

    return res.status(200).json({
      reply: extractGeminiText(json) || explainEmptyGeminiResponse(json),
    });
  } catch (e) {
    return res.status(500).json({
      error: 'fetch error: ' + (e && e.message ? e.message : String(e)),
    });
  }
}
