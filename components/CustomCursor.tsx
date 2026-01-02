
import React, { useEffect, useState, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionG = motion.g as any;

const CustomCursor: React.FC = () => {
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const cursorRotate = useMotionValue(-25); 

  const springConfig = { damping: 20, stiffness: 150, mass: 0.5 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);
  const smoothRotate = useSpring(cursorRotate, { damping: 20, stiffness: 200, mass: 0.5 });

  const prevMousePos = useRef({ x: 0, y: 0 });
  const stopMouseTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getShortestAngle = (current: number, target: number) => {
    let diff = (target - current + 180) % 360 - 180;
    if (diff < -180) diff += 360;
    return current + diff;
  };

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const updateMousePosition = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      
      cursorX.set(clientX + 8);
      cursorY.set(clientY + 20);

      if (!isVisible) setIsVisible(true);

      const deltaX = clientX - prevMousePos.current.x;
      const deltaY = clientY - prevMousePos.current.y;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > 1) {
        const targetAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
        
        const currentAngle = cursorRotate.get();
        
        const newAngle = getShortestAngle(currentAngle, targetAngle);
        
        cursorRotate.set(newAngle);
      }

      if (stopMouseTimeout.current) clearTimeout(stopMouseTimeout.current);
      
      stopMouseTimeout.current = setTimeout(() => {
        const currentAngle = cursorRotate.get();
        const resetAngle = getShortestAngle(currentAngle, -25);
        cursorRotate.set(resetAngle);
      }, 100);

      prevMousePos.current = { x: clientX, y: clientY };
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isClickable = 
        target.tagName === 'BUTTON' || target.tagName === 'A' ||
        target.closest('button') || target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        window.getComputedStyle(target).cursor === 'pointer';
      setIsHovering(!!isClickable);
    };

    window.addEventListener('mousemove', updateMousePosition);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      if (stopMouseTimeout.current) clearTimeout(stopMouseTimeout.current);
    };
  }, [isMobile, isVisible, cursorX, cursorY, cursorRotate]); 

  if (isMobile) return null;

  return (
    <MotionDiv
        className="fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-difference text-white"
        style={{
            x: smoothX,
            y: smoothY,
            rotate: smoothRotate, 
            opacity: isVisible ? 1 : 0,
        } as any}
        animate={{
            scale: isClicking ? 0.8 : isHovering ? 1.3 : 1,
        }}
        transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            mass: 0.5 
        }}
    >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <MotionG
                animate={{ scaleX: [1, 0.4, 1] }}
                transition={{ 
                    duration: 0.15, 
                    repeat: Infinity, 
                    ease: "linear",
                    repeatType: "reverse"
                }}
                style={{ originX: "50%", originY: "50%" } as any}
            >
                <path d="M11.5 12C11.5 12 7 2 2 5C-1 7 2 12 11.5 12Z" />
                <path d="M11.5 12C11.5 12 3 21 3 16C3 14 6 12 11.5 12Z" />
                <path d="M12.5 12C12.5 12 17 2 22 5C25 7 22 12 12.5 12Z" />
                <path d="M12.5 12C12.5 12 21 21 21 16C21 14 18 12 12.5 12Z" />
            </MotionG>
            <ellipse cx="12" cy="12" rx="1" ry="6" />
            <path d="M12 6L10 3" stroke="currentColor" strokeWidth="0.5" fill="none"/>
            <path d="M12 6L14 3" stroke="currentColor" strokeWidth="0.5" fill="none"/>
        </svg>
    </MotionDiv>
  );
};

export default CustomCursor;
