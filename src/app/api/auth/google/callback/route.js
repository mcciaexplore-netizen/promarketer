import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getOAuthClient } from '@/lib/googleCalendar'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

export async function GET(request) {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const error = url.searchParams.get('error')
    const redirectBase = process.env.NEXT_PUBLIC_APP_URL || url.origin

    if (error) {
        return NextResponse.redirect(new URL(`/scheduler?google_error=${encodeURIComponent(error)}`, redirectBase))
    }

    if (!code) {
        return NextResponse.redirect(new URL('/scheduler?google_error=missing_code', redirectBase))
    }

    const supabase = getSupabaseRoute()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.redirect(new URL('/login', redirectBase))
    }

    try {
        const oauth2Client = getOAuthClient()
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        const { data: existingTokens } = await supabase
            .from('google_tokens')
            .select('refresh_token')
            .eq('user_id', user.id)
            .maybeSingle()

        const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
        const { data: googleProfile } = await oauth2.userinfo.get()

        await supabase
            .from('google_tokens')
            .upsert({
                user_id: user.id,
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token || existingTokens?.refresh_token || null,
                expiry_date: tokens.expiry_date,
                email: googleProfile.email
            }, { onConflict: 'user_id' })

        return NextResponse.redirect(new URL('/scheduler?connected=true', redirectBase))
    } catch (callbackError) {
        return NextResponse.redirect(
            new URL(`/scheduler?google_error=${encodeURIComponent(callbackError.message)}`, redirectBase)
        )
    }
}
