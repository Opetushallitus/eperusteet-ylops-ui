import { mount } from '@vue/test-utils';
import { oikeustarkastelu } from '../oikeustarkastelu';
import { Kayttajat } from '@/stores/kayttaja';
import { delay } from '@shared/utils/delay';
import { nextTick } from 'vue';
import { vi } from 'vitest';

vi.mock('@/stores/kayttaja');

// KayttajaStore.mockImplementation({
//   Kayttajat: {},
// });
const eiOikeuksia = Object.freeze({
  opetussuunnitelma: [],
  pohja: [],
});

describe('Directive oikeustarkastelu', () => {

  beforeEach(() => {
    (Kayttajat as any).state.oikeudet = {
      opetussuunnitelma: [],
      pohja: [],
    };
  });

  test('toimii oletuksena lukuoikeudella', async () => {
    (Kayttajat as any).state.oikeudet = {
      opetussuunnitelma: ['luku'],
    };

    const wrapper = mount({
      template: `
      <div>
        <button v-oikeustarkastelu>Hello</button>
        <button v-oikeustarkastelu="{ oikeus: 'muokkaus'}">World</button>
      </div>`,
    }, {
      global: {
        directives: {
          oikeustarkastelu,
        },
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].element.style.display).toEqual('none');
    expect(buttons[1].element.style.display).toEqual('none');
    await nextTick();
    expect(buttons[0].element.style.display).toEqual('');
    expect(buttons[1].element.style.display).toEqual('');
    expect(buttons[1].element.disabled).toBeTruthy();
  });

  test('piilottaa elementin kun oikeudet eivät riitä', async () => {
    const wrapper = mount({
      template: '<div v-oikeustarkastelu>Hello</div>',
    }, {
      global: {
        directives: {
          oikeustarkastelu,
        },
      },
    });

    expect(wrapper.element.style.display).toEqual('none');
  });

  test('painikkeet disabloituvat ilman oikeuksia', async () => {
    (Kayttajat as any).state.oikeudet = eiOikeuksia;

    const wrapper = mount({
      template: '<button v-oikeustarkastelu>Hello</button>',
    }, {
      global: {
        directives: {
          oikeustarkastelu,
        },
      },
    });

    expect(wrapper.element.style.display).toEqual('none');
    await delay();
    expect((wrapper.element as HTMLInputElement).disabled).toEqual(true);
    expect(wrapper.element.style.display).toEqual('');
  });
});
