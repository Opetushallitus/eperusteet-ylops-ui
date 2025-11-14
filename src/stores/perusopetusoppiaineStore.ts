import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from 'vue';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokkakokonaisuudet, OppiaineSuppeaDto, Vuosiluokkakokonaisuudet } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Revision } from '@shared/tyypit';
import { isOppiaineUskontoTaiKieli } from '@/utils/opetussuunnitelmat';
import { createLogger } from '@shared/utils/logger';
import { requiredLokalisoituTeksti } from '@shared/validators/required';
import VueRouter from 'vue-router';
import Vue from 'vue';

const logger = createLogger('PerusopetusoppiaineStore');

interface PerusopetusoppiaineStoreConfig {
  router: VueRouter;
}

export class PerusopetusoppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private versionumero: number,
    private parent: OppiaineSuppeaDto,
    private resetOps: () => Promise<void>,
    private init: () => Promise<void>,
    private muokkaaLatauksenJalkeen: boolean) {
  }

  private static config: PerusopetusoppiaineStoreConfig;

  public static install(vue: typeof Vue, config: PerusopetusoppiaineStoreConfig) {
    PerusopetusoppiaineStore.config = config;
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.muokkaaLatauksenJalkeen;
  }

  async history() {
  }

  async load(supportDataProvider) {
    const oppiaine = (await this.getOppiaineVersion()).data;
    let perusteenOppiaine;
    try {
      perusteenOppiaine = (await Oppiaineet.getPerusteSisalto(this.opsId, this.oppiaineId)).data;
    }
    catch (e) {
      logger.error(e);
    }

    if (!_.isObject(oppiaine.tehtava)) {
      oppiaine.tehtava = {};
    }

    let pohjanOppiaine = {} as any;
    if ((oppiaine as any)?.oma) {
      pohjanOppiaine = (await Oppiaineet.getPohjanVastaavaOppiaine(this.opsId, _.toNumber(this.oppiaineId))).data ?? {};
    }
    supportDataProvider({ pohjanOppiaine });

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
            yleistavoitteet: vlk.yleistavoitteet ?? {},
          };
        })
        .head()
        .value(),
      pohjaOppiaineenVuosiluokkakokonaisuus: _.chain(pohjanOppiaine?.vuosiluokkakokonaisuudet)
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
    data.oppiaine = (await Oppiaineet.updateOppiaineWithVlk(
      this.opsId,
      this.vuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!,
      this.oppiaineId,
      data.oppiaine,
      data.valuta,
    )).data;

    if (data.vuosiluokkakokonaisuus) {
      data.vuosiluokkakokonaisuus = (await OppiaineenVuosiluokkakokonaisuudet
        .updateVuosiluokkakokonaisuudenSisalto(this.opsId, this.oppiaineId, data.vuosiluokkakokonaisuus.id, data.vuosiluokkakokonaisuus)).data;
    }

    await this.resetOps();
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
    try {
      await Oppiaineet.deleteOppiaine(this.opsId, this.oppiaineId);

      PerusopetusoppiaineStore.config.router.push({
        name: 'vuosiluokkakokonaisuus',
        params: {
          vlkId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id,
        },
      } as any);

      await this.resetOps();
    }
    catch (e) {
      logger.error(e);
      throw e;
    }
  }

  async hide(data) {
    await Vuosiluokkakokonaisuudet.piilotaOppiaine(this.opsId, this.oppiaineId, this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!.id!);

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

    await this.resetOps();
    await this.init();
  }

  async unHide(data) {
    await Vuosiluokkakokonaisuudet.palautaOppiaine(this.opsId, this.oppiaineId, this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!.id!);

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

    await this.resetOps();
    await this.init();
  }

  async copy(data) {
    const kopioituOppiaine = await Oppiaineet.kopioiMuokattavaksi(this.opsId, this.oppiaineId, true);
    await this.resetOps();
    PerusopetusoppiaineStore.config.router.push({
      name: 'perusopetusoppiaine',
      params: {
        oppiaineId: kopioituOppiaine.data.id!,
      },
      query: {
        muokkaa: true,
      },
    } as any);
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
        editable: data.oppiaine.oma,
        removable: this.parent && isOppiaineUskontoTaiKieli(this.parent) && data.oppiaine.oma,
        hideable: this.parent && isOppiaineUskontoTaiKieli(this.parent) && (data.oppiaine.oma || !data.vuosiluokkakokonaisuus?.piilotettu),
        isHidden: data.vuosiluokkakokonaisuus?.piilotettu || _.includes(this.vuosiluokkakokonaisuus.lisatieto?.piilotetutOppiaineet, data.oppiaine.id) || false,
        recoverable: data.oppiaine.oma,
        copyable: !data.oppiaine.oma,
      } as EditoitavaFeatures
        : {};
    });
  }
}
