<template lang="pug">
div
  ep-navigation(tyyli="ops")
  .opetussuunnitelma
    .header
    .content
      div.titlerow
        ep-icon(icon="bell", background-color="#000000")
        div.titlecontent
          h2 {{ $t('tiedotteet') }}
          p Täältä löydät Opetushallituksen tiedotteet. Voit myös julkaista omia paikallisia tiedotteita organisaatiollesi.
      div.tiedote(
        v-for="tiedote in tiedotteet"
        key="tiedote.id")
        ep-aikaleima.aika(:value="tiedote.aika" type="sd")
        p.otsikko {{tiedote.title}}
        p.sisus {{tiedote.content}}
</template>

<script lang="ts">
import { Vue, Component, Mixins } from 'vue-property-decorator';

import EpRoute from '@/mixins/EpRoot';

import {
  EpAikaleima,
  EpIcon,
  EpNavigation,
  EpSpinner,
} from "@/components";

@Component({
  components: {
    EpAikaleima,
    EpNavigation,
    EpSpinner,
    EpIcon,
  },
})
export default class RouteTiedotteet extends Mixins(EpRoute) {

  //
  private tiedotteet = [
    {
      id: 1,
      aika: 1514808000000,
      title: 'Tiedote 1 otsikko',
      content: 'Tiedote 1 sisältö',
    }, {
      id: 2,
      aika: 1515008000000,
      title: 'Tiedote 2 otsikko',
      content: 'Tiedote 2 sisältö',
    },
  ];

}
</script>

<style scoped lang="scss">
.titlerow {
  display: flex;
}

.tiedote {
  margin-left: 62px;

  .otsikko {
    font-size: 16pt;
  }
}
</style>
