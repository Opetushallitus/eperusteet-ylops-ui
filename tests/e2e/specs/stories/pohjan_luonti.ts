// https://docs.cypress.io/api/introduction/api.html

describe.skip("Virkailijana voin luoda opetussuunnitelmien pohjan", () => {
  const config = {
    auth: {
      username: "test",
      password: "test"
    }
  };

  before(() => {
    cy.viewport(1366, 768);
    cy.request("POST", "eperusteet-ylops-service/api/e2e");
    cy.visit("/#/fi", config);
  });

  function create () {
    cy.visit("/#/fi/uusi/pohja", config);
    cy.get("#uusi-ops-nimi").type("Uusi varhaiskasvatuksen pohja");
    cy.get("#uusi-ops-peruste").select("Varhaiskasvatussuunnitelman perusteet 2018 (OPH-2791-2018)");
    cy.contains(".oph-button", "Luo pohja").click();
  }

  describe("Luonti", () => {
    it("Etusivu sisältää painikkeet pohjan luontiin", () => {
      cy.visit("/#/fi", config);
      cy.contains("Opetussuunnitelmien pohjat");
      cy.get("#etusivu-luo-uusi-pohja").contains("Luo uusi").click();
      cy.location().should((loc) => expect(loc.href).to.contain("/#/fi/uusi/pohja"));
    });

    it("Uuden pohjan luonti", () => {
      cy.visit("/#/fi/uusi/pohja", config);

      cy.contains(".oph-button", "Luo pohja").should("be.disabled");
      cy.get("#uusi-ops-nimi").type("Uusi varhaiskasvatuksen pohja");
      cy.contains(".oph-button", "Luo pohja").should("be.disabled");
      cy.get("#uusi-ops-peruste").select("Varhaiskasvatussuunnitelman perusteet 2018 (OPH-2791-2018)");
      cy.contains(".oph-button", "Luo pohja").click();
      cy.location().should((loc) => expect(loc.href).to.match(/opetussuunnitelmat\/\d+\/tiedot/));
      // cy.contains('Uuden pohjan nimi');
      // cy.contains('diaari123');
    });

    it("Pohja löytyy etusivulta", () => {
      cy.visit("/#/fi", config);
      create();
      cy.contains("a", "Uusi varhaiskasvatuksen pohja");
      cy.contains("a", "Uusi varhaiskasvatuksen pohja").click();
      cy.location().should((loc) => expect(loc.href).to.match(/opetussuunnitelmat\/\d+\/tiedot/));
    });
  });

  describe("Tietojen muokkaus", () => {
    before(create);

    it("Pohjan tiedot ovat muokattavissa", () => {
      cy.visit("/#/fi", config);
      cy.get("button").get(".fa-pen").click();
      cy.get("input.input-style").clear().type("Muutettu nimi");
      cy.contains("button", "Tallenna").click();
      cy.contains("h1", "Muutettu nimi");
    });
  });
});
