
import React, { useEffect, useRef } from 'react';
import { Project, ProjectBlock } from '../types';
import ProjectCard from './ProjectCard';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;

const RenderBlock: React.FC<{ block: ProjectBlock }> = ({ block }) => {
    switch (block.type) {
        case 'text':
            return (
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2 py-12 md:py-24">
                     <div className="col-span-6 md:col-start-3 md:col-span-8 3xl:col-start-4 3xl:col-span-6">
                        {block.title && <h3 className="text-2xl md:text-3xl 3xl:text-4xl font-bold mb-6 text-neutral-900 dark:text-white uppercase tracking-tight">{block.title}</h3>}
                        <p className="text-xl md:text-2xl 3xl:text-3xl text-neutral-700 dark:text-neutral-400 leading-relaxed font-light">{block.content}</p>
                     </div>
                </div>
            );
        case 'full-image':
            return (
                <div className="w-full py-12 grid grid-cols-6 md:grid-cols-12 gap-2">
                    <div className="col-span-6 md:col-span-12">
                        <img src={block.imageUrl} alt={block.caption || ""} className="w-full h-auto rounded-sm shadow-xl" />
                        {block.caption && <p className="mt-4 text-xs 3xl:text-sm font-mono text-neutral-500 uppercase tracking-widest text-center">{block.caption}</p>}
                    </div>
                </div>
            );
        case 'image-grid':
            let gridCols = 'md:grid-cols-2';
            if (block.layout === 'simple-3') gridCols = 'md:grid-cols-3';
            if (block.layout === 'simple-4') gridCols = 'md:grid-cols-4';

            return (
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2 py-12">
                     <div className="col-span-6 md:col-span-12">
                        <div className={`grid gap-2 grid-cols-1 ${gridCols} 3xl:gap-4`}>
                            {block.images.map((img, i) => (
                                <img key={i} src={img} alt="" className="w-full h-auto rounded-sm object-cover aspect-square" />
                            ))}
                        </div>
                    </div>
                </div>
            );
        case 'quote':
            return (
                <div className="grid grid-cols-6 md:grid-cols-12 gap-2 py-24 md:py-40">
                     <div className="col-span-6 md:col-start-2 md:col-span-10 3xl:col-start-3 3xl:col-span-8 text-center">
                        <blockquote className="text-3xl md:text-6xl 3xl:text-7xl font-serif italic text-neutral-900 dark:text-white mb-8">"{block.text}"</blockquote>
                        {block.author && <cite className="text-sm 3xl:text-base font-mono text-neutral-500 uppercase tracking-[0.2em]">— {block.author}</cite>}
                    </div>
                </div>
            );
        case 'two-column':
            return (
                <div className="grid grid-cols-6 md:grid-cols-12 gap-12 lg:gap-2 py-12 md:py-24 items-center">
                    <div className="col-span-6 md:col-span-5 md:col-start-2 3xl:col-span-4 3xl:col-start-3">
                        {block.leftTitle && <h3 className="text-2xl 3xl:text-3xl font-bold mb-6 text-neutral-900 dark:text-white uppercase tracking-tight">{block.leftTitle}</h3>}
                        <p className="text-lg md:text-xl 3xl:text-2xl text-neutral-700 dark:text-neutral-400 leading-relaxed">{block.leftContent}</p>
                    </div>
                    <div className="col-span-6 md:col-span-5 md:col-start-8 3xl:col-span-4 3xl:col-start-8">
                         {block.rightImage ? <img src={block.rightImage} alt="" className="w-full h-auto rounded-sm" /> : <p className="text-lg md:text-xl 3xl:text-2xl text-neutral-700 dark:text-neutral-400 leading-relaxed">{block.rightContent}</p>}
                    </div>
                </div>
            );
        default: return null;
    }
};

interface CaseStudyViewProps {
  allProjects: Project[];
  uiText: Record<string, string>;
  project?: Project; // Optional override for preview mode
}

const CaseStudyView: React.FC<CaseStudyViewProps> = ({ allProjects, uiText, project: propProject }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  
  // Resolve project: use propProject (admin preview) OR find by ID
  const project = propProject || allProjects.find(p => p.id === id);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'auto' }); }, [id]);

  if (!project) {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center text-neutral-500">
              <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
              <button onClick={() => navigate('/work')} className="text-emerald-500 underline">Back to Work</button>
          </div>
      );
  }

  const relatedProjects = allProjects.filter(p => p.category === project.category && p.id !== project.id);

  return (
    <MotionDiv key={project.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="min-h-screen bg-neutral-50 dark:bg-neutral-950 w-full relative transition-colors duration-300">
        <section ref={heroRef} className="pt-24 md:pt-32 px-4 md:px-12 2xl:px-24 4xl:px-32 w-full mx-auto mb-24 md:mb-40">
            
            {/* Top Navigation Row */}
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 mb-16 border-b border-neutral-300 dark:border-neutral-700 pb-6">
                <div className="col-span-3 md:col-span-6">
                    <button onClick={() => navigate('/work')} className="flex items-center gap-3 text-sm 3xl:text-base font-mono uppercase tracking-widest text-neutral-500 hover:text-black dark:hover:text-white transition-colors">
                        <ArrowLeft size={18} className="3xl:w-6 3xl:h-6" /> {uiText.case_study_back}
                    </button>
                </div>
                <div className="col-span-3 md:col-span-6 text-right flex justify-end gap-4 text-sm 3xl:text-base font-mono uppercase text-neutral-500">
                    <span>{project.category}</span>
                    <span className="opacity-30">/</span>
                    <span>{project.year}</span>
                </div>
            </div>

            {/* Title Row - Full Width */}
            <MotionDiv className="mb-24 grid grid-cols-6 md:grid-cols-12 gap-2">
                <div className="col-span-6 md:col-span-12">
                    <h1 className="text-[12vw] 3xl:text-[10vw] leading-[0.8] font-bold text-neutral-900 dark:text-white tracking-tighter uppercase break-words max-w-[90%]">
                        {project.title}
                    </h1>
                </div>
            </MotionDiv>

            {/* Info Grid - Strictly Aligned */}
            <MotionDiv className="grid grid-cols-6 md:grid-cols-12 gap-8 md:gap-2 border-t border-neutral-300 dark:border-neutral-700 py-8 mb-16">
                
                {/* Description: Cols 1-6 (Expanded to 7 on 3xl) */}
                <div className="col-span-6 md:col-span-6 3xl:col-span-6 pr-0 md:pr-12">
                     <span className="block text-xs 3xl:text-sm uppercase tracking-widest text-neutral-500 mb-6">{uiText.case_study_overview}</span>
                     <p className="text-2xl md:text-3xl 3xl:text-4xl leading-tight font-medium text-neutral-800 dark:text-neutral-200 max-w-4xl">{project.description}</p>
                </div>

                {/* Services: Cols 7-9 */}
                <div className="col-span-3 md:col-span-3 3xl:col-span-3 md:col-start-7 3xl:col-start-8 md:border-l border-neutral-200 dark:border-neutral-800 md:pl-8">
                    <span className="block text-xs 3xl:text-sm uppercase tracking-widest text-neutral-500 mb-6">{uiText.case_study_services}</span>
                    <ul className="flex flex-col gap-2">
                        {project.tools?.map(t => <li key={t} className="text-base 3xl:text-xl font-mono text-neutral-700 dark:text-neutral-400">{t}</li>)}
                    </ul>
                </div>

                {/* Client/Year: Cols 10-12 */}
                <div className="col-span-3 md:col-span-3 3xl:col-span-2 md:col-start-10 3xl:col-start-11 md:border-l border-neutral-200 dark:border-neutral-800 md:pl-8">
                    <div className="mb-8">
                        <span className="block text-xs 3xl:text-sm uppercase tracking-widest text-neutral-500 mb-4">{uiText.case_study_client}</span>
                        <p className="text-base 3xl:text-xl font-mono text-neutral-700 dark:text-neutral-400">{project.client || uiText.confidential}</p>
                    </div>
                    <div>
                        <span className="block text-xs 3xl:text-sm uppercase tracking-widest text-neutral-500 mb-4">{uiText.case_study_year}</span>
                        <p className="text-base 3xl:text-xl font-mono text-neutral-700 dark:text-neutral-400">{project.year}</p>
                    </div>
                </div>
            </MotionDiv>

            {/* Hero Image - Spans 12 Cols */}
            <div className="relative w-full aspect-video overflow-hidden bg-neutral-200 dark:bg-neutral-900">
                <MotionDiv style={{ y }} className="w-full h-full">
                    {project.videoUrl ? <video src={project.videoUrl} autoPlay muted loop playsInline className="w-full h-[120%] object-cover -mt-[10%]" /> : <img src={project.imageUrl} alt={project.title} className="w-full h-[120%] object-cover -mt-[10%]" />}
                </MotionDiv>
            </div>
        </section>

      <div className="w-full px-4 md:px-12 2xl:px-24 4xl:px-32 mx-auto pb-32">
          
          {/* Challenge / Solution Grid */}
          <div className="grid grid-cols-6 md:grid-cols-12 gap-12 lg:gap-2 mb-32 border-b border-neutral-200 dark:border-neutral-900 pb-32">
              <div className="col-span-6 md:col-span-5 md:col-start-2 3xl:col-span-4 3xl:col-start-3">
                <span className="text-amber-600 dark:text-amber-500 text-xs 3xl:text-sm uppercase tracking-widest font-bold mb-6 block border-l-2 border-amber-600 pl-3">{uiText.case_study_challenge}</span>
                <p className="text-neutral-800 dark:text-neutral-400 text-xl md:text-2xl 3xl:text-3xl leading-relaxed font-light">{project.challenge || "Pushing boundaries of digital form."}</p>
              </div>
              <div className="col-span-6 md:col-span-5 md:col-start-8 3xl:col-span-4 3xl:col-start-8">
                <span className="text-emerald-600 dark:text-emerald-500 text-xs 3xl:text-sm uppercase tracking-widest font-bold mb-6 block border-l-2 border-emerald-600 pl-3">{uiText.case_study_solution}</span>
                <p className="text-neutral-800 dark:text-neutral-400 text-xl md:text-2xl 3xl:text-3xl leading-relaxed font-light">{project.solution || "Integrated procedural workflows."}</p>
              </div>
          </div>
          
          <div className="space-y-0">{project.blocks?.map((block) => <RenderBlock key={block.id} block={block} />)}</div>
          
          {relatedProjects.length > 0 && (
            <div className="mt-32 border-t border-neutral-300 dark:border-neutral-800 pt-32">
               <div className="grid grid-cols-6 md:grid-cols-12 mb-12">
                   <h3 className="col-span-6 md:col-span-12 text-3xl md:text-5xl 3xl:text-6xl font-semibold text-neutral-900 dark:text-white uppercase tracking-tighter">{uiText.case_study_more}</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-2">
                   {relatedProjects.slice(0, 2).map(p => (
                       <div key={p.id} className="lg:col-span-6">
                            <ProjectCard project={p} onClick={() => navigate(`/work/${p.id}`)} />
                       </div>
                   ))}
               </div>
            </div>
          )}
          <div className="mt-32 border-t border-neutral-300 dark:border-neutral-800 pt-12 flex justify-end">
             <button onClick={() => navigate('/work')} className="text-4xl md:text-7xl 3xl:text-8xl font-bold hover:text-neutral-500 transition-colors tracking-tighter flex items-center gap-6 uppercase">{uiText.case_study_view_all} <ArrowUpRight size={48} className="3xl:w-20 3xl:h-20" /></button>
          </div>
      </div>
    </MotionDiv>
  );
};

export default CaseStudyView;
