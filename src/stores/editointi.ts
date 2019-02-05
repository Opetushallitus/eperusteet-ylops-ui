import Vue from 'vue';
import Vuex from 'vuex';
import { Store, Getter, Mutation, Action, State } from './store';
import { createLogger } from './logger';
import * as _ from 'lodash';
import { RevisionDto } from '@/tyypit';


interface EditointiKontrolliFeatures {
  removal: boolean;
  validation: boolean;
  history: boolean;
  restore: boolean;
}


export interface EditointiKontrolliHistory {
  items: () => Promise<RevisionDto[]>;
  restore?: (rev: RevisionDto) => Promise<void>;
}


export interface EditointiKontrolliData {
  load: () => Promise<unknown>;
  save: (data: any) => Promise<boolean | void>;
  cancel?: () => Promise<void>;
}


export interface EditointiKontrolliLocks {
  acquire: () => Promise<boolean>;
  release: () => Promise<void>;
}


export interface EditointiKontrolliConfig {
  source: EditointiKontrolliData;
  locks?: EditointiKontrolliLocks;
  history?: EditointiKontrolliHistory;
  start?: () => Promise<void>;
  remove?: () => Promise<void>;
  validate?: () => Promise<boolean>;
}


const DefaultConfig = {
  start: async () => {},
  remove: async () => {},
  validate: async () => true,
};


export class EditointiKontrolli {
  private logger = createLogger(EditointiKontrolli);
  private isEditingState = false;
  private isRemoved = false;
  private readonly features: EditointiKontrolliFeatures;
  private mstate = Vue.observable({
    data: null,
    backup: null,
  });
  private backup: any = null;

  public constructor(
    private config: EditointiKontrolliConfig,
  ) {
    this.features = {
      removal: !!config.remove,
      validation: !!config.validate,
      history: !!config.history,
      restore: !!config.history && !!config.history.restore,
    };

    this.logger.debug('Initing editointikontrollit with: ', _.keys(config));
    this.config = {
      ...DefaultConfig,
      ...config,
    };
  }

  public get getFeatures() {
    return this.features;
  }

  public get isEditing() {
    return this.isEditingState;
  }

  public get state() {
    return this.mstate;
  }

  public async init() {
    const data = await this.fetch();
    this.logger.debug('Haetaan data', data);
    this.backup = JSON.stringify(data);
    this.mstate.data = data;
    // this.config.setData!(data);
  }

  public async start() {
    if (this.isEditing) {
      this.logger.warn('Editointi jo käynnissä');
      return;
    }

    if (this.isRemoved) {
      this.logger.warn('Poistettua resurssia ei voi editoida');
      return;
    }

    try {
      this.logger.debug('Aloitetaan editointi');
      await this.init();
      if (this.config.start) {
        await this.config.start();
      }
      this.isEditingState = true;
    }
    catch (err) {
      this.logger.error('Editoinnin aloitus epäonnistui:', err);
    }
  }

  public async cancel() {
    if (!this.isEditing) {
      this.logger.warn('Ei voi perua');
      return;
    }

    this.logger.debug('Perutaan editointi');
    if (this.config.source.cancel) {
      await this.config.source.cancel!();
    }
    this.mstate.data = JSON.parse(this.backup);
    // this.config.setData!(JSON.parse(this.backup));
    this.isEditingState = false;
  }

  public async validate() {
    const validation = await this.config.validate!();
    this.logger.debug('Validointi:', validation);
    return validation;
  }

  public async remove() {
    await this.config.remove!();
    this.isRemoved = true;
    this.isEditingState = false;
    this.logger.debug('Poistettu');
  }

  public async save() {
    if (!this.isEditing) {
      this.logger.warn('Ei voi tallentaa ilman editointia');
      return;
    }

    if (await this.validate()) {
      // await this.config.source.save(await this.config.getData!());
      await this.config.source.save(this.mstate.data);
      this.isEditingState = false;
      this.logger.success('Tallennettu');
    }
    else {
      this.logger.debug('Tallentaminen ei mahdollista');
    }
  }

  private async fetch() {
    const data = await this.config.source.load();
    if (_.isObject(data) || _.isArray(data)) {
      return JSON.parse(JSON.stringify(data));
    }
    else {
      throw new Error('Source must be an object or an array');
    }
  }

}

export function editointi(config: EditointiKontrolliConfig) {
  return new EditointiKontrolli(config);
}
