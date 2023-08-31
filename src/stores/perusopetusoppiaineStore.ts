import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokkakokonaisuudet, OppiaineSuppeaDto, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Revision } from '@shared/tyypit';
import { isOppiaineUskontoTaiKieli } from '@/utils/opetussuunnitelmat';
import { createLogger } from '@shared/utils/logger';
import { requiredLokalisoituTeksti } from '@shared/validators/required';

const logger = createLogger('PerusopetusoppiaineStore');

export class PerusopetusoppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private versionumero: number,
    private parent: OppiaineSuppeaDto,
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
    const oppiaine = (await this.getOppiaineVersion()).data;
    let perusteenOppiaine;
    try {
      perusteenOppiaine = (await Oppiaineet.getPerusteSisalto(this.opsId, this.oppiaineId)).data;
    }
    catch (e) {
      logger.error(e);
    }

    if (!_.isObject(oppiaine.tehtava) && this.isOppiaineTaiOppimaaraUskontoTaiKieli(oppiaine)) {
      oppiaine.tehtava = {};
    }

    return {
      oppiaine,
      perusteenOppiaine,
      perusteenVuosiluokkakokonaisuus: _.head(_.filter(_.get(perusteenOppiaine, 'vuosiluokkakokonaisuudet'), vlk =>
        vlk._vuosiluokkakokonaisuus === (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus as any)._tunniste)),
      vuosiluokkakokonaisuus: _.chain(oppiaine.vuosiluokkakokonaisuudet)
        .filter(vlk => _.get(vlk, '_vuosiluokkakokonaisuus') === (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus as any)._tunniste)
        .map(vlk => {
          return {
            ...vlk,
            vuosiluokat: _.sortBy(vlk.vuosiluokat, 'vuosiluokka'),
          };
        })
        .head()
        .value(),
      pohjaOppiaineenVuosiluokkakokonaisuus: _.chain(oppiaine.pohjanOppiaine?.vuosiluokkakokonaisuudet)
        .filter(vlk => _.get(vlk, '_vuosiluokkakokonaisuus') === (this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus as any)._tunniste)
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
    data.oppiaine = (await Oppiaineet.updateOppiaineWithVlk(this.opsId, this.vuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!, this.oppiaineId, data.oppiaine)).data;

    if (data.vuosiluokkakokonaisuus) {
      data.vuosiluokkakokonaisuus = (await OppiaineenVuosiluokkakokonaisuudet
        .updateVuosiluokkakokonaisuudenSisalto(this.opsId, this.oppiaineId, data.vuosiluokkakokonaisuus.id, data.vuosiluokkakokonaisuus)).data;
    }

    await this.el.resetOps();
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

  async remove() {
    await Oppiaineet.deleteOppiaine(this.opsId, this.oppiaineId);

    this.el.$router.push({
      name: 'vuosiluokkakokonaisuus',
      params: {
        vlkId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id,
      },
    });

    await this.el.resetOps();
  }

  async hide(data) {
    await Vuosiluokkakokonaisuudet.piilotaOppiaine(this.opsId, this.oppiaineId, this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!);

    if (data.oppiaine.oma) {
      const piilotettu = {
        piilotettu: true,
      };

      await OppiaineenVuosiluokkakokonaisuudet
        .updateVuosiluokkakokonaisuudenSisalto(
          this.opsId, this.oppiaineId,
          data.vuosiluokkakokonaisuus.id,
          piilotettu);
    }

    await this.el.resetOps();
    await this.el.init();
  }

  async unHide(data) {
    await Vuosiluokkakokonaisuudet.palautaOppiaine(this.opsId, this.oppiaineId, this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!);

    if (data.oppiaine.oma) {
      const piilotettu = {
        id: data.vuosiluokkakokonaisuus.id,
        piilotettu: false,
      };

      await OppiaineenVuosiluokkakokonaisuudet
        .updateVuosiluokkakokonaisuudenSisalto(
          this.opsId, this.oppiaineId,
          data.vuosiluokkakokonaisuus.id,
          piilotettu);
    }

    await this.el.resetOps();
    await this.el.init();
  }

  async copy(data) {
    const kopioituOppiaine = await Oppiaineet.kopioiMuokattavaksi(this.opsId, this.oppiaineId, true);
    await this.el.resetOps();
    this.el.$router.push({
      name: 'perusopetusoppiaine',
      params: {
        oppiaineId: kopioituOppiaine.data.id!,
      },
    });
  }

  public readonly validator = computed(() => {
    return {
      oppiaine: {
        nimi: {
          ...requiredLokalisoituTeksti(),
        },
      },
    };
  });

  public features(data) {
    return computed(() => {
      return data ? {
        editable: data.perusteenOppiaine && data.oppiaine.oma,
        removable: this.parent && isOppiaineUskontoTaiKieli(this.parent) && data.oppiaine.oma,
        hideable: this.parent && isOppiaineUskontoTaiKieli(this.parent) && (data.oppiaine.oma || !data.vuosiluokkakokonaisuus?.piilotettu),
        isHidden: data.vuosiluokkakokonaisuus?.piilotettu || _.includes(this.vuosiluokkakokonaisuus.lisatieto?.piilotetutOppiaineet, data.oppiaine.id) || false,
        recoverable: data.oppiaine.oma,
        copyable: !data.oppiaine.oma && !this.parent,
      } as EditoitavaFeatures
        : {};
    });
  }
}
