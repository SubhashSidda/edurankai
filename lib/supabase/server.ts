import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-Side Supabase Client
 * 
 * CRITICAL SECURITY ARCHITECTURE:
 * - This file runs EXCLUSIVELY on the server (inside Next.js Route Handlers or Express server).
 * - It uses SUPABASE_SERVICE_ROLE_KEY to bypass client Row Level Security (RLS) for administrative operations.
 * - This secret key is NEVER passed to the browser or bundled in client-side code.
 */

let serverClientInstance: SupabaseClient | null = null;

export function getSupabaseServerClient(): SupabaseClient {
  if (serverClientInstance) {
    return serverClientInstance;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  // Prefer the administrative service role key on the server; fall back to anon key if not set
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id')) {
    console.warn(
      '[Supabase Server] Missing or placeholder Supabase credentials in environment.\n' +
      'Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env file.'
    );
  }

  serverClientInstance = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  return serverClientInstance;
}

/**
 * Helper to check if valid Supabase credentials have been configured
 */
export function isSupabaseConfigured(): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      process.env.SUPABASE_ANON_KEY;

  return Boolean(
    supabaseUrl && 
    supabaseKey && 
    !supabaseUrl.includes('your-project-id') &&
    !supabaseKey.includes('your-')
  );
}
