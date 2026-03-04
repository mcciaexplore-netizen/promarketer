"use client"
import { useState } from 'react';
import {
    CalendarDays,
    List,
    Plus,
    ChevronLeft,
    ChevronRight,
    Instagram,
    Linkedin,
    Facebook,
    Twitter,
    Image as ImageIcon,
    CheckCircle2,
    Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

// Mock data
const MOCK_POSTS = [
    { id: 1, date: 5, platform: 'linkedin', caption: 'Thrilled to share our new Q4 automation features! 🚀 #productivity', status: 'Published', time: '09:00 AM' },
    { id: 2, date: 12, platform: 'instagram', caption: 'Behind the scenes at ProMarketer HQ! 📸 See how our team builds AI native marketing.', status: 'Scheduled', time: '14:30 PM' },
    { id: 3, date: 20, platform: 'facebook', caption: 'Webinar Alert: Scaling your B2B Agency. Register today!', status: 'Draft', time: '10:00 AM' },
    { id: 4, date: 24, platform: 'twitter', caption: 'What is the #1 tool you use for lead gen? Let us know below! 👇', status: 'Scheduled', time: '16:00 PM' },
];

export default function SchedulerPage() {
    const [view, setView] = useState('calendar'); // 'calendar' | 'list'
    const [selectedDate, setSelectedDate] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // Form State
    const [platforms, setPlatforms] = useState([]);
    const [caption, setCaption] = useState('');

    const currentMonth = "October 2026";
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);

    const togglePlatform = (p) => {
        if (platforms.includes(p)) setPlatforms(platforms.filter(x => x !== p));
        else setPlatforms([...platforms, p]);
    };

    const getPlatformIcon = (platform, className = "") => {
        switch (platform) {
            case 'instagram': return <Instagram className={`${className} text-pink-600`} />;
            case 'linkedin': return <Linkedin className={`${className} text-blue-700`} />;
            case 'facebook': return <Facebook className={`${className} text-blue-600`} />;
            case 'twitter': return <Twitter className={`${className} text-sky-500`} />;
            default: return null;
        }
    };

    const openScheduler = (day = null) => {
        setSelectedDate(day);
        setIsPanelOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (platforms.length === 0) return toast.error("Select at least one platform");
        if (!caption) return toast.error("Caption is required");
        toast.success("Post saved successfully to Google Sheets!");
        setIsPanelOpen(false);
        setPlatforms([]);
        setCaption('');
    };

    return (
        <div className="space-y-6 flex flex-col h-full relative">

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">Content Scheduler</h1>
                    <p className="text-text-secondary mt-1">Plan, visualize and manage your social pipeline via Google Sheets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <button
                            className={`p-2 rounded-md ${view === 'calendar' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setView('calendar')}
                        >
                            <CalendarDays className="w-4 h-4" />
                        </button>
                        <button
                            className={`p-2 rounded-md ${view === 'list' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setView('list')}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                    <button className="btn-primary" onClick={() => openScheduler()}>
                        <Plus className="w-4 h-4" /> Schedule Post
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start h-full">

                {/* Main Content Area (8 cols if panel open, else 12) */}
                <div className={`${isPanelOpen ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300`}>

                    {view === 'calendar' ? (
                        <div className="card w-full bg-white flex flex-col">
                            {/* Calendar Header */}
                            <div className="p-4 border-b border-[#E5E5E5] flex items-center justify-between">
                                <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                                    <ChevronLeft className="w-4 h-4 text-gray-500" />
                                </button>
                                <h2 className="font-bold text-lg">{currentMonth}</h2>
                                <button className="p-2 border border-gray-200 rounded-md hover:bg-gray-50">
                                    <ChevronRight className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>

                            {/* Calendar Grid */}
                            <div className="flex-1 w-full bg-gray-50 grid grid-cols-7 border-b border-gray-200 text-center">
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="py-2 text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                                        {day}
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 w-full border-gray-200">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={`empty-${i}`} className="h-32 border-b border-r border-[#E5E5E5] last:border-r-0 bg-gray-50/50" />
                                ))}

                                {daysInMonth.map(day => {
                                    const postsThatDay = MOCK_POSTS.filter(p => p.date === day);
                                    return (
                                        <div
                                            key={day}
                                            className={`h-32 border-b border-r border-[#E5E5E5] cursor-pointer hover:bg-blue-50/30 transition-colors flex flex-col p-1`}
                                            onClick={() => openScheduler(day)}
                                        >
                                            <span className="text-sm font-semibold p-1 text-gray-400">{day}</span>

                                            {/* Render Post Chips */}
                                            <div className="flex-1 overflow-y-auto space-y-1 mt-1 pr-1 custom-scrollbar">
                                                {postsThatDay.map((post) => (
                                                    <div key={post.id} className="bg-white border text-left px-2 py-1.5 rounded shadow-sm text-xs truncate border-gray-200 flex items-center gap-1.5 hover:border-primary">
                                                        {getPlatformIcon(post.platform, "w-3 h-3 shrink-0")}
                                                        <span className="truncate">{post.time}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="card w-full overflow-hidden">
                            <table className="min-w-full divide-y divide-[#E5E5E5]">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Platform</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Caption Preview</th>
                                        <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-[#E5E5E5]">
                                    {MOCK_POSTS.map(post => (
                                        <tr key={post.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary text-left">
                                                {currentMonth.split(' ')[0]} {post.date}, {post.time}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <div className="flex gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded inline-block">
                                                    {getPlatformIcon(post.platform, "w-4 h-4")}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate text-left">
                                                {post.caption}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-left">
                                                <span className={`badge ${post.status === 'Published' ? 'badge-success' : post.status === 'Draft' ? 'bg-gray-100 text-gray-800' : 'badge-primary'}`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                </div>

                {/* Schedule Post Panel (Slide out right panel effect on desktop) */}
                {isPanelOpen && (
                    <div className="lg:col-span-4 card h-full bg-white flex flex-col p-0 border-[#E5E5E5] animate-in fade-in slide-in-from-right-4 duration-300 lg:sticky lg:top-8">
                        <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-lg">Schedule Content</h3>
                            <button className="text-sm font-semibold text-gray-500 hover:text-text-primary" onClick={() => setIsPanelOpen(false)}>Close</button>
                        </div>

                        <form className="p-5 flex-1 overflow-y-auto space-y-6" onSubmit={handleSave}>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label-text">Date</label>
                                    <input type="date" className="input-field text-sm" defaultValue={`2026-10-${selectedDate ? String(selectedDate).padStart(2, '0') : '10'}`} required />
                                </div>
                                <div>
                                    <label className="label-text">Time</label>
                                    <input type="time" className="input-field text-sm" defaultValue="10:00" required />
                                </div>
                            </div>

                            {/* Platforms */}
                            <div>
                                <label className="label-text mb-2 flex">Target Platforms <span className="text-error ml-1">*</span></label>
                                <div className="flex flex-wrap gap-2">
                                    {['instagram', 'linkedin', 'facebook', 'twitter'].map(p => (
                                        <button
                                            type="button"
                                            key={p}
                                            onClick={() => togglePlatform(p)}
                                            className={`flex items-center gap-2 p-3 border rounded-lg transition-all capitalize text-sm font-semibold ${platforms.includes(p) ? 'border-primary bg-primary/5 text-primary' : 'border-[#E5E5E5] text-text-secondary hover:border-gray-300'}`}
                                        >
                                            {getPlatformIcon(p, "w-4 h-4")}
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Caption */}
                            <div>
                                <div className="flex justify-between items-end mb-1.5">
                                    <label className="label-text mb-0">Caption</label>
                                    <span className="text-[10px] font-semibold text-text-secondary">{caption.length} / 2200</span>
                                </div>
                                <textarea
                                    rows={6}
                                    className="input-field resize-none text-sm leading-relaxed"
                                    placeholder="Write your post caption..."
                                    value={caption}
                                    onChange={(e) => setCaption(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Media Upload */}
                            <div>
                                <label className="label-text">Media</label>
                                <div className="mt-1 flex justify-center rounded-lg border border-dashed border-[#C9C9C9] px-6 py-8 hover:bg-gray-50 hover:border-primary transition-colors cursor-pointer group">
                                    <div className="text-center">
                                        <ImageIcon className="mx-auto h-8 w-8 text-gray-300 group-hover:text-primary transition-colors" aria-hidden="true" />
                                        <div className="mt-4 flex text-sm leading-6 text-gray-600 justify-center">
                                            <span className="relative rounded-md bg-transparent font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary-hover">
                                                Upload a file
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs leading-5 text-gray-500 mt-1">PNG, JPG, MP4 up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="label-text">Status</label>
                                <select className="input-field text-sm">
                                    <option>Draft</option>
                                    <option>Scheduled</option>
                                    <option>Published</option>
                                </select>
                                <p className="text-xs text-text-secondary mt-2 italic flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3 text-success" /> Manual confirmation currently required for posting.
                                </p>
                            </div>

                            <div className="pt-4 border-t border-[#E5E5E5]">
                                <button type="submit" className="btn-primary w-full">Save to Google Sheets</button>
                            </div>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}
