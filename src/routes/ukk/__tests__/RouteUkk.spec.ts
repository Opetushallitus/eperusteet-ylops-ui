import { makeAxiosResponse } from '&/utils/data';
import { mount, createLocalVue } from '@vue/test-utils';
import RouteUkk from '../RouteUkk.vue';
import { Kielet } from '@shared/stores/kieli';
import { Ulkopuoliset, Kysymykset } from '@shared/api/ylops';
import '@shared/config/bootstrap';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';
import aikaleima from '@shared/plugins/aikaleima';

describe('RouteUkk', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  localVue.use(aikaleima);
  Kielet.install(localVue, {
    messages: {
      fi: require('@/translations/locale-fi.json'),
      sv: require('@/translations/locale-sv.json'),
    },
  });
  localVue.use(new Kaannos());
  const i18n = Kielet.i18n;

  async function createMounted() {
    jest.spyOn(Ulkopuoliset, 'getUserOrganisations')
      .mockImplementation(async () => makeAxiosResponse([{
        oid: '123',
      }]));

    jest.spyOn(Kysymykset, 'createKysymys')
      .mockImplementation(async (x: any) => makeAxiosResponse(x));

    jest.spyOn(Kysymykset, 'updateKysymys')
      .mockImplementation(async (x: any) => makeAxiosResponse(x));

    jest.spyOn(Kysymykset, 'deleteKysymys')
      .mockImplementation(async (x: any) => makeAxiosResponse(null as any));

    jest.spyOn(Kysymykset, 'getKysymykset')
      .mockImplementation(async () => makeAxiosResponse([{
        id: 1,
        kysymys: { fi: 'kysymys?' },
        vastaus: 'vastaus!',
        organisaatiot: [{
          oid: '123',
        }],
      }] as any));

    return mount(RouteUkk as any, {
      i18n,
      localVue,
      stubs: ['EpSelect', 'EpNavigation', 'EpContent'],
    } as any);
  }

  test('Rendering', async () => {
    const wrapper = await createMounted();

    await localVue.nextTick();
    await localVue.nextTick();
    await localVue.nextTick();

    expect(wrapper.html()).toContain('kysymys?');
    expect(wrapper.html()).toContain('vastaus!');
  });
});
