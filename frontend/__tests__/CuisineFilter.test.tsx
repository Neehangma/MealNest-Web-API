import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DashboardClient from "@/app/dashboard/user/DashboardClient";
import { getUserDashboardAction } from "@/lib/actions/dashboard-action";
import { getRestaurants } from "@/lib/api/dashboard";

jest.mock("@/app/_components/UserDashboardShell", () => ({ useUserDashboardShell: () => ({ searchQuery: "" }) }));
jest.mock("@/lib/actions/dashboard-action", () => ({ getUserDashboardAction: jest.fn(), toggleFavoriteAction: jest.fn() }));
jest.mock("@/lib/api/dashboard", () => ({ getRestaurants: jest.fn() }));

test("filters the real dashboard restaurant list by cuisine", async () => {
  jest.mocked(getUserDashboardAction).mockResolvedValue({ stats: { bookings: 0, favorites: 0, averageRating: 0 }, favorites: [], upcomingReservations: [], recentHistory: [], cancelledReservations: [] });
  jest.mocked(getRestaurants).mockResolvedValue({ success: true, data: [
    { _id: "1", name: "Tavola", cuisine: "Italian", location: "Kathmandu", rating: 4, reviewCount: 1, priceRange: "$$", image: "", isOpen: true, description: "Italian", address: "Thamel", phone: "123", hours: "10-10", featured: false, features: [], availableTimeSlots: [] },
    { _id: "2", name: "Sakura", cuisine: "Japanese", location: "Kathmandu", rating: 4, reviewCount: 1, priceRange: "$$", image: "", isOpen: true, description: "Japanese", address: "Thamel", phone: "123", hours: "10-10", featured: false, features: [], availableTimeSlots: [] },
  ] });
  render(<DashboardClient user={{ fullName: "Dawa" }} />);
  expect(await screen.findByText("Tavola")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: /Italian/ }));
  expect(screen.getByText("Tavola")).toBeVisible();
  expect(screen.queryByText("Sakura")).not.toBeInTheDocument();
});
