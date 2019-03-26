import { Ohjeet, OpetussuunnitelmanSisalto, Opintojaksot, Opetussuunnitelmat, Lops2019Perusteet } from '@/api';
import { Matala, Lops2019OpintojaksoDto, OhjeDto, OpetussuunnitelmaKevytDto, Puu, TekstiKappaleViiteKevytDto } from '@/tyypit';
import { AxiosResponse } from 'axios';
import { createLogger } from './logger';
import { State, Store } from './store';
import Vue from 'vue';
import _ from 'lodash';
import { Opetussuunnitelma } from './opetussuunnitelma';

export class PerusteCache {
  private static cache: any = Vue.observable({});

  constructor(
    private opsId: number,
  ) {
  }

  public peruste() {
    return PerusteCache.cache[this.opsId];
  }

  public async getOppiaine(koodiUri: string) {
    return _(this.peruste().oppiaineet)
      .filter(oa => oa.koodi.uri === koodiUri)
      .first();
  }

  public async getOppiaineenModuulit(koodiUri: string) {
    // const result = (await Lops2019Perusteet.getAllLops2019PerusteOppiaineenModuulit(this.opsId, koodiUri)).data;
    // return result;
  }

  // public async getOpintojaksonPeruste(id: number) {
  //   return (await Opintojaksot.getOpintojaksonPeruste(this.opsId, id)).data;
  // }

  private async init() {
    if (!PerusteCache.cache[this.opsId]) {
      const sisalto = (await Lops2019Perusteet.getAllLops2019PerusteSisalto(this.opsId)).data;
      Vue.set(PerusteCache.cache, this.opsId, {
        ...sisalto,
      });
    }
  }

  static async of(opsId: number) {
    const result = new PerusteCache(opsId);
    await result.init();
    return result;
  }
}
