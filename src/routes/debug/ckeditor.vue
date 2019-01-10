<template>
<div>
  <h1>Debug</h1>

  <h3>Editori 1:</h3>
  <ckeditor id="editor1" v-model="editor1Data" />
  <br/>
  <span v-html="editor1Data"/>
  <br/>

  <br/>

  <h3>Editori 2:</h3>
  <ckeditor id="editor2" v-model="editor2Data"/>
  <br/>
  <span v-html="editor2Data"/>
  <br/>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CKEditor from '@/components/CKEditor/CKEditor.vue';

@Component({
  components: {
    ckeditor: CKEditor,
  },
})

export default class CKEditorDebug extends Vue {
  public data() {
    return {
      editor1Data: '<p>Editori1</p>',
      editor2Data: '<p>Editori2</p>',
    };
  }
}
</script>
