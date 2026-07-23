import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RestaurantMenu from "@/app/restaurants/[id]/RestaurantMenu";
import { getCuisineMenu } from "@/lib/cuisine-menus";

test.each(["Thai", "Italian", "Japanese", "Indian", "Chinese", "Nepali", "Korean", "Mediterranean"])("provides a complete base menu for %s cuisine", (cuisine) => {
  const menu = getCuisineMenu(cuisine);
  expect(menu).toBeDefined();
  expect(menu?.categories.map((category) => category.name)).toEqual(expect.arrayContaining(["Starters", "Main Dishes", "Desserts", "Drinks"]));
  expect(menu?.categories.every((category) => category.items.every((item) => item.category === category.name && item.description && item.price > 0))).toBe(true);
});

test("matches cuisine case-insensitively and filters visible menu items", async () => {
  render(<RestaurantMenu cuisine="  iTaLiAn  " />);

  expect(screen.getByRole("heading", { name: "Restaurant Menu" })).toBeVisible();
  expect(screen.getByRole("button", { name: "All" })).toHaveClass("menu-filter-button", "active");
  expect(screen.queryByRole("button", { name: "Rice & Noodles" })).not.toBeInTheDocument();
  expect(screen.getByText("Margherita Pizza")).toBeVisible();
  expect(screen.getAllByText("Vegetarian", { selector: ".restaurant-menu-badge" }).length).toBeGreaterThan(0);

  await userEvent.click(screen.getByRole("button", { name: "Desserts" }));
  expect(screen.getByText("Tiramisu")).toBeVisible();
  expect(screen.queryByText("Margherita Pizza")).not.toBeInTheDocument();
});

test("uses the same reusable filter buttons for different cuisines", () => {
  const { rerender } = render(<RestaurantMenu key="thai" cuisine="Thai" />);
  const thaiFilters = screen.getByRole("group", { name: "Filter menu by category" }).querySelectorAll("button");
  expect(Array.from(thaiFilters).every((button) => button.classList.contains("menu-filter-button"))).toBe(true);
  expect(thaiFilters[0]).toHaveTextContent("All");

  rerender(<RestaurantMenu key="chinese" cuisine="Chinese" />);
  const chineseFilters = screen.getByRole("group", { name: "Filter menu by category" }).querySelectorAll("button");
  expect(Array.from(chineseFilters).every((button) => button.classList.contains("menu-filter-button"))).toBe(true);
  expect(chineseFilters[0]).toHaveTextContent("All");
});

test("shows the fallback when no cuisine menu exists", () => {
  render(<RestaurantMenu cuisine="Unknown Fusion" />);
  expect(screen.getByText("Menu information is currently unavailable for this restaurant.")).toBeVisible();
  expect(screen.queryByRole("group", { name: "Filter menu by category" })).not.toBeInTheDocument();
});
