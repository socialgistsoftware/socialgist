import { useEffect } from "react";
import OneSignal from "react-onesignal";
import { supabase } from "../configs/supbase";

export default function OneSignalProvider() {
  useEffect(() => {
    let authSubscription;

    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: "436dbd52-38d8-4404-8965-cfe40799996e",
          allowLocalhostAsSecureOrigin: true,
        });

        // Link already logged-in user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await OneSignal.login(user.id);
          console.log("OneSignal linked:", user.id);
        }

        // Listen for future login/logout events
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            try {
              if (session?.user?.id) {
                await OneSignal.login(session.user.id);
                console.log("OneSignal linked:", session.user.id);
              } else {
                await OneSignal.logout();
                console.log("OneSignal logged out");
              }
            } catch (err) {
              console.error("OneSignal auth sync error:", err);
            }
          }
        );

        authSubscription = data.subscription;
      } catch (err) {
        console.error("OneSignal init error:", err);
      }
    };

    initOneSignal();

    return () => {
      authSubscription?.unsubscribe();
    };
  }, []);

  return null;
}