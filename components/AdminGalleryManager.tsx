
import React from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, Trash2, MapPin, Calendar, Image as ImageIcon, Smartphone, Monitor, X
} from 'lucide-react';
import { GalleryCollection, PlaygroundSection } from '../types';
import { 
  createGalleryCollection, updateGalleryCollection, deleteGalleryCollectionService,
  createPlaygroundSection, updatePlaygroundSection, deletePlaygroundSectionService 
} from '../services/contentService';
import { MediaSelectData } from './AdminMediaManager';

const MotionDiv = motion.div as any;

interface AdminGalleryManagerProps {
    activeTab: 'gallery' | 'playground';
    gallery: GalleryCollection[];
    setGallery: React.Dispatch<React.SetStateAction<GalleryCollection[]>>;
    playground: PlaygroundSection[];
    setPlayground: React.Dispatch<React.SetStateAction<PlaygroundSection[]>>;
    onRefresh: () => void;
    openMediaPicker: (cb: (media: MediaSelectData) => void) => void;
}

const AdminGalleryManager: React.FC<AdminGalleryManagerProps> = ({ 
    activeTab, gallery, setGallery, playground, setPlayground, onRefresh, openMediaPicker 
}) => {
  
  // --- HELPER: GRID LOGIC ---
  const getGridClasses = (img: any) => {
    const width = img.width || 800;
    const height = img.height || 600;
    const isPortrait = height > width;

    // 1. Determine Span
    const mSpan = img.mobileSpan && img.mobileSpan > 0 
        ? Math.min(img.mobileSpan, 6) 
        : (isPortrait ? 3 : 6);

    const dSpan = img.desktopSpan && img.desktopSpan > 0 
        ? Math.min(img.desktopSpan, 12)
        : (isPortrait ? 3 : 6);

    // 2. Strict Aspect Ratio Calculation based on requested Row Height
    const mobileAspect = `aspect-[${mSpan}/2]`;
    const desktopAspect = `md:aspect-[${dSpan}/3]`;

    return `col-span-${mSpan} ${mobileAspect} md:col-span-${dSpan} ${desktopAspect}`;
  };

  // --- GALLERY ACTIONS ---
  const addGalleryCollection = async () => { 
    const newCol: GalleryCollection = { 
      id: `gal-${Date.now()}`, 
      title: 'New Collection', 
      location: 'Location', 
      date: 'Date', 
      images: [] 
    }; 
    
    // Optimistic Update
    setGallery([newCol, ...gallery]); 
    
    try {
      await createGalleryCollection(newCol);
      onRefresh(); // Sync with server
    } catch (e) {
      console.error(e);
      alert("Failed to create collection");
    }
  };
  
  const handleUpdateGallery = async (id: string, data: Partial<GalleryCollection>) => { 
    // Optimistic Update
    setGallery(prev => prev.map(g => g.id === id ? { ...g, ...data } : g));
    
    try {
      await updateGalleryCollection(id, data);
    } catch (e) {
      console.error(e);
      // Revert or alert on error in a real app
    }
  };
  
  const handleDeleteGallery = async (id: string) => { 
    if (confirm("Delete this collection? This cannot be undone.")) { 
      // Optimistic Update
      setGallery(prev => prev.filter(g => g.id !== id));
      
      try {
        await deleteGalleryCollectionService(id);
        onRefresh();
      } catch (e) {
        console.error(e);
        alert("Failed to delete collection");
      }
    } 
  };
  
  const addImageToGallery = async (colId: string) => { 
    const targetCol = gallery.find(g => g.id === colId);
    if (!targetCol) return;

    const newImage = { 
        src: '', 
        width: 800, 
        height: 1200, 
        id: `img-${Date.now()}`, 
        desktopSpan: 0, 
        mobileSpan: 0 
    };

    const newImages = [...targetCol.images, newImage];
    await handleUpdateGallery(colId, { images: newImages });
    
    // Auto open picker for the new image
    openMediaPicker((media) => {
        const updatedImages = [...newImages];
        const lastIndex = updatedImages.length - 1;
        updatedImages[lastIndex] = {
            ...updatedImages[lastIndex],
            src: media.url,
            width: media.width,
            height: media.height
        };
        handleUpdateGallery(colId, { images: updatedImages });
    });
  };

  // --- PLAYGROUND ACTIONS ---
  const addPlaygroundSection = async () => { 
    const newSec: PlaygroundSection = { 
      id: `play-${Date.now()}`, 
      title: 'New Experiment', 
      description: 'Describe...', 
      items: [] 
    }; 
    setPlayground([newSec, ...playground]); 
    try {
        await createPlaygroundSection(newSec);
        onRefresh(); 
    } catch(e) { console.error(e); }
  };
  
  const handleUpdatePlayground = async (id: string, data: Partial<PlaygroundSection>) => { 
    setPlayground(prev => prev.map(p => p.id === id ? { ...p, ...data } : p)); 
    try {
        await updatePlaygroundSection(id, data);
    } catch(e) { console.error(e); }
  };

  const handleDeletePlayground = async (id: string) => {
      if(confirm("Delete section?")) {
        setPlayground(prev => prev.filter(p => p.id !== id));
        try {
            await deletePlaygroundSectionService(id);
            onRefresh();
        } catch(e) { console.error(e); }
      }
  }

    if (activeTab === 'gallery') {
        return (
            <MotionDiv key="gal-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pb-32">
              <div className="flex items-center justify-between sticky top-[80px] z-30 bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-md py-4 -my-4 px-1">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Photography</h2>
                <button onClick={addGalleryCollection} className="px-6 py-2 bg-black dark:bg-white text-white dark:text-black rounded-full text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg hover:scale-105 transition-transform">
                  <Plus size={14} /> New Collection
                </button>
              </div>

              {gallery.map(col => (
                <div key={col.id} className="bg-white dark:bg-neutral-925 rounded-3xl border border-neutral-200 dark:border-neutral-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  {/* Collection Header */}
                  <div className="p-6 md:p-8 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-6 md:items-start justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                     <div className="flex-grow space-y-4">
                        <div className="flex flex-col gap-1">
                           <label className="text-[9px] font-mono uppercase text-neutral-400 ml-1">Collection Title</label>
                           <input 
                              value={col.title} 
                              onChange={e => handleUpdateGallery(col.id, { title: e.target.value })} 
                              className="bg-transparent text-2xl md:text-3xl font-bold uppercase tracking-tight outline-none w-full placeholder:text-neutral-300 dark:placeholder:text-neutral-700" 
                              placeholder="UNTITLED"
                           />
                        </div>
                        <div className="flex gap-4">
                           <div className="flex items-center gap-2 bg-white dark:bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full md:w-auto">
                              <MapPin size={12} className="text-neutral-400"/>
                              <input 
                                value={col.location} 
                                onChange={e => handleUpdateGallery(col.id, { location: e.target.value })} 
                                placeholder="Location" 
                                className="bg-transparent text-xs font-mono uppercase outline-none w-full" 
                              />
                           </div>
                           <div className="flex items-center gap-2 bg-white dark:bg-neutral-950 px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 w-full md:w-auto">
                              <Calendar size={12} className="text-neutral-400"/>
                              <input 
                                value={col.date} 
                                onChange={e => handleUpdateGallery(col.id, { date: e.target.value })} 
                                placeholder="Date" 
                                className="bg-transparent text-xs font-mono uppercase outline-none w-full" 
                              />
                           </div>
                        </div>
                     </div>
                     <button onClick={() => handleDeleteGallery(col.id)} className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all self-start">
                        <Trash2 size={20} />
                     </button>
                  </div>

                  {/* Visual Grid */}
                  <div className="p-6 md:p-8 bg-neutral-100/30 dark:bg-black/20">
                     <div className="grid grid-cols-6 md:grid-cols-12 gap-2 auto-rows-max grid-flow-dense">
                        {col.images.map((img, idx) => {
                           const gridClass = getGridClasses(img);
                           
                           return (
                             <div key={img.id} className={`group relative bg-white dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden ${gridClass}`}>
                                {img.src ? (
                                    <img src={img.src} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-300 gap-2">
                                        <ImageIcon size={24} />
                                        <span className="text-[9px] uppercase">No Image</span>
                                    </div>
                                )}
                                
                                {/* Overlay Controls */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                    <div className="flex justify-end gap-1">
                                        <button 
                                            onClick={() => openMediaPicker((media) => { 
                                              const newImgs = [...col.images]; 
                                              newImgs[idx].src = media.url; 
                                              newImgs[idx].width = media.width; 
                                              newImgs[idx].height = media.height; 
                                              handleUpdateGallery(col.id, { images: newImgs }); 
                                            })} 
                                            className="p-1.5 bg-white text-black rounded hover:bg-emerald-400 hover:text-white transition-colors"
                                        >
                                          <ImageIcon size={12}/>
                                        </button>
                                        <button 
                                            onClick={() => { 
                                                const newImgs = col.images.filter((_, i) => i !== idx); 
                                                handleUpdateGallery(col.id, { images: newImgs }); 
                                            }} 
                                            className="p-1.5 bg-white text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
                                        >
                                          <Trash2 size={12}/>
                                        </button>
                                    </div>

                                    {/* Span Controls */}
                                    <div className="grid grid-cols-2 gap-1 bg-black/80 p-1.5 rounded backdrop-blur-md">
                                       <div className="flex flex-col items-center">
                                          <Monitor size={10} className="text-neutral-400 mb-0.5"/>
                                          <select 
                                            value={img.desktopSpan || 0} 
                                            onChange={e => { 
                                              const newImgs = [...col.images]; 
                                              newImgs[idx].desktopSpan = Number(e.target.value); 
                                              handleUpdateGallery(col.id, { images: newImgs }); 
                                            }}
                                            className="bg-transparent text-[9px] font-bold text-white outline-none text-center w-full cursor-pointer hover:text-emerald-500"
                                          >
                                            <option value="0" className="text-black bg-white dark:text-white dark:bg-neutral-900">Auto</option>
                                            {[...Array(12)].map((_, i) => <option key={i} value={i+1} className="text-black bg-white dark:text-white dark:bg-neutral-900">{i+1}</option>)}
                                          </select>
                                       </div>
                                       <div className="flex flex-col items-center border-l border-white/10">
                                          <Smartphone size={10} className="text-neutral-400 mb-0.5"/>
                                          <select 
                                            value={img.mobileSpan || 0} 
                                            onChange={e => { 
                                              const newImgs = [...col.images]; 
                                              newImgs[idx].mobileSpan = Number(e.target.value); 
                                              handleUpdateGallery(col.id, { images: newImgs }); 
                                            }}
                                            className="bg-transparent text-[9px] font-bold text-white outline-none text-center w-full cursor-pointer hover:text-emerald-500"
                                          >
                                            <option value="0" className="text-black bg-white dark:text-white dark:bg-neutral-900">Auto</option>
                                            {[...Array(6)].map((_, i) => <option key={i} value={i+1} className="text-black bg-white dark:text-white dark:bg-neutral-900">{i+1}</option>)}
                                          </select>
                                       </div>
                                    </div>
                                </div>
                             </div>
                           );
                        })}
                        
                        {/* Add Button */}
                        <button 
                           onClick={() => addImageToGallery(col.id)} 
                           className="col-span-3 md:col-span-3 aspect-[3/2] rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all bg-white/50 dark:bg-neutral-900/50"
                        >
                           <Plus size={24} />
                           <span className="text-[10px] font-mono uppercase font-bold">Add Photo</span>
                        </button>
                     </div>
                  </div>
                </div>
              ))}
            </MotionDiv>
        );
    }

    if (activeTab === 'playground') {
        return (
            <MotionDiv key="play-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 pb-32">
              <div className="flex items-center justify-between sticky top-[80px] z-30 bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-md py-4 -my-4 px-1">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">Playground / Drafts</h2>
                <button onClick={addPlaygroundSection} className="px-6 py-2 bg-emerald-600 text-white rounded-full text-[10px] font-mono uppercase tracking-[0.2em] flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-500 hover:scale-105 transition-all">
                  <Plus size={14} /> New Experiment
                </button>
              </div>

              {playground.map(sec => (
                <div key={sec.id} className="bg-white dark:bg-neutral-925 rounded-3xl border border-neutral-200 dark:border-neutral-900 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                   {/* Header */}
                   <div className="p-6 md:p-8 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row gap-6 justify-between bg-neutral-50/50 dark:bg-neutral-900/50">
                      <div className="flex-grow space-y-2">
                         <div className="flex flex-col gap-1">
                             <label className="text-[9px] font-mono uppercase text-neutral-400 ml-1">Section Title</label>
                             <input 
                               value={sec.title} 
                               onChange={e => handleUpdatePlayground(sec.id, { title: e.target.value })} 
                               className="bg-transparent text-2xl md:text-3xl font-bold uppercase tracking-tight outline-none w-full placeholder:text-neutral-300 dark:placeholder:text-neutral-700" 
                               placeholder="SECTION NAME"
                             />
                         </div>
                         <textarea 
                            value={sec.description} 
                            onChange={e => handleUpdatePlayground(sec.id, { description: e.target.value })} 
                            className="bg-transparent text-neutral-500 text-sm font-medium outline-none w-full resize-none p-2 -ml-2 rounded-lg hover:bg-black/5 focus:bg-white dark:focus:bg-black transition-colors" 
                            rows={1} 
                            placeholder="Add a brief description for this section..." 
                         />
                      </div>
                      <button 
                         onClick={() => handleDeletePlayground(sec.id)} 
                         className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all self-start"
                      >
                         <Trash2 size={20} />
                      </button>
                   </div>

                   {/* Visual Grid */}
                   <div className="p-6 md:p-8 bg-neutral-100/30 dark:bg-black/20">
                      <div className="grid grid-cols-6 md:grid-cols-12 gap-2 auto-rows-max grid-flow-dense">
                         {sec.items.map((item, idx) => {
                            const gridClass = getGridClasses(item);

                            return (
                              <div key={item.id} className={`group relative bg-white dark:bg-neutral-900 rounded-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden ${gridClass}`}>
                                 {item.src ? (
                                    <img src={item.src} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                 ) : (
                                    <div className="w-full h-full flex items-center justify-center text-neutral-300">
                                        <ImageIcon size={20} />
                                    </div>
                                 )}
                                 
                                 {/* Overlay Controls */}
                                 <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                                     <div className="flex justify-between items-start gap-1">
                                         <input 
                                            value={item.title}
                                            onChange={e => { const newItems = [...sec.items]; newItems[idx].title = e.target.value; handleUpdatePlayground(sec.id, { items: newItems }); }}
                                            className="bg-transparent text-[10px] font-bold text-white placeholder:text-white/50 outline-none w-full border-b border-transparent focus:border-emerald-500"
                                            placeholder="Title..."
                                         />
                                         <button 
                                            onClick={() => { const newItems = sec.items.filter((_, i) => i !== idx); handleUpdatePlayground(sec.id, { items: newItems }); }} 
                                            className="p-1 bg-white/20 text-red-400 hover:bg-red-500 hover:text-white rounded"
                                         >
                                            <X size={10}/>
                                         </button>
                                     </div>

                                     <div className="flex justify-end">
                                         <button onClick={() => openMediaPicker((media) => { 
                                              const newItems = [...sec.items]; 
                                              newItems[idx].src = media.url; 
                                              newItems[idx].width = media.width; 
                                              newItems[idx].height = media.height; 
                                              handleUpdatePlayground(sec.id, { items: newItems }); 
                                            })} 
                                            className="text-[9px] bg-white text-black px-2 py-1 rounded font-bold uppercase"
                                         >
                                            Change Img
                                         </button>
                                     </div>

                                     {/* Span Controls */}
                                     <div className="grid grid-cols-2 gap-1 bg-black/80 p-1.5 rounded backdrop-blur-md">
                                        <div className="flex flex-col items-center">
                                           <Monitor size={10} className="text-neutral-400 mb-0.5"/>
                                           <select 
                                             value={item.desktopSpan || 0} 
                                             onChange={e => { const newItems = [...sec.items]; newItems[idx].desktopSpan = Number(e.target.value); handleUpdatePlayground(sec.id, { items: newItems }); }} 
                                             className="bg-transparent text-[9px] font-bold text-white outline-none text-center w-full cursor-pointer hover:text-emerald-500"
                                           >
                                             <option value="0" className="text-black bg-white dark:text-white dark:bg-neutral-900">Auto</option>
                                             {[...Array(12)].map((_, i) => <option key={i} value={i+1} className="text-black bg-white dark:text-white dark:bg-neutral-900">{i+1}</option>)}
                                           </select>
                                        </div>
                                        <div className="flex flex-col items-center border-l border-white/10">
                                           <Smartphone size={10} className="text-neutral-400 mb-0.5"/>
                                           <select 
                                             value={item.mobileSpan || 0} 
                                             onChange={e => { const newItems = [...sec.items]; newItems[idx].mobileSpan = Number(e.target.value); handleUpdatePlayground(sec.id, { items: newItems }); }} 
                                             className="bg-transparent text-[9px] font-bold text-white outline-none text-center w-full cursor-pointer hover:text-emerald-500"
                                           >
                                             <option value="0" className="text-black bg-white dark:text-white dark:bg-neutral-900">Auto</option>
                                             {[...Array(6)].map((_, i) => <option key={i} value={i+1} className="text-black bg-white dark:text-white dark:bg-neutral-900">{i+1}</option>)}
                                           </select>
                                        </div>
                                     </div>
                                 </div>
                              </div>
                            );
                         })}

                         {/* Add Button */}
                         <button 
                            onClick={() => { 
                              const newItems = [...sec.items, { 
                                id: `item-${Date.now()}`, title: '', src: '', width: 800, height: 1000, tag: 'Experiment', desktopSpan: 0, mobileSpan: 0 
                              }]; 
                              handleUpdatePlayground(sec.id, { items: newItems }); 
                            }} 
                            className="col-span-3 md:col-span-3 aspect-[3/2] rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-800 flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-emerald-500 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all bg-white/50 dark:bg-neutral-900/50"
                          >
                            <Plus size={24} />
                            <span className="text-[10px] font-mono uppercase font-bold">Add Item</span>
                         </button>
                      </div>
                   </div>
                </div>
              ))}
            </MotionDiv>
        );
    }
    return null;
}

export default AdminGalleryManager;
