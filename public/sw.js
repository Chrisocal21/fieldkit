// FIELDKIT Service Worker - Offline Caching & PWA Support

// Bumped to v3 to force existing installs to purge the v2 caches below —
// those caches served the app shell cache-first with no revalidation, so a
// device that had ever loaded the app kept running that exact cached build
// forever, silently ignoring every subsequent deploy.
const CACHE_NAME = 'fieldkit-v3'
const STATIC_CACHE_NAME = 'fieldkit-static-v3'
const API_CACHE_NAME = 'fieldkit-api-v3'
const API_ORIGIN = 'https://fieldkit-api.recipeer-cbv.workers.dev'

// Assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/jobs',
  '/quotes',
  '/schedule',
  '/inventory',
  '/logo.svg',
  '/icon-blue.svg',
  '/icon-blue-512.svg',
  '/manifest.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE_NAME && name !== API_CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Stale-while-revalidate for Cloudflare API (GET only)
  if (request.url.startsWith(API_ORIGIN)) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          const fetchPromise = fetch(request).then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone())
            }
            return networkResponse
          }).catch(() => cachedResponse)
          // Return stale immediately while revalidating in background
          return cachedResponse || fetchPromise
        })
      })
    )
    return
  }

  // Skip other external resources
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  // Navigation (HTML page) requests: always prefer the network so a new
  // deploy is picked up immediately. These URLs are stable across builds
  // (unlike hashed JS/CSS chunks below), so cache-first here would mean a
  // device that cached the app once never sees any later deploy again.
  // Cache is only used as an offline fallback.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache))
          }
          return response
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/')))
    )
    return
  }

  // Everything else same-origin (hashed /_next/static/ chunks, images, etc.)
  // — content-hashed filenames change per build, so cache-first is safe and fast.
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response
        }

        // Clone the response
        const responseToCache = response.clone()

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })

        return response
      }).catch(() => undefined)
    })
  )
})

// Listen for messages from the client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting()
  }
})
