import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';

import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';

import KasiteFormView from './ui/KasiteFormView.js';
import AbbrCommand from './abbrCommand.js';
import './CkKasitePlugin.css';

import pluginIcon from './icons/icon.svg';

export default class CkKasitePlugin extends Plugin {
  static get requires() {
    return [ContextualBalloon];
  }

  static get pluginName() {
    return 'CkKasite';
  }

  init() {
    const editor = this.editor;

    // Read ckeditor component instance from from config
    this.vueRef = this.readVueRefFromConfig();

    // Register schema changes & abbr command
    this.registerSchema(editor);
    editor.commands.add('abbr', new AbbrCommand(editor));

    // Create button for toolbar
    this.createButton();

    //
    this.formView = this.createPluginUiForm(editor);
    this.balloon = editor.plugins.get(ContextualBalloon);

    this.registerEventHandlers(editor);
  }

  registerSchema(editor) {
    // Allow abbrData attribute to text nodes
    editor.model.schema
      .extend('$text', { allowAttributes: 'abbrData' });

    // View -> Model conversion ; called from setdata
    editor.conversion.for('upcast')
      .elementToAttribute({
        view: {
          name: 'abbr',
          attributes: {
            'data-viite': true,
          }
        },
        model: {
          key: 'abbrData',
          value: viewElement => viewElement.getAttribute('data-viite'),
        },
      });

    // Model -> view conversion ; called from getdata
    editor.conversion.for('downcast')
      .attributeToElement({
        model: 'abbrData',
        view: (data, writer) => writer.createAttributeElement('abbr', { 'data-viite': data }),
      });
  }

  registerEventHandlers(editor) {
    // Remove UI panel (if esc pressed and ui doesn't have focus)
    editor.keystrokes.set('esc', (data, cancel) => {
      if (this.isPluginUiFormInPanel) {
        this.removePluginUiForm();
        cancel();
      }
    });

    // Remove UI panel, if user clicks ouside the plugin UI
    clickOutsideHandler({
      emitter: this.formView,
      activator: () => this.isPluginUiFormInPanel,
      contextElements: [this.balloon.view.element],
      callback: () => this.removePluginUiForm()
    });

    //
    editor.keystrokes.set('Tab', (data, cancel) => {
      if (this.isPluginUiFormInPanel) {
        this.formView.focus();
        cancel();
      }
    }, {
      priority: 'high',
    });
  }

  createButton() {
    this.editor.ui.componentFactory.add('insertKasite', locale => {
      const view = new ButtonView(locale);

      view.set({
        label: this.vueRef.translateString( 'viittaus-kasitteeseen' ),
        icon: pluginIcon,
        tooltip: true
      });

      view.on('execute', () => {
        this.openPluginUiForm();
      });

      return view;
    });
  }

  readVueRefFromConfig() {
    // config.get doesn't work, because it tries to cast obj reference to string
    const config=this.editor.config._config;
    return config.ckeperusteet && config.ckeperusteet.vue ? config.ckeperusteet.vue : null;
  }

  readTermListFromConfig() {
    const kasiteObj = this.editor.config.get('ckeperusteet.kasitteet');
    const kasiteArr = !kasiteObj ? [] : Object.keys(kasiteObj)
      .map(key => ({ title: kasiteObj[key].title, key }) );

    return [
      { title: this.vueRef.translateString( 'valitse-kasite' ), key: '' },
      ...kasiteArr,
    ];
  }

  createPluginUiForm(editor) {
    const kasitteet = this.readTermListFromConfig();
    const formView = new KasiteFormView(editor.locale, kasitteet, this.vueRef);

    // Listen to 'submit' button click
    this.listenTo(formView, 'submit', () => {
      editor.execute('abbr', formView.kasiteKey);
      this.removePluginUiForm();
    });

    // Listen to cancel button click
    this.listenTo(formView, 'cancel', () => {
      this.removePluginUiForm();
    });

    // Close plugin ui, if esc is pressed (while ui is focused)
    formView.keystrokes.set('esc', (data, cancel) => {
      this.removePluginUiForm();
      cancel();
    });

    return formView;
  }

  openPluginUiForm() {
    // Prevent adding ui twice
    if (this.isPluginUiFormInPanel) {
      return;
    }

    // Create contextual balloon (ui for plugin)
    this.balloon.add({
      view: this.formView,
      position: this.getBalloonPositionData(),
    });
  }

  removePluginUiForm() {
    this.balloon.remove(this.formView);
    this.editor.editing.view.focus();
  }

  get isPluginUiFormInPanel() {
    return this.balloon.hasView(this.formView);
  }

  getBalloonPositionData() {
    const view = this.editor.editing.view;
    const viewDocument = view.document;
    const target = view.domConverter.viewRangeToDom(viewDocument.selection.getFirstRange());
    return { target };
  }
}
