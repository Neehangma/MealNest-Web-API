"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cancelReservation, getDashboardData, type ReservationItem } from "@/lib/api/dashboard";

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void loadReservations();
  }, []);

  async function loadReservations() {
    try {
      setLoading(true);
      setError("");
      const response = await getDashboardData();
      setReservations([...(response.data.upcomingReservations || []), ...(response.data.recentHistory || [])]);
    } catch {
      setError("We could not load your reservations right now.");
    } finally {
      setLoading(false);
    }
  }

  const filteredReservations = reservations.filter((res) => {
    if (filter === "all") return res.status !== "cancelled";
    if (filter === "upcoming") return res.status === "confirmed" || res.status === "pending";
    if (filter === "cancelled") return res.status === "cancelled";
    return true;
  });

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this reservation?")) {
      return;
    }

    try {
      await cancelReservation(id);
      await loadReservations();
    } catch {
      setError("Unable to cancel this reservation right now.");
    }
  };

  const getStatusBadge = (status: ReservationItem["status"]) => {
    switch (status) {
      case "confirmed":
        return <span className="status-badge confirmed">Confirmed</span>;
      case "pending":
        return <span className="status-badge pending">Pending</span>;
      case "cancelled":
        return <span className="status-badge cancelled">Cancelled</span>;
    }
  };

  return (
    <main className="reservations-page">
      <div className="reservations-container">
        <div className="reservations-header">
          <div>
            <h1>My Reservations</h1>
            <p>Manage your upcoming and past dining reservations</p>
          </div>
          <Link href="/" className="new-reservation-button">
            + New Reservation
          </Link>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={`filter-tab ${filter === "upcoming" ? "active" : ""}`}
            onClick={() => setFilter("upcoming")}
          >
            Upcoming
          </button>
          <button
            className={`filter-tab ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {error && <p className="profile-action-message error">{error}</p>}

        {loading && <p>Loading reservations…</p>}

        <div className="reservations-list">
          {!loading && filteredReservations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h2>No reservations found</h2>
              <p>You don't have any {filter === "cancelled" ? "cancelled" : filter} reservations.</p>
              <Link href="/" className="browse-button">
                Browse Restaurants
              </Link>
            </div>
          ) : (
            filteredReservations.map((reservation) => (
              <div key={reservation._id} className={`reservation-card ${reservation.status}`}>
                <div className="reservation-image">
                  <Image
                    src={reservation.image || "/images/Register.jpg"}
                    alt={reservation.restaurantName}
                    fill
                    className="reservation-img"
                  />
                </div>
                <div className="reservation-content">
                  <div className="reservation-header">
                    <h3>{reservation.restaurantName}</h3>
                    {getStatusBadge(reservation.status)}
                  </div>
                  <div className="reservation-details">
                    <div className="detail-item">
                      <span>Date</span>
                      <strong>{reservation.date || reservation.reservationDate}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Time</span>
                      <strong>{reservation.time}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Party Size</span>
                      <strong>{reservation.guests} {reservation.guests === 1 ? "Guest" : "Guests"}</strong>
                    </div>
                  </div>
                  {reservation.specialRequests && (
                    <div className="special-requests">
                      <span>Special Requests:</span>
                      <p>{reservation.specialRequests}</p>
                    </div>
                  )}
                  <div className="reservation-actions">
                    {reservation.status !== "cancelled" && (
                      <>
                        <Link href={`/restaurants/${reservation.restaurantId || reservation._id}`} className="action-button secondary">
                          View Restaurant
                        </Link>
                        <button
                          className="action-button danger"
                          onClick={() => void handleCancel(reservation._id)}
                        >
                          Cancel Reservation
                        </button>
                      </>
                    )}
                    {reservation.status === "cancelled" && (
                      <Link href="/" className="action-button primary">
                        Book Again
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
