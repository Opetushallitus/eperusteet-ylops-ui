// FIXME: vue-loader issue 1281
import * as GApi from '@/generated/api';

export enum Kieli {
  fi = 'fi',
  sv = 'sv',
  se = 'se',
  ru = 'ru',
  en = 'en',
}

export enum OrganisaatioTyyppi {
  Muu = 'Muu organisaatio',
  Varhaiskasvatus = 'Varhaiskasvatuksen jarjestaja',
  Oppilaitos = 'Oppilaitos',
  Toimija = 'Koulutustoimija',
}

export type DiagrammiVarit = 'vaalea_sininen' | 'vihrea_sininen';

export type EditorLayout = 'minimal' | 'simplified' | 'normal';

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

export interface KysymysDto {
  id?: number;
  kysymys?: string;
  vastaus?: string;
  organisaatiot: OrganisaatioDto[];
  $uusi: boolean;
}

export interface OrganisaatioDto {
  oid: string;
}

export interface SideMenuEntry {
  item: SideMenuItem,
  route?: SideMenuRoute,
  flatten?: boolean,
  children?: Array<SideMenuEntry>,
  parent?: SideMenuEntry,
}

export interface SideMenuItem {
  type: string,
  i18key?: string,
  objref?: object,
  prefix?: string,
  hideChevron?: boolean,
}

export interface SideMenuRoute {
  name: string,
  params: object,
}

export interface RecursiveTreeItem {
  id: number;
}

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
export type Lops2019OpintojaksoDto = GApi.Lops2019OpintojaksoDto;
export type Lops2019ModuuliDto = GApi.Lops2019ModuuliDto;
export type Lops2019OppiaineDto = GApi.Lops2019OppiaineDto;
export type Lops2019OpintojaksonModuuliDto = GApi.Lops2019OpintojaksonModuuliDto;
export type PerusteTekstiKappaleViiteDto = GApi.PerusteTekstiKappaleViiteDto;
export type Lops2019PaikallinenOppiaineDto = GApi.Lops2019PaikallinenOppiaineDto;
export type Lops2019OpintojaksonOppiaineDto = GApi.Lops2019OpintojaksonOppiaineDto;

export default GApi;
// export type LokalisoituTekstiDto = GApi.LokalisoituTekstiDto;
