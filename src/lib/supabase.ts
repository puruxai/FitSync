import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase credentials not found. FitSync is running in Offline/Demo mode using simulated LocalStorage db services. ' +
    'Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your env variables to connect to your live database.'
  );
}

// Initialize the client. If not configured, use placeholder credentials to avoid initialization errors.
export const supabase = createClient(
  supabaseUrl || 'https://your-project-placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
);
