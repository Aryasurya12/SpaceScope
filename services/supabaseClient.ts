import { createClient } from '@supabase/supabase-js';

// Project credentials provided by the user
const supabaseUrl = 'https://gwkidwmrlgvwerhpcdhx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3a2lkd21ybGd2d2VyaHBjZGh4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyNzAzNjMsImV4cCI6MjA4NTg0NjM2M30.GDu99yd1G2Z-hyC_HAyetg7Vqndo68j7hkUG0yJlBf0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
