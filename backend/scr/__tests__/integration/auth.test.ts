const request = require("supertest");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const mockSendPasswordResetEmail = jest.fn();

jest.mock("../../services/emailService", () => ({
  sendBookingConfirmationEmail: jest.fn(),
  sendPasswordResetEmail: mockSendPasswordResetEmail,
}));

const app = require("../../server");
const User = require("../../models/user.model");
const { createTestUser, tokenFor } = require("../helpers");

describe("authentication API", () => {
  beforeEach(() => {
    mockSendPasswordResetEmail.mockReset();
    mockSendPasswordResetEmail.mockResolvedValue({ messageId: "reset-email" });
  });

  test("registers a user, returns the current token shape, and stores a hash", async () => {
    const response = await request(app).post("/api/auth/register").send({
      fullName: "CW2 Registered User",
      email: "registered@example.com",
      phoneNumber: "9800000000",
      password: "Secret123!",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({ success: true, message: "Account created successfully. Please log in to continue." });
    expect(response.body.token).toBeUndefined();
    expect(response.body.user.password).toBeUndefined();
    const stored = await User.findOne({ email: "registered@example.com" }).select("+password");
    expect(stored.password).not.toBe("Secret123!");
    expect(await bcrypt.compare("Secret123!", stored.password)).toBe(true);

    const login = await request(app).post("/api/auth/login").send({ email: "registered@example.com", password: "Secret123!" });
    expect(login.status).toBe(200);
    expect(typeof login.body.token).toBe("string");
  });

  test.each([
    [{ email: "bad", password: "secret123", fullName: "User" }, "Valid email is required"],
    [{ email: "user@example.com", password: "weakpassword", fullName: "User" }, "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character."],
    [{ email: "user@example.com", password: "Secret123!", fullName: "User", phoneNumber: "98000 00000" }, "Phone number must contain exactly 10 digits."],
    [{ email: "user@example.com", password: "secret123" }, "Full name is required and must be a string"],
  ])("rejects invalid registration input", async (body, message) => {
    const response = await request(app).post("/api/auth/register").send(body);
    expect(response.status).toBe(400);
    expect(response.body.message).toBe(message);
  });

  test("rejects duplicate email", async () => {
    await createTestUser({ email: "duplicate@example.com" });
    const response = await request(app).post("/api/auth/register").send({ fullName: "Duplicate", email: "duplicate@example.com", password: "Secret123!" });
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

  test("requests a password reset without revealing whether the email exists", async () => {
    await createTestUser({ email: "reset@example.com" });

    for (const email of ["reset@example.com", "unknown@example.com"]) {
      const response = await request(app).post("/api/auth/forgot-password").send({ email });
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("If an account exists for this email, a password reset link has been sent.");
    }

    expect(mockSendPasswordResetEmail).toHaveBeenCalledTimes(1);
    const stored = await User.findOne({ email: "reset@example.com" })
      .select("+passwordResetToken +passwordResetExpires");
    const { resetToken } = mockSendPasswordResetEmail.mock.calls[0][0];
    expect(stored.passwordResetToken).toBe(crypto.createHash("sha256").update(resetToken).digest("hex"));
    expect(stored.passwordResetToken).not.toBe(resetToken);
    expect(stored.passwordResetExpires.getTime()).toBeGreaterThan(Date.now());
    expect(stored.passwordResetExpires.getTime()).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000);
  });

  test("resets the password once with a valid unexpired token", async () => {
    await createTestUser({ email: "change-password@example.com", password: "OldSecret1!" });
    await request(app).post("/api/auth/forgot-password").send({ email: "change-password@example.com" });
    const { resetToken } = mockSendPasswordResetEmail.mock.calls[0][0];

    const response = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ newPassword: "NewSecret2@", confirmPassword: "NewSecret2@" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Password changed successfully. You can now log in with your new password.");
    const stored = await User.findOne({ email: "change-password@example.com" })
      .select("+password +passwordResetToken +passwordResetExpires");
    expect(await bcrypt.compare("NewSecret2@", stored.password)).toBe(true);
    expect(await bcrypt.compare("OldSecret1!", stored.password)).toBe(false);
    expect(stored.passwordResetToken).toBeUndefined();
    expect(stored.passwordResetExpires).toBeUndefined();

    const reused = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ newPassword: "Another3#", confirmPassword: "Another3#" });
    expect(reused.status).toBe(400);
    expect(reused.body.message).toBe("This password reset link is invalid or has expired.");
  });

  test("rejects expired reset tokens and mismatched or weak passwords", async () => {
    const user = await createTestUser({ email: "expired-reset@example.com" });
    const resetToken = "expired-token";
    user.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.passwordResetExpires = new Date(Date.now() - 1);
    await user.save();

    const expired = await request(app)
      .post(`/api/auth/reset-password/${resetToken}`)
      .send({ newPassword: "NewSecret2@", confirmPassword: "NewSecret2@" });
    expect(expired.status).toBe(400);
    expect(expired.body.message).toBe("This password reset link is invalid or has expired.");

    const weak = await request(app)
      .post("/api/auth/reset-password/any-token")
      .send({ newPassword: "weak", confirmPassword: "weak" });
    expect(weak.status).toBe(400);

    const mismatch = await request(app)
      .post("/api/auth/reset-password/any-token")
      .send({ newPassword: "NewSecret2@", confirmPassword: "Different3#" });
    expect(mismatch.status).toBe(400);
    expect(mismatch.body.message).toBe("New password and confirm password do not match.");
  });
});
