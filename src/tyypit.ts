export enum Kieli {
  fi = 'fi',
  sv = 'sv',
  se = 'se',
  ru = 'ru',
  en = 'en',
}

export enum DiagrammiVarit {
  vaalea_sininen = 'vaalea_sininen',
  vihrea_sininen = 'vihrea_sininen',
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
export type Matala = GApi.Matala;
export type OpetussuunnitelmaDto = GApi.OpetussuunnitelmaDto;
export type OpetussuunnitelmaInfoDto = GApi.OpetussuunnitelmaInfoDto;
export type OpetussuunnitelmaKevytDto = GApi.OpetussuunnitelmaKevytDto;
export type OpetussuunnitelmaLuontiDto = GApi.OpetussuunnitelmaLuontiDto;
export type PerusteInfoDto = GApi.PerusteInfoDto;
export type Puu = GApi.Puu;
export type RevisionDto = GApi.RevisionDto;
export type TekstiKappaleViiteKevytDto = GApi.TekstiKappaleViiteKevytDto;
export type OhjeDto = GApi.OhjeDto;

export default GApi;
// export type LokalisoituTekstiDto = GApi.LokalisoituTekstiDto;
