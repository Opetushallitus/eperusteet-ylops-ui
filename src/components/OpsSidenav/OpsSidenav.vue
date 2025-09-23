<template>
<ep-spinner v-if="isLoading" />
<div v-else class="sidebar d-flex flex-column flex-fill">
  <ul class="navigation flex-fill">

    <li class="p-0">
      <router-link :to="{name: 'yleisnakyma'}">
        <div class="hallintapaneeli">
          <span>{{$t('yleisnakyma')}}</span>
        </div>
      </router-link>
    </li>

    <ep-recursive-nav :value="valikkoData">
      <template v-slot:previousLink="{ itemData, itemRoute, navigate }">
        <li class="previous-link align-items-start">
          <ops-sidenav-link class="back-btn" tag="span" :click="navigate" :clickParams="false">
            <EpMaterialIcon>chevron_left</EpMaterialIcon>
          </ops-sidenav-link>
          <ops-sidenav-link class="previous-link" tag="span" :to="itemRoute">
            {{ kaanna(itemData.item) }}
            <span class="code-field" v-if="haeKoodi(itemData.item)">({{ haeKoodi(itemData.item) }})</span>
            <EpMaterialIcon v-if="itemData.item.order === '99'" size="16px">attach_file</EpMaterialIcon>
            <EpMaterialIcon v-if="itemData.item.piilotettu" size="16px">visibility_off</EpMaterialIcon>
          </ops-sidenav-link>
        </li>
      </template>
      <template v-slot="{ itemData, isSubmenu, navigate, itemRoute }">
        <ops-sidenav-link :to="itemRoute" :class="{ 'module-link': onkoModTaiOj(itemData.item) }" v-if="!isSubmenu && itemRoute">
          <div class="ml-2" v-if="itemData.item.type === 'uusi-opintojakso'">
            <EpMaterialIcon class="mr-2" size="20px">add</EpMaterialIcon>
            <span>{{ $t('luo-uusi-opintojakso') }}</span>
          </div>
          <div class="" v-else-if="itemData.item.type === 'uusi-paikallinen-oppiaine'">
            <EpMaterialIcon class="mr-2" size="20px">add</EpMaterialIcon>
            <span>{{ $t('luo-uusi-paikallinen-oppiaine') }}</span>
          </div>
          <div v-else class="d-inline-flex">
            <div v-if="onModuuli(itemData.item)">
              <ep-color-indicator class="mr-2" :kind="itemData.item.objref.pakollinen ? 'pakollinen': 'valinnainen'">
              </ep-color-indicator>
            </div>
            <div>
              <span>{{ kaanna(itemData.item) }}</span>
              <span class="code-field" v-if="haeKoodi(itemData.item)">({{ haeKoodi(itemData.item) }})</span>
            </div>
          </div>
          <EpMaterialIcon v-if="itemData.item.piilotettu" class="ml-1" size="16px">visibility_off</EpMaterialIcon>
        </ops-sidenav-link>
        <li class="subheader" v-if="!isSubmenu && !itemRoute && kaanna(itemData.item)">
          <span>{{ kaanna(itemData.item) }}</span>
        </li>
        <ops-sidenav-link class="submenu" v-if="isSubmenu" :itemData="itemData" :to="itemRoute" :click="navigate">
          <div class="d-flex w-100">
            <div class="flex-grow-1">
              {{ kaanna(itemData.item) }}
              <span class="code-field" v-if="haeKoodi(itemData.item)">({{ haeKoodi(itemData.item) }})</span>
              <EpMaterialIcon v-if="itemData.item.order === '99'" size="16px">attach_file</EpMaterialIcon>
              <EpMaterialIcon v-if="itemData.item.piilotettu" size="16px">visibility_off</EpMaterialIcon>
            </div>
            <EpMaterialIcon v-if="!itemData.item.hideChevron">chevron_right</EpMaterialIcon>
          </div>
        </ops-sidenav-link>
      </template>
      <template v-slot:after="{ itemData }">
        <li v-if="itemData.item.type === 'tekstikappale' && !isPohja">
          <ep-tekstikappale-lisays
            :opetussuunnitelmaStore="store"
            :tekstikappaleet="tekstikappaleLapset(itemData)"
            v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"/>
        </li>

        <li v-if="itemData.item.type === 'koosteinen-oppiaine'">
          <ep-oppimaara-lisays
              :opetussuunnitelmaStore="store"
              :oppiaine="itemData.item.objref"
              :reset-navi="reset"
              v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"/>
        </li>
      </template>
    </ep-recursive-nav>

  </ul>

  <div class="muokkaa-kappaleita" v-sticky sticky-side="bottom" sticky-z-index="500" v-if="!isPohja">
    <router-link :to="{name: 'jarjesta'}">
      <div class="inner">
        <EpMaterialIcon class="icon">reorder</EpMaterialIcon>
        <a class="btn btn-link btn-link-nav">{{$t('muokkaa-jarjestysta')}}</a>
      </div>
    </router-link>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted, inject } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import { PerusteCache } from '@/stores/peruste';
import { Lops2019OppiaineDto, Lops2019PaikallinenOppiaineDto } from '@shared/api/ylops';
import { SideMenuEntry, SideMenuItem, OpintojaksoModuuliSource } from '@shared/tyypit';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpRecursiveNav from '@/components/EpRecursiveNav/EpRecursiveNav.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import OpsSidenavLink from './OpsSidenavLink.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import Sticky from 'vue-sticky-directive';
import EpTekstikappaleLisays from '@/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import EpOppimaaraLisays from '@/components/EpOppimaaraLisays/EpOppimaaraLisays.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { oppiaineLinkki, oppimaaraModuuliLinkit, oppimaaraOpintojaksoLinkit, opsLapsiLinkit, paikallinenOppiaineLinkki, oppimaaraUusiLinkki, vuosiluokkaLinkit } from './menuBuildingMethods';
import { oikeustarkastelu } from '@/directives/oikeustarkastelu';
import { koodiNumero, koodiAlku, isPaikallisestiSallittuLaajennos, koodiSorters } from '@/utils/perusteet';
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { $kaanna, $t } from '@shared/utils/globals';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';

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

// Note: Directives are available globally in Vue 3


const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Emits
const emit = defineEmits(['input']);

// Router
const route = useRoute();

// Use the composable
const {
  store,
  ops,
  isLops2019,
  opsId,
  isPohja,
  isOps,
  isValmisPohja,
  isPohjanTyyppiOps,
  kasiteHandler,
  kuvaHandler,
  isLuva,
} = useEpOpsComponent(props.opetussuunnitelmaStore);

// Reactive data
const cache = ref<PerusteCache>(null as any);
const showHallintatyokalut = ref(false);
const query = ref('');

// Computed properties
const opintojaksot = computed(() => {
  return _(store.value.opintojaksot)
    .concat(store.value.tuodutOpintojaksot)
    .value();
});

// Lifecycle
onMounted(async () => {
  cache.value = await PerusteCache.of(_.parseInt(route.params.id as string));
});

// Methods
const opintojaksoModuuliLista = (source: OpintojaksoModuuliSource) => {
  const result: SideMenuEntry[] = [];
  const oppiaineenOpintojaksot = oppimaaraOpintojaksoLinkit(opintojaksot.value, source);
  if (!isPaikallisestiSallittuLaajennos(source.koodi) || _.size(oppiaineenOpintojaksot) > 0) {
    result.push({
      item: {
        type: 'staticlink',
        i18key: 'opintojaksot',
      },
      flatten: true,
      children: [
        ...oppiaineenOpintojaksot,
        ...(!isPaikallisestiSallittuLaajennos(source.koodi) ? [oppimaaraUusiLinkki(source)] : []),
      ],
    });
  }

  if (isPaikallisestiSallittuLaajennos(source.koodi)) {
    result.push({
      item: {
        type: 'uusi-paikallinen-oppiaine',
      },
      route: {
        name: 'uusi-paikallinen-oppiaine',
        params: {
          paikallinenOppiaineId: 'uusi',
          oppiaineKoodi: source.koodi,
        },
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
};

const oppiaineOppimaaraLinkit = (oppiaine: Lops2019OppiaineDto) => {
  return _.chain(oppiaine.oppimaarat)
    .map(oppimaara => {
      const sideMenuEntries: SideMenuEntry[] = [
        ...opintojaksoModuuliLista({
          id: oppimaara.id!,
          koodi: oppimaara.koodi!.uri!,
          moduulit: oppimaara.moduulit,
        }),
      ];

      if (Object.keys(paikallisetOppiaineetByPerusteenOppiaineenKoodi.value).includes(oppimaara.koodi?.uri!)) {
        sideMenuEntries.unshift({
          item: {
            type: 'staticlink',
            i18key: 'oppimaarat',
          },
          flatten: true,
          children: _.chain(paikallisetOppiaineetByPerusteenOppiaineenKoodi.value[oppimaara.koodi?.uri!])
            .map(poa => paikallinenOppiaineLinkki(
              'oppimaara',
              poa,
              opintojaksoModuuliLista({
                id: poa.id!,
                koodi: poa.koodi!,
              }),
            ))
            .map(item => {
              return {
                ...item,
                jarjestys: _.get(
                  _.find(oppiaineJarjestykset.value, {
                    koodi: _.get(item, 'item.objref.koodi.uri') || _.get(item, 'item.objref.koodi'),
                  }),
                  'jarjestys',
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
        sideMenuEntries,
      );
    })
    .value();
};

const perusteenOppiaineet = computed(() => {
  return _.get(cache.value, 'peruste.oppiaineet', null);
});

const paikallisetOppiaineet = computed(() => {
  return store.value.paikallisetOppiaineet;
});

const paikallisetOppiaineetByPerusteenOppiaineenKoodi = computed(() => {
  const obj: { [key: string]: Lops2019PaikallinenOppiaineDto[] } = {};
  const oppiaineet = paikallisetOppiaineet.value;

  if (oppiaineet && Array.isArray(oppiaineet)) {
    for (const val of oppiaineet) {
      if (val.perusteenOppiaineUri) {
        obj[val.perusteenOppiaineUri] = [
          ...(obj[val.perusteenOppiaineUri] || []),
          val,
        ];
      }
    }
  }
  return obj;
});

const isLoading = computed(() => {
  return !perusteenOppiaineet.value;
});

const oppiaineJarjestykset = computed(() => {
  return store.value.oppiaineJarjestykset;
});

const opsOppiaineLinkit = computed(() => {
  if (!perusteenOppiaineet.value) {
    return [];
  }
  return _.chain(perusteenOppiaineet.value)
    .sortBy(koodiAlku, koodiNumero)
    .map(oppiaine => {
      const paikallisetOppimaaratLinkit = _(paikallisetOppiaineet.value)
        .filter(
          poa =>
            poa.perusteenOppiaineUri === oppiaine.koodi.uri
            || _.includes(
              _.map(oppiaine.oppimaarat, 'koodi.uri'),
              poa.perusteenOppiaineUri,
            ),
        )
        .map(poa =>
          paikallinenOppiaineLinkki(
            'oppiaine',
            poa,
            opintojaksoModuuliLista({
              id: poa.id!,
              koodi: poa.koodi!,
              // todo: Jos halutaan perusteen moduulit, vaatii myös linkkien korjauksen
              // moduulit: poa.perusteenOppiaineUri ? _.keyBy(oppiaine.oppimaarat, 'koodi.uri')[poa.perusteenOppiaineUri].moduulit : undefined,
            }),
          ),
        )
        .value();

      return oppiaineLinkki(
        'oppiaine',
        oppiaine,
        oppiaine.oppimaarat.length > 0
          ? _.chain([...oppiaineOppimaaraLinkit(oppiaine), ...paikallisetOppimaaratLinkit])
            .map(oppimaara => {
              return {
                ...oppimaara,
                koodi: _.get(oppimaara, 'item.objref.koodi.uri') || _.get(oppimaara, 'item.objref.koodi'),
                paikallinen: oppimaara.route?.name === 'paikallinenOppiaine',
                jarjestys: _.get(
                  _.find(oppiaineJarjestykset.value, {
                    koodi: _.get(oppimaara, 'item.objref.koodi.uri') || _.get(oppimaara, 'item.objref.koodi'),
                  }),
                  'jarjestys',
                ),
              };
            })
            .sortBy('jarjestys', 'paikallinen', ...koodiSorters())
            .value()
          : opintojaksoModuuliLista({
            id: oppiaine.id!,
            koodi: oppiaine.koodi!.uri!,
            moduulit: oppiaine.moduulit!,
          }),
      );
    })
    .map(el => ({
      ...el,
      jarjestys: _.get(
        _.find(oppiaineJarjestykset.value, {
          koodi: _.get(el, 'item.objref.koodi.uri'),
        }),
        'jarjestys',
      ),
    }))
    .value();
});

const kaannaHelper = (value: SideMenuItem) => {
  const i18key = i18keys[value.type] || 'nimetön';
  return $kaanna(_.get(value.objref, 'nimi')) || $t(i18key);
};

const toggleHallinta = () => {
  showHallintatyokalut.value = !showHallintatyokalut.value;
};

const kaanna = (value: SideMenuItem) => {
  if (value.type === 'staticlink') {
    return kaannaStaticLink(value.i18key);
  }

  const compiled = kaannaHelper(value);
  return value.prefix ? value.prefix + ' ' + compiled : compiled;
};

const kaannaStaticLink = (i18key: string | string[] | undefined) => {
  if (_.isArray(i18key)) {
    return _.join(
      _.map(i18key, key => $t(key)),
      ' ',
    );
  }
  else {
    return i18key ? $t(i18key) : '';
  }
};

const onkoModTaiOj = (item: SideMenuItem) => {
  return item.type === 'moduuli' || item.type === 'opintojakso';
};

const onModuuli = (item: any) => {
  return item.type === 'moduuli';
};

const haeKoodi = (item: SideMenuItem) => {
  const koodi = _.get(item, 'objref.koodi.arvo', '');
  if (!_.isEmpty(koodi)) {
    return koodi;
  }
  else {
    // Paikallisten oppiaineiden koodin muoto
    const arvo = _.get(item, 'objref.koodi', '');
    return _.isString(arvo) ? arvo : '';
  }
};

const valikkoDataBasics = computed(() => {
  return menuBaseData;
});

const opsLapset = computed(() => {
  return _.get(store.value, 'sisalto.lapset', []);
});

const valikkoData = computed(() => {
  // Valikon rakennus alkaa staattisella sisällöllä ja tekstikappaleiden linkeillä
  let menuOpsData: SideMenuEntry[] = [
    ...opsLapsiLinkit(opsLapset.value),
    ...vuosiluokkaLinkit(ops.value || {} as any),
  ];

  // Lisätään oppiaineet valikkoon ja niiden alle opintojaksot & modulit
  const oppiaineLinkit = opsOppiaineLinkit.value;
  const paikallisetOppiaineArray = store.value.paikallisetOppiaineet || [];

  if ((oppiaineLinkit && oppiaineLinkit.length > 0) || paikallisetOppiaineArray.length > 0) {
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
          ..._(paikallisetOppiaineArray)
            .filter(poa => _.isEmpty(poa.perusteenOppiaineUri))
            .map(poa =>
              paikallinenOppiaineLinkki(
                'oppiaine',
                poa,
                opintojaksoModuuliLista({
                  id: poa.id!,
                  koodi: poa.koodi!,
                }),
              ),
            )
            .map(el => ({
              ...el,
              jarjestys: _.get(
                _.find(oppiaineJarjestykset.value, {
                  koodi: _.get(el, 'item.objref.koodi'),
                }),
                'jarjestys',
              ),
            }))
            .value(),
        ])
          .sortBy('jarjestys')
          .value(),
      },
    ];
  }

  menuOpsData = _.sortBy(menuOpsData, data => data.item.order ? data.item.order : '0');

  return menuOpsData;
});

const reset = () => {
  store.value.init();
};

const tekstikappaleet = computed(() => {
  return _.filter(tekstikappaleRec(valikkoData.value), item => item.item.type === 'tekstikappale');
});

const tekstikappaleRec = (itemData: any): any => {
  return _.flatMap(_.map(itemData, item => {
    return _.flatMap([
      {
        item: item.item,
        route: item.route,
      },
      ...tekstikappaleRec(item.children),
    ]);
  }));
};

const tekstikappaleLapset = (itemData: any) => {
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
};

// Watchers
watch(valikkoData, () => {
  emit('input', valikkoData.value);
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.icon {
  vertical-align: middle;
}

.sidebar {
  padding-top: 12px;

  ul.navigation {
    list-style: none;
    padding: 0;

    li {
      padding: 0 7px 0 49px;
    }

    .btn-link-nav {
      text-decoration: none;
      &:focus {
        outline: -webkit-focus-ring-color auto 1px;
      }
    }

    .item {
      li {
        a {
          text-align: left;
          color: #2b2b2b;
          font-size: 14px;

          &.btn-link-link {
            color: $blue-lighten-5;
            font-weight: 600;
          }
        }
      }
    }

    li.separated {
      margin-top: 50px;
    }

    li.subheader {
      margin-top: 25px;
      margin-bottom: 5px;
      span {
        font-size: 90%;
        user-select: none;
        color: $gray-lighten-1;
      }
    }

    span.code-field {
      margin-left: 5px;
      font-size: 80%;
      text-transform: uppercase;
    }

    li.submenu, li.previous-link {
      display: flex;
      align-items: center;
      cursor: pointer;

      a.btn {
        width: 100%;
      }
    }

    li.submenu {
      svg {
        color: #b2b2b2;
      }
    }

    li.previous-link {

      padding-left: 11px;
      span.previous-link {
        padding-top: 3px;
      }

      span.back-btn {
        width: 30px;
        height: 30px;
        border-radius: 15px;
        margin-top: 0px;
        margin-right: 8px;
        background-color: #0041DC;
        color: #fff;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-shrink: 0;

        svg {
          margin-left: -2px;
        }
      }
    }

    li.router-link-exact-active {
      a {
        font-weight: bold;
        color: #0041DC;
      }
    }

    li.previous-link {
      span.router-link-exact-active {
        a {
          font-weight: bold;
          color: #0041DC;
        }
      }
    }

    li {
      a.router-link-active {
        font-weight: 600;
      }
    }

    div.subitem {
      .btn, .btn-link-link {
        padding-top: 5px;
        padding-bottom: 5px;
      }
    }

  }

  .search {
    padding: 10px 20px 10px 30px;
  }

  .muokkaa-kappaleita {
    padding: 0 20px 0 20px;
    background-color: #fff;

    // sticky initial state
    position: fixed;
    bottom: 0;
    width: $sidebar-width;

    .inner {
      border-color: #D8D8D8;
      border-style: solid;
      border-width: 1px 0 0 0;
      padding: 10px;
    }

    a.router-link-active {
      color: #888888;
    }
  }

  .hallintapaneeli {
    margin: 0 40px 10px 40px;
    border-color: #D8D8D8;
    border-style: solid;
    border-width: 0 0 1px 0;

    span {
      padding: 10px;
      color: $black;
      display: block;
    }
  }
}
</style>
