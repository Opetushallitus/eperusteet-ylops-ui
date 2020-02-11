<template>
  <div>
    <ep-search v-model="query" class="mb-4" />
    <poistetut-table :poistetut="rajatut" @palauta="palauta" />
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';

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
    const hakutermi = _.toLower(this.query);
    const kieli = Kielet.getSisaltoKieli;

    return _.chain(this.poistetut)
      .filter(p => _.includes(_.toLower(_.get(p, 'nimi.' + kieli)), hakutermi))
      .sortBy('muokattu')
      .reverse()
      .value();
  }

  palauta(poistettu) {
    this.$emit('palauta', poistettu);
  }

}

</script>
