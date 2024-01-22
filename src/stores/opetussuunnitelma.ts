import {
  Termisto,
  TermiDto,
  Ulkopuoliset,
  UusiJulkaisuDto,
  Lops2019PaikallinenOppiaineDto,
  Matala,
  Lops2019OpintojaksoDto,
  OhjeDto,
  OpetussuunnitelmaDto,
  OpetussuunnitelmaKevytDto,
  Puu,
  Lops2019,
  Ohjeet,
  OpetussuunnitelmanSisalto,
  Opintojaksot,
  Lops2019Oppiaineet,
  Opetussuunnitelmat,
  Lops2019OppiaineJarjestysDto,
  Oppiaineet,
  OppiaineDto,
  OpetussuunnitelmanJulkaisuDto,
  Validointi,
  Julkaisut,
  OpetussuunnitelmanJulkaisuDtoTilaEnum,
  TekstiKappaleViitePerusteTekstillaDto,
} from '@shared/api/ylops';

import { AxiosResponse } from 'axios';
import { createLogger } from '@shared/utils/logger';
import { State, Store } from '@shared/stores/store';
import { success, fail } from '@/utils/notifications';
import { organizations } from '@/utils/organisaatiot';
import _ from 'lodash';

interface OpintojaksoQuery {
  oppiaineUri?: string;
  moduuliUri?: string;
}

const logger = createLogger('Opetussuunnitelma');

@Store
export class OpetussuunnitelmaStore {
  @State()
  public opsId: number;

  @State()
  public sisalto: TekstiKappaleViitePerusteTekstillaDto | null = null;

  @State()
  public opetussuunnitelma: OpetussuunnitelmaKevytDto | null = null;

  @State()
  public paikallisetOppiaineet: Lops2019PaikallinenOppiaineDto[] = [];

  @State()
  public opintojaksot: Lops2019OpintojaksoDto[] = [];

  @State()
  public tuodutOpintojaksot: Lops2019OpintojaksoDto[] = [];

  @State()
  public oppiaineJarjestykset: Lops2019OppiaineJarjestysDto[] = [];

  @State()
  public kasitteet: TermiDto[] = [];

  @State()
  public virkailijat: any[] | null = null;

  @State()
  public valinnaisetOppiaineet: OppiaineDto[] = [];

  @State()
  public julkaisut: OpetussuunnitelmanJulkaisuDto[] | null = null;

  @State()
  public validointi: Array<Validointi> | null = null;

  @State()
  public pohjallaPuuttuviaTeksteja: boolean | null = null;

  @State()
  public pohjanPerustePaivittynyt: boolean | null = null;

  @State()
  public julkaisemattomiaMuutoksia: boolean | null = null;

  @State()
  public viimeisinJulkaisuTila: string | null = null;

  @State()
  public tilaPolling: any | null = null;

  constructor(opsId: number) {
    this.opsId = opsId;
  }

  // Tekstikappaleet
  public async getOtsikot() {
    return (await OpetussuunnitelmanSisalto.getTekstiOtsikot(this.opsId)).data;
  }

  public async getKasitteet() {
    return (await Termisto.getAllTermit(this.opsId)).data || [];
  }

  public async updateSisalto() {
    this.sisalto = await this.getOtsikot();
    this.kasitteet = await this.getKasitteet();
  }

  public async init() {
    logger.info('Initing ops store', this.opsId);
    this.opetussuunnitelma = await this.get();
    this.updateSisalto();
    this.updateValidation();
    this.fetchJulkaisut();
    this.updateOppiaineet();
    this.updatePohjallaPuuttuviaTeksteja();
    this.updatePohjanPerustePaivittynyt();
  }

  async updatePohjanPerustePaivittynyt() {
    if (this.opetussuunnitelma!.tyyppi as string === 'pohja') {
      this.pohjanPerustePaivittynyt = (await Opetussuunnitelmat.pohjanperustepaivittynyt(this.opetussuunnitelma!.id!)).data;
    }
  }

  async updatePohjallaPuuttuviaTeksteja() {
    this.pohjallaPuuttuviaTeksteja = (await Opetussuunnitelmat.opetussuunnitelmanPohjallaUusiaTeksteja(this.opetussuunnitelma!.id!)).data;
  }

  async updateOppiaineet() {
    if ((this.opetussuunnitelma!.toteutus as any) === 'lops2019') {
      this.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data;
      this.tuodutOpintojaksot = (await Opintojaksot.getTuodutOpintojaksot(this.opetussuunnitelma!.id!)).data;
      this.paikallisetOppiaineet = await this.getPaikallisetOppiaineet();
      this.oppiaineJarjestykset = (await Lops2019Oppiaineet.getLops2019OppiaineJarjestys(this.opetussuunnitelma!.id!)).data;
    }
    else {
      this.valinnaisetOppiaineet = (await Oppiaineet.getValinnaiset(this.opetussuunnitelma!.id!)).data;
    }
  }

  async fetchJulkaisut() {
    this.julkaisut = (await Julkaisut.getJulkaisut(this.opetussuunnitelma!.id!)).data;
    if (_.includes(_.map(this.julkaisut, 'tila'), OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN)) {
      await this.fetchViimeisinJulkaisuTila();
      await this.pollTila();
    }
  }

  async fetchViimeisinJulkaisuTila() {
    this.viimeisinJulkaisuTila = (await Julkaisut.viimeisinJulkaisuTila(this.opetussuunnitelma!.id!)).data;

    if (this.viimeisinJulkaisuTila !== OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN) {
      clearInterval(this.tilaPolling);
      this.tilaPolling = null;
      this.julkaisut = (await Julkaisut.getJulkaisut(this.opetussuunnitelma!.id!)).data;
      this.opetussuunnitelma = await this.get();
      await this.fetchJulkaisemattomiaMuutoksia();
    }
  }

  async pollTila() {
    if (this.viimeisinJulkaisuTila === OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN) {
      this.tilaPolling = setInterval(() => this.fetchViimeisinJulkaisuTila(), 2500);
    }
  }

  public async fetchJulkaisemattomiaMuutoksia() {
    this.julkaisemattomiaMuutoksia = null;
    this.julkaisemattomiaMuutoksia = (await Julkaisut.julkaisemattomiaMuutoksia(this.opetussuunnitelma!.id!)).data;
  }

  public async get() {
    return (await Opetussuunnitelmat.getOpetussuunnitelma(this.opsId)).data;
  }

  public async getPohjanVuosiluokkakokonaisuudet(ops) {
    if (ops.pohja) {
      return (await Opetussuunnitelmat.getOpetussuunnitelmanPohjanVuosiluokkakokonaisuudet(this.opsId)).data;
    }

    return null;
  }

  public async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    const res = await Opetussuunnitelmat.updateOpetussuunnitelma(opetussuunnitelma.id as number, opetussuunnitelma as OpetussuunnitelmaDto);
    success('tallennus-onnistui-opetussuunnitelma');
    this.opetussuunnitelma = res.data as OpetussuunnitelmaKevytDto;
  }

  public async updateValidation() {
    this.validointi = null;
    this.validointi = (await Opetussuunnitelmat.validoiOpetussuunnitelma(this.opetussuunnitelma!.id!)).data;
    await this.fetchJulkaisemattomiaMuutoksia();
  }

  public async removeTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.removeTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!);
    await this.updateSisalto();
  }

  public async addTeksti(tov: Puu, parentId?: number) {
    let osa: AxiosResponse<Matala>;
    if (parentId) {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappaleLapsi(this.opetussuunnitelma!.id!, parentId, tov as Matala);
    }
    else {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappale(this.opetussuunnitelma!.id!, tov as Matala);
    }
    success('lisays-onnistui-tekstikappale');
    await this.updateSisalto();
    return osa.data;
  }

  public async kopioiTeksti(tov: Puu) {
    const kopioitu = await OpetussuunnitelmanSisalto.kloonaaTekstiKappale(this.opetussuunnitelma!.id!, tov.id!);
    success('kopiointi-onnistui-tekstikappale');
    return kopioitu;
  }

  public static async updateOpsTila(opsId: number, uusiTila: string) {
    return Opetussuunnitelmat.updateTila(opsId, uusiTila as any);
  }

  public async updateTila(uusiTila: string) {
    if (uusiTila) {
      await OpetussuunnitelmaStore.updateOpsTila(this.opetussuunnitelma!.id!, uusiTila as any);
      this.opetussuunnitelma = {
        ...this.opetussuunnitelma!,
        tila: uusiTila as any,
      };
    }
  }

  public async saveTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.updateTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!, tov);
    await this.updateSisalto();
  }

  public async saveOhje(ohje: OhjeDto) {
    if (ohje.id) {
      const res = await Ohjeet.updateOhje(ohje.id, ohje);
      return res.data;
    }
    else {
      const res = await Ohjeet.addOhje(ohje);
      return res.data;
    }
  }

  // Julkaisut
  public async julkaise(julkaisu: UusiJulkaisuDto) {
    await Julkaisut.julkaise(this.opetussuunnitelma!.id!, julkaisu);
    await this.fetchJulkaisut();
    if (!_.includes(_.map(this.julkaisut, 'tila'), OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN)) {
      this.opetussuunnitelma = await this.get();
      await this.fetchJulkaisemattomiaMuutoksia();
    }
  }

  public async palautaJulkaisu(julkaisu) {
    const tallennettuJulkaisu = (await Julkaisut.aktivoiJulkaisu(this.opetussuunnitelma!.id!, julkaisu.revision)).data;
    this.julkaisut = [tallennettuJulkaisu, ...this.julkaisut!];
  }

  // Lops 2021
  // Pilko omiin moduuleihin

  // Paikalliset oppiaineet
  public async addOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto = {}) {
    const result = (await Lops2019Oppiaineet.addLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine)).data;
    this.paikallisetOppiaineet = [...this.paikallisetOppiaineet, result];
    success('lisays-onnistui-oppiaine');
    return result;
  }

  public async getPaikallinenOppiaine(id: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallinenOppiaineTuotu(id: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenOppiaineTuotu(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallisetOppiaineet() {
    const paikalliset = (await Lops2019Oppiaineet.getAllLops2019PaikallisetOppiainet(this.opetussuunnitelma!.id!)).data;
    return paikalliset;
  }

  public async savePaikallinenOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto) {
    const result = (await Lops2019Oppiaineet.updateLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine.id!, oppiaine)).data;
    success('tallennus-onnistui-oppiaine');
    const idx = _.findIndex(this.paikallisetOppiaineet, { id: result.id });
    this.paikallisetOppiaineet = [
      ..._.slice(this.paikallisetOppiaineet, 0, idx),
      result,
      ..._.slice(this.paikallisetOppiaineet, idx + 1),
    ] as Lops2019PaikallinenOppiaineDto[];
    // Oppiaineen koodin vaihtaminen tekee muutoksen opintojakson oppiaineen koodeihin
    this.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data;
    return result;
  }

  public async getPaikallinenOppiaineenHistoria(id: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenVersionHistory(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallinenOppiaineVersion(id: number, versionumero: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenVersion(this.opetussuunnitelma!.id!, id, versionumero)).data;
  }

  public async revertPaikallinenOppiaineToVersion(id: number, versionumero: number) {
    await Lops2019Oppiaineet.revertLops2019PaikallinenToVersion(this.opetussuunnitelma!.id!, id, versionumero);
  }

  public async getJulkaisut() {
    return (await Julkaisut.getJulkaisut(this.opetussuunnitelma!.id!)).data;
  }

  // Opintojaksot
  public async addOpintojakso(opintojakso: Lops2019OpintojaksoDto = {}) {
    const result = (await Opintojaksot.addOpintojakso(this.opetussuunnitelma!.id!, opintojakso)).data;
    success('lisays-onnistui-opintojakson');
    this.opintojaksot = [...this.opintojaksot, result];
    return result;
  }

  public async getOpintojaksot(query: OpintojaksoQuery = {}) {
    let chain = _((await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data);
    if (query.oppiaineUri) {
      chain = chain.filter(oj => _.includes(_.map(oj.oppiaineet, 'koodi'), query.oppiaineUri));
    }
    if (query.moduuliUri) {
      chain = chain.filter(oj => _.includes(
        _.map(oj.moduulit, 'koodiUri'),
        query.moduuliUri));
    }
    return chain.value();
  }

  public async getOpintojaksoHistoria(opintojaksoId: number) {
    return (await Opintojaksot.getVersionHistory(this.opetussuunnitelma!.id!, opintojaksoId)).data;
  }

  public async revertOpintojaksoToVersion(opintojaksoId: number, versionumero: number) {
    await Opintojaksot.revertToVersion(this.opetussuunnitelma!.id!, opintojaksoId, versionumero);
  }

  public async getOpintojaksoVersion(opintojaksoId: number, versionumero: number) {
    return (await Opintojaksot.getVersion(this.opetussuunnitelma!.id!, opintojaksoId, versionumero)).data;
  }

  public async getOpintojakso(id: number) {
    return (await Opintojaksot.getOpintojakso(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getTuotuOpintojakso(id: number) {
    return (await Opintojaksot.getTuotuOpintojakso(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getOpintojaksonOpetussuunnitelma(id: number) {
    return (await Opintojaksot.getOpintojaksonOpetussuunnitelma(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPoistetut() {
    return (await Lops2019.getRemoved(this.opetussuunnitelma!.id!)).data;
  }

  public async getPoistetutTekstikappaleet() {
    return (await OpetussuunnitelmanSisalto.getRemovedTekstikappaleet(this.opetussuunnitelma!.id!)).data;
  }

  public async palautaTekstirakenne() {
    await Opetussuunnitelmat.palautaTekstirakenne(this.opetussuunnitelma!.id!);
    await this.updateSisalto();
  }

  public async palauta(poistettu) {
    try {
      if (poistettu.tyyppi) {
        await Lops2019.palauta(this.opetussuunnitelma!.id!, poistettu.id!);
        await this.getPoistetut();
      }
      else {
        // Tekstikappaleiden poisto
        OpetussuunnitelmanSisalto.returnRemoved(this.opetussuunnitelma!.id!, poistettu!.id);
        await this.getPoistetutTekstikappaleet();
      }
      success('palautus-onnistui');
      await this.init();
    }
    catch (err: any) {
      fail('palautus-epaonnistui', err.response.data.syy);
    }
  }

  public async removeOppiaine(id: number) {
    await Lops2019Oppiaineet.removeLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-oppiaineen');
    const idx = _.findIndex(this.paikallisetOppiaineet, { id });
    this.paikallisetOppiaineet = [
      ..._.slice(this.paikallisetOppiaineet, 0, idx),
      ..._.slice(this.paikallisetOppiaineet, idx + 1),
    ] as Lops2019PaikallinenOppiaineDto[];
  }

  public async removeOpintojakso(id: number) {
    await Opintojaksot.removeOpintojakso(this.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-opintojakson');
    const idx = _.findIndex(this.opintojaksot, { id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      ..._.slice(this.opintojaksot, idx + 1),
    ] as Lops2019OpintojaksoDto[];
  }

  public async saveOpintojakso(opintojakso: Lops2019OpintojaksoDto) {
    const result = (await Opintojaksot.updateOpintojakso(this.opetussuunnitelma!.id!, opintojakso.id!, opintojakso)).data;
    success('tallennus-onnistui-opintojakson');
    const idx = _.findIndex(this.opintojaksot, { id: result.id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      result,
      ..._.slice(this.opintojaksot, idx + 1),
    ] as Lops2019OpintojaksoDto[];
    return result;
  }

  public async fetchOrganisaatioVirkailijat() {
    const orgOids = _(this.opetussuunnitelma?.organisaatiot)
      .filter(org => org.oid !== organizations.oph.oid)
      .map(org => org.oid as string)
      .value();
    this.virkailijat = _.uniqBy((await Ulkopuoliset.getOrganisaatioVirkailijat(orgOids)).data as any[], 'oid');
  }

  public async updateOppiaineJaOpintojaksojarjestys(oppiaineopintojaksojarjestys) {
    await Opetussuunnitelmat.updateOppiaineJaOpintojaksojarjestys(this.opetussuunnitelma!.id!, oppiaineopintojaksojarjestys);
  }

  public async updateOppiainejarjestys(oppiainejarjestys) {
    await Opetussuunnitelmat.updateOppiainejarjestys(this.opetussuunnitelma!.id!, oppiainejarjestys);
  }

  public async syncTekstitPohjasta() {
    await Opetussuunnitelmat.syncTekstitPohjasta(this.opetussuunnitelma!.id!);
  }

  public async synkronisoiPohja() {
    await Opetussuunnitelmat.sync(this.opetussuunnitelma!.id!);
    this.pohjanPerustePaivittynyt = false;
  }
}

let opsServiceCache: OpetussuunnitelmaStore | null = null;

export function Opetussuunnitelma() {
  return opsServiceCache!;
}

export function getOpetussuunnitelmaService(id: number) {
  if (!opsServiceCache || opsServiceCache.opsId !== id) {
    opsServiceCache = new OpetussuunnitelmaStore(id);
  }
  return opsServiceCache;
}
