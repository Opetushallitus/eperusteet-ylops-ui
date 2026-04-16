import _ from 'lodash';
import { computed } from 'vue';
import { Router } from 'vue-router';
import type { App } from 'vue';

import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet,
  Vuosiluokkakokonaisuudet,
  OpsVuosiluokkakokonaisuusKevytDto,
  OppiaineenVuosiluokkakokonaisuudet,
} from '@shared/api/ylops';
import { Revision } from '@shared/tyypit';
import { nimiValidator } from '@/validators/required';
import { required, requiredIf } from '@vuelidate/validators';
import { OpetussuunnitelmaStore } from './opetussuunnitelma';

interface PerusopetusPaikallinenOppiaineStoreConfig {
  router: Router;
  opetussuunnitelmaStore: OpetussuunnitelmaStore
}

export class PerusopetusPaikallinenOppiaineStore implements IEditoitava {
  private static config: PerusopetusPaikallinenOppiaineStoreConfig;

  public static install(app: App, config: PerusopetusPaikallinenOppiaineStoreConfig) {
    PerusopetusPaikallinenOppiaineStore.config = config;
  }

  private isUusi: boolean;

  constructor(
    private opsId: number,
    private oppiaineId: string,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private versionumero: number,
    private muokkaaLatauksenJalkeen: boolean,
    private resetOps: () => Promise<void>,
  ) {
    this.isUusi = oppiaineId === 'uusi';
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.isUusi || this.muokkaaLatauksenJalkeen;
  }

  async history() {
  }

  async load(supportDataProvider) {
    const oppiaine = this.isUusi ? { vuosiluokkakokonaisuudet: [], _liittyvaOppiaine: null } : (await this.getOppiaineVersion()).data;
    const vuosiluokkakokonaisuus = this.getOppiaineVuosiluokkakokonaisuus(oppiaine);

    const perusteVuosiluokkakokonaisuus = (await Vuosiluokkakokonaisuudet
      .getVuosiluokkakokonaisuudenPerusteSisalto(
        this.opsId,
        this.vuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!,
      )).data;

    const vuosiluokat = _.orderBy(vuosiluokkakokonaisuus?.vuosiluokat, 'vuosiluokka', 'asc');
    const perusteVuosiluokat = perusteVuosiluokkakokonaisuus.vuosiluokat;
    const oppiaineet = _.map(PerusopetusPaikallinenOppiaineStore.config.opetussuunnitelmaStore.opetussuunnitelma.value?.oppiaineet, 'oppiaine');
    const liittyvaOppiaine = _.find(oppiaineet, { id: _.toNumber(oppiaine._liittyvaOppiaine) });

    let pohjanOppiaine = {};
    let pohjaOppiaineenVuosiluokkakokonaisuus = {};
    if ((oppiaine as any)?.oma) {
      pohjanOppiaine = (await Oppiaineet.getPohjanVastaavaOppiaine(this.opsId, _.toNumber(this.oppiaineId))).data ?? {};
      pohjaOppiaineenVuosiluokkakokonaisuus = this.getOppiaineVuosiluokkakokonaisuus(pohjanOppiaine);
    }
    supportDataProvider({ pohjanOppiaine, pohjaOppiaineenVuosiluokkakokonaisuus });

    return {
      oppiaine,
      vuosiluokkakokonaisuus,
      vuosiluokat,
      valitutVuosiluokat: _.map(vuosiluokat, 'vuosiluokka'),
      perusteVuosiluokat: _(perusteVuosiluokat).sort(),
      liittyvaOppiaine,
      oppiaineet,
    };
  }

  getOppiaineVuosiluokkakokonaisuus(oppiaine?) {
    return _.find(oppiaine?.vuosiluokkakokonaisuudet, [
      '_vuosiluokkakokonaisuus',
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!['_tunniste'],
    ]) || {
      tehtava: {
        teksti: {},
      },
      tyotavat: {
        teksti: {},
      },
      ohjaus: {
        teksti: {},
      },
      arviointi: {
        teksti: {},
      },
      tavoitteistaJohdetutOppimisenTavoitteet: {
        teksti: {},
      },
    };
  }

  async getOppiaineVersion() {
    if (this.versionumero) {
      const revisions = (await Oppiaineet.getOppiaineVersionHistory(this.opsId, _.toNumber(this.oppiaineId))).data as Revision[];
      const rev = revisions[revisions.length - this.versionumero];
      return Oppiaineet.getOppiaineVersion(this.opsId, _.toNumber(this.oppiaineId), rev.numero);
    }
    else {
      return Oppiaineet.getOppiaine(this.opsId, _.toNumber(this.oppiaineId));
    }
  }

  async save(data) {
    data.oppiaine.vuosiluokkakokonaisuudet = [data.vuosiluokkakokonaisuus];
    data.oppiaine._liittyvaOppiaine = data.liittyvaOppiaine ? _.toString(data.liittyvaOppiaine.id) : null;
    if (this.isUusi) {
      const oa = (await Oppiaineet.addValinnainen(this.opsId, {
        oppiaine: data.oppiaine,
        vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!.id!,
        vuosiluokat: data.valitutVuosiluokat,
        tavoitteet: [],
      })).data;
      await PerusopetusPaikallinenOppiaineStore.config.opetussuunnitelmaStore.initNavigation(); // Päivitetään sivunavigaatio
      return () => {
        PerusopetusPaikallinenOppiaineStore.config.router.push({
          name: 'perusopetuspaikallinenoppiaine',
          params: {
            oppiaineId: _.toString(oa.id),
          },
        });
      };
    }
    else {
      const oppiaineenTallennus = {
        oppiaine: data.oppiaine,
        vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!.id!,
        vuosiluokat: data.valitutVuosiluokat,
        tavoitteet: [],
      };
      const updated = await Oppiaineet.updateYksinkertainen(this.opsId, _.toNumber(this.oppiaineId), oppiaineenTallennus);
      await PerusopetusPaikallinenOppiaineStore.config.opetussuunnitelmaStore.initNavigation(); // Päivitetään sivunavigaatio
      return updated;
    }
  }

  async remove() {
    await Oppiaineet.deleteOppiaine(this.opsId, _.toNumber(this.oppiaineId));
    await PerusopetusPaikallinenOppiaineStore.config.opetussuunnitelmaStore.initNavigation(); // Päivitetään sivunavigaatio
    PerusopetusPaikallinenOppiaineStore.config.router.push({
      name: 'perusopetusvalinnaiset',
    });
  }

  async restore(rev) {
    await Oppiaineet.revertOppiaineToVersion(this.opsId, _.toNumber(this.oppiaineId), rev);
  }

  async revisions() {
    if (this.oppiaineId !== 'uusi') {
      const data = (await Oppiaineet.getOppiaineVersionHistory(this.opsId, _.toNumber(this.oppiaineId))).data;
      return data as Revision[];
    }
    else {
      return [];
    }
  }

  async start() {
  }

  async preview() {
    return null;
  }

  async release() {
  }

  async lock() {
    return null;
  }

  async copy(data) {
    const kopioituOppiaine = (await Oppiaineet.kopioiMuokattavaksi(this.opsId, _.toNumber(this.oppiaineId), true)).data;
    await PerusopetusPaikallinenOppiaineStore.config.opetussuunnitelmaStore.initNavigation();
    PerusopetusPaikallinenOppiaineStore.config.router.push({
      name: 'perusopetuspaikallinenoppiaine',
      params: {
        oppiaineId: _.toString(kopioituOppiaine.id),
      },
      query: {
        muokkaa: 'true',
      },
    });
  }

  public readonly validator = computed(() => {
    return {
      oppiaine: {
        ...nimiValidator([]),
        valinnainenTyyppi: {
          required,
        },
      },
      liittyvaOppiaine: {
        required: requiredIf(function(value, siblings) {
          return siblings.oppiaine.valinnainenTyyppi === 'syventava';
        }),
      },
    };
  });

  async hide(data) {
    await Vuosiluokkakokonaisuudet.piilotaOppiaine(this.opsId, _.toNumber(this.oppiaineId), this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!.id!);

    if (data.oppiaine.oma) {
      const piilotettu = {
        piilotettu: true,
      };

      await OppiaineenVuosiluokkakokonaisuudet
        .updateVuosiluokkakokonaisuudenSisalto(
          this.opsId, _.toNumber(this.oppiaineId),
          data.vuosiluokkakokonaisuus.id,
          piilotettu);
    }

    await this.resetOps();
  }

  async unHide(data) {
    await Vuosiluokkakokonaisuudet.palautaOppiaine(this.opsId, _.toNumber(this.oppiaineId), this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!.id!);

    if (data.oppiaine.oma) {
      const piilotettu = {
        id: data.vuosiluokkakokonaisuus.id,
        piilotettu: false,
      };

      await OppiaineenVuosiluokkakokonaisuudet
        .updateVuosiluokkakokonaisuudenSisalto(
          this.opsId, _.toNumber(this.oppiaineId),
          data.vuosiluokkakokonaisuus.id,
          piilotettu);
    }

    await this.resetOps();
  }

  public features(data) {
    return computed(() => {
      return {
        editable: data.oppiaine.oma,
        removable: true,
        hideable: true,
        isHidden: data.vuosiluokkakokonaisuus?.piilotettu,
        recoverable: true,
        copyable: !data.oppiaine.oma,
      } as EditoitavaFeatures;
    });
  }
}
