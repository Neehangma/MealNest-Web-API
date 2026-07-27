"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { AdminUserDetails } from "@/lib/api/admin";
import styles from "../admin.module.css";

type DetailsTab = "overview" | "reservations" | "reviews";

type Props = {
  open: boolean;
  loading: boolean;
  error: string;
  details: AdminUserDetails | null;
  fallbackName: string;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function label(value?: string | null) {
  if (!value) return "Not available";
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.detailsStars} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? styles.detailsStarFilled : styles.detailsStarEmpty}>★</span>
      ))}
    </span>
  );
}

export default function UserDetailsModal({ open, loading, error, details, fallbackName, onClose }: Props) {
  const [tab, setTab] = useState<DetailsTab>("overview");

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const user = details?.user;
  const displayName = user?.fullName || fallbackName || "Selected user";
  const closeModal = () => {
    setTab("overview");
    onClose();
  };

  return (
    <div
      className={styles.userDetailsBackdrop}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeModal();
      }}
    >
      <section className={styles.userDetailsModal} role="dialog" aria-modal="true" aria-labelledby="user-details-title">
        <header className={styles.userDetailsHeader}>
          <div>
            <h2 id="user-details-title">User Details</h2>
            <p>{displayName}</p>
          </div>
          <button type="button" className={styles.userDetailsCloseIcon} aria-label="Close user details" onClick={closeModal}>×</button>
        </header>

        <div className={styles.userDetailsBody}>
          {loading && <div className={styles.userDetailsState}>Loading user information...</div>}
          {!loading && error && <div className={styles.errorBanner}>{error}</div>}

          {!loading && !error && details && user && (
            <>
              <nav className={styles.userDetailsTabs} aria-label="User detail sections">
                {(["overview", "reservations", "reviews"] as DetailsTab[]).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={tab === item ? styles.userDetailsTabActive : ""}
                    aria-pressed={tab === item}
                    onClick={() => setTab(item)}
                  >
                    {label(item)}
                  </button>
                ))}
              </nav>

              {tab === "overview" && (
                <div className={styles.userDetailsSections}>
                  <section className={styles.userIdentityCard}>
                    {user.profilePicture ? (
                      <Image className={styles.userDetailsAvatarImage} src={user.profilePicture} alt={`${displayName} profile`} width={72} height={72} />
                    ) : (
                      <span className={styles.userDetailsAvatar}>{initials(displayName)}</span>
                    )}
                    <div>
                      <h3>{displayName}</h3>
                      <p>{user.email}</p>
                      <span className={`${styles.detailsStatusBadge} ${user.isActive ? styles.detailsPublished : styles.detailsHidden}`}>
                        {label(user.accountStatus)}
                      </span>
                    </div>
                  </section>

                  <section>
                    <h3 className={styles.userDetailsSectionTitle}>Personal information</h3>
                    <dl className={styles.userDetailsGrid}>
                      <div><dt>Full name</dt><dd>{displayName}</dd></div>
                      <div><dt>Email address</dt><dd>{user.email}</dd></div>
                      <div><dt>Phone number</dt><dd>{user.phoneNumber || "Not available"}</dd></div>
                      <div><dt>User role</dt><dd>{label(user.role)}</dd></div>
                      <div><dt>Account created</dt><dd>{formatDate(user.createdAt)}</dd></div>
                      <div><dt>Last profile update</dt><dd>{formatDate(user.updatedAt)}</dd></div>
                    </dl>
                  </section>

                  <section>
                    <h3 className={styles.userDetailsSectionTitle}>Account information</h3>
                    <dl className={styles.userDetailsGrid}>
                      <div><dt>Database ID</dt><dd className={styles.userDatabaseId}>{user.id}</dd></div>
                      <div><dt>Authentication provider</dt><dd>{label(user.authenticationProvider)}</dd></div>
                      <div><dt>Email verification</dt><dd>{user.emailVerified === null ? "Not available" : user.emailVerified ? "Verified" : "Not verified"}</dd></div>
                      <div><dt>Account status</dt><dd>{label(user.accountStatus)}</dd></div>
                    </dl>
                  </section>

                  <section>
                    <h3 className={styles.userDetailsSectionTitle}>MealNest activity</h3>
                    <div className={styles.userActivityGrid}>
                      <div><strong>{details.activity.totalReservations}</strong><span>Total reservations</span></div>
                      <div><strong>{details.activity.upcomingReservations}</strong><span>Upcoming</span></div>
                      <div><strong>{details.activity.completedReservations}</strong><span>Completed</span></div>
                      <div><strong>{details.activity.cancelledReservations}</strong><span>Cancelled</span></div>
                      <div><strong>{details.activity.totalReviews}</strong><span>Total reviews</span></div>
                      <div><strong>{details.activity.averageReviewRating.toFixed(1)}</strong><span>Average rating</span></div>
                      <div><strong>{details.activity.totalFavorites}</strong><span>Favourites</span></div>
                    </div>
                    {details.favorites.length > 0 ? (
                      <p className={styles.favoriteNames}><strong>Favourite restaurants:</strong> {details.favorites.map((favorite) => favorite.name).join(", ")}</p>
                    ) : (
                      <p className={styles.userDetailsEmpty}>No favourite restaurants</p>
                    )}
                  </section>
                </div>
              )}

              {tab === "reservations" && (
                <section>
                  <h3 className={styles.userDetailsSectionTitle}>Recent reservations</h3>
                  {details.reservations.length === 0 ? (
                    <p className={styles.userDetailsEmpty}>No reservations found</p>
                  ) : (
                    <div className={styles.userDetailsTableWrap}>
                      <table className={styles.userDetailsTable}>
                        <thead><tr><th>Restaurant</th><th>Date</th><th>Time</th><th>Guests</th><th>Table</th><th>Payment</th><th>Status</th><th>Amount</th></tr></thead>
                        <tbody>
                          {details.reservations.map((reservation) => (
                            <tr key={reservation.id}>
                              <td>{reservation.restaurantName}</td>
                              <td>{formatDate(reservation.reservationDate)}</td>
                              <td>{reservation.time}</td>
                              <td>{reservation.guests}</td>
                              <td>{reservation.tableNumber ?? "—"}</td>
                              <td>{label(reservation.paymentStatus)}</td>
                              <td>{label(reservation.status)}</td>
                              <td>{reservation.totalAmount > 0 ? `Rs. ${reservation.totalAmount.toLocaleString()}` : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {tab === "reviews" && (
                <section>
                  <h3 className={styles.userDetailsSectionTitle}>Recent reviews</h3>
                  {details.reviews.length === 0 ? (
                    <p className={styles.userDetailsEmpty}>No reviews submitted</p>
                  ) : (
                    <div className={styles.userReviewList}>
                      {details.reviews.map((review) => (
                        <article key={review.id} className={styles.userReviewCard}>
                          <div className={styles.userReviewHeading}>
                            <div><strong>{review.restaurantName}</strong><Stars rating={review.rating} /></div>
                            <span className={`${styles.detailsStatusBadge} ${review.status === "hidden" ? styles.detailsHidden : styles.detailsPublished}`}>{label(review.status)}</span>
                          </div>
                          <p>{review.comment}</p>
                          <time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </div>

        <footer className={styles.userDetailsFooter}>
          <button type="button" className={styles.secondaryButton} onClick={closeModal}>Close</button>
        </footer>
      </section>
    </div>
  );
}
