<template lang="pug">
base-tile.tile
  template(slot="icon")
    fas.icon(icon="plus")
  template(slot="header")
    router-link(
      id="etusivu-luo-uusi-opetussuunnitelma",
      :to="{ name: 'uusiOpetussuunnitelma' }")
      | {{ $t('tile-uusi-opetussuunnitelma') }}
  template(slot="content")
    p {{ $t('tile-uusi-opetussuunnitelma-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  }
})
export default class TileUusiOpetussuunnitelma extends Vue {
  
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
