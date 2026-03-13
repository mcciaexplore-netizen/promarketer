import { NextResponse } from 'next/server'
import { getOAuthClient } from '@/lib/googleCalendar'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

const SCOPES = ['https://www.googleapis.com/auth/calendar.events', 'https://www.googleapis.com/auth/userinfo.email']

export async function GET() {
    const supabase = getSupabaseRoute()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.redirect(new URL('/login', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'))
    }

    const oauth2Client = getOAuthClient()
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        prompt: 'consent',
        scope: SCOPES,
        state: user.id
    })

    return NextResponse.redirect(url)
}
