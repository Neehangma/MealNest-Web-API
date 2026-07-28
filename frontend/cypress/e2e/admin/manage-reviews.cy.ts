describe("MealNest admin review management", () => {
  it("loads the protected review filters for a configured administrator", function () {
    const email = String(Cypress.env("adminEmail") || "");
    const password = String(Cypress.env("adminPassword") || "");
    if (!email || !password) {
      this.skip();
    }

    cy.visit("/login");
    cy.get("#email").clear().type(email);
    cy.get("#password").clear().type(password, { log: false });
    cy.contains("button", "Sign In").click();
    cy.location("pathname").should("match", /^\/admin/);

    cy.visit("/admin/reviews");
    cy.contains("h1", "Reviews Management").should("be.visible");
    cy.get('select[aria-label="Filter by restaurant"]').should("be.visible");
    cy.get('select[aria-label="Filter by star rating"]').should("be.visible");
    cy.get('select[aria-label="Filter by review status"]').should("be.visible");
  });
});
