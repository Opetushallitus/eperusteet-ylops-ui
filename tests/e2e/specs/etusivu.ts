// https://docs.cypress.io/api/introduction/api.html

describe.skip('Etusivu', () => {

  function createServer() {
    cy.server();
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

    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat',
      response: [{
        id: 1,
        julkaisukielet: ['fi'],
        luotu: 1547644623926,
        nimi: {
          fi: 'Paikallinen ops',
        },
        tila: 'luonnos',
      }],
    });

    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/opetussuunnitelmat?tyyppi=POHJA',
      response: [
        { id: 1, julkaisukielet : [ 'fi' ], nimi: { fi: 'Testipohja (id: 1, fi)' },
          tila: 'luonnos', luotu: 1547644623926 },
        { id: 2, julkaisukielet : [ 'fi', 'sv' ], nimi: { sv: 'Testipohja (id: 2, sv)' },
          tila: 'luonnos', luotu: 1548336267382 },
        { id: 3, julkaisukielet : [ 'sv' ], nimi: { fi: 'Testipohja (id: 3, fi)' },
          tila: 'luonnos', luotu: 1550336267382 },
      ],
    });

    cy.route({
      method: 'GET',
      url: '/eperusteet-ylops-service/api/ulkopuoliset/lokalisoinnit',
      response: {
        fi: [
          { value: 'Luonnos', key: 'luonnos', id: 10139, locale: 'fi' },
          { value: 'Luo pohja', key: 'luo-pohja', id: 10131, locale: 'fi' },
          { value: 'Nimi', key: 'nimi', id: 10173, locale: 'fi' },
          { value: 'Tila', key: 'tila', id: 10322, locale: 'fi' },
          { value: 'Luotu', key: 'luotu', id: 10143, locale: 'fi' },
        ],
        sv: [
          { value: 'Utkast', key: 'luonnos', id: 10138, locale: 'sv' },
          { value: 'Skapa en botten', key: 'luo-pohja', id: 10130, locale: 'sv' },
          { value: 'Namn', key: 'nimi', id: 10172, locale: 'sv' },
          { value: 'Status', key: 'tila', id: 10321, locale: 'sv' },
          { value: 'Skapad', key: 'luotu', id: 10142, locale: 'sv' },
        ],
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
    cy.contains('#content-lang-selector', 'Sisällön kieli: fi');
    cy.get('#content-lang-selector').click();
    cy.contains('#content-lang-selector > .dropdown-menu', 'fi');
    cy.contains('#content-lang-selector > .dropdown-menu', 'sv');
    cy.contains('#content-lang-selector > .dropdown-menu', 'se');
    cy.contains('#content-lang-selector > .dropdown-menu', 'ru');
    cy.contains('#content-lang-selector > .dropdown-menu', 'en');
    cy.contains('a', 'sv').click();
    cy.contains('#content-lang-selector', 'Sisällön kieli: sv');
  });

  it('sisältää uikielivalitsimen', () => {
    createServer();
    cy.visit('/');
    cy.contains('#ui-lang-selector', 'Käyttöliittymän kieli: fi');
    cy.get('#ui-lang-selector').click();
    cy.contains('#ui-lang-selector > .dropdown-menu', 'fi');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'sv');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'se');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'ru');
    cy.contains('#ui-lang-selector > .dropdown-menu', 'en');
    cy.get('#ui-lang-selector > .dropdown-menu > :nth-child(2)').click();
    cy.location().should((loc) => expect(loc.href).to.contain('/#/sv'));
    cy.contains('#ui-lang-selector', 'språk: sv');
  });

  it('Sisältää opetussuunnitelmien toiminnot', () => {
    createServer();
    cy.visit('/#/fi');
    cy.contains('Opetussuunnitelmasi');
    cy.contains('a', 'Paikallinen ops');
    cy.get('#etusivu-luo-uusi-opetussuunnitelma').contains('Luo uusi');
  });

  it('Sisältää pohjien toiminnot', () => {
    createServer();
    cy.visit('/#/fi');
    cy.contains('Opetussuunnitelmien pohjat');
    cy.contains('a', 'Testipohja');
    cy.get('button#etusivu-luo-uusi-pohja').contains('Luo uusi');
  });

});
