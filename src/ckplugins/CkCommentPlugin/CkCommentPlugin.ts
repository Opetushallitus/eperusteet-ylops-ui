import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

export default class CkComment extends Plugin {
  static get pluginName() {
    return 'CkComment';
  }

  init() {
    const editor = this.editor;
    this.registerElement(editor, 'commentStart', 'comment-start');
    this.registerElement(editor, 'commentEnd', 'comment-end');
  }

  registerElement(editor, modelKey, viewKey) {
    editor.model.schema.register(modelKey, {
      allowWhere: '$text',
      isObject: true,
    });

    editor.conversion.for('upcast')
      .elementToElement({
        model: ( viewElement, modelWriter ) => modelWriter.createElement( modelKey, {
          uid: viewElement.getAttribute( 'uid' ),
        } ),
        view: {
          name: viewKey,
        }
      });

    editor.conversion.for('downcast')
      .elementToElement({
        model: modelKey,
        view: (data, writer) => writer.createAttributeElement(viewKey, {
          uid: data.getAttribute('uid'),
        }),
      });
  }
}
