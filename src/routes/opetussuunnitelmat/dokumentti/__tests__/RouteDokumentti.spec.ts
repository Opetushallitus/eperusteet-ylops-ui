import { mount, createLocalVue } from '@vue/test-utils';
import VueI18n from 'vue-i18n';
import RouteDokumentti from '../RouteDokumentti.vue';
import { OpetussuunnitelmaStore } from '@/stores/opetussuunnitelma';
import { Kielet } from '@shared/stores/kieli';
import { Dokumentit } from '@shared/api/ylops';
import '@shared/config/bootstrap';
import { Kaannos } from '@shared/plugins/kaannos';

describe('RouteDokumentti', () => {
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
  OpetussuunnitelmaStore.prototype.init = jest.fn();
  Dokumentit.getLatestDokumenttiId = jest.fn();
  const opetussuunnitelmaStore = new OpetussuunnitelmaStore(42);

  test('mounting', async () => {
    const wrapper = mount(RouteDokumentti as any, {
      i18n,
      localVue,
      propsData: {
        opetussuunnitelmaStore,
      },
      mocks: {
        $route: {
          params: {
            id: 1,
          },
        },
      },
    } as any);

    opetussuunnitelmaStore.opetussuunnitelma = {
      id: 42,
      nimi: {
        fi: 'nimi',
      } as any,
    };

    await localVue.nextTick();
  });
});
