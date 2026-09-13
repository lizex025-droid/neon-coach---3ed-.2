import test from 'node:test';
import assert from 'node:assert/strict';
import { handleAiRequest } from '../api/ai.js';

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    payload: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(payload) { this.payload = payload; return this; },
    end() { return this; },
  };
}

function mockRequest(body, id) {
  return {
    method: 'POST',
    body,
    headers: { 'x-forwarded-for': id },
    socket: {},
  };
}

function setEnv(values) {
  const previous = {};
  for (const [key, value] of Object.entries(values)) {
    previous[key] = process.env[key];
    if (value == null) delete process.env[key];
    else process.env[key] = value;
  }
  return () => {
    for (const [key, value] of Object.entries(previous)) {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
  };
}

test('AI proxy validates input before contacting a provider', async () => {
  const res = mockResponse();
  await handleAiRequest(mockRequest({}, 'validation-test'), res);
  assert.equal(res.statusCode, 400);
  assert.deepEqual(res.payload, { error: 'message_required' });
});

test('AI proxy reports an explicitly selected provider that is not configured', async () => {
  const restoreEnv = setEnv({ GEMINI_API_KEY: 'configured', OPENAI_API_KEY: null });
  try {
    const res = mockResponse();
    await handleAiRequest(mockRequest({ message: 'مرحبا', provider: 'openai' }, 'missing-provider-test'), res);
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.payload, { error: 'ai_provider_not_configured' });
  } finally {
    restoreEnv();
  }
});

test('AI proxy calls Gemini with a server-only key', async () => {
  const restoreEnv = setEnv({
    GEMINI_API_KEY: 'gemini-server-secret',
    GEMINI_MODEL: 'gemini-test-model',
    OPENAI_API_KEY: null,
  });
  const originalFetch = globalThis.fetch;
  let upstream;
  globalThis.fetch = async (url, options) => {
    upstream = { url: String(url), options };
    return new Response(JSON.stringify({
      candidates: [{ content: { parts: [{ text: 'رد Gemini' }] } }],
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  try {
    const res = mockResponse();
    await handleAiRequest(mockRequest({ message: 'مرحبا', provider: 'gemini' }, 'gemini-test'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.reply, 'رد Gemini');
    assert.equal(res.payload.provider, 'gemini');
    assert.match(upstream.url, /gemini-test-model:generateContent$/);
    assert.equal(upstream.options.headers['x-goog-api-key'], 'gemini-server-secret');
    assert.ok(!JSON.stringify(res.payload).includes('gemini-server-secret'));
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});

test('AI proxy calls the OpenAI Responses API with a server-only key', async () => {
  const restoreEnv = setEnv({
    GEMINI_API_KEY: null,
    OPENAI_API_KEY: 'openai-server-secret',
    OPENAI_MODEL: 'openai-test-model',
  });
  const originalFetch = globalThis.fetch;
  let upstream;
  globalThis.fetch = async (url, options) => {
    upstream = { url: String(url), options };
    return new Response(JSON.stringify({ output_text: 'رد OpenAI' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const res = mockResponse();
    await handleAiRequest(mockRequest({ message: 'مرحبا', provider: 'openai' }, 'openai-test'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.reply, 'رد OpenAI');
    assert.equal(res.payload.provider, 'openai');
    assert.equal(upstream.url, 'https://api.openai.com/v1/responses');
    assert.equal(upstream.options.headers.authorization, 'Bearer openai-server-secret');
    assert.equal(JSON.parse(upstream.options.body).model, 'openai-test-model');
    assert.ok(!JSON.stringify(res.payload).includes('openai-server-secret'));
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});

test('auto provider falls back from Gemini to OpenAI', async () => {
  const restoreEnv = setEnv({
    AI_PROVIDER: 'auto',
    GEMINI_API_KEY: 'gemini-secret',
    OPENAI_API_KEY: 'openai-secret',
  });
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url) => {
    calls.push(String(url));
    if (String(url).includes('generativelanguage.googleapis.com')) {
      return new Response(JSON.stringify({ error: { message: 'unavailable' } }), {
        status: 503,
        headers: { 'content-type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ output_text: 'الرد البديل' }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  };

  try {
    const res = mockResponse();
    await handleAiRequest(mockRequest({ message: 'اختبار', provider: 'auto' }, 'fallback-test'), res);
    assert.equal(res.statusCode, 200);
    assert.equal(res.payload.provider, 'openai');
    assert.equal(calls.length, 2);
  } finally {
    globalThis.fetch = originalFetch;
    restoreEnv();
  }
});
