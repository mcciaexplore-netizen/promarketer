"use client"
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useLeads, STATUS_COLUMNS } from '../context';
import { MoreHorizontal, Plus, Briefcase, FileText } from 'lucide-react';

export default function BoardView() {
    const { leads, updateLeadStatus, setSelectedLead, addLead } = useLeads();
    const [addingToCol, setAddingToCol] = useState(null);
    const [newLeadForm, setNewLeadForm] = useState({ name: '', company: '' });

    const onDragEnd = (result) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;

        if (source.droppableId !== destination.droppableId) {
            updateLeadStatus(draggableId, destination.droppableId);
        }
    };

    const handleQuickAdd = (e, col) => {
        e.preventDefault();
        if (newLeadForm.name) {
            addLead({ ...newLeadForm, status: col });
            setNewLeadForm({ name: '', company: '' });
            setAddingToCol(null);
        }
    };

    return (
        <div className="flex h-full overflow-x-auto overflow-y-hidden bg-[#F4F5F7] p-2 rounded-xl custom-scrollbar gap-4 pb-4 select-none">
            <DragDropContext onDragEnd={onDragEnd}>
                {STATUS_COLUMNS.map((col) => {
                    const colLeads = leads.filter(l => l.status === col);

                    return (
                        <div key={col} className="flex flex-col bg-[#EBECF0] w-[280px] shrink-0 rounded-lg max-h-full pb-2 shadow-sm">

                            {/* Column Header */}
                            <div className="p-3 pb-2 flex justify-between items-center group cursor-pointer sticky top-0 rounded-t-lg">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-[11px] font-bold text-[#5E6C84] uppercase tracking-wide truncate">{col}</h3>
                                    <span className="bg-[#DFE1E6] text-[#172B4D] text-[11px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                        {colLeads.length}
                                    </span>
                                </div>
                                <button className="text-[#6B778C] hover:bg-[#DFE1E6] p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                    <MoreHorizontal className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Droppable Area */}
                            <Droppable droppableId={col}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`flex-1 overflow-y-auto px-2 min-h-[50px] custom-scrollbar ${snapshot.isDraggingOver ? 'bg-blue-50/50' : ''}`}
                                    >
                                        {colLeads.map((lead, index) => (
                                            <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => setSelectedLead(lead)}
                                                        className={`
                                group bg-white p-3 rounded shadow-sm mb-2 hover:bg-gray-50 border border-transparent hover:border-[#DFE1E6]
                                ${snapshot.isDragging ? '!shadow-lg !rotate-[2deg] ring-1 ring-primary border-primary scale-[1.02]' : ''}
                              `}
                                                        style={provided.draggableProps.style}
                                                    >
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-semibold text-[14px] text-[#172B4D] leading-tight truncate pr-2">{lead.name}</h4>
                                                            <button className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-gray-200 text-[#5E6C84]">
                                                                <MoreHorizontal className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                        <p className="text-[12px] text-[#5E6C84] mb-3 flex items-center gap-1"><Briefcase className="w-3 h-3" /> {lead.company}</p>

                                                        <div className="flex justify-between items-center">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[11px] font-medium text-[#5E6C84] bg-[#DFE1E6] px-1.5 py-0.5 rounded">{lead.id}</span>
                                                                {lead.source && <span className="text-[10px] font-semibold text-white bg-indigo-500 px-1.5 py-0.5 rounded">{lead.source}</span>}
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-[12px] font-semibold text-gray-700">₹{lead.value.toLocaleString()}</span>
                                                                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-700 ml-1" title={lead.assignee}>
                                                                    {lead.assignee[0]}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}

                                        {colLeads.length === 0 && !snapshot.isDraggingOver && (
                                            <div className="border border-dashed border-[#C1C7D0] rounded-lg p-4 m-2 flex flex-col items-center justify-center text-center opacity-50">
                                                <FileText className="w-6 h-6 text-[#5E6C84] mb-2" />
                                                <p className="text-[11px] font-semibold text-[#5E6C84]">Drop leads here</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </Droppable>

                            {/* Quick Add Footer */}
                            <div className="px-2 pt-2">
                                {addingToCol === col ? (
                                    <form onSubmit={(e) => handleQuickAdd(e, col)} className="bg-white p-2 rounded shadow-sm">
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Lead name..."
                                            className="w-full text-sm border-2 border-primary rounded p-1 mb-2 outline-none"
                                            value={newLeadForm.name}
                                            onChange={e => setNewLeadForm({ ...newLeadForm, name: e.target.value })}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Company (optional)"
                                            className="w-full text-sm border border-gray-200 rounded p-1 mb-2 outline-none"
                                            value={newLeadForm.company}
                                            onChange={e => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" className="btn-primary !py-1 !px-2 text-xs flex-1">Save</button>
                                            <button type="button" onClick={() => setAddingToCol(null)} className="btn-secondary !py-1 !px-2 text-xs border-none bg-gray-100">Cancel</button>
                                        </div>
                                    </form>
                                ) : (
                                    <button
                                        className="w-full flex items-center gap-1 hover:bg-[#DFE1E6] text-[#5E6C84] text-[13px] font-medium p-2 rounded transition-colors"
                                        onClick={() => setAddingToCol(col)}
                                    >
                                        <Plus className="w-4 h-4" /> Create
                                    </button>
                                )}
                            </div>

                        </div>
                    );
                })}
            </DragDropContext>
        </div>
    );
}
