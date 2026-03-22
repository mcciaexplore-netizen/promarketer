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
            .from('spaces')
            .select('*, created_by(full_name)')
            .order('created_at')
        if (error) throw error
        console.log('[api/spaces] GET:', data?.length, 'spaces')
        return NextResponse.json({ data })
    } catch (err) {
        console.error('[api/spaces] GET error:', err.message)
        return NextResponse.json({ data: null, error: err.message }, { status: 500 })
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const supabase = getServiceClient()
        const { data, error } = await supabase
            .from('spaces')
            .insert(body)
            .select()
            .single()
        if (error) throw error
        console.log('[api/spaces] POST created:', data?.id)
        return NextResponse.json({ data })
    } catch (err) {
        console.error('[api/spaces] POST error:', err.message)
        return NextResponse.json({ data: null, error: err.message }, { status: 500 })
    }
}
