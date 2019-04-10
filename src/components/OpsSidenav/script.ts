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
import { MenuBuilder } from './menuBuilder';

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
  private menuBuilder: MenuBuilder = new MenuBuilder();

  async created() {
    if (_.get(this.$route, 'params.id', null) !== null) {
      try {
        this.opintojaksot = await Opetussuunnitelma.getOpintojaksot();
      }
      catch (e) {
        // Todo: virheenkäsittely
      }
      this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
    }
  }

  private opintojaksoModuuliLista(source) {
    const result: SideMenuEntry[] = [];
    const oppiaineenOpintojaksot = this.menuBuilder.OppimaaraOpintojaksoLinkit(this.opintojaksot, source);
    if (!_.isEmpty(oppiaineenOpintojaksot)) {
      result.push({
        item: {
          type: 'staticlink',
          i18key: 'opintojaksot',
        },
        flatten: true,
        children: oppiaineenOpintojaksot,
      });
    }
    result.push({
      item: {
        type: 'staticlink',
        i18key: 'moduulit',
      },
      flatten: true,
      children: [
        ...this.menuBuilder.OppimaaraModuuliLinkit(source),
      ],
    });
    return result;
  }

  private oppiaineOppimaaraLinkit(oppiaine) {
    return oppiaine.oppimaarat.map(oppimaara =>
      this.menuBuilder.OppiaineLinkki(
        'oppimaara',
        oppimaara,
        this.opintojaksoModuuliLista(oppimaara)));
  }

  private OpsOppiaineLinkit() {
    if (!this.cache) {
      return [];
    }

    return this.cache.peruste().oppiaineet.map(oppiaine =>
      this.menuBuilder.OppiaineLinkki(
        'oppiaine',
        oppiaine,
        oppiaine.oppimaarat.length > 0
          ? this.oppiaineOppimaaraLinkit(oppiaine)
          : this.opintojaksoModuuliLista(oppiaine)));
  }

  private kaanna(value: SideMenuItem) {
    if (value.type === 'staticlink') {
      return (value.i18key) ? this.$t(value.i18key) : '';
    }

    const locale = Kielet.getSisaltoKieli();
    const i18key = i18keys[value.type] || 'nimetön';
    const compiled = _.get(value.objref, 'nimi.' + locale) || this.$t(i18key);
    if (value.prefix) {
      return value.prefix + ' ' + compiled;
    }
    else {
      return compiled;
    }
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
      ...this.menuBuilder.OpsLapsiLinkit(this.opsLapset),
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
      try {
        this.opintojaksot = await Opetussuunnitelma.getOpintojaksot();
      }
      catch (e) {
        // Todo: virheenkäsittely
      }
    }
  }
}
