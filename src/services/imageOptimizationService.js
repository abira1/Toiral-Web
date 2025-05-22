/**
 * Image Optimization Service
 * Provides utilities for optimizing and caching images
 */

// In-memory cache for images
const imageCache = new Map();

/**
 * Preload important images to improve initial load time
 * @param {string[]} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  if (!urls || !Array.isArray(urls)) return;
  
  urls.forEach(url => {
    if (typeof url !== 'string') return;
    
    // Skip if already in cache
    if (imageCache.has(url)) return;
    
    // Create a new image object to preload
    const img = new Image();
    
    img.onload = () => {
      // Add to cache when loaded
      imageCache.set(url, true);
      console.log(`Preloaded image: ${url}`);
    };
    
    img.onerror = () => {
      console.error(`Failed to preload image: ${url}`);
    };
    
    // Start loading
    img.src = getOptimizedImageUrl(url);
  });
};

/**
 * Check if an image is cached
 * @param {string} url - Image URL to check
 * @returns {boolean} - Whether the image is cached
 */
export const isImageCached = (url) => {
  return imageCache.has(url);
};

/**
 * Get an optimized version of an image URL
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return '';
  
  const { width, height, quality = 80, format = 'webp' } = options;
  
  // Handle different image hosting services
  
  // Postimg.cc
  if (url.includes('postimg.cc')) {
    // For postimg.cc, we can append .webp to the URL
    let optimizedUrl = url;
    
    // Add format if not already present
    if (format === 'webp' && !url.toLowerCase().endsWith('.webp')) {
      optimizedUrl = `${optimizedUrl}.webp`;
    }
    
    // Add width parameter if specified
    if (width) {
      optimizedUrl = `${optimizedUrl}?width=${width}`;
    }
    
    return optimizedUrl;
  }
  
  // Placeholder images
  if (url.includes('via.placeholder.com')) {
    return url; // Can't optimize these
  }
  
  // Firebase Storage URLs
  if (url.includes('firebasestorage.googleapis.com')) {
    // Firebase Storage doesn't support on-the-fly resizing
    // We could implement a Cloud Function for this in the future
    return url;
  }
  
  // Cloudinary (if you decide to use it)
  if (url.includes('cloudinary.com')) {
    // Example: https://res.cloudinary.com/demo/image/upload/w_300,h_200,c_crop,q_80/sample.jpg
    let optimizedUrl = url;
    
    // If URL doesn't already have transformation parameters
    if (!url.includes('/upload/')) {
      const transformations = [];
      
      if (width) transformations.push(`w_${width}`);
      if (height) transformations.push(`h_${height}`);
      if (quality) transformations.push(`q_${quality}`);
      if (format) transformations.push(`f_${format}`);
      
      // Add auto-optimization
      transformations.push('c_limit');
      
      // Insert transformations
      optimizedUrl = url.replace('/upload/', `/upload/${transformations.join(',')}/`);
    }
    
    return optimizedUrl;
  }
  
  // For other URLs, return as is (no conversion)
  return url;
};

/**
 * Generate a responsive srcSet for an image
 * @param {string} url - Original image URL
 * @param {number[]} widths - Array of widths to generate
 * @param {number} quality - Image quality (0-100)
 * @returns {string} - srcSet string
 */
export const generateSrcSet = (url, widths = [320, 480, 640, 768, 1024, 1280, 1536, 1920], quality = 80) => {
  if (!url) return '';
  
  return widths
    .map(w => `${getOptimizedImageUrl(url, { width: w, quality })} ${w}w`)
    .join(', ');
};

/**
 * Clear the image cache
 */
export const clearImageCache = () => {
  imageCache.clear();
};

/**
 * Get image dimensions from a URL
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>} - Image dimensions
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${url}`));
    };
    
    img.src = url;
  });
};

/**
 * Check if the browser supports WebP format
 * @returns {Promise<boolean>} - Whether WebP is supported
 */
export const supportsWebP = async () => {
  if (!self.createImageBitmap) return false;
  
  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());
  
  return createImageBitmap(blob).then(() => true, () => false);
};

// Detect WebP support on load
let webpSupported = false;
supportsWebP().then(supported => {
  webpSupported = supported;
});

/**
 * Check if WebP is supported by the browser
 * @returns {boolean} - Whether WebP is supported
 */
export const isWebPSupported = () => webpSupported;
