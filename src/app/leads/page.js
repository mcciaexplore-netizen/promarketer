"use client"
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useLeads } from './context';
import BoardView from './views/BoardView';
import ListView from './views/ListView';
import SummaryView from './views/SummaryView';
import TimelineView from './views/TimelineView';
import GoalsView from './views/GoalsView';
import LeadDetailPanel from './components/LeadDetailPanel';

const VIEWS = [
    { id: 'summary', label: 'Summary' },
    { id: 'timeline', label: 'Timeline' },
    { id: 'board', label: 'Board' },
    { id: 'list', label: 'List' },
    { id: 'goals', label: 'Goals' }
];

function LeadsPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { activeSpace, isLoading } = useLeads();

    const initialView = searchParams.get('view') || (typeof window !== 'undefined' ? localStorage.getItem('activeLeadView') : null) || 'board';
    const [activeView, setActiveView] = useState(initialView);

    useEffect(() => {
        localStorage.setItem('activeLeadView', activeView);
        router.replace(`/leads?view=${activeView}`);
    }, [activeView, router]);

    return (
        <div className="h-full flex flex-col -m-6 p-6 space-y-4">

            {/* Page Header matching Jira */}
            <div className="flex flex-col gap-4 border-b border-[#E5E5E5] pb-0">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Projects / Spaces</p>
                        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
                            {activeSpace} <span className="text-xl text-gray-400 font-normal">★</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2 mr-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold ring-2 ring-white">P</div>
                            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold ring-2 ring-white">S</div>
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold ring-2 ring-white">+2</div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <nav className="flex space-x-6">
                    {VIEWS.map(view => (
                        <button
                            key={view.id}
                            onClick={() => setActiveView(view.id)}
                            className={`
                py-3 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeView === view.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                                }
              `}
                        >
                            {view.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Main View Area */}
            <div className="flex-1 relative overflow-hidden">
                {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <>
                        {activeView === 'board' && <BoardView />}
                        {activeView === 'list' && <ListView />}
                        {activeView === 'summary' && <SummaryView />}
                        {activeView === 'timeline' && <TimelineView />}
                        {activeView === 'goals' && <GoalsView />}
                    </>
                )}
            </div>

            <LeadDetailPanel />
        </div>
    );
}

export default function LeadsPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center p-20 h-full">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        }>
            <LeadsPageContent />
        </Suspense>
    );
}
