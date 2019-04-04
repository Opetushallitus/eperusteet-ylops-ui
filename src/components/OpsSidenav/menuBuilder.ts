import {
  SideMenuEntry,
} from '@/tyypit';

interface MenuBuilderInterface {
  OpsLapsiLinkit(object): SideMenuEntry[];
  OppiaineLinkki(type: string, objref: any, children: SideMenuEntry[]): SideMenuEntry;
  OppimaaraModuuliLinkit(oppimaara: any): SideMenuEntry[];
  OppimaaraOpintojaksoLinkit(opintojaksot: any, oppimaara: any): SideMenuEntry[];
}

export class MenuBuilder implements MenuBuilderInterface {
  public OpsLapsiLinkit(lapset): SideMenuEntry[] {
    return lapset.map((lapsi) => {
      let obj: SideMenuEntry = {
        item: {
          type: 'tekstikappale',
          objref: lapsi.tekstiKappale,
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
            ...this.OpsLapsiLinkit(lapsi.lapset),
          ],
        };
      }

      return obj;
    });
  }

  public OppiaineLinkki(type: string, objref: any, children: SideMenuEntry[]): SideMenuEntry {
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

  public OppimaaraModuuliLinkit(oppimaara: any): SideMenuEntry[] {
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

  public OppimaaraOpintojaksoLinkit(opintojaksot: any, oppimaara: any): SideMenuEntry[] {
    const uri = oppimaara.koodi.uri;
    return opintojaksot
      .filter(oj => {
        return oj.oppiaineet && oj.oppiaineet.indexOf(uri) > -1;
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
}
