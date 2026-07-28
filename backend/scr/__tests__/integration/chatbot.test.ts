const request = require("supertest");
const { createTestUser, tokenFor } = require("../helpers");

jest.mock("../../services/aiAssistantService", () => ({
  getAiAssistantReply: jest.fn().mockResolvedValue({
    reply: "You can book from a restaurant details page.",
    source: "fallback",
    restaurants: [],
  }),
}));

const app = require("../../server");

describe("chatbot API", () => {
  test("requires authentication and returns a structured assistant reply", async () => {
    const unauthenticated = await request(app).post("/api/ai-assistant/chat").send({ message: "Book a table" });
    expect(unauthenticated.status).toBe(401);

    const user = await createTestUser({ email: "chatbot-user@example.com" });
    const response = await request(app)
      .post("/api/ai-assistant/chat")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ message: "Book a table" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      data: {
        reply: "You can book from a restaurant details page.",
        source: "fallback",
        restaurants: [],
      },
    });
  });

  test("rejects an empty message", async () => {
    const user = await createTestUser({ email: "chatbot-empty@example.com" });
    const response = await request(app)
      .post("/api/ai-assistant/chat")
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ message: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("A message is required.");
  });
});
