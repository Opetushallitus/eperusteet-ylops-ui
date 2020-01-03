<template>
  <div>
    <div class="d-flex mb-3">
      <ep-search v-model="query"></ep-search>
    </div>

    <poistetut-table :poistetut="rajatut" @palauta="palauta" />

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import { Lops2019PoistettuDto } from '@/tyypit';
import { Kielet } from '@shared/stores/kieli';
import PoistetutTable from './PoistetutTable.vue';
import EpSearch from '@shared/components/forms/EpSearch.vue';

@Component({
  components: {
    EpSearch,
    PoistetutTable,
  },
})
export default class PoistetutHakuTable extends Vue {
  @Prop({
    required: true,
  })
  private poistetut!: Lops2019PoistettuDto[];

  private query = '';

  get rajatut() {
    return _.chain(this.poistetut)
      .filter((p) =>
        Kielet.search(this.query, p.nimi)
        || (p.parent !== null && Kielet.search(this.query, p.parent)))
      .sortBy('luotu')
      .value();
  }

  palauta(poistettu) {
    this.$emit('palauta', poistettu);
  }

}

</script>
