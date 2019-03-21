<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")
  ul.navigation(v-if="sisalto && !kayttajaOppiainenakymassa")
    router-link(:to="{ 'name': 'opsTiedot' }" tag="li")
      a.btn.btn-link {{ $t('tiedot') }}
    router-link.minor(:to="{ 'name': 'opsPoistetut' }" tag="li")
      a.btn.btn-link {{ $t('poistetut') }}
    router-link.minor(:to="{ 'name': 'opsDokumentti' }" tag="li")
      a.btn.btn-link {{ $t('dokumentti') }}
    router-link.minor(:to="{ 'name': 'opsKasitteet' }" tag="li")
      a.btn.btn-link {{ $t('kasitteet') }}
    ops-sidenav-item(
      v-for="teksti in sisalto.lapset",
      :value="teksti",
      :key="teksti.id")
    router-link.oppiainelinkki(:to="{ 'name': 'oppiaine', params: { aineId: 2 } }" tag="li")
      a.btn.btn-link {{ $t('oppiaineet') }}
      fas(icon="chevron-right")
    li
      button.btn.btn-primary(@click="addTekstikappale()")
        fas.mr-2(icon="plus")
        span {{ $t('lisaa-tekstikappale') }}
    li
      button.btn.btn-primary(@click="addOpintojakso()")
        fas(icon="plus")
        | &nbsp;&nbsp;
        span {{ $t('lisaa-opintojakso') }}
  ops-sidenav-oppiaineet(v-if="sisalto && kayttajaOppiainenakymassa")
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import OpsSidenavItem from './OpsSidenavItem.vue';
import OpsSidenavOppiaineet from './OpsSidenavOppiaineet.vue';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';

@Component({
  components: {
    OpsSidenavItem,
    OpsSidenavOppiaineet,
  },
})
export default class RouteOpetussuunnitelma extends Vue {
  private get sisalto() {
    return Opetussuunnitelma.sisalto;
  }

  private get kayttajaOppiainenakymassa() {
    return this.$route.name === 'oppiaine' || this.$route.name === 'opintojakso';
  }

  private async addTekstikappale() {
    const uusi = await Opetussuunnitelma.addTeksti({
      tekstiKappale: {
        nimi: {
          fi: 'Uusi tekstikappale',
        } as any,
      },
    });
  }

  private async addOpintojakso() {
    const uusi = await Opetussuunnitelma.addOpintojakso({
      oppiaineUri: 'oppiaineet_maa',
      nimi: {
        fi: 'Uusi opintojakso',
      } as any,
    });
  }
}
</script>

<style scoped lang="scss" src="./sidenav.scss"></style>
