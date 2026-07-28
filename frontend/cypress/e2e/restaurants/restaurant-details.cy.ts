type RestaurantRecord = {
  _id: string;
  name: string;
};

function restaurantList(body: unknown): RestaurantRecord[] {
  const response = body as {
    restaurants?: RestaurantRecord[];
    data?: RestaurantRecord[] | { restaurants?: RestaurantRecord[]; data?: RestaurantRecord[] };
  };
  if (Array.isArray(response.restaurants)) return response.restaurants;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.data?.restaurants)) return response.data.restaurants;
  if (Array.isArray(response.data?.data)) return response.data.data;
  return [];
}

describe("MealNest restaurant details", () => {
  it("opens a real restaurant by MongoDB id and exposes its public reviews section", function () {
    if (!Cypress.env("userEmail") || !Cypress.env("userPassword")) {
      this.skip();
    }

    cy.loginAsUser();
    cy.request(`${Cypress.env("apiUrl")}/api/restaurants?limit=1`).then(({ body }) => {
      const [restaurant] = restaurantList(body);
      if (!restaurant) {
        throw new Error("The MealNest API did not return a restaurant for the details test.");
      }

      cy.visit(`/restaurants/${restaurant._id}`);
      cy.contains("h1, h2", restaurant.name).should("be.visible");
      cy.contains("h2", "Reviews").should("be.visible");
      cy.contains("Authorization token is required").should("not.exist");
    });
  });
});
