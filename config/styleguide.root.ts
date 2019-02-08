import VueI18n from 'vue-i18n';

const i18n = new VueI18n({
    locale: 'fi',
    messages: {
      fi: require('../src/translations/locale-fi.json'),
    },
  });

  export default previewComponent => {
    return {
      i18n,
      render(createElement) {
        return createElement(previewComponent)
      }
    }
  }