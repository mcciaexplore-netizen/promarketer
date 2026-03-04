"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
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
    Hash
} from 'lucide-react';
import clsx from 'clsx';

const NAVIGATION = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    {
        name: 'Leads',
        href: '/leads',
        icon: Target,
        hasSubmenu: true,
        submenu: [
            { name: 'Lead Pipeline', href: '/leads', color: 'bg-blue-400' },
            { name: 'Enterprise Clients', href: '/leads?space=enterprise', color: 'bg-indigo-400' },
            { name: 'Referrals Q1', href: '/leads?space=referrals', color: 'bg-green-400' },
        ]
    },
    { name: 'Campaigns', href: '/campaigns', icon: CalendarDays },
    { name: 'Content Studio', href: '/content', icon: PenTool },
    { name: 'Scheduler', href: '/scheduler', icon: CalendarDays },
    { name: 'Email Builder', href: '/email', icon: Mail },
    { name: 'WhatsApp Crafter', href: '/whatsapp', icon: MessageSquare },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [leadsExpanded, setLeadsExpanded] = useState(true);

    return (
        <aside className="w-[240px] flex-shrink-0 bg-secondary flex flex-col h-screen fixed lg:static z-50 transition-transform -translate-x-full lg:translate-x-0">
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-[#1E4373]">
                <h1 className="text-white font-bold text-xl tracking-tight">ProMarketer<span className="text-accent">.</span></h1>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-8 space-y-2 custom-scrollbar">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <div key={item.name}>
                            <Link
                                href={item.href}
                                onClick={(e) => {
                                    if (item.hasSubmenu) {
                                        // Optionally allow toggle without navigation if clicked exactly on the arrow. 
                                        // For simplicity, we can let navigation happen, but toggle the folder state.
                                        setLeadsExpanded(!leadsExpanded);
                                    }
                                }}
                                className={clsx(
                                    "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors relative justify-between",
                                    isActive
                                        ? "bg-primary text-white"
                                        : "text-[#B3C5DF] hover:text-white hover:bg-[#1E4373]"
                                )}
                            >
                                {isActive && !item.hasSubmenu && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-md -ml-2" />
                                )}
                                <div className="flex gap-x-3 items-center">
                                    <Icon className={clsx("h-5 w-5 shrink-0", isActive ? "text-white" : "text-[#B3C5DF] group-hover:text-white")} />
                                    {item.name}
                                </div>
                                {item.hasSubmenu && (
                                    <div className="flex items-center">
                                        {leadsExpanded ? <ChevronDown className="w-4 h-4 ml-auto" /> : <ChevronRight className="w-4 h-4 ml-auto" />}
                                    </div>
                                )}
                            </Link>

                            {/* Submenu rendering */}
                            {item.hasSubmenu && leadsExpanded && (
                                <div className="mt-1 ml-4 border-l border-[#1E4373]/50 pl-2 space-y-1">
                                    <p className="text-[10px] uppercase font-bold text-[#8FA5C2] px-2 py-1 tracking-wider mt-2 mb-1">Spaces</p>
                                    {item.submenu.map(subItem => (
                                        <Link
                                            key={subItem.name}
                                            href={subItem.href}
                                            className="group flex gap-x-2 rounded-md p-1.5 text-[13px] leading-5 font-medium text-[#B3C5DF] hover:text-white hover:bg-[#1E4373] transition-colors items-center"
                                        >
                                            <span className={`w-2 h-2 rounded-full ${subItem.color} opacity-80 group-hover:opacity-100`}></span>
                                            {subItem.name}
                                        </Link>
                                    ))}
                                    <button className="flex gap-x-2 rounded-md p-1.5 text-[12px] leading-5 font-medium text-[#8FA5C2] hover:text-white hover:bg-[#1E4373] transition-colors items-center w-full mt-2 border border-dashed border-[#1E4373]">
                                        + New Space
                                    </button>
                                </div>
                            )}
                        </div>
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
