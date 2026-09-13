import fs from 'node:fs/promises';
import { getPool, requireLocalConfig } from '../api/langgraph/localBackend.js';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
// Explicit setup command only. The request handler never migrates any database.
requireLocalConfig();
const pool = getPool();
try {
  const existing = await pool.query("SELECT to_regclass('public.profiles') AS table_name");
  if (!existing.rows[0].table_name) await pool.query(await fs.readFile('supabase/full_schema_migration.sql', 'utf8'));
  const migration = (await fs.readdir('supabase/migrations')).find(f => f.endsWith('_neon_agent_execution.sql'));
  if (!migration) throw new Error('NEON migration missing');
  await pool.query(await fs.readFile(`supabase/migrations/${migration}`, 'utf8'));
  await new PostgresSaver(pool, undefined, { schema: 'neon_checkpoints' }).setup();
  await pool.query('REVOKE ALL ON SCHEMA neon_checkpoints FROM PUBLIC, anon, authenticated');
  console.log('Local NEON schema and persistent checkpoints prepared.');
} finally { await pool.end(); }
