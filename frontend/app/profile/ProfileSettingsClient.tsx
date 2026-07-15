"use client";

import { updateProfileAction, type ProfileActionState } from "@/lib/actions/profile-action";
import { useLogout } from "@/app/_components/LogoutProvider";
import { FormEvent, useRef, useState } from "react";

type ProfileUser = {
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
  location: string;
  bio: string;
};

type IconName =
  | "search"
  | "camera"
  | "lock"
  | "card"
  | "bell"
  | "logout"
  | "chevron"
  | "globe"
  | "share";

const emptyState: ProfileActionState = {
  success: false,
  message: "",
};

function Icon({ name, size = 22 }: { name: IconName; size?: number }) {
  const props = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  return (
    <svg {...props}>
      {name === "search" && (
        <>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </>
      )}
      {name === "camera" && (
        <>
          <path d="M14.5 4 16 7h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l1.5-3h5Z" />
          <circle cx="12" cy="13" r="3" />
        </>
      )}
      {name === "lock" && (
        <>
          <rect x="4" y="11" width="16" height="10" rx="2" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </>
      )}
      {name === "card" && (
        <>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h4" />
        </>
      )}
      {name === "bell" && (
        <>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </>
      )}
      {name === "logout" && (
        <>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5" />
          <path d="M21 12H9" />
        </>
      )}
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
      {name === "globe" && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 0 1 0 18" />
          <path d="M12 3a14 14 0 0 0 0 18" />
        </>
      )}
      {name === "share" && (
        <>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4" />
          <path d="m15.4 6.5-6.8 4" />
        </>
      )}
    </svg>
  );
}

export default function ProfileSettingsClient({ user }: { user: ProfileUser }) {
  const [profileState, setProfileState] = useState<ProfileActionState>(emptyState);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profile, setProfile] = useState(user);
  const [avatar, setAvatar] = useState(user.profilePicture);
  const [showProfileUpdateDialog, setShowProfileUpdateDialog] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<FormData | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { requestLogout } = useLogout();

  function requestProfileUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPendingProfileData(new FormData(event.currentTarget));
    setShowProfileUpdateDialog(true);
  }

  async function confirmProfileUpdate() {
    if (!pendingProfileData) return;
    setShowProfileUpdateDialog(false);
    setIsUpdatingProfile(true);
    const result = await updateProfileAction(emptyState, pendingProfileData);
    setProfileState(result);

    if (result.success && result.user) {
      setProfile((current) => ({
        ...current,
        fullName: result.user?.fullName || current.fullName,
        email: result.user?.email || current.email,
        phoneNumber: result.user?.phoneNumber || "",
        profilePicture: result.user?.profilePicture || current.profilePicture,
        location: result.user?.location || "",
        bio: result.user?.bio || "",
      }));
      if (result.user.profilePicture) setAvatar(result.user.profilePicture);
      window.dispatchEvent(new CustomEvent("mealnest:user-updated", { detail: result.user }));
      setPendingProfileData(null);
    }

    setIsUpdatingProfile(false);
  }

  function handlePhotoChange(file: File | undefined) {
    if (!file) return;

    if (!file.type.startsWith("image/")) return;

    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result || user.profilePicture));
    reader.readAsDataURL(file);
  }

  return (
    <div className="profile-settings-page">
      <main className="profile-settings-main">
        <section className="profile-settings-heading">
          <a href="/dashboard/user" className="profile-settings-back">
            <Icon name="chevron" size={20} />
            Back to Dashboard
          </a>
          <h1>Profile Settings</h1>
          <p>Manage your personal information and account settings.</p>
        </section>

        <div className="profile-settings-layout">
          <section className="profile-panel profile-info-panel">
            <h2>Personal Information</h2>
            <form className="profile-form" onSubmit={requestProfileUpdate}>
              <input type="hidden" name="profilePicture" value={avatar} />
              <div className="profile-photo-column">
                <h3>Profile Photo</h3>
                <div className="profile-photo-wrap">
                  <img src={avatar} alt="" />
                  <button type="button" aria-label="Change profile photo" onClick={() => fileInputRef.current?.click()}>
                    <Icon name="camera" size={18} />
                  </button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                  style={{ display: "none" }}
                />
                <button type="button" className="profile-outline-button" onClick={() => fileInputRef.current?.click()}>
                  Change Photo
                </button>
              </div>

              <div className="profile-fields">
                <label>
                  <span>Full Name</span>
                  <input name="fullName" value={profile.fullName} onChange={(event) => setProfile((current) => ({ ...current, fullName: event.target.value }))} required />
                </label>
                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} required />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input name="phoneNumber" value={profile.phoneNumber} onChange={(event) => setProfile((current) => ({ ...current, phoneNumber: event.target.value }))} />
                </label>
                <label>
                  <span>Location</span>
                  <input name="location" value={profile.location} onChange={(event) => setProfile((current) => ({ ...current, location: event.target.value }))} />
                </label>
                <label>
                  <span>Bio</span>
                  <textarea
                    name="bio"
                    value={profile.bio}
                    onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))}
                    rows={4}
                  />
                </label>
                {profileState.message && (
                  <p className={`profile-action-message ${profileState.success ? "success" : "error"}`}>
                    {profileState.message}
                  </p>
                )}
                <button type="submit" className="profile-submit-button" disabled={isUpdatingProfile}>
                  {isUpdatingProfile ? "Updating..." : "Update Profile"}
                </button>
              </div>
            </form>
          </section>

          <aside className="profile-settings-sidebar">
            <section className="profile-panel profile-overview-card">
              <h2>Profile Overview</h2>
              <img src={avatar} alt="" />
              <h3>{profile.fullName}</h3>
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

            <section className="profile-panel profile-actions-card">
              <h2>Quick Actions</h2>
              <a href="/change-password">
                <Icon name="lock" />
                <span>Change Password</span>
                <Icon name="chevron" size={18} />
              </a>
              
              <button
                className="profile-logout-link"
                type="button"
                onClick={(event) => requestLogout(event.currentTarget)}
              >
                <Icon name="logout" />
                <span>Logout</span>
                <Icon name="chevron" size={18} />
              </button>
            </section>
          </aside>
        </div>
      </main>

      <footer className="customer-footer profile-settings-footer">
        <div>
          <h2>MealNest</h2>
          <p>Premium dining logistics and reservations for the modern connoisseur.</p>
        </div>
        <nav aria-label="Platform links">
          <h3>Platform</h3>
          <a href="#">About Us</a>
          <a href="#">Press</a>
          <a href="#">Careers</a>
        </nav>
        <nav aria-label="Support links">
          <h3>Support</h3>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Contact</a>
        </nav>
        <div>
          <h3>Connect</h3>
          <div className="social-row">
            <Icon name="globe" />
            <Icon name="globe" />
            <Icon name="share" />
          </div>
          <p>&copy; 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>

      {showProfileUpdateDialog && (
        <div className="profile-modal-overlay" onClick={() => setShowProfileUpdateDialog(false)}>
          <div className="profile-modal" onClick={(event) => event.stopPropagation()}>
            <h2>Confirm Profile Update</h2>
            <p>Are you sure you want to save these profile changes?</p>
            <div className="profile-modal-actions">
              <button type="button" className="profile-modal-button secondary" onClick={() => setShowProfileUpdateDialog(false)}>Cancel</button>
              <button type="button" className="profile-modal-button primary" onClick={() => void confirmProfileUpdate()}>Update Profile</button>
            </div>
          </div>
        </div>
      )}

     
    </div>
  );
}
