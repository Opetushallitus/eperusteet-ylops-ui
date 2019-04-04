import { Configuration } from '@/generated/configuration';
import axios, { AxiosInstance } from 'axios';
import { createLogger } from '@/stores/logger';
import _ from 'lodash';
import {
  DokumentitApi,
  DokumentitApiAxiosParamCreator,
  KayttajatApi,
  KommentitApi,
  KysymyksetApi,
  LiitetiedostotApi,
  Lops2019OpintojaksotApi,
  Lops2019PerusteControllerApi,
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

export const baseURL = '/eperusteet-ylops-service/api';

const ax = axios.create({
  baseURL,
});

function getCasURL() {
  const host = location.host;
  const protocol = location.protocol;
  const redirectURL = encodeURIComponent(window.location.href);
  return protocol + '//' + host + '/cas/login?service=' + redirectURL;
}

let redirected = false;

function axiosHandler(msg: string) {
  return async (err: any) => {
    const status = _.get(err, 'response.status');
    if (status === 401 && !redirected) {
      redirected = true;
      const location = _.get(err, 'response.headers.location');
      window.location.href = location || getCasURL();
    }

    logger.error(msg as any, err);
    throw err;
  };
}

function redirectHandler() {
  return async (res: any) => {
    const status = _.get(res, 'status');
    if (status === 302 && !redirected) {
      redirected = true;
      const location = _.get(res, 'headers.location');
      window.location.href = location || getCasURL();
    }

    return res;
  }
}

ax.interceptors.response.use(redirectHandler(), axiosHandler('Response error'));
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
export const Kysymykset = initApi(KysymyksetApi);
export const Liitetiedostot = initApi(LiitetiedostotApi);
export const Ohjeet = initApi(OhjeetApi);
export const OpetussuunnitelmanSisalto = initApi(OpetussuunnitelmanSisaltoApi);
export const Opintojaksot = initApi(Lops2019OpintojaksotApi);
export const Lops2019Perusteet = initApi(Lops2019PerusteControllerApi);
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
