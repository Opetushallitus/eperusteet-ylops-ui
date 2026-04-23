<template>
  <div>
    <ep-navigation
      tyyli="ops"
      :koulutustyyppi="koulutustyyppi"
      :header-class="headerClass"
      :sticky="true"
    />
    <ep-spinner
      v-if="!ops"
      class="center-loading"
    />
    <div
      v-else
      class="opetussuunnitelma"
      :class="headerClass"
    >
      <div
        class="header"
        :style="headerStyle"
      >
        <div class="progress-chart">
          <EpValidPopover
            :validoitava="ops"
            :validoinnit="validoinnit"
            :julkaisemattomia-muutoksia="onkoJulkaisemattomiaMuutoksia"
            :julkaistava="!isPohja"
            :is-validating="isValidating"
            tyyppi="opetussuunnitelma"
            @aseta-valmiiksi="valmistaPohja"
            @palauta="palauta"
            @validoi="validoi"
          />
        </div>
        <div class="info">
          <h1>
            <span>{{ $kaanna(ops?.nimi) }}</span>
            <span
              v-if="isPohja"
              class="ml-2"
            >({{ $t('pohja') }})</span>
          </h1>
          <div>
            <span v-if="koulutustyyppi">{{ $t(koulutustyyppi) }}</span>
            <span
              v-if="koulutustyyppi"
              class="ml-2 mr-2"
            >|</span>
            <span>{{ ops?.perusteenDiaarinumero }}</span>
            <span class="ml-2 mr-2">|</span>

            <b-dropdown
              class="asetukset"
              size="sm"
              no-caret
              variant="transparent"
            >
              <template #button-content>
                <span>{{ $t('lisatoiminnot') }}</span>
                <EpMaterialIcon
                  icon-shape="outlined"
                  class="hallinta"
                  size="22px"
                >
                  expand_more
                </EpMaterialIcon>
              </template>

              <b-dropdown-item :to="{ name: 'opsTiedot' }">
                <EpMaterialIcon
                  class="mr-2"
                  icon-shape="outlined"
                >
                  info
                </EpMaterialIcon>
                <span class="dropdown-text">{{ isPohja ? $t('pohja-tiedot') : $t('tiedot') }}</span>
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'opsDokumentti' }">
                <EpMaterialIcon
                  class="mr-2"
                  icon-shape="outlined"
                >
                  picture_as_pdf
                </EpMaterialIcon>
                <span class="dropdown-text">{{ $t('luo-pdf') }}</span>
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'opsKasitteet' }">
                <EpMaterialIcon
                  class="mr-2"
                  icon-shape="outlined"
                >
                  book
                </EpMaterialIcon>
                <span class="dropdown-text">{{ $t('kasitteet') }}</span>
              </b-dropdown-item>
              <b-dropdown-item
                v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
                :to="{ name: 'opsPoistetut' }"
              >
                <EpMaterialIcon
                  class="mr-2"
                  icon-shape="outlined"
                >
                  delete
                </EpMaterialIcon>
                <span class="dropdown-text">{{ $t('poistetut') }}</span>
              </b-dropdown-item>
              <b-dropdown-divider
                v-if="ops?.tila !== 'poistettu'"
                v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
              />
              <b-dropdown-item
                v-if="ops?.tila !== 'poistettu'"
                v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }"
                @click="arkistoiOps"
              >
                <EpMaterialIcon
                  class="mr-2"
                  icon-shape="outlined"
                >
                  archive
                </EpMaterialIcon>
                <span class="dropdown-text">{{ $t('arkistoi-' + tyyppi) }}</span>
              </b-dropdown-item>
            </b-dropdown>
          </div>
        </div>
      </div>
      <div class="lower">
        <ep-sidebar>
          <template #bar>
            <div class="m-3 ml-4 mr-4">
              <EpSearch v-model="query" />
            </div>

            <EpSpinner v-if="!navigationValue || !naviStore" />
            <div
              v-else
              class="navigation"
            >
              <EpTreeNavibar
                :store="naviStore as any"
                :query="query"
              >
                <template #header>
                  <div class="heading">
                    <router-link
                      :to="{ name: 'yleisnakyma' }"
                    >
                      {{ $t('yleisnakyma') }}
                    </router-link>
                  </div>
                </template>

                <template #viite="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'tekstikappale', params: { osaId: String(item.id) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-tekstikappale') }}
                  </EpNavigationLabel>
                </template>

                <template #liite="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'tekstikappale', params: { osaId: String(item.id) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-tekstikappale') }}
                    <EpMaterialIcon size="16px">attach_file</EpMaterialIcon>
                  </EpNavigationLabel>
                </template>

                <template #tiedot="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'opsTiedot' }"
                    :node="item"
                  >
                    {{ $t('tiedot') }}
                  </EpNavigationLabel>
                </template>

                <template #oppiaineet="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'oppiaineet' }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('oppiaineet') }}
                  </EpNavigationLabel>
                </template>

                <template #oppiaine="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'oppiaine', params: { oppiaineId: String(item.id) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-oppiaine') }}
                  </EpNavigationLabel>
                </template>

                <template #poppiaine="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'paikallinenOppiaine', params: { paikallinenOppiaineId: String(item.id) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-oppiaine') }}
                  </EpNavigationLabel>
                </template>

                <template #moduuli="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'moduuli', params: { moduuliId: String(item.id), oppiaineId: String(item.meta?.oppiaine) } }"
                    :node="item"
                  >
                    <ep-color-indicator
                      :kind="item.meta?.pakollinen ? 'pakollinen': 'valinnainen'"
                    />
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-moduuli') }}
                  </EpNavigationLabel>
                </template>

                <template #opintojakso="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'opintojakso', params: { opintojaksoId: String(item.id) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-opintojakso') }}
                  </EpNavigationLabel>
                </template>

                <template #vuosiluokkakokonaisuus="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'vuosiluokkakokonaisuus', params: { vlkId: String(item.id) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-vuosiluokkakokonaisuus') }}
                  </EpNavigationLabel>
                </template>

                <template #perusopetusoppiaine="{ item }">
                  <EpNavigationLabel
                    :to="{ name: item.meta?.paikallinen ? 'perusopetuspaikallinenoppiaine' : 'perusopetusoppiaine', params: { oppiaineId: String(item.id), vlkId: String(item.meta?.vlkId) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-oppiaine') }}
                  </EpNavigationLabel>
                </template>

                <template #perusopetuspaikallinenoppiaine="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'perusopetuspaikallinenoppiaine', params: { oppiaineId: String(item.id), vlkId: String(item.meta?.vlkId) } }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('nimetön-oppiaine') }}
                  </EpNavigationLabel>
                </template>

                <template #oppiaineenvuosiluokka="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'perusopetusoppiainevuosiluokka', params: { oppiaineId: String(item.meta?.['oppiaine-id']), vlkId: String(item.meta?.vlkId), vlId: String(item.meta?.vlId) } }"
                    :node="item"
                  >
                    {{ $t('vuosiluokka') }} {{ $kaannaOlioTaiTeksti(item.meta.vuosiluokka) }}
                  </EpNavigationLabel>
                </template>

                <template #valinnaisetoppiaineet="{ item }">
                  <EpNavigationLabel
                    :to="{ name: 'perusopetusvalinnaiset' }"
                    :node="item"
                  >
                    {{ $kaannaOlioTaiTeksti(item.label) || $t('valinnaiset-oppiaineet') }}
                  </EpNavigationLabel>
                </template>

                <template #uusi_opintojakso="{ item }">
                  <div class="new-link-item">
                    <router-link
                      :to="{
                        name: 'uusi-opintojakso',
                        params: { opintojaksoId: 'uusi', oppiaineKoodi: item.meta?.koodi },
                        query: {
                          oppiaineet: item.meta?.koodi,
                        },
                      }"
                    >
                      <EpMaterialIcon>add</EpMaterialIcon>
                      {{ $t('luo-uusi-opintojakso') }}
                    </router-link>
                  </div>
                </template>

                <template #uusi_paikallinen_oppiaine="{ item }">
                  <div class="new-link-item">
                    <router-link
                      :to="{
                        name: 'uusi-paikallinen-oppiaine',
                        params: {
                          paikallinenOppiaineId: 'uusi',
                          oppiaineKoodi: item.meta?.koodi,
                        },
                        query: {
                          oppiaine: item.meta?.koodi,
                        },
                      }"
                    >
                      <EpMaterialIcon>add</EpMaterialIcon>
                      {{ $t('luo-uusi-paikallinen-oppiaine') }}
                    </router-link>
                  </div>
                </template>

                <template #uusi_oppimaara="{ item }">
                  <ep-oppimaara-lisays
                    :opetussuunnitelma-store="store"
                    :oppiaine-id="item.meta?.['oppiaine-id']"
                  />
                </template>

                <template #uusi_tekstikappale="{ item }">
                  <EpTekstikappaleLisays
                    :opetussuunnitelma-store="store"
                    :tekstikappaleet="tekstikappaleet"
                    :parent-tekstikappale-id="item.meta?.['parent-tekstikappale-id']"
                  />
                </template>
              </EpTreeNavibar>
            </div>
          </template>

          <template #view>
            <transition
              name="fade"
              mode="out-in"
            >
              <router-view :key="route.fullPath" />
            </transition>
          </template>

          <template #bottom>
            <div
              v-if="!isPohja"
              class="m-2 ml-4"
            >
              <router-link
                v-oikeustarkastelu="{ oikeus: 'muokkaus', kohde: 'opetussuunnitelma' }"
                :to="{ name: 'jarjesta' }"
              >
                <span class="text-nowrap">
                  <EpMaterialIcon
                    icon-shape="outlined"
                    class="icon"
                  >reorder</EpMaterialIcon>
                  <a class="btn btn-link btn-link-nav">{{ $t('muokkaa-jarjestysta') }}</a>
                </span>
              </router-link>
            </div>
          </template>
        </ep-sidebar>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, provide, watch, unref, onMounted, onBeforeUnmount, shallowRef } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import { nextTick } from 'vue';
import { OpetussuunnitelmaKevytDtoTilaEnum } from '@shared/api/ylops';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSidebar from '@shared/components/EpSidebar/EpSidebar.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpTreeNavibar from '@shared/components/EpTreeNavibar/EpTreeNavibar.vue';
import EpNavigationLabel from '@shared/components/EpTreeNavibar/EpNavigationLabel.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpTekstikappaleLisays from '@/components/EpTekstikappaleLisays/EpTekstikappaleLisays.vue';
import { EpTreeNavibarStore } from '@shared/components/EpTreeNavibar/EpTreeNavibarStore';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import { themes } from '@shared/utils/perusteet';
import { LinkkiHandler, routeToNode } from '@/utils/routing';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $success, $fail, $t, $kaanna, $kaannaOlioTaiTeksti, $bvModal, $vahvista } from '@shared/utils/globals';
import { createKuvaHandler } from '@shared/components/EpContent/KuvaHandler';
import { TermitStore } from '@/stores/TermitStore';
import { KuvaStore } from '@/stores/KuvaStore';
import { createKasiteHandler } from '@shared/components/EpContent/KasiteHandler';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpOppimaaraLisays from '@/components/EpOppimaaraLisays/EpOppimaaraLisays.vue';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
  termitStore: TermitStore;
}>();

// Router
const router = useRouter();
const route = useRoute();

// Computed properties from store
const store = computed(() => props.opetussuunnitelmaStore);
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const isPohja = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.tyyppi as string === 'pohja');
// Reactive data
/** shallowRef: class instance must not be made deeply reactive */
const naviStore = shallowRef<EpTreeNavibarStore | null>(null);
const query = ref('');
const isValidating = ref(false);

// Computed properties
const koulutustyyppi = computed(() => {
  return ops.value?.koulutustyyppi;
});

const tyyppi = computed(() => {
  return isPohja.value ? 'pohja' : 'opetussuunnitelma';
});

const headerStyle = computed(() => {
  if (ops.value?.koulutustyyppi) {
    return koulutustyyppiBanner(ops.value?.koulutustyyppi);
  }
  return '';
});

const headerClass = computed(() => {
  if (ops.value?.koulutustyyppi && themes[ops.value?.koulutustyyppi] !== 'lukiokoulutus') {
    return 'light';
  }
  return 'dark';
});

const tila = computed(() => {
  if (julkaisut.value) {
    if (isJulkaistu.value) {
      return _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.JULKAISTU);
    }
    return _.toLower(ops.value?.tila);
  }
  return undefined;
});

const isLuonnos = computed(() => {
  return tila.value === _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.LUONNOS);
});

const isJulkaistu = computed(() => {
  return (_.size(julkaisut.value) > 0 || ops.value?.tila === _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.JULKAISTU)) && !isArkistoitu.value;
});

const isArkistoitu = computed(() => {
  return ops.value?.tila === _.toLower(OpetussuunnitelmaKevytDtoTilaEnum.POISTETTU);
});

const julkaisut = computed(() => {
  return store.value.julkaisut.value;
});

const validoinnit = computed(() => {
  if (store.value.validointi.value) {
    return {
      virheet: _.chain(store.value.validointi.value)
        .map('virheet')
        .flatMap()
        .map('kuvaus')
        .value(),
      huomautukset: _.chain(store.value.validointi.value)
        .map('huomautukset')
        .flatMap()
        .map('kuvaus')
        .value(),
    };
  }
  return undefined;
});

const onkoJulkaisemattomiaMuutoksia = computed(() => {
  return store.value.julkaisemattomiaMuutoksia.value;
});

const arkistoituTyyppiTeksti = computed(() => {
  if (tyyppi.value === 'pohja') {
    return 'voit-palauttaa-arkistoidun-pohjan-luonnostilaan';
  }
  return 'voit-palauttaa-arkistoidun-opetussuunnitelman-luonnostilaan';
});

// Methods
const arkistoiOps = async () => {
  if (await $vahvista('arkistoi-' + tyyppi.value, 'arkistoi-kuvaus-' + tyyppi.value)) {
    await store.value.updateTila('poistettu');
    $success($t('tilan-vaihto-poistettu-onnistui'));
    router.push({
      name: tyyppi.value + 'Listaus',
    });
  }
};

const palauta = async () => {
  if (await $vahvista('palauta-' + tyyppi.value, 'palauta-' + tyyppi.value + '-vahvistus')) {
    await store.value.updateTila('luonnos');
    $success($t('tilan-vaihto-luonnos-onnistui'));
  }
};

const valmistaPohja = async () => {
  const valmista = await $bvModal.msgBoxConfirm($t('pohja-valmis-varmistus'), {
    title: $t('aseta-pohja-valmiiksi'),
    okVariant: 'primary',
    okTitle: $t('aseta-valmiiksi'),
    cancelVariant: 'link',
    cancelTitle: $t('peruuta'),
    centered: true,
  });

  if (valmista) {
    try {
      await store.value.updateTila('valmis');
      await nextTick();
      $success($t('tilan-vaihto-valmis-onnistui'));
    }
    catch (err) {
      $fail($t('tilan-vaihto-valmis-epaonnistui'));
    }
  }
};

const validoi = async () => {
  isValidating.value = true;
  await store.value.updateValidation();
  isValidating.value = false;
};


const navigationValue = computed(() => store.value.navigation.value);

onMounted(() => {
  naviStore.value = new EpTreeNavibarStore(store.value.navigation as any, routeToNode);
});

onBeforeUnmount(() => {
  naviStore.value = null;
});

watch(
  () => navigationValue.value,
  () => {
    naviStore.value?.updateNavigation(store.value.navigation as any);
  },
);

// Tekstikappaleet from navigation tree for the add dialog
const tekstikappaleet = computed(() => {
  const connected = naviStore.value?.connected;
  if (!connected) return [];
  return _.chain(unref(connected))
    .filter(node => node.type === 'viite')
    .map(node => ({
      item: {
        prefix: node.chapter,
        objref: { nimi: node.label },
      },
      route: {
        name: 'tekstikappale',
        params: { osaId: String(node.id) },
      },
    }))
    .value() as any[];
});

// Provide reactive values
provide('navigation', navigationValue);
provide('linkkiHandler', new LinkkiHandler());
provide('kasiteHandler', createKasiteHandler(props.termitStore));
provide('kuvaHandler', createKuvaHandler(new KuvaStore(_.toNumber(route.params.id))));

</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

:deep(.btn-sm) {
  padding: 0 0 3px 0 !important;
  font-size: 1rem;
  font-weight: 600;
  color: inherit;
}

:deep(.btn:focus) {
  box-shadow: unset;
}

.navigation {
  height: calc(100% - 145px);
}

.bottom-menu-item {
  margin-left: 20px;
  margin-bottom: 10px;
}

.icon {
  vertical-align: middle;
}

.btn-link-nav {
  text-decoration: none;
}

.center-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -50px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}

.dropdown-text {
  vertical-align: text-top;
}

.opetussuunnitelma {
  background: white;
  &.light {
    .header, .progress-chart {
      color: $color-ops-header-black-text;
    }
  }

  .header {
    color: $color-ops-header-text;
    background-position: 100% -56px;
    background-repeat: no-repeat;
    height: 190px;
    @media only screen and (min-width: 2503px)  {
      background-size: 100%;
    }

    display: flex;
    align-items: center;

    h1 :deep(button) {
      color: inherit;
    }

    .progress-chart {
      width: $sidebar-width;
      height: 150px;

      @media only screen and (max-width: 1024px) {
        display: none;
      }
    }

    .progress-chart > div {
      width: 100%;
      margin: 0 auto;
    }

    .info {
      padding-left: 15px;

      @media only screen and (max-width: 768px) {
        padding-left: 30px;
      }
    }
  }
}

table.category-table {
  width: 100%;

  .arvot {
    font-size: 70%;
    color: #777;
  }
}
</style>
