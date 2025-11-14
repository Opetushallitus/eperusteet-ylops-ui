import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from 'vue';
import { Router } from 'vue-router';
import type { App } from 'vue';
import { Vuosiluokkakokonaisuudet, Opetussuunnitelmat } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import VueScrollTo from 'vue-scrollto';

interface VuosiluokkakokonaisuusStoreConfig {
  router: Router;
}

export class VuosiluokkakokonaisuusStore implements IEditoitava {
  private static config: VuosiluokkakokonaisuusStoreConfig;

  public static install(app: App, config: VuosiluokkakokonaisuusStoreConfig) {
    VuosiluokkakokonaisuusStore.config = config;
  }
  constructor(private opsId: number, private vlkId: number, private scrollId: string | null, private el: any, private muokkaaLatauksenJalkeen: boolean) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.muokkaaLatauksenJalkeen;
  }

  async history() {
  }

  async load(supportDataProvider) {
    let vlk = {} as any;
    let perusteenVlk = {} as any;
    let laajaalaiset = {} as any;
    [vlk, perusteenVlk, laajaalaiset] = _.map(await (Promise.all([
      Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuus(this.opsId, this.vlkId),
      Vuosiluokkakokonaisuudet.getVuosiluokkakokonaisuudenPerusteSisalto(this.opsId, this.vlkId),
      Opetussuunnitelmat.getLaajalaisetosamiset(this.opsId),
    ])), 'data');

    let pohjanVlk = {} as any;
    let pohjanLaajaAlaisetOsaamiset = {} as any;
    if (vlk.oma) {
      pohjanVlk = (await Vuosiluokkakokonaisuudet.getPohjanVuosiluokkakokonaisuus(this.opsId, vlk._tunniste)).data ?? {};
      pohjanLaajaAlaisetOsaamiset = _.keyBy(pohjanVlk.laajaalaisetosaamiset, '_laajaalainenosaaminen');
    }
    supportDataProvider({ pohjanVlk, pohjanLaajaAlaisetOsaamiset });

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

  async postLoad() {
    if (this.scrollId) {
      const target = document.getElementById(this.scrollId);
      if (target) {
        VueScrollTo.scrollTo('#' + this.scrollId, {
          offset: -70,
          x: false,
          y: true,
        });
      }
    }
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

  async copy(data) {
    const kopioituVlk = await Vuosiluokkakokonaisuudet.kopioiVuosiluokkakokonaisuusMuokattavaksi(this.opsId, this.vlkId);
    await this.el.resetOps();
    VuosiluokkakokonaisuusStore.config.router.push({
      name: 'vuosiluokkakokonaisuus',
      params: {
        vlkId: kopioituVlk.data.id!,
      },
      query: {
        muokkaa: 'true',
      },
    });
  }

  public features(data) {
    return computed(() => {
      return data ? {
        editable: data.vlk.oma,
        removable: false,
        hideable: false,
        recoverable: false,
        copyable: !data.vlk.oma,
      } as EditoitavaFeatures
        : {};
    });
  }
}
