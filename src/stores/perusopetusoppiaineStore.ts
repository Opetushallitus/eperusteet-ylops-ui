import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokkakokonaisuudet } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';

export class PerusopetusoppiaineStore implements IEditoitava {
  constructor(private opsId: number, private oppiaineId: number, private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto) {
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
    let oppiaine;
    let perusteenOppiaine;
    [oppiaine, perusteenOppiaine] = _.map(await (Promise.all([
      Oppiaineet.getOppiaine(this.opsId, this.oppiaineId),
      Oppiaineet.getPerusteSisalto(this.opsId, this.oppiaineId),
    ])), 'data');

    return {
      oppiaine,
      perusteenOppiaine,
      perusteenVuosiluokkakokonaisuus: _.head(_.filter(perusteenOppiaine.vuosiluokkakokonaisuudet, vlk =>
        vlk._vuosiluokkakokonaisuus === (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus as any)._tunniste)),
      vuosiluokkakokonaisuus: _.chain(oppiaine.vuosiluokkakokonaisuudet)
        .filter(vlk => vlk._vuosiluokkakokonaisuus === (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus as any)._tunniste)
        .map(vlk => {
          return {
            ...vlk,
            vuosiluokat: _.sortBy(vlk.vuosiluokat, 'vuosiluokka'),
          };
        })
        .head()
        .value(),
    };
  }

  async save(data: any) {
    data.vuosiluokkakokonaisuus = (await OppiaineenVuosiluokkakokonaisuudet
      .updateVuosiluokkakokonaisuudenSisalto(this.opsId, this.oppiaineId, data.vuosiluokkakokonaisuus.id, data.vuosiluokkakokonaisuus)).data;
    return data;
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  // async remove() {
  // }

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
}
