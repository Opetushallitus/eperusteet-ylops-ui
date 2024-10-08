<template>
  <div>
    <ep-button
      icon="keyboard_return"
      variant="link"
      @click="showModal"
      :showSpinner="palautuksessa">
      {{ $t('palauta') }}
    </ep-button>

    <b-modal
      ref="opsPalautusModal"
      size="lg"
      class="palautus-modal">

      <div slot="modal-header">
        <h5 class="modal-title">{{ $t(tyyppitekstit.palautaOps) }}</h5>
      </div>

      <div class="content" v-html="$t(tyyppitekstit.palautaOpsKuvaus)" />

      <div slot="modal-footer" class="d-flex">
        <ep-button variant="link" @click="peruuta">{{ $t('peruuta') }}</ep-button>
        <ep-button variant="primary" @click="palauta('luonnos')">{{ $t('palauta-luonnokseksi') }}</ep-button>
        <ep-button variant="primary" class="ml-3" @click="palauta('julkaistu')" v-if="isJulkaistu">{{ $t('palauta-julkaistuksi') }}</ep-button>
      </div>
    </b-modal>
  </div>
</template>

<script lang="ts">
import * as _ from 'lodash';
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component
export default class EpPalautusModal extends Vue {
  @Prop()
  private opetussuunnitelma!: any;
  private palautuksessa = false;

  showModal() {
    (this.$refs['opsPalautusModal'] as any).show();
  };

  async peruuta() {
    (this.$refs['opsPalautusModal'] as any).hide();
  }

  async palauta(tila: 'luonnos' | 'julkaistu') {
    this.palautuksessa = true;
    (this.$refs['opsPalautusModal'] as any).hide();
    await this.$emit('palauta', this.opetussuunnitelma, tila, () => {
      this.palautuksessa = false;
    });
  }

  get isJulkaistu() {
    return !!this.opetussuunnitelma?.viimeisinJulkaisuAika;
  }

  get tyyppitekstit() {
    if (!this.opetussuunnitelma) {
      return {};
    }

    const tekstit = {
      'pohja': {
        palautaOps: 'palauta-pohja',
        palautaOpsKuvaus: 'palauta-pohja-kuvaus',
      },
      'ops': {
        palautaOps: 'palauta-ops',
        palautaOpsKuvaus: this.isJulkaistu ? 'palauta-julkaistu-ops-kuvaus' : 'palauta-ops-kuvaus',
      },
    };

    return tekstit[this.opetussuunnitelma.tyyppi];
  }
}
</script>

<style scoped lang="scss">
@import '@shared/styles/_variables.scss';

.content {
  height: 200px;
}

</style>
