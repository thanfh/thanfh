
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Image as ImageIcon, Briefcase, LogOut, 
  Home as HomeIcon, Camera, Beaker, Eye, PanelTop, X
} from 'lucide-react';
import { 
  Project, GalleryCollection, PlaygroundSection, HomeContent
} from '../types';
import { 
  getProjects, getGallery, getPlayground, getHomeContent
} from '../services/contentService';
import AdminMediaManager, { MediaSelectData } from './AdminMediaManager';

// Sub-components
import AdminProjectManager from './AdminProjectManager';
import AdminGalleryManager from './AdminGalleryManager';
import AdminHomeManager from './AdminHomeManager';

// Preview Components
import Hero from './Hero';
import CaseStudyView from './CaseStudyView';

const MotionDiv = motion.div as any;

interface AdminDashboardProps {
  onBack: () => void;
  onRefresh: () => void;
  onLogout: () => void;
}

type AdminTab = 'home' | 'layout' | 'projects' | 'gallery' | 'playground' | 'media';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack, onRefresh, onLogout }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('projects'); 
  
  // Data States
  const [projects, setProjects] = useState<Project[]>([]);
  const [gallery, setGallery] = useState<GalleryCollection[]>([]);
  const [playground, setPlayground] = useState<PlaygroundSection[]>([]);
  const [homeData, setHomeData] = useState<HomeContent | null>(null);

  // Project Editing State
  const [isEditingProj, setIsEditingProj] = useState(false);
  const [editingProjId, setEditingProjId] = useState<string | null>(null);
  const [projForm, setProjForm] = useState<Partial<Project>>({
    title: '', year: new Date().getFullYear().toString(), category: 'Branding',
    description: '', imageUrl: '', videoUrl: '', challenge: '', solution: '',
    tools: [], blocks: [], client: '', role: '', liveUrl: '', featured: false
  });
  
  // Preview State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'home' | 'project'>('home');

  // Media Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pickerCallback, setPickerCallback] = useState<((media: MediaSelectData) => void) | null>(null);

  // Fetch Data on Mount
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [p, g, pg, h] = await Promise.all([
                getProjects(),
                getGallery(),
                getPlayground(),
                getHomeContent()
            ]);
            setProjects(p);
            setGallery(g);
            setPlayground(pg);
            setHomeData(h);
        } catch (error) {
            console.error("Failed to load admin data", error);
        }
    };
    fetchData();
  }, []);

  // Media Picker Handlers
  const openMediaPicker = (callback: (media: MediaSelectData) => void) => {
      setPickerCallback(() => callback);
      setIsPickerOpen(true);
  };

  const handleMediaPick = (media: MediaSelectData) => {
      if (pickerCallback) {
          pickerCallback(media);
      }
      setIsPickerOpen(false);
      setPickerCallback(null);
  };

  // Render Preview
  const renderPreview = () => {
      if (previewMode === 'home' && homeData) {
          return (
              <div className="bg-neutral-950 w-full min-h-screen overflow-y-auto">
                   <Hero 
                        profile={homeData.profile} 
                        uiText={homeData.uiText} 
                        heroConfig={homeData.heroConfig}
                        onOpenCaseStudy={() => {}} 
                        onNavigateToWork={() => setIsPreviewOpen(false)} 
                   />
              </div>
          );
      }

      if (previewMode === 'project') {
           const tempProject: Project = {
              ...(projForm as Project),
              id: editingProjId || 'preview-id',
              title: projForm.title || 'Untitled',
              category: projForm.category || 'Branding',
              year: projForm.year || '',
              description: projForm.description || '',
              imageUrl: projForm.imageUrl || '',
              // Ensure blocks are cast correctly for preview
              blocks: projForm.blocks as any[] || [], 
              tools: projForm.tools || [],
              displayOrder: 99
          };

          return (
              <div className="bg-neutral-950 w-full min-h-screen overflow-y-auto">
                  <CaseStudyView 
                    project={tempProject} 
                    allProjects={projects}
                    uiText={homeData?.uiText || {}}
                    onBack={() => setIsPreviewOpen(false)}
                    onOpenCaseStudy={() => {}}
                  />
              </div>
          );
      }
      return null;
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white pt-20 px-4 md:px-8 pb-32 transition-colors font-sans selection:bg-emerald-200 selection:text-emerald-900">
      
      {/* MEDIA PICKER MODAL */}
      <AnimatePresence>
         {isPickerOpen && (
             <MotionDiv 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[150] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-12"
             >
                <MotionDiv
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-white dark:bg-neutral-900 w-full max-w-6xl h-[85vh] rounded-3xl overflow-hidden flex flex-col shadow-2xl border border-neutral-800"
                >
                    <div className="flex justify-between items-center p-6 border-b border-neutral-100 dark:border-neutral-800">
                        <h2 className="text-lg font-bold uppercase tracking-widest flex items-center gap-2"><ImageIcon size={18} className="text-emerald-500"/> Select Media</h2>
                        <button onClick={() => setIsPickerOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full"><X size={20}/></button>
                    </div>
                    <div className="flex-grow overflow-hidden p-4">
                        <AdminMediaManager mode="picker" onSelect={handleMediaPick} projects={projects} gallery={gallery} playground={playground} />
                    </div>
                </MotionDiv>
             </MotionDiv>
         )}
      </AnimatePresence>

      {/* PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && (
            <MotionDiv 
                initial={{ opacity: 0, y: 100 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: 100 }}
                className="fixed inset-0 z-[200] bg-neutral-950 flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b border-neutral-800 bg-black text-white relative z-50">
                    <span className="font-mono text-xs uppercase tracking-widest text-emerald-500 flex items-center gap-2"><div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div> Live Preview Mode</span>
                    <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 transition-colors">Close Preview</button>
                </div>
                {renderPreview()}
            </MotionDiv>
        )}
      </AnimatePresence>

      <div className="max-w-[1400px] mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6 sticky top-0 z-40 py-4 bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-md">
          <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black rounded-xl flex items-center justify-center font-bold text-xl">P.</div>
              <div>
                  <h1 className="text-2xl font-bold tracking-tight">CMS Dashboard</h1>
                  <p className="text-neutral-500 text-xs font-mono uppercase tracking-widest">v6.0 • Modular Architecture</p>
              </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { setPreviewMode('home'); setIsPreviewOpen(true); }} className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all flex items-center gap-2"><Eye size={14} /> Preview Home</button>
            <button onClick={onBack} className="px-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-xs font-bold hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all flex items-center gap-2"><ArrowLeft size={14} /> Back to Site</button>
            <button onClick={onLogout} className="px-4 py-2 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2"><LogOut size={14} /> Logout</button>
          </div>
        </div>

        {/* MAIN NAV TABS */}
        <div className="flex border-b border-neutral-200 dark:border-neutral-800 mb-8 overflow-x-auto no-scrollbar">
            {[
                { id: 'projects', label: 'Projects', icon: Briefcase },
                { id: 'home', label: 'Home Content', icon: HomeIcon },
                { id: 'layout', label: 'Header & Footer', icon: PanelTop },
                { id: 'gallery', label: 'Gallery', icon: Camera },
                { id: 'playground', label: 'Playground', icon: Beaker },
                { id: 'media', label: 'Media Library', icon: ImageIcon },
            ].map(tab => (
                 <button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as AdminTab)} 
                    className={`px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 border-b-2 flex-shrink-0 ${activeTab === tab.id ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-neutral-400 hover:text-neutral-600'}`}
                >
                    <tab.icon size={14} /> {tab.label}
                </button>
            ))}
        </div>

        <AnimatePresence mode="wait">

          {/* HOME & LAYOUT MANAGER */}
          {(activeTab === 'home' || activeTab === 'layout') && homeData && (
              <AdminHomeManager 
                  activeTab={activeTab} 
                  homeData={homeData} 
                  setHomeData={setHomeData} 
                  onRefresh={onRefresh} 
                  openMediaPicker={openMediaPicker}
              />
          )}

          {/* PROJECT MANAGER */}
          {activeTab === 'projects' && (
              <AdminProjectManager 
                  projects={projects}
                  setProjects={setProjects}
                  onRefresh={onRefresh}
                  openMediaPicker={openMediaPicker}
                  setPreviewMode={setPreviewMode}
                  setIsPreviewOpen={setIsPreviewOpen}
                  setEditingProjId={setEditingProjId}
                  isEditingProj={isEditingProj}
                  setIsEditingProj={setIsEditingProj}
                  projForm={projForm}
                  setProjForm={setProjForm}
                  editingProjId={editingProjId}
              />
          )}

          {/* MEDIA MANAGER */}
          {activeTab === 'media' && (
            <MotionDiv key="media-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-[calc(100vh-200px)]">
                <AdminMediaManager projects={projects} gallery={gallery} playground={playground} />
            </MotionDiv>
          )}

          {/* GALLERY & PLAYGROUND MANAGER */}
          {(activeTab === 'gallery' || activeTab === 'playground') && (
            <AdminGalleryManager 
                activeTab={activeTab}
                gallery={gallery}
                setGallery={setGallery}
                playground={playground}
                setPlayground={setPlayground}
                onRefresh={onRefresh}
                openMediaPicker={openMediaPicker}
            />
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default AdminDashboard;
