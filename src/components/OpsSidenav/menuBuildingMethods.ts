import * as _ from 'lodash';
import { Lops2019PaikallinenOppiaineDto, Lops2019OppiaineDto, OpetussuunnitelmaKevytDto } from '@shared/api/ylops';
import { SideMenuEntry } from '@shared/tyypit';

import { koodiNumero, koodiAlku } from '@/utils/perusteet';

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
        objref: lapsi.tekstiKappale,
        prefix: chapter,
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

    return obj;
  });
}

export function vuosiluokkaLinkit(ops: OpetussuunnitelmaKevytDto): SideMenuEntry[] {
  return _.chain(ops.vuosiluokkakokonaisuudet)
    .map('vuosiluokkakokonaisuus')
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
          ...(perusopetusOppiaineenLapset(_.map(ops.oppiaineet, 'oppiaine'), vlk) as any | []),
          // perusopetuksenValinnaisetOppiaineetLinkki();
        ],
      } as SideMenuEntry;
    })
    .value();
}

function perusopetuksenValinnaisetOppiaineetLinkki() {
//   arr.push({
//     depth: 1,
//     label: "valinnaiset-oppiaineet",
//     id: "valinnaiset",
//     vlkId: vlk.vuosiluokkakokonaisuus.id,
//     url: $state.href("root.opetussuunnitelmat.yksi.opetus.valinnaiset", {
//         vlkId: vlk.vuosiluokkakokonaisuus.id
//     })
// });
}

function perusopetusOppiaineLinkki(oppiaine, vlk): SideMenuEntry {
  return {
    item: {
      type: oppiaine.koosteinen ? 'koosteinen-oppiaine' : 'perusopetusoppiaine',
      objref: oppiaine,
    },
    route: {
      name: 'perusopetusoppiaine',
      params: {
        vlkId: vlk?.id,
        oppiaineId: oppiaine?.id,
      },
    },
    children: perusopetusOppiaineenLapset(oppiaine.oppimaarat, vlk),
  } as SideMenuEntry;
}

function perusopetusOppiaineenLapset(oppiaineet, vlk) {
  if (oppiaineet == null || _.size(oppiaineet) === 0) {
    return null;
  }
  return _.chain(oppiaineet)
    .filter(oppiaine => _.size(oppiaine?.vuosiluokkakokonaisuudet) === 0 || _.includes(_.map(oppiaine?.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'), vlk?._tunniste))
    .sortBy('koodiUri')
    .map(oppiaine => perusopetusOppiaineLinkki(oppiaine, vlk))
    .value();
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

export function oppimaaraModuuliLinkit(oppimaara: any): SideMenuEntry[] {
  const result = _.chain(oppimaara.moduulit)
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
            oppiaineId: oppimaara.id,
          },
        },
      };
    })
    .value();
  return result;
}

export function oppimaaraOpintojaksoLinkit(opintojaksot: any, oppimaara: Lops2019OppiaineDto): SideMenuEntry[] {
  return _.chain(opintojaksot)
    .filter((oj) => oj.oppiaineet && oppimaara.koodi && _.map(oj.oppiaineet, 'koodi').indexOf(oppimaara.koodi.uri) > -1)
    .sortBy(koodiAlku, koodiNumero)
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

export function oppimaaraUusiLinkki(oppimaara: Lops2019OppiaineDto): SideMenuEntry {
  return {
    item: {
      type: 'uusi-opintojakso',
    },
    route: {
      name: 'uusi-opintojakso',
      params: {
        opintojaksoId: 'uusi',
        oppiaineKoodi: oppimaara.koodi!.arvo,
      },
      query: {
        oppiaineet: oppimaara.koodi!.uri,
      },
    },
  };
}

export function paikallinenOppiaineToMenu(oppiaine: Lops2019PaikallinenOppiaineDto): SideMenuEntry {
  return {
    item: {
      type: 'oppiaine',
      objref: oppiaine,
      hideChevron: true,
    },
    route: {
      name: 'paikallinenOppiaine',
      params: {
        paikallinenOppiaineId: oppiaine.id,
      },
    },
  };
}
