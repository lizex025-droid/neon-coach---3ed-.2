import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { fileURLToPath } from 'url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dataDir = join(root, 'data');
const dataPath = join(dataDir, 'task-reminders.json');

function readData() {
  try {
    if (!existsSync(dataPath)) return { items: [] };
    const parsed = JSON.parse(readFileSync(dataPath, 'utf8'));
    return parsed && Array.isArray(parsed.items) ? parsed : { items: [] };
  } catch {
    return { items: [] };
  }
}

function writeData(data) {
  mkdirSync(dataDir, { recursive: true });
  writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

export default function handler(req, res) {
  if (req.method && req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = req.body || {};
  const action = body.action || 'upsert';
  const id = body.id;
  if (!id || typeof id !== 'string') {
    res.status(400).json({ error: 'Missing id' });
    return;
  }

  const data = readData();
  const idx = data.items.findIndex((item) => item && item.id === id);

  if (action === 'delete') {
    if (idx >= 0) data.items.splice(idx, 1);
    writeData(data);
    res.status(200).json({ ok: true });
    return;
  }

  if (action === 'complete') {
    if (idx >= 0) data.items[idx].done = !!body.done;
    writeData(data);
    res.status(200).json({ ok: true });
    return;
  }

  const reminderAt = body.reminderAt;
  const text = body.text;
  if (!text || typeof text !== 'string' || !reminderAt || Number.isNaN(new Date(reminderAt).getTime())) {
    res.status(400).json({ error: 'Missing text or reminderAt' });
    return;
  }

  const next = {
    id,
    text,
    reminderAt,
    done: !!body.done,
    updatedAt: Date.now(),
    sentOffsets: idx >= 0 && data.items[idx].reminderAt === reminderAt ? (data.items[idx].sentOffsets || {}) : {},
  };

  if (idx >= 0) data.items[idx] = Object.assign({}, data.items[idx], next);
  else data.items.push(Object.assign({ createdAt: Date.now() }, next));

  writeData(data);
  res.status(200).json({ ok: true });
}
