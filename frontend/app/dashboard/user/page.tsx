import { getAuthenticatedUser } from "@/lib/auth-session";
import { getDashboardPathForRole } from "@/lib/auth-routing";
import { redirect } from "next/navigation";

type IconName =
  | "search"
  | "user"
  | "card"
  | "bell"
  | "chevron"
  | "grid"
  | "heart"
  | "star"
  | "utensils"
  | "martini"
  | "croissant"
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
      {name === "user" && (
        <>
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
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
      {name === "chevron" && <path d="m9 18 6-6-6-6" />}
      {name === "grid" && (
        <>
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </>
      )}
      {name === "heart" && <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />}
      {name === "star" && <path d="m12 2 3.1 6.3 6.9 1-5 4.8 1.2 6.8L12 17.7 5.8 21 7 14.1 2 9.3l6.9-1L12 2Z" />}
      {name === "utensils" && (
        <>
          <path d="M4 3v8" />
          <path d="M8 3v8" />
          <path d="M4 7h4" />
          <path d="M6 11v10" />
          <path d="M17 3v18" />
          <path d="M14 3c0 5 6 5 6 0" />
        </>
      )}
      {name === "martini" && (
        <>
          <path d="M8 3h8l-4 6-4-6Z" />
          <path d="M12 9v9" />
          <path d="M8 21h8" />
        </>
      )}
      {name === "croissant" && (
        <>
          <path d="M4 13c2-6 7-8 16-8-3 2-4 5-4 9" />
          <path d="M20 19c-8 0-14-1-16-6 2 6 7 8 16 6Z" />
        </>
      )}
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

const reservations = [
  {
    restaurant: "The Golden Truffle",
    detail: "Upper East Side, French Cuisine",
    date: "Tomorrow",
    time: "7:30 PM",
    guests: "2 Guests",
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=320&q=80",
  },
  {
    restaurant: "Sakura Omakasi",
    detail: "Tribeca, Authentic Japanese",
    date: "Fri, Oct 25",
    time: "8:00 PM",
    guests: "4 Guests",
    image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=320&q=80",
  },
];

const favorites = [
  {
    restaurant: "The Golden Truffle",
    cuisine: "Italian",
    status: "Available Tonight",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=640&q=80",
  },
  {
    restaurant: "Swadi",
    cuisine: "Thai",
    status: "Waitlist Only",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=640&q=80",
  },
];

const history = [
  { restaurant: "Swadi", date: "Visited Oct 12, 2025", icon: "utensils" as const },
  { restaurant: "Jimbu", date: "Visited Oct 05, 2024", icon: "martini" as const },
  { restaurant: "Sakura Omakasi", date: "Visited June 28, 2025", icon: "croissant" as const },
];

export default async function UserDashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "user") {
    redirect("/login");
  }

  const displayName = user?.fullName || "Neehangma Rai";
  const avatar = user?.profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=80";

  return (
    <div className="customer-dashboard">
      <header className="customer-nav">
        <a className="customer-brand" href="/dashboard/user">MealNest</a>
        <nav aria-label="Customer navigation">
          <a href="#">Discover</a>
          <a href="#">Reservations</a>
          <a href="#">Favorites</a>
        </nav>
        <div className="customer-nav-actions">
          <button type="button" aria-label="Search">
            <Icon name="search" size={22} />
          </button>
          <img src={avatar} alt={`${displayName} profile`} />
        </div>
      </header>

      <main className="customer-main">
        <section className="customer-profile-card">
          <div className="customer-identity">
            <img src={avatar} alt="" />
            <h1>{displayName}</h1>
          </div>
          <div className="customer-metrics" aria-label="Dashboard statistics">
            <div>
              <strong>24</strong>
              <span>Bookings</span>
            </div>
            <div>
              <strong>12</strong>
              <span>Favorites</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>Rating</span>
            </div>
          </div>
        </section>

        <div className="customer-layout">
          <section className="customer-primary">
            <div className="customer-section-head">
              <h2>Upcoming Reservations</h2>
              <a href="#">View All</a>
            </div>

            <div className="reservation-list">
              {reservations.map((reservation) => (
                <article className="reservation-card" key={reservation.restaurant}>
                  <img src={reservation.image} alt="" />
                  <div>
                    <div className="reservation-meta">
                      <span>{reservation.date}</span>
                      <p>{reservation.time} - {reservation.guests}</p>
                    </div>
                    <h3>{reservation.restaurant}</h3>
                    <p>{reservation.detail}</p>
                  </div>
                  <div className="reservation-actions">
                    <button type="button">Edit</button>
                    <button type="button">Cancel</button>
                  </div>
                </article>
              ))}
            </div>

            <div className="customer-section-head favorites-head">
              <h2>Favorite Restaurants</h2>
              <button type="button" aria-label="Change favorite restaurant view">
                <Icon name="grid" size={20} />
              </button>
            </div>

            <div className="favorite-grid">
              {favorites.map((favorite) => (
                <article className="favorite-card" key={favorite.restaurant}>
                  <div className="favorite-image">
                    <img src={favorite.image} alt="" />
                    <button type="button" aria-label={`Remove ${favorite.restaurant} from favorites`}>
                      <Icon name="heart" size={21} />
                    </button>
                  </div>
                  <div className="favorite-body">
                    <div className="favorite-title">
                      <h3>{favorite.restaurant}</h3>
                      <span><Icon name="star" size={15} /> {favorite.rating}</span>
                    </div>
                    <p>{favorite.cuisine}</p>
                    <strong>{favorite.status}</strong>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <aside className="customer-sidebar">
            <section className="side-card">
              <h2>Quick Actions</h2>
              <a href="/profile">
                <Icon name="user" />
                <span>Update Profile</span>
                <Icon name="chevron" size={18} />
              </a>
              <a href="#">
                <Icon name="card" />
                <span>Payment Methods</span>
                <Icon name="chevron" size={18} />
              </a>
              <a href="#">
                <Icon name="bell" />
                <span>Dining Alerts</span>
                <Icon name="chevron" size={18} />
              </a>
            </section>

            <section className="side-card history-card">
              <h2>Recent History</h2>
              {history.map((item) => (
                <article className="history-row" key={item.restaurant}>
                  <div><Icon name={item.icon} size={22} /></div>
                  <span>
                    <strong>{item.restaurant}</strong>
                    <small>{item.date}</small>
                    <a href="#">Re-book</a>
                  </span>
                </article>
              ))}
              <button type="button">Full History</button>
            </section>
          </aside>
        </div>
      </main>

      <footer className="customer-footer">
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
          <p>© 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
