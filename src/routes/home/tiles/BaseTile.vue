<template lang="pug">

mixin innertile-content
  .iconline
    ep-icon(:icon="icon", :background-color="color")
  .tile-header
    h3.oph-h3.tileheader
      slot(name="header")
  .tile-content
    slot(name="content")

.tile
  router-link(v-if="route", :to="route")
    .innertile.route-tila
      +innertile-content

  a(v-else-if="href", :href="href")
    .innertile.route-tila
      +innertile-content

  .innertile(v-else)
    +innertile-content

</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';
import { EpIcon } from '@/components';

@Component({
  components: {
    EpIcon,
  }
})
export default class BaseTile extends Vue {
  @Prop({ required: true })
  private icon!: string;

  @Prop({ default: '#3367E3' })
  private color!: string;

  @Prop()
  private route!: object | string;

  @Prop()
  private href!: string;
}
</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

$tile-height: 300px;
$tile-width: 540px;

.tile {
  background: inherit;
  width: $tile-width;
  margin: 15px 15px;
  text-align: center;

  .innertile {
    padding: 20px;
    min-height: $tile-height;
    background: $etusivu-tile-background;
    border: 1px solid #eee;
    border-radius: 10px;
    box-shadow: 2px 2px 3px #eee;

    .tile-content {
      overflow: hidden;
      color: black;
    }

    .iconline {
      display: flex;
      justify-content: center;
      padding: 10px;
    }
  }

  .content {
    font-size: 85%;
  }
}

.route-tila {
  &:hover {
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
  }
}

</style>
