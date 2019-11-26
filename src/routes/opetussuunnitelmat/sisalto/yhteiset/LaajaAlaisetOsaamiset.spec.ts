import { createLocalVue, mount } from '@vue/test-utils';
import LaajaAlaisetOsaamiset from './LaajaAlaisetOsaamiset.vue';
import { KieliStore, Kielet } from '@shared/stores/kieli';
import '@/config/bootstrap';
import '@/config/fontawesome';

describe('LaajaAlaisetOsaamiset component', async () => {

  const localVue = createLocalVue();
  KieliStore.setup(localVue);

  const wrapper = mount(LaajaAlaisetOsaamiset as any, {
    localVue,
    attachToDocument: true,
    i18n: KieliStore.i18n,
    propsData: {
      value: [],
      koodit: null,
    },
  } as any);

  test('Initializes', () => {
  });

});
