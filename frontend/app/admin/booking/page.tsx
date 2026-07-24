"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "../admin.module.css";
import { completeAdminBookingAction, getAdminBookingsAction } from "@/lib/actions/admin/booking-action";
import type { AdminBooking } from "@/lib/api/admin/booking";
import { getRestaurantImage } from "@/lib/restaurant-image";

type StatusFilter = "all" | AdminBooking["status"];

function formatDate(booking: AdminBooking) {
  const date = new Date(booking.reservationDate || booking.date);
  return Number.isNaN(date.getTime())
    ? booking.date
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function bookingMoment(booking: AdminBooking) {
  const dateText = String(booking.date || booking.reservationDate).slice(0, 10);
  const date = new Date(`${dateText}T00:00:00`);
  const match = booking.time?.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match || Number.isNaN(date.getTime())) return date;
  let hours = Number(match[1]);
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === "PM" && hours < 12) hours += 12;
  if (meridiem === "AM" && hours === 12) hours = 0;
  date.setHours(hours, Number(match[2]), 0, 0);
  return date;
}

function paymentLabel(payment?: string) {
  if (!payment) return "N/A";
  return payment === "esewa"
    ? "eSewa"
    : payment.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function AdminBookingsPage() {
  const [now] = useState(() => Date.now());
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<AdminBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [completingId, setCompletingId] = useState("");

  useEffect(() => {
    getAdminBookingsAction()
      .then((response) => setBookings(response.data || []))
      .catch((reason) => setError(reason instanceof Error ? reason.message : "Unable to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => bookings.filter((booking) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || [
      booking.restaurant?.name,
      booking.restaurantName,
      booking.customer?.fullName,
      booking.customer?.email,
      booking.bookingReference,
    ].some((value) => value?.toLowerCase().includes(term));
    return matchesSearch && (status === "all" || booking.status === status);
  }), [bookings, search, status]);

  const confirmed = bookings.filter((booking) => booking.status === "confirmed").length;
  const cancelled = bookings.filter((booking) => booking.status === "cancelled").length;

  async function markCompleted(booking: AdminBooking) {
    try {
      setCompletingId(booking._id);
      setError("");
      const response = await completeAdminBookingAction(booking._id);
      setBookings((current) => current.map((item) => item._id === booking._id ? { ...item, ...response.data } : item));
      setSelected((current) => current?._id === booking._id ? { ...current, ...response.data } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to complete this booking.");
    } finally {
      setCompletingId("");
    }
  }

  return (
    <div className={styles.adminRoot}>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <div className={styles.search}>
            <span aria-hidden>⌕</span>
            <input className={styles.searchInput} type="search" placeholder="Search restaurant, user, email, or reference..." value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
        </header>
        <section className={styles.content}>
          <div className={styles.pageHeading}>
            <div>
              <p className={styles.eyebrow}>Reservation directory</p>
              <h1>Bookings Management</h1>
              <p className={styles.subtitle}>Every real restaurant booking created by MealNest users.</p>
            </div>
          </div>

          <div className={styles.statsGrid}>
            {[
              ["Total Bookings", bookings.length],
              ["Confirmed", confirmed],
              ["Cancelled", cancelled],
              ["Users Booked", new Set(bookings.map((booking) => booking.customer?._id).filter(Boolean)).size],
            ].map(([label, value]) => (
              <article key={label} className={`${styles.card} ${styles.statCard}`}>
                <div><p className={styles.statLabel}>{label}</p><p className={styles.statValue}>{value}</p></div>
              </article>
            ))}
          </div>

          <section className={`${styles.card} ${styles.panel}`}>
            <div className={styles.restaurantFilters}>
              <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
                <option value="all">All statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className={styles.panelHeader}>
              <div>
                <h2 className={styles.panelTitle}>User Bookings</h2>
                <p className={styles.tableMeta}>Showing {filtered.length} of {bookings.length} bookings</p>
              </div>
            </div>
            {error && <div className={styles.errorBanner}>{error}</div>}
            <div className={styles.tableWrap}>
              <table className={styles.usersTable}>
                <thead><tr><th>Restaurant</th><th>Customer</th><th>Date &amp; Time</th><th>Guests</th><th>Payment</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={7}><div className={styles.emptyState}>Loading user bookings...</div></td></tr>
                  ) : error ? (
                    <tr><td colSpan={7}><div className={styles.emptyState}>Bookings could not be loaded.</div></td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7}><div className={styles.emptyState}>No user bookings found.</div></td></tr>
                  ) : filtered.map((booking) => (
                    <tr key={booking._id}>
                      <td>
                        <div className={styles.bookingRestaurantCell}>
                          <Image unoptimized src={getRestaurantImage(booking.restaurant?.image || booking.image)} alt={booking.restaurant?.name || booking.restaurantName} width={58} height={44} className={styles.restaurantThumbnail} />
                          <div><strong>{booking.restaurant?.name || booking.restaurantName}</strong><small>{booking.restaurant?.cuisine || booking.cuisine}</small></div>
                        </div>
                      </td>
                      <td><strong>{booking.customer?.fullName || "Deleted user"}</strong><small className={styles.tableSubtext}>{booking.customer?.email || "Account unavailable"}</small></td>
                      <td>{formatDate(booking)}<small className={styles.tableSubtext}>{booking.time}</small></td>
                      <td>{booking.guests}</td>
                      <td>{paymentLabel(booking.paymentMethod)}</td>
                      <td><span className={`${styles.bookingStatus} ${styles[`bookingStatus${booking.status[0].toUpperCase()}${booking.status.slice(1)}`]}`}>{booking.status}</span></td>
                      <td>
                        <div className={styles.bookingTableActions}>
                          <button type="button" className={styles.viewBookingButton} onClick={() => setSelected(booking)}>View</button>
                          {booking.status === "confirmed" && bookingMoment(booking).getTime() <= now && (
                            <button type="button" className={styles.completeBookingButton} disabled={completingId === booking._id} onClick={() => void markCompleted(booking)}>
                              {completingId === booking._id ? "Saving..." : "Mark Completed"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>

      {selected && (
        <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="admin-booking-details">
          <section className={`${styles.modal} ${styles.bookingDetailsModal}`}>
            <div className={styles.modalHeader}>
              <h2 id="admin-booking-details">Booking Details</h2>
              <button type="button" className={styles.iconButton} aria-label="Close" onClick={() => setSelected(null)}>×</button>
            </div>
            <Image unoptimized src={getRestaurantImage(selected.restaurant?.image || selected.image)} alt={selected.restaurant?.name || selected.restaurantName} width={640} height={250} className={styles.bookingDetailImage} />
            <dl className={styles.adminBookingDetails}>
              <div><dt>Restaurant</dt><dd>{selected.restaurant?.name || selected.restaurantName}</dd></div>
              <div><dt>Customer</dt><dd>{selected.customer?.fullName || "Deleted user"}</dd></div>
              <div><dt>Email</dt><dd>{selected.customer?.email || "N/A"}</dd></div>
              <div><dt>Date and time</dt><dd>{formatDate(selected)} at {selected.time}</dd></div>
              <div><dt>Guests</dt><dd>{selected.guests}</dd></div>
              <div><dt>Status</dt><dd>{selected.status}</dd></div>
              <div><dt>Payment</dt><dd>{paymentLabel(selected.paymentMethod)}</dd></div>
              <div><dt>Payment status</dt><dd>{paymentLabel(selected.paymentStatus)}</dd></div>
              <div><dt>Booking reference</dt><dd>{selected.bookingReference || selected._id}</dd></div>
              <div><dt>Transaction ID</dt><dd>{selected.transactionId || "N/A"}</dd></div>
              <div><dt>Special request</dt><dd>{selected.specialRequests || "None"}</dd></div>
            </dl>
            <div className={styles.modalActions}>
              {selected.status === "confirmed" && bookingMoment(selected).getTime() <= now && (
                <button type="button" className={styles.secondaryButton} disabled={completingId === selected._id} onClick={() => void markCompleted(selected)}>
                  {completingId === selected._id ? "Saving..." : "Mark Completed"}
                </button>
              )}
              <button type="button" className={styles.primaryButton} onClick={() => setSelected(null)}>Close</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
