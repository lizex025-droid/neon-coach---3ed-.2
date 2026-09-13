import { PGlite } from '@electric-sql/pglite';
import { PostgresSaver } from '@langchain/langgraph-checkpoint-postgres';
import fs from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { AgentRepository } from '../../api/langgraph/repository.js';

export async function testDatabase() {
  // Dedicated ephemeral database; no URLs, credentials or customer records.
  const db = new PGlite();
  await db.exec(`CREATE ROLE anon; CREATE ROLE authenticated; CREATE SCHEMA auth;
    CREATE TABLE auth.users(id uuid PRIMARY KEY,email text,raw_user_meta_data jsonb DEFAULT '{}');
    CREATE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$ SELECT nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    GRANT USAGE ON SCHEMA auth TO authenticated; GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated;`);
  await db.exec(await fs.readFile('supabase/schema.sql', 'utf8'));
  const migration = (await fs.readdir('supabase/migrations')).find(f => f.endsWith('_neon_agent_execution.sql'));
  await db.exec(await fs.readFile(`supabase/migrations/${migration}`, 'utf8'));
  const alice = randomUUID(), bob = randomUUID();
  for (const id of [alice, bob]) await db.query('INSERT INTO auth.users(id,email) VALUES ($1,$2)', [id, `synthetic-${id}@example.test`]);
  const pool = pglitePool(db);
  const client = await pool.connect();
  const saver = new PostgresSaver(pool, undefined, { schema: 'neon_checkpoints' });
  await saver.setup();
  return { db, client, pool, saver, alice, bob, repo: id => new AgentRepository(client, id), close: () => db.close() };
}
export function pglitePool(db) {
  const client = { query: async (sql, values) => {
    if (typeof sql === 'object') return db.query(sql.text, sql.values);
    return values?.length ? db.query(sql, values) : (sql.trim().split(';').filter(Boolean).length > 1 ? (await db.exec(sql)).at(-1) : db.query(sql));
  }, release() {} };
  return { ...client, connect: async () => client };
}
