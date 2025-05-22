/**
 * Script Loader Utility
 * 
 * This utility provides functions to load third-party scripts efficiently.
 * It supports:
 * - Lazy loading scripts when they're needed
 * - Loading scripts with the correct attributes (async, defer)
 * - Avoiding duplicate script loading
 */

interface ScriptAttributes {
  async?: boolean;
  defer?: boolean;
  id?: string;
  crossOrigin?: string;
  integrity?: string;
  type?: string;
  onLoad?: () => void;
  onError?: (error: Error) => void;
}

// Keep track of loaded scripts to avoid duplicates
const loadedScripts: Record<string, boolean> = {};

/**
 * Load a script dynamically
 */
export function loadScript(src: string, attributes: ScriptAttributes = {}): Promise<void> {
  // If script is already loaded, return resolved promise
  if (loadedScripts[src]) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    
    // Set attributes
    if (attributes.async !== false) {
      script.async = true;
    }
    
    if (attributes.defer) {
      script.defer = true;
    }
    
    if (attributes.id) {
      script.id = attributes.id;
    }
    
    if (attributes.crossOrigin) {
      script.crossOrigin = attributes.crossOrigin;
    }
    
    if (attributes.integrity) {
      script.integrity = attributes.integrity;
    }
    
    if (attributes.type) {
      script.type = attributes.type;
    }
    
    // Handle load event
    script.onload = () => {
      loadedScripts[src] = true;
      if (attributes.onLoad) {
        attributes.onLoad();
      }
      resolve();
    };
    
    // Handle error event
    script.onerror = (error) => {
      const errorObj = error instanceof Error ? error : new Error(`Failed to load script: ${src}`);
      if (attributes.onError) {
        attributes.onError(errorObj);
      }
      reject(errorObj);
    };
    
    // Append script to document
    document.head.appendChild(script);
  });
}

/**
 * Load a script when an element is in the viewport
 */
export function loadScriptWhenVisible(
  elementId: string,
  src: string,
  attributes: ScriptAttributes = {}
): void {
  // If script is already loaded, do nothing
  if (loadedScripts[src]) {
    return;
  }
  
  // If IntersectionObserver is not supported, load script immediately
  if (!('IntersectionObserver' in window)) {
    loadScript(src, attributes);
    return;
  }
  
  // Create observer
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Load script when element is visible
        loadScript(src, attributes);
        
        // Stop observing
        observer.disconnect();
      }
    });
  }, {
    rootMargin: '200px 0px', // Load script when element is 200px from viewport
    threshold: 0.01
  });
  
  // Start observing element
  const element = document.getElementById(elementId);
  if (element) {
    observer.observe(element);
  } else {
    // If element doesn't exist, load script immediately
    loadScript(src, attributes);
  }
}

/**
 * Remove a script from the document
 */
export function removeScript(src: string): void {
  const scripts = document.querySelectorAll(`script[src="${src}"]`);
  scripts.forEach((script) => {
    document.head.removeChild(script);
  });
  
  // Update loaded scripts record
  delete loadedScripts[src];
}
