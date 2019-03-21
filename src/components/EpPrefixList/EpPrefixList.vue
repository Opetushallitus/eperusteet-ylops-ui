<template lang="pug">
div
  div(v-for="alue in alueet")
    div {{ $kaanna(alue[kohde]) }}
    ul
      li(v-for="x in alue[arvot]") {{ $kaanna(x) }}
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import { EpContent } from '@/components';
import _ from 'lodash';

@Component({
  components: {
    EpContent,
  },
})
export default class RouteOpintojakso extends Vue {
  @Prop({ required: true })
  private value!: any;

  @Prop({ default: 'kohde' })
  private kohde!: string;

  @Prop({ default: 'arvot' })
  private arvot!: string;

  get alueet() {
    if (_.isArray(this.value)) {
      return this.value;
    }
    else {
      return [this.value];
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
