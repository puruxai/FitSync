import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Automatically fall back to mock database during E2E tests for deterministic, offline-first execution
const isE2E = typeof navigator !== 'undefined' && (
  navigator.webdriver || 
  navigator.userAgent.includes('Headless') || 
  (typeof window !== 'undefined' && window.location.search.includes('mode=demo'))
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey) && !isE2E;

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
