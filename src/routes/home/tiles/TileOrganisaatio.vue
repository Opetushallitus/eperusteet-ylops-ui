<template lang="pug">
base-tile(icon="tyoryhma", color="#82D4FF", :route="{ name: 'organisaatio' }")
  template(slot="header")
    span {{ $t('tile-organisaatio') }}
  template(slot="content")
    p {{ $t('tile-organisaatio-kuvaus') }}
    b-row.henkilot
      b-col(sm="6")
        ep-color-ball.mr-2
        span Henkilö X
      b-col(sm="6")
        ep-color-ball.mr-2
        span Henkilö Y
      b-col(sm="6")
        ep-color-ball.mr-2
        span Henkilö Z
    p.mt-3 {{ $t('nayta-lisaa') }}

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import {
  EpColorBall,
} from '@/components';

@Component({
  components: {
    BaseTile,
    EpColorBall,
  },
})
export default class TileOrganisaatio extends Vue {

}
</script>

<style scoped lang="scss">
.henkilot {
  margin: 5px;

}
</style>
