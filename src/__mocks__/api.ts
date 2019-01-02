import axios, {
  AxiosPromise,
  AxiosResponse,
} from 'axios';

import {
  OpetussuunnitelmatApi,
  OpetussuunnitelmaInfoDto,
} from '@/generated/api';


async function respond<T>(
  data: T, params = {
    status: 200,
    statusText: '',
    headers: {},
    config: {},
  }): Promise<AxiosResponse<T>> {
  return {
    ...params,
    data,
  };
}

class OpetussuunnitelmatApiMock extends OpetussuunnitelmatApi {
  public getAll(
      tyyppi?: 'OPS' | 'POHJA',
      tila?: 'LUONNOS' | 'VALMIS' | 'POISTETTU' | 'JULKAISTU',
      options?: any) {
    return respond<OpetussuunnitelmaInfoDto[]>([{
      id: 42,
    }]);
  }
}


export const Api = axios.create({
  baseURL: '/eperusteet-ylops-service/api',
});

export const Opetussuunnitelmat = new OpetussuunnitelmatApiMock();
