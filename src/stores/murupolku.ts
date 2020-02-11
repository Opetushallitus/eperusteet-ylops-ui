import { Getter, State, Store } from '@shared/stores/store';
import _ from 'lodash';
import { Opetussuunnitelma } from './opetussuunnitelma';
import { Location } from 'vue-router';


@Store
class MurupolkuStore {
  @State()
  public polku: { [avain: string]: any } = {};

  @Getter(state => {
    const nimi = _.get(Opetussuunnitelma(), 'opetussuunnitelma.nimi');
    return {
      opetussuunnitelma: nimi,
      ...state.polku,
    };
  })
  public readonly murut!: object;

  aseta(key: string, value: any, location?: Location) {
    this.polku = {
      ...this.polku,
      [key]: {
        name: value,
        location,
      },
    };
  }
}

export const Murupolku = new MurupolkuStore();
