<template lang="pug">
base-tile(icon="valtakunnalliset-perusteet", :href="'https://eperusteet.opintopolku.fi/#/' + kieli")
  template(slot="header")
    span {{ $t('tile-perusteet') }}
  template(slot="content")
    p {{ $t('tile-perusteet-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import { Kielet } from '@/stores/kieli';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileOpetussuunnitelmat extends Vue {
  private get kieli() {
    return Kielet.getUiKieli();
  }
}
</script>

<style scoped lang="scss">
</style>
