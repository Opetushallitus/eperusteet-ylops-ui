import Vue from 'vue';
import { mount, shallowMount, createLocalVue } from '@vue/test-utils';
import EpEditointi from './EpEditointi.vue';
import { EditointiKontrolliConfig } from '@/stores/editointi';
import { rootConfig } from '@/mainvue';
import { i18n } from '@/stores/kieli';

describe('EpEditointi component', () => {
  // const options = {
  //   slots: {
  //     default: `
  //       <h3>
  //         Editable stuff here
  //       </h3>`,
  //   },
  // };

  it('Renders header and content', () => {
    const editointi: EditointiKontrolliConfig = {
    };

    const wrapper = mount(EpEditointi, {
      props: {
        hooks: editointi as any,
      },
    });

    console.log(wrapper.html());
  });

});
