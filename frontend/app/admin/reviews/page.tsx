"use client";

import { useEffect, useState } from "react";
import ConfirmationModal from "../_components/ConfirmationModal";
import styles from "../admin.module.css";
import {
  deleteAdminReviewAction,
  getAdminReviewsAction,
  updateAdminReviewStatusAction,
} from "@/lib/actions/admin/review-action";
import type { AdminReview, AdminReviewStatus } from "@/lib/api/admin/review";

type PendingAction = { type: "status"; review: AdminReview; status: AdminReviewStatus } | { type: "delete"; review: AdminReview };

function Stars({ rating }: { rating: number }) {
  return <span className={styles.adminReviewStars} aria-label={`${rating} out of 5 stars`}>
    {[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= rating ? styles.adminReviewStarFilled : ""}>&#9733;</span>)}
  </span>;
}

function displayDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [restaurantOptions, setRestaurantOptions] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [rating, setRating] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError("");
      setPage(1);
      setSearchQuery(search.trim());
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    getAdminReviewsAction({
      page,
      limit: 10,
      search: searchQuery,
      restaurantId,
      rating: rating ? Number(rating) : undefined,
      status: status as "all" | AdminReviewStatus,
      sort,
    })
      .then((response) => {
        if (!active) return;
        setReviews(response.data || []);
        setRestaurantOptions(response.restaurantOptions || []);
        setTotal(response.meta.total);
        setTotalPages(Math.max(response.meta.totalPages, 1));
      })
      .catch((reason) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load reviews.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [page, rating, restaurantId, searchQuery, sort, status]);

  function resetPageAnd(setter: (value: string) => void, value: string) {
    setLoading(true);
    setError("");
    setPage(1);
    setter(value);
  }

  async function confirmAction() {
    if (!pendingAction || saving) return;
    try {
      setSaving(true);
      setError("");
      setSuccess("");
      if (pendingAction.type === "delete") {
        await deleteAdminReviewAction(pendingAction.review._id);
        setReviews((current) => current.filter((review) => review._id !== pendingAction.review._id));
        setTotal((current) => Math.max(0, current - 1));
        setSelected((current) => current?._id === pendingAction.review._id ? null : current);
        setSuccess("Review permanently deleted.");
      } else {
        const response = await updateAdminReviewStatusAction(pendingAction.review._id, pendingAction.status);
        setReviews((current) => current.map((review) => review._id === response.data._id ? { ...review, status: response.data.status } : review));
        setSelected((current) => current?._id === response.data._id ? { ...current, status: response.data.status } : current);
        setSuccess(response.data.status === "hidden" ? "Review hidden successfully." : "Review published successfully.");
      }
      setPendingAction(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Review action failed.");
      setPendingAction(null);
    } finally {
      setSaving(false);
    }
  }

  const confirmationMessage = pendingAction?.type === "delete"
    ? "Are you sure you want to permanently delete this review?"
    : pendingAction?.status === "hidden"
      ? "Are you sure you want to hide this review?"
      : "Are you sure you want to publish this review?";

  return <div className={styles.adminRoot}>
    <main className={styles.main}>
      <header className={styles.topbar}>
        <div className={styles.search}>
          <span aria-hidden>&#8981;</span>
          <input className={styles.searchInput} type="search" placeholder="Search customer, restaurant, or review..." value={search} onChange={(event) => setSearch(event.target.value)} />
        </div>
      </header>
      <section className={styles.content}>
        <div className={styles.pageHeading}>
          <div>
            <p className={styles.eyebrow}>Customer feedback</p>
            <h1>Reviews Management</h1>
            <p className={styles.subtitle}>Moderate real reviews submitted after MealNest reservations.</p>
          </div>
        </div>

        {error && <div className={styles.errorBanner}>{error}</div>}
        {success && <div className={styles.successBanner}>{success}</div>}

        <section className={`${styles.card} ${styles.panel}`}>
          <div className={styles.adminReviewFilters}>
            <select aria-label="Filter by restaurant" value={restaurantId} onChange={(event) => resetPageAnd(setRestaurantId, event.target.value)}>
              <option value="">All restaurants</option>
              {restaurantOptions.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>)}
            </select>
            <select aria-label="Filter by star rating" value={rating} onChange={(event) => resetPageAnd(setRating, event.target.value)}>
              <option value="">All ratings</option>
              {[5, 4, 3, 2, 1].map((value) => <option key={value} value={value}>{value} star{value === 1 ? "" : "s"}</option>)}
            </select>
            <select aria-label="Filter by review status" value={status} onChange={(event) => resetPageAnd(setStatus, event.target.value)}>
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="hidden">Hidden</option>
            </select>
            <select aria-label="Sort reviews" value={sort} onChange={(event) => { setLoading(true); setError(""); setPage(1); setSort(event.target.value as typeof sort); }}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="highest">Highest rating</option>
              <option value="lowest">Lowest rating</option>
            </select>
          </div>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>User Reviews</h2>
              <p className={styles.tableMeta}>{loading ? "Loading reviews..." : `${total} review${total === 1 ? "" : "s"} found`}</p>
            </div>
          </div>
          <div className={styles.tableWrap}>
            <table className={styles.usersTable}>
              <thead><tr><th>Customer</th><th>Restaurant</th><th>Rating</th><th>Review</th><th>Reservation</th><th>Submitted</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {loading ? <tr><td colSpan={8}><div className={styles.emptyState}>Loading user reviews...</div></td></tr>
                  : reviews.length === 0 ? <tr><td colSpan={8}><div className={styles.emptyState}>No reviews match the selected filters.</div></td></tr>
                    : reviews.map((review) => <tr key={review._id}>
                      <td><strong>{review.customer.name}</strong><small className={styles.tableSubtext}>{review.customer.email || "Email unavailable"}</small></td>
                      <td><strong>{review.restaurant.name}</strong><small className={styles.tableSubtext}>{review.restaurant.cuisine || "Cuisine unavailable"}</small></td>
                      <td><Stars rating={review.rating} /></td>
                      <td><p className={styles.adminReviewExcerpt}>{review.comment}</p></td>
                      <td>{displayDate(review.reservation?.date || review.reservation?.reservationDate)}<small className={styles.tableSubtext}>{review.reservation?.time || ""}</small></td>
                      <td>{displayDate(review.createdAt)}</td>
                      <td><span className={`${styles.reviewStatusBadge} ${review.status === "hidden" ? styles.reviewStatusHidden : styles.reviewStatusPublished}`}>{review.status}</span></td>
                      <td><div className={styles.adminReviewActions}>
                        <button type="button" onClick={() => setSelected(review)}>View</button>
                        <button type="button" onClick={() => setPendingAction({ type: "status", review, status: review.status === "hidden" ? "published" : "hidden" })}>{review.status === "hidden" ? "Publish" : "Hide"}</button>
                        <button type="button" className={styles.adminReviewDelete} onClick={() => setPendingAction({ type: "delete", review })}>Delete</button>
                      </div></td>
                    </tr>)}
              </tbody>
            </table>
          </div>
          <div className={styles.adminReviewPagination}>
            <button type="button" disabled={page <= 1 || loading} onClick={() => { setLoading(true); setPage((value) => value - 1); }}>Previous</button>
            <span>Page {page} of {totalPages}</span>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => { setLoading(true); setPage((value) => value + 1); }}>Next</button>
          </div>
        </section>
      </section>
    </main>

    {selected && <div className={styles.modalBackdrop} role="dialog" aria-modal="true" aria-labelledby="admin-review-details">
      <section className={`${styles.modal} ${styles.adminReviewModal}`}>
        <div className={styles.modalHeader}><h2 id="admin-review-details">Review Details</h2><button type="button" className={styles.iconButton} aria-label="Close" onClick={() => setSelected(null)}>&times;</button></div>
        <dl className={styles.adminReviewDetails}>
          <div><dt>Customer</dt><dd>{selected.customer.name}</dd></div>
          <div><dt>Email</dt><dd>{selected.customer.email || "Not available"}</dd></div>
          <div><dt>Restaurant</dt><dd>{selected.restaurant.name}</dd></div>
          <div><dt>Cuisine</dt><dd>{selected.restaurant.cuisine || "Not available"}</dd></div>
          <div><dt>Rating</dt><dd><Stars rating={selected.rating} /></dd></div>
          <div><dt>Status</dt><dd>{selected.status}</dd></div>
          <div><dt>Reservation</dt><dd>{displayDate(selected.reservation?.date || selected.reservation?.reservationDate)} at {selected.reservation?.time || "N/A"}</dd></div>
          <div><dt>Submitted</dt><dd>{displayDate(selected.createdAt)}</dd></div>
          <div className={styles.adminReviewComment}><dt>Review</dt><dd>{selected.comment}</dd></div>
        </dl>
        <div className={styles.modalActions}><button type="button" className={styles.primaryButton} onClick={() => setSelected(null)}>Close</button></div>
      </section>
    </div>}

    <ConfirmationModal
      open={Boolean(pendingAction)}
      title={pendingAction?.type === "delete" ? "Delete Review?" : pendingAction?.status === "hidden" ? "Hide Review?" : "Publish Review?"}
      message={confirmationMessage}
      confirming={saving}
      onNo={() => setPendingAction(null)}
      onYes={() => void confirmAction()}
    />
  </div>;
}
