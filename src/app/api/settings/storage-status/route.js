import { NextResponse } from 'next/server'
import { getSupabaseRoute } from '@/lib/supabaseRoute'

export async function GET() {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { data: profile } = await supabase
            .from('business_profile')
            .select('campaign_storage_provider')
            .single()

        const sheetsConfigured = Boolean(
            process.env.GOOGLE_SHEETS_ID &&
            process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
            process.env.GOOGLE_PRIVATE_KEY
        )

        return NextResponse.json({
            success: true,
            data: {
                supabaseConnected: true,
                sheetsConfigured,
                campaignStorageProvider: profile?.campaign_storage_provider || 'supabase'
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
