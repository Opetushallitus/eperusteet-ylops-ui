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

</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

import EpContent from '@/components/EpContent/EpContent.vue';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import EpField from '@/components/forms/EpField.vue';
import EpSelect from '@/components/forms/EpSelect.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import { OpetussuunnitelmaDto } from '@/tyypit';
import { Opetussuunnitelmat } from '@/api';

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
        async save(ops) {
          return Opetussuunnitelma.save(ops);
        },
        load: this.load,
      },
    };
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
