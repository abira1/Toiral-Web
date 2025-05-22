import React, { useState, useEffect, useRef } from 'react';
import {
  getOptimizedImageUrl,
  generateSrcSet,
  isImageCached
} from '../services/imageOptimizationService';
import { usePinchZoom } from '../hooks/usePinchZoom';

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderSrc?: string;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  width?: number;
  height?: number;
  sizes?: string;
  srcSet?: string;
  // If true, will automatically generate srcSet for responsive images
  responsive?: boolean;
  // If true, enables pinch-to-zoom on mobile devices
  zoomable?: boolean;
}

export function LazyImage({
  src,
  alt,
  className = '',
  placeholderSrc = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%3E%3Crect%20fill%3D%22%23CCCCCC%22%20width%3D%2240%22%20height%3D%2240%22%2F%3E%3Ctext%20fill%3D%22%23333333%22%20font-family%3D%22sans-serif%22%20font-size%3D%228%22%20x%3D%2250%25%22%20y%3D%2250%25%22%20text-anchor%3D%22middle%22%20dy%3D%22.3em%22%3ELoading%3C%2Ftext%3E%3C%2Fsvg%3E',
  onError,
  width,
  height,
  sizes = '100vw',
  srcSet: providedSrcSet,
  responsive = false,
  zoomable = false
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageSrc, setImageSrc] = useState(placeholderSrc);
  const [isZoomed, setIsZoomed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Use pinch zoom if enabled
  const { scale } = zoomable ? usePinchZoom(containerRef, {
    minScale: 1,
    maxScale: 3,
    onZoomChange: (newScale) => {
      setIsZoomed(newScale > 1.05);
    }
  }) : { scale: 1 };

  // We're now using the imported functions from imageOptimizationService

  useEffect(() => {
    // Reset state when src changes
    setIsLoaded(false);

    // Check if image is already cached
    if (isImageCached(src)) {
      // If cached, use optimized image immediately
      setImageSrc(getOptimizedImageUrl(src, { width, quality: 85 }));
      setIsLoaded(true);
      return;
    } else {
      // Otherwise start with placeholder
      setImageSrc(placeholderSrc);
    }

    // Create a new IntersectionObserver if needed
    if (!observerRef.current && 'IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // When the image is in viewport, load the optimized image
            const optimizedSrc = getOptimizedImageUrl(src, {
              width,
              quality: 85,
              format: 'webp'
            });

            setImageSrc(optimizedSrc);

            // Stop observing once loaded
            if (observerRef.current && imgRef.current) {
              observerRef.current.unobserve(imgRef.current);
            }
          }
        });
      }, {
        rootMargin: '300px 0px', // Increased margin to load earlier
        threshold: 0.01
      });
    }

    // Start observing the image element
    if (imgRef.current && observerRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      // Clean up observer on unmount or when src changes
      if (observerRef.current && imgRef.current) {
        observerRef.current.unobserve(imgRef.current);
      }
    };
  }, [src, placeholderSrc, width]);

  // Handle image load event
  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  // Handle image error event
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (onError) {
      onError(e);
    } else {
      // Default error handler - set to placeholder
      setImageSrc(placeholderSrc);
    }
  };

  // Determine srcSet - use provided one or generate if responsive is true
  const finalSrcSet = providedSrcSet || (responsive ? generateSrcSet(src, [320, 480, 640, 768, 1024, 1280], 85) : undefined);

  // Use blur-up technique for smoother loading with enhanced blur effect
  const blurStyle = !isLoaded ? {
    filter: 'blur(20px)',
    transform: 'scale(1.05)'
  } : {};

  // Double-tap handler for zooming
  const handleDoubleTap = (e: React.TouchEvent) => {
    if (!zoomable) return;

    // Check if this is a desktop icon by looking at parent elements
    const isDesktopIcon = e.currentTarget.closest('[data-section-id]') !== null;
    if (isDesktopIcon) return; // Don't zoom desktop icons

    e.preventDefault();
    setIsZoomed(!isZoomed);
  };

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden ${!isLoaded ? 'bg-gray-100' : ''} ${zoomable ? 'touch-feedback' : ''}`}
      style={{
        width: width ? `${width}px` : 'auto',
        height: height ? `${height}px` : 'auto',
        position: 'relative',
        touchAction: zoomable ? 'manipulation' : 'auto'
      }}
      onTouchStart={zoomable ? (e) => {
        // Only stop propagation if not a desktop icon
        const isDesktopIcon = e.currentTarget.closest('[data-section-id]') !== null;
        if (!isDesktopIcon) {
          e.stopPropagation();
        }
      } : undefined}
      onDoubleClick={zoomable ? (e) => {
        // Only allow zoom if not a desktop icon
        const isDesktopIcon = e.currentTarget.closest('[data-section-id]') !== null;
        if (!isDesktopIcon) {
          setIsZoomed(!isZoomed);
        }
      } : undefined}
    >
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        className={`${className} transition-all duration-800 ease-out ${zoomable ? 'touch-action-none' : ''}`}
        style={{
          opacity: isLoaded ? 1 : 0.7,
          transform: isZoomed ? `scale(${scale > 1 ? scale : 2})` : 'none',
          transformOrigin: 'center',
          transition: isZoomed ? 'transform 0.2s ease-out' : 'all 0.8s ease-out',
          ...blurStyle
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
        onTouchEnd={(e) => {
          // Check if this is a desktop icon
          const isDesktopIcon = containerRef.current?.closest('[data-section-id]') !== null;

          // Only handle double tap for zoom if not a desktop icon
          if (zoomable && !isDesktopIcon) {
            handleDoubleTap(e);
          }
        }}
        width={width}
        height={height}
        loading="lazy" // Use native lazy loading as a fallback
        srcSet={finalSrcSet}
        sizes={finalSrcSet ? sizes : undefined}
        // Use lowercase fetchpriority attribute for React compatibility
        fetchpriority={className.includes('priority') ? 'high' : 'auto'}
        decoding="async" // Use async decoding for better performance
      />

      {/* Zoom indicator for mobile */}
      {zoomable && isLoaded && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full pointer-events-none md:hidden">
          {isZoomed ? 'Pinch to zoom' : 'Double-tap to zoom'}
        </div>
      )}
    </div>
  );
}
