"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  cancelReservation,
  getDashboardData,
  toggleFavorite,
  updateReservation,
  type DashboardStats,
  type FavoriteRestaurant,
  type ReservationItem,
} from "@/lib/api/dashboard";

type DashboardUser = {
  fullName?: string;
  profilePicture?: string;
  role?: string;
};

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

function formatDateInput(dateValue?: string) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function formatDisplayDate(dateValue?: string) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ bookings: 0, favorites: 0, averageRating: 0 });
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ date: "", time: "", guests: "2", specialRequests: "" });

  const displayName = user?.fullName || "MealNest User";
  const avatar = user?.profilePicture || "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=220&q=80";

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getDashboardData();
      setStats(response.data.stats);
      setFavorites(response.data.favorites);
      setUpcomingReservations(response.data.upcomingReservations);
      setRecentHistory(response.data.recentHistory);
    } catch {
      setError("We could not load your dashboard data right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const handleFavoriteToggle = async (restaurantId: string) => {
    try {
      const result = await toggleFavorite(restaurantId);
      setFavorites(result.data.favorites);
      setStats((current) => ({ ...current, favorites: result.data.favorites.length }));
    } catch {
      setError("Unable to update favorites right now.");
    }
  };

  const startEditing = (reservation: ReservationItem) => {
    setEditingReservationId(reservation._id);
    setEditForm({
      date: formatDateInput(reservation.reservationDate),
      time: reservation.time,
      guests: String(reservation.guests || 2),
      specialRequests: reservation.specialRequests || "",
    });
  };

  const saveEdit = async (reservationId: string) => {
    try {
      const payload = {
        date: new Date(editForm.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        reservationDate: editForm.date,
        time: editForm.time,
        guests: Number(editForm.guests || 2),
        specialRequests: editForm.specialRequests,
      };
      await updateReservation(reservationId, payload);
      await loadDashboard();
      setEditingReservationId(null);
    } catch {
      setError("Unable to update this reservation right now.");
    }
  };

  const handleCancelReservation = async (reservationId: string) => {
    if (!window.confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await cancelReservation(reservationId);
      await loadDashboard();
    } catch {
      setError("Unable to cancel this reservation right now.");
    }
  };

  return (
    <div className="customer-dashboard">
      <header className="customer-nav">
        <a className="customer-brand" href="/dashboard/user">MealNest</a>
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

      <main className="customer-main">
        <section className="customer-profile-card">
          <div className="customer-identity">
            <img src={avatar} alt="" />
            <h1>{displayName}</h1>
          </div>
          <div className="customer-metrics" aria-label="Dashboard statistics">
            <div>
              <strong>{loading ? "—" : stats.bookings}</strong>
              <span>Bookings</span>
            </div>
            <div>
              <strong>{loading ? "—" : stats.favorites}</strong>
              <span>Favorites</span>
            </div>
            <div>
              <strong>{loading ? "—" : stats.averageRating.toFixed(1)}</strong>
              <span>Rating</span>
            </div>
          </div>
        </section>

        <div className="customer-layout">
          <section className="customer-primary">
            {error && <p className="profile-action-message error">{error}</p>}

            <div className="customer-section-head">
              <h2>Upcoming Reservations</h2>
              <Link href="/reservations">View All</Link>
            </div>

            <div className="reservation-list">
              {loading && <p>Loading upcoming reservations…</p>}
              {!loading && upcomingReservations.length === 0 && <p>No upcoming reservations yet.</p>}
              {!loading &&
                upcomingReservations.map((reservation) => (
                  <article className="reservation-card" key={reservation._id}>
                    <img src={reservation.image || "/images/Register.jpg"} alt="" />
                    <div>
                      <div className="reservation-meta">
                        <span>{reservation.date || formatDisplayDate(reservation.reservationDate)}</span>
                        <p>{reservation.time} - {reservation.guests} {reservation.guests === 1 ? "Guest" : "Guests"}</p>
                      </div>
                      <h3>{reservation.restaurantName}</h3>
                      <p>{reservation.cuisine}</p>
                    </div>
                    <div className="reservation-actions">
                      {editingReservationId === reservation._id ? (
                        <>
                          <input
                            type="date"
                            value={editForm.date}
                            onChange={(event) => setEditForm((current) => ({ ...current, date: event.target.value }))}
                          />
                          <input
                            type="time"
                            value={editForm.time}
                            onChange={(event) => setEditForm((current) => ({ ...current, time: event.target.value }))}
                          />
                          <select
                            value={editForm.guests}
                            onChange={(event) => setEditForm((current) => ({ ...current, guests: event.target.value }))}
                          >
                            <option value="1">1 Guest</option>
                            <option value="2">2 Guests</option>
                            <option value="3">3 Guests</option>
                            <option value="4">4 Guests</option>
                            <option value="5">5 Guests</option>
                            <option value="6">6 Guests</option>
                          </select>
                          <button type="button" onClick={() => void saveEdit(reservation._id)}>Save</button>
                          <button type="button" onClick={() => setEditingReservationId(null)}>Cancel</button>
                        </>
                      ) : (
                        <>
                          <button type="button" onClick={() => startEditing(reservation)}>Edit</button>
                          <button type="button" onClick={() => void handleCancelReservation(reservation._id)}>Cancel</button>
                        </>
                      )}
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

            <div className="favorite-grid" style={{ overflowX: "auto" }}>
              {loading && <p>Loading your favorites…</p>}
              {!loading && favorites.length === 0 && <p>No favorites yet.</p>}
              {!loading &&
                favorites.map((favorite) => (
                  <article className="favorite-card" key={favorite._id}>
                    <div className="favorite-image">
                      <img src={favorite.image || "/images/Register.jpg"} alt="" />
                      <span className={`status-badge ${favorite.isOpen ? "open" : "closed"}`}>
                        {favorite.isOpen ? "Open Now" : "Closed"}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${favorite.name} from favorites`}
                        onClick={() => void handleFavoriteToggle(favorite._id)}
                      >
                        <Icon name="heart" size={21} />
                      </button>
                    </div>
                    <div className="favorite-body">
                      <div className="favorite-title">
                        <h3>{favorite.name}</h3>
                        <span><Icon name="star" size={15} /> {favorite.rating}</span>
                      </div>
                      <p className="favorite-cuisine">{favorite.cuisine}</p>
                      <p className="favorite-location">{favorite.location || "Neighborhood favorite"}</p>
                      <div className="favorite-footer">
                        <span className="favorite-price">{favorite.priceRange || "$$"}</span>
                        <Link href={`/restaurants/${favorite._id}`} className="favorite-book-link">
                          Book Table →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>

          <aside className="customer-sidebar">
            <section className="side-card">
              <h2>Quick Actions</h2>
              <Link href="/profile">
                <Icon name="user" />
                <span>Update Profile</span>
                <Icon name="chevron" size={18} />
              </Link>
              <Link href="/payment-methods">
                <Icon name="card" />
                <span>Payment Methods</span>
                <Icon name="chevron" size={18} />
              </Link>
              <Link href="/reservations">
                <Icon name="bell" />
                <span>Dining Alerts</span>
                <Icon name="chevron" size={18} />
              </Link>
            </section>

            <section className="side-card history-card">
              <h2>Recent History</h2>
              {loading && <p>Loading history…</p>}
              {!loading && recentHistory.length === 0 && <p>No completed reservations yet.</p>}
              {!loading && recentHistory.map((item) => (
                <article className="history-row" key={item._id}>
                  <div><Icon name={item.cuisine?.toLowerCase().includes("japanese") ? "utensils" : "utensils"} size={22} /></div>
                  <span>
                    <strong>{item.restaurantName}</strong>
                    <small>{formatDisplayDate(item.reservationDate)}</small>
                    <Link href={`/restaurants/${item.restaurantId || item._id}`}>Re-book</Link>
                  </span>
                </article>
              ))}
              <Link href="/reservations" className="customer-link-button">Full History</Link>
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
