<template>

  <div class="content">
    <h3>{{$t('tiedot')}}</h3>

    <ep-spinner v-if="!ops"></ep-spinner>
    <div v-else>

      <div class="row">
        <div class="col w-50">

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

        <div class="col w-50">

          <div class="data-content">
            <div class="row">
              <div class="col-1"><fas class="icon" icon="tyoryhma" /></div>
              <div class="col"><div class="topic">{{ $t('tyoryhma')}}</div></div>
            </div>
            <div class="row justify-content-end">
              <div class="col-1"></div>
              <div class="col">
                  <span v-for="virkailija in virkailijatFormatted" :key="virkailija.oid">
                  {{ virkailija.esitysnimi }}
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import { OpetussuunnitelmaKevytDto } from '@/tyypit';
import { Kielet } from '@shared/stores/kieli';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import { Kayttajat, parsiEsitysnimi } from '@/stores/kayttaja';

@Component({
  components:{
    EpSpinner,
  }
})
export default class OpsPerustiedot extends Vue {

  @Prop({required: true})
  private ops!: OpetussuunnitelmaKevytDto;

  get julkaisukieliet() {
    return _.map(this.ops.julkaisukielet, (kieli) => Kielet.kaannaOlioTaiTeksti(kieli)).join(', ');
  }

  async init() {
    await Kayttajat.fetchOrganisaatioVirkailijat();
  }

  private get virkailijat() {
    return Kayttajat.virkailijat;
  }

  private get virkailijatFormatted() {
    return _.map(this.virkailijat, virkailija => {
      const esitysnimi = parsiEsitysnimi(virkailija);
      return {
        oid: virkailija.oid,
        esitysnimi,
      };
    });
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

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
