import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Vuosiluokkakokonaisuudet, Opetussuunnitelmat } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';

export class VuosiluokkakokonaisuusStore implements IEditoitava {
  constructor(private opsId: number, private vlkId: number) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    let vlk;
    let perusteenVlk;
    let laajaalaiset;
    [vlk, perusteenVlk, laajaalaiset] = _.map(await (Promise.all([
      Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuus(this.opsId, this.vlkId),
      Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuudenPerusteSisalto(this.opsId, this.vlkId),
      Opetussuunnitelmat.getLaajalaisetosamiset(this.opsId),
    ])), 'data');

    Object.keys(vlk).forEach(function(key) {
      if (vlk[key] === null) {
        vlk[key] = {};
      }
    });

    return {
      vlk: {
        ...vlk,
        laajaalaisetosaamiset: _.sortBy(vlk.laajaalaisetosaamiset, [(lao: any) => {
          const laajalao = _.head(_.filter(laajaalaiset, laaja => laaja.tunniste === lao._laajaalainenosaaminen));
          return laajalao.nimi[Kielet.getSisaltoKieli.value];
        }]),
      },
      perusteenVlk,
      laajaalaiset: _.sortBy(laajaalaiset, [(lao: any) => {
        return lao.nimi[Kielet.getSisaltoKieli.value];
      }]),
    };
  }

  async save(data: any) {
    data.vlk = (await Vuosiluokkakokonaisuudet.updateVuosiluokkakokonaisuus(this.opsId, this.vlkId, data.vlk)).data;
    return data;
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async remove() {
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
  });
}
