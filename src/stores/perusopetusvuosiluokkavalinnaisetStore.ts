import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { computed } from '@vue/composition-api';
import { OpsVuosiluokkakokonaisuusKevytDto, OpetussuunnitelmaKevytDto, OppiaineSuppeaDtoTyyppiEnum } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Opetussuunnitelma } from './opetussuunnitelma';

export class PerusopetusVuosiluokkaValinnaisetStore implements IEditoitava {
  constructor(
    private ops: OpetussuunnitelmaKevytDto,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
  ) {
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return false;
  }

  async history() {
  }

  async load() {
    return {
      vuosiluokkakokonaisuus: this.vuosiluokkakokonaisuus,
      oppiaineet: _.chain(this.ops.oppiaineet)
        .map('oppiaine')
        .filter(oppiaine => oppiaine?.tyyppi !== OppiaineSuppeaDtoTyyppiEnum.YHTEINEN.toLowerCase()
          && _.includes(
            _.map(oppiaine?.vuosiluokkakokonaisuudet, '_vuosiluokkakokonaisuus'),
            _.get(this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus, '_tunniste')))
        .map(oppiaine => {
          return {
            ...oppiaine,
            vuosiluokat: _.chain(oppiaine?.vuosiluokkakokonaisuudet)
              .filter(vlk => vlk.vuosiluokkakokonaisuus === this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.tunniste)
              .map('vuosiluokat')
              .flatMap()
              .sortBy('vuosiluokka')
              .value(),
          };
        })
        .value(),
    };
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async restore() {
  }

  async revisions() {
    return [];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
  });

  public features() {
    return computed(() => {
      return {
        editable: true,
        removable: false,
        hideable: false,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }
}
