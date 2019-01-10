<template lang="pug">
div
  h1 Debug
  pre {{ debug }}
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpCollapse from '@/components/EpCollapse.vue';
import { Kayttajat } from '@/stores/kayttaja';
import { Kielet } from '@/stores/kieli';


@Component({
  components: {
    EpCollapse,
  },
})
export default class Debug extends Vue {
  get debug() {
    return {
      kayttaja: Kayttajat.tiedot,
    };
  }
}
</script>
