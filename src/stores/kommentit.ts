import _ from 'lodash';
import { Kommentointi } from '@shared/api/ylops';
import Vue from 'vue';

import { reactive, computed, ref, watch } from 'vue';
import VueScrollTo from 'vue-scrollto';
import { Kielet } from '@shared/stores/kieli';

import { unwrap } from '@shared/utils/wraps';
import { syncProseMirrorEditor } from '@/utils/utils';

import { createLogger } from '@shared/utils/logger';
const logger = createLogger('Kayttaja');

export const UusiKommenttiHandle = 'uusi-kommentti';

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

const CommentStyles = document.createElement('style');
document.head.appendChild(CommentStyles);
let ActiveCommentStyleIdx = -1;

class KommenttiStore {
  private state = reactive({
    threadUuid: null as string | null,
    thread: null as any | null,
    isActive: false,
    isLoading: false,
    selection: false,
    bounds: null as any | null,
    visibleChains: [] as string[], // List of visible UUIDs
    activeThreads: [] as any[], // Comments of visible chains
  });

  public readonly threadUuid = computed(() => this.state.threadUuid);
  public readonly thread = computed(() => _.sortBy(this.state.thread, 'luotu'));
  public readonly isLoading = computed(() => this.state.isLoading);
  public readonly hasSelection = computed(() => this.state.selection);
  public readonly bounds = computed(() => this.state.bounds);
  public readonly visibleThreads = computed(() => this.state.visibleChains || []);
  public readonly activeThreads = computed(() => this.state.activeThreads || []);

  public readonly surrounding = computed(() => {
    if (this.state.threadUuid) {
      const idx = _.findIndex(this.state.visibleChains, c => c === this.state.threadUuid);
      if (idx >= 0) {
        const previousIdx = idx === 0 ? _.size(this.state.visibleChains) - 1 : idx - 1;
        const nextIdx = (idx + 1) % _.size(this.state.visibleChains);
        return {
          previous: this.state.visibleChains[previousIdx],
          next: this.state.visibleChains[nextIdx],
        };
      }
    }
    return {
      previous: null,
      next: null,
    };
  });

  constructor() {
    const onChange = (ev) => {
      const selection = document.getSelection();
      this.state.selection = !selection || !selection?.isCollapsed;
      if (selection && this.state.selection) {
        const range = selection.getRangeAt(selection.rangeCount - 1);
        this.state.bounds = range.getBoundingClientRect();
      }
      else {
        this.state.bounds = null;
      }
    };

    document.onselectionchange = (ev) => {
      onChange(ev);
    };
  }

  public setActive(value: boolean) {
    this.state.isActive = value;
    if (value) {
      this.state.activeThreads = [];
      this.updateVisibleThreads();
    }
    else {
      this.state.activeThreads = [];
    }
  }

  private clearCommentStyle() {
    if (ActiveCommentStyleIdx >= 0) {
      const sheet = CommentStyles.sheet as CSSStyleSheet;
      if (sheet) {
        try {
          sheet.deleteRule(ActiveCommentStyleIdx);
        }
        catch (err) {
          // Ignore errors when deleting CSS rules
        }
      }
    }
  }

  private watchVisibleThreads = watch(this.visibleThreads, async () => {
    if (!_.isEmpty(this.visibleThreads.value)) {
      const res = await Promise.all(_(this.visibleThreads.value)
        .reject(uuid => uuid === UusiKommenttiHandle)
        .map(uuid => Kommentointi.getKommenttiByKetjuUuid(uuid))
        .value());
      this.state.activeThreads = _.map(res, 'data');
    }
  });

  private onLangChange = watch([Kielet.sisaltoKieli], () => {
    this.state.threadUuid = null;
    this.state.thread = null;
    this.clearCommentStyle();
  });

  private watcher = watch(this.threadUuid, async () => {
    if (this.threadUuid.value && this.threadUuid.value !== UusiKommenttiHandle) {
      const thread = await Kommentointi.getKommenttiByKetjuUuid(this.threadUuid.value);
      this.state.thread = thread.data;
    }
  });

  public async clearThread() {
    this.clearCommentStyle();
    this.state.threadUuid = null;
    this.state.thread = null;
    if (document.querySelector('#keskustelu-sisalto')) {
      VueScrollTo.scrollTo('#keskustelu-sisalto', 300);
    }
  }

  private obs: MutationObserver | null = null;
  private clickHandler: ((event: Event) => void) | null = null;

  public async activateThread(uuid: string) {
    if (uuid === UusiKommenttiHandle) {
      return;
    }

    if (this.state.isLoading) {
      logger.info('Still loading', uuid);
      return;
    }

    if (this.state.threadUuid === uuid && this.state.thread) {
      return;
    }

    logger.info('activating thread', uuid);

    this.state.thread = null;

    this.clearCommentStyle();
    ActiveCommentStyleIdx = (CommentStyles.sheet as CSSStyleSheet).insertRule(`span[kommentti="${uuid}"] {
      background-color: #ffd900 !important;
    }`);

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
    const commentEl = document.querySelector(`span[kommentti="${tunniste}"]`) as HTMLElement | null;
    const editorEl = commentEl?.closest('.ProseMirror') as HTMLElement | null;
    unwrap(commentEl);
    syncProseMirrorEditor(editorEl);
    this.clearCommentStyle();
    this.updateVisibleThreads();
  }

  detach() {
    if (this.clickHandler) {
      document.removeEventListener('click', this.clickHandler);
      this.clickHandler = null;
    }
    if (this.obs) {
      this.obs.disconnect();
      this.obs = null;
    }
    this.state.thread = null;
  }

  public readonly updateVisibleThreads = _.debounce(() => {
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
      };
    }
    else {
      return null;
    }
  }

  scrollTo(uuid: string) {
    VueScrollTo.scrollTo(`span[kommentti="${uuid}"]`, 300);
  }

  attach(el: Element) {
    if (this.obs || this.clickHandler) {
      this.detach();
    }

    this.clickHandler = (event: Event) => {
      if ((event.target as Element | null)?.closest('.ProseMirror')) {
        return;
      }

      const thread = (event.target as Element | null)?.closest('[kommentti]');
      if (!thread) {
        return;
      }

      const uuid = thread.getAttribute('kommentti');
      if (uuid) {
        void this.activateThread(uuid);
      }
    };

    document.addEventListener('click', this.clickHandler);

    this.obs = new MutationObserver(() => {
      this.updateVisibleThreads();
    });

    this.obs.observe(document.body, {
      attributeFilter: ['kommentti'],
      attributeOldValue: false,
      attributes: true,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    });

    this.updateVisibleThreads();
  }
}

export const Kommentit = new KommenttiStore();
