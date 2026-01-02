
import React, { useState, useEffect } from 'react';

const GridDebugger: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle grid on Shift + G
      if (e.shiftKey && e.key.toLowerCase() === 'g') {
        setIsVisible((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none select-none overflow-hidden">
      {/* 
         Updated to max-w-[1920px] for standard high-end screens
      */}
      <div className="w-full h-full px-4 md:px-12 mx-auto max-w-[1920px]">
        {/* 
           Grid System:
           - 6 Columns on Mobile
           - 12 Columns on Tablet/Desktop
           - Gap-2 (8px) for tighter gutter
        */}
        <div className="grid grid-cols-6 md:grid-cols-12 gap-2 h-full">
          {Array.from({ length: 12 }).map((_, i) => (
            <div 
              key={i} 
              className={`
                h-full bg-red-500/5 border-x border-red-500/10 flex items-start justify-center
                ${i >= 6 ? 'hidden md:flex' : 'flex'}
              `}
            >
              <span className="text-[10px] font-mono text-red-500/50 mt-2">{i + 1}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Info Badge */}
      <div className="fixed bottom-4 right-4 bg-red-500 text-white text-[10px] font-mono px-2 py-1 rounded uppercase tracking-widest">
        Grid On (1920px Max)
      </div>
    </div>
  );
};

export default GridDebugger;
