import { render, screen } from "@testing-library/react";
import FavoriteRestaurantCard from "@/app/dashboard/user/_components/FavoriteRestaurantCard";

test("shows restaurant details and preserves its details route", () => {
  render(<FavoriteRestaurantCard favorite={{ _id: "restaurant-1", name: "Tavola", cuisine: "Italian", location: "Kathmandu", image: "", isOpen: true, rating: 4.5, reviewCount: 10, status: "open" }} onRemove={jest.fn()} />);
  expect(screen.getByRole("heading", { name: "Tavola" })).toBeVisible();
  expect(screen.getByText("Italian")).toBeVisible();
  expect(screen.getByRole("img", { name: "Tavola" })).toBeVisible();
  expect(screen.getByRole("link", { name: /Book Table/ })).toHaveAttribute("href", "/dashboard/user/restaurants/restaurant-1");
});
