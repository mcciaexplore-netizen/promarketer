"use client"
import React, { createContext, useContext, useState, useEffect, useReducer } from 'react';
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

    // Initial fetch of leads for the current space
    useEffect(() => {
        const fetchSpaceAndLeads = async () => {
            setIsLoading(true);
            try {
                // Fetch the default space to get its ID
                const { data: spacesData } = await supabase.from('spaces').select('id, name');
                if (spacesData && spacesData.length > 0) {
                    const space = spacesData.find(s => s.name === activeSpace) || spacesData[0];
                    setCurrentSpaceId(space.id);

                    const leadsData = await getLeads(space.id);
                    setLeads(leadsData || []);
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to load pipeline");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSpaceAndLeads();
    }, [activeSpace]);

    // Realtime Sync Subscription
    useEffect(() => {
        if (!currentSpaceId) return;

        const channel = supabase.channel(`space-${currentSpaceId}`);

        channel.on('postgres_changes', {
            event: '*', schema: 'public', table: 'leads',
            filter: `space_id=eq.${currentSpaceId}`
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
        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentSpaceId]);

    const updateLeadStatus = async (leadId, newStatus) => {
        // Optimistic Update
        const oldLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));

        try {
            await moveLeadOnBoard(leadId, newStatus, 0); // Position logic can be enhanced
            toast.success(`Saved to pipeline: ${newStatus}`);
        } catch (err) {
            console.error(err);
            setLeads(oldLeads);
            toast.error("Failed to update status in Supabase");
        }
    };

    const addLead = async (newLead) => {
        try {
            const data = await createLead({
                ...newLead,
                space_id: currentSpaceId,
                status: newLead.status || 'NEW',
                deal_value: newLead.value || 0,
                next_followup: newLead.nextFollowUp || new Date().toISOString().split('T')[0]
            });
            if (data) {
                // setLeads([...leads, data]); // Redundant because of Realtime subscription
                toast.success("Lead created!");
            }
        } catch (err) {
            console.error(err);
            toast.error("Error creating Lead");
        }
    };

    const deleteLead = async (leadId) => {
        // Optimistic update
        const oldLeads = [...leads];
        setLeads(prev => prev.filter(l => l.id !== leadId));

        try {
            await dbDeleteLead(leadId);
            toast.success("Lead deleted");
        } catch (err) {
            console.error(err);
            setLeads(oldLeads);
            toast.error("Failed to delete lead");
        }
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
