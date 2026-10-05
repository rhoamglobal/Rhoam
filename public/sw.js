// Rhoam service worker.
//
// Deliberately conservative about what's cached: this app handles
// payments (Paystack), auth, and unlock flows, and none of that should
// ever be served stale. Two caching rules only:
//   1. Static assets (icons, Next's hashed build output) — cache-first.
//      These are either immutable (hashed filenames) or change rarely
//      enough that cache-first is the right tradeoff.
//   2. GET /api/property requests — network-first, falling back to
//      cache when offline. This is what "browse recently viewed
//      listings offline" means in practice: whatever property data was
//      already fetched stays available, nothing new can be unlocked
//      offline anyway (that needs a live payment flow).
// Everything else under /api/ (auth, unlock, payments, saves) bypasses
// the service worker entirely via the fetch handler's early return.

const STATIC_CACHE = "rhoam-static-v1";
const PROPERTY_CACHE = "rhoam-property-data-v1";

const PRECACHE_URLS = [
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  "/offline.html",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== PROPERTY_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/apple-touch-icon.png" ||
    url.pathname.startsWith("/favicon-") ||
    /\.(png|jpg|jpeg|svg|webp|ico)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Every other /api/ route (auth, unlock, payments, saves, admin)
  // bypasses the service worker entirely — no caching, no offline
  // fallback, straight to the network every time.
  if (url.pathname.startsWith("/api/") && url.pathname !== "/api/property") {
    return;
  }

  if (url.pathname === "/api/property") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(PROPERTY_CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const copy = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy));
          return response;
        });
      })
    );
    return;
  }

  // Page navigations: network-first so content stays fresh, falling
  // back to a plain offline page only when there's truly no connection
  // and nothing cached for this URL.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(
        () => caches.match(request).then((cached) => cached || caches.match("/offline.html"))
      )
    );
  }
});
