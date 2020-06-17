<template>
<base-tile icon="faq" :route="{ name: 'useinkysytyt' }">
  <template slot="header">
    <span>{{ $t('ukk') }}</span>
  </template>
  <template slot="content">
    <p>{{ $t('ukk-kuvaus') }}</p>
  </template>
</base-tile>
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
