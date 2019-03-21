<template lang="pug">
span.ball(:class="'ball-' + kind")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class EpColorBall extends Vue {
  @Prop({ default: 'normaali' })
  private kind!: 'normaali' | 'pakollinen' | 'syventava' | 'paikallinen';
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.ball {
  border-radius: 50%;
  display: inline-block;
  height: 10px;
  width: 10px;
}

.ball-normaali {
  background: $green-lighten-2;
}

.ball-pakollinen {
  background: #5BCA13;
}

.ball-syventava {
  background: #F166C0;
}

.ball-paikallinen {
  background: orange;
}

</style>
