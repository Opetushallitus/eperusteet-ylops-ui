import * as _ from 'lodash';
import { OpetussuunnitelmaKevytDto } from '@shared/api/ylops';
import { SideMenuEntry, OpintojaksoModuuliSource } from '@shared/tyypit';
import { koodiNumero, koodiAlku } from '@/utils/perusteet';
import { sortedOppiaineet } from '@/utils/opetussuunnitelmat';
import { Kielet } from '@shared/stores/kieli';

interface Koodi {
  arvo: string;
}

interface Koodillinen {
  koodi: Koodi;
}

export function opsLapsiLinkit(lapset: any, prefix = ''): SideMenuEntry[] {
  return _.map(lapset, (lapsi: any, idx) => {
    const chapter = prefix + '' + (idx + 1);
    let obj: SideMenuEntry = {
      item: {
        type: 'tekstikappale',
        objref: lapsi.perusteenTekstikappale || lapsi.tekstiKappale,
        prefix: lapsi.liite ? '' : chapter,
        order: lapsi.liite ? '99' : '0',
        piilotettu: lapsi.piilotettu,
      },
      route: {
        name: 'tekstikappale',
        params: {
          osaId: lapsi.id,
        },
      },
    };

    if (lapsi.lapset && lapsi.lapset.length > 0) {
      obj = {
        ...obj,
        children: [
          ...opsLapsiLinkit(lapsi.lapset, chapter + '.'),
        ],
      };
    }
    else {
      obj = {
        ...obj,
        children: [{
          item: {
            type: 'staticlink',
          },
        }],
      };
    }

    return obj;
  });
}

export function vuosiluokkaLinkit(ops: OpetussuunnitelmaKevytDto): SideMenuEntry[] {
  return _.chain(ops?.vuosiluokkakokonaisuudet)
    .map('vuosiluokkakokonaisuus')
    .sortBy([(vlk: any) => {
      return vlk.nimi[Kielet.getSisaltoKieli.value];
    }])
    .map(vlk => {
      return {
        item: {
          type: 'vuosiluokkakokonaisuus',
          objref: vlk,
        },
        route: {
          name: 'vuosiluokkakokonaisuus',
          params: {
            vlkId: vlk?.id,
          },
        },
        children: [
          ...(perusopetusOppiaineenLapset(sortedOppiaineet(ops.oppiaineet), vlk) as any | []),
          perusopetuksenValinnaisetOppiaineetLinkki(vlk),
        ],
      } as SideMenuEntry;
    })
    .value();
}

function perusopetuksenValinnaisetOppiaineetLinkki(vlk) {
  return {
    item: {
      type: 'staticlink',
      i18key: 'valinnaisuus-perusopetuksessa',
    },
    route: {
      name: 'perusopetusvalinnaiset',
      params: {
        vlkId: vlk?.id,
      },
    },
  };
}

function perusopetusOppiaineLinkki(oppiaine, vlk): SideMenuEntry {
  let children;

  if (oppiaine.koosteinen && _.size(oppiaine.oppimaarat) === 0) {
    children = [];
  }
  else {
    children = [
      ...perusopetusoppiaineenVuosiluokat(oppiaine, vlk),
      ...perusopetusOppiaineenLapset(oppiaine.oppimaarat, vlk),
    ];

    children = _.size(children) > 0 ? children : null;
  }

  return {
    item: {
      type: oppiaine.koosteinen ? 'koosteinen-oppiaine' : 'perusopetusoppiaine',
      objref: oppiaine,
    },
    route: {
      name: oppiaine.tyyppi === 'muu_valinnainen' ? 'perusopetuspaikallinenoppiaine' : 'perusopetusoppiaine',
      params: {
        vlkId: vlk?.id,
        oppiaineId: oppiaine?.id,
      },
    },
    allowEmpty: oppiaine.koosteinen,
    children,
  } as SideMenuEntry;
}

function perusopetusOppiaineenLapset(oppiaineet, vlk) {
  if (oppiaineet == null || _.size(oppiaineet) === 0) {
    return [];
  }
  return _.chain(oppiaineet)
    .filter(oppiaine => _.size(oppiaine?.vuosiluokkakokonaisuudet) === 0 || _.includes(_.map(oppiaine?.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), vlk?._tunniste))
    .map(oppiaine => perusopetusOppiaineLinkki(oppiaine, vlk))
    .sortBy(oppiaine => oppiaine.route?.name === 'perusopetuspaikallinenoppiaine' ? 1 : 0)
    .value();
}

function perusopetusoppiaineenVuosiluokat(oppiaine, vlk) {
  const oppiaineenVlk = _.head(_.filter(oppiaine?.vuosiluokkakokonaisuudet, ovlk => _.get(ovlk, '_vuosiluokkakokonaisuus') === _.get(vlk, '_tunniste')));

  if (oppiaineenVlk && _.size(oppiaineenVlk.vuosiluokat) > 0) {
    return [{
      item: {
        type: 'staticlink',
        i18key: 'tavoitteet-ja-sisallot',
      },
      flatten: true,
      children: _.chain(oppiaineenVlk.vuosiluokat)
        .sortBy('vuosiluokka')
        .map(vuosiluokka => {
          return {
            item: {
              type: 'staticlink',
              i18key: ['vuosiluokka', vuosiluokka.vuosiluokka],
            },
            route: {
              name: oppiaine.tyyppi === 'muu_valinnainen' ? 'perusopetuspaikallinenoppiainevuosiluokka' : 'perusopetusoppiainevuosiluokka',
              params: {
                vlkId: vlk?.id,
                oppiaineId: oppiaine?.id,
                vlId: vuosiluokka.id,
                vuosiluokkaId: vuosiluokka.id,
              },
            },
          } as SideMenuEntry;
        })
        .value(),
    }];
  }
  return [];
}

export function oppiaineLinkki(type: string, objref: any, children: SideMenuEntry[]): SideMenuEntry {
  return {
    item: {
      type,
      objref,
      hideChevron: true,
    },
    route: {
      name: 'oppiaine',
      params: {
        oppiaineId: objref.id,
      },
    },
    children,
  };
}

export function oppimaaraModuuliLinkit(source: OpintojaksoModuuliSource): SideMenuEntry[] {
  const result = _.chain(source.moduulit)
    .sortBy(koodiAlku, koodiNumero)
    .map(moduuli => {
      return {
        item: {
          type: 'moduuli',
          objref: moduuli,
        },
        route: {
          name: 'moduuli',
          params: {
            moduuliId: moduuli.id,
            oppiaineId: source.id,
          },
        },
      };
    })
    .value();
  return result;
}

export function oppimaaraOpintojaksoLinkit(opintojaksot: any, source: OpintojaksoModuuliSource): SideMenuEntry[] {
  return _.chain(opintojaksot)
    .filter((oj) => oj.oppiaineet && source.koodi && _.map(oj.oppiaineet, 'koodi').indexOf(source.koodi) > -1)
    .map(oj => {
      const ojOa: any = _.find(oj.oppiaineet, { koodi: source.koodi });
      return {
        ...oj,
        jarjestys: ojOa.jarjestys,
      };
    })
    .sortBy('jarjestys', koodiAlku, koodiNumero)
    .map(oj => {
      return {
        item: {
          type: 'opintojakso',
          objref: oj,
        },
        route: {
          name: 'opintojakso',
          params: {
            opintojaksoId: oj.id,
          },
        },
      };
    })
    .value();
}

export function oppimaaraUusiLinkki(source: OpintojaksoModuuliSource): SideMenuEntry {
  return {
    item: {
      type: 'uusi-opintojakso',
    },
    route: {
      name: 'uusi-opintojakso',
      params: {
        opintojaksoId: 'uusi',
        oppiaineKoodi: source.koodi,
      },
      query: {
        oppiaineet: source.koodi,
      },
    },
  };
}

export function paikallinenOppiaineLinkki(type: string, objref: any, children: SideMenuEntry[]): SideMenuEntry {
  return {
    item: {
      type,
      objref,
      hideChevron: true,
    },
    route: {
      name: 'paikallinenOppiaine',
      params: {
        paikallinenOppiaineId: objref.id,
      },
    },
    children,
  };
}
