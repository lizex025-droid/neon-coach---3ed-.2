export const PUBLIC_ENV_NAMES = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY'];
export function isPublicSupabaseKey(value) {
  if (typeof value !== 'string') return false;
  if (/^sb_publishable_[A-Za-z0-9_-]+$/.test(value)) return true;
  try {
    const parts = value.split('.');
    if (parts.length !== 3) return false;
    return JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))).role === 'anon';
  } catch { return false; }
}
export function validatePublicEnvironment(env) {
  for (const [name, value] of Object.entries(env)) {
    if (!value || !/^(VITE_|NEXT_PUBLIC_)/.test(name)) continue;
    if (!PUBLIC_ENV_NAMES.includes(name)) throw new Error(`Unapproved browser environment variable: ${name}. Keep credentials on the server.`);
    // Never include a credential value in an error message or build output.
    if (name !== 'VITE_SUPABASE_URL' && !isPublicSupabaseKey(value)) throw new Error(`${name} must contain a Supabase publishable or anon key, never a privileged key.`);
  }
}
