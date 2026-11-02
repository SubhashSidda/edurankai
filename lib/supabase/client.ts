import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Client-Side Supabase Client (Browser Safe)
 * 
 * Uses ONLY the public anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY).
 * The service role secret key is never used here.
 */

let browserClientInstance: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (browserClientInstance) {
    return browserClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  browserClientInstance = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseAnonKey || 'placeholder-key'
  );

  return browserClientInstance;
}
