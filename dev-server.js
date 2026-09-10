const { createServer } = require('http');
const { createReadStream, existsSync } = require('fs');
const { extname, join, normalize, resolve } = require('path');

const root = __dirname;
const preferredPort = Number(process.env.PORT || 5600);

const mimes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

function sendJson(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString('utf8');
  if (!text) return {};
  try { return JSON.parse(text); } catch { return text; }
}

async function runApi(req, res, name) {
  try {
    const handler = require(join(root, 'api', name + '.js'));
    req.body = await readBody(req);
    const apiRes = {
      statusCode: 200,
      headers: {},
      setHeader(key, value) { this.headers[key.toLowerCase()] = value; },
      status(code) { this.statusCode = code; return this; },
      json(data) { sendJson(res, this.statusCode, data); return this; },
      send(data) {
        res.writeHead(this.statusCode, this.headers);
        res.end(data);
        return this;
      },
      end(data) {
        res.writeHead(this.statusCode, this.headers);
        res.end(data);
        return this;
      },
    };
    await handler(req, apiRes);
  } catch (e) {
    sendJson(res, 500, { error: e && e.message ? e.message : String(e) });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname === '/' ? '/public/pdfs.html' : url.pathname);
  const file = normalize(join(root, pathname));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': mimes[extname(file).toLowerCase()] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

const server = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const apiMatch = url.pathname.match(/^\/api\/([A-Za-z0-9_-]+)$/);
  if (apiMatch) return runApi(req, res, apiMatch[1]);
  serveStatic(req, res);
});

function listen(port) {
  server.listen(port, '127.0.0.1', () => {
    console.log('PDFs dev server: http://127.0.0.1:' + port + '/public/pdfs.html');
  });
}

server.on('error', (error) => {
  if (error && error.code === 'EADDRINUSE') {
    const nextPort = Number(server._startPort || preferredPort) + 1;
    server._startPort = nextPort;
    console.log('Port ' + (nextPort - 1) + ' is busy, trying ' + nextPort + '...');
    setTimeout(() => listen(nextPort), 100);
    return;
  }
  throw error;
});

server._startPort = preferredPort;
listen(preferredPort);
