import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vfdreolpfdztxhnedsmu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmZHJlb2xwZmR6dHhobmVkc211Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjkyMTUsImV4cCI6MjA5MDY0NTIxNX0.kX4OYHKi0SfVt_3diLvt04DQNVQFgKJi-_9zrQJT5wc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});
