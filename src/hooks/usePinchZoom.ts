import { useEffect, useRef, useState } from 'react';

interface PinchZoomOptions {
  minScale?: number;
  maxScale?: number;
  onZoomChange?: (scale: number) => void;
  preventDefaultTouchmove?: boolean;
}

interface PinchZoomState {
  scale: number;
  initialDistance: number;
  zooming: boolean;
}

export function usePinchZoom(
  elementRef: React.RefObject<HTMLElement>,
  options: PinchZoomOptions = {}
) {
  const {
    minScale = 1,
    maxScale = 3,
    onZoomChange,
    preventDefaultTouchmove = true
  } = options;

  const [zoomState, setZoomState] = useState<PinchZoomState>({
    scale: 1,
    initialDistance: 0,
    zooming: false
  });

  // Store options in a ref to avoid dependency changes
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Calculate distance between two touch points
    const getDistance = (touches: TouchList): number => {
      if (touches.length < 2) return 0;
      
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      
      const initialDistance = getDistance(e.touches);
      setZoomState({
        scale: 1,
        initialDistance,
        zooming: true
      });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!zoomState.zooming || e.touches.length !== 2) return;
      
      if (preventDefaultTouchmove) {
        e.preventDefault();
      }
      
      const currentDistance = getDistance(e.touches);
      const newScale = Math.max(
        minScale,
        Math.min(
          maxScale,
          (currentDistance / zoomState.initialDistance)
        )
      );
      
      setZoomState(prev => ({
        ...prev,
        scale: newScale
      }));
      
      if (onZoomChange) {
        onZoomChange(newScale);
      }
    };

    const handleTouchEnd = () => {
      if (!zoomState.zooming) return;
      
      setZoomState(prev => ({
        ...prev,
        zooming: false
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
  }, [elementRef, zoomState.zooming, zoomState.initialDistance, minScale, maxScale, preventDefaultTouchmove]);

  return zoomState;
}
