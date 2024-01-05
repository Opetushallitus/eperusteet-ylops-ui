import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet,
  Vuosiluokkakokonaisuudet,
  OpsVuosiluokkakokonaisuusKevytDto,
} from '@shared/api/ylops';
import { Revision } from '@shared/tyypit';
import { nimiValidator } from '@/validators/required';
import { required, requiredIf } from 'vuelidate/lib/validators';

export class PerusopetusPaikallinenOppiaineStore implements IEditoitava {
  private isUusi: boolean;

  constructor(
    private opsId: number,
    private oppiaineId: string,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private versionumero: number,
    private vue,
  ) {
    this.isUusi = oppiaineId === 'uusi';
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.isUusi;
  }

  async history() {
  }

  async load() {
    const oppiaine = this.isUusi ? { vuosiluokkakokonaisuudet: [], _liittyvaOppiaine: null } : (await this.getOppiaineVersion()).data;
    const vuosiluokkakokonaisuus = _.find(oppiaine.vuosiluokkakokonaisuudet, [
      '_vuosiluokkakokonaisuus',
      this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus!['_tunniste'],
    ]) || {
      tehtava: {},
      tyotavat: {},
      ohjaus: {},
      arviointi: {},
      tavoitteistaJohdetutOppimisenTavoitteet: {},
    };

    const perusteVuosiluokkakokonaisuus = (await Vuosiluokkakokonaisuudet
      .getVuosiluokkakokonaisuudenPerusteSisalto(
        this.opsId,
        this.vuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!,
      )).data;

    const vuosiluokat = _.orderBy(vuosiluokkakokonaisuus?.vuosiluokat, 'vuosiluokka', 'asc');
    const perusteVuosiluokat = perusteVuosiluokkakokonaisuus.vuosiluokat;
    const oppiaineet = _.map(this.vue.opetussuunnitelmaStore.opetussuunnitelma.oppiaineet, 'oppiaine');
    const liittyvaOppiaine = _.find(oppiaineet, { id: _.toNumber(oppiaine._liittyvaOppiaine) });

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
        vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
        vuosiluokat: data.valitutVuosiluokat,
        tavoitteet: [],
      })).data;
      this.vue.store.init(); // Päivitetään sivunavigaatio
      return () => {
        this.vue.$router.push({
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
        vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
        vuosiluokat: data.valitutVuosiluokat,
        tavoitteet: [],
      };
      const updated = await Oppiaineet.updateYksinkertainen(this.opsId, _.toNumber(this.oppiaineId), oppiaineenTallennus);
      this.vue.store.init(); // Päivitetään sivunavigaatio
      return updated;
    }
  }

  async remove() {
    await Oppiaineet.deleteOppiaine(this.opsId, _.toNumber(this.oppiaineId));
    await this.vue.store.init(); // Päivitetään sivunavigaatio
    this.vue.$router.push({
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
    const kopioituOppiaine = (await Oppiaineet.kopioiMuokattavaksi(this.opsId, _.toNumber(this.oppiaineId), false)).data;
    await this.vue.store.init();
    this.vue.$router.push({
      name: 'perusopetuspaikallinenoppiaine',
      params: {
        oppiaineId: _.toString(kopioituOppiaine.id),
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
        required: requiredIf(function(data) {
          return data.oppiaine.valinnainenTyyppi === 'syventava';
        }),
      },
    };
  });

  public features(data) {
    return computed(() => {
      return {
        editable: data?.oppiaine?.oma,
        removable: true,
        hideable: false,
        recoverable: true,
        copyable: !data.oppiaine.oma,
      } as EditoitavaFeatures;
    });
  }
}
