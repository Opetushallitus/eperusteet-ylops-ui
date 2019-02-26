import { i18n } from '../src/stores/kieli';

export default previewComponent => {
  return {
    i18n,
    render(createElement) {
      return createElement(previewComponent)
    },
  }
};