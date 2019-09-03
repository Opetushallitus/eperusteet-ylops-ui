<template>
  <table class="table table-striped">
    <thead>
      <tr>
        <th>{{ $t('nimi') }}</th>
        <th>{{ $t('poistoajankohta') }}</th>
        <th>{{ $t('poistaja') }}</th>
        <th>{{ $t('toiminnot') }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(poistettu, idx) in poistetut" :key="idx">
        <td>{{ $kaanna(poistettu.nimi) }}</td>
        <td>{{ $ago(poistettu.luotu) }}</td>
        <td>{{ poistettu.luoja }}</td>
        <td>
          <ep-button class="btn-sm" @click="palauta(poistettu)">{{ $t('palauta') }}</ep-button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { EpButton, } from '@/components';

import _ from 'lodash';
import { Lops2019PoistettuDto } from '@/tyypit';
import { opintojaksoValidator } from '@/validators/opintojakso';
import { Kielet } from '@/stores/kieli';


@Component({
  components: {
    EpButton,
  },
})
export default class PoistettuTable extends Vue {
  @Prop({
    required: true,
  })
  private poistetut!: Lops2019PoistettuDto[];

  palauta(poistettu) {
    this.$emit('palauta', poistettu);
  }
}

</script>
