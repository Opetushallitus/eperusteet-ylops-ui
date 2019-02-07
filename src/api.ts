import { Configuration } from '@/generated/configuration';
import axios, { AxiosInstance } from 'axios';
import { createLogger } from '@/stores/logger';
import _ from 'lodash';
import {
  DokumentitApi,
  KommentitApi,
  KayttajatApi,
  LiitetiedostotApi,
  OhjeetApi,
  OpetussuunnitelmanSisaltoApi,
  OpetussuunnitelmatApi,
  OpetussuunnitelmatJulkisetApi,
  TermistoApi,
  UlkopuolisetApi,
} from '@/generated/api';



type FactoryFn<T> = (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const logger = createLogger('Axios');
const basePath = '';
const ax = axios.create({
  baseURL: '/eperusteet-ylops-service/api',
});

function axiosHandler(msg: string) {
  return async (err: any) => {
    logger.error(msg, err);
    throw err;
  };
}

ax.interceptors.response.use(_.identity, axiosHandler('Response error'));
ax.interceptors.request.use(_.identity, axiosHandler('Request error'));

// https://github.com/Microsoft/TypeScript/issues/20719
type BaseAPIConstructor<T> = new(configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

function initApi<T>(t: BaseAPIConstructor<T>): T {
  return new t({ basePath }, basePath, ax);
}


export const Api = ax;
export const Dokumentit = initApi(DokumentitApi);
export const Kayttajat = initApi(KayttajatApi);
export const Kommentit = initApi(KommentitApi);
export const Liitetiedostot = initApi(LiitetiedostotApi);
export const Ohjeet = initApi(OhjeetApi);
export const OpetussuunnitelmanSisalto = initApi(OpetussuunnitelmanSisaltoApi);
export const Opetussuunnitelmat = initApi(OpetussuunnitelmatApi);
export const OpetussuunnitelmatJulkiset = initApi(OpetussuunnitelmatJulkisetApi);
export const Termisto = initApi(TermistoApi);
export const Ulkopuoliset = initApi(UlkopuolisetApi);
