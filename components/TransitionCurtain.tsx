
import React from 'react';
import { motion } from 'framer-motion';

interface TransitionCurtainProps {
  label?: string;
  isInitial?: boolean;
}

const TransitionCurtain: React.FC<TransitionCurtainProps> = ({ label, isInitial = false }) => {
  const transition = { duration: 1.0, ease: [0.76, 0, 0.24, 1] };

  // LOGIC: Top-to-Bottom Wipe with Parallax Text
  // Curtain: -100% -> 0% -> 100% (Downwards)
  // Text: Parallax effect by moving slightly upwards relative to curtain during exit
  
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[110] flex items-center justify-center bg-neutral-950"
        initial={{ y: isInitial ? "0%" : "-100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "100%" }}
        transition={transition}
      >
        {label && (
          <motion.div
            className="px-4 text-center relative z-10"
            // ENTER: Text rises up slightly
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.8, ease: "easeOut" } }}
            
            // EXIT: Parallax Effect
            // As curtain falls down (0 -> 100%), text moves UP relative to curtain (-30%)
            // This creates a visual drag where text moves slower than the black background
            exit={{ 
                opacity: 0, 
                y: "-30vh", 
                transition: { duration: 0.8, ease: "easeInOut" } 
            }}
          >
            <h1 className="text-white text-[12vw] md:text-[8vw] font-serif italic font-bold tracking-tighter leading-none select-none">
              {label}
            </h1>
          </motion.div>
        )}
      </motion.div>
      
      {/* Secondary Layer for Depth */}
      <motion.div
        className="fixed inset-0 z-[105] bg-neutral-900"
        initial={{ y: isInitial ? "0%" : "-100%" }}
        animate={{ y: "0%" }}
        exit={{ y: "100%" }}
        transition={{ ...transition, delay: 0.1 }}
      />
    </>
  );
};

export default TransitionCurtain;
