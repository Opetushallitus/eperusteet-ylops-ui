<template lang="pug">
  div.icon(:style="{ background: backgroundColor, color: color }")
    fas(:icon="icon")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';

@Component({
  name: 'EpIcon',
})
export default class EpIcon extends Vue {

  @Prop({ required: true })
  private icon!: string;

  @Prop({ default: '#ffffff' })
  private color!: string;

  @Prop({ default: '#3367E3' })
  private backgroundColor!: string;
}
</script>

<style lang="scss" scoped>
.icon {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  text-align: center;
  vertical-align: middle;

  svg {
    width: 30px;
    height: 30px;
    margin-top: 10px;
  }
}
</style>
