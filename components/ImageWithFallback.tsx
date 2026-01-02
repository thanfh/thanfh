
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';
import { ImageOff } from 'lucide-react';

interface ImageWithFallbackProps extends HTMLMotionProps<"img"> {
  src: string;
  alt: string;
  className?: string; // Applied to the image
  containerClassName?: string; // Applied to the wrapper div
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({
  src,
  alt,
  className = "",
  containerClassName = "",
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Reset state if src changes
  useEffect(() => {
    // If the image is already cached and complete, don't show loading state
    if (imgRef.current && imgRef.current.complete) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
    setHasError(false);
  }, [src]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  return (
    <div className={`relative overflow-hidden bg-neutral-200 dark:bg-neutral-900 ${containerClassName}`}>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10 bg-neutral-200 dark:bg-neutral-800"
          >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {hasError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-900 text-neutral-400">
          <ImageOff className="w-8 h-8 mb-2 opacity-50" />
          <span className="text-[10px] uppercase font-mono tracking-widest opacity-50">Failed to Load</span>
        </div>
      )}

      {!hasError && (
        <motion.img
          ref={imgRef}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          // Use CSS for opacity transition to avoid conflict with 'animate' prop (e.g. scale)
          className={`block w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'} ${className}`}
          {...props}
        />
      )}
    </div>
  );
};

export default ImageWithFallback;
