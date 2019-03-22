import { Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';

import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

import {
  EpRecursiveNav,
} from '@/components';

// Static content for menu
const menuBaseData = [
  {
    item: {
      name: 'Tiedot',
    },
    route: {
      name: 'opsTiedot',
    },
    flatten: true,
    children: [
      {
        item: {
          name: 'Dokumentit',
        },
        route: {
          name: 'opsDokumentti',
        },
      }, {
        item: {
          name: 'Poistetut',
        },
        route: {
          name: 'opsPoistetut',
        },
      }, {
        item: {
          name: 'Käsitteet',
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
      name: 'Testioppiaine',
    },
    route: {
      name: 'oppiaine',
      params: {
        aineId: 2,
      },
    },
  }, {
    item: {
      name: 'Oppiaineet',
    },
    children: [
      {
        item: {
          name: 'Matematiikka',
        },
        children: [
          {
            item: {
              name: 'Matematiikka lyhyt',
            },
            children: [
              {
                item: {
                  name: 'Opintojaksot',
                },
                children: [
                  {
                    item: {
                      name: 'Integraali-opintojakso',
                    },
                  },
                ],
              },
              {
                item: {
                  name: 'Modulit',
                },
                children: [
                  {
                    item: {
                      name: 'Integraali',
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
    EpRecursiveNav,
  },
})
export default class OpsSidenav extends Vue {
  private get valikkoData() {
    let menuOpsData: any = [];
    let opsSisalto = this.sisalto;

    if (opsSisalto && opsSisalto.lapset) {
      for (let teksti of opsSisalto.lapset) {
        if (!teksti || !teksti.tekstiKappale) {
          continue;
        }

        let valikkoLinkki:any = {
          item: {
            name: this.kaanna(teksti.tekstiKappale.nimi) || this.$t('nimetön-tekstikappale'),
          },
          route: {
            name: 'tekstikappale',
            params: {
              osaId: teksti.id,
            },
          },
        };

        menuOpsData.push(valikkoLinkki);
      }
    }

    return [...menuBaseData, ...menuOpsData, ...menuExtraData];
  }

  private kaanna(value) {
    if (!value || !_.isObject(value)) {
      return '';
    }

    const locale = Kielet.getSisaltoKieli();
    return (value as any)[locale];
  }

  private get sisalto() {
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
      oppiaineUri: 'oppiaineet_maa',
      nimi: {
        fi: 'Uusi opintojakso',
      } as any,
    });
  }
}
