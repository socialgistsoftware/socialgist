// ================= SERVICE WORKER (CLEAN PWA VERSION) =================

// Install
self.addEventListener("install", (event) => {
  console.log("Service Worker installed");
  self.skipWaiting();
});

// Activate
self.addEventListener("activate", (event) => {
  console.log("Service Worker activated");
  event.waitUntil(self.clients.claim());
});

// ================= PUSH NOTIFICATION =================
self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    console.log("Push parse error", e);
  }

  const title = data.title || "SocialGist";
  const options = {
    body: data.body || "New notification",
    icon: "/logo.png",
    badge: "/logo.png",
    data: data,
    requireInteraction: false
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

// ================= SIMPLE CACHE =================
const CACHE_NAME = "socialgist-cache-v1";

self.addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});