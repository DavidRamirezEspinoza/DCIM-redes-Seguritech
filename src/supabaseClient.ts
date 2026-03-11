import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Si alguna llave falta, esto nos avisará en la consola (F12)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Error: Llaves de Supabase no detectadas. Revisa Vercel.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);