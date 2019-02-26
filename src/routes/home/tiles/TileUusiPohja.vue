<template lang="pug">
base-tile
  template(slot="icon")
    fas(icon="plus")
  template(slot="header")
    router-link(
      id="etusivu-luo-uusi-pohja"
      :to="{ name: 'uusiPohja' }")
      | {{ $t('tile-uusi-pohja') }}
  template(slot="content")
    p {{ $t('tile-uusi-pohja-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  }
})
export default class extends Vue {
  
}
</script>

<style scoped lang="scss" src="./style.scss"></style>
