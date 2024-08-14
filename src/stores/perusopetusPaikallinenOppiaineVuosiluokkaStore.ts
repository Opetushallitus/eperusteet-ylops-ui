import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
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

    const pohjanOppiaine = (await Oppiaineet.getPohjanVastaavaOppiaine(this.opsId, _.toNumber(this.oppiaineId))).data ?? {};
    const pohjanVuosiluokkakokonaisuus = _.find(pohjanOppiaine.vuosiluokkakokonaisuudet, [
      '_vuosiluokkakokonaisuus',
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!['_tunniste'],
    ]);
    const pohjanVuosiluokka = _.find(pohjanVuosiluokkakokonaisuus?.vuosiluokat, [
      'vuosiluokka',
      vuosiluokka?.vuosiluokka,
    ]);

    return {
      oppiaine,
      vuosiluokkakokonaisuus,
      vuosiluokka,
      pohjanOppiaine,
      pohjanTavoitteet: _.keyBy(pohjanVuosiluokka?.tavoitteet, 'tunniste'),
    };
  }

  async save(data) {
    return OppiaineenVuosiluokat.updateValinnaisenVuosiluokanSisalto(
      this.opsId,
      this.oppiaineId,
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
      this.vuosiluokkaId,
      data.vuosiluokka.tavoitteet,
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

  public features(data) {
    return computed(() => {
      return {
        editable: data?.oppiaine?.oma,
        removable: false,
        hideable: false,
        recoverable: false,
      } as EditoitavaFeatures;
    });
  }
}
