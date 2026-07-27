const request = require("supertest");
const app = require("../../server");
const Reservation = require("../../models/reservation.model");
const Review = require("../../models/review.model");
const {
  createTestRestaurant,
  createTestUser,
  tokenFor,
} = require("../helpers");

async function createReservation(user, restaurant, overrides = {}) {
  const input: any = overrides;
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const date = input.date || pastDate.toISOString().slice(0, 10);
  return Reservation.create({
    user: user._id,
    restaurant: restaurant._id,
    restaurantName: restaurant.name,
    reservationDate: input.reservationDate || pastDate,
    date,
    time: input.time || "7:00 PM",
    guests: 2,
    status: input.status || "completed",
    bookingReference: `MN-REVIEW-${Date.now()}-${Math.random()}`,
  });
}

describe("restaurant review API", () => {
  test("stores a completed reservation review and exposes it to other users", async () => {
    const user = await createTestUser({ fullName: "Review User", email: "review-user@example.com" });
    const otherUser = await createTestUser({ fullName: "Other User", email: "other-review-user@example.com" });
    const restaurant = await createTestRestaurant({ name: "Review Bistro" });
    const reservation = await createReservation(user, restaurant);

    const created = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ reservationId: reservation._id.toString(), rating: 5, comment: "Excellent food and service." });

    expect(created.status).toBe(201);
    expect(created.body.review).toMatchObject({
      restaurantId: restaurant._id.toString(),
      reservationId: reservation._id.toString(),
      userId: user._id.toString(),
      userName: "Review User",
      rating: 5,
      comment: "Excellent food and service.",
    });
    expect(await Review.countDocuments({ reservationId: reservation._id })).toBe(1);

    const listed = await request(app)
      .get(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(otherUser)}`);
    expect(listed.status).toBe(200);
    expect(listed.body.reviews[0]._id).toBe(created.body.review._id);

    const refreshedRestaurant = await request(app).get(`/api/v1/restaurants/${restaurant._id}`);
    expect(refreshedRestaurant.body.data).toMatchObject({ rating: 5, reviewCount: 1 });
  });

  test("prevents duplicate reviews for the same reservation", async () => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const reservation = await createReservation(user, restaurant);
    const payload = { reservationId: reservation._id.toString(), rating: 5, comment: "A memorable dinner." };

    expect((await request(app).post(`/api/v1/restaurants/${restaurant._id}/reviews`).set("Authorization", `Bearer ${tokenFor(user)}`).send(payload)).status).toBe(201);
    const duplicate = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send(payload);

    expect(duplicate.status).toBe(409);
    expect(duplicate.body.message).toBe("A review has already been submitted for this reservation");
  });

  test("allows the owner to edit a review without creating another review", async () => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const reservation = await createReservation(user, restaurant);
    const created = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ reservationId: reservation._id.toString(), rating: 5, comment: "Excellent." });

    const updated = await request(app)
      .patch(`/api/v1/restaurants/${restaurant._id}/reviews/${created.body.review._id}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ rating: 4, comment: "Still very good." });

    expect(updated.status).toBe(200);
    expect(updated.body.review).toMatchObject({ rating: 4, comment: "Still very good." });
    expect(await Review.countDocuments({ reservationId: reservation._id })).toBe(1);
  });

  test.each([
    ["upcoming", { status: "confirmed", reservationDate: new Date(Date.now() + 24 * 60 * 60 * 1000), date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10) }, "Reviews can only be submitted after your reservation has been completed"],
    ["cancelled", { status: "cancelled" }, "Cancelled reservations cannot be reviewed"],
  ])("rejects %s reservations", async (_label, reservationOverrides, message) => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const reservation = await createReservation(user, restaurant, reservationOverrides);
    const response = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ reservationId: reservation._id.toString(), rating: 5, comment: "Should be rejected." });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test("rejects a reservation owned by another user", async () => {
    const owner = await createTestUser();
    const otherUser = await createTestUser();
    const restaurant = await createTestRestaurant();
    const reservation = await createReservation(owner, restaurant);
    const response = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(otherUser)}`)
      .send({ reservationId: reservation._id.toString(), rating: 5, comment: "Not my reservation." });
    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Reservation not found");
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
    const reservation = await createReservation(user, restaurant);
    const response = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ reservationId: reservation._id.toString(), ...body });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test("rejects unauthenticated review submission", async () => {
    const restaurant = await createTestRestaurant();
    const response = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .send({ reservationId: "507f1f77bcf86cd799439011", rating: 5, comment: "Should not be accepted" });
    expect(response.status).toBe(401);
  });

  test("lets admins list, hide, republish, and delete the same user-submitted review", async () => {
    const admin = await createTestUser({ role: "admin", email: "review-admin@example.com" });
    const user = await createTestUser({ fullName: "Admin Visible User", email: "admin-visible-user@example.com" });
    const restaurant = await createTestRestaurant({ name: "Admin Review Restaurant", cuisine: "Thai" });
    const reservation = await createReservation(user, restaurant);
    const created = await request(app)
      .post(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ reservationId: reservation._id.toString(), rating: 1, comment: "This review needs moderation." });
    const reviewId = created.body.review._id;

    const listed = await request(app)
      .get("/api/v1/admin/reviews?search=moderation&rating=1&status=published&sort=newest&page=1&limit=10")
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(listed.status).toBe(200);
    expect(listed.body.meta).toMatchObject({ page: 1, total: 1, totalPages: 1 });
    expect(listed.body.data[0]).toMatchObject({
      customer: { name: "Admin Visible User", email: "admin-visible-user@example.com" },
      restaurant: { name: "Admin Review Restaurant", cuisine: "Thai" },
      rating: 1,
      comment: "This review needs moderation.",
      status: "published",
    });
    expect(listed.body.data[0].reservation.date).toBe(reservation.date);

    const hidden = await request(app)
      .patch(`/api/v1/admin/reviews/${reviewId}/status`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ status: "hidden" });
    expect(hidden.status).toBe(200);
    expect(hidden.body.data.status).toBe("hidden");
    expect((await Review.findById(reviewId)).status).toBe("hidden");

    const publicWhileHidden = await request(app)
      .get(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(publicWhileHidden.body.reviews).toEqual([]);
    const hiddenRestaurant = await request(app).get(`/api/v1/restaurants/${restaurant._id}`);
    expect(hiddenRestaurant.body.data).toMatchObject({ rating: 0, reviewCount: 0 });

    const republished = await request(app)
      .patch(`/api/v1/admin/reviews/${reviewId}/status`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ status: "published" });
    expect(republished.body.data.status).toBe("published");
    const publicAfterPublish = await request(app)
      .get(`/api/v1/restaurants/${restaurant._id}/reviews`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(publicAfterPublish.body.reviews).toHaveLength(1);

    const removed = await request(app)
      .delete(`/api/v1/admin/reviews/${reviewId}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(removed.status).toBe(200);
    expect(await Review.findById(reviewId)).toBeNull();
  });

  test("protects admin review APIs and calculates analytics from MongoDB reviews", async () => {
    const admin = await createTestUser({ role: "admin" });
    const user = await createTestUser();
    const restaurant = await createTestRestaurant({ name: "Analytics Review Restaurant" });
    const firstReservation = await createReservation(user, restaurant);
    const secondReservation = await createReservation(user, restaurant);
    await Review.create([
      { restaurantId: restaurant._id, userId: user._id, reservationId: firstReservation._id, userName: user.fullName, rating: 5, comment: "Five star review.", status: "published" },
      { restaurantId: restaurant._id, userId: user._id, reservationId: secondReservation._id, userName: user.fullName, rating: 1, comment: "One star review.", status: "hidden" },
    ]);

    const deniedRoutes = [
      request(app).get("/api/v1/admin/reviews").set("Authorization", `Bearer ${tokenFor(user)}`),
      request(app).get("/api/v1/admin/reviews/analytics?range=7d").set("Authorization", `Bearer ${tokenFor(user)}`),
    ];
    const denied = await Promise.all(deniedRoutes);
    expect(denied.every((response) => response.status === 403)).toBe(true);

    const analytics = await request(app)
      .get("/api/v1/admin/reviews/analytics?range=7d")
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(analytics.status).toBe(200);
    expect(analytics.body.summary).toEqual({
      totalReviews: 2,
      averageRating: 3,
      reviewsThisWeek: 2,
      oneStarReviews: 1,
    });
    expect(analytics.body.reviewsInRange).toBe(2);
    expect(analytics.body.ratingDistribution).toEqual([
      { rating: 1, count: 1 },
      { rating: 2, count: 0 },
      { rating: 3, count: 0 },
      { rating: 4, count: 0 },
      { rating: 5, count: 1 },
    ]);
    expect(analytics.body.topReviewedRestaurants[0]).toMatchObject({
      name: "Analytics Review Restaurant",
      reviewCount: 2,
    });
    expect(analytics.body.recentReviews).toHaveLength(2);

    const firstPage = await request(app)
      .get("/api/v1/admin/reviews?page=1&limit=1&sort=highest")
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(firstPage.status).toBe(200);
    expect(firstPage.body.data).toHaveLength(1);
    expect(firstPage.body.data[0].rating).toBe(5);
    expect(firstPage.body.meta).toMatchObject({
      page: 1,
      limit: 1,
      total: 2,
      totalPages: 2,
    });

    const secondPage = await request(app)
      .get("/api/v1/admin/reviews?page=2&limit=1&sort=highest")
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(secondPage.status).toBe(200);
    expect(secondPage.body.data).toHaveLength(1);
    expect(secondPage.body.data[0].rating).toBe(1);
  });
});
