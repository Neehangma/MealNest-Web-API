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
  await userEvent.type(screen.getByLabelText("ESEWA ID"), "dawa@example.com");
  await userEvent.click(screen.getByRole("button", { name: "Add eSewa Account" }));
  expect(await screen.findByText("Phone number must contain exactly 10 digits.")).toBeVisible();
});

test("validates and masks mobile-banking account numbers", async () => {
  render(<PaymentMethodsClient />);
  await userEvent.click(screen.getByRole("button", { name: /Linked Bank Account/ }));
  await userEvent.selectOptions(screen.getByLabelText("Bank Name"), "Nabil Bank");
  await userEvent.type(screen.getByLabelText("ACCOUNT NUMBER"), "abc123");
  await userEvent.type(screen.getByLabelText("Mobile Number"), "9845698712");
  await userEvent.click(screen.getByRole("button", { name: "Add Linked Bank Account" }));
  expect(await screen.findByText("Bank account number must contain between 10 and 16 digits.")).toBeVisible();

  await userEvent.clear(screen.getByLabelText("ACCOUNT NUMBER"));
  await userEvent.type(screen.getByLabelText("ACCOUNT NUMBER"), "1234567890123456");
  await userEvent.click(screen.getByRole("button", { name: "Add Linked Bank Account" }));
  expect(await screen.findByText("Account Number: ************3456")).toBeVisible();
  expect(screen.queryByText("1234567890123456")).not.toBeInTheDocument();
});
