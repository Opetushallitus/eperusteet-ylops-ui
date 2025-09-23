<template>
  <div class="threadbox" ref="threadbox">
    <div v-if="threadUuid && thread">
      <div
        v-if="newThread"
        class="newComment p-3 m-1"
        ref="newComment"
        :style="activeThreadStyle">
        <div class="otsikko">
          {{ $t('uusi-kommentti') }}
        </div>
        <div class="viesti">
          <textarea
            :placeholder="$t('kirjoita-viesti')"
            class="editori"
            v-model="newThread.sisalto"></textarea>
        </div>
        <div class="d-flex justify-content-end mt-2">
          <b-button
            variant="link"
            @click="cancelNewThread">
            {{ $t('peruuta') }}
          </b-button>
          <b-button
            variant="primary"
            @click="saveNewThread"
            :disabled="!newThread.sisalto"
            class="ml-1">
            {{ $t('kommentoi') }}
          </b-button>
        </div>
      </div>
      <div class="p-2 thread" :style="activeThreadStyle" v-else>
        <div class="thread-comment">
          <thread-comment
            v-for="comment in thread"
            :key="comment.tunniste || 0"
            :cancel="poista"
            :remove="poista"
            :save="tallenna"
            :value="comment" />
        </div>
        <div v-if="threadUuid">
          <div class="replybox p-3">
            <textarea
              :placeholder="$t('vastaa')"
              class="editori"
              v-model="reply"
              :disabled="isWorking"></textarea>
            <div v-if="reply" class="d-flex justify-content-end">
              <b-button
                variant="primary"
                @click="tallenna({ sisalto: reply })"
                class="ml-1"
                :disabled="isWorking">
                {{ $t('vastaa') }}
              </b-button>
            </div>
          </div>
          <div class="prevnext">
            <div class="d-flex justify-content-between">
              <b-button variant="link" @click="activateThread(surr.previous)">
                <EpMaterialIcon>arrow_back</EpMaterialIcon>
                {{ $t('edellinen') }}
              </b-button>
              <b-button variant="link" @click="activateThread(surr.next)">
                {{ $t('seuraava') }}
                <EpMaterialIcon>arrow_forward</EpMaterialIcon>
              </b-button>
            </div>
            <div class="backbutton text-center">
              <b-button variant="primary" @click="suljeKetju">
                {{ $t('nayta-kaikki-kommentit') }}
              </b-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="activeThreads.length > 0">
      <div class="thread-comment">
        <div v-for="(root, idx) in activeThreads" :key="'thread' + idx">
          <collapsed-threads :value="root" />
        </div>
      </div>
    </div>
    <div v-else class="p-3">
      <ep-alert :text="$t('ei-lisattyja-kommentteja')"></ep-alert>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, h } from 'vue';
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
import { fail, success } from '@/utils/notifications';
import { delay } from '@shared/utils/delay';
import { unwrap, findIndexWithTagsIncluded } from '@/utils/utils';
import { $t } from '@shared/utils/globals';

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
  const el = document.querySelector('#comment-add-box');
  if (el) {
    el.remove();
  }
};

const findContentNode = (origin: Node | null) => {
  let el = origin;
  while (el !== null && el !== el.parentNode) {
    if ((el as any)?.__vue__?.$options?._componentTag === 'editor-content') {
      return el;
    }
    el = el.parentNode;
  }
  return null;
};

// VUE 3 : FIX LATER
const onSelectionImpl = (val: any, old: any) => {
  removeAddBox();
  if (val && !old) {
    const selection = document.getSelection();
    if (selection && !Kommentit.threadUuid.value && findContentNode(selection.anchorNode)) {
      const commentbox = document.createElement('div');
      const range = selection.getRangeAt(selection.rangeCount - 1);
      const bound = range.getBoundingClientRect();
      const el = document.querySelector('body');
      if (el) {
        el.appendChild(commentbox);
      }
      createApp({
        render: () => {
          return h(EpCommentAdd, {
            props: {
              onAdd: async () => {
                removeAddBox();
                await Kommentit.clearThread();
                await delay(100);
                await addNewComment();
              },
            },
          });
        },
      }).mount(commentbox);
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
    fail('virheellinen-valinta');
    return;
  }

  // const el = Kommentit.findTekstikappaleNode(selection, node);
  let el = node.parentNode;
  while (el !== null && el !== el.parentNode) {
    if ((el as any)?.__vue__?.$options?._componentTag === 'editor-content') {
      const value = (el as any)?.__vue__?.$parent?.value;
      const tekstiId = Number(value?._id);
      if (tekstiId) {
        const teksti = value[Kielet.getSisaltoKieli.value];
        const { start, stop } = distanceFromParentBegin(selection, el);

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
        selection.getRangeAt(0).surroundContents(kspan);
        setTimeout(() => {
          kspan.className = '';
        }, 1000);
      }
      break;
    }
    else {
      el = el.parentNode;
    }
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
  success('kommentti-poistettu');
  return kommentti;
};

const tallenna = async (kommentti: any): Promise<any> => {
  isWorking.value = true;
  try {
    const isNew = !kommentti.tunniste;
    const result = await Kommentit.tallenna(withOpsId(kommentti));
    reply.value = null;
    if (isNew) {
      success('kommentti-tallennettu');
    }
    else {
      success('kommentti-paivitetty');
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

watch(hasSelection, (val, old) => {
  onSelectionImpl(val, old);
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
