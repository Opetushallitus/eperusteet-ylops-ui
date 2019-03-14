<template lang="pug">
base-tile(icon="users", color="#82D4FF")
  template(slot="header")
    span {{ $t('tile-organisaatio') }}
  template(slot="content")
    p {{ $t('tile-organisaatio-kuvaus') }}
    b-row.henkilot
      b-col.henkilo(sm="6")
        span.nimi Henkilö X
      b-col.henkilo(sm="6")
        span.nimi Henkilö Y
      b-col.henkilo(sm="6")
        span.nimi Henkilö Z
    button.btn.btn-link {{ $t('nayta-lisaa') }}

</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileOrganisaatio extends Vue {

}
</script>

<style scoped lang="scss">
.henkilot {
  margin: 5px;

  .henkilo {
  }
}
</style>
