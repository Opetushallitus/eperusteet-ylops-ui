<template>
<div>
  <ep-navigation
    tyyli="ops"
    :koulutustyyppi="koulutustyyppi"
    :headerClass="headerClass"
    :sticky="true">
  </ep-navigation>
  <ep-spinner class="center-loading" v-if="!ops"/>
  <div class="opetussuunnitelma" :class="headerClass" v-else>
    <div class="header" :style="headerStyle">
      <div class="progress-chart">
        <EpValidPopover
            :validoitava="ops"
            :validoinnit="validoinnit"
            :julkaisemattomiaMuutoksia="onkoJulkaisemattomiaMuutoksia"
            :julkaistava="!isPohja"
            :is-validating="isValidating"
            @asetaValmiiksi="valmistaPohja"
            @palauta="palauta"
            @validoi="validoi"
            tyyppi="opetussuunnitelma"
          />
      </div>
      <div class="info">
        <h1>
          <span>{{ $kaanna(ops.nimi) }}</span>
          <span class="ml-2" v-if="isPohja">({{ $t('pohja') }})</span>
        </h1>
        <div>
          <span v-if="koulutustyyppi">{{ $t(koulutustyyppi) }}</span>
          <span v-if="koulutustyyppi" class="ml-2 mr-2">|</span>
          <span>{{ ops.perusteenDiaarinumero }}</span>
          <span class="ml-2 mr-2">|</span>

          <b-dropdown class="asetukset" size="sm" no-caret variant="transparent">
            <template v-slot:button-content>
              <span>{{$t('lisatoiminnot')}}</span>
              <EpMaterialIcon icon-shape="outlined" class="hallinta" size="22px">expand_more</EpMaterialIcon>
            </template>

            <b-dropdown-item :to="{ name: 'opsTiedot' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">info</EpMaterialIcon>
              <span class="dropdown-text">{{ isPohja ? $t('pohja-tiedot') : $t('tiedot') }}</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'opsDokumentti' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">picture_as_pdf</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('luo-pdf') }}</span>
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'opsKasitteet' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">book</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('kasitteet') }}</span>
            </b-dropdown-item>
            <b-dropdown-item v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" :to="{ name: 'opsPoistetut' }">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">delete</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('poistetut') }}</span>
            </b-dropdown-item>
            <b-dropdown-divider v-if="ops.tila !== 'poistettu'"
                                v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" />
            <b-dropdown-item v-if="ops.tila !== 'poistettu'"
                             v-oikeustarkastelu="{ oikeus: 'hallinta', kohde: isPohja ? 'pohja' : 'opetussuunnitelma' }" @click="arkistoiOps">
              <EpMaterialIcon class="mr-2" icon-shape="outlined">archive</EpMaterialIcon>
              <span class="dropdown-text">{{ $t('arkistoi-' + tyyppi) }}</span>
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
    <div class="lower">
      <ep-sidebar>
        <template #bar>
          <ops-sidenav
            :opetussuunnitelma-store="store"
            :key="$route.fullPath"
            v-model="valikkoData"/>
        </template>
        <template #view>
          <transition name="fade" mode="out-in">
            <!-- ep-comment-threads-->
            <router-view :key="$route.fullPath" />
          </transition>
        </template>
      </ep-sidebar>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, ref, provide, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import _ from 'lodash';
import { OpetussuunnitelmaKevytDtoTilaEnum } from '@shared/api/ylops';
import EpNavigation from '@/components/EpNavigation/EpNavigation.vue';
import EpSidebar from '@/components/EpSidebar/EpSidebar.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import OpsSidenav from '@/components/OpsSidenav/OpsSidenav.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpValidPopover from '@shared/components/EpValidPopover/EpValidPopover.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { koulutustyyppiBanner } from '@shared/utils/bannerIcons';
import { themes } from '@shared/utils/perusteet';
import { LinkkiHandler, routeToNode } from '@/utils/routing';
import { Kielet } from '@shared/stores/kieli';
import { KommenttiKahvaDtoKieliEnum } from '@shared/generated/ylops';
import { Kommentit } from '@/stores/kommentit';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { useEpOpsRoute } from '@/mixins/EpOpsRoute';
import { $success, $fail, $t, $kaanna, $bvModal, $vahvista } from '@shared/utils/globals';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Router
const router = useRouter();

// Use the composable
const {
  store,
  ops,
  opsId,
  isPohja,
  isOps,
  isValmisPohja,
  kasiteHandler,
  kuvaHandler,
  isLuva,
  breadcrumb,
} = useEpOpsRoute(props.opetussuunnitelmaStore);
// Reactive data
const valikkoData = ref<any | null>(null);
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
    return koulutustyyppiBanner(ops.value.koulutustyyppi);
  }
  return '';
});

const headerClass = computed(() => {
  if (ops.value?.koulutustyyppi && themes[ops.value.koulutustyyppi] !== 'lukiokoulutus') {
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
  return store.value.julkaisut;
});

const validoinnit = computed(() => {
  if (store.value.validointi) {
    return {
      virheet: _.chain(store.value.validointi)
        .map('virheet')
        .flatMap()
        .map('kuvaus')
        .value(),
      huomautukset: _.chain(store.value.validointi)
        .map('huomautukset')
        .flatMap()
        .map('kuvaus')
        .value(),
    };
  }
  return undefined;
});

const onkoJulkaisemattomiaMuutoksia = computed(() => {
  return store.value.julkaisemattomiaMuutoksia;
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

// Navigation helper
const navigationToNode = (items: any[]): any[] => {
  return _.chain(items)
    .filter(item => !!item.item.objref?.nimi || !!item.item.i18key)
    .map(item => {
      return {
        label: item.item.objref?.nimi || { [Kielet.getUiKieli.value]: _.isArray(item.item.i18key) ? _.join(_.map(item.item.i18key, key => $t(key)), ', ') : $t(item.item.i18key) },
        children: navigationToNode(item.children),
        ...routeToNode(item.route),
      };
    })
    .value();
};

// Navigation computed
const navigation = computed(() => {
  return {
    type: 'root',
    children: navigationToNode(valikkoData.value),
  };
});

// Provide reactive values
provide('navigation', navigation);
provide('linkkiHandler', new LinkkiHandler());
provide('kommenttiHandler', Kommentit);

// Lifecycle
const init = async () => {
  await store.value.init();

  if (store.value.opetussuunnitelma?.nimi) {
    breadcrumb('opetussuunnitelma', store.value.opetussuunnitelma.nimi, { name: 'yleisnakyma' });
  }
};

onMounted(async () => {
  await init();
});
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
