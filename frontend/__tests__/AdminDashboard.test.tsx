import { render, screen } from "@testing-library/react";
import AdminDashboardPage from "@/app/admin/page";
import { getAdminDashboardStatsAction } from "@/lib/actions/admin/dashboard-action";

jest.mock("@/lib/actions/admin/dashboard-action", () => ({ getAdminDashboardStatsAction: jest.fn() }));

test("renders real admin statistics returned by the action", async () => {
  jest.mocked(getAdminDashboardStatsAction).mockResolvedValue({ success: true, stats: { totalUsers: 10, totalRestaurants: 5, totalBookings: 7 }, activities: [] });
  render(await AdminDashboardPage());
  expect(screen.getByText("10")).toBeVisible();
  expect(screen.getByText("5")).toBeVisible();
  expect(screen.getByText("7")).toBeVisible();
});

test("renders the current admin error state", async () => {
  jest.mocked(getAdminDashboardStatsAction).mockRejectedValue(new Error("failed"));
  render(await AdminDashboardPage());
  expect(screen.getByText("Unable to load dashboard statistics.")).toBeVisible();
});
