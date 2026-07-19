const request = require("supertest");
const app = require("../../server");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

describe("favorite API", () => {
  test("adds, lists, and removes a restaurant for the current user", async () => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const token = tokenFor(user);

    const added = await request(app).post(`/api/favorites/${restaurant._id}`).set("Authorization", `Bearer ${token}`);
    expect(added.status).toBe(200);
    expect(added.body.action).toBe("added");

    const listed = await request(app).get("/api/favorites").set("Authorization", `Bearer ${token}`);
    expect(listed.status).toBe(200);
    expect(listed.body.favorites.some((item) => item._id === restaurant._id.toString())).toBe(true);

    const removed = await request(app).delete(`/api/favorites/${restaurant._id}`).set("Authorization", `Bearer ${token}`);
    expect(removed.status).toBe(200);
    expect(removed.body.action).toBe("removed");
  });

  test("requires authentication and a valid restaurant id", async () => {
    const noToken = await request(app).post("/api/favorites/64b000000000000000000000");
    expect(noToken.status).toBe(401);
    const user = await createTestUser();
    const invalid = await request(app).post("/api/favorites/not-an-id").set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(invalid.status).toBe(400);
  });
});

