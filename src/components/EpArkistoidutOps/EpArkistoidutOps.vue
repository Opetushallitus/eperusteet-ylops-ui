<template>
<div>
  <ep-button @click="open" variant="link" icon="folder" inherit-style>
    <span>{{ $t(title) }} </span>
  </ep-button>
  <b-modal ref="arkistoidutOpsModal"
           id="arkistoidutopetussuunnitelmatmodal"
           size="lg"
           :title="modalTitle"
           :hide-footer="true">
    <div class="search">
      <ep-search v-model="query" />
    </div>
    <EpSpinner v-if="!opetussuunnitelmat" />

    <template v-else>
      <b-table
              responsive
              borderless
              striped
              :items="opetussuunnitelmat.data"
              :fields="fields">

        <template v-slot:cell(nimi)="data">
          {{ $kaanna(data.value) }}
        </template>

        <template v-slot:cell(muokattu)="data">
          {{ $sdt(data.value) }}
        </template>

        <template v-slot:cell(siirtyminen)="data">
          <ep-button variant="link"
                    icon="keyboard_return"
                    @click="$emit('restore', data.item)"
                    inherit-style>
            {{ $t('palauta') }}
          </ep-button>
        </template>

      </b-table>

      <b-pagination
        v-model="opsSivu"
        :total-rows="opetussuunnitelmat['kokonaismäärä']"
        :per-page="10"
        aria-controls="arkistoidut-opetussuunnitelmat"
        align="center">
      </b-pagination>
    </template>
  </b-modal>
</div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Watch } from 'vue-property-decorator';
import { OpetussuunnitelmaInfoDto, Opetussuunnitelmat } from '@shared/api/ylops';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Debounced } from '@shared/utils/delay';
import { Page } from '@shared/tyypit';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';

@Component({
  components: {
    EpButton,
    EpSearch,
    EpSpinner,
    EpMaterialIcon,
  },
})
export default class EpArkistoidutOps extends Vue {
  @Prop({ default: 'ops' })
  private tyyppi!: 'ops' | 'pohja';

  @Prop()
  private title!: string;

  private opetussuunnitelmat: Page<OpetussuunnitelmaInfoDto> | null = null;

  private query = '';
  private lisaHaku = false;
  private opsSivu = 1;

  protected async fetch() {
    this.opetussuunnitelmat = (await Opetussuunnitelmat.getSivutettu(this.tyyppi as any, 'poistettu', undefined, this.query, undefined, undefined, this.opsSivu - 1, 10)).data as Page<OpetussuunnitelmaInfoDto>;
  }

  get modalTitle() {
    return this.$t(this.title) + (this.opetussuunnitelmat ? '(' + this.opetussuunnitelmat['kokonaismäärä'] + ')' : '');
  }

  @Watch('query')
  @Debounced()
  async queryChange() {
    this.opsSivu = 1;
    this.opetussuunnitelmat = null;
    await this.fetch();
  }

  @Watch('opsSivu')
  async opsSivuChange() {
    await this.fetch();
  }

  get fields() {
    return [{
      key: 'nimi',
      label: this.$t('ops-nimi'),
    }, {
      key: 'muokattu',
      label: this.$t('poistettu'),
      sortable: false,
    }, {
      key: 'arkistoija',
      label: this.$t('arkistoija'),
      sortable: false,
    }, {
      key: 'siirtyminen',
      label: '',
    }];
  }

  async open() {
    (this.$refs['arkistoidutOpsModal'] as any).show();
    await this.fetch();
  }

  close() {
    (this.$refs['arkistoidutOpsModal'] as any).hide();
  }
}

</script>

<style scoped lang="scss">

</style>
