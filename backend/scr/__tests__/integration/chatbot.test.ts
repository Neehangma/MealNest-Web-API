const request = require("supertest");
const { createTestUser, tokenFor } = require("../helpers");

jest.mock("../../services/openAIService", () => ({
  getMealNestReply: jest.fn().mockResolvedValue("You can book from a restaurant details page."),
}));

const app = require("../../server");

describe("chatbot API", () => {
  test("requires authentication and returns a chatbot reply", async () => {
    const unauthenticated = await request(app).post("/api/chatbot").send({ message: "Book a table" });
    expect(unauthenticated.status).toBe(401);

    const user = await createTestUser({ email: "chatbot-user@example.com" });
    const response = await request(app)
      .post("/api/chatbot")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ message: "Book a table" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ reply: "You can book from a restaurant details page." });
  });

  test("rejects an empty message", async () => {
    const user = await createTestUser({ email: "chatbot-empty@example.com" });
    const response = await request(app)
      .post("/api/chatbot")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ message: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("A message is required.");
  });
});
