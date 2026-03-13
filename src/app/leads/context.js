"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { supabase } from '../../lib/supabaseClient';
import { getLeads, moveLeadOnBoard, createLead, deleteLead as dbDeleteLead } from '../../lib/db';

const LeadsContext = createContext();

export const STATUS_COLUMNS = ['NEW', 'CONTACTED', 'INTERESTED', 'NEGOTIATING', 'WON', 'LOST'];

export function LeadsProvider({ children }) {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeSpace, setActiveSpace] = useState('Lead Pipeline');
    const [currentSpaceId, setCurrentSpaceId] = useState(null);
    const [selectedLead, setSelectedLead] = useState(null);
    // Cache: spaceId -> spaceName for quick lookups
    const [spacesCache, setSpacesCache] = useState({});

    // --- Effect 1: Load all spaces on mount, set first space as default ---
    useEffect(() => {
        const init = async () => {
            console.log('[LeadsContext] init: loading spaces');
            try {
                const { data: spacesData } = await supabase
                    .from('spaces')
                    .select('id, name, color')
                    .order('created_at');
                if (spacesData && spacesData.length > 0) {
                    const cache = {};
                    spacesData.forEach(s => { cache[s.id] = s.name; });
                    setSpacesCache(cache);
                    const first = spacesData[0];
                    console.log('[LeadsContext] init: default space', first);
                    setCurrentSpaceId(first.id);
                    setActiveSpace(first.name);
                } else {
                    console.warn('[LeadsContext] init: no spaces found');
                    setIsLoading(false);
                }
            } catch (err) {
                console.error('[LeadsContext] init error:', err);
                setIsLoading(false);
            }
        };
        init();
    }, []);

    // --- Effect 2: Fetch leads whenever currentSpaceId changes ---
    useEffect(() => {
        if (!currentSpaceId) return;
        const fetchLeads = async () => {
            console.log('[LeadsContext] fetchLeads for space:', currentSpaceId);
            setIsLoading(true);
            try {
                const leadsData = await getLeads(currentSpaceId);
                setLeads(leadsData || []);
            } catch (err) {
                console.error('[LeadsContext] fetchLeads error:', err);
                toast.error('Failed to load pipeline');
            } finally {
                setIsLoading(false);
            }
        };
        fetchLeads();
    }, [currentSpaceId]);

    // --- Effect 3: Realtime subscription ---
    useEffect(() => {
        if (!currentSpaceId) return;

        const channel = supabase.channel(`space-${currentSpaceId}`);
        channel.on('postgres_changes', {
            event: '*', schema: 'public', table: 'leads',
            filter: `space_id=eq.${currentSpaceId}`,
        }, (payload) => {
            const { eventType, new: newRecord, old: oldRecord } = payload;
            if (eventType === 'INSERT') {
                setLeads(prev => {
                    if (prev.find(l => l.id === newRecord.id)) return prev;
                    return [...prev, newRecord];
                });
            }
            if (eventType === 'UPDATE') {
                setLeads(prev => prev.map(l => l.id === newRecord.id ? { ...l, ...newRecord } : l));
            }
            if (eventType === 'DELETE') {
                setLeads(prev => prev.filter(l => l.id !== oldRecord.id));
            }
        });
        channel.subscribe();
        return () => { supabase.removeChannel(channel); };
    }, [currentSpaceId]);

    // --- Switch to a different space by ID ---
    const switchSpaceById = async (id) => {
        if (!id || id === currentSpaceId) return;
        console.log('[LeadsContext] switchSpaceById:', id);
        // Look up name from cache first, else fetch
        if (spacesCache[id]) {
            setActiveSpace(spacesCache[id]);
        } else {
            try {
                const { data } = await supabase
                    .from('spaces')
                    .select('id, name')
                    .eq('id', id)
                    .single();
                if (data) {
                    setSpacesCache(prev => ({ ...prev, [id]: data.name }));
                    setActiveSpace(data.name);
                }
            } catch (err) {
                console.error('[LeadsContext] switchSpaceById fetch error:', err);
            }
        }
        setCurrentSpaceId(id);
    };

    // --- Update lead status (drag-and-drop) ---
    const updateLeadStatus = async (leadId, newStatus) => {
        const oldLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
        try {
            await moveLeadOnBoard(leadId, newStatus, 0);
            toast.success(`Moved to ${newStatus}`);
        } catch (err) {
            console.error('[LeadsContext] updateLeadStatus error:', err);
            setLeads(oldLeads);
            toast.error('Failed to update status');
        }
    };

    // --- Add a new lead with optimistic update ---
    const addLead = async (newLead) => {
        console.log('[LeadsContext] addLead called', newLead);
        const tempId = `temp-${Date.now()}`;
        const optimisticLead = {
            id: tempId,
            name: newLead.name || '',
            company: newLead.company || '',
            phone: newLead.phone || '',
            email: newLead.email || '',
            source: newLead.source || '',
            status: newLead.status || 'NEW',
            deal_value: newLead.deal_value || newLead.value || 0,
            lead_code: '...',
            space_id: currentSpaceId,
            assignee: null,
            created_at: new Date().toISOString(),
        };
        // Optimistic: add temp card immediately
        setLeads(prev => [...prev, optimisticLead]);

        try {
            const data = await createLead({
                ...newLead,
                space_id: currentSpaceId,
                status: newLead.status || 'NEW',
                deal_value: newLead.deal_value || newLead.value || 0,
                next_followup: newLead.nextFollowUp || new Date().toISOString().split('T')[0],
            });
            console.log('[LeadsContext] Lead created in Supabase:', data);
            if (data) {
                // Replace temp lead with real data
                setLeads(prev => prev.map(l => l.id === tempId ? data : l));
                toast.success('Lead added!');
            }
        } catch (err) {
            console.error('[LeadsContext] addLead error:', err);
            // Rollback
            setLeads(prev => prev.filter(l => l.id !== tempId));
            toast.error('Error creating lead');
        }
    };

    // --- Delete a lead ---
    const deleteLead = async (leadId) => {
        const oldLeads = [...leads];
        setLeads(prev => prev.filter(l => l.id !== leadId));
        try {
            await dbDeleteLead(leadId);
            toast.success('Lead deleted');
        } catch (err) {
            console.error('[LeadsContext] deleteLead error:', err);
            setLeads(oldLeads);
            toast.error('Failed to delete lead');
        }
    };

    return (
        <LeadsContext.Provider value={{
            leads,
            isLoading,
            activeSpace,
            setActiveSpace,
            currentSpaceId,
            switchSpaceById,
            selectedLead,
            setSelectedLead,
            updateLeadStatus,
            addLead,
            deleteLead,
        }}>
            {children}
        </LeadsContext.Provider>
    );
}

export function useLeads() {
    return useContext(LeadsContext);
}
