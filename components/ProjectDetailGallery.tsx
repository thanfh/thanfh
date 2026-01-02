
import React, { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

const MotionDiv = motion.div as any;
const MotionImg = motion.img as any;

interface ProjectDetailGalleryProps {
  images: string[];
}

const ProjectDetailGallery: React.FC<ProjectDetailGalleryProps> = ({ images }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const smoothMouseX = useSpring(mouseX, { damping: 50, stiffness: 400 });
  const smoothMouseY = useSpring(mouseY, { damping: 50, stiffness: 400 });

  const translateX = useTransform(smoothMouseX, [0, 1], ["0%", "-40%"]);
  const translateY = useTransform(smoothMouseY, [0, 1], ["0%", "-40%"]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY, currentTarget } = e;
    const { width, height } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX / width);
    mouseY.set(clientY / height);
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const displayImages = images.length < 10 
    ? [...images, ...images].slice(0, 15) 
    : images;

  return (
    <>
      <div 
        className="w-full h-[85vh] md:h-screen overflow-hidden bg-neutral-900 relative cursor-move group rounded-sm my-12 md:my-20"
        onMouseMove={handleMouseMove}
      >
        
        <MotionDiv
          ref={containerRef}
          style={{ 
            x: translateX, 
            y: translateY,
            width: "180vw", 
            minHeight: "150vh"
          }}
          className="flex flex-wrap items-center justify-center content-center gap-8 md:gap-12 p-32"
        >
          {displayImages.map((src, index) => {
            const isHovered = hoveredIndex === index;
            const isDimmed = hoveredIndex !== null && !isHovered;
            
            return (
              <MotionDiv
                layout 
                key={index}
                className="relative shrink-0 rounded-lg"
                onHoverStart={() => setHoveredIndex(index)}
                onHoverEnd={() => setHoveredIndex(null)}
                onClick={() => setSelectedImage(src)}
                
                initial={{ width: "300px" }} 
                animate={{ 
                  width: isHovered ? "550px" : "300px", 
                  opacity: isDimmed ? 0.3 : 1, 
                  zIndex: isHovered ? 50 : 1 
                }}
                transition={{ 
                  duration: 0.5, 
                  ease: [0.25, 1, 0.5, 1] 
                }}
              >
                <MotionImg 
                  layout
                  src={src} 
                  alt="Project Shot" 
                  draggable={false}
                  className="w-full h-auto rounded-lg shadow-2xl block"
                />

                <MotionDiv 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                >
                    <div className="bg-black/40 backdrop-blur-[2px] p-4 rounded-full text-white/90">
                        <ZoomIn size={32} strokeWidth={1.5} />
                    </div>
                </MotionDiv>
              </MotionDiv>
            );
          })}
        </MotionDiv>
        
        <div className="absolute bottom-10 left-10 pointer-events-none opacity-60 bg-black/60 px-4 py-2 rounded-full text-xs text-white/80 font-mono border border-white/10 z-10 backdrop-blur-md">
            DRAG TO EXPLORE — HOVER TO EXPAND
        </div>
      </div>

      <AnimatePresence>
        {selectedImage && (
          <MotionDiv 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/98 p-4 md:p-12 cursor-zoom-out"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors z-50">
              <X size={40} strokeWidth={1} />
            </button>

            <MotionImg 
              src={selectedImage}
              layoutId={`img-${selectedImage}`} 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="w-auto h-auto max-w-full max-h-full object-contain rounded-sm shadow-2xl"
              onClick={(e: any) => e.stopPropagation()} 
            />
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default ProjectDetailGallery;
