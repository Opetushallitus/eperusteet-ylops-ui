<template>
  <div class="content text-left">
    <h2>{{ $t('viimeaikainen-toiminta') }}</h2>

    <ep-spinner v-if="!muokkaustiedot" />

    <div
      v-else
      class="container text-center"
    >
      <div
        v-for="(muokkaustieto, index) in muokkaustiedotRouted"
        :key="muokkaustieto.id"
        class="row muokkaustieto"
      >
        <div class="col col-auto ikoni-col center-block">
          <div class="ikoni d-inline-block">
            <EpMaterialIcon :class="muokkaustieto.iconClass">
              {{ muokkaustieto.icon }}
            </EpMaterialIcon>
          </div>
          <div
            v-if="index != muokkaustiedotRouted.length - 1"
            class="aikajana"
          >
&nbsp;
          </div>
        </div>

        <div class="col router-col text-left">
          <component
            :is="muokkaustieto.komponentti"
            :to="muokkaustieto.route"
          >
            <div
              class="router-box"
              :class="{ 'router-box-poistettu': muokkaustieto.poistettu, 'd-flex flex-row-reverse justify-content-between': !muokkaustieto.kayttajaNimi }"
            >
              <div class="d-flex justify-content-between">
                <div
                  v-if="muokkaustieto.kayttajaNimi"
                  class="nimi"
                >
                  {{ muokkaustieto.kayttajaNimi }}
                </div>
                <div class="aika text-right">
                  {{ $ago(muokkaustieto.luotu) }}
                </div>
              </div>
              <EpExternalLink
                v-if="muokkaustieto.url"
                :url="muokkaustieto.url"
              >
                {{ muokkaustieto.tapahtumateksti }}
              </EpExternalLink>
              <div
                v-else
                class="kohde"
              >
                {{ muokkaustieto.tapahtumateksti }}
              </div>
            </div>
          </component>
        </div>
      </div>
    </div>

    <div class="text-center">
      <span
        v-if="muokkaustiedot && muokkaustiedot.length === 0"
        class="tyhja"
      >{{ $t('viimeaikainen-toiminta-tyhja') }}</span>
      <div v-else>
        <ep-button
          v-if="!lisahaku && muokkaustiedotRouted.length % hakuLukumaara == 0 && muokkaustiedot && (!viimeinenHaku || viimeinenHaku.length > 0)"
          variant="link"
          @click="haeLisaa"
        >
          {{ $t('nayta-lisaa') }}
        </ep-button>
        <ep-spinner v-if="lisahaku" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import _ from 'lodash';
import EpSpinner from '@shared/components/EpSpinner/EpSpinner.vue';
import EpButton from '@shared/components/EpButton/EpButton.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import EpExternalLink from '@shared/components/EpExternalLink/EpExternalLink.vue';
import { MuokkaustietoStore } from '@/stores/muokkaustieto';
import { muokkaustietoRoute, muokkaustietoIcon, muokkaustietoUrl } from '@/utils/tapahtuma';
import { OpetussuunnitelmaKevytDto } from '@shared/api/ylops';
import { $t, $kaanna, $ago } from '@shared/utils/globals';
import { parsiEsitysnimi } from '@shared/utils/kayttaja';

const props = defineProps<{
  muokkaustietoStore: MuokkaustietoStore;
  ops: OpetussuunnitelmaKevytDto;
}>();

const lisahaku = ref<boolean>(false);

const muokkaustiedot = computed(() => {
  return props.muokkaustietoStore.muokkaustiedot.value;
});

const viimeinenHaku = computed(() => {
  return props.muokkaustietoStore.viimeinenHaku.value;
});

const hakuLukumaara = computed(() => {
  return props.muokkaustietoStore.hakuLukumaara.value;
});

const muokkaustietoKayttajanimi = (muokkaustieto: any) => {
  if (muokkaustieto.kohde === 'peruste') {
    return null;
  }

  if (muokkaustieto.kayttajanTieto) {
    return parsiEsitysnimi(muokkaustieto.kayttajanTieto);
  }

  return muokkaustieto.muokkaaja;
};

const tapahtumakaannos = (muokkaustieto: any) => {
  if (muokkaustieto.tapahtuma === 'luonti') {
    return 'tapahtuma-' + muokkaustieto.tapahtuma + '-' + muokkaustieto.kohde;
  }

  return 'tapahtuma-' + muokkaustieto.tapahtuma;
};

const tapahtumakohde = (muokkaustieto: any) => {
  return $kaanna(muokkaustieto.nimi);
};

const tapahtumateksti = (muokkaustieto: any) => {
  if (muokkaustieto.kohde === 'opetussuunnitelma_rakenne') {
    return $t('tapahtuma-paivitys-opetussuunnitelma-rakenne');
  }

  if (muokkaustieto.kohde === 'oppiaineenvuosiluokka') {
    return $t(tapahtumakaannos(muokkaustieto)) + ': ' + $t('vuosiluokka') + ' ' + $t(muokkaustieto.lisatieto);
  }

  if (muokkaustieto.lisatieto) {
    return $t(muokkaustieto.lisatieto);
  }

  return $t(tapahtumakaannos(muokkaustieto)) + ': ' + tapahtumakohde(muokkaustieto);
};

const muokkaustietoIconClass = (muokkaustieto: any) => {
  if (muokkaustieto.kohde === 'kommentti') {
    return 'comment';
  }

  if (muokkaustieto.kohde === 'opetussuunnitelma_rakenne') {
    return 'low_priority';
  }
  return muokkaustieto.tapahtuma;
};

const muokkaustiedotRouted = computed(() => {
  return _.chain(muokkaustiedot.value)
    .map((muokkaustieto) => {
      return {
        ...muokkaustieto,
        route: muokkaustietoRoute(muokkaustieto.kohdeId, muokkaustieto.kohde, muokkaustieto.tapahtuma, muokkaustieto.lisaparametrit),
        url: muokkaustietoUrl(muokkaustieto.kohdeId, muokkaustieto.kohde, props.ops),
        icon: muokkaustietoIcon(muokkaustieto.kohde, muokkaustieto.tapahtuma, muokkaustieto.lisatieto),
        iconClass: muokkaustietoIconClass(muokkaustieto),
        kayttajaNimi: muokkaustietoKayttajanimi(muokkaustieto),
        tapahtumateksti: tapahtumateksti(muokkaustieto),
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
});

const haeLisaa = async () => {
  lisahaku.value = true;
  await props.muokkaustietoStore.update();
  lisahaku.value = false;
};

onMounted(async () => {
  await props.muokkaustietoStore.update();
});
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
