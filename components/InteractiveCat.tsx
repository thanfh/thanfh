
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionPath = motion.path as any;

interface InteractiveCatProps {
  forceMessage?: string | null;
  bubblePosition?: 'left' | 'right' | 'center';
}

const InteractiveCat: React.FC<InteractiveCatProps> = ({ forceMessage, bubblePosition = 'center' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [speech, setSpeech] = useState<string | null>(null);
  
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayMessage = forceMessage || speech;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const catCenterX = rect.left + rect.width / 2;
      const catCenterY = rect.top + rect.height / 3;

      const deltaX = e.clientX - catCenterX;
      const deltaY = e.clientY - catCenterY;
      
      const angle = Math.atan2(deltaY, deltaX);
      const distance = Math.min(5, Math.hypot(deltaX, deltaY) / 10);

      setPupilPos({
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 4000 + Math.random() * 2000);

    return () => clearInterval(blinkInterval);
  }, []);

  const handleClick = () => {
    if (forceMessage) return;

    const phrases = [
      "Meow!", 
      "💤", 
      "❤️", 
      "Hello.", 
      "❓", 
      "＞﹏＜", 
      "(❁´◡`❁)", 
      "Keep pushing!",
      "Design matters."
    ];
    
    const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
    setSpeech(randomPhrase);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const wordCount = randomPhrase.split(/[\s\n]+/).length;
    const duration = 1500 + (wordCount * 300);

    timeoutRef.current = setTimeout(() => {
      setSpeech(null);
    }, duration);
  };

  const bubbleX = bubblePosition === 'right' ? "0%" : bubblePosition === 'left' ? "0%" : "-50%";
  const bubbleClass = bubblePosition === 'right' ? 'right-0 origin-bottom-right' : 
                      bubblePosition === 'left' ? 'left-0 origin-bottom-left' : 
                      'left-1/2 -ml-[6px] md:-ml-[12px] origin-bottom';
  const arrowClass = bubblePosition === 'right' ? 'right-6' : 
                     bubblePosition === 'left' ? 'left-6' : 
                     'left-1/2 -translate-x-1/2';

  return (
    <div ref={containerRef} className="relative w-16 h-16 md:w-32 md:h-32 flex items-end justify-center select-none cursor-pointer" onClick={handleClick}>
        <AnimatePresence mode='wait'>
            {displayMessage && (
                <MotionDiv 
                    key={forceMessage ? "static-bubble" : displayMessage} 
                    initial={{ opacity: 0, y: 10, scale: 0.8, x: bubbleX }}
                    animate={{ opacity: 1, y: 0, scale: 1, x: bubbleX }}
                    exit={{ opacity: 0, y: 5, scale: 0.8, x: bubbleX }}
                    
                    className={`absolute bottom-full mb-4 bg-neutral-800 dark:bg-neutral-800 border border-neutral-700 px-4 py-3 rounded-xl shadow-2xl w-max max-w-[200px] whitespace-pre-wrap text-center z-20 ${bubbleClass}`}
                >
                    <p className="text-sm md:text-base font-bold text-white leading-tight break-words font-sans tabular-nums">
                        {displayMessage}
                    </p>
                    <div className={`absolute -bottom-1.5 w-3 h-3 bg-neutral-800 border-b border-r border-neutral-700 rotate-45 ${arrowClass}`}></div>
                </MotionDiv>
            )}
        </AnimatePresence>

      <svg viewBox="0 0 200 180" className="w-full h-full overflow-visible group">
        <defs>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <MotionPath 
            d="M160,150 Q190,120 180,80" 
            stroke="currentColor" 
            strokeWidth="8" 
            strokeLinecap="round" 
            fill="transparent"
            className="text-neutral-800 dark:text-neutral-300"
            initial={{ pathLength: 1, d: "M160,150 Q190,120 180,80" }}
            animate={{ d: ["M160,150 Q190,120 180,80", "M160,150 Q200,130 190,70", "M160,150 Q190,120 180,80"] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />

        <path 
            d="M40,160 C40,160 20,100 60,80 C60,80 140,80 160,160 L40,160 Z" 
            className="fill-neutral-900 dark:fill-neutral-200 transition-colors duration-300"
        />

        <g className="transition-transform duration-300 ease-out group-hover:-translate-y-6 -translate-x-6">
            <path d="M55,85 L40,40 L80,65 Z" className="fill-neutral-900 dark:fill-neutral-200 transition-colors duration-300" />
            <path d="M145,85 L160,40 L120,65 Z" className="fill-neutral-900 dark:fill-neutral-200 transition-colors duration-300" />
            
            <ellipse cx="100" cy="90" rx="55" ry="45" className="fill-neutral-900 dark:fill-neutral-200 transition-colors duration-300" />

            <g transform={`translate(0, ${isBlinking ? 2 : 0})`}>
                <circle cx="80" cy="85" r="10" className="fill-white dark:fill-neutral-900 transition-colors duration-300" />
                {!isBlinking ? (
                    <circle 
                        cx={80 + pupilPos.x} 
                        cy={85 + pupilPos.y} 
                        r="4" 
                        className="fill-black dark:fill-white transition-colors duration-300" 
                    />
                ) : (
                    <line x1="72" y1="85" x2="88" y2="85" strokeWidth="2" className="stroke-neutral-800 dark:stroke-neutral-200" />
                )}

                <circle cx="120" cy="85" r="10" className="fill-white dark:fill-neutral-900 transition-colors duration-300" />
                {!isBlinking ? (
                      <circle 
                        cx={120 + pupilPos.x} 
                        cy={85 + pupilPos.y} 
                        r="4" 
                        className="fill-black dark:fill-white transition-colors duration-300" 
                    />
                ) : (
                    <line x1="112" y1="85" x2="128" y2="85" strokeWidth="2" className="stroke-neutral-800 dark:stroke-neutral-200" />
                )}
            </g>
            
            <path d="M96,100 L104,100 L100,105 Z" className="fill-pink-300 dark:fill-pink-400/80" />
        </g>

      </svg>
    </div>
  );
};

export default InteractiveCat;
