import Vue from 'vue';
import { Store, Getter, Mutation, Action, State } from './store';
import { KayttajanTietoDto } from '@/tyypit';
import { Kayttajat as KayttajatApi } from '@/api';


@Store
class KayttajaStore {

  @State()
  public tiedot: KayttajanTietoDto = { };

  public async init() {
    this.tiedot = (await KayttajatApi.get()).data;
  }

}

export const Kayttajat = new KayttajaStore();
