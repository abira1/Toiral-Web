// Service Worker for Toiral Web
const CACHE_NAME = 'toiral-cache-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/toiral.png',
  '/assets/images/games.png',
  '/assets/images/reversi.png',
  '/assets/images/checkers.png',
  'https://i.postimg.cc/25dSWsHF/Profile_picture__11_-removebg-preview.png',
  'https://i.postimg.cc/hGrDrFBc/Profile-Custom-2.png',
  'https://i.postimg.cc/15k3RcBh/Portfolio.png',
  'https://i.postimg.cc/W3N3LNnd/Appoinment.png',
  'https://i.postimg.cc/cLf4vgkK/Review.png',
  'https://i.postimg.cc/RCb0yzn0/Contact.png',
  'https://i.postimg.cc/wTC4SC9S/e11d1a19-062b-4b8b-b88a-42e855baa176-removebg-preview.png',
  'https://i.postimg.cc/7hbZhKjD/Chat.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('Error caching static assets:', error);
      })
  );
  // Activate the service worker immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  self.clients.claim();
});

// Helper function to determine if a request should be cached
const shouldCache = (url) => {
  // Cache images
  if (url.match(/\.(jpeg|jpg|png|gif|svg|webp)$/)) {
    return true;
  }

  // Cache fonts
  if (url.match(/\.(woff|woff2|ttf|otf|eot)$/)) {
    return true;
  }

  // Cache CSS and JavaScript
  if (url.match(/\.(css|js)$/)) {
    return true;
  }

  // Don't cache Firebase API requests
  if (url.includes('firebaseio.com') || url.includes('googleapis.com')) {
    return false;
  }

  return false;
};

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin) &&
      !event.request.url.includes('postimg.cc') &&
      !event.request.url.includes('via.placeholder.com')) {
    return;
  }

  // Skip Firebase API requests
  if (event.request.url.includes('firebaseio.com') ||
      event.request.url.includes('googleapis.com')) {
    return;
  }

  // For GET requests only
  if (event.request.method !== 'GET') {
    return;
  }

  // For navigation requests (HTML pages), use network-first strategy
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              return caches.match('/') || new Response('Offline page not available', {
                status: 200,
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }

  // For images and other static assets, use cache-first strategy
  if (shouldCache(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          // Return cached response if available
          if (cachedResponse) {
            // In the background, fetch from network and update cache
            fetch(event.request)
              .then((response) => {
                // Only cache valid responses
                if (response && response.status === 200) {
                  const responseToCache = response.clone();
                  caches.open(CACHE_NAME)
                    .then((cache) => {
                      cache.put(event.request, responseToCache);
                    });
                }
              })
              .catch((error) => {
                // Network fetch failed, but we already returned cached response
                console.log('Background fetch failed:', error);
              });

            return cachedResponse;
          }

          // If not in cache, fetch from network
          return fetch(event.request)
            .then((response) => {
              // Return the response
              if (!response || response.status !== 200) {
                return response;
              }

              // Clone the response
              const responseToCache = response.clone();

              // Add to cache
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch(error => {
                  console.error('Failed to cache response:', error);
                });

              return response;
            })
            .catch(error => {
              console.error('Network fetch failed:', error);
              // Return a fallback response for images
              if (event.request.url.match(/\.(jpeg|jpg|png|gif|svg|webp)$/)) {
                return new Response('', {
                  status: 200,
                  headers: { 'Content-Type': 'image/svg+xml' }
                });
              }
              // For other resources, return a simple error response
              return new Response('Resource not available', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
        .catch(error => {
          console.error('Cache match failed:', error);
          return fetch(event.request)
            .catch(fetchError => {
              console.error('Fallback fetch failed:', fetchError);
              // Return a fallback response
              if (event.request.url.match(/\.(jpeg|jpg|png|gif|svg|webp)$/)) {
                return new Response('', {
                  status: 200,
                  headers: { 'Content-Type': 'image/svg+xml' }
                });
              }
              return new Response('Resource not available', {
                status: 404,
                headers: { 'Content-Type': 'text/plain' }
              });
            });
        })
    );
    return;
  }

  // For all other requests, use network-first strategy
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return a default response if nothing is in cache
            return new Response('Resource not available offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
