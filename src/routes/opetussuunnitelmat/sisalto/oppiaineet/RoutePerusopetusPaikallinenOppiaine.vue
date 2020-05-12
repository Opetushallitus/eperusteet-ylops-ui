<template>
<div id="scroll-anchor" v-if="editointiStore">
  <EpEditointi :store="editointiStore">
    <template v-slot:header="{ data }">
      <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}</h2>
    </template>
    <template v-slot:default="{ data, isEditing }">
      <div class="row">
        <div class="col-md-12">
          <ep-form-content name="valinnaisen-oppiaineen-nimi">
            <ep-field v-model="data.oppiaine.nimi"
                      :is-editing="isEditing">
            </ep-field>
          </ep-form-content>
        </div>
        <!--
        <div class="col-md-12" v-if="isEditing">
          <ep-form-content name="valinnaisen-oppiaineen-tyyppi">

          </ep-form-content>
        </div>
        -->
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
                      unit="vvt">
            </ep-field>
          </ep-form-content>
        </div>
        <div class="col-md-12" v-if="data.vuosiluokkakokonaisuus">
          <ep-form-content :name="$kaanna(data.vuosiluokkakokonaisuus.tehtava.otsikko)">
            <ep-content layout="normal"
                        v-model="data.vuosiluokkakokonaisuus.tehtava.teksti"
                        :is-editable="isEditing"></ep-content>
            <ep-alert v-if="!isEditing && !$kaanna(data.vuosiluokkakokonaisuus.tehtava.teksti)"
                      :only-text="true"
                      :text="$t('sisaltoa-ei-maaritelty')" />
          </ep-form-content>
        </div>
        <div class="col-md-12" v-if="data.vuosiluokkakokonaisuus">
          <ep-form-content :name="$kaanna(data.vuosiluokkakokonaisuus.tyotavat.otsikko)">
            <ep-content layout="normal"
                        v-model="data.vuosiluokkakokonaisuus.tyotavat.teksti"
                        :is-editable="isEditing"></ep-content>
            <ep-alert v-if="!isEditing && !$kaanna(data.vuosiluokkakokonaisuus.tyotavat.teksti)"
                      :only-text="true"
                      :text="$t('sisaltoa-ei-maaritelty')" />
          </ep-form-content>
        </div>
        <div class="col-md-12" v-if="data.vuosiluokkakokonaisuus">
          <ep-form-content :name="$kaanna(data.vuosiluokkakokonaisuus.ohjaus.otsikko)">
            <ep-content layout="normal"
                        v-model="data.vuosiluokkakokonaisuus.ohjaus.teksti"
                        :is-editable="isEditing"></ep-content>
            <ep-alert v-if="!isEditing && !$kaanna(data.vuosiluokkakokonaisuus.ohjaus.teksti)"
                      :only-text="true"
                      :text="$t('sisaltoa-ei-maaritelty')" />
          </ep-form-content>
        </div>
        <div class="col-md-12" v-if="data.vuosiluokkakokonaisuus">
          <ep-form-content :name="$kaanna(data.vuosiluokkakokonaisuus.arviointi.otsikko)">
            <ep-content layout="normal"
                        v-model="data.vuosiluokkakokonaisuus.arviointi.teksti"
                        :is-editable="isEditing"></ep-content>
            <ep-alert v-if="!isEditing && !$kaanna(data.vuosiluokkakokonaisuus.arviointi.teksti)"
                      :only-text="true"
                      :text="$t('sisaltoa-ei-maaritelty')" />
          </ep-form-content>
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

      <!--<pre>{{ data }}</pre>-->
    </template>
  </EpEditointi>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { VuosiluokkakokonaisuusStore } from '@/stores/vuosiluokkakokonaisuusStore';
import VuosiluokkakokonaisuusSisaltoTeksti from '../VuosiluokkakokonaisuusSisaltoTeksti.vue';
import { PerusopetusPaikallinenOppiaineStore } from '@/stores/perusopetusPaikallinenOppiaineStore';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';

@Component({
  components: {
    VuosiluokkakokonaisuusSisaltoTeksti,
    EpEditointi,
    EpFormContent,
    EpField,
    EpContent,
    EpAlert,
  },
})
export default class RoutePerusopetusPaikallinenOppiaine extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const vuosiluokkakokonaisuus = _.head(_.filter(this.ops.vuosiluokkakokonaisuudet, vlk =>
      vlk.vuosiluokkakokonaisuus?.id === _.toNumber(this.$route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;
    this.editointiStore = new EditointiStore(new PerusopetusPaikallinenOppiaineStore(
      this.opsId,
      _.toNumber(this.$route.params.oppiaineId),
      vuosiluokkakokonaisuus,
      this.ops.vuosiluokkakokonaisuudet!,
    ));
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

</style>
