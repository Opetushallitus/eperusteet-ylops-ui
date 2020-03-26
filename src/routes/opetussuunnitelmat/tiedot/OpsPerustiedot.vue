<template>

  <div class="content">
    <h2>{{$t('tiedot')}}</h2>

    <ep-spinner v-if="!ops || !virkailijat"></ep-spinner>
    <div v-else>

      <div class="row">
        <div class="col-5">

          <div class="data-content">
            <div class="row">
              <div class="col-1"><fas class="icon" icon="hallitus" /></div>
              <div class="col"><div class="topic">{{ $t('peruste')}}</div></div>
            </div>
            <div class="row justify-content-end">
              <div class="col-1"></div>
              <div class="col">{{ops.perusteenDiaarinumero}}</div>
            </div>
          </div>

          <div class="data-content">
            <div class="row">
              <div class="col-1"><fas class="icon" icon="kielet" /></div>
              <div class="col"><div class="topic">{{ $t('julkaisukielet')}}</div></div>
            </div>
            <div class="row justify-content-end">
              <div class="col-1"></div>
              <div class="col">{{julkaisukieliet}}</div>
            </div>
          </div>

          <div class="data-content">
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

        <div class="col-7">

          <div class="data-content">
            <div class="row">
              <div class="col-1"><fas class="icon" icon="tyoryhma" /></div>
              <div class="col"><div class="topic">{{ $t('tyoryhma')}}</div></div>
            </div>
            <div class="row justify-content-end">
              <div class="col-1"></div>
              <div class="col">
                <p v-for="virkailija in virkailijatFormatted" :key="virkailija.oid" class="mb-1">
                  {{ virkailija.esitysnimi }}
                </p>
                <ep-button v-if="!naytaLisaaTyoryhmaa && virkailijat.length > tyoryhmaAlkuMaara" @click="naytaLisaaTyoryhmaa = true" variant="link" buttonClass="pl-0 mt-2">
                  {{$t('nayta-lisaa')}}
                </ep-button>
                <ep-button v-if="naytaLisaaTyoryhmaa" @click="naytaLisaaTyoryhmaa = false" variant="link" buttonClass="pl-0 mt-2">
                  {{$t('piilota')}}
                </ep-button>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Component, Prop, Mixins } from 'vue-property-decorator';

import { Kielet } from '@shared/stores/kieli';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpOpsComponent from '../../../mixins/EpOpsComponent';


@Component({
  components:{
    EpSpinner,
    EpButton,
  }
})
export default class OpsPerustiedot extends Mixins(EpOpsComponent) {

  private naytaLisaaTyoryhmaa: boolean = false;
  private tyoryhmaAlkuMaara = 5;

  get julkaisukieliet() {
    return _.map(this.ops.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
  }

  async mounted() {
    await this.store.fetchOrganisaatioVirkailijat();
  }

  private get virkailijat() {
    return this.store.virkailijat;
  }

  private get virkailijatFormatted() {
    return _.chain(this.virkailijat)
      .map(virkailija => {
        return {
          oid: virkailija.oid,
          esitysnimi : parsiEsitysnimi(virkailija),
        };
      })
      .take(!this.naytaLisaaTyoryhmaa ? this.tyoryhmaAlkuMaara : _.size(this.virkailijat))
      .value();
  }

}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .content {

    .data-content {
      padding:10px;
      min-width: 160px;

      .icon {
        color: $blue-lighten-6;
      }

      .topic {
        font-weight: bold;
        line-height: 1;
      }
    }

  }



</style>
