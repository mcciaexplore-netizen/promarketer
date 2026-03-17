import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

const normalizeProvider = (provider) => {
    if (provider === 'openai') return 'openai'
    return 'gemini'
}

const pickBestBusinessProfile = (profiles = []) => {
    if (!Array.isArray(profiles) || !profiles.length) return null

    const withKeys = profiles.find((profile) =>
        Boolean(profile?.gemini_api_key?.trim() || profile?.openai_api_key?.trim())
    )

    return withKeys || profiles[0] || null
}

const getProfileFromClient = async (supabase) => {
    const { data: profiles, error } = await supabase
        .from('business_profile')
        .select('*')
        .order('updated_at', { ascending: false, nullsFirst: false })

    if (error) throw error
    return pickBestBusinessProfile(profiles)
}

const getAiStatus = async () => {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const profile = await getProfileFromClient(supabase)
            return {
                hasGemini: Boolean(profile?.gemini_api_key?.trim()),
                hasOpenAI: Boolean(profile?.openai_api_key?.trim()),
                activeProvider: normalizeProvider(profile?.active_ai_provider),
                source: 'business_profile',
            }
        }
    } catch (error) {
        console.error('[api/settings/ai-status] route client lookup failed:', error.message)
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return {
            hasGemini: Boolean(process.env.GEMINI_API_KEY),
            hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
            activeProvider: normalizeProvider(process.env.ACTIVE_AI_PROVIDER),
            source: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'env' : 'none',
        }
    }

    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        )

        const profile = await getProfileFromClient(supabase)
        return {
            hasGemini: Boolean(profile?.gemini_api_key?.trim() || process.env.GEMINI_API_KEY),
            hasOpenAI: Boolean(profile?.openai_api_key?.trim() || process.env.OPENAI_API_KEY),
            activeProvider: normalizeProvider(profile?.active_ai_provider || process.env.ACTIVE_AI_PROVIDER),
            source: profile?.gemini_api_key?.trim() || profile?.openai_api_key?.trim() ? 'business_profile' : (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'env' : 'none'),
        }
    } catch (error) {
        console.error('[api/settings/ai-status] service lookup failed:', error.message)
        return {
            hasGemini: Boolean(process.env.GEMINI_API_KEY),
            hasOpenAI: Boolean(process.env.OPENAI_API_KEY),
            activeProvider: normalizeProvider(process.env.ACTIVE_AI_PROVIDER),
            source: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY ? 'env' : 'none',
        }
    }
}

export async function GET() {
    try {
        const status = await getAiStatus()
        return NextResponse.json({
            success: true,
            data: {
                ...status,
                configured: status.hasGemini || status.hasOpenAI
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
