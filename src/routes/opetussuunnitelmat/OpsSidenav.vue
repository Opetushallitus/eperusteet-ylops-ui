<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")
  ul.navigation(v-if="sisalto")
    router-link(:to="{ 'name': 'opsTiedot' }" tag="li")
      a.btn.btn-link {{ $t('tiedot') }}
    ops-sidenav-item(
      v-for="teksti in sisalto.lapset",
      :value="teksti",
      :key="teksti.id")
    li
      button.btn.btn-primary(@click="addTekstikappale()")
        fas(icon="plus")
        span {{ $t('lisaa-tekstikappale') }}
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import OpsSidenavItem from './OpsSidenavItem.vue';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';


@Component({
  components: {
    OpsSidenavItem,
  },
})
export default class RouteOpetussuunnitelma extends Vue {

  private get sisalto() {
    return Opetussuunnitelma.sisalto;
  }

  private async addTekstikappale() {
    const uusi = await Opetussuunnitelma.addTeksti({
      tekstiKappale: {
        nimi: {
        },
      },
    });
  }

}
</script>

<style scoped lang="scss" src="./sidenav.scss"></style>

