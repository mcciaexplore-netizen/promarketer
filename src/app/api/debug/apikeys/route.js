import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

export async function GET() {
    const result = {
        auth: null,
        profile: null,
        keys: null,
        error: null
    }

    try {
        const supabase = getSupabaseRoute()
        const { data: { user }, error: authError } = await supabase.auth.getUser()

        if (authError) {
            result.auth = { error: authError.message }
        } else {
            result.auth = { uid: user?.id || null, authenticated: Boolean(user) }
        }

        if (user) {
            const { data: profiles, error: profileError } = await supabase
                .from('business_profile')
                .select('id, business_name, active_ai_provider, gemini_api_key, openai_api_key, grok_api_key, updated_at')
                .order('updated_at', { ascending: false })
                .limit(5)

            if (profileError) {
                result.profile = { error: profileError.message }
            } else {
                result.profile = profiles?.map((p) => ({
                    id: p.id,
                    business_name: p.business_name,
                    active_ai_provider: p.active_ai_provider,
                    has_gemini_key: Boolean(p.gemini_api_key?.trim()),
                    has_openai_key: Boolean(p.openai_api_key?.trim()),
                    has_grok_key: Boolean(p.grok_api_key?.trim()),
                    updated_at: p.updated_at
                }))

                const best = profiles?.find((p) =>
                    p.gemini_api_key?.trim() || p.openai_api_key?.trim() || p.grok_api_key?.trim()
                ) || profiles?.[0]

                result.keys = {
                    source: 'business_profile',
                    activeProvider: best?.active_ai_provider || null,
                    hasGemini: Boolean(best?.gemini_api_key?.trim()),
                    hasOpenAI: Boolean(best?.openai_api_key?.trim()),
                    hasGrok: Boolean(best?.grok_api_key?.trim())
                }
            }
        } else {
            result.keys = {
                source: 'env',
                hasGemini: Boolean(process.env.GEMINI_API_KEY),
                hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
                hasGrok: false
            }
        }
    } catch (err) {
        result.error = err.message

        if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
            try {
                const supabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL,
                    process.env.SUPABASE_SERVICE_ROLE_KEY
                )
                const { data: profiles, error } = await supabase
                    .from('business_profile')
                    .select('id, business_name, active_ai_provider, gemini_api_key, openai_api_key, grok_api_key')
                    .limit(5)

                result.serviceRoleFallback = error
                    ? { error: error.message }
                    : profiles?.map((p) => ({
                        id: p.id,
                        active_ai_provider: p.active_ai_provider,
                        has_gemini_key: Boolean(p.gemini_api_key?.trim()),
                        has_openai_key: Boolean(p.openai_api_key?.trim()),
                        has_grok_key: Boolean(p.grok_api_key?.trim())
                    }))
            } catch (e) {
                result.serviceRoleFallbackError = e.message
            }
        }
    }

    return NextResponse.json(result)
}
