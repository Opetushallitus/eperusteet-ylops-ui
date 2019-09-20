import _ from 'lodash';

export const YlopsKoulutustyypit = Object.freeze([
  // AIKUISTENPERUSOPETUS("koulutustyyppi_17"),
  // PERUSOPETUS("koulutustyyppi_16"),
  // PERUSOPETUSVALMISTAVA("koulutustyyppi_22"),
  // 'koulutustyyppi_14', // AIKUISLUKIOKOULUTUS
  'koulutustyyppi_15', // ESIOPETUS
  'koulutustyyppi_6', // LISAOPETUS
  'koulutustyyppi_2', // LUKIOKOULUTUS
  // 'koulutustyyppi_23', // LUKIOVALMISTAVAKOULUTUS
  // 'koulutustyyppi_999907', // TPO
  'koulutustyyppi_20', // VARHAISKASVATUS
]);

export function isPerusteSupported(peruste: any) {
  const { toteutus, koulutustyyppi } = peruste;
  if (koulutustyyppi === 'koulutustyyppi_2') {
    return toteutus === 'lops2019';
  }
  return _.includes(YlopsKoulutustyypit, koulutustyyppi);
}

export function getLaajaAlaisetKoodit() {
  return [{
    koodi: 'lops2019laajaalainenosaaminen_1',
    nimi: {
      fi: 'Globaali- ja kulttuuriosaaminen',
    },
  }, {
    koodi: 'lops2019laajaalainenosaaminen_2',
    nimi: {
      fi: 'Hyvinvointiosaaminen',
    },
  }, {
    koodi: 'lops2019laajaalainenosaaminen_3',
    nimi: {
      fi: 'Vuorovaikutusosaaminen',
    },
  }, {
    koodi: 'lops2019laajaalainenosaaminen_4',
    nimi: {
      fi: 'Eettisyys ja ympäristöosaaminen',
    },
  }, {
    koodi: 'lops2019laajaalainenosaaminen_5',
    nimi: {
      fi: 'Yhteiskunnallinen osaaminen',
    },
  }, {
    koodi: 'lops2019laajaalainenosaaminen_6',
    nimi: {
      fi: 'Monitieteinen ja luova osaaminen',
    },
  }];
}
