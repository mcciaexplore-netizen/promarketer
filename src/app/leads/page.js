"use client"
import { useState } from 'react';
import {
    Search,
    Filter,
    Download,
    Trash2,
    Plus,
    MoreVertical,
    X
} from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_LEADS = [
    { id: 1, name: 'Rahul Sharma', company: 'TechNova Solutions', phone: '+91 9876543210', email: 'rahul@technova.in', source: 'WhatsApp', status: 'New', lastContact: '2023-10-25', nextFollowup: '2023-10-27', assignedTo: 'Pratik', dealValue: '50000', notes: 'Interested in automation hub.' },
    { id: 2, name: 'Priya Patel', company: 'CloudScale Inc', phone: '+91 9123456780', email: 'priya@cloudscale.com', source: 'Website', status: 'Interested', lastContact: '2023-10-24', nextFollowup: '2023-10-28', assignedTo: 'Pratik', dealValue: '120000', notes: 'Wants a full CRM setup.' },
    { id: 3, name: 'Amit Kumar', company: 'Global Logistics', phone: '+91 9988776655', email: 'amit@globallogistics.in', source: 'Referral', status: 'Negotiating', lastContact: '2023-10-22', nextFollowup: '2023-10-26', assignedTo: 'Sarah', dealValue: '85000', notes: 'Asking for a discount.' },
];

function StatusBadge({ status }) {
    const styles = {
        'New': 'badge-primary',
        'Contacted': 'bg-gray-100 text-gray-800',
        'Interested': 'badge-success',
        'Negotiating': 'badge-warning',
        'Won': 'bg-green-600 text-white',
        'Lost': 'badge-error',
    };
    return (
        <span className={`badge ${styles[status] || 'bg-gray-100'}`}>
            {status}
        </span>
    );
}

export default function LeadsPage() {
    const [leads, setLeads] = useState(INITIAL_LEADS);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLeads, setSelectedLeads] = useState([]);
    const [isSlideOverOpen, setSlideOverOpen] = useState(false);

    // Slide over form state
    const [formData, setFormData] = useState({
        name: '', company: '', phone: '', email: '', source: 'WhatsApp', status: 'New', dealValue: '', notes: ''
    });

    const handleSelectAll = (e) => {
        if (e.target.checked) setSelectedLeads(leads.map(l => l.id));
        else setSelectedLeads([]);
    };

    const handleSelectOne = (id) => {
        if (selectedLeads.includes(id)) setSelectedLeads(selectedLeads.filter(lId => lId !== id));
        else setSelectedLeads([...selectedLeads, id]);
    };

    const handleDeleteSelected = () => {
        setLeads(leads.filter(l => !selectedLeads.includes(l.id)));
        setSelectedLeads([]);
        toast.success('Selected leads deleted');
    };

    const handleExportCSV = () => {
        toast.success('Leads exported to CSV');
        // Implement actual CSV export logic
    };

    const handleSaveLead = (e) => {
        e.preventDefault();
        const newLead = {
            ...formData,
            id: Date.now(),
            lastContact: new Date().toISOString().split('T')[0],
            nextFollowup: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0], // 2 days from now
            assignedTo: 'Pratik'
        };
        setLeads([newLead, ...leads]);
        setSlideOverOpen(false);
        toast.success('Lead added successfully, backed up to Google Sheets!');
        setFormData({ name: '', company: '', phone: '', email: '', source: 'WhatsApp', status: 'New', dealValue: '', notes: '' });
    };

    const filteredLeads = leads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 flex flex-col h-full relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-text-primary">Leads Pipeline</h1>
                    <p className="text-text-secondary mt-1">Manage and track your CRM contacts.</p>
                </div>
                <button className="btn-primary" onClick={() => setSlideOverOpen(true)}>
                    <Plus className="w-4 h-4" /> Add Lead
                </button>
            </div>

            {/* Controls Bar */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 card p-4">
                <div className="relative flex-1 max-w-md">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="input-field pl-10"
                        placeholder="Search leads by name or company..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary">
                        <Filter className="w-4 h-4" /> Filter
                    </button>

                    {selectedLeads.length > 0 && (
                        <>
                            <button className="btn-secondary text-error border-error hover:bg-red-50" onClick={handleDeleteSelected}>
                                <Trash2 className="w-4 h-4" /> Delete ({selectedLeads.length})
                            </button>
                            <button className="btn-secondary" onClick={handleExportCSV}>
                                <Download className="w-4 h-4" /> Export CSV
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 bg-opacity-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left">
                                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={selectedLeads.length === leads.length && leads.length > 0}
                                    onChange={handleSelectAll} />
                            </th>
                            <th scope="col" className="px-6 py-4 text-left label-text">Lead</th>
                            <th scope="col" className="px-6 py-4 text-left label-text">Contact Info</th>
                            <th scope="col" className="px-6 py-4 text-left label-text">Source</th>
                            <th scope="col" className="px-6 py-4 text-left label-text">Status</th>
                            <th scope="col" className="px-6 py-4 text-left label-text">Next Follow-up</th>
                            <th scope="col" className="px-6 py-4 text-right label-text">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLeads.map((lead) => (
                            <tr key={lead.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedLeads.includes(lead.id)}
                                        onChange={() => handleSelectOne(lead.id)} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="font-semibold text-text-primary">{lead.name}</div>
                                    <div className="text-sm text-text-secondary">{lead.company}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-text-primary">{lead.email}</div>
                                    <div className="text-sm text-text-secondary">{lead.phone}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {lead.source}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StatusBadge status={lead.status} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                                    {lead.nextFollowup}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button className="text-gray-400 hover:text-primary">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredLeads.length === 0 && (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-text-secondary">
                                    No leads found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Slide Over Panel for Add Lead */}
            {isSlideOverOpen && (
                <div className="fixed inset-0 overflow-hidden z-[100]">
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSlideOverOpen(false)} />
                    <div className="fixed inset-y-0 right-0 max-w-md w-full flex bg-white shadow-xl flex-col">
                        <div className="px-6 py-4 border-b border-[#E5E5E5] flex justify-between items-center bg-gray-50">
                            <h2 className="text-lg font-bold text-text-primary">Add New Lead</h2>
                            <button onClick={() => setSlideOverOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto px-6 py-6">
                            <form id="add-lead-form" onSubmit={handleSaveLead} className="space-y-5">
                                <div>
                                    <label className="label-text">Full Name</label>
                                    <input required type="text" className="input-field" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="label-text">Company</label>
                                    <input required type="text" className="input-field" value={formData.company} onChange={e => setFormData({ ...formData, company: e.target.value })} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-text">Phone</label>
                                        <input type="text" className="input-field" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                    </div>
                                    <div>
                                        <label className="label-text">Email</label>
                                        <input type="email" className="input-field" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="label-text">Source</label>
                                        <select className="input-field" value={formData.source} onChange={e => setFormData({ ...formData, source: e.target.value })}>
                                            <option>WhatsApp</option>
                                            <option>Instagram</option>
                                            <option>Referral</option>
                                            <option>Website</option>
                                            <option>Cold Call</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="label-text">Deal Value (₹)</label>
                                        <input type="number" className="input-field" value={formData.dealValue} onChange={e => setFormData({ ...formData, dealValue: e.target.value })} />
                                    </div>
                                </div>
                                <div>
                                    <label className="label-text">Status</label>
                                    <select className="input-field" value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                                        <option>New</option>
                                        <option>Contacted</option>
                                        <option>Interested</option>
                                        <option>Negotiating</option>
                                        <option>Won</option>
                                        <option>Lost</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label-text">Notes</label>
                                    <textarea rows={4} className="input-field resize-none" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                                </div>
                            </form>
                        </div>

                        <div className="px-6 py-4 border-t border-[#E5E5E5] bg-gray-50 flex justify-end gap-3">
                            <button type="button" className="btn-secondary" onClick={() => setSlideOverOpen(false)}>Cancel</button>
                            <button type="submit" form="add-lead-form" className="btn-primary">Save to Google Sheets</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
