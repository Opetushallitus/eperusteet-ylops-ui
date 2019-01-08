<template>
<div>
  <h1>Debug</h1>
  Editori 1:<br/>
  <ckeditor id="editor1" v-model="editor1Data" />
  <br/>
  Editori 2:<br/>
  <ckeditor id="editor2" v-model="editor2Data"/>
  <br/>
  Editori 3 (not editable):<br/>
  <ckeditor id="editor3" :editable="false" v-model="editor3Data"/>
</div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import CKEditor from '@/components/ckeditor/component.vue';

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
