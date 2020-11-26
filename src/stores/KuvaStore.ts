import { IKuvaStore } from '@shared/components/EpContent/KuvaHandler';
import { Api, Liitetiedostot } from '@shared/api/amosaa';

export class KuvaStore implements IKuvaStore {
  constructor(private readonly opsId: number, private readonly ktId: string) {
  }

  getEndpoint() {
    return `/koulutustoimijat/${this.ktId}/opetussuunnitelmat/${this.opsId}/kuvat`;
  }
  getAllKuvat() {
    return Liitetiedostot.getAllImages(this.opsId, this.ktId);
  }

  getBaseUrl() {
    return Api.defaults.baseURL + this.getEndpoint();
  }

  getApi() {
    return Api;
  }
}
