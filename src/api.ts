import { Configuration } from '@/generated/configuration';
import { BaseAPI, OpetussuunnitelmatApi } from '@/generated/api';
import axios from 'axios';
import { AxiosInstance } from 'axios';

type FactoryFn<T> = (configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

const basePath = '';
const ax = axios.create({
  baseURL: '/eperusteet-ylops-service/api',
});

// https://github.com/Microsoft/TypeScript/issues/20719
type BaseAPIConstructor<T> = new(configuration?: Configuration, basePath?: string, axios?: AxiosInstance) => T;

function initApi<T>(t: BaseAPIConstructor<T>): T {
  return new t({ basePath }, basePath, ax);
}


export const Api = ax;
export const Opetussuunnitelmat = initApi(OpetussuunnitelmatApi);
