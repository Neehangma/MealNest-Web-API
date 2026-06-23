/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { getUserData } from "@/lib/cookies";

const reservations = [
  {
    name: "The Golden Truffle",
    location: "Upper East Side, French Cuisine",
    image:
      "https://images.unsplash.com/photo-1519671282429-b44660ead0a7?auto=format&fit=crop&w=500&q=80",
    date: "Tomorrow",
    time: "7:30 PM",
    guests: "2 Guests",
  },
  {
    name: "Sakura Omakasi",
    location: "Tribeca, Authentic Japanese",
    image:
      "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=500&q=80",
    date: "Fri, Oct 25",
    time: "8:00 PM",
    guests: "4 Guests",
  },
];

const favorites = [
  {
    name: "The Golden Truffle",
    cuisine: "Italian",
    image:
      "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=900&q=80",
    rating: "4.8",
    status: "Available Tonight",
  },
  {
    name: "Swadi",
    cuisine: "Thai",
    image:
      "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?auto=format&fit=crop&w=900&q=80",
    rating: "4.7",
    status: "Waitlist Only",
  },
];

const quickActions = [
  { label: "Profile Setting", icon: "profile", href: "/dashboard/profile" },
  { label: "Payment Methods", icon: "payment", href: "/dashboard" },
  { label: "Dining Alerts", icon: "alert", href: "/dashboard" },
];

const history = [
  { name: "Swadi", date: "Visited Oct 12, 2025", icon: "fork" },
  { name: "Jimbu", date: "Visited Oct 05, 2024", icon: "glass" },
  { name: "Sakura Omakasi", date: "Visited June 28, 2025", icon: "sushi" },
];

function DashboardIcon({ name }: { name: string }) {
  const commonProps = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (name === "payment") {
    return (
      <svg {...commonProps}>
        <rect x="3" y="7" width="18" height="12" rx="2" />
        <path d="M3 11h18" />
        <circle cx="8" cy="15" r="1" />
      </svg>
    );
  }

  if (name === "alert") {
    return (
      <svg {...commonProps}>
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
        <path d="M10 21h4" />
      </svg>
    );
  }

  if (name === "fork") {
    return (
      <svg {...commonProps}>
        <path d="M6 3v8" />
        <path d="M4 3v4" />
        <path d="M8 3v4" />
        <path d="M6 11v10" />
        <path d="M16 3v18" />
        <path d="M16 3c3 2 4 5 2 8h-2" />
      </svg>
    );
  }

  if (name === "glass") {
    return (
      <svg {...commonProps}>
        <path d="M6 3h12l-2 8a4 4 0 0 1-8 0L6 3Z" />
        <path d="M12 15v6" />
        <path d="M8 21h8" />
      </svg>
    );
  }

  if (name === "sushi") {
    return (
      <svg {...commonProps}>
        <path d="M4 15c1-4 4-6 8-6s7 2 8 6" />
        <path d="M7 15c1-2 3-3 5-3s4 1 5 3" />
        <path d="M4 15h16" />
        <path d="M6 15v3h12v-3" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default async function DashboardPage() {
  const user = await getUserData();
  const name = user?.name || "Neehangma Rai";

  return (
    <main className="meal-dashboard">
      <header className="meal-dashboard-nav">
        <Link href="/" className="meal-dashboard-logo">
          MealNest
        </Link>

        <nav aria-label="Primary navigation" className="meal-dashboard-links">
          <Link href="/">Discover</Link>
          <Link href="/dashboard">Reservations</Link>
          <Link href="/dashboard">Favorites</Link>
        </nav>

        <div className="meal-dashboard-tools">
          <button type="button" aria-label="Search">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </button>
          <img
            src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80"
            alt="User avatar"
          />
        </div>
      </header>

      <section className="meal-dashboard-content">
        <section className="meal-profile-card" aria-label="Profile summary">
          <div className="meal-profile-person">
            <img
              src="https://images.unsplash.com/photo-1598550874175-4d0ef436c909?auto=format&fit=crop&w=260&q=80"
              alt={name}
            />
            <h1>{name}</h1>
          </div>
          <div className="meal-profile-stats">
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

        <div className="meal-dashboard-grid">
          <div className="meal-main-column">
            <section className="meal-section">
              <div className="meal-section-heading">
                <h2>Upcoming Reservations</h2>
                <Link href="/dashboard">View All</Link>
              </div>

              <div className="meal-reservation-list">
                {reservations.map((reservation) => (
                  <article className="meal-reservation-card" key={reservation.name}>
                    <img src={reservation.image} alt={reservation.name} />
                    <div className="meal-reservation-body">
                      <div className="meal-reservation-meta">
                        <span>{reservation.date}</span>
                        <p>
                          {reservation.time} &bull; {reservation.guests}
                        </p>
                      </div>
                      <h3>{reservation.name}</h3>
                      <p>{reservation.location}</p>
                    </div>
                    <div className="meal-reservation-actions">
                      <button type="button">Edit</button>
                      <button type="button" className="danger">
                        Cancel
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="meal-section">
              <div className="meal-section-heading">
                <h2>Favorite Restaurants</h2>
                <button type="button" aria-label="Change favorite restaurants view">
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
              </div>

              <div className="meal-favorites-grid">
                {favorites.map((favorite) => (
                  <article className="meal-favorite-card" key={favorite.name}>
                    <div className="meal-favorite-image">
                      <img src={favorite.image} alt={favorite.name} />
                      <button type="button" aria-label={`Remove ${favorite.name} from favorites`}>
                        <svg
                          width="22"
                          height="22"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M12 21s-7-4.4-9.4-8.4C.3 8.8 2.7 4 7 4c2.1 0 3.7 1.1 5 3 1.3-1.9 2.9-3 5-3 4.3 0 6.7 4.8 4.4 8.6C19 16.6 12 21 12 21Z" />
                        </svg>
                      </button>
                    </div>
                    <div className="meal-favorite-body">
                      <div>
                        <h3>{favorite.name}</h3>
                        <p>{favorite.cuisine}</p>
                      </div>
                      <span className="meal-rating">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="m12 2 3.1 6.4 7 .9-5.1 4.9 1.3 6.9L12 17.8l-6.3 3.3L7 14.2 1.9 9.3l7-.9L12 2Z" />
                        </svg>
                        {favorite.rating}
                      </span>
                      <small>{favorite.status}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="meal-side-column">
            <section className="meal-side-card">
              <h2>Quick Actions</h2>
              <div className="meal-action-list">
                {quickActions.map((action) => (
                  <Link href={action.href} key={action.label}>
                    <span>
                      <DashboardIcon name={action.icon} />
                      {action.label}
                    </span>
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
                  </Link>
                ))}
              </div>
            </section>

            <section className="meal-side-card meal-history-card">
              <h2>Recent History</h2>
              <div className="meal-history-list">
                {history.map((item) => (
                  <article key={item.name} className="meal-history-item">
                    <span className="meal-history-icon">
                      <DashboardIcon name={item.icon} />
                    </span>
                    <div>
                      <h3>{item.name}</h3>
                      <p>{item.date}</p>
                      <Link href="/dashboard">Re-book</Link>
                    </div>
                  </article>
                ))}
              </div>
              <button type="button" className="meal-history-button">
                Full History
              </button>
            </section>
          </aside>
        </div>
      </section>

      <footer className="meal-dashboard-footer">
        <div>
          <h2>MealNest</h2>
          <p>Premium dining logistics and reservations for the modern connoisseur.</p>
        </div>
        <nav aria-label="Platform links">
          <h3>Platform</h3>
          <Link href="/">About Us</Link>
          <Link href="/">Press</Link>
          <Link href="/">Careers</Link>
        </nav>
        <nav aria-label="Support links">
          <h3>Support</h3>
          <Link href="/">Privacy Policy</Link>
          <Link href="/">Terms of Service</Link>
          <Link href="/">Contact</Link>
        </nav>
        <div>
          <h3>Connect</h3>
          <div className="meal-social-links">
            <Link href="/" aria-label="Visit MealNest region page">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18" />
                <path d="M12 3c3 3 3 15 0 18" />
                <path d="M12 3c-3 3-3 15 0 18" />
              </svg>
            </Link>
            <Link href="/" aria-label="Visit MealNest website">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
            <Link href="/" aria-label="Share MealNest">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <path d="m8.6 10.5 6.8-4" />
                <path d="m8.6 13.5 6.8 4" />
              </svg>
            </Link>
          </div>
          <p>&copy; 2024 MealNest. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
