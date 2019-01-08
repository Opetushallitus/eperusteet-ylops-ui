import { Store, Mutation, Action, State } from './store';
import {
  KayttajanTietoDto,
} from '@/api';


@Store
class KayttajaStore {
  @State()
  public tiedot: KayttajanTietoDto = {
    kayttajanimi: 'foo',
  };

  @Mutation()
  public aseta(nimi: string, sukunimi: string) {
    this.tiedot.kayttajanimi = nimi;
    this.tiedot.sukunimi = sukunimi;
  }

  @Action()
  public async fetchTiedot() {
    return new Promise((resolve) => {
      setTimeout(() => {
        Kayttajat.tiedot = {
          kayttajanimi: 'bar',
        };
        resolve();
      }, 1000);
    });
  }
}

export const Kayttajat = new KayttajaStore();
