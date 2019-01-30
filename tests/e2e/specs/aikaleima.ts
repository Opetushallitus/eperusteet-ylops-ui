describe('Aikaleima', () => {

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
  };


  beforeEach(() => {
    createServer();
  });

  it('renderöityy ja uudelleenohjautuu', () => {
    cy.visit('/#/fi/debug/aikaleima');
  })

});
