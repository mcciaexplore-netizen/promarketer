import { supabase } from './supabaseClient'

// ── AUTH ──────────────────────────────────────
export const signIn = (email, password) =>
    supabase.auth.signInWithPassword({ email, password })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()

export const getCurrentProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()
    return data
}

// ── PROFILES / TEAM ───────────────────────────
export const getTeamMembers = async () => {
    const { data } = await supabase
        .from('profiles').select('*')
        .eq('is_active', true).order('full_name')
    return data
}

export const updateProfile = async (id, updates) => {
    const { data } = await supabase
        .from('profiles').update(updates).eq('id', id).select().single()
    return data
}

export const inviteTeamMember = async (email, role = 'member') => {
    // Uses Supabase Admin API via server route
    const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
    })
    return res.json()
}

// ── SPACES ────────────────────────────────────
export const getSpaces = async () => {
    const { data } = await supabase
        .from('spaces').select('*, created_by(full_name)')
        .order('created_at')
    return data
}

export const createSpace = async (space) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('spaces')
        .insert({ ...space, created_by: user.id })
        .select().single()
    return data
}

export const updateSpace = async (id, updates) => {
    const { data } = await supabase
        .from('spaces').update(updates).eq('id', id).select().single()
    return data
}

export const deleteSpace = async (id) => {
    await supabase.from('spaces').delete().eq('id', id)
}

// ── LEADS ─────────────────────────────────────
export const getLeads = async (spaceId) => {
    const { data } = await supabase
        .from('leads')
        .select('*, assignee:assignee_id(id, full_name, avatar_url), created_by(full_name)')
        .eq('space_id', spaceId)
        .order('position', { ascending: true })
    return data
}

export const createLead = async (lead) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('leads')
        .insert({ ...lead, created_by: user.id })
        .select('*, assignee:assignee_id(id, full_name, avatar_url)')
        .single()
    return data
}

export const updateLead = async (id, updates) => {
    const { data } = await supabase.from('leads')
        .update(updates).eq('id', id)
        .select('*, assignee:assignee_id(id, full_name, avatar_url)')
        .single()
    return data
}

export const deleteLead = async (id) => {
    await supabase.from('leads').delete().eq('id', id)
}

// Drag & drop: update status + reorder positions in one call
export const moveLeadOnBoard = async (leadId, newStatus, newPosition) => {
    const { data } = await supabase.from('leads')
        .update({ status: newStatus, position: newPosition })
        .eq('id', leadId).select().single()
    return data
}

// ── ACTIVITIES ────────────────────────────────
export const getActivities = async (leadId) => {
    const { data } = await supabase.from('activities')
        .select('*, logged_by(full_name, avatar_url)')
        .eq('lead_id', leadId)
        .order('logged_at', { ascending: false })
    return data
}

export const logActivity = async (activity) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('activities')
        .insert({ ...activity, logged_by: user.id })
        .select('*, logged_by(full_name, avatar_url)')
        .single()
    return data
}

// ── NOTIFICATIONS ─────────────────────────────
export const getNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data } = await supabase.from('notifications')
        .select('*').eq('recipient_id', user.id)
        .order('created_at', { ascending: false }).limit(20)
    return data
}

export const markNotificationRead = async (id) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
}

// ── BUSINESS PROFILE ──────────────────────────
export const getBusinessProfile = async () => {
    const { data } = await supabase
        .from('business_profile').select('*').single()
    return data
}

export const updateBusinessProfile = async (updates) => {
    const { data } = await supabase
        .from('business_profile').update(updates)
        .eq('id', (await getBusinessProfile()).id)
        .select().single()
    return data
}
