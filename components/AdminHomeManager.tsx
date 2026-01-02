
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Save, Type, Monitor, Smartphone, User, CaseUpper, Music,
    Image as ImageIcon, Plus, Trash2, FileText, Globe, PanelTop, Share2
} from 'lucide-react';
import { HomeContent, SocialLink, SocialIconName } from '../types';
import { saveHomeContent } from '../services/contentService';
import { MediaSelectData } from './AdminMediaManager';

const SOCIAL_PLATFORMS: SocialIconName[] = [
    'Instagram', 'Twitter', 'Linkedin', 'Mail', 'Github', 'Facebook',
    'Telegram', 'Behance', 'Dribbble', 'ArtStation', 'Youtube', 'Vimeo', 'TikTok', 'Globe'
];

const MotionDiv = motion.div as any;

interface AdminHomeManagerProps {
    activeTab: 'home' | 'layout';
    homeData: HomeContent;
    setHomeData: React.Dispatch<React.SetStateAction<HomeContent | null>>;
    onRefresh: () => void;
    openMediaPicker: (cb: (media: MediaSelectData) => void) => void;
}

const AdminHomeManager: React.FC<AdminHomeManagerProps> = ({ activeTab, homeData, setHomeData, onRefresh, openMediaPicker }) => {
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveHome = async () => {
        if (homeData) {
            setIsSaving(true);
            await saveHomeContent(homeData);
            onRefresh();
            setIsSaving(false);
            alert("Content updated successfully!");
        }
    };

    const updateProfile = (data: any) => {
        if (homeData) setHomeData({ ...homeData, profile: { ...homeData.profile, ...data } });
    };

    const updateHeroConfig = (data: any) => {
        if (homeData) {
            const currentConfig = homeData.heroConfig || { desktopUrl: '', mobileUrl: '', overlayOpacity: 0.6 };
            setHomeData({ ...homeData, heroConfig: { ...currentConfig, ...data } });
        }
    };

    const updateUiText = (key: string, value: string) => {
        if (homeData) setHomeData({ ...homeData, uiText: { ...homeData.uiText, [key]: value } });
    };

    const addSocial = () => {
        if (!homeData) return;
        const newSocial: SocialLink = {
            id: `s-${Date.now()}`,
            platform: 'Instagram',
            url: '',
            iconName: 'Instagram'
        };
        setHomeData({
            ...homeData,
            profile: {
                ...homeData.profile,
                socials: [...homeData.profile.socials, newSocial]
            }
        });
    };

    const removeSocial = (id: string) => {
        if (!homeData) return;
        setHomeData({
            ...homeData,
            profile: {
                ...homeData.profile,
                socials: homeData.profile.socials.filter(s => s.id !== id)
            }
        });
    };

    const updateSocial = (id: string, data: Partial<SocialLink>) => {
        if (!homeData) return;
        setHomeData({
            ...homeData,
            profile: {
                ...homeData.profile,
                socials: homeData.profile.socials.map(s => s.id === id ? { ...s, ...data } : s)
            }
        });
    };

    if (activeTab === 'home') {
        return (
            <MotionDiv key="home-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 pb-32">

                {/* --- HERO VISUALS SECTION --- */}
                <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Hero Visuals</h3>
                    <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900 grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-2"><Monitor size={14} /> Desktop Visual (Landscape)</label>
                            <div className="aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden relative group border border-neutral-200 dark:border-neutral-800">
                                {homeData.heroConfig?.desktopUrl ? (
                                    homeData.heroConfig.desktopUrl.endsWith('.mp4') || homeData.heroConfig.desktopUrl.endsWith('.webm') ?
                                        <video src={homeData.heroConfig.desktopUrl} className="w-full h-full object-cover" muted autoPlay loop /> :
                                        <img src={homeData.heroConfig.desktopUrl} className="w-full h-full object-cover" alt="Desktop Hero" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No media</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => openMediaPicker((media) => updateHeroConfig({ desktopUrl: media.url }))} className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase">Change</button>
                                </div>
                            </div>
                            <input value={homeData.heroConfig?.desktopUrl || ''} onChange={e => updateHeroConfig({ desktopUrl: e.target.value })} className="w-full bg-transparent text-xs p-2 border-b border-neutral-200 dark:border-neutral-800 outline-none" placeholder="Media URL..." />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-mono uppercase text-neutral-400 flex items-center gap-2"><Smartphone size={14} /> Mobile Visual (Portrait)</label>
                            <div className="aspect-[9/16] w-1/2 mx-auto md:w-2/3 bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden relative group border border-neutral-200 dark:border-neutral-800">
                                {homeData.heroConfig?.mobileUrl ? (
                                    homeData.heroConfig.mobileUrl.endsWith('.mp4') || homeData.heroConfig.mobileUrl.endsWith('.webm') ?
                                        <video src={homeData.heroConfig.mobileUrl} className="w-full h-full object-cover" muted autoPlay loop /> :
                                        <img src={homeData.heroConfig.mobileUrl} className="w-full h-full object-cover" alt="Mobile Hero" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">No media</div>
                                )}
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button onClick={() => openMediaPicker((media) => updateHeroConfig({ mobileUrl: media.url }))} className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase">Change</button>
                                </div>
                            </div>
                            <input value={homeData.heroConfig?.mobileUrl || ''} onChange={e => updateHeroConfig({ mobileUrl: e.target.value })} className="w-full bg-transparent text-xs p-2 border-b border-neutral-200 dark:border-neutral-800 outline-none" placeholder="Media URL..." />
                        </div>
                    </div>
                </div>

                {/* --- STORY & INTRO --- */}
                <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Story & Introduction</h3>
                    <div className="bg-white dark:bg-neutral-925 p-8 md:p-12 rounded-3xl border border-neutral-200 dark:border-neutral-900 space-y-12">
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-xs font-mono uppercase text-emerald-600 mb-2">
                                <Type size={14} /> Headline / Tagline
                            </label>
                            <textarea
                                value={homeData.profile.tagline}
                                onChange={e => updateProfile({ tagline: e.target.value })}
                                rows={2}
                                className="w-full bg-transparent text-3xl md:text-5xl font-medium leading-tight outline-none placeholder:text-neutral-200 dark:placeholder:text-neutral-800 resize-none"
                                placeholder="Write a compelling headline..."
                            />
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                    <User size={14} /> Biography
                                </label>
                                <textarea
                                    value={homeData.profile.bio}
                                    onChange={e => updateProfile({ bio: e.target.value })}
                                    rows={6}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-lg leading-relaxed outline-none border border-neutral-100 dark:border-neutral-800 resize-none font-sans"
                                    placeholder="Tell your story..."
                                />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                        <CaseUpper size={14} /> Full Name (SEO)
                                    </label>
                                    <input value={homeData.profile.name} onChange={e => updateProfile({ name: e.target.value })} placeholder="Your Name" className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800" />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-400">
                                        <Music size={14} /> Background Music
                                    </label>
                                    <div className="flex gap-2">
                                        <input value={homeData.profile.musicUrl} onChange={e => updateProfile({ musicUrl: e.target.value })} placeholder="Audio URL" className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800" />
                                        <button onClick={() => openMediaPicker((media) => updateProfile({ musicUrl: media.url }))} className="px-4 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700"><ImageIcon size={18} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- SOCIAL CONNECTIONS --- */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Social Connections</h3>
                        <button onClick={addSocial} className="text-emerald-500 text-xs font-bold uppercase hover:text-emerald-400 flex items-center gap-1"><Plus size={14} /> Add New</button>
                    </div>
                    <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900 space-y-4">
                        {homeData.profile.socials.map((social, idx) => (
                            <div key={social.id} className="flex gap-4 items-center bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-black rounded-lg border border-neutral-200 dark:border-neutral-800 font-bold text-xs">
                                    {idx + 1}
                                </div>
                                <select
                                    value={social.iconName}
                                    onChange={(e) => updateSocial(social.id, { iconName: e.target.value as any, platform: e.target.value })}
                                    className="bg-transparent text-xs font-bold uppercase outline-none w-32 cursor-pointer"
                                >
                                    {SOCIAL_PLATFORMS.map(p => <option key={p} value={p} className="text-black bg-white dark:text-white dark:bg-neutral-900">{p}</option>)}
                                </select>
                                <input
                                    value={social.url}
                                    onChange={(e) => updateSocial(social.id, { url: e.target.value })}
                                    placeholder="Profile URL (https://...)"
                                    className="flex-grow bg-transparent text-sm outline-none placeholder:text-neutral-400"
                                />
                                <button onClick={() => removeSocial(social.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                            </div>
                        ))}
                        {homeData.profile.socials.length === 0 && (
                            <div className="text-center text-neutral-400 text-sm py-4">No social links added.</div>
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Interface Labels</h3>
                    <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {Object.keys(homeData.uiText).map(key => (
                                <div key={key} className="space-y-1">
                                    <label className="text-[9px] font-mono uppercase text-neutral-400 px-1">{key.replace(/_/g, ' ')}</label>
                                    <input value={homeData.uiText[key]} onChange={e => updateUiText(key, e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 p-2.5 rounded-lg text-xs outline-none border border-neutral-100 dark:border-neutral-800 focus:border-black dark:focus:border-white transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <button onClick={handleSaveHome} disabled={isSaving} className="fixed bottom-12 right-12 z-50 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-2xl transition-all flex items-center gap-3 hover:scale-105 active:scale-95">
                    <Save size={18} /> {isSaving ? "Saving..." : "Save Updates"}
                </button>
            </MotionDiv>
        );
    }

    if (activeTab === 'layout') {
        return (
            <MotionDiv key="layout-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Header Configuration</h3>
                        <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900 space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-2xl flex items-center justify-center border border-neutral-200 dark:border-neutral-700 flex-shrink-0 overflow-hidden">
                                    {homeData.faviconUrl ? (
                                        <img src={homeData.faviconUrl} alt="Favicon" className="w-10 h-10 object-contain" />
                                    ) : (
                                        <Globe size={24} className="text-neutral-400" />
                                    )}
                                </div>
                                <div className="flex-grow space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-neutral-400">Browser Tab Title</label>
                                        <input
                                            value={homeData.siteTitle || ''}
                                            onChange={e => setHomeData({ ...homeData, siteTitle: e.target.value })}
                                            placeholder="Page Title"
                                            className="w-full bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono uppercase text-neutral-400">Favicon URL</label>
                                        <div className="flex gap-2">
                                            <input
                                                value={homeData.faviconUrl || ''}
                                                onChange={e => setHomeData({ ...homeData, faviconUrl: e.target.value })}
                                                placeholder="https://.../favicon.png"
                                                className="w-full bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 text-sm"
                                            />
                                            <button onClick={() => openMediaPicker((media) => setHomeData({ ...homeData, faviconUrl: media.url }))} className="px-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-emerald-500"><ImageIcon size={16} /></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                <label className="text-[10px] font-mono uppercase text-neutral-400">Logo Text / Brand Name</label>
                                <input
                                    value={homeData.profile.name}
                                    onChange={e => updateProfile({ name: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 text-lg font-bold tracking-tighter uppercase"
                                    placeholder="PORTFOLIO"
                                />
                                <p className="text-[10px] text-neutral-400">Displayed in top-left navigation.</p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-400 ml-2">Footer Configuration</h3>
                        <div className="bg-white dark:bg-neutral-925 p-8 rounded-3xl border border-neutral-200 dark:border-neutral-900 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono uppercase text-neutral-400">Call to Action Title</label>
                                <input
                                    value={homeData.uiText['footer_title'] || "Let's work together."}
                                    onChange={e => updateUiText('footer_title', e.target.value)}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 text-xl font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono uppercase text-neutral-400">Contact Email</label>
                                <input
                                    value={homeData.profile.email}
                                    onChange={e => updateProfile({ email: e.target.value })}
                                    className="w-full bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 text-sm"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono uppercase text-neutral-400">Resume / CV Link</label>
                                <div className="flex gap-2">
                                    <div className="bg-neutral-100 dark:bg-neutral-800 p-3 rounded-xl"><FileText size={16} /></div>
                                    <input
                                        value={homeData.profile.cvUrl}
                                        onChange={e => updateProfile({ cvUrl: e.target.value })}
                                        className="w-full bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl outline-none border border-neutral-100 dark:border-neutral-800 text-sm"
                                        placeholder="https://..."
                                    />
                                    <button onClick={() => openMediaPicker((media) => updateProfile({ cvUrl: media.url }))} className="px-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-emerald-500"><ImageIcon size={16} /></button>
                                </div>
                            </div>
                        </div>
                    </div>



                </div>
                <button onClick={handleSaveHome} disabled={isSaving} className="fixed bottom-12 right-12 z-50 px-10 py-5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold uppercase tracking-widest text-sm shadow-2xl transition-all flex items-center gap-3 hover:scale-105 active:scale-95">
                    <Save size={18} /> {isSaving ? "Saving..." : "Save Updates"}
                </button>
            </MotionDiv>
        );
    }
    return null;
}

export default AdminHomeManager;
