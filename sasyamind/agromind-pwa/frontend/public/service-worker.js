/**
 * SasyaMind Service Worker
 * Strategy:
 *  - App shell (HTML/JS/CSS) → Cache First  (instant load, always works offline)
 *  - /api/dashboard           → Stale While Revalidate  (show cached, refresh in bg)
 *  - /api/detect-disease etc. → Network First  (ML endpoints need live model)
 *  - Images                   → Cache First with expiry
 */

const SHELL_CACHE   = 'sasyamind-shell-v1';
const API_CACHE     = 'sasyamind-api-v1';
const IMAGE_CACHE   = 'sasyamind-img-v1';

// Files that make up the app shell — adjust paths after `npm run build`
const SHELL_URLS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/js/vendors~main.chunk.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/offline.html',
];

// API routes that are safe to serve stale
const STALE_WHILE_REVALIDATE_ROUTES = ['/api/dashboard'];

// API routes that must always go to network (ML inference, mutations)
const NETWORK_ONLY_ROUTES = [
  '/api/detect-disease',
  '/api/predict-yield',
  '/api/irrigation',
  '/api/fertilizer',
];


// ─── Install: pre-cache the app shell ─────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => {
      // addAll fails atomically — if one file 404s the whole install fails.
      // Use individual add() calls so one bad chunk doesn't block the SW.
      return Promise.allSettled(
        SHELL_URLS.map(url => cache.add(url).catch(() => {}))
      );
    }).then(() => self.skipWaiting())
  );
});


// ─── Activate: clean up old caches ───────────────────────────────────────────

self.addEventListener('activate', event => {
  const CURRENT_CACHES = [SHELL_CACHE, API_CACHE, IMAGE_CACHE];
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => !CURRENT_CACHES.includes(key))
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});


// ─── Fetch: routing logic ─────────────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser-extension requests
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  const path = url.pathname;

  // 1. Network-only: ML inference endpoints (always need live server)
  if (NETWORK_ONLY_ROUTES.some(r => path.startsWith(r))) {
    event.respondWith(networkOnly(request));
    return;
  }

  // 2. Stale-while-revalidate: dashboard API (show cached, refresh in background)
  if (STALE_WHILE_REVALIDATE_ROUTES.some(r => path.startsWith(r))) {
    event.respondWith(staleWhileRevalidate(request, API_CACHE));
    return;
  }

  // 3. Cache-first: images (long-lived assets)
  if (request.destination === 'image') {
    event.respondWith(cacheFirst(request, IMAGE_CACHE, 7 * 24 * 60 * 60));
    return;
  }

  // 4. Cache-first: app shell (HTML, JS, CSS)
  event.respondWith(cacheFirstWithOfflineFallback(request));
});


// ─── Strategy implementations ─────────────────────────────────────────────────

async function networkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(
      JSON.stringify({ success: false, offline: true, error: 'You are offline. This feature requires a network connection.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  // Kick off a background network fetch regardless
  const networkFetch = fetch(request).then(response => {
    if (response.ok) {
      // Clone before consuming — a Response body can only be read once
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);

  // Return cached immediately if we have it, otherwise wait for network
  if (cached) {
    // Tag the cached response with a header so the UI can show "last updated" time
    const headers = new Headers(cached.headers);
    const cachedAt = headers.get('sw-cached-at') || new Date().toISOString();
    return cached;
  }

  return networkFetch || new Response(
    JSON.stringify({ success: false, offline: true, error: 'Dashboard data unavailable offline.' }),
    { status: 503, headers: { 'Content-Type': 'application/json' } }
  );
}

async function cacheFirst(request, cacheName, maxAgeSeconds = 86400) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    const cachedDate = new Date(cached.headers.get('date') || 0);
    const age = (Date.now() - cachedDate.getTime()) / 1000;
    if (age < maxAgeSeconds) return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    if (cached) return cached; // serve stale on network error
    throw new Error('Network error and no cached version available');
  }
}

async function cacheFirstWithOfflineFallback(request) {
  const cache = await caches.open(SHELL_CACHE);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch {
    // For navigation requests, serve the app shell (SPA catch-all)
    if (request.mode === 'navigate') {
      return cache.match('/index.html') || cache.match('/offline.html');
    }
    return new Response('Not available offline', { status: 503 });
  }
}


// ─── Background Sync: queue API calls made offline ───────────────────────────
// Requires the Background Sync API (Chrome/Edge). Falls back silently on iOS.

self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-requests') {
    event.waitUntil(flushPendingRequests());
  }
});

async function flushPendingRequests() {
  // In a real implementation, read queued requests from IndexedDB and replay them.
  // See src/utils/offlineQueue.js for the companion client-side code.
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
}


// ─── Push Notifications (soil moisture alerts, disease warnings) ──────────────

self.addEventListener('push', event => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'SasyaMind Alert', body: event.data.text(), type: 'info' };
  }

  const icon  = '/icons/icon-192x192.png';
  const badge = '/icons/badge-72x72.png';

  const options = {
    body:    payload.body,
    icon,
    badge,
    tag:     payload.type || 'general',   // replaces previous notification of same type
    renotify: true,
    data:    { url: payload.url || '/' },
    actions: [
      { action: 'open',    title: 'View details' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'SasyaMind', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const targetUrl = event.notification.data?.url || '/';
      const existing = clients.find(c => c.url.includes(targetUrl) && 'focus' in c);
      if (existing) return existing.focus();
      return self.clients.openWindow(targetUrl);
    })
  );
});
