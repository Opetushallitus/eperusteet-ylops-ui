import { Component, Prop, Vue } from 'vue-property-decorator';

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';

import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import LinkPlugin from '@ckeditor/ckeditor5-link/src/link';
import ListPlugin from '@ckeditor/ckeditor5-list/src/list';
import ParagraphPlugin from '@ckeditor/ckeditor5-paragraph/src/paragraph';

import Table from '@ckeditor/ckeditor5-table/src/table';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageToolbar from '@ckeditor/ckeditor5-image/src/imagetoolbar';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';

// Current time in milliseconds
const defaultId = () => new Date().getTime();

@Component
export default class CKEditor extends Vue {

    @Prop({ default: 'ckeditor-' + defaultId() }) private id!: string;
    @Prop() private value!: string;

    //
    private instance: any = null;

    public async mounted() {
        // Setup ckeditor
        try {
            this.instance = await ClassicEditor
                .create(document.getElementById(this.id), {
                    plugins: [
                        Alignment,
                        Bold,
                        Clipboard,
                        Essentials,
                        Image,
                        ImageStyle,
                        ImageToolbar,
                        Italic,
                        LinkPlugin,
                        ListPlugin,
                        ParagraphPlugin,
                        Table,
                        TableToolbar,
                    ],
                    toolbar: [
                        'alignment', 'bold', 'italic',
                        '|',
                        'numberedList', 'bulletedList',
                        '|',
                        'link', 'insertTable',
                        '|',
                        'undo', 'redo',
                    ],
                    image: {
                        toolbar: [
                            'imageTextAlternative', '|', 'imageStyle:full', 'imageStyle:side' ],
                    },
                });
            this.instance.setData(this.value);
            this.setEditorEvents();
        } catch (err) {
            console.error(err);
        }
    }

    public beforeDestroy() {
        if (this.instance) {
            this.instance.destroy();
            this.instance = null;
        }
    }

    private setEditorEvents() {
        const editor = this.instance;

        editor.model.document.on('change:data', (event: any) => {
            const data = editor.getData();
            this.$emit('input' , data, event, editor);
        });
    }

}
