import { Component, Prop, Vue } from 'vue-property-decorator';

import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

import { EditorLayout } from '@/tyypit';

@Component({
  components: {
    EpViewer,
    CkEditor,
  },
})
export default class EpContentBase extends Vue {

  @Prop() private value!: string;

  // Jos (true), näytetään ckeditor, muuten epviewer
  @Prop() private isEditable!: boolean;

  // CkEditorin layout (määrittää ominaisuudet)
  @Prop({ default: EditorLayout.simplified }) private layout!: EditorLayout;

}
