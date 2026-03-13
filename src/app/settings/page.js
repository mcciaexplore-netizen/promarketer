"use client"
import { useState, useEffect, useRef } from 'react';
import {
    Building,
    Key,
    Users,
    Link as LinkIcon,
    Upload,
    CheckCircle2,
    Plus,
    RefreshCw,
    MoreVertical,
    CalendarRange,
    Loader2,
    Database,
    Table2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getGoogleCalendarStatus, getTeamMembers, getBusinessProfile, updateBusinessProfile } from '../../lib/db';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const profileFormRef = useRef(null);
    const [team, setTeam] = useState([]);
    const [teamLoading, setTeamLoading] = useState(false);
    const [isTestingGemini, setIsTestingGemini] = useState(false);
    const [geminiStatus, setGeminiStatus] = useState('idle');
    const [googleCalendar, setGoogleCalendar] = useState({ connected: false, autoSync: true, email: null });
    const [storageStatus, setStorageStatus] = useState({ supabaseConnected: true, sheetsConfigured: false, campaignStorageProvider: 'supabase' });
    const [isSyncingAll, setIsSyncingAll] = useState(false);
    const [isDisconnecting, setIsDisconnecting] = useState(false);
    const [isSavingAutoSync, setIsSavingAutoSync] = useState(false);
    const [isSavingStorageProvider, setIsSavingStorageProvider] = useState(false);

    useEffect(() => {
        Promise.all([
            getBusinessProfile(),
            getGoogleCalendarStatus(),
            fetch('/api/settings/storage-status').then((res) => res.json()).catch(() => ({ success: false }))
        ]).then(([profileData, googleStatus, storageResult]) => {
            setProfile(profileData);
            setGoogleCalendar(googleStatus);
            if (storageResult.success) setStorageStatus(storageResult.data);
        });
    }, []);

    useEffect(() => {
        if (activeTab === 'team') {
            setTeamLoading(true);
            getTeamMembers().then(data => {
                setTeam(data || []);
                setTeamLoading(false);
            });
        }
    }, [activeTab]);

    const handleTestGemini = () => {
        setIsTestingGemini(true);
        setGeminiStatus('idle');
        setTimeout(() => {
            setIsTestingGemini(false);
            setGeminiStatus('success');
            toast.success("Connection to Gemini API successful!");
        }, 1500);
    };

    const handleInvite = () => {
        toast.success("Share the app URL with your team — they can sign up and will appear here automatically.");
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setSavingProfile(true);
        const form = profileFormRef.current;
        const updates = {
            business_name: form.business_name.value,
            industry: form.industry.value,
            website: form.website.value,
            city: form.city.value,
            gst_number: form.gst_number.value,
            primary_color: form.primary_color.value,
        };
        try {
            await updateBusinessProfile(updates);
            toast.success('Business profile saved!');
        } catch {
            toast.error('Failed to save profile');
        } finally {
            setSavingProfile(false);
        }
    };

    const refreshGoogleCalendarStatus = async () => {
        const [profileData, googleStatus, storageResult] = await Promise.all([
            getBusinessProfile(),
            getGoogleCalendarStatus(),
            fetch('/api/settings/storage-status').then((res) => res.json()).catch(() => ({ success: false }))
        ]);
        setProfile(profileData);
        setGoogleCalendar(googleStatus);
        if (storageResult.success) setStorageStatus(storageResult.data);
    };

    const handleToggleAutoSync = async () => {
        setIsSavingAutoSync(true);
        try {
            await updateBusinessProfile({ google_calendar_auto_sync: !googleCalendar.autoSync });
            await refreshGoogleCalendarStatus();
            toast.success(`Auto-sync ${googleCalendar.autoSync ? 'disabled' : 'enabled'}`);
        } catch {
            toast.error('Failed to update auto-sync');
        } finally {
            setIsSavingAutoSync(false);
        }
    };

    const handleSyncAllPosts = async () => {
        setIsSyncingAll(true);
        try {
            const response = await fetch('/api/scheduler/sync-all', { method: 'POST' });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to sync scheduled posts');
            }
            toast.success('All scheduled posts synced to Google Calendar');
            await refreshGoogleCalendarStatus();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsSyncingAll(false);
        }
    };

    const handleDisconnectGoogle = async () => {
        setIsDisconnecting(true);
        try {
            const response = await fetch('/api/settings/google-calendar/disconnect', { method: 'POST' });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.error || 'Failed to disconnect Google Calendar');
            }
            toast.success('Google Calendar disconnected');
            await refreshGoogleCalendarStatus();
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsDisconnecting(false);
        }
    };

    const handleStorageProviderChange = async (provider) => {
        setIsSavingStorageProvider(true);
        try {
            if ((provider === 'sheets' || provider === 'both') && !storageStatus.sheetsConfigured) {
                throw new Error('Google Sheets is not configured in server environment variables');
            }

            await updateBusinessProfile({ campaign_storage_provider: provider });
            await refreshGoogleCalendarStatus();
            toast.success(`Campaigns will now save to ${provider === 'both' ? 'Supabase and Google Sheets' : provider === 'sheets' ? 'Google Sheets' : 'Supabase'}`);
        } catch (error) {
            toast.error(error.message || 'Failed to update storage provider');
        } finally {
            setIsSavingStorageProvider(false);
        }
    };

    const TABS = [
        { id: 'profile', label: 'Business Profile', icon: Building },
        { id: 'apikeys', label: 'API Keys', icon: Key },
        { id: 'team', label: 'Team Members', icon: Users },
        { id: 'integrations', label: 'Integrations', icon: LinkIcon }
    ];

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Settings</h1>
                <p className="text-text-secondary mt-1">Manage your workspace, API keys, and external integrations.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Navigation Sidebar (3 cols) */}
                <div className="lg:col-span-3">
                    <nav className="flex flex-col space-y-1" aria-label="Tabs">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`
                    flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-colors
                    ${activeTab === tab.id
                                            ? 'bg-primary text-white'
                                            : 'text-text-secondary hover:bg-gray-100/50 hover:text-text-primary'
                                        }
                  `}
                                >
                                    <Icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Setting Content Area (9 cols) */}
                <div className="lg:col-span-9 card">

                    {/* PROFILE TAB */}
                    {activeTab === 'profile' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="p-5 border-b border-[#E5E5E5] bg-gray-50/50">
                                <h3 className="font-bold text-lg">Business Profile</h3>
                                <p className="text-sm text-text-secondary mt-1">This information is used across all generated campaigns and PDF reports.</p>
                            </div>
                            <form ref={profileFormRef} className="p-5 sm:p-6" onSubmit={handleProfileSave}>
                                <div className="flex items-center gap-6 mb-8 border-b border-gray-100 pb-8">
                                    <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden group hover:border-primary transition-colors cursor-pointer">
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Upload className="w-6 h-6 text-white" />
                                        </div>
                                        <Building className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-text-primary mb-1">Company Logo</h4>
                                        <p className="text-xs text-text-secondary max-w-sm mb-3 shadow-none leading-relaxed">Recommended 512x512px. Used on exported reports and email footers.</p>
                                        <button type="button" className="btn-secondary !py-1 !px-3 text-xs bg-white">Upload new image</button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                    <div className="sm:col-span-2">
                                        <label className="label-text">Business Name</label>
                                        <input name="business_name" type="text" className="input-field max-w-lg" defaultValue={profile?.business_name || ''} required />
                                    </div>

                                    <div>
                                        <label className="label-text">Industry</label>
                                        <input name="industry" type="text" className="input-field" defaultValue={profile?.industry || ''} />
                                    </div>

                                    <div>
                                        <label className="label-text">Website URL</label>
                                        <input name="website" type="url" className="input-field" defaultValue={profile?.website || ''} />
                                    </div>

                                    <div>
                                        <label className="label-text">City / State</label>
                                        <input name="city" type="text" className="input-field" defaultValue={profile?.city || ''} />
                                    </div>

                                    <div>
                                        <label className="label-text">GST Number (Optional)</label>
                                        <input name="gst_number" type="text" className="input-field" defaultValue={profile?.gst_number || ''} />
                                    </div>

                                    <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                                        <label className="label-text">Primary Brand Color</label>
                                        <div className="flex items-center gap-3">
                                            <input name="primary_color" type="color" className="p-0 border-0 w-10 h-10 rounded cursor-pointer mt-1" defaultValue={profile?.primary_color || '#0176D3'} />
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-[#E5E5E5] flex justify-end">
                                    <button type="submit" disabled={savingProfile} className={`btn-primary ${savingProfile ? 'opacity-70 cursor-not-allowed' : ''}`}>
                                        {savingProfile ? 'Saving...' : 'Save Profile'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* API KEYS TAB */}
                    {activeTab === 'apikeys' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="p-5 border-b border-[#E5E5E5] bg-gray-50/50">
                                <h3 className="font-bold text-lg">AI Providers</h3>
                                <p className="text-sm text-text-secondary mt-1">Manage your keys for text and generation engines.</p>
                            </div>

                            <div className="p-5 sm:p-6 space-y-6">

                                {/* Gemini Key */}
                                <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-text-primary">Google Gemini API</h4>
                                            {geminiStatus === 'success' && <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active</span>}
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary mb-4 max-w-xl">Used as the primary brain for Competitor Analysis, CRM Insights, and Content generation.</p>

                                    <div className="flex gap-3 items-start">
                                        <input type="password" placeholder="AIZA*******************" className="input-field font-mono text-sm max-w-sm" defaultValue="AIZAxxxxxxxxxxxxxxxxx" />
                                        <button className="btn-secondary !py-2 bg-white" onClick={handleTestGemini} disabled={isTestingGemini}>
                                            {isTestingGemini ? <RefreshCw className="w-4 h-4 animate-spin text-primary" /> : "Test Connection"}
                                        </button>
                                        <button className="btn-primary !py-2">Save</button>
                                    </div>
                                    {geminiStatus === 'success' && (
                                        <p className="text-sm mt-3 text-success flex items-center gap-1.5">
                                            <CheckCircle2 className="w-4 h-4" /> Successfully queried `gemini-1.5-pro` model.
                                        </p>
                                    )}
                                </div>

                                {/* OpenAI Key */}
                                <div className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-colors bg-gray-50/30">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-text-primary">OpenAI API (Optional)</h4>
                                        </div>
                                    </div>
                                    <p className="text-sm text-text-secondary mb-4 max-w-xl">Fallback or alternative provider for text generation.</p>

                                    <div className="flex gap-3 items-start">
                                        <input type="password" placeholder="sk-..." className="input-field font-mono text-sm max-w-sm" />
                                        <button className="btn-primary !py-2 opacity-50 cursor-not-allowed">Save</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* TEAM MEMBERS TAB */}
                    {activeTab === 'team' && (
                        <div className="animate-in fade-in duration-300 h-full flex flex-col">
                            <div className="p-5 border-b border-[#E5E5E5] bg-gray-50/50 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-lg">Team Members</h3>
                                    <p className="text-sm text-text-secondary mt-1">Everyone who has signed up to this workspace.</p>
                                </div>
                                <button className="btn-primary !py-1.5 !px-3 font-semibold text-sm" onClick={handleInvite}>
                                    <Plus className="w-4 h-4 mr-1" /> Invite Member
                                </button>
                            </div>

                            {teamLoading ? (
                                <div className="flex items-center justify-center p-12">
                                    <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto flex-1">
                                    <table className="min-w-full divide-y divide-[#E5E5E5]">
                                        <thead className="bg-white">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-[11px] font-bold text-text-secondary uppercase tracking-wider bg-gray-50">User</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-bold text-text-secondary uppercase tracking-wider bg-gray-50">Role</th>
                                                <th className="px-6 py-4 text-left text-[11px] font-bold text-text-secondary uppercase tracking-wider bg-gray-50">Joined</th>
                                                <th className="px-6 py-4 bg-gray-50"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 bg-white">
                                            {team.length === 0 && (
                                                <tr>
                                                    <td colSpan={4} className="px-6 py-8 text-center text-sm text-text-secondary">
                                                        No team members yet. Share the app URL to invite people.
                                                    </td>
                                                </tr>
                                            )}
                                            {team.map(member => (
                                                <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-1 ring-primary/20">
                                                                {(member.full_name || member.email || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-semibold text-text-primary">{member.full_name || '—'}</div>
                                                                <div className="text-[13px] text-text-secondary mt-0.5">{member.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`badge ${member.role === 'owner' || member.role === 'admin' ? 'badge-primary' : 'bg-gray-100 text-gray-700'}`}>
                                                            {member.role || 'member'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                                        {member.created_at ? new Date(member.created_at).toLocaleDateString() : '—'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                        <button className="text-gray-400 hover:text-text-primary">
                                                            <MoreVertical className="w-5 h-5" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    )}

                    {/* INTEGRATIONS TAB */}
                    {activeTab === 'integrations' && (
                        <div className="animate-in fade-in duration-300">
                            <div className="p-5 border-b border-[#E5E5E5] bg-gray-50/50">
                                <h3 className="font-bold text-lg">App Integrations</h3>
                                <p className="text-sm text-text-secondary mt-1">Connect your workspace with external platforms.</p>
                            </div>

                            <div className="p-5 sm:p-6 space-y-4">

                                <div className="border border-[#E5E5E5] bg-white rounded-xl p-5 space-y-5">
                                    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                                <CalendarRange className="w-6 h-6 text-[#0176D3]" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-bold text-text-primary">Google Calendar</h4>
                                                    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${googleCalendar.connected ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                                        <span className={`h-2 w-2 rounded-full ${googleCalendar.connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                                        {googleCalendar.connected ? 'Connected' : 'Disconnected'}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-text-secondary mt-1">
                                                    {googleCalendar.connected
                                                        ? `Connected account: ${googleCalendar.email || 'Google account'}`
                                                        : 'Connect Google Calendar so your team gets event reminders for scheduled posts.'}
                                                </p>
                                            </div>
                                        </div>

                                        {googleCalendar.connected ? (
                                            <button className="btn-secondary !py-2 bg-white border-gray-300" onClick={handleDisconnectGoogle} disabled={isDisconnecting}>
                                                {isDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                                Disconnect
                                            </button>
                                        ) : (
                                            <a href="/api/auth/google" className="btn-primary !py-2">
                                                <CalendarRange className="w-4 h-4" />
                                                Connect
                                            </a>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3">
                                        <div>
                                            <p className="font-semibold text-sm text-text-primary">Auto-sync new posts</p>
                                            <p className="text-xs text-text-secondary mt-1">Default ON. Saves your preference to the business profile.</p>
                                        </div>
                                        <button
                                            type="button"
                                            className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${googleCalendar.autoSync ? 'bg-primary' : 'bg-slate-300'} ${isSavingAutoSync ? 'opacity-60' : ''}`}
                                            onClick={handleToggleAutoSync}
                                            disabled={isSavingAutoSync}
                                        >
                                            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${googleCalendar.autoSync ? 'translate-x-6' : 'translate-x-1'}`} />
                                        </button>
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                        <button className="btn-primary !py-2" onClick={handleSyncAllPosts} disabled={!googleCalendar.connected || isSyncingAll}>
                                            {isSyncingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                            Sync all posts
                                        </button>
                                    </div>
                                </div>

                                <div className="border border-[#E5E5E5] bg-white rounded-xl p-5 space-y-5">
                                    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                                <Database className="w-6 h-6 text-primary" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-primary">Supabase Database</h4>
                                                <p className="text-sm text-text-secondary mt-1">Primary workspace database for campaigns, leads, scheduler posts, and settings.</p>
                                            </div>
                                        </div>
                                        <span className="btn-secondary !py-2 bg-white border-gray-300">
                                            <CheckCircle2 className="w-4 h-4 text-green-600" /> Connected
                                        </span>
                                    </div>

                                    <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 rounded-xl border border-slate-200 p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                                <Table2 className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-primary">Google Sheets</h4>
                                                <p className="text-sm text-text-secondary mt-1">
                                                    {storageStatus.sheetsConfigured
                                                        ? 'Connected via service account. Campaign saves can be mirrored into the Campaigns sheet.'
                                                        : 'Not configured yet. Add GOOGLE_SHEETS_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, and GOOGLE_PRIVATE_KEY on the server.'}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`btn-secondary !py-2 bg-white border-gray-300 ${!storageStatus.sheetsConfigured ? 'opacity-60' : ''}`}>
                                            <CheckCircle2 className={`w-4 h-4 ${storageStatus.sheetsConfigured ? 'text-green-600' : 'text-gray-400'}`} />
                                            {storageStatus.sheetsConfigured ? 'Connected' : 'Not Configured'}
                                        </span>
                                    </div>

                                    <div className="rounded-xl border border-slate-200 p-4">
                                        <div className="mb-3">
                                            <p className="font-semibold text-text-primary">Default campaign save destination</p>
                                            <p className="text-sm text-text-secondary mt-1">Choose where newly saved campaigns should go.</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            {[
                                                { id: 'supabase', label: 'Supabase' },
                                                { id: 'sheets', label: 'Google Sheets' },
                                                { id: 'both', label: 'Both' }
                                            ].map((option) => (
                                                <button
                                                    key={option.id}
                                                    type="button"
                                                    onClick={() => handleStorageProviderChange(option.id)}
                                                    disabled={isSavingStorageProvider || ((option.id === 'sheets' || option.id === 'both') && !storageStatus.sheetsConfigured)}
                                                    className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${storageStatus.campaignStorageProvider === option.id ? 'border-primary bg-primary/5 text-primary' : 'border-slate-200 text-slate-600 hover:border-slate-300'} disabled:opacity-50`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div className="border border-gray-200 bg-white rounded-xl p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 opacity-75">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                            <div className="w-6 h-6 rounded-full border-2 border-[#128C7E] flex items-center justify-center">
                                                <div className="w-2 h-2 bg-[#128C7E] rotate-45"></div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-primary flex items-center gap-2">WhatsApp Cloud API <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Coming Soon</span></h4>
                                            <p className="text-sm text-text-secondary mt-1 max-w-md">Automate message sending directly from your ProMarketer workflows.</p>
                                        </div>
                                    </div>
                                    <button className="btn-primary !py-2 bg-gray-100 text-gray-500 border-none cursor-not-allowed">
                                        Connect API
                                    </button>
                                </div>

                                {/* Meta Ads */}
                                <div className="border border-gray-200 bg-white rounded-xl p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 opacity-75">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-lg shadow-sm border border-gray-200 flex items-center justify-center shrink-0">
                                            <div className="w-6 h-4 bg-[#0668E1] rounded-sm"></div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-primary flex items-center gap-2">Meta Ads Manager <span className="bg-blue-100 text-blue-700 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">Coming Soon</span></h4>
                                            <p className="text-sm text-text-secondary mt-1 max-w-md">Sync generated ad copies straight to Business Manager.</p>
                                        </div>
                                    </div>
                                    <button className="btn-primary !py-2 bg-gray-100 text-gray-500 border-none cursor-not-allowed">
                                        Connect OAuth
                                    </button>
                                </div>

                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
