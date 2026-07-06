importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDHiRrkPERGqgaCWTrUBSgXvrmaHM1YqBQ",
  authDomain: "socialgist-59506.firebaseapp.com",
  projectId: "socialgist-59506",
  storageBucket: "socialgist-59506.firebasestorage.app",
  messagingSenderId: "739927272825",
  appId: "1:739927272825:web:507d36a2702be82c8c13a8",
  measurementId: "G-QCZ2HNH2ER"
});

const messaging = firebase.messaging();

// 🔥 BACKGROUND NOTIFICATION HANDLER
messaging.onBackgroundMessage((payload) => {
  /* console.log("📩 Background message:", payload); */

  const title = payload.notification?.title || "Notification";
  const options = {
    body: payload.notification?.body || "",
    icon: "/icon.png",
    data: payload.data,
  };

  self.registration.showNotification(title, options);
});

// 🔥 CLICK HANDLER
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const postId = event.notification?.data?.postId;

  event.waitUntil(
    clients.openWindow(postId ? `/post/${postId}` : "/")
  );
});