<template lang="pug">
div
  ep-navigation(tyyli="ops")
  .opetussuunnitelma
    .header
    .content
      div.titlerow
        div.icon
          fas(icon="question")
        div.titlecontent
          h2 {{ $t('faq') }}
          p Täältä löydät useimmin kysytyt kysymykset. Voit suodattaa tuloksia organisaation perusteella.
      div.kysymys(
        v-for="kysymys in kysymykset"
        key="kysymys.id")
        ep-aikaleima.aika(:value="kysymys.aika" type="sd")
        p.otsikko {{kysymys.title}}
        p.sisus {{kysymys.content}}
        p.kommentti
          fas(:icon="['far','comment']")
          span {{ $t('kommentoi') }}
          span.qty 3 kommenttia
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
export default class RouteUkk extends Mixins(EpRoute) {
  //
  private kysymykset = [
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
    background: #CE52C6;
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

.kysymys {
  margin-left: 62px;

  .otsikko {
    font-size: 16pt;
  }

  .kommentti {
    svg {
      margin-right: 5px;
      transform: scale(-1, 1);
    }

    .qty {
      margin-left: 20px;
    }
  }
}

</style>
