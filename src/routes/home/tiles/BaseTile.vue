<template lang="pug">
.tile
  .innertile
    .iconline
      .icon(:style="{ background: color }")
        fas(:icon="icon")
    .tile-header
      h3.oph-h3.tileheader
        slot(name="header")
    .tile-content
      slot(name="content")
</template>

<script lang="ts">
import { Vue, Prop, Component } from 'vue-property-decorator';

@Component
export default class BaseTile extends Vue {
  @Prop({ required: true })
  private icon!: string;

  @Prop({ default: '#3367E3' })
  private color!: string;
}
</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';

$tile-height: 280px;
$tile-width: 440px;

.tile {
  background: inherit;
  width: $tile-width;
  min-height: $tile-height;
  flex: 0 0 $tile-width;
  margin-bottom: 28px;
  margin: 8px;
  text-align: center;

  .innertile {
    padding: 20px;
    min-height: $tile-height;
    background: $etusivu-tile-background;
    border: 1px solid #eee;
    border-radius: 6px;
    box-shadow: 2px 2px 3px #eee;

    &:hover {
      box-shadow: 0px 5px 20px rgba(0, 0, 0, 0.1);
    }

    .tile-content {
      overflow: hidden;
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
        box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
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

</style>
