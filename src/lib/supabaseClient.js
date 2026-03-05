"use client"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

let _supabase = null

export function getSupabaseClient() {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        return null
    }
    if (!_supabase) {
        _supabase = createClientComponentClient()
    }
    return _supabase
}

// Backwards-compatible proxy so existing `supabase.auth.*` call sites still work
export const supabase = new Proxy({}, {
    get(_, prop) {
        const client = getSupabaseClient()
        if (!client) return undefined
        const val = client[prop]
        return typeof val === 'function' ? val.bind(client) : val
    }
})
