import { useEffect, useRef, useState } from 'react';

interface SwipeOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number;
  preventDefaultTouchmove?: boolean;
}

interface SwipeState {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  swiping: boolean;
}

export function useSwipeGesture(
  elementRef: React.RefObject<HTMLElement>,
  options: SwipeOptions = {}
) {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmove = true
  } = options;

  const [swipeState, setSwipeState] = useState<SwipeState>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    swiping: false
  });

  // Store options in a ref to avoid dependency changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      setSwipeState({
        startX: touch.clientX,
        startY: touch.clientY,
        endX: touch.clientX,
        endY: touch.clientY,
        swiping: true
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!swipeState.swiping) return;
      
      if (preventDefaultTouchmove) {
        e.preventDefault();
      }
      
      const touch = e.touches[0];
      setSwipeState(prev => ({
        ...prev,
        endX: touch.clientX,
        endY: touch.clientY
      }));
    };

    const handleTouchEnd = () => {
      if (!swipeState.swiping) return;
      
      const deltaX = swipeState.endX - swipeState.startX;
      const deltaY = swipeState.endY - swipeState.startY;
      
      // Check if horizontal swipe is more significant than vertical
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX > threshold && onSwipeRight) {
          onSwipeRight();
        } else if (deltaX < -threshold && onSwipeLeft) {
          onSwipeLeft();
        }
      } else {
        if (deltaY > threshold && onSwipeDown) {
          onSwipeDown();
        } else if (deltaY < -threshold && onSwipeUp) {
          onSwipeUp();
        }
      }
      
      setSwipeState(prev => ({
        ...prev,
        swiping: false
      }));
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefaultTouchmove });
    element.addEventListener('touchend', handleTouchEnd);

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [elementRef, swipeState.swiping, threshold, preventDefaultTouchmove]);

  return swipeState;
}
