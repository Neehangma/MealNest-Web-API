import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RestaurantDetailPage from "@/app/restaurants/[id]/page";
import { getRestaurantById } from "@/lib/api/dashboard";
import { getFavoritesAction } from "@/lib/actions/dashboard-action";
import { navigationMocks } from "@/jest.setup";

jest.mock("@/lib/api/dashboard", () => ({ getRestaurantById: jest.fn() }));
jest.mock("@/lib/actions/dashboard-action", () => ({ getFavoritesAction: jest.fn(), toggleFavoriteAction: jest.fn() }));

beforeEach(() => {
  jest.mocked(getRestaurantById).mockResolvedValue({ success: true, data: { _id: "restaurant-1", name: "Tavola", cuisine: "Italian", location: "Kathmandu", address: "Thamel", phone: "123", hours: "10-10", description: "Italian dining", rating: 4, reviewCount: 1, priceRange: "$$", image: "", isOpen: true, featured: false, price: 450, features: [], availableTimeSlots: ["7:00 PM"] } });
  jest.mocked(getFavoritesAction).mockResolvedValue([]);
});

test("validates booking date and time", async () => {
  render(<RestaurantDetailPage />);
  await screen.findByRole("heading", { name: "Tavola" });
  const timeOptions = screen.getAllByRole("option").filter((option) => option.closest("select") === screen.getByLabelText("Time"));
  expect(timeOptions).toHaveLength(26);
  expect(timeOptions[1]).toHaveTextContent("10:00 AM");
  expect(timeOptions.at(-1)).toHaveTextContent("10:00 PM");
  await userEvent.click(screen.getByRole("button", { name: "Book a Table" }));
  expect(screen.getByText("Please select a date and time.")).toBeVisible();
});

test("stores the current booking payload and follows payment navigation", async () => {
  render(<RestaurantDetailPage />);
  await screen.findByRole("heading", { name: "Tavola" });
  await userEvent.type(screen.getByLabelText("Date"), "2027-07-25");
  await userEvent.selectOptions(screen.getByLabelText("Time"), "7:00 PM");
  await userEvent.selectOptions(screen.getByLabelText("Party Size"), "2");
  await userEvent.click(screen.getByRole("button", { name: "Book a Table" }));
  expect(JSON.parse(sessionStorage.getItem("mealnest_booking")!)).toMatchObject({ restaurantId: "restaurant-1", date: "2027-07-25", time: "7:00 PM", guests: 2 });
  expect(navigationMocks.push).toHaveBeenCalledWith("/dashboard/user/payment");
});
