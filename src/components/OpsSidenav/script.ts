import { Component, Vue } from 'vue-property-decorator';

import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

import {
  EpRecursiveNav,
} from '@/components';

// Replace with generated data
const menuData = [
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
  {
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
    return menuData;
  }

  private get sisalto() {
    return Opetussuunnitelma.sisalto;
  }

  private async addTekstikappale() {
    const uusi = await Opetussuunnitelma.addTeksti({
      tekstiKappale: {
        nimi: {
        },
      },
    });
  }
}
