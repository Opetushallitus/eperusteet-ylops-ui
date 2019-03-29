import { Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

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
    route: {
      name: 'oppiaine',
      params: {
        aineId: 2,
      },
    },
  }, {
    item: {
      type: 'staticlink',
      i18key: 'oppiaineet',
    },
    children: [
      {
        item: {
          type: 'staticlink',
          i18key: 'Matematiikka',
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
  private get valikkoData() {
    let menuOpsData: any = [];

    for (let teksti of this.sisalto) {
      if (!teksti || !teksti.tekstiKappale) {
        continue;
      }

      let valikkoLinkki: any = {
        item: teksti.tekstiKappale.nimi,
        route: {
          name: 'tekstikappale',
          params: {
            osaId: teksti.id,
          },
        },
      };

      menuOpsData.push(valikkoLinkki);
    }

    return [...menuBaseData, ...menuOpsData, ...menuExtraData];
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

  private get sisalto() {
    if (Opetussuunnitelma.sisalto && Opetussuunnitelma.sisalto.lapset) {
      return Opetussuunnitelma.sisalto.lapset;
    }

    return [];
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
