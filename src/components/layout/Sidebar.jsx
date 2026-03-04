"use client"
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart3,
    Target,
    CalendarDays,
    PenTool,
    Building2,
    Mail,
    MessageSquare,
    Settings
} from 'lucide-react';
import clsx from 'clsx';

const NAVIGATION = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Leads', href: '/leads', icon: Target },
    { name: 'Campaigns', href: '/campaigns', icon: CalendarDays },
    { name: 'Competitors', href: '/competitors', icon: Building2 },
    { name: 'Content Studio', href: '/content', icon: PenTool },
    { name: 'Scheduler', href: '/scheduler', icon: CalendarDays },
    { name: 'Email Builder', href: '/email', icon: Mail },
    { name: 'WhatsApp Crafter', href: '/whatsapp', icon: MessageSquare },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-[240px] flex-shrink-0 bg-secondary flex flex-col h-screen fixed lg:static z-50 transition-transform -translate-x-full lg:translate-x-0">
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-[#1E4373]">
                <h1 className="text-white font-bold text-xl tracking-tight">ProMarketer<span className="text-accent">.</span></h1>
            </div>

            <nav className="flex flex-1 flex-col overflow-y-auto px-4 py-8 space-y-2">
                {NAVIGATION.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-colors relative",
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-[#B3C5DF] hover:text-white hover:bg-[#1E4373]"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-l-md -ml-2" />
                            )}
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
