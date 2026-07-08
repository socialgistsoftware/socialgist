import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../configs/supbase";
import {
    ArrowLeft,
    Trash2,
    Rocket,
    Globe,
    Heart
} from "lucide-react";
import toast from "react-hot-toast";

export default function PostPage() {
    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [me, setMe] = useState(null);
    const [profileImages, setProfileImages] = useState({});

    const [deleteTarget, setDeleteTarget] = useState(null); // 🔥 modal state

    // TIME FORMAT
    const formatTimeAgo = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        const now = new Date();

        const diff = Math.floor((now - date) / 1000);

        const minute = 60;
        const hour = 3600;
        const day = 86400;

        if (diff < minute) return "Just now";
        if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
        if (diff < day) return `${Math.floor(diff / hour)}h ago`;
        return `${Math.floor(diff / day)}d ago`;
    };

    // GET USER
    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setMe(data?.user?.id || null);
        };

        getUser();
    }, []);

    // LOAD POSTS
    useEffect(() => {
        if (!me) return;
        loadPosts();
    }, [me]);

    const loadPosts = async () => {
        try {
            setLoading(true);

            const { data, error } = await supabase
                .from("posts")
                .select("*")
                .eq("user_id", me)
                .order("created_at", { ascending: false });

            if (error) throw error;

            setPosts(data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    // DELETE POST
    const confirmDelete = async () => {
        if (!deleteTarget) return;

        const loadingToast = toast.loading("Deleting post...");

        try {
            // Get the full post
            const { data: postData, error: fetchError } = await supabase
                .from("posts")
                .select("*")
                .eq("id", deleteTarget)
                .single();

            if (fetchError) throw fetchError;

            // Delete image from Storage
            if (postData.image) {
                try {
                    const imagePath = postData.image.split("/post-images/")[1];

                    if (imagePath) {
                        const { error: storageError } = await supabase.storage
                            .from("post-images")
                            .remove([imagePath]);

                        if (storageError) {
                            console.log("Storage delete error:", storageError);
                        }
                    }
                } catch (err) {
                    console.log("Storage delete failed:", err);
                }
            }

            // Delete post
            const { error: deleteError } = await supabase
                .from("posts")
                .delete()
                .eq("id", deleteTarget);

            if (deleteError) throw deleteError;

            // Get current posts_count
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("posts_count")
                .eq("id", postData.user_id)
                .single();

            if (!profileError && profile) {
                await supabase
                    .from("profiles")
                    .update({
                        posts_count: Math.max((profile.posts_count || 1) - 1, 0),
                    })
                    .eq("id", postData.user_id);
            }

            // Update UI
            setPosts((prev) => prev.filter((p) => p.id !== deleteTarget));

            toast.success("Post deleted", {
                id: loadingToast,
            });
        } catch (err) {
            console.error(err);

            toast.error("Failed to delete post", {
                id: loadingToast,
            });
        } finally {
            setDeleteTarget(null);
        }
    };

    // BOOST
    const boostPost = () => {
        toast("Boost will be available in version 2", {
            icon: "🚀",
            style: {
                borderRadius: "14px",
                background: "#0f172a",
                color: "#fff",
            },
        });
    };

    if (loading) {
        return (<div className="min-h-screen bg-white dark:bg-black flex items-center justify-center"> <div className="animate-pulse text-center"> <div className="w-16 h-16 rounded-full border-4 border-gray-300 border-t-black dark:border-t-white animate-spin mx-auto" /> <p className="mt-4 text-gray-500">Loading posts...</p> </div> </div>
        );
    }

    return (

        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">


            {/* HEADER */}
            <div className="sticky top-0 z-50 backdrop-blur-md bg-white/90 dark:bg-black/90 border-b border-gray-200 dark:border-white/10">

                <div className="max-w-2xl mx-auto p-4 flex items-center gap-3">

                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-zinc-900 hover:scale-105 transition"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <h1 className="font-bold text-lg">
                        My Posts
                    </h1>

                </div>

            </div>

            {/* POSTS */}
            <div className="max-w-2xl mx-auto mt-4 px-3 pb-10">

                {posts.length === 0 ? (

                    <div className="bg-white dark:bg-black border border-gray-200 dark:border-white/10 rounded-3xl p-10 text-center shadow-sm">

                        <div className="w-24 h-24 mx-auto rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
                            <Rocket size={40} className="text-purple-500" />
                        </div>

                        <h2 className="mt-6 text-2xl font-bold">
                            No Posts Yet
                        </h2>

                        <p className="mt-3 text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
                            Your campus is waiting to hear from you.
                            Create your first post and connect with students around you.
                        </p>

                        <button
                            onClick={() => navigate("/create-post")}
                            className="mt-6 px-6 py-3 rounded-xl bg-black dark:bg-white text-white dark:text-black font-semibold hover:scale-105 transition"
                        >
                            Create First Post
                        </button>

                    </div>

                ) : (

                    posts.map((post) => {
                        const parsed = post.content || {};

                        return (
                            <div
                                key={post.id}
                                id={`post-${post.id}`}
                                className="
            bg-white dark:bg-black
            border border-gray-200 dark:border-white/10
            rounded-3xl
            overflow-hidden
            shadow-sm
            hover:shadow-xl
            transition-all
            duration-300
            mb-4
          "
                            >

                                {/* HEADER */}
                                <div className="flex items-center gap-3 px-4 py-4">

                                    <div
                                        onClick={() => openUserProfile(post.user_id)}
                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                    >

                                        {profileImages[post.user_id] ? (
                                            <img
                                                src={profileImages[post.user_id]}
                                                alt=""
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white font-bold">
                                                {(post.profile_name || "U").charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div>
                                            <h3 className="font-semibold">
                                                {post.profile_name || "Anonymous"}
                                            </h3>

                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Globe size={12} />
                                                <span>
                                                    {post.created_at
                                                        ? formatTimeAgo(post.created_at)
                                                        : "Just now"}
                                                </span>
                                            </div>
                                        </div>

                                    </div>

                                    <button
                                        onClick={() => setDeleteTarget(post.id)}
                                        className="p-2 rounded-full hover:bg-red-100 text-red-500 transition"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                </div>

                                {/* DESCRIPTION */}
                                {post.description && (
                                    <div className="px-4 pb-4">
                                        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-gray-700 dark:text-gray-300">
                                            {post.description}
                                        </p>
                                    </div>
                                )}

                                {/* IMAGE */}
                                {post.image && (
                                    <div className="relative bg-black">
                                        <img
                                            src={post.cached_image || post.image}
                                            alt=""
                                            className="w-full max-h-[500px] object-contain"
                                        />

                                        {parsed?.layers?.map((layer) => (
                                            <div
                                                key={layer.id}
                                                className="absolute font-bold"
                                                style={{
                                                    left: layer.x,
                                                    top: layer.y,
                                                    color: layer.color,
                                                    fontSize: layer.fontSize,
                                                }}
                                            >
                                                {layer.text}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* TEXT POST */}
                                {!post.image && parsed?.background && (
                                    <div
                                        className="relative min-h-[380px] flex items-center justify-center"
                                        style={{ background: parsed.background }}
                                    >
                                        <div className="text-white font-extrabold text-3xl text-center px-6">
                                            {parsed.text}
                                        </div>
                                    </div>
                                )}

                                {/* ACTION BAR */}
                                <div className="border-t border-gray-100 dark:border-white/10 px-4 py-3">

                                    <div className="flex justify-between items-center">

                                        <div className="flex items-center gap-5">

                                            <div className="flex items-center gap-1">
                                                <Heart
                                                    size={20}
                                                    className="text-red-500"
                                                    fill="currentColor"
                                                />
                                                <span>{post.likes_count || 0}</span>
                                            </div>

                                            <span>
                                                {post.comments_count || 0} comments
                                            </span>

                                            <span>
                                                {post.shares_count || 0} shares
                                            </span>

                                        </div>

                                        <span className="text-xs font-semibold text-gray-400">
                                            SocialGist
                                        </span>

                                    </div>

                                </div>

                            </div>
                        );
                    })

                )}

            </div>

            {/* DELETE MODAL */}
            {deleteTarget && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">

                    <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">

                        <h2 className="text-xl font-bold">
                            Delete Post?
                        </h2>

                        <p className="text-gray-500 mt-2">
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3 mt-6">

                            <button
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-red-500 text-white"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>
            )}


        </div>
    );

}