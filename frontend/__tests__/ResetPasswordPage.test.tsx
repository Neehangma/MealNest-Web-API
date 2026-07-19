import { render, screen } from "@testing-library/react";
import ResetPasswordPage from "@/app/(auth)/ResetPassword/page";

test("renders the reset-password page through its real form", () => {
  render(<ResetPasswordPage />);
  expect(screen.getByRole("heading", { name: "Reset Password" })).toBeVisible();
  expect(screen.getByRole("button", { name: "Send Reset Link" })).toBeVisible();
});
