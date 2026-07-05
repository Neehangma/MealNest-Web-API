import { getAuthenticatedUser } from "@/lib/auth-session";
import { redirect } from "next/navigation";

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

export default async function ProfilePage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "user") {
    redirect("/login");
  }

  const displayName = user.fullName || "Neehangma Rai";
  const email = user.email || "neehangma@gmail.com";
  const phone = user.phoneNumber || "+977 9841234567";
  const avatar =
    user.profilePicture ||
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=320&q=80";

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
          <img src={avatar} alt={`${displayName} profile`} />
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
            <form className="profile-form">
              <div className="profile-photo-column">
                <h3>Profile Photo</h3>
                <div className="profile-photo-wrap">
                  <img src={avatar} alt="" />
                  <button type="button" aria-label="Change profile photo">
                    <Icon name="camera" size={18} />
                  </button>
                </div>
                <p>JPG, PNG or GIF. Max size 2MB.</p>
                <button type="button" className="profile-outline-button">
                  Change Photo
                </button>
              </div>

              <div className="profile-fields">
                <label>
                  <span>Full Name</span>
                  <input name="fullName" defaultValue={displayName} />
                </label>
                <label>
                  <span>Email Address</span>
                  <input type="email" name="email" defaultValue={email} />
                </label>
                <label>
                  <span>Phone Number</span>
                  <input name="phoneNumber" defaultValue={phone} />
                </label>
                <label>
                  <span>Location</span>
                  <input name="location" defaultValue="Kathmandu, Nepal" />
                </label>
                <label>
                  <span>Bio</span>
                  <textarea
                    name="bio"
                    defaultValue={
                      "Food enthusiast | Coffee lover | Exploring new cuisines around the world."
                    }
                  />
                </label>
                <button type="submit" className="profile-submit-button">
                  Update Profile
                </button>
              </div>
            </form>
          </section>

          <aside className="profile-settings-sidebar">
            <section className="profile-panel profile-overview-card">
              <h2>Profile Overview</h2>
              <img src={avatar} alt="" />
              <h3>{displayName}</h3>
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
              <a href="#">
                <Icon name="lock" />
                <span>Change Password</span>
                <Icon name="chevron" size={18} />
              </a>
              <a href="#">
                <Icon name="card" />
                <span>Payment Methods</span>
                <Icon name="chevron" size={18} />
              </a>
              <a href="#">
                <Icon name="bell" />
                <span>Notification Settings</span>
                <Icon name="chevron" size={18} />
              </a>
              <a className="profile-logout-link" href="/login">
                <Icon name="logout" />
                <span>Logout</span>
                <Icon name="chevron" size={18} />
              </a>
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
