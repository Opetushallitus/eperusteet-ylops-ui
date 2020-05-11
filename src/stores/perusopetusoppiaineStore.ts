import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokkakokonaisuudet, OpsOppiaineKevytDto } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Revision } from '@shared/tyypit';
import { isOppiaineUskontoTaiKieli } from '@/utils/opetussuunnitelmat';

export class PerusopetusoppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private versionumero: number,
    private parent: OpsOppiaineKevytDto,
    private el: any) {
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
      this.getOppiaineVersion(),
      Oppiaineet.getPerusteSisalto(this.opsId, this.oppiaineId),
    ])), 'data');

    if (!_.isObject(oppiaine.tehtava) && this.isOppiaineTaiOppimaaraUskontoTaiKieli(oppiaine)) {
      oppiaine.tehtava = {};
    }

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

  isOppiaineTaiOppimaaraUskontoTaiKieli(oppiaine) {
    return (this.parent && isOppiaineUskontoTaiKieli(this.parent)) || isOppiaineUskontoTaiKieli(oppiaine);
  }

  async getOppiaineVersion() {
    if (this.versionumero) {
      const revisions = (await Oppiaineet.getOppiaineVersionHistory(this.opsId, this.oppiaineId)).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return Oppiaineet.getOppiaineVersion(this.opsId, this.oppiaineId, rev.numero);
    }
    else {
      return Oppiaineet.getOppiaine(this.opsId, this.oppiaineId);
    }
  }

  async save(data: any) {
    data.oppiaine = (await Oppiaineet.updateOppiaine(this.opsId, this.oppiaineId, data.oppiaine)).data;

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

  async restore(rev) {
    await Oppiaineet.revertOppiaineToVersion(this.opsId, this.oppiaineId, rev);
  }

  async revisions() {
    const data = (await Oppiaineet.getOppiaineVersionHistory(this.opsId, this.oppiaineId)).data;
    return data as Revision[];
  }

  async start() {
  }

  public readonly validator = computed(() => {
    return {};
  });
}
