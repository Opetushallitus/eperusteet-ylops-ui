import View from '@ckeditor/ckeditor5-ui/src/view';
import ViewCollection from '@ckeditor/ckeditor5-ui/src/viewcollection';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';

import checkIcon from '@ckeditor/ckeditor5-core/theme/icons/check.svg';
import cancelIcon from '@ckeditor/ckeditor5-core/theme/icons/cancel.svg';

import submitHandler from '@ckeditor/ckeditor5-ui/src/bindings/submithandler';

import KasiteFormSelect from './KasiteFormSelect.js';

export default class KasiteFormView extends View {
  constructor(locale, kasitteet) {
    super(locale);

    this.set({
      kasiteKey: '',
    });

    // Create key event & focus trackers
    this.createKeyAndFocusTrackers();

    // Create buttons & select element
    const children = this.createUiElements(locale, kasitteet);

    // Add ui elements to template
    this.setTemplate({
      tag: 'form',
      attributes: {
        class: [
          'ck',
          'ck-link-form',
        ],
      },
      children,
    });
  }

  render() {
    super.render();

    // Prevent default form submit event & trigger custom 'submit'
    submitHandler({
      view: this,
    });

    // Register form elements to focusable elements
    const childViews = [
      this.kasiteSelect,
      this.saveBtn,
      this.cancelBtn,
    ];

    childViews.forEach(v => {
      this.focusables.add(v);
      this.focusTracker.add(v.element);
    });

    // Listen to keypresses inside form element
    this.keystrokes.listenTo(this.element);
  }

  focus() {
    this.focusCycler.focusFirst();
  }

  createKeyAndFocusTrackers() {
    this.focusTracker = new FocusTracker();
    this.keystrokes = new KeystrokeHandler();
    this.focusables = new ViewCollection();

    this.focusCycler = new FocusCycler({
      focusables: this.focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        focusPrevious: 'shift + tab',
        focusNext: 'tab'
      }
    });
  }

  createUiElements(locale, kasitteet) {
    // Create save & cancel buttons
    this.saveBtn = this.createButton('Lisää', checkIcon, 'ck-button-save', null);
    this.saveBtn.type = 'submit';
    this.saveBtn.isEnabled = false;
    this.cancelBtn = this.createButton('Peruuta', cancelIcon, 'ck-button-cancel', 'cancel');

    // Create select element
    this.kasiteSelect = new KasiteFormSelect(locale, kasitteet);
    this.kasiteSelect.on('kasitevalittu', (e, data) => {
      this.saveBtn.isEnabled = data !== '';
      this.kasiteKey = data;
    });

    return [
      this.kasiteSelect,
      this.saveBtn,
      this.cancelBtn,
    ];
  }

  createButton(label, icon, className, eventName) {
    const button = new ButtonView(this.locale);
    button.set({ label, icon, tooltip: true });
    button.extendTemplate({ attributes: { class: className } });
    if (eventName) {
      button.delegate('execute').to(this, eventName);
    }
    return button;
  }
}
