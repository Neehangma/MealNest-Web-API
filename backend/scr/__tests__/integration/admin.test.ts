const request = require("supertest");
const app = require("../../server");
const Reservation = require("../../models/reservation.model");
const Review = require("../../models/review.model");
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

  test("returns complete safe details for the selected user and rejects unauthorized access", async () => {
    const admin = await createTestUser({ role: "admin", email: "details-admin@example.com" });
    const user = await createTestUser({ fullName: "Details User", email: "details-user@example.com" });
    const restaurant = await createTestRestaurant({ name: "Details Restaurant", cuisine: "Thai" });
    user.favorites.push(restaurant._id);
    user.passwordResetToken = "never-send-this";
    user.passwordResetExpires = new Date(Date.now() + 60_000);
    await user.save();
    const reservation = await Reservation.create({
      user: user._id,
      restaurant: restaurant._id,
      restaurantName: restaurant.name,
      reservationDate: new Date("2030-01-01"),
      date: "2030-01-01",
      time: "7:00 PM",
      guests: 3,
      tableNumber: 4,
      status: "confirmed",
      paymentMethod: "esewa",
      paymentStatus: "simulated_success",
      totalPaid: 900,
      bookingReference: "DETAIL-USER-1",
    });
    await Review.create({
      userId: user._id,
      restaurantId: restaurant._id,
      reservationId: reservation._id,
      userName: user.fullName,
      rating: 4,
      comment: "A database-backed user review.",
      status: "hidden",
    });

    const denied = await request(app)
      .get(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(denied.status).toBe(403);

    const response = await request(app)
      .get(`/api/admin/users/${user._id}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(response.status).toBe(200);
    expect(response.body.data.user).toMatchObject({
      id: user._id.toString(),
      fullName: "Details User",
      email: "details-user@example.com",
      accountStatus: "active",
    });
    expect(response.body.data.activity).toMatchObject({
      totalReservations: 1,
      upcomingReservations: 1,
      totalReviews: 1,
      averageReviewRating: 4,
      totalFavorites: 1,
    });
    expect(response.body.data.reservations[0]).toMatchObject({
      restaurantName: "Details Restaurant",
      guests: 3,
      tableNumber: 4,
      totalAmount: 900,
    });
    expect(response.body.data.reviews[0]).toMatchObject({
      restaurantName: "Details Restaurant",
      rating: 4,
      status: "hidden",
    });
    expect(response.body.data.favorites[0].name).toBe("Details Restaurant");
    const serialized = JSON.stringify(response.body);
    expect(serialized).not.toContain("password");
    expect(serialized).not.toContain("never-send-this");
    expect(serialized).not.toContain("passwordResetToken");

    const invalid = await request(app)
      .get("/api/admin/users/not-an-id")
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(invalid.status).toBe(400);

    const missing = await request(app)
      .get("/api/admin/users/507f1f77bcf86cd799439011")
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(missing.status).toBe(404);
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

  test("allows only an admin to complete an eligible confirmed booking", async () => {
    const admin = await createTestUser({ role: "admin", email: "complete-admin@example.com" });
    const user = await createTestUser({ email: "complete-user@example.com" });
    const restaurant = await createTestRestaurant();
    const past = await Reservation.create({
      user: user._id,
      restaurant: restaurant._id,
      restaurantName: restaurant.name,
      reservationDate: new Date("2020-01-01"),
      date: "2020-01-01",
      time: "7:00 PM",
      guests: 2,
      status: "confirmed",
      paymentMethod: "esewa",
      paymentStatus: "simulated_success",
      bookingReference: "COMPLETE-PAST",
    });

    const denied = await request(app)
      .patch(`/api/admin/bookings/${past._id}/complete`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(denied.status).toBe(403);

    const completed = await request(app)
      .patch(`/api/admin/bookings/${past._id}/complete`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(completed.status).toBe(200);
    expect(completed.body.data.status).toBe("completed");
    expect((await Reservation.findById(past._id)).paymentStatus).toBe("simulated_success");
  });

  test("returns protected, zero-filled analytics from MongoDB aggregations", async () => {
    const admin = await createTestUser({ role: "admin", email: "analytics-admin@example.com" });
    const user = await createTestUser({ email: "analytics-user@example.com" });
    const italian = await createTestRestaurant({ name: "Analytics Italian", cuisine: "Italian", image: "/images/italian.jpg" });
    const thai = await createTestRestaurant({ name: "Analytics Thai", cuisine: "Thai", image: "/images/thai.jpg" });
    const createdAt = new Date();

    await Reservation.create([
      { user: user._id, restaurant: italian._id, restaurantName: italian.name, reservationDate: new Date("2030-01-01"), date: "2030-01-01", time: "7:00 PM", guests: 2, status: "confirmed", bookingReference: "ANALYTICS-1", createdAt },
      { user: user._id, restaurant: italian._id, restaurantName: italian.name, reservationDate: new Date("2030-01-02"), date: "2030-01-02", time: "7:00 PM", guests: 2, status: "cancelled", bookingReference: "ANALYTICS-2", createdAt },
      { user: user._id, restaurant: thai._id, restaurantName: thai.name, reservationDate: new Date("2030-01-03"), date: "2030-01-03", time: "7:00 PM", guests: 2, status: "pending", bookingReference: "ANALYTICS-3", createdAt },
    ]);

    const denied = await request(app).get("/api/admin/analytics?range=7d").set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(denied.status).toBe(403);

    const response = await request(app).get("/api/admin/analytics?range=7d").set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(response.status).toBe(200);
    expect(response.body.summary).toEqual({ totalUsers: 2, totalRestaurants: 2, totalBookings: 3 });
    expect(response.body.bookingTrends).toHaveLength(7);
    expect(response.body.bookingTrends.reduce((sum, item) => sum + item.count, 0)).toBe(3);
    expect(response.body.userGrowth).toHaveLength(7);
    expect(response.body.userGrowth.reduce((sum, item) => sum + item.count, 0)).toBe(1);
    expect(response.body.bookingStatuses).toEqual([
      { status: "pending", count: 1 },
      { status: "confirmed", count: 1 },
      { status: "completed", count: 0 },
      { status: "cancelled", count: 1 },
    ]);
    expect(response.body.restaurantsByCuisine).toEqual(expect.arrayContaining([
      { cuisine: "Italian", count: 1 },
      { cuisine: "Thai", count: 1 },
    ]));
    expect(response.body.topRestaurants[0]).toMatchObject({
      restaurantId: italian._id.toString(),
      name: "Analytics Italian",
      cuisine: "Italian",
      image: "/images/italian.jpg",
      bookingCount: 2,
    });

    const monthly = await request(app).get("/api/admin/analytics?range=6m").set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(monthly.status).toBe(200);
    expect(monthly.body.bookingTrends).toHaveLength(6);

    const invalid = await request(app).get("/api/admin/analytics?range=year").set("Authorization", `Bearer ${tokenFor(admin)}`);
    expect(invalid.status).toBe(400);
  });
});

