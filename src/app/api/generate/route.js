import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sampleByPlatform = {
    Instagram: 'A behind-the-scenes moment that makes your brand feel human and worth following.',
    LinkedIn: 'A credibility-building post that shares a practical lesson your team learned this week.',
    Facebook: 'A community-first update with a clear story and a friendly call to comment.',
    Twitter: 'A sharp one-liner with a useful takeaway and a conversation-starting question.',
    WhatsApp: 'A concise update with a strong hook, key detail, and a direct CTA.'
}

const buildWhatsAppPrompt = ({ tone, campaignGoal, broadcastMode }) => {
    const toneInstructions = {
        Friendly: `Use warm, conversational language.
Use 1-2 relevant emojis. Feel like a friend texting.
Avoid corporate language.`,
        Professional: `Use clear, business-appropriate language.
Minimal emojis (max 1).
Concise and credible tone.
Sound like a trusted business partner.`,
        Urgent: `Create strong urgency without being pushy.
Use time-sensitive language (limited time, expires soon, last chance).
Use urgency emojis sparingly (for example: ⏰ 🔥).
Short punchy sentences.`
    }

    const broadcastNote = broadcastMode
        ? `This is for a broadcast list. Use personalization variables:
{CustomerName} for the recipient's name,
{ProductName} for the product/service name,
{OfferAmount} for discount or offer value.
Make it feel personal despite being a broadcast.`
        : `This is a direct 1-on-1 message.
Use {CustomerName} to personalize.
Make it feel like a genuine individual message.`

    return `You are an expert WhatsApp marketing copywriter for Indian businesses.

Campaign Goal: ${campaignGoal}

Tone: ${tone}
Tone Instructions: ${toneInstructions[tone] || toneInstructions.Friendly}

Message Type: ${broadcastNote}

Write ONE complete WhatsApp message that:
- Directly addresses the campaign goal above
- Is between 50-160 words
- Has a clear call-to-action at the end
- Uses {CustomerName} at least once for personalization
- Only uses {ProductName} and {OfferAmount} if they are relevant
- Feels authentic and NOT like a generic template
- Is written specifically for the campaign goal provided

IMPORTANT: Generate a unique message based on the campaign goal: "${campaignGoal}".
Do NOT return a generic template.

Return ONLY the WhatsApp message text.`
}

const callGemini = async (apiKey, prompt) => {
    const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash']
    let lastError = null

    for (const model of candidateModels) {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.85,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 300
                    },
                    safetySettings: [
                        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
                        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' }
                    ]
                })
            }
        )

        if (!response.ok) {
            const err = await response.json()
            lastError = `Gemini error (${model}): ${err.error?.message || response.statusText}`
            continue
        }

        const data = await response.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
            lastError = `Gemini error (${model}): empty response`
            continue
        }

        return text.trim()
    }

    throw new Error(lastError || 'Gemini failed for all candidate models')
}

const callOpenAI = async (apiKey, prompt) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert WhatsApp marketing copywriter for Indian businesses. You write concise, high-conversion WhatsApp messages.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.85,
            max_tokens: 300
        })
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(`OpenAI error: ${err.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('OpenAI returned empty response')
    return text.trim()
}

const getApiKeys = async () => {
    if (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY) {
        return {
            gemini: process.env.GEMINI_API_KEY || null,
            openai: process.env.OPENAI_API_KEY || null
        }
    }

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { gemini: null, openai: null }
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: profile, error } = await supabase
        .from('business_profile')
        .select('gemini_api_key, openai_api_key')
        .single()

    if (error) {
        console.error('[api/generate] failed to load business_profile keys:', error.message)
        return { gemini: null, openai: null }
    }

    return {
        gemini: profile?.gemini_api_key || null,
        openai: profile?.openai_api_key || null
    }
}

export async function POST(request) {
    try {
        const body = await request.json()
        const {
            type,
            tone = 'Friendly',
            campaignGoal = '',
            broadcastMode = false,
            platform = 'Instagram',
            topic = ''
        } = body

        console.log('[api/generate] incoming payload:', {
            type,
            tone,
            campaignGoal,
            broadcastMode,
            platform,
            topic
        })

        const { gemini, openai } = await getApiKeys()

        if (type === 'whatsapp') {
            if (!campaignGoal.trim()) {
                return NextResponse.json({ error: 'Campaign goal is required.' }, { status: 400 })
            }

            const prompt = buildWhatsAppPrompt({ tone, campaignGoal: campaignGoal.trim(), broadcastMode })
            console.log('[api/generate] whatsapp prompt:', prompt)

            if (gemini) {
                const message = await callGemini(gemini, prompt)
                return NextResponse.json({ message, provider: 'gemini' })
            }

            if (openai) {
                const message = await callOpenAI(openai, prompt)
                return NextResponse.json({ message, provider: 'openai' })
            }

            return NextResponse.json(
                { error: 'No API key configured. Please add Gemini or OpenAI key in Settings.' },
                { status: 400 }
            )
        }

        const baseTopic = topic.trim() || 'your latest campaign'
        const seed = sampleByPlatform[platform] || sampleByPlatform.Instagram

        return NextResponse.json({
            success: true,
            caption: `${seed} Focus on ${baseTopic}, keep the tone clear, and end with a CTA that fits ${platform}.`
        })
    } catch (error) {
        console.error('[api/generate] error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
