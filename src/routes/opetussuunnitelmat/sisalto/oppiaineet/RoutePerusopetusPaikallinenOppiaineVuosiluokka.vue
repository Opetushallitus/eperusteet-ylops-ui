<template>
  <div id="scroll-anchor" v-if="editointiStore">
    <EpEditointi :store="editointiStore">
      <template v-slot:header="{ data }">
        <h2 class="m-0">{{ $kaanna(data.oppiaine.nimi) }}, {{ $t('vuosiluokka') }} {{ $t(data.vuosiluokka.vuosiluokka) }}</h2>
      </template>
      <template v-slot:default="{ data, isEditing }">
        <h2>{{ $t('tavoitteet') }}</h2>
        <div v-for="(tavoite, idx) in data.vuosiluokka.tavoitteet" :key="idx" :class="{ 'tavoite-editing': isEditing, 'mb-3': isEditing }">
          <ep-collapse v-if="!isEditing" tyyppi="perusopetus-vuosiluokka-tavoite">
            <h3 slot="header">{{ $kaanna(tavoite.tavoite) }}</h3>
            <div v-for="(sa, idx2) in tavoite.sisaltoalueet" :key="idx2">
              <ep-content layout="normal"
                          v-model="sa.sisaltoalueet.kuvaus"></ep-content>
            </div>
          </ep-collapse>
          <div v-else>
            <ep-form-content name="tavoitteen-nimi">
              <ep-field v-model="tavoite.tavoite"
                        :is-editing="isEditing">
              </ep-field>
            </ep-form-content>
            <ep-form-content name="tavoitteen-kuvaus">
              <div v-for="(sa, idx2) in tavoite.sisaltoalueet" :key="idx2">
                <ep-content layout="normal"
                            v-model="sa.sisaltoalueet.kuvaus"
                            :is-editable="true"></ep-content>
              </div>
            </ep-form-content>
            <ep-button variant="link"
                       icon="delete"
                       class="float-right"
                       @click="poistaTavoite(data.vuosiluokka.tavoitteet, idx)">
              {{ $t('poista-tavoite') }}
            </ep-button>
          </div>
        </div>
        <ep-button v-if="isEditing"
                   variant="link"
                   icon="add"
                   @click="lisaaTavoite(data.vuosiluokka.tavoitteet)">
          {{ $t('lisaa-tavoite') }}
        </ep-button>
      </template>
    </EpEditointi>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Mixins, Component } from 'vue-property-decorator';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import { OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';
import { EditointiStore } from '@shared/components/EpEditointi/EditointiStore';
import { PerusopetusPaikallinenOppiaineVuosiluokkaStore } from '@/stores/perusopetusPaikallinenOppiaineVuosiluokkaStore';
import EpEditointi from '@shared/components/EpEditointi/EpEditointi.vue';
import EpCollapse from '@shared/components/EpCollapse/EpCollapse.vue';
import EpContent from '@shared/components/EpContent/EpContent.vue';
import EpField from '@shared/components/forms/EpField.vue';
import EpFormContent from '@shared/components/forms/EpFormContent.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpEditointi,
    EpCollapse,
    EpContent,
    EpField,
    EpFormContent,
    EpButton,
  },
})
export default class RoutePerusopetusPaikallinenOppiaineVuosiluokka extends Mixins(EpRoute, EpOpsComponent) {
  private editointiStore: EditointiStore | null = null;

  async init() {
    const vuosiluokkakokonaisuus = _.head(_.filter(this.ops.vuosiluokkakokonaisuudet, vlk =>
      vlk.vuosiluokkakokonaisuus?.id === _.toNumber(this.$route.params.vlkId))) as OpsVuosiluokkakokonaisuusKevytDto;
    this.editointiStore = new EditointiStore(new PerusopetusPaikallinenOppiaineVuosiluokkaStore(
      this.opsId,
      _.toNumber(this.$route.params.oppiaineId),
      vuosiluokkakokonaisuus,
      _.toNumber(this.$route.params.vuosiluokkaId),
    ));
  }

  private lisaaTavoite(tavoitteet) {
    tavoitteet.push({
      tavoite: {

      },
      sisaltoalueet: [{
        sisaltoalueet: {
          kuvaus: {},
        },
      }],
    });
  }

  private poistaTavoite(tavoitteet, idx) {
    tavoitteet.splice(idx, 1);
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

.tavoite-editing {
  border: 1px solid #E7E7E7;
  padding: 1rem;
  overflow: auto;
}
</style>
