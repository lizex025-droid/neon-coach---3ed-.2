import { createClient } from '@supabase/supabase-js';
import { isPublicSupabaseKey } from '../utils/publicEnv.js';
const env = import.meta.env || (typeof process !== 'undefined' ? process.env : {});
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;
// Capture SDK storage before any legacy tool receives account-scoped storage.
let sessionStorage;
try { sessionStorage = globalThis.localStorage; } catch {}
export const supabase = url && isPublicSupabaseKey(key) ? createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storage: sessionStorage },
}) : null;
export function isSupabaseConfigured() { return !!supabase; }
