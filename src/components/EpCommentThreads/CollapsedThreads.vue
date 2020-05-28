<template>
  <div class="ketju">
    <div v-if="first">
      <div class="kommentti p-3">
        <div class="topbar d-flex align-items-center justify-content-between">
          <div class="pvm">{{ $ago(first.luotu || new Date()) }}</div>
        </div>
        <div class="nimi">{{ first.luoja }}</div>
        <div class="viesti mt-1">
          {{ first.sisalto }}
        </div>
      </div>
    </div>
    <div v-if="hasEllipsis">
      <div class="kommentti purettu pl-3 text-muted">
        <fas icon="ellipsis-h"></fas>
      </div>
    </div>
    <div v-if="last">
      <div class="kommentti p-3">
        <div class="topbar d-flex align-items-center justify-content-between">
          <div class="pvm">{{ $ago(last.luotu || new Date()) }}</div>
        </div>
        <div class="nimi">{{ last.luoja }}</div>
        <div class="viesti mt-1">
          {{ last.sisalto }}
        </div>
      </div>
    </div>
    <div>
      <div class="kommentti purettu pl-1 text-muted">
        <b-button variant="link" @click="showThread()">
          <fas icon="search-location"></fas>
        </b-button>
        <b-button variant="link" @click="activateThread()">
          {{ $t('vastaa') }}
        </b-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Watch, Component, Prop, Vue } from 'vue-property-decorator';
import { KommenttiDto, KayttajanTietoDto } from '@shared/api/ylops';
import { Kommentit } from '@/stores/kommentit';


@Component({
  name: 'ThreadComment',
})
export default class CollapsedThreads extends Vue {

  @Prop({ required: true })
  value!: KommenttiDto[];

  get first() {
    if (this.value) {
      return _.first(this.value);
    }
    else {
      return null;
    }
  }

  get last() {
    if (_.size(this.value) > 1) {
      return _.last(this.value);
    }
    else {
      return null;
    }
  }

  get hasEllipsis() {
    return _.size(this.value) > 2;
  }

  showThread() {
    if (this.first) {
      Kommentit.scrollTo(this.first.thread);
    }
  }

  activateThread() {
    if (this.first) {
      Kommentit.activateThread(this.first.thread);
    }
  }

}
</script>

<style lang="scss" scoped>
@import "@shared/styles/_variables.scss";

.kommentti {
  background: #fff;
  height: 100%;
  box-shadow: 0 2px 4px 0 rgba(207, 207, 207, 0.5);
  border: 1px solid #eee;
  // border-radius: 10px;

  .topbar {
    height: 10px;

    .pvm {
      color: #555;
    }

    .actions {
      color: #28344F;
    }
  }

  .nimi {
    color: #28344F;
    font-weight: 600;
    font-size: 1.2em;
  }

  .viesti {
    color: #575757;

    textarea.editori {
      border: 1px solid #ccc;
      min-height: 4em;
      overflow: auto;
      resize: vertical;
      width: 100%;
    }

  }
}

.subthreads {
  margin-left: 20px;
}

.ketju {
  padding: 5px;
  margin-bottom: 10px;
}

.purettu {
  background: #fcfcfc;
}

</style>


