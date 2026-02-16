/* eslint-disable no-restricted-globals */

const CACHE_NAME = "smash-dashboard-v2";
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  "/dashboard",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png",
  "/apple-touch-icon.png",
  OFFLINE_URL,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => (key === CACHE_NAME ? undefined : caches.delete(key)))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      if (request.mode === "navigate") {
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.ok) {
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch {
          const cachedPage = await cache.match(request, { ignoreSearch: true });
          return cachedPage ?? (await cache.match(OFFLINE_URL)) ?? new Response("Offline", { status: 503 });
        }
      }

      const cached = await cache.match(request, { ignoreSearch: true });
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => undefined);

      // Never return HTML offline fallback for JS/CSS/image requests.
      // If the network is down and no cached asset exists, let the request fail naturally.
      return cached ?? (await fetchPromise) ?? Response.error();
    })()
  );
});
