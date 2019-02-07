import { Configuration } from '@/generated/configuration';
import axios, { AxiosInstance } from 'axios';
import { createLogger } from '@/stores/logger';
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

ax.interceptors.response.use((response) => {
  return response;
}, async (err) => {
  logger.error('Response error', err);
  throw err;
});

ax.interceptors.request.use((config) => {
  return config;
}, async (err) => {
  logger.error('Request error', err);
  throw err;
});

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
