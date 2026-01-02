
import React, { useMemo, useRef, useState, useLayoutEffect } from 'react';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

interface GridItem {
  id: string | number;
  src: string;
  width: number;
  height: number;
  originalData: any;
}

interface JustifiedGridProps {
  items: GridItem[];
  targetRowHeight: number;
  gap?: number;
  maxItemsPerRow?: number;
  renderItem: (item: GridItem, style: React.CSSProperties) => React.ReactNode;
}

const useContainerWidth = (ref: React.RefObject<HTMLDivElement>) => {
  const [width, setWidth] = useState(0);
  
  useLayoutEffect(() => {
    let timeoutId: any;
    
    const handleResize = () => {
      // Debounce resize calculation (100ms)
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
         if (ref.current) setWidth(ref.current.offsetWidth);
      }, 100);
    };

    // Initial setting without debounce
    if (ref.current) setWidth(ref.current.offsetWidth);

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
    }
  }, [ref]);
  
  return width;
};

const JustifiedGrid: React.FC<JustifiedGridProps> = ({ 
  items, 
  targetRowHeight, 
  gap = 4, 
  maxItemsPerRow = 4,
  renderItem 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const containerWidth = useContainerWidth(containerRef);

  // Responsive logic: Max 3 items on mobile/tablet
  const responsiveMaxItems = useMemo(() => {
    if (containerWidth < 640) return 3; 
    if (containerWidth < 1024) return 3; 
    return maxItemsPerRow;
  }, [containerWidth, maxItemsPerRow]);

  // Adjust row height for smaller screens
  const responsiveTargetHeight = useMemo(() => {
    if (containerWidth < 640) return targetRowHeight * 0.7;
    return targetRowHeight;
  }, [containerWidth, targetRowHeight]);

  const rows = useMemo(() => {
    if (!containerWidth || items.length === 0) return [];
    
    let currentRow: { item: GridItem; aspectRatio: number }[] = [];
    let currentRowWidth = 0;
    const resultRows: any[] = [];

    items.forEach((item) => {
      // Safety check for dimensions to prevent Infinity/NaN
      const w = item.width || 800;
      const h = item.height || 600;
      const aspectRatio = w / h;
      
      const scaledWidth = responsiveTargetHeight * aspectRatio;
      const currentGap = currentRow.length > 0 ? gap : 0;

      // Slight tolerance 1.1x
      if ((currentRowWidth + currentGap + scaledWidth <= containerWidth * 1.1 && currentRow.length < responsiveMaxItems) || currentRow.length === 0) {
        currentRow.push({ item, aspectRatio });
        currentRowWidth += (scaledWidth + currentGap);
      } else {
        const aspectRatioSum = currentRow.reduce((sum, i) => sum + i.aspectRatio, 0);
        resultRows.push({ items: currentRow, aspectRatioSum });
        
        currentRow = [{ item, aspectRatio }];
        currentRowWidth = scaledWidth;
      }
    });

    if (currentRow.length > 0) {
      const aspectRatioSum = currentRow.reduce((sum, i) => sum + i.aspectRatio, 0);
      resultRows.push({ items: currentRow, aspectRatioSum, isLast: true });
    }

    return resultRows;
  }, [items, containerWidth, responsiveTargetHeight, responsiveMaxItems, gap]);

  return (
    <div ref={containerRef} className="flex flex-col w-full overflow-hidden" style={{ gap: `${gap}px` }}>
      {rows.map((row, rowIndex) => {
        const totalGap = (row.items.length - 1) * gap;
        const availableWidth = containerWidth - totalGap;
        let calculatedHeight = availableWidth / row.aspectRatioSum;
        
        if (!isFinite(calculatedHeight)) calculatedHeight = responsiveTargetHeight;

        // UPDATED LOGIC: Increased threshold to 1.8 (was 1.15)
        // This allows the last row to grow nearly 2x the target height to fill the width
        // effectively "pushing the images up" as requested.
        const threshold = responsiveTargetHeight * 1.8; 
        
        const isTooTall = row.isLast && calculatedHeight > threshold;
        const finalHeight = isTooTall ? responsiveTargetHeight : calculatedHeight;
        
        // Always flex-grow unless it's strictly clamped (isTooTall)
        const shouldGrow = !isTooTall;

        const justifyClass = (!shouldGrow) ? 'justify-start md:justify-start' : 'justify-start';

        return (
          <div key={rowIndex} className={`flex w-full ${justifyClass}`} style={{ height: `${finalHeight}px`, gap: `${gap}px` }}>
            {row.items.map((wrapper: any, itemIndex: number) => {
              const itemStyle: React.CSSProperties = {
                width: `${finalHeight * wrapper.aspectRatio}px`,
                flexGrow: shouldGrow ? 1 : 0, 
                height: '100%'
              };
              return (
                <div key={wrapper.item.id || itemIndex} style={itemStyle} className="relative flex-shrink-0">
                  {renderItem(wrapper.item, { width: '100%', height: '100%' })}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default JustifiedGrid;
