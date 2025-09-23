<template>
<div id="scroll-anchor" class="content">
  <div v-if="editointiStore">
    <ep-editointi :store="editointiStore"
                  :versionumero="versionumero"
                  type="paikallinen-oppiaine">
      <template #muokkaa-content v-if="tuotuOppimaara">
        <div class="muokkaus-esto align-self-center">
          {{$t('et-voi-muokata-pohjan-oppimaaraa')}}
          <div class="d-inline">
            <b-button @click="remove()" variant="link" id="muokkaus-esto">
              {{ $t('poista-oppimaara') }}
            </b-button>
          </div>
        </div>
      </template>
      <template #header="{ data }">
        <h2>{{ $kaanna(data.nimi) }}</h2>
      </template>
      <template #ohje>
        <div class="sidepad">
          <p>{{ $t('ohje-paikallinen-oppiaine') }}</p>
        </div>
      </template>
      <template #keskustelu>
        <ep-comment-threads />
      </template>
    <template #default="{ data, validation, isEditing, supportData }">
      <div class="content">
        <b-row v-if="isEditing">
          <b-col>
            <ep-form-content :name="data.perusteenOppiaineUri ? 'oppimaara-nimi-ohje' : 'oppiaine-nimi-ohje'">
              <ep-field v-model="data.nimi" :is-header="true" :validation="validation.nimi" :is-editing="isEditing">
              </ep-field>
            </ep-form-content>
          </b-col>
           <b-col />
        </b-row>
        <b-row>
          <b-col v-if="isEditing || data.perusteenOppiaineUri">
            <ep-form-content name="oppiainekoodi">
              <ep-oppiaine-selector
                v-model="data.perusteenOppiaineUri"
                :opetussuunnitelma-store="store"
                :is-editable="isEditing"
                :multiple="false"
                :allow-oppiaine="true"
                :oppiaine-filter="oppiaineFilter" />
            </ep-form-content>
          </b-col>
          <b-col>
            <ep-form-content>
              <div class="d-flex">
                <label class="mr-1">{{$t('koodi')}}</label>
                <EpInfoPopover v-if="isEditing">
                  <div v-html="$t('koodiohje')"></div>
                </EpInfoPopover>
              </div>
              <ep-field v-model="data.koodi" :validation="validation.koodi" type="string" :is-editing="isEditing" />
            </ep-form-content>
          </b-col>
        </b-row>
        <div>
          <ep-collapse tyyppi="tehtava" :first="true">
            <template #header>
              <h3 class="header">{{ $t('tehtava') }}</h3>
            </template>
            <ep-content v-if="oppimaara && oppimaara.tehtava" layout="normal" v-model="oppimaara.tehtava.kuvaus"> </ep-content>

            <h4>{{ $t('paikallinen-lisays-tehtavalle') }}</h4>
            <ep-content :opetussuunnitelma-store="store" v-model="data.tehtava.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>
          </ep-collapse>

          <ep-collapse tyyppi="tavoitteet">
            <template #header>
              <h3 class="header">{{ $t('tavoitteet') }}</h3>
            </template>
            <ep-content v-if="oppimaara && oppimaara.tavoitteet && oppimaara.tavoitteet.kuvaus" v-model="oppimaara.tavoitteet.kuvaus" :is-editable="false" layout="normal"> </ep-content>
            <div class="tavoitealueet" v-if="oppimaara && oppimaara.tavoitteet">
              <ep-prefix-list v-model="oppimaara.tavoitteet.tavoitealueet" arvot="tavoitteet" :is-editable="false"></ep-prefix-list>
            </div>

            <h4>{{ $t('paikallinen-lisays-tavoitteet') }}</h4>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              v-model="data.tavoitteet.kuvaus"
              :is-editable="isEditing"
              layout="normal"> </ep-content>
            <div class="tavoitealueet">
              <ep-prefix-list v-model="data.tavoitteet.tavoitealueet" arvot="tavoitteet" arvo="tavoite" :is-editable="isEditing"></ep-prefix-list>
            </div>
          </ep-collapse>

          <ep-collapse tyyppi="arviointi">
            <template #header>
              <h3 class="header">{{ $t('osaamisen-arviointi') }}</h3>
            </template>
            <ep-content v-if="oppimaara && oppimaara.arviointi" layout="normal" v-model="oppimaara.arviointi.kuvaus"> </ep-content>

            <h4>{{ $t('paikallinen-lisays-osaamisen-arvioinnille') }}</h4>
            <ep-content
              :kasiteHandler="kasiteHandler"
              :kuvaHandler="kuvaHandler"
              v-model="data.arviointi.kuvaus"
              :is-editable="isEditing"
              layout="normal"> </ep-content>
          </ep-collapse>

          <ep-collapse tyyppi="opiskeluymparistoTyotavat" v-if="isLuva">
            <template #header>
              <h3 class="header">{{ $t('opiskeluymparisto-ja-tyotavat') }}</h3>
            </template>
            <ep-content v-if="oppimaara && oppimaara.opiskeluymparistoTyotavat" v-model="oppimaara.opiskeluymparistoTyotavat.kuvaus" :is-editable="false" layout="normal"> </ep-content>

            <h4>{{ $t('paikallinen-lisays-opiskeluymparisto-ja-tyotavat') }}</h4>
            <ep-content :opetussuunnitelma-store="store" v-model="data.opiskeluymparistoTyotavat.kuvaus" :is-editable="isEditing" layout="normal"> </ep-content>

          </ep-collapse>

          <ep-collapse tyyppi="laajaAlainenOsaaminen" v-else>
            <template #header>
              <h3 class="header">{{ $t('laaja-alaiset-sisallot') }}</h3>
            </template>
            <ep-content v-if="oppimaara && oppimaara.laajaAlaisetOsaamiset" v-model="oppimaara.laajaAlaisetOsaamiset.kuvaus" :is-editable="false" layout="normal"> </ep-content>

            <laaja-alaiset-osaamiset
              v-model="data.laajaAlainenOsaaminen"
              :koodit="supportData.laajaAlaisetKoodit"
              :nimi="'lisaa-laaja-alainen-osaaminen'"
              :is-editable="isEditing" />
          </ep-collapse>

          <div v-if="!isEditing">
            <h3 class="header">{{ $t('opintojaksot') }}</h3>
            <div class="block-container mb-2" v-for="opintojakso in opintojaksot" :key="opintojakso.id">
              <div class="oj-content">
                <span class="nimi">
                  <router-link :to="{ name: 'opintojakso', params: { opintojaksoId: opintojakso.id } }">
                    <span class="mr-2">{{ $kaanna(opintojakso.nimi) }}</span>
                    <span v-if="opintojakso.koodi">({{ opintojakso.koodi }})</span>
                  </router-link>
                </span>
                <span class="pituus">{{ opintojakso.laajuus }} {{ $t('opintopiste') }}</span>
              </div>
            </div>
            <ep-button class="mt-2"
                       v-if="!isUusi()"
                       icon="add"
                       @click="uusiOpintojakso()">{{ $t('uusi-opintojakso') }}</ep-button>
          </div>
        </div>
      </div>
    </template>
    </ep-editointi>
  </div>
</div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import _ from 'lodash';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpColorIndicator from '@shared/components/EpColorIndicator/EpColorIndicator.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpOppiaineSelector from '@/components/EpOppiaineSelector/EpOppiaineSelector.vue';
import EpPrefixList from '@/components/EpPrefixList/EpPrefixList.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import LaajaAlaisetOsaamiset from '@/routes/opetussuunnitelmat/sisalto/yhteiset/LaajaAlaisetOsaamiset.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import EpInfoPopover from '@shared/components/EpInfoPopover/EpInfoPopover.vue';
import { Lops2019PaikallinenOppiaineDto, Opetussuunnitelmat } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import { KoodistoLops2019LaajaAlaiset, paikallisestiSallitutLaajennokset } from '@/utils/perusteet';
import { PerusteCache } from '@/stores/peruste';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { LopsPaikallinenOppiaineStore } from '@/stores/lopsPaikallinenOppiaineStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { useEpRoute } from '@/mixins/EpRoute';
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { $kaanna } from '@shared/utils/globals';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Router
const route = useRoute();
const router = useRouter();

// Use composables
const epRoute = useEpRoute();
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
} = useEpOpsComponent(props.opetussuunnitelmaStore);
// Reactive data
const perusteCache = ref<PerusteCache | null>(null);
const editointiStore = ref<EditointiStore | null>(null);

// Computed properties
const editable = computed(() => {
  return editointiStore.value?.data.value;
});

const isLoading = computed(() => {
  return editointiStore.value?.isLoading?.value || false;
});

const versionumero = computed(() => {
  return _.parseInt(_.get(route, 'query.versionumero') as any);
});

// Methods
const init = async () => {
  perusteCache.value = await PerusteCache.of(opsId.value);
};

// Lifecycle
onMounted(async () => {
  await init();

  editointiStore.value = new EditointiStore(new LopsPaikallinenOppiaineStore(
    opsId.value,
    route.params.paikallinenOppiaineId as string,
    versionumero.value,
    store.value,
    route.params.paikallinenOppiaineId === 'uusi',
    _.get(route, 'query.oppiaine') as string,
  ));
});

const remove = async () => {
  return editointiStore.value?.remove();
};

const isUusi = () => {
  return route.params.paikallinenOppiaineId === 'uusi';
};

const tuotuOppimaara = computed(() => {
  const supportData = editointiStore.value?.supportData?.value;
  return supportData?.tuotuOppimaara || false;
});

const opintojaksot = computed(() => {
  if (!editable.value?.koodi) {
    return [];
  }
  return _.chain(store.value.opintojaksot as any)
    .filter(oj => {
      return !!_(oj.oppiaineet)
        .map('koodi')
        .filter(koodi => koodi === editable.value!.koodi)
        .first();
    })
    .sortBy('koodi')
    .value();
});

const uusiOpintojakso = () => {
  router.push({
    name: 'opintojakso',
    params: {
      ...route.params,
      opintojaksoId: 'uusi',
    },
    query: {
      oppiaineet: editable.value?.koodi,
    },
  });
};

const oppimaara = computed(() => {
  if (editable.value?.perusteenOppiaineUri && perusteCache.value) {
    return _.chain(perusteCache.value.peruste.oppiaineet)
      .map(oppiaine => {
        return [
          oppiaine,
          ...oppiaine.oppimaarat,
        ];
      })
      .flatMap()
      .filter(oppiaineTaiOppimaara => oppiaineTaiOppimaara.koodi.uri === editable.value!.perusteenOppiaineUri)
      .head()
      .value();
  }
  return undefined;
});

const oppiaineFilter = (oppiaine: any) => {
  return _.some(paikallisestiSallitutLaajennokset(), (laajennos) =>
    _.startsWith(oppiaine.koodiUri, laajennos));
};
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.content {
  padding: 10px;
}

.tavoitealueet {
  margin-top: 10px;
}

.header {
  user-select: none;
}

.oj-content {
  border-radius: 24px;
  border: 1px solid #CDEEFF;
  padding: 14px 30px;
  display: flex;
  margin-top: 5px;
  margin-bottom: 5px;
  background-color: #E6F6FF;

  span.nimi {
    flex: 1 0 auto;
  }

  span.pituus {
    min-width: 4em;
  }

  span.tyyppi {
    min-width: 6em;
  }
}

.block-container {
}

.muokkaus-esto {
  font-size: 0.8rem;
  color: $gray-lighten-1;

  .lisainfo {
    color: $blue-lighten-5;
    cursor: pointer;
  }
}

</style>
