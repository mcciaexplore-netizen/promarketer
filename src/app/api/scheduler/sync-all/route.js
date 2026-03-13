import { NextResponse } from 'next/server'
import { createCalendarEvent, refreshTokenIfNeeded, updateCalendarEvent } from '@/lib/googleCalendar'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

export async function POST() {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const [{ data: tokens }, { data: posts }] = await Promise.all([
            supabase.from('google_tokens').select('*').eq('user_id', user.id).maybeSingle(),
            supabase
                .from('scheduled_posts')
                .select('*')
                .eq('status', 'Scheduled')
                .order('scheduled_at', { ascending: true })
        ])

        if (!tokens?.access_token) {
            return NextResponse.json({ success: false, error: 'Google Calendar not connected' }, { status: 400 })
        }

        const freshTokens = await refreshTokenIfNeeded(user.id, tokens, supabase)
        const results = []

        for (const post of posts || []) {
            const eventId = post.google_event_id
                ? await updateCalendarEvent(freshTokens, post.google_event_id, post)
                : await createCalendarEvent(freshTokens, post)

            await supabase
                .from('scheduled_posts')
                .update({ google_event_id: eventId })
                .eq('id', post.id)

            results.push({ postId: post.id, eventId })
        }

        return NextResponse.json({ success: true, results })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
