const CACHE = "socialgist-v2";

const FILES = [
  "/",
  "/index.html",
  "/logo.png",
  "/icon.png"
];

// INSTALL
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key);
          }
        })
      )
    )
  );

  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;

          const copy = response.clone();

          caches.open(CACHE).then((cache) => {
            cache.put(event.request, copy);
          });

          return response;
        })
        .catch(() => {
          return caches.match("/");
        });
    })
  );
});

// PUSH
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch {}

  event.waitUntil(
    self.registration.showNotification(
      data.title || "SocialGist",
      {
        body: data.body || "You have a new notification",
        icon: "/logo.png",
        badge: "/logo.png",
        image: data.image || undefined,
        tag: data.tag || "socialgist",
        renotify: true,
        vibrate: [200, 100, 200],
        requireInteraction: false,
        data: {
          url: data.url || "/",
          postId: data.postId
        }
      }
    )
  );
});

// CLICK
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url =
    event.notification.data?.url ||
    (event.notification.data?.postId
      ? `/p/${event.notification.data.postId}`
      : "/");

  event.waitUntil(
    clients.matchAll({
      type: "window",
      includeUncontrolled: true
    }).then((clientsArr) => {
      for (const client of clientsArr) {
        if ("focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }

      return clients.openWindow(url);
    })
  );
});

// BACKGROUND SYNC
self.addEventListener("sync", (event) => {
  if (event.tag === "socialgist-sync") {
    event.waitUntil(Promise.resolve());
  }
});