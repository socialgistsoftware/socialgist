import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../configs/supbase";
import { MessageCircle, ThumbsUp, Loader2, Send } from "lucide-react";
import { BiShare } from "react-icons/bi";

export default function SinglePost() {
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [sending, setSending] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [adding, setAdding] = useState(false);
  const [me, setMe] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setMe(data?.user);
    });
  }, []);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !data) {
      setPost(null);
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("id, username, full_name, avatar_url")
      .eq("id", data.user_id)
      .maybeSingle();

    setPost({
      ...data,
      profile: profileData || null,
      comments: data.comments || [], // ✅ IMPORTANT
    });

    setLoading(false);
  };



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

  const openComments = () => {
    setComments(post?.comments || []);
    setCommentsOpen(true);
  };

  const addComment = async () => {
    if (!commentText.trim() || !post) return;

    setSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const profile = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()
        .then(res => res.data)
        .catch(() => null);

      const newComment = {
        id: crypto.randomUUID(),
        user_id: user.id,
        user: user?.user_metadata?.full_name || "Anonymous",
        avatar:
          profile?.avatar_url ||
          `https://ui-avatars.com/api/?name=${user?.user_metadata?.full_name || "User"}`,
        text: commentText.trim(),
        created_at: new Date().toISOString(),
      };

      const existing = post.comments || [];
      const updated = [newComment, ...existing];

      // 1. instant UI update
      setComments(updated);

      setPost((prev) => ({
        ...prev,
        comments: updated,
        comments_count: updated.length,
      }));

      setCommentText("");

      // 2. save to Supabase posts table
      const { error } = await supabase
        .from("posts")
        .update({
          comments: updated,
          comments_count: updated.length,
        })
        .eq("id", post.id);

      if (error) {
        console.error("Save comment error:", error.message);
      }
    } catch (err) {
      console.error("Comment failed:", err.message);
    } finally {
      setSending(false);
    }
  };
  // SAFE PARSE
  const parsed = (() => {
    try {
      return typeof post?.content === "string"
        ? JSON.parse(post.content)
        : post?.content || {};
    } catch {
      return {};
    }
  })();
  // SHARE
  const sharePost = async () => {
    const url = `${window.location.origin}/post/${id}`;

    const text =
      post?.description ||
      post?.profile?.full_name ||
      "Check this post";

    try {
      if (navigator.share) {
        await navigator.share({
          title: "SocialGist",
          text,
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        alert("Link copied!");
      }
    } catch (err) {
      console.log(err);
    }
  };

  const likePost = async () => {
    if (!post) return;

    const newLiked = !liked;
    setLiked(newLiked);

    const newCount = newLiked
      ? (post.likes_count || 0) + 1
      : Math.max((post.likes_count || 0) - 1, 0);

    setPost((prev) => ({
      ...prev,
      likes_count: newCount,
    }));

    const { error } = await supabase
      .from("posts")
      .update({ likes_count: newCount })
      .eq("id", post.id);

    if (error) {
      console.log("Like update error:", error);
    }
  };

  // ================= LOADING UI =================
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-[#0b0b0f] dark:to-[#111] text-gray-600 dark:text-gray-300">
        <Loader2 className="w-10 h-10 animate-spin text-purple-500 mb-3" />
        <p className="text-sm">Loading post...</p>
      </div>
    );
  }

  // ================= NOT FOUND =================
  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-white dark:from-[#0b0b0f] dark:to-[#111] text-center px-4">

        <div className="text-5xl mb-3">😕</div>

        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          Post not found
        </h2>

        <p className="text-sm text-gray-500 mt-2 max-w-sm">
          This post may have been deleted or doesn’t exist anymore.
        </p>

        {/* BACK TO FEED BUTTON */}
        <button
          onClick={() => navigate("/feed")}
          className="
          mt-6
          px-5
          py-2.5
          rounded-xl
          bg-purple-600
          text-white
          font-medium
          hover:bg-purple-700
          active:scale-95
          transition
        "
        >
          Go back to Feed
        </button>

      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center bg-gray-100 dark:bg-[#0f0f10] px-3 py-6 transition-colors">

      <div className="w-full max-w-xl">

        {/* ================= CARD ================= */}
        <div className="bg-white dark:bg-[#18191A] rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 shadow-sm">

          {/* ================= HEADER ================= */}
          <div className="flex items-center gap-3 px-4 py-3">

            <img
              src={
                post.profile?.avatar_url ||
                `https://ui-avatars.com/api/?name=${post.profile?.full_name || "User"}`
              }
              className="w-11 h-11 rounded-full object-cover border-2 border-purple-500"
            />

            <div>
              <h3 className="text-[15px] font-extrabold text-purple-700 dark:text-purple-300">
                {post.profile?.full_name || "Unknown"}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{post.profile?.username || "user"}
              </p>
            </div>

          </div>

          {/* ================= DESCRIPTION ================= */}
          {post.description && (
            <div className="px-4 pb-3">
              <p className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
                {post.description}
              </p>
            </div>
          )}

          {/* ================= IMAGE POST ================= */}
          {post.image && (
            <div className="relative w-full bg-black overflow-hidden">

              <img
                src={post.image}
                className="w-full max-h-[520px] object-contain"
              />

              {/* LAYERS */}
              {parsed?.layers?.map((layer) => (

                <div
                  key={layer.id}
                  className="absolute font-bold"
                  style={{
                    left: layer.x,
                    top: layer.y,
                    color: layer.color || "#fff",
                    fontSize: layer.fontSize || 18,
                    textShadow: "0 2px 6px rgba(0,0,0,0.7)",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {layer.text}
                </div>
              ))}

            </div>
          )}

          {commentsOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-end">

              {/* PANEL */}
              <div className="w-full max-w-xl mx-auto bg-white dark:bg-[#18191A] rounded-t-3xl h-[75vh] flex flex-col relative">

                {/* HANDLE */}
                <div className="flex justify-center py-2">
                  <div className="w-12 h-1.5 rounded-full bg-gray-300 dark:bg-white/20" />
                </div>

                {/* HEADER */}
                <div className="px-4 pb-3 border-b border-gray-200 dark:border-white/10">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                    Comments
                  </h2>
                </div>

                {/* COMMENTS LIST */}
                <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">

                  {comments.length === 0 ? (
                    <div className="flex flex-col items-center justify-center mt-16 text-center">

                      <div className="text-4xl mb-2">💬</div>

                      <p className="text-gray-500 text-sm">
                        Be the first to comment 👀
                      </p>

                      <p className="text-xs text-gray-400 mt-1">
                        Share your thoughts on this post
                      </p>

                    </div>
                  ) : (
                    comments.map((c, i) => (
                      <div
                        key={i}
                        className="bg-gray-100 dark:bg-white/5 p-3 rounded-xl"
                      >
                        <p className="text-sm text-gray-800 dark:text-gray-200">
                          {c.text || c.content || ""}
                        </p>
                      </div>
                    ))
                  )}

                </div>

                {/* INPUT AREA */}
                <div className="p-3 border-t border-gray-200 dark:border-white/10 flex gap-2">

                  <input
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className="flex-1 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-sm text-gray-800 dark:text-white outline-none"
                  />

                  {/* 💖 SEND BUTTON (LOADER STATE) */}
                  <button
                    onClick={addComment}
                    disabled={sending}
                    className={`
    relative w-11 h-11 flex items-center justify-center
    rounded-full text-white
    transition-all duration-300 ease-out

    bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500
    shadow-lg shadow-pink-500/30

    hover:scale-110 hover:shadow-pink-500/50
    active:scale-95

    disabled:opacity-50 disabled:cursor-not-allowed
  `}
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send size={18} />
                    )}
                  </button>

                </div>

                {/* CLOSE */}
                <button
                  onClick={() => setCommentsOpen(false)}
                  className="absolute top-3 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-white"
                >
                  ✕
                </button>

              </div>
            </div>
          )}

          {/* ================= TEXT POST ================= */}
          {!post.image && (parsed?.background || parsed?.text) && (
            <div
              className="min-h-[420px] flex items-center justify-center px-6 text-center"
              style={{ background: parsed.background }}
            >
              <div className="text-white text-2xl font-extrabold leading-snug">
                {parsed?.text}
              </div>
            </div>
          )}

          {/* ================= STATS ================= */}
          <div className="flex justify-between px-4 py-3 text-sm text-gray-500 dark:text-gray-300 border-t border-gray-200 dark:border-white/10">

            <span>❤️ {post.likes_count || 0}</span>
            <span>💬 {post.comments_count || 0}</span>
            <span>🔁 {post.shares_count || 0}</span>

          </div>

          {/* ================= ACTIONS ================= */}
          <div className="grid grid-cols-3 gap-1 px-2 py-2 border-t border-gray-200 dark:border-white/10">

            {/* LIKE */}
            <button
              onClick={likePost}
              className="flex items-center justify-center gap-2 h-10 rounded-xl
  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <ThumbsUp
                size={18}
                fill={liked ? "#a855f7" : "none"}
                className="text-purple-500"
              />
              <span className="text-sm font-medium">Like</span>
            </button>

            {/* COMMENT */}
            <button
              onClick={openComments}
              className="flex items-center justify-center gap-2 h-10 rounded-xl
  text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <MessageCircle size={18} className="text-purple-500" />
              <span className="text-sm font-medium">Comment</span>
            </button>

            {/* SHARE */}
            <button
              onClick={sharePost}
              className="flex items-center justify-center gap-2 h-10 rounded-xl
              text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition"
            >
              <BiShare size={18} className="text-purple-500" />
              <span className="text-sm font-medium">Share</span>
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}