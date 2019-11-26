import _ from 'lodash';
import { KommenttiDto, KayttajanTietoDto } from '@/tyypit';
import { Kayttajat as KayttajatApi, Kommentointi } from '@/api';
import { reactive, computed, ref } from '@vue/composition-api';

import { createLogger } from './logger';
const logger = createLogger('Kayttaja');

// FIXME: tyypitä backendiin
export type Oikeus = 'luku' | 'kommentointi' | 'muokkaus' | 'luonti' | 'poisto' | 'tilanvaihto' | 'hallinta';
export type OikeusKohde = 'opetussuunnitelma' | 'pohja';
export interface Oikeudet { [kohde: string]: Oikeus[]; }

function getOikeusArvo(oikeus: Oikeus) {
  switch (oikeus) {
  case 'luku': return 1;
  case 'kommentointi': return 2;
  case 'muokkaus': return 3;
  case 'luonti': return 4;
  case 'poisto': return 5;
  case 'tilanvaihto': return 6;
  default: return 0;
  }
}

export function parsiEsitysnimi(tiedot: any): string {
  if (tiedot.kutsumanimi && tiedot.sukunimi) {
    return tiedot.kutsumanimi + ' ' + tiedot.sukunimi;
  }
  else {
    return tiedot.oidHenkilo as string;
  }
}

export function nestedRemove<T>(
  obj: T,
  condition: ((val: T) => boolean) | object,
  nestedField: string): T {
  return {
    ...obj,
    [nestedField]: _.chain(obj[nestedField])
      .reject(condition)
      .map(v => nestedRemove(v, condition, nestedField))
      .value(),
  };
}

export function nestedMap<T>(
  obj: T,
  nestedField: string,
  mapFn: ((val: T) => T)): T {
  return {
    ...obj,
    [nestedField]: _.map(obj[nestedField], mapFn),
  };
}

class KommenttiStore {
  private state = reactive({
    updatingThreads: {} as { [uuid: string]: boolean },
    threadUuid: null as string | null,
    thread: null as any | null,
    isLoading: false,
  });

  public readonly updatingThreads = computed(() => this.state.updatingThreads);
  public readonly threadUuid = computed(() => this.state.threadUuid);
  public readonly thread = computed(() => this.state.thread);
  public readonly isLoading = computed(() => this.state.isLoading);

  private obs: MutationObserver | null = null;

  public async activateThread(uuid: string) {
    if (this.state.isLoading) {
      return;
    }

    logger.debug("activating thread", uuid);

    this.state.isLoading = true;
    this.state.threadUuid = uuid;
    try {
      const thread = await Kommentointi.getKommenttiByKetjuUuid(uuid);
      this.state.thread = thread.data;
      logger.debug("thread found", this.thread);
      return true;
    }
    catch (err) {
      logger.debug("could not activate thread", uuid);
      this.state.thread = {
        tunniste: uuid,
        kommentit: [],
      };
    }
    finally {
      this.state.isLoading = false;
    }
  }

  public async tallenna(kommentti) {
    if (kommentti.tunniste) {
      logger.debug("updating comment", kommentti.tunniste);
      // await Kommentointi.updateKommentti(kommentti);
    }
    else {
      logger.debug("adding comment to", kommentti.parent);
      console.log(_.cloneDeep(this.thread));
      // const uusiViesti = (await Kommentointi.addKommenttiKetju(kommentti)).data;
      console.log(_.cloneDeep(this.thread));
    }
  }

  public async poista(tunniste: string) {
    logger.debug("removing comment", tunniste);
    // await Kommentointi.poistaKommenttiKetju(tunniste);
    // this.thread = nestedRemove(this.thread, { tunniste }, 'kommentit');
  }

  detach() {
    if (this.obs) {
      this.obs.disconnect();
      this.state.thread = null;
      this.obs = null;
    }
  }

  attach(el: Element) {
    const store = this;
    if (this.obs) {
      this.detach();
    }

    const mountCommentThreads = async (targets: Element[]) => {
      for (const thread of targets) {
        if (thread) {
          const uuid = thread.getAttribute('kommentti');
          if (uuid) {
            thread.addEventListener('click', () => {
              this.activateThread(uuid);
            });
          }
        }
      }
    }

    this.obs = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mountCommentThreads((mutation.target as any).querySelectorAll('[kommentti]'));
      }
    });

    mountCommentThreads((document as any).querySelectorAll('[kommentti]'));

    this.obs.observe(el, {
      attributeFilter: ['kommentti'],
      attributeOldValue: false,
      attributes: true,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    });
  }
}

export const Kommentit = new KommenttiStore();
