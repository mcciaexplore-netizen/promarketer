import { NextResponse } from 'next/server'
import { getSupabaseRoute } from '@/lib/supabaseRoute'
import { GoogleSheetsService } from '@/lib/sheetsService'

const SHEETS_HEADERS = [
    'id',
    'name',
    'business_type',
    'goal',
    'budget_range',
    'platforms',
    'tone',
    'key_dates',
    'calendar_data',
    'storage_provider',
    'created_by',
    'created_at'
]

const buildSheetsRow = (campaign, providerLabel) => ([
    campaign.id,
    campaign.name || '',
    campaign.business_type || '',
    campaign.goal || '',
    campaign.budget_range || '',
    (campaign.platforms || []).join(', '),
    campaign.tone || '',
    campaign.key_dates || '',
    JSON.stringify(campaign.calendar_data || []),
    providerLabel,
    campaign.created_by || '',
    campaign.created_at || new Date().toISOString()
])

const ensureCampaignSheet = async (service) => {
    await service.ensureSheetExists('Campaigns')
    const rows = await service.getRows('Campaigns').catch(() => [])
    if (rows.length > 0) return
    await service.appendRow('Campaigns!A1', SHEETS_HEADERS)
}

export async function POST(request) {
    try {
        const supabase = getSupabaseRoute()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const {
            name,
            business_type,
            goal,
            budget_range,
            tone,
            key_dates,
            platforms,
            calendar_data,
            provider
        } = body

        const providerToUse = provider || 'supabase'
        const campaignPayload = {
            name,
            business_type,
            goal,
            budget_range,
            tone,
            key_dates,
            platforms,
            calendar_data,
            created_by: user.id
        }

        let supabaseCampaign = null
        let sheetsSaved = false

        if (providerToUse === 'supabase' || providerToUse === 'both') {
            const { data, error } = await supabase
                .from('campaigns')
                .insert(campaignPayload)
                .select()
                .single()

            if (error) throw error
            supabaseCampaign = data
        }

        if (providerToUse === 'sheets' || providerToUse === 'both') {
            const sheetsConfigured = Boolean(
                process.env.GOOGLE_SHEETS_ID &&
                process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL &&
                process.env.GOOGLE_PRIVATE_KEY
            )

            if (!sheetsConfigured) {
                throw new Error('Google Sheets is not configured on the server')
            }

            const sheetsService = new GoogleSheetsService()
            await ensureCampaignSheet(sheetsService)

            const syntheticCampaign = supabaseCampaign || {
                id: crypto.randomUUID(),
                ...campaignPayload,
                created_at: new Date().toISOString()
            }

            await sheetsService.appendRow('Campaigns', buildSheetsRow(syntheticCampaign, providerToUse))
            sheetsSaved = true
        }

        return NextResponse.json({
            success: true,
            data: {
                campaign: supabaseCampaign,
                sheetsSaved,
                provider: providerToUse
            }
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
