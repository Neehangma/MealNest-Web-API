const request = require("supertest");
const app = require("../../server");
const { createTestUser, tokenFor } = require("../helpers");

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
});

