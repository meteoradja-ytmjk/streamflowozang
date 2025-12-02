
const CACHE_NAME = 'streamflow-v3-cache';
const CACHE_VERSION = '2.0.0';
const FULL_CACHE_NAME = `${CACHE_NAME}-${CACHE_VERSION}`;
const OFFLINE_CACHE = 'streamflow-offline-v1';
const DYNAMIC_CACHE = 'streamflow-dynamic-v1';

const STATIC_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.30.0/tabler-icons.min.css',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.30.0/fonts/tabler-icons.woff2',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.30.0/fonts/tabler-icons.woff',
  'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@2.30.0/fonts/tabler-icons.ttf',
  
  '/css/styles.css',
  '/js/stream-modal.js',
  
  '/images/logo.svg',
  '/images/default-avatar.jpg',
  '/images/default-video-thumbnail.svg'
];

const OFFLINE_PAGES = [
  '/dashboard',
  '/gallery',
  '/settings'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(FULL_CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching static resources');
        return cache.addAll(STATIC_RESOURCES);
      })
      .then(() => {
        console.log('Service Worker: All resources cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache resources', error);
      })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName.startsWith(CACHE_NAME) && cacheName !== FULL_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  // Handle API requests with network-first strategy
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached API response if offline
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline fallback for API
            return new Response(JSON.stringify({
              success: false,
              error: 'You are offline',
              offline: true
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Handle static resources with cache-first strategy
  if (isStaticResource(event.request.url)) {
    event.respondWith(
      caches.match(event.request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(event.request)
            .then((response) => {
              if (!response || response.status !== 200 || (response.type !== 'basic' && response.type !== 'cors')) {
                return response;
              }

              const responseToCache = response.clone();
              caches.open(FULL_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });

              return response;
            })
            .catch((error) => {
              console.error('Service Worker: Fetch failed', error);
              return getOfflineFallback(event.request);
            });
        })
    );
    return;
  }

  // Handle page requests with network-first, fallback to cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache successful page responses
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(OFFLINE_CACHE).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached page if offline
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          // Return offline page
          return caches.match('/offline.html');
        });
      })
  );
});

// Get offline fallback for different resource types
function getOfflineFallback(request) {
  const url = new URL(request.url);
  
  if (url.pathname.endsWith('.jpg') || url.pathname.endsWith('.png') || url.pathname.endsWith('.svg')) {
    return caches.match('/images/offline-image.svg');
  }
  
  return new Response('Offline', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain'
    })
  });
}

function isStaticResource(url) {
  return STATIC_RESOURCES.some(resource => url.includes(resource.replace(/^\
         url.includes('tabler-icons') ||
         url.includes('cdn.jsdelivr.net') ||
         url.endsWith('.css') ||
         url.endsWith('.js') ||
         url.endsWith('.woff2') ||
         url.endsWith('.woff') ||
         url.endsWith('.ttf') ||
         url.endsWith('.svg');
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(OFFLINE_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-streams') {
    event.waitUntil(syncStreams());
  }
  
  if (event.tag === 'sync-backups') {
    event.waitUntil(syncBackups());
  }
});

async function syncStreams() {
  try {
    // Get pending stream actions from IndexedDB
    const db = await openDB();
    const pendingActions = await db.getAll('pendingActions');
    
    for (const action of pendingActions) {
      try {
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        if (response.ok) {
          // Remove from pending actions
          await db.delete('pendingActions', action.id);
          
          // Notify client
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
              client.postMessage({
                type: 'SYNC_SUCCESS',
                action: action.type
              });
            });
          });
        }
      } catch (error) {
        console.error('Sync failed for action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function syncBackups() {
  try {
    // Sync pending backups
    const db = await openDB();
    const pendingBackups = await db.getAll('pendingBackups');
    
    for (const backup of pendingBackups) {
      try {
        const response = await fetch('/api/backups/create/' + backup.streamId, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backup.data)
        });
        
        if (response.ok) {
          await db.delete('pendingBackups', backup.id);
        }
      } catch (error) {
        console.error('Backup sync failed:', error);
      }
    }
  } catch (error) {
    console.error('Backup sync failed:', error);
  }
}

// IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('StreamflowDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('pendingActions')) {
        db.createObjectStore('pendingActions', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('pendingBackups')) {
        db.createObjectStore('pendingBackups', { keyPath: 'id', autoIncrement: true });
      }
      
      if (!db.objectStoreNames.contains('offlineData')) {
        db.createObjectStore('offlineData', { keyPath: 'key' });
      }
    };
  });
}

// Push notification support
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  
  const options = {
    body: data.body || 'New notification from Streamflow',
    icon: '/images/logo.svg',
    badge: '/images/badge.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || []
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Streamflow', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/dashboard')
  );
});