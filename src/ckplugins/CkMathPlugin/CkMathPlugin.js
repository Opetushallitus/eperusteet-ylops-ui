import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

const pluginIcon = require('./icons/icon.svg');

export default class CkMathPlugin extends Plugin {
  static get pluginName() {
    return 'CkMath';
  }

  init() {
    const editor = this.editor;

    // Register schema changes
    this.registerSchema(editor);

    // Create button for toolbar
    this.createButton();
  }

  registerSchema(editor) {
    editor.model.schema.register('mathtex', {
      allowWhere: '$text',
      allowContentOf: '$block',
      isLimit: true,
    });

    editor.conversion.elementToElement({
      model: 'mathtex',
      view: {
        name: 'span',
        classes: 'math-tex'
      }
    });
  }

  createButton() {
    this.editor.ui.componentFactory.add('insertMath', locale => {
      const view = new ButtonView(locale);

      view.set({
        label: 'Lisää katex kaavio',
        icon: pluginIcon,
        tooltip: true
      });

      view.on('execute', () => { });

      return view;
    });
  }
}
