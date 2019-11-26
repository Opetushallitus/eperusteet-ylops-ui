<template>
<div>
  <div v-if="thread">
    <div class="d-flex justify-content-center pt-3">
      <b-button variant="primary" @click="lisaaKommentti">{{ $t('uusi-kommentti') }}</b-button>
    </div>
    <!-- <thread-comment         -->
    <!--   @input="tallenna"     -->
    <!--   @remove="uusi = null" -->
    <!--   v-if="uusi"           -->
    <!--   v-model="uusi" />     -->
    <thread-comment
      :reply="lisaaKommentti"
      :remove="poista"
      :save="tallenna"
      :value="thread" />
  </div>
</div>
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue } from 'vue-property-decorator';
import { Kommentit } from '@/stores/kommentit';
import { KommenttiDto, KayttajanTietoDto } from '@/tyypit';
import { success } from '@/utils/notifications';
import * as _ from 'lodash';
import ThreadComment from './ThreadComment.vue';


@Component({
  components: {
    ThreadComment,
  },
})
export default class EpCommentThreads extends Vue {
  get threadUuid() {
    return Kommentit.threadUuid;
  }

  private thread: KommenttiDto | null = null;

  get originalThread() {
    return Kommentit.thread;
  }

  @Watch('originalThread', { immediate: true })
  updateThread(value: KommenttiDto) {
    this.thread = _.cloneDeep(value);
  }

  lisaaKommentti() {
    if (!this.thread) {
      return;
    }

    this.thread = {
      ...this.thread,
      kommentit: [{
        // parent,
        luotu: new Date(),
        sisalto: '',
      }, ...(this.thread.kommentit || [])],
    };
  }

  withOpsId(kommentti: KommenttiDto): KommenttiDto {
    return {
      ...kommentti,
      opsId: _.parseInt(this.$route.params.id),
    };
  }

  async poista(kommentti: KommenttiDto) {
    await Kommentit.poista(kommentti.tunniste!);
    success('kommentti-poistettu');
  }

  async tallenna(kommentti) {
    const isNew = !!kommentti.tunniste;
    await Kommentit.tallenna(this.withOpsId(kommentti));
    if (isNew) {
      success('kommentti-tallennettu');
    }
    else {
      success('kommentti-paivitetty');
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@/styles/_variables.scss";

</style>
