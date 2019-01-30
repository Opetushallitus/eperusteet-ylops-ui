// https://docs.cypress.io/api/introduction/api.html

describe('Etusivu', () => {

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
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat/oikeudet',
      response: {
        opetussuunnitelma: ['muokkaus'],
        pohja: ['luonti'],
      },
    });
  }

  it('renderöityy ja uudelleenohjautuu', () => {
    createServer();
    cy.visit('/');
    cy.location().should((loc) => expect(loc.href).to.contain('/#/fi'));
    cy.visit('');
    cy.location().should((loc) => expect(loc.href).to.contain('/#/fi'));
  });

  it('sisältää sisältökielivalitsimen', () => {
    createServer();
    cy.visit('/');
    cy.contains('#content-lang-selector', 'sisältö (fi)');
    cy.get('#content-lang-selector').click();
    cy.contains('#content-lang-selector > .dropdown-menu', 'fi');
    cy.contains('#content-lang-selector > .dropdown-menu', 'sv');
    cy.contains('#content-lang-selector > .dropdown-menu', 'se');
    cy.contains('#content-lang-selector > .dropdown-menu', 'ru');
    cy.contains('#content-lang-selector > .dropdown-menu', 'en');
    cy.get('a').contains('sv').click();
    cy.contains('#content-lang-selector', 'sisältö (sv)');
  });

  it('sisältää uikielivalitsimen', () => {
    createServer();
    cy.visit('/');
    cy.contains('#ui-lang-selector', 'kieli (fi)');
    cy.get('#ui-lang-selector').click();
    cy.contains('#ui-lang-selector > .dropdown-menu', 'fi');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'sv');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'se');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'ru');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'en');
    cy.get('#ui-lang-selector > .dropdown-menu').contains('sv').click();
    cy.contains('#ui-lang-selector', 'språk (sv)');
    cy.location().should((loc) => expect(loc.href).to.contain('/#/sv'));
  });

});
