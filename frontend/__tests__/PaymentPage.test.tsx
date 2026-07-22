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
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

test("confirms a linked bank account while preserving fields when declined", async () => {
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
  expect(screen.getByRole("heading", { name: "Add Linked Bank Account?" })).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "No" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByLabelText("Bank Name")).toHaveValue("Nabil Bank");
  expect(screen.getByLabelText("ACCOUNT NUMBER")).toHaveValue("1234567890123456");
  expect(screen.getByLabelText("Mobile Number")).toHaveValue("9845698712");
  expect(screen.queryByText("Linked bank account added.")).not.toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Add Linked Bank Account" }));
  await userEvent.click(screen.getByRole("button", { name: "Yes, Add Account" }));
  expect(screen.getByText("Linked bank account added.")).toBeVisible();
  expect(screen.getByText("Account Number: ************3456")).toBeVisible();
  expect(screen.queryByText("1234567890123456")).not.toBeInTheDocument();
});

test("confirms and adds a valid eSewa account on the same page", async () => {
  render(<PaymentMethodsClient />);
  await userEvent.click(screen.getByRole("button", { name: /Pay via eSewa/ }));
  await userEvent.type(screen.getByLabelText("eSewa Mobile Number"), "9845698712");
  await userEvent.type(screen.getByLabelText("ESEWA ID"), "9845691234");
  await userEvent.click(screen.getByRole("button", { name: "Add eSewa Account" }));

  expect(screen.getByRole("heading", { name: "Add eSewa Account?" })).toBeVisible();
  expect(screen.getByText("Do you want to add this eSewa account as a payment method?")).toBeVisible();
  await userEvent.click(screen.getByRole("button", { name: "Yes, Add Account" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(screen.getByText("eSewa account added.")).toBeVisible();
  expect(screen.getByText("eSewa ID: 9845691234")).toBeVisible();
});
