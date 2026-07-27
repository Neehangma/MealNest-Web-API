"use client";

import { useEffect, useState } from "react";
import { getRestaurantReviews, type PublicReviewItem } from "@/lib/api/dashboard";

function ReviewStars({ rating }: { rating: number }) {
  return (
    <span className="restaurant-review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => <span key={star} className={star <= rating ? "selected" : ""}>&#9733;</span>)}
    </span>
  );
}

export default function RestaurantReviews({ restaurantId }: { restaurantId: string }) {
  const [reviews, setReviews] = useState<PublicReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const fetchReviews = () => getRestaurantReviews(restaurantId)
      .then((response) => {
        if (!active) return;
        setError("");
        setReviews(response.reviews || response.data || []);
      })
      .catch((reason: unknown) => {
        console.error(`Unable to load reviews for restaurant ${restaurantId}:`, reason);
        if (active) setError("Reviews are temporarily unavailable.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    void fetchReviews();
    const handleReviewSaved = (event: Event) => {
      const savedRestaurantId = (event as CustomEvent<{ restaurantId?: string }>).detail?.restaurantId;
      if (savedRestaurantId !== restaurantId) return;
      setLoading(true);
      void fetchReviews();
    };
    window.addEventListener("mealnest-review-saved", handleReviewSaved);
    return () => {
      active = false;
      window.removeEventListener("mealnest-review-saved", handleReviewSaved);
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
      {!loading && error && <p>{error}</p>}
      {!loading && !error && reviews.length === 0 && <p>No reviews yet. Be the first to review this restaurant after completing a reservation.</p>}
      {!loading && !error && reviews.length > 0 && (
        <div className="restaurant-review-list">
          {reviews.map((review) => (
            <article key={review._id} className="restaurant-review-item">
              <div>
                <strong>{review.userName || "MealNest User"}</strong>
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
