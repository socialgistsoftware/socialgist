import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./configs/supbase";

// Pages
import WelcomePage from "./pages/welcome";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import HomeFeedPage from "./pages/feed";
import TopNavbar from "./pages/navbar";
import Messages from "./pages/messages";
import ProfilePage from "./pages/profile";
import PublicProfilePage from "./pages/publicProfile";
import SettingsPage from "./pages/settings";
import PostGate from "./pages/postGate";
import PostPage from "./pages/post";
import MyPosts from "./pages/mypost";

import { Toaster } from "react-hot-toast";
import { initNotifications } from "../src/pages/notifications";
import SinglePost from "./pages/singlepost";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [me, setMe] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };


  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);



  // ================= SPLASH =================
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  // ================= AUTH =================
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => authListener.subscription.unsubscribe();
  }, []);

  // ================= USER =================
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setMe(data?.user || null);
    };

    getUser();
  }, []);

  // ================= NOTIFICATIONS =================
  useEffect(() => {
    if (me?.id) {
      initNotifications(me.id);
    }
  }, [me]);

  // ================= SERVICE WORKER (FIXED) =================
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => console.log("SW registered:", reg))
        .catch((err) => console.log("SW error:", err));
    }
  }, []);

  // ================= SPLASH =================
  if (showSplash || loading) {
    return (

      <div className="h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center">
          <img src="/icon.png" className="w-24 h-24 animate-pulse" />
          <h1 className="mt-4 text-2xl font-black text-purple-700">
            SocialGist
          </h1>
        </div>
      </div>
    
    );
  }

  // ================= ROUTES =================
  return (
    <BrowserRouter>
      <Routes>
        {/* ROOT */}
        <Route
          path="/"
          element={session ? <Navigate to="/feed" /> : <WelcomePage />}
        />



        {/* AUTH */}
        <Route
          path="/login"
          element={session ? <Navigate to="/feed" /> : <LoginPage />}
        />

        <Route
          path="/signup"
          element={session ? <Navigate to="/feed" /> : <SignupPage />}
        />

        {/* FEED */}
        <Route
          path="/feed"
          element={
            session ? (
              <>
                <TopNavbar darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode} />
                <HomeFeedPage />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* MESSAGES */}
        <Route
          path="/messages"
          element={session ? <Messages /> : <Navigate to="/" />}
        />



        {/* MY POSTS */}
        <Route
          path="/mypost"
          element={
            session ? (
              <>
                <Toaster position="top-right" />
                <MyPosts user={session.user} />
              </>
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* PROFILES */}
        <Route path="/profile/:id" element={<PublicProfilePage />} />

        <Route
          path="/profile"
          element={session ? <ProfilePage /> : <Navigate to="/" />}
        />

        {/* SETTINGS */}
        <Route
          path="/settings"
          element={session ? <SettingsPage /> : <Navigate to="/" />}
        />

        {/* POSTS */}
        <Route path="/post/:id" element={<SinglePost />} />
        <Route path="/p/:id" element={<PostGate />} />

        {/* FALLBACK */}
        <Route
          path="*"
          element={<Navigate to={session ? "/feed" : "/"} />}
        />
      </Routes>
    </BrowserRouter>
  );
}