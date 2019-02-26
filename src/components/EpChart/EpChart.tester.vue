<template lang="pug">
div
  ep-chart(
    :value="value",
    :chartColor="chartColor")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';
import EpChart from './EpChart';

/**
  Älä käytä tätä komponenttia muuhun kuin yksikkötestaukseen / styleguideen
*/
@Component({
  components: {
    EpChart,
  },
})
export default class EpChartTester extends Vue {
  @Prop()
  private value!: Number;

  @Prop()
  private chartColor!: String;
}
</script>