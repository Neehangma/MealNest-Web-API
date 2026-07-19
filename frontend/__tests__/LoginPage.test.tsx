import { render, screen } from "@testing-library/react";
import LoginPage from "@/app/(auth)/login/page";

test("renders login fields and account navigation", () => {
  render(<LoginPage />);
  expect(screen.getByRole("heading", { name: "Welcome Back" })).toBeVisible();
  expect(screen.getByLabelText("Email")).toBeRequired();
  expect(screen.getByLabelText("Password")).toBeRequired();
  expect(screen.getByRole("link", { name: "Forgot Password?" })).toHaveAttribute("href", "/ResetPassword");
  expect(screen.getByRole("link", { name: "Create an account" })).toHaveAttribute("href", "/signup");
});
