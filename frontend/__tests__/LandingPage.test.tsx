import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LandingPage from "@/app/page";

test("renders navigation, hero actions, and restaurant cards with correct routes", () => {
  render(<LandingPage />);
  expect(screen.getByRole("link", { name: "MealNest home" })).toHaveAttribute("href", "/");
  expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
  expect(screen.getByRole("link", { name: "Sign Up" })).toHaveAttribute("href", "/signup");
  expect(screen.getByRole("heading", { name: /Reserve your perfect table/ })).toBeVisible();
  expect(screen.getByRole("link", { name: /The Golden Truffle/ })).toHaveAttribute("href", "/restaurants/1");
});

test("filters by cuisine and search and clears an empty result", async () => {
  const user = userEvent.setup();
  render(<LandingPage />);
  await user.click(screen.getByRole("button", { name: "Italian" }));
  expect(screen.getByText("La Bella Italia")).toBeVisible();
  expect(screen.queryByText("Sakura Omakase")).not.toBeInTheDocument();
  const search = screen.getByPlaceholderText(/Search restaurants/);
  await user.clear(search); await user.type(search, "missing restaurant");
  expect(screen.getByText("No restaurants found matching your search.")).toBeVisible();
  await user.click(screen.getByRole("button", { name: "Clear Filters" }));
  expect(screen.getByText("The Golden Truffle")).toBeVisible();
});
