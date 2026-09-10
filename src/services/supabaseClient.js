import { createClient } from '@supabase/supabase-js';

const getEnvVar = (key) => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      return import.meta.env[key];
    }
  } catch (e) {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {}
  return '';
};

const SUPABASE_URL = getEnvVar('VITE_SUPABASE_URL') || 'https://fqwjcacuxsumqpmdsfxc.supabase.co';
const SUPABASE_ANON_KEY = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxd2pjYWN1eHN1bXFwbWRzZnhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4OTU3NzcsImV4cCI6MjEwNDQ3MTc3N30.NoWpeyJ1k4Tf7Q2VlkjDqkoolLf0_oqMh0973AfhQvI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export function isSupabaseConfigured() {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
