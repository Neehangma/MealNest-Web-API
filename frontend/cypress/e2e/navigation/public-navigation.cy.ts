describe("MealNest public navigation", () => {
  it("links the landing page to authentication and restaurant discovery", () => {
    cy.visit("/");

    cy.contains("h1", /Reserve your perfect table/i).should("be.visible");
    cy.get('a[href="/login"]').contains("Login").should("be.visible");
    cy.get('a[href="/signup"]').contains("Sign Up").should("be.visible");
    cy.get('a[href="/dashboard/user/discover"]')
      .contains("Explore All Cuisines")
      .should("be.visible");
  });
});
