"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReservationItem } from "@/lib/api/dashboard";
import { cancelReservationAction, getReservationsAction } from "@/lib/actions/reservation-action";
import { getRestaurantImage } from "@/lib/restaurant-image";

type Filter = "all" | "upcoming" | "past" | "cancelled";

function bookingDate(booking: ReservationItem) {
  return new Date(booking.reservationDate || booking.date);
}

function bookingMoment(booking: ReservationItem) {
  const date = bookingDate(booking);
  const match = booking.time?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match || Number.isNaN(date.getTime())) return date;
  let hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  date.setHours(hours, Number(match[2]), 0, 0);
  return date;
}

function displayDate(booking: ReservationItem) {
  const date = bookingDate(booking);
  return Number.isNaN(date.getTime()) ? booking.date : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function canCancel(booking: ReservationItem) {
  return ["pending", "confirmed"].includes(booking.status.toLowerCase()) && bookingMoment(booking).getTime() > Date.now();
}

function paymentLabel(value?: string) {
  if (!value) return "Not specified";
  return value === "esewa" ? "eSewa" : value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function ReservationsPage() {
  const [bookings, setBookings] = useState<ReservationItem[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<ReservationItem | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ReservationItem | null>(null);
  const [cancelling, setCancelling] = useState(false);

  async function loadBookings() {
    try {
      setLoading(true); setError("");
      setBookings(await getReservationsAction());
    } catch {
      setError("We could not load your bookings.");
    } finally { setLoading(false); }
  }

  useEffect(() => { void loadBookings(); }, []);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const cancelled = booking.status === "cancelled";
    const past = bookingDate(booking).getTime() < new Date().setHours(0, 0, 0, 0);
    if (filter === "cancelled") return cancelled;
    if (filter === "past") return past && !cancelled;
    if (filter === "upcoming") return !past && !cancelled;
    return true;
  }), [bookings, filter]);

  async function confirmCancel() {
    if (!cancelTarget) return;
    try {
      setCancelling(true); setError("");
      await cancelReservationAction(cancelTarget._id);
      setCancelTarget(null);
      await loadBookings();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to cancel this booking.");
      setCancelTarget(null);
    } finally { setCancelling(false); }
  }

  return <main className="reservations-page">
    <div className="reservations-container">
      <header className="reservations-header">
        <div><h1>My Reservations</h1><p>Restaurants you have personally booked with MealNest.</p></div>
        <Link href="/dashboard/user#restaurants" className="new-reservation-button">+ New Reservation</Link>
      </header>

      <div className="filter-tabs" aria-label="Filter bookings">
        {(["all", "upcoming", "past", "cancelled"] as Filter[]).map((item) => <button key={item} type="button" aria-pressed={filter === item} className={`filter-tab ${filter === item ? "active" : ""}`} onClick={() => setFilter(item)}>{item[0].toUpperCase() + item.slice(1)}</button>)}
      </div>

      {error && <p className="profile-action-message error">{error}</p>}
      {loading && <div className="user-bookings-state">Loading your bookings...</div>}

      {!loading && !error && bookings.length === 0 && <div className="user-bookings-state empty-state"><h2>You have not booked any restaurants yet.</h2><p>Discover a restaurant and reserve your next meal.</p><Link href="/dashboard/user#restaurants" className="browse-button">Discover Restaurants</Link></div>}
      {!loading && !error && bookings.length > 0 && filtered.length === 0 && <div className="user-bookings-state">No {filter} bookings found.</div>}

      {!loading && <div className="user-booking-list">{filtered.map((booking) => {
        const restaurant = booking.restaurant;
        const name = restaurant?.name || booking.restaurantName;
        return <article className="user-booking-card" key={booking._id}>
          <img className="user-booking-image" src={getRestaurantImage(restaurant?.image || booking.image)} alt={name} />
          <div className="user-booking-content">
            <div className="user-booking-header"><div><h2>{name}</h2><p>{restaurant?.cuisine || booking.cuisine}{(restaurant?.location || booking.location) ? ` • ${restaurant?.location || booking.location}` : ""}</p></div><span className={`user-booking-status status-${booking.status.toLowerCase()}`}>{booking.status}</span></div>
            <div className="user-booking-grid">
              <div><span>Date</span><strong>{displayDate(booking)}</strong></div>
              <div><span>Time</span><strong>{booking.time}</strong></div>
              <div><span>Guests</span><strong>{booking.guests}</strong></div>
              <div><span>Payment</span><strong>{paymentLabel(booking.paymentMethod)}</strong></div>
              <div className="booking-reference"><span>Booking reference</span><strong>{booking.bookingReference || booking._id.slice(-8).toUpperCase()}</strong></div>
            </div>
            <div className="user-booking-actions"><button type="button" className="action-button secondary" onClick={() => setDetails(booking)}>View Details</button>{canCancel(booking) && <button type="button" className="action-button danger" onClick={() => setCancelTarget(booking)}>Cancel Booking</button>}</div>
          </div>
        </article>;
      })}</div>}
    </div>

    {details && <div className="booking-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="booking-details-title" onMouseDown={(event) => { if (event.target === event.currentTarget) setDetails(null); }}><section className="booking-details-modal"><button type="button" className="booking-modal-close" aria-label="Close booking details" onClick={() => setDetails(null)}>×</button><img src={getRestaurantImage(details.restaurant?.image || details.image)} alt={details.restaurant?.name || details.restaurantName} /><div className="booking-modal-body"><div className="user-booking-header"><div><h2 id="booking-details-title">{details.restaurant?.name || details.restaurantName}</h2><p>{details.restaurant?.cuisine || details.cuisine} • {details.restaurant?.location || details.location}</p></div><span className={`user-booking-status status-${details.status.toLowerCase()}`}>{details.status}</span></div><dl className="booking-details-list"><div><dt>Address</dt><dd>{details.restaurant?.address || details.restaurantAddress || "Not provided"}</dd></div><div><dt>Phone</dt><dd>{details.restaurant?.phone || details.restaurantPhone || "Not provided"}</dd></div><div><dt>Date and time</dt><dd>{displayDate(details)} at {details.time}</dd></div><div><dt>Guests</dt><dd>{details.guests}</dd></div><div><dt>Payment</dt><dd>{paymentLabel(details.paymentMethod)}</dd></div><div><dt>Booking reference</dt><dd>{details.bookingReference || details._id}</dd></div><div><dt>Transaction ID</dt><dd>{details.transactionId || details.bookingReference || "Not available"}</dd></div><div><dt>Special request</dt><dd>{details.specialRequests || "None"}</dd></div><div><dt>Booked on</dt><dd>{details.createdAt ? new Date(details.createdAt).toLocaleString() : "Not available"}</dd></div></dl></div></section></div>}

    {cancelTarget && <div className="booking-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="cancel-booking-title"><section className="booking-cancel-modal"><h2 id="cancel-booking-title">Cancel Booking?</h2><p>Cancel your reservation at <strong>{cancelTarget.restaurant?.name || cancelTarget.restaurantName}</strong>? This action cannot be undone.</p><div className="booking-cancel-actions"><button type="button" className="action-button secondary" disabled={cancelling} onClick={() => setCancelTarget(null)}>Keep Booking</button><button type="button" className="action-button danger" disabled={cancelling} onClick={() => void confirmCancel()}>{cancelling ? "Cancelling..." : "Cancel Booking"}</button></div></section></div>}
  </main>;
}
