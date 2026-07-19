import { render, screen } from "@testing-library/react";
import ReservationsPage from "@/app/reservations/page";
import { getReservationsAction } from "@/lib/actions/reservation-action";

jest.mock("@/lib/actions/reservation-action", () => ({ getReservationsAction: jest.fn(), cancelReservationAction: jest.fn() }));
const getReservations = jest.mocked(getReservationsAction);

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
