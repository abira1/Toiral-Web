/**
 * Enhanced Image Optimization Service
 * Provides utilities for optimizing, caching, and progressive loading of images
 */

// Enhanced in-memory cache for images with metadata
const imageCache = new Map();
const imageSizeCache = new Map();
const loadingPromises = new Map();

// Performance tracking
let cacheHits = 0;
let cacheMisses = 0;
let totalLoadTime = 0;
let imagesLoaded = 0;

/**
 * Enhanced preload with priority and progress tracking
 * @param {string[]} urls - Array of image URLs to preload
 * @param {Object} options - Preload options
 * @returns {Promise<void>} - Promise that resolves when all images are loaded
 */
export const preloadImages = (urls, options = {}) => {
  if (!urls || !Array.isArray(urls)) return Promise.resolve();

  const {
    priority = 'medium',
    maxConcurrent = 3,
    onProgress = null,
    timeout = 10000
  } = options;

  return new Promise((resolve) => {
    let completed = 0;
    let failed = 0;
    const total = urls.length;

    if (total === 0) {
      resolve();
      return;
    }

    // Process URLs in chunks to limit concurrent requests
    const processChunk = async (chunk) => {
      const promises = chunk.map(url => preloadSingleImage(url, { priority, timeout }));
      const results = await Promise.allSettled(promises);

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          completed++;
        } else {
          failed++;
          console.warn(`Failed to preload image: ${chunk[index]}`, result.reason);
        }

        if (onProgress) {
          onProgress({
            completed: completed + failed,
            total,
            successful: completed,
            failed
          });
        }
      });
    };

    // Split URLs into chunks
    const chunks = [];
    for (let i = 0; i < urls.length; i += maxConcurrent) {
      chunks.push(urls.slice(i, i + maxConcurrent));
    }

    // Process chunks sequentially
    const processAllChunks = async () => {
      for (const chunk of chunks) {
        await processChunk(chunk);
      }
      resolve();
    };

    processAllChunks();
  });
};

/**
 * Preload a single image with enhanced caching
 * @param {string} url - Image URL to preload
 * @param {Object} options - Preload options
 * @returns {Promise<void>} - Promise that resolves when image is loaded
 */
export const preloadSingleImage = (url, options = {}) => {
  if (typeof url !== 'string') return Promise.reject(new Error('Invalid URL'));

  // Check if already cached
  if (imageCache.has(url)) {
    cacheHits++;
    return Promise.resolve();
  }

  // Check if already loading
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url);
  }

  const { priority = 'medium', timeout = 10000 } = options;
  const startTime = performance.now();

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    let timeoutId;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
      loadingPromises.delete(url);
    };

    const onLoad = () => {
      cleanup();

      // Calculate and track performance
      const loadTime = performance.now() - startTime;
      totalLoadTime += loadTime;
      imagesLoaded++;

      // Cache with metadata
      imageCache.set(url, {
        loaded: true,
        timestamp: Date.now(),
        loadTime,
        priority,
        size: img.naturalWidth * img.naturalHeight
      });

      // Cache dimensions
      imageSizeCache.set(url, {
        width: img.naturalWidth,
        height: img.naturalHeight
      });

      cacheMisses++;
      resolve();
    };

    const onError = () => {
      cleanup();
      reject(new Error(`Failed to load image: ${url}`));
    };

    // Set up timeout
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Image load timeout: ${url}`));
    }, timeout);

    img.onload = onLoad;
    img.onerror = onError;

    // Set priority hint if supported
    if ('fetchPriority' in img) {
      img.fetchPriority = priority === 'high' ? 'high' : priority === 'low' ? 'low' : 'auto';
    }

    // Start loading with optimized URL
    img.src = getOptimizedImageUrl(url);
  });

  loadingPromises.set(url, promise);
  return promise;
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

/**
 * Get performance statistics
 * @returns {Object} - Performance metrics
 */
export const getPerformanceStats = () => {
  const avgLoadTime = imagesLoaded > 0 ? totalLoadTime / imagesLoaded : 0;
  const cacheHitRate = (cacheHits + cacheMisses) > 0 ? (cacheHits / (cacheHits + cacheMisses)) * 100 : 0;

  return {
    cacheHits,
    cacheMisses,
    cacheHitRate: Math.round(cacheHitRate * 100) / 100,
    totalLoadTime,
    imagesLoaded,
    avgLoadTime: Math.round(avgLoadTime * 100) / 100,
    cacheSize: imageCache.size,
    loadingPromises: loadingPromises.size
  };
};

/**
 * Reset performance statistics
 */
export const resetPerformanceStats = () => {
  cacheHits = 0;
  cacheMisses = 0;
  totalLoadTime = 0;
  imagesLoaded = 0;
};

/**
 * Get cached image dimensions
 * @param {string} url - Image URL
 * @returns {Object|null} - Image dimensions or null if not cached
 */
export const getCachedImageDimensions = (url) => {
  return imageSizeCache.get(url) || null;
};

/**
 * Progressive image loading with blur-up technique
 * @param {string} url - Image URL
 * @param {Object} options - Loading options
 * @returns {Promise<HTMLImageElement>} - Promise that resolves with the loaded image
 */
export const loadImageProgressively = (url, options = {}) => {
  const {
    lowQualityUrl = null,
    onLowQualityLoad = null,
    onHighQualityLoad = null,
    timeout = 15000
  } = options;

  return new Promise((resolve, reject) => {
    const highQualityImg = new Image();
    let lowQualityImg = null;
    let timeoutId;

    const cleanup = () => {
      if (timeoutId) clearTimeout(timeoutId);
    };

    // Set up timeout
    timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error(`Progressive image load timeout: ${url}`));
    }, timeout);

    // Load high quality image
    highQualityImg.onload = () => {
      cleanup();
      if (onHighQualityLoad) onHighQualityLoad(highQualityImg);
      resolve(highQualityImg);
    };

    highQualityImg.onerror = () => {
      cleanup();
      reject(new Error(`Failed to load high quality image: ${url}`));
    };

    // Load low quality image first if provided
    if (lowQualityUrl) {
      lowQualityImg = new Image();
      lowQualityImg.onload = () => {
        if (onLowQualityLoad) onLowQualityLoad(lowQualityImg);
        // Start loading high quality image
        highQualityImg.src = getOptimizedImageUrl(url);
      };
      lowQualityImg.onerror = () => {
        // If low quality fails, proceed with high quality
        highQualityImg.src = getOptimizedImageUrl(url);
      };
      lowQualityImg.src = getOptimizedImageUrl(lowQualityUrl, { quality: 20, width: 50 });
    } else {
      // No low quality image, load high quality directly
      highQualityImg.src = getOptimizedImageUrl(url);
    }
  });
};

/**
 * Batch image operations for better performance
 * @param {Array} operations - Array of image operations
 * @returns {Promise<Array>} - Promise that resolves with results
 */
export const batchImageOperations = async (operations) => {
  const results = [];
  const concurrencyLimit = 5;

  for (let i = 0; i < operations.length; i += concurrencyLimit) {
    const batch = operations.slice(i, i + concurrencyLimit);
    const batchPromises = batch.map(async (operation) => {
      try {
        switch (operation.type) {
          case 'preload':
            await preloadSingleImage(operation.url, operation.options);
            return { success: true, url: operation.url };
          case 'dimensions':
            const dimensions = await getImageDimensions(operation.url);
            return { success: true, url: operation.url, dimensions };
          case 'progressive':
            const img = await loadImageProgressively(operation.url, operation.options);
            return { success: true, url: operation.url, image: img };
          default:
            throw new Error(`Unknown operation type: ${operation.type}`);
        }
      } catch (error) {
        return { success: false, url: operation.url, error: error.message };
      }
    });

    const batchResults = await Promise.allSettled(batchPromises);
    results.push(...batchResults.map(result =>
      result.status === 'fulfilled' ? result.value : { success: false, error: result.reason }
    ));
  }

  return results;
};
