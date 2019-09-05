<template>
  <div class="tile">
    <!-- Todo: Onko parempaa tapaa välittää slotit alikomponentille? -->
    <!-- router-link täytyy olla a, jotta navigointi onnistuu näppäimistöllä -->
    <router-link
      v-if="route"
      :to="route && route"
      tag="a">
      <base-inner-tile :icon="icon" :color="color">
        <template slot="header">
          <slot name="header"></slot>
        </template>
        <template slot="content">
          <slot name="content"></slot>
        </template>
      </base-inner-tile>
    </router-link>
    <a
      v-else
      :href="href && href">
      <base-inner-tile :icon="icon" :color="color">
        <template slot="header">
          <slot name="header"></slot>
        </template>
        <template slot="content">
          <slot name="content"></slot>
        </template>
      </base-inner-tile>
    </a>
  </div>
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { EpIcon } from '@/components';
import BaseInnerTile from './BaseInnerTile.vue';

@Component({
  components: {
    EpIcon,
    BaseInnerTile,
  }
})
export default class BaseTile extends Vue {
  @Prop({ required: true })
  private icon!: string;

  @Prop()
  private color!: string;

  @Prop()
  private route!: object | string;

  @Prop()
  private href!: string;
}
</script>

<style scoped lang="scss">

$tile-width: 540px;

.tile {
  background: inherit;
  width: $tile-width;
  margin: 15px 15px;
  text-align: center;
}

</style>
