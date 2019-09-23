<template>
  <div :class="{ 'innertile': true, 'route-button': effectEnabled}">
    <div class="tile-header">
      <h3 class="oph-h3 tileheader">
        <slot name="header"></slot>
      </h3>
    </div>
    <div class="iconline">
      <ep-icon :icon="icon" :color="correctColor" background-color="white"></ep-icon>
    </div>
    <div class="tile-content">
      <slot name="content"></slot>
    </div>
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
export default class BaseInnerTile extends Vue {
  @Prop({ required: true })
  private icon!: string;

  @Prop({ default: '#071A58' })
  private color!: string;

  @Prop({ default: { hover: false, focus: false } })
  private effects!: any;

  get effectEnabled() {
    if (this.effects.hover || this.effects.focus) {
      return true;
    }
    return false;
  }

  get correctColor() {
    if (this.effectEnabled) {
      return '#3467e3';
    }
    return this.color;
  }
}
</script>

<style scoped lang="scss">

@import '@/styles/_variables.scss';
@import '@/styles/_mixins.scss';

$tile-height: 300px;
$tile-width: 540px;

.innertile {
  cursor: pointer;
  min-height: $tile-height;
  background: $etusivu-tile-background;
  border: 1px solid #eee;
  border-radius: 10px;
  user-select: none;
  @include tile-background-shadow;

  .tile-header {
    height: 120px;
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

.route-button {
  @include tile-background-shadow-selected;
}

</style>
