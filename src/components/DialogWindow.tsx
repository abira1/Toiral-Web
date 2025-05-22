import React, { useEffect, useState, useRef } from 'react';
import { XIcon, MinimizeIcon, MaximizeIcon } from 'lucide-react';
import { Win95Button } from './Win95Button';
import { useSwipeGesture } from '../hooks/useSwipeGesture';

interface DialogWindowProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  style?: React.CSSProperties;
  animationType?: 'fade' | 'slide' | 'zoom' | 'bounce';
}
export function DialogWindow({
  title,
  children,
  onClose,
  style,
  animationType = 'fade'
}: DialogWindowProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  const [isVisible, setIsVisible] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x: 0, y: 0 });
  const [previousSize, setPreviousSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // State to store taskbar height
  const [taskbarHeight, setTaskbarHeight] = useState(48); // Default 3rem = 48px

  // Initialize dialog position and animation
  useEffect(() => {
    // Add a small delay to ensure smooth animation
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    // Measure taskbar height
    const measureTaskbar = () => {
      const taskbar = document.querySelector('.taskbar');
      if (taskbar) {
        const taskbarRect = taskbar.getBoundingClientRect();
        setTaskbarHeight(taskbarRect.height);
      }
    };

    // Call once on mount
    measureTaskbar();

    if (dialogRef.current) {
      const dialog = dialogRef.current;

      // Center the dialog on screen
      const updatePosition = () => {
        if (isMaximized) return;

        const rect = dialog.getBoundingClientRect();
        const x = Math.max(0, Math.min((window.innerWidth - rect.width) / 2, window.innerWidth - rect.width));
        const y = Math.max(20, Math.min((window.innerHeight - rect.height) / 3, 100));

        setPosition({
          x,
          y
        });

        // Re-measure taskbar on resize
        measureTaskbar();
      };

      const resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(dialog);
      updatePosition();

      window.addEventListener('resize', updatePosition);

      return () => {
        clearTimeout(timer);
        resizeObserver.disconnect();
        window.removeEventListener('resize', updatePosition);
      };
    }

    return () => clearTimeout(timer);
  }, [isMaximized]);

  // Add swipe gesture support
  useSwipeGesture(dialogRef, {
    onSwipeDown: () => {
      if (!isMaximized) {
        handleClose();
      }
    },
    onSwipeUp: () => {
      if (!isMaximized) {
        toggleMaximize();
      }
    },
    threshold: 80,
    preventDefaultTouchmove: false
  });

  // Handle window dragging
  useEffect(() => {
    if (!dialogRef.current || isMaximized) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = Math.max(0, Math.min(e.clientX - dragOffset.x, window.innerWidth - (dialogRef.current?.offsetWidth || 0)));
      const newY = Math.max(0, Math.min(e.clientY - dragOffset.y, window.innerHeight - (dialogRef.current?.offsetHeight || 0)));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMaximized]);

  // Start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMaximized) return;

    // Only allow dragging from the title bar
    if (e.target instanceof HTMLElement &&
        (e.target.closest('.bg-blue-900') || e.target.classList.contains('bg-blue-900'))) {
      setIsDragging(true);

      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  // Handle touch events for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isMaximized) return;

    // Only allow dragging from the title bar
    if (e.target instanceof HTMLElement &&
        (e.target.closest('.bg-blue-900') || e.target.classList.contains('bg-blue-900'))) {
      const touch = e.touches[0];
      setIsDragging(true);

      const rect = dialogRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: touch.clientX - rect.left,
          y: touch.clientY - rect.top
        });
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isMaximized) return;

    const touch = e.touches[0];
    const newX = Math.max(0, Math.min(touch.clientX - dragOffset.x, window.innerWidth - (dialogRef.current?.offsetWidth || 0)));
    const newY = Math.max(0, Math.min(touch.clientY - dragOffset.y, window.innerHeight - (dialogRef.current?.offsetHeight || 0)));

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };
  // Toggle maximize/restore
  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore to previous position and size
      setIsMaximized(false);
      setPosition(previousPosition);
    } else {
      // Save current position and size before maximizing
      setPreviousPosition(position);
      if (dialogRef.current) {
        setPreviousSize({
          width: dialogRef.current.offsetWidth,
          height: dialogRef.current.offsetHeight
        });
      }
      setIsMaximized(true);
    }
  };

  // Handle close with animation
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Increased duration for smoother animation
  };

  // Get animation classes based on animation type
  const getAnimationClasses = () => {
    if (!isVisible) {
      switch (animationType) {
        case 'slide':
          return 'opacity-0 -translate-y-4';
        case 'zoom':
          return 'opacity-0 scale-95';
        case 'bounce':
          return 'opacity-0 scale-95';
        case 'fade':
        default:
          return 'opacity-0';
      }
    }

    return 'opacity-100 translate-y-0 scale-100';
  };

  // Get transition classes based on animation type
  const getTransitionClasses = () => {
    const baseClasses = 'transition-all';

    switch (animationType) {
      case 'slide':
        return `${baseClasses} duration-300 ease-out`;
      case 'zoom':
        return `${baseClasses} duration-300 ease-out`;
      case 'bounce':
        return `${baseClasses} duration-300 ease-out`;
      case 'fade':
      default:
        return `${baseClasses} duration-200`;
    }
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Dialog window */}
      <div
        ref={dialogRef}
        className={`fixed bg-gray-300 border-2 border-gray-400 shadow-lg overflow-hidden ${getTransitionClasses()} ${getAnimationClasses()}`}
        style={{
          left: isMaximized ? 0 : position.x,
          top: isMaximized ? 0 : position.y,
          margin: isMaximized ? 0 : undefined,
          padding: isMaximized ? 0 : undefined,
          width: isMaximized ? '100vw' : (window.innerWidth <= 768 ? '90vw' : style?.width || '800px'),
          height: isMaximized ? `calc(100vh - ${taskbarHeight + 4}px)` : 'auto', // Subtract taskbar height plus a buffer
          maxWidth: isMaximized ? '100vw' : '95vw',
          maxHeight: isMaximized ? `calc(100vh - ${taskbarHeight + 4}px)` : '90vh', // Subtract taskbar height plus a buffer
          zIndex: 1000,
          ...(!isMaximized && style)
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Title bar */}
        <div
          className="bg-blue-900 text-white px-2 py-1 flex items-center justify-between select-none cursor-move"
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          id="dialog-title"
        >
          <div className="font-bold truncate">{title}</div>
          <div className="flex items-center space-x-1">
            <Win95Button
              className="h-6 w-6 flex-shrink-0 flex items-center justify-center p-0"
              onClick={toggleMaximize}
              title={isMaximized ? "Restore" : "Maximize"}
            >
              <MaximizeIcon className="w-3 h-3 text-black" />
            </Win95Button>
            <Win95Button
              className="h-6 w-6 flex-shrink-0 flex items-center justify-center p-0"
              onClick={handleClose}
              title="Close"
            >
              <XIcon className="w-4 h-4 text-black" />
            </Win95Button>
          </div>
        </div>

        {/* Content area */}
        <div
          className="border-t-2 border-l-2 border-gray-200 border-r-2 border-b-2 border-r-gray-800 border-b-gray-800 overflow-y-auto"
          style={{
            height: isMaximized ? `calc(100vh - ${taskbarHeight + 28}px)` : undefined, // Taskbar height + title bar + borders
            maxHeight: isMaximized ? undefined : 'calc(90vh - 2rem)'
          }}
        >
          <div className={`transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'} scrollable-content`}>
            {children}
          </div>
        </div>

        {/* Mobile swipe indicator */}
        <div className="md:hidden w-16 h-1 bg-gray-400 rounded-full mx-auto my-2 opacity-50" aria-hidden="true" />
      </div>
    </>
  );
}