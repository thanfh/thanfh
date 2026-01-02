
import React, { useEffect } from 'react';
import { Project } from '../types';
import { motion } from 'framer-motion';
import { X, ExternalLink } from 'lucide-react';
import { UI_TEXT } from '../constants';

const MotionDiv = motion.div as any;

interface ProjectModalProps {
  project: Project;
  onClose: () => void;
  onOpenCaseStudy: (project: Project) => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onOpenCaseStudy }) => {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <MotionDiv 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <MotionDiv
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="bg-neutral-50 dark:bg-neutral-900 w-full max-w-5xl h-[90vh] sm:max-h-[90vh] rounded-t-2xl sm:rounded-lg overflow-hidden shadow-2xl flex flex-col sm:flex-row relative transition-colors"
        onClick={(e: any) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full text-white hover:bg-white hover:text-black transition-colors backdrop-blur-sm"
        >
          <X size={20} />
        </button>

        <div className="w-full sm:w-2/3 bg-neutral-100 dark:bg-black flex items-center justify-center overflow-hidden h-[30vh] sm:h-auto shrink-0">
          {project.videoUrl ? (
            <video 
              src={project.videoUrl} 
              autoPlay 
              muted 
              loop 
              playsInline 
              className="w-full h-full object-cover"
            />
          ) : (
            <img 
              src={project.imageUrl} 
              alt={project.title} 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="w-full sm:w-1/3 p-6 md:p-12 flex flex-col overflow-y-auto">
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-2">
            {project.category} — {project.year}
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white mb-4 md:mb-6 transition-colors">{project.title}</h2>
          
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 text-sm md:text-base transition-colors">
            {project.description}
          </p>

          <div className="mt-auto">
             <h4 className="text-xs text-neutral-500 uppercase tracking-widest mb-3">{UI_TEXT.tools_used}</h4>
             <div className="flex flex-wrap gap-2 mb-8">
               {project.tools?.map(tool => (
                 <span key={tool} className="text-xs bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 px-2 py-1 rounded transition-colors">
                   {tool}
                 </span>
               ))}
             </div>

             <button 
                onClick={() => {
                    onClose();
                    onOpenCaseStudy(project);
                }}
                className="w-full py-4 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium uppercase tracking-wider hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2 text-sm md:text-base"
             >
               {UI_TEXT.view_live} <ExternalLink size={16} />
             </button>
          </div>
        </div>
      </MotionDiv>
    </MotionDiv>
  );
};

export default ProjectModal;
