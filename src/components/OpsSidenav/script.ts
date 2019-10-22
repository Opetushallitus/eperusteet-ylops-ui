import { Component, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { PerusteCache } from '@/stores/peruste';

import {
  SideMenuEntry,
  SideMenuItem,
  Lops2019OppiaineDto,
} from '@/tyypit';

import {
  EpButton,
  EpRecursiveNav,
  EpColorBall,
  EpSearch,
} from '@/components';

import EpOpsComponent from '@/mixins/EpOpsComponent';
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
const menuBaseData: SideMenuEntry[] = [{
  item: {
    type: 'staticlink',
    i18key: 'tiedot',
  },
  route: {
    name: 'opsTiedot',
    params: {},
  },
  flatten: true,
  children: [{
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
  }],
}];

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
    EpSearch,
  },
})
export default class OpsSidenav extends EpOpsComponent {
  private cache: PerusteCache = null as any;
  private showHallintatyokalut = false;

  get opintojaksot() {
    return this.store.opintojaksot;
  }

  async created() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  private opintojaksoModuuliLista(source: Lops2019OppiaineDto) {
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

  private oppiaineOppimaaraLinkit(oppiaine: Lops2019OppiaineDto) {
    return _.map(oppiaine.oppimaarat, oppimaara =>
      oppiaineLinkki(
        'oppimaara',
        oppimaara,
        this.opintojaksoModuuliLista(oppimaara)));
  }

  get opsOppiaineLinkit() {
    return _.chain(!this.cache ? [] : this.cache.peruste.oppiaineet)
      .sortBy('koodi.arvo')
      .map(oppiaine =>
        oppiaineLinkki(
          'oppiaine',
          oppiaine,
          oppiaine.oppimaarat.length > 0
            ? this.oppiaineOppimaaraLinkit(oppiaine)
            : this.opintojaksoModuuliLista(oppiaine)))
      .value();
  }

  private kaannaHelper(value: SideMenuItem) {
    const locale = Kielet.getSisaltoKieli;
    const i18key = i18keys[value.type] || 'nimetön';
    return _.get(value.objref, 'nimi.' + locale) || this.$t(i18key);
  }

  toggleHallinta() {
    this.showHallintatyokalut = !this.showHallintatyokalut;
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

  get valikkoDataBasics() {
    return menuBaseData;
  }

  get valikkoData() {
    // Valikon rakennus alkaa staattisella sisällöllä ja tekstikappaleiden linkeillä
    let menuOpsData: SideMenuEntry[] = [
      ...opsLapsiLinkit(this.opsLapset),
    ];

    // Lisätään oppiaineet valikkoon ja niiden alle opintojaksot & modulit
    const paikallisetOppiaineet = this.store.paikallisetOppiaineet;
    const oppiaineLinkit = this.opsOppiaineLinkit;
    // debugger;

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
    return _.get(this.store, 'sisalto.lapset', []);
  }

  private get opsSisalto() {
    return this.store.sisalto;
  }
}
