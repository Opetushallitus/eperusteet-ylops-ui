// FIXME: vue-loader issue 1281
import * as GApi from '@/generated/api';

export enum OrganisaatioTyyppi {
  Muu = 'Muu organisaatio',
  Varhaiskasvatus = 'Varhaiskasvatuksen jarjestaja',
  Oppilaitos = 'Oppilaitos',
  Toimija = 'Koulutustoimija',
}

export type DiagrammiVarit = 'vaalea_sininen' | 'vihrea_sininen';

export type EditorLayout = 'minimal' | 'simplified' | 'normal';

export interface LokalisoituTekstiDto {
  // id?: number;
  // tunniste?: string;
  [key: string]: string;
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
  query?: object,
}

export interface RecursiveTreeItem {
  id: number;
}

export interface RevisionDto extends GApi.RevisionDto {
  nykyinen?: boolean,
}

export type EtusivuDto = GApi.EtusivuDto;
export type KayttajanTietoDto = GApi.KayttajanTietoDto;
export type LiiteDto = GApi.LiiteDto;
export type Lops2019ModuuliDto = GApi.Lops2019ModuuliDto;
export type Lops2019OpintojaksoDto = GApi.Lops2019OpintojaksoDto;
export type Lops2019OpintojaksonModuuliDto = GApi.Lops2019OpintojaksonModuuliDto;
export type Lops2019OpintojaksonOppiaineDto = GApi.Lops2019OpintojaksonOppiaineDto;
export type Lops2019OppiaineDto = GApi.Lops2019OppiaineKaikkiDto;
export type Lops2019PaikallinenOppiaineDto = GApi.Lops2019PaikallinenOppiaineDto;
export type Lops2019PoistettuDto = GApi.Lops2019PoistettuDto;
export type Lops2019ValidointiDto = GApi.Lops2019ValidointiDto;
export type Lops2019PaikallinenLaajaAlainenDto = GApi.Lops2019PaikallinenLaajaAlainenDto;
export type Matala = GApi.Matala;
export type OhjeDto = GApi.OhjeDto;
export type OpetussuunnitelmaDto = GApi.OpetussuunnitelmaDto;
export type OpetussuunnitelmaInfoDto = GApi.OpetussuunnitelmaInfoDto;
export type OpetussuunnitelmaKevytDto = GApi.OpetussuunnitelmaKevytDto;
export type OpetussuunnitelmaLuontiDto = GApi.OpetussuunnitelmaLuontiDto;
export type PerusteInfoDto = GApi.PerusteInfoDto;
export type PerusteTekstiKappaleViiteDto = GApi.PerusteTekstiKappaleViiteDto;
export type Puu = GApi.Puu;
export type TekstiKappaleViiteKevytDto = GApi.TekstiKappaleViiteKevytDto;
export type TekstiKappaleDto = GApi.TekstiKappaleDto;
export type TermiDto = GApi.TermiDto;
export type TilaEnum = GApi.OpetussuunnitelmaInfoDto.TilaEnum;
export type UusiJulkaisuDto = GApi.UusiJulkaisuDto;
export type KysymysDto = GApi.KysymysDto;
export type KommenttiDto = GApi.Kommentti2019Dto;

export default GApi;
