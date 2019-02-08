describe('Virkailijana pystyn luomaan opetussuunnitelmien pohjan', () => {

  function createServer() {
    cy.server();
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/ulkopuoliset/lokalisoinnit',
      response: [],
    });
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/kayttaja',
      response: {},
    });
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/ulkopuoliset/julkaistutperusteet',
      response: [{
        id: 42,
        koulutustyyppi: 'koulutustyyppi_2',
        nimi: { fi: 'Perusteen nimi' },
        diaarinumero: 'diaari123',
      }],
    });
    cy.route({
      method: 'POST',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat',
      response: {
        id: 42,
      },
    });
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat/42',
      response: {
        id: 42,
        nimi: { fi: 'Uuden pohjan nimi' },
        perusteenDiaarinumero: 'diaari123',
      },
    });
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat?tyyppi=POHJA',
      response: [],
    });
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat',
      response: [],
    });
    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat/oikeudet',
      response: {
        opetussuunnitelma: ['muokkaus'],
        pohja: ['luonti'],
      },
    });
  }


  beforeEach(() => {
    createServer();
  });

  it('Navigoitavissa', () => {
    cy.visit('/#/fi');
    cy.get('#etusivu-luo-uusi-pohja').click();
    cy.contains('.oph-button', 'Luo pohja').should('be.disabled');
    cy.get('#uusi-ops-nimi').type('Uuden pohjan nimi');
    cy.contains('.oph-button', 'Luo pohja').should('be.disabled');
    cy.get('#uusi-ops-peruste').select('Perusteen nimi (diaari123)');
    cy.contains('.oph-button', 'Luo pohja').click();
    cy.location().should((loc) => expect(loc.href).to.contain('/#/fi/pohjat/42/tiedot'));
    cy.contains('.container', 'Uuden pohjan nimi');
    cy.contains('.container', 'diaari123');
  });

  // it('Navigoitavissa', () => {
  //   cy.visit('/#/fi');
  // })

});
