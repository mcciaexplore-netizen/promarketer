"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const LeadsContext = createContext();

const MOCK_LEADS = [
    { id: 'LP-1', name: 'Rahul Sharma', company: 'TechNova Solutions', source: 'Organic', status: 'NEW', value: 50000, nextFollowUp: '2026-10-28', lastContact: '2026-10-25', phone: '+91 9876543210', email: 'rahul@technova.com', assignee: 'Pratik' },
    { id: 'LP-2', name: 'Priya Patel', company: 'CloudScale Inc', source: 'Referral', status: 'INTERESTED', value: 120000, nextFollowUp: '2026-10-29', lastContact: '2026-10-26', phone: '+91 9123456780', email: 'priya@cloudscale.in', assignee: 'Sarah' },
    { id: 'LP-3', name: 'Amit Kumar', company: 'Global Logistics', source: 'Ads', status: 'NEGOTIATING', value: 85000, nextFollowUp: '2026-10-30', lastContact: '2026-10-24', phone: '+91 9988776655', email: 'amit@globallog.com', assignee: 'Amit' },
    { id: 'LP-4', name: 'Sarah Jones', company: 'DesignStudio', source: 'LinkedIn', status: 'CONTACTED', value: 45000, nextFollowUp: '2026-10-27', lastContact: '2026-10-21', phone: '+44 7700900077', email: 'sarah@designstudio.uk', assignee: 'Pratik' },
    { id: 'LP-5', name: 'Vikram Singh', company: 'Apex Tech', source: 'Cold Email', status: 'WON', value: 250000, nextFollowUp: '2026-11-05', lastContact: '2026-10-24', phone: '+91 9898989898', email: 'vikram@apextech.com', assignee: 'Sarah' }
];

export const STATUS_COLUMNS = ['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'WON', 'LOST'];

export function LeadsProvider({ children }) {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSpace, setActiveSpace] = useState('Lead Pipeline');
    const [selectedLead, setSelectedLead] = useState(null);

    // Fake fetch on mount
    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            setLeads(MOCK_LEADS);
            setIsLoading(false);
        }, 1200);
    }, [activeSpace]);

    // Debounce API calls map
    const timeouts = React.useRef(new Map());

    const updateLeadStatus = (leadId, newStatus) => {
        // Optimistic Update
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

        // Clear any pending timeout for this lead
        if (timeouts.current.has(leadId)) {
            clearTimeout(timeouts.current.get(leadId));
        }

        // Debounce the API call by 500ms
        const timeoutId = setTimeout(async () => {
            try {
                // Mock the PATCH request to API
                console.log(`PATCH /api/sheets?tab=Leads&id=${leadId} with status=${newStatus}`);
                // await fetch(`/api/sheets?tab=Leads&id=${leadId}`, { method: 'PATCH', body: JSON.stringify({ status: newStatus }) });
                toast.success(`Saved to pipeline: ${newStatus}`);
            } catch (err) {
                toast.error("Failed to update status in Sheets");
                // Rollback state here if needed
            }
            timeouts.current.delete(leadId);
        }, 500);

        timeouts.current.set(leadId, timeoutId);
    };

    const addLead = (newLead) => {
        const lead = {
            id: `LP-${leads.length + 10}`,
            ...newLead,
            status: newLead.status || 'NEW',
            value: newLead.value || 0,
            nextFollowUp: newLead.nextFollowUp || new Date().toISOString().split('T')[0]
        };
        setLeads([lead, ...leads]);
        toast.success("Lead created!");
    };

    const deleteLead = (leadId) => {
        setLeads(prev => prev.filter(l => l.id !== leadId));
        toast.success("Lead deleted");
    };

    return (
        <LeadsContext.Provider value={{
            leads,
            isLoading,
            activeSpace,
            setActiveSpace,
            selectedLead,
            setSelectedLead,
            updateLeadStatus,
            addLead,
            deleteLead
        }}>
            {children}
        </LeadsContext.Provider>
    );
}

export function useLeads() {
    return useContext(LeadsContext);
}
