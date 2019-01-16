jest.mock('@/stores/kayttaja');

import { mount, createLocalVue } from '@vue/test-utils';
import { oikeustarkastelu } from './oikeustarkastelu';
import { Kayttajat } from '@/stores/kayttaja';

// KayttajaStore.mockImplementation({
//   Kayttajat: {},
// });
const eiOikeuksia = Object.freeze({
  opetussuunnitelma: [],
  pohja: [],
});

describe('Directive oikeustarkastelu', () => {
  const localVue = createLocalVue();
  localVue.directive('oikeustarkastelu', oikeustarkastelu);

  beforeEach(() => {
    Kayttajat.oikeudet = {
      opetussuunnitelma: [],
      pohja: [],
    };
  });

  test('toimii oletuksena lukuoikeudella', async () => {
    Kayttajat.oikeudet = {
      opetussuunnitelma: ['luku'],
    };

    const wrapper = mount({
      template: `
      <div>
        <button v-oikeustarkastelu>Hello</button>
        <button v-oikeustarkastelu="'muokkaus'">World</button>
      </div>`,
    }, { localVue });

    expect((wrapper.element.childNodes[0] as HTMLElement).style.display).toEqual('none');
    expect((wrapper.element.childNodes[2] as HTMLElement).style.display).toEqual('none');
    await localVue.nextTick();
    expect((wrapper.element.childNodes[0] as HTMLElement).style.display).toEqual('');
    expect((wrapper.element.childNodes[2] as HTMLElement).style.display).toEqual('');
    expect((wrapper.element.childNodes[2] as HTMLInputElement).disabled).toBeTruthy();
  });

  test('piilottaa elementin kun oikeudet eivät riitä', async () => {
    Kayttajat.oikeudet = eiOikeuksia;

    const wrapper = mount({
      template: '<div v-oikeustarkastelu>Hello</div>',
    }, { localVue });

    expect(wrapper.element.style.display).toEqual('none');
  });

  test('painikkeet disabloituvat ilman oikeuksia', async () => {
    Kayttajat.oikeudet = eiOikeuksia;

    const wrapper = mount({
      template: '<button v-oikeustarkastelu>Hello</button>',
    }, { localVue });

    expect(wrapper.element.style.display).toEqual('none');
    await localVue.nextTick();
    expect((wrapper.element as HTMLInputElement).disabled).toEqual(true);
    expect(wrapper.element.style.display).toEqual('');
  });

});
