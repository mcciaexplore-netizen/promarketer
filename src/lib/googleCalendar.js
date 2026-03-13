import { google } from 'googleapis'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

const platformEmojis = {
    Instagram: '📸',
    LinkedIn: '💼',
    Facebook: '👥',
    Twitter: '🐦',
    WhatsApp: '💬'
}

const getGoogleColorId = (platform) => ({
    Instagram: '6',
    LinkedIn: '1',
    Facebook: '9',
    Twitter: '7',
    WhatsApp: '2'
})[platform] || '8'

const buildEvent = (post) => {
    const startTime = new Date(post.scheduled_at)
    const endTime = new Date(startTime.getTime() + 30 * 60000)
    const emoji = (post.platforms || []).map((platform) => platformEmojis[platform] || '📢').join('')

    return {
        summary: `${emoji} ${(post.platforms || []).join(' + ')} Post`,
        description: `Caption: ${post.caption || ''}\n\nStatus: ${post.status || 'Scheduled'}\n\nManage in ProMarketer: ${APP_URL}/scheduler`,
        start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Kolkata' },
        end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
        colorId: getGoogleColorId(post.platforms?.[0]),
        reminders: {
            useDefault: false,
            overrides: [
                { method: 'email', minutes: 60 },
                { method: 'popup', minutes: 30 }
            ]
        }
    }
}

export const getOAuthClient = () => new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
)

export const getCalendarClient = (tokens) => {
    const auth = getOAuthClient()
    auth.setCredentials(tokens)
    return google.calendar({ version: 'v3', auth })
}

export const createCalendarEvent = async (tokens, post) => {
    const calendar = getCalendarClient(tokens)
    const { data } = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: buildEvent(post)
    })
    return data.id
}

export const updateCalendarEvent = async (tokens, googleEventId, post) => {
    const calendar = getCalendarClient(tokens)
    const { data } = await calendar.events.update({
        calendarId: 'primary',
        eventId: googleEventId,
        requestBody: buildEvent(post)
    })
    return data.id
}

export const deleteCalendarEvent = async (tokens, googleEventId) => {
    const calendar = getCalendarClient(tokens)
    await calendar.events.delete({ calendarId: 'primary', eventId: googleEventId })
}

export const refreshTokenIfNeeded = async (userId, tokens, supabase) => {
    if (Date.now() < (tokens.expiry_date || 0) - 60000) return tokens

    const auth = getOAuthClient()
    auth.setCredentials(tokens)
    const { credentials } = await auth.refreshAccessToken()
    const nextTokens = {
        ...tokens,
        access_token: credentials.access_token || tokens.access_token,
        expiry_date: credentials.expiry_date || tokens.expiry_date,
        refresh_token: credentials.refresh_token || tokens.refresh_token
    }

    if (!supabase) {
        throw new Error('Supabase client is required to persist refreshed Google tokens.')
    }

    await supabase
        .from('google_tokens')
        .update({
            access_token: nextTokens.access_token,
            refresh_token: nextTokens.refresh_token,
            expiry_date: nextTokens.expiry_date
        })
        .eq('user_id', userId)

    return nextTokens
}
