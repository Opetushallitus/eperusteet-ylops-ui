import {
  Termisto,
} from '@/api';
import {
  TermiDto,
} from '@/tyypit';
import { UusiJulkaisuDto, Lops2019PaikallinenOppiaineDto, Lops2019ValidointiDto, Matala, Lops2019OppiaineDto, Lops2019ModuuliDto, Lops2019OpintojaksoDto, OhjeDto, OpetussuunnitelmaDto, OpetussuunnitelmaKevytDto, Puu, TekstiKappaleViiteKevytDto } from '@/tyypit';
import { Lops2019, Ohjeet, OpetussuunnitelmanSisalto, Opintojaksot, Oppiaineet, Opetussuunnitelmat, Lops2019Perusteet } from '@/api';
import { AxiosResponse } from 'axios';
import { createLogger } from './logger';
import { State, Store } from './store';
import { success, fail } from '@/utils/notifications';
import _ from 'lodash';

const logger = createLogger('Opetussuunnitelma');

interface Referencable {
  id?: number;
}

interface OpintojaksoQuery {
  oppiaineUri?: string;
  moduuliUri?: string;
}

@Store
class OpetussuunnitelmaStore {
  @State()
  public sisalto: TekstiKappaleViiteKevytDto | null = null;

  @State()
  public opetussuunnitelma: OpetussuunnitelmaKevytDto | null = null;

  @State()
  public paikallisetOppiaineet: Lops2019PaikallinenOppiaineDto[] = [];

  @State()
  public opintojaksot: Lops2019OpintojaksoDto[] = [];

  @State()
  public kasitteet: TermiDto[] = [];

  @State()
  public progress = 0;

  private opsId: number | null = null;
  private initcv: Promise<void> | null = null;

  // Tekstikappaleet

  public async getOtsikot() {
    const opsId = _.get(this.opetussuunnitelma, 'id', null);
    return opsId ? (await OpetussuunnitelmanSisalto.getTekstiOtsikot(opsId)).data : null;
  }

  public async getKasitteet() {
    const opsId = _.get(this.opetussuunnitelma, 'id', null);
    return opsId ? (await Termisto.getAllTermit(opsId)).data : [];
  }

  public async updateSisalto() {
    this.sisalto = await this.getOtsikot();
    this.kasitteet = await this.getKasitteet();
  }

  public async init(id: number) {
    if (this.opsId === id) {
      if (this.initcv) {
        await this.initcv;
      }
    }
    else {
      this.opsId = id;
      this.initcv = new Promise(async (resolve) => {
        logger.info('Initing peruste rakenne', id);
        this.opetussuunnitelma = await this.get(id);
        await this.updateSisalto();
        this.opintojaksot = (await Opintojaksot.getAllOpintojaksot(this.opetussuunnitelma!.id!)).data;
        this.paikallisetOppiaineet = await this.getPaikallisetOppiaineet();
        logger.info('Inited peruste rakenne');
        this.initcv = null;
        resolve();
      });
      await this.initcv;
    }
  }

  public async get(id: number) {
    return (await Opetussuunnitelmat.getOpetussuunnitelma(id)).data;
  }

  // @Checked({
  //   success: "tallennus-onnistui-opetussuunnitelma",
  // })
  public async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    const res = await Opetussuunnitelmat.updateOpetussuunnitelma(opetussuunnitelma.id as number, opetussuunnitelma as OpetussuunnitelmaDto);
    success('tallennus-onnistui-opetussuunnitelma');
    this.opetussuunnitelma = res.data as OpetussuunnitelmaKevytDto;
  }

  public async validate() {
    const result = (await Lops2019.getValidointi(this.opetussuunnitelma!.id!)).data;
    if (result) {
      const onnistuneet = result.onnistuneetValidoinnit;
      const kaikki = result.kaikkiValidoinnit;
      if (onnistuneet && kaikki) {
        this.progress = Math.floor(onnistuneet / kaikki * 100);
      }
    }
    return result;
  }

  public async removeTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.removeTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!);
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

  public async updateTila(uusiTila: string) {
    if (uusiTila) {
      await Opetussuunnitelmat.updateTila(this.opetussuunnitelma!.id!, uusiTila as any);
      this.opetussuunnitelma = {
        ...this.opetussuunnitelma!,
        tila: uusiTila as any,
      };
    }
  }

  public async saveTeksti(tov: Puu) {
    await OpetussuunnitelmanSisalto.updateTekstiKappaleViite(this.opetussuunnitelma!.id!, tov.id!, tov);
    success('tallennus-onnistui-tekstikappale');
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
    try {
      return (await Opetussuunnitelmat.julkaise(this.opetussuunnitelma!.id!, julkaisu)).data;
    }
    catch (err) {
      fail('julkaisu-epaonnistui', err.response.data.syy);
    }
  }

  // Lops 2021
  // Pilko omiin moduuleihin

  // Paikalliset oppiaineet
  public async addOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto = {}) {
    const result = (await Oppiaineet.addLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine)).data;
    success('lisays-onnistui-oppiaine');
    this.paikallisetOppiaineet = [...this.paikallisetOppiaineet, result];
    return result;
  }

  public async getPaikallinenOppiaine(id: number) {
    return (await Oppiaineet.getLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, id)).data;
  }

  public async getPaikallisetOppiaineet() {
    const paikalliset = (await Oppiaineet.getAllLops2019PaikallisetOppiainet(this.opetussuunnitelma!.id!)).data;
    return paikalliset;
  }

  public async savePaikallinenOppiaine(oppiaine: Lops2019PaikallinenOppiaineDto) {
    const result = (await Oppiaineet.updateLops2019PaikallinenOppiaine(this.opetussuunnitelma!.id!, oppiaine.id!, oppiaine)).data;
    success('tallennus-onnistui-oppiaine');
    const idx = _.findIndex(this.paikallisetOppiaineet, { id: result.id });
    this.paikallisetOppiaineet = [
      ..._.slice(this.paikallisetOppiaineet, 0, idx),
      result,
      ..._.slice(this.paikallisetOppiaineet, idx + 1),
    ];
    return result;
  }

  public async getJulkaisut() {
    return (await Opetussuunnitelmat.getJulkaisut(this.opetussuunnitelma!.id!)).data;
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
        query.oppiaineUri));
    }
    return chain.value();
  }

  public async getOpintojaksoHistoria(opintojaksoId: number) {
    return (await Opintojaksot.getVersionHistory(this.opetussuunnitelma!.id!, opintojaksoId)).data;
  }

  public async getOpintojakso(id: number) {
    try {
      const result = (await Opintojaksot.getOpintojakso(this.opetussuunnitelma!.id!, id)).data;
      return result;
    }
    catch (err) {
      console.error(err);
    }
  }

  public async getPoistetutOpintojaksot() {
    return (await Opintojaksot.getRemoved(this.opetussuunnitelma!.id!)).data;
  }

  public async palautaOpintojakso(poistettuId: number) {
    const result = (await Opintojaksot.palauta(this.opetussuunnitelma!.id!, poistettuId)).data;
    success('palautus-opintojakso-onnistui');
    this.opintojaksot = [...this.opintojaksot, result];
    return result;
  }

  public async removeOpintojakso(id: number) {
    await Opintojaksot.removeOpintojakso(this.opetussuunnitelma!.id!, id);
    success('poisto-onnistui-opintojakson');
    const idx = _.findIndex(this.opintojaksot, { id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      ..._.slice(this.opintojaksot, idx + 1),
    ];
  }

  public async saveOpintojakso(opintojakso: Lops2019OpintojaksoDto) {
    const result = (await Opintojaksot.updateOpintojakso(this.opetussuunnitelma!.id!, opintojakso.id!, opintojakso)).data;
    success('tallennus-onnistui-opintojakson');
    const idx = _.findIndex(this.opintojaksot, { id: result.id });
    this.opintojaksot = [
      ..._.slice(this.opintojaksot, 0, idx),
      result,
      ..._.slice(this.opintojaksot, idx + 1),
    ];
    return result;
  }
}

export const Opetussuunnitelma = new OpetussuunnitelmaStore();
