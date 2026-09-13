const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const MAX_BODY_BYTES = 64 * 1024;
const MAX_MESSAGE_CHARS = 8_000;
const MAX_CONTEXT_CHARS = 40_000;
const DEFAULT_RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

const requestBuckets = new Map();

const SYSTEM_PROMPT =
  "You are Nova, Ahed's bilingual AI personal trainer and nutrition coach. " +
  'Reply in Arabic by default unless the user asks for another language. ' +
  'Use the supplied dashboard context when it is relevant, but never invent missing values. ' +
  'Be concise, practical, evidence-aware, and safety-first. ' +
  'Do not diagnose medical conditions, prescribe medication, recommend steroids, starvation, purging, or dangerous restriction. ' +
  'For severe symptoms, advise stopping and seeking qualified medical help. ' +
  'For nutrition calculations, put calories, protein, carbohydrates, and fats first, then one short note.';

function json(res, status, payload) {
  res.status(status).json(payload);
}

function parseBody(body) {
  if (body && typeof body === 'object') return body;
  if (typeof body !== 'string' || !body.trim()) return {};
  try {
    return JSON.parse(body);
  } catch {
    return null;
  }
}

function safeJson(value, fallback = '{}') {
  try {
    return JSON.stringify(value ?? {});
  } catch {
    return fallback;
  }
}

function requestSize(body) {
  if (typeof body === 'string') return Buffer.byteLength(body, 'utf8');
  return Buffer.byteLength(safeJson(body), 'utf8');
}

function clientId(req) {
  const forwarded = req.headers && req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return (req.socket && req.socket.remoteAddress) || 'local';
}

function isRateLimited(req) {
  const now = Date.now();
  const id = clientId(req);
  const configuredLimit = Number(process.env.AI_RATE_LIMIT_PER_MINUTE);
  const limit = Number.isFinite(configuredLimit) && configuredLimit > 0
    ? Math.floor(configuredLimit)
    : DEFAULT_RATE_LIMIT;
  const current = requestBuckets.get(id);

  if (!current || now - current.startedAt >= RATE_WINDOW_MS) {
    requestBuckets.set(id, { startedAt: now, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > limit;
}

function normalizeHistory(body) {
  const history = Array.isArray(body.chatHistory)
    ? body.chatHistory
    : (Array.isArray(body.dashboardData?.chatHistory) ? body.dashboardData.chatHistory : []);

  return history
    .filter((item) => item && typeof item.text === 'string' && item.sender !== 'system')
    .slice(-10)
    .map((item) => ({
      role: item.sender === 'user' ? 'user' : 'assistant',
      text: item.text.trim().slice(0, 4_000),
    }))
    .filter((item) => item.text);
}

function buildContext(body) {
  const dashboardData = body.dashboardData && typeof body.dashboardData === 'object'
    ? { ...body.dashboardData }
    : {};
  delete dashboardData.chatHistory;
  return safeJson(dashboardData).slice(0, MAX_CONTEXT_CHARS);
}

function extractGeminiText(payload) {
  return (payload?.candidates || [])
    .flatMap((candidate) => candidate?.content?.parts || [])
    .map((part) => typeof part?.text === 'string' ? part.text : '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

function extractOpenAIText(payload) {
  if (typeof payload?.output_text === 'string' && payload.output_text.trim()) {
    return payload.output_text.trim();
  }

  return (payload?.output || [])
    .flatMap((item) => item?.content || [])
    .map((part) => typeof part?.text === 'string' ? part.text : '')
    .filter(Boolean)
    .join('\n')
    .trim();
}

async function callGemini({ message, context, history, signal }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { configured: false };

  const model = process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL;
  const contents = [];
  for (const item of history) {
    const role = item.role === 'assistant' ? 'model' : 'user';
    if (!contents.length && role === 'model') continue;
    const previous = contents.at(-1);
    if (previous?.role === role) previous.parts[0].text += `\n${item.text}`;
    else contents.push({ role, parts: [{ text: item.text }] });
  }

  const currentText = `Dashboard context (JSON):\n${context}\n\nUser message:\n${message}`;
  if (contents.at(-1)?.role === 'user') contents.at(-1).parts[0].text += `\n${currentText}`;
  else contents.push({ role: 'user', parts: [{ text: currentText }] });

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents,
        generationConfig: { maxOutputTokens: 1_400, temperature: 0.5 },
      }),
      signal,
    },
  );

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return { configured: true, ok: false, status: response.status, provider: 'gemini', model };
  }

  const reply = extractGeminiText(payload);
  return reply
    ? { configured: true, ok: true, reply, provider: 'gemini', model }
    : { configured: true, ok: false, status: 502, provider: 'gemini', model };
}

async function callOpenAI({ message, context, history, signal }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { configured: false };

  const model = process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;
  const input = history.map((item) => ({ role: item.role, content: item.text }));
  input.push({
    role: 'user',
    content: `Dashboard context (JSON):\n${context}\n\nUser message:\n${message}`,
  });

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      instructions: SYSTEM_PROMPT,
      input,
      max_output_tokens: 1_400,
    }),
    signal,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return { configured: true, ok: false, status: response.status, provider: 'openai', model };
  }

  const reply = extractOpenAIText(payload);
  return reply
    ? { configured: true, ok: true, reply, provider: 'openai', model }
    : { configured: true, ok: false, status: 502, provider: 'openai', model };
}

function providerOrder(requestedProvider) {
  const configured = String(process.env.AI_PROVIDER || 'auto').toLowerCase();
  const selected = requestedProvider || configured;
  if (selected === 'gemini') return ['gemini'];
  if (selected === 'openai') return ['openai'];
  return ['gemini', 'openai'];
}

export async function handleAiRequest(req, res, { forcedProvider = '' } = {}) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Allow', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return json(res, 405, { error: 'method_not_allowed' });
  if (requestSize(req.body) > MAX_BODY_BYTES) return json(res, 413, { error: 'request_too_large' });
  if (isRateLimited(req)) return json(res, 429, { error: 'rate_limit_exceeded' });

  const body = parseBody(req.body);
  if (!body) return json(res, 400, { error: 'invalid_json' });

  const message = typeof body.message === 'string' ? body.message.trim() : '';
  if (!message) return json(res, 400, { error: 'message_required' });
  if (message.length > MAX_MESSAGE_CHARS) return json(res, 413, { error: 'message_too_long' });

  const requestedProvider = String(forcedProvider || body.provider || '').toLowerCase();
  if (requestedProvider && !['auto', 'gemini', 'openai'].includes(requestedProvider)) {
    return json(res, 400, { error: 'invalid_provider' });
  }

  const timeoutMs = Math.min(Math.max(Number(process.env.AI_TIMEOUT_MS) || 25_000, 1_000), 55_000);
  const request = {
    message,
    context: buildContext(body),
    history: normalizeHistory(body),
  };
  const failures = [];
  let configuredAttempts = 0;

  for (const provider of providerOrder(requestedProvider)) {
    try {
      const result = provider === 'openai'
        ? await callOpenAI({ ...request, signal: AbortSignal.timeout(timeoutMs) })
        : await callGemini({ ...request, signal: AbortSignal.timeout(timeoutMs) });

      if (!result.configured) continue;
      configuredAttempts += 1;
      if (result.ok) {
        return json(res, 200, {
          reply: result.reply,
          provider: result.provider,
          model: result.model,
        });
      }
      failures.push({ provider: result.provider, status: result.status });
    } catch (error) {
      failures.push({
        provider,
        status: error && error.name === 'TimeoutError' ? 504 : 502,
      });
    }
  }

  if (configuredAttempts === 0) {
    return json(res, 503, { error: 'ai_provider_not_configured' });
  }

  const status = failures.some((failure) => failure.status === 429) ? 429 : 502;
  return json(res, status, { error: 'ai_provider_unavailable' });
}

export default function handler(req, res) {
  return handleAiRequest(req, res);
}
