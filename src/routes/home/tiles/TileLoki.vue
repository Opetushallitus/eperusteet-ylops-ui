<template lang="pug">
base-tile(icon="arkisto")
  template(slot="header")
    span {{ $t('tile-loki') }}
  template(slot="content")
    p {{ $t('tile-loki-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';

@Component({
  components: {
    BaseTile,
  },
})
export default class TileLoki extends Vue {

}
</script>
