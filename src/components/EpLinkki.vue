<template lang="pug">
div.linkki
  a(:href="url") {{ url }}
</template>

<script lang="ts">
import { Prop, Component, Vue } from 'vue-property-decorator';

@Component
export default class EpLinkki extends Vue {
  @Prop()
  private url!: string;

  @Prop({
    required: false,
  })
  private label!: string;
}
</script>

<style scoped lang="scss">
.linkki {
  font-size: small;

  a {
    color: black;
  }
}
</style>

