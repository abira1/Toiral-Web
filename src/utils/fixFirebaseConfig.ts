import { auth } from '../firebase/config';
import { getApp } from 'firebase/app';

/**
 * Checks if the current domain is authorized for Firebase Authentication
 * and provides guidance on how to fix it
 */
export function checkFirebaseAuthDomain(): {
  isAuthorized: boolean;
  currentDomain: string;
  authDomain: string;
  instructions: string;
} {
  const app = getApp();
  const currentDomain = window.location.hostname;
  const authDomain = app.options.authDomain || '';
  
  // Check if current domain matches auth domain or is localhost
  const isLocalhost = currentDomain === 'localhost' || currentDomain === '127.0.0.1';
  const isAuthorized = isLocalhost || authDomain.includes(currentDomain);
  
  let instructions = '';
  
  if (!isAuthorized) {
    instructions = `
      Your current domain (${currentDomain}) is not authorized for Firebase Authentication.
      
      To fix this:
      1. Go to the Firebase Console: https://console.firebase.google.com/
      2. Select your project: "${app.options.projectId}"
      3. Go to Authentication > Settings > Authorized domains
      4. Add "${currentDomain}" to the list of authorized domains
      5. Save changes
      
      For local development:
      - Make sure "localhost" is in the authorized domains list
      - Use http://localhost:5173/ instead of http://127.0.0.1:5173/
    `;
  } else {
    instructions = `
      Your domain (${currentDomain}) is properly authorized for Firebase Authentication.
      
      If you're still having issues:
      1. Check that you're using the correct Firebase project
      2. Verify that your Firebase config is correct
      3. Try clearing your browser cache or testing in an incognito window
      4. Check the browser console for specific error messages
    `;
  }
  
  return {
    isAuthorized,
    currentDomain,
    authDomain,
    instructions
  };
}

/**
 * Checks if the Firebase SDK version is compatible
 */
export function checkFirebaseSDKVersion(): {
  isCompatible: boolean;
  version: string;
  recommendations: string;
} {
  // Get Firebase SDK version
  const app = getApp();
  const version = app.SDK_VERSION || 'unknown';
  
  // Check if version is compatible (this is a simple check)
  const isCompatible = version !== 'unknown' && parseFloat(version) >= 9.0;
  
  let recommendations = '';
  
  if (!isCompatible) {
    recommendations = `
      Your Firebase SDK version (${version}) may be outdated.
      
      Recommended actions:
      1. Update Firebase packages: npm install firebase@latest
      2. Make sure you're using the modular v9+ syntax
      3. Check for breaking changes in the Firebase documentation
    `;
  } else {
    recommendations = `
      Your Firebase SDK version (${version}) is compatible.
      
      If you're still having issues:
      1. Check for any specific issues with this version in the Firebase release notes
      2. Ensure all Firebase packages are at the same version
    `;
  }
  
  return {
    isCompatible,
    version,
    recommendations
  };
}

/**
 * Provides guidance on clearing cache and testing in incognito mode
 */
export function getCacheClearingInstructions(): string {
  const browser = detectBrowser();
  
  let instructions = `
    General instructions for clearing cache:
    
    1. Open your browser settings
    2. Find the privacy or history section
    3. Select "Clear browsing data" or similar
    4. Check "Cached images and files" and "Cookies and site data"
    5. Click "Clear data"
    
    Testing in incognito/private mode:
  `;
  
  switch (browser) {
    case 'chrome':
      instructions += `
        Chrome:
        - Clear cache: Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)
        - Incognito mode: Ctrl+Shift+N (Windows/Linux) or Cmd+Shift+N (Mac)
      `;
      break;
    case 'firefox':
      instructions += `
        Firefox:
        - Clear cache: Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)
        - Private mode: Ctrl+Shift+P (Windows/Linux) or Cmd+Shift+P (Mac)
      `;
      break;
    case 'safari':
      instructions += `
        Safari:
        - Clear cache: Cmd+Option+E
        - Private mode: Cmd+Shift+N
      `;
      break;
    case 'edge':
      instructions += `
        Edge:
        - Clear cache: Ctrl+Shift+Delete
        - InPrivate mode: Ctrl+Shift+N
      `;
      break;
    default:
      instructions += `
        - Use keyboard shortcuts or browser menu to open incognito/private mode
        - Test your application in this mode to avoid cached data
      `;
  }
  
  return instructions;
}

/**
 * Simple browser detection
 */
function detectBrowser(): string {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') === -1) {
    return 'chrome';
  } else if (userAgent.indexOf('firefox') > -1) {
    return 'firefox';
  } else if (userAgent.indexOf('safari') > -1 && userAgent.indexOf('chrome') === -1) {
    return 'safari';
  } else if (userAgent.indexOf('edge') > -1) {
    return 'edge';
  } else {
    return 'unknown';
  }
}
