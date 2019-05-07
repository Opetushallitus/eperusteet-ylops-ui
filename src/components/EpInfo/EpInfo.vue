<template lang="pug">
span.ball i
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class EpColorBall extends Vue {
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.ball {
  border-radius: 100%;
  display: inline-block;
  min-height: 20px;
  min-width: 20px;
}

</style>
