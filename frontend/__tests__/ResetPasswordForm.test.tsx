import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ResetPasswordForm from "@/app/(auth)/components/ResetPasswordForm";

test("accepts an email without calling a backend during rendering", async () => {
  const user = userEvent.setup();
  render(<ResetPasswordForm />);
  const input = screen.getByPlaceholderText("Enter email");
  expect(input).toHaveAttribute("type", "email");
  await user.type(input, "customer@example.com");
  expect(input).toHaveValue("customer@example.com");
  expect(screen.getByText(/request a password reset/i)).toBeVisible();
});
