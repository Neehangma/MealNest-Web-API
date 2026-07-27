const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const Review = require("../../models/review.model");
const {
  createTestRestaurant,
  createTestUser,
  tokenFor,
} = require("../helpers");

describe("restaurant review API", () => {
  test("creates, retrieves, isolates, and updates one review per user", async () => {
    const user = await createTestUser({
      fullName: "Review User",
      email: "review-user@example.com",
    });
    const restaurant = await createTestRestaurant({ name: "Review Bistro" });
    const otherRestaurant = await createTestRestaurant({ name: "Other Bistro" });
    const token = tokenFor(user);

    const created = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 5, comment: "Excellent food and service." });
    expect(created.status).toBe(201);
    expect(created.body.review).toMatchObject({
      restaurantId: restaurant._id.toString(),
      userId: user._id.toString(),
      userName: "Review User",
      rating: 5,
      comment: "Excellent food and service.",
    });

    await mongoose.disconnect();
    await mongoose.connect(process.env.MONGO_URI);

    const listed = await request(app).get(
      `/api/v1/restaurants/${restaurant._id}/reviews`,
    );
    expect(listed.status).toBe(200);
    expect(listed.body.count).toBe(1);
    expect(listed.body.reviews[0]._id).toBe(created.body.review._id);

    const isolated = await request(app).get(
      `/api/v1/restaurants/${otherRestaurant._id}/reviews`,
    );
    expect(isolated.status).toBe(200);
    expect(isolated.body.reviews).toEqual([]);

    const updated = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${token}`)
      .send({ rating: 4, comment: "Updated after another visit." });
    expect(updated.status).toBe(201);
    expect(updated.body.review._id).toBe(created.body.review._id);
    expect(await Review.countDocuments({ restaurantId: restaurant._id })).toBe(1);
  });

  test.each([
    [{ rating: 0, comment: "Invalid" }, "Rating must be an integer from 1 to 5"],
    [{ rating: 6, comment: "Invalid" }, "Rating must be an integer from 1 to 5"],
    [{ rating: 4.5, comment: "Invalid" }, "Rating must be an integer from 1 to 5"],
    [{ rating: 5, comment: "   " }, "Review comment is required"],
    [{ rating: 5, comment: "x".repeat(501) }, "Review comment must not exceed 500 characters"],
  ])("rejects invalid review input", async (body, message) => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const response = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send(body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test("rejects unauthenticated review submission", async () => {
    const restaurant = await createTestRestaurant();
    const response = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .send({ rating: 5, comment: "Should not be accepted" });
    expect(response.status).toBe(401);
  });
});
