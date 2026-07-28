describe("MealNest login", () => {
  it("keeps the public login and registration routes available", () => {
    cy.visit("/login");
    cy.contains("h1", "Welcome Back").should("be.visible");
    cy.get('a[href="/signup"]').contains("Create an account").should("be.visible");

    cy.visit("/signup");
    cy.contains("h1", "Create Account").should("be.visible");
  });

  it("logs a configured customer into the user dashboard", function () {
    if (!Cypress.env("userEmail") || !Cypress.env("userPassword")) {
      this.skip();
    }

    cy.loginAsUser();
    cy.visit("/dashboard/user");
    cy.location("pathname").should("eq", "/dashboard/user");
    cy.contains("h1", /Welcome back/i).should("be.visible");
  });
});
