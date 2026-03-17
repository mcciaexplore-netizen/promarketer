import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const sampleByPlatform = {
    Instagram: 'A behind-the-scenes moment that makes your brand feel human and worth following.',
    LinkedIn: 'A credibility-building post that shares a practical lesson your team learned this week.',
    Facebook: 'A community-first update with a clear story and a friendly call to comment.',
    Twitter: 'A sharp one-liner with a useful takeaway and a conversation-starting question.',
    WhatsApp: 'A concise update with a strong hook, key detail, and a direct CTA.'
}

const STOP_WORDS = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'for', 'from', 'have', 'helping', 'in', 'into', 'is', 'it',
    'its', 'of', 'on', 'or', 'our', 'that', 'the', 'their', 'them', 'there', 'they', 'this', 'to', 'we',
    'were', 'with', 'your', 'you', 'new', 'day', 'days', 'business'
])

const extractCampaignAnchors = (campaignGoal) => {
    const normalized = campaignGoal.toLowerCase().replace(/[^a-z0-9\s']/g, ' ')
    const words = normalized
        .split(/\s+/)
        .map((word) => word.trim())
        .filter((word) => word.length >= 4 && !STOP_WORDS.has(word))

    return [...new Set(words)].slice(0, 8)
}

const normalizeMessage = (message) => message
    .replace(/^["'\s]+|["'\s]+$/g, '')
    .replace(/\r\n/g, '\n')
    .trim()

const safeParseJson = (value) => {
    try {
        return JSON.parse(value)
    } catch {
        return null
    }
}

const buildFallbackBrief = (campaignGoal, anchors) => ({
    coreOffer: campaignGoal,
    targetAudience: anchors.slice(0, 3).join(', ') || 'prospective customers',
    mainBenefit: 'clear business value and a practical next step',
    callToAction: 'Reply to this message to book a quick consultation',
    mustMention: anchors.slice(0, 5),
    objective: 'Generate a WhatsApp message grounded in the exact campaign goal'
})

const isGenericWhatsAppMessage = (message, anchors) => {
    const normalized = message.toLowerCase().trim()
    const startsGeneric = /^(dear|hello|hi|greetings)\s+\{customername\}/.test(normalized)
    const genericPhrases = [
        'hope you are having a productive week',
        'we are excited',
        'hope you are doing well',
        'trust you are doing well'
    ]
    const containsGenericPhrase = genericPhrases.some((phrase) => normalized.includes(phrase))
    const matchingAnchors = anchors.filter((anchor) => normalized.includes(anchor.toLowerCase()))
    return startsGeneric || containsGenericPhrase || matchingAnchors.length < Math.min(2, anchors.length)
}

const buildCampaignBriefPrompt = ({ campaignGoal, businessName, industry, city, anchors }) => {
    const brandContext = [
        businessName ? `Business/Brand Name: ${businessName}` : null,
        industry ? `Industry: ${industry}` : null,
        city ? `City/Market: ${city}` : null
    ].filter(Boolean).join('\n')

    return `You are extracting a marketing brief from a user's campaign goal for a WhatsApp marketing message.

${brandContext ? `${brandContext}\n` : ''}Campaign Goal:
${campaignGoal}

Likely campaign keywords:
${anchors.join(', ') || 'none provided'}

Return ONLY valid JSON with this exact shape:
{
  "coreOffer": "string",
  "targetAudience": "string",
  "mainBenefit": "string",
  "callToAction": "string",
  "mustMention": ["string", "string"],
  "objective": "string"
}

Rules:
- Be specific, not generic
- Use real names and organizations from the goal when present
- Keep each field concise
- "mustMention" should include the exact campaign-specific terms that should appear in the final WhatsApp message`
}

const buildWhatsAppPrompt = ({ tone, campaignGoal, broadcastMode, businessName, industry, city, brief }) => {
    const toneInstructions = {
        Friendly: `Use warm, conversational language.
Use 1-2 relevant emojis. Feel like a friend texting.
Avoid corporate language.`,
        Professional: `Use clear, business-appropriate language.
Minimal emojis (max 1).
Concise and credible tone.
Sound like a trusted business advisor, not a formal letter.`,
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

    const brandContext = [
        businessName ? `Business/Brand Name: ${businessName}` : null,
        industry ? `Industry: ${industry}` : null,
        city ? `City/Market: ${city}` : null
    ].filter(Boolean).join('\n')

    return `You are an expert WhatsApp marketing copywriter for Indian businesses.
You write messages that sound human, specific, and high-conversion.
You NEVER write like a generic email template.

${brandContext ? `${brandContext}\n` : ''}Campaign Goal: ${campaignGoal}

Extracted Brief:
- Objective: ${brief.objective}
- Core Offer: ${brief.coreOffer}
- Target Audience: ${brief.targetAudience}
- Main Benefit: ${brief.mainBenefit}
- CTA: ${brief.callToAction}
- Must Mention: ${(brief.mustMention || []).join(', ')}

Tone: ${tone}
Tone Instructions:
${toneInstructions[tone] || toneInstructions.Friendly}

Message Type:
${broadcastNote}

Your job:
1. Read the campaign goal carefully.
2. Identify the actual business offer, audience, and CTA from it.
3. Write a WhatsApp message that clearly mentions the real initiative or offer from the goal.
4. Make the message sound natural for WhatsApp, not like a brochure or email.

Write ONE complete WhatsApp message that:
- Directly addresses the campaign goal above
- Is between 70-140 words
- Has a clear call-to-action at the end
- Uses {CustomerName} at least once for personalization
- Only uses {ProductName} and {OfferAmount} if they are relevant
- Feels authentic and NOT like a generic template
- Is written specifically for the campaign goal provided
- Includes the real names/details from the campaign goal when available
- Sounds like something a founder, consultant, or business growth partner would send on WhatsApp

IMPORTANT: Generate a unique message based on the campaign goal: "${campaignGoal}".
Do NOT return a generic template.
Do NOT start with "Dear {CustomerName}".
Do NOT start with "Hello {CustomerName}".
Do NOT start with "Hi {CustomerName}" unless it is followed immediately by a concrete offer in the same sentence.
Do NOT say "We are excited" unless the campaign goal truly sounds celebratory.
Do NOT write in stiff corporate language.
If the goal mentions a program, organization, or audience like "Applied AI", "MSMEs", "AI adoption", or "MCCIA", include those details naturally.
The CTA should feel practical, for example: book a free consultation, reply to this message, or schedule a quick call.
The message must contain at least 3 concrete campaign details from the brief or campaign goal.
Avoid filler greetings and get to the point quickly.

Return ONLY the WhatsApp message text.`
}

const buildWhatsAppRetryPrompt = ({ originalPrompt, firstDraft, anchors }) => `Your previous output was too generic and did not use the campaign details strongly enough.

Original instructions:
${originalPrompt}

Previous draft:
${firstDraft}

Rewrite it now so that it:
- clearly mentions at least 2 of these campaign-specific details: ${anchors.join(', ')}
- does NOT start with Dear/Hello/Hi/Greetings
- does NOT use generic lines like "Hope you're having a productive week"
- feels like a real WhatsApp outreach message, not an email
- ends with a practical CTA

Return ONLY the improved WhatsApp message text.`

const callGemini = async (apiKey, prompt) => {
    const candidateModels = ['gemini-2.5-flash-lite', 'gemini-2.5-flash']
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
                    systemInstruction: {
                        parts: [{
                            text: 'You are an expert conversion copywriter for WhatsApp campaigns in India. Write specific, natural, persuasive WhatsApp messages and avoid generic corporate phrasing.'
                        }]
                    },
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.95,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 400
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

const callGrok = async (apiKey, prompt) => {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'grok-4-latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert WhatsApp marketing copywriter for Indian businesses. You write specific, natural, high-conversion WhatsApp messages and avoid generic email-style intros.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.95,
            max_tokens: 400
        })
    })

    if (!response.ok) {
        const err = await response.json()
        throw new Error(`Grok error: ${err.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('Grok returned empty response')
    return text.trim()
}

const callOpenAI = async (apiKey, prompt) => {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert WhatsApp marketing copywriter for Indian businesses. You write specific, natural, high-conversion WhatsApp messages and avoid generic email-style intros.'
                },
                { role: 'user', content: prompt }
            ],
            temperature: 0.95,
            max_tokens: 400
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

const generateWhatsAppMessage = async ({ provider, prompt, anchors }) => {
    const firstDraft = normalizeMessage(await provider.fn(provider.key, prompt))

    if (
        !anchors.length ||
        (!isGenericWhatsAppMessage(firstDraft, anchors) && firstDraft.length >= 180 && firstDraft.split(/\s+/).length >= 35)
    ) {
        return firstDraft
    }

    console.log(`[api/generate] ${provider.id} draft too generic, retrying with anchors:`, anchors)
    const retryPrompt = buildWhatsAppRetryPrompt({
        originalPrompt: prompt,
        firstDraft,
        anchors
    })

    return normalizeMessage(await provider.fn(provider.key, retryPrompt))
}

const extractCampaignBrief = async ({ provider, campaignGoal, businessName, industry, city, anchors }) => {
    const prompt = buildCampaignBriefPrompt({ campaignGoal, businessName, industry, city, anchors })
    const raw = await provider.fn(provider.key, prompt)
    const parsed = safeParseJson(raw)

    if (!parsed || typeof parsed !== 'object') {
        console.error(`[api/generate] ${provider.id} brief parse failed, using fallback brief`)
        return buildFallbackBrief(campaignGoal, anchors)
    }

    return {
        coreOffer: parsed.coreOffer || campaignGoal,
        targetAudience: parsed.targetAudience || 'prospective customers',
        mainBenefit: parsed.mainBenefit || 'clear business value',
        callToAction: parsed.callToAction || 'Reply to this message to book a quick consultation',
        mustMention: Array.isArray(parsed.mustMention) ? parsed.mustMention.filter(Boolean).slice(0, 6) : anchors.slice(0, 6),
        objective: parsed.objective || 'Generate a specific WhatsApp message'
    }
}

const normalizeProvider = (provider) => {
    if (provider === 'openai') return 'openai'
    if (provider === 'grok') return 'grok'
    return 'gemini'
}

const getApiKeys = async () => {
    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    const { data: profile, error } = await supabase
        .from('business_profile')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('[api/generate] failed to load business_profile:', error.message)
    }

    console.log('[api/generate] profile row id:', profile?.id || null, 'active_ai_provider:', profile?.active_ai_provider)

    const gemini = profile?.gemini_api_key?.trim() || null
    const openai = profile?.openai_api_key?.trim() || null
    const grok = profile?.grok_api_key?.trim() || null

    return {
        gemini,
        openai,
        grok,
        activeProvider: normalizeProvider(profile?.active_ai_provider),
        source: (gemini || openai || grok) ? 'business_profile' : 'none',
        profile: profile || null
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

        const { gemini, openai, grok, activeProvider, source, profile } = await getApiKeys()
        console.log('[api/generate] key source + provider:', { source, activeProvider, hasGemini: Boolean(gemini), hasOpenAI: Boolean(openai), hasGrok: Boolean(grok) })

        if (type === 'whatsapp') {
            if (!campaignGoal.trim()) {
                return NextResponse.json({ error: 'Campaign goal is required.' }, { status: 400 })
            }

            const trimmedGoal = campaignGoal.trim()
            const anchors = extractCampaignAnchors(trimmedGoal)
            console.log('[api/generate] whatsapp anchors:', anchors)

            const allProviders = {
                gemini: { id: 'gemini', key: gemini, fn: callGemini },
                openai: { id: 'openai', key: openai, fn: callOpenAI },
                grok: { id: 'grok', key: grok, fn: callGrok }
            }
            const fallbackOrder = ['gemini', 'openai', 'grok'].filter((p) => p !== activeProvider)
            const providerOrder = [activeProvider, ...fallbackOrder].map((p) => allProviders[p]).filter(Boolean)

            const providerErrors = []

            for (const provider of providerOrder) {
                if (!provider.key) continue
                try {
                    const brief = await extractCampaignBrief({
                        provider,
                        campaignGoal: trimmedGoal,
                        businessName: profile?.business_name || null,
                        industry: profile?.industry || null,
                        city: profile?.city || null,
                        anchors
                    })
                    console.log(`[api/generate] ${provider.id} extracted brief:`, brief)

                    const prompt = buildWhatsAppPrompt({
                        tone,
                        campaignGoal: trimmedGoal,
                        broadcastMode,
                        businessName: profile?.business_name || null,
                        industry: profile?.industry || null,
                        city: profile?.city || null,
                        brief
                    })

                    const message = await generateWhatsAppMessage({ provider, prompt, anchors })
                    return NextResponse.json({ message, provider: provider.id, keySource: source })
                } catch (providerError) {
                    const msg = `${provider.id}: ${providerError.message}`
                    console.error(`[api/generate] ${msg}`)
                    providerErrors.push(msg)
                }
            }

            const errDetail = providerErrors.length
                ? providerErrors.join(' | ')
                : `No keys found — Gemini: ${Boolean(gemini)}, OpenAI: ${Boolean(openai)}, Grok: ${Boolean(grok)}`
            return NextResponse.json({ error: errDetail }, { status: 400 })
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
