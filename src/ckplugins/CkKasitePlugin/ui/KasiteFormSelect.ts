import View from '@ckeditor/ckeditor5-ui/src/view';

import KasiteFormOption from './KasiteFormOption';

export default class KasiteFormSelect extends View {
  constructor(locale) {
    super(locale);

    const bind = this.bindTemplate;

    const kasitteet = [
      { name: 'Valitse käsite', key: '', isValid: false },
      { name: 'Testikäsite', key: 'key123', isValid: true },
    ];

    let children: KasiteFormOption[] = [];

    kasitteet.forEach(kasite => {
      const option = new KasiteFormOption(locale, kasite);
      children.push(option);
    });

    this.set({
      isValid: false,
      kasiteData: '',
    });

    this.setTemplate({
      tag: 'select',
      children,
      on: {
        change: bind.to('change'),
      }
    });

    this.on('change', e => {
      this.onChangeEvent(e.source.element);
    });
  }

  onChangeEvent(el) {
    const ds = el.options[el.selectedIndex].dataset;
    this.fire('kasitevalittu', ds && ds.key && ds.key !== '' ? ds.key : '');
  }
}
