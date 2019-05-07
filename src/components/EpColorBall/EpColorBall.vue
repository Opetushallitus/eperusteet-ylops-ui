<template lang="pug">
span.ball(:class="'ball-' + kind")
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class EpColorBall extends Vue {
  @Prop({ default: 'normaali' })
  private kind!: 'normaali' | 'pakollinen' | 'valinnainen' | 'paikallinen' | 'offline' | 'online';
}
</script>

<style lang="scss" scoped>
@import '@/styles/_variables.scss';

.ball {
  border-radius: 100%;
  display: inline-block;
  min-height: 10px;
  min-width: 10px;
}

.ball-normaali {
  background: $green-lighten-2;
}

.ball-pakollinen {
  background: #09aee4;
}

.ball-valinnainen {
  background: #F166C0;
}

.ball-paikallinen {
  background: orange;
}

.ball-offline {
  background: #DADADA;
}

.ball-online {
  background: #7CD443;
}

</style>
