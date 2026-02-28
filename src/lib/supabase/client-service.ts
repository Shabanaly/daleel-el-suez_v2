import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service client for background/cached tasks that don't need user context.
 * This file avoids importing 'next/headers' to remain safe for unstable_cache.
 */
export function createServiceClient() {
    return createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
}
