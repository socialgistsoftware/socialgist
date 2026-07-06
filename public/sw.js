// ================= SOCIALGIST SERVICE WORKER =================

const CACHE_NAME = "socialgist-cache-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/logo.png",
  "/icon.png",
  "/assets/index.js",
  "/assets/index.css"
];

// ================= INSTALL =================
self.addEventListener("install", (event) => {
  self.skipWaiting();

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
});

// ================= ACTIVATE =a================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key);
        })
      )
    )
  );

  self.clients.claim();
});

// ================= FETCH (OFFLINE SUPPORT) =================
self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request)
          .then((response) => {
            const clone = response.clone();

            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, clone);
            });

            return response;
          })
          .catch(() => {
            if (request.mode === "navigate") {
              return caches.match("/");
            }
          })
      );
    })
  );
});

// ================= PUSH NOTIFICATION =================
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) { }

  const title = data.title || "SocialGist";
  const options = {
    body: data.body || "New notification",
    icon: "/logo.png",
    badge: "/logo.png",
    data: data
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// ================= NOTIFICATION CLICK =================
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const postId = event.notification.data?.postId;
  const url = postId ? `/post/${postId}` : "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});