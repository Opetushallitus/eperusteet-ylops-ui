 import pluginIcon from './theme/icons/toolbar.svg';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export class CkEditorMathPlugin {

    private editor: any | null = null;

    constructor(editor: any) {
        this.editor = editor;
        this.createButton();

        editor.model.schema.register('span', {
            allowWhere: '$text',
            allowContentOf: '$block',
            isBlock: true,
            allowAttributes: [ 'class' ],
        });

        editor.conversion.elementToElement({model: 'span', view: 'span'});
        editor.conversion.attributeToAttribute({
            model: { name: 'span', key: 'class' },
            view: { name: 'span', key: 'class' },
        });
    }

    // Create button for toolbar (note you still need to add this btn to toolbar array)
    private createButton() {
        this.editor.ui.componentFactory.add( 'insertKatex', (locale: string) => {
            const view = new ButtonView( locale );

            view.set( {
                label: 'Insert katex math',
                icon: pluginIcon,
                tooltip: true,
            } );

            view.on( 'execute', this.openInputModal );

            return view;
        } );
    }

    private openInputModal() {
        const imageURL = prompt( 'Image URL' );
    }
}
