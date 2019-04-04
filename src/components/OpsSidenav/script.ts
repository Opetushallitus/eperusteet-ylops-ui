import { Component, Vue, Watch } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@/stores/kieli';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { PerusteCache } from '@/stores/peruste';

import {
  SideMenuEntry,
  SideMenuItem,
  Lops2019OpintojaksoDto,
} from '@/tyypit';

import {
  EpButton,
  EpRecursiveNav,
  EpColorBall,
} from '@/components';

import EpSisaltoModaali from './EpSisaltoModaali.vue';
import OpsSidenavLink from './OpsSidenavLink.vue';

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
    OpsSidenavLink,
  },
})
export default class OpsSidenav extends Vue {
  private cache: PerusteCache = null as any;
  private opintojaksot: Lops2019OpintojaksoDto[] = [];

  async created() {
    if (_.get(this.$route, 'params.id', null) !== null) {
      this.opintojaksot = await Opetussuunnitelma.getOpintojaksot();
      this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    }
  }

  private OpsLapsiLinkit(lapset) {
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

      if(lapsi.lapset && lapsi.lapset.length>0) {
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

  private OppimaaraOpintojaksoLinkit(oppimaara) {
    const uri = oppimaara.koodi.uri;
    return this.opintojaksot
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

  private OppiaineLinkki(type, objref, children) {
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

  private onkoModTaiOj(item: SideMenuItem) {
    return (item.type === 'moduuli' || item.type === 'opintojakso');
  }

  private haeModuuliKoodi(item: SideMenuItem) {
    return _.get(item, 'objref.koodi.arvo', '');
  }

  private get valikkoData() {
    let menuOpsData: SideMenuEntry[] = [
      ...menuBaseData,
      ...this.OpsLapsiLinkit(this.opsLapset),
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

    return menuOpsData;
  }

  private get opsLapset() {
    return _.get(Opetussuunnitelma, 'sisalto.lapset', []);
  }

  private get opsSisalto() {
    return Opetussuunnitelma.sisalto;
  }

  @Watch('Opetussuunnitelma')
  async onOpsChange() {
    if (this.$route) {
      this.opintojaksot = await Opetussuunnitelma.getOpintojaksot();
    }
  }
}
