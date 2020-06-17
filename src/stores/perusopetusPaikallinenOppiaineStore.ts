import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet,
  Vuosiluokkakokonaisuudet,
  OpsVuosiluokkakokonaisuusKevytDto,
} from '@shared/api/ylops';

export class PerusopetusPaikallinenOppiaineStore implements IEditoitava {
  private isUusi: boolean;

  constructor(
    private opsId: number,
    private oppiaineId: string,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
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
    const oppiaine = this.isUusi ? { vuosiluokkakokonaisuudet: [], _liittyvaOppiaine: null } : (await Oppiaineet.getOppiaine(this.opsId, _.toNumber(this.oppiaineId))).data;
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
        this.vuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!
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
    this.vue.store.init(); // Päivitetään sivunavigaatio
    this.vue.$router.push({
      name: 'perusopetusvalinnaiset',
    });
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
