"use client";

import Link from "next/link";
<<<<<<< Updated upstream
import { useCallback, useEffect, useMemo, useState } from "react";
=======
import { useEffect, useState } from "react";
>>>>>>> Stashed changes
import {
  getDashboardData,
  getRestaurants,
  toggleFavorite,
  type DashboardResponse,
  type DashboardStats,
  type FavoriteRestaurant,
  type ReservationItem,
  type RestaurantItem,
} from "@/lib/api/dashboard";
import { useUserDashboardShell } from "@/app/_components/UserDashboardShell";
import StatsCard from "./_components/StatsCard";
import RecommendationCard from "./_components/RecommendationCard";
import ReservationHistory from "./_components/ReservationHistory";
import QuickActions from "./_components/QuickActions";
import EmptyState from "./_components/EmptyState";
import Icon from "./_components/Icon";
import { CardSkeleton } from "./_components/Skeletons";
import { formatToday } from "./_components/helpers";

type DashboardUser = {
  fullName?: string;
  email?: string;
  profilePicture?: string;
  role?: string;
};

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const [stats, setStats] = useState<DashboardStats>({ bookings: 0, favorites: 0, averageRating: 0 });
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<ReservationItem[]>([]);
  const [recommendations, setRecommendations] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [error, setError] = useState("");
  const { searchQuery } = useUserDashboardShell();

  const displayName = user?.fullName || "MealNest User";
  const firstName = displayName.split(" ")[0];
  const today = useMemo(() => formatToday(), []);

  const favoriteIds = useMemo(() => new Set(favorites.map((favorite) => favorite._id)), [favorites]);
  const filteredRecommendations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return recommendations;
    return recommendations.filter((restaurant) =>
      [restaurant.name, restaurant.cuisine, restaurant.location].some((value) => value.toLowerCase().includes(query)),
    );
  }, [recommendations, searchQuery]);

  const applyDashboard = useCallback((data: DashboardResponse["data"]) => {
    setStats(data.stats);
    setFavorites(data.favorites);
    setUpcomingReservations(data.upcomingReservations);
    setRecentHistory(data.recentHistory);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const response = await getDashboardData();
        if (active) applyDashboard(response.data);
      } catch {
        if (active) setError("We could not load your dashboard data right now.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    (async () => {
      try {
        const response = await getRestaurants();
        if (active) setRecommendations(response.data);
      } catch {
        // recommendations are non-critical; keep the dashboard usable
      } finally {
        if (active) setRecommendationsLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [applyDashboard]);

  const handleFavoriteToggle = async (restaurantId: string) => {
    try {
      const result = await toggleFavorite(restaurantId);
      setFavorites(result.data.favorites);
      setStats((current) => ({ ...current, favorites: result.data.favorites.length }));
    } catch {
      setError("Unable to update favorites right now.");
    }
  };

  const averageRatingDisplay = Number(stats.averageRating || 0).toFixed(1);

  return (
<<<<<<< Updated upstream
    <div className="dash-shell">
      <div className="dash-body">
        <main className="dash-main">
          <div className="dash-layout">

            {/* Left Content */}
            <section className="dash-content">
=======
    <div className="customer-dashboard">
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
            
          </div>
        </section>
>>>>>>> Stashed changes

              {/* Welcome */}
              <section className="dash-welcome dash-fade-in">
                <div>
                  <h1>Welcome back, {firstName}!</h1>
                  <p>Ready to reserve another unforgettable dining experience?</p>
                </div>

<<<<<<< Updated upstream
                <span className="dash-today">
                  <Icon name="calendar" size={16} />
                  {today}
                </span>
              </section>
=======
            <div className="customer-section-head">
              <h2>Upcoming Reservations</h2>
              <Link href="/dashboard/user/reservations">View All</Link>
            </div>
>>>>>>> Stashed changes

              {/* Statistics */}
              <section className="dash-stats-grid">
                <StatsCard
                  icon="calendar"
                  value={upcomingReservations.length}
                  label="Upcoming Reservations"
                  description="Tables booked"
                  tone="amber"
                  loading={loading}
                />

                <StatsCard
                  icon="heart"
                  value={stats.favorites}
                  label="Favorite Restaurants"
                  description="Saved places"
                  tone="rose"
                  loading={loading}
                />

                <StatsCard
                  icon="check-circle"
                  value={recentHistory.length}
                  label="Completed Visits"
                  description="Finished reservations"
                  tone="green"
                  loading={loading}
                />

<<<<<<< Updated upstream
                <StatsCard
                  icon="star"
                  value={averageRatingDisplay}
                  label="Average Rating"
                  description="Your dining score"
                  tone="violet"
                  loading={loading}
                />
              </section>

              <section className="dashboard-restaurants-section" id="restaurants">
                <div className="dashboard-restaurants-header">
                  <div>
                    <h2>Explore Restaurants</h2>
                    <p>Discover and reserve your next dining experience</p>
                  </div>
                  <Link href="/discover" className="dash-btn dash-btn-outline">View All Restaurants</Link>
                </div>

                {recommendationsLoading ? (
                  <div className="dashboard-restaurant-grid" aria-label="Loading restaurants">
                    {Array.from({ length: 6 }).map((_, index) => <CardSkeleton key={index} />)}
                  </div>
                ) : filteredRecommendations.length > 0 ? (
                  <div className="dashboard-restaurant-grid">
                    {filteredRecommendations.map((restaurant) => (
                      <RecommendationCard
                        key={restaurant._id}
                        restaurant={restaurant}
                        isFavorite={favoriteIds.has(restaurant._id)}
                        onToggleFavorite={handleFavoriteToggle}
                      />
                    ))}
                  </div>
                ) : (
                  <EmptyState icon="utensils" title="No restaurants found" message="Try a different search or explore restaurants again shortly." actionLabel="View All Restaurants" actionHref="/discover" />
                )}
              </section>

              <section className="dash-panel dashboard-quick-actions-section">
                <h2>Quick Actions</h2>
                <QuickActions />
              </section>

              <section className="dash-panel" id="recent-history">
                <div className="dash-panel-head">
                  <h2>Recent History</h2>
                  <Link href="/reservations">Full History</Link>
                </div>

                <ReservationHistory items={recentHistory} />
              </section>
            </section>
=======
          <aside className="customer-sidebar">
            <section className="side-card">
              <h2>Quick Actions</h2>
              <Link href="/dashboard/user/profile">
                <Icon name="user" />
                <span>Update Profile</span>
                <Icon name="chevron" size={18} />
              </Link>
              <Link href="/dashboard/user/payment-methods">
                <Icon name="card" />
                <span>Payment Methods</span>
                <Icon name="chevron" size={18} />
              </Link>
              <Link href="/dashboard/user/reservations">
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
              <Link href="/dashboard/user/reservations" className="customer-link-button">Full History</Link>
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
>>>>>>> Stashed changes
          </div>
        </main>
      </div>
    </div>
  );
}
