"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import type { AdminRestaurantDetails } from "@/lib/api/admin";
import { getRestaurantImage } from "@/lib/restaurant-image";
import styles from "../admin.module.css";

type Tab = "overview" | "menu" | "bookings" | "reviews";
type Props = {
  open: boolean;
  details: AdminRestaurantDetails | null;
  loading: boolean;
  error: string;
  fallbackName: string;
  onClose: () => void;
};

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function label(value?: string) {
  if (!value) return "Not available";
  if (value === "esewa") return "eSewa";
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function Stars({ rating }: { rating: number }) {
  return <span className={styles.detailsStars} aria-label={`${rating} out of 5 stars`}>
    {Array.from({ length: 5 }, (_, index) => <span key={index} className={index < rating ? styles.detailsStarFilled : styles.detailsStarEmpty}>★</span>)}
  </span>;
}

export default function RestaurantDetailsModal({ open, details, loading, error, fallbackName, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("overview");
  const categories = useMemo(() => {
    const grouped = new Map<string, NonNullable<AdminRestaurantDetails["restaurant"]["menu"]>>();
    (details?.restaurant.menu || []).forEach((item) => {
      const category = item.category || (item.type === "drink" ? "Drinks" : "Menu");
      grouped.set(category, [...(grouped.get(category) || []), item]);
    });
    return [...grouped.entries()];
  }, [details]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open, onClose]);

  if (!open) return null;
  const restaurant = details?.restaurant;
  const closeModal = () => {
    setTab("overview");
    onClose();
  };

  return (
    <div className={styles.restaurantDetailsBackdrop} role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) closeModal();
    }}>
      <section className={styles.restaurantDetailsModal} role="dialog" aria-modal="true" aria-labelledby="restaurant-details-title">
        <header className={styles.restaurantDetailsHeader}>
          <div><h2 id="restaurant-details-title">Restaurant Details</h2><p>{restaurant?.name || fallbackName || "Selected restaurant"}</p></div>
          <button type="button" className={styles.userDetailsCloseIcon} aria-label="Close restaurant details" onClick={closeModal}>×</button>
        </header>

        <div className={styles.restaurantDetailsBody}>
          {loading && <div className={styles.userDetailsState}>Loading restaurant information...</div>}
          {!loading && error && <div className={styles.errorBanner}>{error}</div>}
          {!loading && !error && details && restaurant && (
            <>
              <nav className={styles.restaurantDetailsTabs} aria-label="Restaurant detail sections">
                {(["overview", "menu", "bookings", "reviews"] as Tab[]).map((item) => (
                  <button key={item} type="button" aria-pressed={tab === item} className={tab === item ? styles.restaurantDetailsTabActive : ""} onClick={() => setTab(item)}>{label(item)}</button>
                ))}
              </nav>

              {tab === "overview" && <div className={styles.restaurantDetailsSections}>
                <section className={styles.restaurantDetailsHero}>
                  <Image unoptimized src={getRestaurantImage(restaurant.image)} alt={restaurant.name} width={260} height={170} />
                  <div>
                    <h3>{restaurant.name}</h3>
                    <p>{restaurant.cuisine} · {restaurant.location}</p>
                    <span className={`${styles.detailsStatusBadge} ${restaurant.isOpen ? styles.detailsPublished : styles.detailsHidden}`}>{restaurant.isOpen ? "Available" : "Unavailable"}</span>
                    <p className={styles.restaurantDetailsDescription}>{restaurant.description || "No description provided."}</p>
                  </div>
                </section>

                <section><h3 className={styles.userDetailsSectionTitle}>Basic details</h3><dl className={styles.userDetailsGrid}>
                  <div><dt>Database ID</dt><dd className={styles.userDatabaseId}>{restaurant._id}</dd></div>
                  <div><dt>Availability</dt><dd>{restaurant.isOpen ? "Available" : "Unavailable"}</dd></div>
                  <div><dt>Created date</dt><dd>{formatDate(restaurant.createdAt)}</dd></div>
                  <div><dt>Last updated</dt><dd>{formatDate(restaurant.updatedAt)}</dd></div>
                  <div><dt>Cuisine</dt><dd>{restaurant.cuisine}</dd></div>
                  <div><dt>Location</dt><dd>{restaurant.location}</dd></div>
                </dl></section>

                <section><h3 className={styles.userDetailsSectionTitle}>Contact details</h3>
                  {!restaurant.phone && !restaurant.email && !restaurant.address ? <p className={styles.userDetailsEmpty}>Contact information not provided</p> : <dl className={styles.userDetailsGrid}>
                    <div><dt>Phone number</dt><dd>{restaurant.phone || "Not provided"}</dd></div>
                    <div><dt>Email address</dt><dd>{restaurant.email || "Not provided"}</dd></div>
                    <div><dt>Address</dt><dd>{restaurant.address || "Not provided"}</dd></div>
                  </dl>}
                </section>

                <section><h3 className={styles.userDetailsSectionTitle}>Dining information</h3><dl className={styles.userDetailsGrid}>
                  <div><dt>Opening time</dt><dd>{restaurant.openingTime || "Not provided"}</dd></div>
                  <div><dt>Closing time</dt><dd>{restaurant.closingTime || "Not provided"}</dd></div>
                  <div><dt>Price range</dt><dd>{restaurant.priceRange || "Not provided"}</dd></div>
                  <div><dt>Total tables</dt><dd>{restaurant.totalTables}</dd></div>
                  <div><dt>Maximum capacity</dt><dd>{restaurant.capacity || "Not provided"}</dd></div>
                  <div><dt>Available booking times</dt><dd>{restaurant.availableTimeSlots?.length ? restaurant.availableTimeSlots.join(", ") : "Not provided"}</dd></div>
                </dl></section>

                <section><h3 className={styles.userDetailsSectionTitle}>Restaurant activity</h3><div className={styles.restaurantActivityGrid}>
                  <div><strong>{details.activity.totalBookings}</strong><span>Total bookings</span></div>
                  <div><strong>{details.activity.confirmedBookings}</strong><span>Confirmed</span></div>
                  <div><strong>{details.activity.completedBookings}</strong><span>Completed</span></div>
                  <div><strong>{details.activity.cancelledBookings}</strong><span>Cancelled</span></div>
                  <div><strong>{details.activity.totalReviews}</strong><span>Total reviews</span></div>
                  <div><strong>{details.activity.averageRating.toFixed(1)}</strong><span>Average rating</span></div>
                  <div><strong>{details.activity.totalFavorites}</strong><span>Favourites</span></div>
                </div></section>
              </div>}

              {tab === "menu" && <section>
                <h3 className={styles.userDetailsSectionTitle}>Menu</h3>
                {categories.length === 0 ? <p className={styles.userDetailsEmpty}>No menu items found</p> : <div className={styles.restaurantMenuCategories}>
                  {categories.map(([category, items]) => <section key={category}><h4>{category}</h4><div>
                    {items.map((item, index) => <article key={`${item.name}-${index}`} className={styles.restaurantMenuItem}>
                      <div><strong>{item.name}</strong><p>{item.description || "No description provided."}</p></div>
                      <div><span>{item.price ? `Rs. ${item.price.toLocaleString()}` : "Price unavailable"}</span><small>{item.isAvailable === false ? "Unavailable" : "Available"}</small></div>
                    </article>)}
                  </div></section>)}
                </div>}
              </section>}

              {tab === "bookings" && <section>
                <h3 className={styles.userDetailsSectionTitle}>Recent bookings</h3>
                {details.bookings.length === 0 ? <p className={styles.userDetailsEmpty}>No bookings found</p> : <div className={styles.userDetailsTableWrap}><table className={styles.restaurantDetailsTable}>
                  <thead><tr><th>Customer</th><th>Date</th><th>Time</th><th>Guests</th><th>Payment</th><th>Status</th></tr></thead>
                  <tbody>{details.bookings.map((booking) => <tr key={booking._id}><td>{booking.customer?.name || "Deleted user"}</td><td>{formatDate(booking.reservationDate || booking.date)}</td><td>{booking.time}</td><td>{booking.guests}</td><td>{label(booking.paymentMethod)}</td><td>{label(booking.status)}</td></tr>)}</tbody>
                </table></div>}
              </section>}

              {tab === "reviews" && <section>
                <h3 className={styles.userDetailsSectionTitle}>Recent reviews</h3>
                {details.reviews.length === 0 ? <p className={styles.userDetailsEmpty}>No reviews found</p> : <div className={styles.userReviewList}>
                  {details.reviews.map((review) => <article key={review.id} className={styles.userReviewCard}><div className={styles.userReviewHeading}><div><strong>{review.customerName}</strong><Stars rating={review.rating} /></div><span className={`${styles.detailsStatusBadge} ${review.status === "hidden" ? styles.detailsHidden : styles.detailsPublished}`}>{label(review.status)}</span></div><p>{review.comment}</p><time dateTime={review.createdAt}>{formatDate(review.createdAt)}</time></article>)}
                </div>}
              </section>}
            </>
          )}
        </div>

        <footer className={styles.userDetailsFooter}><button type="button" className={styles.secondaryButton} onClick={closeModal}>Close</button></footer>
      </section>
    </div>
  );
}
