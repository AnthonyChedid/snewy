import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Keep explicit for local DX
  console.warn('Supabase env vars are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env')
}

const safeUrl = supabaseUrl || 'http://127.0.0.1:54321'
const safeAnonKey = supabaseAnonKey || 'public-anon-key'

export const supabase = createClient(safeUrl, safeAnonKey)

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && supabaseAnonKey)
}
