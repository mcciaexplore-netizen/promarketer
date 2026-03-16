import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const getServiceClient = () =>
    createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

export async function GET() {
    try {
        const supabase = getServiceClient()
        const { data, error } = await supabase
            .from('business_profile')
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) throw error
        console.log('[api/profile] GET profile id:', data?.id || null)
        return NextResponse.json({ data })
    } catch (err) {
        console.error('[api/profile] GET error:', err.message)
        return NextResponse.json({ data: null, error: err.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const updates = await request.json()
        const supabase = getServiceClient()

        // Check if a row already exists
        const { data: existing } = await supabase
            .from('business_profile')
            .select('id')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        let data, error

        if (existing?.id) {
            console.log('[api/profile] POST updating id:', existing.id, 'keys:', Object.keys(updates))
            ;({ data, error } = await supabase
                .from('business_profile')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single())
        } else {
            console.log('[api/profile] POST inserting new row, keys:', Object.keys(updates))
            ;({ data, error } = await supabase
                .from('business_profile')
                .insert(updates)
                .select()
                .single())
        }

        if (error) throw error
        return NextResponse.json({ data })
    } catch (err) {
        console.error('[api/profile] POST error:', err.message)
        return NextResponse.json({ data: null, error: err.message }, { status: 500 })
    }
}
