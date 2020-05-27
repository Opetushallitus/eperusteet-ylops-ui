import _ from 'lodash';
import { computed } from '@vue/composition-api';

import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import { Oppiaineet, Vuosiluokkakokonaisuudet, OpsVuosiluokkakokonaisuusKevytDto } from '@shared/api/ylops';

export class PerusopetusPaikallinenOppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private oppiaineId: number,
    private vuosiluokkakokonaisuus: OpsVuosiluokkakokonaisuusKevytDto,
    private vuosiluokkakokonaisuudet: OpsVuosiluokkakokonaisuusKevytDto[],
    private vue,
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

    const opsVuosiluokkakokonaisuus = _.find(this.vuosiluokkakokonaisuudet, [
      'vuosiluokkakokonaisuus._tunniste',
      vuosiluokkakokonaisuus!['_vuosiluokkakokonaisuus'],
    ]);

    const perusteVuosiluokkakokonaisuus = (await Vuosiluokkakokonaisuudet
      .getVuosiluokkakokonaisuudenPerusteSisalto(
        this.opsId,
        opsVuosiluokkakokonaisuus!.vuosiluokkakokonaisuus!.id!
      )).data;

    const vuosiluokat = _.orderBy(vuosiluokkakokonaisuus?.vuosiluokat, 'vuosiluokka', 'asc');
    const perusteVuosiluokat = perusteVuosiluokkakokonaisuus.vuosiluokat;

    // Todo: Refaktoroi
    if (_.isNull(vuosiluokkakokonaisuus?.tehtava)) {
      vuosiluokkakokonaisuus!.tehtava = {
        otsikko: {
          fi: 'valinnaisen-tehtava',
        },
      } as any;
    }
    if (_.isNull(vuosiluokkakokonaisuus?.tyotavat)) {
      vuosiluokkakokonaisuus!.tyotavat = {
        otsikko: {
          fi: 'oppiaine-tyotavat',
        },
      } as any;
    }
    if (_.isNull(vuosiluokkakokonaisuus?.ohjaus)) {
      vuosiluokkakokonaisuus!.ohjaus = {
        otsikko: {
          fi: 'oppiaine-ohjaus',
        },
      } as any;
    }
    if (_.isNull(vuosiluokkakokonaisuus?.arviointi)) {
      vuosiluokkakokonaisuus!.arviointi = {
        otsikko: {
          fi: 'oppiaine-arviointi',
        },
      } as any;
    }

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
    const oppiaineenTallennus = {
      oppiaine: data.oppiaine,
      vuosiluokkakokonaisuusId: this.vuosiluokkakokonaisuus.vuosiluokkakokonaisuus?.id!,
      vuosiluokat: data.valitutVuosiluokat,
      tavoitteet: [],
    };
    return Oppiaineet.updateYksinkertainen(this.opsId, this.oppiaineId, oppiaineenTallennus);
  }

  async remove() {
    await Oppiaineet.deleteOppiaine(this.opsId, this.oppiaineId);
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
