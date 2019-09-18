import _ from 'lodash';
import {
  SideMenuEntry,
  Lops2019PaikallinenOppiaineDto,
  Lops2019OpintojaksoDto,
  Lops2019OppiaineDto,
} from '@/tyypit';

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
  return _.chain(oppimaara.moduulit)
    .sortBy('koodi.arvo')
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
}

export function oppimaaraOpintojaksoLinkit(opintojaksot: Lops2019OpintojaksoDto[], oppimaara: Lops2019OppiaineDto): SideMenuEntry[] {
  return _.chain(opintojaksot)
    .filter((oj) => oj.oppiaineet && oppimaara.koodi && _.map(oj.oppiaineet, 'koodi').indexOf(oppimaara.koodi.uri) > -1)
    .sortBy('koodi.arvo')
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
