<template lang="pug">
//div
  h1 Debug (aikaleima):
  h2 Long
  strong ldt
  p {{ $ldt(value) }}
  strong ld
  p {{ $ld(value) }}
  strong lt
  p {{ $lt(value) }}
  h2 Short
  strong sdt
  p {{ $sdt(value) }}
  strong sd
  p {{ $sd(value) }}
  strong st
  p {{ $st(value) }}
  h2 Ago
  strong ago
  p {{ $ago(value) }}
  h2 ISO
  strong iso
  p {{ $iso(value) }}
  h2 Custom
  strong cdt
  p {{ $cdt(value, 'LLLL') }}

div
  ep-aikaleima(:value="value", type="ago")

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpAikaleima from '@/components/EpAikaleima/EpAikaleima.vue';
@Component({
  components: {EpAikaleima},
})
export default class AikaleimaDebug extends Vue {
  private value = 1548070246000;
}
</script>
