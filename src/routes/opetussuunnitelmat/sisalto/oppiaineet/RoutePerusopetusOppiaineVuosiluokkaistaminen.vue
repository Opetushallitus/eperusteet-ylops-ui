<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi :store="editointiStore">
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.oppiaine.nimi) }}: {{ $t('vuosiluokkaista-tavoitteet') }}
        </h2>
      </template>
      <template #default="{ data }">
        <div class="m-3">
          {{ $t('lisaa-tavoitteet-vuosiluokille') }}
        </div>

        <b-container class="vuosiluokkaistaminen">
          <b-row>
            <b-col
              cols="6"
              class="pl-0 tavoitesisallot"
            >
              <div class="d-flex justify-content-between align-items-center">
                <h3>{{ $t('tavoitteet-ja-sisallot') }}</h3>
                <ep-button
                  variant="link"
                  @click="suljeAvaaKaikki()"
                >
                  {{ $t('avaa-sulje-kaikki') }}
                </ep-button>
              </div>

              <VueDraggable
                v-bind="tavoitteetOptions"
                v-model="data.perusteenOppiaineenVlk.tavoitteet"
                class="sisalto"
                tag="div"
              >
                <div
                  v-for="(tavoite, index) in tavoitteet"
                  :key="'tavoite'+index"
                  class="tavoite d-flex"
                  :class="{'valittu': tavoite.valittu}"
                >
                  <EpMaterialIcon class="raahaus">
                    drag_indicator
                  </EpMaterialIcon>
                  <ep-collapse
                    ref="sisaltocollapse"
                    class="flex-grow-1"
                    :border-bottom="false"
                    :border-top="false"
                  >
                    <template #header>
                      <h4 v-html="$kaanna(tavoite.tavoite)" />
                    </template>
                    <div class="row">
                      <div class="col-7">
                        <div
                          v-for="(sisaltoalue, index) in tavoite.sisaltoalueet"
                          :key="'sisaltoalue'+index"
                          class="sisaltoalue"
                        >
                          {{ $kaanna(data.sisaltoalueetMap[sisaltoalue].nimi) }}
                        </div>
                      </div>

                      <div class="col-5 align-self-end text-right kohdealueet">
                        <div
                          v-for="(kohdealue, index) in tavoite.kohdealueet"
                          :key="'kohdealue'+index"
                          class="kohdealue"
                        >
                          <ep-order-color-ball
                            class="pr-2"
                            :index="kohdealue.index"
                          />
                          {{ $kaanna(kohdealue.nimi) }}
                        </div>
                      </div>
                    </div>
                  </ep-collapse>
                </div>
              </VueDraggable>
            </b-col>

            <b-col cols="6">
              <h3> {{ $t('vuosiluokat') }}</h3>

              <div
                v-for="(vuosiluokka, index) in data.vuosiluokat"
                :key="'vuosiluokka'+index"
                class="vuosiluokka"
              >
                <div class="d-flex justify-content-between align-items-center otsikko">
                  <h4 class="flex-grow">
                    {{ $t('vuosiluokka') }} {{ $t(vuosiluokka.vuosiluokka) }}
                  </h4>
                  <div class="text-right">
                    <ep-button
                      class="tuokaikki"
                      variant="link"
                      icon="add"
                      @click="lisaaKaikkiTavoitteet(vuosiluokka)"
                    >
                      {{ $t('tuo-kaikki') }}
                    </ep-button>
                    <ep-button
                      :disabled="vuosiluokka.tavoitteet.length === 0"
                      variant="link"
                      icon="delete"
                      @click="poistaKaikkiTavoitteet(vuosiluokka)"
                    >
                      {{ $t('tyhjenna') }}
                    </ep-button>
                  </div>
                </div>

                <VueDraggable
                  v-bind="vuosiluokatOptions"
                  v-model="vuosiluokka.tavoitteet"
                  class="d-flex flex-wrap sisalto"
                  :class="{'tyhja': vuosiluokka.tavoitteet.length === 0}"
                  tag="div"
                >
                  <div
                    v-for="(tavoite, index) in vuosiluokka.tavoitteet"
                    :key="'vlktavoite'+index"
                    class="tavoite"
                    @click="poistaTavoite(vuosiluokka, tavoite)"
                  >
                    <div class="roskalaatikko">
                      <EpMaterialIcon>delete</EpMaterialIcon>
                    </div>
                    <text-clamp
                      class="teksti"
                      :max-lines="4"
                      :text="$plaintext($kaanna(tavoite.tavoite))"
                    />
                  </div>
                </VueDraggable>
              </div>
            </b-col>
          </b-row>
        </b-container>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { VuosiluokkaistaminenStore } from '@/stores/vuosiluokkaistaminenStore';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { VueDraggable } from 'vue-draggable-plus';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOrderColorBall from '@shared/components/EpColorIndicator/EpOrderColorBall.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna, $t } from '@shared/utils/globals';
import TextClamp from 'vue3-text-clamp';

// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Router
const route = useRoute();

// Template refs
const sisaltocollapse = useTemplateRef('sisaltocollapse');

// Use composables
const store = computed(() => props.opetussuunnitelmaStore);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
// Reactive data
const editointiStore = ref<EditointiStore | null>(null);
const avaaSulje = ref(true);

// Computed properties
const defaultOptions = computed(() => {
  return {
    animation: 300,
    emptyInsertThreshold: 10,
    group: {
      name: 'tavoitteet',
    },
    disabled: false,
    forceFallback: true,
    sort: false,
  };
});

const tavoitteetOptions = computed(() => {
  return {
    ...defaultOptions.value,
    group: {
      ...defaultOptions.value.group,
      pull: 'clone',
      put: false,
      revertClone: true,
    },
  };
});

const vuosiluokatOptions = computed(() => {
  return {
    ...defaultOptions.value,
    draggable: false,
    emptyInsertThreshold: 0,
  };
});

const valitutTavoitteet = computed(() => {
  return _.chain(editointiStore.value?.data.vuosiluokat)
    .map('tavoitteet')
    .flatten()
    .map('tunniste')
    .value();
});

const tavoitteet = computed(() => {
  return _.map(editointiStore.value?.data?.perusteenOppiaineenVlk.tavoitteet || [], tavoite => {
    return {
      ...tavoite,
      valittu: _.includes(valitutTavoitteet.value, tavoite.tunniste),
    };
  });
});

const asettamattomatTavoitteet = computed(() => {
  return _.size(tavoitteet.value) - _.size(_.filter(tavoitteet.value, 'valittu'));
});

// Methods
const lisaaKaikkiTavoitteet = (vuosiluokka: any) => {
  vuosiluokka.tavoitteet = editointiStore.value?.data.perusteenOppiaineenVlk.tavoitteet;
};

const poistaKaikkiTavoitteet = (vuosiluokka: any) => {
  vuosiluokka.tavoitteet = [];
};

const poistaTavoite = (vuosiluokka: any, poistettavaTavoite: any) => {
  vuosiluokka.tavoitteet = _.filter(vuosiluokka.tavoitteet, tavoite => tavoite.tunniste !== poistettavaTavoite.tunniste);
};

const suljeAvaaKaikki = () => {
  avaaSulje.value = !avaaSulje.value;
  if (sisaltocollapse.value) {
    _.forEach(sisaltocollapse.value, (collapse: any) => {
      collapse.toggle(avaaSulje.value);
    });
  }
};

const reset = async () => {
  await store.value.init();
};

const init = async () => {
  editointiStore.value = new EditointiStore(new VuosiluokkaistaminenStore(
    opsId.value, _.toNumber(route.params.vlkId), _.toNumber(route.params.oppiaineId), { reset }, reset));
};

// Watch for asettamattomatTavoitteet changes
watch(asettamattomatTavoitteet, (newVal) => {
  if (editointiStore.value) {
    editointiStore.value.setData({
      ...editointiStore.value.data,
      asettamattomatTavoitteet: newVal,
    });
  }
});

// Lifecycle
onMounted(async () => {
  await init();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .vuosiluokkaistaminen {
    padding-top: 15px;
    background-color: $gray-lighten-5;
    padding-left: 30px;
    user-select: none;

    .tavoitesisallot {

      :deep(.btn) {
          font-size: 0.8rem;
        }

      .sisalto {
        background-color: $white;
        padding: 10px;

        .tavoite {
          border: 1px solid $gray-lighten-3;
          width: 100%;
          margin: 0px 0px 20px 0px;
          padding: 10px;
          font-size: 0.8rem;

          &.valittu {
            background-color: $blue-lighten-7;
          }

          .raahaus {
            margin-top:3px;
            color: $gray-lighten-1;
          }

        }

        .tavoite:hover {
          cursor: pointer;
        }

        .kohdealueet {
          font-size: 0.7rem;
        }

        :deep(.ep-collapse), :deep(.ep-collapse .header) {
          margin: 0;
          padding: 0;
        }
      }
    }

    .vuosiluokka {
      width: 100%;
      background-color: $white;
      margin: 15px 0px;

      .otsikko {
        border-color: $gray-lighten-3;
        border-width: 1px;
        border-bottom-width: 0px;
        border-style: solid;
        margin: 0px;
        padding: 5px 10px 5px 10px;

        h4 {
          margin: 0px;
        }

        .tuokaikki {
          :deep(.btn-link .teksti) {
            color: $black;
          }
        }
      }

      .sisalto {
        border-style: solid;
        border-width: 1px;
        border-color: $gray-lighten-3;

        &.tyhja {
          border-style: dashed;
          color: $gray-lighten-2;
          height: 112px;
          text-align: center;
          width: 100%;
        }

        .tyhja {
          position: absolute;
          padding-top: 40px;
          padding-left: 30%;
        }

        .tavoite {
          border-color: $gray-lighten-3;
          border-style: solid;
          border-width: 1px;
          font-size: 0.8rem;
          margin: 5px;
          padding: 5px;
          height: 100px;
          width: 100px;
          overflow: hidden;

          .roskalaatikko {
            position: relative;
            height: 22px;
            left: 65px;
            color: $blue-lighten-5;

            svg {
              display:none;
            }
          }

          .teksti {
            position: relative;
            top: -20px;
          }
        }
      }

      .tavoite:hover {
        cursor: pointer;

        .teksti {
          opacity: 0.3;
        }

        .roskalaatikko svg {
          display: inline-block;
        }
      }
    }

  }

  :deep(.editointikontrolli .sisalto) {
    padding: 0;
    margin: 0;
  }

  :deep(.container) {
    margin-left: 0;
    margin-right: 0;
    max-width: 100%;
  }

</style>
