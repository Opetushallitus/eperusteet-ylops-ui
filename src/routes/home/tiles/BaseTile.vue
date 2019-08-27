<template>
  <div class="tile">
    <component
      tag="div"
      role="button"
      :is="route ? 'router-link' : 'a'"
      :href="href && href"
      :to="route && route">
      <div class="innertile route-tila">
        <div class="tile-header">
          <h3 class="oph-h3 tileheader">
            <slot name="header"></slot>
          </h3>
        </div>
        <div class="iconline">
          <ep-icon :icon="icon" color="black" background-color="white"></ep-icon>
        </div>
        <div class="tile-content">
          <slot name="content"></slot>
        </div>
      </div>
    </component>
  </div>
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
    cursor: pointer;
    width: 502px;
    min-height: $tile-height;
    background: $etusivu-tile-background;
    border: 1px solid #eee;
    border-radius: 10px;
    box-shadow: 5px 5px 20px 1px rgba(0,45,153,0.08);

    .tile-header {
      height: 120px;
      width: 500px;
      border-radius: 10px 10px 0 0;
      background: linear-gradient(180deg, #1E49CF 0%, #0f3284 100%);
      color: white;
      padding-top: 30px;
    }

    .tile-content {
      overflow: hidden;
      color: $dark-blue;
      margin-top: -20px;
    }

    .iconline {
      position: relative;
      top: -37px;
      display: flex;
      justify-content: center;
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
