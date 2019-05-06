import View from '@ckeditor/ckeditor5-ui/src/view';

import KasiteFormOption from './KasiteFormOption';

export default class KasiteFormSelect extends View {
  constructor(locale, kasitteet: any[]) {
    super(locale);

    const bind = this.bindTemplate;

    this.set({
      tabindex: -1,
    });

    this.setTemplate({
      tag: 'select',
      attributes: {
        class: [
          'ck',
          'ck-kasite-select',
        ],
      },
      children: kasitteet.map(kasite => new KasiteFormOption(locale, kasite)),
      tabindex: bind.to('tabindex'),
      on: {
        change: bind.to('change'),
      }
    });

    this.on('change', e => {
      this.onChangeEvent(e.source.element);
    });
  }

  focus() {
    this.element.focus();
  }

  onChangeEvent(el) {
    const ds = el.options[el.selectedIndex].dataset;
    this.fire('kasitevalittu', ds && ds.key && ds.key !== '' ? ds.key : '');
  }
}
