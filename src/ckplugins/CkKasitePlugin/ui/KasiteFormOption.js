import View from '@ckeditor/ckeditor5-ui/src/view';

export default class KasiteFormOption extends View {
  constructor(locale, kasite) {
    super(locale);

    this.setTemplate({
      tag: 'option',
      attributes: {
        'data-key': kasite.key,
      },
      children: [
        kasite.title,
      ]
    });
  }
}
