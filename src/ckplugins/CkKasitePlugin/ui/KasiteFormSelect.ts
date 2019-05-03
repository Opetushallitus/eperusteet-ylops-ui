import View from '@ckeditor/ckeditor5-ui/src/view';

import KasiteFormOption from './KasiteFormOption';

export default class KasiteFormSelect extends View {
  constructor(locale, kasitteet: any[]) {
    super(locale);

    const bind = this.bindTemplate;

    let children: KasiteFormOption[] = [];

    kasitteet.forEach(kasite => {
      const option = new KasiteFormOption(locale, kasite);
      children.push(option);
    });

    this.set({
      isValid: false,
      kasiteData: '',
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
      children,
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
