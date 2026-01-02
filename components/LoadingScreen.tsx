
import React from 'react';
import { motion } from 'framer-motion';
import InteractiveCat from './InteractiveCat';

const MotionDiv = motion.div as any;

interface LoadingScreenProps {
  progress: number;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress }) => {
  const speechText = `Loading...\n${Math.round(progress)}%`;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center">
      
      <div className="flex flex-col items-center justify-center gap-12">
        
        <div className="transform scale-150 relative z-10 mt-12"> 
             <InteractiveCat forceMessage={speechText} />
        </div>

        <div className="w-32 md:w-48 h-[2px] bg-neutral-800 rounded-full overflow-hidden">
            <MotionDiv 
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
            />
        </div>

      </div>
    </div>
  );
};

export default LoadingScreen;
