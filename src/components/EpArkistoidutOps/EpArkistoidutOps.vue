<template>
<div>
  <ep-button v-b-modal.arkistoidutopetussuunnitelmatmodal variant="link">
    <fas class="mr-2" :icon="['far', 'folder']" >
    </fas>
    <span>{{ $t(title) }}</span>
  </ep-button>
  <b-modal ref="arkistoidutOpsModal"
           id="arkistoidutopetussuunnitelmatmodal"
           size="lg"
           :title="$t(title) + ' (' + arkistoidut.length + ')'"
           :hide-footer="true">
    <div class="search">
      <ep-search v-model="query" />
    </div>
    <b-table responsive
             borderless
             striped
             :items="arkistoidut"
             :fields="fields"
             :current-page="currentPage"
             :per-page="perPage">

      <template v-slot:cell(nimi)="data">
        {{ $kaanna(data.value) }}
      </template>

      <template v-slot:cell(muokattu)="data">
        {{ $sdt(data.value) }}
      </template>

      <template v-slot:cell(siirtyminen)="data">
        <ep-button variant="link"
                   icon="peruuta"
                   @click="$emit('restore', data.item)">
          {{ $t('palauta') }}
        </ep-button>
      </template>

    </b-table>

    <b-pagination
      v-model="currentPage"
      :total-rows="arkistoidut.length"
      :per-page="perPage"
      aria-controls="arkistoidut-opetussuunnitelmat"
      align="center">
    </b-pagination>
  </b-modal>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Vue } from 'vue-property-decorator';

import { OpetussuunnitelmaInfoDto } from '@shared/api/ylops';
import { Kielet } from '@shared/stores/kieli';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpButton,
    EpSearch,
  },
})
export default class EpArkistoidutOps extends Vue {
  @Prop()
  private opetussuunnitelmat!: OpetussuunnitelmaInfoDto[];

  @Prop()
  private title!: string;

  private query = '';
  private currentPage = 1;
  private perPage = 10;

  get arkistoidut() {
    return _.chain(this.opetussuunnitelmat)
      .filter(ops => Kielet.search(this.query, ops.nimi))
      .orderBy('muokattu', 'desc')
      .value();
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('ops-nimi'),
    }, {
      key: 'muokattu',
      label: this.$t('poistettu'),
      sortable: true,
    }, {
      key: 'arkistoija',
      label: this.$t('arkistoija'),
      sortable: true,
    }, {
      key: 'siirtyminen',
      label: '',
    }];
  }
}

</script>

<style scoped lang="scss">

</style>
