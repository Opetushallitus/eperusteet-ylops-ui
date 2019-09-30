import { createLocalVue, mount } from '@vue/test-utils';
import TermiEditor from './TermiEditor.vue';
import { IKasiteHandler } from '@/stores/kuvat';
import { TermiDto } from '@/tyypit';
import _ from 'lodash';

import { i18n } from '@/stores/kieli';
import '@/config/bootstrap';
import '@/config/fontawesome';


function createTestHandler(): IKasiteHandler {
  let nextAvain = 1;
  const kaikki = {};

  return {
    async getAll() {
      return _.values(kaikki);
    },
    async getOne(avain: string) {
      return kaikki[avain];
    },
    async addOrUpdate(termi: TermiDto) {
      termi.id = nextAvain;
      termi.avain = 'avain' + nextAvain++;
      kaikki[termi.avain] = termi;
      return termi;
    },
  };
}


describe('Termi plugin', () => {
  const localVue = createLocalVue();

  it('Näyttää editoitavan datan', async () => {
    const handler = createTestHandler();
    const wrapper = mount(TermiEditor, {
      localVue,
      i18n,
      propsData: {
        handler,
        opsId: 42,
        value: null,
      },
      stubs: {
        'vue-select': true,
      },
    });

    await localVue.nextTick();

    wrapper.setData({
      isEditing: true,
      muokattava: {
        selitys: {
          fi: 'selitys',
        },
        id: 42,
        avain: 'a-b-c-d',
        termi: {
          fi: 'kuvaus',
        },
      } as TermiDto,
    });

    const btns = wrapper.findAll('button');
    expect(btns.length).toBe(2);
    btns.at(0).trigger('click');
    await localVue.nextTick();
    const inputs = wrapper.findAll('input');
    expect((inputs.at(0).element as HTMLInputElement).value).toBe('kuvaus');
    expect((inputs.at(1).element as HTMLInputElement).value).toBe('selitys');
  });

});

