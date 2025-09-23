<template>
<div id="scroll-anchor" v-if="editointiStore">
  <EpEditointi
    :store="editointiStore"
    :versionumero="versionumero"
    :confirmCopy="false">
    <template v-slot:kopioi-teksti>{{ $t('muokkaa') }}</template>
    <template v-slot:header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing, supportData }">
      <div class="row">
        <div class="col-md-12">
          <ep-form-content name="valinnaisen-oppiaineen-nimi">
            <ep-field v-model="data.oppiaine.nimi"
                      :is-editing="isEditing">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-12" v-if="isEditing">
          <ep-form-content name="valinnaisen-oppiaineen-tyyppi">
            <b-form-group>
              <b-form-radio v-model="data.oppiaine.valinnainenTyyppi"
                            name="valinnaisen-oppiaineen-tyyppi-syventava"
                            value="syventava"
                            class="mb-2">{{ $t('syventava') }}</b-form-radio>
              <ep-form-content name="oppiaine-pakollinen"
                               v-if="data.oppiaine.valinnainenTyyppi === 'syventava'"
                               class="ml-4">
                <ep-multi-select :options="data.oppiaineet"
                                 v-model="data.liittyvaOppiaine"
                                 :placeholder="$t('valitse-oppiaine')"
                                 track-by="id"
                                 label="nimi"
                                 :custom-label="kaannaNimi">
                  <template #option="{ option }">
                    {{ $kaanna(option.nimi) }}
                  </template>
                </ep-multi-select>
              </ep-form-content>
              <b-form-radio v-model="data.oppiaine.valinnainenTyyppi"
                            name="valinnaisen-oppiaineen-tyyppi-soveltava"
                            value="soveltava"
                            class="mb-2">{{ $t('soveltava') }}</b-form-radio>
              <ep-form-content name="oppiaine"
                               v-if="data.oppiaine.valinnainenTyyppi === 'soveltava'"
                               class="ml-4">
                <ep-multi-select :options="data.oppiaineet"
                                 v-model="data.liittyvaOppiaine"
                                 :placeholder="$t('valitse-oppiaine')"
                                 track-by="id"
                                 label="nimi"
                                 :custom-label="kaannaNimi">
                  <template #option="{ option }">
                    {{ $kaanna(option.nimi) }}
                  </template>
                </ep-multi-select>
              </ep-form-content>
            </b-form-group>
          </ep-form-content>
        </div>
        <div class="col-md-6">
          <ep-form-content name="vuosiluokat-joilla-esintyy">
            <ul v-if="!isEditing">
              <li v-for="(vuosiluokka, idx) in data.vuosiluokat" :key="idx">{{ $t(vuosiluokka.vuosiluokka) }}{{ $t('vuosiluokka-paate-lyhyt') }}</li>
            </ul>
            <b-form-checkbox-group v-else v-model="data.valitutVuosiluokat" stacked>
              <b-form-checkbox v-for="(vuosiluokka, index) in data.perusteVuosiluokat" :key="'vl' + index" :value="vuosiluokka">
                {{ $t(vuosiluokka) }}{{ $t('vuosiluokka-paate-lyhyt') }}
              </b-form-checkbox>
            </b-form-checkbox-group>
          </ep-form-content>
        </div>
        <div class="col-md-6">
          <ep-form-content name="laajuus">
            <ep-field v-model="data.oppiaine.laajuus"
                      :is-editing="isEditing"
                      type="string"
                      unit="vvt">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-12">

          <vuosiluokka-sisalto-teksti
            :pohjaObject="supportData.pohjaOppiaineenVuosiluokkakokonaisuus.tehtava"
            :vlkObject="data.vuosiluokkakokonaisuus.tehtava"
            :isEditing="isEditing" >
            <template v-slot:header>
              <h3>{{ $t('valinnaisen-tehtava') }}</h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr/>
        </div>
        <div class="col-md-12">
          <vuosiluokka-sisalto-teksti
            :pohjaObject="supportData.pohjaOppiaineenVuosiluokkakokonaisuus.tyotavat"
            :vlkObject="data.vuosiluokkakokonaisuus.tyotavat"
            :isEditing="isEditing" >
            <template v-slot:header>
              <h3>{{ $t('oppiaine-tyotavat') }}</h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr/>
        </div>
        <div class="col-md-12">
          <vuosiluokka-sisalto-teksti
            :pohjaObject="supportData.pohjaOppiaineenVuosiluokkakokonaisuus.ohjaus"
            :vlkObject="data.vuosiluokkakokonaisuus.ohjaus"
            :isEditing="isEditing" >
            <template v-slot:header>
              <h3>{{ $t('oppiaine-ohjaus') }}</h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr/>
        </div>
        <div class="col-md-12">
          <vuosiluokka-sisalto-teksti
            :pohjaObject="supportData.pohjaOppiaineenVuosiluokkakokonaisuus.arviointi"
            :vlkObject="data.vuosiluokkakokonaisuus.arviointi"
            :isEditing="isEditing" >
            <template v-slot:header>
              <h3>{{ $t('oppiaine-arviointi') }}</h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr/>
        </div>
        <div class="col-md-12">
          <vuosiluokka-sisalto-teksti
            :pohjaObject="supportData.pohjaOppiaineenVuosiluokkakokonaisuus.tavoitteistaJohdetutOppimisenTavoitteet"
            :vlkObject="data.vuosiluokkakokonaisuus.tavoitteistaJohdetutOppimisenTavoitteet"
            :isEditing="isEditing" >
            <template v-slot:header>
              <h3>{{ $t('oppiaine-tavoitteista-johdetut-oppimisen-tavoitteet') }}</h3>
            </template>
          </vuosiluokka-sisalto-teksti>
          <hr/>
        </div>
        <div class="col-md-12" v-if="!isEditing && data.vuosiluokkakokonaisuus">
          <ep-form-content name="tavoitteet-ja-sisallot-vuosiluokittain">
            <b-table responsive
                     borderless
                     striped
                     :items="data.vuosiluokat"
                     :fields="[{ key: 'vuosiluokka', thStyle: { display: 'none' } }]">
              <template v-slot:cell(vuosiluokka)="vuosiluokka">
                <router-link :to="{ name: 'perusopetuspaikallinenoppiainevuosiluokka', params: { vuosiluokkaId: vuosiluokka.item.id } }">
                  {{ $t('vuosiluokka') }} {{ $t(vuosiluokka.item.vuosiluokka) }}
                </router-link>
              </template>
            </b-table>
          </ep-form-content>
        </div>
      </div>
    </template>
  </EpEditointi>
</div>
</template>

<script setup lang="ts">
import _ from 'lodash';
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useEpRoute } from '@/mixins/EpRoute';
import { useEpOpsComponent } from '@/mixins/EpOpsComponent';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetusPaikallinenOppiaineStore } from '@/stores/perusopetusPaikallinenOppiaineStore';
import { OpsVuosiluokkakokonaisuusKevytDto, PerusopetusoppiaineDto } from '@shared/api/ylops';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import EpMultiSelect from '@shared/components/forms/EpMultiSelect.vue';
import VuosiluokkaSisaltoTeksti from '../VuosiluokkaSisaltoTeksti.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { $kaanna } from '@shared/utils/globals';

const props = defineProps<{
  opetussuunnitelmaStore: OpetussuunnitelmaStore;
}>();

// Use composables
const route = useRoute();
const { opsId, ops } = useEpOpsComponent(props.opetussuunnitelmaStore);

// Reactive data
const editointiStore = ref<EditointiStore | null>(null);

const init = async () => {
  const vuosiluokkakokonaisuus = _.head(_.filter(ops.value.vuosiluokkakokonaisuudet, vlk =>
    vlk.vuosiluokkakokonaisuus?.id === _.toNumber(route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;
  editointiStore.value = new EditointiStore(new PerusopetusPaikallinenOppiaineStore(
    opsId.value,
    route.params.oppiaineId,
    vuosiluokkakokonaisuus,
    _.toNumber(versionumero.value),
    undefined, // this context not needed
    muokkaa.value,
  ));
};

// Computed properties
const oppiaine = computed((): PerusopetusoppiaineDto | null => {
  return editointiStore.value?.data.value || null;
});

const isJulkinen = computed(() => {
  return oppiaine.value && oppiaine.value.jnro;
});

const versionumero = computed(() => {
  return _.parseInt(_.get(route, 'query.versionumero') as any);
});

const muokkaa = computed(() => {
  return route.params.oppiaineId === 'uusi';
});

const isOma = computed(() => {
  return oppiaine.value && !oppiaine.value.jnro;
});

const kaannaNimi = ({ nimi }: { nimi: any }) => {
  return $kaanna(nimi);
};

// Initialize on mount
onMounted(async () => {
  await init();
});
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
