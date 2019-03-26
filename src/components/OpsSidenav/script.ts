import { Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';

import {
  EpButton,
  EpRecursiveNav,
} from '@/components';

import EpSisaltoModaali from './EpSisaltoModaali.vue';

// Static content for menu
const menuBaseData = [
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

const menuExtraData = [
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

  private vaihdaKielikoodi(menuData: any, locale: string) {
    for (let menuItem of menuData) {
      if (menuItem.route && menuItem.route.params) {
        menuItem.route.params.lang = locale;
      }
      else if (menuItem.route && !menuItem.route.params) {
        menuItem.route.params = {
          lang: locale,
        };
      }

      if (menuItem.children) {
        this.vaihdaKielikoodi(menuItem.children, locale);
      }
    }
  }

  private OpsLapsiLinkit() {
    return this.opsLapset.map((lapsi) => {
      if (!lapsi.tekstiKappale || !lapsi.tekstiKappale.nimi) {
        return {};
      }

      return {
        item: lapsi.tekstiKappale.nimi,
        route: {
          name: 'tekstikappale',
          params: {
            osaId: lapsi.id,
          },
        },
      };
    });
  }

  private OpsOppiaineLinkit() {
    if (!this.cache) {
      return [];
    }

    return this.cache.peruste().oppiaineet.map(oppiaine => {
      return {
        item: oppiaine.nimi,
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
    let menuOpsData: any = [...menuBaseData];

    menuOpsData = [
      ...menuBaseData,
      ...this.OpsLapsiLinkit(),
      {
        item: {
          type: 'staticlink',
          i18key: 'Oppiaineet',
        },
        children: [
          ...this.OpsOppiaineLinkit(),
          ...menuExtraData,
        ],
      },
    ];

    this.vaihdaKielikoodi(menuOpsData, Kielet.getUiKieli());

    return menuOpsData;
  }

  private kaanna(value) {
    if (_.isObject(value) && value.type && value.type === 'staticlink') {
      return this.$t(value.i18key);
    }

    if (!value || !_.isObject(value)) {
      return this.$t('nimetön-tekstikappale');
    }

    const locale = Kielet.getSisaltoKieli();

    return (value as any)[locale] || this.$t('nimetön-tekstikappale');
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
