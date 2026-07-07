"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  cancelReservation,
  getDashboardData,
  getRestaurants,
  toggleFavorite,
  updateReservation,
  type DashboardResponse,
  type DashboardStats,
  type FavoriteRestaurant,
  type ReservationItem,
  type RestaurantItem,
} from "@/lib/api/dashboard";
import DashboardHeader from "./_components/DashboardHeader";
import Sidebar from "./_components/Sidebar";
import StatsCard from "./_components/StatsCard";
import ReservationCard, { type EditForm } from "./_components/ReservationCard";
import FavoriteRestaurantCard from "./_components/FavoriteRestaurantCard";
import RecommendationCard from "./_components/RecommendationCard";
import ReservationHistory from "./_components/ReservationHistory";
import QuickActions from "./_components/QuickActions";
import EmptyState from "./_components/EmptyState";
import Icon from "./_components/Icon";
import {
  CardSkeleton,
  HistoryRowSkeleton,
  ReservationCardSkeleton,
} from "./_components/Skeletons";
import { formatDateInput, formatToday } from "./_components/helpers";

type DashboardUser = {
  fullName?: string;
  email?: string;
  profilePicture?: string;
  role?: string;
};

const EMPTY_EDIT_FORM: EditForm = { date: "", time: "", guests: "2", specialRequests: "" };

export default function DashboardClient({ user }: { user: DashboardUser }) {
  const [stats, setStats] = useState<DashboardStats>({ bookings: 0, favorites: 0, averageRating: 0 });
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [upcomingReservations, setUpcomingReservations] = useState<ReservationItem[]>([]);
  const [recentHistory, setRecentHistory] = useState<ReservationItem[]>([]);
  const [recommendations, setRecommendations] = useState<RestaurantItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingReservationId, setEditingReservationId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<EditForm>(EMPTY_EDIT_FORM);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const displayName = user?.fullName || "MealNest User";
  const firstName = displayName.split(" ")[0];
  const today = useMemo(() => formatToday(), []);

  const favoriteIds = useMemo(() => new Set(favorites.map((favorite) => favorite._id)), [favorites]);

  const applyDashboard = useCallback((data: DashboardResponse["data"]) => {
    setStats(data.stats);
    setFavorites(data.favorites);
    setUpcomingReservations(data.upcomingReservations);
    setRecentHistory(data.recentHistory);
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      const response = await getDashboardData();
      applyDashboard(response.data);
      setError("");
    } catch {
      setError("We could not load your dashboard data right now.");
    }
  }, [applyDashboard]);

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
        date: new Date(editForm.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        reservationDate: editForm.date,
        time: editForm.time,
        guests: Number(editForm.guests || 2),
        specialRequests: editForm.specialRequests,
      };
      await updateReservation(reservationId, payload);
      await refreshDashboard();
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
      await refreshDashboard();
    } catch {
      setError("Unable to cancel this reservation right now.");
    }
  };

  const averageRatingDisplay = Number(stats.averageRating || 0).toFixed(1);

  return (
    <div className="dash-shell">
      <DashboardHeader user={user} onToggleSidebar={() => setSidebarOpen((open) => !open)} />

      <div className="dash-body">
        <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
        {sidebarOpen && <div className="dash-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

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

              {/* Upcoming */}
              <section className="dash-panel">
                <div className="dash-panel-head">
                  <h2>Upcoming Reservations</h2>
                  <Link href="/reservations">View All</Link>
                </div>

                {loading ? (
                  <div className="dash-reservation-stack">
                    <ReservationCardSkeleton />
                    <ReservationCardSkeleton />
                  </div>
                ) : upcomingReservations.length === 0 ? (
                  <EmptyState
                    icon="calendar"
                    title="No Upcoming Reservations"
                    message="Book a restaurant and your reservations will appear here."
                  />
                ) : (
                  <div className="dash-reservation-stack">
                    {upcomingReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation._id}
                        reservation={reservation}
                        isEditing={editingReservationId === reservation._id}
                        editForm={editForm}
                        onEditFormChange={(patch) =>
                          setEditForm((current) => ({
                            ...current,
                            ...patch,
                          }))
                        }
                        onStartEdit={startEditing}
                        onSaveEdit={saveEdit}
                        onCancelEdit={() => setEditingReservationId(null)}
                        onCancelReservation={handleCancelReservation}
                      />
                    ))}
                  </div>
                )}
              </section>

              {/* Favorites */}
              <section className="dash-panel">
                <div className="dash-panel-head">
                  <h2>Favorite Restaurants</h2>
                  <Link href="/favorites">View All</Link>
                </div>

                <div className="dash-card-grid">
                  {favorites.map((favorite) => (
                    <FavoriteRestaurantCard
                      key={favorite._id}
                      favorite={favorite}
                      onRemove={handleFavoriteToggle}
                    />
                  ))}
                </div>
              </section>

              {/* Recommendations */}
              <section className="dash-panel" id="recommended">
                <div className="dash-panel-head">
                  <h2>Recommended Restaurants</h2>
                  <Link href="/restaurants">Browse All</Link>
                </div>

                <div className="dash-card-grid">
                  {recommendations.map((restaurant) => (
                    <RecommendationCard
                      key={restaurant._id}
                      restaurant={restaurant}
                      isFavorite={favoriteIds.has(restaurant._id)}
                      onToggleFavorite={handleFavoriteToggle}
                    />
                  ))}
                </div>
              </section>
            </section>

            {/* Right Side */}
            <aside className="dash-right">
              <section className="dash-panel">
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
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}