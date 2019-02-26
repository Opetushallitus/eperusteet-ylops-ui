import { Component, Prop, Vue, Watch } from 'vue-property-decorator';

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

@Component
export default class CkEditor extends Vue {

    // Editorin dom-elementin ID
    @Prop({ default: '' })
    private id!: string;

    // Muokattava tieto (tukee v-model:ia)
    @Prop({ required: true })
    private value!: string;

    // Käytetäänkö laajennettua editoria
    @Prop({ default: false })
    private isExtended!: boolean;

    // Editorin käyttöliittymän kieli
    @Prop({ default: 'fi' })
    private locale!: string;

    // CKEditorin JS instanssi
    private instance: any = null;
    private lastEmittedValue: string = '';

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
                    Table,
                    TableToolbar,
                ];

                config.toolbar = [
                    'alignment', 'bold', 'italic',
                    '|',
                    'numberedList', 'bulletedList',
                    '|',
                    'link', 'insertTable',
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

    @Watch('value')
    private onValueChanged(val: string, oldval: string) {
        // Ei reagoida itse aiheutettuihin muutoksiin
        if (val === this.lastEmittedValue) {
            return;
        }

        // Päivitetään editoriin uusi arvo
        this.instance.setData(val ? val : '');
    }

    private setEditorEvents() {
        const editor = this.instance;

        editor.model.document.on('change:data', (event: any) => {
            const data = editor.getData();
            this.lastEmittedValue = data;
            this.$emit('input' , data, event, editor);
        });
    }


}
