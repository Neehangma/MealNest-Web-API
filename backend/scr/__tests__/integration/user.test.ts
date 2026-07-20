const request = require("supertest");
const app = require("../../server");
const bcrypt = require("bcryptjs");
const User = require("../../models/user.model");
const { createTestRestaurant, createTestUser, tokenFor } = require("../helpers");

describe("user profile API", () => {
  test("gets and updates the logged-in user without exposing password", async () => {
    const user = await createTestUser({ email: "profile@example.com" });
    const token = tokenFor(user);
    const current = await request(app).get("/api/auth/current").set("Authorization", `Bearer ${token}`);
    expect(current.body.user.password).toBeUndefined();

    const updated = await request(app).patch("/api/profile").set("Authorization", `Bearer ${token}`).send({ fullName: "Updated CW2 User", location: "Lalitpur" });
    expect(updated.status).toBe(200);
    expect(updated.body.user).toMatchObject({ fullName: "Updated CW2 User", location: "Lalitpur" });
    expect(updated.body.user.password).toBeUndefined();
  });

  test("rejects invalid profile data", async () => {
    const user = await createTestUser();
    const response = await request(app).patch("/api/profile").set("Authorization", `Bearer ${tokenFor(user)}`).send({ email: "not-an-email" });
    expect(response.status).toBe(400);
  });

  test("changes only the authenticated user's password and requires the new password for login", async () => {
    const restaurant = await createTestRestaurant();
    const user = await createTestUser({
      fullName: "Password Change User",
      email: "password-change@example.com",
      phoneNumber: "9845698712",
      password: "Current1!",
      role: "user",
    });
    user.location = "Kathmandu";
    user.bio = "Keep this profile";
    user.favorites.push(restaurant._id);
    user.reservations.push({
      restaurantId: restaurant._id,
      restaurantName: restaurant.name,
      reservationDate: new Date("2030-01-01"),
      date: "2030-01-01",
      time: "7:00 PM",
      guests: 2,
      bookingReference: "PASSWORD-KEEP",
    });
    await user.save();

    const originalId = user._id.toString();
    const originalCount = await User.countDocuments();
    const response = await request(app)
      .patch("/api/profile/password")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ currentPassword: "Current1!", newPassword: "NewStrong2@", confirmPassword: "NewStrong2@" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: "Password changed successfully. Please log in again using your new password." });
    expect(JSON.stringify(response.body)).not.toContain("NewStrong2@");
    expect(await User.countDocuments()).toBe(originalCount);

    const updated = await User.findById(originalId).select("+password");
    expect(updated._id.toString()).toBe(originalId);
    expect(updated).toMatchObject({ fullName: "Password Change User", email: "password-change@example.com", phoneNumber: "9845698712", role: "user", location: "Kathmandu", bio: "Keep this profile" });
    expect(updated.favorites).toHaveLength(1);
    expect(updated.reservations).toHaveLength(1);
    expect(updated.reservations[0].bookingReference).toBe("PASSWORD-KEEP");
    expect(updated.password).not.toBe("NewStrong2@");
    expect(await bcrypt.compare("Current1!", updated.password)).toBe(false);
    expect(await bcrypt.compare("NewStrong2@", updated.password)).toBe(true);

    const oldLogin = await request(app).post("/api/auth/login").send({ email: user.email, password: "Current1!" });
    const newLogin = await request(app).post("/api/auth/login").send({ email: user.email, password: "NewStrong2@" });
    expect(oldLogin.status).toBe(401);
    expect(newLogin.status).toBe(200);
    expect(newLogin.body.user.id).toBe(originalId);
  });

  test.each([
    [{ currentPassword: "Wrong1!", newPassword: "NewStrong2@", confirmPassword: "NewStrong2@" }, 401, "Current password is incorrect."],
    [{ currentPassword: "Current1!", newPassword: "weak", confirmPassword: "weak" }, 400, "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."],
    [{ currentPassword: "Current1!", newPassword: "Current1!", confirmPassword: "Current1!" }, 400, "New password must be different from the current password."],
    [{ currentPassword: "Current1!", newPassword: "NewStrong2@", confirmPassword: "Different3#" }, 400, "New password and confirm password do not match."],
  ])("rejects invalid password changes", async (payload, status, message) => {
    const user = await createTestUser({ password: "Current1!" });
    const response = await request(app).patch("/api/profile/password").set("Authorization", `Bearer ${tokenFor(user)}`).send(payload);
    expect(response.status).toBe(status);
    expect(response.body.message).toBe(message);
    const unchanged = await User.findById(user._id).select("+password");
    expect(await bcrypt.compare("Current1!", unchanged.password)).toBe(true);
  });
});
