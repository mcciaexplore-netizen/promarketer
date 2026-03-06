"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  TrendingDown,
  Target,
  CalendarDays,
  Plus,
  ChevronRight,
  MoreVertical,
  Instagram,
  Linkedin
} from 'lucide-react';
import { getSupabaseClient } from '../lib/supabaseClient';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const KPIS = [
  { name: 'Active Campaigns', value: '3', trend: '+12%', isUp: true, icon: Target, color: 'text-primary', bg: 'bg-[#e6f2fb]' },
  { name: 'Leads This Month', value: '142', trend: '+24%', isUp: true, icon: Target, color: 'text-success', bg: 'bg-[#e5f4ea]' },
  { name: 'Posts Scheduled', value: '28', trend: '-5%', isUp: false, icon: CalendarDays, color: 'text-warning', bg: 'bg-[#fef5e1]' },
];

const UPCOMING_ACTIONS = [
  { id: 1, date: 'Today, 2:00 PM', title: 'Publish Product Launch Post', platform: 'LinkedIn', type: 'Social Media' },
  { id: 2, date: 'Tomorrow, 9:00 AM', title: 'Send Newsletter Batch 1', platform: 'Email', type: 'Email Campaign' },
  { id: 3, date: 'Oct 28, 10:00 AM', title: 'Review Diwali Ad Spend', platform: 'Google Ads', type: 'PPC' },
  { id: 4, date: 'Oct 29, 4:00 PM', title: 'Follow up with Enterprise Leads', platform: 'CRM', type: 'Sales' },
];

const RECENT_LEADS = [
  { id: 1, name: 'Rahul Sharma', company: 'TechNova Solutions', status: 'New', lastContact: '2 hours ago' },
  { id: 2, name: 'Priya Patel', company: 'CloudScale Inc', status: 'Interested', lastContact: '1 day ago' },
  { id: 3, name: 'Amit Kumar', company: 'Global Logistics', status: 'Negotiating', lastContact: '3 days ago' },
  { id: 4, name: 'Sarah Jones', company: 'DesignStudio', status: 'Contacted', lastContact: '5 days ago' },
];

const CONTENT_DUE = [
  { id: 1, date: 'Oct 26', platform: 'Instagram', caption: "Excited to announce our new Q4 features! 🚀...", icon: Instagram, color: 'text-pink-600' },
  { id: 2, date: 'Oct 27', platform: 'LinkedIn', caption: "Here are 5 ways our enterprise clients are scaling...", icon: Linkedin, color: 'text-blue-700' },
];

const LEADS_DATA = [
  { name: 'New', value: 45, color: '#e6f2fb' },
  { name: 'Contacted', value: 30, color: '#f3f4f6' },
  { name: 'Interested', value: 25, color: '#e5f4ea' },
  { name: 'Negotiating', value: 15, color: '#fef5e1' },
];

function StatusBadge({ status }) {
  const styles = {
    'New': 'badge-primary',
    'Interested': 'badge-success',
    'Negotiating': 'badge-warning',
    'Contacted': 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`badge ${styles[status] || 'bg-gray-100'}`}>
      {status}
    </span>
  );
}

export default function Dashboard() {
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const supabase = getSupabaseClient();
    if (!supabase) return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      const meta = session?.user?.user_metadata;
      const name = meta?.full_name || session?.user?.email?.split('@')[0] || '';
      setUserName(name.split(' ')[0]);
    });
  }, []);

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="pb-4">
        <h2 className="text-2xl font-bold tracking-tight text-text-primary">
          Good morning, {userName} 👋
        </h2>
        <p className="text-text-secondary mt-1">Here is your marketing snapshot for today.</p>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.name} className="card p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-secondary">{kpi.name}</p>
                  <p className="text-3xl font-bold text-text-primary mt-2">{kpi.value}</p>
                </div>
                <div className={`p-3 rounded-full ${kpi.bg}`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                {kpi.isUp ? (
                  <TrendingUp className="w-4 h-4 text-success mr-1" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-warning mr-1" />
                )}
                <span className={kpi.isUp ? "text-success font-medium" : "text-warning font-medium"}>
                  {kpi.trend}
                </span>
                <span className="text-text-secondary ml-2">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid (8 + 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Upcoming Actions Panel (8 col) */}
        <div className="lg:col-span-8 card flex flex-col">
          <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-center">
            <h3 className="font-bold text-lg">Upcoming Campaign Actions</h3>
            <button className="text-sm text-primary hover:text-primary-hover font-medium">View Calendar</button>
          </div>
          <div className="p-5 flex-1">
            <div className="space-y-6">
              {UPCOMING_ACTIONS.map((action, idx) => (
                <div key={action.id} className="relative pl-6">
                  {/* Timeline connector */}
                  {idx !== UPCOMING_ACTIONS.length - 1 && (
                    <div className="absolute top-6 left-[11px] bottom-[-24px] w-px bg-gray-200" />
                  )}
                  {/* Timeline dot */}
                  <div className="absolute top-1.5 left-0 w-[22px] h-[22px] rounded-full bg-white border-2 border-primary z-10" />

                  <div>
                    <span className="text-xs font-semibold text-primary uppercase tracking-wider">{action.date}</span>
                    <p className="font-semibold text-text-primary mt-1">{action.title}</p>
                    <p className="text-sm text-text-secondary mt-0.5">{action.type} • {action.platform}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel (4 col) */}
        <div className="lg:col-span-4 card flex flex-col">
          <div className="p-5 border-b border-[#E5E5E5]">
            <h3 className="font-bold text-lg">Quick Actions</h3>
          </div>
          <div className="p-5 grid grid-cols-1 gap-3">
            <button className="btn-primary w-full shadow-sm">
              <Plus className="w-4 h-4" /> Add New Lead
            </button>
            <button className="btn-secondary w-full">
              <CalendarDays className="w-4 h-4" /> Schedule Post
            </button>
            <button className="btn-secondary w-full">
              <Target className="w-4 h-4" /> New Campaign
            </button>
          </div>
        </div>

      </div>

      {/* Bottom Section (8 + 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Leads Table (8 col) */}
        <div className="lg:col-span-8 card">
          <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-center">
            <h3 className="font-bold text-lg">Recent Leads</h3>
            <Link href="/leads" className="text-sm flex items-center text-primary hover:text-primary-hover font-medium">
              View All <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Name / Company</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">Last Contact</th>
                  <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {RECENT_LEADS.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-text-primary">{lead.name}</div>
                      <div className="text-sm text-text-secondary">{lead.company}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={lead.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {lead.lastContact}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-text-primary">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Content Due This Week (4 col) */}
        <div className="lg:col-span-4 card">
          <div className="p-5 border-b border-[#E5E5E5] flex justify-between items-center">
            <h3 className="font-bold text-lg">Content Due</h3>
          </div>
          <div className="p-5">
            <ul className="space-y-4">
              {CONTENT_DUE.map((item) => {
                const PlatformIcon = item.icon;
                return (
                  <li key={item.id} className="flex gap-4">
                    <div className="shrink-0 mt-1">
                      <PlatformIcon className={`w-5 h-5 ${item.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary line-clamp-2">{item.caption}</p>
                      <p className="text-xs text-text-secondary mt-1">{item.platform} • Due {item.date}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 pt-4 border-t border-gray-100">
              <Link href="/scheduler" className="text-sm flex items-center text-primary justify-center font-medium">
                Open Content Calendar
              </Link>
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-1">
          <div className="p-5 border-b border-[#E5E5E5]">
            <h3 className="font-bold text-lg">Leads by Status</h3>
          </div>
          <div className="p-5 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={LEADS_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {LEADS_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke={entry.name === 'Contacted' ? '#d1d5db' : entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
}
