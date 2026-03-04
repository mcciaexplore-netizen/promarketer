"use client"
import { useState } from 'react';
import {
    Copy,
    Wand2,
    CheckCircle2,
    FileText,
    AlignLeft,
    Hash,
    Lightbulb,
    Megaphone
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ContentStudioPage() {
    const [activeTab, setActiveTab] = useState('captions');
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedOutput, setGeneratedOutput] = useState(null);

    // Forms state
    const [captionData, setCaptionData] = useState({ platform: 'Instagram', tone: 'Professional', variations: 3, prompt: '' });
    const [adData, setAdData] = useState({ product: '', usp: '', audience: '', platform: 'Meta Ads' });
    const [blogData, setBlogData] = useState({ topic: '', keyword: '', level: 'Intermediate' });

    const getPlatformLimit = (platform) => {
        switch (platform) {
            case 'Instagram': return 2200;
            case 'LinkedIn': return 3000;
            case 'Twitter': return 280;
            default: return 2200;
        }
    }

    const handleGenerateCaptions = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setGeneratedOutput(null);
        setTimeout(() => {
            setGeneratedOutput({
                type: 'captions',
                data: Array.from({ length: captionData.variations }).map((_, i) => (
                    `🚀 Variation ${i + 1}:\nHere's an amazing post generated specifically for ${captionData.platform} with a ${captionData.tone} tone. Keep your audience engaged with dynamic content that converts!\n\n#marketing #AI #automation`
                ))
            });
            setIsGenerating(false);
            toast.success('Captions generated!');
        }, 1500);
    };

    const handleGenerateAd = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setGeneratedOutput(null);
        setTimeout(() => {
            setGeneratedOutput({
                type: 'ad',
                data: {
                    headline: `Boost Your ROI with ${adData.product || 'AI Tools'}`,
                    primaryText: `Stop wasting hours on manual tasks. Our ${adData.usp || 'automation suite'} helps ${adData.audience || 'startups'} scale faster than ever before. Try it today for free!`,
                    description: `Get 50% off your first month.`
                }
            });
            setIsGenerating(false);
            toast.success('Ad copy generated!');
        }, 1500);
    };

    const handleGenerateBlog = (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setGeneratedOutput(null);
        setTimeout(() => {
            setGeneratedOutput({
                type: 'blog',
                data: `
# H1: The Ultimate Guide to ${blogData.topic || 'AI Marketing'}
Targeting keyword: "${blogData.keyword || 'ai automation'}" | Level: ${blogData.level}

## H2: Understanding the Fundamentals
- Introduce core concepts
- Provide relatable industry examples

## H2: Key Benefits for Your Business
- Time savings and efficiency bounds
- Measurable ROI tracking

### H3: Real-world Case Studies
- Highlight startup success story
- Show how the target keyword fits into modern strategy

## H2: Getting Started Today
- Step-by-step actionable guide
- Conclusion and call to action
        `
            });
            setIsGenerating(false);
            toast.success('Blog outline generated!');
        }, 1500);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success('Copied to clipboard');
    };

    const renderTabIcon = (tab) => {
        switch (tab) {
            case 'captions': return <AlignLeft className="w-4 h-4" />;
            case 'hashtags': return <Hash className="w-4 h-4" />;
            case 'ideas': return <Lightbulb className="w-4 h-4" />;
            case 'adcopy': return <Megaphone className="w-4 h-4" />;
            case 'blog': return <FileText className="w-4 h-4" />;
            default: return null;
        }
    };

    const TABS = [
        { id: 'captions', label: 'Captions' },
        { id: 'hashtags', label: 'Hashtags' },
        { id: 'ideas', label: 'Post Ideas' },
        { id: 'adcopy', label: 'Ad Copy' },
        { id: 'blog', label: 'Blog Outline' }
    ];

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">Content Studio</h1>
                <p className="text-text-secondary mt-1">Generate high-converting copy, outlines, and creatives using AI.</p>
            </div>

            {/* Tabs */}
            <div className="border-b border-[#E5E5E5]">
                <nav className="flex space-x-8" aria-label="Tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => { setActiveTab(tab.id); setGeneratedOutput(null); }}
                            className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                                }
              `}
                        >
                            {renderTabIcon(tab.id)}
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                {/* Input Panel (4 cols) */}
                <div className="lg:col-span-4 card h-fit">
                    <div className="p-5 border-b border-[#E5E5E5] bg-gray-50/50 rounded-t-card">
                        <h3 className="font-bold text-lg flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-primary" />
                            {activeTab === 'captions' && 'Generate Captions'}
                            {activeTab === 'adcopy' && 'Generate Ad Copy'}
                            {activeTab === 'blog' && 'Generate Blog Outline'}
                            {(activeTab === 'hashtags' || activeTab === 'ideas') && 'Generate Ideas'}
                        </h3>
                    </div>

                    <div className="p-5">
                        {activeTab === 'captions' && (
                            <form className="space-y-5" onSubmit={handleGenerateCaptions}>
                                <div>
                                    <label className="label-text flex justify-between">
                                        <span>Platform</span>
                                        <span className="text-gray-400 font-normal normal-case">Limit: {getPlatformLimit(captionData.platform)} chars</span>
                                    </label>
                                    <select className="input-field" value={captionData.platform} onChange={e => setCaptionData({ ...captionData, platform: e.target.value })}>
                                        <option>Instagram</option>
                                        <option>LinkedIn</option>
                                        <option>Twitter</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label-text">Tone</label>
                                    <select className="input-field" value={captionData.tone} onChange={e => setCaptionData({ ...captionData, tone: e.target.value })}>
                                        <option>Professional</option>
                                        <option>Witty</option>
                                        <option>Emotional</option>
                                        <option>Educational</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label-text flex justify-between">
                                        <span>Variations</span>
                                        <span className="text-text-primary">{captionData.variations}</span>
                                    </label>
                                    <input type="range" min="1" max="5" className="w-full mt-2 accent-primary"
                                        value={captionData.variations}
                                        onChange={e => setCaptionData({ ...captionData, variations: parseInt(e.target.value) })} />
                                </div>

                                <div>
                                    <label className="label-text">Topic / Prompt</label>
                                    <textarea rows={4} className="input-field resize-none text-sm" placeholder="What should the post be about?" required />
                                </div>

                                <button type="submit" className="btn-primary w-full shadow-sm mt-4" disabled={isGenerating}>
                                    {isGenerating ? "Generating..." : "Generate Captions"}
                                </button>
                            </form>
                        )}

                        {activeTab === 'adcopy' && (
                            <form className="space-y-5" onSubmit={handleGenerateAd}>
                                <div>
                                    <label className="label-text">Platform</label>
                                    <select className="input-field" value={adData.platform} onChange={e => setAdData({ ...adData, platform: e.target.value })}>
                                        <option>Meta Ads (FB/IG)</option>
                                        <option>Google Ads</option>
                                        <option>LinkedIn Ads</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="label-text">Product / Service Name</label>
                                    <input type="text" className="input-field text-sm" required value={adData.product} onChange={e => setAdData({ ...adData, product: e.target.value })} />
                                </div>

                                <div>
                                    <label className="label-text">Unique Selling Proposition (USP)</label>
                                    <input type="text" className="input-field text-sm" required value={adData.usp} onChange={e => setAdData({ ...adData, usp: e.target.value })} />
                                </div>

                                <div>
                                    <label className="label-text">Target Audience</label>
                                    <input type="text" className="input-field text-sm" placeholder="e.g. CMOs at series A startups" required value={adData.audience} onChange={e => setAdData({ ...adData, audience: e.target.value })} />
                                </div>

                                <button type="submit" className="btn-primary w-full shadow-sm mt-4" disabled={isGenerating}>
                                    {isGenerating ? "Generating..." : "Generate Ad Copy"}
                                </button>
                            </form>
                        )}

                        {activeTab === 'blog' && (
                            <form className="space-y-5" onSubmit={handleGenerateBlog}>
                                <div>
                                    <label className="label-text">Blog Topic</label>
                                    <input type="text" className="input-field text-sm" required value={blogData.topic} onChange={e => setBlogData({ ...blogData, topic: e.target.value })} />
                                </div>

                                <div>
                                    <label className="label-text">Target SEO Keyword</label>
                                    <input type="text" className="input-field text-sm" required value={blogData.keyword} onChange={e => setBlogData({ ...blogData, keyword: e.target.value })} />
                                </div>

                                <div>
                                    <label className="label-text">Audience Level</label>
                                    <select className="input-field text-sm" value={blogData.level} onChange={e => setBlogData({ ...blogData, level: e.target.value })}>
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Expert</option>
                                    </select>
                                </div>

                                <button type="submit" className="btn-primary w-full shadow-sm mt-4" disabled={isGenerating}>
                                    {isGenerating ? "Generating Outline..." : "Generate Outline"}
                                </button>
                            </form>
                        )}

                        {(activeTab === 'hashtags' || activeTab === 'ideas') && (
                            <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed rounded-lg">
                                <p className="text-gray-500 font-medium">Coming soon in phase 2 updates!</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Output Panel (8 cols) */}
                <div className="lg:col-span-8">
                    <div className={`card w-full min-h-[400px] bg-white transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden ${!generatedOutput ? 'bg-gradient-to-br from-white to-gray-50/80 p-6' : 'p-6'}`}>

                        {!generatedOutput && !isGenerating && (
                            <div className="text-center max-w-sm">
                                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-100">
                                    <FileText className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="font-bold text-lg text-text-primary mb-2">Awaiting Instructions</h3>
                                <p className="text-sm text-text-secondary">Fill in the form to your left to magically generate SEO-optimized copy instantly.</p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="text-center z-10 relative">
                                <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
                                <p className="font-semibold text-text-primary animate-pulse">Consulting the AI Engine...</p>
                                <p className="text-sm text-text-secondary mt-1">Applying corporate marketing best practices...</p>
                            </div>
                        )}

                        {generatedOutput?.type === 'captions' && (
                            <div className="w-full h-full animate-in fade-in flex flex-col gap-4">
                                <h3 className="font-bold text-xl border-b border-[#E5E5E5] pb-2 mb-2">Generated Captions</h3>
                                {generatedOutput.data.map((variation, idx) => (
                                    <div key={idx} className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-4 flex flex-col gap-3 group hover:border-primary/50 transition-colors">
                                        <p className="text-sm text-text-primary whitespace-pre-wrap leading-relaxed">{variation}</p>
                                        <div className="flex justify-end pt-2 border-t border-gray-200/50">
                                            <button className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-primary transition-colors bg-white px-2 py-1 rounded shadow-sm border border-gray-200"
                                                onClick={() => copyToClipboard(variation)}>
                                                <Copy className="w-3.5 h-3.5" /> Copy Let AI write
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {generatedOutput?.type === 'ad' && (
                            <div className="w-full h-full animate-in fade-in flex flex-col gap-6">
                                <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2 mb-2">
                                    <h3 className="font-bold text-xl">Generated Ad Copy ({adData.platform})</h3>
                                    <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => copyToClipboard(`${generatedOutput.data.headline}\n${generatedOutput.data.primaryText}\n${generatedOutput.data.description}`)}>
                                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy All
                                    </button>
                                </div>

                                <div className="bg-white border-2 border-primary/20 bg-primary/5 rounded-xl p-5 shadow-sm">
                                    <div className="flex justify-between items-end mb-1">
                                        <label className="label-text">Headline</label>
                                        <span className="text-[10px] font-semibold text-primary">{generatedOutput.data.headline.length} / 30 chars</span>
                                    </div>
                                    <p className="text-lg tracking-tight font-bold text-text-primary mb-4">{generatedOutput.data.headline}</p>

                                    <div className="flex justify-between items-end mb-1">
                                        <label className="label-text">Primary Text</label>
                                        <span className="text-[10px] font-semibold text-text-secondary">{generatedOutput.data.primaryText.length} / 125 chars</span>
                                    </div>
                                    <p className="text-sm font-medium text-text-secondary leading-relaxed mb-4">{generatedOutput.data.primaryText}</p>

                                    <div className="flex justify-between items-end mb-1">
                                        <label className="label-text">Description</label>
                                        <span className="text-[10px] font-semibold text-text-secondary">{generatedOutput.data.description.length} / 30 chars</span>
                                    </div>
                                    <p className="text-sm text-text-secondary italic">{generatedOutput.data.description}</p>
                                </div>
                            </div>
                        )}

                        {generatedOutput?.type === 'blog' && (
                            <div className="w-full h-full animate-in fade-in flex flex-col gap-4">
                                <div className="flex justify-between items-center border-b border-[#E5E5E5] pb-2 mb-2">
                                    <h3 className="font-bold text-xl">Blog Outline</h3>
                                    <button className="btn-secondary !py-1 !px-2 text-xs" onClick={() => copyToClipboard(generatedOutput.data)}>
                                        <Copy className="w-3.5 h-3.5 mr-1" /> Copy Markdown
                                    </button>
                                </div>
                                <div className="bg-gray-50 border border-[#E5E5E5] rounded-xl p-6 font-mono text-sm overflow-y-auto whitespace-pre-wrap">
                                    {generatedOutput.data}
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
}
