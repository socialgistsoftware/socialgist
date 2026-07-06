import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Search,
  Bell,
  MessageCircle,
  Home,
  Users,
  Tv,
  Store,
  Moon,
  Sun,
  Plus,
  Flame,
  X,
  Type,
  Trash2,
  Palette,
  Smile,
  Sparkles,
  Image as ImageIcon,
  Wifi,
  WifiOff,
  Loader2,
  User,
  Settings,
  RefreshCcw,
  LogOut,
  ChevronDown,
  FileText
} from "lucide-react";

/* import {
  getUnreadMessagesCount,
} from "../pages/messages"; */

import { Rnd } from "react-rnd";
import EmojiPicker from "emoji-picker-react";

import { supabase } from "../configs/supbase";
import ProfileModal from "./profileModal";
import { useNavigate } from "react-router-dom";
import { FaSlack } from "react-icons/fa";
import toast from "react-hot-toast";


export default function TopNavbar({
  onPostCreated,
  onOpenMessages,
  onOpenNotif,
  darkMode,
  toggleDarkMode,
}) {

  const [me, setMe] =
    useState(null);

  const [showProfileMenu,
    setShowProfileMenu] =
    useState(false);

  const fileRef = useRef();
  const textRefs = useRef({});

  const [post, setPost] = useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [layers, setLayers] = useState([]);

  const [selected, setSelected] =
    useState(null);

  const [showEmoji, setShowEmoji] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [syncing, setSyncing] =
    useState(false);

  const [image, setImage] =
    useState(null);

  // REAL FILE FOR STORAGE
  const [imageFile, setImageFile] =
    useState(null);

  const [description, setDescription] =
    useState("");

  const [isOnline, setIsOnline] =
    useState(true);


  const [openProfile, setOpenProfile] =
    useState(false);

  const [selectedProfile, setSelectedProfile] =
    useState(null);

  const [posts, setPosts] =
    useState([]);

  const [category, setCategory] = useState("all");
  const [showCategory, setShowCategory] = useState(false);

  const [avatar, setAvatar] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false)


  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileId, setProfileId] = useState(null)
  const [followingIds, setFollowingIds] = useState([]);


  const [profileOpen, setProfileOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);



  const navigate = useNavigate();

  const openProfileModal = (post) => {
    setSelectedProfile(post);
    setOpenProfile(true);
  };





  // ================= COLORS =================

  const colors = [
    "#ffffff",
    "#ff3b30",
    "#34c759",
    "#0a84ff",
    "#ffd60a",
    "#bf5af2",
    "#ff9f0a",
    "#ff2d55",
    "#00ffd0",
  ];

  // ================= BACKGROUNDS =================

  const backgrounds = [
    "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",

    "linear-gradient(135deg,#f093fb 0%,#f5576c 100%)",

    "linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)",

    "linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)",

    "linear-gradient(135deg,#fa709a 0%,#fee140 100%)",

    "linear-gradient(135deg,#30cfd0 0%,#330867 100%)",

    "linear-gradient(135deg,#5ee7df 0%,#b490ca 100%)",

    "linear-gradient(135deg,#ff758c 0%,#ff7eb3 100%)",

    "linear-gradient(135deg,#141e30 0%,#243b55 100%)",
  ];

  const [background, setBackground] =
    useState(
      backgrounds[
      Math.floor(
        Math.random() *
        backgrounds.length
      )
      ]
    );



  useEffect(() => {

    const getUser =
      async () => {

        const { data } =
          await supabase.auth.getUser();

        setMe(
          data?.user || null
        );

        console.log(data)

      };

    getUser();

  }, []);

  const getUserProfile = async (userId) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;


      return {
        ...data,
        viewer_id: me?.id,
        isFollowing: followingIds.includes(userId),
      };

    } catch (err) {
      console.error("Profile fetch error:", err.message);
      return null;
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      const profile = await getUserProfile(me?.id);

      if (!profile) return;

      setProfileId(profile.id);
      console.log(profile);
    };

    if (me?.id) {
      loadProfile();
    }

  }, [me?.id]);



  useEffect(() => {

    const closeMenu = () => {

      setShowProfileMenu(
        false
      );

    };

    window.addEventListener(
      "click",
      closeMenu
    );

    return () =>

      window.removeEventListener(
        "click",
        closeMenu
      );

  }, []);

  useEffect(() => {
    const loadAvatar = async () => {
      const url = await getProfilePicture();

      if (url) {
        setAvatar(url);
      }
    };

    loadAvatar();
  }, []);

  const showWordLimitToast = () => {
    toast.error("Post text is limited to 50 words. Use description for longer content.");
  };

  useEffect(() => {
    if (
      showCreateModal &&
      layers.length === 0
    ) {
      addText();
      showWordLimitToast();
    } {

    }
  }, [showCreateModal]);




  useEffect(() => {
    if (!selected) return;

    const el = textRefs.current[selected];

    if (!el || typeof el.focus !== "function") return;

    el.focus();

    requestAnimationFrame(() => {
      const range = document.createRange();
      const sel = window.getSelection();

      range.selectNodeContents(el);
      range.collapse(false);

      sel.removeAllRanges();
      sel.addRange(range);
    });
  }, [selected]);

  // ================= NETWORK =================
  useEffect(() => {
    let interval;

    const updateStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // initial state
    updateStatus();

    // instant browser events (REAL-TIME PART)
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // backup checker (light, stable)
    interval = setInterval(() => {
      updateStatus();
    }, 3000);

    return () => {
      clearInterval(interval);
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, []);

  useEffect(() => {

    const loadPosts = async () => {

      const { data } =
        await supabase
          .from("posts")
          .select("*");

      if (data) {
        setPosts(data);
      }
    };

    loadPosts();

  }, []);

  const openUserProfile = async (userId) => {
    try {
      setProfileOpen(true);
      /*   setProfileData(null); */

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();


      if (error) throw error;

      setProfileData({
        ...data,
        viewer_id: me?.id,
        isFollowing: followingIds.includes(userId),
      });

    } catch (err) {
      console.log("Profile load error:", err);
    }
  };


  const toggleFollow = async (profile) => {
    if (!me?.id || !profile?.id) return;

    const alreadyFollowing = followingIds.includes(profile.id);

    try {
      if (alreadyFollowing) {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", me.id)
          .eq("following_id", profile.id);

        if (error) throw error;

        setFollowingIds(prev =>
          prev.filter(id => id !== profile.id)
        );

        // UPDATE MODAL COUNT IMMEDIATELY
        setProfileData(prev =>
          prev?.id === profile.id
            ? {
              ...prev,
              followers_count: Math.max(
                (prev.followers_count || 0) - 1,
                0
              ),
            }
            : prev
        );

        await supabase.rpc("decrease_followers", {
          target_id: profile.id,
          my_id: me.id,
        });

      } else {
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: me.id,
            following_id: profile.id,
          });

        if (error) throw error;

        setFollowingIds(prev => [...prev, profile.id]);

        // UPDATE MODAL COUNT IMMEDIATELY
        setProfileData(prev =>
          prev?.id === profile.id
            ? {
              ...prev,
              followers_count: (prev.followers_count || 0) + 1,
            }
            : prev
        );

        await supabase.rpc("increase_followers", {
          target_id: profile.id,
          my_id: me.id,
        });
      }
    } catch (err) {
      console.log("FOLLOW ERROR", err.message);
    }
  };

  const searchUsers = async (text) => {
    const value = text.trim();

    setQuery(value);

    if (!value) {
      setUsers([]);
      return;
    }

    setLoadingSearch(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url")
      .or(`username.ilike.%${value}%,full_name.ilike.%${value}%`)
      .limit(10);

    if (error) {
      console.error("Search error:", error);
      setUsers([]);
    } else {
      setUsers(data || []);
    }

    setLoadingSearch(false);
  };


  const getProfilePicture = async () => {
    const { data: authData } = await supabase.auth.getUser();

    const userId = authData?.user?.id;

    if (!userId) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single();

    console.log(data)

    if (error) {
      console.error(error);
      return null;
    }

    return data?.avatar_url;
  };

  const loadFollowing = async () => {
    if (!me?.id) return;

    const { data, error } = await supabase
      .from("follows")
      .select("following_id")
      .eq("follower_id", me.id);

    if (error) {
      console.log(error);
      return;
    }


    setFollowingIds(
      data.map(item => item.following_id)
    );
  };

  useEffect(() => {
    if (me?.id) {
      loadFollowing();
    }
  }, [me?.id]);


  console.log(followingIds.includes(profileData))

  // ================= ICON BTN =================

  const iconBtn =
    "relative flex items-center justify-center h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-[#3A3B3C] dark:hover:bg-[#4E4F50] text-gray-700 dark:text-gray-200 transition shrink-0 active:scale-95";

  const badge =
    "absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] font-bold text-white bg-purple-600 rounded-full";

  // ================= IMAGE UPLOAD =================

  const compressImage = (file) =>
    new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        const canvas =
          document.createElement("canvas");

        const MAX_WIDTH = 1080;

        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH) {
          height =
            (height * MAX_WIDTH) /
            width;

          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx =
          canvas.getContext("2d");

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        canvas.toBlob(
          (blob) => {
            resolve(
              new File(
                [blob],
                file.name,
                {
                  type:
                    "image/jpeg",
                }
              )
            );
          },
          "image/jpeg",
          0.45
        );
      };

      img.src =
        URL.createObjectURL(file);
    });

  const normalizeImage = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => (img.src = e.target.result);
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        const MAX_SIZE = 1200;

        let w = img.width;
        let h = img.height;

        if (w > h && w > MAX_SIZE) {
          h = (h * MAX_SIZE) / w;
          w = MAX_SIZE;
        } else if (h > MAX_SIZE) {
          w = (w * MAX_SIZE) / h;
          h = MAX_SIZE;
        }

        canvas.width = w;
        canvas.height = h;

        ctx.drawImage(img, 0, 0, w, h);

        canvas.toBlob((blob) => {
          resolve(
            new File([blob], file.name.replace(/\..+$/, ".jpg"), {
              type: "image/jpeg",
            })
          );
        }, "image/jpeg", 0.8);
      };
    });
  };


  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // cleanup old preview (IMPORTANT for mobile)
      if (image?.startsWith("blob:")) {
        URL.revokeObjectURL(image);
      }

      // 1. INSTANT PREVIEW (WhatsApp feel)
      const previewUrl = URL.createObjectURL(file);
      setImage(previewUrl);

      // 2. SHOW LOADING STATE
      setUploadingImage?.(true);

      console.log(
        "Original size:",
        (file.size / 1024 / 1024).toFixed(2),
        "MB"
      );

      // 3. FIX MOBILE IMAGE ORIENTATION + HEIC ISSUE
      const normalizedFile = await normalizeImage(file);

      // 4. COMPRESS (async safe)
      const compressed = await compressImage(normalizedFile);

      console.log(
        "Compressed size:",
        (compressed.size / 1024).toFixed(0),
        "KB"
      );

      // 5. UPDATE FINAL FILE
      setImageFile(compressed);

      // 6. FINAL PREVIEW (replace raw image)
      const finalPreview = URL.createObjectURL(compressed);

      // cleanup previous preview again
      URL.revokeObjectURL(previewUrl);

      setImage(finalPreview);
    } catch (err) {
      console.log("Upload error:", err);
    } finally {
      setUploadingImage?.(false);
    }
  };

  // ================= ADD TEXT =================

  const addText = () => {
    const id = Date.now();

    setLayers((prev) => [
      ...prev,
      {
        id,
        type: "text",
        text: "",
        x: 0,
        y: 0,
        color: "#ffffff",
        fontSize: 25,
        width: window.innerWidth - 40,
      },
    ]);

    setSelected(id);

    setTimeout(() => {
      const el = document.querySelector(
        `[data-text-id="${id}"]`
      );

      if (el) {
        el.focus();
      }
    }, 100);
  };

  // ================= UPDATE LAYER =================

  const updateLayer = (
    id,
    changes
  ) => {
    setLayers((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
            ...l,
            ...changes,
          }
          : l
      )
    );
  };

  // ================= DELETE LAYER =================

  const deleteLayer = () => {
    if (!selected) return;

    setLoading(false);

    setLayers((prev) =>
      prev.filter(
        (l) => l.id !== selected
      )
    );

    setSelected(null);
  };

  // ================= RANDOM BG =================

  const randomizeBackground = () => {
    const random =
      backgrounds[
      Math.floor(
        Math.random() *
        backgrounds.length
      )
      ];

    setBackground(random);
  };

  // ================= RESET =================

  const resetEditor = () => {
    setLayers([]);

    setSelected(null);

    setImage(null);

    setDescription("");

    setShowCreateModal(false);

    setLoading(false);

    setBackground(
      backgrounds[
      Math.floor(
        Math.random() *
        backgrounds.length
      )
      ]
    );
  };

  // ================= EMOJI =================

  const selectedLayer = layers.find(
    (l) => l.id === selected
  );

  const addEmoji = (emojiData) => {
    if (!selectedLayer) return;

    updateLayer(selectedLayer.id, {
      text:
        selectedLayer.text +
        emojiData.emoji,
    });
  };

  const incrementPostCount = async (userId) => {
    if (!userId) return;

    try {
      // 1. get current count
      const { data, error: fetchError } = await supabase
        .from("profiles")
        .select("posts_count")
        .eq("id", userId)
        .single();

      if (fetchError) {
        console.error("Fetch error:", fetchError.message);
        return;
      }

      const current = data?.posts_count || 0;

      console.log("old:", current);

      // 2. update with new value
      const { data: updatedData, error: updateError } = await supabase
        .from("profiles")
        .update({
          posts_count: current + 1,
        })
        .eq("id", userId)
        .select(); // optional: returns updated row

      console.log(updatedData)

      if (updateError) {
        console.error("Update error:", updateError.message);
        return;
      }

      console.log("updated:", updatedData);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
  };

  // ================= CREATE POST =================
  const createPost = async () => {
    if (layers.length === 0 && !image && !description.trim()) {
      return;
    }

    try {
      setLoading(true);

      const { data: userData, error: userError } =
        await supabase.auth.getUser();

      if (userError || !userData?.user) {
        setLoading(false);
        return;
      }

      const user = userData.user;

      let uploadedImage = null;

      // ================= UPLOAD IMAGE =================
      if (imageFile && isOnline) {
        const fileExt = imageFile.name.split(".").pop();

        const fileName = `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("post-images")
          .upload(fileName, imageFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          console.log(uploadError);
          alert(uploadError.message);
          setLoading(false);
          return;
        }

        const { data: publicData } = supabase.storage
          .from("post-images")
          .getPublicUrl(fileName);

        uploadedImage = publicData.publicUrl;
      }

      const profileImage = await getProfilePicture();

      const payload = {
        user_id: user.id,
        profile_name: user.user_metadata?.full_name || "Anonymous",
        profile_image: profileImage,
        type: image ? "image_post" : "text_post",
        description,
        image: uploadedImage,
        category,
        content: {
          background,
          layers,
        },
      };

      // ================= INSERT POST =================
      const { data: postData, error } = await supabase
        .from("posts")
        .insert(payload)
        .select()
        .single();

      if (error) {
        console.log(error);
        alert(error.message);
        setLoading(false);
        return;
      }

      // ================= UPDATE COUNT =================
      await incrementPostCount(user.id);

      console.log("POST CREATED SUCCESSFULLY");

      // ================= SEND GLOBAL NOTIFICATION =================
      const sendGeneralPostNotification = async (postId, senderName) => {
        try {
          const { data, error } = await supabase.functions.invoke(
            "general-post",
            {
              body: {
                sender: senderName || "Someone",
                postId,
              },
            }
          );

          if (error) {
            console.log("❌ GENERAL POST FCM ERROR:", error);
          } else {
            console.log("✅ GENERAL POST NOTIFICATION SENT:", data);
          }
        } catch (err) {
          console.log("❌ NETWORK ERROR:", err);
        }
      };

      await sendGeneralPostNotification(
        postData.id,
        user.user_metadata?.full_name
      );

      // ================= CLEANUP =================
      setImage(null);
      setImageFile(null);

      if (onPostCreated) {
        onPostCreated();
      }

      resetEditor();
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  /*   async function countUnreadMessages() {
      const { data } =
        await supabase.auth.getUser();
      console.log(data);
      const count = await getUnreadMessagesCount(me.id);
      console.log(count);
    }
  
    countUnreadMessages(); */




  return (
    <>
      <ProfileModal
        open={openProfile}
        onClose={() =>
          setOpenProfile(false)
        }
        profile={selectedProfile}
      />
      {/* ================= NAVBAR ================= */}

      <header className="sticky top-0 z-50 border-b border-gray-200/70 bg-white/95 backdrop-blur-xl dark:border-[#2d2f31] dark:bg-[#18191A]/95">

        <div className="mx-auto flex h-16 items-center justify-between px-4">

          {/* LEFT - PROFILE */}
          <div
            className="relative cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowProfileMenu((prev) => !prev);
            }}
          >
            <img
              src={avatar || "https://www.gravatar.com/avatar/?d=mp&s=200"}
              alt="Profile"
              className="h-11 w-11 rounded-full object-cover ring-2 ring-purple-500 transition active:scale-95"
            />
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          </div>

          {/* CENTER - LOGO */}
          <div className="flex flex-col items-center">
            <h1 className="text-xl md:text-2xl font-black bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent">
              SocialGist
            </h1>
            <p className="hidden md:block text-[11px] text-gray-500">
              Campus Social Network
            </p>
          </div>

          {/* RIGHT - ICONS (MOBILE + DESKTOP SAME) */}
          <div className="flex items-center gap-2">

            {/* SEARCH */}
            <button onClick={() => setOpenSearch(true)} className={iconBtn}>
              <Search size={18} />
            </button>

            {/* CREATE (+ PINK BUTTON ALWAYS VISIBLE) */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="h-11 w-11 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 text-white flex items-center justify-center shadow-lg active:scale-95"
            >
              <Plus size={20} />
            </button>

            {/* MESSAGES */}
            <button onClick={() => navigate("/messages")} className={iconBtn}>
              <MessageCircle size={18} />
            </button>

            {/* DARK MODE */}
          {/*   <button onClick={toggleDarkMode} className={iconBtn}>
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button> */}

          </div>

        </div>
      </header>

      {showProfileMenu && (
        <>
          {/* BACKDROP (prevents clicking + keeps it stable) */}
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setShowProfileMenu(false)}
          />

          {/* MENU */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="fixed top-16 left-4 w-72 rounded-3xl bg-white dark:bg-[#18191a] shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden z-[99999]"
          >
            {/* PROFILE */}
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/profile")
              }}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <div className="h-11 w-11 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <User size={20} />
              </div>

              <div className="text-left">
                <p className="font-bold dark:text-white">Profile</p>
                <p className="text-xs text-gray-500">View your profile</p>
              </div>
            </button>

            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/mypost");
              }}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-100 dark:hover:bg-white/5 transition dark:text-white"
            >
              <FileText size={20} />
              <span>My Posts</span>
            </button>

            {/* SETTINGS */}
            <button
              onClick={() => {
                setShowProfileMenu(false);
                navigate("/settings")
              }}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-100 dark:hover:bg-white/5 transition dark:text-white"
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>

            {/* SWITCH ACCOUNT */}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                sessionStorage.clear();
                window.location.reload();
                navigate("/login");
              }}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-100 dark:hover:bg-white/5 transition dark:text-white"
            >
              <RefreshCcw size={20} />
              <span>Switch Account</span>
            </button>

            {/* LOGOUT */}
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                sessionStorage.clear();
                window.location.reload();
                navigate("/login");
              }}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 transition"
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </>
      )}

      {/* ================= CREATE MODAL ================= */}

      {showCreateModal && (
        <div className="fixed inset-0 z-[999] bg-black flex flex-col overflow-visible">

          {/* TOP */}

          <div className="h-16 px-4 flex items-center justify-between border-b border-white/10 bg-black/40 backdrop-blur-xl">

            <button
              onClick={() =>
                setShowCreateModal(
                  false
                )
              }
              className="text-white"
            >
              <X size={28} />
            </button>

            <h1 className="text-white font-semibold text-lg">
              Create Post
            </h1>

            <button
              onClick={
                createPost
              }
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 px-5 py-2.5 rounded-full text-white text-sm font-bold shadow-2xl disabled:opacity-50"
            >

              <div className="flex items-center gap-2">

                {loading ? (
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  <Sparkles
                    size={16}
                  />
                )}

                {loading
                  ? "Posting..."
                  : "Post"}

              </div>

            </button>

          </div>

          {/* DESCRIPTION */}

          <div className="px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl">

            <textarea
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              placeholder="Describe your post?"
              rows={2}
              className="w-full bg-transparent text-white placeholder:text-gray-400 outline-none resize-none text-base"
            />

          </div>

          {/* CATEGORY SELECT (PROFESSIONAL ICON STYLE) */}
          <div className="px-4 py-3 border-b border-white/10 bg-black/30 backdrop-blur-xl relative z-50">

            <div className="flex items-center justify-between">

              <p className="text-xs text-gray-400">
                Post Category
              </p>

              <button
                onClick={() => setShowCategory((p) => !p)}
                className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 text-white text-sm active:scale-95 transition"
              >
                <Sparkles size={14} />

                <span className="capitalize font-semibold">
                  {category}
                </span>

                <ChevronDown size={14} />
              </button>

            </div>

            {showCategory && (
              <div className="absolute left-4 right-4 mt-3 bg-black border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[9999]">

                {[
                  { label: "All", icon: "🌐" },
                  { label: "Sports", icon: "🏀" },
                  { label: "Memes", icon: "😂" },
                  { label: "Dating", icon: "❤️" },
                  { label: "Trading", icon: "📈" },
                  { label: "Academics", icon: "📚" },
                  { label: "News", icon: "📚" },
                  { label: "Politics", icon: "📚" },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      setCategory(item.label.toLowerCase());
                      setShowCategory(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-white hover:bg-white/10 transition"
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="capitalize">{item.label}</span>
                  </button>
                ))}

              </div>
            )}
          </div>

          {/* CANVAS */}

          <div
            className="flex-1 relative overflow-hidden"
            onClick={(e) => {
              if (
                e.target === e.currentTarget &&
                layers.length === 0
              ) {
                addText();
              }
            }}
          >
            {/* BG */}

            <div
              className="absolute inset-0"
              style={{
                background,
              }}
            />

            {/* IMAGE */}

            {image && (
              <img
                src={image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* IMAGE OVERLAY */}

            {image && (
              <div className="absolute inset-0 bg-black/20" />
            )}

            {/* TEXT LAYERS */}

            {layers.map((layer) => (
              <Rnd
                ref={(el) => (textRefs.current[layer.id] = el)}
                key={layer.id}
                bounds="parent"
                enableResizing={false}
                disableDragging={selected === layer.id}
                position={{
                  x: layer.x,
                  y: layer.y,
                }}
                onDragStop={(e, d) => {
                  updateLayer(layer.id, {
                    x: d.x,
                    y: d.y,
                  });
                }}
                onMouseDown={() => {
                  setSelected(layer.id);
                }}
              >
                <div
                  contentEditable
                  suppressContentEditableWarning
                  spellCheck={false}
                  data-text-id={layer.id}
                  onClick={(e) => {
                    setSelected(layer.id);
                    e.currentTarget.focus();
                  }}
                  onFocus={() => {
                    setSelected(layer.id);
                  }}
                  onBlur={(e) => {
                    let text = e.currentTarget.innerText;

                    const words = text.trim().split(/\s+/).filter(Boolean);

                    if (words.length > 50) {
                      text = words.slice(0, 50).join(" ");

                      e.currentTarget.innerText = text;
                    }

                    updateLayer(layer.id, { text });
                  }}
                  onKeyDown={(e) => {
                    const text = e.currentTarget.innerText;
                    const words = text.trim().split(/\s+/).filter(Boolean);

                    // allow backspace/delete always
                    if (e.key === "Backspace" || e.key === "Delete") return;

                    if (words.length >= 50) {
                      e.preventDefault(); // 🚫 BLOCK typing
                    }
                  }}

                  style={{
                    minWidth: 250,
                    minHeight: 50,
                    color: layer.color,
                    fontSize: layer.fontSize,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                    outline: "none",
                    caretColor: "#fff",
                    lineHeight: 1.1,
                    cursor: "text",
                    userSelect: "text",
                    WebkitUserSelect: "text",
                    touchAction: "manipulation",
                    padding: "4px 8px",
                    textAlign: "center",
                  }}
                >
                  {layer.text}
                </div>
              </Rnd>
            ))}


            {/* EMOJI PICKER */}

            {showEmoji && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50">
                <EmojiPicker
                  theme="dark"
                  onEmojiClick={addEmoji}
                />
              </div>
            )}
          </div>
          {/* TOOLBAR */}

          <div className="h-24 bg-[#0f0f10]/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-4 pb-3 overflow-x-auto">

            {/* TEXT */}

            <button
              onClick={() => {
                if (layers.length === 0) {
                  addText();
                } else {
                  const lastLayer =
                    layers[layers.length - 1];

                  setSelected(lastLayer.id);

                  const el =
                    document.querySelector(
                      `[data-text-id="${lastLayer.id}"]`
                    );

                  el?.focus();
                }
              }}
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center">

                <Type size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Text
              </span>

            </button>

            {/* IMAGE */}

            <button
              onClick={() =>
                fileRef.current.click()
              }
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center">

                <ImageIcon
                  size={20}
                />

              </div>

              <span className="text-[11px] mt-1">
                Photo
              </span>

            </button>

            <input
              ref={fileRef}
              type="file"
              hidden
              accept="image/*"
              onChange={uploadImage}
            />

            {/* EMOJI */}

            <button
              onClick={() =>
                setShowEmoji(
                  (p) => !p
                )
              }
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-yellow-500/20 flex items-center justify-center">

                <Smile size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Emoji
              </span>

            </button>

            {/* COLOR */}

            <button
              onClick={() => {
                if (
                  !selectedLayer
                )
                  return;

                const randomColor =
                  colors[
                  Math.floor(
                    Math.random() *
                    colors.length
                  )
                  ];

                updateLayer(
                  selectedLayer.id,
                  {
                    color:
                      randomColor,
                  }
                );
              }}
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-pink-500/20 flex items-center justify-center">

                <Palette size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Color
              </span>

            </button>

            {/* BG */}

            <button
              onClick={
                randomizeBackground
              }
              className="flex flex-col items-center text-white shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center">

                <Sparkles
                  size={20}
                />

              </div>

              <span className="text-[11px] mt-1">
                BG
              </span>

            </button>

            {/* DELETE */}

            <button
              onClick={deleteLayer}
              className="flex flex-col items-center text-red-500 shrink-0"
            >

              <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">

                <Trash2 size={20} />

              </div>

              <span className="text-[11px] mt-1">
                Delete
              </span>

            </button>

          </div>



        </div >
      )
      }

      {openSearch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-start pt-20">

          <div className="bg-white w-[90%] max-w-md rounded-xl shadow-lg p-3">

            {/* Search input */}
            <input
              autoFocus
              value={query}
              onChange={(e) => searchUsers(e.target.value)}
              placeholder="Search users..."
              className="w-full p-3 border rounded-lg outline-none"
            />

            {/* Results */}
            <div className="mt-3 max-h-72 overflow-y-auto">
              {loadingSearch && (
                <p className="text-sm text-gray-500">Searching...</p>
              )}

              {!loading && users.length === 0 && query && (
                <p className="text-sm text-gray-400">No users found</p>
              )}

              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded cursor-pointer"
                  onClick={() => openUserProfile(user.id)}
                >
                  <img
                    src={user.avatar_url || "https://www.gravatar.com/avatar/?d=mp&s=200"}
                    className="w-10 h-10 rounded-full object-cover"
                  />

                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-gray-500">@{user.username}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Close button */}
            <button
              onClick={() => setOpenSearch(false)}
              className="mt-3 w-full text-sm text-gray-600"
            >
              Close
            </button>

          </div>
        </div>
      )}



      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        profile={profileData}
        isFollowing={
          profileData
            ? followingIds.includes(profileData.id)
            : false
        }
        onFollowToggle={toggleFollow}
        currentUserProfileId={profileId}
      />


    </>
  );


  /* ================= NAV BUTTON ================= */

  function NavButton({
    icon,
    label,
    active,
  }) {
    return (
      <button
        className={`flex flex-col items-center justify-center h-14 min-w-[90px] px-4 rounded-2xl transition ${active
          ? "text-purple-600"
          : "text-gray-500 hover:bg-gray-100 dark:hover:bg-[#3A3B3C]"
          }`}
      >

        <div className="h-6 w-6 flex items-center justify-center">
          {icon}
        </div>

        <span className="text-xs mt-1">
          {label}
        </span>

      </button>
    );
  }
}

