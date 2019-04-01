<template lang="pug">
div
  ep-button.btn-versiohistoria(v-b-modal.epversiomodaali, variant="link")
    span {{ $t('versiohistoria') }}

  b-modal(
    ref="modal",
    id="epversiomodaali",
    size="lg",
    title="testi")
    template(slot="modal-header")
      h2 {{ $t('historia') }}

    template(slot="modal-footer")
      ep-button(@click="hide()") {{ $t('sulje') }}

    .revisions
      .revision
        b-table(
          striped,
          :items="wat",
          :fields="fields")

</template>

<script lang="ts">
import { Prop, Component, Mixins } from 'vue-property-decorator';
import {
  EpButton,
  EpFormContent,
} from '@/components';

import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';
import EpValidation from '@/mixins/EpValidation';
import { opintojaksoLuontiValidator } from '@/validators/opintojakso';
import { tekstikappaleLuontiValidator } from '@/validators/tekstikappaleet';
import { RevisionDto } from '@/tyypit';
import _ from 'lodash';

@Component({
  components: {
    EpButton,
    EpFormContent,
  },
})
export default class EpSisaltoModaali extends Mixins(EpValidation) {
  @Prop({ required: true })
  private versions!: RevisionDto[];

  @Prop({ required: true })
  private value!: number;

  get fields() {
    return [{
      key: 'ajankohta',
      label: this.$t('ajankohta'),
    }, {
      key: 'muokkaaja',
      label: this.$t('muokkaaja'),
    }, {
      key: 'kommentti',
      label: this.$t('kommentti'),
    }, {
      key: 'index',
      label: this.$t('versio'),
    }];
  }

  get wat() {
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
.btn-versiohistoria {
  color: inherit;
  text-decoration: underline;
  margin: 0;
  padding: 0;
  font-size: 85%;
}
</style>
