/* eslint-disable cypress/no-unnecessary-waiting */
import { generateMAASURL } from "../../utils";

describe("template spec", () => {
  it("passes", () => {
    cy.visit(generateMAASURL("/"));
    cy.login();
    cy.visit(generateMAASURL("/"));
    cy.wait(10000);
    cy.get('[data-testid="section-header-title"]').should(
      "contain.text",
      "Login"
    );
  });
});
