<template>
<div>
  <h1>Debug</h1>
  <ep-collapse>
    <template slot="header">Headeri</template>
    <template slot="content">Contentti</template>
  </ep-collapse>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpCollapse from '@/components/EpCollapse.vue';

@Component({
  components: {
    EpCollapse,
  },
})
export default class Debug extends Vue {
}
</script>
