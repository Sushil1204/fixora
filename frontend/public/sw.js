/* eslint-disable no-restricted-globals */
/**
 * Fixora service worker.
 *
 * Strategy:
 * - Precache the app shell ("/"), the offline page, manifest and icons.
 * - Navigations + App Router data requests: network first, cached copy as the
 *   fallback, then the app shell, then /offline.
 * - Hashed build output and fonts: cache first (immutable).
 * - Images, icons and the manifest: stale-while-revalidate.
 *
 * Bump VERSION to ship a fresh cache; the activate step deletes older ones.
 */
const VERSION = "v1";
const PRECACHE = `fixora-precache-${VERSION}`;
const RUNTIME = `fixora-runtime-${VERSION}`;
const RUNTIME_LIMIT = 80;
const OFFLINE_URL = "/offline";

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

/**
 * Cache a page and the build assets it references, so the first offline visit
 * still gets styled, hydrated output instead of a bare HTML shell.
 */
async function precachePage(cache, path, seen) {
  try {
    const response = await fetch(new Request(path, { cache: "reload" }));
    if (!response.ok) return;
    await cache.put(path, response.clone());

    const html = await response.text();
    const assets = new Set();
    for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
      const value = match[1];
      if (value.startsWith("/_next/static/")) assets.add(value);
    }

    await Promise.all(
      [...assets]
        .filter((asset) => !seen.has(asset))
        .map(async (asset) => {
          seen.add(asset);
          try {
            const assetResponse = await fetch(
              new Request(asset, { cache: "reload" }),
            );
            if (assetResponse.ok) await cache.put(asset, assetResponse);
          } catch {
            // Best effort; runtime caching fills any gaps later.
          }
        }),
    );
  } catch {
    // A failed precache page must not fail the whole install.
  }
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE);
      await Promise.all(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(new Request(url, { cache: "reload" }));
            if (response.ok) await cache.put(url, response);
          } catch {
            // A failed precache item must not fail the whole install.
          }
        }),
      );

      const seen = new Set(PRECACHE_URLS);
      await precachePage(cache, "/", seen);
      await precachePage(cache, OFFLINE_URL, seen);

      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("fixora-") &&
              key !== PRECACHE &&
              key !== RUNTIME,
          )
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Keep the runtime cache from growing without bound. */
async function trim(cacheName) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= RUNTIME_LIMIT) return;
  await Promise.all(
    keys
      .slice(0, keys.length - RUNTIME_LIMIT)
      .map((key) => cache.delete(key)),
  );
}

async function cacheFirst(request) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    await cache.put(request, response.clone());
    await trim(RUNTIME);
  }
  return response;
}

async function staleWhileRevalidate(request, event) {
  const cache = await caches.open(RUNTIME);
  const cached = await cache.match(request);

  const network = fetch(request)
    .then(async (response) => {
      if (response.ok) {
        await cache.put(request, response.clone());
        await trim(RUNTIME);
      }
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

async function networkFirst(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trim(RUNTIME);
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true }));
    if (cached) return cached;
    return Response.error();
  }
}

async function handleNavigation(request) {
  const cache = await caches.open(RUNTIME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      await trim(RUNTIME);
    }
    return response;
  } catch {
    const cached =
      (await cache.match(request)) ||
      (await cache.match(request, { ignoreSearch: true }));
    if (cached) return cached;

    // Unknown route while offline: show the home shell, then the offline page.
    return (
      (await caches.match("/")) ||
      (await caches.match(OFFLINE_URL)) ||
      Response.error()
    );
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/sw.js") return;

  if (request.mode === "navigate") {
    event.respondWith(handleNavigation(request));
    return;
  }

  // App Router soft navigations and prefetches
  if (
    request.headers.get("RSC") === "1" ||
    url.searchParams.has("_rsc")
  ) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Immutable build output and self-hosted fonts
  if (
    url.pathname.startsWith("/_next/static/") ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (
    request.destination === "image" ||
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest"
  ) {
    event.respondWith(staleWhileRevalidate(request, event));
  }
});
