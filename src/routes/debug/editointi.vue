<template lang="pug">
div
  ep-editointi(:hooks="hooks")
    ck-editor(v-model="data")
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import EpEditointi from '@/components/EpEditointi/EpEditointi.vue';
import CkEditor from '@/components/CkEditor/CkEditor.vue';

@Component({
  components: {
    EpEditointi,
    CkEditor,
  },
})
export default class EditointiDebug extends Vue {
  private data = '';
  private hooks = {};
}

</script>
