import { NextResponse } from 'next/server'
import {
    createCalendarEvent,
    deleteCalendarEvent,
    refreshTokenIfNeeded,
    updateCalendarEvent
} from '@/lib/googleCalendar'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

export async function POST(request) {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { postId } = await request.json()
        if (!postId) {
            return NextResponse.json({ success: false, error: 'Missing postId' }, { status: 400 })
        }

        const [{ data: post }, { data: tokens }, { data: businessProfile }] = await Promise.all([
            supabase.from('scheduled_posts').select('*').eq('id', postId).single(),
            supabase.from('google_tokens').select('*').eq('user_id', user.id).maybeSingle(),
            supabase.from('business_profile').select('google_calendar_auto_sync').single()
        ])

        if (!post) {
            return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 })
        }

        if (!tokens?.access_token) {
            return NextResponse.json({ success: false, error: 'Google Calendar not connected' }, { status: 400 })
        }

        if (businessProfile && businessProfile.google_calendar_auto_sync === false && !request.headers.get('x-force-sync')) {
            return NextResponse.json({ success: false, error: 'Auto-sync disabled' }, { status: 409 })
        }

        const freshTokens = await refreshTokenIfNeeded(user.id, tokens, supabase)
        const eventId = post.google_event_id
            ? await updateCalendarEvent(freshTokens, post.google_event_id, post)
            : await createCalendarEvent(freshTokens, post)

        await supabase
            .from('scheduled_posts')
            .update({ google_event_id: eventId })
            .eq('id', postId)

        return NextResponse.json({ success: true, eventId })
    } catch (error) {
        const status = error.message === 'Unauthorized' ? 401 : 500
        return NextResponse.json({ success: false, error: error.message }, { status })
    }
}

export async function DELETE(request) {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const url = new URL(request.url)
        const postId = url.searchParams.get('postId')
        if (!postId) {
            return NextResponse.json({ success: false, error: 'Missing postId' }, { status: 400 })
        }

        const [{ data: post }, { data: tokens }] = await Promise.all([
            supabase.from('scheduled_posts').select('id, google_event_id').eq('id', postId).single(),
            supabase.from('google_tokens').select('*').eq('user_id', user.id).maybeSingle()
        ])

        if (post?.google_event_id && tokens?.access_token) {
            const freshTokens = await refreshTokenIfNeeded(user.id, tokens, supabase)
            await deleteCalendarEvent(freshTokens, post.google_event_id)
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
