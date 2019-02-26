import { Component, Prop, Vue } from 'vue-property-decorator';

import CkEditor from '@/components/CkEditor/CkEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

@Component({
  components: {
    EpViewer,
    CkEditor,
  },
})
export default class EpContentBase extends Vue {
  @Prop({ required: true })
  private value!: string;

  @Prop({ required: true })
  private isEditable!: boolean;
}
