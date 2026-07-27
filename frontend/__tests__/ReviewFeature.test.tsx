import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationReviewCard from "@/app/reservations/ReservationReviewCard";
import RestaurantReviews from "@/app/restaurants/[id]/RestaurantReviews";
import { createReviewAction, updateReviewAction } from "@/lib/actions/review-action";
import { getRestaurantReviews } from "@/lib/api/dashboard";

jest.mock("@/lib/actions/review-action", () => ({
  createReviewAction: jest.fn(),
  updateReviewAction: jest.fn(),
}));
jest.mock("@/lib/api/dashboard", () => ({
  getRestaurantReviews: jest.fn(),
}));

const review = {
  _id: "review-1",
  id: "review-1",
  restaurantId: "restaurant-1",
  reservationId: "reservation-1",
  userId: "user-1",
  userName: "Review User",
  rating: 4,
  comment: "Wonderful dinner.",
  createdAt: "2026-07-24T12:00:00.000Z",
  updatedAt: "2026-07-24T12:00:00.000Z",
};

beforeEach(() => {
  jest.resetAllMocks();
});

test("all stars are clickable and selecting one highlights it and the preceding stars", async () => {
  render(<ReservationReviewCard reservationId="reservation-1" restaurantId="restaurant-1" onSaved={jest.fn()} />);
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Rate 4 stars" }));
  const stars = [1, 2, 3, 4, 5].map((number) => screen.getByRole("button", { name: `Rate ${number} star${number === 1 ? "" : "s"}` }));
  stars.slice(0, 4).forEach((star) => expect(star).toHaveClass("selected"));
  expect(stars[4]).not.toHaveClass("selected");
});

test("validates an empty rating and an empty comment", async () => {
  const user = userEvent.setup();
  render(<ReservationReviewCard reservationId="reservation-1" restaurantId="restaurant-1" onSaved={jest.fn()} />);
  await user.type(screen.getByLabelText("Your review"), "A written review");
  await user.click(screen.getByRole("button", { name: "Submit Review" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Please select a star rating.");
  expect(createReviewAction).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Rate 5 stars" }));
  await user.clear(screen.getByLabelText("Your review"));
  await user.click(screen.getByRole("button", { name: "Submit Review" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Please write a review.");
  expect(createReviewAction).not.toHaveBeenCalled();
});

test("submits once and replaces the form with the saved review state", async () => {
  jest.mocked(createReviewAction).mockResolvedValue({ success: true, message: "saved", data: review, review });
  const onSaved = jest.fn();
  const user = userEvent.setup();
  render(<ReservationReviewCard reservationId="reservation-1" restaurantId="restaurant-1" onSaved={onSaved} />);
  await user.click(screen.getByRole("button", { name: "Rate 4 stars" }));
  await user.type(screen.getByLabelText("Your review"), "Wonderful dinner.");
  await user.click(screen.getByRole("button", { name: "Submit Review" }));

  expect(createReviewAction).toHaveBeenCalledWith("restaurant-1", {
    reservationId: "reservation-1",
    rating: 4,
    comment: "Wonderful dinner.",
  });
  expect(await screen.findByRole("heading", { name: "Review Submitted" })).toBeVisible();
  expect(onSaved).toHaveBeenCalledWith(review);
});

test("edits an existing review through the protected update action", async () => {
  const updated = { ...review, rating: 5, comment: "Even better on reflection." };
  jest.mocked(updateReviewAction).mockResolvedValue({ success: true, message: "updated", data: updated, review: updated });
  const user = userEvent.setup();
  render(<ReservationReviewCard reservationId="reservation-1" restaurantId="restaurant-1" initialReview={review} onSaved={jest.fn()} />);
  await user.click(screen.getByRole("button", { name: "Edit Review" }));
  await user.click(screen.getByRole("button", { name: "Rate 5 stars" }));
  await user.clear(screen.getByLabelText("Your review"));
  await user.type(screen.getByLabelText("Your review"), "Even better on reflection.");
  await user.click(screen.getByRole("button", { name: "Update Review" }));
  expect(updateReviewAction).toHaveBeenCalledWith("restaurant-1", "review-1", {
    rating: 5,
    comment: "Even better on reflection.",
  });
});

test("displays persisted restaurant reviews to any visitor", async () => {
  jest.mocked(getRestaurantReviews).mockResolvedValue({ success: true, count: 1, data: [review], reviews: [review] });
  render(<RestaurantReviews restaurantId="restaurant-1" />);
  expect(await screen.findByText("Review User")).toBeVisible();
  expect(screen.getByText("Wonderful dinner.")).toBeVisible();
  expect(screen.getByText("4.0")).toBeVisible();
});
