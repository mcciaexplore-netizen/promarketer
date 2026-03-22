"use client"
import React, { useState } from 'react';
import { useLeads } from '../context';
import { X, Phone, Mail, MoreHorizontal, User, Briefcase, Tag, Target, MessageSquare, Calendar as CalendarIcon, File as FileIcon, LogOut, CheckSquare } from 'lucide-react';
import Link from 'next/link';

export default function LeadDetailPanel() {
    const { selectedLead, setSelectedLead, activeSpace } = useLeads();
    const [activeTab, setActiveTab] = useState('overview');

    if (!selectedLead) return null;

    return (
        <>
            <div className="fixed inset-0 bg-[#091E42]/50 z-[100] transition-opacity duration-300 backdrop-blur-[1px]" onClick={() => setSelectedLead(null)} />
            <div
                className="fixed right-0 top-0 bottom-0 w-[480px] max-w-[100vw] bg-white shadow-2xl z-[110] flex flex-col transform transition-transform duration-300 ease-in-out border-l border-[#DFE1E6]"
            >

                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5E5E5] flex flex-col shrink-0 bg-gray-50/50">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-2 text-[11px] font-bold text-[#5E6C84] uppercase tracking-wide">
                            <Link href="/leads" className="hover:underline">{activeSpace}</Link>
                            <span>/</span>
                            <Link href={`/leads?board=${selectedLead.id}`} className="hover:underline">{selectedLead.id}</Link>
                        </div>
                        <div className="flex gap-2">
                            <button className="p-1 hover:bg-[#DFE1E6] rounded text-[#5E6C84] transition-colors"><MoreHorizontal className="w-5 h-5" /></button>
                            <button className="p-1 hover:bg-[#DFE1E6] rounded text-[#5E6C84] transition-colors" onClick={() => setSelectedLead(null)}><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <input type="text" className="text-2xl font-bold text-[#172B4D] hover:bg-white focus:bg-white px-1 -mx-1 py-0.5 rounded border border-transparent hover:border-gray-300 focus:outline-primary transition-colors" defaultValue={selectedLead.name} />
                        <div className="flex items-center gap-4 text-sm text-[#5E6C84]">
                            <span className="flex items-center gap-1.5 font-medium"><Briefcase className="w-4 h-4" /> {selectedLead.company}</span>
                        </div>
                    </div>

                    <div className="flex gap-4 mt-6">
                        {[
                            { id: 'overview', label: 'Overview' },
                            { id: 'activity', label: 'Activity' },
                            { id: 'notes', label: 'Notes' },
                            { id: 'files', label: 'Files' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                      pb-2 text-[13px] font-bold border-b-2 transition-colors
                      ${activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-[#5E6C84] hover:text-[#172B4D] hover:border-gray-300'}
                   `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-white">

                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-[12px] font-bold text-[#5E6C84] uppercase tracking-wider mb-4 border-b pb-2">Deal Details</h4>
                                <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                                    <div>
                                        <label className="text-[11px] font-bold text-[#5E6C84] block mb-1">Status</label>
                                        <select className="w-full text-sm font-semibold p-1.5 -ml-1.5 border border-transparent hover:border-gray-200 hover:bg-gray-50 focus:bg-white rounded transition-colors" defaultValue={selectedLead.status}>
                                            <option value="NEW">NEW</option>
                                            <option value="CONTACTED">CONTACTED</option>
                                            <option value="INTERESTED">INTERESTED</option>
                                            <option value="NEGOTIATING">NEGOTIATING</option>
                                            <option value="WON">WON</option>
                                            <option value="LOST">LOST</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-[#5E6C84] block mb-1">Assignee</label>
                                        <div className="flex items-center gap-2 cursor-pointer p-1 -ml-1 text-sm font-semibold border border-transparent hover:border-gray-200 hover:bg-gray-50 rounded transition-colors group">
                                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] text-blue-800">{selectedLead.assignee?.full_name?.[0]?.toUpperCase() || '?'}</div>
                                            {selectedLead.assignee?.full_name || 'Unassigned'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-[#5E6C84] block mb-1">Deal Value</label>
                                        <input className="w-full text-sm font-bold p-1 border border-transparent hover:bg-gray-50 hover:border-gray-200 focus:bg-white rounded -m-1 focus:outline-primary transition-colors text-green-700" type="text" defaultValue={`₹${Number(selectedLead.deal_value || 0).toLocaleString()}`} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-[#5E6C84] block mb-1">Source</label>
                                        <input className="w-full text-sm font-semibold p-1 border border-transparent hover:bg-gray-50 hover:border-gray-200 focus:bg-white rounded -m-1 focus:outline-primary transition-colors" type="text" defaultValue={selectedLead.source} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-[#5E6C84] block mb-1">Next Follow-up</label>
                                        <input className="w-full text-sm font-semibold p-1 border border-transparent hover:bg-gray-50 hover:border-gray-200 focus:bg-white rounded -m-1 focus:outline-primary transition-colors text-primary" type="date" defaultValue={selectedLead.next_followup} />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-bold text-[#5E6C84] block mb-1">Last Contacted</label>
                                        <div className="w-full text-sm font-medium p-1 text-gray-400 -m-1 cursor-default">{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString() : '—'}</div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="text-[12px] font-bold text-[#5E6C84] uppercase tracking-wider mb-4 border-b pb-2 mt-8">Contact Information</h4>
                                <div className="space-y-4">
                                    <div className="flex gap-4 items-center group">
                                        <Mail className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-[#5E6C84] block mb-0.5">Email Address</label>
                                            <input className="w-full text-sm p-1 border border-transparent hover:bg-gray-50 hover:border-gray-200 focus:bg-white rounded -m-1 focus:outline-primary transition-colors" type="email" defaultValue={selectedLead.email} />
                                        </div>
                                    </div>
                                    <div className="flex gap-4 items-center group">
                                        <Phone className="w-4 h-4 text-gray-400 mt-1" />
                                        <div className="flex-1">
                                            <label className="text-[11px] font-bold text-[#5E6C84] block mb-0.5">Phone Number</label>
                                            <input className="w-full text-sm p-1 border border-transparent hover:bg-gray-50 hover:border-gray-200 focus:bg-white rounded -m-1 focus:outline-primary transition-colors" type="tel" defaultValue={selectedLead.phone} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'notes' && (
                        <div className="flex flex-col h-full">
                            <textarea className="w-full h-[150px] p-4 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none custom-scrollbar mb-4 transition-all" placeholder="Add a new note here. Markdown supported..."></textarea>
                            <div className="flex justify-end mb-6">
                                <button className="btn-primary !py-1.5 !px-4 shadow-sm text-sm">Save Note</button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
                                <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-700">P</div>
                                            <span className="text-[12px] font-bold text-[#172B4D]">Pratik</span>
                                        </div>
                                        <span className="text-[11px] font-medium text-[#5E6C84]">Yesterday at 4:32 PM</span>
                                    </div>
                                    <p className="text-[14px] text-[#172B4D] leading-relaxed mt-2">Had a quick onboarding sync. They are highly interested in the CRM automation layer but need manager approval for budget. Scheduled a follow-up demo for next week.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'activity' && (
                        <div className="relative pl-6 space-y-8 my-4">
                            <div className="absolute top-2 left-[11px] bottom-0 w-px bg-[#DFE1E6]" />

                            <div className="relative">
                                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                                    <Phone className="w-3 h-3 text-blue-700" />
                                </div>
                                <div className="bg-white border border-[#DFE1E6] rounded-lg p-3 shadow-sm relative after:absolute after:top-2 after:-left-1.5 after:border-[6px] after:border-transparent after:border-r-[#DFE1E6]">
                                    <div className="absolute top-2 -left-[5px] border-[5px] border-transparent border-r-white z-10"></div>
                                    <p className="text-[13px] text-[#172B4D]"><strong>Pratik</strong> logged a call</p>
                                    <p className="text-[12px] text-[#5E6C84] mt-1">&quot;Left a voicemail.&quot;</p>
                                    <span className="text-[10px] font-bold text-[#5E6C84] uppercase mt-3 block">{selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString() : '—'}</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-6 top-0 w-6 h-6 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
                                    <User className="w-3 h-3 text-green-700" />
                                </div>
                                <div className="bg-white border border-[#DFE1E6] rounded-lg p-3 shadow-sm relative after:absolute after:top-2 after:-left-1.5 after:border-[6px] after:border-transparent after:border-r-[#DFE1E6]">
                                    <div className="absolute top-2 -left-[5px] border-[5px] border-transparent border-r-white z-10"></div>
                                    <p className="text-[13px] text-[#172B4D]">Lead moved to <strong>{selectedLead.status}</strong></p>
                                    <span className="text-[10px] font-bold text-[#5E6C84] uppercase mt-2 block">Oct 20, 2026</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'files' && (
                        <div className="h-full flex flex-col items-center justify-center text-center -mt-10">
                            <FileIcon className="w-12 h-12 text-[#DFE1E6] mb-4" />
                            <p className="text-[14px] font-bold text-[#172B4D] mb-2">No files attached yet</p>
                            <p className="text-[13px] text-[#5E6C84]">Upload contracts, invoices, or proposals here.</p>
                            <button className="btn-secondary mt-6 shadow-sm font-semibold">Upload File</button>
                        </div>
                    )}

                </div>

                {/* Quick Actions Footer */}
                <div className="px-6 py-4 border-t border-[#E5E5E5] bg-[#F4F5F7] shrink-0">
                    <div className="flex items-center gap-2 w-full justify-between">
                        <Link href={`/whatsapp?leadId=${selectedLead.id}`} className="flex-1 flex justify-center items-center gap-2 font-bold text-[13px] text-white bg-[#25D366] hover:bg-[#128C7E] px-3 py-2 rounded shadow-sm transition-colors">
                            <MessageSquare className="w-4 h-4" /> WhatsApp
                        </Link>
                        <Link href={`/email?leadId=${selectedLead.id}`} className="flex-1 flex justify-center items-center gap-2 font-bold text-[13px] text-[#172B4D] bg-white border border-[#DFE1E6] hover:bg-gray-50 px-3 py-2 rounded shadow-sm transition-colors">
                            <Mail className="w-4 h-4" /> Email
                        </Link>
                        <button className="p-2 border border-[#DFE1E6] bg-white hover:bg-gray-50 rounded shadow-sm transition-colors text-[#5E6C84]">
                            <Phone className="w-4 h-4" />
                        </button>
                        <button className="p-2 border border-[#DFE1E6] bg-white hover:bg-gray-50 rounded shadow-sm transition-colors text-[#5E6C84]">
                            <CalendarIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </>
    );
}
