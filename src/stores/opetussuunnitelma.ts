import { Ohjeet, OpetussuunnitelmanSisalto, Opetussuunnitelmat } from '@/api';
import { Matala, OhjeDto, OpetussuunnitelmaKevytDto, Puu, TekstiKappaleViiteKevytDto } from '@/tyypit';
import { AxiosResponse } from 'axios';
import { createLogger } from './logger';
import { State, Store } from './store';

const logger = createLogger('Opetussuunnitelma');

@Store
class OpetussuunnitelmaStore {
  @State()
  public sisalto: TekstiKappaleViiteKevytDto | null = null;

  @State()
  public opetussuunnitelma: OpetussuunnitelmaKevytDto | null = null;

  public async updateSisalto() {
    if (this.opetussuunnitelma && this.opetussuunnitelma.id) {
      this.sisalto = (await OpetussuunnitelmanSisalto.getTekstiOtsikot(this.opetussuunnitelma.id)).data;
    }
  }

  public async init(id: number) {
    this.opetussuunnitelma = await this.get(id);
    await this.updateSisalto();
  }

  public async get(id: number) {
    return (await Opetussuunnitelmat.getOpetussuunnitelma(id)).data;
  }

  public async save(opetussuunnitelma: OpetussuunnitelmaKevytDto) {
    try {
      const res = await Opetussuunnitelmat.updateOpetussuunnitelma(opetussuunnitelma.id as number, opetussuunnitelma);
      this.opetussuunnitelma = res.data;
    }
    catch (err) {
      logger.error(err);
    }
  }

  public async addTeksti(tov: Puu, parentId?: number) {
    let osa: AxiosResponse<Matala>;
    if (parentId) {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappaleLapsi(this.opetussuunnitelma!.id!, parentId, tov);
    }
    else {
      osa = await OpetussuunnitelmanSisalto.addTekstiKappale(this.opetussuunnitelma!.id!, tov);
    }
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
}

export const Opetussuunnitelma = new OpetussuunnitelmaStore();
