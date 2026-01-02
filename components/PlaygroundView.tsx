
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ZoomIn } from 'lucide-react';
import { PlaygroundSection } from '../types';
import ImageWithFallback from './ImageWithFallback';
import { useNavigate } from 'react-router-dom';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface PlaygroundViewProps {
  sections: PlaygroundSection[];
}

const PlaygroundView: React.FC<PlaygroundViewProps> = ({ sections }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  // --- PURE UNIT RATIO LOGIC (Responsive Spans) ---
  const getGridClasses = (item: any) => {
    const width = item.width || 800;
    const height = item.height || 600;
    const isPortrait = height > width;

    // 1. Mobile Span (Max 6)
    const mSpan = item.mobileSpan && item.mobileSpan > 0 
        ? Math.min(item.mobileSpan, 6) 
        : (isPortrait ? 3 : 6);

    // 2. Desktop Span (FHD - Max 12)
    const dSpan = item.desktopSpan && item.desktopSpan > 0 
        ? Math.min(item.desktopSpan, 12) 
        : (isPortrait ? 3 : 6);

    // 3. Ultra Wide Span (3xl) - Condense for higher density
    const xlSpan = dSpan === 6 ? 4 : dSpan === 12 ? 8 : dSpan;

    // 4. 4K Span (4xl) - Condense further
    const xxlSpan = dSpan === 6 ? 3 : dSpan === 12 ? 6 : dSpan === 3 ? 3 : dSpan;

    // Aspect Ratio calculations
    const mobileClasses = `col-span-${mSpan} aspect-[${mSpan}/2]`;
    const desktopClasses = `md:col-span-${dSpan} md:aspect-[${dSpan}/3]`;
    const ultraWideClasses = `3xl:col-span-${xlSpan} 3xl:aspect-[${xlSpan}/3]`;
    const fourKClasses = `4xl:col-span-${xxlSpan} 4xl:aspect-[${xxlSpan}/3]`;

    return `${mobileClasses} ${desktopClasses} ${ultraWideClasses} ${fourKClasses}`;
  };

  return (
    <div className="w-full min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white font-sans relative transition-colors duration-300 flex flex-col">

      <div className="w-full px-4 md:px-12 2xl:px-24 4xl:px-32 py-12 md:py-20 flex flex-col gap-24 pt-24 md:pt-32 flex-grow mx-auto">
        {sections.map((section) => (
          <section key={section.id} className="relative">
            <div className="sticky top-[40px] md:top-[48px] z-30 flex flex-col md:flex-row md:items-end justify-between pb-4 pt-4 w-full mix-blend-difference pointer-events-none mb-4">
                <h2 className="text-3xl md:text-5xl 3xl:text-6xl font-semibold tracking-tight text-white mix-blend-difference uppercase">{section.title}</h2>
                <div className="flex items-center gap-4 md:gap-8 mt-2 md:mt-0 text-[10px] md:text-xs 3xl:text-sm font-mono uppercase tracking-[0.15em] text-neutral-300 mix-blend-difference">
                    <span>{section.items.length} Items</span>
                </div>
            </div>
            
            {/* Strict Grid Implementation: 6 Cols Mobile / 12 Cols Desktop */}
            <div className="grid grid-cols-6 md:grid-cols-12 gap-2 auto-rows-max grid-flow-dense">
              {section.items.map((item, idx) => {
                 const gridClass = getGridClasses(item);
                 const itemKey = item.id || `${section.id}-${idx}`;

                 return (
                    <MotionDiv
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "100px" }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      key={itemKey}
                      className={`relative group overflow-hidden bg-neutral-200 dark:bg-neutral-900 cursor-zoom-in rounded-sm ${gridClass}`}
                      onClick={() => setSelectedImage(item.src)}
                    >
                       <ImageWithFallback 
                          src={item.src} 
                          alt={item.title} 
                          loading="eager" 
                          containerClassName="w-full h-full"
                          className="group-hover:scale-110 transition-transform duration-700 ease-[0.25,1,0.5,1]" 
                        />
                         {/* Hover Overlay */}
                         <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                             <div className="bg-white/10 backdrop-blur-md p-3 rounded-full text-white">
                                 <ZoomIn size={20} className="3xl:w-8 3xl:h-8" />
                             </div>
                         </div>
                    </MotionDiv>
                 );
              })}
            </div>
          </section>
        ))}
      </div>

      <div className="w-full flex justify-center py-24 3xl:py-32 border-t border-neutral-200 dark:border-neutral-900">
        <button onClick={() => navigate('/')} className="group flex items-center gap-3 px-8 py-4 3xl:px-10 3xl:py-5 rounded-full border border-neutral-300 dark:border-neutral-700 font-mono text-xs 3xl:text-sm uppercase tracking-widest hover:bg-neutral-900 dark:hover:bg-white hover:text-white dark:hover:text-black transition-all">
             <ArrowLeft size={14} className="3xl:w-5 3xl:h-5 group-hover:-translate-x-1 transition-transform" /> Take Me Home
        </button>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <MotionDiv 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-8 cursor-zoom-out" 
            onClick={() => setSelectedImage(null)}
          >
            <MotionImg 
                src={selectedImage} 
                initial={{ scale: 0.9 }} 
                animate={{ scale: 1 }} 
                exit={{ scale: 0.9 }} 
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-sm" 
            />
          </MotionDiv>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlaygroundView;
