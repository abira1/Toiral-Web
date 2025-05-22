import React, { useState, useEffect } from 'react';
import { Ad, AnimationType, AnimationDirection, DisplayPosition } from '../../types/ad.types';
import { incrementAdStat } from '../../firebase/adService';

interface AdContainerProps {
  ad: Ad;
  onClose: () => void;
  children: React.ReactNode;
}

export function AdContainer({ ad, onClose, children }: AdContainerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Handle auto-close timer
  useEffect(() => {
    // Check if display and closeAfter exist
    if (ad.display && ad.display.closeAfter && ad.display.closeAfter > 0) {
      console.log(`Setting auto-close timer for ${ad.display.closeAfter} seconds for ad: ${ad.id}`);

      // Only start the timer once the ad is visible
      if (isVisible) {
        const timer = setTimeout(() => {
          console.log(`Auto-closing ad: ${ad.id} after ${ad.display.closeAfter} seconds`);
          handleClose();
        }, ad.display.closeAfter * 1000);

        return () => {
          console.log(`Clearing auto-close timer for ad: ${ad.id}`);
          clearTimeout(timer);
        };
      }
    }
  }, [ad.display?.closeAfter, isVisible, ad.id]);

  // Handle animation delay and initial visibility
  useEffect(() => {
    // Default delay to 0 if not specified
    const delay = (ad.display && ad.display.delay !== undefined) ? ad.display.delay : 0;

    console.log(`Setting display delay timer for ${delay} seconds for ad: ${ad.id}`);
    const timer = setTimeout(() => {
      console.log(`Showing ad after delay: ${ad.id}`);
      setIsVisible(true);
      // Record impression
      if (ad.id) {
        incrementAdStat(ad.id, 'impressions').catch(console.error);
      }
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [ad]);

  const handleClose = () => {
    // Prevent multiple close calls
    if (isClosing) {
      console.log(`Ad ${ad.id} is already closing, ignoring duplicate close call`);
      return;
    }

    console.log(`Closing ad: ${ad.id}`);
    setIsClosing(true);

    // Record close
    if (ad.id) {
      incrementAdStat(ad.id, 'closes').catch(console.error);
    }

    // Default duration to 0.5 seconds if not specified
    const duration = (ad.animation && ad.animation.duration) ? ad.animation.duration : 0.5;

    // Wait for animation to complete before removing from DOM
    setTimeout(() => {
      console.log(`Removing ad ${ad.id} from DOM after animation`);
      onClose();
    }, duration * 1000);
  };

  // Generate animation classes based on ad configuration
  const getAnimationClasses = () => {
    // Default animation values if not specified
    const type = (ad.animation && ad.animation.type) ? ad.animation.type : 'fade';
    const direction = (ad.animation && ad.animation.direction) ? ad.animation.direction : 'bottom';
    const duration = (ad.animation && ad.animation.duration) ? ad.animation.duration : 0.5;

    const baseClasses = `transition-all duration-${duration * 1000}ms`;

    if (!isVisible) {
      return `${baseClasses} opacity-0 transform ${getInitialPosition(type, direction)}`;
    }

    if (isClosing) {
      return `${baseClasses} opacity-0 transform ${getInitialPosition(type, direction)}`;
    }

    return `${baseClasses} opacity-100 transform translate-x-0 translate-y-0 scale-100`;
  };

  // Get initial position for animations
  const getInitialPosition = (type: AnimationType, direction: AnimationDirection): string => {
    if (type === 'fade') return '';

    if (type === 'slide') {
      switch (direction) {
        case 'top': return '-translate-y-full';
        case 'right': return 'translate-x-full';
        case 'bottom': return 'translate-y-full';
        case 'left': return '-translate-x-full';
        default: return '';
      }
    }

    if (type === 'bounce' || type === 'pulse') {
      return 'scale-95';
    }

    return '';
  };

  // Get position classes
  const getPositionClasses = (): string => {
    // Default position if not specified
    const position = (ad.display && ad.display.position) ? ad.display.position : 'bottom';

    switch (position) {
      case 'top':
        return 'fixed top-0 left-0 right-0 z-50';
      case 'bottom':
        return 'fixed bottom-0 left-0 right-0 z-50';
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50';
      case 'corner-top-right':
        return 'fixed top-4 right-4 z-50';
      case 'corner-bottom-right':
        return 'fixed bottom-4 right-4 z-50';
      case 'corner-top-left':
        return 'fixed top-4 left-4 z-50';
      case 'corner-bottom-left':
        return 'fixed bottom-4 left-4 z-50';
      default:
        return 'fixed bottom-4 right-4 z-50';
    }
  };

  return (
    <div className={`${getPositionClasses()} ${getAnimationClasses()}`}>
      <div
        className="relative"
        style={{
          width: (ad.styling && ad.styling.width) ? ad.styling.width : 'auto',
          maxWidth: '100%'
        }}
      >
        {children}
        <button
          className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center bg-[#c0c0c0] border border-t-[#ffffff] border-l-[#ffffff] border-r-[#808080] border-b-[#808080] text-black hover:bg-[#d0d0d0] focus:outline-none"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
