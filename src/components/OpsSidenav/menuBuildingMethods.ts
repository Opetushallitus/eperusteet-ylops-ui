import * as _ from 'lodash';
import {
  SideMenuEntry,
  Lops2019PaikallinenOppiaineDto,
  Lops2019OppiaineDto,
} from '@/tyypit';

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
