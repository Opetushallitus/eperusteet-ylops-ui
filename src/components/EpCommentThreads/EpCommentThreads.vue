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
                <fas icon="arrow-left" />
                {{ $t('edellinen') }}
              </b-button>
              <b-button variant="link" @click="activateThread(surr.next)">
                {{ $t('seuraava') }}
                <fas icon="arrow-right" />
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
        <div v-for="root in activeThreads">
          <collapsed-threads :value="root" />
        </div>
      </div>
    </div>
    <div v-else class="p-3">
      <ep-alert :text="$t('ei-lisattyja-kommentteja')"></ep-alert>
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue } from 'vue-property-decorator';
import { Kommentit } from '@/stores/kommentit';
import { KommenttiDto, KayttajanTietoDto } from '@shared/api/ylops';
import EpAlert from '@shared/components/EpAlert/EpAlert.vue';
import { Kielet } from '@shared/stores/kieli';
import { fail, success } from '@/utils/notifications';
import { delay } from '@shared/utils/delay';
import { unwrap, findIndexWithTagsIncluded } from '@/utils/utils';
import * as _ from 'lodash';
import ThreadComment from './ThreadComment.vue';
import CollapsedThreads from './CollapsedThreads.vue';
import EpCommentAdd from './EpCommentAdd.vue';


@Component({
  components: {
    EpAlert,
    ThreadComment,
    CollapsedThreads,
  },
})
export default class EpCommentThreads extends Vue {
  private isWorking = false;
  private thread: KommenttiDto[] | null = null;
  private newThread: KommenttiDto | null = null;
  private newKahva = null as any;
  private reply = null as any;

  get threadUuid() {
    if (this.newThread) {
      return 'uusi-kommentti';
    }
    else {
      return Kommentit.threadUuid.value;
    }
  }

  get activeThreads() {
    return Kommentit.activeThreads.value || [];
  }

  get originalThread() {
    return Kommentit.thread.value;
  }

  get hasSelection() {
    return !!Kommentit.hasSelection.value;
  }

  centerpos() {
    const rect = document.querySelector(`span[kommentti="${this.threadUuid}"]`)?.getBoundingClientRect();
    const parentBox = (this.$refs.threadbox as any)?.getBoundingClientRect();
    if (rect) {
      return Math.max(0, rect.top - parentBox.top) + 'px';
    }
    return '0';
  }

  get activeThreadStyle() {
    if (this.threadUuid) {
      return {
        position: 'relative',
        top: this.centerpos(),
      };
    }
    return {};
  }

  async addNewComment() {
    await this.lisaaKommenttiKahva();
    this.newThread = {
      sisalto: '',
    };
  }

  get surr() {
    return Kommentit.surrounding.value;
  }

  @Watch('$route.fullPath')
  async pathChange(val, old) {
    await this.clear(true);
  }

  async clear(clearThread = false) {
    this.isWorking = false;
    this.thread = null;
    this.newThread = null;
    this.newKahva = null;
    this.reply = null;
    if (clearThread) {
      await Kommentit.clearThread();
    }
  }

  @Watch('threadUuid')
  async threadChange(val, old) {
    if (val && val !== old) {
      const doc = document.querySelector(`span[kommentti="${this.threadUuid}"]`);
      (this as any).$scrollTo(doc, 300, {
        offset: -200,
      }, 1000);
    }
  }

  @Watch('hasSelection')
  onSelection(val, old) {
    this.onSelectionImpl(val, old);
  }

  @Watch('originalThread', { immediate: true })
  updateThread(value: KommenttiDto[]) {
    this.thread = _.cloneDeep(value);
  }

  async saveNewThread() {
    this.isWorking = true;
    try {
      const kahva = await Kommentit.lisaaKahva({
        ...this.newKahva,
        aloituskommentti: this.newThread,
      });
      const doc = document.querySelector('span[kommentti="uusi-kommentti"]');
      doc?.setAttribute('kommentti', kahva.thread!);
      this.newThread = null;
      this.newKahva = null;
      await delay(50);
      await Kommentit.activateThread(kahva.thread!);
    }
    finally {
      this.isWorking = false;
    }
  }

  async activateThread(uuid: string) {
    if (uuid) {
      await Kommentit.activateThread(uuid);
    }
  }

  async cancelNewThread() {
    unwrap(document.querySelector('span[kommentti="uusi-kommentti"]'));
    this.newThread = null;
    this.newKahva = null;
  }

  get enterClass() {
    if (!_.first(this.thread)?.thread) {
      return '';
    }
    return 'animated slideInRight';
  }

  async suljeKetju() {
    await Kommentit.clearThread();
  }

  private removeAddBox() {
    const el = document.querySelector('#comment-add-box');
    if (el) {
      el.remove();
    }
  }

  private findContentNode(origin: Node | null) {
    let el = origin;
    while (el !== null && el !== el.parentNode) {
      if ((el as any)?.__vue__?.$options?._componentTag === 'editor-content') {
        return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  private onSelectionImpl = (val, old) => {
    this.removeAddBox();
    if (val && !old) {
      const selection = document.getSelection();
      if (selection && this.findContentNode(selection.anchorNode)) {
        const commentbox = document.createElement('div');
        const range = selection.getRangeAt(selection.rangeCount - 1);
        const bound = range.getBoundingClientRect();
        const el = document.querySelector('body');
        el?.appendChild(commentbox);
        const self = this;
        new Vue({
          i18n: Kielet.i18n,
          el: commentbox,
          render: (h: any) => h(EpCommentAdd, {
            props: {
              onAdd: async () => {
                self.removeAddBox();
                await Kommentit.clearThread();
                await delay(100);
                await self.addNewComment();
              }
            },
          }),
        });
      }
    }
  };

  /**
   * Copies the selection range and slides it over the containing parent container and
   * user selection to get the global range relative to parent container.
   *
   * @returns Start and stop index of the user selection relational to the given parent node
   */
  distanceFromParentBegin(selection: Selection, parent: Node) {
    const range = selection.getRangeAt(0);
    const clone = range.cloneRange();
    clone.selectNodeContents(parent);
    clone.setEnd(range.startContainer, range.startOffset);
    const start = _.size(clone.toString());
    clone.setEnd(range.endContainer, range.endOffset);
    const stop = _.size(clone.toString());
    return { start, stop };
  }

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
  async lisaaKommenttiKahva() {
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
          const { start, stop } = this.distanceFromParentBegin(selection, el);

          this.newKahva = {
            opsId: Number(this.$route.params.id),
            tekstiId: tekstiId,
            kieli: Kielet.getSisaltoKieli.value,
            start: findIndexWithTagsIncluded(teksti, start),
            stop: findIndexWithTagsIncluded(teksti, stop),
          };

          const kspan = document.createElement('span');
          kspan.setAttribute('kommentti', 'uusi-kommentti');
          // kspan.setAttribute('kommentti', lisattyKahva.thread!);
          kspan.className = 'animated jackInTheBox slower';
          selection.getRangeAt(0).surroundContents(kspan);
          setTimeout(() => kspan.className = '', 1000);
        }
        break;
      }
      else {
        el = el.parentNode;
      }
    }
  }

  withOpsId(kommentti: KommenttiDto): KommenttiDto {
    return {
      ...kommentti,
      thread: this.threadUuid!,
      opsId: _.parseInt(this.$route.params.id),
    };
  }

  async poista(kommentti: KommenttiDto) {
    await Kommentit.poista(kommentti.tunniste!);
    success('kommentti-poistettu');
  }

  async tallenna(kommentti) {
    this.isWorking = true;
    try {
      const isNew = !kommentti.tunniste;
      const result = await Kommentit.tallenna(this.withOpsId(kommentti));
      this.reply = null;
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
    }
    finally {
      this.isWorking = false;
    }
  }

}
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
