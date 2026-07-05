"use client";

import { changePasswordAction, logoutAction, updateProfileAction } from "@/lib/actions/profile-action";
import { useActionState, useEffect, useRef, useState } from "react";

type ProfileUser = {
  fullName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string;
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

const emptyState = {
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
  const [profileState, profileFormAction, isUpdatingProfile] = useActionState(updateProfileAction, emptyState);
  const [passwordState, passwordFormAction, isChangingPassword] = useActionState(changePasswordAction, emptyState);
  const [avatar, setAvatar] = useState(user.profilePicture);
  const [photoMessage, setPhotoMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (passwordState.success) {
      passwordFormRef.current?.reset();
    }
  }, [passwordState.success]);

  function handlePhotoChange(file: File | undefined) {
    setPhotoMessage("");

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setPhotoMessage("Choose a JPG, PNG, GIF, or WEBP image.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setPhotoMessage("Profile photo must be 2MB or smaller.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result || user.profilePicture));
    reader.readAsDataURL(file);
  }

  return (
    <div className="profile-settings-page">
      <header className="customer-nav profile-settings-nav">
        <a className="customer-brand" href="/dashboard/user">
          MealNest
        </a>
        <nav aria-label="Customer navigation">
          <a href="/dashboard/user">Discover</a>
          <a href="/reservations">Reservations</a>
          <a href="/favorites">Favorites</a>
        </nav>
        <div className="customer-nav-actions">
          <button type="button" aria-label="Search">
            <Icon name="search" size={22} />
          </button>
          <img src={avatar} alt={`${user.fullName} profile`} />
        </div>
      </header>

      <main className="profile-settings-main">
        <section className="profile-settings-heading">
          <h1>Profile Settings</h1>
          <p>Manage your personal information and account settings.</p>
        </section>

        <div className="profile-settings-layout">
          <section className="profile-panel profile-info-panel">
            <h2>Personal Information</h2>
            <form action={profileFormAction} className="profile-form">
              <input type="hidden" name="profilePicture" value={avatar} />
              <div className="profile-photo-column">
                <h3>Profile Photo</h3>
                <div className="profile-photo-wrap">
                  <img src={avatar} alt="" />
                  <button type="button" aria-label="Change profile photo" onClick={() => fileInputRef.current?.click()}>
                    <Icon name="camera" size={18} />
                  </button>
                </div>
                <p>JPG, PNG or GIF. Max size 2MB.</p>
                <input
                  ref={fileInputRef}
                  className="profile-file-input"
                  type="file"
                  accept="image/png,image/jpeg,image/gif,image/webp"
                  onChange={(event) => handlePhotoChange(event.target.files?.[0])}
                />
                <button type="button" className="profile-outline-button" onClick={() => fileInputRef.current?.click()}>
                  Change Photo
                </button>
                {photoMessage && <p className="profile-action-message error">{photoMessage}</p>}
              </div>

              <div className="profile-fields">
                <label>
                  <span>Full Name</span>
                  <input name="fullName" defaultValue={user.fullName} required />
                </label>
                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" defaultValue={user.email} required />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input name="phoneNumber" defaultValue={user.phoneNumber} />
                </label>
                <label>
                  <span>Location</span>
                  <input name="location" defaultValue="Kathmandu, Nepal" disabled />
                </label>
                <label>
                  <span>Bio</span>
                  <textarea
                    name="bio"
                    defaultValue="Food enthusiast | Coffee lover | Exploring new cuisines around the world."
                    disabled
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
              <h3>{user.fullName}</h3>
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
              <a href="#change-password">
                <Icon name="lock" />
                <span>Change Password</span>
                <Icon name="chevron" size={18} />
              </a>
              <a href="/payment-methods">
                <Icon name="card" />
                <span>Payment Methods</span>
                <Icon name="chevron" size={18} />
              </a>
              <a href="#">
                <Icon name="bell" />
                <span>Notification Settings</span>
                <Icon name="chevron" size={18} />
              </a>
              <form action={logoutAction}>
                <button className="profile-logout-link" type="submit">
                  <Icon name="logout" />
                  <span>Logout</span>
                  <Icon name="chevron" size={18} />
                </button>
              </form>
            </section>

            <section className="profile-panel profile-password-card" id="change-password">
              <h2>Change Password</h2>
              <form ref={passwordFormRef} action={passwordFormAction}>
                <label>
                  <span>Current Password</span>
                  <input name="currentPassword" type="password" required />
                </label>
                <label>
                  <span>New Password</span>
                  <input name="newPassword" type="password" minLength={6} required />
                </label>
                <label>
                  <span>Confirm Password</span>
                  <input name="confirmPassword" type="password" minLength={6} required />
                </label>
                {passwordState.message && (
                  <p className={`profile-action-message ${passwordState.success ? "success" : "error"}`}>
                    {passwordState.message}
                  </p>
                )}
                <button type="submit" className="profile-submit-button" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </form>
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
    </div>
  );
}
