import Vue from 'vue';
import { RouteConfig } from 'vue-router';

export enum Kieli {
  fi = 'fi',
  sv = 'sv',
  se = 'se',
  ru = 'ru',
  en = 'en',
}

export interface SovellusVirhe {
  path?: string;
  err?: string;
  state?: object;
  info?: string;
}

export interface LokalisoituTekstiDto {
  // id?: number;
  // tunniste?: string;
  [key: string]: string;
}

// FIXME: vue-loader issue 1281
import * as GApi from '@/generated/api';
export type KayttajanTietoDto = GApi.KayttajanTietoDto;
export type OpetussuunnitelmaInfoDto = GApi.OpetussuunnitelmaInfoDto;
export type OpetussuunnitelmaLuontiDto = GApi.OpetussuunnitelmaLuontiDto;
export type OpetussuunnitelmaKevytDto = GApi.OpetussuunnitelmaKevytDto;
export type PerusteInfoDto = GApi.PerusteInfoDto;
// export type LokalisoituTekstiDto = GApi.LokalisoituTekstiDto;
