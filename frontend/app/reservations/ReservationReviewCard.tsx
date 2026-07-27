"use client";

import { FormEvent, useState } from "react";
import { createReviewAction, updateReviewAction } from "@/lib/actions/review-action";
import type { ReviewItem } from "@/lib/api/dashboard";

type Props = {
  reservationId: string;
  restaurantId: string;
  initialReview?: ReviewItem;
  onSaved: (review: ReviewItem) => void;
};

function Stars({ rating, interactive = false, onSelect }: { rating: number; interactive?: boolean; onSelect?: (rating: number) => void }) {
  return (
    <div className="review-stars" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= rating ? "selected" : ""}
          aria-label={`Rate ${star} star${star === 1 ? "" : "s"}`}
          disabled={!interactive}
          onClick={() => onSelect?.(star)}
        >
          &#9733;
        </button>
      ))}
    </div>
  );
}

export default function ReservationReviewCard({ reservationId, restaurantId, initialReview, onSaved }: Props) {
  const [review, setReview] = useState(initialReview);
  const [editing, setEditing] = useState(!initialReview);
  const [rating, setRating] = useState(initialReview?.rating || 0);
  const [comment, setComment] = useState(initialReview?.comment || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedComment = comment.trim();
    setError("");
    setMessage("");
    if (!rating) {
      setError("Please select a star rating.");
      return;
    }
    if (!trimmedComment) {
      setError("Please write a review.");
      return;
    }

    try {
      setSubmitting(true);
      const response = review
        ? await updateReviewAction(restaurantId, review._id, { rating, comment: trimmedComment })
        : await createReviewAction(restaurantId, { reservationId, rating, comment: trimmedComment });
      setReview(response.review);
      setRating(response.review.rating);
      setComment(response.review.comment);
      setEditing(false);
      setMessage(review ? "Review updated successfully." : "Review submitted successfully.");
      onSaved(response.review);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to submit your review.");
    } finally {
      setSubmitting(false);
    }
  }

  if (review && !editing) {
    return (
      <section className="reservation-review-card review-submitted" aria-label="Review Submitted">
        <div className="review-submitted-heading">
          <div>
            <h3>Review Submitted</h3>
            <Stars rating={review.rating} />
          </div>
          <button type="button" className="review-edit-button" onClick={() => { setEditing(true); setMessage(""); }}>Edit Review</button>
        </div>
        <p>{review.comment}</p>
        {message && <p className="review-message success" role="status">{message}</p>}
      </section>
    );
  }

  return (
    <section className="reservation-review-card">
      <div className="review-note">Note: Reviews can only be submitted after your reservation has been completed.</div>
      <h3>Rate Your Experience</h3>
      <form onSubmit={submit} noValidate>
        <Stars rating={rating} interactive onSelect={(value) => { setRating(value); setError(""); }} />
        <label htmlFor={`review-comment-${reservationId}`}>Your review</label>
        <textarea
          id={`review-comment-${reservationId}`}
          value={comment}
          maxLength={500}
          rows={4}
          placeholder="Tell us about your dining experience..."
          onChange={(event) => { setComment(event.target.value); setError(""); }}
        />
        {error && <p className="review-message error" role="alert">{error}</p>}
        <button type="submit" className="review-submit-button" disabled={submitting}>
          {submitting ? "Submitting..." : review ? "Update Review" : "Submit Review"}
        </button>
        {review && <button type="button" className="review-cancel-edit" disabled={submitting} onClick={() => { setEditing(false); setRating(review.rating); setComment(review.comment); setError(""); }}>Cancel</button>}
      </form>
    </section>
  );
}
