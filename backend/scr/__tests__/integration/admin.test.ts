const request = require("supertest");
const app = require("../../server");
const Reservation = require("../../models/reservation.model");
const User = require("../../models/user.model");
const bcrypt = require("bcryptjs");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

describe("admin API", () => {
  test.each(["user", "ADMIN"])("creates a safe %s account that can log in", async (role) => {
    const admin = await createTestUser({ role: "admin", email: `creator-${role.toLowerCase()}@example.com` });
    const payload = { fullName: "  Created User  ", email: `Created-${role}@Example.com`, phoneNumber: "9845698712", password: "StrongPass1!", role };
    const response = await request(app).post("/api/admin/users").set("Authorization", `Bearer ${tokenFor(admin)}`).send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, message: "User created successfully.", data: { fullName: "Created User", email: `created-${role.toLowerCase()}@example.com`, phoneNumber: "9845698712", role: role.toLowerCase() } });
    expect(response.body.data.password).toBeUndefined();

    const stored = await User.findOne({ email: `created-${role.toLowerCase()}@example.com` }).select("+password");
    expect(stored.password).not.toBe(payload.password);
    expect(await bcrypt.compare(payload.password, stored.password)).toBe(true);
    const login = await request(app).post("/api/auth/login").send({ email: payload.email, password: payload.password });
    expect(login.status).toBe(200);
  });

  test("rejects duplicate concurrent creates without saving two users", async () => {
    const admin = await createTestUser({ role: "admin", email: "concurrent-admin@example.com" });
    const payload = { fullName: "Duplicate User", email: "DUPLICATE@example.com", phoneNumber: "9845698712", password: "StrongPass1!", role: "user" };
    const requests = await Promise.all([
      request(app).post("/api/admin/users").set("Authorization", `Bearer ${tokenFor(admin)}`).send(payload),
      request(app).post("/api/admin/users").set("Authorization", `Bearer ${tokenFor(admin)}`).send(payload),
    ]);

    expect(requests.map((response) => response.status).sort()).toEqual([201, 409]);
    expect(await User.countDocuments({ email: "duplicate@example.com" })).toBe(1);
  });

  test.each([
    [{ fullName: "", email: "valid@example.com", phoneNumber: "9845698712", password: "StrongPass1!", role: "user" }, "Name is required."],
    [{ fullName: "User", email: "invalid", phoneNumber: "9845698712", password: "StrongPass1!", role: "user" }, "Please enter a valid email address."],
    [{ fullName: "User", email: "valid@example.com", phoneNumber: "123", password: "StrongPass1!", role: "user" }, "Phone number must contain exactly 10 digits."],
    [{ fullName: "User", email: "valid@example.com", phoneNumber: "9845698712", password: "weak", role: "user" }, "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."],
    [{ fullName: "User", email: "valid@example.com", phoneNumber: "9845698712", password: "StrongPass1!", role: "owner" }, "Role must be either 'user' or 'admin'"],
  ])("rejects invalid admin-created users", async (payload, message) => {
    const admin = await createTestUser({ role: "admin" });
    const response = await request(app).post("/api/admin/users").set("Authorization", `Bearer ${tokenFor(admin)}`).send(payload);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test("denies a normal user from creating an account", async () => {
    const user = await createTestUser({ role: "user" });
    const response = await request(app).post("/api/admin/users").set("Authorization", `Bearer ${tokenFor(user)}`).send({ fullName: "Denied", email: "denied@example.com", phoneNumber: "9845698712", password: "StrongPass1!", role: "user" });
    expect(response.status).toBe(403);
    expect(await User.findOne({ email: "denied@example.com" })).toBeNull();
  });

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

