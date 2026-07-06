import { useEffect, useState } from "react";
import { supabase } from "../configs/supbase";
import {
  FiEdit2,
  FiCheck,
  FiCamera,
  FiRefreshCw,
  FiArrowLeft,
  FiX,
  FiUpload,
} from "react-icons/fi";
/* import { nanoid } from "nanoid"; */
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState({});
  const [loading, setLoading] = useState(true);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const fetchProfile = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        await setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;

      let updated = { ...data };

      if (!updated.username) {
        /*    updated.username = "user_" + nanoid(6); */

        await supabase
          .from("profiles")
          .update({ username: updated.username })
          .eq("id", user.id);
      }

      setProfile(updated);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(() => {
      fetchProfile();
    });

    return () => data.subscription.unsubscribe();
  }, []);

  const updateField = async (field, value) => {
    if (!profile) return;

    const userValue = value?.trim() || "Not set";

    setProfile((prev) => ({
      ...prev,
      [field]: userValue,
    }));

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    try {
      await supabase
        .from("profiles")
        .update({
          [field]: userValue,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEdit = (field) => {
    setEditing((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Get current avatar URL
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("avatar_url")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      // Delete old avatar if it exists
      if (profileData?.avatar_url) {
        const marker = "/profile-images/";
        const index = profileData.avatar_url.indexOf(marker);

        if (index !== -1) {
          const oldPath = profileData.avatar_url.substring(
            index + marker.length
          );

          await supabase.storage
            .from("profile-images")
            .remove([oldPath]);
        }
      }

      // Upload new avatar
      const fileName = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("profile-images")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("profile-images")
        .getPublicUrl(fileName);

      const avatar_url = data.publicUrl;


      // Update database
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      // Update all of the user's posts
      const { error: postsError } = await supabase
        .from("posts")
        .update({
          profile_image: avatar_url,
        })
        .eq("user_id", user.id);

      if (postsError) throw postsError;

      setProfile((prev) => ({ ...prev, avatar_url }));

      setShowAvatarModal(false);
      setSelectedFile(null);
      setPreview(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const regenerateUsername = () => {
    updateField("username", "user_" + nanoid(6));
  };


  const deleteAccount = async () => {
    try {
      setDeleting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        "https://ukghwpkdlsqgwbjhmezy.supabase.co/functions/v1/delete-account",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed");

      console.log("Account deleted");

      // logout + redirect
      await supabase.auth.signOut();
      navigate("/");

    } catch (err) {
      console.log(err);
      alert("Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white p-6 animate-pulse">
        <div className="h-56 bg-gray-200 rounded-3xl" />
        <div className="h-24 w-24 bg-gray-300 rounded-full -mt-12 ml-6" />
      </div>
    );
  }

  /* ===================== NO PROFILE UI (FIXED) ===================== */
  if (!profile) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
        <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <span className="text-3xl">👤</span>
        </div>

        <h1 className="text-2xl font-bold text-gray-800">
          No Profile Found
        </h1>

        <p className="text-gray-500 mt-2 max-w-sm">
          Your profile has not been set up yet. Go back to your feed to continue.
        </p>

        <button
          onClick={() => navigate("/feed")}
          className="mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold"
        >
          Go Back to Feed
        </button>
      </div>
    );
  }

  const Field = ({ label, value, field }) => (
    <div className="py-5 border-b flex justify-between items-center gap-4 min-h-[70px]">
      <div className="w-full">
        <p className="text-xs text-purple-600 uppercase font-semibold">
          {label}
        </p>

        {editing[field] ? (
          <input
            autoFocus
            defaultValue={value || ""}
            onBlur={(e) => {
              updateField(field, e.target.value);
              toggleEdit(field);
            }}
            className="w-full mt-3 bg-gray-100 rounded-xl px-4 py-3 outline-none border"
          />
        ) : (
          <p className="mt-2 text-gray-700">
            {value?.trim() || "Not set"}
          </p>
        )}
      </div>

      <button
        onClick={() => toggleEdit(field)}
        className={`w-7 h-7 rounded-xl flex items-center justify-center ${editing[field]
          ? "bg-purple-600 text-white"
          : "bg-purple-100 text-purple-700"
          }`}
      >
        {editing[field] ? (
          <FiCheck size={20} />
        ) : (
          <FiEdit2 size={18} />
        )}
      </button>
    </div>
  );



  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-xl mx-auto pb-10">

        {/* HEADER */}
        <div className="p-4 flex items-center gap-3 border-b sticky top-0 bg-white z-20">
          <button
            onClick={() => navigate("/feed")}
            className="bg-gray-100 p-3 rounded-full"
          >
            <FiArrowLeft />
          </button>

          <div>
            <h1 className="font-bold text-lg">Profile Settings</h1>
            <p className="text-xs text-gray-500">@{profile.username}</p>
          </div>
        </div>

        {/* COVER */}
        <div className="mx-4 mt-4 h-56 rounded-3xl overflow-hidden shadow-lg">
          <img
            src={
              profile.avatar_url ||
              `https://ui-avatars.com/api/?name=${profile.full_name}`
            }
            className="w-full h-full object-cover"
          />
        </div>

        {/* AVATAR */}
        <div className="px-6 -mt-14 flex items-end gap-4">
          <div className="relative">
            <img
              src={
                profile.avatar_url ||
                `https://ui-avatars.com/api/?name=${profile.full_name}`
              }
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />

            <button
              onClick={() => setShowAvatarModal(true)}
              className="absolute bottom-1 right-1 bg-purple-600 text-white p-2 rounded-full"
            >
              <FiCamera size={18} />
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold">
              {profile.full_name || "Your Name"}
            </h2>

            <div className="flex gap-2 items-center text-purple-600 font-medium">
              @{profile.username}

            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-3 p-4">
          {["Posts", "Followers", "Following"].map((x, i) => (
            <div key={x} className="border rounded-2xl p-4 text-center">
              <b>
                {[
                  profile.posts_count,
                  profile.followers_count,
                  profile.following_count,
                ][i] || 0}
              </b>
              <p className="text-xs text-gray-500">{x}</p>
            </div>
          ))}
        </div>

        {/* FIELDS */}
        <div className="mx-4 border rounded-3xl p-5 shadow-sm">
          <Field label="Full Name" field="full_name" value={profile.full_name} />
          <Field label="Username" field="username" value={profile.username} />
          <Field label="Location" field="location" value={profile.location} />
          <Field label="School" field="school" value={profile.school} />
          <Field label="Department" field="department" value={profile.department} />
          <Field label="Hobby" field="hobby" value={profile.hobby} />
          <Field label="Relationship" field="relationship_status" value={profile.relationship_status} />
        </div>

        {/* ================= DANGER ZONE ================= */}
        <div className="mx-4 mt-6 border border-red-200 dark:border-red-900 rounded-3xl p-5 bg-red-50 dark:bg-red-950/20">

          <h2 className="text-lg font-bold text-red-600 mb-1">
            Danger Zone
          </h2>

          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Once you delete your account, all your posts, profile data, and activity will be permanently removed.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="
      w-full
      py-3
      rounded-xl
      bg-red-600
      hover:bg-red-700
      text-white
      font-semibold
      transition
    "
          >
            Delete My Account
          </button>

        </div>
      </div>

      {/* MODAL */}
      {showAvatarModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-3xl p-6">
            <h2 className="font-bold text-lg mb-3">
              Update Photo
            </h2>

            {preview ? (
              <img
                src={preview}
                className="w-full h-72 object-cover rounded-2xl"
              />
            ) : (
              <div className="h-72 border-2 border-dashed flex items-center justify-center text-gray-500 rounded-2xl">
                Choose an image
              </div>
            )}

            <label className="mt-4 flex items-center justify-center gap-2 bg-gray-100 p-4 rounded-xl cursor-pointer">
              <FiUpload />
              Select Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleAvatarSelect}
              />
            </label>

            <button
              disabled={!selectedFile || uploading}
              onClick={uploadAvatar}
              className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Save Photo"}
            </button>

            <button
              onClick={() => {
                setShowAvatarModal(false);
                setSelectedFile(null);
                setPreview(null);
              }}
              className="w-full mt-2 text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 text-center">

            <h2 className="text-xl font-bold text-red-600">
              Delete Account?
            </h2>

            <p className="text-gray-600 mt-2">
              This will permanently delete your profile, posts, and all data.
              This action cannot be undone.
            </p>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl bg-gray-200"
              >
                Cancel
              </button>

              <button
                onClick={deleteAccount}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-red-600 text-white"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}