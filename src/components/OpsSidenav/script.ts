import _ from 'lodash';
import { Component } from 'vue-property-decorator';
import { Kielet } from '@shared/stores/kieli';
import { PerusteCache } from '@/stores/peruste';

import { Lops2019OppiaineDto, Lops2019PaikallinenOppiaineDto } from '@shared/api/ylops';
import {
  SideMenuEntry,
  SideMenuItem,
  OpintojaksoModuuliSource,
} from '@shared/tyypit';

import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpRecursiveNav from '@/components/EpRecursiveNav/EpRecursiveNav.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';

import EpOpsComponent from '@/mixins/EpOpsComponent';
import OpsSidenavLink from './OpsSidenavLink.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import Sticky from 'vue-sticky-directive';
import EpTekstikappaleLisays from '@/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import EpOppimaaraLisays from '@/components/EpOppimaaraLisays/EpOppimaaraLisays.vue';
import {
  oppiaineLinkki,
  oppimaaraModuuliLinkit,
  oppimaaraOpintojaksoLinkit,
  opsLapsiLinkit,
  paikallinenOppiaineLinkki,
  oppimaaraUusiLinkki,
  vuosiluokkaLinkit,
} from './menuBuildingMethods';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { koodiNumero, koodiAlku, isPaikallisestiSallittuLaajennos, koodiSorters } from '@/utils/perusteet';

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
      },
      {
        item: {
          type: 'staticlink',
          i18key: 'poistetut',
        },
        route: {
          name: 'opsPoistetut',
          params: {},
        },
      },
      {
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
  directives: {
    oikeustarkastelu,
    Sticky,
  },
  components: {
    EpButton,
    EpColorIndicator,
    EpRecursiveNav,
    EpSearch,
    EpSpinner,
    OpsSidenavLink,
    EpTekstikappaleLisays,
    EpOppimaaraLisays,
  },
})
export default class OpsSidenav extends EpOpsComponent {
  private cache: PerusteCache = null as any;
  private showHallintatyokalut = false;
  private query = '';

  get opintojaksot() {
    return _(this.store.opintojaksot)
      .concat(this.store.tuodutOpintojaksot)
      .value();
  }

  async created() {
    this.cache = await PerusteCache.of(_.parseInt(this.$route.params.id));
  }

  private opintojaksoModuuliLista(source: OpintojaksoModuuliSource) {
    const result: SideMenuEntry[] = [];
    const oppiaineenOpintojaksot = oppimaaraOpintojaksoLinkit(this.opintojaksot, source);
    if (!isPaikallisestiSallittuLaajennos(source.koodi)) {
      result.push({
        item: {
          type: 'staticlink',
          i18key: 'opintojaksot',
        },
        flatten: true,
        children: [
          ...oppiaineenOpintojaksot,
          oppimaaraUusiLinkki(source),
        ],
      });
    }
    else {
      result.push({
        item: {
          type: 'uusi-paikallinen-oppiaine',
        },
        route: {
          name: 'uusi-paikallinen-oppiaine',
          params: {},
          query: {
            oppiaine: source.koodi,
          },
        },
      });
    }

    if (source.moduulit) {
      result.push({
        item: {
          type: 'staticlink',
          i18key: 'moduulit',
        },
        flatten: true,
        children: [...oppimaaraModuuliLinkit(source)],
      });
    }

    return result;
  }

  private oppiaineOppimaaraLinkit(oppiaine: Lops2019OppiaineDto) {
    return _.chain(oppiaine.oppimaarat)
      .map(oppimaara => {
        const sideMenuEntries: SideMenuEntry[] = [
          ...this.opintojaksoModuuliLista({
            id: oppimaara.id!,
            koodi: oppimaara.koodi!.uri!,
            moduulit: oppimaara.moduulit,
          }),
        ];

        if (Object.keys(this.paikallisetOppiaineetByPerusteenOppiaineenKoodi).includes(oppimaara.koodi?.uri!)) {
          sideMenuEntries.unshift({
            item: {
              type: 'staticlink',
              i18key: 'oppimaarat',
            },
            flatten: true,
            children: _.chain(this.paikallisetOppiaineetByPerusteenOppiaineenKoodi[oppimaara.koodi?.uri!])
              .map(poa => paikallinenOppiaineLinkki(
                'oppimaara',
                poa,
                this.opintojaksoModuuliLista({
                  id: poa.id!,
                  koodi: poa.koodi!,
                })
              ))
              .map(item => {
                return {
                  ...item,
                  jarjestys: _.get(
                    _.find(this.oppiaineJarjestykset, {
                      koodi: _.get(item, 'item.objref.koodi.uri') || _.get(item, 'item.objref.koodi'),
                    }),
                    'jarjestys'
                  ),
                };
              })
              .sortBy('jarjestys', ...koodiSorters())
              .value(),
          });
        }

        return oppiaineLinkki(
          'oppimaara',
          oppimaara,
          sideMenuEntries
        );
      }
      )
      .value();
  }

  get perusteenOppiaineet() {
    return _.get(this.cache, 'peruste.oppiaineet', null);
  }

  get paikallisetOppiaineet() {
    return this.store.paikallisetOppiaineet;
  }

  get paikallisetOppiaineetByPerusteenOppiaineenKoodi() {
    const obj: { [key: string]: Lops2019PaikallinenOppiaineDto[] } = {};

    for (const val of this.paikallisetOppiaineet) {
      if (val.perusteenOppiaineUri) {
        obj[val.perusteenOppiaineUri] = [
          ...(obj[val.perusteenOppiaineUri] || []),
          val,
        ];
      }
    }
    return obj;
  }

  get isLoading() {
    return !this.perusteenOppiaineet;
  }

  get oppiaineJarjestykset() {
    return this.store.oppiaineJarjestykset;
  }

  get opsOppiaineLinkit() {
    if (!this.perusteenOppiaineet) {
      return [];
    }
    return _.chain(this.perusteenOppiaineet)
      .sortBy(koodiAlku, koodiNumero)
      .map(oppiaine => {
        const paikallisetOppimaaratLinkit = _(this.paikallisetOppiaineet)
          .filter(
            poa =>
              poa.perusteenOppiaineUri === oppiaine.koodi.uri
              || _.includes(
                _.map(oppiaine.oppimaarat, 'koodi.uri'),
                poa.perusteenOppiaineUri
              )
          )
          .map(poa =>
            paikallinenOppiaineLinkki(
              'oppiaine',
              poa,
              this.opintojaksoModuuliLista({
                id: poa.id!,
                koodi: poa.koodi!,
                // todo: Jos halutaan perusteen moduulit, vaatii myös linkkien korjauksen
                // moduulit: poa.perusteenOppiaineUri ? _.keyBy(oppiaine.oppimaarat, 'koodi.uri')[poa.perusteenOppiaineUri].moduulit : undefined,
              })
            )
          )
          .value();

        return oppiaineLinkki(
          'oppiaine',
          oppiaine,
          oppiaine.oppimaarat.length > 0
            ? _.chain([...this.oppiaineOppimaaraLinkit(oppiaine), ...paikallisetOppimaaratLinkit])
              .map(oppimaara => {
                return {
                  ...oppimaara,
                  koodi: _.get(oppimaara, 'item.objref.koodi.uri') || _.get(oppimaara, 'item.objref.koodi'),
                  paikallinen: oppimaara.route?.name === 'paikallinenOppiaine',
                  jarjestys: _.get(
                    _.find(this.oppiaineJarjestykset, {
                      koodi: _.get(oppimaara, 'item.objref.koodi.uri') || _.get(oppimaara, 'item.objref.koodi'),
                    }),
                    'jarjestys'
                  ),
                };
              })
              .sortBy('jarjestys', 'paikallinen', ...koodiSorters())
              .value()
            : this.opintojaksoModuuliLista({
              id: oppiaine.id!,
              koodi: oppiaine.koodi!.uri!,
              moduulit: oppiaine.moduulit!,
            })
        );
      })
      .map(el => ({
        ...el,
        jarjestys: _.get(
          _.find(this.oppiaineJarjestykset, {
            koodi: _.get(el, 'item.objref.koodi.uri'),
          }),
          'jarjestys'
        ),
      }))
      .value();
  }

  private kaannaHelper(value: SideMenuItem) {
    const locale = Kielet.getSisaltoKieli.value;
    const i18key = i18keys[value.type] || 'nimetön';
    return _.get(value.objref, 'nimi.' + locale) || this.$t(i18key);
  }

  toggleHallinta() {
    this.showHallintatyokalut = !this.showHallintatyokalut;
  }

  private kaanna(value: SideMenuItem) {
    if (value.type === 'staticlink') {
      return this.kaannaStaticLink(value.i18key);
    }

    const compiled = this.kaannaHelper(value);
    return value.prefix ? value.prefix + ' ' + compiled : compiled;
  }

  private kaannaStaticLink(i18key: string | string[] | undefined) {
    if (_.isArray(i18key)) {
      return _.join(
        _.map(i18key, key => this.$t(key)),
        ' '
      );
    }
    else {
      return i18key ? this.$t(i18key) : '';
    }
  }

  private onkoModTaiOj(item: SideMenuItem) {
    return item.type === 'moduuli' || item.type === 'opintojakso';
  }

  private onModuuli(item) {
    return item.type === 'moduuli';
  }

  private haeKoodi(item: SideMenuItem) {
    const koodi = _.get(item, 'objref.koodi.arvo', '');
    if (!_.isEmpty(koodi)) {
      return koodi;
    }
    else {
      // Paikallisten oppiaineiden koodin muoto
      const arvo = _.get(item, 'objref.koodi', '');
      return _.isString(arvo) ? arvo : '';
    }
  }

  get valikkoDataBasics() {
    return menuBaseData;
  }

  get valikkoData() {
    // Valikon rakennus alkaa staattisella sisällöllä ja tekstikappaleiden linkeillä
    let menuOpsData: SideMenuEntry[] = [
      ...opsLapsiLinkit(this.opsLapset),
      ...vuosiluokkaLinkit(this.ops),
    ];

    // Lisätään oppiaineet valikkoon ja niiden alle opintojaksot & modulit
    const oppiaineLinkit = this.opsOppiaineLinkit;
    const paikallisetOppiaineet = this.store.paikallisetOppiaineet;

    if (oppiaineLinkit.length > 0 || paikallisetOppiaineet.length > 0) {
      const that = this;
      menuOpsData = [
        ...menuOpsData,
        {
          item: {
            type: 'staticlink',
            i18key: 'oppiaineet',
          },
          route: {
            name: 'oppiaineet',
            params: {},
          },
          children: _([
            ...oppiaineLinkit,
            ..._(paikallisetOppiaineet)
              .filter(poa => _.isEmpty(poa.perusteenOppiaineUri))
              .map(poa =>
                paikallinenOppiaineLinkki(
                  'oppiaine',
                  poa,
                  that.opintojaksoModuuliLista({
                    id: poa.id!,
                    koodi: poa.koodi!,
                  })
                )
              )
              .map(el => ({
                ...el,
                jarjestys: _.get(
                  _.find(this.oppiaineJarjestykset, {
                    koodi: _.get(el, 'item.objref.koodi'),
                  }),
                  'jarjestys'
                ),
              }))
              .value(),
          ])
            .sortBy('jarjestys')
            .value(),
        },
      ];
    }

    return menuOpsData;
  }

  reset() {
    this.store.init();
  }

  private get opsLapset() {
    return _.get(this.store, 'sisalto.lapset', []);
  }

  get tekstikappaleet() {
    return _.filter(this.tekstikappaleRec(this.valikkoData), item => item.item.type === 'tekstikappale');
  }

  tekstikappaleRec(itemData) {
    return _.flatMap(_.map(itemData, item => {
      return _.flatMap([
        {
          item: item.item,
          route: item.route,
        },
        ...this.tekstikappaleRec(item.children),
      ]);
    }));
  }

  tekstikappaleLapset(itemData) {
    return _.filter([
      {
        item: itemData.item,
        route: itemData.route,
      },
      ..._.map(itemData.children, child => ({
        item: child.item,
        route: child.route,
      })),
    ], tk => tk.item.type === 'tekstikappale');
  }
}
