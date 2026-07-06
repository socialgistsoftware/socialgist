import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ================= RENDER APP =================
createRoot(document.getElementById("root")).render(<App />);

// ================= SERVICE WORKER REGISTRATION =================
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("✅ SW registered:", registration);
      })
      .catch((error) => {
        console.log("❌ SW registration failed:", error);
      });
  });
}