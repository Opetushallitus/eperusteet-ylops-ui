<template>
  <div class="content text-left">
    <h3>{{$t('viimeaikainen-toiminta')}}</h3>

    <ep-spinner v-if="!muokkaustiedot"></ep-spinner>

    <div class="container text-center" v-else>
      <div v-for="(muokkaustieto, index) in muokkaustiedotRouted" :key="muokkaustieto.id" class="row muokkaustieto">

          <div class="col col-auto ikoni-col center-block">

              <div class="ikoni d-inline-block">
                <fas :icon="muokkaustieto.icon" :class="muokkaustieto.iconClass"/>
              </div>

            <div class="aikajana" v-if="index != muokkaustiedotRouted.length - 1">&nbsp;</div>
          </div>

          <div class="col router-col text-left">
            <router-link :to="muokkaustieto.route">
              <div class="router-box">
                <div class="row">
                  <div class="col nimi">{{muokkaustieto.kayttajaNimi}}</div>
                  <div class="col aika text-right">{{$ago(muokkaustieto.luotu)}}</div>
                </div>
                <div class="kohde">{{muokkaustieto.tapahtumateksti}}</div>
              </div>
            </router-link>
          </div>

      </div>
    </div>

    <div class="text-center">

      <span class="tyhja" v-if="muokkaustiedot && muokkaustiedot.length === 0">{{$t('viimeaikainen-toiminta-tyhja')}}</span>

      <div v-else>
        <ep-button @click="haeLisaa" variant="link" v-if="!lisahaku && muokkaustiedotRouted.length % hakuLukumaara == 0 && muokkaustiedot && (!viimeinenHaku || viimeinenHaku.length > 0)">
          {{$t('nayta-lisaa')}}
        </ep-button>

        <ep-spinner v-if="lisahaku"></ep-spinner>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';
import { Muokkaustieto } from '@/api';
import { MuokkaustietoKayttajallaDto, OpetussuunnitelmaKevytDto } from '@/tyypit';
import { muokkaustietoRoute, muokkaustietoIcon } from '@/utils/tapahtuma';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import { parsiEsitysnimi } from '@/stores/kayttaja';

@Component({
  components: {
    EpSpinner,
    EpButton,
  }
})
export default class OpsViimeaikainenToiminta extends Vue {

  @Prop({required: true})
  private ops!: OpetussuunnitelmaKevytDto;

  private hakuLukumaara = 8;
  private muokkaustiedot: MuokkaustietoKayttajallaDto[] | null = null;
  private viimeinenHaku: MuokkaustietoKayttajallaDto[] | null = null;
  private lisahaku: boolean = false;

  async mounted() {
    this.haeLisaa();
  }

  get muokkaustiedotRouted() {

    return _.chain(this.muokkaustiedot)
      .map((muokkaustieto) => {
        return {
          ...muokkaustieto,
          route: muokkaustietoRoute(muokkaustieto.kohdeId, muokkaustieto.kohde),
          icon: muokkaustietoIcon(muokkaustieto.kohde, muokkaustieto.tapahtuma),
          iconClass: this.muokkaustietoIconClass(muokkaustieto),
          kayttajaNimi: muokkaustieto.kayttajanTieto ? parsiEsitysnimi(muokkaustieto.kayttajanTieto) : muokkaustieto.muokkaaja,
          tapahtumateksti: this.tapahtumateksti(muokkaustieto),
        };
      })
      .sortBy((muokkaustieto) => muokkaustieto.luotu)
      .reverse()
      .value();
  }

  tapahtumateksti(muokkaustieto) {
    if (muokkaustieto.kohde === 'opetussuunnitelma_rakenne') {
      return this.$t('tapahtuma-paivitys-opetussuunnitelma_rakenne');
    }

    if (muokkaustieto.lisatieto) {
      return this.$t(muokkaustieto.lisatieto);
    }

    return this.$t(this.tapahtumakaannos(muokkaustieto)) + ': ' + this.tapahtumakohde(muokkaustieto);
  }

  tapahtumakaannos(muokkaustieto) {
    if (muokkaustieto.tapahtuma === 'luonti') {
      return  'tapahtuma-' + muokkaustieto.tapahtuma + '-' + muokkaustieto.kohde;
    }

    return 'tapahtuma-' + muokkaustieto.tapahtuma;
  }

  tapahtumakohde(muokkaustieto) {
    return (this as any).$kaanna(muokkaustieto.nimi);
  }

  muokkaustietoIconClass(muokkaustieto) {
    if (muokkaustieto.kohde === 'kommentti') {
      return 'kommentointi';
    }

    if (muokkaustieto.kohde === 'opetussuunnitelma_rakenne') {
      return 'luokaton';
    }

    return muokkaustieto.tapahtuma;
  }

  async haeLisaa() {

    if (this.muokkaustiedot) {
      this.lisahaku = true;
      this.viimeinenHaku = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.ops.id!, (_.last(this.muokkaustiedot) as any).luotu, this.hakuLukumaara) as any).data;
      this.lisahaku = false;

      if (this.viimeinenHaku) {
        this.muokkaustiedot = [
          ...this.muokkaustiedot,
          ...this.viimeinenHaku
        ];
      }
    }
    else {
      this.muokkaustiedot = (await Muokkaustieto.getOpsMuokkausTiedotWithLuomisaika(this.ops.id!, undefined, this.hakuLukumaara) as any).data;
    }

  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

  .container {
    margin-top: 40px;
    margin-bottom: 20px;
    min-width: 450px;
    // padding-right: 0px;

    .muokkaustieto {
      margin-top: 0px;
      margin-bottom: 10px;

      .ikoni-col {
        padding-top: 0px;

        .ikoni {
          width:45px;
          border-radius: 30px;
          padding: 10px;
          box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
          z-index: 15;
          background-color: #fff;
          color: $black;

          .luonti {
            color: $green-lighten-2;
          }

          .paivitys {
            color: $pink;
          }

          .kommentointi {
            color: $blue;
          }

          .luokaton {
            color: $gray;
          }

          .poisto {
            color: $gray;
          }

        }

        .aikajana {
          z-index: 10;
          height: 100%;
          background: linear-gradient($gray-lighten-2, $gray-lighten-2) no-repeat center/2px 100%;
        }

      }

      .router-col {
        padding: 0px;
        width: 200px;

        .router-box {
          line-height: 1;
          padding: 10px;
          border-radius: 0.5rem;
          box-shadow: 1px 1px 5px 0px rgba(0,26,88,0.1);
          color: $black;

          .nimi {
            font-weight: bold;
            padding-bottom: 10px;
          }

          .aika {
            color: $gray-lighten-2;
          }

          .kohde {
            padding-bottom: 5px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

        }
      }
    }

  }

  .tyhja {
    color: $gray-lighten-2;
    font-style: italic;
  }

</style>
