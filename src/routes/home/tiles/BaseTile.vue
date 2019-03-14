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

}
</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

$tile-height: 360px;
$tile-width: 440px;

.tile {
  background: inherit;
  width: $tile-width;
  flex: 0 0 $tile-width;
  margin: 8px 8px 28px;
  text-align: center;

  .innertile {
    padding: 20px;
    min-height: $tile-height;
    background: $etusivu-tile-background;
    border: 1px solid #eee;
    border-radius: 6px;
    box-shadow: 2px 2px 3px #eee;

    .tile-content {
      overflow: hidden;
      color: black;
    }

    .iconline {
      display: flex;
      justify-content: center;
      padding: 10px;

      .icon {
        background: #3367E3;
        width: 52px;
        height: 52px;
        border-radius: 26px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        color: white;

        svg {
          width: 36px;
          height: 36px;
          margin-top: 8px;
        }
      }
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
