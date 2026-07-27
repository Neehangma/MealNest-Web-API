"use client";

import { useEffect, useState } from "react";
import { getRestaurantReviews, type ReviewItem } from "@/lib/api/dashboard";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="restaurant-review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= rating ? "selected" : ""}>&#9733;</span>)}
    </span>
  );
}

export default function RestaurantReviews({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadReviews() {
    try {
      setLoading(true);
      setError("");
      const response = await getRestaurantReviews(restaurantId);
      setReviews(response.reviews || response.data || []);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Reviews could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    getRestaurantReviews(restaurantId)
      .then((response) => {
        if (active) setReviews(response.reviews || response.data || []);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Reviews could not be loaded.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [restaurantId]);

  const average = reviews.length
    ? (reviews.reduce((total, review) => total + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <section className="info-section restaurant-reviews-section">
      <div className="restaurant-reviews-heading">
        <h2>Reviews</h2>
        {!loading && reviews.length > 0 && <span><strong>{average}</strong> / 5 &middot; {reviews.length} review{reviews.length === 1 ? "" : "s"}</span>}
      </div>
      {loading && <p>Loading reviews...</p>}
      {error && <div className="restaurant-reviews-error"><p>{error}</p><button type="button" onClick={() => void loadReviews()}>Retry</button></div>}
      {!loading && !error && reviews.length === 0 && <p>No reviews yet. Completed diners can be the first to share their experience.</p>}
      {!loading && !error && reviews.length > 0 && (
        <div className="restaurant-review-list">
          {reviews.map((review) => (
            <article key={review._id} className="restaurant-review-item">
              <div>
                <strong>{review.userName}</strong>
                <ReviewStars rating={review.rating} />
              </div>
              <p>{review.comment}</p>
              <time dateTime={review.createdAt}>{new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })}</time>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
