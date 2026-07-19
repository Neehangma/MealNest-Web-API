import { render, screen } from "@testing-library/react";
import AdminPage from "@/app/admin/page";
import { getAdminDashboardStatsAction } from "@/lib/actions/admin/dashboard-action";

jest.mock("@/lib/actions/admin/dashboard-action", () => ({ getAdminDashboardStatsAction: jest.fn() }));

test("renders statistics, management link, and recent activities", async () => {
  jest.spyOn(Date, "now").mockReturnValue(new Date("2030-01-01T12:00:30Z").getTime());
  jest.mocked(getAdminDashboardStatsAction).mockResolvedValue({ success: true, stats: { totalUsers: 12, totalRestaurants: 8, totalBookings: 21 }, activities: [{ type: "booking", title: "Booking created", text: "E2E booking", createdAt: "2030-01-01T12:00:00Z" }] });
  render(await AdminPage());
  expect(screen.getByText("12")).toBeVisible(); expect(screen.getByText("8")).toBeVisible(); expect(screen.getByText("21")).toBeVisible();
  expect(screen.getByRole("link", { name: /Manage Users/ })).toHaveAttribute("href", "/admin/users");
  expect(screen.getByText("Booking created")).toBeVisible();
  expect(screen.getByText("Just now")).toBeVisible();
  jest.restoreAllMocks();
});

test("shows the established API error and activity fallback", async () => {
  jest.mocked(getAdminDashboardStatsAction).mockRejectedValue(new Error("offline"));
  render(await AdminPage());
  expect(screen.getByText("Unable to load dashboard statistics.")).toBeVisible();
  expect(screen.getByText("Recent activity is unavailable.")).toBeVisible();
});
