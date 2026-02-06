
import { createClient } from '@supabase/supabase-js';

// Retrieve env vars safely
// Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are in .env.local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
