import { IKuvaStore } from '@shared/components/EpContent/KuvaHandler';
import { Liitetiedostot, Api } from '@shared/api/ylops';

export class KuvaStore implements IKuvaStore {
  constructor(private readonly opsId: number) {
  }

  getEndpoint() {
    return `/api/opetussuunnitelmat/${this.opsId}/kuvat`;
  }
  getAllKuvat() {
    return Liitetiedostot.getAllLiitteet(this.opsId);
  }

  getBaseUrl() {
    return Api.defaults.baseURL + this.getEndpoint();
  }

  getApi() {
    return Api;
  }
}
