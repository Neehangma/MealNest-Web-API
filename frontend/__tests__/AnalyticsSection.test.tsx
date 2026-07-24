import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AnalyticsSection from "@/app/admin/_components/analytics/AnalyticsSection";
import { getAdminAnalytics } from "@/lib/api/admin/dashboard";

jest.mock("@/lib/api/admin/dashboard", () => ({ getAdminAnalytics: jest.fn() }));

const response = {
  success: true,
  summary: { totalUsers: 3, totalRestaurants: 2, totalBookings: 0 },
  bookingTrends: [{ label: "Jul 24", count: 0 }],
  userGrowth: [{ label: "Jul 24", count: 0 }],
  bookingStatuses: [
    { status: "pending" as const, count: 0 },
    { status: "confirmed" as const, count: 0 },
    { status: "completed" as const, count: 0 },
    { status: "cancelled" as const, count: 0 },
  ],
  restaurantsByCuisine: [],
  topRestaurants: [],
};

test("loads the default range once and refetches when the range changes", async () => {
  jest.mocked(getAdminAnalytics).mockResolvedValue(response);
  const user = userEvent.setup();
  render(<AnalyticsSection />);

  await waitFor(() => expect(getAdminAnalytics).toHaveBeenCalledWith("7d"));
  expect(await screen.findByText("Booking Trends")).toBeVisible();
  expect(screen.getByText("No bookings in this period.")).toBeVisible();

  await user.selectOptions(screen.getByLabelText("Analytics range"), "30d");
  await waitFor(() => expect(getAdminAnalytics).toHaveBeenCalledWith("30d"));
  expect(getAdminAnalytics).toHaveBeenCalledTimes(2);
});
