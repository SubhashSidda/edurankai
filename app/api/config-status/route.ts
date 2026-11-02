import { isSupabaseConfigured } from '../../../lib/supabase/server.ts';

/**
 * Next.js Route Handler: /api/config-status
 * 
 * Verifies Supabase environment configuration status without exposing credentials
 */

export async function GET() {
  const configured = isSupabaseConfigured();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return Response.json({
    success: true,
    data: {
      isConfigured: configured,
      supabaseUrl: configured ? supabaseUrl.replace(/^(https:\/\/[^.]+).*/, '$1.supabase.co') : null,
      hasServiceRoleKey: hasServiceKey,
      message: configured
        ? 'Connected to Supabase PostgreSQL'
        : 'Supabase credentials not yet provided in .env',
    },
  });
}
