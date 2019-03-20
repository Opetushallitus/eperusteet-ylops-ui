<template lang="pug">
base-tile.tile(icon="plus", :route="{ name: 'uusiOpetussuunnitelma' }")
  template(slot="header")
    span {{ $t('tile-uusi-opetussuunnitelma') }}
  template(slot="content")
    p {{ $t('tile-uusi-opetussuunnitelma-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileUusiOpetussuunnitelma extends Vue {

}
</script>
