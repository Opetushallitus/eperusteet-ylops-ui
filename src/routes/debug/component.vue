<template>
<div>
  <h1>Debug</h1>
  <Collapse>
    <template slot="header">Headeri</template>
    <template slot="content">Contentti</template>
  </Collapse>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import Collapse from '@/components/collapse/EpCollapse.vue';

@Component({
  components: {
    Collapse,
  },
})
export default class Debug extends Vue {
}
</script>
