import { Component, Vue } from 'vue-property-decorator';
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
import {
  oppiaineLinkki,
  oppimaaraModuuliLinkit,
  oppimaaraOpintojaksoLinkit,
  opsLapsiLinkit,
  paikallinenOppiaineToMenu,
} from './menuBuildingMethods';

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
    const oppiaineenOpintojaksot = oppimaaraOpintojaksoLinkit(this.opintojaksot, source);
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
        ...oppimaaraModuuliLinkit(source),
      ],
    });
    return result;
  }

  private oppiaineOppimaaraLinkit(oppiaine) {
    return oppiaine.oppimaarat.map(oppimaara =>
      oppiaineLinkki(
        'oppimaara',
        oppimaara,
        this.opintojaksoModuuliLista(oppimaara)));
  }

  private opsOppiaineLinkit() {
    return !this.cache ? [] : this.cache.peruste.oppiaineet.map(oppiaine =>
      oppiaineLinkki(
        'oppiaine',
        oppiaine,
        oppiaine.oppimaarat.length > 0
          ? this.oppiaineOppimaaraLinkit(oppiaine)
          : this.opintojaksoModuuliLista(oppiaine)));
  }

  private kaannaHelper(value: SideMenuItem) {
    const locale = Kielet.getSisaltoKieli();
    const i18key = i18keys[value.type] || 'nimetön';
    return _.get(value.objref, 'nimi.' + locale) || this.$t(i18key);
  }

  private kaanna(value: SideMenuItem) {
    if (value.type === 'staticlink') {
      return (value.i18key) ? this.$t(value.i18key) : '';
    }

    const compiled = this.kaannaHelper(value);
    return value.prefix ? value.prefix + ' ' + compiled : compiled;
  }

  private onkoModTaiOj(item: SideMenuItem) {
    return (item.type === 'moduuli' || item.type === 'opintojakso');
  }

  private haeModuuliKoodi(item: SideMenuItem) {
    return _.get(item, 'objref.koodi.arvo', '');
  }

  private get valikkoData() {
    // Valikon rakennus alkaa staattisella sisällöllä ja tekstikappaleiden linkeillä
    let menuOpsData: SideMenuEntry[] = [
      ...menuBaseData,
      ...opsLapsiLinkit(this.opsLapset),
    ];

    // Lisätään oppiaineet valikkoon ja niiden alle opintojaksot & modulit
    const paikallisetOppiaineet = Opetussuunnitelma.paikallisetOppiaineet;
    const oppiaineLinkit = this.opsOppiaineLinkit();

    if (oppiaineLinkit.length > 0 || paikallisetOppiaineet.length > 0) {
      menuOpsData = [
        ...menuOpsData, {
          item: {
            type: 'staticlink',
            i18key: 'oppiaineet',
          },
          route: {
            name: 'oppiaineet',
            params: {},
          },
          children: [
            ...oppiaineLinkit,
            ..._.map(paikallisetOppiaineet, paikallinenOppiaineToMenu),
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
}
