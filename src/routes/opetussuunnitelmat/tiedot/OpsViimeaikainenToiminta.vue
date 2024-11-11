<template>
  <div class="content text-left">
    <h2>{{$t('viimeaikainen-toiminta')}}</h2>

    <ep-spinner v-if="!muokkaustiedot"></ep-spinner>

    <div class="container text-center" v-else>
      <div v-for="(muokkaustieto, index) in muokkaustiedotRouted" :key="muokkaustieto.id" class="row muokkaustieto">

        <div class="col col-auto ikoni-col center-block">
          <div class="ikoni d-inline-block">
            <EpMaterialIcon :class="muokkaustieto.iconClass">{{ muokkaustieto.icon }}</EpMaterialIcon>
          </div>
          <div class="aikajana" v-if="index != muokkaustiedotRouted.length - 1">&nbsp;</div>
        </div>

        <div class="col router-col text-left">
          <component
            :is="muokkaustieto.komponentti"
            :to="muokkaustieto.route">
            <div class="router-box" :class="{ 'router-box-poistettu': muokkaustieto.poistettu }">
              <div class="row">
                <div class="col nimi">{{muokkaustieto.kayttajaNimi}}</div>
                <div class="col aika text-right">{{$ago(muokkaustieto.luotu)}}</div>
              </div>
              <EpExternalLink v-if="muokkaustieto.url" :url="muokkaustieto.url">
                {{muokkaustieto.tapahtumateksti}}
              </EpExternalLink>
              <div class="kohde" v-else>{{muokkaustieto.tapahtumateksti}}</div>
            </div>
          </component>
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
import _ from 'lodash';
import { Vue, Component, Prop } from 'vue-property-decorator';
import { parsiEsitysnimi } from '@/stores/kayttaja';
import { MuokkaustietoStore } from '@/stores/muokkaustieto';
import { muokkaustietoRoute, muokkaustietoIcon, muokkaustietoUrl } from '@/utils/tapahtuma';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { OpetussuunnitelmaKevytDto } from '@shared/api/ylops';

@Component({
  components: {
    EpSpinner,
    EpButton,
    EpMaterialIcon,
  },
})
export default class OpsViimeaikainenToiminta extends Vue {
  @Prop({ required: true })
  private muokkaustietoStore!: MuokkaustietoStore;

  @Prop({ required: true })
  private ops!: OpetussuunnitelmaKevytDto;

  private lisahaku: boolean = false;

  async mounted() {
    await this.muokkaustietoStore.update();
  }

  get muokkaustiedot() {
    return this.muokkaustietoStore.muokkaustiedot;
  }

  get viimeinenHaku() {
    return this.muokkaustietoStore.viimeinenHaku;
  }

  get hakuLukumaara() {
    return this.muokkaustietoStore.hakuLukumaara;
  }

  async haeLisaa() {
    this.lisahaku = true;
    await this.muokkaustietoStore.update();
    this.lisahaku = false;
  }

  get muokkaustiedotRouted() {
    return _.chain(this.muokkaustiedot)
      .map((muokkaustieto) => {
        return {
          ...muokkaustieto,
          route: muokkaustietoRoute(muokkaustieto.kohdeId, muokkaustieto.kohde, muokkaustieto.tapahtuma, muokkaustieto.lisaparametrit),
          url: muokkaustietoUrl(muokkaustieto.kohdeId, muokkaustieto.kohde, this.ops),
          icon: muokkaustietoIcon(muokkaustieto.kohde, muokkaustieto.tapahtuma, muokkaustieto.lisatieto),
          iconClass: this.muokkaustietoIconClass(muokkaustieto),
          kayttajaNimi: muokkaustieto.kayttajanTieto ? parsiEsitysnimi(muokkaustieto.kayttajanTieto) : muokkaustieto.muokkaaja,
          tapahtumateksti: this.tapahtumateksti(muokkaustieto),
        };
      })
      .map((muokkaustieto) => {
        return {
          ...muokkaustieto,
          komponentti: muokkaustieto.route ? 'router-link' : 'div',
        };
      })
      .sortBy((muokkaustieto) => muokkaustieto.luotu)
      .reverse()
      .value();
  }

  tapahtumateksti(muokkaustieto) {
    if (muokkaustieto.kohde === 'opetussuunnitelma_rakenne') {
      return this.$t('tapahtuma-paivitys-opetussuunnitelma-rakenne');
    }

    if (muokkaustieto.kohde === 'oppiaineenvuosiluokka') {
      return this.$t(this.tapahtumakaannos(muokkaustieto)) + ': ' + this.$t('vuosiluokka') + ' ' + this.$t(muokkaustieto.lisatieto);
    }

    if (muokkaustieto.lisatieto) {
      return this.$t(muokkaustieto.lisatieto);
    }

    return this.$t(this.tapahtumakaannos(muokkaustieto)) + ': ' + this.tapahtumakohde(muokkaustieto);
  }

  tapahtumakaannos(muokkaustieto) {
    if (muokkaustieto.tapahtuma === 'luonti') {
      return 'tapahtuma-' + muokkaustieto.tapahtuma + '-' + muokkaustieto.kohde;
    }

    return 'tapahtuma-' + muokkaustieto.tapahtuma;
  }

  tapahtumakohde(muokkaustieto) {
    return (this as any).$kaanna(muokkaustieto.nimi);
  }

  muokkaustietoIconClass(muokkaustieto) {
    if (muokkaustieto.kohde === 'kommentti') {
      return 'comment';
    }

    if (muokkaustieto.kohde === 'opetussuunnitelma_rakenne') {
      return 'low_priority';
    }
    return muokkaustieto.tapahtuma;
  }
}
</script>

<style scoped lang="scss">
@import "@shared/styles/_variables.scss";

  .container {
    margin-top: 40px;
    margin-bottom: 20px;
    min-width: 450px;

    .muokkaustieto {
      margin-top: 0;
      margin-bottom: 10px;

      .ikoni-col {
        padding-top: 0;

        .ikoni {
          width:45px;
          border-radius: 30px;
          padding: 10px;
          box-shadow: 1px 1px 5px 0 rgba(0,26,88,0.1);
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

          .palautus {
            color: $blue-darken-1;
          }

          .julkaisu {
            color: $green-lighten-2;
          }

          .virhe {
            color: $red;
          }

        }

        .aikajana {
          z-index: 10;
          height: 100%;
          background: linear-gradient($gray-lighten-2, $gray-lighten-2) no-repeat center/2px 100%;
        }

      }

      .router-col {
        padding: 0;
        width: 0;

        .router-box {
          line-height: 1;
          padding: 10px;
          border-radius: 0.5rem;
          box-shadow: 1px 1px 5px 0 rgba(0,26,88,0.1);
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
