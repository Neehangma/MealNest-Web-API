import { sendChatbotMessage } from "@/services/chatbotService";

const mockFetch = jest.fn();

describe("sendChatbotMessage", () => {
  beforeEach(() => {
    global.fetch = mockFetch as typeof fetch;
  });

  afterEach(() => {
    mockFetch.mockReset();
  });

  it("reads the structured reply returned by the MealNest backend", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          reply: "MealNest offers Thai, Korean, and Japanese restaurants.",
          source: "gemini",
          restaurants: [],
        },
      }),
    } as Response);

    await expect(sendChatbotMessage("Which cuisines are available?")).resolves.toBe(
      "MealNest offers Thai, Korean, and Japanese restaurants.",
    );
  });

  it("continues to support a flat chatbot response", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ reply: "Open a restaurant to make a reservation." }),
    } as Response);

    await expect(sendChatbotMessage("How do I book?")).resolves.toBe(
      "Open a restaurant to make a reservation.",
    );
  });
});
