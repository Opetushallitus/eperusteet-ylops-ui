import _ from 'lodash';

export const KoodistoLops2019LaajaAlaiset = 'laajaalainenosaaminenlops2021';

export const YlopsKoulutustyypit = Object.freeze([
  'koulutustyyppi_15', // ESIOPETUS
  'koulutustyyppi_2', // LUKIOKOULUTUS
  'koulutustyyppi_20', // VARHAISKASVATUS
  'koulutustyyppi_6', // LISAOPETUS
  'koulutustyyppi_14', // AIKUISLUKIOKOULUTUS
  'koulutustyyppi_23', // LUKIOVALMISTAVAKOULUTUS
  // 'koulutustyyppi_999907', // TPO
  // 'koulutustyyppi_17', // AIKUISTENPERUSOPETUS
  // 'koulutustyyppi_16', // PERUSOPETUS
  // 'koulutustyyppi_22', // PERUSOPETUSVALMISTAVA
]);

const Perusoppilaitokset = [11, 19, 64, 21];
const koulutustyyppiToOppilaitos = {
  'koulutustyyppi_15': Perusoppilaitokset,
  'koulutustyyppi_2': [...Perusoppilaitokset, 15],
  'koulutustyyppi_14': [...Perusoppilaitokset, 15],
  'koulutustyyppi_23': [...Perusoppilaitokset, 15],
  'koulutustyyppi_20': [...Perusoppilaitokset],
  'koulutustyyppi_6': Perusoppilaitokset,
};

export function koulutustyypinOppilaitokset(koulutustyyppi: string | undefined | null) {
  if (koulutustyyppi) {
    return koulutustyyppiToOppilaitos[koulutustyyppi] || Perusoppilaitokset;
  }
  return Perusoppilaitokset;
}

export function isPerusteSupported(peruste: any) {
  const { toteutus, koulutustyyppi } = peruste;
  if (koulutustyyppi === 'koulutustyyppi_2'
    || koulutustyyppi === 'koulutustyyppi_14'
    || koulutustyyppi === 'koulutustyyppi_23') {
    return toteutus === 'lops2019';
  }
  return _.includes(YlopsKoulutustyypit, koulutustyyppi);
}


export function paikallisestiSallitutLaajennokset() {
  return [
    'oppiaineetjaoppimaaratlops2021_ai12',
    'oppiaineetjaoppimaaratlops2021_ux',
    'oppiaineetjaoppimaaratlops2021_vka',
    'oppiaineetjaoppimaaratlops2021_vkb',
  ];
}


const splitKoodi = _.memoize((arvo: string) => {
  if (_.isString(arvo) && !_.isEmpty(arvo)) {
    const splitattu = arvo.match(/^([^0-9]*?)(\d+$)/);

    if(splitattu && splitattu.length > 2) {
      return [splitattu[1], Number(splitattu[2])];
    }
  }
  return [arvo, 0];
});

export function getArvo(koodillinen: any) {
  return _.get(koodillinen, 'koodi.arvo')
    || _.get(koodillinen, 'arvo')
    || _.get(koodillinen, 'koodi.uri')
    || _.get(koodillinen, 'uri')
    || koodillinen;
}

export function getUri(koodillinen: any) {
  return _.get(koodillinen, 'koodi.uri', _.get(koodillinen, 'uri', koodillinen));
}

export function koodiAlku(koodillinen: object | string) {
  return splitKoodi(getArvo(koodillinen))[0];
}

export function koodiNumero(koodillinen: object | string) {
  return splitKoodi(getArvo(koodillinen))[1];
}

export function koodiSorters(): any[] {
  return [koodiAlku, koodiNumero];
}
