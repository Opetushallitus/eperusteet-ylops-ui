import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import { reactive, computed, ref, watch } from 'vue';
import { Opetussuunnitelmat, Lops2019PaikallinenOppiaineDto, Lops2019Oppiaineet } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Revision } from '@shared/tyypit';
import { createLogger } from '@shared/utils/logger';
import { oppiaineValidator } from '@/validators/oppiaineet';
import VueRouter from 'vue-router';
import Vue from 'vue';
import * as defaults from '@/defaults';
import { KoodistoLops2019LaajaAlaiset } from '@/utils/perusteet';

const logger = createLogger('LopsPaikallinenOppiaineStore');

interface LopsPaikallinenOppiaineStoreConfig {
  router: VueRouter;
}

export class LopsPaikallinenOppiaineStore implements IEditoitava {
  constructor(
    private opsId: number,
    private paikallinenOppiaineId: number | string,
    private versionumero: number,
    private store: any, // Reference to the main store
    private isUusi: boolean = false,
    private oppiaineUri: string,
  ) {
  }

  private static config: LopsPaikallinenOppiaineStoreConfig;
  private tuotuOppimaara = false;

  public static install(vue: typeof Vue, config: LopsPaikallinenOppiaineStoreConfig) {
    LopsPaikallinenOppiaineStore.config = config;
  }

  async acquire() {
    return null;
  }

  async cancel() {
  }

  async editAfterLoad() {
    return this.isUusi;
  }

  async load(supportDataProvider) {
    let paikallinen = defaults.oppiaine();

    if (!this.isUusi) {
      const tuotu = (await Lops2019Oppiaineet.getLops2019PaikallinenOppiaineTuotu(this.opsId, _.parseInt(this.paikallinenOppiaineId as string))).data;
      if (tuotu) {
        paikallinen = tuotu;
        this.tuotuOppimaara = true;
      }
      else {
        const revisions = (await Lops2019Oppiaineet.getLops2019PaikallinenVersionHistory(this.opsId, _.parseInt(this.paikallinenOppiaineId as string))).data;
        const rev = revisions[revisions.length - this.versionumero];
        if (this.versionumero && rev) {
          paikallinen = (await Lops2019Oppiaineet.getLops2019PaikallinenVersion(this.opsId, _.parseInt(this.paikallinenOppiaineId as string), rev.numero as number)).data;
        }
        else {
          paikallinen = (await Lops2019Oppiaineet.getLops2019PaikallinenOppiaine(this.opsId, _.parseInt(this.paikallinenOppiaineId as string))).data;
        }
      }
    }

    // Load laaja-alaiset koodit
    let laajaAlaisetKoodit: any = null;
    try {
      laajaAlaisetKoodit = (await Opetussuunnitelmat.getKoodistonKoodit(this.opsId, KoodistoLops2019LaajaAlaiset)).data;
    }
    catch (err) {
      console.error(err);
    }

    // Check if there's an oppiaine query parameter to pre-select
    if (this.oppiaineUri) {
      paikallinen.perusteenOppiaineUri = this.oppiaineUri;
    }

    // Initialize default structures
    paikallinen.tehtava = paikallinen.tehtava || {};
    paikallinen.arviointi = paikallinen.arviointi || {};
    paikallinen.tavoitteet = paikallinen.tavoitteet || {
      tavoitealueet: [],
    };
    paikallinen.opiskeluymparistoTyotavat = paikallinen.opiskeluymparistoTyotavat || {};

    supportDataProvider({
      laajaAlaisetKoodit: _.sortBy(laajaAlaisetKoodit, 'koodiArvo'),
      tuotuOppimaara: this.tuotuOppimaara,
    });

    return paikallinen;
  }

  async save(data: Lops2019PaikallinenOppiaineDto) {
    if (this.isUusi) {
      const oa = await this.store.addOppiaine(data);
      return () => {
        LopsPaikallinenOppiaineStore.config.router.push({
          name: 'paikallinenOppiaine',
          params: {
            paikallinenOppiaineId: _.toString(oa.id),
          },
        });
      };
    }
    else {
      await this.store.savePaikallinenOppiaine(data);
    }
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
    await Lops2019Oppiaineet.revertLops2019PaikallinenToVersion(this.opsId, _.parseInt(this.paikallinenOppiaineId as string), rev.numero as number);
  }

  async revisions() {
    if (this.isUusi || this.tuotuOppimaara) {
      return [];
    }
    else {
      return (await Lops2019Oppiaineet.getLops2019PaikallinenVersionHistory(this.opsId, _.parseInt(this.paikallinenOppiaineId as string))).data as Revision[];
    }
  }

  async start() {
  }

  async remove(data?: any) {
    await this.store.removeOppiaine(data?.id || _.parseInt(this.paikallinenOppiaineId as string));
    LopsPaikallinenOppiaineStore.config.router.push({
      name: 'opsPoistetut',
      params: {
        tabIndex: '1',
      },
    });
  }

  async hide(data) {
    // Implementation for hiding paikallinen oppiaine if needed
  }

  async unHide(data) {
    // Implementation for unhiding paikallinen oppiaine if needed
  }

  async copy(data) {
    // Implementation for copying paikallinen oppiaine if needed
  }

  public readonly validator = computed(() => {
    return oppiaineValidator([
      Kielet.getSisaltoKieli.value,
    ]);
  });

  public features(data) {
    return computed(() => {
      return data ? {
        editable: true,
        removable: true,
        hideable: false,
        isHidden: false,
        recoverable: !this.isUusi && !this.tuotuOppimaara,
        copyable: false,
      } as EditoitavaFeatures
        : {};
    });
  }
}
