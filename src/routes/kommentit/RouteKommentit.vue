<template>
  <div>
    <div>
      <span kommentti="fa2832fe-3d64-42f1-8978-bdf4cfa3c4e6">hello</span>
    </div>
    <div>
      <span kommentti="8b318d77-af04-4013-a425-39937d3d0b90">hello seconds</span>
    </div>
    <div class="commentbar">
      hello world
    </div>
  </div>
</template>

<script lang="ts">
import _ from 'lodash';
import { Vue, Prop, Watch, Mixins, Component } from 'vue-property-decorator';
import EpSpinner from '@/components/EpSpinner/EpSpinner.vue';
import EpCommentThreads from '@/components/EpCommentThreads/EpCommentThreads.vue';
import OpsSidenav from '@/components/OpsSidenav/OpsSidenav.vue';
import EpButton from '@/components/EpButton/EpButton.vue';
import EpProgress from '@/components/EpProgress.vue';
import { Lops2019ValidointiDto } from '@/tyypit';
import { Kommentit } from '@/stores/kommentit';


@Component({
  components: {
    EpSpinner,
    EpButton,
  },
})
export default class RouteKommentit extends Vue {
  mounted() {
    Kommentit.attach(this.$el as Element);
  }

  beforeDestroy() {
    Kommentit.detach();
  }

}
</script>

<style scoped lang="scss">
@import "@/styles/_variables.scss";

.fade-enter-active, .fade-leave-active {
  transition: opacity .1s;
}

.fade-enter, .fade-leave-to {
  transition: opacity .2s;
  opacity: 0;
}

.commentbar {
  position: absolute;
  right: 0;
  top: 0;
  background: blue;
  width: 300px;
  height: calc(100vh);
}
</style>
