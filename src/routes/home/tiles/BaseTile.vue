<template lang="pug">
.tile.d-flex
  .left.p-2
    .icon
      slot(name="icon")
  .right.p-2.flex-grow-1
    .header
      h3.oph-h3
        slot(name="header")
    .content
      slot(name="content")
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';

@Component
export default class TileFaq extends Vue {

}
</script>

<style scoped lang="scss">
.tile {
  flex: 0 0 440px;
  margin-bottom: 28px;

  .content {
    font-size: 85%;
  }
}

</style>
