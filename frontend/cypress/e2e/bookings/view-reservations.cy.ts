describe("MealNest reservations", () => {
  it("loads the authenticated customer's reservation tabs", function () {
    if (!Cypress.env("userEmail") || !Cypress.env("userPassword")) {
      this.skip();
    }

    cy.loginAsUser();
    cy.visit("/reservations");

    cy.contains("h1", "My Reservations").should("be.visible");
    for (const tab of ["All", "Upcoming", "Past", "Cancelled"]) {
      cy.contains("button", tab).should("be.visible");
    }
  });
});
