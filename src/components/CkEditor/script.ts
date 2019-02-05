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

import '@ckeditor/ckeditor5-build-classic/build/translations/fi.js';
import '@ckeditor/ckeditor5-build-classic/build/translations/sv.js';

import { CkEditorMathPlugin } from '@/plugins/CkEditorMath/CkEditorMath';

@Component({
    name: 'CkEditor',
})
export default class CkEditor extends Vue {

    // Editorin dom-elementin ID
    @Prop({ default: '' }) private id!: string;

    // Muokattava tieto (tukee v-model:ia)
    @Prop() private value!: string;

    // Käytetäänkö laajennettua editoria
    @Prop({ default: false }) private isExtended!: boolean;

    // Editorin käyttöliittymän kieli
    @Prop({ default: 'fi' }) private locale!: string;

    // CKEditorin JS instanssi
    private instance: any = null;

    public async mounted() {
        // Luodaan ckeditor instanssi
        try {
            // Perustilan asetukset
            const config: any = {
                language: this.locale,
                plugins: [
                    Bold,
                    Italic,
                    Clipboard,
                    Essentials,
                    ParagraphPlugin,
                ],
                toolbar: [
                    'bold', 'italic',
                    '|',
                    'undo', 'redo',
                ],
            };

            // Laajennetun tilan asetukset
            if (this.isExtended) {
                config.plugins = [
                    ...config.plugins,
                    Alignment,
                    Image,
                    ImageStyle,
                    ImageToolbar,
                    LinkPlugin,
                    ListPlugin,
                    CkEditorMathPlugin,
                    Table,
                    TableToolbar,
                ];

                config.toolbar = [
                    'alignment', 'bold', 'italic',
                    '|',
                    'numberedList', 'bulletedList',
                    '|',
                    'link', 'insertTable', 'insertKatex',
                    '|',
                    'undo', 'redo',
                ];

                config.image = {
                    toolbar: [
                        'imageTextAlternative',
                        '|',
                        'imageStyle:full',
                        'imageStyle:side',
                    ],
                };
            }

            // Instanssin luonti
            this.instance = await ClassicEditor
                .create(this.$refs.ckeditor, config);
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
