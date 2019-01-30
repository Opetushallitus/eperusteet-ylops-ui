<template lang="pug">
div
  div
    h1 Debug (aikaleima):
    h2 Funktiot

    h3 Long
    strong ldt
    p(id='ldt') {{ $ldt(value) }}
    strong ld
    p(id='ld') {{ $ld(value) }}
    strong lt
    p(id='lt') {{ $lt(value) }}
    h3 Short
    strong sdt
    p(id='sdt') {{ $sdt(value) }}
    strong sd
    p(id='sd') {{ $sd(value) }}
    strong st
    p(id='st') {{ $st(value) }}
    h3 Ago
    strong ago
    p(id='ago') {{ $ago(value) }}
    h3 Custom
    strong cdt
    p(id='cdt') {{ $cdt(value, 'LLLL') }}

    h2 Komponentti
    ep-aikaleima(:value="value", type="ago")

</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpAikaleima from '@/components/EpAikaleima/EpAikaleima.vue';
@Component({
  components: { EpAikaleima },
})
export default class AikaleimaDebug extends Vue {
  private value = 1548070246000;
}
</script>
