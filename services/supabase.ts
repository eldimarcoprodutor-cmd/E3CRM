import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dveejqslotafmgdzbhtc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2ZWVqcXNsb3RhZm1nZHpiaHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMjEyMjEsImV4cCI6MjA3MDY5NzIyMX0.wn4aI_JDopkpOdiA60d2ligBz0m9tKv1WYj8i9zaEP0';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase URL and Anon Key must be provided.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);