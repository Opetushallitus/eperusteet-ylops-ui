import {
  Termisto,
  TermiDto,
  Ulkopuoliset,
  UusiJulkaisuDto,
  Lops2019PaikallinenOppiaineDto,
  Matala,
  Lops2019OpintojaksoDto,
  OpetussuunnitelmaDto,
  OpetussuunnitelmaKevytDto,
  Puu,
  Lops2019,
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
  Muokkaustieto,
  PerusteInfoDto,
  OpetussuunnitelmanMuokkaustietoDto,
} from '@shared/api/ylops';

import { AxiosResponse } from 'axios';
import { createLogger } from '@shared/utils/logger';
import { reactive, computed } from 'vue';
import { success, fail } from '@/utils/notifications';
import { organizations } from '@/utils/organisaatiot';
import _ from 'lodash';

interface OpintojaksoQuery {
  oppiaineUri?: string;
  moduuliUri?: string;
}

const logger = createLogger('Opetussuunnitelma');

export class OpetussuunnitelmaStore {
  private state = reactive({
    opsId: 0,
    sisalto: null as TekstiKappaleViitePerusteTekstillaDto | null,
    opetussuunnitelma: null as OpetussuunnitelmaKevytDto | null,

    paikallisetOppiaineet: [] as Lops2019PaikallinenOppiaineDto[],

    opintojaksot: [] as Lops2019OpintojaksoDto[],

    tuodutOpintojaksot: [] as Lops2019OpintojaksoDto[],

    oppiaineJarjestykset: [] as Lops2019OppiaineJarjestysDto[],

    kasitteet: [] as TermiDto[],

    virkailijat: null as any[] | null,

    valinnaisetOppiaineet: [] as OppiaineDto[],

    julkaisut: null as OpetussuunnitelmanJulkaisuDto[] | null,

    validointi: null as Array<Validointi> | null,

    pohjallaPuuttuviaTeksteja: null as boolean | null,

    pohjanPerustePaivittynyt: null as boolean | null,

    julkaisemattomiaMuutoksia: null as boolean | null,

    viimeisinJulkaisuTila: null as string | null,

    tilaPolling: null as any | null,

    viimeisinPohjaTekstiSync: null as OpetussuunnitelmanMuokkaustietoDto | null,

    pohjaOpetussuunnitelmaViimeisinPohjaTekstiSync: null as OpetussuunnitelmanMuokkaustietoDto | null,

    peruste: null as PerusteInfoDto | null,
  });

  public readonly opsId = computed(() => this.state.opsId);
  public readonly sisalto = computed(() => this.state.sisalto);
  public readonly opetussuunnitelma = computed(() => this.state.opetussuunnitelma);
  public readonly paikallisetOppiaineet = computed(() => this.state.paikallisetOppiaineet);
  public readonly opintojaksot = computed(() => this.state.opintojaksot);
  public readonly tuodutOpintojaksot = computed(() => this.state.tuodutOpintojaksot);
  public readonly oppiaineJarjestykset = computed(() => this.state.oppiaineJarjestykset);
  public readonly kasitteet = computed(() => this.state.kasitteet);
  public readonly virkailijat = computed(() => this.state.virkailijat);
  public readonly valinnaisetOppiaineet = computed(() => this.state.valinnaisetOppiaineet);
  public readonly julkaisut = computed(() => this.state.julkaisut);
  public readonly validointi = computed(() => this.state.validointi);
  public readonly pohjallaPuuttuviaTeksteja = computed(() => this.state.pohjallaPuuttuviaTeksteja);
  public readonly pohjanPerustePaivittynyt = computed(() => this.state.pohjanPerustePaivittynyt);
  public readonly julkaisemattomiaMuutoksia = computed(() => this.state.julkaisemattomiaMuutoksia);
  public readonly viimeisinJulkaisuTila = computed(() => this.state.viimeisinJulkaisuTila);
  public readonly tilaPolling = computed(() => this.state.tilaPolling);
  public readonly viimeisinPohjaTekstiSync = computed(() => this.state.viimeisinPohjaTekstiSync);
  public readonly pohjaOpetussuunnitelmaViimeisinPohjaTekstiSync = computed(() => this.state.pohjaOpetussuunnitelmaViimeisinPohjaTekstiSync);
  public readonly peruste = computed(() => this.state.peruste);

  constructor(opsId: number) {
    this.state.opsId = opsId;
  }

  // Tekstikappaleet
  public async getOtsikot() {
    return (await OpetussuunnitelmanSisalto.getTekstiOtsikot(this.state.opsId)).data;
  }

  public async getKasitteet() {
    return (await Termisto.getAllTermit(this.state.opsId)).data || [];
  }

  public async updateSisalto() {
    this.state.sisalto = await this.getOtsikot();
    this.state.kasitteet = await this.getKasitteet();
  }

  public async init() {
    logger.info('Initing ops store', this.state.opsId);
    this.state.opetussuunnitelma = await this.get();
    this.updatePohjanPerustePaivittynyt();
    this.updateSisalto();
    this.updateValidation();
    this.fetchJulkaisut();
    this.updateOppiaineet();
    this.updatePohjallaPuuttuviaTeksteja();
  }

  async updatePohjanPerustePaivittynyt() {
    if (this.state.opetussuunnitelma!.tyyppi as string === 'pohja') {
      this.state.pohjanPerustePaivittynyt = (await Opetussuunnitelmat.pohjanperustepaivittynyt(this.state.opetussuunnitelma!.id!)).data;
    }
  }

  async updatePohjallaPuuttuviaTeksteja() {
    this.state.viimeisinPohjaTekstiSync = (await Muokkaustieto.getViimeisinPohjatekstiSync(this.state.opetussuunnitelma!.id!)).data;
    this.state.pohjaOpetussuunnitelmaViimeisinPohjaTekstiSync = (await Muokkaustieto.getOpetussuunnitelmanPohjanViimeisinPohjaTekstiSync(this.state.opetussuunnitelma!.id!)).data;
    this.state.peruste = (await Opetussuunnitelmat.getOpetussuunnitelmanPeruste(this.state.opetussuunnitelma!.id!)).data;
    this.state.pohjallaPuuttuviaTeksteja = (await Opetussuunnitelmat.opetussuunnitelmanPohjallaUusiaTeksteja(this.state.opetussuunnitelma!.id!)).data;
  }

  async updateOppiaineet() {
    if ((this.state.opetussuunnitelma!.toteutus as any) === 'lops2019') {
      this.state.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.state.opetussuunnitelma!.id!)).data;
      this.state.tuodutOpintojaksot = (await Opintojaksot.getTuodutOpintojaksot(this.state.opetussuunnitelma!.id!)).data;
      this.state.paikallisetOppiaineet = await this.getPaikallisetOppiaineet();
      this.state.oppiaineJarjestykset = (await Lops2019Oppiaineet.getLops2019OppiaineJarjestys(this.state.opetussuunnitelma!.id!)).data;
    }
    else {
      this.state.valinnaisetOppiaineet = (await Oppiaineet.getValinnaiset(this.state.opetussuunnitelma!.id!)).data;
    }
  }

  async fetchJulkaisut() {
    this.state.julkaisut = (await Julkaisut.getJulkaisut(this.state.opetussuunnitelma!.id!)).data;
    if (_.includes(_.map(this.state.julkaisut, 'tila'), OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN)) {
      await this.fetchViimeisinJulkaisuTila();
      await this.pollTila();
    }
  }

  async fetchViimeisinJulkaisuTila() {
    this.state.viimeisinJulkaisuTila = (await Julkaisut.viimeisinJulkaisuTila(this.state.opetussuunnitelma!.id!)).data;

    if (this.state.viimeisinJulkaisuTila !== OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN) {
      clearInterval(this.state.tilaPolling);
      this.state.tilaPolling = null;
      this.state.julkaisut = (await Julkaisut.getJulkaisut(this.state.opetussuunnitelma!.id!)).data;
      this.state.opetussuunnitelma = await this.get();
      await this.fetchJulkaisemattomiaMuutoksia();
    }
  }

  async pollTila() {
    if (this.state.viimeisinJulkaisuTila === OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN) {
      this.state.tilaPolling = setInterval(() => this.fetchViimeisinJulkaisuTila(), 2500);
    }
  }

  public async fetchJulkaisemattomiaMuutoksia() {
    this.state.julkaisemattomiaMuutoksia = null;
    this.state.julkaisemattomiaMuutoksia = (await Julkaisut.julkaisemattomiaMuutoksia(this.state.opetussuunnitelma!.id!)).data;
  }

  public async get() {
    return (await Opetussuunnitelmat.getOpetussuunnitelma(this.state.opsId)).data;
  }

  public async getPohjanVuosiluokkakokonaisuudet(ops) {
    if (ops.pohja) {
      return (await Opetussuunnitelmat.getOpetussuunnitelmanPohjanVuosiluokkakokonaisuudet(this.state.opsId)).data;
    }

    return null;
  }

  public async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    const res = await Opetussuunnitelmat.updateOpetussuunnitelma(opetussuunnitelma.id as number, opetussuunnitelma as OpetussuunnitelmaDto);
    success('tallennus-onnistui-opetussuunnitelma');
    this.state.opetussuunnitelma = res.data as OpetussuunnitelmaKevytDto;
  }

  public async updateValidation() {
    this.state.validointi = null;
    this.state.validointi = (await Opetussuunnitelmat.validoiOpetussuunnitelma(this.state.opetussuunnitelma!.id!)).data;
    await this.fetchJulkaisemattomiaMuutoksia();
  }

  public async removeTeksti(tovId: number) {
    await OpetussuunnitelmanSisalto.removeTekstiKappaleViite(this.state.opetussuunnitelma!.id!, tovId);
    await this.updateSisalto();
  }

  public async tekstikappaleAlaOpetussuunnitelmaLukumaara(tunniste) {
    return (await OpetussuunnitelmanSisalto.getTekstikappaleAlaOpetussuunnitelmaLukumaara(this.state.opetussuunnitelma!.id!, tunniste)).data;
  }

  public async addTeksti(tov: Puu, parentId?: number) {
    let osa: AxiosResponse<Matala>;
    if (parentId) {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappaleLapsi(this.state.opetussuunnitelma!.id!, parentId, tov as Matala);
    }
    else {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappale(this.state.opetussuunnitelma!.id!, tov as Matala);
    }
    success('lisays-onnistui-tekstikappale');
    await this.updateSisalto();
    return osa.data;
  }

  public async kopioiTeksti(tov: Puu) {
    const kopioitu = await OpetussuunnitelmanSisalto.kloonaaTekstiKappale(this.state.opetussuunnitelma!.id!, tov.id!);
    success('kopiointi-onnistui-tekstikappale');
    return kopioitu;
  }

  public static async updateOpsTila(opsId: number, uusiTila: string) {
    return Opetussuunnitelmat.updateTila(opsId, uusiTila as any);
  }

  public async updateTila(uusiTila: string) {
    if (uusiTila) {
      await OpetussuunnitelmaStore.updateOpsTila(this.state.opetussuunnitelma!.id!, uusiTila as any);
      this.state.opetussuunnitelma = {
        ...this.state.opetussuunnitelma!,
        tila: uusiTila as any,
      };
    }
  }

  public async saveTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.updateTekstiKappaleViite(this.state.opetussuunnitelma!.id!, tov.id!, tov);
    await this.updateSisalto();
  }

  // Julkaisut
  public async julkaise(julkaisu: UusiJulkaisuDto) {
    await Julkaisut.julkaise(this.state.opetussuunnitelma!.id!, julkaisu);
    await this.fetchJulkaisut();
    if (!_.includes(_.map(this.state.julkaisut, 'tila'), OpetussuunnitelmanJulkaisuDtoTilaEnum.KESKEN)) {
      this.state.opetussuunnitelma = await this.get();
      await this.fetchJulkaisemattomiaMuutoksia();
    }
  }

  public async palautaJulkaisu(julkaisu) {
    const tallennettuJulkaisu = (await Julkaisut.aktivoiJulkaisu(this.state.opetussuunnitelma!.id!, julkaisu.revision)).data;
    this.state.julkaisut = [tallennettuJulkaisu, ...this.state.julkaisut!];
  }

  // Lops 2021
  // Pilko omiin moduuleihin

  // Paikalliset oppiaineet
  public async addOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto = {}) {
    const result = (await Lops2019Oppiaineet.addLops2019PaikallinenOppiaine(this.state.opetussuunnitelma!.id!, oppiaine)).data;
    this.state.paikallisetOppiaineet = [...this.state.paikallisetOppiaineet, result];
    success('lisays-onnistui-oppiaine');
    return result;
  }

  public async getPaikallinenOppiaine(id: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenOppiaine(this.state.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallinenOppiaineTuotu(id: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenOppiaineTuotu(this.state.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallisetOppiaineet() {
    const paikalliset = (await Lops2019Oppiaineet.getAllLops2019PaikallisetOppiainet(this.state.opetussuunnitelma!.id!)).data;
    return paikalliset;
  }

  public async savePaikallinenOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto) {
    const result = (await Lops2019Oppiaineet.updateLops2019PaikallinenOppiaine(this.state.opetussuunnitelma!.id!, oppiaine.id!, oppiaine)).data;
    success('tallennus-onnistui-oppiaine');
    const idx = _.findIndex(this.state.paikallisetOppiaineet, { id: result.id });
    this.state.paikallisetOppiaineet = [
      ..._.slice(this.state.paikallisetOppiaineet, 0, idx),
      result,
      ..._.slice(this.state.paikallisetOppiaineet, idx + 1),
    ] as Lops2019PaikallinenOppiaineDto[];
    // Oppiaineen koodin vaihtaminen tekee muutoksen opintojakson oppiaineen koodeihin
    this.state.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.state.opetussuunnitelma!.id!)).data;
    return result;
  }

  public async getPaikallinenOppiaineenHistoria(id: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenVersionHistory(this.state.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallinenOppiaineVersion(id: number, versionumero: number) {
    return (await Lops2019Oppiaineet.getLops2019PaikallinenVersion(this.state.opetussuunnitelma!.id!, id, versionumero)).data;
  }

  public async revertPaikallinenOppiaineToVersion(id: number, versionumero: number) {
    await Lops2019Oppiaineet.revertLops2019PaikallinenToVersion(this.state.opetussuunnitelma!.id!, id, versionumero);
  }

  public async getJulkaisut() {
    return (await Julkaisut.getJulkaisut(this.state.opetussuunnitelma!.id!)).data;
  }

  // Opintojaksot
  public async addOpintojakso(opintojakso: Lops2019OpintojaksoDto = {}) {
    const result = (await Opintojaksot.addOpintojakso(this.state.opetussuunnitelma!.id!, opintojakso)).data;
    success('lisays-onnistui-opintojakson');
    this.state.opintojaksot = [...this.state.opintojaksot, result];
    return result;
  }

  public async getOpintojaksot(query: OpintojaksoQuery = {}) {
    let chain = _((await Opintojaksot.getAllOpintojaksot(this.state.opetussuunnitelma!.id!)).data);
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
    return (await Opintojaksot.getVersionHistory(this.state.opetussuunnitelma!.id!, opintojaksoId)).data;
  }

  public async revertOpintojaksoToVersion(opintojaksoId: number, versionumero: number) {
    await Opintojaksot.revertToVersion(this.state.opetussuunnitelma!.id!, opintojaksoId, versionumero);
  }

  public async getOpintojaksoVersion(opintojaksoId: number, versionumero: number) {
    return (await Opintojaksot.getVersion(this.state.opetussuunnitelma!.id!, opintojaksoId, versionumero)).data;
  }

  public async getOpintojakso(id: number) {
    return (await Opintojaksot.getOpintojakso(this.state.opetussuunnitelma!.id!, id)).data;
  }

  public async getTuotuOpintojakso(id: number) {
    return (await Opintojaksot.getTuotuOpintojakso(this.state.opetussuunnitelma!.id!, id)).data;
  }

  public async getOpintojaksonOpetussuunnitelma(id: number) {
    return (await Opintojaksot.getOpintojaksonOpetussuunnitelma(this.state.opetussuunnitelma!.id!, id)).data;
  }

  public async getPoistetut() {
    return (await Lops2019.getRemoved(this.state.opetussuunnitelma!.id!)).data;
  }

  public async getPoistetutTekstikappaleet() {
    return (await OpetussuunnitelmanSisalto.getRemovedTekstikappaleet(this.state.opetussuunnitelma!.id!)).data;
  }

  public async palautaTekstirakenne() {
    await Opetussuunnitelmat.palautaTekstirakenne(this.state.opetussuunnitelma!.id!);
    await this.updateSisalto();
  }

  public async palauta(poistettu) {
    try {
      if (poistettu.tyyppi) {
        await Lops2019.palauta(this.state.opetussuunnitelma!.id!, poistettu.id!);
        await this.getPoistetut();
      }
      else {
        // Tekstikappaleiden poisto
        OpetussuunnitelmanSisalto.returnRemoved(this.state.opetussuunnitelma!.id!, poistettu!.id);
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
    await Lops2019Oppiaineet.removeLops2019PaikallinenOppiaine(this.state.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-oppiaineen');
    const idx = _.findIndex(this.state.paikallisetOppiaineet, { id });
    this.state.paikallisetOppiaineet = [
      ..._.slice(this.state.paikallisetOppiaineet, 0, idx),
      ..._.slice(this.state.paikallisetOppiaineet, idx + 1),
    ] as Lops2019PaikallinenOppiaineDto[];
  }

  public async removeOpintojakso(id: number) {
    await Opintojaksot.removeOpintojakso(this.state.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-opintojakson');
    const idx = _.findIndex(this.state.opintojaksot, { id });
    this.state.opintojaksot = [
      ..._.slice(this.state.opintojaksot, 0, idx),
      ..._.slice(this.state.opintojaksot, idx + 1),
    ] as Lops2019OpintojaksoDto[];
  }

  public async saveOpintojakso(opintojakso: Lops2019OpintojaksoDto) {
    const result = (await Opintojaksot.updateOpintojakso(this.state.opetussuunnitelma!.id!, opintojakso.id!, opintojakso)).data;
    success('tallennus-onnistui-opintojakson');
    const idx = _.findIndex(this.state.opintojaksot, { id: result.id });
    this.state.opintojaksot = [
      ..._.slice(this.state.opintojaksot, 0, idx),
      result,
      ..._.slice(this.state.opintojaksot, idx + 1),
    ] as Lops2019OpintojaksoDto[];
    return result;
  }

  public async fetchOrganisaatioVirkailijat() {
    const orgOids = _(this.state.opetussuunnitelma?.organisaatiot)
      .filter(org => org.oid !== organizations.oph.oid)
      .map(org => org.oid as string)
      .value();
    this.state.virkailijat = _.uniqBy((await Ulkopuoliset.getOrganisaatioVirkailijat(orgOids)).data as any[], 'oid');
  }

  public async updateOppiaineJaOpintojaksojarjestys(oppiaineopintojaksojarjestys) {
    await Opetussuunnitelmat.updateOppiaineJaOpintojaksojarjestys(this.state.opetussuunnitelma!.id!, oppiaineopintojaksojarjestys);
  }

  public async updateOppiainejarjestys(oppiainejarjestys) {
    await Opetussuunnitelmat.updateOppiainejarjestys(this.state.opetussuunnitelma!.id!, oppiainejarjestys);
  }

  public async syncTekstitPohjasta() {
    await Opetussuunnitelmat.syncTekstitPohjasta(this.state.opetussuunnitelma!.id!);
  }

  public async synkronisoiPohja() {
    await Opetussuunnitelmat.sync(this.state.opetussuunnitelma!.id!);
    this.state.pohjanPerustePaivittynyt = false;
  }

  public setOpetussuunnitelmaNimi(nimi) {
    this.state.opetussuunnitelma = {
      ...this.state.opetussuunnitelma,
      nimi,
    };
  }
}

let opsServiceCache: OpetussuunnitelmaStore | null = null;

export function Opetussuunnitelma() {
  return opsServiceCache!;
}

export function getOpetussuunnitelmaService(id: number) {
  if (!opsServiceCache || opsServiceCache.opsId.value !== id) {
    opsServiceCache = new OpetussuunnitelmaStore(id);
  }
  return opsServiceCache;
}
