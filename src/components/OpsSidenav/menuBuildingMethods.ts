import _ from 'lodash';
import {
  SideMenuEntry,
  Lops2019PaikallinenOppiaineDto,
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
  return oppimaara.moduulit.map(moduuli => {
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
  });
}

export function oppimaaraOpintojaksoLinkit(opintojaksot: any, oppimaara: any): SideMenuEntry[] {
  const uri = oppimaara.koodi.uri;
  return opintojaksot
    .filter(oj => {
      return oj.oppiaineet && _.map(oj.oppiaineet, 'koodi').indexOf(uri) > -1;
    })
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
    });
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
