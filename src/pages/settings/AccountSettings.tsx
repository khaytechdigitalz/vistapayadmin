import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/context/ToastContext";
import { SettingsNav } from "./SettingsNav";
import {
  fetchProfile,
  updateProfile,
  updateProfileAvatar,
  CustomerProfile,
} from "@/api/admin";
import { Loader2, Camera } from "lucide-react";
import { cn, getImageSrc } from "@/lib/utils";

export const AccountSettings: React.FC = () => {
  const { push } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);

  // Editable Form State
  const [fullName, setFullName] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [dob, setDob] = useState<string>("");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await fetchProfile();
      if (res.status && res.data) {
        setProfile(res.data);
        setFullName(res.data.name ?? "");
        setPhone(res.data.phone ?? "");
        // Format YYYY-MM-DD for <input type="date" />
        setDob(res.data.dob ? res.data.dob.split("T")[0] : "");
      }
    } catch (error) {
      console.error("Failed to load profile:", error);
      push("Failed to load profile details.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      push("Full name is required", "error");
      return;
    }

    try {
      setSaving(true);
      const res = await updateProfile({
        name: fullName,
        phone: phone || undefined,
        dob: dob || undefined,
      });

      if (res.status) {
        push(res.message || "Profile updated successfully!", "success");
        if (res.data) setProfile(res.data);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to update profile.";
      push(errorMsg, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      push("Image size must be less than 5MB", "error");
      return;
    }

    try {
      setUploadingAvatar(true);
      const res = await updateProfileAvatar(file);

      if (res.status) {
        push("Profile photo updated successfully!", "success");
        if (res.data) setProfile(res.data);
      }
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to upload avatar.";
      push(errorMsg, "error");
    } finally {
      setUploadingAvatar(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const avatarInitial = fullName ? fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[220px_1fr]">
      <SettingsNav />

      <div className="space-y-5">
        <div className="card">
          {/* Avatar Header */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative">
              {profile?.avatar ? (

                <img
                  src={getImageSrc(profile.avatar)}
                  alt={profile?.name || "Profile"}
                  className="h-16 w-16 rounded-2xl object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/images/placeholder.png";
                  }}
                />

              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-2xl font-bold text-secondary">
                  {avatarInitial}
                </span>
              )}

              {uploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40 text-white">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              )}
            </div>

            <div>
              <p className="font-bold text-ink-900">{profile?.name || "User"}</p>
              <p className="text-sm text-ink-900/50">{profile?.email}</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="mt-1 flex items-center gap-1 text-xs font-bold text-primary hover:underline disabled:opacity-50"
              >
                <Camera size={12} />
                {uploadingAvatar ? "Uploading..." : "Change photo"}
              </button>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <Input
                label="Date of birth"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="Email address"
                type="email"
                value={profile?.email ?? ""}
                disabled
                className="bg-surface-border/20 cursor-not-allowed opacity-70"
              />
              <Input
                label="Phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving Changes..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="card">
          <h4 className="mb-1 text-sm font-bold text-ink-900">Danger Zone</h4>
          <p className="mb-4 text-sm text-ink-900/50">
            Deactivating your account will suspend all wallet activity.
          </p>
          <button type="button" className="btn-danger">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  );
};