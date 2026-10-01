/**
 * NEON COACH - محول وسائط آمن (Protected Media Proxy)
 * يخفي نطاق التخزين الحقيقي بالكامل من متصفح المستخدم وقسم Network في DevTools
 * ويمنع الوصول المباشر أو الفتح في تبويبة جديدة
 */

import fs from 'node:fs';
import path from 'node:path';

// نطاق التخزين السري على السيرفر فقط - غير مكشوف للعميل إطلاقاً
const UPSTREAM_BUCKET = 'pub-17c54e21fe364e5e9b1b1923cf6896ec.r2.dev';

let _cachedMap = null;
function getMediaMap() {
  if (_cachedMap) return _cachedMap;
  try {
    const p = path.resolve(process.cwd(), 'src/data/recipeMediaMap.json');
    if (fs.existsSync(p)) {
      _cachedMap = JSON.parse(fs.readFileSync(p, 'utf8'));
      return _cachedMap;
    }
  } catch {}
  return {};
}

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Method Not Allowed');
    return;
  }

  // 1. حماية التبويبات المباشرة (Anti-Direct Navigation & Anti-Hotlinking)
  const dest = req.headers['sec-fetch-dest'];
  const mode = req.headers['sec-fetch-mode'];
  const isDirectTab = dest === 'document' || mode === 'navigate';

  if (isDirectTab) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(`<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="utf-8"><title>NEON COACH - ملف محمي</title></head>
<body style="margin:0; min-height:100vh; background:#020704; color:#55F7A5; display:flex; align-items:center; justify-content:center; font-family:system-ui, -apple-system, sans-serif; text-align:center; padding:20px;">
  <div style="max-width:420px; background:rgba(7,16,13,0.9); border:1px solid rgba(85,247,165,0.3); border-radius:20px; padding:32px 24px; box-shadow:0 0 30px rgba(85,247,165,0.15);">
    <div style="font-size:2.8rem; margin-bottom:12px;">🔒</div>
    <h2 style="margin:0 0 8px; color:#FFFFFF; font-size:1.3rem;">الوصول المباشر غير مسموح</h2>
    <p style="margin:0; color:#8C9992; font-size:0.9rem; line-height:1.5;">هذا الملف محمي ومخصص للعرض فقط داخل تطبيق <strong>NEON COACH</strong>، ولا يمكن فتحه مباشرة من شريط المتصفح.</p>
  </div>
</body>
</html>`);
    return;
  }

  // 2. استخراج المعرف أو الرمز
  const urlObj = new URL(req.url, 'http://localhost');
  const id = urlObj.searchParams.get('id') || urlObj.searchParams.get('r');
  const token = urlObj.searchParams.get('t');
  const recipeMap = getMediaMap();

  let targetFilename = '';
  if (id && recipeMap[id]) {
    targetFilename = recipeMap[id];
  } else if (token) {
    try {
      targetFilename = Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      targetFilename = '';
    }
  } else if (id && id.endsWith('.jpg')) {
    const values = Object.values(recipeMap);
    if (values.includes(id)) {
      targetFilename = id;
    }
  }

  if (!targetFilename) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Media not found');
    return;
  }

  try {
    const upstreamUrl = `https://${UPSTREAM_BUCKET}/${encodeURIComponent(targetFilename).replace(/%20/g, '+')}`;
    const upstreamResponse = await fetch(upstreamUrl);

    if (!upstreamResponse.ok) {
      res.statusCode = upstreamResponse.status;
      res.setHeader('Content-Type', 'text/plain');
      res.end('Upstream media error');
      return;
    }

    const contentType = upstreamResponse.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await upstreamResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.end(buffer);
  } catch {
    res.statusCode = 502;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Media proxy fetch failed');
  }
}
