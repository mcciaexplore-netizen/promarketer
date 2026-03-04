"use client"
import React from 'react';
import { useLeads } from '../context';
import { MoreVertical, ArrowUpDown, Download, Trash2, Edit3 } from 'lucide-react';

function StatusBadge({ status }) {
    const styles = {
        'NEW': 'bg-[#E8F4FD] text-[#0176D3]',
        'CONTACTED': 'bg-[#FFF3CD] text-[#856404]',
        'INTERESTED': 'bg-[#D4EDDA] text-[#155724]',
        'NEGOTIATING': 'bg-[#FFF0E6] text-[#CC4400]',
        'WON': 'bg-[#D4EDDA] text-[#0D5723]',
        'LOST': 'bg-[#F8D7DA] text-[#721C24]'
    };
    return (
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}

export default function ListView() {
    const { leads, setSelectedLead, deleteLead } = useLeads();
    const [selectedRows, setSelectedRows] = React.useState([]);

    const toggleRow = (id) => {
        if (selectedRows.includes(id)) setSelectedRows(selectedRows.filter(r => r !== id));
        else setSelectedRows([...selectedRows, id]);
    };

    const toggleAll = (e) => {
        if (e.target.checked) setSelectedRows(leads.map(l => l.id));
        else setSelectedRows([]);
    };

    return (
        <div className="h-full flex flex-col bg-white rounded-lg border border-[#E5E5E5] shadow-sm overflow-hidden select-text relative">

            {/* Toolbar */}
            {selectedRows.length > 0 && (
                <div className="absolute top-0 left-0 right-0 h-[48px] z-20 bg-[#F5F8FF] border-b border-[#E5E5E5] px-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-primary">{selectedRows.length} leads selected</span>
                    <div className="flex items-center gap-3">
                        <button className="text-sm font-semibold text-[#5E6C84] hover:text-primary flex items-center gap-1.5"><Download className="w-4 h-4" /> Export CSV</button>
                        <button className="text-sm font-semibold text-[#5E6C84] hover:text-warning flex items-center gap-1.5"><Edit3 className="w-4 h-4" /> Change Status</button>
                        <button className="text-sm font-semibold text-error hover:text-red-700 flex items-center gap-1.5"><Trash2 className="w-4 h-4" /> Delete</button>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-auto custom-scrollbar relative">
                <div className="min-w-[1000px] w-full" style={{ display: 'table', tableLayout: 'fixed' }}>

                    {/* HEADER Row using CSS Grid inside table header structural approach to guarantee exact sizing */}
                    <div className="sticky top-0 z-10 bg-white border-b-2 border-[#E5E5E5] group">
                        <div
                            className="grid px-4 py-3"
                            style={{ gridTemplateColumns: '40px 2fr 2fr 1fr 1fr 1fr 1fr 80px' }}
                        >
                            <div className="flex items-center">
                                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary" checked={selectedRows.length === leads.length && leads.length > 0} onChange={toggleAll} />
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] tracking-[1px] uppercase cursor-pointer hover:text-primary"><ArrowUpDown className="w-3 h-3" /> Lead / Company</div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] tracking-[1px] uppercase">Contact Info</div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] tracking-[1px] uppercase">Source</div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] tracking-[1px] uppercase cursor-pointer hover:text-primary"><ArrowUpDown className="w-3 h-3" /> Status</div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] tracking-[1px] uppercase cursor-pointer hover:text-primary"><ArrowUpDown className="w-3 h-3" /> Next Follow-up</div>
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#666] tracking-[1px] uppercase cursor-pointer hover:text-primary"><ArrowUpDown className="w-3 h-3" /> Deal Value</div>
                            <div className="flex items-center justify-end text-[11px] font-semibold text-[#666] tracking-[1px] uppercase">Actions</div>
                        </div>
                    </div>

                    {/* BODY Rows */}
                    <div className="flex flex-col">
                        {leads.map(lead => (
                            <div
                                key={lead.id}
                                onClick={() => setSelectedLead(lead)}
                                className={`
                    grid px-4 py-3.5 border-b border-[#E5E5E5] hover:bg-[#F5F8FF] transition-colors cursor-pointer group
                    ${selectedRows.includes(lead.id) ? 'bg-[#F5F8FF]' : 'bg-white'}
                 `}
                                style={{ gridTemplateColumns: '40px 2fr 2fr 1fr 1fr 1fr 1fr 80px' }}
                            >
                                <div className="flex items-center" onClick={(e) => { e.stopPropagation(); toggleRow(lead.id); }}>
                                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary" checked={selectedRows.includes(lead.id)} readOnly />
                                </div>

                                <div className="flex flex-col justify-center pr-4 truncate">
                                    <span className="text-[14px] font-semibold text-[#181818] truncate">{lead.name}</span>
                                    <span className="text-[13px] text-[#5E6C84] mt-0.5 truncate">{lead.company}</span>
                                </div>

                                <div className="flex flex-col justify-center pr-4 truncate">
                                    <span className="text-[13px] text-[#181818] truncate">{lead.email}</span>
                                    <span className="text-[13px] text-[#5E6C84] mt-0.5 truncate">{lead.phone}</span>
                                </div>

                                <div className="flex items-center">
                                    <span className="text-[12px] px-2 py-0.5 bg-gray-100 text-[#444] rounded border border-gray-200">{lead.source}</span>
                                </div>

                                <div className="flex items-center">
                                    <StatusBadge status={lead.status} />
                                </div>

                                <div className="flex flex-col justify-center pr-2">
                                    <span className="text-[13px] font-medium text-[#181818]">{lead.nextFollowUp}</span>
                                </div>

                                <div className="flex items-center">
                                    <span className="text-[14px] font-semibold text-[#181818]">₹{lead.value.toLocaleString()}</span>
                                </div>

                                <div className="flex items-center justify-end">
                                    <button className="p-1.5 text-gray-400 hover:text-primary rounded hover:bg-white border border-transparent hover:border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all mr-1" onClick={(e) => { e.stopPropagation(); deleteLead(lead.id); }}>
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button className="p-1.5 text-[#5E6C84] hover:text-[#181818] rounded hover:bg-gray-100">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {leads.length === 0 && (
                            <div className="p-10 text-center text-text-secondary">
                                No leads found. Create some in the Board view!
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-[#E5E5E5] px-4 py-3 bg-white flex justify-between items-center text-sm text-[#5E6C84]">
                <span>Showing 1 to {leads.length} of {leads.length} leads</span>
                <div className="flex gap-2">
                    <button className="px-3 py-1 border border-gray-200 rounded text-gray-400 bg-gray-50 cursor-not-allowed">Previous</button>
                    <button className="px-3 py-1 border border-primary text-primary bg-primary/5 rounded font-medium cursor-not-allowed">Next</button>
                </div>
            </div>

        </div>
    );
}
