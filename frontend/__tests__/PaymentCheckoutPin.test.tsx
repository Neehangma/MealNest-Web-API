import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentCheckoutPage from "@/app/payment-checkout/page";

jest.mock("@/lib/actions/reservation-action", () => ({
  createPaidReservationAction: jest.fn(),
}));

const booking = {
  restaurantId: "restaurant-1",
  restaurantName: "Sakura Omakase",
  cuisine: "Japanese",
  image: "",
  reservationDate: "2030-07-20T13:00:00.000Z",
  date: "2030-07-20",
  time: "7:00 PM",
  guests: 2,
  status: "pending",
  location: "Kathmandu",
  restaurantAddress: "Test Street",
  price: 500,
  totalAmount: 1000,
};

beforeEach(() => {
  sessionStorage.setItem("mealnest_booking", JSON.stringify(booking));
});

test("requires a four-digit PIN before showing eSewa confirmation", async () => {
  render(<PaymentCheckoutPage />);
  await userEvent.type(screen.getByLabelText("eSewa Mobile Number"), "9845698712");
  await userEvent.type(screen.getByLabelText("Account Name"), "Dawa Sherpa");
  await userEvent.click(screen.getByRole("button", { name: /^Pay via eSewa$/ }));

  expect(screen.getByRole("heading", { name: "Enter Transaction PIN" })).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Confirm Payment" })).not.toBeInTheDocument();
  const pin = screen.getByLabelText("Transaction PIN");
  const continueButton = screen.getByRole("button", { name: "Continue" });
  expect(pin).toHaveAttribute("type", "password");
  expect(continueButton).toBeDisabled();

  await userEvent.type(pin, "a12-34x5");
  expect(pin).toHaveValue("1234");
  expect(continueButton).toBeEnabled();
  expect(screen.getAllByRole("button", { name: "Show password" })).toHaveLength(1);
  await userEvent.click(continueButton);

  expect(screen.queryByRole("heading", { name: "Enter Transaction PIN" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Confirm Payment" })).toBeVisible();
  expect(sessionStorage.getItem("transactionPin")).toBeNull();
});

test("requires a separate four-digit PIN before showing Mobile Banking confirmation", async () => {
  render(<PaymentCheckoutPage />);
  await userEvent.click(screen.getByRole("button", { name: /Mobile Banking Pay through your bank account/ }));
  await userEvent.selectOptions(screen.getByLabelText("Bank Name"), "Nabil Bank");
  await userEvent.type(screen.getByLabelText("Account Holder Name"), "Dawa Sherpa");
  await userEvent.type(screen.getByLabelText("Mobile Number"), "9845698712");
  await userEvent.click(screen.getByRole("button", { name: /^Pay via Mobile Banking$/ }));

  expect(screen.getByRole("heading", { name: "Enter Transaction PIN" })).toBeVisible();
  expect(screen.getByText("Enter your 4-digit mobile banking transaction PIN to continue.")).toBeVisible();
  expect(screen.queryByRole("heading", { name: "Confirm Payment" })).not.toBeInTheDocument();

  const pin = screen.getByLabelText("Transaction PIN");
  await userEvent.type(pin, "5678");
  await userEvent.click(screen.getByRole("button", { name: "Continue" }));

  expect(screen.queryByRole("heading", { name: "Enter Transaction PIN" })).not.toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Confirm Payment" })).toBeVisible();
  expect(within(screen.getByRole("dialog", { name: "Confirm Payment" })).getByText("Mobile Banking")).toBeVisible();

  await userEvent.click(within(screen.getByRole("dialog", { name: "Confirm Payment" })).getByRole("button", { name: "Cancel" }));
  await userEvent.click(screen.getByRole("button", { name: /^Pay via Mobile Banking$/ }));
  expect(screen.getByLabelText("Transaction PIN")).toHaveValue("");
  expect(screen.getByRole("button", { name: "Continue" })).toBeDisabled();
});
