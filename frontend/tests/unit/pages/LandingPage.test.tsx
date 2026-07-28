/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import LandingPage from "@/app/page";

test("renders navigation, hero actions, and the current cuisine discovery section", () => {
  render(<LandingPage />);
  expect(screen.getByRole("link", { name: "MealNest home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup");
  expect(screen.getByRole("heading", { name: /Reserve your perfect table/ })).toBeVisible();
  expect(screen.getByRole("heading", { name: "Explore Popular Cuisines" })).toBeVisible();
  expect(screen.getByRole("link", { name: "Explore All Cuisines" })).toHaveAttribute(
    "href",
    "/dashboard/user/discover",
  );
});

test("shows only the cuisines currently promoted by MealNest", () => {
  render(<LandingPage />);
  for (const cuisine of ["French", "Japanese", "Thai", "Chinese", "Indian"]) {
    expect(screen.getByRole("img", { name: `${cuisine} cuisine` })).toBeVisible();
  }
  expect(screen.queryByRole("img", { name: "Spanish cuisine" })).not.toBeInTheDocument();
});
