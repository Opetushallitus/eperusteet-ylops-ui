import Command from '@ckeditor/ckeditor5-core/src/command';

export default class abbrCommand extends Command {
  constructor(editor) {
    super(editor);
    this.editor = editor;
  }

  refresh() {
    const model = this.editor.model;
    const doc = model.document;

    this.value = doc.selection.getAttribute('abbrData');
    this.isEnabled = model.schema.checkAttributeInSelection(doc.selection, 'abbrData');
  }

  execute(data) {
    const model = this.editor.model;
    const selection = model.document.selection;

    model.change(writer => {
      // selection.isCollapsed = true, if nothing is selected
      if (!selection.isCollapsed) {
        const ranges = selection.getRanges();
        for (const range of ranges) {
          writer.setAttribute('abbrData', data, range);
        }
      }
    });
  }
}
