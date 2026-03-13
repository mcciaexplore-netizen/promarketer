import { NextResponse } from 'next/server'

const sampleByPlatform = {
    Instagram: 'A behind-the-scenes moment that makes your brand feel human and worth following.',
    LinkedIn: 'A credibility-building post that shares a practical lesson your team learned this week.',
    Facebook: 'A community-first update with a clear story and a friendly call to comment.',
    Twitter: 'A sharp one-liner with a useful takeaway and a conversation-starting question.',
    WhatsApp: 'A concise update with a strong hook, key detail, and a direct CTA.'
}

export async function POST(request) {
    try {
        const { platform = 'Instagram', topic = '' } = await request.json()
        const baseTopic = topic.trim() || 'your latest campaign'
        const seed = sampleByPlatform[platform] || sampleByPlatform.Instagram

        return NextResponse.json({
            success: true,
            caption: `${seed} Focus on ${baseTopic}, keep the tone clear, and end with a CTA that fits ${platform}.`
        })
    } catch (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
