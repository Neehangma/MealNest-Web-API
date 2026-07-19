const request = require("supertest");
const app = require("../../server");
const Reservation = require("../../models/reservation.model");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

function bookingPayload(restaurant, overrides = {}) {
  return {
    restaurantId: restaurant._id.toString(),
    restaurantName: restaurant.name,
    customerName: "CW2 Booking User",
    customerPhone: "9800000000",
    date: "2030-07-26",
    reservationDate: "2030-07-26T13:15:00.000Z",
    time: "7:00 PM",
    guests: 2,
    paymentMethod: "esewa",
    paymentStatus: "simulated_success",
    totalPaid: 500,
    transactionId: "CW2-BOOKING-001",
    ...overrides,
  };
}

describe("booking API", () => {
  test("creates a valid paid booking and stores its current response fields", async () => {
    const user = await createTestUser({ email: "booking@example.com" });
    const restaurant = await createTestRestaurant();
    const response = await request(app).post("/api/bookings").set("Authorization", `Bearer ${tokenFor(user)}`).send(bookingPayload(restaurant));

    expect(response.status).toBe(201);
    expect(response.body.booking).toMatchObject({ restaurantName: restaurant.name, paymentStatus: "simulated_success", totalPaid: 500 });
    expect(response.body.booking._id).toBeDefined();
    expect(await Reservation.findById(response.body.booking._id)).not.toBeNull();
  });

  test("rejects booking creation without authentication", async () => {
    const restaurant = await createTestRestaurant();
    const response = await request(app).post("/api/bookings").send(bookingPayload(restaurant));
    expect(response.status).toBe(401);
  });

  test("retrieves only the current user's reservation", async () => {
    const owner = await createTestUser({ email: "owner@example.com" });
    const other = await createTestUser({ email: "other@example.com" });
    const restaurant = await createTestRestaurant();
    const created = await request(app).post("/api/bookings").set("Authorization", `Bearer ${tokenFor(owner)}`).send(bookingPayload(restaurant));
    const id = created.body.booking._id;

    const own = await request(app).get(`/api/bookings/${id}`).set("Authorization", `Bearer ${tokenFor(owner)}`);
    expect(own.status).toBe(200);
    const denied = await request(app).get(`/api/bookings/${id}`).set("Authorization", `Bearer ${tokenFor(other)}`);
    expect(denied.status).toBe(404);
  });

  test("lists, updates, and cancels the current user's future booking", async () => {
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    const token = tokenFor(user);
    const created = await request(app).post("/api/bookings").set("Authorization", `Bearer ${token}`).send(bookingPayload(restaurant));
    const id = created.body.booking._id;

    const list = await request(app).get("/api/bookings/my-bookings").set("Authorization", `Bearer ${token}`);
    expect(list.status).toBe(200);
    expect(list.body.bookings).toHaveLength(1);

    const updated = await request(app).patch(`/api/reservations/${id}`).set("Authorization", `Bearer ${token}`).send({ guests: 4 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.guests).toBe(4);

    const cancelled = await request(app).patch(`/api/bookings/${id}/cancel`).set("Authorization", `Bearer ${token}`);
    expect(cancelled.status).toBe(200);
    expect(cancelled.body.data.status).toBe("cancelled");
  });

  test("returns not found for a missing owned booking", async () => {
    const user = await createTestUser();
    const response = await request(app).get("/api/bookings/64b000000000000000000000").set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(response.status).toBe(404);
  });
});

module.exports = { bookingPayload };

