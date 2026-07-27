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
});
