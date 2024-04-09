import { Termisto, Liitetiedostot, TermiDto, LiiteDto, Api } from '@shared/api/ylops';

import _ from 'lodash';

export interface LiiteWithSrc extends LiiteDto {
  src: string,
};

export interface IAttachmentWrapper {
  endpoint: () => string,
  hae: () => Promise<LiiteWithSrc[]>,
  url: (id: string) => string,
}

export interface IKasiteHandler {
  /**
   * Hae yksi termi termin avainarvolla (UUID)
   */
  getOne: (avain: string) => Promise<TermiDto>,

  /**
   * Hae kaikki termit
   */
  getAll: () => Promise<TermiDto[]>,

  /**
   * Lisää uusi termi tai päivitä termiä. Vanhaa päivitetään jos `avain` ja `id` löytyy.
   */
  addOrUpdate: (termi: TermiDto) => Promise<TermiDto>,
};

export function createLiitetiedostoHandler(opsId: number): IAttachmentWrapper {
  const Endpoint = '/api/opetussuunnitelmat/' + opsId + '/kuvat';

  return {
    endpoint() {
      return Endpoint;
    },

    url(id: string): string {
      return Api.defaults.baseURL + Endpoint + '/' + id;
    },

    async hae(): Promise<LiiteWithSrc[]> {
      const result = await Liitetiedostot.getAllLiitteet(opsId);
      return _.map(result.data, d => ({
        ...d,
        src: Api.defaults.baseURL + Endpoint + '/' + d.id,
      }));
    },
  };
}

export function createKasiteHandler(opsId): IKasiteHandler {
  return {
    async getOne(avain: string) {
      const res = await Termisto.getTermi(opsId, avain);
      return res.data;
    },
    async getAll() {
      const res = await Termisto.getAllTermit(opsId);
      return res.data;
    },
    async addOrUpdate(termi: TermiDto) {
      if (termi.avain && termi.id) {
        return (await Termisto.updateTermi(opsId, termi.id, termi)).data;
      }
      else {
        return (await Termisto.addTermi(opsId, termi)).data;
      }
    },
  };
};
