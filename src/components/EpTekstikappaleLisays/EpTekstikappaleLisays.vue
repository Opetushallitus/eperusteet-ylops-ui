<template>
<div>
  <ep-button v-b-modal.tekstikappalelisays variant="link">
    <span>{{ $t('uusi-tekstikappale') }}</span>
  </ep-button>
  <b-modal ref="arkistoidutOpsModal" id="tekstikappalelisays" size="lg">
    <template v-slot:modal-title>
      {{ $t(lisaa-uusi-tekstikappale) }}
    </template>



    <template v-slot:modal-cancel>
      {{ $t('peruuta')}}
    </template>
    <template v-slot:modal-ok>
      {{ $t('lisaa-tekstikappale')}}
    </template>

  </b-modal>
</div>
</template>

<script lang="ts">
import { Prop, Component, Vue, Mixins } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';
import _ from 'lodash';
import { OpetussuunnitelmaInfoDto } from '../../generated';
import EpRoute from '@/mixins/EpRoute';
import EpOpsComponent from '@/mixins/EpOpsComponent';
import EpSearch from '@shared/components/forms/EpSearch.vue';
import { Kielet } from '@shared/stores/kieli';

@Component({
  components: {
    EpButton,
    EpSearch,
  },
})
export default class EpTekstikappaleLisays extends Vue {


}

</script>

<style scoped lang="scss">

</style>
