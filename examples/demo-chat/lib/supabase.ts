import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Browser client — anon key, SELECT only (RLS enforced)
export function createBrowserClient(): SupabaseClient {
    return createClient(supabaseUrl, supabaseAnonKey);
}

// Server client — service_role key, bypasses RLS for INSERT/UPDATE
export function createServerClient(): SupabaseClient {
    return createClient(supabaseUrl, supabaseServiceKey);
}

// Singleton server client for API routes
let serverInstance: SupabaseClient | null = null;
export function getServerClient(): SupabaseClient {
    if (!serverInstance) {
        serverInstance = createServerClient();
    }
    return serverInstance;
}
