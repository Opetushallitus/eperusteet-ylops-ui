import { createLocalVue, mount } from '@vue/test-utils';
import EpDatepicker from '@/components/forms/EpDatepicker.vue';
import { i18n } from '@/stores/kieli';

import '@/config/fontawesome';

describe('EpDatepicker component', () => {

  const localVue = createLocalVue();

  it('Render component', () => {
    const wrapper = mount(EpDatepicker, {
      localVue,
      i18n,
      propsData: {
        value: 1546870463248,
      },
    });

    expect(wrapper.find('div').text()).toBe('7. tammikuuta 2019');

  });

  it('Render component in editing mode', () => {
    const wrapper = mount(EpDatepicker, {
      localVue,
      i18n,
      propsData: {
        value: 1546870463248,
        isEditing: true,
      },
    });

  });

  it('Test Validation fail', () => {
    const wrapper = mount(EpDatepicker, {
      localVue,
      i18n,
      propsData: {
        value: null,
        isEditing: true,
        validation: {
          required: false,
          $model: null,
          $invalid: true,
          $dirty: true,
          $anyDirty: true,
          $error: true,
          $anyError: true,
          $pending: false,
          $params: {
            required: {
              type: 'required',
            },
          },
        },
      },
    });

    expect(wrapper.find('.invalid-feedback').exists()).toBe(true);
    expect(wrapper.find('.is-invalid').exists()).toBe(true);
    expect(wrapper.find('.valid-feedback').exists()).toBe(false);
    expect(wrapper.find('.is-valid').exists()).toBe(false);

  });

  it('Test validation success', () => {
    const wrapper = mount(EpDatepicker, {
      localVue,
      i18n,
      propsData: {
        value: 1552946400000,
        isEditing: true,
        validation: {
          required: true,
          $model: 1552946400000,
          $invalid: false,
          $dirty: false,
          $anyDirty: false,
          $error: false,
          $anyError: false,
          $pending: false,
          $params: {
            required: {
              type: 'required',
            },
          },
        },
      },
    });

    expect(wrapper.find('.is-valid').exists()).toBe(true);
    expect(wrapper.find('.is-invalid').exists()).toBe(false);

    expect(wrapper.find('.invalid-feedback').exists()).toBe(false);

  });

});
