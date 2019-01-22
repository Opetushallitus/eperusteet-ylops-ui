import { Component, Prop, Vue } from 'vue-property-decorator';

import CKEditor from '@/components/CKEditor/CKEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

@Component({
  name: 'EpContentBase',
  components: {
    'ep-viewer': EpViewer,
    'ck-editor': CKEditor,
  },
})
export default class EpContentBase extends Vue {
    @Prop() private value!: string;
    @Prop() private isEditable!: boolean;
}
