import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import { AgentRepository } from './repository.js';
import { AgentError, commandSchema, limits, publicError, trace } from './contracts.js';
import { runCommand } from './runtime.js';
let pool;
export function requireLocalConfig(env = process.env) {
  for (const key of ['NEON_DATABASE_URL', 'SUPABASE_URL', 'SUPABASE_ANON_KEY']) if (!env[key]) throw new AgentError('LOCAL_CONFIG_REQUIRED', key, 'configuration', 503);
  for (const key of ['NEON_DATABASE_URL', 'SUPABASE_URL']) {
    let url; try { url = new URL(env[key]); } catch { throw new AgentError('INVALID_LOCAL_CONFIG', key, 'configuration', 503); }
    if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) throw new AgentError('LOCAL_ONLY', `${key} must point to loopback for this local task.`, 'configuration', 503);
  }
}
export function getPool() {
  requireLocalConfig();
  pool ||= new pg.Pool({ connectionString: process.env.NEON_DATABASE_URL, max: 6, connectionTimeoutMillis: 3000, statement_timeout: 8000,
    types: { getTypeParser: (oid, format) => oid === 1082 ? value => value : pg.types.getTypeParser(oid, format) } });
  return pool;
}
export async function verifyToken(header) {
  if (!/^Bearer [^\s]+$/i.test(header || '')) throw new AgentError('AUTH_REQUIRED', 'يرجى تسجيل الدخول قبل إرسال الطلب.', 'authenticate', 401);
  requireLocalConfig();
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: (url, opts) => fetch(url, { ...opts, signal: AbortSignal.timeout(5000) }) } });
  const { data, error } = await supabase.auth.getUser(header.slice(7));
  if (error || !data.user) throw new AgentError('AUTH_REQUIRED', 'انتهت الجلسة. سجّل الدخول مجدداً.', 'authenticate', 401);
  return data.user.id;
}
export async function localHandler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ status: 'error', error: { code: 'METHOD_NOT_ALLOWED' } });
  let command;
  try {
    command = commandSchema.parse(typeof req.body === 'string' ? JSON.parse(req.body) : req.body);
    trace(command, 'backendReached');
    const userId = await verifyToken(req.headers.authorization); // Before any checkpoint or request-ledger read.
    const client = await getPool().connect();
    let locked = false;
    try {
      // Serialize this user's requests across tabs/workers; fail promptly instead of unbounded queuing.
      locked = (await client.query('SELECT pg_try_advisory_lock(hashtextextended($1,0)) AS locked', [userId])).rows[0].locked;
      if (!locked) throw new AgentError('REQUEST_BUSY', 'طلبك السابق قيد التنفيذ. أعد المحاولة بنفس الطلب.', 'executeTools', 409);
      const repo = new AgentRepository(client, userId);
      await repo.transaction(async () => {
        const rate = await repo.one("SELECT count(*)::int AS count FROM public.neon_rate_events WHERE user_id=$1 AND created_at>now()-interval '1 minute'", [userId]);
        if (rate.count >= 12) throw new AgentError('RATE_LIMITED', 'انتظر دقيقة ثم أعد المحاولة.', 'authenticate', 429);
        await client.query('INSERT INTO public.neon_rate_events(user_id) VALUES ($1)', [userId]);
        await client.query("DELETE FROM public.neon_rate_events WHERE user_id=$1 AND created_at<now()-interval '1 hour'", [userId]);
        await repo.thread(command.threadId);
      });
      const checkpointer = new PostgresSaver(getPool(), undefined, { schema: 'neon_checkpoints' });
      const result = await runCommand(command, { repo, authenticate: async () => userId, checkpointer, signal: AbortSignal.timeout(limits.durationMs) });
      return res.status(result.status === 'error' ? 422 : 200).json(result);
    } finally {
      if (locked) await client.query('SELECT pg_advisory_unlock(hashtextextended($1,0))', [userId]);
      client.release();
    }
  } catch (err) {
    const error = err?.name === 'ZodError' ? { code: 'INVALID_REQUEST', stage: 'validation', message: 'الطلب غير صالح أو أطول من المسموح.' } : publicError(err);
    return res.status(err.httpStatus || 400).json({ requestId: command?.requestId, threadId: command?.threadId, status: 'error', reply: error.message, actions: [], results: [], cards: [], changedResources: [], clarification: null, error });
  }
}
