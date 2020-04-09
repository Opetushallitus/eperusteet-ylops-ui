<template>
  <div
    class="ep-progress"
    placement="'bottom'"
    id="tila-popover">

    <div v-if="!slices">
      <svg viewBox="0 0 100 100" class="vaiheet animation">
        <circle r="50%" cx="50%" cy="50%" style="stroke: rgba(91, 202, 19, 1); stroke-dasharray: 72.2566, 314.15; stroke-dashoffset: -2;"></circle>
        <circle r="50%" cx="50%" cy="50%" style="stroke: rgba(91, 202, 19, 0.4); stroke-dasharray: 72.2566, 314.15; stroke-dashoffset: -80.5398;"></circle>
        <circle r="50%" cx="50%" cy="50%" style="stroke: rgba(91, 202, 19, 1); stroke-dasharray: 72.2566, 314.15; stroke-dashoffset: -159.08;"></circle>
        <circle r="50%" cx="50%" cy="50%" style="stroke: rgba(91, 202, 19, 0.4); stroke-dasharray: 72.2566, 314.15; stroke-dashoffset: -237.619;"></circle>
      </svg>
    </div>

    <div v-else-if="done">
      <div class="done-icon">
        <fas icon="check"/>
      </div>
      <svg viewBox="0 0 100 100" class="vaiheet">
        <circle r="50%" cx="50%" cy="50%" stroke="rgba(91, 202, 19, 1)"/>
      </svg>
    </div>

    <div v-else-if="hasValidation">
      <svg viewBox="0 0 100 100" class="vaiheet" style="transform: rotate(-90deg)">
        <circle
          v-for="(v, idx) in slices" :key="idx"
          r="50%" cx="50%" cy="50%"
          :style="'stroke: rgba(91, 202, 19, ' + (v || 0.4) + ');' + 'stroke-dasharray: ' + segmentLength + ' ' + 314.15 + '; stroke-dashoffset: ' + (-idx * gapLength -2)"/>
      </svg>
    </div>

  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import _ from 'lodash';

@Component
export default class EpProgress extends Vue {
  @Prop()
  private slices!: number[] | null;

  private tilaPopupVisible = false;

  get done() {
    return _.size(_.filter(this.slices, (slice) => slice === 1)) === _.size(this.slices);
  }

  get total() {
    return _.size(this.slices);
  }

  get gap() {
    return 0.02;
  }

  get segmentLength() {
    return (this.size - this.gap) * Math.PI * 0.5 * 2 * 100;
  }

  get gapLength() {
    return this.size * Math.PI * 0.5 * 2 * 100;
  }

  get hasValidation() {
    return this.total !== 0;
  }

  get size() {
    return 1 / this.total;
  }
}
</script>

<style lang="scss" scoped>
@import '@shared/styles/_variables.scss';

.ep-progress {

  /*
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    cursor: pointer;
  }
  */

  .done-icon {
    font-size: 2rem;
    position: absolute;
    margin-left: 35px;
    margin-top: 25px;
    color: $white;
  }

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

  svg.animation {
    animation: rotate 4.5s ease infinite;
  }

  @keyframes rotate {
    0% { -webkit-transform: rotate(0deg); }
    20% { -webkit-transform: rotate(90deg); }
    25% { -webkit-transform: rotate(90deg); }
    45% { -webkit-transform: rotate(180deg); }
    50% { -webkit-transform: rotate(180deg); }
    70% { -webkit-transform: rotate(270deg); }
    75% { -webkit-transform: rotate(270deg); }
    100% { -webkit-transform: rotate(360deg); }
  }

}

</style>
