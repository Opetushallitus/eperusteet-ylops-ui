import { Kielet, i18n } from '../src/stores/kieli';

export default previewComponent => {
  return {
    Kielet,i18n,
    render(createElement) {
      return createElement(previewComponent)
    }
  }
};