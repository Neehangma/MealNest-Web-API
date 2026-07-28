/** @jest-environment jsdom */
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminRestaurantsPage from "@/app/admin/restaurants/page";
import {
  deleteRestaurantAction,
  getAdminRestaurantDetailsAction,
  getAdminRestaurantsAction,
  updateRestaurantAction,
} from "@/lib/actions/admin/restaurant-action";

jest.mock("@/lib/actions/admin/restaurant-action", () => ({
  createRestaurantAction: jest.fn(),
  deleteRestaurantAction: jest.fn(),
  getAdminRestaurantDetailsAction: jest.fn(),
  getAdminRestaurantsAction: jest.fn(),
  updateRestaurantAction: jest.fn(),
}));

const restaurant = {
  _id: "507f1f77bcf86cd799439011",
  name: "Siam",
  cuisine: "Thai",
  description: "Detailed Thai restaurant.",
  image: "/images/siam.jpg",
  location: "Kathmandu",
  priceRange: "Rs. 300–500",
  price: 400,
  isActive: true,
  isOpen: true,
  address: "Lazimpat",
  phone: "9812345678",
  hours: "Mon-Sun: 11:00 AM - 10:00 PM",
  featured: false,
  availableTimeSlots: ["6:00 PM"],
  features: ["Pad Thai"],
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-02T00:00:00.000Z",
};

beforeEach(() => {
  jest.resetAllMocks();
  jest.mocked(getAdminRestaurantsAction).mockResolvedValue({
    success: true,
    data: [restaurant],
    meta: { page: 1, limit: 10, total: 1, totalPages: 1, availableTotal: 1, cuisineTypes: 1 },
  });
  jest.mocked(getAdminRestaurantDetailsAction).mockResolvedValue({
    success: true,
    data: {
      restaurant: {
        ...restaurant,
        email: "",
        openingTime: "11:00 AM",
        closingTime: "10:00 PM",
        totalTables: 1,
        capacity: 4,
        tables: [{ tableNumber: 1, capacity: 4, isAvailable: true }],
        menu: [{ category: "Featured items", name: "Pad Thai", description: "", price: null, isAvailable: true, type: "food" }],
      },
      activity: {
        totalBookings: 1,
        pendingBookings: 0,
        confirmedBookings: 1,
        completedBookings: 0,
        cancelledBookings: 0,
        totalReviews: 1,
        averageRating: 5,
        totalFavorites: 2,
      },
      bookings: [{
        _id: "booking-1",
        customer: { id: "user-1", name: "MealNest User", email: "user@example.com" },
        reservationDate: "2026-02-01",
        date: "2026-02-01",
        time: "7:00 PM",
        guests: 2,
        paymentMethod: "esewa",
        status: "confirmed",
      }],
      reviews: [{
        id: "review-1",
        customerName: "MealNest User",
        rating: 5,
        comment: "Excellent dinner.",
        status: "published",
        createdAt: "2026-02-02",
      }],
    },
  });
});

test("loads the selected restaurant into a tabbed details modal without triggering edit or delete", async () => {
  const user = userEvent.setup();
  render(<AdminRestaurantsPage />);
  await screen.findByText("Siam");

  expect(screen.getByRole("button", { name: "View restaurant Siam" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Edit restaurant Siam" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Delete restaurant Siam" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "View restaurant Siam" }));

  expect(getAdminRestaurantDetailsAction).toHaveBeenCalledWith(restaurant._id);
  expect(updateRestaurantAction).not.toHaveBeenCalled();
  expect(deleteRestaurantAction).not.toHaveBeenCalled();
  const modal = await screen.findByRole("dialog", { name: "Restaurant Details" });
  expect(within(modal).getByText("Detailed Thai restaurant.")).toBeVisible();
  expect(within(modal).getByText("Total bookings")).toBeVisible();

  await user.click(within(modal).getByRole("button", { name: "Menu" }));
  expect(within(modal).getByText("Pad Thai")).toBeVisible();
  await user.click(within(modal).getByRole("button", { name: "Bookings" }));
  expect(within(modal).getByText("7:00 PM")).toBeVisible();
  await user.click(within(modal).getByRole("button", { name: "Reviews" }));
  expect(within(modal).getByText("Excellent dinner.")).toBeVisible();

  await user.click(within(modal).getByRole("button", { name: "Close restaurant details" }));
  expect(screen.queryByRole("dialog", { name: "Restaurant Details" })).not.toBeInTheDocument();
});
