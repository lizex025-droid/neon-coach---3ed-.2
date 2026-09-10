import { createServer } from 'http';
import { readFileSync, existsSync, createReadStream, mkdirSync, writeFileSync } from 'fs';
import { extname, join, normalize, resolve } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const port = Number(process.env.PORT || 5500);
const remindersDir = join(root, 'data');
const remindersPath = join(remindersDir, 'task-reminders.json');
const telegramToken = process.env.TELEGRAM_BOT_TOKEN || '7938575887:AAHdajmPQMC5QFnaWnFMFyERQUKHH3XiXYU';
const telegramChatId = process.env.TELEGRAM_CHAT_ID || '7706605238';

loadEnv('.env.local');
loadEnv('.env');

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

function loadEnv(file) {
  const path = join(root, file);
  if (!existsSync(path)) return;
  const text = readFileSync(path, 'utf8');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)\s*$/);
    if (!match) continue;
    if (process.env[match[1]] == null) process.env[match[1]] = match[2];
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readReminders() {
  try {
    const parsed = JSON.parse(readFileSync(remindersPath, 'utf8'));
    return parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
  } catch {
    return { items: [] };
  }
}

function writeReminders(data) {
  mkdirSync(remindersDir, { recursive: true });
  writeFileSync(remindersPath, JSON.stringify(data, null, 2));
}

function escapeTelegramHtml(text) {
  return String(text).replace(/[&<>]/g, (ch) => ch === '&' ? '&amp;' : ch === '<' ? '&lt;' : '&gt;');
}

async function sendTelegram(text) {
  const tgRes = await fetch('https://api.telegram.org/bot' + telegramToken + '/sendMessage', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegramChatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const data = await tgRes.json().catch(() => ({}));
  if (!tgRes.ok || data.ok === false) throw new Error(data.description || 'Telegram send failed');
}

async function checkTaskReminders() {
  const data = readReminders();
  const now = Date.now();
  let changed = false;

  for (const item of data.items) {
    if (!item || item.done || !item.text || !item.reminderAt) continue;
    const dueMs = new Date(item.reminderAt).getTime();
    if (!Number.isFinite(dueMs) || now >= dueMs) continue;
    item.sentOffsets = item.sentOffsets && typeof item.sentOffsets === 'object' ? item.sentOffsets : {};

    for (const minutes of [5, 2]) {
      const key = String(minutes);
      if (item.sentOffsets[key]) continue;
      if (now < dueMs - minutes * 60 * 1000) continue;

      const text =
        '<b>تذكير قبل الموعد بـ ' + minutes + ' دقائق</b>\n\n' +
        'المهمة لسه ناقصة:\n' +
        escapeTelegramHtml(item.text) + '\n\n' +
        'الموعد: ' + escapeTelegramHtml(new Date(item.reminderAt).toLocaleString('ar-JO'));
      try {
        await sendTelegram(text);
        item.sentOffsets[key] = Date.now();
        changed = true;
      } catch (e) {
        console.error('Telegram reminder failed:', e && e.message ? e.message : e);
      }
    }
  }

  if (changed) writeReminders(data);
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
    const mod = await import(pathToFileURL(join(root, 'api', name + '.js')).href + '?t=' + Date.now());
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
    await mod.default(req, apiRes);
  } catch (e) {
    sendJson(res, 500, { error: e && e.message ? e.message : String(e) });
  }
}

function serveStatic(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = normalize(join(root, pathname));
  if (!file.startsWith(root) || !existsSync(file)) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }
  res.writeHead(200, { 'content-type': mimes[extname(file).toLowerCase()] || 'application/octet-stream' });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const apiMatch = url.pathname.match(/^\/api\/([A-Za-z0-9_-]+)$/);
  if (apiMatch) return runApi(req, res, apiMatch[1]);
  serveStatic(req, res);
}).listen(port, '127.0.0.1', () => {
  console.log('Dashboard dev server: http://127.0.0.1:' + port + '/');
  checkTaskReminders();
  setInterval(checkTaskReminders, 30 * 1000);
});
