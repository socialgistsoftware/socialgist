import { getToken, onMessage } from "firebase/messaging";
import { messaging } from "./firebase.jsx";
import { supabase } from "../configs/supbase.js";

export async function initNotifications(userId) {
  try {
    if (!userId) return;

    // ================= REQUEST PERMISSION =================
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("❌ Notification permission denied");
      return;
    }

    // ================= REGISTER SERVICE WORKER =================
    if ("serviceWorker" in navigator) {
      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
    }

    // ================= GET FCM TOKEN =================
    const token = await getToken(messaging, {
      vapidKey:
        "BGPY2QLlkwm1ydqxbiCZpWhbbDsE5uw-q2HyQFT69kTCGAq-Z6Vpv0GjUAtj0XoTRznky0arSiJgulKriU5R_1U",
    });

    if (!token) {
      console.log("❌ No FCM token generated");
      return;
    }

    console.log("🔥 FCM Token:", token);

    // ================= SAVE TOKEN =================
    await supabase
      .from("profiles")
      .upsert(
        { id: userId, fcm_token: token },
        { onConflict: "id" }
      );

    // ================= FOREGROUND NOTIFICATIONS =================
    onMessage(messaging, (payload) => {
      console.log("📩 Foreground message:", payload);

      const title =
        payload.notification?.title || "SocialGist";

      const body =
        payload.notification?.body || "";

      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon.png",
          data: payload.data,
        });
      }
    });
  } catch (error) {
    console.error("❌ Notification setup failed:", error);
  }
}