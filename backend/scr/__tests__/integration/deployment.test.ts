const request = require("supertest");
const app = require("../../server");

describe("deployment endpoints and CORS", () => {
  test("exposes a public health check", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: "MealNest API is running",
    });
  });

  test("allows the local frontend origin with credentials", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "http://localhost:3000/");

    expect(response.status).toBe(200);
    expect(response.headers["access-control-allow-origin"]).toBe("http://localhost:3000/");
    expect(response.headers["access-control-allow-credentials"]).toBe("true");
  });

  test("rejects an unconfigured browser origin", async () => {
    const response = await request(app)
      .get("/api/health")
      .set("Origin", "https://untrusted.example");

    expect(response.status).toBe(403);
  });
});
