<template lang="pug">
div
  h1 Debug (ckeditor):
  h3 Editori 1 (basic):
  ck-editor(v-model="editor1Data")
  br
  ep-viewer(v-model="editor1Data")
  br
  h3 Editori 2 (extended):
  ck-editor(v-model="editor2Data"
    :isExtended="true")
  br
  ep-viewer(v-model="editor2Data")
  br
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

@Component({
  components: {
    CkEditor,
    EpViewer,
  },
})

export default class CkEditorDebug extends Vue {
  private editor1Data: string = '<p>Editori1</p>';
  private editor2Data: string = '<p>Editori2</p>' +
    '<p><span class="math-tex">x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}</span></p>' +
    '<p><span class="math-tex">x = {-b \\pm \\sqrt{b^2-4ac} \\over 2a}</span></p>';
  }
</script>
