import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/admin/page";
import { getAdminDashboardStatsAction } from "@/lib/actions/admin/dashboard-action";
import { getAdminReviewAnalyticsAction } from "@/lib/actions/admin/review-action";

jest.mock("@/lib/actions/admin/dashboard-action", () => ({ getAdminDashboardStatsAction: jest.fn() }));
jest.mock("@/lib/actions/admin/review-action", () => ({ getAdminReviewAnalyticsAction: jest.fn() }));
jest.mock("@/app/admin/_components/analytics/AnalyticsSection", () => {
  function MockAnalyticsSection() { return <div>Analytics</div>; }
  return MockAnalyticsSection;
});

test("renders real admin statistics returned by the action", async () => {
  jest.mocked(getAdminDashboardStatsAction).mockResolvedValue({ success: true, stats: { totalUsers: 10, totalRestaurants: 5, totalBookings: 7 }, activities: [] });
  jest.mocked(getAdminReviewAnalyticsAction).mockResolvedValue({
    success: true,
    summary: { totalReviews: 4, averageRating: 3.5, reviewsThisWeek: 2, oneStarReviews: 1 },
    reviewsInRange: 2,
    ratingDistribution: [],
    topReviewedRestaurants: [],
    recentReviews: [{ _id: "review-1", customerName: "Diner", restaurantName: "Tavola", rating: 4, comment: "Great meal", status: "published", createdAt: "2026-07-27" }],
  });
  render(await AdminDashboardPage());
  expect(screen.getByText("10")).toBeVisible();
  expect(screen.getByText("5")).toBeVisible();
  expect(screen.getByText("7")).toBeVisible();
  expect(screen.getByText("4")).toBeVisible();
  expect(screen.getByText("3.5")).toBeVisible();
  expect(screen.getByText("Great meal")).toBeVisible();
});

test("renders the current admin error state", async () => {
  jest.mocked(getAdminDashboardStatsAction).mockRejectedValue(new Error("failed"));
  jest.mocked(getAdminReviewAnalyticsAction).mockRejectedValue(new Error("failed"));
  render(await AdminDashboardPage());
  expect(screen.getByText("Unable to load dashboard statistics.")).toBeVisible();
});
