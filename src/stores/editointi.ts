import * as _ from 'lodash';
import Vue from 'vue';
import VueScrollTo from 'vue-scrollto';
import { RevisionDto } from '@/tyypit';
import { router } from '@/router';
import { fail } from '@/utils/notifications';
import { createLogger } from '@shared/utils/logger';

interface EditointiKontrolliFeatures {
  removal: boolean;
  validation: boolean;
  history: boolean;
  restore: boolean;
  preview: boolean;
}

export interface EditointiKontrolliHistory {
  revisions: (data) => Promise<RevisionDto[]>;
  restore?: (data, rev: number) => Promise<void>;
}

export interface EditointiKontrolliValidation {
  valid: boolean;
  message?: string;
}

export interface EditointiKontrolliData {
  load: () => Promise<unknown>;
  save?: (data: any) => Promise<any>;
  cancel?: () => Promise<void>;
}

export interface EditointiKontrolliLocks {
  acquire: () => Promise<boolean>;
  release: () => Promise<void>;
}

export interface EditointiKontrolliConfig {
  editAfterLoad?: () => Promise<boolean>;
  source: EditointiKontrolliData;
  locks?: EditointiKontrolliLocks;
  history?: EditointiKontrolliHistory;
  start?: () => Promise<void>;
  remove?: (data: any) => Promise<void>;
  validate?: (data: any) => Promise<EditointiKontrolliValidation>;
  preview?: () => Promise<void>;
}

export interface EditointiKontrolliRestore {
  numero: number;
  modal?: any;
  routePushLatest?: boolean;
}

const DefaultConfig = {
  start: async () => {},
  remove: async () => {},
  validate: async () => ({
    valid: true
  }),
};


export class EditointiKontrolli {
  private static allEditingEditors: EditointiKontrolli[] = [];
  private logger = createLogger(EditointiKontrolli);
  private isEditingState = false;
  private isRemoved = false;
  private isNew = false;

  private readonly features: EditointiKontrolliFeatures;
  private mstate = Vue.observable({
    data: null,
    revisions: [] as RevisionDto[],
    backup: null,
    disabled: true,
    isSaving: false,
  });
  private backup: any = null;

  public static anyEditing() {
    return EditointiKontrolli.allEditingEditors.length > 0;
  }

  public static async cancelAll() {
    for(const editor of EditointiKontrolli.allEditingEditors) {
      await editor.cancel(true);
    }
  }

  public constructor(
    private config: EditointiKontrolliConfig
  ) {
    this.features = {
      removal: !!config.remove,
      validation: !!config.validate,
      history: !!config.history,
      restore: !!config.history && !!config.history.restore,
      preview: !!config.preview,
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

  public get isEditable() {
    return !!(this.config.source.save);
  }

  public get state() {
    return this.mstate;
  }

  public async init() {
    this.isNew = !!(this.config.editAfterLoad && await this.config.editAfterLoad());
    const data = await this.fetch();
    if (this.config.history && this.config.history.revisions) {
      this.mstate.revisions = await this.config.history.revisions(data);
    }
    this.logger.debug('Haetaan data', data);
    this.backup = JSON.stringify(data);
    this.mstate.data = data;
    this.mstate.disabled = false;
    if (this.isNew) {
      await this.start();
    }
  }

  public async start() {
    this.mstate.disabled = true;
    if (this.isEditing) {
      this.logger.warn('Editointi jo käynnissä');
      this.mstate.disabled = false;
      return;
    }

    if (this.isRemoved) {
      this.logger.warn('Poistettua resurssia ei voi editoida');
      this.mstate.disabled = false;
      return;
    }

    try {
      this.logger.debug('Aloitetaan editointi');
      if (!this.isNew) {
        await this.init();
      }
      if (this.config.start) {
        await this.config.start();
      }
      this.isEditingState = true;
      EditointiKontrolli.allEditingEditors = [
        ...EditointiKontrolli.allEditingEditors,
        this
      ];
    }
    catch (err) {
      this.logger.error('Editoinnin aloitus epäonnistui:', err);
    }
    finally {
      this.mstate.disabled = false;

      const navbar = document.getElementById('navigation-bar');
      const navbarHeight = navbar ? (-1 * navbar.getBoundingClientRect().height) : 0;
      const target = document.getElementById('scroll-anchor');
      if (target) {
        VueScrollTo.scrollTo('#scroll-anchor', {
          offset: navbarHeight,
          x: false,
          y: true,
        });
      }
    }
  }

  public async cancel(skipRedirectBack?) {
    this.mstate.disabled = true;
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
    _.remove(EditointiKontrolli.allEditingEditors, (editor) => editor == this);
    this.mstate.disabled = false;

    if (this.isNew && !skipRedirectBack) {
      router.go(-1);
    }
  }

  public async validate() {
    const validation = await this.config.validate!(this.mstate.data);
    this.logger.debug('Validointi:', validation);
    return validation;
  }

  public async remove() {
    this.mstate.disabled = true;
    this.isEditingState = false;
    _.remove(EditointiKontrolli.allEditingEditors, (editor) => editor == this);
    try {
      await this.config.remove!(this.mstate.data);
      this.logger.debug('Poistettu');
      this.isRemoved = true;
    }
    catch (err) {
      const syy = _.get(err, 'response.data.syy');
      if (syy) {
        fail('poisto-epaonnistui', err.response.data.syy);
      }
      else {
        this.logger.error('poisto-epaonnistui', err);
        fail('poisto-epaonnistui');
      }
      this.isRemoved = false;
    }
    this.mstate.disabled = false;
  }

  public async save() {
    this.mstate.disabled = true;
    this.mstate.isSaving = true;

    const validation = await this.validate();

    if (!this.isEditing) {
      this.logger.warn('Ei voi tallentaa ilman editointia');
    }
    else if(!validation.valid) {
      this.logger.debug('Validointi epäonnistui');
      fail(validation.message ? validation.message : 'validointi-epaonnistui');
    }
    else if (!!(this.config.source.save)) {
      try {
        const after = await this.config.source.save(this.mstate.data);
        this.logger.success('Tallennettu onnistuneesti');
        await this.fetchRevisions();
        await this.init();
        this.isEditingState = false;
        _.remove(EditointiKontrolli.allEditingEditors, (editor) => editor == this);
        if (after && _.isFunction(after)) {
          await after();
        }
      }
      catch (err) {
        fail('tallennus-epaonnistui', err.response.data.syy);
        this.isEditingState = true;
      }
    }
    else {
      this.logger.debug('Tallentaminen ei mahdollista');
    }
    this.mstate.disabled = false;
    this.mstate.isSaving = false;
  }

  public async restore(event: EditointiKontrolliRestore) {
    try {
      await this.config.history!.restore!(this.mstate.data, event.numero);
      this.logger.success('Palautettu onnistuneesti');

      // Piilotetaan modaali
      if (event.modal && _.isFunction(event.modal.hide)) {
        event.modal.hide();
      }

      // Päivitetään näkymä uusimpaan
      if (event.routePushLatest) {
        await router.push({ query: {} });
      }

      const data = await this.fetch();
      await this.fetchRevisions();
      this.backup = JSON.stringify(data);
      this.mstate.data = data;
    }
    catch (err) {
      const syy = _.get(err, 'response.data.syy');
      if (syy) {
        fail('palautus-epaonnistui', err.response.data.syy);
      }
      else {
        this.logger.error('Palautus epäonnistui', err);
        fail('palautus-epaonnistui');
      }
    }
  }

  private async fetchRevisions() {
    if (this.config.history && this.config.history.revisions) {
      this.mstate.revisions = await this.config.history.revisions(this.mstate.data);
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
