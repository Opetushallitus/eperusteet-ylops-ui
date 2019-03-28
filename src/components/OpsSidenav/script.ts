import { Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';

import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';

import {
  EpRecursiveNav,
} from '@/components';

interface sideMenuEntry {
  item: sideMenuItem,
  route?: sideMenuRoute,
  flatten?: boolean,
  children?: Array<sideMenuEntry>,
}

interface sideMenuItem {
  type: string,
  i18key?: string,
  name?: object,
}

interface sideMenuRoute {
  name: string,
  params?: object,
}

// Static content for menu
const menuBaseData: Array<sideMenuEntry> = [
  {
    item: {
      type: 'staticlink',
      i18key: 'tiedot',
    },
    route: {
      name: 'opsTiedot',
    },
    flatten: true,
    children: [
      {
        item: {
          type: 'staticlink',
          i18key: 'dokumentit',
        },
        route: {
          name: 'opsDokumentti',
        },
      }, {
        item: {
          type: 'staticlink',
          i18key: 'poistetut',
        },
        route: {
          name: 'opsPoistetut',
        },
      }, {
        item: {
          type: 'staticlink',
          i18key: 'kasitteet',
        },
        route: {
          name: 'opsKasitteet',
        },
      },
    ],
  },
];

// Mock data .. to be removed ..
const menuExtraData: Array<sideMenuEntry> = [
  {
    item: {
      type: 'staticlink',
      i18key: 'Testioppiaine',
    },
    children: [
      {
        item: {
          type: 'staticlink',
          i18key: 'Matematiikka lyhyt',
        },
        children: [
          {
            item: {
              type: 'staticlink',
              i18key: 'Opintojaksot lyhyt',
            },
            children: [
              {
                item: {
                  type: 'staticlink',
                  i18key: 'Integraali-opintojakso',
                },
              },
            ],
          },
          {
            item: {
              type: 'staticlink',
              i18key: 'Modulit',
            },
            children: [
              {
                item: {
                  type: 'staticlink',
                  i18key: 'Integraali',
                },
              },
            ],
          },
        ],
      },
    ],
  },
];

@Component({
  components: {
    EpRecursiveNav,
  },
})
export default class OpsSidenav extends Vue {
  private cache: PerusteCache = null as any;

  async mounted() {
    if (this.$route) {
      this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    }
  }

  private taydennaMenuData(menuData: Array<sideMenuEntry>, lang: string) {
    for (let menuItem of menuData) {
      if (menuItem.route) {
        menuItem.route.params = {
          ...menuItem.route.params,
          lang,
        };
      }

      if (menuItem.children) {
        this.taydennaMenuData(menuItem.children, lang);
      }
    }
  }

  private OpsLapsiLinkit() {
    return this.opsLapset.map((lapsi) => {
      const tekstiNimi = ( !lapsi.tekstiKappale || !lapsi.tekstiKappale.nimi ) ? {} : lapsi.tekstiKappale.nimi;

      return {
        item: {
          type: 'tekstikappale',
          name: tekstiNimi,
        },
        route: {
          name: 'tekstikappale',
          params: {
            osaId: lapsi.id,
          },
        },
      };
    });
  }

  private OpsOppiaineLinkit(): Array<sideMenuEntry> {
    if (!this.cache) {
      return [];
    }

    return this.cache.peruste().oppiaineet.map(oppiaine => {
      return {
        item: {
          type: 'oppiaine',
          name: oppiaine.nimi,
        },
        route: {
          name: 'oppiaine',
          params: {
            oppiaineId: oppiaine.id,
          },
        },
      };
    });
  }

  private get valikkoData() {
    let menuOpsData: Array<sideMenuEntry> = [
      ...menuBaseData,
      ...this.OpsLapsiLinkit(),
    ];

    const oppiaineLinkit = this.OpsOppiaineLinkit();
    if (oppiaineLinkit.length > 0) {
      menuOpsData = [
        ...menuOpsData,
        {
          item: {
            type: 'staticlink',
            i18key: 'oppiaineet',
          },
          children: [
            ...oppiaineLinkit,
            ...menuExtraData,
          ],
        },
      ];
    }

    this.taydennaMenuData(menuOpsData, Kielet.getUiKieli());

    return menuOpsData;
  }

  private kaanna(value: sideMenuItem) {
    if (value.type === 'staticlink') {
      return (value.i18key) ? this.$t(value.i18key) : '';
    }

    const locale = Kielet.getSisaltoKieli();
    const i18key = (value.type === 'tekstikappale') ? 'nimetön-tekstikappale' : 'nimetön-oppiaine';

    return (value.name as any)[locale] || this.$t(i18key);
  }

  private get opsLapset() {
    if (Opetussuunnitelma.sisalto && Opetussuunnitelma.sisalto.lapset) {
      return Opetussuunnitelma.sisalto.lapset;
    }

    return [];
  }

  private get opsSisalto() {
    return Opetussuunnitelma.sisalto;
  }

  private async addTekstikappale() {
    const uusi = await Opetussuunnitelma.addTeksti({
      tekstiKappale: {
        nimi: {
          fi: 'Uusi tekstikappale',
        } as any,
      },
    });
  }

  private async addOpintojakso() {
    const uusi = await Opetussuunnitelma.addOpintojakso({
      nimi: {
        fi: 'x',
      } as any,
      oppiaineet: ['oppiaineet_bi'],
    });
  }
}
