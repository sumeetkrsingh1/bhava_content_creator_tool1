import { createClient } from '@supabase/supabase-js';

// Supabase configuration – values are taken from environment variables.
// Do NOT commit real secrets; they should be stored in a .env.local file (which is ignored by git).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
