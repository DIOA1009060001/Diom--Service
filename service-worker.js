const CACHE_NAME = "diom-service-v1";
const APP_FILES = [
  "./",
  "./index.html",
  "./manifest.json",
  "./offline.html",
  "./icon-192.png",
  "./icon-512.png",
  "./apple-touch-icon.png",
  "./logo-diom-service.png.PNG",
  "./affiche-chaussures.png.PNG",
  "./visuel-reseaux-sociaux-diom-service..PNG"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(APP_FILES.map((file) => cache.add(file)));
      return self.skipWaiting();
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request).then((response) => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (request.mode === "navigate") {
        return (await caches.match("./offline.html")) || Response.error();
      }
      return Response.error();
    })
  );
});
