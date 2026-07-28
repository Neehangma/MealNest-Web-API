function configuredUserCredentials() {
  return {
    email: String(Cypress.env("userEmail") || ""),
    password: String(Cypress.env("userPassword") || ""),
  };
}

Cypress.Commands.add("loginAsUser", () => {
  const { email, password } = configuredUserCredentials();

  if (!email || !password) {
    throw new Error(
      "Set CYPRESS_TEST_USER_EMAIL and CYPRESS_TEST_USER_PASSWORD before running authenticated user E2E tests.",
    );
  }

  cy.session(["MealNest user", email], () => {
    cy.visit("/login");
    cy.get("#email").clear().type(email);
    cy.get("#password").clear().type(password, { log: false });
    cy.contains("button", "Sign In").click();
    cy.location("pathname").should("match", /^\/dashboard\/user/);
  });
});

declare global {
  // Cypress extends its Chainable API through a global namespace declaration.
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      loginAsUser(): Chainable<void>;
    }
  }
}

export {};
