import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminReviewsPage from "@/app/admin/reviews/page";
import {
  deleteAdminReviewAction,
  getAdminReviewsAction,
  updateAdminReviewStatusAction,
} from "@/lib/actions/admin/review-action";

jest.mock("@/lib/actions/admin/review-action", () => ({
  deleteAdminReviewAction: jest.fn(),
  getAdminReviewsAction: jest.fn(),
  updateAdminReviewStatusAction: jest.fn(),
}));

const review = {
  _id: "review-1",
  id: "review-1",
  userId: "user-1",
  restaurantId: "restaurant-1",
  reservationId: "reservation-1",
  customer: { name: "MealNest User", email: "user@example.com" },
  restaurant: { name: "Tavola", cuisine: "Italian" },
  reservation: { date: "2026-07-20", reservationDate: "2026-07-20", time: "7:00 PM", status: "completed" },
  rating: 4,
  comment: "A detailed and persistent restaurant review.",
  status: "published" as const,
  createdAt: "2026-07-21T00:00:00.000Z",
  updatedAt: "2026-07-21T00:00:00.000Z",
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getAdminReviewsAction).mockResolvedValue({
    success: true,
    data: [review],
    meta: { page: 1, limit: 10, total: 1, totalPages: 1 },
    restaurantOptions: [{ id: "restaurant-1", name: "Tavola" }],
  });
});

test("shows the submitted user, restaurant, review details, filters, and sorting", async () => {
  const user = userEvent.setup();
  render(<AdminReviewsPage />);
  expect(await screen.findByText("MealNest User")).toBeVisible();
  expect(screen.getByText("user@example.com")).toBeVisible();
  expect(screen.getAllByText("Tavola")).toHaveLength(2);
  expect(screen.getByText("Italian")).toBeVisible();
  expect(screen.getByText("A detailed and persistent restaurant review.")).toBeVisible();

  await user.selectOptions(screen.getByLabelText("Filter by star rating"), "4");
  await waitFor(() => expect(getAdminReviewsAction).toHaveBeenLastCalledWith(expect.objectContaining({ rating: 4 })));
  await user.selectOptions(screen.getByLabelText("Sort reviews"), "highest");
  await waitFor(() => expect(getAdminReviewsAction).toHaveBeenLastCalledWith(expect.objectContaining({ sort: "highest" })));
});

test("does not return to a permanent loading state after the initial reviews load", async () => {
  render(<AdminReviewsPage />);
  expect(await screen.findByText("MealNest User")).toBeVisible();

  await new Promise((resolve) => window.setTimeout(resolve, 400));

  expect(screen.getByText("MealNest User")).toBeVisible();
  expect(screen.queryByText("Loading user reviews...")).not.toBeInTheDocument();
  expect(getAdminReviewsAction).toHaveBeenCalledTimes(1);
});

test("requires confirmation before hiding and deleting a review", async () => {
  jest.mocked(updateAdminReviewStatusAction).mockResolvedValue({ success: true, message: "hidden", data: { ...review, status: "hidden" } });
  jest.mocked(deleteAdminReviewAction).mockResolvedValue({ success: true, message: "deleted" });
  const user = userEvent.setup();
  render(<AdminReviewsPage />);

  await user.click(await screen.findByRole("button", { name: "Hide" }));
  expect(screen.getByText("Are you sure you want to hide this review?")).toBeVisible();
  expect(updateAdminReviewStatusAction).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Yes" }));
  expect(await screen.findByText("Review hidden successfully.")).toBeVisible();

  await user.click(screen.getByRole("button", { name: "Delete" }));
  expect(screen.getByText("Are you sure you want to permanently delete this review?")).toBeVisible();
  expect(deleteAdminReviewAction).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Yes" }));
  expect(deleteAdminReviewAction).toHaveBeenCalledWith("review-1");
});
