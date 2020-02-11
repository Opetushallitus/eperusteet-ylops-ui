import _ from 'lodash';
import { KommenttiDto, KayttajanTietoDto } from '@/tyypit';
import Vue from 'vue';
import { Kayttajat as KayttajatApi, Kommentointi } from '@/api';
import VueCompositionApi, { reactive, computed, ref, watch } from '@vue/composition-api';
import { Kielet } from '@shared/stores/kieli';
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
    bounds: null as any | null,
    visibleChains: [] as string[],
  });

  public readonly threadUuid = computed(() => this.state.threadUuid);
  public readonly thread = computed(() => _.sortBy(this.state.thread, 'luotu'));
  public readonly isLoading = computed(() => this.state.isLoading);
  public readonly hasSelection = computed(() => this.state.selection);
  public readonly bounds = computed(() => this.state.bounds);

  public readonly surrounding = computed(() => {
    if (this.state.threadUuid) {
      const idx = _.findIndex(this.state.visibleChains, c => c === this.state.threadUuid);
      if (idx >= 0) {
        return {
          previous: this.state.visibleChains[idx === 0
            ? _.size(this.state.visibleChains) - 1
            : idx - 1],
          next: this.state.visibleChains[(idx + 1) % _.size(this.state.visibleChains)],
        };
      }
    }
    return {
      previous: null,
      next: null,
    };
  });

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
    }
  });

  public async clearThread() {
    this.state.threadUuid = null;
    this.state.thread = null;
  }

  private obs: MutationObserver | null = null;

  public async activateThread(uuid: string) {
    this.state.thread = null;
    if (this.state.isLoading) {
      logger.info('Still loading', uuid);
      return;
    }

    if (uuid === 'uusi-kommentti') {
      this.state.threadUuid = 'uusi-kommentti';
      return;
    }

    logger.info('activating thread', uuid);

    this.state.isLoading = true;
    this.state.threadUuid = uuid;
    try {
      const thread = await Kommentointi.getKommenttiByKetjuUuid(uuid);
      this.state.thread = thread.data;
      logger.info('thread found', this.thread.value);
      return true;
    }
    catch (err) {
      logger.info('could not activate thread', uuid);
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
      logger.info('updating comment', kommentti.tunniste);
      const result = (await Kommentointi.updateKommentti2019(kommentti.thread, kommentti)).data;
      this.state.thread = [result, ..._.reject(this.state.thread, c => c.tunniste === kommentti.tunniste)];
      return result;
    }
    else {
      logger.info('adding comment to', kommentti.parent);
      const result = (await Kommentointi.addKommentti2019(kommentti.thread, kommentti)).data;
      this.state.thread = [result, ..._.filter(this.state.thread, c => c.tunniste)];
      return result;
    }
  }

  public async poista(tunniste: string) {
    logger.info('removing comment', tunniste);
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

  private updateVisibleThreads = _.debounce(() => {
    const chains = [] as string[];
    document.querySelectorAll('[kommentti]').forEach(k => {
      const uuid = k.getAttribute('kommentti');
      if (uuid) {
        chains.push(uuid);
      }
    });
    logger.info('Updating visible threads', chains);
    this.state.visibleChains = chains;
  }, 300);

  public findTekstikappaleNode(node: Node) {
    function isEditorContent(n: Node) {
      if ((el as any)?.__vue__?.$options?._componentTag === 'editor-content') {
        const value = (el as any)?.__vue__?.$parent?.value;
        const tekstiId = Number(value?._id);
        if (tekstiId) {
          return true;
        }
      }
      else {
        return false;
      }
    }

    let el = node.parentNode;
    while (el !== null && el !== el.parentNode && !isEditorContent(el)) {
      el = el.parentNode;
    }

    if (el) {
      return {
        el,
        tekstiId: Number((el as any)?.__vue__?.$parent?.value?._id),
      }
    }
    else {
      return null;
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
          thread.addEventListener('click', () => {
            const uuid = thread.getAttribute('kommentti');
            if (uuid) {
              this.activateThread(uuid);
            }
          });
        }
      }
    };

    this.obs = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mountCommentThreads((mutation.target as any).querySelectorAll('[kommentti]'));
      }
      this.updateVisibleThreads();
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
