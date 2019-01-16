import { Component, Prop, Vue } from 'vue-property-decorator';

import CKEditor from '@/components/CKEditor/CKEditor.vue';
import EpViewer from '@/components/EpViewer/EpViewer.vue';

@Component({
  name: 'EpContent',
  components: {
    epviewer: EpViewer,
    ckeditor: CKEditor,
  },
})
export default class EpContent extends Vue {
    @Prop() private value!: string;
    @Prop() private isEditable!: boolean;
}
