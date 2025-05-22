import React, { useEffect } from 'react';

interface ResourceHintsProps {
  preloadImages?: string[];
  preconnectUrls?: string[];
  prefetchUrls?: string[];
  preloadFonts?: { url: string; type: string }[];
}

export function ResourceHints({
  preloadImages = [],
  preconnectUrls = [],
  prefetchUrls = [],
  preloadFonts = []
}: ResourceHintsProps) {
  useEffect(() => {
    // Helper function to create and append link elements
    const createLinkElement = (rel: string, href: string, as?: string, type?: string) => {
      // Check if link already exists
      const existingLink = document.head.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existingLink) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      link.setAttribute('data-resource-hint', 'true');

      if (as) {
        link.setAttribute('as', as);
      }

      if (type) {
        link.setAttribute('type', type);
      }

      // Add crossorigin attribute for fonts
      if (as === 'font') {
        link.setAttribute('crossorigin', 'anonymous');
      }

      document.head.appendChild(link);
    };

    // Create preload links for images
    preloadImages.forEach(imageUrl => {
      createLinkElement('preload', imageUrl, 'image');
    });

    // Create preconnect links
    preconnectUrls.forEach(url => {
      createLinkElement('preconnect', url);
    });

    // Create prefetch links
    prefetchUrls.forEach(url => {
      createLinkElement('prefetch', url);
    });

    // Create preload links for fonts
    preloadFonts.forEach(font => {
      createLinkElement('preload', font.url, 'font', font.type);
    });

    // Clean up function to remove links when component unmounts
    return () => {
      const links = document.head.querySelectorAll('link[data-resource-hint]');
      links.forEach(link => {
        document.head.removeChild(link);
      });
    };
  }, [preloadImages, preconnectUrls, prefetchUrls, preloadFonts]);

  // This component doesn't render anything
  return null;
}
