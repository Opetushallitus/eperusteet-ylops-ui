import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokat, OppiaineenVuosiluokkaDto } from '@shared/api/ylops';

export class PerusopetusPaikallinenOppiaineVuosiluokkaStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private vuosiluokkaId: number,
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
    const vuosiluokka = _.find(vuosiluokkakokonaisuus?.vuosiluokat, [
      'id',
      this.vuosiluokkaId,
    ]);
    return {
      oppiaine,
      vuosiluokkakokonaisuus,
      vuosiluokka,
    };
  }

  async save(data) {
    const tavoitteet = _(data.vuosiluokka.tavoitteet)
      .map(t => {
        return {
          otsikko: t.tavoite,
          teksti: t.sisaltoalueet[0].sisaltoalueet.kuvaus,
        };
      })
      .value();
    return OppiaineenVuosiluokat.updateValinnaisenVuosiluokanSisalto(
      this.opsId,
      this.oppiaineId,
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
      this.vuosiluokkaId,
      tavoitteet,
    );
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
