import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReservationsPage from "@/app/reservations/page";
import { cancelReservationAction, getReservationsAction, updateReservationAction } from "@/lib/actions/reservation-action";

jest.mock("@/lib/actions/review-action", () => ({
  createReviewAction: jest.fn(),
  updateReviewAction: jest.fn(),
}));
jest.mock("@/lib/actions/reservation-action", () => ({
  getReservationsAction: jest.fn(),
  cancelReservationAction: jest.fn(),
  updateReservationAction: jest.fn(),
}));
const getReservations = jest.mocked(getReservationsAction);

beforeEach(() => {
  jest.resetAllMocks();
});

test("shows the empty reservation state", async () => {
  getReservations.mockResolvedValue([]);
  render(<ReservationsPage />);
  expect(await screen.findByText("You have not booked any restaurants yet.")).toBeVisible();
});

test("displays reservation details", async () => {
  getReservations.mockResolvedValue([{ _id: "booking-1", restaurantId: "restaurant-1", restaurantName: "Tavola", cuisine: "Italian", image: "", reservationDate: "2027-07-25", date: "2027-07-25", time: "19:00", guests: 2, status: "confirmed" }]);
  render(<ReservationsPage />);
  expect(await screen.findByText("Tavola")).toBeVisible();
  expect(screen.getByText("19:00")).toBeVisible();
});

test("confirms cancellation before moving a booking to the cancelled tab", async () => {
  const booking = { _id: "booking-2", restaurantId: "restaurant-2", restaurantName: "Daura", cuisine: "Nepali", image: "", reservationDate: "2030-07-25", date: "2030-07-25", time: "6:00 PM", guests: 2, status: "confirmed" };
  jest.mocked(getReservationsAction)
    .mockResolvedValueOnce([booking])
    .mockResolvedValueOnce([{ ...booking, status: "cancelled" }]);
  jest.mocked(cancelReservationAction).mockResolvedValue({ success: true, message: "cancelled", data: { ...booking, status: "cancelled" } });
  const user = userEvent.setup();
  render(<ReservationsPage />);

  await user.click(await screen.findByRole("button", { name: "Cancel Booking" }));
  const dialog = screen.getByRole("dialog");
  expect(dialog).toHaveTextContent("Daura");
  expect(dialog).toHaveTextContent("Jul 25, 2030");
  expect(screen.getByRole("button", { name: "No, Keep Booking" })).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Yes, Cancel Booking" }));

  expect(cancelReservationAction).toHaveBeenCalledWith("booking-2");
  expect(await screen.findByRole("link", { name: "Book Again" })).toHaveAttribute(
    "href",
    "/dashboard/user/restaurants/restaurant-2/book"
  );
});

test("modifies only date, time, and guest count", async () => {
  const booking = {
    _id: "booking-3", restaurantId: "restaurant-3", restaurantName: "Tavola", cuisine: "Italian", image: "",
    reservationDate: "2030-07-25", date: "2030-07-25", time: "7:00 PM", guests: 2, status: "confirmed",
    restaurant: { _id: "restaurant-3", name: "Tavola", cuisine: "Italian", image: "", location: "Kathmandu", availableTimeSlots: ["7:00 PM", "8:30 PM"] },
  };
  jest.mocked(getReservationsAction).mockResolvedValue([booking]);
  jest.mocked(updateReservationAction).mockResolvedValue({ success: true, message: "updated", data: booking });
  const user = userEvent.setup();
  render(<ReservationsPage />);

  await user.click(await screen.findByRole("button", { name: "Modify Booking" }));
  await user.clear(screen.getByLabelText("Reservation date"));
  await user.type(screen.getByLabelText("Reservation date"), "2030-07-27");
  await user.selectOptions(screen.getByLabelText("Reservation time"), "8:30 PM");
  await user.clear(screen.getByLabelText("Number of guests"));
  await user.type(screen.getByLabelText("Number of guests"), "4");
  await user.click(screen.getByRole("button", { name: "Save Changes" }));

  expect(updateReservationAction).toHaveBeenCalledWith("booking-3", {
    date: "2030-07-27",
    time: "8:30 PM",
    guests: 4,
  });
});

test("shows the review form only for eligible reservations", async () => {
  getReservations.mockResolvedValue([
    { _id: "past-booking", restaurantId: "restaurant-1", restaurantName: "Past Bistro", cuisine: "Thai", image: "", reservationDate: "2020-07-25", date: "2020-07-25", time: "7:00 PM", guests: 2, status: "confirmed" },
    { _id: "cancelled-booking", restaurantId: "restaurant-2", restaurantName: "Cancelled Bistro", cuisine: "Nepali", image: "", reservationDate: "2020-07-25", date: "2020-07-25", time: "7:00 PM", guests: 2, status: "cancelled" },
    { _id: "upcoming-booking", restaurantId: "restaurant-3", restaurantName: "Upcoming Bistro", cuisine: "Chinese", image: "", reservationDate: "2099-07-25", date: "2099-07-25", time: "7:00 PM", guests: 2, status: "confirmed" },
  ]);
  render(<ReservationsPage />);
  expect(await screen.findByRole("heading", { name: "Rate Your Experience" })).toBeVisible();
  expect(screen.getAllByText("Note: Reviews can only be submitted after your reservation has been completed.")).toHaveLength(1);
});
