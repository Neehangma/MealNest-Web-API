import { getRestaurantImage, RESTAURANT_FALLBACK_IMAGE } from "@/lib/restaurant-image";

describe("getRestaurantImage", () => {
  test("builds a backend URL for uploaded restaurant images", () => {
    expect(getRestaurantImage("/uploads/restaurants/photo.jpg")).toBe(
      "http://localhost:8088/uploads/restaurants/photo.jpg",
    );
    expect(getRestaurantImage("uploads/restaurants/photo.jpg")).toBe(
      "http://localhost:8088/uploads/restaurants/photo.jpg",
    );
  });

  test("preserves frontend assets, complete URLs, and temporary previews", () => {
    expect(getRestaurantImage()).toBe(RESTAURANT_FALLBACK_IMAGE);
    expect(getRestaurantImage("/images/tavola.jpg")).toBe("/images/tavola.jpg");
    expect(getRestaurantImage("https://images.example/restaurant.jpg")).toBe("https://images.example/restaurant.jpg");
    expect(getRestaurantImage("blob:preview")).toBe("blob:preview");
  });
});
