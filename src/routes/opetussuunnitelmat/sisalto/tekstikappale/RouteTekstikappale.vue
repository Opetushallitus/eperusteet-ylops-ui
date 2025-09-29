<template>
  <div
    id="scroll-anchor"
    class="tekstiviite"
  >
    <div class="kappale">
      <ep-editointi
        :store="tekstikappaleStore"
        :versionumero="versionumero"
      >
        <template #ohje>
          <div class="sidepad">
            <p>{{ $t('ohje-tekstikapale') }}</p>
            <p>{{ $t('ohje-tekstikapale-perusteteksti') }}</p>
          </div>
        </template>
        <template #keskustelu="{ }">
          <ep-comment-threads />
        </template>
        <template #header="{ data }">
          <h2>{{ $kaanna(perusteenTekstikappaleNimi || data.tov.tekstiKappale.nimi) }}</h2>
        </template>
        <template #postHeader="{ data }">
          <span
            v-if="data.tov.piilotettu"
            class="additional-info-text"
          >({{ $t('piilotettu') }})</span>
          <span
            v-if="data.tov.liite"
            class="additional-info-text"
          >({{ $t('liite') }})</span>
        </template>
        <template #default="{ data, isEditing }">
          <div class="teksti">
            <ep-form-content
              v-if="isEditing && !data.tov.perusteTekstikappaleId"
              name="tekstikappale-nimi-ohje"
            >
              <ep-field
                v-if="data.tov.tekstiKappale"
                v-model="data.tov.tekstiKappale.nimi"
                :is-header="true"
                :is-editing="isEditing && !data.tov.perusteTekstikappaleId"
              />
            </ep-form-content>
            <span comment-uuid="data.tov.tekstiKappale.tunniste">
              <div
                v-if="isEditing"
                class="mb-4"
              >
                <ep-toggle v-model="data.tov.liite">{{ $t('nayta-liitteena') }}</ep-toggle>
                <ep-toggle v-model="data.tov.piilotettu">{{ $t('piilota-tekstikappale-julkisesta-opetussuunnitelmasta') }}</ep-toggle>
              </div>
              <div
                v-else-if="data.tov.piilotettu"
                class="disabled-text mb-4"
              >{{ $t('tekstikappale-piilotettu-julkisesta-opetussuunnitelmasta') }}</div>
              <ep-collapse
                v-if="data.perusteenTeksti && data.perusteenTeksti.perusteenOsa"
                tyyppi="perusteteksti"
                :first="isEditing"
                :border-bottom="!isPohja"
              >
                <template #header>
                  <h5>{{ $t('perusteen-teksti') }}</h5>
                </template>

                <template v-if="data.laajaAlaisetOsaamiset">
                  <EpCollapse
                    v-for="(lao, index) in data.laajaAlaisetOsaamiset"
                    :key="'lao' + lao.id"
                    :border-bottom="index < data.laajaAlaisetOsaamiset.length-1"
                  >
                    <template #header>
                      <h3>{{ $kaanna(lao.nimi) }}</h3>
                    </template>
                    <div v-html="$kaanna(lao.kuvaus)" />
                  </EpCollapse>
                </template>

                <ep-content
                  v-else-if="isEditing || data.tov.naytaPerusteenTeksti"
                  v-model="data.perusteenTeksti.perusteenOsa.teksti"
                  layout="normal"
                  :is-editable="false"
                />

                <div
                  v-if="!isEditing && data.perusteenTeksti && data.perusteenTeksti.perusteenOsa && data.perusteenTeksti.perusteenOsa.teksti && !$kaanna(data.perusteenTeksti.perusteenOsa.teksti) && !data.laajaAlaisetOsaamiset"
                  class="font-italic text-secondary"
                >
                  {{ $t('perusteen-sisaltoa-ei-maaritetty') }}
                </div>
                <div v-if="isEditing">
                  <ep-toggle v-model="data.tov.naytaPerusteenTeksti">{{ $t('nayta-perusteen-teksti') }}</ep-toggle>
                </div>
                <div
                  v-if="!isEditing && !data.tov.naytaPerusteenTeksti"
                  class="disabled-text"
                >
                  {{ $t('piilotettu') }}
                </div>
              </ep-collapse>
              <div
                v-if="data.tov.perusteTekstikappaleId && !data.perusteenTeksti"
                class="mb-4"
              >
                <h5>{{ $t('perusteen-teksti') }}</h5>
                <div class="font-italic text-secondary">{{ $t('perusteen-tekstia-ei-loydy') }}</div>
              </div>
              <ep-collapse v-if="data.alkuperaiset && data.alkuperaiset.length > 0">
                <template #header>
                  <h5>
                    {{ $t('pohjan-teksti') }} <span v-if="pohjaNimi">({{ $kaanna(pohjaNimi) }})</span>
                  </h5>
                </template>
                <template v-if="isEditing || data.tov.naytaPohjanTeksti">
                  <ep-content
                    v-for="(alkuperainen, index) in data.alkuperaiset"
                    :key="'alkuperainen'+index"
                    v-model="alkuperainen.tekstiKappale.teksti"
                    layout="normal"
                    :is-editable="false"
                  />
                </template>
                <div
                  v-if="isEditing"
                  class="mb-4"
                >
                  <ep-toggle v-model="data.tov.naytaPohjanTeksti">{{ $t('nayta-pohjan-teksti') }}</ep-toggle>
                </div>
                <div
                  v-if="!isEditing && !data.tov.naytaPohjanTeksti"
                  class="disabled-text"
                >
                  {{ $t('piilotettu') }}
                </div>
              </ep-collapse>

              <template v-if="!isPohja">
                <h5>{{ $t('paikallinen-teksti') }}</h5>
                <ep-content
                  v-model="data.tov.tekstiKappale.teksti"
                  layout="normal"
                  :is-editable="isEditing"
                />
                <ep-alert
                  v-if="!isEditing && !$kaanna(data.tov.tekstiKappale.teksti)"
                  :ops="false"
                  :text="$t('paikallista-sisaltoa-ei-maaritetty')"
                />
              </template>
            </span>
          </div>
        </template>
      </ep-editointi>
    </div>
  </div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpInput from '@shared/components/forms/EpInput.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { Murupolku } from '@/stores/murupolku';
import { TekstikappaleStore } from '@/stores/TekstikappaleStore';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna } from '@shared/utils/globals';
import { createLogger } from '@shared/utils/logger';

const logger = createLogger('RouteTekstikappale');

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

const route = useRoute();
const store = computed(() => props.opetussuunnitelmaStore);
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);

const tekstikappaleStore = ref<EditointiStore | null>(null);

const osaId = computed(() => {
  return _.parseInt(route.params.osaId as string);
});

const versionumero = computed(() => {
  return _.parseInt(route.query.versionumero as string);
});

const fetch = async () => {
  const tkstore = new TekstikappaleStore(opsId.value, osaId.value, store.value, versionumero.value);
  tekstikappaleStore.value = new EditointiStore(tkstore);
};

const tekstikappale = computed(() => {
  return tekstikappaleStore.value?.data?.value || null;
});

const pohjaNimi = computed(() => {
  return ops.value?.pohja?.nimi;
});

const perusteenTekstikappaleNimi = computed(() => {
  return tekstikappaleStore.value?.data?.value?.perusteenTeksti?.perusteenOsa?.nimi;
});

watch(versionumero, async () => {
  await fetch();
}, { immediate: true });

watch(osaId, async (id, oldId) => {
  if (!id || id === oldId) {
    return;
  }
  await fetch();
}, { immediate: true });

watch(tekstikappale, (tk) => {
  if (tk) {
    Murupolku.aseta('tekstikappale', $kaanna(tk.nimi), {
      name: 'tekstikappale',
    });
  }
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";
@import '@shared/styles/_mixins.scss';

.badges {
  .badge {
    margin: 4px;
  }
}

.tekstiviite {
  .kappale {
    .otsikko {
      margin-bottom: 0;
      font-family: Poppins;
    }

    .teksti {
      margin-left: 0;
    }

    .infos {
      margin-bottom: 20px;

      .badges {
        .badge {
          margin: 0 4px 0 4px;
        }
      }
    }

    .perusteteksti {

      @include teksti-sisalto;

      font-style: italic;
      font-size: 80%;
    }

    .ohjeet {
      .ohje {
        padding: 10px;
        margin-bottom: 10px;
        color: #555;
      }

      .ohje-perusteteksti {
        background: #F5FBF0;
      }

      .ohje-ohje {
        background: #FBF1FA;
      }
    }

  }

  .sidepad {
    padding: 8px;
  }

  .additional-info-text {
    margin-right: 10px;
    font-weight: 600;
  }

}
</style>
