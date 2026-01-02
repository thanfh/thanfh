
import React from 'react';
import { Project } from '../types';
import { motion } from 'framer-motion';
import { ArrowUpRight, SearchX, ArrowLeft, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

const MotionDiv = motion.div as any;

const ProjectGrid: React.FC<{ projects: Project[]; uiText: Record<string, string> }> = ({ projects, uiText }) => {
  const navigate = useNavigate();

  return (
    <section id="work" className="w-full bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white min-h-screen flex flex-col">
      
      <div className="w-full px-4 md:px-12 2xl:px-24 4xl:px-32 py-12 md:py-20 flex flex-col gap-12 pt-24 md:pt-32 flex-grow mx-auto">
        
        {/* Header - Grid Aligned */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-8">
            <div className="col-span-6 md:col-span-12 flex items-end justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                <h2 className="text-4xl md:text-8xl 3xl:text-9xl font-serif italic tracking-tighter text-neutral-900 dark:text-white leading-[0.8]">
                    {uiText.work_selected_works}
                </h2>
                <div className="text-right hidden md:block">
                    <div className="text-xs 3xl:text-sm font-mono uppercase text-neutral-500">Total Projects</div>
                    <div className="text-xl 3xl:text-2xl font-bold">{projects.length.toString().padStart(2, '0')}</div>
                </div>
            </div>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-40 text-neutral-400">
              <SearchX size={64} strokeWidth={1} className="mb-6 opacity-20" />
              <h3 className="text-2xl font-bold uppercase tracking-widest">No matches found</h3>
          </div>
        ) : (
          /* 
             Strict Grid Implementation (Responsive):
             - Mobile: 1 Column (gap-2)
             - Desktop (FHD): 12 Cols grid, item spans 6 (2 items/row)
             - 2K (3xl): 12 Cols grid, item spans 4 (3 items/row)
             - 4K (4xl): 12 Cols grid, item spans 3 (4 items/row)
          */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-2 gap-y-12 md:gap-y-24 3xl:gap-y-32">
              {projects.map((project, index) => {
                  return (
                    <MotionDiv 
                        layoutId={`project-container-${project.id}`}
                        key={project.id}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-10%" }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="col-span-1 md:col-span-6 3xl:col-span-4 4xl:col-span-3 group cursor-pointer flex flex-col gap-4"
                        onClick={() => navigate(`/work/${project.id}`)}
                        role="button"
                        tabIndex={0}
                        aria-label={`View project: ${project.title}`}
                        onKeyDown={(e: React.KeyboardEvent) => {
                            if (e.key === 'Enter' || e.key === ' ') navigate(`/work/${project.id}`);
                        }}
                    >
                        {/* Image Container - Strictly follows column width */}
                        <div className="relative w-full aspect-[4/3] overflow-hidden bg-neutral-200 dark:bg-neutral-900">
                            <ImageWithFallback 
                                layoutId={`project-img-${project.id}`}
                                src={project.imageUrl} 
                                alt={`Preview of project ${project.title}`} 
                                loading={index < 8 ? "eager" : "lazy"} // Increased threshold for high-res screens
                                containerClassName="w-full h-full"
                                className="group-hover:scale-105 transition-transform duration-700 ease-[0.25,1,0.5,1]" 
                            />
                            
                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                    <div className="w-20 h-20 3xl:w-28 3xl:h-28 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform duration-300">
                                        {project.videoUrl ? <Play size={24} className="3xl:w-8 3xl:h-8" fill="currentColor"/> : <ArrowUpRight size={24} className="3xl:w-8 3xl:h-8" />}
                                    </div>
                            </div>
                        </div>

                        {/* Info - Aligned to grid edges */}
                        <div className="flex justify-between items-start border-t border-neutral-200 dark:border-neutral-800 pt-3">
                            <div>
                                <h3 className="text-2xl md:text-3xl 3xl:text-4xl font-medium text-neutral-900 dark:text-white leading-tight mb-1 group-hover:text-neutral-500 transition-colors font-serif italic">
                                    {project.title}
                                </h3>
                                <div className="flex gap-2">
                                    {project.tools?.slice(0, 3).map(tool => (
                                        <span key={tool} className="text-[10px] 3xl:text-xs font-mono uppercase text-neutral-500">{tool}</span>
                                    ))}
                                </div>
                            </div>
                            <div className="text-right">
                                <span className="text-xs 3xl:text-sm font-mono text-neutral-500 uppercase block mb-1">{project.category}</span>
                                <span className="text-xs 3xl:text-sm font-mono text-neutral-400">{project.year}</span>
                            </div>
                        </div>
                    </MotionDiv>
                  );
              })}
          </div>
        )}
      </div>

      <div className="w-full flex justify-center py-24 3xl:py-32 border-t border-neutral-200 dark:border-neutral-900 mt-auto">
        <button onClick={() => navigate('/')} aria-label="Navigate back to home" className="group flex items-center gap-3 px-8 py-4 3xl:px-10 3xl:py-5 rounded-full border border-neutral-300 dark:border-neutral-700 font-mono text-xs 3xl:text-sm uppercase tracking-widest hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
             <ArrowLeft size={14} className="3xl:w-5 3xl:h-5 group-hover:-translate-x-1 transition-transform" /> Take Me Home
        </button>
      </div>
    </section>
  );
};

export default ProjectGrid;
