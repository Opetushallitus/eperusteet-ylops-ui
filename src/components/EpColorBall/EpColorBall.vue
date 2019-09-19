<template>
<span ref="ball"
      :title="$t(kind)"
      :class="spanClass">
  <b-tooltip v-if="tooltip"
             :target="() => $refs['ball']"
             placement="top"
             triggers="hover">
    {{ $t(kind) }}
  </b-tooltip>
</span>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component
export default class EpColorBall extends Vue {
  @Prop({ default: 'normaali' })
  private kind!: 'normaali' | 'pakollinen' | 'valinnainen' | 'paikallinen' | 'offline' | 'online';

  @Prop({ default: true})
  private tooltip!: boolean;


  private get spanClass() {
    return `ball ball-${this.kind}${this.tooltip ? ' ball-tooltip' : ''}`;
  }
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
  background: black;
}

.ball-pakollinen {
  background: #bddb8a;
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

.ball-tooltip {
  cursor: help;
}

</style>
