import { Store, Getter, Mutation, Action, State } from './store';
import { createLogger } from './logger';
import * as _ from 'lodash';


interface EditointiKontrolliConfig {
  start?: () => Promise<void>;
  save?: () => Promise<void>;
  cancel?: () => Promise<void>;
  remove?: () => Promise<void>;
  validate?: () => Promise<boolean>;
}


const DefaultConfig: EditointiKontrolliConfig = Object.freeze({
  start: async () => {},
  save: async () => {},
  cancel: async () => {},
  remove: async () => {},
  validate: async () => true,
});


export class EditointiKontrolli {
  private logger = createLogger(EditointiKontrolli);
  private isEditingState = false;
  private isRemoved = false;

  public constructor(private config: EditointiKontrolliConfig) {
    this.logger.debug('Initing editointikontrollit with: ', _.keys(config));
    this.config = {
      ...DefaultConfig,
      ...config,
    };
  }

  public get isEditing() {
    return this.isEditingState;
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

    this.logger.debug('Aloitetaan editointi');
    this.config.start!();
    this.isEditingState = true;
  }

  public async cancel() {
    if (!this.isEditing) {
      this.logger.warn('Ei voi perua');
      return;
    }
    this.logger.debug('Perutaan editointi');
    await this.config.cancel!();
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
      await this.config.save!();
      this.isEditingState = false;
      this.logger.success('Tallennettu');
    }
    else {
      this.logger.debug('Tallentaminen ei mahdollista');
    }
  }

}

export function editointi(config: EditointiKontrolliConfig = {}) {
  const result = new EditointiKontrolli(config);
  return result;
}
