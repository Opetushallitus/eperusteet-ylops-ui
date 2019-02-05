import { mount, createLocalVue } from '@vue/test-utils';
import { Kielet, i18n } from '@/stores/kieli';
import { router } from '@/router';
import { Opetussuunnitelmat } from '@/api';

import App from '@/App.vue';

import '@/config/bootstrap';
import '@/config/fontawesome';

import { rootConfig } from '@/mainvue';

describe('Router', () => {
  function createMounted() {
    jest.spyOn(Opetussuunnitelmat, 'getAll')
      .mockImplementation(async (): Promise<any> => []);
    jest.spyOn(Opetussuunnitelmat, 'getAdminList')
      .mockImplementation(async (): Promise<any> => []);

    return mount(rootConfig, {
      localVue: createLocalVue(),
    });
  }

  beforeEach(() => {
    router.push({
      name: 'root',
      params: {
        lang: 'fi',
      },
    });
  });

  test('App creation', () => {
    const spyWarn = jest.spyOn(console, 'warn');
    const spyError = jest.spyOn(console, 'error');
    const app = createMounted();
    expect(spyError).not.toBeCalled();
    expect(spyWarn).not.toBeCalled();
  });

  test('Navigation - Root', async () => {
    const app = createMounted();
    expect(router.currentRoute.name).toEqual('root');
    expect(router.currentRoute.params).toEqual({ lang: 'fi' });

    router.push({
      name: 'root',
      params: { lang: 'sv' },
    });

    expect(router.currentRoute.params).toEqual({ lang: 'sv' });
  });

  test('Navigation - Hallinta', async () => {
    router.push({
      name: 'admin',
      params: router.currentRoute.params,
    });
  });

});
