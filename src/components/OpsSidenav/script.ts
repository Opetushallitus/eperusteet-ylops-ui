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
  EpColorBall,
} from '@/components';

import EpSisaltoModaali from './EpSisaltoModaali.vue';

// Static content for menu
const menuBaseData: SideMenuEntry[] = [
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

const i18keys = {
  moduuli: 'nimetön-moduuli',
  opintojakso: 'nimetön-opintojakso',
  oppiaine: 'nimetön-oppiaine',
  oppimaara: 'nimetön-oppimäärä',
  tekstikappale: 'nimetön-tekstikappale',
};

@Component({
  components: {
    EpButton,
    EpColorBall,
    EpRecursiveNav,
    EpSisaltoModaali,
  },
})
export default class OpsSidenav extends Vue {
  private cache: PerusteCache = null as any;

  async created() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  private taydennaMenuData(menuData: SideMenuEntry[], lang: string) {
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
      return {
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
    });
  }

  private OppimaaraOpintojaksoLinkit(oppimaara) {
    return [];
  }

  private OppimaaraModuuliLinkit(oppimaara) {
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

  private OpintojaksoModuuliLista(source) {
    return [
      {
        item: {
          type: 'staticlink',
          i18key: 'opintojaksot',
        },
        flatten: true,
        children: [
          ...this.OppimaaraOpintojaksoLinkit(source),
        ],
      },
      {
        item: {
          type: 'staticlink',
          i18key: 'moduulit',
        },
        flatten: true,
        children: [
          ...this.OppimaaraModuuliLinkit(source),
        ],
      },
    ];
  }

  private OppiaineLinkki(tyyppi, oppiaine, children) {
    return {
      item: {
        type: 'oppimaara',
        objref: oppiaine,
        hideChevron: true,
      },
      route: {
        name: 'oppiaine',
        params: {
          oppiaineId: oppiaine.id,
        },
      },
      children,
    };
  }

  private OppiaineOppimaaraLinkit(oppiaine) {
    return oppiaine.oppimaarat.map(oppimaara => {
      let children = this.OpintojaksoModuuliLista(oppimaara);
      return this.OppiaineLinkki('oppimaara', oppimaara, children);
    });
  }

  private OpsOppiaineLinkit() {
    if (!this.cache) {
      return [];
    }

    return this.cache.peruste().oppiaineet.map(oppiaine => {
      let children;

      if (oppiaine.oppimaarat.length > 0) {
        children = this.OppiaineOppimaaraLinkit(oppiaine);
      }
      else {
        children = this.OpintojaksoModuuliLista(oppiaine);
      }

      return this.OppiaineLinkki('oppiaine', oppiaine, children);
    });
  }

  private kaanna(value: SideMenuItem) {
    if (value.type === 'staticlink') {
      return (value.i18key) ? this.$t(value.i18key) : '';
    }

    const locale = Kielet.getSisaltoKieli();
    const i18key = i18keys[value.type] || 'nimetön';

    return _.get(value.objref, 'nimi.' + locale) || this.$t(i18key);
  }

  private get valikkoData() {
    let menuOpsData: SideMenuEntry[] = [
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
          ],
        },
      ];
    }

    this.taydennaMenuData(menuOpsData, Kielet.getUiKieli());

    return menuOpsData;
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
}
