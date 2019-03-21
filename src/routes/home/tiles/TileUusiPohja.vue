<template lang="pug">
base-tile(icon="luo-uusi", :route="{ name: 'uusiPohja' }")
  template(slot="header")
    span {{ $t('tile-uusi-pohja') }}
  template(slot="content")
    p {{ $t('tile-uusi-pohja-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileUusiPohja extends Vue {

}
</script>

<style scoped lang="scss">
</style>
