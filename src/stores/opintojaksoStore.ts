import { IEditoitava, EditoitavaFeatures } from '@shared/components/EpEditointi/EditointiStore';
import VueCompositionApi, { reactive, computed, ref, watch } from 'vue';
import { Opetussuunnitelmat, Lops2019OpintojaksoDto } from '@shared/api/ylops';
import * as _ from 'lodash';
import { Kielet } from '@shared/stores/kieli';
import { Revision } from '@shared/tyypit';
import { createLogger } from '@shared/utils/logger';
import { opintojaksoValidator } from '@/validators/opintojakso';
import VueRouter from 'vue-router';
import Vue from 'vue';
import * as defaults from '@/defaults';

const logger = createLogger('OpintojaksoStore');

interface OpintojaksoStoreConfig {
  router: VueRouter;
}

export class OpintojaksoStore implements IEditoitava {
  constructor(
    private opsId: number,
    private opintojaksoId: number | string,
    private versionumero: number,
    private store: any, // Reference to the main store
    private isUusi: boolean = false,
    private oaUri: string,
  ) {
  }

  private static config: OpintojaksoStoreConfig;

  public static install(vue: typeof Vue, config: OpintojaksoStoreConfig) {
    OpintojaksoStore.config = config;
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
    if (this.isUusi) {
      const result = defaults.opintojakso() as Lops2019OpintojaksoDto;

      if (this.oaUri) {
        result.oppiaineet!.push({
          koodi: this.oaUri,
          laajuus: 0,
          isPaikallinenOppiaine: false,
          isModuuliton: false,
        } as any);
      }

      supportDataProvider({});
      return result;
    }
    else {
      let opintojakso: any = await this.store.getTuotuOpintojakso(_.parseInt(this.opintojaksoId as string));

      if (!opintojakso) {
        if (this.versionumero) {
          const revisions = await this.store.getOpintojaksoHistoria(_.parseInt(this.opintojaksoId as string));
          const rev = revisions[revisions.length - this.versionumero];
          if (rev) {
            opintojakso = await this.store.getOpintojaksoVersion(_.parseInt(this.opintojaksoId as string), rev.numero as number);
          }
          else {
            opintojakso = await this.store.getOpintojakso(_.parseInt(this.opintojaksoId as string));
          }
        }
        else {
          opintojakso = await this.store.getOpintojakso(_.parseInt(this.opintojaksoId as string));
        }
      }
      else {
        opintojakso.tuotuOpintojakso = true;
        opintojakso.opintojaksonOpetussuunnitelma = await this.store.getOpintojaksonOpetussuunnitelma(_.parseInt(this.opintojaksoId as string));
      }

      supportDataProvider({});
      return opintojakso;
    }
  }

  async save(data: Lops2019OpintojaksoDto) {
    if (this.isUusi) {
      const uusi = await this.store.addOpintojakso(data);
      return () => {
        OpintojaksoStore.config.router.push({
          name: 'opintojakso',
          params: {
            ...OpintojaksoStore.config.router.currentRoute.params,
            opintojaksoId: _.toString(uusi.id),
          },
        });
      };
    }
    else {
      await this.store.saveOpintojakso(data);
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
    await this.store.revertOpintojaksoToVersion(_.parseInt(this.opintojaksoId as string), rev);
  }

  async revisions() {
    if (this.isUusi || !_.includes(_.map(this.store.opintojaksot, 'id'), _.parseInt(this.opintojaksoId as string))) {
      return [];
    }
    else {
      return this.store.getOpintojaksoHistoria(_.parseInt(this.opintojaksoId as string));
    }
  }

  async start() {
  }

  async remove(data?: any) {
    if (data?.tuotuOpintojakso) {
      await this.store.removeOpintojakso(data.id);
      OpintojaksoStore.config.router.push({
        name: 'opsPoistetut',
        params: {
          tabIndex: '0',
        },
      });
    }
    else {
      await this.store.removeOpintojakso(_.parseInt(this.opintojaksoId as string));
      OpintojaksoStore.config.router.push({
        name: 'opsPoistetut',
        params: {
          tabIndex: '0',
        },
      });
    }
  }

  async hide(data) {
    // Implementation for hiding opintojakso if needed
  }

  async unHide(data) {
    // Implementation for unhiding opintojakso if needed
  }

  async copy(data) {
    // Implementation for copying opintojakso if needed
  }

  public readonly validator = computed(() => {
    return opintojaksoValidator([
      Kielet.getSisaltoKieli.value, // Validoidaan kentät sisältökielen mukaan
    ]);
  });

  public features(data) {
    return computed(() => {
      return data ? {
        editable: true,
        removable: true,
        hideable: false,
        isHidden: false,
        recoverable: !this.isUusi,
        copyable: false,
      } as EditoitavaFeatures
        : {};
    });
  }
}
