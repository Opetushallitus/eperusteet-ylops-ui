import { Liitetiedostot } from '@/api';
import { LiiteDto } from '@/tyypit';
import { Api } from '@/api';
import _ from 'lodash';


export interface LiiteWithSrc extends LiiteDto {
  src: string,
};

export interface IAttachmentWrapper {
  endpoint: () => string,
  hae: () => Promise<LiiteWithSrc[]>,
  url: (id: string) => string,
}

export function createLiitetiedostoHandler(opsId: number): IAttachmentWrapper {
  const Endpoint = Api.defaults.baseURL + '/opetussuunnitelmat/' + opsId + '/kuvat/';

  return {
    endpoint() {
      return Endpoint;
    },

    url(id: string): string {
      return Endpoint + id;
    },

    async hae(): Promise<LiiteWithSrc[]> {
      const result = await Liitetiedostot.getAllLiitteet(opsId);
      return _.map(result.data, d => ({
        ...d,
        src: Endpoint + d.id,
      }));
    },
  };
}
