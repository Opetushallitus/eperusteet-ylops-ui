<template>
  <b-table responsive
           striped
           hover
           :items="items"
           :fields="fields">
    <template v-slot:cell(nimi)="data">
      {{ $kaanna(data.value) }}
    </template>
    <template v-slot:cell(muokattu)="data">
      {{ $ago(data.value) }}
    </template>
    <template v-slot:cell(esitysnimi)="data">
      {{ data.value }}
    </template>
    <template v-slot:cell(actions)="row">
      <ep-button variant="link"
                 icon="peruuta"
                 @click="palauta(row.item)">
        {{ $t('palauta') }}
      </ep-button>
    </template>
  </b-table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpButton,
  },
})
export default class PoistettuTable extends Vue {
  @Prop({ required: true })
  private poistetut!: any[];

  get items() {
    return this.poistetut;
  }

  get fields() {
    return [
      {
        label: this.$t('nimi'),
        key: 'nimi',
        sortable: true,
      },
      {
        label: this.$t('poistoajankohta'),
        key: 'muokattu',
        sortable: true,
      },
      {
        label: this.$t('poistaja'),
        key: 'muokkaaja',
        sortable: true,
      },
      {
        key: 'actions',
        label: '',
        thStyle: { borderBottom: '0px' },
      },
    ];
  }

  palauta(poistettu) {
    this.$emit('palauta', poistettu);
  }
}

</script>
