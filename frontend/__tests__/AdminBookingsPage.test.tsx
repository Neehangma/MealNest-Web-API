import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminBookingsPage from "@/app/admin/booking/page";
import { completeAdminBookingAction, getAdminBookingsAction } from "@/lib/actions/admin/booking-action";

jest.mock("@/lib/actions/admin/booking-action", () => ({
  completeAdminBookingAction: jest.fn(),
  getAdminBookingsAction: jest.fn(),
}));

const booking = {
  _id: "booking-1",
  restaurantId: "restaurant-1",
  restaurantName: "Tavola",
  reservationDate: "2020-01-01",
  date: "2020-01-01",
  time: "7:00 PM",
  guests: 2,
  status: "confirmed" as const,
  customer: { _id: "user-1", fullName: "MealNest User", email: "user@example.com" },
};

test("filters by status and marks an eligible confirmed booking completed", async () => {
  jest.mocked(getAdminBookingsAction).mockResolvedValue({ success: true, data: [booking], total: 1 });
  jest.mocked(completeAdminBookingAction).mockResolvedValue({
    success: true,
    message: "Booking marked as completed.",
    data: { ...booking, status: "completed" },
  });
  const user = userEvent.setup();
  render(<AdminBookingsPage />);

  expect(await screen.findByText("Tavola")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Mark Completed" }));
  expect(completeAdminBookingAction).toHaveBeenCalledWith("booking-1");
  expect(await screen.findByText("completed")).toBeVisible();

  await user.selectOptions(screen.getByRole("combobox"), "cancelled");
  expect(screen.getByText("No user bookings found.")).toBeVisible();
});
