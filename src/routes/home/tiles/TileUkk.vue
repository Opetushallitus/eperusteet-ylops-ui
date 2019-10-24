<template lang="pug">
base-tile(icon="ukk", :route="{ name: 'useinkysytyt' }")
  template(slot="header")
    span {{ $t('ukk') }}
  template(slot="content")
    p {{ $t('ukk-kuvaus') }}
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import BaseTile from './BaseTile.vue';
import EpIcon from '@/components/EpIcon/EpIcon.vue';

@Component({
  components: {
    BaseTile,
    EpIcon,
  },
})
export default class TileUkk extends Vue {

}
</script>
