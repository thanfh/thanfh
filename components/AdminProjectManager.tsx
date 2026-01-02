
import React, { useState } from 'react';
import { motion, Reorder } from 'framer-motion';
import { 
  Plus, Trash2, Image as ImageIcon, Briefcase, Eye, EyeOff, Maximize2, X,
  Type, Edit3, Video, LayoutGrid, Code as CodeIcon, MousePointer, 
  Quote as QuoteIcon, Minus as MinusIcon, MoveVertical, ChevronLeft,
  Calendar, Globe2, User, Users, Flag, Search, AlignLeft, AlignCenter, AlignRight,
  Bold, Italic, Underline as UnderlineIcon, Palette, GripVertical, Columns
} from 'lucide-react';
import { Project, ProjectBlock, BaseBlock, BlockType } from '../types';
import { createProject, updateProject, deleteProjectService } from '../services/contentService';
import { MediaSelectData } from './AdminMediaManager';

const MotionDiv = motion.div as any;

type ProjectSubTab = 'essentials' | 'narrative' | 'builder' | 'settings';

// Extended type for UI specific block properties
type ExtendedBlock = BaseBlock & {
    content?: string;
    title?: string;
    align?: 'left' | 'center' | 'right';
    textStyle?: 'normal' | 'serif' | 'mono';
    textColor?: 'default' | 'muted' | 'accent';
    fontSize?: 'sm' | 'base' | 'lg'; 
    fontWeight?: 'normal' | 'bold'; 
    italic?: boolean; 
    underline?: boolean; 
    headingLevel?: 'h2' | 'h3';
    imageUrl?: string;
    videoUrl?: string;
    aspectRatio?: any; 
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full'; 
    shadow?: boolean; 
    caption?: string;
    autoPlay?: boolean; 
    loop?: boolean; 
    images?: string[];
    layout?: string;
    text?: string;
    author?: string;
    leftContent?: string;
    leftTitle?: string;
    rightContent?: string;
    rightImage?: string;
    code?: string; 
    language?: 'javascript' | 'typescript' | 'html' | 'css' | 'python' | 'json'; 
    buttonText?: string; 
    buttonUrl?: string; 
    buttonStyle?: 'solid' | 'outline' | 'ghost'; 
    height?: string;
    isCollapsed?: boolean;
}

interface AdminProjectManagerProps {
    projects: Project[];
    setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
    onRefresh: () => void;
    openMediaPicker: (cb: (media: MediaSelectData) => void) => void;
    setPreviewMode: (mode: 'home' | 'project') => void;
    setIsPreviewOpen: (isOpen: boolean) => void;
    setEditingProjId: React.Dispatch<React.SetStateAction<string | null>>;
    isEditingProj: boolean;
    setIsEditingProj: React.Dispatch<React.SetStateAction<boolean>>;
    projForm: Partial<Project>;
    setProjForm: React.Dispatch<React.SetStateAction<Partial<Project>>>;
    editingProjId: string | null;
}

const AdminProjectManager: React.FC<AdminProjectManagerProps> = ({ 
    projects, setProjects, onRefresh, openMediaPicker, setPreviewMode, setIsPreviewOpen,
    setEditingProjId, isEditingProj, setIsEditingProj, projForm, setProjForm, editingProjId
}) => {
    const [activeProjectTab, setActiveProjectTab] = useState<ProjectSubTab>('essentials');
    const [isSaving, setIsSaving] = useState(false);
    const [toolsInput, setToolsInput] = useState('');

    const initialProjectState: Partial<Project> = {
        title: '', year: new Date().getFullYear().toString(), category: 'Branding',
        description: '', imageUrl: '', videoUrl: '', challenge: '', solution: '',
        tools: [], blocks: [], client: '', role: '', liveUrl: '', featured: false
    };

    // --- PROJECT ACTIONS ---
    const handleSaveProject = async () => {
        if (!projForm.title) return alert("Title is required");
        setIsSaving(true);
        
        const cleanBlocks = projForm.blocks?.map(({ isCollapsed, ...rest }: any) => rest) as any[] as ProjectBlock[] || [];

        const projectData: Project = {
            ...(projForm as Project),
            id: editingProjId || `p-${Date.now()}`,
            title: projForm.title || '',
            category: projForm.category || 'Branding',
            year: projForm.year || '',
            description: projForm.description || '',
            imageUrl: projForm.imageUrl || '',
            blocks: cleanBlocks,
            tools: toolsInput.split(',').map(t => t.trim()).filter(t => t !== ''),
            displayOrder: projForm.displayOrder || projects.length + 1
        };
        
        try {
            if (editingProjId) {
                await updateProject(projectData);
            } else {
                await createProject(projectData);
            }
            alert("Project saved successfully!");
            onRefresh(); // Reload list
        } catch (e) {
            console.error(e);
            alert("Error saving project.");
        }
        
        setIsSaving(false);
    };

    const deleteProject = async (id: string) => {
        if (confirm("Delete project? This cannot be undone.")) {
            setIsSaving(true);
            try {
                await deleteProjectService(id);
                if (editingProjId === id) {
                    setIsEditingProj(false);
                    setEditingProjId(null);
                }
                onRefresh();
            } catch (e) {
                console.error(e);
                alert("Error deleting project.");
            }
            setIsSaving(false);
        }
    };

    const addBlock = (type: BlockType | 'video' | 'spacer' | 'heading' | 'code' | 'button' | 'divider') => {
        const newBlock: any = { id: `b-${Date.now()}`, type, isCollapsed: false };
        if (type === 'text') { newBlock.content = ''; newBlock.align = 'left'; newBlock.fontSize = 'base'; }
        if (type === 'heading') { newBlock.content = ''; newBlock.headingLevel = 'h2'; newBlock.align = 'left'; }
        if (type === 'full-image') { newBlock.imageUrl = ''; newBlock.caption = ''; newBlock.aspectRatio = 'auto'; newBlock.radius = 'md'; }
        if (type === 'image-grid') { newBlock.images = ['', '']; newBlock.layout = 'simple-2'; }
        if (type === 'quote') { newBlock.text = ''; newBlock.author = ''; }
        if (type === 'two-column') { newBlock.leftContent = ''; newBlock.rightImage = ''; newBlock.leftTitle = ''; }
        if (type === 'video') { newBlock.videoUrl = ''; newBlock.caption = ''; newBlock.aspectRatio = '16/9'; }
        if (type === 'spacer') { newBlock.height = '64px'; }
        if (type === 'code') { newBlock.code = ''; newBlock.language = 'javascript'; }
        if (type === 'button') { newBlock.buttonText = 'View Live'; newBlock.buttonUrl = ''; newBlock.buttonStyle = 'solid'; }
        if (type === 'divider') { newBlock.height = '1px'; }

        setProjForm({ ...projForm, blocks: [...(projForm.blocks || []), newBlock] as ProjectBlock[] });
    };

    const updateBlock = (blockId: string, data: Partial<ExtendedBlock>) => {
        const updatedBlocks = projForm.blocks?.map(b => b.id === blockId ? { ...b, ...data } : b);
        setProjForm({ ...projForm, blocks: updatedBlocks as ProjectBlock[] });
    };

    const toggleBlockCollapse = (blockId: string) => {
        const updatedBlocks = projForm.blocks?.map((b: any) => b.id === blockId ? { ...b, isCollapsed: !b.isCollapsed } : b);
        setProjForm({ ...projForm, blocks: updatedBlocks as ProjectBlock[] });
    };

    const duplicateBlock = (block: ProjectBlock) => {
        const newBlock = { ...block, id: `b-${Date.now()}` };
        const blocks = projForm.blocks || [];
        const index = blocks.findIndex(b => b.id === block.id);
        const newBlocks = [...blocks];
        newBlocks.splice(index + 1, 0, newBlock);
        setProjForm({ ...projForm, blocks: newBlocks as ProjectBlock[] });
    }

    const handleReorderBlocks = (newOrder: any[]) => {
        setProjForm({ ...projForm, blocks: newOrder });
    };

    const renderBlockEditor = (block: any) => {
        if (block.isCollapsed) return null;
        switch(block.type) {
            case 'heading':
                return (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                                {['left', 'center', 'right'].map((align) => (
                                    <button key={align} onClick={() => updateBlock(block.id, { align: align as any })} className={`p-1.5 rounded-md transition-all ${block.align === align ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                        {align === 'left' && <AlignLeft size={14} />} {align === 'center' && <AlignCenter size={14} />} {align === 'right' && <AlignRight size={14} />}
                                    </button>
                                ))}
                            </div>
                            <select value={block.headingLevel || 'h2'} onChange={e => updateBlock(block.id, { headingLevel: e.target.value as any })} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg text-xs font-mono outline-none">
                                <option value="h2" className="text-black bg-white dark:text-white dark:bg-neutral-900">H2 (Big)</option>
                                <option value="h3" className="text-black bg-white dark:text-white dark:bg-neutral-900">H3 (Medium)</option>
                            </select>
                        </div>
                        <input value={block.content} onChange={e => updateBlock(block.id, { content: e.target.value })} placeholder="Heading Text..." className={`w-full bg-white dark:bg-neutral-950 p-3 rounded-lg font-bold outline-none border border-neutral-200 dark:border-neutral-800 ${block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'} ${block.headingLevel === 'h3' ? 'text-lg' : 'text-xl'}`} />
                    </div>
                );
            case 'text': 
                return (
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                              {['left', 'center', 'right'].map((align) => (
                                   <button key={align} onClick={() => updateBlock(block.id, { align: align as any })} className={`p-1.5 rounded-md transition-all ${block.align === align ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                       {align === 'left' && <AlignLeft size={14} />} {align === 'center' && <AlignCenter size={14} />} {align === 'right' && <AlignRight size={14} />}
                                   </button>
                               ))}
                          </div>
                          <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 gap-1">
                              <button onClick={() => updateBlock(block.id, { fontWeight: block.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-1.5 rounded-md transition-all ${block.fontWeight === 'bold' ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                  <Bold size={14} />
                              </button>
                              <button onClick={() => updateBlock(block.id, { italic: !block.italic })} className={`p-1.5 rounded-md transition-all ${block.italic ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                  <Italic size={14} />
                              </button>
                              <button onClick={() => updateBlock(block.id, { underline: !block.underline })} className={`p-1.5 rounded-md transition-all ${block.underline ? 'bg-white shadow-sm text-black' : 'text-neutral-400 hover:text-black dark:hover:text-white'}`}>
                                  <UnderlineIcon size={14} />
                              </button>
                          </div>
                           <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1 px-2">
                               <Palette size={12} className="text-neutral-400" />
                               <select value={block.textColor || 'default'} onChange={e => updateBlock(block.id, { textColor: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer">
                                   <option value="default" className="text-black bg-white dark:text-white dark:bg-neutral-900">Default</option>
                                   <option value="muted" className="text-black bg-white dark:text-white dark:bg-neutral-900">Muted</option>
                                   <option value="accent" className="text-black bg-white dark:text-white dark:bg-neutral-900">Accent</option>
                               </select>
                           </div>
                      </div>
                      <textarea 
                          value={block.content} 
                          onChange={e => updateBlock(block.id, { content: e.target.value })} 
                          placeholder="Write your paragraph..." 
                          rows={4} 
                          className={`w-full bg-white dark:bg-neutral-950 p-4 rounded-lg leading-relaxed outline-none border border-neutral-200 dark:border-neutral-800 
                              ${block.align === 'center' ? 'text-center' : block.align === 'right' ? 'text-right' : 'text-left'} 
                              ${block.textStyle === 'serif' ? 'font-serif' : block.textStyle === 'mono' ? 'font-mono' : 'font-sans'} 
                              ${block.textColor === 'muted' ? 'text-neutral-500' : block.textColor === 'accent' ? 'text-emerald-600' : 'text-neutral-900 dark:text-white'}
                              ${block.fontWeight === 'bold' ? 'font-bold' : 'font-normal'} 
                              ${block.italic ? 'italic' : ''} 
                              ${block.underline ? 'underline underline-offset-4' : ''}
                          `} 
                      />
                  </div>
                );
            case 'full-image':
                return (
                  <div className="space-y-4">
                      <div className="flex gap-4">
                           <div className="flex-grow space-y-3">
                               <div className="flex gap-2">
                                   <input value={block.imageUrl} onChange={e => updateBlock(block.id, { imageUrl: e.target.value })} placeholder="Image URL (https://...)" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                                   <button onClick={() => openMediaPicker((media) => updateBlock(block.id, { imageUrl: media.url }))} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-emerald-500"><ImageIcon size={16}/></button>
                               </div>
                               <input value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value })} placeholder="Image Caption (Optional)" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                               
                               <div className="flex gap-3 flex-wrap">
                                   <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg">
                                       <span className="text-[9px] font-mono uppercase text-neutral-400 pl-1">Ratio</span>
                                       <select value={block.aspectRatio || 'auto'} onChange={e => updateBlock(block.id, { aspectRatio: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer">
                                           <option value="auto" className="text-black bg-white dark:text-white dark:bg-neutral-900">Auto</option>
                                           <option value="16/9" className="text-black bg-white dark:text-white dark:bg-neutral-900">16:9</option>
                                           <option value="4/3" className="text-black bg-white dark:text-white dark:bg-neutral-900">4:3</option>
                                           <option value="1/1" className="text-black bg-white dark:text-white dark:bg-neutral-900">1:1</option>
                                           <option value="9/16" className="text-black bg-white dark:text-white dark:bg-neutral-900">9:16</option>
                                       </select>
                                   </div>
                                   <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg">
                                       <span className="text-[9px] font-mono uppercase text-neutral-400 pl-1">Radius</span>
                                       <select value={block.radius || 'md'} onChange={e => updateBlock(block.id, { radius: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer">
                                           <option value="none" className="text-black bg-white dark:text-white dark:bg-neutral-900">None</option>
                                           <option value="sm" className="text-black bg-white dark:text-white dark:bg-neutral-900">Small</option>
                                           <option value="md" className="text-black bg-white dark:text-white dark:bg-neutral-900">Medium</option>
                                           <option value="lg" className="text-black bg-white dark:text-white dark:bg-neutral-900">Large</option>
                                           <option value="full" className="text-black bg-white dark:text-white dark:bg-neutral-900">Full</option>
                                       </select>
                                   </div>
                               </div>
                           </div>
                           <div className={`w-32 self-start bg-neutral-200 dark:bg-neutral-800 flex-shrink-0 overflow-hidden ${block.radius === 'full' ? 'rounded-full aspect-square' : `rounded-${block.radius || 'md'} aspect-[${block.aspectRatio === 'auto' ? 'video' : block.aspectRatio?.replace(':','/')}]`}`}>
                               {block.imageUrl ? <img src={block.imageUrl} className={`w-full h-full object-cover ${block.shadow ? 'opacity-90' : ''}`} /> : <div className="w-full h-full flex items-center justify-center text-xs text-neutral-400">Preview</div>}
                           </div>
                      </div>
                  </div>
                );
            case 'video':
                return (
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input value={block.videoUrl} onChange={e => updateBlock(block.id, { videoUrl: e.target.value })} placeholder="Video URL (mp4/webm)..." className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                            <button onClick={() => openMediaPicker((media) => updateBlock(block.id, { videoUrl: media.url }))} className="p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg text-neutral-500 hover:text-emerald-500"><ImageIcon size={16}/></button>
                        </div>
                        <div className="flex gap-4">
                             <input value={block.caption || ''} onChange={e => updateBlock(block.id, { caption: e.target.value })} placeholder="Caption..." className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                             <div className="flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 p-1.5 rounded-lg flex-shrink-0">
                                   <span className="text-[9px] font-mono uppercase text-neutral-400 pl-1">Ratio</span>
                                   <select value={block.aspectRatio || '16/9'} onChange={e => updateBlock(block.id, { aspectRatio: e.target.value as any })} className="bg-transparent text-[10px] font-bold uppercase outline-none cursor-pointer">
                                       <option value="16/9" className="text-black bg-white dark:text-white dark:bg-neutral-900">16:9</option>
                                       <option value="4/3" className="text-black bg-white dark:text-white dark:bg-neutral-900">4:3</option>
                                       <option value="1/1" className="text-black bg-white dark:text-white dark:bg-neutral-900">1:1</option>
                                   </select>
                             </div>
                        </div>
                        <div className="flex gap-4">
                             <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-500 cursor-pointer">
                                 <input type="checkbox" checked={block.autoPlay !== false} onChange={e => updateBlock(block.id, { autoPlay: e.target.checked })} /> Autoplay
                             </label>
                             <label className="flex items-center gap-2 text-xs font-mono uppercase text-neutral-500 cursor-pointer">
                                 <input type="checkbox" checked={block.loop !== false} onChange={e => updateBlock(block.id, { loop: e.target.checked })} /> Loop
                             </label>
                        </div>
                    </div>
                );
            case 'quote':
                return (
                    <div className="space-y-3">
                        <textarea value={block.text} onChange={e => updateBlock(block.id, { text: e.target.value })} placeholder="Quote text..." rows={3} className="w-full bg-white dark:bg-neutral-950 p-4 rounded-lg text-lg font-serif italic outline-none border border-neutral-200 dark:border-neutral-800" />
                        <input value={block.author || ''} onChange={e => updateBlock(block.id, { author: e.target.value })} placeholder="— Author Name" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm font-mono outline-none border border-neutral-200 dark:border-neutral-800" />
                    </div>
                );
            case 'code':
                return (
                    <div className="space-y-3">
                        <div className="flex justify-end">
                            <select value={block.language || 'javascript'} onChange={e => updateBlock(block.id, { language: e.target.value as any })} className="bg-neutral-100 dark:bg-neutral-800 p-2 rounded-lg text-xs font-mono outline-none cursor-pointer">
                                <option value="javascript" className="text-black bg-white dark:text-white dark:bg-neutral-900">JavaScript</option>
                                <option value="typescript" className="text-black bg-white dark:text-white dark:bg-neutral-900">TypeScript</option>
                                <option value="css" className="text-black bg-white dark:text-white dark:bg-neutral-900">CSS</option>
                                <option value="html" className="text-black bg-white dark:text-white dark:bg-neutral-900">HTML</option>
                                <option value="python" className="text-black bg-white dark:text-white dark:bg-neutral-900">Python</option>
                                <option value="json" className="text-black bg-white dark:text-white dark:bg-neutral-900">JSON</option>
                            </select>
                        </div>
                        <textarea value={block.code} onChange={e => updateBlock(block.id, { code: e.target.value })} placeholder="// Paste code here..." rows={6} className="w-full bg-neutral-900 text-neutral-300 p-4 rounded-lg font-mono text-xs leading-relaxed outline-none border border-neutral-800" />
                    </div>
                );
            case 'button':
                return (
                    <div className="grid grid-cols-2 gap-4">
                        <input value={block.buttonText} onChange={e => updateBlock(block.id, { buttonText: e.target.value })} placeholder="Button Label" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                        <input value={block.buttonUrl} onChange={e => updateBlock(block.id, { buttonUrl: e.target.value })} placeholder="Target URL" className="w-full bg-white dark:bg-neutral-950 p-3 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800" />
                        <div className="col-span-2 flex items-center gap-2">
                            <span className="text-[10px] font-mono uppercase text-neutral-400">Style:</span>
                            {['solid', 'outline', 'ghost'].map(style => (
                                <button key={style} onClick={() => updateBlock(block.id, { buttonStyle: style as any })} className={`px-3 py-1.5 rounded-md text-xs uppercase font-bold border ${block.buttonStyle === style ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-white dark:text-black' : 'border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}>
                                    {style}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 'spacer':
                return (
                    <div className="flex items-center gap-4">
                        <MoveVertical size={16} className="text-neutral-400" />
                        <input type="range" min="16" max="256" step="16" value={parseInt(block.height || '64')} onChange={e => updateBlock(block.id, { height: `${e.target.value}px` })} className="flex-grow accent-emerald-500" />
                        <span className="text-xs font-mono w-16 text-right">{block.height}</span>
                    </div>
                );
            case 'divider':
                 return (
                     <div className="flex items-center gap-4 py-2 opacity-50">
                         <div className="h-px bg-neutral-300 dark:bg-neutral-700 w-full"></div>
                         <span className="text-[10px] font-mono uppercase text-neutral-400 whitespace-nowrap">Divider Line</span>
                         <div className="h-px bg-neutral-300 dark:bg-neutral-700 w-full"></div>
                     </div>
                 );
            case 'two-column':
                 return (
                     <div className="space-y-4">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-neutral-100 dark:bg-neutral-900 rounded-xl">
                              <div className="space-y-2">
                                  <label className="text-[10px] font-mono uppercase text-neutral-400">Left Column</label>
                                  <input value={block.leftTitle || ''} onChange={e => updateBlock(block.id, { leftTitle: e.target.value })} placeholder="Title (Optional)" className="w-full bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm font-bold outline-none border border-neutral-200 dark:border-neutral-800" />
                                  <textarea value={block.leftContent || ''} onChange={e => updateBlock(block.id, { leftContent: e.target.value })} placeholder="Content..." rows={4} className="w-full bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800 resize-none" />
                              </div>
                              <div className="space-y-2">
                                  <label className="text-[10px] font-mono uppercase text-neutral-400">Right Column</label>
                                  <div className="flex gap-2 mb-2">
                                      <input value={block.rightImage || ''} onChange={e => updateBlock(block.id, { rightImage: e.target.value })} placeholder="Image URL..." className="w-full bg-white dark:bg-neutral-950 p-2 rounded-lg text-xs outline-none border border-neutral-200 dark:border-neutral-800" />
                                      <button onClick={() => openMediaPicker((media) => updateBlock(block.id, { rightImage: media.url }))} className="p-2 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg"><ImageIcon size={14}/></button>
                                  </div>
                                  <textarea value={block.rightContent || ''} onChange={e => updateBlock(block.id, { rightContent: e.target.value })} placeholder="Or text content..." rows={2} className="w-full bg-white dark:bg-neutral-950 p-2 rounded-lg text-sm outline-none border border-neutral-200 dark:border-neutral-800 resize-none" />
                              </div>
                         </div>
                     </div>
                 );
            case 'image-grid':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono uppercase text-neutral-400">Grid Images</label>
                            <div className="flex gap-2">
                                <button onClick={() => updateBlock(block.id, { layout: 'simple-2' })} className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${block.layout === 'simple-2' ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>2 Col</button>
                                <button onClick={() => updateBlock(block.id, { layout: 'simple-3' })} className={`px-2 py-1 text-[10px] uppercase font-bold rounded ${block.layout === 'simple-3' ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>3 Col</button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {block.images?.map((img: string, idx: number) => (
                                <div key={idx} className="relative aspect-square bg-neutral-100 dark:bg-neutral-900 rounded-lg overflow-hidden group">
                                     {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-neutral-300"><ImageIcon size={20}/></div>}
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                                         <button onClick={() => {
                                             const newImages = [...(block.images || [])];
                                             newImages.splice(idx, 1);
                                             updateBlock(block.id, { images: newImages });
                                         }} className="p-1.5 bg-red-500 text-white rounded-full"><Trash2 size={12}/></button>
                                     </div>
                                </div>
                            ))}
                            <button 
                                onClick={() => openMediaPicker((media) => {
                                    updateBlock(block.id, { images: [...(block.images || []), media.url] });
                                })}
                                className="aspect-square bg-white dark:bg-neutral-950 border-2 border-dashed border-neutral-200 dark:border-neutral-800 rounded-lg flex flex-col items-center justify-center gap-2 text-neutral-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors"
                            >
                                <Plus size={20} />
                                <span className="text-[9px] uppercase font-bold">Add</span>
                            </button>
                        </div>
                    </div>
                );
            default: return <div className="text-neutral-500 text-xs p-2">Block editor not available for {block.type}</div>;
        }
    };

    return (
        <MotionDiv key="proj-tab" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">
              {/* LEFT LIST - SIDEBAR */}
              <div className={`lg:col-span-3 flex flex-col gap-4 h-full ${isEditingProj ? 'hidden lg:flex' : 'flex'}`}>
                 <div className="flex justify-between items-center">
                     <h3 className="text-sm font-bold uppercase text-neutral-400">All Projects</h3>
                     <button onClick={() => { setProjForm(initialProjectState); setEditingProjId(null); setIsEditingProj(true); setActiveProjectTab('essentials'); }} className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-80 transition-opacity"><Plus size={16}/></button>
                 </div>
                 <div className="flex-grow overflow-y-auto pr-2 space-y-2 no-scrollbar">
                     {projects.map(p => (
                         <div key={p.id} onClick={() => { setProjForm(p); setEditingProjId(p.id); setIsEditingProj(true); setActiveProjectTab('essentials'); setToolsInput(p.tools?.join(', ') || ''); }} className={`p-3 rounded-xl border cursor-pointer transition-all hover:border-emerald-500 group ${editingProjId === p.id ? 'bg-white dark:bg-neutral-900 border-emerald-500 shadow-md' : 'bg-transparent border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}>
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-lg bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex-shrink-0">
                                     {p.imageUrl && <img src={p.imageUrl} className="w-full h-full object-cover" />}
                                 </div>
                                 <div className="min-w-0 flex-grow">
                                     <h4 className="font-bold text-sm truncate">{p.title}</h4>
                                     <div className="flex items-center gap-2 text-[10px] text-neutral-500 font-mono">
                                         <span>{p.category}</span>
                                         <span>•</span>
                                         <span>{p.year}</span>
                                     </div>
                                 </div>
                             </div>
                         </div>
                     ))}
                 </div>
              </div>
              {/* RIGHT EDITOR - MAIN AREA */}
              <div className={`lg:col-span-9 bg-white dark:bg-neutral-925 rounded-3xl border border-neutral-200 dark:border-neutral-900 shadow-sm flex flex-col h-full overflow-hidden relative ${!isEditingProj ? 'hidden lg:flex' : 'flex'}`}>
                  {!isEditingProj ? (
                      <div className="flex flex-col items-center justify-center h-full text-neutral-400 gap-4">
                          <Briefcase size={48} className="opacity-20" />
                          <p>Select a project to edit or create a new one.</p>
                      </div>
                  ) : (
                      <>
                          {/* COMBINED HEADER & TABS CONTAINER */}
                          <div className="flex-shrink-0 z-20 bg-white dark:bg-neutral-925 border-b border-neutral-100 dark:border-neutral-800 rounded-t-3xl">
                             
                             {/* TOP SECTION: Title, Inputs, Actions */}
                             <div className="flex flex-col md:flex-row md:items-start justify-between p-6 gap-4">
                                
                                {/* LEFT: Inputs */}
                                <div className="flex items-start gap-4 flex-grow min-w-0">
                                     {/* Mobile Back Button */}
                                     <button onClick={() => setIsEditingProj(false)} className="lg:hidden mt-1 p-2 -ml-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                                        <ChevronLeft size={24}/>
                                     </button>

                                     <div className="flex flex-col gap-2 flex-grow w-full">
                                        <input 
                                            value={projForm.title} 
                                            onChange={e => setProjForm({...projForm, title: e.target.value})} 
                                            placeholder="Untitled Project" 
                                            className="bg-transparent text-2xl md:text-3xl font-bold outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-700 w-full truncate" 
                                        />
                                        <div className="flex flex-wrap items-center gap-3">
                                            <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
                                                <span className="text-[10px] font-mono uppercase text-neutral-400">Category</span>
                                                <select 
                                                    value={projForm.category} 
                                                    onChange={e => setProjForm({...projForm, category: e.target.value as any})} 
                                                    className="bg-transparent text-[10px] font-bold uppercase outline-none text-neutral-900 dark:text-white cursor-pointer"
                                                >
                                                    <option className="bg-white dark:bg-neutral-900">Branding</option>
                                                    <option className="bg-white dark:bg-neutral-900">3D</option>
                                                    <option className="bg-white dark:bg-neutral-900">Motion</option>
                                                    <option className="bg-white dark:bg-neutral-900">2D</option>
                                                </select>
                                            </div>
                                            <input 
                                                value={projForm.year} 
                                                onChange={e => setProjForm({...projForm, year: e.target.value})} 
                                                className="bg-transparent text-[10px] font-mono text-neutral-500 w-16 border-b border-transparent focus:border-neutral-500 outline-none transition-colors"
                                                placeholder="Year"
                                            />
                                        </div>
                                     </div>
                                </div>

                                {/* RIGHT: Actions */}
                                <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                                     <button onClick={() => { setPreviewMode('project'); setIsPreviewOpen(true); }} className="p-2 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-black dark:hover:text-white rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all" title="Preview"><Eye size={18} /></button>
                                     <button onClick={() => deleteProject(editingProjId!)} className="p-2 text-neutral-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all" title="Delete"><Trash2 size={18} /></button>
                                     <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-800 mx-1"></div>
                                     <button onClick={handleSaveProject} disabled={isSaving} className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                                        {isSaving ? <span className="animate-pulse">Saving...</span> : 'Save'}
                                     </button>
                                </div>
                             </div>

                             {/* BOTTOM SECTION: TABS */}
                             <div className="px-6 flex gap-8 overflow-x-auto no-scrollbar">
                                  {[
                                      { id: 'essentials', label: 'Essentials' },
                                      { id: 'narrative', label: 'Case Study' },
                                      { id: 'builder', label: 'Story Blocks' },
                                      { id: 'settings', label: 'Settings & SEO' }
                                  ].map(t => (
                                      <button 
                                           key={t.id} 
                                           onClick={() => setActiveProjectTab(t.id as ProjectSubTab)}
                                           className={`pb-4 text-xs font-bold uppercase tracking-wider relative flex-shrink-0 transition-colors ${activeProjectTab === t.id ? 'text-emerald-500' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'}`}
                                      >
                                          {t.label}
                                          {activeProjectTab === t.id && <motion.div layoutId="projTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />}
                                      </button>
                                  ))}
                             </div>
                          </div>
                          
                          {/* EDITOR CONTENT */}
                          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-10 custom-scrollbar relative">
                              {/* === TAB 1: ESSENTIALS === */}
                              {activeProjectTab === 'essentials' && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                                      {/* Cover Media */}
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                          <div className="md:col-span-2 space-y-4">
                                              <label className="text-[10px] font-mono uppercase text-neutral-400">Cover Image (Thumbnail & Hero)</label>
                                              <div className="aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative group overflow-hidden">
                                                   {projForm.imageUrl ? <img src={projForm.imageUrl} className="w-full h-full object-cover" /> : <div className="text-center"><ImageIcon className="mx-auto mb-2 opacity-20" /><span className="text-xs text-neutral-400">Select Image</span></div>}
                                                   <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                                                       <button onClick={() => openMediaPicker((media) => setProjForm({...projForm, imageUrl: media.url}))} className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-bold text-xs uppercase tracking-wider">Select Media</button>
                                                   </div>
                                               </div>
                                               <input value={projForm.imageUrl} onChange={e => setProjForm({...projForm, imageUrl: e.target.value})} placeholder="Or paste URL here..." className="w-full bg-neutral-50 dark:bg-neutral-900 p-2 rounded-lg text-xs outline-none border border-neutral-100 dark:border-neutral-800" />
                                          </div>
                                          <div className="space-y-4">
                                               <label className="text-[10px] font-mono uppercase text-neutral-400">Hero Video (Optional)</label>
                                               <div className="aspect-[9/16] md:aspect-square bg-neutral-100 dark:bg-neutral-900 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex items-center justify-center relative p-4 group">
                                                   <div className="text-center space-y-2 w-full">
                                                       <Video className="mx-auto opacity-20" />
                                                       <input value={projForm.videoUrl} onChange={e => setProjForm({...projForm, videoUrl: e.target.value})} placeholder="Video URL" className="w-full bg-transparent text-center text-xs outline-none border-b border-neutral-300 dark:border-neutral-700 pb-1" />
                                                   </div>
                                                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                       <button onClick={() => openMediaPicker((media) => setProjForm({...projForm, videoUrl: media.url}))} className="p-2 bg-neutral-800 text-white rounded-lg"><ImageIcon size={14}/></button>
                                                   </div>
                                               </div>
                                          </div>
                                      </div>
                                      {/* Core Metadata */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                           <div className="space-y-2">
                                               <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><Calendar size={12}/> Year</label>
                                               <input value={projForm.year} onChange={e => setProjForm({...projForm, year: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="e.g. 2024" />
                                           </div>
                                           <div className="space-y-2">
                                               <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><Globe2 size={12}/> Live Link</label>
                                               <input value={projForm.liveUrl || ''} onChange={e => setProjForm({...projForm, liveUrl: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="https://..." />
                                           </div>
                                           <div className="space-y-2">
                                               <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><User size={12}/> Client / Agency</label>
                                               <input value={projForm.client || ''} onChange={e => setProjForm({...projForm, client: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="Client Name" />
                                           </div>
                                           <div className="space-y-2">
                                               <label className="flex items-center gap-2 text-[10px] font-mono uppercase text-neutral-400"><Users size={12}/> My Role</label>
                                               <input value={projForm.role || ''} onChange={e => setProjForm({...projForm, role: e.target.value})} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="e.g. Art Director, Lead Dev" />
                                           </div>
                                      </div>
                                      {/* Tools / Tech Stack */}
                                      <div className="space-y-2">
                                           <label className="text-[10px] font-mono uppercase text-neutral-400">Tools & Technologies</label>
                                           <input value={toolsInput} onChange={e => setToolsInput(e.target.value)} className="w-full bg-neutral-50 dark:bg-neutral-900 p-4 rounded-xl text-sm outline-none border border-neutral-100 dark:border-neutral-800" placeholder="React, Figma, Blender (comma separated)" />
                                      </div>
                                  </motion.div>
                              )}
                              {activeProjectTab === 'narrative' && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-4xl mx-auto">
                                      <div className="space-y-2">
                                          <label className="text-[10px] font-mono uppercase text-neutral-400">Abstract / Overview</label>
                                          <textarea value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} rows={3} className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-base outline-none resize-none border border-neutral-100 dark:border-neutral-800" placeholder="A brief summary of the project..." />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-mono uppercase text-neutral-400">The Challenge</label>
                                              <textarea value={projForm.challenge} onChange={e => setProjForm({...projForm, challenge: e.target.value})} rows={12} className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-sm leading-relaxed outline-none resize-none border border-neutral-100 dark:border-neutral-800" placeholder="What problems did you face?" />
                                          </div>
                                          <div className="space-y-2">
                                              <label className="text-[10px] font-mono uppercase text-neutral-400">The Solution</label>
                                              <textarea value={projForm.solution} onChange={e => setProjForm({...projForm, solution: e.target.value})} rows={12} className="w-full bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl text-sm leading-relaxed outline-none resize-none border border-neutral-100 dark:border-neutral-800" placeholder="How did you solve them?" />
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                              {activeProjectTab === 'builder' && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto">
                                      <div className="flex items-center justify-between mb-6">
                                           <h3 className="font-bold text-lg flex items-center gap-2"><LayoutGrid size={18} className="text-emerald-500" /> Story Blocks</h3>
                                           <span className="text-xs text-neutral-400">Drag to reorder</span>
                                      </div>
                                      <Reorder.Group axis="y" values={projForm.blocks || []} onReorder={handleReorderBlocks} className="space-y-4">
                                           {projForm.blocks?.map((block) => (
                                               <Reorder.Item key={block.id} value={block} className="bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm group">
                                                   <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 cursor-grab active:cursor-grabbing">
                                                       <div className="flex items-center gap-3">
                                                           <GripVertical size={16} className="text-neutral-300" />
                                                           <span className="text-[10px] font-mono uppercase font-bold px-2 py-1 bg-neutral-200 dark:bg-neutral-800 rounded text-neutral-600 dark:text-neutral-400">{block.type}</span>
                                                           <span className="text-xs text-neutral-400 truncate max-w-[150px] md:max-w-[200px]">
                                                               {block.type === 'text' && (block.content?.substring(0, 30) + '...')}
                                                               {block.type === 'full-image' && 'Image Block'}
                                                           </span>
                                                       </div>
                                                       <div className="flex items-center gap-1">
                                                           <button onClick={() => toggleBlockCollapse(block.id)} className="p-1.5 text-neutral-400 hover:text-black dark:hover:text-white transition-colors" title="Toggle Collapse">
                                                               {block.isCollapsed ? <EyeOff size={14}/> : <MinusIcon size={14}/>}
                                                           </button>
                                                           <button onClick={() => duplicateBlock(block)} className="p-1.5 text-neutral-400 hover:text-emerald-500 transition-colors" title="Duplicate"><Maximize2 size={14}/></button>
                                                           <button onClick={() => setProjForm({...projForm, blocks: projForm.blocks?.filter(b => b.id !== block.id)})} className="p-1.5 text-neutral-400 hover:text-red-500 transition-colors" title="Remove"><X size={14}/></button>
                                                       </div>
                                                   </div>
                                                   <div className={`p-5 transition-all ${block.isCollapsed ? 'hidden' : 'block'}`}>
                                                       {renderBlockEditor(block)}
                                                   </div>
                                               </Reorder.Item>
                                           ))}
                                      </Reorder.Group>
                                      <div className="mt-8 pt-8 border-t border-dashed border-neutral-200 dark:border-neutral-800">
                                          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                               {[
                                                   { type: 'heading', label: 'Heading', icon: Type },
                                                   { type: 'text', label: 'Paragraph', icon: Edit3 },
                                                   { type: 'full-image', label: 'Image', icon: ImageIcon },
                                                   { type: 'video', label: 'Video', icon: Video },
                                                   { type: 'image-grid', label: 'Gallery', icon: LayoutGrid },
                                                   { type: 'two-column', label: '2 Column', icon: Columns },
                                                   { type: 'code', label: 'Code', icon: CodeIcon }, 
                                                   { type: 'button', label: 'Button', icon: MousePointer },
                                                   { type: 'quote', label: 'Quote', icon: QuoteIcon },
                                                   { type: 'divider', label: 'Divider', icon: MinusIcon }, 
                                                   { type: 'spacer', label: 'Spacer', icon: MoveVertical },
                                               ].map(item => (
                                                   <button key={item.type} onClick={() => addBlock(item.type as any)} className="flex flex-col items-center gap-2 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-emerald-500 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/10 transition-all group">
                                                       <item.icon size={18} className="text-neutral-400 group-hover:text-emerald-500" />
                                                       <span className="text-[9px] font-bold uppercase">{item.label}</span>
                                                   </button>
                                               ))}
                                          </div>
                                      </div>
                                  </motion.div>
                              )}
                              {activeProjectTab === 'settings' && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 max-w-2xl mx-auto">
                                      <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                                           <h4 className="font-bold text-sm uppercase mb-4 flex items-center gap-2"><Flag size={16} /> Visibility & Status</h4>
                                           <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-950 rounded-xl border border-neutral-200 dark:border-neutral-800">
                                               <div>
                                                   <p className="font-bold text-sm">Featured Project</p>
                                                   <p className="text-xs text-neutral-400">Show this project on the home page or top of list.</p>
                                               </div>
                                               <button 
                                                   onClick={() => setProjForm({...projForm, featured: !projForm.featured})} 
                                                   className={`w-12 h-6 rounded-full relative transition-colors ${projForm.featured ? 'bg-emerald-500' : 'bg-neutral-300 dark:bg-neutral-700'}`}
                                               >
                                                   <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${projForm.featured ? 'left-7' : 'left-1'}`} />
                                               </button>
                                           </div>
                                      </div>
                                      <div className="bg-neutral-50 dark:bg-neutral-900 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-800 space-y-4">
                                           <h4 className="font-bold text-sm uppercase mb-2 flex items-center gap-2"><Search size={16} /> SEO & Metadata</h4>
                                           <div className="space-y-2">
                                               <label className="text-[10px] font-mono uppercase text-neutral-400">SEO Description</label>
                                               <textarea value={projForm.seoDescription || projForm.description} onChange={e => setProjForm({...projForm, seoDescription: e.target.value})} rows={3} className="w-full bg-white dark:bg-neutral-950 p-4 rounded-xl text-sm outline-none border border-neutral-200 dark:border-neutral-800" placeholder="Meta description..." />
                                           </div>
                                      </div>
                                  </motion.div>
                              )}
                              <div className="h-20"></div> 
                          </div>
                      </>
                  )}
              </div>
        </MotionDiv>
    );
};

export default AdminProjectManager;
