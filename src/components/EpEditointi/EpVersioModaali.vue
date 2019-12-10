<template>
<div v-b-modal.epversiomodaali>
  {{ $t('muokkaushistoria') }}
  <b-modal id="epversiomodaali"
           size="lg"
           :title="$t('historia')"
           ok-title="OK">
    <b-table striped="striped" :items="versionsFormatted" :fields="fields"></b-table>
    <div slot="modal-footer"></div>
  </b-modal>
</div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Prop, Component, Mixins } from 'vue-property-decorator';
import { RevisionDto } from '@/tyypit';

import EpButton from '@/components/EpButton/EpButton.vue';
import EpFormContent from '@/components/forms/EpFormContent.vue';
import EpValidation from '@/mixins/EpValidation';

@Component({
  components: {
    EpButton,
    EpFormContent,
  },
})
export default class EpVersioModaali extends Mixins(EpValidation) {
  @Prop({ required: true })
  private versions!: RevisionDto[];

  @Prop({ required: true })
  private value!: number;

  get fields() {
    return [{
      key: 'index',
      label: this.$t('versio'),
    }, {
      key: 'ajankohta',
      label: this.$t('ajankohta'),
    }, {
      key: 'muokkaaja',
      label: this.$t('muokkaaja'),
    }, {
      key: 'kommentti',
      label: this.$t('kommentti'),
    }];
  }

  get versionsFormatted() {
    return _.map(this.versions, (rev) => ({
      ...rev,
      muokkaaja: rev.nimi,
      ajankohta: this.$d(rev.pvm || 0),
      kommentti: rev.kommentti || '-',
    }));
  }
}

</script>

<style scoped lang="scss">
</style>
