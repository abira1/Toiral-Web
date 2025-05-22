// Service Worker Registration
import { database } from './firebase/config';
import { ref, onValue, set, get, update } from 'firebase/database';

// Interface for BeforeInstallPromptEvent
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Interface for PWA settings
interface PWAInstallPrompt {
  title: string;
  message: string;
  buttonText: string;
  enabled: boolean;
}

interface PWAIcons {
  favicon: string;
  appIcon192: string;
  appIcon512: string;
  maskableIcon: string;
}

interface PWAStats {
  installCount: number;
  installAttempts: number;
  lastInstalled: string | null;
}

interface PWASettings {
  appName: string;
  shortName: string;
  description: string;
  themeColor: string;
  backgroundColor: string;
  displayMode: 'standalone' | 'minimal-ui' | 'fullscreen' | 'browser';
  orientation: 'any' | 'portrait' | 'landscape';
  installPrompt: PWAInstallPrompt;
  icons: PWAIcons;
  stats: PWAStats;
}

// Global variables
let deferredPrompt: BeforeInstallPromptEvent | null = null;
let pwaSettings: PWASettings | null = null;

// Default PWA settings
const defaultPwaSettings: PWASettings = {
  appName: 'Toiral Web',
  shortName: 'Toiral',
  description: 'Toiral Web Development - Creating Tomorrow\'s Web, Today',
  themeColor: '#008080',
  backgroundColor: '#008080',
  displayMode: 'standalone',
  orientation: 'any',
  installPrompt: {
    title: 'Install Toiral Web',
    message: 'Install Toiral Web as an app on your device for a better experience.',
    buttonText: 'Install App',
    enabled: true
  },
  icons: {
    favicon: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
    appIcon192: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
    appIcon512: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
    maskableIcon: 'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png'
  },
  stats: {
    installCount: 0,
    installAttempts: 0,
    lastInstalled: null
  }
};

// Check if service workers are supported
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Initialize with default settings first to prevent undefined errors
    pwaSettings = defaultPwaSettings;

    // Fetch PWA settings from Firebase
    const pwaSettingsRef = ref(database, 'pwaSettings');

    // Subscribe to PWA settings changes
    onValue(pwaSettingsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Ensure all required properties exist by merging with defaults
        pwaSettings = {
          ...defaultPwaSettings,
          ...data,
          // Ensure nested objects are properly merged
          installPrompt: {
            ...defaultPwaSettings.installPrompt,
            ...(data.installPrompt || {})
          },
          icons: {
            ...defaultPwaSettings.icons,
            ...(data.icons || {})
          },
          stats: {
            ...defaultPwaSettings.stats,
            ...(data.stats || {})
          }
        };

        console.log('PWA settings loaded from Firebase');
      } else {
        console.log('No PWA settings found in Firebase');
        // Use default settings if none exist
        pwaSettings = defaultPwaSettings;

        // Save default settings to Firebase
        set(pwaSettingsRef, defaultPwaSettings);
      }
    });

    window.addEventListener('load', () => {
      // Wrap in try-catch to handle any unexpected errors
      try {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);

            // Check for updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New service worker is installed but waiting to activate
                    console.log('New service worker available');

                    // Create a custom update notification instead of using confirm()
                    showUpdateNotification(() => {
                      try {
                        // Send message to service worker to skip waiting
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                      } catch (err) {
                        console.error('Error during service worker update:', err);
                        // Force reload as fallback
                        window.location.reload();
                      }
                    });
                  }
                });
              }
            });
          })
          .catch(error => {
            console.error('Service Worker registration failed:', error);
            // Continue without service worker functionality
          });
      } catch (error) {
        console.error('Unexpected error during service worker registration:', error);
        // Continue without service worker functionality
      }

      // Handle service worker updates
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });

    // Check if this is the first visit
    const checkFirstVisit = () => {
      const lastVisit = localStorage.getItem('toiral_last_visit');
      const now = new Date().toISOString();

      if (!lastVisit) {
        // This is the first visit
        localStorage.setItem('toiral_last_visit', now);
        return true;
      } else {
        // Not the first visit, but update the last visit time
        localStorage.setItem('toiral_last_visit', now);
        return false;
      }
    };

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();

      // Store the event so it can be triggered later
      deferredPrompt = e as BeforeInstallPromptEvent;

      // Increment install attempts counter
      const statsRef = ref(database, 'pwaSettings/stats');
      get(statsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const stats = snapshot.val();
          update(statsRef, {
            installAttempts: (stats.installAttempts || 0) + 1
          });
        } else {
          // Initialize stats if they don't exist
          set(statsRef, {
            installCount: 0,
            installAttempts: 1,
            lastInstalled: null
          });
        }
      }).catch(error => {
        console.error('Error updating install attempts:', error);
      });

      // Show the install prompt automatically on first visit
      // or if it's been more than 7 days since the last prompt
      const lastPrompt = localStorage.getItem('toiral_last_install_prompt');
      const now = new Date();
      const isFirstVisit = checkFirstVisit();

      if (isFirstVisit || !lastPrompt || (new Date(lastPrompt).getTime() + 7 * 24 * 60 * 60 * 1000) < now.getTime()) {
        // Wait a few seconds to show the prompt so the user can see the site first
        setTimeout(() => {
          if (deferredPrompt && pwaSettings?.installPrompt?.enabled) {
            showInstallPrompt();
            localStorage.setItem('toiral_last_install_prompt', now.toISOString());
          }
        }, 5000);
      }
    });

    // Listen for custom event to show install prompt
    window.addEventListener('showInstallPrompt', () => {
      if (deferredPrompt && pwaSettings && pwaSettings.installPrompt.enabled) {
        showInstallPrompt();
      }
    });

    // Listen for the appinstalled event
    window.addEventListener('appinstalled', () => {
      // Log install to analytics
      console.log('PWA was installed');

      // Update installation stats in Firebase
      const statsRef = ref(database, 'pwaSettings/stats');
      get(statsRef).then((snapshot) => {
        if (snapshot.exists()) {
          const stats = snapshot.val();
          update(statsRef, {
            installCount: (stats.installCount || 0) + 1,
            lastInstalled: new Date().toISOString()
          });
        } else {
          // Initialize stats if they don't exist
          set(statsRef, {
            installCount: 1,
            installAttempts: 1,
            lastInstalled: new Date().toISOString()
          });
        }
      }).catch(error => {
        console.error('Error updating install count:', error);
      });

      // Clear the deferredPrompt
      deferredPrompt = null;

      // Hide install prompt
      hideInstallPrompt();
    });
  } else {
    console.log('Service Workers are not supported in this browser.');
  }
}

// Function to show a custom update notification
function showUpdateNotification(onAccept: () => void) {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = 'pwa-update-notification';
  notification.innerHTML = `
    <div class="pwa-update-content">
      <div class="pwa-update-title">Update Available</div>
      <div class="pwa-update-message">A new version of this app is available.</div>
      <div class="pwa-update-buttons">
        <button class="pwa-update-later">Later</button>
        <button class="pwa-update-now">Update Now</button>
      </div>
    </div>
  `;

  // Add styles
  notification.style.position = 'fixed';
  notification.style.bottom = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = '#008080';
  notification.style.color = 'white';
  notification.style.padding = '15px';
  notification.style.borderRadius = '8px';
  notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  notification.style.zIndex = '9999';
  notification.style.maxWidth = '90%';
  notification.style.width = '320px';

  // Add to body
  document.body.appendChild(notification);

  // Add event listeners
  const updateNowButton = notification.querySelector('.pwa-update-now');
  const updateLaterButton = notification.querySelector('.pwa-update-later');

  if (updateNowButton) {
    updateNowButton.addEventListener('click', () => {
      onAccept();
      document.body.removeChild(notification);
    });
  }

  if (updateLaterButton) {
    updateLaterButton.addEventListener('click', () => {
      document.body.removeChild(notification);
    });
  }
}

// Function to show install prompt
function showInstallPrompt() {
  if (!deferredPrompt) return;

  // Use default settings if pwaSettings is null
  const settings = pwaSettings || defaultPwaSettings;

  // Check if install prompt is enabled in settings
  if (settings.installPrompt && !settings.installPrompt.enabled) return;

  // Create install container if it doesn't exist
  let installContainer = document.getElementById('pwa-install-container');

  if (!installContainer) {
    // Create Windows 95 style container
    installContainer = document.createElement('div');
    installContainer.id = 'pwa-install-container';
    installContainer.style.position = 'fixed';
    installContainer.style.top = '50%';
    installContainer.style.left = '50%';
    installContainer.style.transform = 'translate(-50%, -50%)';
    installContainer.style.backgroundColor = '#c0c0c0';
    installContainer.style.border = '2px solid';
    installContainer.style.borderTopColor = '#ffffff';
    installContainer.style.borderLeftColor = '#ffffff';
    installContainer.style.borderBottomColor = '#808080';
    installContainer.style.borderRightColor = '#808080';
    installContainer.style.padding = '2px';
    installContainer.style.boxShadow = '4px 4px 10px rgba(0, 0, 0, 0.3)';
    installContainer.style.zIndex = '9999';
    installContainer.style.maxWidth = '350px';
    installContainer.style.width = '90%';

    // Create title bar
    const titleBar = document.createElement('div');
    titleBar.style.backgroundColor = '#000080';
    titleBar.style.color = 'white';
    titleBar.style.padding = '2px 4px';
    titleBar.style.fontFamily = 'Arial, sans-serif';
    titleBar.style.fontSize = '12px';
    titleBar.style.fontWeight = 'bold';
    titleBar.style.display = 'flex';
    titleBar.style.justifyContent = 'space-between';
    titleBar.style.alignItems = 'center';

    // Add title text
    const titleText = document.createElement('span');
    titleText.textContent = settings.installPrompt.title;
    titleBar.appendChild(titleText);

    // Add close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.backgroundColor = '#c0c0c0';
    closeButton.style.border = '1px solid';
    closeButton.style.borderTopColor = '#ffffff';
    closeButton.style.borderLeftColor = '#ffffff';
    closeButton.style.borderBottomColor = '#808080';
    closeButton.style.borderRightColor = '#808080';
    closeButton.style.width = '16px';
    closeButton.style.height = '16px';
    closeButton.style.fontSize = '14px';
    closeButton.style.lineHeight = '12px';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.color = 'black';
    closeButton.style.cursor = 'pointer';
    closeButton.style.padding = '0';
    closeButton.style.marginLeft = '4px';

    closeButton.addEventListener('click', () => {
      hideInstallPrompt();
    });

    titleBar.appendChild(closeButton);
    installContainer.appendChild(titleBar);

    // Create content area
    const content = document.createElement('div');
    content.style.padding = '10px';
    content.style.fontFamily = 'Arial, sans-serif';
    content.style.fontSize = '12px';

    // Add message
    const message = document.createElement('p');
    message.textContent = settings.installPrompt.message;
    message.style.margin = '0 0 10px 0';
    content.appendChild(message);

    // Add benefits list
    const benefitsList = document.createElement('ul');
    benefitsList.style.margin = '10px 0';
    benefitsList.style.paddingLeft = '20px';
    benefitsList.style.fontSize = '11px';

    const benefits = [
      'Works offline',
      'Faster loading times',
      'App-like experience',
      'No browser UI',
      'Desktop shortcut'
    ];

    benefits.forEach(benefit => {
      const item = document.createElement('li');
      item.textContent = benefit;
      item.style.marginBottom = '4px';
      benefitsList.appendChild(item);
    });

    content.appendChild(benefitsList);

    // Add buttons container
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.justifyContent = 'space-between';
    buttonsContainer.style.marginTop = '15px';

    // Add install button
    const installButton = document.createElement('button');
    installButton.textContent = settings.installPrompt.buttonText;
    installButton.style.backgroundColor = '#c0c0c0';
    installButton.style.border = '2px solid';
    installButton.style.borderTopColor = '#ffffff';
    installButton.style.borderLeftColor = '#ffffff';
    installButton.style.borderBottomColor = '#808080';
    installButton.style.borderRightColor = '#808080';
    installButton.style.padding = '6px 15px';
    installButton.style.fontFamily = 'Arial, sans-serif';
    installButton.style.fontSize = '14px';
    installButton.style.fontWeight = 'bold';
    installButton.style.cursor = 'pointer';

    // Add cancel button
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'Not Now';
    cancelButton.style.backgroundColor = '#c0c0c0';
    cancelButton.style.border = '2px solid';
    cancelButton.style.borderTopColor = '#ffffff';
    cancelButton.style.borderLeftColor = '#ffffff';
    cancelButton.style.borderBottomColor = '#808080';
    cancelButton.style.borderRightColor = '#808080';
    cancelButton.style.padding = '6px 15px';
    cancelButton.style.fontFamily = 'Arial, sans-serif';
    cancelButton.style.fontSize = '12px';
    cancelButton.style.cursor = 'pointer';

    cancelButton.addEventListener('click', () => {
      hideInstallPrompt();
    });

    // Add hover effect
    installButton.addEventListener('mousedown', () => {
      installButton.style.borderTopColor = '#808080';
      installButton.style.borderLeftColor = '#808080';
      installButton.style.borderBottomColor = '#ffffff';
      installButton.style.borderRightColor = '#ffffff';
    });

    installButton.addEventListener('mouseup', () => {
      installButton.style.borderTopColor = '#ffffff';
      installButton.style.borderLeftColor = '#ffffff';
      installButton.style.borderBottomColor = '#808080';
      installButton.style.borderRightColor = '#808080';
    });

    // Add click event
    installButton.addEventListener('click', async () => {
      if (!deferredPrompt) return;

      // Show the install prompt
      deferredPrompt.prompt();

      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);

      // Clear the deferredPrompt variable
      deferredPrompt = null;

      // Hide the install button
      hideInstallPrompt();
    });

    // Add hover effect for cancel button
    cancelButton.addEventListener('mousedown', () => {
      cancelButton.style.borderTopColor = '#808080';
      cancelButton.style.borderLeftColor = '#808080';
      cancelButton.style.borderBottomColor = '#ffffff';
      cancelButton.style.borderRightColor = '#ffffff';
    });

    cancelButton.addEventListener('mouseup', () => {
      cancelButton.style.borderTopColor = '#ffffff';
      cancelButton.style.borderLeftColor = '#ffffff';
      cancelButton.style.borderBottomColor = '#808080';
      cancelButton.style.borderRightColor = '#808080';
    });

    // Add buttons to container
    buttonsContainer.appendChild(installButton);
    buttonsContainer.appendChild(cancelButton);

    // Add buttons container to content
    content.appendChild(buttonsContainer);

    // Add content to main container
    installContainer.appendChild(content);

    document.body.appendChild(installContainer);
  } else {
    installContainer.style.display = 'block';
  }
}

// Function to hide install prompt
function hideInstallPrompt() {
  const installContainer = document.getElementById('pwa-install-container');
  if (installContainer) {
    installContainer.style.display = 'none';
  }
}

// Unregister all service workers
export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
        console.log('Service Workers unregistered');
      })
      .catch(error => {
        console.error('Error unregistering Service Workers:', error);
      });
  }
}

// Reset service worker (unregister and re-register)
export function resetServiceWorker() {
  if ('serviceWorker' in navigator) {
    // First unregister all service workers
    navigator.serviceWorker.getRegistrations()
      .then(registrations => {
        const unregisterPromises = registrations.map(registration => registration.unregister());
        return Promise.all(unregisterPromises);
      })
      .then(() => {
        console.log('All service workers unregistered');

        // Clear caches
        return caches.keys().then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              console.log(`Deleting cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
          );
        });
      })
      .then(() => {
        console.log('All caches cleared');

        // Re-register the service worker
        return navigator.serviceWorker.register('/service-worker.js');
      })
      .then(registration => {
        console.log('Service Worker re-registered with scope:', registration.scope);

        // Reload the page to apply changes
        window.location.reload();
      })
      .catch(error => {
        console.error('Error resetting Service Worker:', error);
        alert('Failed to reset Service Worker. Please try refreshing the page.');
      });
  } else {
    console.log('Service Workers are not supported in this browser.');
  }
}
