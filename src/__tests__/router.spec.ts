import { mount, createLocalVue } from '@vue/test-utils';
import { Kielet, i18n } from '@/stores/kieli';
import { router } from '@/router';
import { Opetussuunnitelmat } from '@/api';

import App from '@/App.vue';

import '@/config/bootstrap';
import '@/config/fontawesome';

describe('Router', () => {
  function createMounted() {
    return mount({
      router,
      i18n,
      render: (h) => h(App),
    }, {
      localVue: createLocalVue(),
    });
  }

  test('Creation', () => {
    const opetussuunnitelmatMock = jest.spyOn(Opetussuunnitelmat, 'getAll');
    opetussuunnitelmatMock.mockImplementationOnce(async () => {
      return [];
    });

    const spyWarn = jest.spyOn(console, 'warn');
    const spyError = jest.spyOn(console, 'error');

    const app = createMounted();
    expect(spyError).not.toBeCalled();
    expect(spyWarn).not.toBeCalled();
  });

});
