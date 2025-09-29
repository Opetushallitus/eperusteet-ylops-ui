<template>
  <div
    v-if="editointiStore"
    id="scroll-anchor"
  >
    <EpEditointi
      :store="editointiStore"
      :pre-modify="aloitaMuokkaus"
      :post-save="tallennettu"
      :allow-save="varmistaValutus"
    >
      <template #header="{ data }">
        <h2 class="m-0">
          {{ $kaanna(data.oppiaine.nimi) }}, {{ $t('vuosiluokka') }} {{ $t(data.vuosiluokka.vuosiluokka) }}
        </h2>
      </template>
      <template #default="{ data, isEditing }">
        <b-tabs v-model="tabIndex">
          <b-tab :title="$t('tavoitteet')">
            <ep-collapse
              v-for="(tavoite, index) in data.perusteenTavoitteet"
              ref="tavoitecollapse"
              :key="'tavoite'+index"
              class="tavoite"
              :border-bottom="false"
              tyyppi="perusopetus-vuosiluokka-tavoite"
            >
              <template #header>
                <h3 v-html="$kaanna(tavoite.tavoite)" />
              </template>

              <div
                v-if="tavoite.oppiaineenTavoitteenOpetuksenTavoitteet && tavoite.oppiaineenTavoitteenOpetuksenTavoitteet.length > 0"
                class="mb-3"
              >
                <h4>{{ $t('opetuksen-tavoitteet') }}</h4>
                <div
                  v-for="(ot, index) in tavoite.oppiaineenTavoitteenOpetuksenTavoitteet"
                  :key="'ot'+index"
                >
                  <span v-html="$kaanna(ot.tavoite)" />
                </div>
              </div>

              <div v-if="tavoite.tavoitteistaJohdetutOppimisenTavoitteet">
                <h4>{{ $t('tavoitteista-johdetut-oppimisen-tavoitteet') }}</h4>
                <span v-html="$kaanna(tavoite.tavoitteistaJohdetutOppimisenTavoitteet)" />
              </div>

              <div
                v-if="tavoite.vuosiluokanTavoite"
                class="mb-4"
              >
                <h4>{{ $t('paikallinen-teksti') }}</h4>
                <ep-content
                  v-if="isEditing || tavoite.vuosiluokanTavoite.tavoite"
                  v-model="tavoite.vuosiluokanTavoite.tavoite"
                  layout="normal"
                  :is-editable="isEditing"
                />
                <ep-alert
                  v-if="!isEditing && !tavoite.vuosiluokanTavoite.tavoite"
                  :text="$t('paikallista-sisaltoa-ei-maaritetty')"
                />
              </div>

              <div
                v-if="tavoite.sisaltoalueet.length > 0"
                class="inner-collapse mb-4"
              >
                <h4>{{ $t('sisaltoalueet') }}</h4>
                <ep-collapse
                  v-for="(sisaltoalue, index) in tavoite.sisaltoalueet"
                  ref="sisaltoaluecollapse"
                  :key="'sisaltoalue'+index"
                  class="sisaltoalue"
                  :border-bottom="false"
                  :expanded-by-default="false"
                  chevron-location="left"
                  tyyppi="perusopetus-vuosiluokka-sisaltoalue"
                >
                  <template #header>
                    <h5 v-html="$kaanna(sisaltoalue.nimi)" />
                  </template>

                  <div class="pl-4 mb-4 sisaltoaluekuvaus">
                    <div v-if="!isEditing">
                      <div
                        v-if="!sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta && !sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus"
                        v-html="$kaanna(sisaltoalue.kuvaus)"
                      />
                      <div
                        v-else-if="sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta"
                        v-html="$kaanna(sisaltoalue.vuosiluokanSisaltoalue.omaKuvaus)"
                      />
                      <div
                        v-else-if="sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus"
                        v-html="$kaanna(sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus)"
                      />
                    </div>

                    <div v-else>
                      <div
                        v-if="!sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus"
                        :class="{'disabled': sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta}"
                        v-html="$kaanna(sisaltoalue.kuvaus)"
                      />
                      <div
                        v-else
                        :class="{'disabled': sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta}"
                        v-html="$kaanna(sisaltoalue.vuosiluokanSisaltoalue.sisaltoalueet.kuvaus)"
                      />

                      <ep-toggle v-model="sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta">
                        {{ $t('kayta-tavoitekohtaista-kuvausta') }}
                      </ep-toggle>
                      <ep-content
                        v-if="sisaltoalue.vuosiluokanSisaltoalue.kaytaOmaaKuvausta"
                        v-model="sisaltoalue.vuosiluokanSisaltoalue.omaKuvaus"
                        layout="normal"
                        :is-editable="isEditing"
                      />
                    </div>
                  </div>
                </ep-collapse>
              </div>

              <b-row>
                <b-col v-if="tavoite.laajaalaisetosaamiset.length > 0">
                  <div class="inner-collapse mb-4">
                    <h4>{{ $t('laaja-alaisen-osaamisen-alueet') }}</h4>

                    <ep-collapse
                      v-for="(lao, index) in tavoite.laajaalaisetosaamiset"
                      :key="'lao'+index"
                      :border-bottom="false"
                      :expanded-by-default="false"
                      chevron-location="left"
                    >
                      <template #header>
                        <h5 v-html="$kaanna(lao.perusteenLao.nimi)" />
                      </template>

                      <div class="pl-4">
                        <span
                          v-if="lao.paikallinenLao.naytaPerusteenPaatasonLao"
                          v-html="$kaanna(lao.perusteenLao.kuvaus)"
                        />
                        <span
                          v-if="lao.paikallinenLao.naytaPerusteenVlkTarkennettuLao"
                          v-html="$kaanna(lao.perusteenVlkLao.kuvaus)"
                        />
                        <template v-if="lao.paikallinenLao && lao.paikallinenLao.kuvaus">
                          <h4>{{ $t('paikallinen-teksti') }}</h4>
                          <span
                            v-if="lao.paikallinenLao && lao.paikallinenLao.kuvaus"
                            v-html="$kaanna(lao.paikallinenLao.kuvaus)"
                          />
                        </template>
                      </div>
                    </ep-collapse>
                  </div>
                </b-col>
                <b-col v-if="tavoite.kohdealueet.length > 0 && tavoite.kohdealueet[0].nimi">
                  <div
                    v-for="(kohdealue, index) in tavoite.kohdealueet"
                    :key="'kohdealue'+index"
                  >
                    <ep-order-color-ball
                      v-if="kohdealue.nimi"
                      class="pr-2"
                      :index="kohdealue.index"
                    />
                    <span>{{ $kaanna(kohdealue.nimi) }}</span>
                  </div>
                </b-col>
              </b-row>

              <div
                v-if="tavoite.arvioinninKuvaus"
                class="mb-4"
              >
                <h4>{{ $t('arvioinnin-kohde') }}</h4>
                <span v-html="$kaanna(tavoite.arvioinninKuvaus)" />
              </div>

              <div
                v-if="tavoite.arvioinninkohteet && tavoite.arvioinninkohteet.length > 0"
                class="mb-4"
              >
                <h4
                  class="mb-0 pb-0"
                  v-html="tavoite.arvioinninOtsikko ? $kaanna(tavoite.arvioinninOtsikko) : $t('arviointi-vuosiluokan-paatteeksi')"
                />
                <ep-arvioinninkohteet-table :arvioinninkohteet="tavoite.arvioinninkohteet" />
              </div>

              <div
                v-if="tavoite.vapaaTeksti"
                class="mb-4"
              >
                <h4>{{ $t('lisatietoa') }}</h4>
                <span v-html="$kaanna(tavoite.vapaaTeksti)" />
              </div>
            </ep-collapse>
          </b-tab>

          <b-tab :title="$t('keskeiset-sisallot')">
            <template v-if="data.perusteenVlk.vapaatTekstit">
              <ep-collapse
                v-for="(vapaateksti, index) in data.perusteenVlk.vapaatTekstit"
                :key="'perustevapaateksti' + index"
                tyyppi="perusteteksti"
                :border-bottom="true"
                :border-top="false"
                :expanded-by-default="true"
              >
                <template #header>
                  <h4>{{ $kaanna(vapaateksti.nimi) }}</h4>
                </template>
                <span v-html="$kaanna(vapaateksti.teksti)" />
              </ep-collapse>
            </template>

            <vuosiluokka-sisalto-teksti
              :peruste-object="data.perusteenVlk.sisaltoalueinfo"
              :peruste-teksti-avattu="true"
              :is-editing="false"
            />
            <hr>

            <div
              v-for="(sisaltoalue, index) in data.perusteenVlk.sisaltoalueet"
              :key="'keskeinensisalto'+index"
            >
              <vuosiluokka-sisalto-teksti
                v-model="sisaltoalue.vuosiluokanSisaltoalue"
                :peruste-object="sisaltoalue"
                :peruste-teksti-avattu="true"
                :is-editing="isEditing"
                otsikko="nimi"
                teksti="kuvaus"
              >
                <template #header>
                  <h3>
                    {{ $kaanna(sisaltoalue.nimi) }}
                    <span v-if="sisaltoalue.vuosiluokanSisaltoalue.piilotettu">({{ $t('piilotettu-tavoitteista') }})</span>
                  </h3>
                  <ep-toggle
                    v-if="isEditing"
                    v-model="sisaltoalue.vuosiluokanSisaltoalue.piilotettu"
                  >
                    {{ $t('piilota-sisaltoalue') }}
                  </ep-toggle>
                </template>
              </vuosiluokka-sisalto-teksti>
              <hr>
            </div>
          </b-tab>
        </b-tabs>
      </template>
    </EpEditointi>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, nextTick, useTemplateRef } from 'vue';
import { useRoute } from 'vue-router';
import _ from 'lodash';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { PerusopetusoppiaineVuosiluokkaStore } from '@/stores/perusopetusoppiainevuosiluokkaStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpOrderColorBall from '@shared/components/EpColorIndicator/EpOrderColorBall.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpToggle from '@shared/components/forms/EpToggle.vue';
import EpArvioinninkohteetTable from '@shared/components/EpArvioinninkohteetTable/EpArvioinninkohteetTable.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna, $t, $bvModal } from '@shared/utils/globals';


// Props
const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Router
const route = useRoute();

// Template refs
const tavoitecollapse = useTemplateRef('tavoitecollapse');
const sisaltoaluecollapse = useTemplateRef('sisaltoaluecollapse');

// Use composables
const ops = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value);
const opsId = computed(() => props.opetussuunnitelmaStore.opetussuunnitelma.value?.id);
// Reactive data
const editointiStore = ref<EditointiStore | null>(null);
const tabIndex = ref(0);

// Computed properties
const storeData = computed({
  get() {
    return editointiStore.value?.data;
  },
  set(data) {
    editointiStore.value?.setData(data);
  },
});

// Methods
const aloitaMuokkaus = async () => {
  if (tavoitecollapse.value) {
    _.forEach(tavoitecollapse.value, (collapse: any) => {
      collapse.toggle(true);
    });
  }
  await nextTick();
  if (sisaltoaluecollapse.value) {
    _.forEach(sisaltoaluecollapse.value, (collapse: any) => {
      collapse.toggle(true);
    });
  }
};

const tallennettu = async () => {
  if (tavoitecollapse.value) {
    _.forEach(tavoitecollapse.value, (collapse: any) => {
      collapse.toggle(true);
    });
  }
  await nextTick();
  if (sisaltoaluecollapse.value) {
    _.forEach(sisaltoaluecollapse.value, (collapse: any) => {
      collapse.toggle(false);
    });
  }
};

const varmistaValutus = async () => {
  if ((ops.value?.joissaPohjana?.length || 0) === 0) {
    return true;
  }

  const valuta = await $bvModal.msgBoxConfirm($t('vahvista-vuosiluokan-tietojen-valutus-teksti'), {
    title: $t('vahvista-vuosiluokan-tietojen-valutus-otsikko'),
    okVariant: 'primary',
    okTitle: $t('kylla'),
    cancelVariant: 'link',
    cancelTitle: $t('ei'),
    centered: true,
  });

  storeData.value = {
    ...storeData.value,
    valuta,
  };

  return true;
};

const init = async () => {
  const vuosiluokkakokonaisuus = _.head(_.filter(ops.value?.vuosiluokkakokonaisuudet, vlk =>
    vlk.vuosiluokkakokonaisuus?.id === _.toNumber(route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;

  editointiStore.value = new EditointiStore(new PerusopetusoppiaineVuosiluokkaStore(
    opsId.value, _.toNumber(route.params.oppiaineId), vuosiluokkakokonaisuus, _.toNumber(route.params.vlId)));
};

// Lifecycle
onMounted(async () => {
  await init();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .tavoite {
    box-shadow: 5px 5px 20px rgba(0, 45, 153, 0.08);
    margin-bottom: 20px;
    padding: 0 10px;

    .sisaltoalue {

      .sisaltoaluekuvaus{

        .disabled {
          color: $gray-lighten-3;
        }
      }
    }
  }

  .inner-collapse {
    :deep(.ep-collapse) {
      margin: 0;
      padding: 0;

      .header, h5 {
        margin: 2px 0 0;
      }
    }

    margin-bottom: 1rem;
  }

  .inner-list {
    ul {
      padding-inline-start: 20px;
    }
  }

</style>
