<template>
  <div class="threadbox" ref="threadbox">
    <div v-if="thread">
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
        <div v-if="threadUuid" class="replybox p-3">
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
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue } from 'vue-property-decorator';
import { Kommentit } from '@/stores/kommentit';
import { KommenttiDto, KayttajanTietoDto } from '@/tyypit';
import { Kielet } from '@shared/stores/kieli';
import { success } from '@/utils/notifications';
import { delay, unwrap, findTaggedIndex } from '@/utils/delay';
import * as _ from 'lodash';
import ThreadComment from './ThreadComment.vue';
import EpCommentAdd from './EpCommentAdd.vue';
import { KieliStore } from '@shared/stores/kieli';


@Component({
  components: {
    ThreadComment,
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
      console.log(kahva);
      const doc = document.querySelector(`span[kommentti="uusi-kommentti"]`);
      doc?.setAttribute('kommentti', kahva.thread!);
      this.newThread = null;
      this.newKahva = null;
      await delay(50);
      console.log('Activating thread', kahva.thread!);
      await Kommentit.activateThread(kahva.thread!);
      console.log('DONE', kahva.thread!);
    }
    finally {
      this.isWorking = false;
    }
  }

  async cancelNewThread() {
    unwrap(document.querySelector(`span[kommentti="uusi-kommentti"]`));
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

  private onSelectionImpl = _.debounce((val, old) => {
    this.removeAddBox();
    if (val && !old) {
      const selection = document.getSelection();
      if (selection) {
        const commentbox = document.createElement('div');
        const range = selection.getRangeAt(selection.rangeCount - 1);
        const bound = range.getBoundingClientRect();
        const el = document.querySelector('body');
        el?.appendChild(commentbox);
        const self = this;
        new Vue({
          i18n: KieliStore.i18n,
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
  }, 300);

  async lisaaKommenttiKahva() {
    const selection = document.getSelection();
    const node = selection?.anchorNode;
    if (!node || !selection) {
      console.error('FIXME virheellinen valinta');
      return;
    }
    let el = node.parentNode;
    while (el !== null && el !== el.parentNode) {
      if ((el as any)?.__vue__?.$options?._componentTag === 'editor-content') {
        const value = (el as any)?.__vue__?.$parent?.value;
        const tekstiId = Number(value?._id);
        if (tekstiId) {
          const teksti = value[Kielet.getSisaltoKieli];
          const start = Math.min(selection.anchorOffset, selection.focusOffset);
          const stop = Math.max(selection.anchorOffset, selection.focusOffset);

          this.newKahva = {
            opsId: Number(this.$route.params.id),
            tekstiId: tekstiId,
            kieli: Kielet.getSisaltoKieli,
            start: findTaggedIndex(teksti, start),
            stop: findTaggedIndex(teksti, stop),
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
@import "@/styles/_variables.scss";

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

  .otsikko {
  }

  .viesti {
  }
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
