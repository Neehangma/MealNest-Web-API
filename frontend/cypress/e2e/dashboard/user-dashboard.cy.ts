describe("MealNest user dashboard", () => {
  it("shows live customer dashboard sections after login", function () {
    if (!Cypress.env("userEmail") || !Cypress.env("userPassword")) {
      this.skip();
    }

    cy.loginAsUser();
    cy.visit("/dashboard/user");

    cy.contains("h1", /Welcome back/i).should("be.visible");
    cy.contains("h2", "Explore Restaurants").should("be.visible");
    cy.contains("h2", "Quick Actions").should("be.visible");
  });
});
