import { useEffect } from 'react';
import { preloadImages } from '../services/imageOptimizationService';

interface ImagePreloaderProps {
  urls: string[];
}

/**
 * Component to preload important images
 * This component doesn't render anything visible
 */
export function ImagePreloader({ urls }: ImagePreloaderProps) {
  useEffect(() => {
    // Preload images when component mounts
    if (urls && urls.length > 0) {
      // Use requestIdleCallback if available for better performance
      if ('requestIdleCallback' in window) {
        (window as any).requestIdleCallback(() => {
          preloadImages(urls);
        });
      } else {
        // Fallback to setTimeout
        setTimeout(() => {
          preloadImages(urls);
        }, 1000); // Wait 1 second after page load
      }
    }
  }, [urls]);

  // This component doesn't render anything
  return null;
}
