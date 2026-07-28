const { __testables } = require("../../services/aiAssistantService");

describe("MealNest AI local fallback", () => {
  test("uses only supplied database restaurants in recommendations", () => {
    const reply = __testables.localReply("Recommend Italian restaurants", {
      restaurants: [],
      matches: [
        {
          id: "1",
          name: "Bella Italia",
          cuisine: "Italian",
          location: "Thamel",
          rating: 4.8,
          price: 350,
          priceRange: "$$",
          image: "",
          isOpen: true,
          menu: ["Pizza"],
          reviewCount: 12,
        },
      ],
      reservations: [],
      reviews: [],
    });

    expect(reply).toContain("Bella Italia");
    expect(reply).toContain("Rs.350");
  });

  test("provides booking guidance without Gemini", () => {
    const reply = __testables.localReply("How do I make a reservation?", {
      restaurants: [],
      matches: [],
      reservations: [],
      reviews: [],
    });

    expect(reply).toContain("choose a date and time");
    expect(reply).toContain("proceed to payment");
  });
});
