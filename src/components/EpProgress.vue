<template>
  <div
    class="ep-progress"
    placement="'bottom'"
    id="tila-popover">
    <div>
      <svg viewBox="0 0 100 100" class="vaiheet">
        <circle
          v-for="(v, idx) in slices" :key="idx"
          r="50%" cx="50%" cy="50%"
          :style="'stroke: rgba(91, 202, 19, ' + (v || 0.2) + ');' + 'stroke-dasharray: ' + segmentLength + ' ' + 314.15 + '; stroke-dashoffset: ' + (-idx * gapLength - 2)" />
      </svg>
    </div>

    <b-popover
      target="tila-popover"
      triggers="click hover"
      size="md"
      placement="bottom"
      :show.sync="tilaPopupVisible"
      ref="popover"
      v-if="$slots.default">
      <slot></slot>
    </b-popover>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

@Component
export default class EpProgress extends Vue {
  @Prop({
    default: () => [0.1],
  })
  private slices!: number[];

  private tilaPopupVisible = false;

  get total() {
    return _.size(this.slices);
  }

  get gap() {
    return 0.02;
  }

  get segmentLength() {
    // 2 * Pi * 50% * 100 * <segment length>
    return (this.size - this.gap) * 3.1415 * 0.5 * 2 * 100;
  }

  get gapLength() {
    return this.size * 3.1415 * 0.5 * 2 * 100;
  }

  get size() {
    return 1 / this.total;
  }

}
</script>

<style lang="scss" scoped>
.ep-progress {

  /*
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
  }
  */

  svg.vaiheet {
    margin: 5px;
    background: transparent;
    border-radius: 50%;

    circle {
      fill: none;
      stroke-width: 20;
    }

    circle.stroke-background {
      stroke: rgba(91, 202, 19, 0.4);
    }

    circle.stroke-foreground {
      stroke: rgba(91, 202, 19, 1);
    }

  }
}
</style>
