"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { AdminBooking, GroupedAdminBooking } from "@/lib/api/admin/booking";
import { getRestaurantImage } from "@/lib/restaurant-image";
import styles from "../admin.module.css";

type Props = {
  group: GroupedAdminBooking | null;
  bookings: AdminBooking[];
  loading: boolean;
  error: string;
  completingId: string;
  onClose: () => void;
  onComplete: (booking: AdminBooking) => void | Promise<void>;
};

function formatDate(value?: string) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "N/A"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function label(value?: string) {
  if (!value) return "N/A";
  if (value === "esewa") return "eSewa";
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
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

export default function RestaurantBookingsModal({ group, bookings, loading, error, completingId, onClose, onComplete }: Props) {
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null);
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!group) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedBooking(null);
        onClose();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [group, onClose]);

  if (!group) return null;

  const closeModal = () => {
    setSelectedBooking(null);
    onClose();
  };
  const completeBooking = async (booking: AdminBooking) => {
    await onComplete(booking);
    setSelectedBooking((current) => current?._id === booking._id ? { ...current, status: "completed" } : current);
  };

  return (
    <div className={styles.restaurantBookingsBackdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeModal();
    }}>
      <section className={styles.restaurantBookingsModal} role="dialog" aria-modal="true" aria-labelledby="restaurant-bookings-title">
        <header className={styles.restaurantBookingsHeader}>
          <div className={styles.restaurantBookingsIdentity}>
            <Image unoptimized src={getRestaurantImage(group.restaurantImage)} alt={group.restaurantName} width={70} height={54} />
            <div>
              <h2 id="restaurant-bookings-title">{group.restaurantName}</h2>
              <p>{group.cuisine} · {group.totalBookings} {group.totalBookings === 1 ? "booking" : "bookings"}</p>
            </div>
          </div>
          <button type="button" className={styles.userDetailsCloseIcon} aria-label="Close restaurant bookings" onClick={closeModal}>×</button>
        </header>

        <div className={styles.restaurantBookingsBody}>
          {error && <div className={styles.errorBanner}>{error}</div>}
          {loading ? (
            <div className={styles.userDetailsState}>Loading restaurant bookings...</div>
          ) : bookings.length === 0 ? (
            <div className={styles.userDetailsEmpty}>No bookings found for this restaurant.</div>
          ) : (
            <div className={styles.userDetailsTableWrap}>
              <table className={styles.restaurantBookingsTable}>
                <thead>
                  <tr>
                    <th>Customer</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th>
                    <th>Payment</th><th>Payment Status</th><th>Booking Status</th><th>Amount</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td><strong>{booking.customer?.fullName || "Deleted user"}</strong><small>{booking.customer?.email || "Account unavailable"}</small></td>
                      <td>{formatDate(booking.reservationDate || booking.date)}</td>
                      <td>{booking.time}</td>
                      <td>{booking.guests}</td>
                      <td>{booking.tableNumber ?? "—"}</td>
                      <td>{label(booking.paymentMethod)}</td>
                      <td>{label(booking.paymentStatus)}</td>
                      <td><span className={`${styles.bookingStatus} ${styles[`bookingStatus${booking.status[0].toUpperCase()}${booking.status.slice(1)}`]}`}>{label(booking.status)}</span></td>
                      <td>{booking.totalPaid ? `Rs. ${booking.totalPaid.toLocaleString()}` : "—"}</td>
                      <td>{formatDate(booking.createdAt)}</td>
                      <td>
                        <div className={styles.modalBookingActions}>
                          <button type="button" className={styles.compactBookingAction} onClick={() => setSelectedBooking(booking)}>View</button>
                          {booking.status === "confirmed" && bookingMoment(booking).getTime() <= now && (
                            <button type="button" className={styles.completeBookingButton} disabled={completingId === booking._id} onClick={() => void completeBooking(booking)}>
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
          )}
        </div>

        <footer className={styles.userDetailsFooter}>
          <button type="button" className={styles.secondaryButton} onClick={closeModal}>Close</button>
        </footer>
      </section>

      {selectedBooking && (
        <div className={styles.bookingRecordOverlay} role="dialog" aria-modal="true" aria-labelledby="individual-booking-title">
          <section className={styles.bookingRecordModal}>
            <div className={styles.modalHeader}>
              <h2 id="individual-booking-title">Booking Details</h2>
              <button type="button" className={styles.userDetailsCloseIcon} aria-label="Close booking details" onClick={() => setSelectedBooking(null)}>×</button>
            </div>
            <dl className={styles.adminBookingDetails}>
              <div><dt>Restaurant</dt><dd>{group.restaurantName}</dd></div>
              <div><dt>Customer</dt><dd>{selectedBooking.customer?.fullName || "Deleted user"}</dd></div>
              <div><dt>Email</dt><dd>{selectedBooking.customer?.email || "N/A"}</dd></div>
              <div><dt>Date and time</dt><dd>{formatDate(selectedBooking.reservationDate)} at {selectedBooking.time}</dd></div>
              <div><dt>Guests</dt><dd>{selectedBooking.guests}</dd></div>
              <div><dt>Table number</dt><dd>{selectedBooking.tableNumber ?? "N/A"}</dd></div>
              <div><dt>Status</dt><dd>{label(selectedBooking.status)}</dd></div>
              <div><dt>Payment</dt><dd>{label(selectedBooking.paymentMethod)}</dd></div>
              <div><dt>Payment status</dt><dd>{label(selectedBooking.paymentStatus)}</dd></div>
              <div><dt>Total amount</dt><dd>{selectedBooking.totalPaid ? `Rs. ${selectedBooking.totalPaid.toLocaleString()}` : "N/A"}</dd></div>
              <div><dt>Booking reference</dt><dd>{selectedBooking.bookingReference || selectedBooking._id}</dd></div>
              <div><dt>Created date</dt><dd>{formatDate(selectedBooking.createdAt)}</dd></div>
              <div><dt>Transaction ID</dt><dd>{selectedBooking.transactionId || "N/A"}</dd></div>
              <div><dt>Special request</dt><dd>{selectedBooking.specialRequests || "None"}</dd></div>
            </dl>
            <div className={styles.modalActions}>
              {selectedBooking.status === "confirmed" && bookingMoment(selectedBooking).getTime() <= now && (
                <button type="button" className={styles.secondaryButton} disabled={completingId === selectedBooking._id} onClick={() => void completeBooking(selectedBooking)}>
                  {completingId === selectedBooking._id ? "Saving..." : "Mark Completed"}
                </button>
              )}
              <button type="button" className={styles.primaryButton} onClick={() => setSelectedBooking(null)}>Close</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
