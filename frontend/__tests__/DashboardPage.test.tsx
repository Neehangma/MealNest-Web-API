import { render, screen } from "@testing-library/react";
import DashboardClient from "@/app/dashboard/user/DashboardClient";
import { getUserDashboardAction } from "@/lib/actions/dashboard-action";
import { getRestaurants } from "@/lib/api/dashboard";

jest.mock("@/app/_components/UserDashboardShell", () => ({ useUserDashboardShell: () => ({ searchQuery: "" }) }));
jest.mock("@/lib/actions/dashboard-action", () => ({ getUserDashboardAction: jest.fn(), toggleFavoriteAction: jest.fn() }));
jest.mock("@/lib/api/dashboard", () => ({ getRestaurants: jest.fn() }));

test("renders loading then restaurant data on the dashboard", async () => {
  jest.mocked(getUserDashboardAction).mockResolvedValue({ stats: { bookings: 1, favorites: 0, averageRating: 0 }, favorites: [], upcomingReservations: [], recentHistory: [], cancelledReservations: [] });
  jest.mocked(getRestaurants).mockResolvedValue({ success: true, data: [{ _id: "1", name: "Tavola", cuisine: "Italian", location: "Kathmandu", rating: 4.5, reviewCount: 10, priceRange: "$$", image: "", isOpen: true, description: "Italian dining", address: "Thamel", phone: "123", hours: "10-10", featured: false, features: [], availableTimeSlots: [] }] });
  render(<DashboardClient user={{ fullName: "Dawa Sherpa", email: "dawa@example.com" }} />);
  expect(screen.getByText("Loading restaurants...")).toBeVisible();
  expect(await screen.findByText("Tavola")).toBeVisible();
  expect(screen.getByText(/Dawa/)).toBeVisible();
});

test("displays the current API error state", async () => {
  jest.mocked(getUserDashboardAction).mockRejectedValue(new Error("failed"));
  jest.mocked(getRestaurants).mockRejectedValue(new Error("failed"));
  render(<DashboardClient user={{ fullName: "Dawa" }} />);
  expect(await screen.findByText("Unable to load restaurants. Please try again.")).toBeVisible();
});
