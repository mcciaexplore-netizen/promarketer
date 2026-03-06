"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
    BarChart3,
    Target,
    CalendarDays,
    PenTool,
    Mail,
    MessageSquare,
    Settings,
    ChevronDown,
    ChevronRight,
    Plus,
    X
} from 'lucide-react';
import clsx from 'clsx';
import { getSpaces, createSpace } from '../../lib/db';

const SPACE_COLORS = ['bg-blue-400', 'bg-indigo-400', 'bg-green-400', 'bg-orange-400', 'bg-purple-400', 'bg-pink-400'];

const NAV_ITEMS = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Campaigns', href: '/campaigns', icon: CalendarDays },
    { name: 'Content Studio', href: '/content', icon: PenTool },
    { name: 'Scheduler', href: '/scheduler', icon: CalendarDays },
    { name: 'Email Builder', href: '/email', icon: Mail },
    { name: 'WhatsApp Crafter', href: '/whatsapp', icon: MessageSquare },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [leadsExpanded, setLeadsExpanded] = useState(true);
    const [spaces, setSpaces] = useState([]);
    const [showNewSpace, setShowNewSpace] = useState(false);
    const [newSpaceName, setNewSpaceName] = useState('');
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        getSpaces().then(data => setSpaces(data || []));
    }, []);

    const handleCreateSpace = async (e) => {
        e.preventDefault();
        if (!newSpaceName.trim()) return;
        setCreating(true);
        try {
            const space = await createSpace({ name: newSpaceName.trim(), emoji: '📋' });
            if (space) setSpaces(prev => [...prev, space]);
        } finally {
            setNewSpaceName('');
            setShowNewSpace(false);
            setCreating(false);
        }
    };

    return (
        <aside className="w-[240px] flex-shrink-0 bg-secondary flex flex-col h-screen fixed lg:static z-50 transition-transform -translate-x-full lg:translate-x-0">
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-[#1E4373]">
                <h1 className="text-white font-bold text-xl tracking-tight">ProMarketer<span className="text-accent">.</span></h1>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-8 space-y-2 custom-scrollbar">
                {/* Dashboard */}
                <Link
                    href="/"
                    className={clsx(
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors relative",
                        pathname === '/' ? "bg-primary text-white" : "text-[#B3C5DF] hover:text-white hover:bg-[#1E4373]"
                    )}
                >
                    {pathname === '/' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-md -ml-2" />}
                    <BarChart3 className={clsx("h-5 w-5 shrink-0", pathname === '/' ? "text-white" : "text-[#B3C5DF] group-hover:text-white")} />
                    Dashboard
                </Link>

                {/* Leads + Spaces */}
                <div>
                    <button
                        onClick={() => setLeadsExpanded(!leadsExpanded)}
                        className={clsx(
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors relative justify-between w-full",
                            pathname.startsWith('/leads') ? "bg-primary text-white" : "text-[#B3C5DF] hover:text-white hover:bg-[#1E4373]"
                        )}
                    >
                        <div className="flex gap-x-3 items-center">
                            <Target className={clsx("h-5 w-5 shrink-0", pathname.startsWith('/leads') ? "text-white" : "text-[#B3C5DF] group-hover:text-white")} />
                            Leads
                        </div>
                        {leadsExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>

                    {leadsExpanded && (
                        <div className="mt-1 ml-4 border-l border-[#1E4373]/50 pl-2 space-y-1">
                            <p className="text-[10px] uppercase font-bold text-[#8FA5C2] px-2 py-1 tracking-wider mt-2 mb-1">Spaces</p>
                            {spaces.map((space, i) => (
                                <Link
                                    key={space.id}
                                    href={`/leads?space=${space.id}`}
                                    className="group flex gap-x-2 rounded-md p-1.5 text-[13px] leading-5 font-medium text-[#B3C5DF] hover:text-white hover:bg-[#1E4373] transition-colors items-center"
                                >
                                    <span className={`w-2 h-2 rounded-full ${SPACE_COLORS[i % SPACE_COLORS.length]} opacity-80 group-hover:opacity-100`} />
                                    {space.name}
                                </Link>
                            ))}

                            {showNewSpace ? (
                                <form onSubmit={handleCreateSpace} className="mt-1">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder="Space name..."
                                        value={newSpaceName}
                                        onChange={e => setNewSpaceName(e.target.value)}
                                        className="w-full text-[12px] bg-[#1E4373] text-white placeholder-[#8FA5C2] rounded p-1.5 outline-none border border-[#0176D3]"
                                    />
                                    <div className="flex gap-1 mt-1">
                                        <button type="submit" disabled={creating} className="flex-1 text-[11px] bg-primary text-white rounded p-1 font-semibold">
                                            {creating ? '...' : 'Create'}
                                        </button>
                                        <button type="button" onClick={() => setShowNewSpace(false)} className="p-1 text-[#8FA5C2] hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <button
                                    onClick={() => setShowNewSpace(true)}
                                    className="flex gap-x-2 rounded-md p-1.5 text-[12px] leading-5 font-medium text-[#8FA5C2] hover:text-white hover:bg-[#1E4373] transition-colors items-center w-full mt-1 border border-dashed border-[#1E4373]"
                                >
                                    <Plus className="w-3 h-3" /> New Space
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Other nav items */}
                {NAV_ITEMS.slice(1).map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors relative",
                                isActive ? "bg-primary text-white" : "text-[#B3C5DF] hover:text-white hover:bg-[#1E4373]"
                            )}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-md -ml-2" />}
                            <Icon className={clsx("h-5 w-5 shrink-0", isActive ? "text-white" : "text-[#B3C5DF] group-hover:text-white")} />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-4 py-4 border-t border-[#1E4373]">
                <Link
                    href="/settings"
                    className={clsx(
                        "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors relative",
                        pathname.startsWith('/settings')
                            ? "bg-primary text-white"
                            : "text-[#B3C5DF] hover:text-white hover:bg-[#1E4373]"
                    )}
                >
                    {pathname.startsWith('/settings') && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-md -ml-2" />
                    )}
                    <Settings className={clsx("h-5 w-5 shrink-0", pathname.startsWith('/settings') ? "text-white" : "text-[#B3C5DF] group-hover:text-white")} />
                    Settings
                </Link>
            </div>
        </aside>
    );
}
