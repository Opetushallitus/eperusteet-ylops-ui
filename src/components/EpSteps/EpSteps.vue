<template lang="pug">
div.ep-steps
  .steps(v-if="show")
    span.step(v-for="(data, idx) in value")
      .ball(:class="{ 'active': idx === step }")
        .number {{ idx + 1 }}
      .stepline(v-if="idx < value.length - 1")
      .text {{ $t(data.name) }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpButton from '@/components/EpButton/EpButton.vue';

@Component({
  components: {
    EpButton,
  },
})
export default class EpSteps extends Vue {
  @Prop({ required: true })
  private value!: any[];

  @Prop({ required: true })
  private step!: number;

  get show() {
    return this.value[this.step] && !this.value[this.step].hide;
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/_variables.scss';

.ep-steps {
  display: inline-block;

  .step-content {
    margin: 30px;
  }

  .steps {
    display: flex;

    .step {
      width: 120px;

      .stepline {
        position: relative;
        width: 88px;
        float: right;
        border-bottom: 2px solid #999;
        top: -17px;
        left: 43px;
        z-index: 9;
      }

      .ball {
        margin-left: 43px;
        display: inline-block;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background-color: $paletti-blue-dark;
        z-index: 10;

        .number {
          color: white;
          padding-top: 2px;
          font-size: 20px;
          text-align: center;
          z-index: 11;
        }
      }

      .ball.active {
        background-color: $paletti-blue;
        z-index: 10;
      }

      .text {
        color: #777;
        font-size: 80%;
        text-align: center;
        margin-top: 8px;
        z-index: 12;
      }
    }
  }
}
</style>
