import Command from '@ckeditor/ckeditor5-core/src/command';
import toMap from '@ckeditor/ckeditor5-utils/src/tomap';

export default class abbrCommand extends Command {

  constructor(editor) {
    super(editor);
    this.editor = editor;
  }

	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( 'abbrData' );
		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'abbrData' );
  }

  execute( data ) {
		const model = this.editor.model;
    const selection = model.document.selection;

    model.change( writer => {
      if(selection.isCollapsed ) {
        // Miten tänne yleensä joudutaan?
      }
      else {
        console.log("!");
        const ranges = model.schema.getValidRanges( selection.getRanges(), 'abbrData' );
        for ( const range of ranges ) {
          console.log("Peek-a-boo");
          writer.setAttribute( 'abbrData', data, range );
        }
      }
    } );
  }

}