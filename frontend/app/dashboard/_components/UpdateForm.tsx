"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { handleLogoutUser, handleUpdateUser } from "@/lib/actions/auth-action";
import { AuthUser, useAuth } from "@/lib/contexts/AuthContext";
import { useState } from "react";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8089";
const fallbackImage =
  "https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=500&q=80";

const getImageUrl = (image?: string) => {
  if (!image) return fallbackImage;
  return image.startsWith("http") ? image : `${apiBaseUrl}${image}`;
};

function SettingsIcon({ name }: { name: string }) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "password") {
    return (
      <svg {...commonProps}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (name === "payment") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M3 11h18" />
      </svg>
    );
  }

  if (name === "notifications") {
    return (
      <svg {...commonProps}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function UpdateForm({ user }: { user: AuthUser | null }) {
  const router = useRouter();
  const { setUser } = useAuth();
  const [preview, setPreview] = useState(getImageUrl(user?.image));
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const name = user?.name || "Neehangma Rai";
  const email = user?.email || "neehangma@gmail.com";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage("");

    const formData = new FormData(event.currentTarget);
    const result = await handleUpdateUser(formData);

    setIsSubmitting(false);
    setMessage(result.message);
    if (result.success) {
      const data = result.data as { user?: AuthUser } | undefined;
      setUser(data?.user || null);
      setPreview(getImageUrl(data?.user?.image));
    }
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await handleLogoutUser();
    setUser(null);
    router.replace("/login");
    router.refresh();
  };

  return (
    <section className="profile-settings-content">
      <div className="profile-settings-heading">
        <h1>Profile Settings</h1>
        <p>Manage your personal information and account settings.</p>
      </div>

      <div className="profile-settings-grid">
        <section className="profile-info-card">
          <h2>Personal Information</h2>

          <form className="profile-settings-form" onSubmit={handleSubmit}>
            <div className="profile-photo-column">
              <label className="profile-photo-title">Profile Photo</label>
              <input
                id="profile-photo-input"
                name="image"
                type="file"
                accept="image/*"
                className="profile-photo-input"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) {
                    setPreview(URL.createObjectURL(file));
                  }
                }}
              />
              <div className="profile-photo-wrap">
                <img src={preview} alt="Profile preview" />
                <label
                  className="profile-camera-button"
                  htmlFor="profile-photo-input"
                  aria-label="Choose profile photo"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3Z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </label>
              </div>
              <p>JPG, PNG or GIF. Max size 2MB.</p>
              <label className="profile-change-photo" htmlFor="profile-photo-input">
                Change Photo
              </label>
            </div>

            <div className="profile-form-fields">
              <label>Full Name</label>
              <input name="name" type="text" defaultValue={name} required />

              <label>Email Address</label>
              <input name="email" type="email" defaultValue={email} required />

              <label>Phone Number</label>
              <input name="phone" type="tel" defaultValue="+977 9841234567" />

              <label>Location</label>
              <input name="location" type="text" defaultValue="Kathmandu, Nepal" />

              <label>Bio</label>
              <textarea
                name="bio"
                defaultValue={
                  "Food enthusiast | Coffee lover | Exploring new cuisines around the world."
                }
              />

              {message && <p className="form-message">{message}</p>}
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </form>
        </section>

        <aside className="profile-settings-sidebar">
          <section className="profile-overview-card">
            <h2>Profile Overview</h2>
            <img src={preview} alt={name} />
            <h3>{name}</h3>
            <span>Premium Member</span>
            <div className="profile-overview-stats">
              <div>
                <strong>24</strong>
                <small>Bookings</small>
              </div>
              <div>
                <strong>12</strong>
                <small>Favorites</small>
              </div>
              <div>
                <strong>4.9</strong>
                <small>Rating</small>
              </div>
            </div>
          </section>

          <section className="profile-actions-card">
            <h2>Quick Actions</h2>
            <nav aria-label="Profile actions" className="profile-actions-list">
              <Link href="/dashboard/password">
                <span>
                  <SettingsIcon name="password" />
                  Change Password
                </span>
                <ArrowIcon />
              </Link>
              <Link href="/dashboard">
                <span>
                  <SettingsIcon name="payment" />
                  Payment Methods
                </span>
                <ArrowIcon />
              </Link>
              <Link href="/dashboard">
                <span>
                  <SettingsIcon name="notifications" />
                  Notification Settings
                </span>
                <ArrowIcon />
              </Link>
              <button
                type="button"
                className="logout"
                disabled={isLoggingOut}
                onClick={handleLogout}
              >
                <span>
                  <SettingsIcon name="logout" />
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
                <ArrowIcon />
              </button>
            </nav>
          </section>
        </aside>
      </div>
    </section>
  );
}
