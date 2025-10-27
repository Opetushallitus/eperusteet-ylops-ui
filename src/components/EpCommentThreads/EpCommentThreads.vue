<template>
  <div
    ref="threadbox"
    class="threadbox"
  >
    <div v-if="threadUuid && thread">
      <div
        v-if="newThread"
        ref="newComment"
        class="newComment p-3 m-1"
        :style="activeThreadStyle"
      >
        <div class="otsikko">
          {{ $t('uusi-kommentti') }}
        </div>
        <div class="viesti">
          <textarea
            v-model="newThread.sisalto"
            :placeholder="$t('kirjoita-viesti')"
            class="editori"
          />
        </div>
        <div class="d-flex justify-content-end mt-2">
          <b-button
            variant="link"
            @click="cancelNewThread"
          >
            {{ $t('peruuta') }}
          </b-button>
          <b-button
            variant="primary"
            :disabled="!newThread.sisalto"
            class="ml-1"
            @click="saveNewThread"
          >
            {{ $t('kommentoi') }}
          </b-button>
        </div>
      </div>
      <div
        v-else
        class="p-2 thread"
        :style="activeThreadStyle"
      >
        <div class="thread-comment">
          <thread-comment
            v-for="comment in thread"
            :key="comment.tunniste || 0"
            :cancel="poista"
            :remove="poista"
            :save="tallenna"
            :value="comment"
          />
        </div>
        <div v-if="threadUuid">
          <div class="replybox p-3">
            <textarea
              v-model="reply"
              :placeholder="$t('vastaa')"
              class="editori"
              :disabled="isWorking"
            />
            <div
              v-if="reply"
              class="d-flex justify-content-end"
            >
              <b-button
                variant="primary"
                class="ml-1"
                :disabled="isWorking"
                @click="tallenna({ sisalto: reply })"
              >
                {{ $t('vastaa') }}
              </b-button>
            </div>
          </div>
          <div class="prevnext">
            <div class="d-flex justify-content-between">
              <b-button
                variant="link"
                @click="activateThread(surr.previous)"
              >
                <EpMaterialIcon>arrow_back</EpMaterialIcon>
                {{ $t('edellinen') }}
              </b-button>
              <b-button
                variant="link"
                @click="activateThread(surr.next)"
              >
                {{ $t('seuraava') }}
                <EpMaterialIcon>arrow_forward</EpMaterialIcon>
              </b-button>
            </div>
            <div class="backbutton text-center">
              <b-button
                variant="primary"
                @click="suljeKetju"
              >
                {{ $t('nayta-kaikki-kommentit') }}
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="activeThreads.length > 0">
      <div class="thread-comment">
        <div
          v-for="(root, idx) in activeThreads"
          :key="'thread' + idx"
        >
          <collapsed-threads :value="root" />
        </div>
      </div>
    </div>
    <div
      v-else
      class="p-3"
    >
      <ep-alert :text="$t('ei-lisattyja-kommentteja')" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, h, getCurrentInstance } from 'vue';
import { createApp } from 'vue';
import { useRoute } from 'vue-router';
import { useTemplateRef } from 'vue';
import * as _ from 'lodash';
import { UusiKommenttiHandle, Kommentit } from '@/stores/kommentit';
import { KommenttiDto, KayttajanTietoDto } from '@shared/api/ylops';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import ThreadComment from './ThreadComment.vue';
import CollapsedThreads from './CollapsedThreads.vue';
import EpCommentAdd from './EpCommentAdd.vue';
import EpMaterialIcon from '@shared/components/EpMaterialIcon/EpMaterialIcon.vue';
import { Kielet } from '@shared/stores/kieli';
import { delay } from '@shared/utils/delay';
import { unwrap, findIndexWithTagsIncluded } from '@/utils/utils';
import { $fail, $success, $t } from '@shared/utils/globals';

// Get current app instance to copy config to dynamically created apps
const instance = getCurrentInstance();

// Template refs
const threadbox = useTemplateRef('threadbox');
const newComment = useTemplateRef('newComment');

// Router
const route = useRoute();

// Reactive data
const isWorking = ref(false);
const thread = ref<KommenttiDto[] | null>(null);
const newThread = ref<KommenttiDto | null>(null);
const newKahva = ref<any>(null);
const reply = ref<any>(null);
const commentAddApp = ref<any>(null);

// Computed properties
const threadUuid = computed(() => {
  if (newThread.value) {
    return UusiKommenttiHandle;
  }
  else {
    return Kommentit.threadUuid.value;
  }
});

const activeThreads = computed(() => {
  return Kommentit.activeThreads.value || [];
});

const originalThread = computed(() => {
  return Kommentit.thread.value;
});

const hasSelection = computed(() => {
  return !!Kommentit.hasSelection.value;
});

const centerpos = () => {
  const rect = document.querySelector(`span[kommentti="${threadUuid.value}"]`)?.getBoundingClientRect();
  const parentBox = threadbox.value?.getBoundingClientRect();
  if (rect && parentBox) {
    return Math.max(0, rect.top - parentBox.top) + 'px';
  }
  return '0';
};

const activeThreadStyle = computed(() => {
  if (threadUuid.value) {
    return {
      position: 'relative' as const,
      top: centerpos(),
    };
  }
  return {};
});

const surr = computed(() => {
  return Kommentit.surrounding.value;
});

const enterClass = computed(() => {
  if (!_.first(thread.value)?.thread) {
    return '';
  }
  return 'animated slideInRight';
});

// Methods
const addNewComment = async () => {
  await lisaaKommenttiKahva();
  newThread.value = {
    sisalto: '',
  };
};

const clear = async (clearThread = false) => {
  isWorking.value = false;
  thread.value = null;
  newThread.value = null;
  newKahva.value = null;
  reply.value = null;
  if (clearThread) {
    await Kommentit.clearThread();
  }
};

const saveNewThread = async () => {
  isWorking.value = true;
  try {
    const kahva = await Kommentit.lisaaKahva({
      ...newKahva.value,
      aloituskommentti: newThread.value,
    });
    const doc = document.querySelector(`span[kommentti="${UusiKommenttiHandle}"]`);
    if (doc) {
      doc.setAttribute('kommentti', kahva.thread!);
    }
    newThread.value = null;
    newKahva.value = null;
    await delay(50);
    await Kommentit.activateThread(kahva.thread!);
  }
  finally {
    isWorking.value = false;
  }
};

const activateThread = async (uuid: string) => {
  if (uuid) {
    await Kommentit.activateThread(uuid);
  }
};

const cancelNewThread = async () => {
  unwrap(document.querySelector(`span[kommentti="${UusiKommenttiHandle}"]`));
  newThread.value = null;
  newKahva.value = null;
};

const suljeKetju = async () => {
  await Kommentit.clearThread();
};

const removeAddBox = () => {
  if (commentAddApp.value) {
    commentAddApp.value.unmount();
    commentAddApp.value = null;
  }
  const el = document.querySelector('#comment-add-box');
  if (el) {
    el.remove();
  }
};

const findContentNode = (origin: Node | null) => {
  let el = origin;
  while (el !== null && el !== el.parentNode) {
    // Vue 3: Check component type via __vnode instead of $options
    const componentName = (el as any)?.__vnode?.type?.name || (el as any)?.__vnode?.type?.__name;

    // Also check for editor-content class as a fallback
    if (componentName === 'EditorContent' || (el as HTMLElement)?.classList?.contains('ProseMirror')) {
      return el;
    }
    el = el.parentNode;
  }
  return null;
};

const onSelectionImpl = async (val: any, old: any) => {
  removeAddBox();
  if (val && !old) {
    // Clear any active thread when making a new selection
    if (Kommentit.threadUuid.value) {
      await Kommentit.clearThread();
    }
    const selection = document.getSelection();
    if (selection && !Kommentit.threadUuid.value && findContentNode(selection.anchorNode)) {
      const commentbox = document.createElement('div');
      commentbox.id = 'comment-add-box';
      const range = selection.getRangeAt(selection.rangeCount - 1);
      const bound = range.getBoundingClientRect();
      const el = document.querySelector('body');
      if (el) {
        el.appendChild(commentbox);
      }

      // Create new app and copy global properties from parent app
      const app = createApp({
        render: () => {
          return h(EpCommentAdd, {
            onAdd: async () => {
              removeAddBox();
              await Kommentit.clearThread();
              await delay(100);
              await addNewComment();
            },
          });
        },
      });

      // Copy global properties from parent app
      if (instance?.appContext) {
        const parentApp = instance.appContext;

        // Copy global properties
        if (parentApp.config?.globalProperties) {
          Object.assign(app.config.globalProperties, parentApp.config.globalProperties);
        }
      }

      commentAddApp.value = app;
      app.mount(commentbox);
    }
  }
};

/**
 * Copies the selection range and slides it over the containing parent container and
 * user selection to get the global range relative to parent container.
 *
 * @returns Start and stop index of the user selection relational to the given parent node
 */
const distanceFromParentBegin = (selection: Selection, parent: Node) => {
  const range = selection.getRangeAt(0);
  const clone = range.cloneRange();
  clone.selectNodeContents(parent);
  clone.setEnd(range.startContainer, range.startOffset);
  const start = _.size(clone.toString());
  clone.setEnd(range.endContainer, range.endOffset);
  const stop = _.size(clone.toString());
  return { start, stop };
};

/**
 * - Find the parent editing container (if any) and extracts the actual element and the textId of that element.
 * - Get the start and end of the range relative to the editing container
 * - Adjust the range to contain tags between the range and the container start
 * - Start the actual commenting process with the initial location data
 *
 * NOTE: It is impossible to distinguish between recent or old comment tags from the actual content.
 *       Backend adjusts the comment location accordingly.
 *
 * @returns {undefined}
 */
const lisaaKommenttiKahva = async () => {
  const selection = document.getSelection();
  const node = selection?.anchorNode;
  if (!node || !selection) {
    $fail('virheellinen-valinta');
    return;
  }

  // First find the ProseMirror editor element
  let editorEl = node.parentNode;
  while (editorEl !== null && editorEl !== editorEl.parentNode) {
    if ((editorEl as HTMLElement)?.classList?.contains('ProseMirror')) {
      break;
    }
    editorEl = editorEl.parentNode;
  }

  if (!editorEl || !(editorEl as HTMLElement)?.classList?.contains('ProseMirror')) {
    $fail('virheellinen-valinta');
    return;
  }

  // Get tekstiId from data attribute (more reliable than Vue internals, works in production)
  const tekstiId = Number((editorEl as HTMLElement).getAttribute('data-teksti-id'));

  if (!tekstiId) {
    $fail('virheellinen-valinta');
    return;
  }

  // Get the HTML content from the editor element
  const teksti = (editorEl as HTMLElement).innerHTML;

  if (tekstiId && teksti) {
    const { start, stop } = distanceFromParentBegin(selection, editorEl);

    newKahva.value = {
      opsId: Number(route.params.id),
      tekstiId: tekstiId,
      kieli: Kielet.getSisaltoKieli.value,
      start: findIndexWithTagsIncluded(teksti, start),
      stop: findIndexWithTagsIncluded(teksti, stop),
    };

    const kspan = document.createElement('span');
    kspan.setAttribute('kommentti', UusiKommenttiHandle);
    kspan.className = 'animated jackInTheBox slower';
    selection?.getRangeAt(0)?.surroundContents(kspan);
    setTimeout(() => {
      kspan.className = '';
    }, 1000);
  }
};

const withOpsId = (kommentti: KommenttiDto): KommenttiDto => {
  return {
    ...kommentti,
    thread: threadUuid.value!,
    opsId: _.parseInt(route.params.id as string),
  };
};

const poista = async (kommentti: KommenttiDto): Promise<any> => {
  await Kommentit.poista(kommentti.tunniste!);
  $success('kommentti-poistettu');
  return kommentti;
};

const tallenna = async (kommentti: any): Promise<any> => {
  isWorking.value = true;
  try {
    const isNew = !kommentti.tunniste;
    const result = await Kommentit.tallenna(withOpsId(kommentti));
    reply.value = null;
    if (isNew) {
      $success('kommentti-tallennettu');
    }
    else {
      $success('kommentti-paivitetty');
    }
    return result;
  }
  catch (err) {
    console.error(err);
    return kommentti;
  }
  finally {
    isWorking.value = false;
  }
};

// Watchers
watch(() => route.fullPath, async (val, old) => {
  await clear(true);
});

watch(threadUuid, async (val, old) => {
  if (val && val !== old) {
    const doc = document.querySelector(`span[kommentti="${threadUuid.value}"]`);
    // Note: $scrollTo is not available in Vue 3, needs to be replaced with appropriate scrolling solution
    if (doc) {
      doc.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
});

watch(hasSelection, async (val, old) => {
  await onSelectionImpl(val, old);
});

watch(originalThread, (value: KommenttiDto[]) => {
  thread.value = _.cloneDeep(value);
}, { immediate: true });
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.threadbox {
  min-height: 100vh;
}

.thread {
  z-index: 1000;

  .thread-comment {
    box-shadow: 0 2px 4px 0 rgba(207, 207, 207, 0.5);
  }

  .replybox {
    background: #fff;
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    border: 1px solid #eee;
    border-top: 0;
    box-shadow: 1px 1px 4px #ccc;
  }
}

.newComment {
  background: #fff;
  border-radius: 10px;
  border: 1px solid #eee;
  box-shadow: 1px 1px 4px #ccc;
}

textarea.editori {
  border-radius: 6px;
  border: 1px solid #ccc;
  min-height: 4em;
  overflow: auto;
  padding: 5px;
  resize: vertical;
  width: 100%;
}

</style>
