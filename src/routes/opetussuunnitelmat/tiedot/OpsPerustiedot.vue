<template>
  <div class="content">

      <div class="data-content w-50">
        <div class="row">
          <div class="col-1"><fas class="icon" icon="hallitus" /></div>
          <div class="col"><div class="topic">{{ $t('peruste')}}</div></div>
        </div>
        <div class="row justify-content-end">
          <div class="col-1"></div>
          <div class="col">{{ops.perusteenDiaarinumero}}</div>
        </div>
      </div>

      <div class="data-content w-50">
        <div class="row">
          <div class="col-1"><fas class="icon" icon="kielet" /></div>
          <div class="col"><div class="topic">{{ $t('julkaisukielet')}}</div></div>
        </div>
        <div class="row justify-content-end">
          <div class="col-1"></div>
          <div class="col">{{julkaisukieliet}}</div>
        </div>
      </div>

      <div class="data-content w-50">
        <div class="row">
          <div class="col-1"><fas class="icon" icon="kalenteri" /></div>
          <div class="col"><div class="topic">{{ $t('luotu')}}</div></div>
        </div>
        <div class="row justify-content-end">
          <div class="col-1"></div>
          <div class="col">{{ $sdt(ops.luotu)}}</div>
        </div>
      </div>

  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import { OpetussuunnitelmaKevytDto } from '@/tyypit';
import { Kielet } from '@shared/stores/kieli';

@Component
export default class OpsPerustiedot extends Vue {

  @Prop({required: true})
  private ops!: OpetussuunnitelmaKevytDto;

  get julkaisukieliet() {
    return _.map(this.ops.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .content {

    .data-content {
      padding:10px;

      .icon {
        color: $blue-lighten-1;
      }

      .topic {
        font-weight: bold;
      }
    }

  }



</style>
