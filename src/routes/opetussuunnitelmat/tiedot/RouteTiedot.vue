<template lang="pug">
div.content
  h2 Tiedot
  div(v-if="hooks")
    ep-editointi(:hooks="hooks")
      template(slot-scope="scope")
        div(style="width: 1024px")
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

        // pre {{ scope.data }}
      // .form-group
        label(for="asdf") {{ $t('peruste') }}
        input.form-control(
          id="asdf"
          type="text"
          v-model="model")
        small.form-text.text-muted Tähän diaarinumero

  // div(v-if="ops")
    div(class="row")
      div(class="col-md-2 text-md-right")
        strong {{ $t('nimi') }}:
      div(class="col-md-10")
        ep-content(v-model="ops.nimi")
    div(class="row")
      div(class="col-md-2 text-md-right")
        strong {{ $t('peruste') }}:
      div(class="col-md-10")
        div {{ ops.perusteenDiaarinumero }}
    div(class="row")
      div(class="col-md-2 text-md-right")
        strong {{ $t('julkaisukielet') }}:
      div(class="col-md-10")
        div(v-for="kieli in ops.julkaisukielet") {{kieli}}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { Opetussuunnitelmat } from '@/api';
import { OpetussuunnitelmaDto } from '@/tyypit';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi, { EditointiKontrolliConfig } from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpSelect from '@/components/forms/EpSelect.vue';

@Component({
  components: {
    EpContent,
    EpEditointi,
    EpField,
    EpSelect,
  },
})
export default class RouteTiedot extends Vue {
  private hooks: EditointiKontrolliConfig | null = null;

  mounted() {
    this.hooks = {
      source: {
        save: this.save,
        load: this.load,
      },
    };
  }

  private get kielet() {
    return ['fi', 'sv', 'en'];
  }

  private async load() {
    return _.cloneDeep(this.ops);
  }

  private async save(data: OpetussuunnitelmaDto) {
    Opetussuunnitelma.opetussuunnitelma = _.cloneDeep(data);
  }

  private get ops() {
    return Opetussuunnitelma.opetussuunnitelma;
  }

}
</script>

<style scoped lang="scss" src="./style.scss"></style>
