import { Configuration } from '@/generated/configuration';
import axios, { AxiosInstance } from 'axios';
import { createLogger } from '@shared/utils/logger';
import _ from 'lodash';
import {
  DokumentitApi,
  DokumentitApiAxiosParamCreator,
  KayttajatApi,
  KommentointiApi,
  KysymyksetApi,
  LiitetiedostotApi,
  Lops2019Api,
  Lops2019OpintojaksotApi,
  Lops2019OppiaineetApi,
  Lops2019PerusteControllerApi,
  OhjeetApi,
  OpetussuunnitelmanSisaltoApi,
  OpetussuunnitelmatApi,
  OpetussuunnitelmatJulkisetApi,
  TermistoApi,
  UlkopuolisetApi,
  MuokkaustietoApi,
  AikatauluApi,
} from '@/generated/api';

axios.defaults.headers.common['Caller-Id'] = '1.2.246.562.10.00000000001.eperusteet';

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

// Apufuntio kirjautumiseen ja paluulinkin luontiin
function getCasURL() {
  const host = location.host;
  const protocol = location.protocol;
  const redirectURL = encodeURIComponent(window.location.href);
  return protocol + '//' + host + '/cas/login?service=' + redirectURL;
}

function successfulResponseHandler() {
  return async (res: any) => {
    try {
      if (res.status === 200) {
        const url = new URL(res.request.responseURL);
        if (_.startsWith(url.pathname, '/cas/login')) {
          // Uudelleenohjataan kirjautumiseen jos nykyinen pyyntö on jo mennyt kirjautumissivulle
          window.location.href = getCasURL();
        }
      }
    }
    catch (e) {
      return res;
    }
    return res;
  };
}

ax.interceptors.request.use(_.identity, axiosHandler('Request error'));
ax.interceptors.response.use(successfulResponseHandler(), axiosHandler('Response error'));

// https://github.com/Microsoft/TypeScript/issues/20719
type BaseAPIConstructor<T> = new(configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const configuration = { basePath };

function initApi<T>(X: BaseAPIConstructor<T>): T {
  return new X(configuration, basePath, ax);
}

export const Api = ax;
export const Dokumentit = initApi(DokumentitApi);
export const Kayttajat = initApi(KayttajatApi);
export const Kommentointi = initApi(KommentointiApi);
export const Kysymykset = initApi(KysymyksetApi);
export const Liitetiedostot = initApi(LiitetiedostotApi);
export const Lops2019 = initApi(Lops2019Api);
export const Lops2019Perusteet = initApi(Lops2019PerusteControllerApi);
export const Ohjeet = initApi(OhjeetApi);
export const OpetussuunnitelmanSisalto = initApi(OpetussuunnitelmanSisaltoApi);
export const Opetussuunnitelmat = initApi(OpetussuunnitelmatApi);
export const OpetussuunnitelmatJulkiset = initApi(OpetussuunnitelmatJulkisetApi);
export const Opintojaksot = initApi(Lops2019OpintojaksotApi);
export const Oppiaineet = initApi(Lops2019OppiaineetApi);
export const Termisto = initApi(TermistoApi);
export const Ulkopuoliset = initApi(UlkopuolisetApi);
export const Muokkaustieto = initApi(MuokkaustietoApi);
export const Aikataulu = initApi(AikatauluApi);

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
