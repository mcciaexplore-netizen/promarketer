import { NextResponse } from 'next/server'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

export async function POST() {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        await supabase.from('google_tokens').delete().eq('user_id', user.id)
        await supabase
            .from('scheduled_posts')
            .update({ google_event_id: null })
            .eq('created_by', user.id)

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
