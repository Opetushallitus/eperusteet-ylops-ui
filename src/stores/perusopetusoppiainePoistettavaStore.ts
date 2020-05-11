import { IEditoitava } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Oppiaineet, OpsVuosiluokkakokonaisuusKevytDto, OppiaineenVuosiluokkakokonaisuudet, OpsOppiaineKevytDto } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Revision } from '@shared/tyypit';
import { PerusopetusoppiaineStore } from './perusopetusoppiaineStore';

export class PerusopetusoppiainePoistettavaStore extends PerusopetusoppiaineStore {
  constructor(
    private opsIdb: number,
    private oppiaineIdb: number,
    private vuosiluokkakokonaisuusb: OpsVuosiluokkakokonaisuusKevytDto,
    private versionumerob: number,
    private parentb: OpsOppiaineKevytDto,
    private elb: any) {
    super(opsIdb, oppiaineIdb, vuosiluokkakokonaisuusb, versionumerob, parentb, elb);
  }

  async remove() {
    await Oppiaineet.deleteOppiaine(this.opsIdb, this.oppiaineIdb);

    this.elb.$router.push({
      name: 'vuosiluokkakokonaisuus',
      params: {
        vlkId: this.vuosiluokkakokonaisuusb.vuosiluokkakokonaisuus?.id,
      },
    });

    await this.elb.resetOps();
  }

  async hide(data) {
    const piilotettu = {
      piilotettu: true,
    };

    await OppiaineenVuosiluokkakokonaisuudet
      .updateVuosiluokkakokonaisuudenSisalto(
        this.opsIdb, this.oppiaineIdb,
        data.vuosiluokkakokonaisuus.id,
        piilotettu);
  }

  async unHide(data) {
    const piilotettu = {
      id: data.vuosiluokkakokonaisuus.id,
      piilotettu: false,
    };

    await OppiaineenVuosiluokkakokonaisuudet
      .updateVuosiluokkakokonaisuudenSisalto(
        this.opsIdb, this.oppiaineIdb,
        data.vuosiluokkakokonaisuus.id,
        piilotettu);
  }

  public readonly isHidden = (data) => {
    return computed(() => {
      return data.vuosiluokkakokonaisuus.piilotettu;
    });
  }
}
