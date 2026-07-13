"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getRestaurants,
  type DashboardData,
  type DashboardStats,
  type FavoriteRestaurant,
  type ReservationItem,
  type RestaurantItem,
} from "@/lib/api/dashboard";
import { getUserDashboardAction, toggleFavoriteAction } from "@/lib/actions/dashboard-action";
import { useUserDashboardShell } from "@/app/_components/UserDashboardShell";
import StatsCard from "./_components/StatsCard";
import RecommendationCard from "./_components/RecommendationCard";
import ReservationHistory from "./_components/ReservationHistory";
import QuickActions from "./_components/QuickActions";
import EmptyState from "./_components/EmptyState";
import Icon from "./_components/Icon";
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
  const [recommendationsError, setRecommendationsError] = useState(false);
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

  const applyDashboard = useCallback((data: DashboardData) => {
    setStats(data.stats);
    setFavorites(data.favorites);
    setUpcomingReservations(data.upcomingReservations);
    setRecentHistory(data.recentHistory);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const data = await getUserDashboardAction();
        if (active) applyDashboard(data);
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
        if (active) setRecommendationsError(true);
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
      const updatedFavorites = await toggleFavoriteAction(restaurantId);
      setFavorites(updatedFavorites);
      setStats((current) => ({ ...current, favorites: updatedFavorites.length }));
    } catch {
      setError("Unable to update favorites right now.");
    }
  };

  const averageRatingDisplay = Number(stats.averageRating || 0).toFixed(1);

  return (
    <div className="dash-shell">
      <div className="dash-body">
        <main className="dash-main">
          <div className="dash-layout">

            {/* Left Content */}
            <section className="dash-content">

              {/* Welcome */}
              <section className="dash-welcome dash-fade-in">
                <div>
                  <h1>Welcome back, {firstName}!</h1>
                  <p>Ready to reserve another unforgettable dining experience?</p>
                </div>

                <span className="dash-today">
                  <Icon name="calendar" size={16} />
                  {today}
                </span>
              </section>

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
                  <Link href="/dashboard/user/discover" className="dash-btn dash-btn-outline">View All Restaurants</Link>
                </div>

                {recommendationsLoading ? (
                  <p>Loading restaurants...</p>
                ) : recommendationsError ? (
                  <p className="profile-action-message error">Unable to load restaurants. Please try again.</p>
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
                  <EmptyState icon="utensils" title="No restaurants found" message="Try a different search or explore restaurants again shortly." actionLabel="View All Restaurants" actionHref="/dashboard/user/discover" />
                )}
              </section>

              <section className="dash-panel dashboard-quick-actions-section">
                <h2>Quick Actions</h2>
                <QuickActions />
              </section>

              <section className="dash-panel" id="recent-history">
                <div className="dash-panel-head">
                  <h2>Recent History</h2>
                  <Link href="/dashboard/user/reservations">Full History</Link>
                </div>

                <ReservationHistory items={recentHistory} />
              </section>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
