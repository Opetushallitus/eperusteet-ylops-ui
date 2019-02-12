import Vue from 'vue';
import * as _ from 'lodash';
import { Store, Getter, Mutation, Action, State } from './store';
import {
  KayttajanTietoDto,
  OpetussuunnitelmaDto,
} from '@/tyypit';
import {
  Kayttajat as KayttajatApi,
  Opetussuunnitelmat,
} from '@/api';

import { createLogger } from './logger';
const logger = createLogger('Opetussuunnitelma');

@Store
class OpetussuunnitelmaStore {

  @State()
  public opetussuunnitelma: OpetussuunnitelmaDto | null = null;

  public async init(id: number) {
    this.opetussuunnitelma = null;
    try {
      const res = await Opetussuunnitelmat.get(id);
      this.opetussuunnitelma = res.data;
    }
    catch (err) {
      logger.error(err);
    }
  }

}

export const Opetussuunnitelma = new OpetussuunnitelmaStore();
