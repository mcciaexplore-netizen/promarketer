"use client"
import { useState } from 'react';
import {
    Plus,
    Search,
    Wand2,
    Building2,
    Globe,
    Download,
    CheckCircle2,
    ShieldAlert,
    Target
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function CompetitorsPage() {
    const [competitorInput, setCompetitorInput] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [aiReport, setAiReport] = useState(null);

    const handleAnalyze = () => {
        if (!competitorInput) return toast.error("Please enter a competitor name");
        setIsAnalyzing(true);
        // Mock AI call
        setTimeout(() => {
            setAiReport({
                name: competitorInput,
                strengths: ["Strong organic SEO presence", "High quality educational video content", "Clear pricing tiers on website"],
                weaknesses: ["No structured onboarding flow", "Very slow customer support response time", "Inconsistent social media posting frequency"],
                gaps: "They focus primarily on enterprise clients, leaving a massive gap for small-to-medium businesses needing faster, more affordable implementation.",
                strategy: "Focus your content on quick-wins and rapid deployment methodologies. Emphasize your 24/7 dedicated support which they lack."
            });
            setIsAnalyzing(false);
            toast.success("AI Analysis Complete!");
        }, 2000);
    };

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Competitor Intelligence</h1>
                <p className="text-text-secondary mt-1">Track market rivals, discover gaps, and generate counter-strategies.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: AI Analyzer (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="card p-5">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-accent" /> AI Competitor Analysis
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="label-text">Competitor Name or URL</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="e.g. Acme Corp or acme.com..."
                                    value={competitorInput}
                                    onChange={(e) => setCompetitorInput(e.target.value)}
                                />
                            </div>
                            <button
                                className="btn-primary w-full"
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                            >
                                {isAnalyzing ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                        Analyzing...
                                    </span>
                                ) : "Generate Analysis"}
                            </button>
                        </div>
                    </div>

                    <div className="card p-5">
                        <h3 className="font-bold text-lg mb-4">Tracked Competitors</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                <div>
                                    <p className="font-semibold text-text-primary text-sm flex items-center gap-2">
                                        <Building2 className="w-4 h-4 text-text-secondary" /> HubSpot
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> hubspot.com
                                    </p>
                                </div>
                            </li>
                            <li className="flex items-start justify-between p-3 border border-[#0176D3]/30 bg-[#e6f2fb] rounded-lg cursor-pointer">
                                <div>
                                    <p className="font-semibold text-primary text-sm flex items-center gap-2">
                                        <Building2 className="w-4 h-4" /> Salesforce
                                    </p>
                                    <p className="text-xs text-text-secondary mt-1 flex items-center gap-1">
                                        <Globe className="w-3 h-3" /> salesforce.com
                                    </p>
                                </div>
                            </li>
                        </ul>
                        <button className="btn-secondary w-full mt-4 !py-2 text-sm text-text-secondary border-dashed border-gray-300 hover:border-primary hover:text-primary">
                            <Plus className="w-4 h-4" /> Add Competitor manually
                        </button>
                    </div>
                </div>

                {/* Right Column: AI Report & Table (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">

                    {/* AI Report Module */}
                    <div className="card p-6 min-h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-white to-gray-50 relative overflow-hidden">
                        {!aiReport && !isAnalyzing && (
                            <div className="text-center max-w-sm">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Target className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-text-primary mb-2">Run an Analysis</h3>
                                <p className="text-sm text-text-secondary">Enter a competitor&apos;s name on the left and let AI uncover their weaknesses and your opportunities.</p>
                            </div>
                        )}

                        {isAnalyzing && (
                            <div className="text-center">
                                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                <p className="font-medium text-text-secondary animate-pulse">Scraping web data & analyzing positioning...</p>
                            </div>
                        )}

                        {aiReport && (
                            <div className="w-full h-full animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <span className="badge badge-primary mb-2 inline-block">AI Generated Report</span>
                                        <h2 className="text-2xl font-bold tracking-tight">{aiReport.name} vs Your Business</h2>
                                    </div>
                                    <button className="btn-secondary !py-1.5 !px-3 text-sm">
                                        <Download className="w-4 h-4" /> Export SWOT
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-6">
                                    <div className="bg-green-50/50 p-4 rounded-xl border border-green-100">
                                        <h4 className="font-bold text-success flex items-center gap-2 mb-3">
                                            <CheckCircle2 className="w-5 h-5" /> Estimated Strengths
                                        </h4>
                                        <ul className="space-y-2">
                                            {aiReport.strengths.map((s, i) => (
                                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-success mt-0.5">•</span> {s}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className="bg-red-50/50 p-4 rounded-xl border border-red-100">
                                        <h4 className="font-bold text-error flex items-center gap-2 mb-3">
                                            <ShieldAlert className="w-5 h-5" /> Estimated Weaknesses
                                        </h4>
                                        <ul className="space-y-2">
                                            {aiReport.weaknesses.map((w, i) => (
                                                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                                                    <span className="text-error mt-0.5">•</span> {w}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-white p-4 rounded-xl border border-[#E5E5E5] shadow-sm">
                                        <h4 className="label-text text-accent">Positioning Gaps</h4>
                                        <p className="text-sm text-text-primary leading-relaxed mt-1">{aiReport.gaps}</p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 shadow-sm relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                                        <h4 className="label-text text-primary">Suggested Counter-Strategy</h4>
                                        <p className="font-medium text-text-primary leading-relaxed mt-1 relative z-10">{aiReport.strategy}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Comparison Table */}
                    <div className="card overflow-x-auto">
                        <div className="p-5 border-b border-[#E5E5E5]">
                            <h3 className="font-bold text-lg">Market Comparison</h3>
                        </div>
                        <table className="min-w-full divide-y divide-[#E5E5E5]">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-4 text-left label-text text-[#888]">Metric</th>
                                    <th scope="col" className="px-6 py-4 text-left font-bold text-primary">Your Business (You)</th>
                                    <th scope="col" className="px-6 py-4 text-left font-bold text-text-primary">Salesforce</th>
                                    <th scope="col" className="px-6 py-4 text-left font-bold text-text-primary">HubSpot</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-100">
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-secondary">Pricing Tier</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary border-x-2 border-primary/20 bg-primary/5">Affordable / Pay per use</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">Premium ($150+/mo)</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">Freemium to Premium</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-secondary">Target Market</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-x-2 border-primary/20 bg-primary/5">B2B Agencies & Startups</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">Enterprise</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">Mid-market Businesses</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-secondary">Key Platforms</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm border-x-2 border-primary/20 bg-primary/5">LinkedIn, WhatsApp</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">Email, Direct Sales</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-primary">Inbound SEO, Socials</td>
                                </tr>
                                <tr className="hover:bg-gray-50/50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-secondary">Unique Selling Prop</td>
                                    <td className="px-6 py-4 text-sm border-x-2 border-primary/20 bg-primary/5 flexitems-center font-bold text-primary">All-in-one AI Marketing Agent</td>
                                    <td className="px-6 py-4 text-sm text-text-primary">Highly customizable CRM ecosystem</td>
                                    <td className="px-6 py-4 text-sm text-text-primary">Easiest interface for inbound flow</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                </div>

            </div>
        </div>
    );
}
