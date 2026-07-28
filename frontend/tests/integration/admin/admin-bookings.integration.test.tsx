/** @jest-environment jsdom */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminBookingsPage from "@/app/admin/booking/page";
import {
  completeAdminBookingAction,
  getAdminRestaurantBookingsAction,
  getGroupedAdminBookingsAction,
} from "@/lib/actions/admin/booking-action";

jest.mock("@/lib/actions/admin/booking-action", () => ({
  completeAdminBookingAction: jest.fn(),
  getAdminBookingsAction: jest.fn(),
  getAdminRestaurantBookingsAction: jest.fn(),
  getGroupedAdminBookingsAction: jest.fn(),
}));

const groups = [
  {
    restaurantId: "restaurant-1",
    restaurantName: "Haneoul",
    restaurantImage: "",
    cuisine: "Korean",
    totalBookings: 3,
    statusCounts: { pending: 0, confirmed: 2, completed: 0, cancelled: 1 },
    latestBookingDate: "2026-07-27T12:00:00.000Z",
  },
  {
    restaurantId: "restaurant-2",
    restaurantName: "Haneoul",
    restaurantImage: "",
    cuisine: "Thai",
    totalBookings: 2,
    statusCounts: { pending: 0, confirmed: 2, completed: 0, cancelled: 0 },
    latestBookingDate: "2026-07-26T12:00:00.000Z",
  },
  {
    restaurantId: "restaurant-3",
    restaurantName: "Siam",
    restaurantImage: "",
    cuisine: "Thai",
    totalBookings: 1,
    statusCounts: { pending: 0, confirmed: 1, completed: 0, cancelled: 0 },
    latestBookingDate: "2026-07-25T12:00:00.000Z",
  },
];

const bookings = Array.from({ length: 3 }, (_, index) => ({
  _id: `booking-${index + 1}`,
  restaurantId: "restaurant-1",
  restaurantName: "Haneoul",
  reservationDate: "2020-01-01",
  date: "2020-01-01",
  time: "7:00 PM",
  guests: index + 2,
  tableNumber: index + 1,
  status: (index === 2 ? "cancelled" : "confirmed") as "confirmed" | "cancelled",
  paymentMethod: "esewa",
  paymentStatus: "simulated_success",
  totalPaid: 900,
  createdAt: "2020-01-01",
  customer: { _id: `user-${index}`, fullName: `User ${index + 1}`, email: `user${index + 1}@example.com` },
}));

const groupedResponse = {
  success: true,
  data: groups,
  meta: { page: 1, limit: 10, total: 3, totalPages: 1 },
  summary: { totalRestaurants: 3, totalBookings: 6, pending: 0, confirmed: 5, completed: 0, cancelled: 1, usersBooked: 3 },
  cuisines: ["Korean", "Thai"],
};

beforeEach(() => {
  jest.mocked(getGroupedAdminBookingsAction).mockReset().mockResolvedValue(groupedResponse);
  jest.mocked(getAdminRestaurantBookingsAction).mockReset().mockResolvedValue({
    success: true,
    restaurant: { id: "restaurant-1", name: "Haneoul", cuisine: "Korean", image: "" },
    totalBookings: 3,
    bookings,
  });
  jest.mocked(completeAdminBookingAction).mockReset().mockResolvedValue({
    success: true,
    message: "Booking marked as completed.",
    data: { ...bookings[0], status: "completed" },
  });
});

test("shows one row per restaurant id with singular and plural booking counts", async () => {
  render(<AdminBookingsPage />);
  expect((await screen.findAllByText("Haneoul")).length).toBe(2);
  expect(screen.getByText("3 bookings")).toBeVisible();
  expect(screen.getByText("2 bookings")).toBeVisible();
  expect(screen.getByText("1 booking")).toBeVisible();
  expect(screen.getAllByRole("button", { name: "View Bookings" })).toHaveLength(3);
});

test("opens one restaurant modal with all individual bookings and completes an eligible booking", async () => {
  const user = userEvent.setup();
  render(<AdminBookingsPage />);
  await screen.findByText("3 bookings");
  await user.click(screen.getAllByRole("button", { name: "View Bookings" })[0]);

  expect(getAdminRestaurantBookingsAction).toHaveBeenCalledWith("restaurant-1");
  const dialog = await screen.findByRole("dialog", { name: "Haneoul" });
  expect(within(dialog).getByText("user1@example.com")).toBeVisible();
  expect(within(dialog).getByText("user2@example.com")).toBeVisible();
  expect(within(dialog).getByText("user3@example.com")).toBeVisible();

  await user.click(within(dialog).getAllByRole("button", { name: "Mark Completed" })[0]);
  expect(completeAdminBookingAction).toHaveBeenCalledWith("booking-1");
  await waitFor(() => expect(getGroupedAdminBookingsAction).toHaveBeenCalledTimes(2));
  expect(within(dialog).getByText("Completed")).toBeVisible();
});

test("passes cuisine, status, and sorting filters to the grouped API", async () => {
  const user = userEvent.setup();
  render(<AdminBookingsPage />);
  await screen.findByText("3 bookings");

  await user.selectOptions(screen.getByRole("combobox", { name: "Filter by cuisine" }), "Thai");
  await user.selectOptions(screen.getByRole("combobox", { name: "Filter by booking status" }), "cancelled");
  await user.selectOptions(screen.getByRole("combobox", { name: "Sort grouped bookings" }), "highest");

  await waitFor(() => expect(getGroupedAdminBookingsAction).toHaveBeenLastCalledWith(expect.objectContaining({
    cuisine: "Thai",
    status: "cancelled",
    sort: "highest",
  })));
});
