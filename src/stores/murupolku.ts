import { Getter, State, Store } from '@shared/stores/store';
import Vue from 'vue';
import _ from 'lodash';
import { Opetussuunnitelma } from './opetussuunnitelma';

@Store
class MurupolkuStore {
  @State()
  public polku: { [avain: string]: any } = {};

  @Getter(state => {
    const nimi = _.get(Opetussuunnitelma(), 'opetussuunnitelma.nimi');
    return {
      ...state.polku,
      opetussuunnitelma: nimi,
    };
  })
  public readonly murut!: object;

  aseta(key: string, value: any) {
    this.polku = {
      ...this.polku,
      [key]: value,
    };
  }
}

export const Murupolku = new MurupolkuStore();
