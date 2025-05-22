import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useTheme } from '../contexts/ThemeContext';

/**
 * ThemeColorManager component
 * 
 * This component manages the theme-color meta tag for mobile browsers.
 * It ensures the theme color matches the background color to prevent
 * the blue line at the top of the mobile UI.
 */
export function ThemeColorManager() {
  const { settings } = useTheme();
  
  useEffect(() => {
    // Find and remove any existing theme-color meta tags
    const existingMetaTags = document.querySelectorAll('meta[name="theme-color"]');
    existingMetaTags.forEach(tag => tag.remove());
    
    // Create a new meta tag with the background color
    const metaTag = document.createElement('meta');
    metaTag.name = 'theme-color';
    metaTag.content = settings.backgroundColor || '#c0c0c0';
    document.head.appendChild(metaTag);
    
    return () => {
      // Clean up when component unmounts
      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach(tag => tag.remove());
    };
  }, [settings.backgroundColor]);

  return (
    <Helmet>
      <meta name="theme-color" content={settings.backgroundColor || '#c0c0c0'} />
    </Helmet>
  );
}
