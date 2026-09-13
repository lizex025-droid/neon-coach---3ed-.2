import { defineConfig, loadEnv } from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import os from 'node:os';
import { getCertificate } from '@vitejs/plugin-basic-ssl';

function getLocalNetworkIp() {
  try {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
      for (const net of nets[name]) {
        if (net.family === 'IPv4' && !net.internal) {
          return net.address;
        }
      }
    }
  } catch (_) {}
  return '192.168.8.202';
}

function retrieveKnowledge(question) {
  const file = path.resolve('C:/Users/User/Downloads/joker_ai_dataset/rag_chunks.jsonl');
  if (!fs.existsSync(file)) return '';
  const terms = question.toLowerCase().split(/\s+/).filter(term => term.length > 2);
  const chunks = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(line => JSON.parse(line));
  return chunks
    .map(chunk => ({ chunk, score: terms.reduce((sum, term) => sum + (chunk.text.toLowerCase().includes(term) ? 1 : 0), 0) }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map(item => `[${item.chunk.category} - ص${item.chunk.page}]\n${item.chunk.text}`)
    .join('\n\n')
    .slice(0, 12000);
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['AI_PROVIDER','AI_TIMEOUT_MS','AI_RATE_LIMIT_PER_MINUTE','GEMINI_API_KEY','GEMINI_MODEL','OPENAI_API_KEY','OPENAI_MODEL','SUPABASE_URL','SUPABASE_ANON_KEY','NEON_DATABASE_URL','NEON_TRACE']) if (env[key]) process.env[key] = env[key];
  if (env.VITE_GEMINI_API_KEY || env.VITE_OPENAI_API_KEY) throw new Error('AI provider keys must be backend-only; remove VITE_ provider keys.');

  return {
  root: './',
  base: './',
  plugins: [
    {
      name: 'neon-api-middleware',
      async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = req.url ? req.url.split('?')[0] : '';
        if (parsedUrl !== '/api/ai' && parsedUrl !== '/api/ai/') return next();

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'method_not_allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) {
          body += chunk;
          if (Buffer.byteLength(body) > 65536) {
            res.statusCode = 413;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'request_too_large' }));
            return;
          }
        }

        req.body = body;
        const apiRes = {
          statusCode: 200,
          setHeader(k, v) { res.setHeader(k, v); },
          status(code) { this.statusCode = code; return this; },
          json(data) {
            res.statusCode = this.statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          },
          end(data) {
            res.statusCode = this.statusCode;
            res.end(data);
          }
        };

        try {
          const { default: handler } = await import('./api/ai.js');
          await handler(req, apiRes);
        } catch (error) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'backend_request_failed' }));
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = req.url ? req.url.split('?')[0] : '';
        if (parsedUrl !== '/api/action-agent' && parsedUrl !== '/api/action-agent/') {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 32768) { res.statusCode = 413; res.end(JSON.stringify({ status: 'error', reply: 'Request too large' })); return; } }
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch (_) {
          req.body = {};
        }

        const apiRes = {
          statusCode: 200,
          setHeader(k, v) { res.setHeader(k, v); },
          status(code) { this.statusCode = code; return this; },
          json(data) {
            res.statusCode = this.statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };

        try {
          const { default: handler } = await import('./api/action-agent.js');
          await handler(req, apiRes);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'error', reply: 'Backend request failed' }));
        }
      });

      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = req.url ? req.url.split('?')[0] : '';
        if (parsedUrl !== '/api/gemini' && parsedUrl !== '/api/gemini/') {
          return next();
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        let body = '';
        for await (const chunk of req) { body += chunk; if (Buffer.byteLength(body) > 32768) { res.statusCode = 413; res.end(JSON.stringify({ status: 'error', reply: 'Request too large' })); return; } }
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch (_) {
          req.body = {};
        }

        const apiRes = {
          statusCode: 200,
          setHeader(k, v) { res.setHeader(k, v); },
          status(code) { this.statusCode = code; return this; },
          json(data) {
            res.statusCode = this.statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          }
        };

        try {
          const mod = await import('./api/gemini.js');
          const handler = mod.default || mod;
          await handler(req, apiRes);
        } catch (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ status: 'error', reply: 'Backend request failed' }));
        }
      });

      // تشغيل خادم HTTPS متزامن على المنفذ 3443 خصيصاً لهواتف iPhone ومتصفح Safari
      // Safari على iOS يتطلب اتصال HTTPS (Secure Context) لإظهار نافذة إذن الميكروفون
      try {
        const certPem = await getCertificate('node_modules/.vite/basic-ssl');
        const httpsServer = https.createServer({ cert: certPem, key: certPem }, server.middlewares);
        if (server.ws && typeof server.ws.bind === 'function') {
          server.ws.bind(httpsServer);
        }
        httpsServer.on('error', (err) => {
          if (err.code === 'EADDRINUSE') {
            console.log('  ⚠️  Port 3443 already in use, companion HTTPS server will reuse it.');
          } else {
            console.warn('  ⚠️  Companion HTTPS server error:', err.message);
          }
        });
        server.httpServer?.on('close', () => {
          try { httpsServer.close(); } catch (_) {}
        });
        const lanIp = getLocalNetworkIp();
        httpsServer.listen(3443, '127.0.0.1', () => {
          // This task binds only to loopback; do not advertise an unreachable LAN URL.
          console.log(`  \x1b[32m➜\x1b[0m  \x1b[1mLocal HTTPS:\x1b[0m                         \x1b[36mhttps://localhost:3443/\x1b[0m\n`);
        });
      } catch (sslErr) {
        console.warn('Companion HTTPS server skipped:', sslErr.message);
      }
    }
  }],
  server: {
    port: 3000,
    open: false,
    host: '127.0.0.1'
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  }
  };
});
