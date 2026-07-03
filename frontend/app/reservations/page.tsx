"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { getUserData } from "@/lib/cookies";
import { useEffect } from "react";

interface Reservation {
  id: string;
  restaurantName: string;
  restaurantImage: string;
  date: string;
  time: string;
  partySize: number;
  status: "confirmed" | "pending" | "cancelled";
  specialRequests?: string;
}

const mockReservations: Reservation[] = [
  {
    id: "1",
    restaurantName: "The Golden Truffle",
    restaurantImage: "/images/Register.jpg",
    date: "Tomorrow",
    time: "7:30 PM",
    partySize: 2,
    status: "confirmed",
    specialRequests: "Anniversary dinner - quiet table preferred",
  },
  {
    id: "2",
    restaurantName: "Sakura Omakase",
    restaurantImage: "/images/Login.jpg",
    date: "FRI, OCT 25",
    time: "8:00 PM",
    partySize: 4,
    status: "confirmed",
  },
  {
    id: "3",
    restaurantName: "La Bella Italia",
    restaurantImage: "/images/Register.jpg",
    date: "SAT, OCT 26",
    time: "6:00 PM",
    partySize: 3,
    status: "pending",
    specialRequests: "Gluten-free options needed",
  },
];

export default function ReservationsPage() {
  const [user, setUser] = useState<any>(null);
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations);
  const [filter, setFilter] = useState<"all" | "upcoming" | "past" | "cancelled">("all");

  useEffect(() => {
    getUserData().then(setUser);
  }, []);

  const filteredReservations = reservations.filter((res) => {
    if (filter === "all") return res.status !== "cancelled";
    if (filter === "upcoming") return res.status === "confirmed" || res.status === "pending";
    if (filter === "cancelled") return res.status === "cancelled";
    return true;
  });

  const handleCancel = (id: string) => {
    if (confirm("Are you sure you want to cancel this reservation?")) {
      setReservations(reservations.map((res) =>
        res.id === id ? { ...res, status: "cancelled" as const } : res
      ));
    }
  };

  const getStatusBadge = (status: Reservation["status"]) => {
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
      <nav className="reservations-nav">
        <Link href="/dashboard/user" className="reservations-brand">
          <Image src="/images/Logo.png" alt="MealNest" width={40} height={40} />
          <span>MealNest</span>
        </Link>
        <div className="nav-user">
          <span>{user?.fullName || "User"}</span>
        </div>
      </nav>

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

        <div className="reservations-list">
          {filteredReservations.length === 0 ? (
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
              <div key={reservation.id} className={`reservation-card ${reservation.status}`}>
                <div className="reservation-image">
                  <Image
                    src={reservation.restaurantImage}
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
                      <strong>{reservation.date}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Time</span>
                      <strong>{reservation.time}</strong>
                    </div>
                    <div className="detail-item">
                      <span>Party Size</span>
                      <strong>{reservation.partySize} {reservation.partySize === 1 ? "Guest" : "Guests"}</strong>
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
                        <Link href={`/restaurants/${reservation.id}`} className="action-button secondary">
                          View Restaurant
                        </Link>
                        <button
                          className="action-button danger"
                          onClick={() => handleCancel(reservation.id)}
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
