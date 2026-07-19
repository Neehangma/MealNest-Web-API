import { render, screen } from "@testing-library/react";
import Footer from "@/app/_components/Footer";

test("renders footer identity and exact navigation destinations", () => {
  render(<Footer />);
  expect(screen.getByText(new RegExp(String(new Date().getFullYear())))).toBeVisible();
  const links = screen.getByRole("navigation", { name: "Footer links" });
  expect(within(links).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
  expect(within(links).getByRole("link", { name: "Dashboard" })).toHaveAttribute("href", "/dashboard");
  expect(within(links).getByRole("link", { name: "Register" })).toHaveAttribute("href", "/register");
  expect(within(links).getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
});

import { within } from "@testing-library/react";
