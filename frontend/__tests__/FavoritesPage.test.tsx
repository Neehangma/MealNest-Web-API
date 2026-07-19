import { render, screen } from "@testing-library/react";
import FavoritesPage from "@/app/favorites/page";
import { getFavoritesAction } from "@/lib/actions/dashboard-action";

jest.mock("@/lib/actions/dashboard-action", () => ({ getFavoritesAction: jest.fn(), toggleFavoriteAction: jest.fn() }));
const getFavorites = jest.mocked(getFavoritesAction);

test("renders the empty favourites state", async () => {
  getFavorites.mockResolvedValue([]);
  render(<FavoritesPage />);
  expect(await screen.findByRole("heading", { name: "No favorites yet" })).toBeVisible();
});

test("displays returned favourites", async () => {
  getFavorites.mockResolvedValue([{ _id: "1", name: "Tavola", cuisine: "Italian", location: "Kathmandu", image: "", isOpen: true, rating: 4.5, reviewCount: 10, status: "open" }]);
  render(<FavoritesPage />);
  expect(await screen.findByRole("heading", { name: "Tavola" })).toBeVisible();
  expect(screen.getByText("Italian")).toBeVisible();
});
