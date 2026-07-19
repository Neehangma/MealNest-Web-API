const request = require("supertest");
const app = require("../../server");
const Reservation = require("../../models/reservation.model");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

describe("admin API", () => {
  test("denies normal users and allows admins to list users safely", async () => {
    const normal = await createTestUser({ email: "normal-admin-test@example.com" });
    const admin = await createTestUser({ role: "admin", email: "admin-list@example.com" });
    const denied = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${tokenFor(normal)}`);
    expect(denied.status).toBe(403);

    const allowed = await request(app).get("/api/admin/users").set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(allowed.status).toBe(200);
    expect(allowed.body.data).toHaveLength(2);
    expect(allowed.body.data.every((user) => user.password === undefined)).toBe(true);
  });

  test("returns all users' bookings newest first", async () => {
    const admin = await createTestUser({ role: "admin", email: "admin-bookings@example.com" });
    const firstUser = await createTestUser({ email: "first@example.com" });
    const secondUser = await createTestUser({ email: "second@example.com" });
    const restaurant = await createTestRestaurant();
    await Reservation.create({ user: firstUser._id, restaurant: restaurant._id, restaurantName: restaurant.name, reservationDate: new Date("2030-01-01"), date: "2030-01-01", time: "7:00 PM", guests: 2, status: "confirmed", paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 100, bookingReference: "CW2-OLD" });
    await new Promise((resolve) => setTimeout(resolve, 5));
    await Reservation.create({ user: secondUser._id, restaurant: restaurant._id, restaurantName: restaurant.name, reservationDate: new Date("2030-01-02"), date: "2030-01-02", time: "8:00 PM", guests: 3, status: "confirmed", paymentMethod: "mobile_banking", paymentStatus: "simulated_success", totalPaid: 200, bookingReference: "CW2-NEW" });

    const response = await request(app).get("/api/admin/bookings").set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(response.status).toBe(200);
    expect(response.body.total).toBe(2);
    expect(response.body.data[0].bookingReference).toBe("CW2-NEW");
    expect(response.body.data[0].customer.email).toBe("second@example.com");
  });

  test("returns live dashboard counts and successful-payment revenue", async () => {
    const admin = await createTestUser({ role: "admin" });
    const user = await createTestUser();
    const restaurant = await createTestRestaurant();
    await Reservation.create({ user: user._id, restaurant: restaurant._id, restaurantName: restaurant.name, reservationDate: new Date("2030-01-01"), date: "2030-01-01", time: "7:00 PM", guests: 2, status: "confirmed", paymentMethod: "esewa", paymentStatus: "simulated_success", totalPaid: 350, bookingReference: "CW2-STATS" });
    const response = await request(app).get("/api/admin/dashboard/stats").set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(response.status).toBe(200);
    expect(response.body.stats).toMatchObject({ totalUsers: 2, totalBookings: 1, totalRestaurants: 1, totalRevenue: 350 });
  });
});

