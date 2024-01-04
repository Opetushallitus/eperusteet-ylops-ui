import { mount, createLocalVue } from '@vue/test-utils';
import RouteOrganisaatio from '../RouteOrganisaatio.vue';
import { Kielet } from '@shared/stores/kieli';
import '@shared/config/bootstrap';
import { Kayttajat as KayttajatApi, Opetussuunnitelmat, Ulkopuoliset } from '@shared/api/ylops';
import { genKayttaja, makeAxiosResponse } from '&/utils/data';
import { Kayttajat } from '@/stores/kayttaja';
import VueI18n from 'vue-i18n';
import { Kaannos } from '@shared/plugins/kaannos';
import { delay } from '@shared/utils/delay';

describe('RouteOrganisaatio', () => {
  const localVue = createLocalVue();
  localVue.use(VueI18n);
  Kielet.install(localVue, {
    messages: {
      fi: require('@shared/translations/locale-fi.json'),
      sv: require('@shared/translations/locale-sv.json'),
    },
  });
  localVue.use(new Kaannos());
  const i18n = Kielet.i18n;

  async function createMounted() {
    jest.spyOn(KayttajatApi, 'getKayttaja')
      .mockImplementation(async () => makeAxiosResponse(genKayttaja()));

    jest.spyOn(Ulkopuoliset, 'getUserOrganisations')
      .mockImplementation(async () => makeAxiosResponse([{
        oid: '1234',
        nimi: {
          fi: 'organisaatio1',
        },
      }]));

    jest.spyOn(Opetussuunnitelmat, 'getOikeudet')
      .mockImplementation(async () => makeAxiosResponse({}));

    jest.spyOn(Ulkopuoliset, 'getOrganisaatioVirkailijat')
      .mockImplementation(async () => makeAxiosResponse([{
        oid: '1',
        kutsumanimi: 'kutsumanimi1',
        sukunimi: 'sukunimi1',
      }, {
        oid: '2',
        kutsumanimi: 'kutsumanimi2',
        sukunimi: 'sukunimi2',
      }]));

    await Kayttajat.init();
    return mount(RouteOrganisaatio, {
      i18n,
      localVue,
      stubs: [
        'EpNavigation',
        'EpToggle',
      ],
    });
  }

  test('Renders header and description', async () => {
    const wrapper = await createMounted();
    expect(wrapper.html()).toContain('Organisaation työryhmä');
    expect(wrapper.html()).toContain('Täältä löydät kaikkkiin organisaatioihisi kuuluvat henkilöt.');
    expect(wrapper.html()).toContain('Näytä organisaatiot');
  });

  test('Renders virkailijat', async () => {
    const wrapper = await createMounted();

    await delay();

    expect(wrapper.html()).toContain('kutsumanimi1 sukunimi1');
    expect(wrapper.html()).toContain('kutsumanimi2 sukunimi2');
  });

  test('Renders organizations', async () => {
    const wrapper = await createMounted();

    wrapper.setData({ showOrganizations: true });

    await delay();

    expect(wrapper.html()).toContain('kutsumanimi1 sukunimi1');
    expect(wrapper.html()).toContain('kutsumanimi2 sukunimi2');
    expect(wrapper.html()).toContain('organisaatio1');
  });
});
