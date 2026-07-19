import { render, screen } from "@testing-library/react";
import SignupPage from "@/app/(auth)/signup/page";

test("renders registration fields and sign-in navigation", () => {
  render(<SignupPage />);
  expect(screen.getByRole("heading", { name: "Create Account" })).toBeVisible();
  expect(screen.getByLabelText("Full Name")).toBeRequired();
  expect(screen.getByLabelText("Email Address")).toBeRequired();
  expect(screen.getByLabelText("Confirm Password")).toBeRequired();
  expect(screen.getByRole("link", { name: "Sign In" })).toHaveAttribute("href", "/login");
});
