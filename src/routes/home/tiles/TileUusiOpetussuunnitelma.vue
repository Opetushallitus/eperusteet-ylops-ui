<template lang="pug">
base-tile
  template(slot="icon")
    fas(icon="landmark")
  template(slot="header")
    span {{ $t('tile-uusi-opetussuunnitelma') }}
  template(slot="content")
    p {{ $t('tile-uusi-opetussuunnitelma-kuvaus') }}
    router-link.btn.btn-primary(
      id="etusivu-luo-uusi-opetussuunnitelma"
      disabled,
      :to="{ name: 'uusiPohja' }",
      tag="button") {{ $t('luo-uusi') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  }
})
export default class TileOpetussuunnitelmat extends Vue {
  
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
