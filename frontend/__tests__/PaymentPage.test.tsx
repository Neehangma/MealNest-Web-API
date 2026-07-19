import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PaymentMethodsClient from "@/app/payment-methods/PaymentMethodsClient";

test("renders both current payment choices and validates payer details", async () => {
  render(<PaymentMethodsClient />);
  expect(screen.getByRole("heading", { name: "Payment Methods" })).toBeVisible();
  expect(screen.getByRole("button", { name: /Pay via eSewa/ })).toBeVisible();
  expect(screen.getByRole("button", { name: /Linked Bank Account/ })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: /Pay via eSewa/ }));
  await userEvent.type(screen.getByLabelText("eSewa Mobile Number"), "123");
  await userEvent.type(screen.getByLabelText("Account Name"), "Dawa Sherpa");
  await userEvent.click(screen.getByRole("button", { name: "Add eSewa Account" }));
  expect(await screen.findByText(/valid 10-digit Nepal mobile number/i)).toBeVisible();
});
