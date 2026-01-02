
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, Trash2, Copy, Check, FileImage, Loader2, 
  RefreshCw, Archive, RotateCcw, AlertTriangle, Folder, 
  FolderOpen, Search, X, Briefcase, Camera, Image as ImageIcon,
  CheckCircle, ArrowDownCircle, LayoutTemplate, User, Beaker, FileBox
} from 'lucide-react';
import { 
  MediaItem, getMediaLibrary, uploadMedia, deleteMedia, 
  toggleTrashMedia, updateMediaCategory 
} from '../services/mediaService';
import { Project, GalleryCollection, PlaygroundSection } from '../types';
import { QueryDocumentSnapshot } from 'firebase/firestore';

// Fix framer-motion type for TS
const MotionDiv = motion.div as any;

export interface MediaSelectData {
    url: string;
    width: number;
    height: number;
    type: string;
    name: string;
    mobileSpan?: number;
    desktopSpan?: number;
}

interface AdminMediaManagerProps {
  projects?: Project[];
  gallery?: GalleryCollection[];
  playground?: PlaygroundSection[];
  mode?: 'full' | 'picker';
  onSelect?: (data: MediaSelectData) => void;
}

const AdminMediaManager: React.FC<AdminMediaManagerProps> = ({ 
  projects = [], 
  gallery = [], 
  playground = [],
  mode = 'full',
  onSelect 
}) => {
  // --- STATE ---
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  
  const [view, setView] = useState<'library' | 'trash'>('library');
  const [activeCategory, setActiveCategory] = useState<string>('all'); 
  
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API CALLS ---
  const fetchMedia = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else setLoading(true);

    try {
        const result = await getMediaLibrary(
            isLoadMore ? lastDoc : null, 
            30, // Page size
            { trashed: view === 'trash' ? true : undefined } // Only pass trashed if explicit
        );
        
        if (isLoadMore) {
            setMediaItems(prev => [...prev, ...result.items]);
        } else {
            setMediaItems(result.items);
        }
        
        setLastDoc(result.lastDoc);
        setHasMore(!!result.lastDoc);
    } catch (error) {
        console.error("Failed to load media", error);
    }
    
    if (isLoadMore) setLoadingMore(false);
    else setLoading(false);
  };

  useEffect(() => {
    setLastDoc(null);
    setHasMore(true);
    fetchMedia(false);
  }, [view]); // Refetch when view (trash/library) changes

  // --- HANDLERS ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      setUploadProgress(0);
      
      try {
        // Automatically assign category based on current view
        const uploadCategory = activeCategory === 'all' || activeCategory === 'trash' ? 'uncategorized' : activeCategory;
        
        await uploadMedia(file, uploadCategory, (progress) => setUploadProgress(progress));
        await fetchMedia(false); // Refresh list
        setUploading(false);
        if (view === 'trash') setView('library');
      } catch (error) {
        alert("Failed to upload file. Check permissions or Cloud Name.");
        setUploading(false);
      }
    }
  };

  const handleCategoryChange = async (item: MediaItem, newCategory: string) => {
      try {
          const updatedItems = mediaItems.map(i => i.id === item.id ? { ...i, category: newCategory } : i);
          setMediaItems(updatedItems);
          await updateMediaCategory(item.id, newCategory);
      } catch (error) {
          alert("Failed to move item.");
          fetchMedia(false); 
      }
  };

  const handleMoveToTrash = async (item: MediaItem) => {
      try {
          await toggleTrashMedia(item.id, true);
          setMediaItems(prev => prev.filter(i => i.id !== item.id)); // Remove from current view
          if (selectedItem?.id === item.id) setSelectedItem(null);
      } catch (error) {
          alert("Failed to move to trash.");
      }
  };

  const handleRestore = async (item: MediaItem) => {
      try {
          await toggleTrashMedia(item.id, false);
          setMediaItems(prev => prev.filter(i => i.id !== item.id)); // Remove from trash view
          if (selectedItem?.id === item.id) setSelectedItem(null);
      } catch (error) {
          alert("Failed to restore item.");
      }
  };

  const handlePermanentDelete = async (item: MediaItem) => {
    if (confirm(`Permanently delete ${item.name}? This action cannot be undone.`)) {
      try {
        await deleteMedia(item.id);
        setMediaItems(prev => prev.filter(i => i.id !== item.id));
        if (selectedItem?.id === item.id) setSelectedItem(null);
      } catch (error) {
        alert("Failed to delete file.");
      }
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const handleSelection = (item: MediaItem) => {
      if (mode === 'picker' && onSelect) {
          onSelect({
            url: item.url,
            width: item.width,
            height: item.height,
            type: item.contentType,
            name: item.name
          });
      }
  };

  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // --- FILTER LOGIC (Client Side for loaded items) ---
  const filteredItems = mediaItems.filter(item => {
      if (view === 'trash') return item.trashed; // Should be handled by API mostly, but double check
      if (item.trashed) return false;
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      if (activeCategory === 'all') return true;
      if (activeCategory === 'uncategorized') return !item.category || item.category === 'uncategorized';
      
      // Strict category matching
      return item.category === activeCategory;
  });

  const isPicker = mode === 'picker';

  return (
    <div className={`h-full flex gap-4 md:gap-6 overflow-hidden bg-neutral-50/50 dark:bg-neutral-950 rounded-3xl ${isPicker ? 'p-0' : 'p-6'}`}>
       
       {/* --- SIDEBAR FILTER --- */}
       <div className={`w-48 md:w-64 flex-shrink-0 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex flex-col overflow-hidden shadow-sm ${isPicker ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3 pl-2">System</h3>
                <div className="space-y-1">
                    <button onClick={() => { setActiveCategory('all'); setView('library'); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeCategory === 'all' && view === 'library' ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                        <FolderOpen size={16} className="text-emerald-500"/> All Media
                    </button>
                    <button onClick={() => { setActiveCategory('uncategorized'); setView('library'); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${activeCategory === 'uncategorized' && view === 'library' ? 'bg-neutral-100 dark:bg-neutral-800 text-black dark:text-white' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                        <Folder size={16} className="text-neutral-400"/> Uncategorized
                    </button>
                    <button onClick={() => { setView('trash'); setActiveCategory('all'); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${view === 'trash' ? 'bg-red-50 text-red-500 dark:bg-red-900/20' : 'text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800'}`}>
                        <Trash2 size={16} /> Trash Can
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
                
                {/* HOME ASSETS */}
                <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2 pl-2"><LayoutTemplate size={12}/> Global Assets</h3>
                    <div className="space-y-0.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                        <button onClick={() => { setActiveCategory(`home:hero`); setView('library'); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors ${activeCategory === `home:hero` ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                            Hero Visuals
                        </button>
                        <button onClick={() => { setActiveCategory(`home:profile`); setView('library'); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors ${activeCategory === `home:profile` ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                            Profile & CV
                        </button>
                    </div>
                </div>

                {/* PLAYGROUND FOLDER */}
                <div>
                     <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2 pl-2"><Beaker size={12}/> Playground</h3>
                     <div className="space-y-0.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                        {playground.map(p => (
                             <button key={p.id} onClick={() => { setActiveCategory(`playground:${p.id}`); setView('library'); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors ${activeCategory === `playground:${p.id}` ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                                 {p.title}
                             </button>
                         ))}
                         {playground.length === 0 && <span className="text-[10px] text-neutral-400 px-2">No experiments</span>}
                     </div>
                </div>

                {/* PROJECTS FOLDER */}
                <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2 pl-2"><Briefcase size={12}/> Projects</h3>
                    <div className="space-y-0.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                        {projects.map(p => (
                            <button key={p.id} onClick={() => { setActiveCategory(`project:${p.id}`); setView('library'); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors ${activeCategory === `project:${p.id}` ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                                {p.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GALLERIES FOLDER */}
                <div>
                    <h3 className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-2 pl-2"><Camera size={12}/> Galleries</h3>
                    <div className="space-y-0.5 ml-2 border-l border-neutral-200 dark:border-neutral-800 pl-2">
                        {gallery.map(g => (
                            <button key={g.id} onClick={() => { setActiveCategory(`gallery:${g.id}`); setView('library'); }} className={`w-full text-left px-2 py-1.5 rounded-md text-[11px] truncate transition-colors ${activeCategory === `gallery:${g.id}` ? 'text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-900/20' : 'text-neutral-500 hover:text-black dark:hover:text-white'}`}>
                                {g.title}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
       </div>

       {/* --- MAIN CONTENT AREA --- */}
       <div className="flex-grow flex flex-col gap-4 md:gap-6 overflow-hidden">
            {/* TOOLBAR */}
            <div className="flex items-center justify-between bg-white dark:bg-neutral-900 p-3 md:p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-2 md:gap-4 flex-grow md:flex-grow-0">
                    <div className="relative flex-grow md:w-auto">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search loaded files..."
                            className="bg-neutral-100 dark:bg-neutral-800 pl-10 pr-4 py-2.5 rounded-xl text-xs outline-none w-full md:w-64 border border-transparent focus:border-neutral-300 dark:focus:border-neutral-700 transition-all placeholder:text-neutral-400"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <button onClick={() => fetchMedia(false)} className="p-2.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition-colors" title="Refresh">
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                   
                    {/* Upload Button */}
                    <div className="relative">
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,video/*"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading || view === 'trash'}
                            className={`px-3 md:px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider text-[10px] md:text-[11px] flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 ${view === 'trash' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? <Loader2 className="animate-spin" size={16}/> : <UploadCloud size={16} />}
                            {uploading ? `${uploadProgress}%` : isPicker ? "Upload" : "Upload New"}
                        </button>
                    </div>
                </div>
            </div>

            {/* GRID VIEW */}
            <div className={`flex-grow rounded-2xl border p-4 md:p-6 overflow-y-auto custom-scrollbar relative ${view === 'trash' ? 'bg-red-50/30 dark:bg-red-950/10 border-red-100 dark:border-red-900/30' : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800'}`}>
               
                {loading && filteredItems.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-3">
                        <Loader2 className="animate-spin" size={32} /> 
                        <span className="text-xs font-mono uppercase tracking-widest">Loading Media...</span>
                    </div>
                ) : filteredItems.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-neutral-400 gap-4 opacity-60">
                         {view === 'library' ? (
                            <div className="flex flex-col items-center gap-4 cursor-pointer hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors" onClick={() => fileInputRef.current?.click()}>
                                 <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                    <UploadCloud size={32} />
                                 </div>
                                 <p className="font-mono text-xs uppercase tracking-widest text-center">
                                    {searchTerm ? "No matches found" : `Folder: ${activeCategory.replace(':', ' / ')}`}<br/>
                                    <span className="opacity-50 text-[10px]">Click to upload here</span>
                                 </p>
                            </div>
                        ) : (
                            <>
                                 <div className="w-20 h-20 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center">
                                    <Archive size={32} />
                                 </div>
                                 <p className="font-mono text-xs uppercase tracking-widest">Trash is empty.</p>
                            </>
                        )}
                    </div>
                ) : (
                    <>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
                        {filteredItems.map((item) => (
                            <MotionDiv
                                layout
                                key={item.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`group relative bg-white dark:bg-black rounded-xl border overflow-hidden aspect-square flex flex-col shadow-sm hover:shadow-lg transition-all cursor-pointer ${selectedItem?.id === item.id ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-neutral-200 dark:border-neutral-800'}`}
                                onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
                                onDoubleClick={() => handleSelection(item)}
                            >
                                <div className="flex-grow relative overflow-hidden bg-neutral-100 dark:bg-neutral-900">
                                    {item.contentType.includes('video') ? (
                                        <video src={item.url} className={`w-full h-full object-cover ${view === 'trash' ? 'grayscale opacity-50' : ''}`} />
                                    ) : (
                                        <img src={item.url} alt={item.name} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${view === 'trash' ? 'grayscale opacity-50' : ''}`} />
                                    )}
                                   
                                    {/* Action Overlay for Picker Mode */}
                                    {isPicker && view !== 'trash' && (
                                         <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                             <button onClick={(e) => { e.stopPropagation(); handleSelection(item); }} className="bg-emerald-500 text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-400">Select</button>
                                         </div>
                                    )}

                                    {/* Selection Indicator */}
                                    {selectedItem?.id === item.id && (
                                        <div className="absolute inset-0 border-4 border-emerald-500/50 rounded-xl pointer-events-none flex items-start justify-end p-2">
                                            <div className="bg-emerald-500 text-white rounded-full p-0.5"><Check size={12}/></div>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-2.5 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 z-10">
                                    <p className="text-[10px] font-bold truncate text-neutral-900 dark:text-white mb-0.5">{item.name}</p>
                                    <div className="flex justify-between items-center text-[9px] text-neutral-400 font-mono uppercase">
                                        <span>{item.contentType.split('/')[1]}</span>
                                        <span>{formatSize(item.size)}</span>
                                    </div>
                                </div>
                            </MotionDiv>
                        ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && !searchTerm && (
                        <div className="flex justify-center py-8">
                            <button 
                                onClick={() => fetchMedia(true)} 
                                disabled={loadingMore}
                                className="px-6 py-3 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-all disabled:opacity-50"
                            >
                                {loadingMore ? <Loader2 size={16} className="animate-spin" /> : <ArrowDownCircle size={16} />}
                                Load More Media
                            </button>
                        </div>
                    )}
                    </>
                )}
            </div>
       </div>

       {/* --- INSPECTOR PANEL (Right Side - Slide In) --- */}
       <AnimatePresence>
           {selectedItem && (
               <MotionDiv
                    initial={{ x: "100%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "100%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={`flex-shrink-0 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 flex flex-col gap-5 shadow-xl z-30 ${isPicker ? 'absolute inset-y-0 right-0 w-80 shadow-2xl' : 'w-80 relative'}`}
               >
                   <div className="flex justify-between items-center">
                       <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2"><ImageIcon size={14}/> Asset Details</h3>
                       <button onClick={() => setSelectedItem(null)} className="p-1 rounded-full hover:bg-neutral-100 dark:hover:text-white transition-colors"><X size={16} /></button>
                   </div>

                   <div className="aspect-square rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 flex items-center justify-center">
                        {selectedItem.contentType.includes('video') ? (
                             <video src={selectedItem.url} controls className="max-w-full max-h-full" />
                        ) : (
                             <img src={selectedItem.url} className="w-full h-full object-contain" alt="preview"/>
                        )}
                   </div>

                   <div className="space-y-4">
                       <div className="space-y-1">
                          <label className="text-[9px] font-mono uppercase text-neutral-400">File Name</label>
                          <p className="text-xs font-medium break-all text-neutral-800 dark:text-neutral-200">{selectedItem.name}</p>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-neutral-400">Size</label>
                                <p className="text-xs font-mono">{formatSize(selectedItem.size)}</p>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[9px] font-mono uppercase text-neutral-400">Dims</label>
                                <p className="text-xs font-mono">{selectedItem.width} x {selectedItem.height}</p>
                            </div>
                       </div>
                   </div>

                   {isPicker ? (
                        <button
                            onClick={() => handleSelection(selectedItem)}
                            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 mt-auto shadow-lg shadow-emerald-500/20"
                        >
                            <CheckCircle size={16} /> Use This Image
                        </button>
                   ) : (
                       <>
                           <button
                                onClick={() => copyToClipboard(selectedItem.url)}
                                className="w-full py-2.5 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
                           >
                                {copiedUrl === selectedItem.url ? <Check size={14} className="text-emerald-500"/> : <Copy size={14}/>}
                                {copiedUrl === selectedItem.url ? "Copied" : "Copy Link"}
                           </button>

                           {/* CATEGORY SELECTOR */}
                           {view === 'library' && (
                               <div className="space-y-2">
                                   <label className="text-[9px] font-mono uppercase text-neutral-400 flex items-center gap-2"><Folder size={10}/> Move to Folder</label>
                                   <select
                                        value={selectedItem.category || 'uncategorized'}
                                        onChange={(e) => handleCategoryChange(selectedItem, e.target.value)}
                                        className="w-full bg-neutral-50 dark:bg-neutral-950 p-2.5 rounded-xl text-xs outline-none border border-neutral-200 dark:border-neutral-800 focus:border-emerald-500 transition-colors cursor-pointer"
                                   >
                                       <option value="uncategorized" className="text-black bg-white dark:text-white dark:bg-neutral-900">Uncategorized</option>
                                       <optgroup label="Global Assets" className="text-black bg-white dark:text-white dark:bg-neutral-900">
                                            <option value="home:hero">Hero Visuals</option>
                                            <option value="home:profile">Profile & CV</option>
                                       </optgroup>
                                       <optgroup label="Playground" className="text-black bg-white dark:text-white dark:bg-neutral-900">
                                            {playground.map(p => <option key={p.id} value={`playground:${p.id}`}>{p.title}</option>)}
                                       </optgroup>
                                       <optgroup label="Projects" className="text-black bg-white dark:text-white dark:bg-neutral-900">
                                            {projects.map(p => <option key={p.id} value={`project:${p.id}`}>{p.title}</option>)}
                                       </optgroup>
                                       <optgroup label="Galleries" className="text-black bg-white dark:text-white dark:bg-neutral-900">
                                            {gallery.map(g => <option key={g.id} value={`gallery:${g.id}`}>{g.title}</option>)}
                                       </optgroup>
                                   </select>
                               </div>
                           )}
                           
                           <div className="mt-auto pt-4">
                                {view === 'library' ? (
                                    <button onClick={() => handleMoveToTrash(selectedItem)} className="w-full py-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2">
                                        <Trash2 size={14} /> Move to Trash
                                    </button>
                                ) : (
                                     <div className="grid grid-cols-2 gap-3">
                                        <button onClick={() => handleRestore(selectedItem)} className="py-3 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                                            <RotateCcw size={14} /> Restore
                                        </button>
                                        <button onClick={() => handlePermanentDelete(selectedItem)} className="py-3 bg-red-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                                            <AlertTriangle size={14} /> Delete
                                        </button>
                                     </div>
                                )}
                           </div>
                       </>
                   )}

               </MotionDiv>
           )}
       </AnimatePresence>

    </div>
  );
};

export default AdminMediaManager;
