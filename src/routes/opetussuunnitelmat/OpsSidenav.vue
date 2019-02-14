<template lang="pug">
.sidebar
  .search
    .inlay
      input.form-control.megasearch(type="text" placeholder="Etsi")
      fas.inner-icon(icon="search")
  ul.navigation(v-if="sisalto")
    router-link(:to="{ 'name': 'opsTiedot' }" tag="li")
      a.btn.btn-link {{ $t('tiedot') }}
    div(v-for="teksti in sisalto.lapset", :key="teksti.id")
      router-link(
        :to="{ 'name': 'tekstikappale', params: { osaId: teksti.id } }",
        tag="li")
        a.btn.btn-link {{ $kaanna(teksti.tekstiKappale.nimi) }}
      ul.subnav(v-for="lapsi in teksti.lapset", :key="lapsi.id")
        router-link(
          :to="{ 'name': 'tekstikappale', params: { osaId: lapsi.id } }",
          tag="li")
          a.btn.btn-link {{ $kaanna(lapsi.tekstiKappale.nimi) }}
    router-link(:to="{ 'name': 'oppiaineet' }" tag="li")
      a.btn.btn-link {{ $t('oppiaineet') }}
</template>

<script lang="ts">
import _ from 'lodash';
import { Component, Vue } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import { Opetussuunnitelma } from '@/stores/opetussuunnitelma';


@Component
export default class RouteOpetussuunnitelma extends Vue {

  private get sisalto() {
    return Opetussuunnitelma.sisalto;
  }

}
</script>

<style scoped lang="scss" src="./sidenav.scss"></style>

