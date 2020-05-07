import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';

export class PerusopetusPaikallinenOppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
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
    const oppiaine = (await Oppiaineet.getOppiaine(this.opsId, this.oppiaineId)).data;
    const vuosiluokkakokonaisuus = _.find(oppiaine.vuosiluokkakokonaisuudet, [
      '_vuosiluokkakokonaisuus',
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!['_tunniste'],
    ]);
    return {
      oppiaine,
      vuosiluokkakokonaisuus,
      vuosiluokat: _.orderBy(vuosiluokkakokonaisuus?.vuosiluokat, 'vuosiluokka', 'asc'),
    };
  }

  async save(data) {
    const oppiaineenTallennus = {
      oppiaine: data.oppiaine,
      vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
      vuosiluokat: _.map(data.vuosiluokat, 'vuosiluokka'),
      tavoitteet: [],
    };
    return Oppiaineet.updateValinnainen(this.opsId, this.oppiaineId, oppiaineenTallennus);
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
}
