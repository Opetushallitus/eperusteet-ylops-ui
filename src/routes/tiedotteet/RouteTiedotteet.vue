<template lang="pug">
div
  ep-navigation(tyyli="ops")
  .opetussuunnitelma
    .header
    .content
      div.titlerow
        div.icon
          fas(icon="bell")
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
  EpNavigation,
  EpSpinner,
} from '@/components';

@Component({
  components: {
    EpAikaleima,
    EpNavigation,
    EpSpinner,
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

  .icon {
    background: #000000;
    width: 52px;
    height: 52px;
    border-radius: 26px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    color: white;
    text-align: center;
    margin-right: 10px;

    svg {
      width: 36px;
      height: 36px;
      margin-top: 8px;
    }
  }
}

.tiedote {
  margin-left: 62px;

  .otsikko {
    font-size: 16pt;
  }
}
</style>