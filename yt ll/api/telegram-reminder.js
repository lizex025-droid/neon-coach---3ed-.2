const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '7938575887:AAHdajmPQMC5QFnaWnFMFyERQUKHH3XiXYU';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '7706605238';

export default async function handler(req, res) {
  if (req.method && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const text = req.body && req.body.text;
  if (!text || typeof text !== 'string') {
    res.status(400).json({ error: 'Missing text' });
    return;
  }

  try {
    const tgRes = await fetch('https://api.telegram.org/bot' + TELEGRAM_BOT_TOKEN + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true
      })
    });
    const data = await tgRes.json().catch(function () { return {}; });
    if (!tgRes.ok || data.ok === false) {
      res.status(502).json({ error: data.description || 'Telegram send failed' });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e && e.message ? e.message : String(e) });
  }
}
