import _ from 'lodash';
import { KommenttiDto, KayttajanTietoDto } from '@/tyypit';
import Vue from 'vue';
import { Kayttajat as KayttajatApi, Kommentointi } from '@/api';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
Vue.use(VueCompositionApi);

import { createLogger } from './logger';
import { delay } from '@shared/utils/delay';
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
    threadUuid: null as string | null,
    thread: null as any | null,
    isLoading: false,
    selection: false,
    bounds: null as any | null
  });

  public readonly threadUuid = computed(() => this.state.threadUuid);
  public readonly thread = computed(() => _.reverse(_.sortBy(this.state.thread, 'luotu')));
  public readonly isLoading = computed(() => this.state.isLoading);
  public readonly hasSelection = computed(() => this.state.selection);
  public readonly bounds = computed(() => this.state.bounds);

  constructor() {
    document.onselectionchange = _.debounce((ev) => {
      const selection = document.getSelection();
      this.state.selection = !selection || !selection?.isCollapsed;
      if (selection && this.state.selection) {
        const range = selection.getRangeAt(selection.rangeCount - 1);
        this.state.bounds = range.getBoundingClientRect();
      }
      else {
        this.state.bounds = null;
      }
    }, 50);
  }

  private watcher = watch(async () => {
    if (this.threadUuid.value) {
      const thread = await Kommentointi.getKommenttiByKetjuUuid(this.threadUuid.value);
      this.state.thread = thread.data;
      // const selected = document.querySelector(`span[kommentti="${this.threadUuid.value}"]`);
      // if (selected) {
      //   (selected as any).style.background = '#ffd900';
      //   (selected as any).style.color = '#000';
      // }
    }

    // const selected = document.querySelector(`span[kommentti="${this.threadUuid.value}"]`);
    // if (selected) {
    //   (selected as any).style.background = '#ffd900';
    //   (selected as any).style.color = '#000';
    // }

  });

  public async clearThread() {
    this.state.threadUuid = null;
    this.state.thread = null;
  }

  private obs: MutationObserver | null = null;

  public async activateThread(uuid: string) {
    this.state.thread = null;
    if (this.state.isLoading) {
      return;
    }

    logger.debug("activating thread", uuid);

    this.state.isLoading = true;
    this.state.threadUuid = uuid;
    try {
      const thread = await Kommentointi.getKommenttiByKetjuUuid(uuid);
      this.state.thread = thread.data;
      logger.debug("thread found", this.thread.value);
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

  public async lisaaKahva(kommentti: any) {
    const ketju = await Kommentointi.addKetju(kommentti);
    this.state.threadUuid = ketju.data.thread as string;
    return ketju.data;
  }

  public async tallenna(kommentti) {
    if (kommentti.tunniste) {
      logger.debug("updating comment", kommentti.tunniste);
      const result = (await Kommentointi.updateKommentti2019(kommentti.thread, kommentti)).data;
      this.state.thread = [result, ..._.reject(this.state.thread, c => c.tunniste === kommentti.tunniste)];
      return result;
    }
    else {
      logger.debug("adding comment to", kommentti.parent);
      const result = (await Kommentointi.addKommentti2019(kommentti.thread, kommentti)).data;
      this.state.thread = [result, ..._.filter(this.state.thread, c => c.tunniste)];
      return result;
    }
  }

  public async poista(tunniste: string) {
    logger.debug("removing comment", tunniste);
    await Kommentointi.poistaKommenttiKetju2019(tunniste);
    this.state.thread = _.reject(this.state.thread, c => c.tunniste === tunniste);
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
