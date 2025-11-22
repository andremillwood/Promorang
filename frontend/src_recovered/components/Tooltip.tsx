import { ReactNode, useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string | ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  delay?: number;
  disabled?: boolean;
  className?: string;
  maxWidth?: string;
  allowWrap?: boolean;
  compact?: boolean;
}

export default function Tooltip({ 
  content, 
  children, 
  position = 'auto', 
  delay = 300,
  disabled = false,
  className = '',
  maxWidth,
  allowWrap = true,
  compact = false
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [actualPosition, setActualPosition] = useState<'top' | 'bottom' | 'left' | 'right'>('top');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const calculatePosition = () => {
    if (!containerRef.current || !tooltipRef.current) return;

    const triggerRect = containerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Space available in each direction
    const spaceTop = triggerRect.top;
    const spaceBottom = viewport.height - triggerRect.bottom;
    const spaceLeft = triggerRect.left;
    const spaceRight = viewport.width - triggerRect.right;

    // Required space for tooltip (with some buffer)
    const tooltipHeight = tooltipRect.height || 40; // fallback height
    const tooltipWidth = tooltipRect.width || 120; // fallback width
    const buffer = 8;

    let bestPosition: 'top' | 'bottom' | 'left' | 'right' = 'top';

    if (position === 'auto') {
      // Auto-determine best position based on available space
      if (spaceTop >= tooltipHeight + buffer) {
        bestPosition = 'top';
      } else if (spaceBottom >= tooltipHeight + buffer) {
        bestPosition = 'bottom';
      } else if (spaceRight >= tooltipWidth + buffer) {
        bestPosition = 'right';
      } else if (spaceLeft >= tooltipWidth + buffer) {
        bestPosition = 'left';
      } else {
        // Default to top if no space is adequate
        bestPosition = spaceTop >= spaceBottom ? 'top' : 'bottom';
      }
    } else {
      // Use the specified position, but check if it fits
      switch (position) {
        case 'top':
          bestPosition = spaceTop >= tooltipHeight + buffer ? 'top' : 'bottom';
          break;
        case 'bottom':
          bestPosition = spaceBottom >= tooltipHeight + buffer ? 'bottom' : 'top';
          break;
        case 'left':
          bestPosition = spaceLeft >= tooltipWidth + buffer ? 'left' : 'right';
          break;
        case 'right':
          bestPosition = spaceRight >= tooltipWidth + buffer ? 'right' : 'left';
          break;
      }
    }

    setActualPosition(bestPosition);
  };

  const handleMouseEnter = () => {
    if (disabled) return;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate position after tooltip becomes visible
      setTimeout(() => calculatePosition(), 0);
    }, delay);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const getTooltipClasses = () => {
    const baseClasses = `
      absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg 
      pointer-events-none transition-all duration-200 ease-out leading-5
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
    `;

    const positionClasses = {
      top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2',
      bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
      left: 'right-full top-1/2 transform -translate-y-1/2 mr-2',
      right: 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    };

    return `${baseClasses} ${positionClasses[actualPosition]}`;
  };

  const getDynamicMaxWidth = () => {
    if (maxWidth) return maxWidth;
    
    const contentLength = typeof content === 'string' ? content.length : 100;
    
    if (compact || contentLength < 20) return '180px';
    if (contentLength < 40) return '220px';
    if (contentLength < 80) return '280px';
    return '320px';
  };

  const getArrowClasses = () => {
    const arrowClasses = {
      top: 'top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900',
      bottom: 'bottom-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900',
      left: 'left-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-900',
      right: 'right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900'
    };

    return `absolute ${arrowClasses[actualPosition]}`;
  };

  if (disabled || !content) {
    return <>{children}</>;
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
    >
      {children}
      
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={getTooltipClasses()}
          style={{ 
            maxWidth: getDynamicMaxWidth(),
            minWidth: compact ? 'auto' : '120px',
            whiteSpace: allowWrap ? 'normal' : 'nowrap',
            wordWrap: allowWrap ? 'break-word' : 'normal',
            hyphens: allowWrap ? 'auto' : 'none'
          }}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {content}
          <div className={getArrowClasses()}></div>
        </div>
      )}
    </div>
  );
}
