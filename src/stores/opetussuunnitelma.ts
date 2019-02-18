import Vue from 'vue';
import * as _ from 'lodash';
import { Store, Getter, Mutation, Action, State } from './store';
import {
  KayttajanTietoDto,
  OpetussuunnitelmaKevytDto,
  TekstiKappaleViiteKevytDto,
  Puu,
} from '@/tyypit';
import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
  OpetussuunnitelmanSisalto,
} from '@/api';

import { createLogger } from './logger';
const logger = createLogger('Opetussuunnitelma');

@Store
class OpetussuunnitelmaStore {

  @State()
  public tekstit: Puu | null = null;

  @State()
  public sisalto: TekstiKappaleViiteKevytDto | null = null;

  @State()
  public opetussuunnitelma: OpetussuunnitelmaKevytDto | null = null;

  public async init(id: number) {
    this.opetussuunnitelma = await this.get(id);
    this.sisalto = (await OpetussuunnitelmanSisalto.getTekstiOtsikot(id)).data;
    this.tekstit = (await OpetussuunnitelmanSisalto.getTekstiKappaleViiteSyva(id, this.sisalto.id as number)).data;
  }

  public async get(id: number) {
    return (await Opetussuunnitelmat.get(id)).data;
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

}

export const Opetussuunnitelma = new OpetussuunnitelmaStore();
