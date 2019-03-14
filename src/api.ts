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
  UlkopuolisetApi, DokumentitApiAxiosParamCreator,
} from '@/generated/api';

type FactoryFn<T> = (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const logger = createLogger('Axios');
const basePath = '';

export const baseURL = '/eperusteet-ylops-service/api';

const ax = axios.create({
  baseURL,
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

const configuration = { basePath };

function initApi<T>(X: BaseAPIConstructor<T>): T {
  return new X(configuration, basePath, ax);
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

export const DokumentitParams = DokumentitApiAxiosParamCreator(configuration);

// FIXME: Genereoitua rajapintaa ei toimi multipart-pyyntöjen kanssa.
Dokumentit.addImage = (opsId, tyyppi, kieli, formData) => {
  return Api.post('/dokumentit/kuva', formData, {
    params: {
      opsId,
      tyyppi,
      kieli,
    },
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};
