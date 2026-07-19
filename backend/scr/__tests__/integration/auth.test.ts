const request = require("supertest");
const bcrypt = require("bcryptjs");
const app = require("../../server");
const User = require("../../models/user.model");
const { createTestUser, tokenFor } = require("../helpers");

describe("authentication API", () => {
  test("registers a user, returns the current token shape, and stores a hash", async () => {
    const response = await request(app).post("/api/auth/register").send({
      fullName: "CW2 Registered User",
      email: "registered@example.com",
      phoneNumber: "9800000000",
      password: "secret123",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, message: "Account created successfully" });
    expect(typeof response.body.token).toBe("string");
    expect(response.body.user.password).toBeUndefined();
    const stored = await User.findOne({ email: "registered@example.com" }).select("+password");
    expect(stored.password).not.toBe("secret123");
    expect(await bcrypt.compare("secret123", stored.password)).toBe(true);
  });

  test.each([
    [{ email: "bad", password: "secret123", fullName: "User" }, "Valid email is required"],
    [{ email: "user@example.com", password: "123", fullName: "User" }, "Password must be at least 6 characters"],
    [{ email: "user@example.com", password: "secret123" }, "Full name is required and must be a string"],
  ])("rejects invalid registration input", async (body, message) => {
    const response = await request(app).post("/api/auth/register").send(body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test("rejects duplicate email", async () => {
    await createTestUser({ email: "duplicate@example.com" });
    const response = await request(app).post("/api/auth/register").send({ fullName: "Duplicate", email: "duplicate@example.com", password: "secret123" });
    expect(response.status).toBe(409);
  });

  test("logs in successfully and rejects wrong or unknown credentials", async () => {
    await createTestUser({ email: "login@example.com", password: "secret123" });
    const success = await request(app).post("/api/auth/login").send({ email: "login@example.com", password: "secret123" });
    expect(success.status).toBe(200);
    expect(success.body.user.password).toBeUndefined();
    expect(typeof success.body.token).toBe("string");

    for (const body of [
      { email: "login@example.com", password: "wrong-password" },
      { email: "missing@example.com", password: "secret123" },
    ]) {
      const failure = await request(app).post("/api/auth/login").send(body);
      expect(failure.status).toBe(401);
    }
  });

  test("protects current-user routes from missing, malformed, and invalid tokens", async () => {
    for (const authorization of [undefined, "Token abc", "Bearer invalid-token"]) {
      const response = await request(app).get("/api/auth/current").set(authorization ? { Authorization: authorization } : {});
      expect(response.status).toBe(401);
    }
  });

  test("returns the authenticated user for a valid token", async () => {
    const user = await createTestUser({ email: "current@example.com" });
    const response = await request(app).get("/api/auth/current").set("Authorization", `Bearer ${tokenFor(user)}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("current@example.com");
    expect(response.body.user.password).toBeUndefined();
  });
});

