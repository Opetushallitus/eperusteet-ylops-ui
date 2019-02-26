<template lang="pug">

div.content
  h2 {{ $t('tiedot') }}
  div(v-if="hooks")
    ep-editointi(:hooks="hooks")
      template(slot-scope="scope")
        div
          .row
            .col-md-6
              ep-field(
                name="ops-nimi",
                v-model="scope.data.nimi",
                help="ops-nimi-ohje"
                :is-editing="scope.isEditing")
            .col-md-6
              ep-select(
                name="julkaisukielet",
                :is-editing="scope.isEditing"
                :items="kielet",
                v-model="scope.data.julkaisukielet",
                :multiple="true")
            .col-md-6
              ep-field(
                name="peruste",
                v-model="scope.data.perusteenDiaarinumero")
            .col-md-6
              ep-field(
                name="tila",
                v-model="scope.data.tila")
            .col-md-12
              ep-form-content(name="ops-kuvaus", ohje="ops-kuvaus-ohje")
                ep-content(v-model="scope.data.kuvaus", :is-editable="scope.isEditing")
        div(v-if="!scope.isEditing")
          tilanvaihto(v-model="scope.data.tila", :onSave="tryTilanvaihto")

</template>


<script lang="ts">

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpSelect from '@/components/forms/EpSelect.vue';
import EpRoute from '@/mixins/EpRoute.ts';
import Tilanvaihto from '@/routes/opetussuunnitelmat/Tilanvaihto.vue';
import _ from 'lodash';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { OpetussuunnitelmaDto } from '@/tyypit';
import { Opetussuunnitelmat } from '@/api';
import { Mixins, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
    EpContent,
    EpEditointi,
    EpField,
    EpFormContent,
    EpSelect,
    Tilanvaihto,
  },
})
export default class extends Mixins(EpRoute) {
  private hooks: EditointiKontrolliConfig | null = null;

  async mounted() {
    this.hooks = {
      source: {
        async save(ops) {
          return Opetussuunnitelma.save(ops);
        },
        load: this.load,
      },
    };
  }

  public async tryTilanvaihto(tila: string) {
    try {
      await Opetussuunnitelma.updateTila(tila);
      return true;
    }
    catch (err) {
      return false;
    }
  }

  private get kielet() {
    return ['fi', 'sv', 'en'];
  }

  private async load() {
    if (this.$route.params.id) {
      return Opetussuunnitelma.get(_.parseInt(this.$route.params.id));
    }
  }

}
</script>

<style scoped lang="scss" src="./style.scss"></style>
