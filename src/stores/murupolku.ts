import { reactive, computed } from 'vue';
import _ from 'lodash';
import { RouteLocationNormalized as Location } from 'vue-router';

class MurupolkuStore {
  private state = reactive({
    polku: {} as { [avain: string]: any },
  });

  public readonly polku = computed(() => this.state.polku);
  public readonly murut = computed(() => {
    // const nimi = _.get(Opetussuunnitelma(), 'opetussuunnitelma.nimi');
    const nimi = '';
    return {
      opetussuunnitelma: nimi,
      ...this.state.polku,
    };
  });

  aseta(key: string, value: any, location?: Location) {
    this.state.polku = {
      ...this.state.polku,
      [key]: {
        name: value,
        location,
      },
    };
  }
}

export const Murupolku = new MurupolkuStore();
