import { Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';

import {
  SideMenuEntry,
  SideMenuItem,
} from '@/tyypit';

import {
  EpButton,
  EpRecursiveNav,
} from '@/components';

import EpSisaltoModaali from './EpSisaltoModaali.vue';

// Static content for menu
const menuBaseData: Array<SideMenuEntry> = [
  {
    item: {
      type: 'staticlink',
      i18key: 'tiedot',
    },
    route: {
      name: 'opsTiedot',
      params: {},
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
          params: {},
        },
      }, {
        item: {
          type: 'staticlink',
          i18key: 'poistetut',
        },
        route: {
          name: 'opsPoistetut',
          params: {},
        },
      }, {
        item: {
          type: 'staticlink',
          i18key: 'kasitteet',
        },
        route: {
          name: 'opsKasitteet',
          params: {},
        },
      },
    ],
  },
];

// Mock data .. to be removed ..
const menuExtraData: Array<SideMenuEntry> = [
  {
    item: {
      type: 'staticlink',
      i18key: 'testioppiaine',
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
    EpButton,
    EpRecursiveNav,
    EpSisaltoModaali,
  },
})
export default class OpsSidenav extends Vue {
  private cache: PerusteCache = null as any;

  async mounted() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  private taydennaMenuData(menuData: Array<SideMenuEntry>, lang: string) {
    menuData.forEach(menuItem => {
      if (menuItem.route) {
        menuItem.route.params = {
          ...menuItem.route.params,
          lang,
        };
      }
      if (menuItem.children) {
        this.taydennaMenuData(menuItem.children, lang);
      }
    });
  }

  private OpsLapsiLinkit() {
    return this.opsLapset.map((lapsi) => {
      const tekstiNimi = (!lapsi.tekstiKappale || !lapsi.tekstiKappale.nimi) ? {} : lapsi.tekstiKappale.nimi;
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

  private OpsOppiaineLinkit(): Array<SideMenuEntry> {
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
    let menuOpsData: Array<SideMenuEntry> = [
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

  private kaanna(value: SideMenuItem) {
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
