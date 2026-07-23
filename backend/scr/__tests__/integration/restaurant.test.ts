const request = require("supertest");
const app = require("../../server");
const Restaurant = require("../../models/restaurant.model");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

describe("restaurant API", () => {
  test("lists, filters, searches, and retrieves restaurants", async () => {
    const restaurant = await createTestRestaurant({ name: "CW2 Roma", cuisine: "Italian" });
    const list = await request(app).get("/api/v1/restaurants?search=CW2%20Roma&cuisine=Italian&limit=100");
    expect(list.status).toBe(200);
    expect(list.body.data.some((item) => item._id === restaurant._id.toString())).toBe(true);

    const cuisine = await request(app).get("/api/restaurants/cuisine/Italian");
    expect(cuisine.status).toBe(200);
    expect(cuisine.body.restaurants.every((item) => item.cuisine.toLowerCase() === "italian")).toBe(true);

    const one = await request(app).get(`/api/v1/restaurants/${restaurant._id}`);
    expect(one.status).toBe(200);
    expect(one.body.data.name).toBe("CW2 Roma");
  });

  test("returns 404 for a missing restaurant", async () => {
    const missing = await request(app).get("/api/v1/restaurants/64b000000000000000000000");
    expect(missing.status).toBe(404);
  });

  test("allows admin restaurant CRUD and denies normal users", async () => {
    const admin = await createTestUser({ role: "admin", email: "admin-restaurants@example.com" });
    const user = await createTestUser({ email: "user-restaurants@example.com" });
    const payload = { name: "CW2 Admin Bistro", cuisine: "Italian", location: "Kathmandu", address: "Test Address", phone: "9800000000", priceRange: "Rs. 300–500", openingTime: "9:00 AM", closingTime: "9:00 PM", menuFeatures: "Pizza, Pasta", price: 400 };

    const denied = await request(app).post("/api/v1/restaurants").set("Authorization", `Bearer ${tokenFor(user)}`).field(payload);
    expect(denied.status).toBe(403);

    const created = await request(app).post("/api/v1/restaurants").set("Authorization", `Bearer ${tokenFor(admin)}`).field(payload);
    expect(created.status).toBe(201);
    expect(created.body.data).toMatchObject({ name: payload.name, cuisine: payload.cuisine, priceRange: payload.priceRange, hours: "Mon-Sun: 9:00 AM - 9:00 PM", features: ["Pizza", "Pasta"] });
    const id = created.body.restaurant._id;

    const updated = await request(app).put(`/api/v1/restaurants/${id}`).set("Authorization", `Bearer ${tokenFor(admin)}`).field({ name: "CW2 Updated Bistro" });
    expect(updated.status).toBe(200);
    expect(updated.body.data.name).toBe("CW2 Updated Bistro");

    const deleted = await request(app).delete(`/api/v1/restaurants/${id}`).set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(deleted.status).toBe(200);
    expect(await Restaurant.findById(id)).toBeNull();
  });
});
